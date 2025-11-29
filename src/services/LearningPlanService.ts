import { PolymathUser } from '../types/polymath';
import { dynamicWorkflowService } from './DynamicWorkflowService';

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
    private API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    private constructor() { }

    public static getInstance(): LearningPlanService {
        if (!LearningPlanService.instance) {
            LearningPlanService.instance = new LearningPlanService();
        }
        return LearningPlanService.instance;
    }

    /**
     * Create a learning plan via the backend API
     */
    public async createLearningPlan(
        topic: string,
        mode: 'fast' | 'polymath',
        user: PolymathUser
    ): Promise<LearningPlan> {
        try {
            // Map frontend user preferences to backend request
            const requestBody = {
                user_id: user.id || 'default_user', // Ensure we have a user ID
                goals: {
                    topic: topic,
                    subtopics: [],
                    goal_type: 'mastery',
                    timeframe: '1 month',
                    daily_time_minutes: 60,
                    target_comprehension: 85,
                    include_feynman: true,
                    include_memory_palace: true,
                    include_zettelkasten: true
                },
                archetype: 'physicist' // Default or derive from user profile
            };

            const response = await fetch(`${this.API_URL}/api/learning/plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth token if available
                    // 'Authorization': `Bearer ${localStorage.getItem('polymath_auth_token')}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to create learning plan: ${response.statusText}`);
            }

            const planData = await response.json();

            // If workflow IDs are present, workflows are already created
            // The plan now includes dynamic workflows for adaptation
            const plan: LearningPlan = {
                id: planData.id,
                topic: planData.goals.topic,
                mode: mode,
                modules: this.mapPhasesToModules(planData.phases),
                sources: [], // Backend might not return sources in the same format yet, or we need to extract them
                createdAt: new Date(planData.created_at)
            };

            // Store workflow IDs for future adaptations
            if (planData.workflow_id) {
                (plan as any).workflowId = planData.workflow_id;
            }
            if (planData.multi_phase_workflow_id) {
                (plan as any).multiPhaseWorkflowId = planData.multi_phase_workflow_id;
            }
            if (planData.assessment_workflow_id) {
                (plan as any).assessmentWorkflowId = planData.assessment_workflow_id;
            }

            return plan;

        } catch (error) {
            console.error('Error creating learning plan:', error);
            // Fallback to a basic plan if API fails
            return {
                id: Date.now().toString(),
                topic,
                mode,
                modules: [
                    {
                        title: 'Introduction to ' + topic,
                        description: 'Core concepts and fundamentals (Offline Fallback)',
                        keyConcepts: ['Basics', 'History'],
                        activities: ['Read overview'],
                        estimatedTime: '30 mins'
                    }
                ],
                sources: [],
                createdAt: new Date()
            };
        }
    }

    private mapPhasesToModules(phases: any[]): LearningModule[] {
        return phases.map(phase => ({
            title: phase.name,
            description: phase.description,
            keyConcepts: phase.objectives || [],
            activities: phase.activities || [],
            estimatedTime: `${phase.estimated_days} days`
        }));
    }

    /**
     * Find high-quality learning sources (Placeholder or API call)
     */
    public async findLearningSources(topic: string): Promise<LearningSource[]> {
        // This could also be an API call if implemented on backend
        return [
            {
                title: `${topic}: The Definitive Guide`,
                url: `https://example.com/learn/${topic.replace(/\s+/g, '-').toLowerCase()}`,
                type: 'article',
                description: 'Comprehensive overview of core concepts.'
            }
        ];
    }
}
