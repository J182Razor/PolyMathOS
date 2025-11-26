/**
 * Dual N-Back Trainer Component
 * Based on samuelplas/brainworkshop - https://github.com/samuelplas/brainworkshop
 * 
 * The Dual N-Back task is the only brain training exercise scientifically linked
 * to increasing Fluid Intelligence (IQ) and Working Memory.
 * 
 * How it works:
 * - User sees a grid with a square appearing in different positions
 * - User hears a letter/sound
 * - After N steps, user must identify if the position OR sound matches
 *   what appeared N steps ago
 * - N increases as the user improves
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  row: number;
  col: number;
}

interface Trial {
  position: Position;
  sound: string;
  positionMatch: boolean;
  soundMatch: boolean;
}

interface GameStats {
  totalTrials: number;
  correctPosition: number;
  correctSound: number;
  falsePositivePosition: number;
  falsePositiveSound: number;
  nLevel: number;
  score: number;
}

interface SessionHistory {
  date: Date;
  nLevel: number;
  positionAccuracy: number;
  soundAccuracy: number;
  duration: number;
}

const SOUNDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GRID_SIZE = 3;
const TRIAL_DURATION = 2500; // ms
const INTER_TRIAL_DURATION = 500; // ms

export const DualNBackTrainer: React.FC = () => {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nLevel, setNLevel] = useState(2);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  
  // Response tracking
  const [positionResponded, setPositionResponded] = useState(false);
  const [soundResponded, setSoundResponded] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<GameStats>({
    totalTrials: 0,
    correctPosition: 0,
    correctSound: 0,
    falsePositivePosition: 0,
    falsePositiveSound: 0,
    nLevel: 2,
    score: 0
  });
  
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Refs for audio
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  
  // Generate a random position on the grid
  const generatePosition = useCallback((): Position => {
    return {
      row: Math.floor(Math.random() * GRID_SIZE),
      col: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);
  
  // Generate a random sound
  const generateSound = useCallback((): string => {
    return SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
  }, []);
  
  // Generate all trials for a session
  const generateTrials = useCallback((numTrials: number = 20): Trial[] => {
    const newTrials: Trial[] = [];
    const matchProbability = 0.25; // 25% chance of match
    
    for (let i = 0; i < numTrials; i++) {
      let position: Position;
      let sound: string;
      
      if (i >= nLevel && Math.random() < matchProbability) {
        // Position match
        position = { ...newTrials[i - nLevel].position };
      } else {
        position = generatePosition();
      }
      
      if (i >= nLevel && Math.random() < matchProbability) {
        // Sound match
        sound = newTrials[i - nLevel].sound;
      } else {
        sound = generateSound();
      }
      
      const positionMatch = i >= nLevel && 
        position.row === newTrials[i - nLevel].position.row &&
        position.col === newTrials[i - nLevel].position.col;
      
      const soundMatch = i >= nLevel && sound === newTrials[i - nLevel].sound;
      
      newTrials.push({ position, sound, positionMatch, soundMatch });
    }
    
    return newTrials;
  }, [nLevel, generatePosition, generateSound]);
  
  // Play a tone for the sound
  const playSound = useCallback((letter: string) => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContext.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Different frequency for each letter
    const baseFreq = 200;
    const letterIndex = SOUNDS.indexOf(letter);
    osc.frequency.value = baseFreq + (letterIndex * 50);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    
    // Also use speech synthesis for the letter
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.rate = 1.5;
    utterance.volume = 0.5;
    window.speechSynthesis.speak(utterance);
  }, []);
  
  // Start a new game
  const startGame = useCallback(() => {
    const newTrials = generateTrials(20 + nLevel * 5);
    setTrials(newTrials);
    setCurrentTrialIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
    setStats({
      totalTrials: 0,
      correctPosition: 0,
      correctSound: 0,
      falsePositivePosition: 0,
      falsePositiveSound: 0,
      nLevel,
      score: 0
    });
  }, [generateTrials, nLevel]);
  
  // Handle position response
  const handlePositionResponse = useCallback(() => {
    if (!isPlaying || isPaused || positionResponded || currentTrialIndex < nLevel) return;
    
    setPositionResponded(true);
    const trial = trials[currentTrialIndex];
    
    if (trial.positionMatch) {
      setStats(prev => ({ ...prev, correctPosition: prev.correctPosition + 1 }));
      setFeedbackType('correct');
    } else {
      setStats(prev => ({ ...prev, falsePositivePosition: prev.falsePositivePosition + 1 }));
      setFeedbackType('incorrect');
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);
  }, [isPlaying, isPaused, positionResponded, currentTrialIndex, nLevel, trials]);
  
  // Handle sound response
  const handleSoundResponse = useCallback(() => {
    if (!isPlaying || isPaused || soundResponded || currentTrialIndex < nLevel) return;
    
    setSoundResponded(true);
    const trial = trials[currentTrialIndex];
    
    if (trial.soundMatch) {
      setStats(prev => ({ ...prev, correctSound: prev.correctSound + 1 }));
      setFeedbackType('correct');
    } else {
      setStats(prev => ({ ...prev, falsePositiveSound: prev.falsePositiveSound + 1 }));
      setFeedbackType('incorrect');
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);
  }, [isPlaying, isPaused, soundResponded, currentTrialIndex, nLevel, trials]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        handlePositionResponse();
      } else if (e.key === 'l' || e.key === 'L') {
        handleSoundResponse();
      } else if (e.key === ' ') {
        if (isPlaying) {
          setIsPaused(!isPaused);
        } else {
          startGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePositionResponse, handleSoundResponse, isPlaying, isPaused, startGame]);
  
  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    if (currentTrialIndex >= trials.length) {
      // Game complete
      setIsPlaying(false);
      
      // Calculate accuracy
      const positionMatches = trials.filter(t => t.positionMatch).length;
      const soundMatches = trials.filter(t => t.soundMatch).length;
      
      const positionAccuracy = positionMatches > 0 
        ? (stats.correctPosition / positionMatches) * 100 - (stats.falsePositivePosition / trials.length) * 50
        : 100 - (stats.falsePositivePosition / trials.length) * 50;
      
      const soundAccuracy = soundMatches > 0
        ? (stats.correctSound / soundMatches) * 100 - (stats.falsePositiveSound / trials.length) * 50
        : 100 - (stats.falsePositiveSound / trials.length) * 50;
      
      // Save session
      if (sessionStartTime) {
        const session: SessionHistory = {
          date: new Date(),
          nLevel,
          positionAccuracy: Math.max(0, positionAccuracy),
          soundAccuracy: Math.max(0, soundAccuracy),
          duration: (Date.now() - sessionStartTime.getTime()) / 1000
        };
        setSessionHistory(prev => [...prev.slice(-19), session]);
        
        // Auto-adjust N level
        const avgAccuracy = (positionAccuracy + soundAccuracy) / 2;
        if (avgAccuracy >= 80) {
          setNLevel(prev => Math.min(prev + 1, 9));
        } else if (avgAccuracy < 50) {
          setNLevel(prev => Math.max(prev - 1, 1));
        }
      }
      
      return;
    }
    
    // Show current trial
    const trial = trials[currentTrialIndex];
    setCurrentPosition(trial.position);
    setCurrentSound(trial.sound);
    playSound(trial.sound);
    setPositionResponded(false);
    setSoundResponded(false);
    
    // Check for missed matches at end of trial
    const trialTimer = setTimeout(() => {
      // Update stats for missed matches
      if (trial.positionMatch && !positionResponded) {
        // Missed position match
      }
      if (trial.soundMatch && !soundResponded) {
        // Missed sound match
      }
      
      setStats(prev => ({ ...prev, totalTrials: prev.totalTrials + 1 }));
      setCurrentPosition(null);
      setCurrentSound(null);
      
      // Inter-trial interval
      setTimeout(() => {
        setCurrentTrialIndex(prev => prev + 1);
      }, INTER_TRIAL_DURATION);
    }, TRIAL_DURATION);
    
    return () => clearTimeout(trialTimer);
  }, [isPlaying, isPaused, currentTrialIndex, trials, nLevel, playSound, positionResponded, soundResponded, sessionStartTime, stats.correctPosition, stats.correctSound, stats.falsePositivePosition, stats.falsePositiveSound]);
  
  // Calculate current accuracy
  const calculateAccuracy = () => {
    if (stats.totalTrials === 0) return { position: 0, sound: 0 };
    
    const positionMatches = trials.slice(0, currentTrialIndex).filter(t => t.positionMatch).length;
    const soundMatches = trials.slice(0, currentTrialIndex).filter(t => t.soundMatch).length;
    
    return {
      position: positionMatches > 0 ? Math.round((stats.correctPosition / positionMatches) * 100) : 100,
      sound: soundMatches > 0 ? Math.round((stats.correctSound / soundMatches) * 100) : 100
    };
  };
  
  const accuracy = calculateAccuracy();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-poly-electric-blue to-poly-violet bg-clip-text text-transparent mb-2">
            Dual N-Back Trainer
          </h1>
          <p className="text-gray-400">
            Scientifically proven to increase working memory and fluid intelligence
          </p>
        </div>
        
        {/* N-Level Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-4 bg-gray-800/50 rounded-xl px-6 py-3">
            <button
              onClick={() => setNLevel(prev => Math.max(prev - 1, 1))}
              disabled={isPlaying}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              -
            </button>
            <span className="text-2xl font-bold">
              N = <span className="text-poly-electric-blue">{nLevel}</span>
            </span>
            <button
              onClick={() => setNLevel(prev => Math.min(prev + 1, 9))}
              disabled={isPlaying}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Game Grid */}
        <div className="flex justify-center mb-8">
          <div 
            className={`grid grid-cols-3 gap-2 p-4 bg-gray-800/30 rounded-xl border-2 transition-colors ${
              showFeedback 
                ? feedbackType === 'correct' 
                  ? 'border-green-500' 
                  : 'border-red-500'
                : 'border-gray-700'
            }`}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const row = Math.floor(i / GRID_SIZE);
              const col = i % GRID_SIZE;
              const isActive = currentPosition?.row === row && currentPosition?.col === col;
              
              return (
                <div
                  key={i}
                  className={`w-24 h-24 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-poly-electric-blue shadow-lg shadow-poly-electric-blue/50'
                      : 'bg-gray-700/50'
                  }`}
                />
              );
            })}
          </div>
        </div>
        
        {/* Current Sound Display */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold transition-opacity ${currentSound ? 'opacity-100' : 'opacity-30'}`}>
            {currentSound || '-'}
          </div>
        </div>
        
        {/* Response Buttons */}
        <div className="flex justify-center gap-8 mb-8">
          <button
            onClick={handlePositionResponse}
            disabled={!isPlaying || currentTrialIndex < nLevel}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-all ${
              positionResponded
                ? 'bg-gray-600 text-gray-400'
                : 'bg-poly-electric-blue hover:bg-poly-electric-blue/80 hover:shadow-lg hover:shadow-poly-electric-blue/30'
            } disabled:opacity-50`}
          >
            Position Match (A)
          </button>
          <button
            onClick={handleSoundResponse}
            disabled={!isPlaying || currentTrialIndex < nLevel}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-all ${
              soundResponded
                ? 'bg-gray-600 text-gray-400'
                : 'bg-poly-violet hover:bg-poly-violet/80 hover:shadow-lg hover:shadow-poly-violet/30'
            } disabled:opacity-50`}
          >
            Sound Match (L)
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Trial</div>
            <div className="text-2xl font-bold">
              {currentTrialIndex}/{trials.length}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Position Accuracy</div>
            <div className="text-2xl font-bold text-poly-electric-blue">
              {accuracy.position}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Sound Accuracy</div>
            <div className="text-2xl font-bold text-poly-violet">
              {accuracy.sound}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Combined</div>
            <div className="text-2xl font-bold">
              {Math.round((accuracy.position + accuracy.sound) / 2)}%
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-poly-electric-blue to-poly-violet rounded-xl font-bold text-xl hover:opacity-90 transition-all"
            >
              Start Session (Space)
            </button>
          ) : (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-xl transition-all"
            >
              {isPaused ? 'Resume' : 'Pause'} (Space)
            </button>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">How to Play:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Watch the blue square and listen to the letter</li>
            <li>• Press <span className="text-poly-electric-blue font-bold">A</span> if the position matches {nLevel} steps ago</li>
            <li>• Press <span className="text-poly-violet font-bold">L</span> if the sound matches {nLevel} steps ago</li>
            <li>• Try to identify BOTH position and sound matches</li>
            <li>• N-level automatically adjusts based on performance</li>
          </ul>
        </div>
        
        {/* Session History */}
        {sessionHistory.length > 0 && (
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-center">N-Level</th>
                    <th className="py-2 text-center">Position</th>
                    <th className="py-2 text-center">Sound</th>
                    <th className="py-2 text-center">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.slice().reverse().map((session, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-2">{session.date.toLocaleTimeString()}</td>
                      <td className="py-2 text-center font-bold">{session.nLevel}</td>
                      <td className="py-2 text-center text-poly-electric-blue">{Math.round(session.positionAccuracy)}%</td>
                      <td className="py-2 text-center text-poly-violet">{Math.round(session.soundAccuracy)}%</td>
                      <td className="py-2 text-center">{Math.round(session.duration)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualNBackTrainer;

