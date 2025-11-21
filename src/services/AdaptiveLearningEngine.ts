/**
 * Adaptive Learning Engine
 * Provides personalized content recommendations based on user profile and progress
 */

import { PolymathUser, LearningRecommendation } from './PolymathAIService';
import { UserProfile } from './UserProfilerService';

export interface ContentNode {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number; // 1-10
  type: 'video' | 'article' | 'exercise' | 'project' | 'quiz';
  embedding?: number[]; // Vector representation for similarity
  prerequisites: string[];
  estimatedTime: number; // minutes
}

export class AdaptiveLearningEngine {
  private static instance: AdaptiveLearningEngine;
  private knowledgeGraph: Map<string, ContentNode[]> = new Map();

  private constructor() {
    this.initializeKnowledgeGraph();
  }

  public static getInstance(): AdaptiveLearningEngine {
    if (!AdaptiveLearningEngine.instance) {
      AdaptiveLearningEngine.instance = new AdaptiveLearningEngine();
    }
    return AdaptiveLearningEngine.instance;
  }

  /**
   * Recommend content based on user profile and progress
   */
  public recommendContent(
    user: PolymathUser,
    userProfile: UserProfile,
    currentProgress: Record<string, number> = {}
  ): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];

    // Get content for user's domains
    const userDomains = Object.keys(user.domains);
    const allContent: ContentNode[] = [];

    userDomains.forEach((domain) => {
      const domainContent = this.knowledgeGraph.get(domain) || [];
      allContent.push(...domainContent);
    });

    // Calculate similarity scores
    const scoredContent = allContent.map((content) => {
      const similarity = this.calculateSimilarity(user, userProfile, content, currentProgress);
      return { content, similarity };
    });

    // Sort by similarity and get top recommendations
    const topContent = scoredContent
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map((item, index) => {
        const priority = 10 - index; // Higher priority for better matches
        return {
          title: item.content.title,
          description: item.content.description,
          priority,
          rationale: this.generateRationale(user, userProfile, item.content),
          estimatedTime: item.content.estimatedTime,
        };
      });

    return topContent;
  }

  /**
   * Calculate similarity between user and content
   */
  private calculateSimilarity(
    user: PolymathUser,
    userProfile: UserProfile,
    content: ContentNode,
    currentProgress: Record<string, number>
  ): number {
    let similarity = 0;

    // Domain match (higher weight)
    if (user.domains[content.domain]) {
      similarity += 0.4;
    }

    // Difficulty match (user level vs content difficulty)
    const userLevel = user.level;
    const difficultyMatch = 1 - Math.abs(userLevel - content.difficulty) / 10;
    similarity += difficultyMatch * 0.2;

    // Learning style match
    const styleMatch = this.getLearningStyleMatch(userProfile, content);
    similarity += styleMatch * 0.2;

    // Progress consideration (prefer content user hasn't completed)
    const progress = currentProgress[content.id] || 0;
    similarity += (1 - progress) * 0.1;

    // Prerequisites check (prefer content with met prerequisites)
    const prerequisitesMet = this.checkPrerequisites(content, currentProgress);
    similarity += prerequisitesMet * 0.1;

    return similarity;
  }

  /**
   * Get learning style match score
   */
  private getLearningStyleMatch(userProfile: UserProfile, content: ContentNode): number {
    // Simple matching based on content type
    if (userProfile.learningStyle === 'Visual' && content.type === 'video') {
      return 1.0;
    }
    if (userProfile.learningStyle === 'Reading/Writing' && content.type === 'article') {
      return 1.0;
    }
    if (userProfile.learningStyle === 'Kinesthetic' && content.type === 'exercise') {
      return 1.0;
    }
    return 0.5; // Default match
  }

  /**
   * Check if prerequisites are met
   */
  private checkPrerequisites(content: ContentNode, currentProgress: Record<string, number>): number {
    if (content.prerequisites.length === 0) {
      return 1.0;
    }

    const metCount = content.prerequisites.filter((prereq) => (currentProgress[prereq] || 0) >= 0.8).length;
    return metCount / content.prerequisites.length;
  }

  /**
   * Generate rationale for recommendation
   */
  private generateRationale(
    user: PolymathUser,
    userProfile: UserProfile,
    content: ContentNode
  ): string {
    const rationales: string[] = [];

    if (user.domains[content.domain]) {
      rationales.push(`Matches your ${content.domain} domain focus`);
    }

    if (content.difficulty <= user.level + 1) {
      rationales.push(`Appropriate difficulty for your level`);
    }

    if (userProfile.learningStyle === 'Visual' && content.type === 'video') {
      rationales.push(`Optimized for your visual learning style`);
    }

    if (rationales.length === 0) {
      return 'Recommended based on your learning profile';
    }

    return rationales.join('; ');
  }

  /**
   * Initialize knowledge graph with sample content
   */
  private initializeKnowledgeGraph(): void {
    // Sample content for different domains
    const domains = ['Neuroscience', 'Computer Science', 'Mathematics', 'Philosophy', 'Music Theory'];

    domains.forEach((domain) => {
      const content: ContentNode[] = [
        {
          id: `${domain.toLowerCase()}-intro`,
          title: `Introduction to ${domain}`,
          description: `Get started with ${domain}`,
          domain,
          difficulty: 1,
          type: 'article',
          prerequisites: [],
          estimatedTime: 30,
        },
        {
          id: `${domain.toLowerCase()}-intermediate`,
          title: `Intermediate ${domain}`,
          description: `Deep dive into ${domain}`,
          domain,
          difficulty: 5,
          type: 'video',
          prerequisites: [`${domain.toLowerCase()}-intro`],
          estimatedTime: 60,
        },
        {
          id: `${domain.toLowerCase()}-advanced`,
          title: `Advanced ${domain}`,
          description: `Master level ${domain}`,
          domain,
          difficulty: 9,
          type: 'project',
          prerequisites: [`${domain.toLowerCase()}-intermediate`],
          estimatedTime: 120,
        },
      ];

      this.knowledgeGraph.set(domain, content);
    });
  }

  /**
   * Add content to knowledge graph
   */
  public addContent(domain: string, content: ContentNode): void {
    if (!this.knowledgeGraph.has(domain)) {
      this.knowledgeGraph.set(domain, []);
    }
    this.knowledgeGraph.get(domain)!.push(content);
  }

  /**
   * Get content for domain
   */
  public getDomainContent(domain: string): ContentNode[] {
    return this.knowledgeGraph.get(domain) || [];
  }
}

