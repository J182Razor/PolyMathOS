/**
 * Enhanced Polymath AI Assistant Component
 * Multi-agent interface matching the provided design
 */

import React, { useState, useEffect, useRef } from 'react';
import { unifiedAgentService } from '../services/UnifiedAgentService';
import { ApiErrorHandler, ApiError } from '../utils/apiErrorHandler';
import { ErrorMessage } from './ui/ErrorMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'researcher' | 'strategist' | 'critic' | 'synthesizer';
  content: string;
  timestamp: Date;
  agent?: string;
}

export const PolymathAIAssistantEnhanced: React.FC<{
  onNavigate?: (target: string, config?: any) => void;
}> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial system message
    addMessage('assistant', 'PolyMathOS multi-agent interface initialized. How can we assist?');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: Message['role'], content: string, agent?: string) => {
    const message: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: new Date(),
      agent,
    };
    setMessages((prev) => [...prev, message]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);

    setIsLoading(true);
    setIsProcessing(true);
    setError(null);

    try {
      // Execute using unified agent orchestrator
      const result = await unifiedAgentService.executePattern({
        pattern_type: 'advanced_research',
        task: userMessage,
        context: {
          user_id: 'current_user',
        },
      });

      // Simulate multi-agent response flow
      setTimeout(() => {
        addMessage('researcher', 'I have gathered the following papers on quantum tunneling and entanglement theory...', 'Researcher');
        setIsProcessing(false);
      }, 1000);

      setTimeout(() => {
        addMessage('strategist', "Based on this data, a potential learning path would be to start with the EPR paradox before moving to Bell's theorem.", 'Strategist');
      }, 2000);

      setTimeout(() => {
        addMessage('critic', "A potential flaw in that approach is the assumption of local realism. Bell's theorem directly addresses this, so it might be more effective to introduce them concurrently.", 'Critic');
      }, 3000);

      setTimeout(() => {
        setIsProcessing(true);
        addMessage('synthesizer', 'Synthesizing recommendations based on team analysis...', 'Synthesizer');
        setTimeout(() => {
          setIsProcessing(false);
          setIsLoading(false);
        }, 2000);
      }, 4000);
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err);
      setError(apiError);
      addMessage('assistant', `I encountered an error: ${apiError.message}. Please try again.`);
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#101722] overflow-hidden font-display">
      {/* Header Bar */}
      <div className="flex flex-none items-center bg-background-dark/80 backdrop-blur-sm p-4 z-10">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-gray-400">arrow_back_ios</span>
        </div>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-[#EAEAEA]">
          Quantum Entanglement Research
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-transparent text-[#EAEAEA]">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex items-end justify-end gap-3">
                <div className="flex max-w-[80%] flex-col items-end gap-1">
                  <p className="flex rounded-xl rounded-br-lg bg-[#00FFFF] px-4 py-3 text-base font-normal leading-normal text-black">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          }

          if (['researcher', 'strategist', 'critic', 'synthesizer'].includes(message.role)) {
            const agentColors: Record<string, { dot: string; shadow: string }> = {
              researcher: { dot: 'bg-violet-500', shadow: 'shadow-violet-500/50' },
              strategist: { dot: 'bg-orange-500', shadow: 'shadow-orange-500/50' },
              critic: { dot: 'bg-green-500', shadow: 'shadow-green-500/50' },
              synthesizer: { dot: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
            };

            const agentNames: Record<string, string> = {
              researcher: 'Researcher',
              strategist: 'Strategist',
              critic: 'Critic',
              synthesizer: 'Synthesizer',
            };

            const color = agentColors[message.role] || agentColors.researcher;
            const agentName = agentNames[message.role] || 'Agent';

            return (
              <div key={message.id} className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center">
                  <div className={`h-2 w-2 rounded-full ${color.dot} shadow-[0_0_8px_2px] ${color.shadow}`}></div>
                </div>
                <div className="flex flex-1 flex-col items-stretch gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base font-bold leading-tight text-[#EAEAEA]">{agentName}</p>
                      <p className="text-sm font-normal leading-normal text-gray-500">{formatTime(message.timestamp)}</p>
                    </div>
                    <p className="text-base font-normal leading-normal text-[#EAEAEA]">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          }

          // System/Assistant message
          return (
            <div key={message.id} className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <div className="flex flex-1 flex-col items-stretch gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-base font-bold leading-tight text-[#EAEAEA]">PolyMathOS</p>
                    <p className="text-sm font-normal leading-normal text-gray-500">{formatTime(message.timestamp)}</p>
                  </div>
                  <p className="text-base font-normal leading-normal text-[#EAEAEA]">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Agent Status Indicator */}
        {isProcessing && (
          <div className="flex gap-3 items-center pl-14">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gray-500"></span>
              <span className="h-1.5 w-1.5 animate-[pulse_1s_ease-in-out_infinite_0.2s] rounded-full bg-gray-500" style={{ animationDelay: '0.2s' }}></span>
              <span className="h-1.5 w-1.5 animate-[pulse_1s_ease-in-out_infinite_0.4s] rounded-full bg-gray-500" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <p className="text-sm text-gray-500">Synthesizer is processing...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <ErrorMessage 
            error={error} 
            onDismiss={() => setError(null)}
            retryable={ApiErrorHandler.isRetryable(error)}
            onRetry={() => handleSubmit(new Event('submit') as any)}
          />
        </div>
      )}

      {/* Smart Input Field */}
      <div className="flex-none bg-background-dark p-4">
        <form onSubmit={handleSubmit} className="relative flex w-full items-center">
          <input
            className="w-full rounded-full border border-gray-700 bg-gray-900/80 py-3 pl-5 pr-28 text-base text-[#EAEAEA] placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ask your AI team..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <span className="material-symbols-outlined text-2xl">mic</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00FFFF] text-black disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">arrow_upward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
