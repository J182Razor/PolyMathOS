/**
 * Workflow Orchestrator Service
 * Service for managing dynamic workflows and progress-based adaptations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface InitializeWorkflowRequest {
  user_id: string;
  learning_plan_id: string;
  topic: string;
  goals: Record<string, any>;
}

export interface UpdateProgressRequest {
  learning_plan_id: string;
  activity_id: string;
  score: number; // 0-100
  activity_type?: string;
}

class WorkflowOrchestratorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/workflows/orchestrator`;
  }

  async initializeWorkflow(request: InitializeWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Workflow initialization failed: ${response.statusText}`);
    return response.json();
  }

  async updateProgress(request: UpdateProgressRequest) {
    const response = await fetch(`${this.baseUrl}/progress/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learning_plan_id: request.learning_plan_id,
        activity_id: request.activity_id,
        score: request.score,
        activity_type: request.activity_type || 'assessment',
      }),
    });
    if (!response.ok) throw new Error(`Progress update failed: ${response.statusText}`);
    return response.json();
  }

  async triggerResourceDiscovery(learningPlanId: string, topic: string) {
    const response = await fetch(`${this.baseUrl}/resources/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learning_plan_id: learningPlanId, topic }),
    });
    if (!response.ok) throw new Error(`Resource discovery failed: ${response.statusText}`);
    return response.json();
  }

  async triggerAssessment(learningPlanId: string) {
    const response = await fetch(`${this.baseUrl}/assessment/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learning_plan_id: learningPlanId }),
    });
    if (!response.ok) throw new Error(`Assessment trigger failed: ${response.statusText}`);
    return response.json();
  }

  async getWorkflowStatus(learningPlanId: string) {
    const response = await fetch(`${this.baseUrl}/status/${learningPlanId}`);
    if (!response.ok) throw new Error(`Get workflow status failed: ${response.statusText}`);
    return response.json();
  }
}

export const workflowOrchestratorService = new WorkflowOrchestratorService();

