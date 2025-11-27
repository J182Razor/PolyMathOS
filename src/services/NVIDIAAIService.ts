/**
 * NVIDIA AI Service
 * Integrates with NVIDIA's NIM (NeMo Inference Microservices) API
 * Provides access to NVIDIA's LLM models via build.nvidia.com
 */

interface NVIDIAConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface NVIDIAChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface NVIDIAChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class NVIDIAAIService {
  private static instance: NVIDIAAIService;
  private config: NVIDIAConfig;

  private constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_NVIDIA_API_KEY,
      baseUrl: import.meta.env.VITE_NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1',
      model: import.meta.env.VITE_NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
    };
  }

  public static getInstance(): NVIDIAAIService {
    if (!NVIDIAAIService.instance) {
      NVIDIAAIService.instance = new NVIDIAAIService();
    }
    return NVIDIAAIService.instance;
  }

  /**
   * Check if NVIDIA API is configured
   */
  public isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Generate chat completion using NVIDIA API
   */
  public async chatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      model?: string;
      apiKey?: string;
    }
  ): Promise<NVIDIAChatResponse> {
    const apiKey = options?.apiKey || this.config.apiKey;
    if (!apiKey) {
      throw new Error('NVIDIA API key not configured. Set VITE_NVIDIA_API_KEY in your .env file or pass it in options');
    }

    const request: NVIDIAChatRequest = {
      model: options?.model || this.config.model || 'meta/llama-3.1-70b-instruct',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      top_p: options?.top_p ?? 0.9,
      stream: false,
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: NVIDIAChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('NVIDIA API request failed:', error);
      throw error;
    }
  }

  /**
   * Generate text completion (simplified interface)
   */
  public async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
      model?: string;
      apiKey?: string;
    }
  ): Promise<string> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.chatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Get available models (if API supports model listing)
   */
  public async getAvailableModels(): Promise<string[]> {
    if (!this.config.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
    } catch (error) {
      console.error('Failed to fetch NVIDIA models:', error);
    }

    // Return default models if API doesn't support listing
    return [
      'meta/llama-3.1-70b-instruct',
      'meta/llama-3.1-8b-instruct',
      'mistralai/mistral-7b-instruct-v0.2',
      'google/gemma-2-9b-it',
      'microsoft/phi-3-mini-4k-instruct',
    ];
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<NVIDIAConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration (without sensitive data)
   */
  public getConfig(): Omit<NVIDIAConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}

