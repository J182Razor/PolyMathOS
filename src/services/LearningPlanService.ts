import { LLMService } from './LLMService';
import { PolymathUser } from '../types/polymath';

export interface LearningSource {
    title: string;
    url: string;
    type: 'video' | 'article' | 'book' | 'course';
    author?: string;
    description?: string;
}

export interface LearningPlan {
    id: string;
    topic: string;
    mode: 'fast' | 'polymath';
    modules: LearningModule[];
    sources: LearningSource[];
    createdAt: Date;
}

export interface LearningModule {
    title: string;
    description: string;
    keyConcepts: string[];
    activities: string[];
    estimatedTime: string; // e.g., "45 mins"
}

export class LearningPlanService {
    private static instance: LearningPlanService;
    private llmService: LLMService;

    private constructor() {
        this.llmService = LLMService.getInstance();
    }

    public static getInstance(): LearningPlanService {
        if (!LearningPlanService.instance) {
            LearningPlanService.instance = new LearningPlanService();
        }
        return LearningPlanService.instance;
    }

    /**
     * Create a learning plan based on the selected mode
     */
    public async createLearningPlan(
        topic: string,
        mode: 'fast' | 'polymath',
        user: PolymathUser
    ): Promise<LearningPlan> {
        if (mode === 'fast') {
            return this.createFastPlan(topic, user);
        } else {
            return this.createPolyMathPlan(topic, user);
        }
    }

    /**
     * Fast Mode: Quick generation using LLM directly
     */
    private async createFastPlan(topic: string, user: PolymathUser): Promise<LearningPlan> {
        const prompt = `Create a structured learning plan for "${topic}".
    User Level: ${user.level}
    Learning Style: ${user.learningStyle}
    Goal: ${user.personalGoals?.primaryObjective || 'General Knowledge'}
    
    Return JSON format with:
    - modules: array of { title, description, keyConcepts (array), activities (array), estimatedTime }
    - sources: array of { title, url, type } (generic recommendations)`;

        const response = await this.llmService.generateQuickResponse(prompt);

        // Parse response (assuming LLM returns JSON or we parse it)
        let parsedContent: any = { modules: [], sources: [] };
        try {
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedContent = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('Failed to parse fast plan JSON', e);
            parsedContent = {
                modules: [
                    {
                        title: 'Introduction to ' + topic,
                        description: 'Core concepts and fundamentals',
                        keyConcepts: ['Basics', 'History', 'Key Terms'],
                        activities: ['Read overview', 'Watch intro video'],
                        estimatedTime: '30 mins'
                    }
                ],
                sources: []
            };
        }

        return {
            id: Date.now().toString(),
            topic,
            mode: 'fast',
            modules: parsedContent.modules || [],
            sources: parsedContent.sources || [],
            createdAt: new Date()
        };
    }

    /**
     * PolyMath Mode: Deep research and comprehensive planning via n8n and MCPs
     */
    private async createPolyMathPlan(topic: string, user: PolymathUser): Promise<LearningPlan> {
        // 1. Initialize Services
        const mcpService = (await import('./MCPService')).MCPService.getInstance();
        let sources: LearningSource[] = [];
        let researchSummary = '';

        // 2. Conduct Deep Research via MCPs
        try {
            console.log('Starting Deep Research for:', topic);
            const deepResearch = await mcpService.conductDeepResearch(topic);
            researchSummary = deepResearch.summary;

            // Convert MCP results to LearningSources
            sources = deepResearch.sources.map(s => ({
                title: s.title,
                url: s.url || '',
                type: 'article', // Default to article, could refine based on source
                description: s.summary
            }));
        } catch (e) {
            console.warn('MCP Research failed, falling back to basic search', e);
            // Fallback to basic search
            sources = await this.findLearningSources(topic);
        }

        // 3. Try to create a custom n8n workflow for this topic
        try {
            const workflowName = `PolyMath Learning: ${topic}`;
            // Simple workflow template: Webhook -> LLM -> Respond
            const nodes = [
                {
                    "parameters": { "path": "webhook", "responseMode": "lastNode", "options": {} },
                    "name": "Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [100, 300]
                },
                {
                    "parameters": {
                        "content": `Generate a deep learning plan for ${topic}. 
                        Research Context: ${researchSummary}
                        User context: ${JSON.stringify(user.personalGoals)}`
                    },
                    "name": "AI Agent",
                    "type": "n8n-nodes-base.agent", // Hypothetical node or use HTTP Request to LLM
                    "typeVersion": 1,
                    "position": [300, 300]
                }
            ];
            const connections = { "Webhook": { "main": [[{ "node": "AI Agent", "type": "main", "index": 0 }]] } };

            const n8n = (await import('./N8NService')).N8NService;
            const workflow = await n8n.createWorkflow(workflowName, nodes, connections);

            if (workflow.success) {
                console.log('Created n8n workflow:', workflow.workflowId);
            }
        } catch (e) {
            console.warn('Failed to create n8n workflow, falling back to internal engine', e);
        }

        // 4. Analyze Sources & Generate Plan (Internal LLM fallback/augmentation)
        const prompt = `Create a comprehensive "PolyMath" learning plan for "${topic}" based on these resources:
    ${sources.map(s => `- ${s.title} (${s.type}): ${s.url}`).join('\n')}
    
    Research Summary: ${researchSummary}
    
    User Profile:
    - Dopamine Sensitivity: ${user.dopamineProfile?.rewardSensitivity || 'Moderate'}
    - Meta-Learning: ${user.metaLearningSkills ? 'Assessed' : 'Unknown'}
    
    Requirements:
    - Deep dive into first principles
    - Cross-disciplinary connections
    - Project-based application
    
    Return JSON format with:
    - modules: array of { title, description, keyConcepts, activities, estimatedTime }`;

        const response = await this.llmService.generateLessonContent({
            topic,
            userProfile: user,
            context: prompt
        });

        let modules: LearningModule[] = [];
        try {
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                modules = parsed.modules || [];
            }
        } catch (e) {
            console.warn('Failed to parse PolyMath plan JSON', e);
            modules = [
                {
                    title: 'Deep Dive into ' + topic,
                    description: 'Advanced analysis and application',
                    keyConcepts: ['First Principles', 'System Architecture', 'Advanced Patterns'],
                    activities: ['Build a project', 'Teach a concept', 'Analyze case studies'],
                    estimatedTime: '2 hours'
                }
            ];
        }

        return {
            id: Date.now().toString(),
            topic,
            mode: 'polymath',
            modules,
            sources,
            createdAt: new Date()
        };
    }

    /**
     * Find high-quality learning sources
     */
    public async findLearningSources(topic: string): Promise<LearningSource[]> {
        const prompt = `List 5 high-quality, real learning resources for "${topic}".
    Include: 1 Book, 1 Video/Course, 1 Article/Paper, 2 others.
    Return JSON: [{ title, url, type, author, description }]`;

        const response = await this.llmService.generateQuickResponse(prompt);

        try {
            const jsonMatch = response.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Fallback
        }

        return [
            {
                title: `${topic}: The Definitive Guide`,
                url: `https://example.com/learn/${topic.replace(/\s+/g, '-').toLowerCase()}`,
                type: 'article',
                description: 'Comprehensive overview of core concepts.'
            },
            {
                title: `Mastering ${topic}`,
                url: 'https://youtube.com/results?search_query=' + encodeURIComponent(topic),
                type: 'video',
                description: 'Deep dive video series.'
            }
        ];
    }
}
