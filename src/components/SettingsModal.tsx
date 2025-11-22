import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Cpu, Key, Check, AlertCircle, Save } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { N8NService } from '../services/N8NService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'data'>('integrations');
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  
  const [envVars, setEnvVars] = useState({
    NVIDIA_API_KEY: '',
    GEMINI_API_KEY: '',
    GROQ_API_KEY: '',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    BACKEND_API_URL: 'http://localhost:8000',
  });

  useEffect(() => {
    if (isOpen) {
      // Load settings
      const savedN8nUrl = localStorage.getItem('n8n_webhook_url') || '';
      setN8nUrl(savedN8nUrl);
      if (savedN8nUrl) checkN8nConnection(savedN8nUrl);

      const savedEnv = localStorage.getItem('polymathos_env');
      if (savedEnv) {
        try {
          setEnvVars(prev => ({ ...prev, ...JSON.parse(savedEnv) }));
        } catch (e) {
          console.error('Error parsing env vars', e);
        }
      }
    }
  }, [isOpen]);

  const checkN8nConnection = async (url: string) => {
    if (!url) return;
    setN8nStatus('checking');
    try {
      const testUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      localStorage.setItem('n8n_webhook_url', testUrl); // Temp save for service to use
      const isHealthy = await N8NService.checkHealth();
      setN8nStatus(isHealthy ? 'connected' : 'error');
    } catch (e) {
      setN8nStatus('error');
    }
  };

  const handleSaveEnv = () => {
    localStorage.setItem('polymathos_env', JSON.stringify(envVars));
    localStorage.setItem('n8n_webhook_url', n8nUrl);
    
    // Also try to sync to n8n if connected
    if (n8nStatus === 'connected') {
        // Future: Sync logic
    }
    onClose();
    // Optional: trigger a toast or alert
    // alert('Settings saved successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-overlay/80 backdrop-blur-sm p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-light-base dark:bg-dark-base border border-silver-200 dark:border-silver-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface">
            <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-royal-100 dark:bg-royal-900/30">
                    <Icon icon={Settings} className="text-royal-600 dark:text-royal-400" />
                </div>
                <h2 className="text-xl font-display font-bold text-text-primary dark:text-white">Settings</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
                <Icon icon={X} size="sm" />
            </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface p-4 space-y-2">
                <button
                    onClick={() => setActiveTab('integrations')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'integrations' ? 'bg-royal-50 dark:bg-royal-900/20 text-royal-600 dark:text-royal-400 font-medium shadow-sm' : 'text-text-secondary hover:bg-silver-100 dark:hover:bg-silver-800'}`}
                >
                    <Icon icon={Cpu} size="sm" />
                    <span>Integrations</span>
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'data' ? 'bg-royal-50 dark:bg-royal-900/20 text-royal-600 dark:text-royal-400 font-medium shadow-sm' : 'text-text-secondary hover:bg-silver-100 dark:hover:bg-silver-800'}`}
                >
                    <Icon icon={Database} size="sm" />
                    <span>Data Sets</span>
                </button>
                 <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'general' ? 'bg-royal-50 dark:bg-royal-900/20 text-royal-600 dark:text-royal-400 font-medium shadow-sm' : 'text-text-secondary hover:bg-silver-100 dark:hover:bg-silver-800'}`}
                >
                    <Icon icon={Settings} size="sm" />
                    <span>General</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-light-base dark:bg-dark-base">
                {activeTab === 'integrations' && (
                    <div className="space-y-8">
                        {/* n8n Section */}
                        <section className="space-y-4">
                             <h3 className="text-lg font-semibold text-text-primary dark:text-white flex items-center">
                                <Icon icon={Cpu} size="sm" className="mr-2 text-royal-500" />
                                n8n Automation
                            </h3>
                            <div className="p-6 rounded-xl border border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface shadow-sm">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Webhook URL</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={n8nUrl}
                                        onChange={(e) => setN8nUrl(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-silver-300 dark:border-silver-600 bg-light-base dark:bg-dark-base text-text-primary dark:text-white focus:ring-2 focus:ring-royal-500 outline-none transition-all"
                                        placeholder="http://localhost:5678"
                                    />
                                    <Button onClick={() => checkN8nConnection(n8nUrl)} disabled={n8nStatus === 'checking'}>
                                        {n8nStatus === 'checking' ? 'Checking...' : 'Test Connection'}
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs text-text-tertiary">Point this to your n8n instance to enable advanced automation features.</p>
                                {n8nStatus === 'connected' && (
                                    <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center">
                                        <Icon icon={Check} size="sm" className="text-green-600 mr-2" />
                                        <span className="text-sm text-green-700 dark:text-green-300">Connected Successfully</span>
                                    </div>
                                )}
                                {n8nStatus === 'error' && (
                                    <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center">
                                        <Icon icon={AlertCircle} size="sm" className="text-red-600 mr-2" />
                                        <span className="text-sm text-red-700 dark:text-red-300">Connection Failed. Please check your URL and ensure n8n is running.</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* API Keys Section */}
                        <section className="space-y-4">
                             <h3 className="text-lg font-semibold text-text-primary dark:text-white flex items-center">
                                <Icon icon={Key} size="sm" className="mr-2 text-gold-500" />
                                API Keys
                            </h3>
                             <div className="p-6 rounded-xl border border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface shadow-sm space-y-5">
                                {Object.entries(envVars).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{key.replace(/_/g, ' ')}</label>
                                        <input 
                                            type="password"
                                            value={value}
                                            onChange={(e) => setEnvVars({...envVars, [key]: e.target.value})}
                                            placeholder={`Enter your ${key.split('_')[0]} API Key`}
                                            className="w-full px-4 py-2 rounded-lg border border-silver-300 dark:border-silver-600 bg-light-base dark:bg-dark-base text-text-primary dark:text-white focus:ring-2 focus:ring-royal-500 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                ))}
                             </div>
                        </section>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Data Sets</h3>
                        <p className="text-text-secondary">Manage your local and remote datasets here.</p>
                        <div className="p-12 text-center border-2 border-dashed border-silver-300 dark:border-silver-700 rounded-xl bg-light-surface/50 dark:bg-dark-surface/50">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-silver-100 dark:bg-silver-800 flex items-center justify-center">
                                <Icon icon={Database} size="lg" className="text-silver-400" />
                            </div>
                            <p className="text-text-primary font-medium">No datasets configured</p>
                            <p className="text-text-tertiary mt-1">Drag and drop files or click to upload.</p>
                            <Button variant="outline" className="mt-4">
                                Upload Dataset
                            </Button>
                        </div>
                    </div>
                )}

                 {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-text-primary dark:text-white">General Settings</h3>
                        <p className="text-text-secondary">Configure general application preferences.</p>
                         <div className="p-6 rounded-xl border border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface shadow-sm">
                            <div className="flex items-center justify-between py-3 border-b border-silver-100 dark:border-silver-800">
                                <div>
                                    <p className="font-medium text-text-primary dark:text-white">Dark Mode</p>
                                    <p className="text-sm text-text-tertiary">Toggle application theme</p>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-silver-200 dark:bg-silver-700 relative cursor-pointer">
                                    <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform dark:translate-x-5"></div>
                                </div>
                            </div>
                            <div className="py-4 text-center">
                                <p className="text-text-tertiary italic">More settings coming soon...</p>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-silver-200 dark:border-silver-700 bg-light-surface dark:bg-dark-surface flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEnv}>
                <Icon icon={Save} size="sm" className="mr-2" />
                Save Changes
            </Button>
        </div>
      </Card>
    </div>
  );
};

