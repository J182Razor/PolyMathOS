/**
 * HDAM Service
 * Service for interacting with the Enhanced Quantum Holographic HDAM system
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LearnRequest {
  facts: string[];
  metadata?: Array<Record<string, any>>;
  context?: string;
  verbose?: boolean;
  quantum_enhanced?: boolean;
}

export interface ReasonRequest {
  query: string;
  context?: string;
  top_k?: number;
  quantum_assisted?: boolean;
  reasoning_mode?: 'associative' | 'analytical' | 'creative';
}

export interface AnalogyRequest {
  a: string;
  b: string;
  c: string;
  context?: string;
  top_k?: number;
}

export interface ExtrapolateRequest {
  base_concept: string;
  direction_from: string;
  direction_to: string;
  steps?: number;
  step_size?: number;
  context?: string;
}

export interface OptimizePathRequest {
  goals: string[];
  context?: string;
  max_items?: number;
  quantum_assisted?: boolean;
}

class HDAMService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/hdam`;
  }

  async learn(request: LearnRequest) {
    const response = await fetch(`${this.baseUrl}/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HDAM learn failed: ${response.statusText}`);
    return response.json();
  }

  async reason(request: ReasonRequest) {
    const response = await fetch(`${this.baseUrl}/reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HDAM reason failed: ${response.statusText}`);
    return response.json();
  }

  async analogy(request: AnalogyRequest) {
    const response = await fetch(`${this.baseUrl}/analogy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HDAM analogy failed: ${response.statusText}`);
    return response.json();
  }

  async extrapolate(request: ExtrapolateRequest) {
    const response = await fetch(`${this.baseUrl}/extrapolate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HDAM extrapolate failed: ${response.statusText}`);
    return response.json();
  }

  async optimizePath(request: OptimizePathRequest) {
    const response = await fetch(`${this.baseUrl}/optimize-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HDAM optimize-path failed: ${response.statusText}`);
    return response.json();
  }

  async getMetrics() {
    const response = await fetch(`${this.baseUrl}/metrics`);
    if (!response.ok) throw new Error(`HDAM metrics failed: ${response.statusText}`);
    return response.json();
  }
}

export const hdamService = new HDAMService();

