interface AssessmentProfile {
  dopamineProfile: {
    motivationLevel: number;
    rewardSensitivity: number;
    goalOrientation: number;
    procrastinationTendency: number;
  };
  metaLearningSkills: {
    planningAbility: number;
    selfMonitoring: number;
    reflectionPractice: number;
    strategyAdaptation: number;
  };
  learningStylePreferences: {
    firstPrinciplesThinking: number;
    feynmanTechnique: number;
    observationalLearning: number;
    visualProcessing: number;
  };
  personalGoals: {
    primaryObjective: string;
    timeframe: string;
    motivationSource: string;
    successMetrics: string[];
  };
}

interface DopamineOptimizedLesson {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Dopamine Loading Elements
  anticipationHooks: string[];
  microRewards: MicroReward[];
  progressMilestones: ProgressMilestone[];
  surpriseElements: SurpriseElement[];
  
  // Meta-Learning Components
  planningPhase: PlanningPhase;
  monitoringCheckpoints: MonitoringCheckpoint[];
  reflectionPrompts: ReflectionPrompt[];
  
  // Genius Learning Methods
  firstPrinciplesBreakdown: FirstPrinciplesBreakdown;
  feynmanExplanationTasks: FeynmanTask[];
  observationalExercises: ObservationalExercise[];
  
  // Content Structure
  sections: LessonSection[];
  assessments: Assessment[];
  adaptiveElements: AdaptiveElement[];
}

interface MicroReward {
  trigger: string;
  type: 'visual' | 'audio' | 'text' | 'achievement';
  content: string;
  dopamineIntensity: 'low' | 'medium' | 'high';
}

interface ProgressMilestone {
  percentage: number;
  title: string;
  celebration: string;
  unlocks: string[];
}

interface SurpriseElement {
  triggerCondition: string;
  type: 'bonus_content' | 'easter_egg' | 'achievement' | 'insight';
  content: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface PlanningPhase {
  goalSetting: string[];
  strategySelection: string[];
  resourceIdentification: string[];
  timeEstimation: string;
}

interface MonitoringCheckpoint {
  position: number; // Percentage through lesson
  selfAssessmentQuestions: string[];
  comprehensionCheck: string;
  adjustmentSuggestions: string[];
}

interface ReflectionPrompt {
  timing: 'mid_lesson' | 'end_lesson' | 'post_session';
  questions: string[];
  metacognitiveFocus: 'strategy_effectiveness' | 'comprehension_gaps' | 'motivation_levels' | 'learning_preferences';
}

interface FirstPrinciplesBreakdown {
  complexConcept: string;
  fundamentalComponents: string[];
  assumptions: string[];
  coreQuestions: string[];
  reconstructionSteps: string[];
}

interface FeynmanTask {
  concept: string;
  targetAudience: string;
  simplificationChallenge: string;
  gapIdentificationPrompts: string[];
  refinementSteps: string[];
}

interface ObservationalExercise {
  subject: string;
  observationPrompts: string[];
  detailFocusAreas: string[];
  patternRecognitionTasks: string[];
  crossDomainConnections: string[];
}

interface LessonSection {
  id: string;
  title: string;
  type: 'introduction' | 'core_content' | 'practice' | 'application' | 'synthesis';
  content: string;
  interactiveElements: InteractiveElement[];
  dopamineTriggers: string[];
}

interface InteractiveElement {
  type: 'quiz' | 'simulation' | 'visualization' | 'exercise' | 'reflection';
  content: any;
  rewardMechanism: string;
}

interface Assessment {
  type: 'formative' | 'summative' | 'self_assessment';
  questions: AssessmentQuestion[];
  feedbackStrategy: 'immediate' | 'delayed' | 'adaptive';
  dopamineOptimization: boolean;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'open_ended' | 'practical' | 'explanation';
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  rewardTrigger: string;
}

interface AdaptiveElement {
  condition: string;
  modification: 'difficulty_adjustment' | 'content_variation' | 'pacing_change' | 'reward_frequency';
  implementation: string;
}

export class NeuroAILessonService {
  private static instance: NeuroAILessonService;
  
  public static getInstance(): NeuroAILessonService {
    if (!NeuroAILessonService.instance) {
      NeuroAILessonService.instance = new NeuroAILessonService();
    }
    return NeuroAILessonService.instance;
  }

  /**
   * Generate a personalized lesson based on user's cognitive assessment profile
   */
  public async generatePersonalizedLesson(
    topic: string,
    userProfile: AssessmentProfile,
    previousPerformance?: any
  ): Promise<DopamineOptimizedLesson> {
    
    // Analyze user's dopamine profile to optimize reward timing
    const rewardFrequency = this.calculateOptimalRewardFrequency(userProfile.dopamineProfile);
    const difficultyLevel = this.determineDifficultyLevel(userProfile, previousPerformance);
    
    // Generate dopamine-optimized content structure
    const anticipationHooks = this.generateAnticipationHooks(topic, userProfile);
    const microRewards = this.generateMicroRewards(userProfile.dopamineProfile, rewardFrequency);
    const progressMilestones = this.generateProgressMilestones(userProfile);
    const surpriseElements = this.generateSurpriseElements(topic, userProfile);
    
    // Create meta-learning components
    const planningPhase = this.generatePlanningPhase(topic, userProfile);
    const monitoringCheckpoints = this.generateMonitoringCheckpoints(userProfile.metaLearningSkills);
    const reflectionPrompts = this.generateReflectionPrompts(userProfile);
    
    // Apply genius learning methods
    const firstPrinciplesBreakdown = this.generateFirstPrinciplesBreakdown(topic, userProfile);
    const feynmanTasks = this.generateFeynmanTasks(topic, userProfile);
    const observationalExercises = this.generateObservationalExercises(topic, userProfile);
    
    // Generate adaptive content sections
    const sections = await this.generateLessonSections(topic, userProfile, difficultyLevel);
    const assessments = this.generateAdaptiveAssessments(topic, userProfile);
    const adaptiveElements = this.generateAdaptiveElements(userProfile);
    
    return {
      id: `lesson_${Date.now()}`,
      title: `${topic}: Personalized PolyMathOS Experience`,
      description: `AI-optimized lesson tailored to your unique cognitive profile and learning goals`,
      estimatedDuration: this.calculateOptimalDuration(userProfile),
      difficultyLevel,
      
      // Dopamine optimization
      anticipationHooks,
      microRewards,
      progressMilestones,
      surpriseElements,
      
      // Meta-learning integration
      planningPhase,
      monitoringCheckpoints,
      reflectionPrompts,
      
      // Genius methods
      firstPrinciplesBreakdown,
      feynmanExplanationTasks: feynmanTasks,
      observationalExercises,
      
      // Content structure
      sections,
      assessments,
      adaptiveElements
    };
  }

  private calculateOptimalRewardFrequency(dopamineProfile: AssessmentProfile['dopamineProfile']): number {
    // Higher reward sensitivity = more frequent micro-rewards
    // Lower motivation = more frequent encouragement
    const baseFrequency = 0.2; // Every 20% by default
    
    const sensitivityMultiplier = dopamineProfile.rewardSensitivity / 5;
    const motivationAdjustment = (6 - dopamineProfile.motivationLevel) / 10;
    
    return Math.max(0.1, baseFrequency * sensitivityMultiplier + motivationAdjustment);
  }

  private determineDifficultyLevel(
    userProfile: AssessmentProfile, 
    previousPerformance?: any
  ): 'beginner' | 'intermediate' | 'advanced' {
    // Consider meta-learning skills and previous performance
    const metaLearningAverage = Object.values(userProfile.metaLearningSkills).reduce((a, b) => a + b, 0) / 4;
    
    if (metaLearningAverage >= 4) return 'advanced';
    if (metaLearningAverage >= 3) return 'intermediate';
    return 'beginner';
  }

  private generateAnticipationHooks(topic: string, userProfile: AssessmentProfile): string[] {
    const hooks = [
      `Discover the hidden patterns in ${topic} that experts use but rarely share`,
      `Uncover the surprising connection between ${topic} and your personal goals`,
      `Learn the counterintuitive truth about ${topic} that will change your perspective`,
      `Master the secret technique that makes ${topic} 10x easier to understand`
    ];
    
    // Personalize based on motivation source
    if (userProfile.personalGoals.motivationSource.toLowerCase().includes('career')) {
      hooks.push(`See how ${topic} can accelerate your career advancement`);
    }
    
    return hooks.slice(0, 2); // Return 2 most relevant hooks
  }

  private generateMicroRewards(
    dopamineProfile: AssessmentProfile['dopamineProfile'], 
    frequency: number
  ): MicroReward[] {
    const rewards: MicroReward[] = [];
    const rewardTypes = ['visual', 'text', 'achievement'] as const;
    
    // Generate rewards based on sensitivity level
    const intensity = dopamineProfile.rewardSensitivity >= 4 ? 'high' : 
                     dopamineProfile.rewardSensitivity >= 3 ? 'medium' : 'low';
    
    for (let i = 0; i < 10; i++) {
      rewards.push({
        trigger: `progress_${i * 10}%`,
        type: rewardTypes[i % rewardTypes.length],
        content: this.getRewardContent(rewardTypes[i % rewardTypes.length], intensity),
        dopamineIntensity: intensity
      });
    }
    
    return rewards;
  }

  private getRewardContent(type: 'visual' | 'text' | 'achievement', intensity: string): string {
    const content = {
      visual: {
        low: '✓ Progress made',
        medium: '🎯 Great progress!',
        high: '🚀 Excellent work! You\'re on fire!'
      },
      text: {
        low: 'Nice work',
        medium: 'You\'re making great progress!',
        high: 'Outstanding! Your brain is forming new neural pathways!'
      },
      achievement: {
        low: 'Milestone reached',
        medium: 'Achievement unlocked: Quick Learner',
        high: 'LEGENDARY: Neural Network Master!'
      }
    };
    
    return content[type][intensity as keyof typeof content[typeof type]];
  }

  private generateProgressMilestones(userProfile: AssessmentProfile): ProgressMilestone[] {
    return [
      {
        percentage: 25,
        title: 'Foundation Builder',
        celebration: 'You\'ve mastered the fundamentals! Your brain is building strong neural foundations.',
        unlocks: ['Advanced concepts preview', 'Bonus practice exercises']
      },
      {
        percentage: 50,
        title: 'Pattern Recognizer',
        celebration: 'Halfway there! You\'re starting to see the deeper patterns.',
        unlocks: ['Cross-domain connections', 'Expert insights']
      },
      {
        percentage: 75,
        title: 'Synthesis Master',
        celebration: 'Incredible progress! You\'re connecting ideas like a true expert.',
        unlocks: ['Advanced applications', 'Teaching challenges']
      },
      {
        percentage: 100,
        title: 'Neural Network Complete',
        celebration: 'Congratulations! You\'ve built a complete understanding. Your brain has formed lasting neural pathways.',
        unlocks: ['Next level content', 'Mentor status', 'Advanced challenges']
      }
    ];
  }

  private generateSurpriseElements(topic: string, userProfile: AssessmentProfile): SurpriseElement[] {
    return [
      {
        triggerCondition: 'high_engagement_streak',
        type: 'bonus_content',
        content: `Exclusive insight: How ${topic} connects to cutting-edge research`,
        rarity: 'rare'
      },
      {
        triggerCondition: 'perfect_assessment_score',
        type: 'achievement',
        content: 'GENIUS MODE ACTIVATED: You\'re thinking like the masters!',
        rarity: 'legendary'
      },
      {
        triggerCondition: 'curiosity_question_asked',
        type: 'easter_egg',
        content: 'Hidden knowledge unlocked: The story behind this discovery',
        rarity: 'common'
      }
    ];
  }

  private generatePlanningPhase(topic: string, userProfile: AssessmentProfile): PlanningPhase {
    return {
      goalSetting: [
        `Define what mastery of ${topic} means to you personally`,
        'Set specific, measurable learning objectives',
        'Identify how this knowledge connects to your broader goals'
      ],
      strategySelection: [
        'Choose your preferred learning approach based on your cognitive profile',
        'Select the optimal balance of theory and practice',
        'Determine your ideal pace and intensity'
      ],
      resourceIdentification: [
        'Identify prerequisite knowledge you may need to review',
        'Gather additional resources that match your learning style',
        'Plan for practice opportunities and real-world applications'
      ],
      timeEstimation: this.calculateOptimalDuration(userProfile).toString() + ' minutes'
    };
  }

  private generateMonitoringCheckpoints(metaLearningSkills: AssessmentProfile['metaLearningSkills']): MonitoringCheckpoint[] {
    const checkpoints: MonitoringCheckpoint[] = [];
    
    // More checkpoints for users with lower self-monitoring skills
    const checkpointFrequency = metaLearningSkills.selfMonitoring >= 4 ? 3 : 5;
    
    for (let i = 1; i <= checkpointFrequency; i++) {
      const position = (i / (checkpointFrequency + 1)) * 100;
      checkpoints.push({
        position,
        selfAssessmentQuestions: [
          'How confident do you feel about the material so far?',
          'Are you understanding the connections between concepts?',
          'Do you need to adjust your learning strategy?'
        ],
        comprehensionCheck: `Quick check: Can you explain the key concept in your own words?`,
        adjustmentSuggestions: [
          'If struggling: Slow down and review fundamentals',
          'If bored: Skip to more challenging applications',
          'If confused: Try a different explanation approach'
        ]
      });
    }
    
    return checkpoints;
  }

  private generateReflectionPrompts(userProfile: AssessmentProfile): ReflectionPrompt[] {
    return [
      {
        timing: 'mid_lesson',
        questions: [
          'What connections are you making to your existing knowledge?',
          'Which learning strategy is working best for you right now?',
          'What questions are emerging as you learn?'
        ],
        metacognitiveFocus: 'strategy_effectiveness'
      },
      {
        timing: 'end_lesson',
        questions: [
          'What was the most surprising insight you gained?',
          'How does this knowledge change your understanding?',
          'What would you teach differently if you were the instructor?'
        ],
        metacognitiveFocus: 'comprehension_gaps'
      },
      {
        timing: 'post_session',
        questions: [
          'How can you apply this knowledge in the next 24 hours?',
          'What aspects need more practice or review?',
          'How did your motivation and focus change throughout the session?'
        ],
        metacognitiveFocus: 'learning_preferences'
      }
    ];
  }

  private generateFirstPrinciplesBreakdown(topic: string, userProfile: AssessmentProfile): FirstPrinciplesBreakdown {
    return {
      complexConcept: topic,
      fundamentalComponents: [
        'Core definitions and basic elements',
        'Underlying mechanisms and processes',
        'Essential relationships and dependencies',
        'Fundamental laws or principles that govern the domain'
      ],
      assumptions: [
        'What do we typically assume about this topic?',
        'Which conventional wisdom might be limiting our understanding?',
        'What biases might influence our perspective?'
      ],
      coreQuestions: [
        `What is ${topic} really, at its most basic level?`,
        'Why does this work the way it does?',
        'What would happen if we changed the fundamental assumptions?'
      ],
      reconstructionSteps: [
        'Start with the most basic, undeniable facts',
        'Build up complexity one logical step at a time',
        'Test each step against reality and experience',
        'Identify where new insights emerge from the reconstruction'
      ]
    };
  }

  private generateFeynmanTasks(topic: string, userProfile: AssessmentProfile): FeynmanTask[] {
    return [
      {
        concept: `Core principles of ${topic}`,
        targetAudience: 'a curious 12-year-old',
        simplificationChallenge: 'Explain without using any technical jargon',
        gapIdentificationPrompts: [
          'Where did you struggle to find simple words?',
          'Which parts felt unclear even to you?',
          'What analogies helped make it clearer?'
        ],
        refinementSteps: [
          'Identify the confusing parts',
          'Return to source material for deeper understanding',
          'Create better analogies and examples',
          'Test explanation with someone else'
        ]
      },
      {
        concept: `Practical applications of ${topic}`,
        targetAudience: 'someone who needs to use this knowledge',
        simplificationChallenge: 'Focus on actionable insights and clear steps',
        gapIdentificationPrompts: [
          'What practical details are you unsure about?',
          'Where might someone get stuck in implementation?',
          'What real-world complications did you overlook?'
        ],
        refinementSteps: [
          'Research practical examples and case studies',
          'Identify common pitfalls and solutions',
          'Create step-by-step implementation guides',
          'Validate with real-world application'
        ]
      }
    ];
  }

  private generateObservationalExercises(topic: string, userProfile: AssessmentProfile): ObservationalExercise[] {
    return [
      {
        subject: `Real-world examples of ${topic}`,
        observationPrompts: [
          'What patterns do you notice across different examples?',
          'What variations exist and why might they occur?',
          'What details do experts focus on that beginners miss?'
        ],
        detailFocusAreas: [
          'Structural elements and their relationships',
          'Process flows and decision points',
          'Context factors that influence outcomes'
        ],
        patternRecognitionTasks: [
          'Identify common themes across examples',
          'Spot anomalies and understand their significance',
          'Predict outcomes based on observed patterns'
        ],
        crossDomainConnections: [
          'How does this relate to other fields you know?',
          'What universal principles are at work here?',
          'Where else might these patterns apply?'
        ]
      }
    ];
  }

  private async generateLessonSections(
    topic: string, 
    userProfile: AssessmentProfile, 
    difficultyLevel: string
  ): Promise<LessonSection[]> {
    // Integrate with LLM service for AI-generated content
    try {
      const { LLMService } = await import('./LLMService');
      const llmService = LLMService.getInstance();
      
      const llmResponse = await llmService.generateLessonContent({
        topic,
        userProfile,
        context: `Difficulty: ${difficultyLevel}, Learning style: ${this.getLearningStyleDescription(userProfile)}`,
      });

      // Parse LLM response and structure into sections
      return this.parseLLMResponseToSections(llmResponse.content, topic);
    } catch (error) {
      console.error('LLM integration error, using template:', error);
      // Fallback to template
    }
    
    return [
      {
        id: 'intro',
        title: 'Curiosity Activation',
        type: 'introduction',
        content: `Welcome to your personalized ${topic} journey! Based on your cognitive profile, we've designed this experience to maximize your learning potential.`,
        interactiveElements: [
          {
            type: 'visualization',
            content: 'Interactive preview of what you\'ll master',
            rewardMechanism: 'anticipation_building'
          }
        ],
        dopamineTriggers: ['curiosity_gap', 'personal_relevance', 'achievement_preview']
      },
      {
        id: 'core',
        title: 'Foundation Building',
        type: 'core_content',
        content: 'Core concepts presented through your optimal learning style',
        interactiveElements: [
          {
            type: 'quiz',
            content: 'Micro-assessments with immediate feedback',
            rewardMechanism: 'progress_celebration'
          }
        ],
        dopamineTriggers: ['mastery_progress', 'understanding_clicks', 'connection_insights']
      },
      {
        id: 'practice',
        title: 'Active Application',
        type: 'practice',
        content: 'Hands-on exercises tailored to your goals',
        interactiveElements: [
          {
            type: 'simulation',
            content: 'Real-world scenario practice',
            rewardMechanism: 'skill_demonstration'
          }
        ],
        dopamineTriggers: ['competence_building', 'challenge_completion', 'skill_unlock']
      },
      {
        id: 'synthesis',
        title: 'Neural Network Integration',
        type: 'synthesis',
        content: 'Connect new knowledge to your existing understanding',
        interactiveElements: [
          {
            type: 'reflection',
            content: 'Guided insight generation',
            rewardMechanism: 'wisdom_achievement'
          }
        ],
        dopamineTriggers: ['insight_moments', 'pattern_recognition', 'mastery_confirmation']
      }
    ];
  }

  private generateAdaptiveAssessments(topic: string, userProfile: AssessmentProfile): Assessment[] {
    return [
      {
        type: 'formative',
        questions: [
          {
            id: 'understanding_check',
            question: `In your own words, what is the core principle of ${topic}?`,
            type: 'explanation',
            explanation: 'This tests your ability to synthesize and express understanding',
            rewardTrigger: 'clear_explanation_bonus'
          }
        ],
        feedbackStrategy: 'immediate',
        dopamineOptimization: true
      },
      {
        type: 'self_assessment',
        questions: [
          {
            id: 'confidence_rating',
            question: 'How confident do you feel applying this knowledge?',
            type: 'multiple_choice',
            options: ['Very confident', 'Somewhat confident', 'Need more practice', 'Still learning'],
            explanation: 'Self-awareness is key to effective learning',
            rewardTrigger: 'honest_self_reflection'
          }
        ],
        feedbackStrategy: 'adaptive',
        dopamineOptimization: true
      }
    ];
  }

  private generateAdaptiveElements(userProfile: AssessmentProfile): AdaptiveElement[] {
    return [
      {
        condition: 'high_performance_streak',
        modification: 'difficulty_adjustment',
        implementation: 'Increase challenge level and introduce advanced concepts'
      },
      {
        condition: 'low_engagement_detected',
        modification: 'reward_frequency',
        implementation: 'Increase micro-reward frequency and add surprise elements'
      },
      {
        condition: 'confusion_indicators',
        modification: 'content_variation',
        implementation: 'Switch to alternative explanation method or add visual aids'
      },
      {
        condition: 'fast_completion',
        modification: 'pacing_change',
        implementation: 'Offer bonus content or accelerated pathway'
      }
    ];
  }

  private calculateOptimalDuration(userProfile: AssessmentProfile): number {
    // Base duration: 30 minutes
    let duration = 30;
    
    // Adjust based on attention and motivation levels
    const avgMotivation = Object.values(userProfile.dopamineProfile).reduce((a, b) => a + b, 0) / 4;
    
    if (avgMotivation >= 4) duration += 15; // High motivation = longer sessions
    if (avgMotivation <= 2) duration -= 10; // Low motivation = shorter sessions
    
    return Math.max(15, Math.min(60, duration)); // Between 15-60 minutes
  }

  /**
   * Analyze user performance and adapt future lessons
   */
  public analyzePerformanceAndAdapt(
    lessonId: string,
    userResponses: any[],
    timeSpent: number,
    engagementMetrics: any
  ): any {
    // This would analyze user behavior and update their profile
    // for even better personalization in future lessons
    
    return {
      performanceScore: this.calculatePerformanceScore(userResponses, timeSpent),
      adaptationRecommendations: this.generateAdaptationRecommendations(engagementMetrics),
      nextLessonSuggestions: this.suggestNextLessons(userResponses)
    };
  }

  private calculatePerformanceScore(responses: any[], timeSpent: number): number {
    // Implement performance scoring algorithm
    return 85; // Placeholder
  }

  private generateAdaptationRecommendations(metrics: any): string[] {
    return [
      'Increase visual elements based on high engagement with diagrams',
      'Reduce text density in favor of interactive elements',
      'Add more frequent checkpoints for better pacing'
    ];
  }

  private suggestNextLessons(responses: any[]): string[] {
    return [
      'Advanced applications of current topic',
      'Related concepts that build on this foundation',
      'Cross-domain connections to expand understanding'
    ];
  }

  private getLearningStyleDescription(userProfile: AssessmentProfile): string {
    const prefs = userProfile.learningStylePreferences;
    if (prefs.visualProcessing >= 4) return 'visual learner';
    if (prefs.feynmanTechnique >= 4) return 'explanatory learner';
    if (prefs.firstPrinciplesThinking >= 4) return 'analytical learner';
    return 'balanced learner';
  }

  private parseLLMResponseToSections(content: string, topic: string): LessonSection[] {
    // Simple parsing - in production, use more sophisticated parsing
    const sections: LessonSection[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentSection: Partial<LessonSection> | null = null;
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        // New section
        if (currentSection) {
          sections.push(currentSection as LessonSection);
        }
        currentSection = {
          id: `section_${sections.length + 1}`,
          title: line.replace('# ', ''),
          type: sections.length === 0 ? 'introduction' : 'core_content',
          content: '',
          interactiveElements: [],
          dopamineTriggers: [],
        };
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          currentSection.title = line.replace('## ', '');
        }
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection as LessonSection);
    }

    // Ensure we have at least basic sections
    if (sections.length === 0) {
      return [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'introduction',
          content: content || `Welcome to ${topic}!`,
          interactiveElements: [],
          dopamineTriggers: [],
        },
      ];
    }

    return sections;
  }
}

