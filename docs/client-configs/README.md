# Client Configurations

Here you will find the JSON snippets and configuration guides for connecting the arXiv MCP Server to all major IDEs and chat interfaces.

> **Important**: In all snippets below, replace `/absolute/path/to/arxic-mcp` with the hard-coded location on your system where you cloned this repository.

---

## 1. Claude Desktop

Locate your Claude Desktop configuration file:
* **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following to your `mcpServers` object:

```json
{
  "mcpServers": {
    "arxic-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/arxic-mcp/build/index.js"
      ]
    }
  }
}
```

---

## 2. Cursor (IDE)

Cursor allows adding MCP servers natively via the UI:
1. Open Cursor Settings (`Cmd/Ctrl + ,`).
2. Navigate to **Features** > **MCP Servers**.
3. Click **+ Add new MCP server**.
4. Set **Name**: `arxic-mcp`
5. Set **Type**: `command`
6. Set **Command**: `node /absolute/path/to/arxic-mcp/build/index.js`
7. Click **Save** and wait for the green connection indicator.

---

## 3. Windsurf (IDE by Codeium)

Windsurf supports global MCP configurations in standard JSON format. Locate:
* **Mac/Linux**: `~/.codeium/windsurf/mcp_config.json`
* **Windows**: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

Add the server:

```json
{
  "mcpServers": {
    "arxic": {
      "command": "node",
      "args": [
        "/absolute/path/to/arxic-mcp/build/index.js"
      ]
    }
  }
}
```

---

## 4. Cline / RooCode (VS Code Extensions)

If you are using the Cline or RooCode extensions in VS Code, open the extension sidebar and tap the settings (gear) icon at the bottom, then click `MCP Servers`. 

Alternatively, place this in the global MCP UI settings file (`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "arxic": {
      "command": "node",
      "args": [
        "/absolute/path/to/arxic-mcp/build/index.js"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

---

## 5. Zed (IDE)

In Zed, open your `settings.json` file and append the MCP configuration to the root of the file:

```json
{
  "experimental.mcp": {
    "arxic": {
      "command": "node",
      "args": [
        "/absolute/path/to/arxic-mcp/build/index.js"
      ]
    }
  }
}
```

---

## 6. Claude Code (CLI)

For the official Claude Code CLI by Anthropic, you can add the server dynamically via the command line. Run this anywhere on your machine:

```bash
claude mcp add arxic-mcp -- node /absolute/path/to/arxic-mcp/build/index.js
```

---

## 7. Antigravity

Antigravity operates via its central JSON configuration. Add the server block to the `mcpServers` object in your local configuration (usually located in `.gemini/` or your system configs):

```json
{
  "mcpServers": {
    "arxic-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/arxic-mcp/build/index.js"
      ]
    }
  }
}
```

---

## 8. Codex (and generic Custom Clients)

For Codex, Continue.dev, or any generic unlisted MCP consumer, you typically append this literal object definition to the client's MCP configuration registry:

```json
{
  "arxic-mcp": {
    "command": "node",
    "args": [
      "/absolute/path/to/arxic-mcp/build/index.js"
    ]
  }
}
```

---

## Using Docker Instead?

If you want to use the Dockerized version for any of the JSON configurations above, replace the `command` and `args` with the Docker invocation:

```json
"command": "docker",
"args": [
  "run",
  "-i",
  "--rm",
  "-v",
  "/absolute/path/to/your/pdf/folder:/absolute/path/to/your/pdf/folder", 
  "arxic-mcp"
]
```
