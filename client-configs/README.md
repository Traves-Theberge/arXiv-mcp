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

### 1. [Claude Desktop](claude-desktop.json)
**Installation Location:**
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### 2. [Cursor IDE](cursor.json)
**Installation Location:**  
Navigate to **Cursor Settings > Features > MCP Servers**. Add a new server and specify the raw commands natively, OR paste the JSON into a global Cursor MCP config.

### 3. [Windsurf Editor](windsurf.json)
**Installation Location:**  
`~/.codeium/windsurf/mcp_config.json`

### 4. [Zed Editor](zed.json)
**Installation Location:**  
Add to your user `settings.json` file inside Zed.

### 5. [Antigravity](antigravity.json)
**Installation Location:**  
`~/.gemini/antigravity/mcp_config.json`

### 6. [Claude Code (CLI)](claude-code.json)
**Installation Command:**  
Normally, Claude Code uses direct terminal commands to add servers:
```bash
claude mcp add arxic-mcp -- docker run -i --rm -u 1000:1000 -v /Users/yourname/Downloads:/Users/yourname/Downloads arxic-mcp
```
Alternatively, you can manually paste the JSON into the Claude Code config file (location may vary by OS).

### 7. [VS Code (Cline / Roo Code / Roo Context)](vscode-cline-roo.json)
**Installation Location:**  
Click the `MCP Servers` tab within the extension, or directly edit the global settings JSON.
* **Cline:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
* **Roo Code:** `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
