/**
 * n8n Service Integration
 * Handles all communication with n8n webhooks for backend automation
 */

// Get n8n URL from localStorage (set during installation) or env
const getN8NBaseUrl = (): string => {
  const savedUrl = localStorage.getItem('n8n_webhook_url');
  if (savedUrl) {
    return savedUrl.endsWith('/') ? savedUrl.slice(0, -1) : savedUrl;
  }
  return import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678';
};

interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface ChatRequest {
  message: string;
  provider?: 'nvidia' | 'gemini' | 'groq';
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

interface RPERequest {
  userId: string;
  sessionId: string;
  itemId: string;
  confidence: number;
  wasCorrect: boolean;
}

interface SessionRequest {
  userId: string;
  sessionType: string;
  topic: string;
}

interface EnvVariableRequest {
  userId?: string;
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
}

export class N8NService {
  private static get baseUrl(): string {
    return getN8NBaseUrl();
  }

  /**
   * User Authentication - Sign Up
   */
  static async signUp(data: SignUpRequest): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Sign Up error:', error);
      return { success: false, error: 'Failed to sign up' };
    }
  }

  /**
   * User Authentication - Sign In
   */
  static async signIn(data: SignInRequest): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Sign In error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  /**
   * Chat with LLM Agent
   */
  static async chatWithAgent(data: ChatRequest): Promise<{
    success: boolean;
    content?: string;
    provider?: string;
    tokens?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/agent-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: data.provider || 'nvidia',
          message: data.message,
          userId: data.userId,
          sessionId: data.sessionId,
          context: data.context,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Chat error:', error);
      return { success: false, error: 'Failed to get AI response' };
    }
  }

  /**
   * Record RPE Event
   */
  static async recordRPE(data: RPERequest): Promise<{
    success: boolean;
    rpe?: {
      value: number;
      isHyperCorrection: boolean;
      dopamineImpact: number;
      learningValue: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/rpe-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N RPE error:', error);
      return { success: false, error: 'Failed to record RPE event' };
    }
  }

  /**
   * Start Learning Session
   */
  static async startSession(data: SessionRequest): Promise<{
    success: boolean;
    sessionId?: string;
    startedAt?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/session-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Start Session error:', error);
      return { success: false, error: 'Failed to start session' };
    }
  }

  /**
   * Update Learning Session
   */
  static async updateSession(sessionId: string, data: {
    questionsAnswered?: number;
    correctAnswers?: number;
    rpeEvents?: number;
    confidenceScores?: number[];
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/session-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Update Session error:', error);
      return { success: false, error: 'Failed to update session' };
    }
  }

  /**
   * Complete Learning Session
   */
  static async completeSession(sessionId: string, data: {
    durationMinutes: number;
    finalScore: number;
  }): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/session-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Complete Session error:', error);
      return { success: false, error: 'Failed to complete session' };
    }
  }

  /**
   * Process Spaced Repetition Review
   */
  static async processSpacedRepetition(data: {
    itemId: string;
    wasCorrect: boolean;
    confidence: number;
    item: any;
  }): Promise<{
    success: boolean;
    nextReviewDate?: string;
    newStage?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/sr-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Spaced Repetition error:', error);
      return { success: false, error: 'Failed to process review' };
    }
  }

  /**
   * Get Environment Variables
   */
  static async getEnvVariables(userId?: string): Promise<{
    success: boolean;
    variables?: Array<{
      key: string;
      value: string;
      description?: string;
      isSecret: boolean;
    }>;
    error?: string;
  }> {
    try {
      const url = userId
        ? `${this.baseUrl}/webhook/get-env?userId=${userId}`
        : `${this.baseUrl}/webhook/get-env`;
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Get Env Variables error:', error);
      return { success: false, error: 'Failed to get environment variables' };
    }
  }

  /**
   * Set Environment Variable
   */
  static async setEnvVariable(data: EnvVariableRequest): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/set-env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('N8N Set Env Variable error:', error);
      return { success: false, error: 'Failed to set environment variable' };
    }
  }

  /**
   * Create a new n8n workflow
   */
  static async createWorkflow(name: string, nodes: any[], connections: any): Promise<{
    success: boolean;
    workflowId?: string;
    error?: string;
  }> {
    try {
      const apiKey = import.meta.env.VITE_N8N_API_KEY;
      const baseUrl = import.meta.env.VITE_N8N_MCP_URL ? import.meta.env.VITE_N8N_MCP_URL.replace('/mcp-server/http', '') : this.baseUrl;

      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': apiKey || ''
        },
        body: JSON.stringify({
          name,
          nodes,
          connections,
          settings: { saveManualExecutions: true, callers: [] },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, workflowId: result.data?.id };
    } catch (error) {
      console.error('N8N Create Workflow error:', error);
      return { success: false, error: 'Failed to create workflow' };
    }
  }

  /**
   * Trigger a specific workflow by ID
   */
  static async triggerWorkflow(workflowId: string, data: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // This assumes the workflow has a Webhook node
      // For direct execution via API, we'd use /api/v1/executions (but that's complex)
      // Or we use the webhook URL pattern if we know it.
      // For now, let's assume we use the generic webhook endpoint if configured, 
      // or try to execute via the API if we have the key.

      const apiKey = import.meta.env.VITE_N8N_API_KEY;
      const baseUrl = import.meta.env.VITE_N8N_MCP_URL ? import.meta.env.VITE_N8N_MCP_URL.replace('/mcp-server/http', '') : this.baseUrl;

      // Try API execution first if key exists
      if (apiKey) {
        const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        return { success: true, data: result };
      }

      return { success: false, error: 'No API key configured for workflow execution' };
    } catch (error) {
      console.error('N8N Trigger Workflow error:', error);
      return { success: false, error: 'Failed to trigger workflow' };
    }
  }

  /**
   * Check if n8n is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = import.meta.env.VITE_N8N_MCP_URL ? import.meta.env.VITE_N8N_MCP_URL.replace('/mcp-server/http', '') : this.baseUrl;
      const response = await fetch(`${baseUrl}/healthz`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

