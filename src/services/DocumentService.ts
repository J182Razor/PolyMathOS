/**
 * Document Service
 * Service for document processing (doc-master, OmniParse, AgentParse)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ParseRequest {
  content: string;
  document_type?: string;
}

export interface AgentParseRequest {
  data: any;
  format?: 'json' | 'yaml' | 'csv' | 'pydantic';
}

class DocumentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/documents`;
  }

  async readFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/read`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`Document read failed: ${response.statusText}`);
    return response.json();
  }

  async parse(request: ParseRequest) {
    const response = await fetch(`${this.baseUrl}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Document parse failed: ${response.statusText}`);
    return response.json();
  }

  async parseForAgent(request: AgentParseRequest) {
    const response = await fetch(`${this.baseUrl}/parse/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Agent parse failed: ${response.statusText}`);
    return response.json();
  }

  async getSupportedFormats() {
    const response = await fetch(`${this.baseUrl}/formats`);
    if (!response.ok) throw new Error(`Get formats failed: ${response.statusText}`);
    return response.json();
  }
}

export const documentService = new DocumentService();

