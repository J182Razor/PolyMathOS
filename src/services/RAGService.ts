import { MCPService, ResearchResult } from './MCPService';

export class RAGService {
    private static instance: RAGService;
    private mcpService: MCPService;

    private constructor() {
        this.mcpService = MCPService.getInstance();
    }

    public static getInstance(): RAGService {
        if (!RAGService.instance) {
            RAGService.instance = new RAGService();
        }
        return RAGService.instance;
    }

    /**
     * Ingest a document into the knowledge base
     * @param content The text content to ingest
     * @param metadata Metadata about the document (source, author, etc.)
     * @param collection The ChromaDB collection to use (default: 'polymath_knowledge')
     */
    public async ingestDocument(content: string, metadata: any, collection: string = 'polymath_knowledge'): Promise<boolean> {
        try {
            console.log(`[RAG] Ingesting document into ${collection}`);
            return await this.mcpService.ingestDocument(collection, content, metadata);
        } catch (error) {
            console.error('[RAG] Ingestion failed:', error);
            return false;
        }
    }

    /**
     * Retrieve relevant context for a query
     * @param query The search query
     * @param nResults Number of results to return
     * @param collection The ChromaDB collection to search
     */
    public async retrieveContext(query: string, nResults: number = 3, collection: string = 'polymath_knowledge'): Promise<ResearchResult[]> {
        try {
            console.log(`[RAG] Retrieving context for: "${query}"`);
            return await this.mcpService.queryCollection(collection, query, nResults);
        } catch (error) {
            console.error('[RAG] Retrieval failed:', error);
            return [];
        }
    }

    /**
     * Enhance a prompt with retrieved context
     */
    public async enhancePrompt(prompt: string, collection: string = 'polymath_knowledge'): Promise<string> {
        const context = await this.retrieveContext(prompt, 3, collection);

        if (context.length === 0) return prompt;

        const contextString = context.map(c => `[Source: ${c.title}]\n${c.summary}`).join('\n\n');

        return `Context information is below.\n---------------------\n${contextString}\n---------------------\nGiven the context information and not prior knowledge, answer the query.\nQuery: ${prompt}`;
    }
}
