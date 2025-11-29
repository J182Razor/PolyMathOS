/**
 * Agent Pattern Dashboard Component
 * Overview dashboard for all agent patterns
 */

import React, { useState, useEffect } from 'react';
import unifiedAgentService, { PatternInfo } from '../services/UnifiedAgentService';
import AgentPatternExecutor from './AgentPatternExecutor';

const AgentPatternDashboard: React.FC = () => {
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'executor'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patternsData, statusData] = await Promise.all([
        unifiedAgentService.listPatterns(),
        unifiedAgentService.getStatus()
      ]);
      setPatterns(patternsData.patterns);
      setStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading agent patterns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Unified Agent Patterns</h1>
          <p className="text-slate-400">
            Orchestrate multi-agent workflows using various patterns
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-700">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('executor')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'executor'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Executor
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Card */}
            {status && (
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">HDAM</div>
                    <div className={`text-lg font-semibold ${
                      status.hdam_available ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {status.hdam_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">TigerDB</div>
                    <div className={`text-lg font-semibold ${
                      status.tigerdb_available ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {status.tigerdb_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Patterns</div>
                    <div className="text-lg font-semibold text-blue-400">
                      {status.patterns_available}/{status.total_patterns}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patterns Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Available Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.type}
                    className={`bg-slate-700 rounded-lg p-4 border-2 ${
                      pattern.available
                        ? 'border-green-500/50 hover:border-green-500'
                        : 'border-red-500/50 opacity-60'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {pattern.type.replace(/_/g, ' ')}
                      </h3>
                      <span className={`text-2xl ${
                        pattern.available ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pattern.available ? '✅' : '❌'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{pattern.description}</p>
                    {pattern.capabilities && pattern.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pattern.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'executor' && (
          <AgentPatternExecutor />
        )}
      </div>
    </div>
  );
};

export default AgentPatternDashboard;

