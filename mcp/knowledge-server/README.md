# botweave-knowledge-mcp

Custom MCP server for owner-scoped FAQ, policy and contact retrieval.

## Tools
1. `search_faq`
2. `get_policy`
3. `get_contact`

## Environment
1. `MONGODB_URL` (required)
2. `MONGODB_DB_NAME` (optional)
3. `KNOWLEDGE_MCP_PORT` (optional, default `4101`)

## Run
```bash
npm install
npm run dev
```

The MCP streamable HTTP endpoint is available at `POST /mcp`.
