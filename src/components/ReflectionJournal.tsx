import React, { useState, useEffect } from 'react';
import { FileText, Plus, BookOpen, Smile } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { ReflectionEntry } from '../types/polymath';

interface ReflectionJournalProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const reflectionPrompts = [
  "What was the most surprising connection you made today?",
  "How did your understanding deepen in unexpected ways?",
  "What would you teach differently if you were the instructor?",
  "What questions are emerging as you learn?",
  "How can you apply this knowledge in the next 24 hours?",
  "What aspects need more practice or review?",
  "How did your motivation and focus change throughout the session?",
  "What real-world applications can you see for this knowledge?",
];

export const ReflectionJournal: React.FC<ReflectionJournalProps> = ({ onComplete, onBack }) => {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [mood, setMood] = useState(5);
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
  const userService = PolymathUserService.getInstance();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const user = userService.getCurrentUser();
    if (user) {
      setEntries(user.reflectionJournal);
    }
  };

  const handleSubmit = () => {
    if (!selectedPrompt || !response) {
      setMessages(['Please select a prompt and write your reflection']);
      return;
    }

    const result = featuresService.logReflection(selectedPrompt, response, mood);
    setMessages(result);
    
    setTimeout(() => {
      setMessages([]);
      setSelectedPrompt('');
      setResponse('');
      setMood(5);
      loadEntries();
      if (onComplete) onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <Icon icon={BookOpen} size="sm" className="mr-2" />
            Back
          </Button>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <Card className="p-4 mb-6 border-2 border-silver-base">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-silver-light">{msg}</p>
            ))}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Entry Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Icon icon={FileText} size="xl" className="text-silver-base" />
                <h1 className="text-2xl font-display font-bold text-text-primary">
                  Reflection Journal
                </h1>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Reflection Prompt
                  </label>
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary"
                  >
                    <option value="">Select a prompt...</option>
                    {reflectionPrompts.map((prompt, idx) => (
                      <option key={idx} value={prompt}>{prompt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Your Reflection
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your thoughts, insights, and connections here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Mood (1-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mood}
                      onChange={(e) => setMood(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-dark-elevated rounded-lg appearance-none cursor-pointer accent-silver-base"
                    />
                    <div className="flex items-center space-x-2">
                      <Icon icon={Smile} size="sm" className="text-silver-base" />
                      <span className="text-lg font-bold text-shimmer w-8 text-center">{mood}</span>
                    </div>
                  </div>
                </div>

                <Button variant="primary" size="lg" onClick={handleSubmit} className="w-full">
                  <Icon icon={Plus} size="sm" className="mr-2" />
                  Save Reflection
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Entries */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
                Recent Entries ({entries.length})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-silver">
                {entries.length === 0 ? (
                  <p className="text-text-tertiary text-sm text-center py-8">
                    No reflections yet. Start writing!
                  </p>
                ) : (
                  entries.slice().reverse().slice(0, 10).map((entry) => (
                    <div key={entry.id} className="glass p-3 rounded-lg border border-silver-dark/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-tertiary">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-silver-base">Mood: {entry.mood}/10</span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {entry.prompt.substring(0, 50)}...
                      </p>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {entry.response.substring(0, 100)}...
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

