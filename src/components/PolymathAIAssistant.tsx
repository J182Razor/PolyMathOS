/**
 * Polymath AI Assistant Component
 * Interactive AI assistant for cognitive acceleration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { PolymathAIService, SessionType } from '../services/PolymathAIService';
import { UserProfilerService } from '../services/UserProfilerService';
import { NLPCoachService } from '../services/NLPCoachService';
import { useUser } from '../hooks/useAppState';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const PolymathAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiService = PolymathAIService.getInstance();
  const profilerService = UserProfilerService.getInstance();
  const coachService = NLPCoachService.getInstance();
  const currentUser = useUser(); // Reactive user state

  useEffect(() => {
    // Check if user is already registered
    if (currentUser) {
      setUserRegistered(true);
      addMessage('assistant', `Welcome back, ${currentUser.name}! Ready to accelerate your learning?`);
    } else {
      addMessage('assistant', '🤖 Welcome to PolymathOS AI! Type "register [your name]" to begin your cognitive acceleration journey.');
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();

    // Registration
    if (lowerCommand.startsWith('register ')) {
      const name = command.substring(9).trim();
      if (name) {
        setIsLoading(true);
        try {
          const result = await aiService.registerUser(name);
          setUserRegistered(true);
          addMessage('assistant', result.message);
        } catch (error) {
          addMessage('assistant', 'Error registering user. Please try again.');
        }
        setIsLoading(false);
        return;
      }
    }

    // Setup domains
    if (lowerCommand.startsWith('setup ')) {
      const parts = command.split(' ').slice(1);
      if (parts.length >= 3) {
        setIsLoading(true);
        try {
          const result = aiService.setupDomains(parts[0], parts[1], parts[2]);
          addMessage('assistant', result);
        } catch (error) {
          addMessage('assistant', 'Error setting up domains. Please try again.');
        }
        setIsLoading(false);
        return;
      }
    }

    // Optimization commands
    if (lowerCommand === 'optimize' || lowerCommand === 'plan') {
      setIsLoading(true);
      try {
        const plan = await aiService.getAccelerationPlan();
        addMessage('assistant', plan);
      } catch (error) {
        addMessage('assistant', 'Error generating plan. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    // Execute sessions
    if (lowerCommand === 'execute' || lowerCommand === 'start') {
      setIsLoading(true);
      try {
        const result = await aiService.executeOptimizedSession(SessionType.IMAGE_STREAMING);
        addMessage('assistant', result);
      } catch (error) {
        addMessage('assistant', 'Error executing session. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    if (lowerCommand.includes('image') || lowerCommand.includes('stream')) {
      setIsLoading(true);
      try {
        const result = await aiService.executeOptimizedSession(SessionType.IMAGE_STREAMING);
        addMessage('assistant', result);
      } catch (error) {
        addMessage('assistant', 'Error executing image streaming. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    if (lowerCommand.includes('memory') || lowerCommand.includes('palace')) {
      setIsLoading(true);
      try {
        const result = await aiService.executeOptimizedSession(SessionType.MEMORY_PALACE);
        addMessage('assistant', result);
      } catch (error) {
        addMessage('assistant', 'Error executing memory palace. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    if (lowerCommand.includes('deep') || lowerCommand.includes('practice')) {
      setIsLoading(true);
      try {
        const result = await aiService.executeOptimizedSession(SessionType.DEEP_PRACTICE);
        addMessage('assistant', result);
      } catch (error) {
        addMessage('assistant', 'Error executing deep practice. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    if (lowerCommand.includes('creative') || lowerCommand.includes('synthesis')) {
      setIsLoading(true);
      try {
        const result = await aiService.executeOptimizedSession(SessionType.CREATIVE_SYNTHESIS);
        addMessage('assistant', result);
      } catch (error) {
        addMessage('assistant', 'Error executing creative synthesis. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    // Analysis commands
    if (lowerCommand === 'analyze' || lowerCommand === 'efficiency' || lowerCommand === 'stats') {
      setIsLoading(true);
      try {
        const report = await aiService.provideOptimizationReport();
        addMessage('assistant', report);
      } catch (error) {
        addMessage('assistant', 'Error generating report. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    // Help command
    if (lowerCommand === 'help' || lowerCommand === 'commands') {
      const helpText = `
🤖 POLYMATHOS AI COMMAND CENTER

CORE FUNCTIONS:
• register [name] - Initialize your cognitive profile
• setup [P] [S1] [S2] - Configure knowledge domains
• optimize - Get personalized acceleration plan
• execute - Run full optimization cycle
• analyze - View efficiency metrics

SPECIALIZED SESSIONS:
• image_streaming - Consciousness expansion protocol
• memory_palace - Memory architecture construction
• deep_practice - Skill amplification sequence
• creative_synthesis - Innovation fusion reactor

ANALYTICS:
• efficiency - Performance optimization report
• stats - Real-time cognitive metrics

What would you like to accelerate today?
`;
      addMessage('assistant', helpText);
      return;
    }

    // Default: Get AI coaching feedback
    setIsLoading(true);
    try {
      const user = aiService.getCurrentUser();
      const context = {
        learningStyle: user?.learningStyle,
        currentDomain: user ? Object.keys(user.domains)[0] : undefined,
      };
      const feedback = await coachService.generateFeedback(command, context);
      addMessage('assistant', feedback);
    } catch (error) {
      addMessage('assistant', 'I\'m here to help! Try "help" for available commands or "register [name]" to get started.');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    await handleCommand(userMessage);
  };

  const quickActions = [
    { label: 'Optimize', command: 'optimize' },
    { label: 'Analyze', command: 'analyze' },
    { label: 'Image Stream', command: 'image_streaming' },
    { label: 'Memory Palace', command: 'memory_palace' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon icon={Brain} size="sm" />
          PolymathOS AI Assistant
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin">⚡</div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {userRegistered && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleCommand(action.command)}
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or ask a question..."
            className="flex-1 bg-gray-800 text-gray-100 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

