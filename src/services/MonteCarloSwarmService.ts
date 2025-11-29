/**
 * MonteCarloSwarm Service
 * Service for interacting with MonteCarloSwarm operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface MonteCarloRunRequest {
  task: string;
  parallel?: boolean;
  aggregator?: 'default' | 'average' | 'most_common' | 'weighted_vote' | 'consensus';
}

class MonteCarloSwarmService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/swarms`;
  }

  async run(request: MonteCarloRunRequest) {
    const response = await fetch(`${this.baseUrl}/monte-carlo/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`MonteCarloSwarm run failed: ${response.statusText}`);
    return response.json();
  }
}

export const monteCarloSwarmService = new MonteCarloSwarmService();

