---
name: arxiv-research
description: Discover, read, and download open-access academic papers from arXiv. Use this skill when the user asks to search for papers, get paper details, generate citations, or download academic PDFs.
license: MIT
metadata:
  version: "1.0"
---

# arXiv Research Skill

## Core Directives
1. **Never scrape arxiv.org directly.** Always use the `arxic-mcp` tools.
2. **Token Efficiency FIRST.** Never use `arxiv_get_paper_details` or pull full abstracts as your first step unless the user explicitly provided a paper ID. Start broad.
3. **Rate Limits.** The tools enforce a mandatory 3-second delay. Do not retry if a call is taking slightly longer than expected.

## Tool Conditionals

**IF** the user asks to search for a topic, keyword, or author (e.g., "papers on quantum gravity", "find papers by LeCun"):
**THEN** use `arxiv_search` with parameters `query` and `max_results` to retrieve a list of IDs.
**AND THEN** present the titles and IDs to the user, pausing for them to select an ID for deeper analysis.

**IF** the user asks for the newest or most trending papers in a general field without a specific keyword (e.g., "what's new in AI?"):
**THEN** use `arxiv_search_trending_papers` with a standard `category` prefix (e.g., `cs.AI`).

**IF** the user provides a `paper_id` and asks for a quick overview or TL;DR:
**THEN** use `arxiv_get_paper_summary` to get an AI-optimized synopsis.

**IF** the user provides a `paper_id` and asks for full, deep-dive analysis of the methodology and results:
**THEN** use `arxiv_get_paper_details` to ingest the complete, unabridged abstract and metadata into context.

**IF** the user provides a `paper_id` and asks for more papers like it, or to go down a "rabbit hole":
**THEN** use `arxiv_search_related_papers` to automatically cross-reference the primary category and find adjacent research.

**IF** the user asks you to cite a paper or generate a bibliography:
**THEN** use `arxiv_get_paper_citations` passing the `paper_id` and optional `format` (bibtex, apa, mla). Display the output in a codeblock.

**IF** the user explicitly asks to "download the PDF" or "save the paper to my machine":
**THEN** use `arxiv_download_paper` passing the `paper_id` and an absolute path for `destination_dir`.
