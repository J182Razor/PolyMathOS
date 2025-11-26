/**
 * Genius Professor Service - The Brain of PolyMathOS Learning System
 * 
 * Orchestrates all learning services to create a comprehensive "Genius Professor"
 * that acts as a personal tutor, leveraging the Polymath Stack:
 * 
 * 1. Structure: Zettelkasten (Luhmann Method) - Knowledge operating system
 * 2. Process: Feynman Technique - Applied to every new concept
 * 3. Visualization: Memory Palace - Encoding core first principles
 * 
 * Integrates with:
 * - Swarms for multi-agent AI reasoning
 * - LemonAI for self-evolving agent capabilities
 * - FSRS for spaced repetition
 * - Dynamic quizzes for active recall
 */

import { LLMService } from './LLMService';
import { FSRSService, FSRSCard, Rating, FSRSStatistics } from './FSRSService';
import { DynamicQuizService, DynamicQuiz, QuizAttempt, BloomLevel, ComprehensionAnalysis } from './DynamicQuizService';
import { ReinforcementLearningService } from './ReinforcementLearningService';

// Forward declarations for services we'll create
interface ZettelkastenServiceType {
  createNote: (title: string, content: string, type: string) => Promise<any>;
  getNotes: () => any[];
  findConnections: (noteId: string) => any[];
}

interface FeynmanEngineServiceType {
  startSession: (concept: string, targetAudience: string) => Promise<any>;
  analyzeExplanation: (explanation: string) => Promise<any>;
}

interface MemoryPalaceAIServiceType {
  generatePalace: (concepts: string[], template: string) => Promise<any>;
  getPalace: (id: string) => any;
}

// Types for the Genius Professor
export type LearningGoalType = 'mastery' | 'familiarity' | 'awareness';
export type LearningStyleArchetype = 
  | 'physicist'     // Feynman - Teach to learn
  | 'engineer'      // Musk - First principles
  | 'artist'        // Da Vinci - Visual-mechanical
  | 'grandmaster'   // Waitzkin - Smaller circles
  | 'academic'      // Luhmann - Networked knowledge
  | 'strategist';   // Munger - Mental models

export interface LearningGoals {
  topic: string;
  subtopics: string[];
  goalType: LearningGoalType;
  timeframe: string;       // "1 week", "1 month", "3 months"
  dailyTimeMinutes: number;
  targetComprehension: number; // 0-100
  includeFeynman: boolean;
  includeMemoryPalace: boolean;
  includeZettelkasten: boolean;
}

export interface LearningPlan {
  id: string;
  userId: string;
  goals: LearningGoals;
  phases: LearningPhase[];
  currentPhaseIndex: number;
  startDate: Date;
  estimatedEndDate: Date;
  progress: LearningProgress;
  adaptations: PlanAdaptation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDays: number;
  objectives: string[];
  activities: LearningActivity[];
  assessments: PhaseAssessment[];
  completionCriteria: {
    minComprehension: number;
    requiredActivities: string[];
    requiredAssessmentScore: number;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
}

export interface LearningActivity {
  id: string;
  type: 'lesson' | 'quiz' | 'feynman' | 'memory_palace' | 'zettelkasten' | 'practice' | 'review' | 'reflection';
  title: string;
  description: string;
  estimatedMinutes: number;
  resources: string[];
  bloomLevels: BloomLevel[];
  prerequisites: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
  performance?: {
    score: number;
    timeSpent: number;
    notes: string;
  };
}

export interface PhaseAssessment {
  id: string;
  type: 'quiz' | 'feynman' | 'project' | 'self_assessment';
  title: string;
  description: string;
  weight: number; // Percentage of phase grade
  minScore: number;
  status: 'pending' | 'completed';
  score?: number;
  completedAt?: Date;
}

export interface LearningProgress {
  overallComprehension: number;
  bloomLevelScores: Record<BloomLevel, number>;
  topicsCompleted: number;
  totalTopics: number;
  activitiesCompleted: number;
  totalActivities: number;
  studyTimeMinutes: number;
  streakDays: number;
  lastStudyDate?: Date;
  strengthAreas: string[];
  weakAreas: string[];
  fsrsStats: FSRSStatistics | null;
}

export interface PlanAdaptation {
  timestamp: Date;
  reason: string;
  changes: string[];
  triggeredBy: 'performance' | 'feedback' | 'schedule' | 'ai_recommendation';
}

export interface ComprehensionReport {
  userId: string;
  topic: string;
  timestamp: Date;
  dimensions: {
    memory: number;        // Recall ability
    understanding: number; // Concept grasp
    application: number;   // Practical use
    analysis: number;      // Pattern recognition
    synthesis: number;     // Cross-domain connection
    creation: number;      // Original work
  };
  overallScore: number;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  nextSteps: LearningRecommendation[];
}

export interface LearningRecommendation {
  type: 'review' | 'new_content' | 'practice' | 'assessment' | 'break';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  reason: string;
  activityId?: string;
}

export interface ProgressReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  studyTimeMinutes: number;
  activitiesCompleted: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  feynmanSessionsCompleted: number;
  notesCreated: number;
  memoriesStrengthened: number; // FSRS cards reviewed
  comprehensionChange: number;  // Percentage change
  achievements: string[];
  insights: string[];
  areasForImprovement: string[];
}

// Polymath Archetypes with their learning techniques
const POLYMATH_ARCHETYPES = {
  physicist: {
    name: "The Physicist (Feynman)",
    style: "Teach to learn",
    techniques: ["Feynman Technique", "First principles", "Visual intuition"],
    strengthAreas: ["Physics", "Mathematics", "Problem-solving"],
    learningApproach: "Explain concepts as if teaching a child. Identify gaps through teaching."
  },
  engineer: {
    name: "The Engineer (Musk)",
    style: "First principles thinking",
    techniques: ["Break to fundamentals", "Cross-domain synthesis", "Rapid iteration"],
    strengthAreas: ["Engineering", "Business", "Systems thinking"],
    learningApproach: "Break everything down to fundamental truths. Rebuild from there."
  },
  artist: {
    name: "The Artist-Scientist (Da Vinci)",
    style: "Visual-mechanical learning",
    techniques: ["Sketching", "Nature observation", "Reverse engineering"],
    strengthAreas: ["Art", "Anatomy", "Engineering"],
    learningApproach: "Draw and visualize everything. Learn by observation and deconstruction."
  },
  grandmaster: {
    name: "The Grandmaster (Waitzkin)",
    style: "Smaller circles",
    techniques: ["Chunking", "Deep practice", "Flow states"],
    strengthAreas: ["Chess", "Martial arts", "Performance"],
    learningApproach: "Master micro-skills deeply. Build from smallest elements up."
  },
  academic: {
    name: "The Academic (Luhmann)",
    style: "Networked knowledge",
    techniques: ["Zettelkasten", "Writing to think", "Connection finding"],
    strengthAreas: ["Sociology", "Systems theory", "Writing"],
    learningApproach: "Write notes in your own words. Connect everything to everything."
  },
  strategist: {
    name: "The Strategist (Munger)",
    style: "Mental models lattice",
    techniques: ["Multi-disciplinary models", "Inversion", "Second-order thinking"],
    strengthAreas: ["Investing", "Psychology", "Decision-making"],
    learningApproach: "Collect mental models from all disciplines. Use inversion thinking."
  }
};

export class GeniusProfessorService {
  private static instance: GeniusProfessorService;
  
  // Core services
  private llmService: LLMService;
  private fsrsService: FSRSService;
  private quizService: DynamicQuizService;
  private rlService: ReinforcementLearningService;
  
  // Optional services (will be initialized when available)
  private zettelkastenService?: ZettelkastenServiceType;
  private feynmanService?: FeynmanEngineServiceType;
  private memoryPalaceService?: MemoryPalaceAIServiceType;
  
  // Data storage
  private learningPlans: Map<string, LearningPlan> = new Map();
  private progressHistory: Map<string, ProgressReport[]> = new Map();
  private userArchetypes: Map<string, LearningStyleArchetype> = new Map();

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.fsrsService = FSRSService.getInstance();
    this.quizService = DynamicQuizService.getInstance();
    this.rlService = ReinforcementLearningService.getInstance();
    this.loadData();
  }

  public static getInstance(): GeniusProfessorService {
    if (!GeniusProfessorService.instance) {
      GeniusProfessorService.instance = new GeniusProfessorService();
    }
    return GeniusProfessorService.instance;
  }

  /**
   * Register optional services
   */
  public registerServices(services: {
    zettelkasten?: ZettelkastenServiceType;
    feynman?: FeynmanEngineServiceType;
    memoryPalace?: MemoryPalaceAIServiceType;
  }): void {
    if (services.zettelkasten) this.zettelkastenService = services.zettelkasten;
    if (services.feynman) this.feynmanService = services.feynman;
    if (services.memoryPalace) this.memoryPalaceService = services.memoryPalace;
  }

  /**
   * Create a comprehensive learning plan for a topic
   * Uses AI to design optimal learning path based on Polymath Stack
   */
  public async createLearningPlan(
    userId: string,
    goals: LearningGoals
  ): Promise<LearningPlan> {
    // Get user's archetype for personalization
    const archetype = this.userArchetypes.get(userId) || 'physicist';
    const archetypeInfo = POLYMATH_ARCHETYPES[archetype];

    // Generate learning phases using AI
    const phases = await this.generateLearningPhases(goals, archetypeInfo);

    // Calculate timeline
    const totalDays = phases.reduce((sum, phase) => sum + phase.estimatedDays, 0);
    const startDate = new Date();
    const estimatedEndDate = new Date(startDate);
    estimatedEndDate.setDate(estimatedEndDate.getDate() + totalDays);

    const plan: LearningPlan = {
      id: this.generateId(),
      userId,
      goals,
      phases,
      currentPhaseIndex: 0,
      startDate,
      estimatedEndDate,
      progress: {
        overallComprehension: 0,
        bloomLevelScores: {
          remember: 0, understand: 0, apply: 0,
          analyze: 0, evaluate: 0, create: 0
        },
        topicsCompleted: 0,
        totalTopics: goals.subtopics.length || 1,
        activitiesCompleted: 0,
        totalActivities: phases.reduce((sum, p) => sum + p.activities.length, 0),
        studyTimeMinutes: 0,
        streakDays: 0,
        strengthAreas: [],
        weakAreas: [],
        fsrsStats: null
      },
      adaptations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set first phase to in_progress
    if (plan.phases.length > 0) {
      plan.phases[0].status = 'in_progress';
    }

    this.learningPlans.set(plan.id, plan);
    this.saveData();
    return plan;
  }

  /**
   * Generate learning phases using AI
   */
  private async generateLearningPhases(
    goals: LearningGoals,
    archetype: typeof POLYMATH_ARCHETYPES[keyof typeof POLYMATH_ARCHETYPES]
  ): Promise<LearningPhase[]> {
    try {
      const prompt = `Create a structured learning plan for mastering "${goals.topic}".

User Profile:
- Learning Style: ${archetype.name} (${archetype.style})
- Techniques preferred: ${archetype.techniques.join(', ')}
- Goal type: ${goals.goalType}
- Timeframe: ${goals.timeframe}
- Daily study time: ${goals.dailyTimeMinutes} minutes
- Target comprehension: ${goals.targetComprehension}%

Subtopics to cover: ${goals.subtopics.join(', ')}

Include activities for:
${goals.includeFeynman ? '- Feynman Technique sessions' : ''}
${goals.includeMemoryPalace ? '- Memory Palace creation' : ''}
${goals.includeZettelkasten ? '- Zettelkasten note-taking' : ''}
- Spaced repetition reviews
- Dynamic quizzes

Generate 3-5 learning phases with specific activities.
Respond in JSON format:
{
  "phases": [
    {
      "name": "Phase name",
      "description": "What this phase achieves",
      "estimatedDays": 7,
      "objectives": ["objective 1", "objective 2"],
      "activities": [
        {
          "type": "lesson|quiz|feynman|memory_palace|zettelkasten|practice|review|reflection",
          "title": "Activity title",
          "description": "What to do",
          "estimatedMinutes": 30,
          "bloomLevels": ["remember", "understand"]
        }
      ],
      "assessments": [
        {
          "type": "quiz|feynman|project|self_assessment",
          "title": "Assessment title",
          "weight": 50,
          "minScore": 70
        }
      ],
      "completionCriteria": {
        "minComprehension": 70,
        "requiredActivities": ["activity_type"],
        "requiredAssessmentScore": 70
      }
    }
  ]
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.transformToLearningPhases(parsed.phases);
      }
    } catch (error) {
      console.warn('AI phase generation failed, using template:', error);
    }

    // Fallback to template-based phases
    return this.generateTemplatePhases(goals);
  }

  /**
   * Transform AI response to LearningPhase objects
   */
  private transformToLearningPhases(phases: any[]): LearningPhase[] {
    return phases.map((phase, index) => ({
      id: this.generateId(),
      name: phase.name || `Phase ${index + 1}`,
      description: phase.description || '',
      order: index,
      estimatedDays: phase.estimatedDays || 7,
      objectives: phase.objectives || [],
      activities: (phase.activities || []).map((a: any) => ({
        id: this.generateId(),
        type: a.type || 'lesson',
        title: a.title || 'Activity',
        description: a.description || '',
        estimatedMinutes: a.estimatedMinutes || 30,
        resources: a.resources || [],
        bloomLevels: a.bloomLevels || ['understand'],
        prerequisites: a.prerequisites || [],
        status: 'pending' as const
      })),
      assessments: (phase.assessments || []).map((a: any) => ({
        id: this.generateId(),
        type: a.type || 'quiz',
        title: a.title || 'Assessment',
        description: a.description || '',
        weight: a.weight || 100,
        minScore: a.minScore || 70,
        status: 'pending' as const
      })),
      completionCriteria: phase.completionCriteria || {
        minComprehension: 70,
        requiredActivities: [],
        requiredAssessmentScore: 70
      },
      status: 'pending' as const
    }));
  }

  /**
   * Generate template-based phases as fallback
   */
  private generateTemplatePhases(goals: LearningGoals): LearningPhase[] {
    const phases: LearningPhase[] = [
      {
        id: this.generateId(),
        name: 'Foundation',
        description: `Build foundational understanding of ${goals.topic}`,
        order: 0,
        estimatedDays: 7,
        objectives: [
          `Understand core concepts of ${goals.topic}`,
          'Build vocabulary and basic framework',
          'Create initial Zettelkasten notes'
        ],
        activities: [
          {
            id: this.generateId(),
            type: 'lesson',
            title: `Introduction to ${goals.topic}`,
            description: 'Overview of key concepts and structure',
            estimatedMinutes: 45,
            resources: [],
            bloomLevels: ['remember', 'understand'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'zettelkasten',
            title: 'Create Foundation Notes',
            description: 'Document key concepts in Zettelkasten format',
            estimatedMinutes: 30,
            resources: [],
            bloomLevels: ['understand'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'quiz',
            title: 'Foundation Quiz',
            description: 'Test basic understanding',
            estimatedMinutes: 20,
            resources: [],
            bloomLevels: ['remember', 'understand'],
            prerequisites: [],
            status: 'pending'
          }
        ],
        assessments: [
          {
            id: this.generateId(),
            type: 'quiz',
            title: 'Foundation Assessment',
            description: 'Comprehensive quiz on foundational concepts',
            weight: 100,
            minScore: 70,
            status: 'pending'
          }
        ],
        completionCriteria: {
          minComprehension: 60,
          requiredActivities: ['lesson', 'quiz'],
          requiredAssessmentScore: 70
        },
        status: 'pending'
      },
      {
        id: this.generateId(),
        name: 'Deepening',
        description: `Develop deeper understanding and application skills`,
        order: 1,
        estimatedDays: 14,
        objectives: [
          'Apply concepts to practical scenarios',
          'Build connections between ideas',
          'Develop Memory Palace for key principles'
        ],
        activities: [
          {
            id: this.generateId(),
            type: 'lesson',
            title: `Advanced ${goals.topic}`,
            description: 'Deeper dive into complex topics',
            estimatedMinutes: 60,
            resources: [],
            bloomLevels: ['understand', 'apply'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'feynman',
            title: 'Feynman Explanation',
            description: 'Explain core concepts as if teaching',
            estimatedMinutes: 30,
            resources: [],
            bloomLevels: ['understand', 'apply'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'memory_palace',
            title: 'Build Memory Palace',
            description: 'Create memory palace for key principles',
            estimatedMinutes: 45,
            resources: [],
            bloomLevels: ['remember'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'practice',
            title: 'Application Practice',
            description: 'Apply concepts to real problems',
            estimatedMinutes: 45,
            resources: [],
            bloomLevels: ['apply', 'analyze'],
            prerequisites: [],
            status: 'pending'
          }
        ],
        assessments: [
          {
            id: this.generateId(),
            type: 'feynman',
            title: 'Feynman Assessment',
            description: 'Explain a concept clearly to demonstrate understanding',
            weight: 50,
            minScore: 75,
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'quiz',
            title: 'Application Quiz',
            description: 'Test ability to apply concepts',
            weight: 50,
            minScore: 70,
            status: 'pending'
          }
        ],
        completionCriteria: {
          minComprehension: 75,
          requiredActivities: ['feynman', 'memory_palace'],
          requiredAssessmentScore: 70
        },
        status: 'pending'
      },
      {
        id: this.generateId(),
        name: 'Mastery',
        description: 'Achieve mastery through synthesis and creation',
        order: 2,
        estimatedDays: 14,
        objectives: [
          'Synthesize knowledge across domains',
          'Create original work using learned concepts',
          'Achieve high retention through spaced repetition'
        ],
        activities: [
          {
            id: this.generateId(),
            type: 'review',
            title: 'Spaced Repetition Review',
            description: 'Review all FSRS cards',
            estimatedMinutes: 30,
            resources: [],
            bloomLevels: ['remember'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'practice',
            title: 'Cross-Domain Application',
            description: 'Apply concepts to new domains',
            estimatedMinutes: 60,
            resources: [],
            bloomLevels: ['analyze', 'evaluate'],
            prerequisites: [],
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'reflection',
            title: 'Learning Synthesis',
            description: 'Reflect on and synthesize all learning',
            estimatedMinutes: 30,
            resources: [],
            bloomLevels: ['evaluate', 'create'],
            prerequisites: [],
            status: 'pending'
          }
        ],
        assessments: [
          {
            id: this.generateId(),
            type: 'project',
            title: 'Mastery Project',
            description: 'Create something original using learned concepts',
            weight: 60,
            minScore: 80,
            status: 'pending'
          },
          {
            id: this.generateId(),
            type: 'self_assessment',
            title: 'Self-Assessment',
            description: 'Evaluate your own mastery level',
            weight: 40,
            minScore: 80,
            status: 'pending'
          }
        ],
        completionCriteria: {
          minComprehension: 85,
          requiredActivities: ['review', 'reflection'],
          requiredAssessmentScore: 80
        },
        status: 'pending'
      }
    ];

    return phases;
  }

  /**
   * Generate an adaptive quiz for the current learning state
   * Uses reinforcement learning to select optimal quiz parameters
   */
  public async generateAdaptiveQuiz(
    userId: string,
    topic: string,
    options?: {
      questionCount?: number;
      focusAreas?: BloomLevel[];
    }
  ): Promise<DynamicQuiz> {
    // Get RL recommendation for quiz method
    const archetype = this.getUserArchetype(userId) || 'physicist';
    const rlRecommendation = this.rlService.recommendMethod(userId, {
      topic,
      userArchetype: archetype,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
      energyLevel: 7, // Default, could be from user input
      previousSuccess: true,
      topicDifficulty: 5
    });
    
    // Record that we're using quiz method
    // (The actual outcome will be recorded after quiz completion)
    // Get user's current progress
    const userPlans = Array.from(this.learningPlans.values())
      .filter(p => p.userId === userId);
    
    // Determine weak areas to focus on
    let bloomDistribution = undefined;
    const latestPlan = userPlans[userPlans.length - 1];
    
    if (latestPlan && options?.focusAreas) {
      bloomDistribution = {
        remember: options.focusAreas.includes('remember') ? 0.3 : 0.1,
        understand: options.focusAreas.includes('understand') ? 0.3 : 0.15,
        apply: options.focusAreas.includes('apply') ? 0.3 : 0.2,
        analyze: options.focusAreas.includes('analyze') ? 0.3 : 0.15,
        evaluate: options.focusAreas.includes('evaluate') ? 0.3 : 0.1,
        create: options.focusAreas.includes('create') ? 0.3 : 0.1
      };
    }

    return this.quizService.generateQuiz(topic, {
      questionCount: options?.questionCount || 10,
      bloomDistribution,
      includeMnemonics: true,
      fsrsIntegration: true
    });
  }

  /**
   * Assess user's comprehension across multiple dimensions
   */
  public async assessComprehension(
    userId: string,
    topic: string
  ): Promise<ComprehensionReport> {
    // Gather data from various sources
    const fsrsStats = this.fsrsService.getStatistics();
    const quizAttempts = this.quizService.getUserAttempts(userId);
    
    // Calculate dimension scores
    const recentAttempts = quizAttempts
      .filter(a => Date.now() - a.startTime.getTime() < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .slice(-10);

    // Aggregate Bloom scores from quiz attempts
    const bloomTotals: Record<BloomLevel, { sum: number; count: number }> = {
      remember: { sum: 0, count: 0 },
      understand: { sum: 0, count: 0 },
      apply: { sum: 0, count: 0 },
      analyze: { sum: 0, count: 0 },
      evaluate: { sum: 0, count: 0 },
      create: { sum: 0, count: 0 }
    };

    for (const attempt of recentAttempts) {
      const analysis = attempt.comprehensionAnalysis;
      for (const [level, score] of Object.entries(analysis.bloomScores)) {
        bloomTotals[level as BloomLevel].sum += score;
        bloomTotals[level as BloomLevel].count++;
      }
    }

    // Map to comprehension dimensions
    const dimensions = {
      memory: bloomTotals.remember.count > 0 
        ? bloomTotals.remember.sum / bloomTotals.remember.count 
        : fsrsStats.averageRetention * 100,
      understanding: bloomTotals.understand.count > 0
        ? bloomTotals.understand.sum / bloomTotals.understand.count
        : 50,
      application: bloomTotals.apply.count > 0
        ? bloomTotals.apply.sum / bloomTotals.apply.count
        : 50,
      analysis: bloomTotals.analyze.count > 0
        ? bloomTotals.analyze.sum / bloomTotals.analyze.count
        : 50,
      synthesis: bloomTotals.evaluate.count > 0
        ? (bloomTotals.evaluate.sum / bloomTotals.evaluate.count + 
           bloomTotals.create.sum / Math.max(1, bloomTotals.create.count)) / 2
        : 50,
      creation: bloomTotals.create.count > 0
        ? bloomTotals.create.sum / bloomTotals.create.count
        : 50
    };

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      dimensions.memory * 0.15 +
      dimensions.understanding * 0.25 +
      dimensions.application * 0.25 +
      dimensions.analysis * 0.15 +
      dimensions.synthesis * 0.10 +
      dimensions.creation * 0.10
    );

    // Determine trend (compare to previous assessment)
    const previousReports = this.progressHistory.get(userId) || [];
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (previousReports.length > 0) {
      const lastReport = previousReports[previousReports.length - 1];
      if (lastReport.averageQuizScore) {
        const change = overallScore - lastReport.averageQuizScore;
        if (change > 5) trend = 'improving';
        else if (change < -5) trend = 'declining';
      }
    }

    // Generate recommendations
    const recommendations = await this.generateRecommendations(dimensions, fsrsStats);
    const nextSteps = this.suggestNextSteps(userId, dimensions);

    return {
      userId,
      topic,
      timestamp: new Date(),
      dimensions,
      overallScore,
      trend,
      recommendations,
      nextSteps
    };
  }

  /**
   * Generate AI-powered recommendations based on comprehension
   */
  private async generateRecommendations(
    dimensions: ComprehensionReport['dimensions'],
    fsrsStats: FSRSStatistics
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Memory recommendations
    if (dimensions.memory < 70) {
      recommendations.push('Increase spaced repetition review frequency');
      if (fsrsStats.dueToday > 0) {
        recommendations.push(`Review ${fsrsStats.dueToday} cards due today`);
      }
    }

    // Understanding recommendations
    if (dimensions.understanding < 70) {
      recommendations.push('Use Feynman Technique to deepen understanding');
      recommendations.push('Create more Zettelkasten notes connecting concepts');
    }

    // Application recommendations
    if (dimensions.application < 70) {
      recommendations.push('Focus on practical exercises and real-world applications');
      recommendations.push('Solve more applied problems');
    }

    // Analysis recommendations
    if (dimensions.analysis < 70) {
      recommendations.push('Practice identifying patterns and relationships');
      recommendations.push('Create mind maps to visualize connections');
    }

    // Synthesis recommendations
    if (dimensions.synthesis < 70) {
      recommendations.push('Connect concepts across different domains');
      recommendations.push('Look for analogies with other fields');
    }

    // Creation recommendations
    if (dimensions.creation < 70) {
      recommendations.push('Create original content or projects using learned concepts');
      recommendations.push('Teach someone else what you learned');
    }

    // Add AI-generated recommendation
    try {
      const prompt = `Based on these comprehension scores:
- Memory: ${dimensions.memory}%
- Understanding: ${dimensions.understanding}%
- Application: ${dimensions.application}%
- Analysis: ${dimensions.analysis}%
- Synthesis: ${dimensions.synthesis}%
- Creation: ${dimensions.creation}%

What is the single most impactful thing this learner should do next? Be specific and actionable.`;

      const response = await this.llmService.generateQuickResponse(prompt);
      if (response.content) {
        recommendations.unshift(response.content.slice(0, 200));
      }
    } catch (error) {
      console.warn('AI recommendation generation failed:', error);
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Suggest next learning steps based on current state
   */
  public suggestNextSteps(
    userId: string,
    dimensions?: ComprehensionReport['dimensions']
  ): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];
    const fsrsStats = this.fsrsService.getStatistics();

    // Always check for due reviews
    if (fsrsStats.dueToday > 0) {
      recommendations.push({
        type: 'review',
        title: 'Spaced Repetition Review',
        description: `You have ${fsrsStats.dueToday} cards due for review`,
        priority: 'high',
        estimatedMinutes: Math.min(30, fsrsStats.dueToday * 1),
        reason: 'Maintaining memory strength is crucial for long-term retention'
      });
    }

    // Check learning plans
    const userPlans = Array.from(this.learningPlans.values())
      .filter(p => p.userId === userId);
    
    for (const plan of userPlans) {
      const currentPhase = plan.phases[plan.currentPhaseIndex];
      if (currentPhase && currentPhase.status === 'in_progress') {
        const pendingActivities = currentPhase.activities.filter(a => a.status === 'pending');
        if (pendingActivities.length > 0) {
          const nextActivity = pendingActivities[0];
          recommendations.push({
            type: nextActivity.type as any,
            title: nextActivity.title,
            description: nextActivity.description,
            priority: 'high',
            estimatedMinutes: nextActivity.estimatedMinutes,
            reason: `Continue ${currentPhase.name} phase`,
            activityId: nextActivity.id
          });
        }
      }
    }

    // Dimension-based recommendations
    if (dimensions) {
      const weakestDimension = Object.entries(dimensions)
        .sort(([, a], [, b]) => a - b)[0];
      
      if (weakestDimension[1] < 60) {
        const dimensionRecommendations: Record<string, LearningRecommendation> = {
          memory: {
            type: 'review',
            title: 'Memory Palace Review',
            description: 'Review your Memory Palace to strengthen recall',
            priority: 'medium',
            estimatedMinutes: 15,
            reason: 'Memory is your weakest area'
          },
          understanding: {
            type: 'practice',
            title: 'Feynman Technique Session',
            description: 'Explain concepts in simple terms to deepen understanding',
            priority: 'medium',
            estimatedMinutes: 20,
            reason: 'Understanding needs improvement'
          },
          application: {
            type: 'practice',
            title: 'Practice Problems',
            description: 'Work through practical application exercises',
            priority: 'medium',
            estimatedMinutes: 30,
            reason: 'Application skills need development'
          },
          analysis: {
            type: 'practice',
            title: 'Pattern Analysis Exercise',
            description: 'Analyze and compare different concepts',
            priority: 'medium',
            estimatedMinutes: 25,
            reason: 'Analysis abilities need strengthening'
          },
          synthesis: {
            type: 'practice',
            title: 'Cross-Domain Connection',
            description: 'Find connections between this topic and other domains',
            priority: 'medium',
            estimatedMinutes: 20,
            reason: 'Synthesis skills need improvement'
          },
          creation: {
            type: 'practice',
            title: 'Creative Project',
            description: 'Create something original using learned concepts',
            priority: 'medium',
            estimatedMinutes: 45,
            reason: 'Creative application needs development'
          }
        };

        const rec = dimensionRecommendations[weakestDimension[0]];
        if (rec) {
          recommendations.push(rec);
        }
      }
    }

    // Add break recommendation if studied for a while
    const lastStudyTime = this.getLastStudyTime(userId);
    if (lastStudyTime && (Date.now() - lastStudyTime.getTime()) < 60 * 60 * 1000) {
      // Studied within last hour
      recommendations.push({
        type: 'break',
        title: 'Take a Break',
        description: 'Let your brain consolidate. Take a 10-15 minute break.',
        priority: 'low',
        estimatedMinutes: 15,
        reason: 'Regular breaks improve learning efficiency'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Get user's learning archetype
   */
  public getUserArchetype(userId: string): LearningStyleArchetype | null {
    return this.userArchetypes.get(userId) || null;
  }

  /**
   * Set user's learning archetype
   */
  public setUserArchetype(userId: string, archetype: LearningStyleArchetype): void {
    this.userArchetypes.set(userId, archetype);
    this.saveData();
  }

  /**
   * Get archetype information
   */
  public getArchetypeInfo(archetype: LearningStyleArchetype) {
    return POLYMATH_ARCHETYPES[archetype];
  }

  /**
   * Get all archetypes
   */
  public getAllArchetypes() {
    return POLYMATH_ARCHETYPES;
  }

  /**
   * Get learning plan by ID
   */
  public getLearningPlan(planId: string): LearningPlan | undefined {
    return this.learningPlans.get(planId);
  }

  /**
   * Get user's learning plans
   */
  public getUserLearningPlans(userId: string): LearningPlan[] {
    return Array.from(this.learningPlans.values())
      .filter(p => p.userId === userId);
  }

  /**
   * Update activity status
   */
  public updateActivityStatus(
    planId: string,
    phaseId: string,
    activityId: string,
    status: LearningActivity['status'],
    performance?: LearningActivity['performance']
  ): boolean {
    const plan = this.learningPlans.get(planId);
    if (!plan) return false;

    const phase = plan.phases.find(p => p.id === phaseId);
    if (!phase) return false;

    const activity = phase.activities.find(a => a.id === activityId);
    if (!activity) return false;

    activity.status = status;
    if (status === 'completed') {
      activity.completedAt = new Date();
      plan.progress.activitiesCompleted++;
    }
    if (performance) {
      activity.performance = performance;
      plan.progress.studyTimeMinutes += performance.timeSpent;
    }

    plan.updatedAt = new Date();
    this.saveData();
    return true;
  }

  /**
   * Generate progress report for a period
   */
  public async generateProgressReport(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<ProgressReport> {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Gather metrics
    const userPlans = this.getUserLearningPlans(userId);
    const quizAttempts = this.quizService.getUserAttempts(userId)
      .filter(a => a.startTime >= startDate);
    const fsrsStats = this.fsrsService.getStatistics();

    // Calculate study time from plans
    let studyTimeMinutes = 0;
    let activitiesCompleted = 0;
    
    for (const plan of userPlans) {
      for (const phase of plan.phases) {
        for (const activity of phase.activities) {
          if (activity.completedAt && activity.completedAt >= startDate) {
            activitiesCompleted++;
            studyTimeMinutes += activity.performance?.timeSpent || activity.estimatedMinutes;
          }
        }
      }
    }

    // Calculate quiz metrics
    const quizzesCompleted = quizAttempts.length;
    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.percentCorrect, 0) / quizAttempts.length
      : 0;

    // Generate insights using AI
    let insights: string[] = [];
    let areasForImprovement: string[] = [];

    try {
      const prompt = `Based on this learning data for the past ${period}:
- Study time: ${studyTimeMinutes} minutes
- Activities completed: ${activitiesCompleted}
- Quizzes completed: ${quizzesCompleted}
- Average quiz score: ${averageQuizScore.toFixed(1)}%
- FSRS retention: ${(fsrsStats.averageRetention * 100).toFixed(1)}%
- Streak days: ${fsrsStats.streakDays}

Provide 2-3 insights about their learning and 2-3 areas for improvement.
Respond in JSON: {"insights": ["..."], "improvements": ["..."]}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || [];
        areasForImprovement = parsed.improvements || [];
      }
    } catch (error) {
      insights = ['Keep up the consistent study!'];
      areasForImprovement = ['Consider increasing review frequency'];
    }

    const report: ProgressReport = {
      userId,
      period,
      startDate,
      endDate: now,
      studyTimeMinutes,
      activitiesCompleted,
      quizzesCompleted,
      averageQuizScore,
      feynmanSessionsCompleted: 0, // Would come from FeynmanService
      notesCreated: 0, // Would come from ZettelkastenService
      memoriesStrengthened: fsrsStats.reviewsToday,
      comprehensionChange: 0, // Calculate from previous report
      achievements: this.calculateAchievements(studyTimeMinutes, activitiesCompleted, fsrsStats),
      insights,
      areasForImprovement
    };

    // Store report
    const userReports = this.progressHistory.get(userId) || [];
    userReports.push(report);
    this.progressHistory.set(userId, userReports);
    this.saveData();

    return report;
  }

  /**
   * Calculate achievements based on metrics
   */
  private calculateAchievements(
    studyTime: number,
    activities: number,
    fsrsStats: FSRSStatistics
  ): string[] {
    const achievements: string[] = [];

    if (studyTime >= 60) achievements.push('Hour of Power: Studied for 1+ hour');
    if (studyTime >= 300) achievements.push('Marathon Learner: 5+ hours of study');
    if (activities >= 10) achievements.push('Activity Champion: 10+ activities completed');
    if (fsrsStats.streakDays >= 7) achievements.push('Week Warrior: 7-day streak');
    if (fsrsStats.streakDays >= 30) achievements.push('Monthly Master: 30-day streak');
    if (fsrsStats.averageRetention >= 0.9) achievements.push('Memory Master: 90%+ retention');

    return achievements;
  }

  /**
   * Get last study time for user
   */
  private getLastStudyTime(userId: string): Date | null {
    const plans = this.getUserLearningPlans(userId);
    let lastStudy: Date | null = null;

    for (const plan of plans) {
      for (const phase of plan.phases) {
        for (const activity of phase.activities) {
          if (activity.completedAt) {
            if (!lastStudy || activity.completedAt > lastStudy) {
              lastStudy = activity.completedAt;
            }
          }
        }
      }
    }

    return lastStudy;
  }

  // Utility methods
  private generateId(): string {
    return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveData(): void {
    try {
      const plansData = Array.from(this.learningPlans.entries());
      const historyData = Array.from(this.progressHistory.entries());
      const archetypesData = Array.from(this.userArchetypes.entries());

      localStorage.setItem('polymath_learning_plans', JSON.stringify(plansData));
      localStorage.setItem('polymath_progress_history', JSON.stringify(historyData));
      localStorage.setItem('polymath_user_archetypes', JSON.stringify(archetypesData));
    } catch (error) {
      console.error('Error saving Genius Professor data:', error);
    }
  }

  private loadData(): void {
    try {
      const plansData = localStorage.getItem('polymath_learning_plans');
      const historyData = localStorage.getItem('polymath_progress_history');
      const archetypesData = localStorage.getItem('polymath_user_archetypes');

      if (plansData) {
        const parsed = JSON.parse(plansData);
        for (const [id, plan] of parsed) {
          plan.startDate = new Date(plan.startDate);
          plan.estimatedEndDate = new Date(plan.estimatedEndDate);
          plan.createdAt = new Date(plan.createdAt);
          plan.updatedAt = new Date(plan.updatedAt);
          for (const phase of plan.phases) {
            if (phase.completedAt) phase.completedAt = new Date(phase.completedAt);
            for (const activity of phase.activities) {
              if (activity.completedAt) activity.completedAt = new Date(activity.completedAt);
            }
            for (const assessment of phase.assessments) {
              if (assessment.completedAt) assessment.completedAt = new Date(assessment.completedAt);
            }
          }
          for (const adaptation of plan.adaptations) {
            adaptation.timestamp = new Date(adaptation.timestamp);
          }
          this.learningPlans.set(id, plan);
        }
      }

      if (historyData) {
        const parsed = JSON.parse(historyData);
        for (const [userId, reports] of parsed) {
          for (const report of reports) {
            report.startDate = new Date(report.startDate);
            report.endDate = new Date(report.endDate);
          }
          this.progressHistory.set(userId, reports);
        }
      }

      if (archetypesData) {
        const parsed = JSON.parse(archetypesData);
        for (const [userId, archetype] of parsed) {
          this.userArchetypes.set(userId, archetype);
        }
      }
    } catch (error) {
      console.error('Error loading Genius Professor data:', error);
    }
  }
}

