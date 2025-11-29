/**
 * RAG Service
 * Service for RAG operations (AgentRAGProtocol, Multi-Agent-RAG)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface IndexDocumentsRequest {
  documents: string[];
  metadata?: Array<Record<string, any>>;
}

export interface RAGQueryRequest {
  query: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface ProcessDocumentsRequest {
  documents: string[];
  analysis_type?: 'comprehensive' | 'summary' | 'insights';
}

class RAGService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/rag`;
  }

  async indexDocuments(request: IndexDocumentsRequest) {
    const response = await fetch(`${this.baseUrl}/agent/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`RAG indexing failed: ${response.statusText}`);
    return response.json();
  }

  async query(request: RAGQueryRequest) {
    const response = await fetch(`${this.baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`RAG query failed: ${response.statusText}`);
    return response.json();
  }

  async getContext(agentQuery: string, contextLength: number = 2000) {
    const response = await fetch(`${this.baseUrl}/agent/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_query: agentQuery, context_length: contextLength }),
    });
    if (!response.ok) throw new Error(`Get context failed: ${response.statusText}`);
    return response.json();
  }

  async processDocuments(request: ProcessDocumentsRequest) {
    const response = await fetch(`${this.baseUrl}/multi-agent/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Multi-agent RAG processing failed: ${response.statusText}`);
    return response.json();
  }
}

export const ragService = new RAGService();
