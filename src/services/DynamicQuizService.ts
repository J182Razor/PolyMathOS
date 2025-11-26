/**
 * Dynamic Quiz Generation Service
 * Based on learnie-plugin concepts - https://github.com/tankh99/learnie-plugin
 * Generates adaptive quizzes across Bloom's Taxonomy levels with AI mnemonics
 * 
 * Features:
 * - Bloom's Taxonomy question distribution
 * - AI-generated mnemonics and memory aids
 * - Active recall question generation from notes
 * - FSRS integration for spaced repetition
 * - Adaptive difficulty based on user performance
 */

import { LLMService } from './LLMService';
import { FSRSService, FSRSCard, Rating } from './FSRSService';

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

// Default Bloom distribution for comprehensive learning
const DEFAULT_BLOOM_DISTRIBUTION: BloomDistribution = {
  remember: 0.15,    // 15%
  understand: 0.25,  // 25%
  apply: 0.25,       // 25%
  analyze: 0.15,     // 15%
  evaluate: 0.10,    // 10%
  create: 0.10       // 10%
};

const DEFAULT_ADAPTIVE_CONFIG: AdaptiveDifficultyConfig = {
  startingDifficulty: 5,
  minDifficulty: 1,
  maxDifficulty: 10,
  increaseOnCorrect: 0.5,
  decreaseOnIncorrect: 1.0,
  targetSuccessRate: 0.75
};

// Question stem templates by Bloom level
const BLOOM_QUESTION_STEMS: Record<BloomLevel, string[]> = {
  remember: [
    'What is the definition of {concept}?',
    'List the main components of {concept}.',
    'Who/What/When/Where is {concept}?',
    'Name the {concept} that {action}.',
    'Identify the {concept} in this context.'
  ],
  understand: [
    'Explain {concept} in your own words.',
    'What is the main idea behind {concept}?',
    'How would you summarize {concept}?',
    'Compare and contrast {concept1} with {concept2}.',
    'What is an example of {concept}?'
  ],
  apply: [
    'How would you use {concept} to solve {problem}?',
    'Apply {concept} to this scenario: {scenario}.',
    'What would happen if you applied {concept} here?',
    'Demonstrate how {concept} works in practice.',
    'Calculate/Compute using {concept}.'
  ],
  analyze: [
    'What are the components of {concept}?',
    'How does {concept} relate to {other_concept}?',
    'What patterns do you see in {concept}?',
    'What is the underlying structure of {concept}?',
    'Distinguish between {concept1} and {concept2}.'
  ],
  evaluate: [
    'What criteria would you use to evaluate {concept}?',
    'Do you agree with {statement}? Why or why not?',
    'What is the most important aspect of {concept}?',
    'Critique the approach of {concept}.',
    'What are the strengths and weaknesses of {concept}?'
  ],
  create: [
    'Design a solution using {concept}.',
    'How would you improve {concept}?',
    'Create a new {thing} based on {concept}.',
    'Propose an alternative approach to {concept}.',
    'Synthesize {concept1} and {concept2} into something new.'
  ]
};

export class DynamicQuizService {
  private static instance: DynamicQuizService;
  private llmService: LLMService;
  private fsrsService: FSRSService;
  private quizzes: Map<string, DynamicQuiz> = new Map();
  private attempts: Map<string, QuizAttempt[]> = new Map();
  private questions: Map<string, QuizQuestion> = new Map();

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.fsrsService = FSRSService.getInstance();
    this.loadData();
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
    const {
      questionCount = 10,
      bloomDistribution = DEFAULT_BLOOM_DISTRIBUTION,
      difficulty = 5,
      includeTypes = ['mcq', 'fill_blank', 'explain', 'apply'],
      includeMnemonics = true,
      fsrsIntegration = true,
      timeLimit
    } = options;

    // Merge with defaults
    const distribution: BloomDistribution = {
      ...DEFAULT_BLOOM_DISTRIBUTION,
      ...bloomDistribution
    };

    // Generate questions for each Bloom level
    const questions: QuizQuestion[] = [];
    
    for (const [level, percentage] of Object.entries(distribution)) {
      const count = Math.round(questionCount * percentage);
      if (count > 0) {
        const levelQuestions = await this.generateQuestionsForLevel(
          topic,
          level as BloomLevel,
          count,
          difficulty,
          includeTypes,
          includeMnemonics
        );
        questions.push(...levelQuestions);
      }
    }

    // Create FSRS cards if integration is enabled
    if (fsrsIntegration) {
      for (const question of questions) {
        const fsrsCard = this.fsrsService.createCard(
          question.question,
          question.correctAnswer as string,
          topic,
          question.tags
        );
        question.fsrsCardId = fsrsCard.id;
      }
    }

    const quiz: DynamicQuiz = {
      id: this.generateId(),
      topic,
      title: `${topic} - Adaptive Quiz`,
      description: `A dynamically generated quiz covering ${topic} across multiple cognitive levels.`,
      questions,
      bloomDistribution: distribution,
      adaptiveDifficulty: DEFAULT_ADAPTIVE_CONFIG,
      fsrsIntegration,
      timeLimit,
      shuffleQuestions: true,
      showHints: true,
      showExplanations: true,
      createdAt: new Date(),
      metadata: {
        totalAttempts: 0,
        averageScore: 0,
        averageTimeMinutes: 0
      }
    };

    this.quizzes.set(quiz.id, quiz);
    this.saveData();
    return quiz;
  }

  /**
   * Generate questions for a specific Bloom level
   */
  private async generateQuestionsForLevel(
    topic: string,
    level: BloomLevel,
    count: number,
    baseDifficulty: number,
    types: QuestionType[],
    includeMnemonics: boolean
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];
    const stems = BLOOM_QUESTION_STEMS[level];

    // Try to use LLM for generation
    try {
      const prompt = this.buildQuestionGenerationPrompt(topic, level, count, types);
      const response = await this.llmService.generateQuickResponse(prompt);
      
      // Parse LLM response
      const generatedQuestions = this.parseGeneratedQuestions(response.content, level, topic);
      
      for (const q of generatedQuestions.slice(0, count)) {
        const question = await this.enrichQuestion(q, includeMnemonics);
        questions.push(question);
      }
    } catch (error) {
      console.warn('LLM question generation failed, using templates:', error);
    }

    // Fill remaining with template-based questions
    while (questions.length < count) {
      const template = stems[questions.length % stems.length];
      const question = this.createTemplateQuestion(template, topic, level, baseDifficulty);
      questions.push(question);
    }

    return questions;
  }

  /**
   * Build prompt for LLM question generation
   */
  private buildQuestionGenerationPrompt(
    topic: string,
    level: BloomLevel,
    count: number,
    types: QuestionType[]
  ): string {
    return `Generate ${count} quiz questions about "${topic}" at the Bloom's Taxonomy level: ${level.toUpperCase()}.

Bloom Level Descriptions:
- REMEMBER: Recall facts and basic concepts
- UNDERSTAND: Explain ideas or concepts  
- APPLY: Use information in new situations
- ANALYZE: Draw connections among ideas
- EVALUATE: Justify a stand or decision
- CREATE: Produce new or original work

Question types to include: ${types.join(', ')}

For each question, provide in JSON format:
{
  "question": "the question text",
  "type": "mcq|fill_blank|explain|apply|create",
  "correctAnswer": "the correct answer",
  "distractors": ["wrong option 1", "wrong option 2", "wrong option 3"] (for MCQ only),
  "explanation": "why this is the correct answer",
  "hints": ["hint 1", "hint 2"],
  "difficulty": 5 (1-10 scale),
  "prerequisiteKnowledge": ["concept 1", "concept 2"]
}

Return a JSON array of questions.`;
  }

  /**
   * Parse LLM-generated questions
   */
  private parseGeneratedQuestions(
    content: string,
    level: BloomLevel,
    topic: string
  ): Partial<QuizQuestion>[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((q: any) => ({
          ...q,
          bloomLevel: level,
          topic,
          id: this.generateId()
        }));
      }
    } catch (error) {
      console.warn('Failed to parse LLM questions:', error);
    }
    return [];
  }

  /**
   * Enrich question with mnemonics and metadata
   */
  private async enrichQuestion(
    partial: Partial<QuizQuestion>,
    includeMnemonics: boolean
  ): Promise<QuizQuestion> {
    const question: QuizQuestion = {
      id: partial.id || this.generateId(),
      type: partial.type || 'mcq',
      bloomLevel: partial.bloomLevel || 'understand',
      topic: partial.topic || '',
      question: partial.question || '',
      correctAnswer: partial.correctAnswer || '',
      distractors: partial.distractors,
      hints: partial.hints || [],
      explanation: partial.explanation || '',
      difficulty: partial.difficulty || 5,
      prerequisiteKnowledge: partial.prerequisiteKnowledge || [],
      tags: partial.tags || [partial.topic || ''],
      metadata: {
        createdAt: new Date(),
        timesAsked: 0,
        timesCorrect: 0,
        averageTimeSeconds: 0
      }
    };

    // Generate mnemonic if requested
    if (includeMnemonics && question.bloomLevel === 'remember') {
      question.mnemonicAid = await this.generateMnemonic(
        question.question,
        question.correctAnswer as string
      );
    }

    this.questions.set(question.id, question);
    return question;
  }

  /**
   * Create a template-based question
   */
  private createTemplateQuestion(
    template: string,
    topic: string,
    level: BloomLevel,
    difficulty: number
  ): QuizQuestion {
    const question = template.replace(/{concept}/g, topic);

    return {
      id: this.generateId(),
      type: level === 'remember' ? 'mcq' : 'explain',
      bloomLevel: level,
      topic,
      question,
      correctAnswer: `[Answer about ${topic}]`,
      hints: [`Think about the key aspects of ${topic}`],
      explanation: `This tests your ${level} level understanding of ${topic}.`,
      difficulty,
      prerequisiteKnowledge: [],
      tags: [topic],
      metadata: {
        createdAt: new Date(),
        timesAsked: 0,
        timesCorrect: 0,
        averageTimeSeconds: 0
      }
    };
  }

  /**
   * Generate AI mnemonic for a concept
   * Based on AnkiAIUtils approach
   */
  public async generateMnemonic(
    concept: string,
    answer: string
  ): Promise<MnemonicAid> {
    try {
      const prompt = `Create a memorable mnemonic device for learning this:
Concept: ${concept}
Answer: ${answer}

Choose the best type of mnemonic:
1. ACRONYM - First letter of each key word
2. VISUAL - Vivid visual association
3. STORY - Short memorable story
4. PHONETIC - Sound-alike connection
5. RHYME - Rhyming phrase

Respond in JSON format:
{
  "type": "acronym|visual|story|phonetic|rhyme",
  "content": "the mnemonic device",
  "imagePrompt": "description for generating a visual aid image"
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            type: parsed.type || 'visual',
            content: parsed.content || `Remember: ${answer}`,
            imagePrompt: parsed.imagePrompt,
            effectiveness: 0.8
          };
        }
      } catch {
        // Fall through to default
      }
    } catch (error) {
      console.warn('Mnemonic generation failed:', error);
    }

    // Default mnemonic
    return {
      type: 'visual',
      content: `Visualize "${answer}" connected to "${concept}"`,
      effectiveness: 0.5
    };
  }

  /**
   * Generate questions from Zettelkasten notes (Active Recall)
   * Based on learnie-plugin approach
   */
  public async generateQuestionsFromNotes(
    notes: { id: string; title: string; content: string }[],
    questionsPerNote: number = 3
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];

    for (const note of notes) {
      try {
        const prompt = `Generate ${questionsPerNote} quiz questions from this note content for active recall practice:

Title: ${note.title}
Content: ${note.content}

Create questions that:
1. Test key concepts mentioned
2. Require understanding, not just recall
3. Connect to related ideas

Respond with JSON array:
[{
  "question": "question text",
  "type": "explain|mcq|fill_blank",
  "correctAnswer": "answer",
  "distractors": ["wrong1", "wrong2", "wrong3"],
  "explanation": "why this answer",
  "bloomLevel": "remember|understand|apply|analyze"
}]`;

        const response = await this.llmService.generateQuickResponse(prompt);
        
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const generated = JSON.parse(jsonMatch[0]);
          for (const q of generated) {
            const question = await this.enrichQuestion({
              ...q,
              topic: note.title,
              zettelId: note.id
            }, true);
            questions.push(question);
          }
        }
      } catch (error) {
        console.warn(`Failed to generate questions from note ${note.id}:`, error);
      }
    }

    return questions;
  }

  /**
   * Submit a quiz attempt and get analysis
   */
  public async submitQuizAttempt(
    quizId: string,
    userId: string,
    answers: Omit<QuizAnswer, 'isCorrect' | 'fsrsRating'>[]
  ): Promise<QuizAttempt> {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) throw new Error(`Quiz ${quizId} not found`);

    // Grade answers
    const gradedAnswers: QuizAnswer[] = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = this.checkAnswer(question, answer.userAnswer);
      if (isCorrect) correctCount++;

      // Determine FSRS rating based on correctness and confidence
      let fsrsRating: Rating = isCorrect ? 3 : 1; // Good or Again
      if (isCorrect && answer.confidenceRating && answer.confidenceRating >= 4) {
        fsrsRating = 4; // Easy if confident and correct
      } else if (isCorrect && answer.timeSpentSeconds < 10) {
        fsrsRating = 4; // Easy if fast and correct
      } else if (!isCorrect && answer.confidenceRating && answer.confidenceRating >= 4) {
        // Hyper-correction: high confidence but wrong = important learning moment
        fsrsRating = 1;
      }

      // Update FSRS card if linked
      if (quiz.fsrsIntegration && question.fsrsCardId) {
        this.fsrsService.reviewCard(question.fsrsCardId, fsrsRating);
      }

      // Update question metadata
      question.metadata.timesAsked++;
      if (isCorrect) question.metadata.timesCorrect++;
      question.metadata.averageTimeSeconds = 
        (question.metadata.averageTimeSeconds * (question.metadata.timesAsked - 1) + answer.timeSpentSeconds) / 
        question.metadata.timesAsked;
      question.metadata.lastAsked = new Date();

      gradedAnswers.push({
        ...answer,
        isCorrect,
        fsrsRating
      });
    }

    // Analyze comprehension
    const comprehensionAnalysis = this.analyzeComprehension(quiz, gradedAnswers);

    const attempt: QuizAttempt = {
      id: this.generateId(),
      quizId,
      userId,
      startTime: new Date(Date.now() - answers.reduce((sum, a) => sum + a.timeSpentSeconds * 1000, 0)),
      endTime: new Date(),
      answers: gradedAnswers,
      score: correctCount,
      maxScore: answers.length,
      percentCorrect: (correctCount / answers.length) * 100,
      comprehensionAnalysis
    };

    // Store attempt
    const userAttempts = this.attempts.get(userId) || [];
    userAttempts.push(attempt);
    this.attempts.set(userId, userAttempts);

    // Update quiz metadata
    quiz.metadata.totalAttempts++;
    quiz.metadata.averageScore = 
      (quiz.metadata.averageScore * (quiz.metadata.totalAttempts - 1) + attempt.percentCorrect) / 
      quiz.metadata.totalAttempts;

    this.saveData();
    return attempt;
  }

  /**
   * Check if an answer is correct
   */
  private checkAnswer(question: QuizQuestion, userAnswer: string | string[]): boolean {
    const correctAnswer = question.correctAnswer;

    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // Multi-answer comparison
      return correctAnswer.length === userAnswer.length &&
        correctAnswer.every(a => userAnswer.includes(a));
    }

    // Normalize for comparison
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
    
    if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
      // Exact match or close enough
      const normalizedCorrect = normalize(correctAnswer);
      const normalizedUser = normalize(userAnswer);
      
      if (normalizedCorrect === normalizedUser) return true;
      
      // Check for key terms (for explain questions)
      if (question.type === 'explain') {
        const keyTerms = normalizedCorrect.split(' ').filter(w => w.length > 4);
        const matchedTerms = keyTerms.filter(term => normalizedUser.includes(term));
        return matchedTerms.length >= keyTerms.length * 0.6; // 60% key terms match
      }
    }

    return false;
  }

  /**
   * Analyze comprehension from quiz answers
   */
  private analyzeComprehension(
    quiz: DynamicQuiz,
    answers: QuizAnswer[]
  ): ComprehensionAnalysis {
    const bloomScores: Record<BloomLevel, { correct: number; total: number }> = {
      remember: { correct: 0, total: 0 },
      understand: { correct: 0, total: 0 },
      apply: { correct: 0, total: 0 },
      analyze: { correct: 0, total: 0 },
      evaluate: { correct: 0, total: 0 },
      create: { correct: 0, total: 0 }
    };

    const incorrectConcepts: string[] = [];
    
    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      bloomScores[question.bloomLevel].total++;
      if (answer.isCorrect) {
        bloomScores[question.bloomLevel].correct++;
      } else {
        incorrectConcepts.push(question.topic);
        if (question.subtopic) incorrectConcepts.push(question.subtopic);
      }
    }

    // Calculate scores
    const finalBloomScores: Record<BloomLevel, number> = {} as Record<BloomLevel, number>;
    const strengthAreas: string[] = [];
    const weakAreas: string[] = [];

    for (const [level, data] of Object.entries(bloomScores)) {
      const score = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      finalBloomScores[level as BloomLevel] = Math.round(score);
      
      if (score >= 80 && data.total >= 2) {
        strengthAreas.push(`${level} (${score.toFixed(0)}%)`);
      } else if (score < 60 && data.total >= 2) {
        weakAreas.push(`${level} (${score.toFixed(0)}%)`);
      }
    }

    // Overall score
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const overallScore = Math.round((totalCorrect / answers.length) * 100);

    // Identify concepts needing mnemonics
    const mnemonicsNeeded = [...new Set(incorrectConcepts)].slice(0, 5);

    return {
      overallScore,
      bloomScores: finalBloomScores,
      strengthAreas,
      weakAreas,
      recommendedTopics: mnemonicsNeeded,
      mnemonicsNeeded
    };
  }

  /**
   * Get adaptive next question based on performance
   */
  public getAdaptiveNextQuestion(
    quiz: DynamicQuiz,
    answeredQuestionIds: string[],
    recentPerformance: { correct: number; total: number }
  ): QuizQuestion | null {
    const unanswered = quiz.questions.filter(q => !answeredQuestionIds.includes(q.id));
    if (unanswered.length === 0) return null;

    // Calculate target difficulty
    const successRate = recentPerformance.total > 0 
      ? recentPerformance.correct / recentPerformance.total 
      : 0.5;
    
    const config = quiz.adaptiveDifficulty;
    let targetDifficulty = config.startingDifficulty;

    if (successRate > config.targetSuccessRate + 0.1) {
      targetDifficulty = Math.min(config.maxDifficulty, targetDifficulty + config.increaseOnCorrect);
    } else if (successRate < config.targetSuccessRate - 0.1) {
      targetDifficulty = Math.max(config.minDifficulty, targetDifficulty - config.decreaseOnIncorrect);
    }

    // Find question closest to target difficulty
    unanswered.sort((a, b) => {
      const aDiff = Math.abs(a.difficulty - targetDifficulty);
      const bDiff = Math.abs(b.difficulty - targetDifficulty);
      return aDiff - bDiff;
    });

    return unanswered[0];
  }

  /**
   * Get quiz by ID
   */
  public getQuiz(quizId: string): DynamicQuiz | undefined {
    return this.quizzes.get(quizId);
  }

  /**
   * Get user's quiz history
   */
  public getUserAttempts(userId: string): QuizAttempt[] {
    return this.attempts.get(userId) || [];
  }

  /**
   * Get questions due for review (via FSRS)
   */
  public getReviewQuestions(limit: number = 20): QuizQuestion[] {
    const dueCards = this.fsrsService.getDueCards(limit);
    const questions: QuizQuestion[] = [];

    for (const card of dueCards) {
      // Find question linked to this card
      for (const question of this.questions.values()) {
        if (question.fsrsCardId === card.id) {
          questions.push(question);
          break;
        }
      }
    }

    return questions;
  }

  // Utility methods
  private generateId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveData(): void {
    try {
      const quizzesData = Array.from(this.quizzes.entries());
      const attemptsData = Array.from(this.attempts.entries());
      const questionsData = Array.from(this.questions.entries());

      localStorage.setItem('polymath_quizzes', JSON.stringify(quizzesData));
      localStorage.setItem('polymath_quiz_attempts', JSON.stringify(attemptsData));
      localStorage.setItem('polymath_quiz_questions', JSON.stringify(questionsData));
    } catch (error) {
      console.error('Error saving quiz data:', error);
    }
  }

  private loadData(): void {
    try {
      const quizzesData = localStorage.getItem('polymath_quizzes');
      const attemptsData = localStorage.getItem('polymath_quiz_attempts');
      const questionsData = localStorage.getItem('polymath_quiz_questions');

      if (quizzesData) {
        const parsed = JSON.parse(quizzesData);
        for (const [id, quiz] of parsed) {
          quiz.createdAt = new Date(quiz.createdAt);
          for (const q of quiz.questions) {
            q.metadata.createdAt = new Date(q.metadata.createdAt);
            if (q.metadata.lastAsked) q.metadata.lastAsked = new Date(q.metadata.lastAsked);
          }
          this.quizzes.set(id, quiz);
        }
      }

      if (attemptsData) {
        const parsed = JSON.parse(attemptsData);
        for (const [userId, attempts] of parsed) {
          for (const attempt of attempts) {
            attempt.startTime = new Date(attempt.startTime);
            if (attempt.endTime) attempt.endTime = new Date(attempt.endTime);
          }
          this.attempts.set(userId, attempts);
        }
      }

      if (questionsData) {
        const parsed = JSON.parse(questionsData);
        for (const [id, question] of parsed) {
          question.metadata.createdAt = new Date(question.metadata.createdAt);
          if (question.metadata.lastAsked) question.metadata.lastAsked = new Date(question.metadata.lastAsked);
          this.questions.set(id, question);
        }
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    }
  }
}

