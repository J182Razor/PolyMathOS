/**
 * Dynamic Quiz Generation Service
 * Refactored to use Backend API
 */

import axios from 'axios';
import { FSRSService, Rating } from './FSRSService';

// Bloom's Taxonomy levels
export type BloomLevel =
  | 'remember'    // Recall facts and basic concepts
  | 'understand'  // Explain ideas or concepts
  | 'apply'       // Use information in new situations
  | 'analyze'     // Draw connections among ideas
  | 'evaluate'    // Justify a stand or decision
  | 'create';     // Produce new or original work

export type QuestionType =
  | 'mcq'          // Multiple choice
  | 'fill_blank'   // Fill in the blank
  | 'explain'      // Short explanation
  | 'apply'        // Apply concept to scenario
  | 'create'       // Create something new
  | 'code'         // Code-based question
  | 'visual'       // Visual/diagram question
  | 'feynman';     // Explain like teaching

export type MnemonicType =
  | 'acronym'        // First letter acronym
  | 'visual'         // Visual association
  | 'story'          // Story-based
  | 'phonetic'       // Sound-alike
  | 'method_of_loci' // Memory palace location
  | 'chunking'       // Group related items
  | 'rhyme';         // Rhyme-based

export interface MnemonicAid {
  type: MnemonicType;
  content: string;
  imagePrompt?: string;  // For AI image generation
  imageUrl?: string;     // Generated image URL
  effectiveness: number; // 0-1 effectiveness score
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  bloomLevel: BloomLevel;
  topic: string;
  subtopic?: string;
  question: string;
  correctAnswer: string | string[];
  distractors?: string[];        // For MCQ - wrong options
  hints: string[];
  explanation: string;
  difficulty: number;            // 1-10
  mnemonicAid?: MnemonicAid;
  memoryPalaceLocus?: string;
  zettelId?: string;             // Link to Zettelkasten note
  fsrsCardId?: string;           // Link to FSRS card
  prerequisiteKnowledge: string[];
  tags: string[];
  metadata: {
    createdAt: Date;
    timesAsked: number;
    timesCorrect: number;
    averageTimeSeconds: number;
    lastAsked?: Date;
  };
}

export interface BloomDistribution {
  remember: number;    // Percentage of questions
  understand: number;
  apply: number;
  analyze: number;
  evaluate: number;
  create: number;
}

export interface AdaptiveDifficultyConfig {
  startingDifficulty: number;
  minDifficulty: number;
  maxDifficulty: number;
  increaseOnCorrect: number;
  decreaseOnIncorrect: number;
  targetSuccessRate: number; // e.g., 0.75 = 75%
}

export interface DynamicQuiz {
  id: string;
  topic: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  bloomDistribution: BloomDistribution;
  adaptiveDifficulty: AdaptiveDifficultyConfig;
  fsrsIntegration: boolean;
  timeLimit?: number;  // minutes
  shuffleQuestions: boolean;
  showHints: boolean;
  showExplanations: boolean;
  createdAt: Date;
  metadata: {
    totalAttempts: number;
    averageScore: number;
    averageTimeMinutes: number;
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentCorrect: number;
  comprehensionAnalysis: ComprehensionAnalysis;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  confidenceRating?: number; // 1-5 user's confidence before answering
  fsrsRating?: Rating;       // Rating for FSRS card update
}

export interface ComprehensionAnalysis {
  overallScore: number;
  bloomScores: Record<BloomLevel, number>;
  strengthAreas: string[];
  weakAreas: string[];
  recommendedTopics: string[];
  mnemonicsNeeded: string[]; // Concepts that need memory aids
}

const API_BASE_URL = 'http://localhost:8000/api/learning';

export class DynamicQuizService {
  private static instance: DynamicQuizService;
  private fsrsService: FSRSService;

  private constructor() {
    this.fsrsService = FSRSService.getInstance();
  }

  public static getInstance(): DynamicQuizService {
    if (!DynamicQuizService.instance) {
      DynamicQuizService.instance = new DynamicQuizService();
    }
    return DynamicQuizService.instance;
  }

  /**
   * Generate a dynamic quiz for a topic
   */
  public async generateQuiz(
    topic: string,
    options: {
      questionCount?: number;
      bloomDistribution?: Partial<BloomDistribution>;
      difficulty?: number;
      includeTypes?: QuestionType[];
      includeMnemonics?: boolean;
      fsrsIntegration?: boolean;
      timeLimit?: number;
    } = {}
  ): Promise<DynamicQuiz> {
    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/generate`, {
        topic,
        question_count: options.questionCount || 10,
        bloom_distribution: options.bloomDistribution,
        difficulty: options.difficulty || 5,
        include_types: options.includeTypes || ['mcq', 'fill_blank', 'explain', 'apply'],
        include_mnemonics: options.includeMnemonics ?? true,
        fsrs_integration: options.fsrsIntegration ?? true
      });

      // Map backend response to frontend interface if necessary
      // Assuming backend returns matching structure for now
      return response.data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  /**
   * Submit a quiz attempt and get analysis
   */
  public async submitQuizAttempt(
    quizId: string,
    userId: string,
    answers: Omit<QuizAnswer, 'isCorrect' | 'fsrsRating'>[]
  ): Promise<QuizAttempt> {
    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/submit`, {
        quiz_id: quizId,
        user_id: userId,
        answers: answers.map(a => ({
          question_id: a.questionId,
          user_answer: a.userAnswer,
          time_spent_seconds: a.timeSpentSeconds
        }))
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Get user's quiz attempts history
   */
  public async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quiz/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
  }

  /**
   * Get adaptive next question based on performance
   * (Currently client-side logic, can be moved to backend later)
   */
  public getAdaptiveNextQuestion(
    quiz: DynamicQuiz,
    answeredQuestionIds: string[],
    recentPerformance: { correct: number; total: number }
  ): QuizQuestion | null {
    const unanswered = quiz.questions.filter(q => !answeredQuestionIds.includes(q.id));
    if (unanswered.length === 0) return null;

    // Simple random selection for now, as adaptive logic is complex to port without backend support for single question generation
    return unanswered[Math.floor(Math.random() * unanswered.length)];
  }
}
