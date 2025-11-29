/**
 * Custom Swarm Service
 * Service for custom swarm management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CreateCustomSwarmRequest {
  name: string;
  description: string;
  spec: Record<string, any>;
}

class CustomSwarmService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/swarms`;
  }

  async createSwarm(request: CreateCustomSwarmRequest) {
    const response = await fetch(`${this.baseUrl}/custom/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Custom swarm creation failed: ${response.statusText}`);
    return response.json();
  }

  async listSwarms() {
    const response = await fetch(`${this.baseUrl}/custom/list`);
    if (!response.ok) throw new Error(`List custom swarms failed: ${response.statusText}`);
    return response.json();
  }
}

export const customSwarmService = new CustomSwarmService();

