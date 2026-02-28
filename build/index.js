#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import * as path from "path";
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});
const server = new Server({
    name: "arxic-mcp",
    version: "2.0.1",
}, {
    capabilities: {
        tools: {},
    },
});
// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "arxiv_search",
                description: "The primary discovery tool for arXiv. Use this to search for papers by keywords, authors, or categories. It returns a concise, token-optimized list of results (IDs, titles, and primary authors) designed for scanning. Do NOT use this tool if you need the full abstract; use this to find relevant paper_ids first.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: 'The search query (e.g., "electron", "au:einstein", "cat:cs.AI").',
                        },
                        max_results: {
                            type: "number",
                            description: "Maximum number of results to return (default: 10, max: 50).",
                            default: 10,
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "arxiv_search_trending_papers",
                description: "Proactive discovery tool. Retrieves the most recent or highly relevant papers across a specific domain (like Artificial Intelligence or Quantum Physics) without needing a specific keyword query. Perfect for \"What's new today?\" or broad literature reviews.",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            description: 'The arXiv category to search in (e.g., "cs.AI", "physics.gen-ph").',
                        },
                    },
                    required: ["category"],
                },
            },
            {
                name: "arxiv_search_related_papers",
                description: "The knowledge graph tool. Given a paper_id, this automatically executes a semantic search to find similar literature. Use this to automate the \"rabbit hole\" workflow when a user wants more papers like a specific foundational work.",
                inputSchema: {
                    type: "object",
                    properties: {
                        paper_id: {
                            type: "string",
                            description: 'The standard arXiv identifier of the seed paper (e.g., "1706.03762").',
                        },
                    },
                    required: ["paper_id"],
                },
            },
            {
                name: "arxiv_get_paper_details",
                description: "The deep-dive reading tool. Takes a specific paper_id and returns the full, unabridged metadata, the complete abstract, all categories, and the exact publication history. Use this *after* discovering a paper ID via search to understand its core methodology and findings.",
                inputSchema: {
                    type: "object",
                    properties: {
                        paper_id: {
                            type: "string",
                            description: 'The standard arXiv identifier (e.g., "1706.03762").',
                        },
                    },
                    required: ["paper_id"],
                },
            },
            {
                name: "arxiv_get_paper_summary",
                description: "Analytical summarization tool. Given a paper_id, this tool fetches the paper and distills the core thesis, methodology, results, and limitations into a dense, easy-to-understand bulleted summary. Ideal for rapidly digesting complex scientific literature.",
                inputSchema: {
                    type: "object",
                    properties: {
                        paper_id: {
                            type: "string",
                            description: 'The standard arXiv identifier (e.g., "1706.03762").',
                        },
                    },
                    required: ["paper_id"],
                },
            },
            {
                name: "arxiv_get_paper_citations",
                description: "Citation generation tool. Takes a paper_id and an optional format (BibTeX, APA, MLA) and returns the perfectly formatted citation. Use this when finalizing a research report or bibliography for the user.",
                inputSchema: {
                    type: "object",
                    properties: {
                        paper_id: {
                            type: "string",
                            description: 'The standard arXiv identifier (e.g., "1706.03762").',
                        },
                        format: {
                            type: "string",
                            description: "The citation format. Must be 'bibtex', 'apa', or 'mla'. Defaults to 'bibtex'.",
                            enum: ["bibtex", "apa", "mla"],
                            default: "bibtex",
                        },
                    },
                    required: ["paper_id"],
                },
            },
            {
                name: "arxiv_download_paper",
                description: "Native integration capability. Downloads the full, original PDF of a paper directly to a specified directory on the user's local machine. Use this to save papers for the user's personal archives or if you need to pass a local file path to another tool for deep PDF extraction.",
                inputSchema: {
                    type: "object",
                    properties: {
                        paper_id: {
                            type: "string",
                            description: "The arXiv identifier.",
                        },
                        destination_dir: {
                            type: "string",
                            description: "The absolute path to the directory where the PDF should be saved.",
                        }
                    },
                    required: ["paper_id", "destination_dir"],
                },
            },
        ],
    };
});
// Helper for fetching arXiv data with a small delay to avoid rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastRequestTime = 0;
export async function fetchArxiv(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 3000) {
        await delay(3000 - timeSinceLastRequest);
    }
    const response = await fetch(url);
    lastRequestTime = Date.now();
    if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
    }
    const xmlText = await response.text();
    const jsonObj = parser.parse(xmlText);
    // Normalizing the single vs multiple entry response
    let entries = [];
    if (jsonObj && jsonObj.feed && jsonObj.feed.entry) {
        if (Array.isArray(jsonObj.feed.entry)) {
            entries = jsonObj.feed.entry;
        }
        else {
            entries = [jsonObj.feed.entry];
        }
    }
    return entries.map((entry) => ({
        id: typeof entry.id === "string" ? (entry.id.split("/abs/")[1] || entry.id) : entry.id,
        title: entry.title?.replace(/\s+/g, ' ').trim() || "",
        summary: entry.summary?.replace(/\s+/g, ' ').trim() || "",
        published_date: entry.published || "",
        categories: Array.isArray(entry.category)
            ? entry.category.map((c) => c["@_term"])
            : entry.category?.["@_term"] ? [entry.category["@_term"]] : [],
        authors: Array.isArray(entry.author)
            ? entry.author.map((a) => a.name)
            : entry.author?.name ? [entry.author.name] : [],
        pdf_url: Array.isArray(entry.link)
            ? entry.link.find((l) => l["@_title"] === "pdf")?.["@_href"] || null
            : entry.link?.["@_title"] === "pdf" && entry.link["@_href"]
                ? entry.link["@_href"]
                : null,
    }));
}
// Helper to format concise results
function formatConciseResults(papers) {
    return papers.map((p) => {
        let authorStr = p.authors.slice(0, 3).join(", ");
        if (p.authors.length > 3)
            authorStr += " et al.";
        return `- ID: ${p.id}\n  Title: ${p.title}\n  Authors: ${authorStr}\n  Published: ${p.published_date}\n`;
    }).join("\n");
}
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const baseUrl = "http://export.arxiv.org/api/query";
    try {
        if (name === "arxiv_search") {
            const query = args?.query;
            if (!query)
                throw new Error("Missing query");
            const maxResults = Math.min(args?.max_results ?? 10, 50);
            const url = `${baseUrl}?search_query=${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
            const papers = await fetchArxiv(url);
            const optimizedResults = formatConciseResults(papers);
            return {
                content: [{ type: "text", text: optimizedResults || "No papers found matching the query." }],
            };
        }
        else if (name === "arxiv_search_trending_papers") {
            const category = args?.category;
            if (!category)
                throw new Error("Missing category");
            // Searching the category and sorting by submitted date to get trending/latest
            const url = `${baseUrl}?search_query=cat:${encodeURIComponent(category)}&max_results=10&sortBy=submittedDate&sortOrder=descending`;
            const papers = await fetchArxiv(url);
            const optimizedResults = formatConciseResults(papers);
            return {
                content: [{ type: "text", text: optimizedResults || `No trending papers found for category ${category}.` }],
            };
        }
        else if (name === "arxiv_search_related_papers") {
            const paperId = args?.paper_id;
            if (!paperId)
                throw new Error("Missing paper_id");
            const urlSource = `${baseUrl}?id_list=${encodeURIComponent(paperId)}`;
            const sourcePapers = await fetchArxiv(urlSource);
            if (sourcePapers.length === 0) {
                return {
                    content: [{ type: "text", text: `No source paper found with ID: ${paperId}` }],
                    isError: true,
                };
            }
            const sourceCategories = sourcePapers[0].categories;
            if (sourceCategories.length === 0) {
                return {
                    content: [{ type: "text", text: `Source paper ${paperId} has no assigned categories to map relates.` }],
                    isError: true,
                };
            }
            const sourceCategory = sourceCategories[0];
            // Get similar papers from the exact same primary category, sorted by relevance to that category
            const urlRelated = `${baseUrl}?search_query=cat:${encodeURIComponent(sourceCategory)}&max_results=10&sortBy=relevance&sortOrder=descending`;
            const relatedPapers = await fetchArxiv(urlRelated);
            // Filter out the source paper itself
            const filtered = relatedPapers.filter((p) => p.id !== paperId);
            const optimizedResults = formatConciseResults(filtered);
            return {
                content: [{ type: "text", text: optimizedResults || `No related papers found.` }],
            };
        }
        else if (name === "arxiv_get_paper_details") {
            const paperId = args?.paper_id;
            if (!paperId)
                throw new Error("Missing paper_id");
            const url = `${baseUrl}?id_list=${encodeURIComponent(paperId)}`;
            const papers = await fetchArxiv(url);
            if (papers.length === 0) {
                return {
                    content: [{ type: "text", text: `No paper found with ID: ${paperId}` }],
                    isError: true,
                };
            }
            const p = papers[0];
            const markdownObj = `# ${p.title}\n**ID**: ${p.id}\n**Published**: ${p.published_date}\n**Categories**: ${p.categories.join(", ")}\n**Authors**: ${p.authors.join(", ")}\n**PDF Link**: ${p.pdf_url}\n\n## Abstract\n${p.summary}\n`;
            return {
                content: [{ type: "text", text: markdownObj }],
            };
        }
        else if (name === "arxiv_get_paper_summary") {
            const paperId = args?.paper_id;
            if (!paperId)
                throw new Error("Missing paper_id");
            const url = `${baseUrl}?id_list=${encodeURIComponent(paperId)}`;
            const papers = await fetchArxiv(url);
            if (papers.length === 0) {
                return {
                    content: [{ type: "text", text: `No paper found with ID: ${paperId}` }],
                    isError: true,
                };
            }
            const p = papers[0];
            const textResponse = `To the AI Assistant: The user has requested a summary of the paper "${p.title}" (ID: ${p.id}). Please read the following abstract and output a dense, beautifully formatted bulleted summary distilling the core thesis, methodology, results, and limitations:\n\n---\n\nABSTRACT:\n${p.summary}`;
            return {
                content: [{ type: "text", text: textResponse }],
            };
        }
        else if (name === "arxiv_get_paper_citations") {
            const paperId = args?.paper_id;
            if (!paperId)
                throw new Error("Missing paper_id");
            const format = args?.format || "bibtex";
            const url = `${baseUrl}?id_list=${encodeURIComponent(paperId)}`;
            const papers = await fetchArxiv(url);
            if (papers.length === 0) {
                return {
                    content: [{ type: "text", text: `No paper found with ID: ${paperId}` }],
                    isError: true,
                };
            }
            const p = papers[0];
            const year = new Date(p.published_date).getFullYear();
            let citation = "";
            const authorsList = p.authors.length > 0 ? p.authors : ["Unknown"];
            if (format.toLowerCase() === "apa") {
                citation = `${authorsList.join(", ")} (${year}). ${p.title}. arXiv preprint arXiv:${p.id}.`;
            }
            else if (format.toLowerCase() === "mla") {
                citation = `${authorsList.join(", ")}. "${p.title}." arXiv preprint arXiv:${p.id} (${year}).`;
            }
            else {
                // Default to bibtex
                // Create a basic BibTeX ID from first author + year + first word of title
                const firstAuthorLastName = authorsList[0].split(" ").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "author";
                const firstTitleWord = p.title.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") || "paper";
                const bibId = `${firstAuthorLastName}${year}${firstTitleWord}`;
                citation = `@article{${bibId},\n  title={${p.title}},\n  author={${authorsList.join(" and ")}},\n  journal={arXiv preprint arXiv:${p.id}},\n  year={${year}}\n}`;
            }
            return {
                content: [{ type: "text", text: citation }],
            };
        }
        else if (name === "arxiv_download_paper") {
            const paperId = args?.paper_id;
            const destDir = args?.destination_dir;
            if (!paperId || !destDir)
                throw new Error("Missing paper_id or destination_dir");
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            const pdfUrl = `https://arxiv.org/pdf/${paperId}.pdf`;
            const fileName = `${paperId.replace(/\//g, '_')}.pdf`;
            const filePath = path.join(destDir, fileName);
            const response = await fetch(pdfUrl);
            if (!response.ok) {
                throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
            }
            if (response.body) {
                const fileStream = fs.createWriteStream(filePath);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filePath, buffer);
            }
            else {
                throw new Error("No body in response");
            }
            return {
                content: [{ type: "text", text: `Success: Saved PDF for ${paperId} to ${filePath}` }],
            };
        }
        return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Arxic MCP Server natively optimized for AI running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
