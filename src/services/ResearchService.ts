/**
 * Research Service
 * Service for research operations (Research-Paper-Hive, AdvancedResearch)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DiscoverPapersRequest {
  query: string;
  max_results?: number;
  filters?: Record<string, any>;
}

export interface OrchestrateResearchRequest {
  research_query: string;
  max_workers?: number;
  strategy?: 'comprehensive' | 'focused' | 'exploratory';
}

export class ResearchService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/research`;
  }

  async discoverPapers(request: DiscoverPapersRequest) {
    const response = await fetch(`${this.baseUrl}/papers/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Paper discovery failed: ${response.statusText}`);
    return response.json();
  }

  async getPaperDetails(paperId: string) {
    const response = await fetch(`${this.baseUrl}/papers/${paperId}`);
    if (!response.ok) throw new Error(`Get paper details failed: ${response.statusText}`);
    return response.json();
  }

  async orchestrateResearch(request: OrchestrateResearchRequest) {
    const response = await fetch(`${this.baseUrl}/advanced/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Research orchestration failed: ${response.statusText}`);
    return response.json();
  }
}

export const researchService = new ResearchService();

