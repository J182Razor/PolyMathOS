/**
 * Enhanced Polymath AI Assistant Component
 * Ultimate polymath creator - orchestrates all PolyMathOS features
 */

import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { PolymathAIService } from '../services/PolymathAIService';
import { UserProfilerService } from '../services/UserProfilerService';
import { NLPCoachService } from '../services/NLPCoachService';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any; // For session data, content, etc.
}

export const PolymathAIAssistantEnhanced: React.FC<{
  onNavigate?: (target: string, config?: any) => void;
}> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [sessionStepIndex, setSessionStepIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiService = PolymathAIService.getInstance();
  const profilerService = UserProfilerService.getInstance();
  const coachService = NLPCoachService.getInstance();

  useEffect(() => {
    const currentUser = aiService.getCurrentUser();
    if (currentUser) {
      setUserRegistered(true);
      addMessage('assistant', `Welcome back, ${currentUser.name}! I'm your ultimate polymath creator. I can create complete learning experiences, generate content, and orchestrate all PolyMathOS features. What would you like to learn today?`);
    } else {
      addMessage('assistant', '🤖 Welcome to PolymathOS AI - The Ultimate Polymath Creator!\n\nI can:\n• Create complete, customized learning sessions\n• Generate flashcards, memory palaces, mind maps\n• Orchestrate all PolyMathOS features\n• Build personalized learning experiences\n\nType "register [your name]" to begin!');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, data?: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      data,
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

    // Create learning session
    if (lowerCommand.startsWith('create session') || lowerCommand.startsWith('learn ') || lowerCommand.startsWith('teach me ')) {
      setIsLoading(true);
      try {
        const user = aiService.getCurrentUser();
        if (!user) {
          addMessage('assistant', 'Please register first: register [your name]');
          setIsLoading(false);
          return;
        }

        // Extract topic and domain from command
        let topic = '';
        let domain = Object.keys(user.domains)[0] || 'General';

        if (lowerCommand.startsWith('learn ')) {
          topic = command.substring(6).trim();
        } else if (lowerCommand.startsWith('teach me ')) {
          topic = command.substring(9).trim();
        } else {
          // Parse "create session [topic] in [domain]"
          const match = command.match(/create session (.+?)(?: in (.+))?/i);
          if (match) {
            topic = match[1].trim();
            domain = match[2]?.trim() || domain;
          } else {
            topic = 'New Topic';
          }
        }

        const session = await aiService.createLearningSession(topic, domain, {
          includeBrainwave: true,
          includeImageStreaming: true,
          includeMemoryPalace: true,
          includeFlashcards: true,
          includeMindMap: true,
          includeDeepWork: true,
          includeReflection: true,
        });

        setCurrentSession(session);
        setSessionStepIndex(0);

        const sessionMessage = `
🎯 COMPLETE LEARNING SESSION CREATED!

📚 ${session.title}
⏱️ Duration: ${session.estimatedDuration} minutes
🎯 Difficulty: ${session.difficulty}/10
📋 Steps: ${session.steps.length} activities

📋 LEARNING PATH:
${session.steps.map((step, i) => `${i + 1}. ${step.title} (${step.duration} min)`).join('\n')}

🎯 OBJECTIVES:
${session.objectives.map(obj => `• ${obj}`).join('\n')}

Type "start session" to begin, or "customize session" to modify it!
`;
        addMessage('assistant', sessionMessage, { session });
        setIsLoading(false);
        return;
      } catch (error) {
        addMessage('assistant', `Error creating session: ${error}`);
        setIsLoading(false);
        return;
      }
    }

    // Start session
    if (lowerCommand === 'start session' || lowerCommand === 'start') {
      if (!currentSession) {
        addMessage('assistant', 'No session created yet. Create one with "create session [topic]" or "learn [topic]"');
        return;
      }

      if (sessionStepIndex >= currentSession.steps.length) {
        addMessage('assistant', 'Session completed! Great work! 🎉');
        return;
      }

      const step = currentSession.steps[sessionStepIndex];
      addMessage('system', `Starting step ${sessionStepIndex + 1}/${currentSession.steps.length}: ${step.title}`);

      try {
        const stepResult = await aiService.executeSessionStep(currentSession, sessionStepIndex);
        
        if (stepResult.type === 'navigate' && onNavigate) {
          addMessage('assistant', `Navigating to ${stepResult.target}...`);
          onNavigate(stepResult.target, stepResult.config || stepResult.content);
        } else if (stepResult.type === 'display') {
          addMessage('assistant', `📚 ${step.title}\n\n${stepResult.content?.fullContent || step.description}`, stepResult.content);
        } else {
          addMessage('assistant', `✅ ${step.title} completed! Ready for next step.`);
        }

        setSessionStepIndex(sessionStepIndex + 1);
      } catch (error) {
        addMessage('assistant', `Error executing step: ${error}`);
      }
      return;
    }

    // Generate content commands
    if (lowerCommand.startsWith('generate flashcards') || lowerCommand.startsWith('create flashcards')) {
      setIsLoading(true);
      try {
        const user = aiService.getCurrentUser();
        if (!user) {
          addMessage('assistant', 'Please register first');
          setIsLoading(false);
          return;
        }

        const match = command.match(/(?:generate|create) flashcards (?:for|about) (.+?)(?: in (.+))?/i);
        const topic = match?.[1] || 'current topic';
        const domain = match?.[2] || Object.keys(user.domains)[0] || 'General';

        const flashcards = await aiService.generateContent('flashcards', topic, domain, 10);
        addMessage('assistant', `✅ Generated ${flashcards.length} flashcards for ${topic}!\n\nYou can review them in the Flashcards section.`, { flashcards });
        setIsLoading(false);
        return;
      } catch (error) {
        addMessage('assistant', `Error generating flashcards: ${error}`);
        setIsLoading(false);
        return;
      }
    }

    if (lowerCommand.startsWith('generate memory palace') || lowerCommand.startsWith('create memory palace')) {
      setIsLoading(true);
      try {
        const user = aiService.getCurrentUser();
        if (!user) {
          addMessage('assistant', 'Please register first');
          setIsLoading(false);
          return;
        }

        const match = command.match(/(?:generate|create) memory palace (?:for|about) (.+?)(?: in (.+))?/i);
        const topic = match?.[1] || 'current topic';
        const domain = match?.[2] || Object.keys(user.domains)[0] || 'General';

        const memoryPalace = await aiService.generateContent('memory_palace', topic, domain);
        addMessage('assistant', `✅ Generated memory palace for ${topic} with ${memoryPalace.loci?.length || 0} locations!\n\nNavigate to Memory Palace to view it.`, { memoryPalace });
        setIsLoading(false);
        return;
      } catch (error) {
        addMessage('assistant', `Error generating memory palace: ${error}`);
        setIsLoading(false);
        return;
      }
    }

    if (lowerCommand.startsWith('generate mind map') || lowerCommand.startsWith('create mind map')) {
      setIsLoading(true);
      try {
        const user = aiService.getCurrentUser();
        if (!user) {
          addMessage('assistant', 'Please register first');
          setIsLoading(false);
          return;
        }

        const match = command.match(/(?:generate|create) mind map (?:for|about) (.+?)(?: in (.+))?/i);
        const topic = match?.[1] || 'current topic';
        const domain = match?.[2] || Object.keys(user.domains)[0] || 'General';

        const mindMap = await aiService.generateContent('mind_map', topic, domain);
        addMessage('assistant', `✅ Generated mind map for ${topic}!\n\nNavigate to Mind Map to view it.`, { mindMap });
        setIsLoading(false);
        return;
      } catch (error) {
        addMessage('assistant', `Error generating mind map: ${error}`);
        setIsLoading(false);
        return;
      }
    }

    // Get templates
    if (lowerCommand === 'templates' || lowerCommand === 'show templates') {
      const templates = aiService.getSessionTemplates();
      const templateList = templates.map(t => 
        `• ${t.name} (${t.estimatedDuration} min, Difficulty: ${t.difficulty}/10)\n  ${t.description}`
      ).join('\n\n');
      
      addMessage('assistant', `📋 AVAILABLE SESSION TEMPLATES:\n\n${templateList}\n\nUse "create from template [template_id] [topic]" to use a template.`);
      return;
    }

    // Optimization and analysis commands (existing)
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
🤖 POLYMATHOS AI - ULTIMATE POLYMATH CREATOR

🎯 SESSION CREATION:
• learn [topic] - Create complete learning session
• teach me [topic] - Create personalized lesson
• create session [topic] in [domain] - Custom session
• start session - Begin current session
• templates - Show available templates

📚 CONTENT GENERATION:
• generate flashcards for [topic] - Create flashcards
• generate memory palace for [topic] - Create memory palace
• generate mind map for [topic] - Create mind map

⚡ ACCELERATION:
• optimize - Get acceleration plan
• analyze - View efficiency metrics
• execute - Run optimization cycle

🔧 SETUP:
• register [name] - Initialize profile
• setup [P] [S1] [S2] - Configure domains

💬 Just ask me anything! I can create complete learning experiences tailored to you.
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
        currentSession: currentSession ? { title: currentSession.title, step: sessionStepIndex } : undefined,
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
    { label: 'Create Session', command: 'learn ' },
    { label: 'Templates', command: 'templates' },
    { label: 'Analyze', command: 'analyze' },
    { label: 'Help', command: 'help' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon icon={Brain} size="sm" />
          PolymathOS AI - Ultimate Creator
        </h2>
        {currentSession && (
          <div className="mt-2 text-sm text-gray-400">
            Active Session: {currentSession.title} ({sessionStepIndex}/{currentSession.steps.length} steps)
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : message.role === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'system'
                  ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.data && message.data.session && (
                <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                  Session: {message.data.session.title}
                </div>
              )}
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
                <span>Creating your learning experience...</span>
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
                onClick={() => {
                  if (action.command.endsWith(' ')) {
                    setInput(action.command);
                  } else {
                    handleCommand(action.command);
                  }
                }}
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
            {currentSession && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCommand('start session')}
                disabled={isLoading || sessionStepIndex >= currentSession.steps.length}
              >
                Continue Session
              </Button>
            )}
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
            placeholder="Ask me to create a learning session, generate content, or help you learn..."
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

