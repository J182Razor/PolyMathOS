/**
 * Zettelkasten Service - Knowledge Graph Management
 * Based on Niklas Luhmann's slip-box method and joshylchen/zettelkasten
 * 
 * Implements the Luhmann Method for networked knowledge:
 * - Fleeting notes: Quick capture of ideas
 * - Literature notes: Notes from sources
 * - Permanent notes: Refined, connected ideas
 * 
 * Features:
 * - AI elaboration interviews to deepen understanding
 * - Automatic connection suggestions via HDAM
 * - Evergreen note evolution tracking
 * - Integration with Feynman technique scoring
 */

import { LLMService } from './LLMService';

export type NoteType = 'fleeting' | 'literature' | 'permanent';
export type NoteMaturity = 'seedling' | 'budding' | 'evergreen';

export interface Zettel {
  id: string;                     // Luhmann-style ID (e.g., "1a2b3")
  title: string;
  content: string;
  type: NoteType;
  maturity: NoteMaturity;
  links: string[];                // Bi-directional links to other notes
  backlinks: string[];            // Notes that link to this one
  tags: string[];
  source?: ZettelSource;          // For literature notes
  createdAt: Date;
  updatedAt: Date;
  elaborationScore: number;       // How well-developed (0-100)
  feynmanScore?: number;          // Feynman explanation quality (0-100)
  memoryPalaceLocus?: string;     // Associated memory palace location
  reviewCount: number;
  lastReviewedAt?: Date;
  elaborationHistory: ElaborationEvent[];
}

export interface ZettelSource {
  type: 'book' | 'article' | 'video' | 'podcast' | 'website' | 'other';
  title: string;
  author?: string;
  url?: string;
  page?: string;
  timestamp?: string;
  notes?: string;
}

export interface ElaborationEvent {
  timestamp: Date;
  type: 'ai_interview' | 'manual_edit' | 'connection_added' | 'feynman_session';
  description: string;
  scoreBefore: number;
  scoreAfter: number;
}

export interface TopicCluster {
  id: string;
  name: string;
  noteIds: string[];
  centralConcepts: string[];
  strength: number; // 0-1 cluster cohesion
}

export interface KnowledgeGraph {
  nodes: Map<string, Zettel>;
  edges: Map<string, Set<string>>; // Note ID -> Set of connected note IDs
  clusters: TopicCluster[];
  statistics: KnowledgeGraphStats;
}

export interface KnowledgeGraphStats {
  totalNotes: number;
  notesByType: Record<NoteType, number>;
  notesByMaturity: Record<NoteMaturity, number>;
  totalConnections: number;
  averageConnections: number;
  orphanNotes: number;           // Notes with no connections
  mostConnectedNotes: string[];  // Top 5 hub notes
  recentlyUpdated: string[];     // Last 10 updated notes
}

export interface AIElaborationQuestion {
  question: string;
  purpose: 'clarify' | 'deepen' | 'connect' | 'challenge';
  suggestedConnections?: string[]; // Note IDs that might be related
}

export interface ElaborationSession {
  id: string;
  noteId: string;
  questions: AIElaborationQuestion[];
  answers: { questionIndex: number; answer: string }[];
  suggestedEdits: string[];
  suggestedConnections: string[];
  completedAt?: Date;
}

export interface ConnectionSuggestion {
  fromNoteId: string;
  toNoteId: string;
  reason: string;
  strength: number; // 0-1 confidence
  connectionType: 'supports' | 'contradicts' | 'extends' | 'related' | 'prerequisite';
}

// Luhmann-style ID generation
class LuhmannIdGenerator {
  private static counters: Map<string, number> = new Map();

  static generate(parentId?: string): string {
    if (!parentId) {
      // Top-level note
      const topCount = this.counters.get('top') || 0;
      this.counters.set('top', topCount + 1);
      return String(topCount + 1);
    }

    // Child note - add letter suffix
    const childCount = this.counters.get(parentId) || 0;
    this.counters.set(parentId, childCount + 1);
    const letter = String.fromCharCode(97 + (childCount % 26)); // a-z
    const number = Math.floor(childCount / 26);
    return `${parentId}${letter}${number > 0 ? number : ''}`;
  }

  static reset(): void {
    this.counters.clear();
  }
}

export class ZettelkastenService {
  private static instance: ZettelkastenService;
  private llmService: LLMService;
  
  private notes: Map<string, Zettel> = new Map();
  private edges: Map<string, Set<string>> = new Map();
  private clusters: TopicCluster[] = [];
  private elaborationSessions: Map<string, ElaborationSession> = new Map();

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.loadData();
  }

  public static getInstance(): ZettelkastenService {
    if (!ZettelkastenService.instance) {
      ZettelkastenService.instance = new ZettelkastenService();
    }
    return ZettelkastenService.instance;
  }

  /**
   * Create a new note
   */
  public async createNote(
    title: string,
    content: string,
    type: NoteType,
    options?: {
      parentId?: string;
      tags?: string[];
      source?: ZettelSource;
      links?: string[];
    }
  ): Promise<Zettel> {
    const id = LuhmannIdGenerator.generate(options?.parentId);
    
    const note: Zettel = {
      id,
      title,
      content,
      type,
      maturity: 'seedling',
      links: options?.links || [],
      backlinks: [],
      tags: options?.tags || [],
      source: options?.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      elaborationScore: this.calculateInitialElaborationScore(content),
      reviewCount: 0,
      elaborationHistory: [{
        timestamp: new Date(),
        type: 'manual_edit',
        description: 'Note created',
        scoreBefore: 0,
        scoreAfter: this.calculateInitialElaborationScore(content)
      }]
    };

    // Add to graph
    this.notes.set(id, note);
    this.edges.set(id, new Set(options?.links || []));

    // Update backlinks for linked notes
    for (const linkedId of options?.links || []) {
      const linkedNote = this.notes.get(linkedId);
      if (linkedNote) {
        linkedNote.backlinks.push(id);
        this.edges.get(linkedId)?.add(id);
      }
    }

    // Try to find automatic connections
    const suggestions = await this.suggestConnections(id);
    if (suggestions.length > 0) {
      note.elaborationHistory.push({
        timestamp: new Date(),
        type: 'connection_added',
        description: `Found ${suggestions.length} potential connections`,
        scoreBefore: note.elaborationScore,
        scoreAfter: note.elaborationScore
      });
    }

    this.saveData();
    return note;
  }

  /**
   * Update an existing note
   */
  public updateNote(
    id: string,
    updates: Partial<Pick<Zettel, 'title' | 'content' | 'type' | 'tags' | 'source'>>
  ): Zettel | null {
    const note = this.notes.get(id);
    if (!note) return null;

    const oldScore = note.elaborationScore;

    if (updates.title !== undefined) note.title = updates.title;
    if (updates.content !== undefined) {
      note.content = updates.content;
      note.elaborationScore = this.calculateElaborationScore(note);
    }
    if (updates.type !== undefined) note.type = updates.type;
    if (updates.tags !== undefined) note.tags = updates.tags;
    if (updates.source !== undefined) note.source = updates.source;

    note.updatedAt = new Date();
    note.maturity = this.calculateMaturity(note);

    // Record edit
    note.elaborationHistory.push({
      timestamp: new Date(),
      type: 'manual_edit',
      description: 'Note updated',
      scoreBefore: oldScore,
      scoreAfter: note.elaborationScore
    });

    this.saveData();
    return note;
  }

  /**
   * Add a connection between notes
   */
  public addConnection(fromId: string, toId: string): boolean {
    const fromNote = this.notes.get(fromId);
    const toNote = this.notes.get(toId);
    
    if (!fromNote || !toNote) return false;

    // Add link
    if (!fromNote.links.includes(toId)) {
      fromNote.links.push(toId);
      this.edges.get(fromId)?.add(toId);
    }

    // Add backlink
    if (!toNote.backlinks.includes(fromId)) {
      toNote.backlinks.push(fromId);
      this.edges.get(toId)?.add(fromId);
    }

    // Update elaboration scores
    const oldFromScore = fromNote.elaborationScore;
    fromNote.elaborationScore = this.calculateElaborationScore(fromNote);
    fromNote.elaborationHistory.push({
      timestamp: new Date(),
      type: 'connection_added',
      description: `Connected to "${toNote.title}"`,
      scoreBefore: oldFromScore,
      scoreAfter: fromNote.elaborationScore
    });

    fromNote.updatedAt = new Date();
    toNote.updatedAt = new Date();

    this.saveData();
    return true;
  }

  /**
   * Start an AI elaboration interview session
   * Based on zettelkasten repo's agent approach
   */
  public async startElaborationSession(noteId: string): Promise<ElaborationSession> {
    const note = this.notes.get(noteId);
    if (!note) throw new Error(`Note ${noteId} not found`);

    // Generate interview questions using AI
    const questions = await this.generateElaborationQuestions(note);

    const session: ElaborationSession = {
      id: `elab_${Date.now()}`,
      noteId,
      questions,
      answers: [],
      suggestedEdits: [],
      suggestedConnections: []
    };

    this.elaborationSessions.set(session.id, session);
    return session;
  }

  /**
   * Generate elaboration questions using AI
   */
  private async generateElaborationQuestions(note: Zettel): Promise<AIElaborationQuestion[]> {
    const connectedNotes = note.links.map(id => this.notes.get(id)?.title).filter(Boolean);
    
    try {
      const prompt = `You are an expert interviewer helping someone deepen their understanding of a concept.

Note Title: ${note.title}
Note Content: ${note.content}
Connected Notes: ${connectedNotes.join(', ') || 'None yet'}
Note Type: ${note.type}

Generate 5 interview questions that will help the user:
1. CLARIFY - Make the concept clearer and more precise
2. DEEPEN - Explore the concept more thoroughly  
3. CONNECT - Find relationships to other ideas
4. CHALLENGE - Question assumptions and find edge cases
5. APPLY - Think about practical applications

Respond in JSON format:
{
  "questions": [
    {
      "question": "The interview question",
      "purpose": "clarify|deepen|connect|challenge"
    }
  ]
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || this.getDefaultQuestions(note);
      }
    } catch (error) {
      console.warn('AI question generation failed:', error);
    }

    return this.getDefaultQuestions(note);
  }

  /**
   * Default elaboration questions if AI fails
   */
  private getDefaultQuestions(note: Zettel): AIElaborationQuestion[] {
    return [
      {
        question: `Can you explain "${note.title}" as if teaching it to a 12-year-old?`,
        purpose: 'clarify'
      },
      {
        question: `What are the most important aspects of ${note.title} that aren't captured in your note yet?`,
        purpose: 'deepen'
      },
      {
        question: `What other concepts or ideas does ${note.title} remind you of or connect to?`,
        purpose: 'connect'
      },
      {
        question: `What assumptions are you making about ${note.title}? Could any of them be wrong?`,
        purpose: 'challenge'
      },
      {
        question: `How would you apply ${note.title} in a real-world situation?`,
        purpose: 'connect'
      }
    ];
  }

  /**
   * Submit an answer to an elaboration question
   */
  public async submitElaborationAnswer(
    sessionId: string,
    questionIndex: number,
    answer: string
  ): Promise<{
    feedback: string;
    suggestedEdits: string[];
    suggestedConnections: ConnectionSuggestion[];
  }> {
    const session = this.elaborationSessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const note = this.notes.get(session.noteId);
    if (!note) throw new Error(`Note ${session.noteId} not found`);

    // Record answer
    session.answers.push({ questionIndex, answer });

    // Analyze answer with AI
    const question = session.questions[questionIndex];
    
    try {
      const prompt = `Analyze this elaboration answer for a Zettelkasten note:

Original Note: "${note.title}"
Content: ${note.content}

Question (${question.purpose}): ${question.question}
Answer: ${answer}

Provide:
1. Brief feedback on the answer
2. Suggested edits to improve the original note based on this answer
3. Potential connections to other concepts mentioned

Respond in JSON:
{
  "feedback": "Your feedback here",
  "suggestedEdits": ["Edit suggestion 1", "Edit suggestion 2"],
  "suggestedConnections": ["Concept 1", "Concept 2"]
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        session.suggestedEdits.push(...(parsed.suggestedEdits || []));
        
        // Find existing notes that match suggested connections
        const connectionSuggestions: ConnectionSuggestion[] = [];
        for (const concept of parsed.suggestedConnections || []) {
          const matchingNote = this.findNoteByContent(concept);
          if (matchingNote && matchingNote.id !== note.id) {
            connectionSuggestions.push({
              fromNoteId: note.id,
              toNoteId: matchingNote.id,
              reason: `Related concept: ${concept}`,
              strength: 0.7,
              connectionType: 'related'
            });
          }
        }
        session.suggestedConnections.push(...connectionSuggestions.map(c => c.toNoteId));

        return {
          feedback: parsed.feedback || 'Answer recorded.',
          suggestedEdits: parsed.suggestedEdits || [],
          suggestedConnections: connectionSuggestions
        };
      }
    } catch (error) {
      console.warn('AI answer analysis failed:', error);
    }

    return {
      feedback: 'Answer recorded. Consider how this insight might improve your note.',
      suggestedEdits: [],
      suggestedConnections: []
    };
  }

  /**
   * Complete an elaboration session and apply improvements
   */
  public completeElaborationSession(
    sessionId: string,
    applyEdits: boolean = false,
    applyConnections: boolean = false
  ): Zettel | null {
    const session = this.elaborationSessions.get(sessionId);
    if (!session) return null;

    const note = this.notes.get(session.noteId);
    if (!note) return null;

    const oldScore = note.elaborationScore;

    // Apply suggested edits
    if (applyEdits && session.suggestedEdits.length > 0) {
      note.content += '\n\n## Elaborations\n' + session.suggestedEdits.join('\n');
    }

    // Apply suggested connections
    if (applyConnections) {
      for (const connectionId of session.suggestedConnections) {
        this.addConnection(note.id, connectionId);
      }
    }

    // Update elaboration score and history
    note.elaborationScore = this.calculateElaborationScore(note);
    note.elaborationHistory.push({
      timestamp: new Date(),
      type: 'ai_interview',
      description: `Completed elaboration session with ${session.answers.length} answers`,
      scoreBefore: oldScore,
      scoreAfter: note.elaborationScore
    });

    note.updatedAt = new Date();
    note.maturity = this.calculateMaturity(note);
    session.completedAt = new Date();

    this.saveData();
    return note;
  }

  /**
   * Suggest connections for a note using semantic similarity
   */
  public async suggestConnections(noteId: string): Promise<ConnectionSuggestion[]> {
    const note = this.notes.get(noteId);
    if (!note) return [];

    const suggestions: ConnectionSuggestion[] = [];
    const noteContent = `${note.title} ${note.content}`.toLowerCase();

    // Simple keyword-based matching (would use HDAM for better results)
    for (const [id, otherNote] of this.notes) {
      if (id === noteId) continue;
      if (note.links.includes(id)) continue; // Already connected

      const otherContent = `${otherNote.title} ${otherNote.content}`.toLowerCase();
      
      // Calculate simple similarity
      const noteWords = new Set(noteContent.split(/\s+/).filter(w => w.length > 4));
      const otherWords = new Set(otherContent.split(/\s+/).filter(w => w.length > 4));
      
      let matches = 0;
      for (const word of noteWords) {
        if (otherWords.has(word)) matches++;
      }
      
      const similarity = noteWords.size > 0 ? matches / noteWords.size : 0;
      
      if (similarity > 0.1) { // At least 10% word overlap
        suggestions.push({
          fromNoteId: noteId,
          toNoteId: id,
          reason: `Shares ${matches} key concepts`,
          strength: Math.min(similarity * 2, 1), // Normalize to 0-1
          connectionType: 'related'
        });
      }
    }

    // Sort by strength and return top 5
    return suggestions
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
  }

  /**
   * Search notes
   */
  public searchNotes(query: string): Zettel[] {
    const queryLower = query.toLowerCase();
    const results: { note: Zettel; score: number }[] = [];

    for (const note of this.notes.values()) {
      let score = 0;
      
      // Title match (highest weight)
      if (note.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Content match
      if (note.content.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Tag match
      for (const tag of note.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 3;
        }
      }

      if (score > 0) {
        results.push({ note, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.note);
  }

  /**
   * Get notes by type
   */
  public getNotesByType(type: NoteType): Zettel[] {
    return Array.from(this.notes.values()).filter(n => n.type === type);
  }

  /**
   * Get notes by maturity
   */
  public getNotesByMaturity(maturity: NoteMaturity): Zettel[] {
    return Array.from(this.notes.values()).filter(n => n.maturity === maturity);
  }

  /**
   * Get all notes
   */
  public getAllNotes(): Zettel[] {
    return Array.from(this.notes.values());
  }

  /**
   * Get a single note
   */
  public getNote(id: string): Zettel | undefined {
    return this.notes.get(id);
  }

  /**
   * Get knowledge graph statistics
   */
  public getStatistics(): KnowledgeGraphStats {
    const notes = Array.from(this.notes.values());
    
    const notesByType: Record<NoteType, number> = {
      fleeting: 0, literature: 0, permanent: 0
    };
    const notesByMaturity: Record<NoteMaturity, number> = {
      seedling: 0, budding: 0, evergreen: 0
    };
    
    let totalConnections = 0;
    const orphanNotes: string[] = [];
    const connectionCounts: { id: string; count: number }[] = [];

    for (const note of notes) {
      notesByType[note.type]++;
      notesByMaturity[note.maturity]++;
      
      const connections = note.links.length + note.backlinks.length;
      totalConnections += note.links.length; // Only count outgoing to avoid double counting
      
      if (connections === 0) {
        orphanNotes.push(note.id);
      }
      
      connectionCounts.push({ id: note.id, count: connections });
    }

    // Sort by connections to get most connected
    connectionCounts.sort((a, b) => b.count - a.count);
    const mostConnectedNotes = connectionCounts.slice(0, 5).map(c => c.id);

    // Get recently updated
    const recentlyUpdated = notes
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
      .map(n => n.id);

    return {
      totalNotes: notes.length,
      notesByType,
      notesByMaturity,
      totalConnections,
      averageConnections: notes.length > 0 ? totalConnections / notes.length : 0,
      orphanNotes: orphanNotes.length,
      mostConnectedNotes,
      recentlyUpdated
    };
  }

  /**
   * Get knowledge graph for visualization
   */
  public getKnowledgeGraph(): KnowledgeGraph {
    return {
      nodes: this.notes,
      edges: this.edges,
      clusters: this.clusters,
      statistics: this.getStatistics()
    };
  }

  /**
   * Find note by content match
   */
  private findNoteByContent(searchTerm: string): Zettel | null {
    const termLower = searchTerm.toLowerCase();
    
    for (const note of this.notes.values()) {
      if (note.title.toLowerCase().includes(termLower) ||
          note.content.toLowerCase().includes(termLower)) {
        return note;
      }
    }
    
    return null;
  }

  /**
   * Calculate initial elaboration score based on content
   */
  private calculateInitialElaborationScore(content: string): number {
    let score = 0;
    
    // Length (max 30 points)
    score += Math.min(content.length / 50, 30);
    
    // Has structure (headings, lists) (max 20 points)
    if (content.includes('#')) score += 10;
    if (content.includes('-') || content.includes('*')) score += 10;
    
    // Has examples (max 20 points)
    if (content.toLowerCase().includes('example') || 
        content.toLowerCase().includes('for instance')) {
      score += 20;
    }
    
    // Has questions (indicates thinking) (max 10 points)
    if (content.includes('?')) score += 10;
    
    return Math.min(Math.round(score), 60); // Max 60 for new notes
  }

  /**
   * Calculate elaboration score for a note
   */
  private calculateElaborationScore(note: Zettel): number {
    let score = this.calculateInitialElaborationScore(note.content);
    
    // Connections bonus (max 20 points)
    score += Math.min((note.links.length + note.backlinks.length) * 5, 20);
    
    // Feynman score bonus (max 20 points)
    if (note.feynmanScore) {
      score += note.feynmanScore * 0.2;
    }
    
    // Maturity bonus
    if (note.maturity === 'budding') score += 5;
    if (note.maturity === 'evergreen') score += 10;
    
    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate note maturity based on elaboration and time
   */
  private calculateMaturity(note: Zettel): NoteMaturity {
    const daysSinceCreation = (Date.now() - note.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const hasConnections = note.links.length > 0 || note.backlinks.length > 0;
    const hasMultipleEdits = note.elaborationHistory.length > 2;
    
    if (note.elaborationScore >= 80 && daysSinceCreation >= 7 && hasConnections && hasMultipleEdits) {
      return 'evergreen';
    }
    
    if (note.elaborationScore >= 50 && (hasConnections || hasMultipleEdits)) {
      return 'budding';
    }
    
    return 'seedling';
  }

  /**
   * Delete a note
   */
  public deleteNote(id: string): boolean {
    const note = this.notes.get(id);
    if (!note) return false;

    // Remove from other notes' links/backlinks
    for (const linkedId of note.links) {
      const linkedNote = this.notes.get(linkedId);
      if (linkedNote) {
        linkedNote.backlinks = linkedNote.backlinks.filter(bid => bid !== id);
      }
    }
    
    for (const backlinkId of note.backlinks) {
      const backlinkNote = this.notes.get(backlinkId);
      if (backlinkNote) {
        backlinkNote.links = backlinkNote.links.filter(lid => lid !== id);
      }
    }

    this.notes.delete(id);
    this.edges.delete(id);
    this.saveData();
    return true;
  }

  /**
   * Export notes for backup
   */
  public exportNotes(): Zettel[] {
    return Array.from(this.notes.values());
  }

  /**
   * Import notes
   */
  public importNotes(notes: Partial<Zettel>[]): number {
    let imported = 0;
    
    for (const noteData of notes) {
      if (!noteData.title || !noteData.content) continue;
      
      const id = noteData.id || LuhmannIdGenerator.generate();
      const note: Zettel = {
        id,
        title: noteData.title,
        content: noteData.content,
        type: noteData.type || 'permanent',
        maturity: noteData.maturity || 'seedling',
        links: noteData.links || [],
        backlinks: noteData.backlinks || [],
        tags: noteData.tags || [],
        source: noteData.source,
        createdAt: noteData.createdAt ? new Date(noteData.createdAt) : new Date(),
        updatedAt: noteData.updatedAt ? new Date(noteData.updatedAt) : new Date(),
        elaborationScore: noteData.elaborationScore || 50,
        feynmanScore: noteData.feynmanScore,
        memoryPalaceLocus: noteData.memoryPalaceLocus,
        reviewCount: noteData.reviewCount || 0,
        lastReviewedAt: noteData.lastReviewedAt ? new Date(noteData.lastReviewedAt) : undefined,
        elaborationHistory: noteData.elaborationHistory || []
      };
      
      this.notes.set(id, note);
      this.edges.set(id, new Set(note.links));
      imported++;
    }
    
    this.saveData();
    return imported;
  }

  // Persistence methods
  private saveData(): void {
    try {
      const notesData = Array.from(this.notes.entries()).map(([id, note]) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        lastReviewedAt: note.lastReviewedAt?.toISOString(),
        elaborationHistory: note.elaborationHistory.map(e => ({
          ...e,
          timestamp: e.timestamp.toISOString()
        }))
      }));
      
      localStorage.setItem('polymath_zettelkasten', JSON.stringify(notesData));
    } catch (error) {
      console.error('Error saving Zettelkasten:', error);
    }
  }

  private loadData(): void {
    try {
      const data = localStorage.getItem('polymath_zettelkasten');
      if (data) {
        const notesData = JSON.parse(data);
        for (const noteData of notesData) {
          const note: Zettel = {
            ...noteData,
            createdAt: new Date(noteData.createdAt),
            updatedAt: new Date(noteData.updatedAt),
            lastReviewedAt: noteData.lastReviewedAt ? new Date(noteData.lastReviewedAt) : undefined,
            elaborationHistory: (noteData.elaborationHistory || []).map((e: any) => ({
              ...e,
              timestamp: new Date(e.timestamp)
            }))
          };
          this.notes.set(note.id, note);
          this.edges.set(note.id, new Set(note.links));
        }
      }
    } catch (error) {
      console.error('Error loading Zettelkasten:', error);
    }
  }
}

