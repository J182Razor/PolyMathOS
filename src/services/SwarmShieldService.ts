/**
 * SwarmShield Service
 * Service for interacting with SwarmShield security operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ProtectMessageRequest {
  agent_name: string;
  message: string;
}

export interface CreateConversationRequest {
  name: string;
}

export interface AddMessageRequest {
  conversation_id: string;
  agent_name: string;
  message: string;
}

class SwarmShieldService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/security`;
  }

  async protectMessage(request: ProtectMessageRequest) {
    const response = await fetch(`${this.baseUrl}/shield/protect-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`SwarmShield protect message failed: ${response.statusText}`);
    return response.json();
  }

  async createConversation(request: CreateConversationRequest) {
    const response = await fetch(`${this.baseUrl}/shield/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`SwarmShield create conversation failed: ${response.statusText}`);
    return response.json();
  }

  async getConversation(conversationId: string) {
    const response = await fetch(`${this.baseUrl}/shield/conversations/${conversationId}`);
    if (!response.ok) throw new Error(`SwarmShield get conversation failed: ${response.statusText}`);
    return response.json();
  }

  async getStatus() {
    const response = await fetch(`${this.baseUrl}/shield/status`);
    if (!response.ok) throw new Error(`SwarmShield status failed: ${response.statusText}`);
    return response.json();
  }
}

export const swarmShieldService = new SwarmShieldService();

