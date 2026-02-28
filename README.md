# arXiv MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with a seamless, programmatic interface to search and read academic papers from the open-access [arXiv](https://arxiv.org/) repository.

This project is AI-Optimized, meaning the returned data is carefully formatted to remain within context windows and provide exactly what large language models need for efficient, hallucination-free research.

## Features & Tools

*   **`arxiv_search`**: Fast discovery tool. Pass a search string (like `"quantum gravity"`) and get a lightweight list of IDs, Titles, and Authors.
*   **`arxiv_search_trending_papers`**: Retrieves the newest papers for a specific category without keywords.
*   **`arxiv_search_related_papers`**: Semantic discovery tool to find papers related to a specific `paper_id`.
*   **`arxiv_get_paper_details`**: In-depth reading tool. Pass a paper ID to retrieve the full abstract, categories, and author metadata neatly formatted in Markdown.
*   **`arxiv_get_paper_summary`**: Provides an AI-ready prompt wrapper to generate a rapid summary of the thesis, methodology, and limitations of a paper.
*   **`arxiv_get_paper_citations`**: Generates a perfectly formatted citation in BibTeX, APA, or MLA format for any paper.
*   **`arxiv_download_paper`**: Direct integration tool. Pass a paper ID and a local system path to have the MCP server automatically download the full PDF to your machine.

## Installation

This server is written in TypeScript and runs via `node`.

1.  **Clone this repository** (or install via your preferred package manager).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the TypeScript project**:
    ```bash
    npm run build
    ```

## Usage

This server communicates over standard input/output (`stdio`). You can integrate it natively via Node or run it completely isolated using Docker.

### Native Node.js 

Use the following command configuration in your MCP client:
```bash
node /path/to/arxic-mcp/build/index.js
```

### Docker 

We provide a lightweight Alpine-based container. First, build the image:
```bash
docker build -t arxic-mcp .
```

Then, run your MCP client using this command configuration:
```bash
docker run -i --rm -v /home/user/Desktop:/home/user/Desktop arxic-mcp
```
*(Note: Passing `-v` ensures the `download_pdf` tool has permission to save files to your local host machine!)*

## Client Configurations

You can add this server to any MCP-compatible client. 

> **Important**: Replace `/absolute/path/to/` with the actual path on your system.

### Option 1: Docker (Recommended)
This method ensures the `arxiv_download_paper` tool has permission to save PDFs to your machine via the `-v` volume mount.

```json
{
  "mcpServers": {
    "arxic-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/absolute/path/to/your/pdf/folder:/absolute/path/to/your/pdf/folder", 
        "arxic-mcp"
      ]
    }
  }
}
```

### Option 2: Native Node.js
If you prefer running natively without Docker:

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

### IDE Specific Instructions
*   **Antigravity**: Add the JSON block above to your local `.gemini/` configuration file.
*   **Claude Desktop**: Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows).
*   **Cursor**: Navigate to Settings > Features > MCP Servers. Add a new command server using the raw commands above (e.g., `node /path/to/index.js`).
*   **Claude Code (CLI)**: Run `claude mcp add arxic-mcp -- node /absolute/path/to/arxic-mcp/build/index.js`
*   **Windsurf**: Add to `~/.codeium/windsurf/mcp_config.json`
*   **Zed**: Add to `settings.json` under `"experimental.mcp"`

## Attribution
*Thank you to arXiv for use of its open access interoperability.* This project acknowledges and respects the hard work of the arXiv team and the scientific community they support.

## License
[MIT](LICENSE)
