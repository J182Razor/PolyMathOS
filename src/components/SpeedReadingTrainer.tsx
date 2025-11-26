/**
 * Speed Reading Trainer Component
 * Based on xKeNcHii/speedreader - https://github.com/xKeNcHii/speedreader
 * 
 * Uses RSVP (Rapid Serial Visual Presentation) technique:
 * - Words are displayed one at a time at a fixed point
 * - Eliminates eye movement (saccades)
 * - Allows much faster reading speeds
 * 
 * Additional techniques from speed-read-drills:
 * - Peripheral vision expansion
 * - Chunking (reading word groups)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ReadingStats {
  wordsRead: number;
  currentWPM: number;
  comprehensionScore: number;
  sessionsCompleted: number;
  averageWPM: number;
}

interface ReadingSession {
  text: string;
  title: string;
  wordCount: number;
  questions: ComprehensionQuestion[];
}

interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Sample texts for practice
const SAMPLE_TEXTS: ReadingSession[] = [
  {
    title: "The Power of Habit",
    text: `Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous. It is only when looking back two, five, or perhaps ten years later that the value of good habits and the cost of bad ones becomes strikingly apparent. Time magnifies the margin between success and failure. It will multiply whatever you feed it. Good habits make time your ally. Bad habits make time your enemy. Habits are a double-edged sword. Bad habits can cut you down just as easily as good habits can build you up, which is why understanding the details is crucial.`,
    wordCount: 127,
    questions: [
      {
        question: "According to the text, what do habits resemble?",
        options: ["Simple interest", "Compound interest", "Stock dividends", "Tax returns"],
        correctIndex: 1
      },
      {
        question: "What happens when you look back after several years?",
        options: ["Habits become invisible", "The value of habits becomes apparent", "Time stops mattering", "Success is guaranteed"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Neuroplasticity",
    text: `The brain's ability to reorganize itself by forming new neural connections throughout life is called neuroplasticity. This allows the neurons in the brain to compensate for injury and disease and to adjust their activities in response to new situations or to changes in their environment. Brain reorganization takes place by mechanisms such as axonal sprouting in which undamaged axons grow new nerve endings to reconnect neurons whose links were injured or severed. Undamaged axons can also sprout nerve endings and connect with other undamaged nerve cells, forming new neural pathways to accomplish a needed function. Neuroplasticity is the reason why intensive training and practice can reshape our cognitive abilities.`,
    wordCount: 107,
    questions: [
      {
        question: "What is neuroplasticity?",
        options: ["Brain surgery", "Brain's ability to reorganize", "Memory loss", "Brain disease"],
        correctIndex: 1
      },
      {
        question: "What is axonal sprouting?",
        options: ["Brain damage", "Growing new nerve endings", "Neural decay", "Memory formation"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Deep Work",
    text: `Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value, improve your skill, and are hard to replicate. Deep work is necessary to wring every last drop of value out of your current intellectual capacity. The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy. As a consequence, the few who cultivate this skill, and then make it the core of their working life, will thrive. To learn hard things quickly, you must focus intensely without distraction.`,
    wordCount: 102,
    questions: [
      {
        question: "What characterizes deep work?",
        options: ["Multitasking", "Distraction-free concentration", "Social media use", "Email checking"],
        correctIndex: 1
      },
      {
        question: "What is happening to the ability to do deep work?",
        options: ["Becoming common", "Becoming rare and valuable", "Becoming obsolete", "Staying the same"],
        correctIndex: 1
      }
    ]
  }
];

type DisplayMode = 'single' | 'chunk' | 'highlight';

export const SpeedReadingTrainer: React.FC = () => {
  // Settings
  const [wpm, setWpm] = useState(300);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('single');
  const [chunkSize, setChunkSize] = useState(3);
  const [fontSize, setFontSize] = useState(32);
  
  // Session state
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showComprehension, setShowComprehension] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Stats
  const [stats, setStats] = useState<ReadingStats>({
    wordsRead: 0,
    currentWPM: 300,
    comprehensionScore: 0,
    sessionsCompleted: 0,
    averageWPM: 300
  });
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Calculate interval between words
  const getInterval = useCallback(() => {
    return (60 * 1000) / wpm; // milliseconds per word
  }, [wpm]);
  
  // Start reading session
  const startSession = useCallback((session: ReadingSession) => {
    setCurrentSession(session);
    const sessionWords = session.text.split(/\s+/);
    setWords(sessionWords);
    setCurrentWordIndex(0);
    setIsReading(true);
    setIsPaused(false);
    setShowComprehension(false);
    setAnswers([]);
    startTimeRef.current = Date.now();
  }, []);
  
  // Get current display content based on mode
  const getCurrentDisplay = useCallback(() => {
    if (displayMode === 'single') {
      return words[currentWordIndex] || '';
    }
    
    if (displayMode === 'chunk') {
      const chunk = words.slice(currentWordIndex, currentWordIndex + chunkSize);
      return chunk.join(' ');
    }
    
    // Highlight mode shows context with current word highlighted
    const contextSize = 5;
    const start = Math.max(0, currentWordIndex - contextSize);
    const end = Math.min(words.length, currentWordIndex + contextSize + 1);
    const contextWords = words.slice(start, end);
    const highlightIndex = currentWordIndex - start;
    
    return contextWords.map((word, i) => (
      <span
        key={i}
        className={i === highlightIndex ? 'text-poly-electric-blue font-bold' : 'text-gray-500'}
      >
        {word}{' '}
      </span>
    ));
  }, [displayMode, words, currentWordIndex, chunkSize]);
  
  // Reading loop
  useEffect(() => {
    if (!isReading || isPaused || words.length === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }
    
    const advance = displayMode === 'chunk' ? chunkSize : 1;
    
    if (currentWordIndex >= words.length) {
      // Session complete
      setIsReading(false);
      setShowComprehension(true);
      
      // Calculate actual WPM
      const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
      const actualWPM = Math.round(words.length / elapsedMinutes);
      
      setStats(prev => ({
        ...prev,
        wordsRead: prev.wordsRead + words.length,
        currentWPM: actualWPM
      }));
      
      return;
    }
    
    timerRef.current = setTimeout(() => {
      setCurrentWordIndex(prev => Math.min(prev + advance, words.length));
    }, getInterval());
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isReading, isPaused, currentWordIndex, words, displayMode, chunkSize, getInterval]);
  
  // Handle comprehension answers
  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };
  
  // Submit comprehension test
  const submitComprehension = () => {
    if (!currentSession) return;
    
    let correct = 0;
    currentSession.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    
    const score = Math.round((correct / currentSession.questions.length) * 100);
    
    setStats(prev => ({
      ...prev,
      comprehensionScore: score,
      sessionsCompleted: prev.sessionsCompleted + 1,
      averageWPM: Math.round((prev.averageWPM * prev.sessionsCompleted + prev.currentWPM) / (prev.sessionsCompleted + 1))
    }));
    
    setShowComprehension(false);
    setCurrentSession(null);
  };
  
  // Progress percentage
  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (isReading) {
          setIsPaused(!isPaused);
        }
      } else if (e.key === 'ArrowUp') {
        setWpm(prev => Math.min(prev + 50, 1000));
      } else if (e.key === 'ArrowDown') {
        setWpm(prev => Math.max(prev - 50, 100));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReading, isPaused]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-poly-electric-blue to-poly-cyan bg-clip-text text-transparent mb-2">
            Speed Reading Trainer
          </h1>
          <p className="text-gray-400">
            RSVP-based training to dramatically increase your reading speed
          </p>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Current WPM</div>
            <div className="text-2xl font-bold text-poly-electric-blue">{stats.currentWPM}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Average WPM</div>
            <div className="text-2xl font-bold">{stats.averageWPM}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Comprehension</div>
            <div className="text-2xl font-bold text-poly-cyan">{stats.comprehensionScore}%</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm">Sessions</div>
            <div className="text-2xl font-bold">{stats.sessionsCompleted}</div>
          </div>
        </div>
        
        {/* Reading Display */}
        {isReading && !showComprehension && (
          <div className="mb-8">
            {/* Progress bar */}
            <div className="h-2 bg-gray-800 rounded-full mb-4">
              <div
                className="h-full bg-gradient-to-r from-poly-electric-blue to-poly-cyan rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Word display */}
            <div 
              className="bg-gray-800/50 rounded-2xl p-12 text-center min-h-[200px] flex items-center justify-center"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className="font-bold">
                {getCurrentDisplay()}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
              >
                {isPaused ? 'Resume' : 'Pause'} (Space)
              </button>
              <button
                onClick={() => {
                  setIsReading(false);
                  setShowComprehension(true);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
              >
                Skip to Test
              </button>
            </div>
          </div>
        )}
        
        {/* Comprehension Test */}
        {showComprehension && currentSession && (
          <div className="bg-gray-800/50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Comprehension Test</h2>
            
            {currentSession.questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-6">
                <p className="font-bold mb-3">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswer(qIndex, oIndex)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        answers[qIndex] === oIndex
                          ? 'bg-poly-electric-blue text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + oIndex)}. {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={submitComprehension}
              disabled={answers.length < currentSession.questions.length}
              className="w-full py-4 bg-gradient-to-r from-poly-electric-blue to-poly-cyan rounded-xl font-bold text-xl hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Submit Answers
            </button>
          </div>
        )}
        
        {/* Settings */}
        {!isReading && !showComprehension && (
          <>
            {/* WPM Control */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Reading Speed</h3>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setWpm(prev => Math.max(prev - 50, 100))}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
                >
                  -50
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={wpm}
                    onChange={(e) => setWpm(parseInt(e.target.value))}
                    className="w-full accent-poly-electric-blue"
                  />
                  <div className="text-center text-3xl font-bold text-poly-electric-blue mt-2">
                    {wpm} WPM
                  </div>
                </div>
                <button
                  onClick={() => setWpm(prev => Math.min(prev + 50, 1000))}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
                >
                  +50
                </button>
              </div>
              <p className="text-gray-400 text-sm text-center mt-2">
                Average reading: 200-300 WPM | Speed reading: 400-700 WPM | Elite: 800+ WPM
              </p>
            </div>
            
            {/* Display Mode */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Display Mode</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setDisplayMode('single')}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    displayMode === 'single'
                      ? 'bg-poly-electric-blue'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Single Word
                </button>
                <button
                  onClick={() => setDisplayMode('chunk')}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    displayMode === 'chunk'
                      ? 'bg-poly-electric-blue'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Chunking ({chunkSize} words)
                </button>
                <button
                  onClick={() => setDisplayMode('highlight')}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    displayMode === 'highlight'
                      ? 'bg-poly-electric-blue'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Highlight
                </button>
              </div>
              
              {displayMode === 'chunk' && (
                <div className="mt-4">
                  <label className="text-gray-400 text-sm">Chunk Size</label>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value))}
                    className="w-full accent-poly-electric-blue"
                  />
                </div>
              )}
            </div>
            
            {/* Font Size */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Font Size: {fontSize}px</h3>
              <input
                type="range"
                min="20"
                max="60"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-poly-electric-blue"
              />
            </div>
            
            {/* Text Selection */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Select a Text to Practice</h3>
              <div className="space-y-4">
                {SAMPLE_TEXTS.map((session, i) => (
                  <button
                    key={i}
                    onClick={() => startSession(session)}
                    className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-left transition-all"
                  >
                    <div className="font-bold text-poly-electric-blue">{session.title}</div>
                    <div className="text-sm text-gray-400">{session.wordCount} words</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {session.text.slice(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">How RSVP Speed Reading Works:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Words appear one at a time at a fixed focal point</li>
                <li>• This eliminates eye movement (saccades) which slows reading</li>
                <li>• Your brain can process words faster than eyes can move</li>
                <li>• Start at a comfortable speed and gradually increase</li>
                <li>• Use <span className="text-poly-electric-blue">Arrow Up/Down</span> to adjust speed during reading</li>
                <li>• Take the comprehension test after to verify understanding</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpeedReadingTrainer;

