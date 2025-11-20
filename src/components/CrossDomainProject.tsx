import React, { useState, useEffect } from 'react';
import { Network, Plus, Check, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { Project, DomainType } from '../types/polymath';

interface CrossDomainProjectProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const CrossDomainProject: React.FC<CrossDomainProjectProps> = ({ onComplete, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
  const userService = PolymathUserService.getInstance();

  const user = userService.getCurrentUser();
  const domains = user ? Object.values(user.domains) : [];

  useEffect(() => {
    if (user) {
      setProjects(user.projects);
    }
  }, [user]);

  const handleToggleDomain = (domainName: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainName)
        ? prev.filter(d => d !== domainName)
        : [...prev, domainName]
    );
  };

  const handleCreate = () => {
    if (!title || !description || selectedDomains.length < 2) {
      setMessages(['Please provide a title, description, and select at least 2 domains']);
      return;
    }

    const result = featuresService.createCrossDomainProject(title, description, selectedDomains);
    setMessages(result);

    setTimeout(() => {
      setMessages([]);
      setTitle('');
      setDescription('');
      setSelectedDomains([]);
      if (user) setProjects(user.projects);
      if (onComplete) onComplete();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <Icon icon={X} size="sm" className="mr-2" />
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
          {/* Create Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Icon icon={Network} size="xl" className="text-silver-base" />
                <h1 className="text-2xl font-display font-bold text-text-primary">
                  Cross-Domain Project
                </h1>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Neural Networks in Music Composition"
                    className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how you'll combine these domains..."
                    rows={6}
                    className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-base mb-2">
                    Select Domains (at least 2)
                  </label>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <button
                        key={domain.name}
                        onClick={() => handleToggleDomain(domain.name)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                          selectedDomains.includes(domain.name)
                            ? 'border-silver-base/50 bg-silver-base/10 text-silver-light'
                            : 'border-silver-dark/30 hover:border-silver-base/50 text-text-secondary hover:text-text-primary bg-dark-surface/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {domain.type === DomainType.PRIMARY ? '⭐' : '🔹'} {domain.name}
                          </span>
                          {selectedDomains.includes(domain.name) && (
                            <Icon icon={Check} size="sm" className="text-silver-base" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleCreate}
                  disabled={!title || !description || selectedDomains.length < 2}
                  className="w-full"
                >
                  <Icon icon={Plus} size="sm" className="mr-2" />
                  Create Project
                </Button>
              </div>
            </Card>
          </div>

          {/* Projects List */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
                Your Projects ({projects.length})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-silver">
                {projects.length === 0 ? (
                  <p className="text-text-tertiary text-sm text-center py-8">
                    No projects yet. Create your first cross-domain project!
                  </p>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="glass p-3 rounded-lg border border-silver-dark/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text-primary">
                          {project.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'in_progress' ? 'bg-silver-base/20 text-silver-base' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.domains.map((domain) => (
                          <span key={domain} className="text-xs text-text-tertiary">
                            {domain}
                          </span>
                        ))}
                      </div>
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

