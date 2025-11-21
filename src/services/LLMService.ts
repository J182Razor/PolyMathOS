/**
 * LLM Integration Service
 * Integrates Gemini (for synthesis and long-context), Groq (for speed), and NVIDIA (for performance)
 * Leverages unique qualities of Gemini (like NotebookLM), Groq's fast inference, and NVIDIA's GPU-optimized models
 */
import { NVIDIAAIService } from './NVIDIAAIService';

interface LLMConfig {
  geminiApiKey?: string;
  groqApiKey?: string;
  nvidiaApiKey?: string;
  useGroqForSpeed?: boolean;
  useGeminiForSynthesis?: boolean;
  useNVIDIAForPerformance?: boolean;
}

interface LessonGenerationRequest {
  topic: string;
  userProfile: any;
  previousPerformance?: any;
  context?: string;
}

interface LLMResponse {
  content: string;
  model: 'gemini' | 'groq' | 'nvidia';
  tokensUsed?: number;
  latency?: number;
}

export class LLMService {
  private static instance: LLMService;
  private config: LLMConfig;

  private nvidiaService: NVIDIAAIService;

  private constructor() {
    this.config = {
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
      groqApiKey: import.meta.env.VITE_GROQ_API_KEY,
      nvidiaApiKey: import.meta.env.VITE_NVIDIA_API_KEY,
      useGroqForSpeed: true,
      useGeminiForSynthesis: true,
      useNVIDIAForPerformance: true,
    };
    this.nvidiaService = NVIDIAAIService.getInstance();
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Generate personalized lesson content using Gemini for synthesis
   * Gemini excels at understanding context and creating comprehensive content
   */
  public async generateLessonContent(request: LessonGenerationRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Use NVIDIA for performance-optimized content generation
      if (this.config.useNVIDIAForPerformance && this.nvidiaService.isConfigured()) {
        try {
          return await this.generateWithNVIDIA(request);
        } catch (error) {
          console.warn('NVIDIA API failed, falling back to other providers:', error);
        }
      }

      // Use Gemini for synthesis (like NotebookLM) - better for complex content generation
      if (this.config.useGeminiForSynthesis && this.config.geminiApiKey) {
        return await this.generateWithGemini(request);
      }

      // Fallback to Groq for speed if Gemini not available
      if (this.config.groqApiKey) {
        return await this.generateWithGroq(request);
      }

      // Fallback to mock response if no API keys
      return this.generateMockResponse(request);
    } catch (error) {
      console.error('LLM generation error:', error);
      return this.generateMockResponse(request);
    }
  }

  /**
   * Quick response using fastest available provider
   * Priority: NVIDIA (if configured) > Groq > Gemini
   */
  public async generateQuickResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Try NVIDIA first for GPU-optimized performance
      if (this.nvidiaService.isConfigured() && this.config.useNVIDIAForPerformance) {
        try {
          const content = await this.nvidiaService.generateText(
            prompt,
            'You are an expert learning assistant that provides concise, helpful responses optimized for learning.',
            { temperature: 0.7, max_tokens: 500 }
          );
          return {
            content,
            model: 'nvidia',
            latency: Date.now() - startTime,
          };
        } catch (error) {
          console.warn('NVIDIA quick response failed, falling back:', error);
        }
      }

      // Fallback to Groq for speed
      if (this.config.groqApiKey && this.config.useGroqForSpeed) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are an expert learning assistant that provides concise, helpful responses optimized for learning.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const latency = Date.now() - startTime;
          
          return {
            content: data.choices[0]?.message?.content || '',
            model: 'groq',
            tokensUsed: data.usage?.total_tokens,
            latency,
          };
        }
      }

      // Fallback
      return {
        content: this.generateFallbackResponse(prompt),
        model: 'groq',
        latency: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        content: this.generateFallbackResponse(prompt),
        model: 'groq',
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate with Gemini - excels at synthesis and understanding context
   * Similar to NotebookLM's approach to document understanding
   */
  private async generateWithGemini(request: LessonGenerationRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildGeminiPrompt(request);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.config.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const latency = Date.now() - startTime;
        
        return {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          model: 'gemini',
          tokensUsed: data.usageMetadata?.totalTokenCount,
          latency,
        };
      }

      throw new Error('Gemini API request failed');
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to NVIDIA, Groq, or mock
      if (this.nvidiaService.isConfigured()) {
        try {
          return await this.generateWithNVIDIA(request);
        } catch (error) {
          console.warn('NVIDIA fallback failed:', error);
        }
      }
      if (this.config.groqApiKey) {
        return this.generateWithGroq(request);
      }
      return this.generateMockResponse(request);
    }
  }

  /**
   * Generate with Groq - ultra-fast inference
   */
  private async generateWithGroq(request: LessonGenerationRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildGroqPrompt(request);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator specializing in neuroscience-based learning optimization.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const latency = Date.now() - startTime;
        
        return {
          content: data.choices[0]?.message?.content || '',
          model: 'groq',
          tokensUsed: data.usage?.total_tokens,
          latency,
        };
      }

      throw new Error('Groq API request failed');
    } catch (error) {
      console.error('Groq API error:', error);
      return this.generateMockResponse(request);
    }
  }

  /**
   * Generate with NVIDIA - GPU-optimized performance
   */
  private async generateWithNVIDIA(request: LessonGenerationRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildNVIDIAPrompt(request);
      
      const content = await this.nvidiaService.generateText(
        prompt,
        'You are an expert educational content creator specializing in neuroscience-based learning optimization. Create comprehensive, personalized learning content.',
        {
          temperature: 0.7,
          max_tokens: 2000,
        }
      );

      const latency = Date.now() - startTime;
      
      return {
        content,
        model: 'nvidia',
        latency,
      };
    } catch (error) {
      console.error('NVIDIA API error:', error);
      // Fallback to other providers
      if (this.config.geminiApiKey) {
        return this.generateWithGemini(request);
      }
      if (this.config.groqApiKey) {
        return this.generateWithGroq(request);
      }
      return this.generateMockResponse(request);
    }
  }

  private buildNVIDIAPrompt(request: LessonGenerationRequest): string {
    return `Create a personalized learning lesson on "${request.topic}" optimized for neuroscience-based learning.

User Profile:
- Dopamine sensitivity: ${request.userProfile?.dopamineProfile?.rewardSensitivity || 'moderate'}
- Learning style: ${this.getLearningStyle(request.userProfile)}
- Meta-learning skills: ${this.getMetaLearningLevel(request.userProfile)}
- Goals: ${request.userProfile?.personalGoals?.primaryObjective || 'General learning'}

Requirements:
1. Use first principles thinking to break down the topic
2. Include dopamine-optimized micro-rewards and milestones
3. Apply meta-learning techniques (planning, monitoring, reflection)
4. Use the Feynman technique for explanations
5. Create engaging, personalized content optimized for GPU-accelerated learning

Generate comprehensive lesson content that adapts to this user's cognitive profile and leverages high-performance AI capabilities.`;
  }

  private buildGeminiPrompt(request: LessonGenerationRequest): string {
    return `Create a personalized learning lesson on "${request.topic}" optimized for neuroscience-based learning.

User Profile:
- Dopamine sensitivity: ${request.userProfile?.dopamineProfile?.rewardSensitivity || 'moderate'}
- Learning style: ${this.getLearningStyle(request.userProfile)}
- Meta-learning skills: ${this.getMetaLearningLevel(request.userProfile)}
- Goals: ${request.userProfile?.personalGoals?.primaryObjective || 'General learning'}

Requirements:
1. Use first principles thinking to break down the topic
2. Include dopamine-optimized micro-rewards and milestones
3. Apply meta-learning techniques (planning, monitoring, reflection)
4. Use the Feynman technique for explanations
5. Create engaging, personalized content

Generate comprehensive lesson content that adapts to this user's cognitive profile.`;
  }

  private buildGroqPrompt(request: LessonGenerationRequest): string {
    return `Create a concise, engaging lesson on "${request.topic}" optimized for fast learning and retention.

User Profile:
- Learning style: ${this.getLearningStyle(request.userProfile)}
- Goals: ${request.userProfile?.personalGoals?.primaryObjective || 'General learning'}

Generate lesson content with:
1. Clear explanations
2. Interactive elements
3. Dopamine-optimized structure
4. Practical applications`;
  }

  private getLearningStyle(profile: any): string {
    if (!profile?.learningStylePreferences) return 'balanced';
    
    const prefs = profile.learningStylePreferences;
    if (prefs.visualProcessing >= 4) return 'visual';
    if (prefs.feynmanTechnique >= 4) return 'explanatory';
    if (prefs.firstPrinciplesThinking >= 4) return 'analytical';
    return 'balanced';
  }

  private getMetaLearningLevel(profile: any): string {
    if (!profile?.metaLearningSkills) return 'intermediate';
    
    const avg = Object.values(profile.metaLearningSkills).reduce((a: any, b: any) => a + b, 0) / 4;
    if (avg >= 4) return 'advanced';
    if (avg >= 3) return 'intermediate';
    return 'beginner';
  }

  private generateMockResponse(request: LessonGenerationRequest): LLMResponse {
    return {
      content: `# ${request.topic}: Personalized Learning Experience

## Introduction
Welcome to your personalized learning journey on ${request.topic}! Based on your cognitive profile, we've optimized this lesson for maximum retention and engagement.

## Core Concepts
This lesson will cover the fundamental principles of ${request.topic}, broken down using first principles thinking to ensure deep understanding.

## Interactive Elements
- Practice exercises tailored to your learning style
- Real-time feedback and micro-rewards
- Meta-learning checkpoints for self-assessment

## Next Steps
Complete the exercises and reflect on your learning to unlock the next level.`,
      model: 'gemini',
      latency: 100,
    };
  }

  private generateFallbackResponse(prompt: string): string {
    return `I understand you're asking about: ${prompt}. 

In a production environment with API keys configured, this would generate a comprehensive, personalized response using advanced AI models.

To enable full functionality:
1. Add VITE_GEMINI_API_KEY to your .env file for Gemini integration
2. Add VITE_GROQ_API_KEY to your .env file for Groq integration
3. Add VITE_NVIDIA_API_KEY to your .env file for NVIDIA NIM integration (from build.nvidia.com)

The system will automatically use:
- NVIDIA for GPU-optimized performance (if configured)
- Gemini for complex synthesis (like NotebookLM)
- Groq for ultra-fast responses`;
  }

  /**
   * Analyze user explanation using Feynman technique
   */
  public async analyzeFeynmanExplanation(explanation: string, concept: string): Promise<{
    clarity: number;
    gaps: string[];
    suggestions: string[];
  }> {
    try {
      // Try NVIDIA first for performance
      if (this.nvidiaService.isConfigured() && this.config.useNVIDIAForPerformance) {
        try {
          const prompt = `Analyze this explanation of "${concept}":\n\n${explanation}\n\nProvide: 1) Clarity score (0-100), 2) Knowledge gaps, 3) Improvement suggestions. Return as JSON with keys: clarity (number), gaps (array of strings), suggestions (array of strings).`;
          const content = await this.nvidiaService.generateText(
            prompt,
            'You are an expert educator analyzing student explanations using the Feynman technique. Identify clarity, gaps, and provide constructive feedback. Always return valid JSON.',
            { temperature: 0.5, max_tokens: 500 }
          );
          
          try {
            const analysis = JSON.parse(content);
            return {
              clarity: analysis.clarity || 70,
              gaps: analysis.gaps || [],
              suggestions: analysis.suggestions || [],
            };
          } catch (parseError) {
            // If JSON parsing fails, fall through to other providers
            console.warn('NVIDIA response not valid JSON, falling back:', parseError);
          }
        } catch (error) {
          console.warn('NVIDIA Feynman analysis failed, falling back:', error);
        }
      }

      // Fallback to Groq
      if (this.config.groqApiKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are an expert educator analyzing student explanations using the Feynman technique. Identify clarity, gaps, and provide constructive feedback.'
              },
              {
                role: 'user',
                content: `Analyze this explanation of "${concept}":\n\n${explanation}\n\nProvide: 1) Clarity score (0-100), 2) Knowledge gaps, 3) Improvement suggestions. Return as JSON.`
              }
            ],
            temperature: 0.5,
            max_tokens: 500,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const analysis = JSON.parse(data.choices[0]?.message?.content || '{}');
          return {
            clarity: analysis.clarity || 70,
            gaps: analysis.gaps || [],
            suggestions: analysis.suggestions || [],
          };
        }
      }

      // Fallback analysis
      const wordCount = explanation.split(' ').length;
      const hasSimpleLanguage = !explanation.match(/\b(neurotransmitter|synaptic|neuroplasticity)\b/i);
      
      return {
        clarity: wordCount > 20 && hasSimpleLanguage ? 85 : 60,
        gaps: wordCount < 20 ? ['Explanation is too brief'] : [],
        suggestions: ['Try using analogies', 'Break down complex terms'],
      };
    } catch (error) {
      console.error('Feynman analysis error:', error);
      return {
        clarity: 70,
        gaps: [],
        suggestions: ['Continue practicing explanations'],
      };
    }
  }
}

