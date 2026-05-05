import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MongoClient } from "mongodb";
import 'dotenv/config';
import { z } from "zod";

type SettingsDoc = {
    ownerId: string;
    businessName?: string;
    supportEmail?: string;
    knowledge?: string;
};

type Match = {
    title: string;
    answer: string;
    source: "knowledge";
    score: number;
};

const POLICY_KEYWORDS = {
    refund: ["refund", "money back", "refund policy"],
    return: ["return", "returns", "return policy"],
    shipping: ["shipping", "delivery", "shipment"],
    support: ["support", "contact", "help desk", "response time"],
    warranty: ["warranty", "guarantee"]
} as const;

type PolicyType = keyof typeof POLICY_KEYWORDS;

const PORT = Number.parseInt(process.env.KNOWLEDGE_MCP_PORT || process.env.MCP_PORT || "4101", 10);
const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is required for botweave-knowledge-mcp");
}

const mongoClient = new MongoClient(MONGODB_URL);
let mongoConnectPromise: Promise<MongoClient> | null = null;

function getDb() {
    return MONGODB_DB_NAME ? mongoClient.db(MONGODB_DB_NAME) : mongoClient.db();
}

async function getSettingsCollection() {
    if (!mongoConnectPromise) {
        mongoConnectPromise = mongoClient.connect();
    }
    await mongoConnectPromise;
    return getDb().collection<SettingsDoc>("settings");
}

function normalize(text: string) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function tokenizeQuery(query: string) {
    return normalize(query)
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 1);
}

function splitKnowledgeIntoChunks(knowledge: string) {
    const seen = new Set<string>();
    const chunks = knowledge
        .split(/\n{2,}|(?<=[.!?])\s+/g)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 20)
        .filter((chunk) => {
            const key = normalize(chunk);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

    return chunks;
}

function scoreChunk(chunk: string, queryTokens: string[], normalizedQuery: string) {
    const normalizedChunk = normalize(chunk);
    let score = 0;

    for (const token of queryTokens) {
        if (normalizedChunk.includes(token)) {
            score += token.length > 4 ? 2 : 1;
        }
    }

    if (normalizedChunk.includes(normalizedQuery)) {
        score += 4;
    }

    return score;
}

function searchFaqMatches(knowledge: string, query: string, topK: number): Match[] {
    const chunks = splitKnowledgeIntoChunks(knowledge);
    const queryTokens = tokenizeQuery(query);
    const normalizedQuery = normalize(query);

    const scored = chunks
        .map((chunk) => ({
            chunk,
            score: scoreChunk(chunk, queryTokens, normalizedQuery)
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    return scored.map((item, index) => ({
        title: `Knowledge match ${index + 1}`,
        answer: item.chunk,
        source: "knowledge",
        score: item.score
    }));
}

function findPolicyContent(knowledge: string, policyType: PolicyType) {
    const keywords = POLICY_KEYWORDS[policyType];
    const chunks = splitKnowledgeIntoChunks(knowledge);

    const hits = chunks.filter((chunk) => {
        const normalizedChunk = normalize(chunk);
        return keywords.some((keyword) => normalizedChunk.includes(keyword));
    });

    if (hits.length === 0) {
        return { found: false, content: "" };
    }

    return {
        found: true,
        content: hits.slice(0, 3).join("\n\n").slice(0, 2500)
    };
}

async function getSettings(ownerId: string) {
    const settingsCollection = await getSettingsCollection();
    return settingsCollection.findOne({ ownerId });
}

function buildServer() {
    const server = new McpServer({
        name: "botweave-knowledge-mcp",
        version: "0.1.0"
    });

    server.registerTool(
        "search_faq",
        {
            description: "Searches owner-specific FAQ and knowledge snippets.",
            inputSchema: {
                ownerId: z.string().trim().min(3).max(128),
                query: z.string().trim().min(2).max(500),
                topK: z.number().int().min(1).max(10).default(3)
            }
        },
        async ({ ownerId, query, topK }) => {
            const settings = await getSettings(ownerId);
            const knowledge = settings?.knowledge?.trim() || "";

            const matches = knowledge ? searchFaqMatches(knowledge, query, topK) : [];

            const response = { matches };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response)
                    }
                ]
            };
        }
    );

    server.registerTool(
        "get_policy",
        {
            description: "Returns policy details from owner knowledge for a specific policy type.",
            inputSchema: {
                ownerId: z.string().trim().min(3).max(128),
                policyType: z.enum(["refund", "return", "shipping", "support", "warranty"])
            }
        },
        async ({ ownerId, policyType }) => {
            const settings = await getSettings(ownerId);
            const knowledge = settings?.knowledge?.trim() || "";

            if (!knowledge) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                policyType,
                                content: "",
                                found: false
                            })
                        }
                    ]
                };
            }

            const policy = findPolicyContent(knowledge, policyType as PolicyType);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            policyType,
                            content: policy.content,
                            found: policy.found
                        })
                    }
                ]
            };
        }
    );

    server.registerTool(
        "get_contact",
        {
            description: "Returns business name and support email for an owner.",
            inputSchema: {
                ownerId: z.string().trim().min(3).max(128)
            }
        },
        async ({ ownerId }) => {
            const settings = await getSettings(ownerId);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            businessName: settings?.businessName || "Not Provided",
                            supportEmail: settings?.supportEmail || "Not Provided"
                        })
                    }
                ]
            };
        }
    );

    return server;
}

function methodNotAllowed() {
    return {
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed."
        },
        id: null
    };
}

const app = createMcpExpressApp({
    host: '0.0.0.0',
    allowedHosts: [
        'localhost',
        '127.0.0.1',
        '[::1]',
        'botweave-knowledge-mcp',           // Docker Compose service name
        'mcp-botweave-knowledge-mcp-1',     // Docker Compose container name
        'host.docker.internal',             // Docker host access
    ]
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", name: "botweave-knowledge-mcp" });
});

app.post("/mcp", async (req, res) => {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
    });

    res.on("close", () => {
        void transport.close();
        void server.close();
    });

    try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error("botweave-knowledge-mcp request error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error"
                },
                id: null
            });
        }
    }
});

app.get("/mcp", (_req, res) => {
    res.status(405).json(methodNotAllowed());
});

app.delete("/mcp", (_req, res) => {
    res.status(405).json(methodNotAllowed());
});

app.listen(PORT, () => {
    console.log(`botweave-knowledge-mcp listening on port ${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
        try {
            await mongoClient.close();
        } catch (error) {
            console.error("Error while closing MongoDB client:", error);
        } finally {
            process.exit(0);
        }
    });
}
