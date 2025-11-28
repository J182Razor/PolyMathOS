import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResourceScannerProps {
  userData: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const ResourceScanner: React.FC<ResourceScannerProps> = ({ userData, onNext, onBack }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing discovery engines...');
  const [foundResources, setFoundResources] = useState(0);
  const [discoveredPaths, setDiscoveredPaths] = useState<any[]>([]);

  // Simulate scanning process
  useEffect(() => {
    const tasks = [
      { task: 'Scanning academic databases...', duration: 2000 },
      { task: 'Discovering online courses...', duration: 1500 },
      { task: 'Finding research papers...', duration: 1800 },
      { task: 'Identifying datasets...', duration: 1200 },
      { task: 'Mapping learning pathways...', duration: 2500 },
      { task: 'Creating personalized curriculum...', duration: 2000 }
    ];

    let progress = 0;
    let taskIndex = 0;

    const executeTasks = async () => {
      for (const task of tasks) {
        setCurrentTask(task.task);
        const increment = 100 / tasks.length;
        
        // Animate progress
        const startTime = Date.now();
        while (Date.now() - startTime < task.duration) {
          const elapsed = Date.now() - startTime;
          const taskProgress = (elapsed / task.duration) * increment;
          setScanProgress(Math.min(progress + taskProgress, 100));
          setFoundResources(Math.floor((progress + taskProgress) * 2.3));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        progress += increment;
        setScanProgress(progress);
        
        const randomDomain = userData.domains && userData.domains.length > 0 
          ? userData.domains[Math.floor(Math.random() * userData.domains.length)]
          : 'General';

        setDiscoveredPaths(prev => [...prev, {
          id: Date.now(),
          title: `Learning Path ${taskIndex + 1}`,
          domain: randomDomain,
          resources: Math.floor(Math.random() * 15) + 5
        }]);
        taskIndex++;
      }
      
      // Final completion
      setTimeout(() => {
        onNext({
          ...userData,
          resourcesFound: Math.floor(scanProgress * 2.3),
          learningPaths: discoveredPaths
        });
      }, 1000);
    };

    executeTasks();
  }, [userData, onNext]); // Removed discoveredPaths from dependency array to avoid infinite loop

  return (
    <motion.div 
      className="poly-card poly-card-elevated max-w-3xl mx-auto px-6 py-8 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-poly-primary-500 to-poly-secondary-500 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-display-3 mb-2 sm:mb-3 text-poly-text-primary">Discovering Learning Resources</h2>
        <p className="text-sm sm:text-body-large text-poly-text-secondary">
          We're scanning thousands of sources to find the best content for your interests.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm sm:text-body-medium text-poly-text-secondary mb-2">
          <span className="truncate pr-2">{currentTask}</span>
          <span className="flex-shrink-0">{Math.round(scanProgress)}%</span>
        </div>
        <div className="h-3 bg-poly-neutral-200 dark:bg-poly-neutral-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-poly-primary-500 to-poly-secondary-500"
            style={{ width: `${scanProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="text-center poly-panel p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-poly-primary-600">{foundResources}</div>
          <div className="text-xs sm:text-sm text-poly-text-tertiary mt-1">Resources Found</div>
        </div>
        <div className="text-center poly-panel p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-poly-secondary-600">{userData.domains?.length || 0}</div>
          <div className="text-xs sm:text-sm text-poly-text-tertiary mt-1">Domains</div>
        </div>
        <div className="text-center poly-panel p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-poly-accent-600">{discoveredPaths.length}</div>
          <div className="text-xs sm:text-sm text-poly-text-tertiary mt-1">Learning Paths</div>
        </div>
      </div>

      {/* Discovered Paths Preview */}
      {discoveredPaths.length > 0 && (
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">Discovered Learning Paths</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {discoveredPaths.map((path) => (
              <motion.div 
                key={path.id}
                className="flex items-center p-3 bg-poly-neutral-50 rounded-lg border border-poly-neutral-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-poly-primary-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-poly-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-body-medium font-medium text-poly-neutral-900">
                    {path.title}
                  </div>
                  <div className="poly-caption text-poly-neutral-600">
                    {path.domain} • {path.resources} resources
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-poly-success text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-body-small text-poly-neutral-500">
        This may take a few moments. We're building something special just for you.
      </div>
    </motion.div>
  );
};

export default ResourceScanner;

