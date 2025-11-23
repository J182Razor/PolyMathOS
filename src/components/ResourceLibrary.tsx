import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ACADEMIC_RESOURCES } from '../data/academicResources';

const ResourceLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'courses' | 'papers' | 'government'>('datasets');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'datasets', label: 'Datasets' },
    { id: 'courses', label: 'Courses' },
    { id: 'papers', label: 'Papers' },
    { id: 'government', label: 'Government Data' }
  ];

  const getResources = () => {
    let resources: any[] = [];
    switch (activeTab) {
      case 'datasets':
        resources = ACADEMIC_RESOURCES.datasets;
        break;
      case 'courses':
        resources = ACADEMIC_RESOURCES.courses;
        break;
      case 'papers':
        resources = ACADEMIC_RESOURCES.papers;
        break;
      case 'government':
        resources = ACADEMIC_RESOURCES.government;
        break;
      default:
        resources = [];
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return resources.filter(r => 
        r.name.toLowerCase().includes(term) || 
        r.description.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    }

    return resources;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-display-2 mb-3 sm:mb-4 text-poly-text-primary">Academic Resource Library</h1>
        <p className="text-sm sm:text-body-large text-poly-text-secondary">
          Access a comprehensive collection of free academic resources, datasets, and learning materials.
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-poly-primary-500 text-white shadow-poly-sm'
                  : 'bg-poly-neutral-100 dark:bg-poly-neutral-800 text-poly-neutral-600 dark:text-poly-neutral-300 hover:bg-poly-neutral-200 dark:hover:bg-poly-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="poly-input pl-10 w-full"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-poly-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {getResources().map((resource, index) => (
          <motion.a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="poly-card hover:shadow-poly-lg transition-all duration-300 flex flex-col h-full group no-underline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-1 rounded text-xs font-medium bg-poly-primary-50 text-poly-primary-700">
                {resource.category}
              </span>
              <svg
                className="w-5 h-5 text-poly-neutral-400 group-hover:text-poly-primary-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 className="text-base sm:text-heading-3 text-poly-text-primary mb-2 group-hover:text-poly-primary-600 transition-colors line-clamp-2">
              {resource.name}
            </h3>
            <p className="text-sm sm:text-body-small text-poly-text-secondary flex-grow line-clamp-3">
              {resource.description}
            </p>
          </motion.a>
        ))}
      </div>
      
      {getResources().length === 0 && (
        <div className="text-center py-12 text-poly-neutral-500">
          No resources found matching your search.
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;

