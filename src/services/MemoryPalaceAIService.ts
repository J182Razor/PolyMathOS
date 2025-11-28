/**
 * Memory Palace AI Service
 * Refactored to use Backend API
 */

import axios from 'axios';

export type PalaceTemplate = 'home' | 'school' | 'office' | 'park' | 'mall' | 'custom';

export interface MemoryPalace {
  id: string;
  name: string;
  description: string;
  template: PalaceTemplate;
  userId: string;
  loci: MemoryLocus[];
  journey: string[];              // Ordered path through loci IDs
  createdAt: Date;
  lastReviewedAt?: Date;
  reviewCount: number;
  retentionRate: number;          // 0-100 based on review performance
  vrReady: boolean;               // Has 3D positioning data
  imageStyle: 'vivid' | 'cartoon' | 'realistic' | 'abstract';
}

export interface MemoryLocus {
  id: string;
  name: string;                   // "Front Door", "Kitchen Table"
  description: string;            // Description of the physical location
  position: Position3D;           // For VR visualization
  concept: string;                // What to remember
  imagery: MemoryImagery;
  story: string;                  // Narrative connecting to next locus
  audioDescription?: string;      // For audio learners
  linkedZettelId?: string;        // Link to Zettelkasten note
  fsrsCardId?: string;            // Link to FSRS card
  createdAt: Date;
  lastReviewedAt?: Date;
  recallSuccessRate: number;      // 0-100
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
  rotation?: { pitch: number; yaw: number; roll: number };
}

export interface MemoryImagery {
  description: string;            // Vivid visual description
  imagePrompt: string;            // Prompt for AI image generation
  imageUrl?: string;              // Generated/uploaded image URL
  mnemonic: string;               // Core memory hook
  sensoryDetails: SensoryDetails;
  bizarrenessLevel: number;       // 1-10, more bizarre = more memorable
  emotionalConnection?: string;   // Personal emotional hook
}

export interface SensoryDetails {
  visual: string;                 // What you see
  auditory: string;               // What you hear
  kinesthetic: string;            // What you feel/touch
  olfactory?: string;             // What you smell
  gustatory?: string;             // What you taste
}

export interface MajorSystemMapping {
  number: number;
  consonant: string;
  word: string;
  imagery: string;
}

export interface PalaceReviewSession {
  id: string;
  palaceId: string;
  startTime: Date;
  endTime?: Date;
  locusResults: LocusReviewResult[];
  overallScore: number;
  technique: 'forward' | 'backward' | 'random';
}

export interface LocusReviewResult {
  locusId: string;
  recalled: boolean;
  recallTime: number;             // Seconds
  confidenceRating: number;       // 1-5
  hintUsed: boolean;
}

// Pre-built palace templates with default loci
export const PALACE_TEMPLATES: Record<PalaceTemplate, {
  name: string;
  description: string;
  defaultLoci: { name: string; description: string; position: Position3D }[];
}> = {
  home: {
    name: "Your Home",
    description: "A familiar walk through your home",
    defaultLoci: [
      { name: "Front Door", description: "The entrance to your home", position: { x: 0, y: 0, z: 0 } },
      { name: "Entryway", description: "The first area inside", position: { x: 2, y: 0, z: 0 } },
      { name: "Living Room Couch", description: "The main seating area", position: { x: 5, y: 0, z: 2 } },
      { name: "TV Stand", description: "Where your television sits", position: { x: 5, y: 0, z: -2 } },
      { name: "Dining Table", description: "Where you eat meals", position: { x: 8, y: 0, z: 0 } },
      { name: "Kitchen Counter", description: "The main workspace", position: { x: 10, y: 0, z: 2 } },
      { name: "Refrigerator", description: "The cold storage", position: { x: 10, y: 0, z: -2 } },
      { name: "Kitchen Sink", description: "Where dishes are washed", position: { x: 12, y: 0, z: 0 } },
      { name: "Bedroom Door", description: "Entrance to bedroom", position: { x: 14, y: 0, z: 3 } },
      { name: "Bed", description: "Where you sleep", position: { x: 16, y: 0, z: 3 } },
      { name: "Closet", description: "Where clothes are stored", position: { x: 16, y: 0, z: 5 } },
      { name: "Bathroom Mirror", description: "Above the sink", position: { x: 14, y: 0, z: -3 } }
    ]
  },
  school: {
    name: "Your School",
    description: "A walk through a school building",
    defaultLoci: [
      { name: "School Gate", description: "The main entrance", position: { x: 0, y: 0, z: 0 } },
      { name: "Front Office", description: "Administrative area", position: { x: 3, y: 0, z: 0 } },
      { name: "Main Hallway", description: "The central corridor", position: { x: 6, y: 0, z: 0 } },
      { name: "Lockers", description: "Student storage", position: { x: 8, y: 0, z: 2 } },
      { name: "Classroom 1", description: "First classroom", position: { x: 10, y: 0, z: 3 } },
      { name: "Teacher's Desk", description: "Front of classroom", position: { x: 12, y: 0, z: 3 } },
      { name: "Cafeteria", description: "Where lunch is served", position: { x: 15, y: 0, z: 0 } },
      { name: "Library", description: "Book repository", position: { x: 18, y: 0, z: -2 } },
      { name: "Gymnasium", description: "Physical education area", position: { x: 20, y: 0, z: 2 } },
      { name: "Playground", description: "Outdoor recreation", position: { x: 22, y: 0, z: 0 } }
    ]
  },
  office: {
    name: "Your Office",
    description: "A walk through a workplace",
    defaultLoci: [
      { name: "Building Entrance", description: "The main door", position: { x: 0, y: 0, z: 0 } },
      { name: "Reception Desk", description: "Where visitors check in", position: { x: 3, y: 0, z: 0 } },
      { name: "Elevator", description: "Vertical transport", position: { x: 5, y: 0, z: -2 } },
      { name: "Your Desk", description: "Personal workspace", position: { x: 8, y: 0, z: 2 } },
      { name: "Computer Monitor", description: "Your screen", position: { x: 8, y: 1, z: 2 } },
      { name: "Conference Room", description: "Meeting space", position: { x: 12, y: 0, z: 0 } },
      { name: "Whiteboard", description: "For presentations", position: { x: 12, y: 1.5, z: 2 } },
      { name: "Break Room", description: "Coffee and snacks", position: { x: 15, y: 0, z: -2 } },
      { name: "Water Cooler", description: "Hydration station", position: { x: 15, y: 0, z: 0 } },
      { name: "Parking Lot", description: "Where cars park", position: { x: -3, y: 0, z: 0 } }
    ]
  },
  park: {
    name: "A Park",
    description: "A walk through a public park",
    defaultLoci: [
      { name: "Park Entrance", description: "The main gate", position: { x: 0, y: 0, z: 0 } },
      { name: "Fountain", description: "Central water feature", position: { x: 5, y: 0, z: 0 } },
      { name: "Bench", description: "A place to sit", position: { x: 7, y: 0, z: 3 } },
      { name: "Large Oak Tree", description: "A big shady tree", position: { x: 10, y: 0, z: -2 } },
      { name: "Playground", description: "Children's play area", position: { x: 13, y: 0, z: 2 } },
      { name: "Pond", description: "Small body of water", position: { x: 16, y: 0, z: 0 } },
      { name: "Bridge", description: "Crossing the pond", position: { x: 18, y: 0.5, z: 0 } },
      { name: "Garden", description: "Flower beds", position: { x: 20, y: 0, z: 3 } },
      { name: "Statue", description: "Memorial sculpture", position: { x: 22, y: 0, z: -2 } },
      { name: "Exit Path", description: "Leaving the park", position: { x: 25, y: 0, z: 0 } }
    ]
  },
  mall: {
    name: "Shopping Mall",
    description: "A walk through a shopping center",
    defaultLoci: [
      { name: "Mall Entrance", description: "Main doors", position: { x: 0, y: 0, z: 0 } },
      { name: "Information Desk", description: "Help center", position: { x: 3, y: 0, z: 0 } },
      { name: "Escalator", description: "Moving stairs", position: { x: 6, y: 0, z: -2 } },
      { name: "Food Court", description: "Eating area", position: { x: 10, y: 0, z: 0 } },
      { name: "Bookstore", description: "Book shop", position: { x: 14, y: 0, z: 3 } },
      { name: "Electronics Store", description: "Gadget shop", position: { x: 14, y: 0, z: -3 } },
      { name: "Clothing Store", description: "Fashion outlet", position: { x: 18, y: 0, z: 2 } },
      { name: "Fountain Court", description: "Central water feature", position: { x: 22, y: 0, z: 0 } },
      { name: "Movie Theater", description: "Cinema entrance", position: { x: 25, y: 0, z: -2 } },
      { name: "Parking Garage", description: "Where cars park", position: { x: -5, y: -1, z: 0 } }
    ]
  },
  custom: {
    name: "Custom Palace",
    description: "Create your own memory palace",
    defaultLoci: []
  }
};

// Major System for number memorization
export const MAJOR_SYSTEM: MajorSystemMapping[] = [
  { number: 0, consonant: 's, z', word: 'zoo', imagery: 'A colorful zoo with exotic animals' },
  { number: 1, consonant: 't, d', word: 'tie', imagery: 'A bright red necktie' },
  { number: 2, consonant: 'n', word: 'Noah', imagery: "Noah's ark with animals" },
  { number: 3, consonant: 'm', word: 'ma', imagery: 'Your mother figure' },
  { number: 4, consonant: 'r', word: 'rye', imagery: 'A loaf of rye bread' },
  { number: 5, consonant: 'l', word: 'law', imagery: 'A judge with a gavel' },
  { number: 6, consonant: 'j, sh, ch', word: 'shoe', imagery: 'A giant colorful shoe' },
  { number: 7, consonant: 'k, g', word: 'key', imagery: 'A golden skeleton key' },
  { number: 8, consonant: 'f, v', word: 'ivy', imagery: 'Green ivy vines growing' },
  { number: 9, consonant: 'p, b', word: 'pie', imagery: 'A delicious steaming pie' }
];

const API_BASE_URL = 'http://localhost:8000/api/learning';

export class MemoryPalaceAIService {
  private static instance: MemoryPalaceAIService;

  private constructor() { }

  public static getInstance(): MemoryPalaceAIService {
    if (!MemoryPalaceAIService.instance) {
      MemoryPalaceAIService.instance = new MemoryPalaceAIService();
    }
    return MemoryPalaceAIService.instance;
  }

  /**
   * Create a new memory palace
   */
  public async createPalace(
    name: string,
    template: PalaceTemplate,
    userId: string,
    options?: {
      description?: string;
      imageStyle?: MemoryPalace['imageStyle'];
    }
  ): Promise<MemoryPalace> {
    try {
      const response = await axios.post(`${API_BASE_URL}/palace/create`, {
        name,
        template,
        user_id: userId,
        description: options?.description
      });
      return response.data;
    } catch (error) {
      console.error('Error creating memory palace:', error);
      throw error;
    }
  }

  /**
   * Generate AI imagery for a concept at a locus
   */
  public async generateImagery(
    palaceId: string,
    locusId: string,
    concept: string,
    options?: {
      bizarrenessLevel?: number;
      emotionalConnection?: string;
      imageStyle?: string;
    }
  ): Promise<MemoryImagery | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/palace/imagery`, {
        palace_id: palaceId,
        locus_id: locusId,
        concept,
        bizarreness_level: options?.bizarrenessLevel || 7,
        emotional_connection: options?.emotionalConnection
      });
      return response.data.imagery;
    } catch (error) {
      console.error('Error generating imagery:', error);
      return null;
    }
  }

  /**
   * Get a specific palace
   */
  public async getPalace(palaceId: string): Promise<MemoryPalace | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/palace/${palaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting memory palace:', error);
      return null;
    }
  }

  /**
   * Get all palaces for a user (Not implemented in backend yet)
   */
  public async getUserPalaces(userId: string): Promise<MemoryPalace[]> {
    // TODO: Implement backend endpoint
    return [];
  }

  /**
   * Get palace templates
   */
  public getTemplates(): typeof PALACE_TEMPLATES {
    return PALACE_TEMPLATES;
  }

  /**
   * Get Major System reference
   */
  public getMajorSystemReference(): MajorSystemMapping[] {
    return MAJOR_SYSTEM;
  }
}
