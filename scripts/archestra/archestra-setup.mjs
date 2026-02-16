import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const DEFAULT_BASE_URL = "http://localhost:9000";
const DEFAULT_AGENT_NAME = "botweave-support-agent";
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_GITHUB_MATCH = "github";

function requiredEnv(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function optionalBoolean(name, fallback) {
    const value = process.env[name];
    if (value == null || value === "") return fallback;
    return value.toLowerCase() === "true";
}

function optionalNumber(name, fallback) {
    const value = process.env[name];
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBaseUrl(baseUrl) {
    return baseUrl.replace(/\/$/, "");
}

function getAuthHeaders() {
    const headers = {
        "Content-Type": "application/json"
    };

    // Archestra expects: Authorization: <api-key>  (NO "Bearer " prefix)
    // See: https://archestra.ai/docs/platform-api-reference#authentication
    const apiKey = process.env.ARCHESTRA_ADMIN_API_KEY || process.env.ARCHESTRA_API_KEY;
    if (apiKey) {
        headers.Authorization = apiKey;
    }

    if (process.env.ARCHESTRA_SESSION_COOKIE) {
        headers.Cookie = process.env.ARCHESTRA_SESSION_COOKIE;
    }

    if (!headers.Authorization && !headers.Cookie) {
        throw new Error(
            "Missing Archestra auth. Set ARCHESTRA_ADMIN_API_KEY or ARCHESTRA_SESSION_COOKIE.\n" +
            "Create an API key at: http://localhost:3000 → Settings → Account → API Keys"
        );
    }

    return headers;
}

function parseResponse(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function apiRequest(baseUrl, headers, path, options = {}) {
    const method = options.method || "GET";
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    const rawText = await response.text();
    const parsed = parseResponse(rawText);

    if (!response.ok) {
        const message = typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
        const error = new Error(
            `API request failed:\n` +
            `  Request:  ${method} ${baseUrl}${path}\n` +
            `  Status:   ${response.status} ${response.statusText}\n` +
            `  Response: ${message}`
        );
        error.status = response.status;
        error.endpoint = path;
        error.method = method;
        error.responseBody = parsed;
        throw error;
    }

    return parsed;
}

function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCatalogItem(baseUrl, headers, config) {
    const catalogs = toArray(await apiRequest(baseUrl, headers, "/api/internal_mcp_catalog"));
    const existing = catalogs.find((item) => item.name === config.name);

    const payload = {
        name: config.name,
        description: config.description,
        serverType: "remote",
        serverUrl: config.url,
        requiresAuth: false
    };

    if (!existing) {
        const created = await apiRequest(baseUrl, headers, "/api/internal_mcp_catalog", {
            method: "POST",
            body: payload
        });
        console.log(`Created catalog item: ${config.name}`);
        return created;
    }

    if (existing.serverUrl !== config.url || existing.description !== config.description) {
        const updated = await apiRequest(
            baseUrl,
            headers,
            `/api/internal_mcp_catalog/${existing.id}`,
            {
                method: "PUT",
                body: { ...payload, id: existing.id }
            }
        );
        console.log(`Updated catalog item: ${config.name}`);
        return updated;
    }

    console.log(`Catalog item already up to date: ${config.name}`);
    return existing;
}

async function ensureInstalledMcpServer(baseUrl, headers, config) {
    const servers = toArray(await apiRequest(baseUrl, headers, "/api/mcp_server"));
    let existing = servers.find(
        (server) => server.catalogId === config.catalogId || server.name === config.serverName
    );

    if (!existing) {
        existing = await apiRequest(baseUrl, headers, "/api/mcp_server", {
            method: "POST",
            body: {
                name: config.serverName,
                catalogId: config.catalogId
            }
        });
        console.log(`Installed MCP server: ${config.serverName}`);
    } else {
        console.log(`MCP server already installed: ${config.serverName}`);
    }

    if (config.reinstall) {
        await apiRequest(baseUrl, headers, `/api/mcp_server/${existing.id}/reinstall`, {
            method: "POST"
        });
        console.log(`Triggered reinstall for MCP server: ${config.serverName}`);
    }

    return existing;
}

async function waitForTools(baseUrl, headers, serverId, serverName, timeoutMs) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const tools = toArray(await apiRequest(baseUrl, headers, `/api/mcp_server/${serverId}/tools`));
        if (tools.length > 0) {
            console.log(`${serverName}: discovered ${tools.length} tools`);
            return tools;
        }

        const servers = toArray(await apiRequest(baseUrl, headers, "/api/mcp_server"));
        const server = servers.find((item) => item.id === serverId);

        if (server?.localInstallationStatus === "error") {
            throw new Error(
                `${serverName} tool discovery failed: ${server.localInstallationError || "unknown error"}`
            );
        }

        await sleep(3_000);
    }

    throw new Error(
        `Timed out waiting for tools from ${serverName} after ${Math.floor(timeoutMs / 1000)}s`
    );
}

async function ensureAgent(baseUrl, headers, config) {
    const agents = toArray(await apiRequest(baseUrl, headers, "/api/agents?limit=200&page=1"));
    const existing = agents.find((agent) => agent.name === config.name);
    if (existing) {
        console.log(`Agent already exists: ${config.name}`);
        return existing;
    }

    let teamId = config.teamId;
    if (!teamId) {
        const teams = toArray(await apiRequest(baseUrl, headers, "/api/teams"));
        if (teams.length === 0) {
            throw new Error("No Archestra team found. Create a team first or set ARCHESTRA_TEAM_ID.");
        }
        teamId = teams[0].id;
        console.log(`Using first available team: ${teams[0].name} (${teamId})`);
    }

    const body = {
        name: config.name,
        teams: [teamId],
        agentType: "agent",
        description:
            "BotWeave support orchestrator agent. Uses custom MCP servers for knowledge and support workflows.",
        systemPrompt:
            "You are BotWeave support orchestrator. Prefer MCP tools for factual answers and escalation workflow. Keep responses concise."
    };

    if (config.model) {
        body.llmModel = config.model;
    }
    if (config.llmApiKeyId) {
        body.llmApiKeyId = config.llmApiKeyId;
    }

    const created = await apiRequest(baseUrl, headers, "/api/agents", {
        method: "POST",
        body
    });

    console.log(`Created agent: ${config.name}`);
    return created;
}

async function findGithubTools(baseUrl, headers, githubMatch, explicitToolNames) {
    const toolsResponse = await apiRequest(baseUrl, headers, "/api/tools/with-assignments?limit=500&page=1");
    const allTools = toArray(toolsResponse);

    let githubTools = allTools.filter((tool) =>
        (tool.mcpServerName || "").toLowerCase().includes(githubMatch)
    );

    if (explicitToolNames.length > 0) {
        const explicit = new Set(explicitToolNames.map((name) => name.trim()).filter(Boolean));
        githubTools = githubTools.filter((tool) => explicit.has(tool.name));
    }

    return githubTools;
}

async function assignToolsToAgent(baseUrl, headers, agentId, toolIds) {
    if (toolIds.length === 0) {
        console.log("No tools to assign.");
        return null;
    }

    const uniqueToolIds = [...new Set(toolIds)];
    const response = await apiRequest(baseUrl, headers, "/api/agents/tools/bulk-assign", {
        method: "POST",
        body: {
            assignments: uniqueToolIds.map((toolId) => ({ agentId, toolId }))
        }
    });

    const succeeded = response?.succeeded?.length || 0;
    const duplicates = response?.duplicates?.length || 0;
    const failed = response?.failed?.length || 0;
    console.log(`Tool assignment summary: succeeded=${succeeded}, duplicates=${duplicates}, failed=${failed}`);

    if (failed > 0) {
        console.log("Failed assignments:", JSON.stringify(response.failed, null, 2));
    }

    return response;
}

async function main() {
    const baseUrl = normalizeBaseUrl(requiredEnv("ARCHESTRA_BASE_URL", DEFAULT_BASE_URL));
    const headers = getAuthHeaders();

    const timeoutMs = optionalNumber("ARCHESTRA_SETUP_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
    const reinstall = optionalBoolean("ARCHESTRA_SETUP_REINSTALL", false);
    const includeGithubTools = optionalBoolean("ARCHESTRA_INCLUDE_GITHUB_TOOLS", true);
    const githubMatch = (process.env.ARCHESTRA_GITHUB_MCP_MATCH || DEFAULT_GITHUB_MATCH).toLowerCase();
    const githubToolNames = (process.env.ARCHESTRA_GITHUB_TOOL_NAMES || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const knowledgeCatalogName = process.env.ARCHESTRA_KNOWLEDGE_CATALOG_NAME || "botweave-knowledge-mcp";
    const supportCatalogName = process.env.ARCHESTRA_SUPPORT_CATALOG_NAME || "botweave-support-mcp";
    const knowledgeUrl = requiredEnv(
        "ARCHESTRA_KNOWLEDGE_MCP_URL",
        "http://host.docker.internal:4101/mcp"
    );
    const supportUrl = requiredEnv(
        "ARCHESTRA_SUPPORT_MCP_URL",
        "http://host.docker.internal:4102/mcp"
    );

    const knowledgeServerName =
        process.env.ARCHESTRA_KNOWLEDGE_SERVER_NAME || "botweave-knowledge-mcp-instance";
    const supportServerName =
        process.env.ARCHESTRA_SUPPORT_SERVER_NAME || "botweave-support-mcp-instance";

    const agent = {
        name: process.env.ARCHESTRA_AGENT_NAME || DEFAULT_AGENT_NAME,
        teamId: process.env.ARCHESTRA_TEAM_ID || "",
        model: process.env.ARCHESTRA_AGENT_MODEL || "",
        llmApiKeyId: process.env.ARCHESTRA_LLM_API_KEY_ID || ""
    };

    console.log("Starting Phase 3 setup with configuration:");
    console.log(
        JSON.stringify(
            {
                baseUrl,
                knowledgeCatalogName,
                supportCatalogName,
                knowledgeUrl,
                supportUrl,
                knowledgeServerName,
                supportServerName,
                agentName: agent.name,
                includeGithubTools,
                githubMatch,
                timeoutMs,
                reinstall
            },
            null,
            2
        )
    );

    const knowledgeCatalog = await ensureCatalogItem(baseUrl, headers, {
        name: knowledgeCatalogName,
        url: knowledgeUrl,
        description: "BotWeave custom MCP for FAQ, policy and contact retrieval"
    });
    const supportCatalog = await ensureCatalogItem(baseUrl, headers, {
        name: supportCatalogName,
        url: supportUrl,
        description: "BotWeave custom MCP for support ticket operations"
    });

    const knowledgeServer = await ensureInstalledMcpServer(baseUrl, headers, {
        catalogId: knowledgeCatalog.id,
        serverName: knowledgeServerName,
        reinstall
    });
    const supportServer = await ensureInstalledMcpServer(baseUrl, headers, {
        catalogId: supportCatalog.id,
        serverName: supportServerName,
        reinstall
    });

    const knowledgeTools = await waitForTools(
        baseUrl,
        headers,
        knowledgeServer.id,
        knowledgeServer.name,
        timeoutMs
    );
    const supportTools = await waitForTools(
        baseUrl,
        headers,
        supportServer.id,
        supportServer.name,
        timeoutMs
    );

    const createdOrFoundAgent = await ensureAgent(baseUrl, headers, agent);

    let githubTools = [];
    if (includeGithubTools) {
        githubTools = await findGithubTools(baseUrl, headers, githubMatch, githubToolNames);
        console.log(`Matched ${githubTools.length} GitHub/external tools`);
    }

    const toolIds = [
        ...knowledgeTools.map((tool) => tool.id),
        ...supportTools.map((tool) => tool.id),
        ...githubTools.map((tool) => tool.id)
    ];

    await assignToolsToAgent(baseUrl, headers, createdOrFoundAgent.id, toolIds);

    console.log("Phase 3 setup completed.");
    console.log(
        JSON.stringify(
            {
                agentId: createdOrFoundAgent.id,
                knowledgeServerId: knowledgeServer.id,
                supportServerId: supportServer.id,
                assignedToolCount: [...new Set(toolIds)].length
            },
            null,
            2
        )
    );
}

main().catch((error) => {
    console.error("\n" + "=".repeat(60));
    console.error("PHASE 3 SETUP FAILED");
    console.error("=".repeat(60));

    const status = error?.status;

    if (status === 401) {
        const usedKey = process.env.ARCHESTRA_ADMIN_API_KEY || process.env.ARCHESTRA_API_KEY;
        const maskedKey = usedKey
            ? `${usedKey.slice(0, 12)}...${usedKey.slice(-4)} (${usedKey.length} chars)`
            : "(none)";
        console.error(`\nAuth Error (401 Unauthorized)`);
        console.error(`  Endpoint:  ${error.endpoint || "unknown"}`);
        console.error(`  API Key:   ${maskedKey}`);
        console.error(`  Source:    ${process.env.ARCHESTRA_ADMIN_API_KEY ? "ARCHESTRA_ADMIN_API_KEY" : process.env.ARCHESTRA_API_KEY ? "ARCHESTRA_API_KEY" : "none"}`);
        console.error(`\nPossible fixes:`);
        console.error(`  1. The API key may be expired or invalid — regenerate it in the Archestra dashboard.`);
        console.error(`  2. The key may lack admin/management permissions — use ARCHESTRA_ADMIN_API_KEY.`);
        console.error(`  3. Archestra may not be running at ${process.env.ARCHESTRA_BASE_URL || "http://localhost:9000"}.`);
        console.error(`  4. Try using ARCHESTRA_SESSION_COOKIE from your browser session instead.`);
    } else if (status === 403) {
        console.error(`\nForbidden (403)`);
        console.error(`  The API key is valid but lacks permission for this operation.`);
        console.error(`  Use an admin-level key (ARCHESTRA_ADMIN_API_KEY).`);
    } else if (status === 404) {
        console.error(`\nNot Found (404)`);
        console.error(`  Endpoint ${error.endpoint || "unknown"} does not exist.`);
        console.error(`  Check that Archestra version supports this API.`);
    } else if (status >= 500) {
        console.error(`\nServer Error (${status})`);
        console.error(`  Archestra returned an internal error. Check Archestra logs.`);
    } else if (error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED") {
        const url = process.env.ARCHESTRA_BASE_URL || "http://localhost:9000";
        console.error(`\nConnection Refused`);
        console.error(`  Cannot reach Archestra at ${url}`);
        console.error(`  Make sure Archestra is running: docker ps or check the process.`);
    } else if (error.code === "ETIMEDOUT" || error.cause?.code === "ETIMEDOUT") {
        console.error(`\nConnection Timed Out`);
        console.error(`  Archestra is not responding. Check network/firewall settings.`);
    }

    console.error(`\nFull error message:`);
    console.error(`  ${error?.message || error}`);

    if (error?.responseBody) {
        console.error(`\nResponse body:`);
        console.error(`  ${JSON.stringify(error.responseBody, null, 2)}`);
    }

    console.error("=".repeat(60) + "\n");
    process.exit(1);
});
