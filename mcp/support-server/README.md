# botweave-support-mcp

Custom MCP server for support operations.

## Tools
1. `create_support_ticket`
2. `get_support_ticket_status`

## Environment
1. `MONGODB_URL` (required)
2. `MONGODB_DB_NAME` (optional)
3. `SUPPORT_MCP_PORT` (optional, default `4102`)

## Run
```bash
npm install
npm run dev
```

The MCP streamable HTTP endpoint is available at `POST /mcp`.
