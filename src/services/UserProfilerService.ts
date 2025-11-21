/**
 * User Profiler Service
 * Analyzes user learning style and creates personalized profiles
 */

import { LearningStyle } from './PolymathAIService';

export interface UserProfile {
  learningStyle: LearningStyle;
  strengths: string[];
  weaknesses: string[];
  preferences: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  };
  cluster: number; // 0-4, representing 5 learning style clusters
}

export interface LearningStyleQuestion {
  id: string;
  question: string;
  options: {
    visual: string;
    auditory: string;
    kinesthetic: string;
    readingWriting: string;
  };
}

export class UserProfilerService {
  private static instance: UserProfilerService;
  private questions: LearningStyleQuestion[] = [
    {
      id: '1',
      question: 'When learning something new, I prefer to:',
      options: {
        visual: 'See diagrams, charts, or visual representations',
        auditory: 'Listen to explanations or discussions',
        kinesthetic: 'Try it hands-on or build something',
        readingWriting: 'Read detailed instructions or write notes',
      },
    },
    {
      id: '2',
      question: 'I remember information best when:',
      options: {
        visual: 'I can visualize it or see it in my mind',
        auditory: 'I hear it explained or discuss it',
        kinesthetic: 'I physically do it or practice it',
        readingWriting: 'I read it or write it down',
      },
    },
    {
      id: '3',
      question: 'When solving problems, I typically:',
      options: {
        visual: 'Draw diagrams or create mental images',
        auditory: 'Talk through the problem out loud',
        kinesthetic: 'Manipulate objects or build models',
        readingWriting: 'Write out the problem step-by-step',
      },
    },
    {
      id: '4',
      question: 'I learn best from:',
      options: {
        visual: 'Videos, infographics, or visual demonstrations',
        auditory: 'Lectures, podcasts, or group discussions',
        kinesthetic: 'Interactive activities or experiments',
        readingWriting: 'Textbooks, articles, or written guides',
      },
    },
    {
      id: '5',
      question: 'When studying, I prefer:',
      options: {
        visual: 'Color-coded notes and mind maps',
        auditory: 'Recording and listening to notes',
        kinesthetic: 'Moving around or using manipulatives',
        readingWriting: 'Detailed written notes and summaries',
      },
    },
  ];

  private constructor() {}

  public static getInstance(): UserProfilerService {
    if (!UserProfilerService.instance) {
      UserProfilerService.instance = new UserProfilerService();
    }
    return UserProfilerService.instance;
  }

  /**
   * Get learning style questions
   */
  public getQuestions(): LearningStyleQuestion[] {
    return this.questions;
  }

  /**
   * Profile user based on responses
   */
  public profileUser(responses: Record<string, 'visual' | 'auditory' | 'kinesthetic' | 'readingWriting'>): UserProfile {
    // Count responses for each style
    const counts = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      readingWriting: 0,
    };

    Object.values(responses).forEach((response) => {
      counts[response]++;
    });

    // Determine primary learning style
    const maxCount = Math.max(...Object.values(counts));
    let learningStyle: LearningStyle = LearningStyle.VISUAL;

    if (counts.auditory === maxCount) {
      learningStyle = LearningStyle.AUDITORY;
    } else if (counts.kinesthetic === maxCount) {
      learningStyle = LearningStyle.KINESTHETIC;
    } else if (counts.readingWriting === maxCount) {
      learningStyle = LearningStyle.READING_WRITING;
    }

    // Calculate preferences (normalized to 0-1)
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const preferences = {
      visual: counts.visual / total,
      auditory: counts.auditory / total,
      kinesthetic: counts.kinesthetic / total,
      readingWriting: counts.readingWriting / total,
    };

    // Determine cluster (simplified clustering)
    const cluster = this.determineCluster(preferences);

    // Generate strengths and weaknesses
    const strengths = this.getStrengths(learningStyle);
    const weaknesses = this.getWeaknesses(learningStyle);

    return {
      learningStyle,
      strengths,
      weaknesses,
      preferences,
      cluster,
    };
  }

  /**
   * Determine user cluster (0-4)
   */
  private determineCluster(preferences: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  }): number {
    // Simple clustering based on dominant preferences
    const values = [preferences.visual, preferences.auditory, preferences.kinesthetic, preferences.readingWriting];
    const maxIndex = values.indexOf(Math.max(...values));
    return maxIndex;
  }

  /**
   * Get strengths for learning style
   */
  private getStrengths(style: LearningStyle): string[] {
    const strengthsMap: Record<LearningStyle, string[]> = {
      [LearningStyle.VISUAL]: [
        'Strong spatial reasoning',
        'Excellent pattern recognition',
        'Quick visual memory',
        'Good at reading charts and graphs',
      ],
      [LearningStyle.AUDITORY]: [
        'Strong listening skills',
        'Excellent verbal memory',
        'Good at following spoken instructions',
        'Strong discussion and debate skills',
      ],
      [LearningStyle.KINESTHETIC]: [
        'Excellent hands-on learning',
        'Strong muscle memory',
        'Good at physical tasks',
        'Learn by doing',
      ],
      [LearningStyle.READING_WRITING]: [
        'Strong reading comprehension',
        'Excellent written communication',
        'Good at note-taking',
        'Strong analytical thinking',
      ],
    };

    return strengthsMap[style] || [];
  }

  /**
   * Get weaknesses for learning style
   */
  private getWeaknesses(style: LearningStyle): string[] {
    const weaknessesMap: Record<LearningStyle, string[]> = {
      [LearningStyle.VISUAL]: [
        'May struggle with purely auditory content',
        'Could benefit from hands-on practice',
      ],
      [LearningStyle.AUDITORY]: [
        'May struggle with visual-only content',
        'Could benefit from written notes',
      ],
      [LearningStyle.KINESTHETIC]: [
        'May struggle with passive learning',
        'Could benefit from more structured reading',
      ],
      [LearningStyle.READING_WRITING]: [
        'May struggle with hands-on tasks',
        'Could benefit from visual aids',
      ],
    };

    return weaknessesMap[style] || [];
  }

  /**
   * Get personalized recommendations based on profile
   */
  public getRecommendations(profile: UserProfile): string[] {
    const recommendations: string[] = [];

    if (profile.learningStyle === LearningStyle.VISUAL) {
      recommendations.push('Use mind maps and diagrams');
      recommendations.push('Watch video tutorials');
      recommendations.push('Create visual flashcards');
    } else if (profile.learningStyle === LearningStyle.AUDITORY) {
      recommendations.push('Record and listen to notes');
      recommendations.push('Join study groups');
      recommendations.push('Use audio-based learning apps');
    } else if (profile.learningStyle === LearningStyle.KINESTHETIC) {
      recommendations.push('Use hands-on practice');
      recommendations.push('Take frequent breaks to move');
      recommendations.push('Build physical models');
    } else {
      recommendations.push('Take detailed written notes');
      recommendations.push('Write summaries and explanations');
      recommendations.push('Use text-based resources');
    }

    return recommendations;
  }
}

