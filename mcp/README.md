# BotWeave MCP Servers

This folder contains custom MCP servers used by BotWeave v2:
1. `knowledge-server` for FAQ/policy/contact retrieval.
2. `support-server` for ticket operations.

## Local dev
Run each server separately:
```bash
npm --prefix mcp/knowledge-server install
npm --prefix mcp/knowledge-server run dev

npm --prefix mcp/support-server install
npm --prefix mcp/support-server run dev
```

Or use Docker:
```bash
cd mcp
docker compose up --build
```

## Endpoints
1. Knowledge MCP: `http://localhost:4101/mcp`
2. Support MCP: `http://localhost:4102/mcp`
3. Health checks:
`http://localhost:4101/health`
`http://localhost:4102/health`
