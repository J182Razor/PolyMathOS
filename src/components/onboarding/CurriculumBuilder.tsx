import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Milestone {
  week: number;
  topic: string;
  completed: boolean;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  resources: number;
  milestones: Milestone[];
  domain: string;
  estimatedHours: number;
}

interface CurriculumBuilderProps {
  userData: any;
  onComplete: (program: any) => void;
  onBack?: () => void;
}

const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({ userData, onComplete, onBack }) => {
  // Generate sample learning paths based on user domains
  const generateLearningPaths = (): LearningPath[] => {
    const domains = userData.domains && userData.domains.length > 0 ? userData.domains : ['General'];
    return domains.map((domain: string, index: number) => ({
      id: index + 1,
      title: `${domain} Mastery Path`,
      description: `A comprehensive journey through ${domain} fundamentals to advanced concepts`,
      duration: Math.floor(Math.random() * 12) + 6, // weeks
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
      resources: Math.floor(Math.random() * 50) + 20,
      milestones: [
        { week: 1, topic: 'Foundations', completed: false },
        { week: 3, topic: 'Core Concepts', completed: false },
        { week: 6, topic: 'Practical Applications', completed: false },
        { week: 9, topic: 'Advanced Topics', completed: false }
      ],
      domain: domain,
      estimatedHours: Math.floor(Math.random() * 40) + 20
    }));
  };

  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [programName, setProgramName] = useState(`${userData.userName || 'User'}'s Learning Journey`);
  const [learningPaths] = useState<LearningPath[]>(generateLearningPaths());

  const handleCreateProgram = () => {
    const program = {
      name: programName,
      userId: userData.userId || 'guest',
      startDate: new Date(),
      paths: selectedPath ? [selectedPath] : learningPaths,
      progress: 0,
      createdAt: new Date()
    };
    
    onComplete(program);
  };

  return (
    <motion.div 
      className="poly-card poly-card-elevated max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-poly-accent-500 to-poly-primary-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-display-3 mb-3">Your Personalized Learning Program</h2>
        <p className="text-body-large text-poly-neutral-600">
          We've created customized learning paths based on your interests. Choose one to get started!
        </p>
      </div>

      {/* Program Name */}
      <div className="mb-8">
        <label className="block text-body-medium text-poly-neutral-700 mb-2">
          Program Name
        </label>
        <input
          type="text"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          className="poly-input w-full"
        />
      </div>

      {/* Learning Paths */}
      <div className="mb-8">
        <h3 className="text-heading-3 mb-4">Recommended Learning Paths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map((path) => (
            <motion.div
              key={path.id}
              onClick={() => setSelectedPath(path)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedPath?.id === path.id
                  ? 'border-poly-primary-500 bg-poly-primary-50'
                  : 'border-poly-neutral-200 hover:border-poly-neutral-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-heading-3 text-poly-neutral-900">{path.title}</h4>
                {selectedPath?.id === path.id && (
                  <div className="w-6 h-6 rounded-full bg-poly-primary-500 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-body-small text-poly-neutral-600 mb-4">
                {path.description}
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="poly-panel p-2 flex flex-col justify-center">
                  <div className="text-body-medium font-semibold text-poly-neutral-900">
                    {path.duration}w
                  </div>
                  <div className="text-xs text-poly-neutral-600">Duration</div>
                </div>
                <div className="poly-panel p-2 flex flex-col justify-center">
                  <div className="text-body-medium font-semibold text-poly-neutral-900">
                    {path.resources}
                  </div>
                  <div className="text-xs text-poly-neutral-600">Resources</div>
                </div>
                <div className="poly-panel p-2 flex flex-col justify-center">
                  <div className="text-body-medium font-semibold text-poly-neutral-900">
                    {path.estimatedHours}h
                  </div>
                  <div className="text-xs text-poly-neutral-600">Est. Hours</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  path.difficulty === 'Beginner' 
                    ? 'bg-poly-accent-100 text-poly-accent-800' 
                    : path.difficulty === 'Intermediate' 
                      ? 'bg-poly-primary-100 text-poly-primary-800' 
                      : 'bg-poly-secondary-100 text-poly-secondary-800'
                }`}>
                  {path.difficulty}
                </span>
                <span className="poly-caption text-poly-neutral-500">
                  {path.domain}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones Preview */}
      {selectedPath && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-heading-3 mb-4">Learning Milestones</h3>
          <div className="space-y-3">
            {selectedPath.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center p-3 bg-poly-neutral-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-poly-neutral-200 flex items-center justify-center mr-3">
                  <span className="text-body-medium font-semibold text-poly-neutral-700">
                    W{milestone.week}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-body-medium text-poly-neutral-900">
                    {milestone.topic}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-poly-neutral-300"></div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="poly-btn-secondary flex-1"
          >
            Back
          </button>
        )}
        <button
          onClick={handleCreateProgram}
          className={`poly-btn-primary ${onBack ? 'flex-1' : 'w-full'}`}
        >
          Start My Learning Journey
        </button>
      </div>
    </motion.div>
  );
};

export default CurriculumBuilder;

