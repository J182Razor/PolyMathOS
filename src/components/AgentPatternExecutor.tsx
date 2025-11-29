/**
 * Agent Pattern Executor Component
 * UI component for executing agent patterns
 */

import React, { useState, useEffect } from 'react';
import unifiedAgentService, { PatternExecutionRequest, PatternInfo } from '../services/UnifiedAgentService';

interface AgentPatternExecutorProps {
  onResult?: (result: any) => void;
}

const AgentPatternExecutor: React.FC<AgentPatternExecutorProps> = ({ onResult }) => {
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [config, setConfig] = useState<string>('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      const data = await unifiedAgentService.listPatterns();
      setPatterns(data.patterns);
      if (data.patterns.length > 0) {
        setSelectedPattern(data.patterns[0].type);
      }
    } catch (err: any) {
      setError(`Failed to load patterns: ${err.message}`);
    }
  };

  const handleExecute = async () => {
    if (!selectedPattern || !task.trim()) {
      setError('Please select a pattern and enter a task');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let configObj = {};
      try {
        configObj = JSON.parse(config);
      } catch (e) {
        setError('Invalid JSON in config');
        setLoading(false);
        return;
      }

      const request: PatternExecutionRequest = {
        pattern_type: selectedPattern,
        task: task,
        pattern_config: configObj,
        context: { user_id: 'current_user' }
      };

      const response = await unifiedAgentService.executePattern(request);
      setResult(response);
      if (onResult) {
        onResult(response);
      }
    } catch (err: any) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatternInfo = patterns.find(p => p.type === selectedPattern);

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Agent Pattern Executor</h2>

      {/* Pattern Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Pattern
        </label>
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          {patterns.map((pattern) => (
            <option key={pattern.type} value={pattern.type}>
              {pattern.type} {pattern.available ? '✅' : '❌'}
            </option>
          ))}
        </select>
        {selectedPatternInfo && (
          <p className="mt-2 text-sm text-slate-400">
            {selectedPatternInfo.description}
          </p>
        )}
      </div>

      {/* Task Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Task
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter the task for the agent pattern..."
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[100px]"
        />
      </div>

      {/* Config Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Configuration (JSON)
        </label>
        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          placeholder='{"max_workers": 5, "strategy": "comprehensive"}'
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm min-h-[80px]"
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={loading || !selectedPattern || !task.trim()}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Executing...' : 'Execute Pattern'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Execution Result</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">Status:</span>{' '}
              <span className={`font-semibold ${
                result.status === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Execution ID:</span>{' '}
              <span className="text-slate-300 font-mono">{result.execution_id}</span>
            </div>
            <div>
              <span className="text-slate-400">Execution Time:</span>{' '}
              <span className="text-slate-300">{result.execution_time?.toFixed(2)}s</span>
            </div>
            {result.result && (
              <div className="mt-4">
                <span className="text-slate-400">Result:</span>
                <pre className="mt-2 bg-slate-800 p-3 rounded text-xs text-slate-300 overflow-auto max-h-96">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPatternExecutor;

