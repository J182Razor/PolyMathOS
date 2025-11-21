/**
 * n8n Service Integration
 * Handles all communication with n8n webhooks for backend automation
 */

const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678';

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
  private static baseUrl = N8N_BASE_URL;

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
   * Check if n8n is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

