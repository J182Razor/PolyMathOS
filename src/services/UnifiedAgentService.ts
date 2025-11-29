/**
 * Unified Agent Service
 * Frontend service for interacting with all agent patterns
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PatternExecutionRequest {
  pattern_type: string;
  task: string;
  pattern_config?: Record<string, any>;
  context?: Record<string, any>;
}

export interface PatternExecutionResponse {
  status: string;
  execution_id: string;
  pattern_type: string;
  result: Record<string, any>;
  execution_time: number;
  timestamp: string;
}

export interface PatternInfo {
  type: string;
  available: boolean;
  description: string;
  capabilities: string[];
}

class UnifiedAgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/agents`;
  }

  /**
   * Execute any agent pattern
   */
  async executePattern(request: PatternExecutionRequest): Promise<PatternExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Pattern execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute AdvancedResearch orchestration
   */
  async advancedResearch(
    query: string,
    config?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/advanced-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        config: config || {},
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`AdvancedResearch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute LlamaIndex RAG query
   */
  async ragQuery(
    query: string,
    config?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        config: config || {},
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`RAG query failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Store content in ChromaDB memory
   */
  async storeMemory(
    content: string,
    metadata?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/memory/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        config: {
          metadata: metadata || {},
          operation: 'store',
        },
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Memory storage failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Query ChromaDB memory
   */
  async queryMemory(
    query: string,
    config?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/memory/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        config: {
          operation: 'query',
          ...config,
        },
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Memory query failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute a specific pattern
   */
  async executePatternType(
    patternType: string,
    task: string,
    config?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/patterns/${patternType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
        config: config || {},
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Pattern execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all available patterns
   */
  async listPatterns(): Promise<{ patterns: PatternInfo[]; total: number; available: number }> {
    const response = await fetch(`${this.baseUrl}/patterns`);

    if (!response.ok) {
      throw new Error(`List patterns failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get status of a specific pattern
   */
  async getPatternStatus(patternType: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/patterns/${patternType}/status`);

    if (!response.ok) {
      throw new Error(`Get pattern status failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get orchestrator health status
   */
  async getStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/status`);

    if (!response.ok) {
      throw new Error(`Get status failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const unifiedAgentService = new UnifiedAgentService();
export default unifiedAgentService;

