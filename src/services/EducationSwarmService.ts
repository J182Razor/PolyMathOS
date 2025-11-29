/**
 * Education Swarm Service
 * Service for interacting with Education Learning Swarm
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface EducationSwarmRequest {
  subjects: string;
  learning_style?: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing';
  challenge_level?: 'Easy' | 'Moderate' | 'Hard';
  initial_task?: string;
}

class EducationSwarmService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/swarms`;
  }

  async generate(request: EducationSwarmRequest) {
    const response = await fetch(`${this.baseUrl}/education/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Education Swarm generate failed: ${response.statusText}`);
    return response.json();
  }
}

export const educationSwarmService = new EducationSwarmService();

