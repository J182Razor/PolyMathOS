/**
 * Feynman Technique Engine Service
 * Refactored to use Backend API
 */

import axios from 'axios';

export type TargetAudience = 'child' | 'teenager' | 'adult_novice' | 'expert_other_field';
export type GapSeverity = 'minor' | 'moderate' | 'critical';

export interface FeynmanSession {
  id: string;
  concept: string;
  topic: string;
  targetAudience: TargetAudience;
  iterations: FeynmanIteration[];
  finalAnalysis?: FeynmanAnalysis;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface FeynmanIteration {
  id: string;
  iterationNumber: number;
  explanation: string;
  analysis: FeynmanAnalysis;
  noviceQuestions: NoviceQuestion[];
  userResponses: { questionId: string; response: string }[];
  timestamp: Date;
}

export interface FeynmanAnalysis {
  clarityScore: number;          // 0-100 - How clear is the explanation?
  simplicityScore: number;       // 0-100 - How simple is the language?
  accuracyScore: number;         // 0-100 - How accurate is the information?
  completenessScore: number;     // 0-100 - How complete is the explanation?
  overallScore: number;          // 0-100 - Weighted average
  gapsIdentified: KnowledgeGap[];
  jargonUsed: JargonItem[];
  analogiesUsed: Analogy[];
  strengths: string[];
  suggestions: string[];
  audienceAppropriate: boolean;
}

export interface KnowledgeGap {
  id: string;
  area: string;
  description: string;
  severity: GapSeverity;
  suggestedResources: string[];
  relatedConcepts: string[];
}

export interface JargonItem {
  term: string;
  context: string;
  simpleAlternative?: string;
  necessary: boolean;  // Some jargon is necessary, some should be simplified
}

export interface Analogy {
  concept: string;
  analogy: string;
  effectiveness: 'weak' | 'moderate' | 'strong';
  explanation: string;
}

export interface NoviceQuestion {
  id: string;
  question: string;
  type: 'clarification' | 'deeper' | 'practical' | 'challenge' | 'connection';
  urgency: 'low' | 'medium' | 'high';
  targetedGap?: string; // Links to KnowledgeGap ID
}

const API_BASE_URL = 'http://localhost:8000/api/learning';

export class FeynmanEngineService {
  private static instance: FeynmanEngineService;

  private constructor() { }

  public static getInstance(): FeynmanEngineService {
    if (!FeynmanEngineService.instance) {
      FeynmanEngineService.instance = new FeynmanEngineService();
    }
    return FeynmanEngineService.instance;
  }

  /**
   * Start a new Feynman session
   */
  public async startSession(
    concept: string,
    topic: string,
    targetAudience: TargetAudience = 'child'
  ): Promise<FeynmanSession> {
    try {
      const response = await axios.post(`${API_BASE_URL}/feynman/start`, {
        concept,
        topic,
        target_audience: targetAudience
      });
      return response.data;
    } catch (error) {
      console.error('Error starting Feynman session:', error);
      throw error;
    }
  }

  /**
   * Submit an explanation for analysis
   */
  public async submitExplanation(
    sessionId: string,
    explanation: string
  ): Promise<FeynmanIteration> {
    try {
      const response = await axios.post(`${API_BASE_URL}/feynman/analyze`, {
        session_id: sessionId,
        explanation
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting explanation:', error);
      throw error;
    }
  }

  /**
   * Submit a response to a novice question
   */
  public async submitQuestionResponse(
    sessionId: string,
    iterationId: string,
    questionId: string,
    response: string
  ): Promise<{
    feedback: string;
    addressedGap: boolean;
    followUpQuestion?: NoviceQuestion;
  }> {
    try {
      const apiResponse = await axios.post(`${API_BASE_URL}/feynman/question/response`, {
        session_id: sessionId,
        iteration_id: iterationId,
        question_id: questionId,
        response
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error submitting question response:', error);
      throw error;
    }
  }

  /**
   * Get a specific session
   */
  public async getSession(sessionId: string): Promise<FeynmanSession | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/feynman/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Feynman session:', error);
      return null;
    }
  }

  /**
   * Get all sessions for a user (Not implemented in backend yet, using mock or empty)
   */
  public async getAllSessions(): Promise<{ active: FeynmanSession[]; completed: FeynmanSession[] }> {
    // TODO: Implement backend endpoint for listing sessions
    return { active: [], completed: [] };
  }
}
