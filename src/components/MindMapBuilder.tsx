import React, { useState, useEffect } from 'react';
import { Map, Plus, X, Network } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { DomainType, PolymathUser } from '../types/polymath';

interface MindMapBuilderProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const MindMapBuilder: React.FC<MindMapBuilderProps> = ({ onComplete, onBack }) => {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes] = useState<Array<{ id: string; label: string; children: string[] }>>([]);
  const [currentNode, setCurrentNode] = useState({ label: '', parentId: '' });
  const [selectedDomain, setSelectedDomain] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
  const userService = PolymathUserService.getInstance();
  const [user, setUser] = useState<PolymathUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const domains = user ? Object.values(user.domains) : [];

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      const primary = domains.find(d => d.type === DomainType.PRIMARY);
      setSelectedDomain(primary ? primary.name : domains[0].name);
    }
  }, [domains, selectedDomain]);

  const handleAddNode = () => {
    if (!currentNode.label) return;

    const newNode = {
      id: `node_${Date.now()}`,
      label: currentNode.label,
      children: [],
    };

    if (currentNode.parentId) {
      setNodes(prev => prev.map(node =>
        node.id === currentNode.parentId
          ? { ...node, children: [...node.children, newNode.id] }
          : node
      ));
    }

    setNodes(prev => [...prev, newNode]);
    setCurrentNode({ label: '', parentId: '' });
  };

  const handleCreate = async () => {
    if (!topic || nodes.length === 0) {
      setMessages(['Please provide a topic and add at least one node']);
      return;
    }

    try {
      const mindMap = await featuresService.createMindMap(topic, nodes, selectedDomain);
      alert('Mind Map Saved!');
      setMessages([`🗺️ Mind Map created: ${mindMap.topic} (+${20 + nodes.length * 3} XP)`]);

      setTimeout(() => {
        setMessages([]);
        setTopic('');
        setNodes([]);
        if (onComplete) onComplete();
      }, 2000);
    } catch (error: any) {
      setMessages([error.message || 'Error creating mind map']);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-base p-4 text-text-primary flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-dark-base p-4 text-text-primary flex items-center justify-center">Please log in to create mind maps.</div>;

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

        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Icon icon={Map} size="xl" className="text-silver-base" />
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Mind Map Builder
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-silver-base mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Neural Network Fundamentals"
                className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-base mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary"
              >
                {domains.map((domain) => (
                  <option key={domain.name} value={domain.name}>
                    {domain.type === DomainType.PRIMARY ? '⭐' : '🔹'} {domain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-base mb-2">
                Add Node
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentNode.label}
                  onChange={(e) => setCurrentNode({ ...currentNode, label: e.target.value })}
                  placeholder="Node label"
                  className="flex-1 px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
                <Button variant="primary" onClick={handleAddNode}>
                  <Icon icon={Plus} size="sm" className="mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Nodes Visualization */}
        {nodes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
              Mind Map Structure ({nodes.length} nodes)
            </h2>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className="glass p-3 rounded-lg border border-silver-dark/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon icon={Network} size="sm" className="text-silver-base" />
                      <span className="font-medium text-text-primary">{node.label}</span>
                      {node.children.length > 0 && (
                        <span className="text-xs text-text-tertiary">
                          ({node.children.length} children)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNodes(nodes.filter(n => n.id !== node.id))}
                    >
                      <Icon icon={X} size="sm" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!topic || nodes.length === 0}
            className="ml-auto"
          >
            <Icon icon={Map} size="sm" className="mr-2" />
            Create Mind Map
          </Button>
        </div>
      </div>
    </div>
  );
};

