# API Documentation

The arXiv MCP server v2 acts as an AI-optimized semantic bridge to the official arXiv Export API. 

## Underlying API
* **Base URL:** `http://export.arxiv.org/api/query`
* **Format:** Atom Feed (XML), parsed internally out into Typescript standard objects.
* **Rate Limits:** We explicitly enforce a minimum 3000ms delay between out-bound HTTP requests from the tools to ensure compliance with arXiv's fair use policies.

## Attribution
*Thank you to arXiv for use of its open access interoperability.* This project acknowledges and respects the hard work of the arXiv team and the scientific community they support.

## 1. `arxiv_search`
This maps to standard keyword `search_query` on the arXiv API, sorted by relevance.

*   `query` (string): Standard search prefixing. Example prefixes:
    *   `au:` Author
    *   `ti:` Title
    *   `cat:` Subject Category (e.g., `cat:cs.AI` for artificial intelligence)
    *   `all:` Global search
*   `max_results` (number): Capped internally at `50` to safeguard AI context windows.

## 2. `arxiv_search_trending_papers`
Executes a generic category search sorted strictly by `submittedDate`.

*   `category` (string): Standard category prefixing, e.g. `cs.AI` or `physics.gen-ph`.

## 3. `arxiv_search_related_papers`
Extracts the primary `category` from the target `paper_id`, and immediately executes a secondary query for papers in that same category sorted by `relevance`.

*   `paper_id` (string): The standard identifier, e.g., `2103.15348v1`. Filtered out of results.

## 4. `arxiv_get_paper_details`
This maps to the `id_list` parameter on the arXiv API.

*   `paper_id` (string): The standard versioned or unversioned identifier.
*   **Output:** Returns a fully synthesized Markdown block including metadata and original summary.

## 5. `arxiv_get_paper_summary`
Fetches a paper by `id_list` and wraps the abstract in an engineered prompt structure, directly instructing the LLM on how to parse and display a summary in the chat context.

## 6. `arxiv_get_paper_citations`
Converts internal metadata into standard citation formats.

*   `paper_id` (string): Target paper to cite.
*   `format` (string): `bibtex` (default), `apa`, `mla`.

## 7. `arxiv_download_paper`
This avoids the query API entirely and targets the PDF archive directly.

*   **Underlying URL:** `https://arxiv.org/pdf/{paper_id}.pdf`
*   **Action:** Fetches the buffer and pipes it via `fs` to the `destination_dir`.
