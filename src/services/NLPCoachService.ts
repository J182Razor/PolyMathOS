/**
 * NLP Coach Service
 * Provides AI-powered coaching feedback using LLM integration
 */

import { LLMService } from './LLMService';
import { N8NService } from './N8NService';
import { PolymathUser } from './PolymathAIService';

export interface CoachingContext {
  userProgress?: any;
  currentDomain?: string;
  recentActivity?: string[];
  efficiencyMetrics?: any;
  learningStyle?: string;
}

export class NLPCoachService {
  private static instance: NLPCoachService;
  private llmService: LLMService;

  private constructor() {
    this.llmService = LLMService.getInstance();
  }

  public static getInstance(): NLPCoachService {
    if (!NLPCoachService.instance) {
      NLPCoachService.instance = new NLPCoachService();
    }
    return NLPCoachService.instance;
  }

  /**
   * Generate coaching feedback
   */
  public async generateFeedback(
    userInput: string,
    context: CoachingContext = {}
  ): Promise<string> {
    const prompt = this.buildCoachingPrompt(userInput, context);

    try {
      // Try n8n first if available
      const useN8N = import.meta.env.VITE_USE_N8N === 'true';
      if (useN8N) {
        try {
          const result = await N8NService.chatWithAgent({
            message: prompt,
            provider: 'nvidia',
            context,
          });
          if (result.success && result.content) {
            return result.content;
          }
        } catch (error) {
          console.warn('n8n coaching failed, falling back to direct LLM:', error);
        }
      }

      // Fallback to direct LLM
      const response = await this.llmService.generateQuickResponse(prompt);
      return response.content;
    } catch (error) {
      console.error('Coaching feedback error:', error);
      return this.getDefaultFeedback(userInput, context);
    }
  }

  /**
   * Build coaching prompt
   */
  private buildCoachingPrompt(userInput: string, context: CoachingContext): string {
    const systemContext = `
You are PolymathOS AI - an elite cognitive acceleration coach. Your mission is to provide:
1. Encouraging, specific, and actionable feedback
2. Science-backed learning strategies
3. Personalized recommendations based on the user's learning style
4. Motivation to push boundaries and connect concepts across domains

User Context:
${context.learningStyle ? `Learning Style: ${context.learningStyle}` : ''}
${context.currentDomain ? `Current Domain: ${context.currentDomain}` : ''}
${context.efficiencyMetrics ? `Efficiency: ${JSON.stringify(context.efficiencyMetrics)}` : ''}

User Input: "${userInput}"

Provide coaching feedback that is:
- Specific and actionable
- Encouraging and motivating
- Based on neuroscience and learning science
- Tailored to their learning style
- Focused on accelerating their polymath journey
`;

    return systemContext;
  }

  /**
   * Get default feedback if LLM fails
   */
  private getDefaultFeedback(userInput: string, context: CoachingContext): string {
    const encouragement = [
      'Great progress! Keep pushing your boundaries.',
      'Excellent work! You\'re building strong neural pathways.',
      'Keep going! Every session accelerates your learning.',
      'Outstanding! Your dedication is paying off.',
    ];

    const randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];

    let specificAdvice = '';
    if (context.learningStyle === 'Visual') {
      specificAdvice = ' Consider using visual aids like mind maps or diagrams to enhance retention.';
    } else if (context.learningStyle === 'Auditory') {
      specificAdvice = ' Try recording your notes and listening to them for better recall.';
    } else if (context.learningStyle === 'Kinesthetic') {
      specificAdvice = ' Hands-on practice will help solidify these concepts.';
    } else {
      specificAdvice = ' Writing detailed notes and summaries will enhance your understanding.';
    }

    return `${randomEncouragement}${specificAdvice} Remember to connect concepts across domains for maximum learning acceleration.`;
  }

  /**
   * Generate session summary with coaching insights
   */
  public async generateSessionSummary(
    user: PolymathUser,
    sessionData: {
      duration: number;
      activities: string[];
      performance: any;
    }
  ): Promise<string> {
    const context: CoachingContext = {
      userProgress: {
        level: user.level,
        xp: user.xp,
        streak: user.streak,
      },
      recentActivity: sessionData.activities,
      efficiencyMetrics: {
        totalStudyTime: user.totalStudyTime,
        sessions: user.imageStreamSessions + user.deepWorkBlocks,
      },
      learningStyle: user.learningStyle,
    };

    const summaryPrompt = `
Generate a session summary for a PolymathOS user who just completed a learning session.

Session Details:
- Duration: ${sessionData.duration} minutes
- Activities: ${sessionData.activities.join(', ')}
- User Level: ${user.level}
- Current Streak: ${user.streak} days
- Learning Style: ${user.learningStyle}

Provide:
1. A brief summary of what was accomplished
2. Key insights about their performance
3. Encouragement and motivation
4. Specific next steps or recommendations
5. Celebration of progress

Keep it concise, encouraging, and actionable.
`;

    return this.generateFeedback(summaryPrompt, context);
  }

  /**
   * Generate personalized learning path recommendation
   */
  public async generateLearningPath(
    user: PolymathUser,
    goals: string[]
  ): Promise<string> {
    const context: CoachingContext = {
      userProgress: {
        level: user.level,
        domains: Object.keys(user.domains),
      },
      learningStyle: user.learningStyle,
    };

    const pathPrompt = `
Create a personalized learning path for a PolymathOS user.

User Profile:
- Level: ${user.level}
- Domains: ${Object.keys(user.domains).join(', ')}
- Learning Style: ${user.learningStyle}
- Goals: ${goals.join(', ')}

Provide:
1. A structured learning path with milestones
2. Recommended activities for each phase
3. Estimated timeline
4. Key success metrics
5. Motivation and encouragement

Make it specific, actionable, and aligned with their polymath journey.
`;

    return this.generateFeedback(pathPrompt, context);
  }
}

