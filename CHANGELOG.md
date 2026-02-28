# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-28

### Added
- **Agent Skill Pack**: Implemented the official `arxiv-research` skill profile fully compliant with the `agentskills.io` specification to provide native LLM instruction tuning.
- **Extended Client Configs**: Added standalone JSON configurations for Antigravity, Claude Code (CLI), and VS Code extensions.

## [2.0.1] - 2026-02-28

### Changed
- Total TypeScript refactor to completely eliminate the `any` keyword.
- Introduced strict typing for all `fast-xml-parser` output models.
- Upgraded Jest testing suite to strongly typed assertions.
- Upgraded all `devDependencies` to their latest stable releases (Node 22 types, Jest 30, TypeScript 5.7).

## [2.0.0] - 2026-02-28

### Added
- **V2 Tool Architecture**: Complete semantic redesign of all tools using the `arxiv_` prefix.
- `arxiv_search`: Fast discovery tool returning concise results.
- `arxiv_search_trending_papers`: Automated discovery for latest category papers.
- `arxiv_search_related_papers`: Semantic discovery using exact category matching.
- `arxiv_get_paper_details`: Full Markdown payload of paper metadata.
- `arxiv_get_paper_summary`: Intelligent AI-wrapper for abstract analysis.
- `arxiv_get_paper_citations`: Automated generation for BibTeX, APA, and MLA formats.
- `arxiv_download_paper`: Direct PDF extraction to local disk.

### Changed
- All tools now enforce a strict 3000ms delay to guarantee arXiv API compliance.
- Consolidated IDE/Client configurations directly into the main `README.md`.

### Removed
- Deprecated V1 tools: `search_arxiv_summaries`, `get_paper_details`, `download_pdf`.

## [1.1.0] - 2026-02-28

### Added
- Dockerized the application using a multi-stage `node:22-alpine` build.
- Added Jest testing framework and XML parsing tests.
- Re-formatted output models for V1 tools to be AI-context-window friendly.

## [1.0.0] - 2026-02-28

### Added
- Initial release of the Arxic MCP server.
- Basic tools for searching and retrieving paper abstracts.
