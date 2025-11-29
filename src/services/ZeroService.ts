/**
 * Zero Service
 * Service for Zero workflow automation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CreateWorkflowRequest {
  workflow_def: Record<string, any>;
}

export interface ExecuteWorkflowRequest {
  workflow_id: string;
  trigger_data?: Record<string, any>;
}

class ZeroService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/workflows`;
  }

  async createWorkflow(request: CreateWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/zero/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Workflow creation failed: ${response.statusText}`);
    return response.json();
  }

  async executeWorkflow(request: ExecuteWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/zero/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Workflow execution failed: ${response.statusText}`);
    return response.json();
  }

  async listWorkflows() {
    const response = await fetch(`${this.baseUrl}/zero/list`);
    if (!response.ok) throw new Error(`List workflows failed: ${response.statusText}`);
    return response.json();
  }

  async getStatus() {
    const response = await fetch(`${this.baseUrl}/zero/status`);
    if (!response.ok) throw new Error(`Get workflow status failed: ${response.statusText}`);
    return response.json();
  }
}

export const zeroService = new ZeroService();

