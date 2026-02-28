# Client Configurations for arXiv MCP Server

Here are the specific JSON configuration snippets required to connect the `arxic-mcp` server to various popular AI applications.

**Note on Docker vs Native:**
The examples below use the Docker configuration by default because it requires no local dependencies. 

If you prefer to run the server natively (which allows the `arxiv_download_paper` tool to save PDFs *anywhere* on your machine), you can simply swap out the `command` and `args` in any of these JSON payloads with:

```json
"command": "node",
"args": [
  "/absolute/path/to/arxic-mcp/build/index.js"
]
```

## Supported Clients
*   [Claude Desktop](claude-desktop.json)
*   [Cursor IDE](cursor.json)
*   [Windsurf Editor](windsurf.json)
*   [Zed Editor](zed.json)
