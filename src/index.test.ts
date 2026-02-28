import { jest } from "@jest/globals";
import { XMLParser } from "fast-xml-parser";
import { fetchArxiv } from "./index.js";

// Define the types locally for the test since they mirror index.ts
interface ArxivCategory {
  "@_term": string;
  "@_scheme"?: string;
}

interface ArxivAuthor {
  name: string;
}

interface ArxivLink {
  "@_href": string;
  "@_rel"?: string;
  "@_title"?: string;
  "@_type"?: string;
}

interface ArxivEntry {
  id: string;
  updated?: string;
  published: string;
  title: string;
  summary: string;
  author?: ArxivAuthor | ArxivAuthor[];
  link?: ArxivLink | ArxivLink[];
  category?: ArxivCategory | ArxivCategory[];
}

interface ArxivFeed {
  feed?: {
    entry?: ArxivEntry | ArxivEntry[];
  };
  [key: string]: unknown;
}

// We extract the parsing logic from the main file here to unit test it safely
// without spinning up the entire stdio MCP server.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const mockArxivAtomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <link href="http://arxiv.org/api/query?search_query%3Dall%3Aelectron%26id_list%3D%26start%3D0%26max_results%3D1" rel="self" type="application/atom+xml"/>
  <title type="html">ArXiv Query: search_query=all:electron&amp;id_list=&amp;start=0&amp;max_results=1</title>
  <id>http://arxiv.org/api/qPebE1T3gR58gkV9UItuJ0WGEpY</id>
  <updated>2026-02-28T00:00:00-05:00</updated>
  <opensearch:totalResults xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">183610</opensearch:totalResults>
  <opensearch:startIndex xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">0</opensearch:startIndex>
  <opensearch:itemsPerPage xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">1</opensearch:itemsPerPage>
  <entry>
    <id>http://arxiv.org/abs/2105.14022v1</id>
    <updated>2021-05-28T18:00:00Z</updated>
    <published>2021-05-28T18:00:00Z</published>
    <title>Mock Physics Paper Title</title>
    <summary>  This is a mock summary of an amazing paper.
It has multiple lines and     weird spacing.
    </summary>
    <author>
      <name>Albert Einstein</name>
    </author>
    <author>
      <name>Niels Bohr</name>
    </author>
    <link href="http://arxiv.org/abs/2105.14022v1" rel="alternate" type="text/html"/>
    <link title="pdf" href="http://arxiv.org/pdf/2105.14022v1" rel="related" type="application/pdf"/>
    <category term="physics.gen-ph" scheme="http://arxiv.org/schemas/atom"/>
  </entry>
</feed>`;

describe("ArXiv XML Parsing logic", () => {
  it("should correctly parse the Atom feed into JSON", () => {
    const jsonObj = parser.parse(mockArxivAtomFeed) as ArxivFeed;
    expect(jsonObj.feed).toBeDefined();
    expect(jsonObj.feed?.entry).toBeDefined();
  });

  it("should normalize an entry object correctly", () => {
    const jsonObj = parser.parse(mockArxivAtomFeed) as ArxivFeed;
    const entry = jsonObj.feed?.entry as ArxivEntry;

    // Simulate the normalization done in index.ts
    const id = typeof entry.id === "string" ? (entry.id.split("/abs/")[1] || entry.id) : entry.id;
    const title = entry.title?.replace(/\s+/g, " ").trim() || "";
    const summary = entry.summary?.replace(/\s+/g, " ").trim() || "";

    const categories = Array.isArray(entry.category)
      ? entry.category.map((c: ArxivCategory) => c["@_term"])
      : entry.category?.["@_term"] ? [entry.category["@_term"]] : [];

    const authors = Array.isArray(entry.author)
      ? entry.author.map((a: ArxivAuthor) => a.name)
      : entry.author?.name ? [entry.author.name] : [];

    const pdf_url = Array.isArray(entry.link)
      ? entry.link.find((l: ArxivLink) => l["@_title"] === "pdf")?.["@_href"] || null
      : entry.link?.["@_title"] === "pdf" && entry.link["@_href"]
        ? entry.link["@_href"]
        : null;

    expect(id).toBe("2105.14022v1");
    expect(title).toBe("Mock Physics Paper Title");
    expect(summary).toBe("This is a mock summary of an amazing paper. It has multiple lines and weird spacing.");
    expect(authors).toEqual(["Albert Einstein", "Niels Bohr"]);
    expect(categories).toEqual(["physics.gen-ph"]);
    expect(pdf_url).toBe("http://arxiv.org/pdf/2105.14022v1");
  });
});

describe("fetchArxiv API endpoint", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch from arXiv and elegantly normalize the Atom feed into a Paper array", async () => {
    // Mock the global fetch to return our mockArxivAtomFeed
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => mockArxivAtomFeed,
      status: 200,
      statusText: "OK",
    } as Response);

    const result = await fetchArxiv("http://fake-url.com");
    expect(global.fetch).toHaveBeenCalledWith("http://fake-url.com");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2105.14022v1");
    expect(result[0].title).toBe("Mock Physics Paper Title");
    expect(result[0].summary).toBe("This is a mock summary of an amazing paper. It has multiple lines and weird spacing.");
    expect(result[0].authors).toEqual(["Albert Einstein", "Niels Bohr"]);
    expect(result[0].categories).toEqual(["physics.gen-ph"]);
    expect(result[0].pdf_url).toBe("http://arxiv.org/pdf/2105.14022v1");
  });
});
