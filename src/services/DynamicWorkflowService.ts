/**
 * Dynamic Workflow Service
 * Service for generating and managing dynamic workflows using Zero
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GenerateLessonPlanWorkflowRequest {
  topic: string;
  user_id: string;
  goals: Record<string, any>;
  user_profile?: Record<string, any>;
}

export interface CreateAdaptiveWorkflowRequest {
  workflow_id: string;
  progress_data: Record<string, any>;
}

export interface ExecuteAdaptiveWorkflowRequest {
  workflow_id: string;
  trigger_data: Record<string, any>;
  progress_data?: Record<string, any>;
}

export interface GenerateMultiPhaseWorkflowRequest {
  phases: Array<Record<string, any>>;
  user_id: string;
  topic: string;
}

class DynamicWorkflowService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/workflows/dynamic`;
  }

  async generateLessonPlanWorkflow(request: GenerateLessonPlanWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/lesson-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Workflow generation failed: ${response.statusText}`);
    return response.json();
  }

  async createAdaptiveWorkflow(request: CreateAdaptiveWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/adaptive/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Adaptive workflow creation failed: ${response.statusText}`);
    return response.json();
  }

  async executeAdaptiveWorkflow(request: ExecuteAdaptiveWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/adaptive/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Workflow execution failed: ${response.statusText}`);
    return response.json();
  }

  async generateMultiPhaseWorkflow(request: GenerateMultiPhaseWorkflowRequest) {
    const response = await fetch(`${this.baseUrl}/multi-phase/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Multi-phase workflow generation failed: ${response.statusText}`);
    return response.json();
  }

  async generateResourceWorkflow(topic: string, userId: string) {
    const response = await fetch(`${this.baseUrl}/resources/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, user_id: userId }),
    });
    if (!response.ok) throw new Error(`Resource workflow generation failed: ${response.statusText}`);
    return response.json();
  }

  async generateAssessmentWorkflow(userId: string, learningPlanId: string, frequency: string = 'weekly') {
    const response = await fetch(`${this.baseUrl}/assessment/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, learning_plan_id: learningPlanId, frequency }),
    });
    if (!response.ok) throw new Error(`Assessment workflow generation failed: ${response.statusText}`);
    return response.json();
  }

  async getWorkflowTemplates() {
    const response = await fetch(`${this.baseUrl}/templates`);
    if (!response.ok) throw new Error(`Get templates failed: ${response.statusText}`);
    return response.json();
  }
}

export const dynamicWorkflowService = new DynamicWorkflowService();

