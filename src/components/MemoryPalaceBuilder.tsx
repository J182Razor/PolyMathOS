import React, { useState } from 'react';
import { Castle, Plus, X, Home, MapPin } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { MemoryPalaceItem } from '../types/polymath';

interface MemoryPalaceBuilderProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const MemoryPalaceBuilder: React.FC<MemoryPalaceBuilderProps> = ({ onComplete, onBack }) => {
  const [palaceName, setPalaceName] = useState('');
  const [items, setItems] = useState<Array<Partial<MemoryPalaceItem>>>([]);
  const [currentItem, setCurrentItem] = useState<Partial<MemoryPalaceItem>>({
    loci: '',
    content: '',
    domain: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
  const userService = PolymathUserService.getInstance();

  const user = userService.getCurrentUser();

  const handleAddItem = () => {
    if (currentItem.loci && currentItem.content) {
      setItems([...items, { ...currentItem }]);
      setCurrentItem({ loci: '', content: '', domain: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreatePalace = () => {
    if (!palaceName || items.length === 0) {
      setMessages(['Please provide a palace name and at least one item']);
      return;
    }

    const result = featuresService.createMemoryPalace(
      palaceName,
      items.map(item => ({
        loci: item.loci || '',
        content: item.content || '',
        imageUrl: item.imageUrl,
        audioUrl: item.audioUrl,
        domain: item.domain || 'General',
      }))
    );

    setMessages(result);
    setTimeout(() => {
      setMessages([]);
      if (onComplete) onComplete();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <Icon icon={X} size="sm" className="mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center space-x-3 mb-4">
            <Icon icon={Castle} size="xl" className="text-silver-base" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Memory Palace Builder
            </h1>
          </div>
          <p className="text-text-secondary">
            Create a virtual memory palace using the method of loci. Associate information with specific locations.
          </p>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <Card className="p-4 mb-6 border-2 border-silver-base">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-silver-light">{msg}</p>
            ))}
          </Card>
        )}

        {/* Palace Name */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-medium text-silver-base mb-2">
            Palace Name
          </label>
          <input
            type="text"
            value={palaceName}
            onChange={(e) => setPalaceName(e.target.value)}
            placeholder="e.g., Brain Basics Palace, History Timeline"
            className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
          />
        </Card>

        {/* Items List */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-text-primary">
              Memory Locations ({items.length})
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Icon icon={Plus} size="sm" className="mr-2" />
              Add Location
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <Icon icon={MapPin} size="xl" className="mx-auto mb-2 opacity-50" />
              <p>No locations added yet. Click "Add Location" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="glass p-4 rounded-lg border border-silver-dark/20 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon icon={Home} size="sm" className="text-silver-base" />
                      <span className="font-medium text-text-primary">{item.loci}</span>
                      {item.domain && (
                        <span className="text-xs text-text-tertiary">({item.domain})</span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm">{item.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Icon icon={X} size="sm" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Item Form */}
        {showAddForm && (
          <Card className="p-6 mb-6 border-2 border-silver-base">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
              Add Memory Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Location (Loci)
                </label>
                <input
                  type="text"
                  value={currentItem.loci}
                  onChange={(e) => setCurrentItem({ ...currentItem, loci: e.target.value })}
                  placeholder="e.g., Front Door, Living Room Couch, Kitchen Table"
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Content to Remember
                </label>
                <textarea
                  value={currentItem.content}
                  onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                  placeholder="What information do you want to associate with this location?"
                  rows={3}
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Domain (Optional)
                </label>
                <input
                  type="text"
                  value={currentItem.domain}
                  onChange={(e) => setCurrentItem({ ...currentItem, domain: e.target.value })}
                  placeholder="e.g., Neuroscience, History"
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={handleAddItem}>
                  Add Location
                </Button>
                <Button variant="ghost" onClick={() => {
                  setShowAddForm(false);
                  setCurrentItem({ loci: '', content: '', domain: '' });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleCreatePalace}
            disabled={!palaceName || items.length === 0}
            className="ml-auto"
          >
            <Icon icon={Castle} size="sm" className="mr-2" />
            Create Memory Palace
          </Button>
        </div>
      </div>
    </div>
  );
};

