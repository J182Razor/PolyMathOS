/**
 * Memory Palace AI Service
 * Based on SofiaBargues/memory-palace - https://github.com/SofiaBargues/memory-palace
 * 
 * Implements the Method of Loci (Memory Palace) technique:
 * 1. Choose a familiar location (palace)
 * 2. Place items to memorize at specific locations (loci)
 * 3. Create vivid, bizarre imagery for each locus
 * 4. Walk through the palace to recall items
 * 
 * Features:
 * - AI-generated vivid imagery for each memory locus
 * - Pre-built palace templates (home, school, etc.)
 * - Custom palace creation
 * - Major System integration for numbers
 * - Multi-sensory memory hooks
 * - VR-ready spatial data structure
 */

import { LLMService } from './LLMService';

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
const PALACE_TEMPLATES: Record<PalaceTemplate, {
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
const MAJOR_SYSTEM: MajorSystemMapping[] = [
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

export class MemoryPalaceAIService {
  private static instance: MemoryPalaceAIService;
  private llmService: LLMService;
  private palaces: Map<string, MemoryPalace> = new Map();
  private reviewSessions: PalaceReviewSession[] = [];

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.loadData();
  }

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
    const templateData = PALACE_TEMPLATES[template];
    
    const palace: MemoryPalace = {
      id: this.generateId(),
      name: name || templateData.name,
      description: options?.description || templateData.description,
      template,
      userId,
      loci: templateData.defaultLoci.map(locus => ({
        id: this.generateId(),
        name: locus.name,
        description: locus.description,
        position: locus.position,
        concept: '',
        imagery: {
          description: '',
          imagePrompt: '',
          mnemonic: '',
          sensoryDetails: {
            visual: '',
            auditory: '',
            kinesthetic: ''
          },
          bizarrenessLevel: 5
        },
        story: '',
        createdAt: new Date(),
        recallSuccessRate: 0
      })),
      journey: templateData.defaultLoci.map((_, i) => `locus_${i}`),
      createdAt: new Date(),
      reviewCount: 0,
      retentionRate: 0,
      vrReady: true,
      imageStyle: options?.imageStyle || 'vivid'
    };

    // Update journey with actual IDs
    palace.journey = palace.loci.map(l => l.id);

    this.palaces.set(palace.id, palace);
    this.saveData();
    return palace;
  }

  /**
   * Add a custom locus to a palace
   */
  public addLocus(
    palaceId: string,
    name: string,
    description: string,
    position?: Position3D
  ): MemoryLocus | null {
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    const lastLocus = palace.loci[palace.loci.length - 1];
    const newPosition = position || {
      x: (lastLocus?.position.x || 0) + 3,
      y: lastLocus?.position.y || 0,
      z: lastLocus?.position.z || 0
    };

    const locus: MemoryLocus = {
      id: this.generateId(),
      name,
      description,
      position: newPosition,
      concept: '',
      imagery: {
        description: '',
        imagePrompt: '',
        mnemonic: '',
        sensoryDetails: {
          visual: '',
          auditory: '',
          kinesthetic: ''
        },
        bizarrenessLevel: 5
      },
      story: '',
      createdAt: new Date(),
      recallSuccessRate: 0
    };

    palace.loci.push(locus);
    palace.journey.push(locus.id);
    this.saveData();
    return locus;
  }

  /**
   * Generate AI imagery for a concept at a locus
   * This is the core AI feature - creating vivid, memorable imagery
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
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    const locus = palace.loci.find(l => l.id === locusId);
    if (!locus) return null;

    const bizarrenessLevel = options?.bizarrenessLevel || 7; // Default to quite bizarre

    try {
      const prompt = `Create vivid memory palace imagery to help remember "${concept}" at the location "${locus.name}" (${locus.description}).

Requirements:
1. Make it BIZARRE and UNUSUAL - bizarre images are more memorable
2. Make it ACTIVE - things should be moving or happening
3. Make it SENSORY - include multiple senses
4. Make it CONNECTED - link the concept to the location in a meaningful way
5. Bizarreness level: ${bizarrenessLevel}/10 (higher = more absurd)
${options?.emotionalConnection ? `6. Include emotional connection: ${options.emotionalConnection}` : ''}

Example: To remember "photosynthesis" at "kitchen sink":
"A giant green leaf is stuck in the sink, gulping water from the faucet while a miniature sun floats above it, shooting golden rays. The leaf burps out oxygen bubbles that smell like fresh grass. You can hear it humming happily as it makes sugar."

Create similar vivid imagery for "${concept}" at "${locus.name}".

Respond in JSON:
{
  "description": "Full vivid description (3-4 sentences)",
  "mnemonic": "Core memory hook (one sentence)",
  "sensoryDetails": {
    "visual": "What you see",
    "auditory": "What you hear",
    "kinesthetic": "What you feel/touch",
    "olfactory": "What you smell (if applicable)"
  },
  "imagePrompt": "A detailed prompt for generating an AI image of this scene",
  "story": "A short narrative connecting this to the next location"
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        const imagery: MemoryImagery = {
          description: parsed.description || `Remember ${concept} at ${locus.name}`,
          imagePrompt: parsed.imagePrompt || `A vivid scene of ${concept} at ${locus.name}`,
          mnemonic: parsed.mnemonic || `${concept} = ${locus.name}`,
          sensoryDetails: {
            visual: parsed.sensoryDetails?.visual || `See ${concept}`,
            auditory: parsed.sensoryDetails?.auditory || 'Silence',
            kinesthetic: parsed.sensoryDetails?.kinesthetic || 'Feel the presence',
            olfactory: parsed.sensoryDetails?.olfactory
          },
          bizarrenessLevel,
          emotionalConnection: options?.emotionalConnection
        };

        // Update the locus
        locus.concept = concept;
        locus.imagery = imagery;
        locus.story = parsed.story || '';
        
        this.saveData();
        return imagery;
      }
    } catch (error) {
      console.warn('AI imagery generation failed:', error);
    }

    // Fallback imagery
    const fallbackImagery: MemoryImagery = {
      description: `Visualize ${concept} dramatically appearing at ${locus.name}`,
      imagePrompt: `A surreal scene of ${concept} at ${locus.name}`,
      mnemonic: `${locus.name} = ${concept}`,
      sensoryDetails: {
        visual: `You see ${concept} vividly at ${locus.name}`,
        auditory: `You hear sounds related to ${concept}`,
        kinesthetic: `You feel the presence of ${concept}`
      },
      bizarrenessLevel
    };

    locus.concept = concept;
    locus.imagery = fallbackImagery;
    this.saveData();
    return fallbackImagery;
  }

  /**
   * Generate a complete palace journey for a list of concepts
   */
  public async generateFullPalace(
    palaceId: string,
    concepts: string[],
    options?: {
      bizarrenessLevel?: number;
      createConnectingStories?: boolean;
    }
  ): Promise<MemoryPalace | null> {
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    // Ensure we have enough loci
    while (palace.loci.length < concepts.length) {
      this.addLocus(
        palaceId,
        `Location ${palace.loci.length + 1}`,
        `Additional location for memory storage`
      );
    }

    // Generate imagery for each concept
    for (let i = 0; i < concepts.length; i++) {
      const locus = palace.loci[i];
      await this.generateImagery(palaceId, locus.id, concepts[i], {
        bizarrenessLevel: options?.bizarrenessLevel
      });
    }

    // Generate connecting stories if requested
    if (options?.createConnectingStories) {
      await this.generateConnectingStories(palaceId);
    }

    this.saveData();
    return palace;
  }

  /**
   * Generate stories connecting each locus to the next
   */
  private async generateConnectingStories(palaceId: string): Promise<void> {
    const palace = this.palaces.get(palaceId);
    if (!palace) return;

    for (let i = 0; i < palace.loci.length - 1; i++) {
      const currentLocus = palace.loci[i];
      const nextLocus = palace.loci[i + 1];

      if (!currentLocus.concept || !nextLocus.concept) continue;

      try {
        const prompt = `Create a short, vivid story that connects these two memory locations:

Current Location: ${currentLocus.name}
Current Concept: ${currentLocus.concept}
Current Imagery: ${currentLocus.imagery.description}

Next Location: ${nextLocus.name}
Next Concept: ${nextLocus.concept}

Create a 1-2 sentence story that naturally leads from the current location/concept to the next. Make it memorable and action-oriented.`;

        const response = await this.llmService.generateQuickResponse(prompt);
        currentLocus.story = response.content.slice(0, 300);
      } catch (error) {
        currentLocus.story = `From ${currentLocus.name}, walk to ${nextLocus.name}...`;
      }
    }

    this.saveData();
  }

  /**
   * Start a review session for a palace
   */
  public startReviewSession(
    palaceId: string,
    technique: PalaceReviewSession['technique'] = 'forward'
  ): PalaceReviewSession | null {
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    const session: PalaceReviewSession = {
      id: this.generateId(),
      palaceId,
      startTime: new Date(),
      locusResults: [],
      overallScore: 0,
      technique
    };

    this.reviewSessions.push(session);
    return session;
  }

  /**
   * Submit a review result for a locus
   */
  public submitLocusReview(
    sessionId: string,
    locusId: string,
    result: Omit<LocusReviewResult, 'locusId'>
  ): void {
    const session = this.reviewSessions.find(s => s.id === sessionId);
    if (!session) return;

    session.locusResults.push({
      locusId,
      ...result
    });

    // Update locus recall rate
    const palace = this.palaces.get(session.palaceId);
    if (palace) {
      const locus = palace.loci.find(l => l.id === locusId);
      if (locus) {
        // Weighted average with previous rate
        const weight = 0.3;
        locus.recallSuccessRate = locus.recallSuccessRate * (1 - weight) + 
          (result.recalled ? 100 : 0) * weight;
        locus.lastReviewedAt = new Date();
      }
    }

    this.saveData();
  }

  /**
   * Complete a review session
   */
  public completeReviewSession(sessionId: string): PalaceReviewSession | null {
    const session = this.reviewSessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.endTime = new Date();
    
    // Calculate overall score
    const recalled = session.locusResults.filter(r => r.recalled).length;
    session.overallScore = Math.round((recalled / session.locusResults.length) * 100);

    // Update palace retention rate
    const palace = this.palaces.get(session.palaceId);
    if (palace) {
      palace.reviewCount++;
      palace.lastReviewedAt = new Date();
      // Weighted average
      const weight = 0.4;
      palace.retentionRate = palace.retentionRate * (1 - weight) + session.overallScore * weight;
      this.saveData();
    }

    return session;
  }

  /**
   * Get the journey through a palace (ordered loci with imagery)
   */
  public getJourney(palaceId: string): {
    locus: MemoryLocus;
    orderIndex: number;
    story: string;
  }[] | null {
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    return palace.journey.map((locusId, index) => {
      const locus = palace.loci.find(l => l.id === locusId)!;
      return {
        locus,
        orderIndex: index,
        story: locus.story
      };
    });
  }

  /**
   * Convert a number to Major System imagery
   */
  public numberToMajorSystem(number: number | string): {
    digits: MajorSystemMapping[];
    combinedImagery: string;
    memorySentence: string;
  } {
    const digits = String(number).split('').map(d => parseInt(d));
    const mappings = digits.map(d => MAJOR_SYSTEM[d]);

    // Create combined imagery
    const combinedImagery = mappings.map(m => m.imagery).join(' Then, ');
    
    // Create memory sentence using the words
    const words = mappings.map(m => m.word);
    const memorySentence = `Imagine: ${words.join(' meets ')}`;

    return {
      digits: mappings,
      combinedImagery,
      memorySentence
    };
  }

  /**
   * Get Major System reference
   */
  public getMajorSystemReference(): MajorSystemMapping[] {
    return MAJOR_SYSTEM;
  }

  /**
   * Get all palaces for a user
   */
  public getUserPalaces(userId: string): MemoryPalace[] {
    return Array.from(this.palaces.values()).filter(p => p.userId === userId);
  }

  /**
   * Get a specific palace
   */
  public getPalace(palaceId: string): MemoryPalace | undefined {
    return this.palaces.get(palaceId);
  }

  /**
   * Get palace templates
   */
  public getTemplates(): typeof PALACE_TEMPLATES {
    return PALACE_TEMPLATES;
  }

  /**
   * Delete a palace
   */
  public deletePalace(palaceId: string): boolean {
    const deleted = this.palaces.delete(palaceId);
    if (deleted) this.saveData();
    return deleted;
  }

  /**
   * Get review statistics for a palace
   */
  public getPalaceStats(palaceId: string): {
    reviewCount: number;
    retentionRate: number;
    lastReviewed?: Date;
    locusStats: { id: string; name: string; concept: string; successRate: number }[];
    weakLoci: string[];
    strongLoci: string[];
  } | null {
    const palace = this.palaces.get(palaceId);
    if (!palace) return null;

    const locusStats = palace.loci.map(l => ({
      id: l.id,
      name: l.name,
      concept: l.concept,
      successRate: l.recallSuccessRate
    }));

    const weakLoci = locusStats
      .filter(l => l.successRate < 70 && l.concept)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5)
      .map(l => l.id);

    const strongLoci = locusStats
      .filter(l => l.successRate >= 90 && l.concept)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)
      .map(l => l.id);

    return {
      reviewCount: palace.reviewCount,
      retentionRate: palace.retentionRate,
      lastReviewed: palace.lastReviewedAt,
      locusStats,
      weakLoci,
      strongLoci
    };
  }

  // Utility methods
  private generateId(): string {
    return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveData(): void {
    try {
      const palacesData = Array.from(this.palaces.entries());
      localStorage.setItem('polymath_memory_palaces', JSON.stringify(palacesData));
      localStorage.setItem('polymath_palace_reviews', JSON.stringify(this.reviewSessions.slice(-100)));
    } catch (error) {
      console.error('Error saving Memory Palace data:', error);
    }
  }

  private loadData(): void {
    try {
      const palacesData = localStorage.getItem('polymath_memory_palaces');
      const reviewsData = localStorage.getItem('polymath_palace_reviews');

      if (palacesData) {
        const parsed = JSON.parse(palacesData);
        for (const [id, palace] of parsed) {
          palace.createdAt = new Date(palace.createdAt);
          if (palace.lastReviewedAt) palace.lastReviewedAt = new Date(palace.lastReviewedAt);
          for (const locus of palace.loci) {
            locus.createdAt = new Date(locus.createdAt);
            if (locus.lastReviewedAt) locus.lastReviewedAt = new Date(locus.lastReviewedAt);
          }
          this.palaces.set(id, palace);
        }
      }

      if (reviewsData) {
        const parsed = JSON.parse(reviewsData);
        for (const session of parsed) {
          session.startTime = new Date(session.startTime);
          if (session.endTime) session.endTime = new Date(session.endTime);
          this.reviewSessions.push(session);
        }
      }
    } catch (error) {
      console.error('Error loading Memory Palace data:', error);
    }
  }
}

