/**
 * PolyMathOS Core Types
 * Comprehensive type definitions for the Polymath Operating System
 */

export enum DomainType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  EXPLORATORY = "exploratory"
}

export enum LearningStyle {
  VISUAL = "Visual",
  AUDITORY = "Auditory",
  KINESTHETIC = "Kinesthetic",
  READING_WRITING = "Reading/Writing"
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlockCondition: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Domain {
  name: string;
  type: DomainType;
  proficiency: number;
  timeSpent: number; // minutes
  itemsMemorized: number;
  sessionsCompleted: number;
  lastAccessed: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  domain: string;
  createdAt: Date;
  nextReview: Date;
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
  confidenceRatings: number[];
}

export interface MemoryPalaceItem {
  loci: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  domain?: string;
  createdAt: Date;
  lastReviewed?: Date;
}

export interface MemoryPalace {
  name: string;
  items: MemoryPalaceItem[];
  createdDate: Date;
  domain: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children: string[];
  x?: number;
  y?: number;
  color?: string;
}

export interface MindMap {
  id: string;
  topic: string;
  nodes: MindMapNode[];
  createdAt: Date;
  domain: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  domains: string[];
  createdAt: Date;
  status: "in_progress" | "completed" | "on_hold";
  completedAt?: Date;
}

export interface PortfolioItem {
  id: string;
  projectTitle: string;
  reflection: string;
  tags: string[];
  addedAt: Date;
  imageUrl?: string;
}

export interface ReflectionEntry {
  id: string;
  prompt: string;
  response: string;
  mood: number; // 1-10
  timestamp: Date;
  tags?: string[];
}

export interface WeeklyGoals {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface DeepWorkBlock {
  id: string;
  domain: string;
  durationMinutes: number;
  activityType: "active_recall" | "problem_solving" | "reading" | "writing";
  startTime: Date;
  endTime?: Date;
  notes?: string;
}

export interface SessionPlan {
  warmUp: {
    duration: number;
    activity: string;
    domain: string;
  };
  segment1: {
    duration: number;
    activity: string;
    domain: string;
  };
  segment2: {
    duration: number;
    activity: string;
    domain: string;
  };
  segment3: {
    duration: number;
    activity: string;
    domain: string;
  };
  coolDown: {
    duration: number;
    activity: string;
    domain: string;
  };
}

export interface RewardItem {
  item: string;
  probability: number;
  value: number; // XP value
}

export interface PolymathUser {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActivity?: Date;
  achievements: Achievement[];
  domains: Record<string, Domain>;
  learningStyle: LearningStyle;
  dailyCommitment: number; // minutes
  weeklyGoals: WeeklyGoals;
  accessibilitySettings: {
    fontSize: "small" | "medium" | "large";
    theme: "light" | "dark";
    dyslexiaMode: boolean;
  };
  flashcards: Flashcard[];
  memoryPalaces: Record<string, MemoryPalace>;
  mindMaps: MindMap[];
  projects: Project[];
  portfolio: PortfolioItem[];
  reflectionJournal: ReflectionEntry[];
  studyGroups: string[];
  imageStreamSessions: number;
  deepWorkBlocks: number;
  mindMapsCreated: number;
  crossDomainProjects: number;
  totalStudyTime: number; // minutes
  trizApplications?: number;
  errorLog: Array<{
    id: string;
    content: string;
    domain: string;
    confidence: number;
    timestamp: Date;
  }>;
}

export interface Analytics {
  retentionRate: number;
  totalStudyTime: number;
  streak: number;
  level: number;
  xp: number;
  domainDistribution: Record<string, number>;
  achievementsUnlocked: number;
  flashcardsCreated: number;
  projectsCompleted: number;
  weeklyProgress: {
    actual: number;
    goal: number;
    percentage: number;
  };
}

