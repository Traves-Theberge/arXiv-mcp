---
name: arxiv-research
description: Discover, read, and download open-access academic papers from arXiv. Use this skill when the user asks to search for papers, get paper details, generate citations, or download academic PDFs.
license: MIT
metadata:
  version: "1.0"
---

# arXiv Research Skill

## When to use this skill
Use this skill when collaborating with a user on academic research, specifically when they ask you to interact with **arXiv.org**. This skill teaches you how to efficiently use the `arxic-mcp` toolset to find and analyze academic papers.

## ⚠️ Important Guidelines for AI Agents

1. **Token Efficiency First**: Never pull full abstracts using `arxiv_get_paper_details` as your very first step unless a user explicitly provided an ID. 
2. **Rate Limits**: The `arxic-mcp` tools intrinsically enforce a 3-second delay between requests to comply with arXiv's Terms of Use. If you need to chain multiple calls, expect a delay. Do not retry if a call is taking slightly longer than expected.
3. **No Web Retrieval**: Do NOT try to scrape or browse `arxiv.org` manually. ALWAYS use the provided `arxiv_*` MCP tools.

## Supported Workflows

### Workflow 1: Broad Discovery
When a user asks "what are the latest papers on quantum mechanics?" or "find me papers by Yann LeCun":
1. **Always start** by executing the `arxiv_search` or `arxiv_search_trending_papers` tool.
2. Formulate a precise search query (e.g., `quantum mechanics` or `au:LeCun`).
3. Present the resulting list (which includes Title, Author, and ID) to the user.
4. **Pause.** Wait for the user to select a paper id before proceeding to deeper analysis.

### Workflow 2: Deep Dive
When a user asks "what is paper 1706.03762 about?" or "summarize this arXiv paper":
1. You already have the `paper_id`.
2. Do **not** use `arxiv_search`.
3. If they specifically asked for a very quick TL;DR, use the `arxiv_get_paper_summary` tool.
4. If they asked for full details, use the `arxiv_get_paper_details` tool to ingest the complete unabridged abstract and metadata into your context.
5. Provide the user with a comprehensive breakdown.

### Workflow 3: The Rabbit Hole (Similar Papers)
When a user asks "find me more papers like 1706.03762" or "what else is in this category?":
1. Use the `arxiv_search_related_papers` tool, passing in the target `paper_id`.
2. The server will automatically extract the primary category and find relevant, adjacent research.
3. Present the list of related papers.

### Workflow 4: Citations & PDFs
When a user asks to "cite this paper" or "download the PDF":
* **Citations**: Immediately execute the `arxiv_get_paper_citations` tool. You can pass an optional format (`bibtex`, `apa`, or `mla`). Always provide the returned citation inside a markdown code block to the user.
* **Downloads**: If you have permissions and the `arxiv_download_paper` tool is available, provide the `paper_id` and an absolute `destination_dir` path on their local machine to cleanly save the PDF locally for them.
