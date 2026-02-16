import { randomUUID } from "node:crypto";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MongoClient } from "mongodb";
import 'dotenv/config';
import { z } from "zod";

type SupportTicketStatus = "open" | "in_progress" | "resolved";

type SupportTicketDoc = {
    ownerId: string;
    ticketId: string;
    customerMessage: string;
    severity: "low" | "medium" | "high";
    channel: "widget";
    status: SupportTicketStatus;
    createdAt: Date;
    updatedAt: Date;
};

const PORT = Number.parseInt(process.env.SUPPORT_MCP_PORT || process.env.MCP_PORT || "4102", 10);
const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is required for botweave-support-mcp");
}

const mongoClient = new MongoClient(MONGODB_URL);
let mongoConnectPromise: Promise<MongoClient> | null = null;

function getDb() {
    return MONGODB_DB_NAME ? mongoClient.db(MONGODB_DB_NAME) : mongoClient.db();
}

async function getSupportTicketsCollection() {
    if (!mongoConnectPromise) {
        mongoConnectPromise = mongoClient.connect();
    }
    await mongoConnectPromise;
    return getDb().collection<SupportTicketDoc>("support_tickets");
}

function buildTicketId() {
    const timestamp = Date.now().toString(36);
    const random = randomUUID().replace(/-/g, "").slice(0, 8);
    return `bw-${timestamp}-${random}`;
}

async function createSupportTicket(input: {
    ownerId: string;
    customerMessage: string;
    severity: "low" | "medium" | "high";
    channel: "widget";
}) {
    const supportTicketsCollection = await getSupportTicketsCollection();
    const now = new Date();
    const ticketId = buildTicketId();

    const ticket: SupportTicketDoc = {
        ownerId: input.ownerId,
        ticketId,
        customerMessage: input.customerMessage,
        severity: input.severity,
        channel: input.channel,
        status: "open",
        createdAt: now,
        updatedAt: now
    };

    await supportTicketsCollection.insertOne(ticket);

    return {
        ticketId: ticket.ticketId,
        status: ticket.status,
        nextStep: "Support team will contact via email"
    };
}

async function getSupportTicketStatus(ownerId: string, ticketId: string) {
    const supportTicketsCollection = await getSupportTicketsCollection();
    const ticket = await supportTicketsCollection.findOne({
        ownerId,
        ticketId
    });

    if (!ticket) {
        return null;
    }

    return {
        ticketId: ticket.ticketId,
        status: ticket.status,
        updatedAt: ticket.updatedAt.toISOString()
    };
}

function buildServer() {
    const server = new McpServer({
        name: "botweave-support-mcp",
        version: "0.1.0"
    });

    server.registerTool(
        "create_support_ticket",
        {
            description: "Creates a support ticket from a customer conversation.",
            inputSchema: {
                ownerId: z.string().trim().min(3).max(128),
                customerMessage: z.string().trim().min(5).max(2000),
                severity: z.enum(["low", "medium", "high"]).default("medium"),
                channel: z.enum(["widget"]).default("widget")
            }
        },
        async ({ ownerId, customerMessage, severity, channel }) => {
            const ticket = await createSupportTicket({
                ownerId,
                customerMessage,
                severity,
                channel
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(ticket)
                    }
                ]
            };
        }
    );

    server.registerTool(
        "get_support_ticket_status",
        {
            description: "Returns support ticket status for an owner and ticket id.",
            inputSchema: {
                ownerId: z.string().trim().min(3).max(128),
                ticketId: z.string().trim().min(5).max(128)
            }
        },
        async ({ ownerId, ticketId }) => {
            const ticket = await getSupportTicketStatus(ownerId, ticketId);

            if (!ticket) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                ticketId,
                                status: "not_found",
                                updatedAt: null
                            })
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(ticket)
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
        'botweave-support-mcp',             // Docker Compose service name
        'mcp-botweave-support-mcp-1',       // Docker Compose container name
        'host.docker.internal',             // Docker host access
    ]
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", name: "botweave-support-mcp" });
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
        console.error("botweave-support-mcp request error:", error);
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

app.listen(PORT, (error?: Error) => {
    if (error) {
        console.error("Failed to start botweave-support-mcp:", error);
        process.exit(1);
    }
    console.log(`botweave-support-mcp listening on port ${PORT}`);
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
