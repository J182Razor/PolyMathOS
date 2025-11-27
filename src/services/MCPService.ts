/**
 * MCP Service
 * Manages connections to external Model Context Protocol (MCP) servers
 * Integrates: NotebookLM, Arxiv, Deep Research, etc.
 */

export interface MCPTool {
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface ResearchResult {
    source: string;
    title: string;
    summary: string;
    url?: string;
    confidence: number;
}

export class MCPService {
    private static instance: MCPService;

    private tools: MCPTool[] = [
        { name: 'notebooklm', description: 'Google NotebookLM for source analysis', isEnabled: true },
        { name: 'arxiv', description: 'Arxiv Paper Search', isEnabled: true },
        { name: 'deep-research', description: 'Deep Research Agent', isEnabled: true },
        { name: 'magic', description: 'Magic Code Assistant', isEnabled: false },
        { name: 'chroma', description: 'ChromaDB Vector Store', isEnabled: true }
    ];

    private constructor() { }

    public static getInstance(): MCPService {
        if (!MCPService.instance) {
            MCPService.instance = new MCPService();
        }
        return MCPService.instance;
    }

    public getAvailableTools(): MCPTool[] {
        return this.tools;
    }

    /**
     * Helper to call an MCP endpoint
     */
    private async callMCPEndpoint(endpointEnvVar: string, payload: any): Promise<any> {
        const url = import.meta.env[endpointEnvVar];
        if (!url) {
            throw new Error(`MCP Endpoint not configured: ${endpointEnvVar}`);
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth headers if needed, e.g. from another env var
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`MCP Call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error calling MCP ${endpointEnvVar}:`, error);
            throw error;
        }
    }

    /**
     * NotebookLM: Analyze a set of documents or a topic
     */
    public async analyzeWithNotebookLM(topic: string, context?: string): Promise<ResearchResult[]> {
        console.log(`[MCP] NotebookLM analyzing: ${topic}`);

        // Call real endpoint
        // Expects VITE_MCP_NOTEBOOKLM_URL
        const result = await this.callMCPEndpoint('VITE_MCP_NOTEBOOKLM_URL', { topic, context });

        // Map result to ResearchResult[]
        // Assuming the MCP returns a standard format or we map it here
        return result.results || [];
    }

    /**
     * Arxiv: Search for academic papers
     */
    public async searchArxiv(query: string, maxResults: number = 5): Promise<ResearchResult[]> {
        console.log(`[MCP] Searching Arxiv for: ${query}`);

        // Call real endpoint
        // Expects VITE_MCP_ARXIV_URL
        const result = await this.callMCPEndpoint('VITE_MCP_ARXIV_URL', { query, max_results: maxResults });

        return result.papers || [];
    }

    /**
     * Deep Research: Conduct a comprehensive research session
     */
    public async conductDeepResearch(topic: string): Promise<{
        summary: string;
        sources: ResearchResult[];
        plan: string[];
    }> {
        console.log(`[MCP] Starting Deep Research on: ${topic}`);

        // Call real endpoint
        // Expects VITE_MCP_DEEP_RESEARCH_URL
        const result = await this.callMCPEndpoint('VITE_MCP_DEEP_RESEARCH_URL', { topic });

        return {
            summary: result.summary,
            sources: result.sources,
            plan: result.plan
        };
    }

    /**
     * ChromaDB: Ingest a document into the vector database
     */
    public async ingestDocument(collection: string, document: string, metadata: any): Promise<boolean> {
        console.log(`[MCP] ChromaDB Ingesting into ${collection}`);

        // Call real endpoint
        // Expects VITE_MCP_CHROMA_URL
        await this.callMCPEndpoint('VITE_MCP_CHROMA_URL', {
            action: 'add_documents',
            collection_name: collection,
            documents: [document],
            metadatas: [metadata]
        });

        return true;
    }

    /**
     * ChromaDB: Query the vector database
     */
    public async queryCollection(collection: string, query: string, nResults: number = 5): Promise<ResearchResult[]> {
        console.log(`[MCP] ChromaDB Querying ${collection}: ${query}`);

        // Call real endpoint
        // Expects VITE_MCP_CHROMA_URL
        const result = await this.callMCPEndpoint('VITE_MCP_CHROMA_URL', {
            action: 'query',
            collection_name: collection,
            query_texts: [query],
            n_results: nResults
        });

        // Map Chroma result to ResearchResult
        // Chroma returns { documents: [[]], metadatas: [[]], distances: [[]] }
        if (result.documents && result.documents[0]) {
            return result.documents[0].map((doc: string, index: number) => ({
                source: 'ChromaDB',
                title: result.metadatas[0][index]?.title || 'Unknown Source',
                summary: doc,
                confidence: 1 - (result.distances ? result.distances[0][index] : 0) // Distance to confidence approximation
            }));
        }

        return [];
    }
}
