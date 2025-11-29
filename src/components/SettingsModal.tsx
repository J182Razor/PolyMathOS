import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Cpu, Key, Check, AlertCircle, Save, Plus, Trash2, User, Shield, Workflow, FileText, Search, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { N8NService } from '../services/N8NService';
import AppStateService, { CustomModel } from '../services/AppStateService';
import { PolymathUserService } from '../services/PolymathUserService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'data'>('integrations');
    const [n8nUrl, setN8nUrl] = useState('');
    const [n8nStatus, setN8nStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [envVars, setEnvVars] = useState({
        NVIDIA_API_KEY: '',
        GEMINI_API_KEY: '',
        GROQ_API_KEY: '',
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: '',
        BACKEND_API_URL: 'http://localhost:8000',
    });

    const [customModels, setCustomModels] = useState<CustomModel[]>([]);
    
    // SwarmShield settings
    const [swarmShieldEnabled, setSwarmShieldEnabled] = useState(true);
    const [encryptionStrength, setEncryptionStrength] = useState<'STANDARD' | 'ENHANCED' | 'MAXIMUM'>('MAXIMUM');
    
    // Zero workflow settings
    const [zeroEnabled, setZeroEnabled] = useState(false);
    const [zeroServiceUrl, setZeroServiceUrl] = useState('');
    
    // Document processing settings
    const [documentProcessingEnabled, setDocumentProcessingEnabled] = useState(true);
    const [preferredParser, setPreferredParser] = useState<'doc-master' | 'omniparse'>('omniparse');
    
    // RAG settings
    const [ragEnabled, setRagEnabled] = useState(true);
    const [ragVectorStore, setRagVectorStore] = useState<'tigerdb' | 'supabase'>('tigerdb');
    const [ragTopK, setRagTopK] = useState(5);
    
    // Custom swarms
    const [customSwarmsEnabled, setCustomSwarmsEnabled] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Load settings from AppStateService
            const appState = AppStateService.getInstance();
            const settings = appState.getSettings();
            const currentUser = appState.getUser();

            setN8nUrl(settings.n8nUrl);
            setEnvVars(settings.envVars);
            setCustomModels(settings.customModels);
            
            // Load Swarm Corporation settings
            if (settings.swarmShield) {
                setSwarmShieldEnabled(settings.swarmShield.enabled ?? true);
                setEncryptionStrength(settings.swarmShield.encryptionStrength || 'MAXIMUM');
            }
            if (settings.zero) {
                setZeroEnabled(settings.zero.enabled ?? false);
                setZeroServiceUrl(settings.zero.serviceUrl || '');
            }
            if (settings.documentProcessing) {
                setDocumentProcessingEnabled(settings.documentProcessing.enabled ?? true);
                setPreferredParser(settings.documentProcessing.preferredParser || 'omniparse');
            }
            if (settings.rag) {
                setRagEnabled(settings.rag.enabled ?? true);
                setRagVectorStore(settings.rag.vectorStore || 'tigerdb');
                setRagTopK(settings.rag.topK || 5);
            }
            if (settings.customSwarms) {
                setCustomSwarmsEnabled(settings.customSwarms.enabled ?? true);
            }

            if (settings.n8nUrl) {
                checkN8nConnection(settings.n8nUrl);
            }

            if (currentUser) {
                setUserName(currentUser.name);
                setUserEmail(currentUser.email);
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

    const handleSaveEnv = async () => {
        const appState = AppStateService.getInstance();

        // Update settings through AppStateService (will notify all listeners)
        appState.updateSettings({
            n8nUrl,
            envVars,
            customModels,
            swarmShield: {
                enabled: swarmShieldEnabled,
                encryptionStrength,
            },
            zero: {
                enabled: zeroEnabled,
                serviceUrl: zeroServiceUrl,
            },
            documentProcessing: {
                enabled: documentProcessingEnabled,
                preferredParser,
            },
            rag: {
                enabled: ragEnabled,
                vectorStore: ragVectorStore,
                topK: ragTopK,
            },
            customSwarms: {
                enabled: customSwarmsEnabled,
            },
        });

        // Update user name if changed (will notify all listeners)
        if (userName) {
            const currentUser = appState.getUser();
            if (currentUser) {
                currentUser.name = userName;
                appState.updateUser(currentUser);

                // Persist to backend
                const userService = PolymathUserService.getInstance();
                await userService.saveUser(currentUser);
            }
        }

        // Also try to sync to n8n if connected
        if (n8nStatus === 'connected') {
            // Future: Sync logic
        }

        onClose();
    };

    const addCustomModel = () => {
        const newModel: CustomModel = {
            id: Date.now().toString(),
            provider: 'NVIDIA',
            modelName: '',
            apiKey: '',
            baseUrl: ''
        };
        setCustomModels([...customModels, newModel]);
    };

    const removeCustomModel = (id: string) => {
        const updated = customModels.filter(m => m.id !== id);
        setCustomModels(updated);
        // Update immediately in AppStateService
        const appState = AppStateService.getInstance();
        appState.updateSettings({ customModels: updated });
    };

    const updateCustomModel = (id: string, field: keyof CustomModel, value: string) => {
        const updated = customModels.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        );
        setCustomModels(updated);
        // Update immediately in AppStateService
        const appState = AppStateService.getInstance();
        appState.updateSettings({ customModels: updated });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-slate-950 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800">
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
                    <div className="w-64 border-r border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'integrations' ? 'bg-blue-500/20 text-blue-400 font-medium shadow-sm' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Icon icon={Cpu} size="sm" />
                            <span>Integrations</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'data' ? 'bg-blue-500/20 text-blue-400 font-medium shadow-sm' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Icon icon={Database} size="sm" />
                            <span>Data Sets</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'general' ? 'bg-blue-500/20 text-blue-400 font-medium shadow-sm' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Icon icon={Settings} size="sm" />
                            <span>General</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-900 dark:bg-slate-900">
                        {activeTab === 'integrations' && (
                            <div className="space-y-8">
                                {/* n8n Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={Cpu} size="sm" className="mr-2 text-blue-500" />
                                        n8n Automation
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={n8nUrl}
                                                onChange={(e) => setN8nUrl(e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 dark:border-slate-600 bg-slate-900 dark:bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="http://localhost:5678"
                                            />
                                            <Button onClick={() => checkN8nConnection(n8nUrl)} disabled={n8nStatus === 'checking'}>
                                                {n8nStatus === 'checking' ? 'Checking...' : 'Test Connection'}
                                            </Button>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-400">Point this to your n8n instance to enable advanced automation features.</p>
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
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-5">
                                        {Object.entries(envVars).map(([key, value]) => (
                                            <div key={key}>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{key.replace(/_/g, ' ')}</label>
                                                <input
                                                    type="password"
                                                    value={value}
                                                    onChange={(e) => setEnvVars({ ...envVars, [key]: e.target.value })}
                                                    placeholder={`Enter your ${key.split('_')[0]} API Key`}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-600 dark:border-slate-600 bg-slate-900 dark:bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Custom Models Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                            <Icon icon={Cpu} size="sm" className="mr-2 text-blue-500" />
                                            Custom Models
                                        </h3>
                                        <Button
                                            onClick={addCustomModel}
                                            variant="outline"
                                            size="sm"
                                            className="text-slate-300 border-slate-600 hover:bg-slate-700"
                                        >
                                            <Icon icon={Plus} size="sm" className="mr-2" />
                                            Add Model
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {customModels.map((model) => (
                                            <div key={model.id} className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-semibold text-white">Custom Model</h4>
                                                    <Button
                                                        onClick={() => removeCustomModel(model.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                    >
                                                        <Icon icon={Trash2} size="sm" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Provider</label>
                                                        <select
                                                            value={model.provider}
                                                            onChange={(e) => updateCustomModel(model.id, 'provider', e.target.value)}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value="NVIDIA">NVIDIA</option>
                                                            <option value="OpenAI">OpenAI</option>
                                                            <option value="Anthropic">Anthropic</option>
                                                            <option value="Google">Google</option>
                                                            <option value="Groq">Groq</option>
                                                            <option value="Custom">Custom</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={model.modelName}
                                                            onChange={(e) => updateCustomModel(model.id, 'modelName', e.target.value)}
                                                            placeholder="e.g., llama-3.1-70b, gpt-4, claude-3-opus"
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">API Key</label>
                                                    <input
                                                        type="password"
                                                        value={model.apiKey}
                                                        onChange={(e) => updateCustomModel(model.id, 'apiKey', e.target.value)}
                                                        placeholder="Enter API key for this model"
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Base URL (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={model.baseUrl || ''}
                                                        onChange={(e) => updateCustomModel(model.id, 'baseUrl', e.target.value)}
                                                        placeholder="https://api.example.com/v1"
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {customModels.length === 0 && (
                                            <div className="p-8 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                                                <Icon icon={Cpu} size="lg" className="mx-auto mb-3 text-slate-500" />
                                                <p className="text-slate-400 mb-2">No custom models configured</p>
                                                <p className="text-sm text-slate-500 mb-4">Add custom models to use multiple models from the same provider (e.g., multiple NVIDIA models)</p>
                                                <Button
                                                    onClick={addCustomModel}
                                                    variant="outline"
                                                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                                                >
                                                    <Icon icon={Plus} size="sm" className="mr-2" />
                                                    Add Your First Model
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* SwarmShield Security Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={Shield} size="sm" className="mr-2 text-green-500" />
                                        SwarmShield Security
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Enable SwarmShield</label>
                                                <p className="text-xs text-slate-400">Encrypt all agent communications with AES-256-GCM</p>
                                            </div>
                                            <button
                                                onClick={() => setSwarmShieldEnabled(!swarmShieldEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    swarmShieldEnabled ? 'bg-green-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        swarmShieldEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {swarmShieldEnabled && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Encryption Strength</label>
                                                <select
                                                    value={encryptionStrength}
                                                    onChange={(e) => setEncryptionStrength(e.target.value as any)}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="STANDARD">Standard</option>
                                                    <option value="ENHANCED">Enhanced</option>
                                                    <option value="MAXIMUM">Maximum (Recommended)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Zero Workflow Automation Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={Workflow} size="sm" className="mr-2 text-purple-500" />
                                        Zero Workflow Automation
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Enable Zero</label>
                                                <p className="text-xs text-slate-400">Production-grade workflow automation (Zapier alternative)</p>
                                            </div>
                                            <button
                                                onClick={() => setZeroEnabled(!zeroEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    zeroEnabled ? 'bg-purple-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        zeroEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {zeroEnabled && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Zero Service URL (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={zeroServiceUrl}
                                                    onChange={(e) => setZeroServiceUrl(e.target.value)}
                                                    placeholder="http://localhost:8080"
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                                />
                                                <p className="mt-1 text-xs text-slate-400">Leave empty to use default Zero configuration</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Document Processing Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={FileText} size="sm" className="mr-2 text-blue-500" />
                                        Document Processing
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Enable Document Processing</label>
                                                <p className="text-xs text-slate-400">Use doc-master and OmniParse for document extraction</p>
                                            </div>
                                            <button
                                                onClick={() => setDocumentProcessingEnabled(!documentProcessingEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    documentProcessingEnabled ? 'bg-blue-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        documentProcessingEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {documentProcessingEnabled && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Preferred Parser</label>
                                                <select
                                                    value={preferredParser}
                                                    onChange={(e) => setPreferredParser(e.target.value as any)}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="doc-master">doc-master (Lightweight)</option>
                                                    <option value="omniparse">OmniParse (Enterprise-grade)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* RAG Settings Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={Search} size="sm" className="mr-2 text-cyan-500" />
                                        RAG (Retrieval-Augmented Generation)
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Enable RAG</label>
                                                <p className="text-xs text-slate-400">Vector-based knowledge retrieval for agents</p>
                                            </div>
                                            <button
                                                onClick={() => setRagEnabled(!ragEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    ragEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        ragEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {ragEnabled && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Vector Store</label>
                                                    <select
                                                        value={ragVectorStore}
                                                        onChange={(e) => setRagVectorStore(e.target.value as any)}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <option value="tigerdb">TigerDB (pgvector)</option>
                                                        <option value="supabase">Supabase</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Default Top-K Results</label>
                                                    <input
                                                        type="number"
                                                        value={ragTopK}
                                                        onChange={(e) => setRagTopK(parseInt(e.target.value) || 5)}
                                                        min="1"
                                                        max="20"
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                    <p className="mt-1 text-xs text-slate-400">Number of results to return for RAG queries</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>

                                {/* Custom Swarms Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white dark:text-white flex items-center">
                                        <Icon icon={Zap} size="sm" className="mr-2 text-yellow-500" />
                                        Custom Swarms
                                    </h3>
                                    <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Enable Custom Swarms</label>
                                                <p className="text-xs text-slate-400">Create and manage custom swarm configurations</p>
                                            </div>
                                            <button
                                                onClick={() => setCustomSwarmsEnabled(!customSwarmsEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    customSwarmsEnabled ? 'bg-yellow-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        customSwarmsEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {customSwarmsEnabled && (
                                            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                                                <p className="text-sm text-slate-400">
                                                    Custom swarms allow you to define your own agent configurations and workflows.
                                                    Use the Custom Swarm Builder in the main interface to create new swarms.
                                                </p>
                                            </div>
                                        )}
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
                                <h3 className="text-lg font-semibold text-white dark:text-white">General Settings</h3>
                                <p className="text-slate-400">Configure general application preferences.</p>

                                {/* User Profile Section */}
                                <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm space-y-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <Icon icon={User} className="text-blue-400" />
                                        </div>
                                        <h4 className="text-md font-semibold text-white">User Profile</h4>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">This name will be used throughout the application</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
                                    </div>
                                </div>

                                {/* Appearance Section */}
                                <div className="p-6 rounded-xl border border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-700 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-white">Dark Mode</p>
                                            <p className="text-sm text-slate-400">Toggle application theme</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-slate-700 dark:bg-slate-700 relative cursor-pointer">
                                            <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform dark:translate-x-5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 dark:border-slate-700 bg-slate-800 dark:bg-slate-800 flex justify-end space-x-3">
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

