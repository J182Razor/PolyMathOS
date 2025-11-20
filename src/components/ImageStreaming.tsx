/**
 * Image Streaming Component
 * Based on Win Wenger's Image Streaming technique
 * 
 * Protocol:
 * 1. Close eyes and observe visual "noise" (phosphenes)
 * 2. Describe impressions aloud in rapid, sensory-rich detail
 * 3. Force-fit other senses (touch, smell, sound)
 * 4. Allow images to morph and surprise
 * 
 * Benefits:
 * - Strengthens visual-verbal connection
 * - Activates Default Mode Network (creativity)
 * - Improves visualization for Memory Palaces
 * - Cross-hemispheric integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { Eye, Mic, MicOff, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import { LearningStateService } from '../services/LearningStateService';

interface ImageStreamingProps {
  onComplete?: (sessionData: ImageStreamingSession) => void;
  duration?: number; // minutes, default 20
}

interface ImageStreamingSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  description: string;
  insights: string[];
  quality: number; // 0-100%
}

export const ImageStreaming: React.FC<ImageStreamingProps> = ({ 
  onComplete,
  duration = 20 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const stateService = LearningStateService.getInstance();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setDescription(prev => prev + finalTranscript);
        if (interimTranscript) {
          setCurrentImage(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startSession = () => {
    setIsActive(true);
    setShowInstructions(false);
    startTimeRef.current = Date.now();
    
    // Initiate Theta state for visualization
    stateService.initiateThetaState('image_streaming');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const elapsed = prev + 1;
        const targetSeconds = duration * 60;
        
        if (elapsed >= targetSeconds) {
          endSession();
          return targetSeconds;
        }
        
        return elapsed;
      });
    }, 1000);

    // Start speech recognition if available
    if (recognitionRef.current && audioEnabled) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.warn('Speech recognition not available:', error);
      }
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const resumeSession = () => {
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const elapsed = prev + 1;
        const targetSeconds = duration * 60;
        
        if (elapsed >= targetSeconds) {
          endSession();
          return targetSeconds;
        }
        
        return elapsed;
      });
    }, 1000);

    if (recognitionRef.current && audioEnabled) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.warn('Speech recognition not available:', error);
      }
    }
  };

  const endSession = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    stateService.endState();

    const session: ImageStreamingSession = {
      id: `stream_${Date.now()}`,
      startTime: new Date(startTimeRef.current || Date.now()),
      endTime: new Date(),
      duration: timeElapsed,
      description,
      insights,
      quality: description.length > 500 ? 80 : description.length > 200 ? 60 : 40,
    };

    if (onComplete) {
      onComplete(session);
    }
  };

  const addInsight = () => {
    const insight = prompt('What insight or connection did you notice?');
    if (insight) {
      setInsights(prev => [...prev, insight]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeElapsed / (duration * 60)) * 100;

  if (showInstructions) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <Icon icon={Eye} size="lg" className="text-silver-base mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
            Image Streaming Protocol
          </h2>
          <p className="text-text-secondary">
            Based on Win Wenger's technique for enhancing visual intelligence
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-silver-light mb-2">What is Image Streaming?</h3>
            <p className="text-text-secondary text-sm">
              Image Streaming involves closing your eyes and describing the flow of mental images 
              out loud in rapid, sensory-rich detail. This strengthens the connection between your 
              visual and verbal processing centers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-silver-light mb-2">How to Do It:</h3>
            <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm">
              <li>Close your eyes and relax</li>
              <li>Look into the "visual noise" behind your eyelids</li>
              <li>Identify the faintest impression (color, line, movement)</li>
              <li>Describe it aloud in rapid, sensory detail</li>
              <li>Force-fit other senses (touch, smell, sound)</li>
              <li>Allow images to morph and surprise you</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-silver-light mb-2">Benefits:</h3>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
              <li>Strengthens visual-verbal connection</li>
              <li>Activates creative thinking (Default Mode Network)</li>
              <li>Improves visualization for Memory Palaces</li>
              <li>Enhances cross-hemispheric integration</li>
            </ul>
          </div>

          <div className="p-4 bg-silver-dark/10 rounded-lg border border-silver-dark/20">
            <p className="text-text-secondary text-sm">
              <strong className="text-silver-base">Tip:</strong> Speak faster than your editorial 
              thoughts. Don't analyze or judge - just describe what you see, no matter how random.
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button variant="secondary" onClick={() => setShowInstructions(false)}>
            Skip Instructions
          </Button>
          <Button variant="primary" onClick={startSession}>
            <Icon icon={Play} size="sm" className="mr-2" />
            Begin Session ({duration} min)
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass border border-silver-base/30 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <Icon icon={Eye} size="md" className="text-silver-light" />
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">Image Streaming</h2>
            <p className="text-text-secondary text-sm">
              {isActive ? 'Describe what you see...' : 'Session paused'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-text-tertiary">Time</div>
            <div className="text-lg font-bold text-shimmer">{formatTime(timeElapsed)}</div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Disable voice input' : 'Enable voice input'}
          >
            <Icon icon={audioEnabled ? Mic : MicOff} size="sm" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span className="text-sm font-medium text-silver-base">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-dark-elevated rounded-full h-3 relative overflow-hidden border border-silver-dark/20">
          <div 
            className="bg-shimmer h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6 min-h-[400px]">
        {!isActive ? (
          <div className="text-center py-12">
            <Icon icon={Eye} size="xl" className="text-silver-base mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary mb-6">
              Close your eyes and begin describing the images you see...
            </p>
            <Button variant="primary" onClick={resumeSession}>
              <Icon icon={Play} size="sm" className="mr-2" />
              Resume Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-silver-base mb-2">
                Current Image Description
              </label>
              <div className="min-h-[200px] p-4 bg-dark-surface rounded-lg border border-silver-dark/30 text-text-primary">
                {currentImage || description || (
                  <span className="text-text-tertiary italic">
                    Start describing what you see... Speak naturally and let the images flow.
                  </span>
                )}
              </div>
            </div>

            {description && (
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Full Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[150px] p-4 bg-dark-surface rounded-lg border border-silver-dark/30 text-text-primary placeholder-text-tertiary"
                  placeholder="Your description will appear here as you speak..."
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-silver-dark/20">
              <Button variant="ghost" onClick={addInsight}>
                + Add Insight
              </Button>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={pauseSession}>
                  <Icon icon={Pause} size="sm" className="mr-2" />
                  Pause
                </Button>
                <Button variant="primary" onClick={endSession}>
                  <Icon icon={Square} size="sm" className="mr-2" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-silver-light mb-4">Insights & Connections</h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-dark-surface rounded-lg border border-silver-dark/20 text-text-secondary text-sm">
                {insight}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions Reminder */}
      <Card className="p-4 bg-silver-dark/5 border border-silver-dark/20">
        <p className="text-text-secondary text-sm">
          <strong className="text-silver-base">Remember:</strong> Describe rapidly without analyzing. 
          Include sensory details (colors, textures, sounds, smells). Let images morph and surprise you.
        </p>
      </Card>
    </div>
  );
};

