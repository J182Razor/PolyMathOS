/**
 * Session Orchestrator Service
 * Coordinates all PolyMathOS features to create complete, customized learning experiences
 */

import { PolymathAIService, PolymathUser, SessionType } from './PolymathAIService';
import { LLMService } from './LLMService';
import { EnhancedSpacedRepetitionService } from './EnhancedSpacedRepetitionService';
import { RewardPredictionErrorService } from './RewardPredictionErrorService';
import { InterleavingService } from './InterleavingService';
import { DARPALearningService } from './DARPALearningService';
import { LearningStateService } from './LearningStateService';
import { NeuroAILessonService } from './NeuroAILessonService';

export interface LearningStep {
  id: string;
  type: 'brainwave' | 'image_streaming' | 'memory_palace' | 'flashcard' | 'mind_map' | 'deep_work' | 'triz' | 'cross_domain' | 'reflection' | 'lesson' | 'assessment';
  title: string;
  description: string;
  duration: number; // minutes
  content?: any;
  config?: Record<string, any>;
  order: number;
}

export interface LearningSession {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number; // 1-10
  estimatedDuration: number; // minutes
  steps: LearningStep[];
  learningStyle: string;
  objectives: string[];
  prerequisites: string[];
  createdAt: Date;
  completedAt?: Date;
  status: 'draft' | 'active' | 'completed' | 'paused';
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'foundational' | 'advanced' | 'synthesis' | 'mastery' | 'creative';
  steps: Omit<LearningStep, 'id' | 'order'>[];
  estimatedDuration: number;
  difficulty: number;
}

export class SessionOrchestratorService {
  private static instance: SessionOrchestratorService;
  private llmService: LLMService;
  private aiService: PolymathAIService;
  private templates: SessionTemplate[] = [];

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.aiService = PolymathAIService.getInstance();
    this.initializeTemplates();
  }

  public static getInstance(): SessionOrchestratorService {
    if (!SessionOrchestratorService.instance) {
      SessionOrchestratorService.instance = new SessionOrchestratorService();
    }
    return SessionOrchestratorService.instance;
  }

  /**
   * Create a complete, customized learning session
   */
  public async createCustomSession(
    user: PolymathUser,
    request: {
      topic: string;
      domain: string;
      duration?: number;
      learningStyle?: string;
      objectives?: string[];
      includeBrainwave?: boolean;
      includeImageStreaming?: boolean;
      includeMemoryPalace?: boolean;
      includeFlashcards?: boolean;
      includeMindMap?: boolean;
      includeDeepWork?: boolean;
      includeTRIZ?: boolean;
      includeCrossDomain?: boolean;
      includeReflection?: boolean;
    }
  ): Promise<LearningSession> {
    const sessionId = this.generateId();
    const steps: LearningStep[] = [];
    let stepOrder = 0;

    // 1. Brainwave Entrainment (if requested)
    if (request.includeBrainwave !== false) {
      steps.push({
        id: this.generateId(),
        type: 'brainwave',
        title: 'Brainwave Entrainment',
        description: `Prepare your mind for ${request.topic} learning`,
        duration: 5,
        config: {
          frequency: this.getOptimalFrequency(request.domain),
          type: 'binaural',
        },
        order: stepOrder++,
      });
    }

    // 2. Image Streaming (if requested)
    if (request.includeImageStreaming !== false) {
      steps.push({
        id: this.generateId(),
        type: 'image_streaming',
        title: 'Consciousness Expansion',
        description: `Activate creative pathways for ${request.topic}`,
        duration: 10,
        config: {
          topic: request.topic,
        },
        order: stepOrder++,
      });
    }

    // 3. Generate Lesson Content
    const lessonContent = await this.generateLessonContent(request.topic, request.domain, user);
    steps.push({
      id: this.generateId(),
      type: 'lesson',
      title: `Learn: ${request.topic}`,
      description: lessonContent.summary,
      duration: Math.min(request.duration || 30, 60),
      content: lessonContent,
      order: stepOrder++,
    });

    // 4. Memory Palace (if requested)
    if (request.includeMemoryPalace !== false) {
      const memoryPalaceContent = await this.generateMemoryPalaceContent(request.topic, lessonContent);
      steps.push({
        id: this.generateId(),
        type: 'memory_palace',
        title: 'Memory Palace Construction',
        description: `Store ${request.topic} in spatial memory`,
        duration: 15,
        content: memoryPalaceContent,
        order: stepOrder++,
      });
    }

    // 5. Flashcards (if requested)
    if (request.includeFlashcards !== false) {
      const flashcards = await this.generateFlashcards(request.topic, lessonContent);
      steps.push({
        id: this.generateId(),
        type: 'flashcard',
        title: 'Spaced Repetition Review',
        description: `Review key concepts from ${request.topic}`,
        duration: 20,
        content: { flashcards },
        order: stepOrder++,
      });
    }

    // 6. Mind Map (if requested)
    if (request.includeMindMap !== false) {
      const mindMapData = await this.generateMindMapData(request.topic, lessonContent);
      steps.push({
        id: this.generateId(),
        type: 'mind_map',
        title: 'Mind Map Creation',
        description: `Visualize connections in ${request.topic}`,
        duration: 15,
        content: mindMapData,
        order: stepOrder++,
      });
    }

    // 7. Deep Work (if requested)
    if (request.includeDeepWork !== false) {
      steps.push({
        id: this.generateId(),
        type: 'deep_work',
        title: 'Deep Practice Session',
        description: `Apply ${request.topic} through deliberate practice`,
        duration: 30,
        config: {
          topic: request.topic,
          difficulty: this.calculateDifficulty(user.level),
        },
        order: stepOrder++,
      });
    }

    // 8. TRIZ (if requested and applicable)
    if (request.includeTRIZ !== false && this.isTRIZApplicable(request.topic)) {
      steps.push({
        id: this.generateId(),
        type: 'triz',
        title: 'TRIZ Problem Solving',
        description: `Apply inventive principles to ${request.topic}`,
        duration: 20,
        config: {
          topic: request.topic,
        },
        order: stepOrder++,
      });
    }

    // 9. Cross-Domain Synthesis (if multiple domains)
    if (request.includeCrossDomain !== false && Object.keys(user.domains).length > 1) {
      steps.push({
        id: this.generateId(),
        type: 'cross_domain',
        title: 'Cross-Domain Synthesis',
        description: `Connect ${request.topic} across domains`,
        duration: 25,
        config: {
          primaryTopic: request.topic,
          domains: Object.keys(user.domains),
        },
        order: stepOrder++,
      });
    }

    // 10. Reflection (if requested)
    if (request.includeReflection !== false) {
      steps.push({
        id: this.generateId(),
        type: 'reflection',
        title: 'Reflection & Integration',
        description: `Reflect on your learning journey with ${request.topic}`,
        duration: 10,
        config: {
          topic: request.topic,
          prompts: await this.generateReflectionPrompts(request.topic),
        },
        order: stepOrder++,
      });
    }

    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    return {
      id: sessionId,
      title: `Complete Learning Session: ${request.topic}`,
      description: `A comprehensive learning experience covering ${request.topic}`,
      domain: request.domain,
      difficulty: this.calculateDifficulty(user.level),
      estimatedDuration: totalDuration,
      steps,
      learningStyle: request.learningStyle || user.learningStyle,
      objectives: request.objectives || await this.generateObjectives(request.topic),
      prerequisites: [],
      createdAt: new Date(),
      status: 'draft',
    };
  }

  /**
   * Generate lesson content using LLM
   */
  private async generateLessonContent(topic: string, domain: string, user: PolymathUser): Promise<any> {
    const prompt = `Create a comprehensive lesson on "${topic}" in the domain of ${domain}. 
    The learner is at level ${user.level} with a ${user.learningStyle} learning style.
    Include: key concepts, examples, applications, and connections to other domains.
    Format as structured content with sections, key points, and practice questions.`;

    try {
      const response = await this.llmService.generateLessonContent({
        topic,
        userProfile: {
          level: user.level,
          learningStyle: user.learningStyle,
          domains: Object.keys(user.domains),
        },
        context: `Domain: ${domain}, Level: ${user.level}`,
      });

      return {
        summary: response.content.substring(0, 200) + '...',
        fullContent: response.content,
        keyPoints: this.extractKeyPoints(response.content),
        questions: this.generateQuestions(response.content),
      };
    } catch (error) {
      console.error('Error generating lesson:', error);
      return {
        summary: `Introduction to ${topic}`,
        fullContent: `Learn about ${topic} in ${domain}.`,
        keyPoints: [`Understanding ${topic}`, `Applications of ${topic}`],
        questions: [`What is ${topic}?`, `How is ${topic} used?`],
      };
    }
  }

  /**
   * Generate memory palace content
   */
  private async generateMemoryPalaceContent(topic: string, lessonContent: any): Promise<any> {
    const prompt = `Create a memory palace structure for "${topic}". 
    Generate 10 distinct loci (locations) with vivid imagery and associations for each key concept.
    Format as: {loci: [{location: string, content: string, imagery: string}]}`;

    try {
      const response = await this.llmService.generateQuickResponse(prompt);
      // Parse response and structure as memory palace items
      return {
        topic,
        loci: lessonContent.keyPoints.map((point: string, index: number) => ({
          location: `Location ${index + 1}`,
          content: point,
          imagery: `Vivid imagery for ${point}`,
        })),
      };
    } catch (error) {
      return {
        topic,
        loci: lessonContent.keyPoints.map((point: string, index: number) => ({
          location: `Location ${index + 1}`,
          content: point,
          imagery: `Visual representation of ${point}`,
        })),
      };
    }
  }

  /**
   * Generate flashcards
   */
  private async generateFlashcards(topic: string, lessonContent: any): Promise<any[]> {
    const flashcards = lessonContent.keyPoints.map((point: string, index: number) => ({
      id: this.generateId(),
      question: `What is ${point}?`,
      answer: `Detailed explanation of ${point} related to ${topic}`,
      domain: topic,
      createdAt: new Date(),
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      confidenceRatings: [],
      lastCorrect: null,
    }));

    return flashcards;
  }

  /**
   * Generate mind map data
   */
  private async generateMindMapData(topic: string, lessonContent: any): Promise<any> {
    return {
      centralTopic: topic,
      mainBranches: lessonContent.keyPoints.map((point: string) => ({
        label: point,
        subBranches: [`Details about ${point}`, `Applications of ${point}`],
      })),
    };
  }

  /**
   * Generate reflection prompts
   */
  private async generateReflectionPrompts(topic: string): Promise<string[]> {
    return [
      `What was the most surprising thing you learned about ${topic}?`,
      `How does ${topic} connect to your other areas of study?`,
      `What questions do you still have about ${topic}?`,
      `How will you apply ${topic} in practice?`,
    ];
  }

  /**
   * Generate learning objectives
   */
  private async generateObjectives(topic: string): Promise<string[]> {
    return [
      `Understand core concepts of ${topic}`,
      `Apply ${topic} in practical scenarios`,
      `Connect ${topic} to other domains`,
      `Create original work using ${topic}`,
    ];
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): string[] {
    // Simple extraction - in production, use NLP
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    return sentences.slice(0, 5).map((s) => s.trim());
  }

  /**
   * Generate questions from content
   */
  private generateQuestions(content: string): string[] {
    return [
      'What are the key concepts?',
      'How do these concepts relate?',
      'What are practical applications?',
      'What questions remain?',
    ];
  }

  /**
   * Get optimal brainwave frequency for domain
   */
  private getOptimalFrequency(domain: string): string {
    const frequencyMap: Record<string, string> = {
      'Mathematics': 'beta',
      'Philosophy': 'alpha',
      'Creative Arts': 'theta',
      'Science': 'gamma',
      'default': 'alpha',
    };
    return frequencyMap[domain] || frequencyMap.default;
  }

  /**
   * Calculate difficulty based on user level
   */
  private calculateDifficulty(level: number): number {
    return Math.min(10, Math.max(1, Math.floor(level / 2) + 3));
  }

  /**
   * Check if TRIZ is applicable
   */
  private isTRIZApplicable(topic: string): boolean {
    const applicableKeywords = ['problem', 'solution', 'design', 'invention', 'innovation', 'system'];
    return applicableKeywords.some((keyword) => topic.toLowerCase().includes(keyword));
  }

  /**
   * Initialize session templates
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'foundational',
        name: 'Foundational Learning',
        description: 'Complete introduction to a new topic',
        category: 'foundational',
        estimatedDuration: 90,
        difficulty: 3,
        steps: [
          { type: 'brainwave', title: 'Brainwave Entrainment', description: 'Prepare mind', duration: 5 },
          { type: 'lesson', title: 'Core Concepts', description: 'Learn fundamentals', duration: 30 },
          { type: 'memory_palace', title: 'Memory Palace', description: 'Store knowledge', duration: 15 },
          { type: 'flashcard', title: 'Review', description: 'Spaced repetition', duration: 20 },
          { type: 'reflection', title: 'Reflection', description: 'Integrate learning', duration: 10 },
        ],
      },
      {
        id: 'advanced',
        name: 'Advanced Mastery',
        description: 'Deep dive into advanced concepts',
        category: 'advanced',
        estimatedDuration: 120,
        difficulty: 7,
        steps: [
          { type: 'image_streaming', title: 'Image Streaming', description: 'Activate creativity', duration: 10 },
          { type: 'lesson', title: 'Advanced Concepts', description: 'Deep learning', duration: 40 },
          { type: 'mind_map', title: 'Mind Map', description: 'Visualize connections', duration: 20 },
          { type: 'deep_work', title: 'Deep Practice', description: 'Deliberate practice', duration: 30 },
          { type: 'reflection', title: 'Reflection', description: 'Synthesize learning', duration: 10 },
        ],
      },
      {
        id: 'synthesis',
        name: 'Cross-Domain Synthesis',
        description: 'Connect concepts across domains',
        category: 'synthesis',
        estimatedDuration: 150,
        difficulty: 8,
        steps: [
          { type: 'brainwave', title: 'Brainwave Entrainment', description: 'Prepare', duration: 5 },
          { type: 'lesson', title: 'Multi-Domain Learning', description: 'Learn connections', duration: 35 },
          { type: 'cross_domain', title: 'Synthesis Project', description: 'Create connections', duration: 40 },
          { type: 'triz', title: 'TRIZ Application', description: 'Innovative solutions', duration: 25 },
          { type: 'reflection', title: 'Reflection', description: 'Integrate insights', duration: 15 },
        ],
      },
    ];
  }

  /**
   * Get available templates
   */
  public getTemplates(): SessionTemplate[] {
    return this.templates;
  }

  /**
   * Create session from template
   */
  public async createSessionFromTemplate(
    templateId: string,
    user: PolymathUser,
    topic: string,
    domain: string
  ): Promise<LearningSession> {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const steps: LearningStep[] = template.steps.map((step, index) => ({
      ...step,
      id: this.generateId(),
      order: index,
      content: step.type === 'lesson' ? { topic } : undefined,
    }));

    return {
      id: this.generateId(),
      title: `${template.name}: ${topic}`,
      description: template.description,
      domain,
      difficulty: template.difficulty,
      estimatedDuration: template.estimatedDuration,
      steps,
      learningStyle: user.learningStyle,
      objectives: await this.generateObjectives(topic),
      prerequisites: [],
      createdAt: new Date(),
      status: 'draft',
    };
  }

  /**
   * Execute a learning session step
   */
  public async executeStep(session: LearningSession, stepIndex: number): Promise<any> {
    const step = session.steps[stepIndex];
    if (!step) {
      throw new Error('Step not found');
    }

    // Route to appropriate handler based on step type
    switch (step.type) {
      case 'brainwave':
        return { type: 'navigate', target: 'brainwave_generator', config: step.config };
      case 'image_streaming':
        return { type: 'navigate', target: 'image_streaming', config: step.config };
      case 'memory_palace':
        return { type: 'navigate', target: 'memory_palace', content: step.content };
      case 'flashcard':
        return { type: 'navigate', target: 'flashcards', content: step.content };
      case 'mind_map':
        return { type: 'navigate', target: 'mind_map', content: step.content };
      case 'deep_work':
        return { type: 'navigate', target: 'deep_work', config: step.config };
      case 'triz':
        return { type: 'navigate', target: 'triz', config: step.config };
      case 'cross_domain':
        return { type: 'navigate', target: 'projects', config: step.config };
      case 'reflection':
        return { type: 'navigate', target: 'reflection', config: step.config };
      case 'lesson':
        return { type: 'display', content: step.content };
      default:
        return { type: 'unknown', step: step.type };
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

