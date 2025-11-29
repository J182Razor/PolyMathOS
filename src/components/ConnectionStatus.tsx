import React, { useState, useEffect } from 'react';
import { ApiConnectionTester, ConnectionTestResult } from '../utils/apiConnectionTest';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const ConnectionStatus: React.FC = () => {
  const [results, setResults] = useState<ConnectionTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsTesting(true);
    const testResults = await ApiConnectionTester.testAllEndpoints();
    setResults(testResults);
    setLastTestTime(new Date());
    setIsTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const summary = ApiConnectionTester.getSummary(results);
  const allSuccessful = summary.failed === 0;

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary-dark font-bold text-lg">API Connection Status</h3>
        <button
          onClick={runTests}
          disabled={isTesting}
          className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Refresh'}
        </button>
      </div>

      {isTesting ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" text="Testing connections..." />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{summary.successful}</p>
              <p className="text-xs text-text-secondary-dark">Connected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{summary.failed}</p>
              <p className="text-xs text-text-secondary-dark">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary-dark">{summary.averageResponseTime}ms</p>
              <p className="text-xs text-text-secondary-dark">Avg Response</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mb-4">
            {allSuccessful ? (
              <div className="flex items-center gap-2 text-green-400">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="text-sm font-medium">All systems operational</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-medium">Some services unavailable</span>
              </div>
            )}
          </div>

          {/* Endpoint Results */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-background-dark"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      result.status === 'success'
                        ? 'text-green-400'
                        : result.status === 'timeout'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {result.status === 'success'
                      ? 'check_circle'
                      : result.status === 'timeout'
                      ? 'schedule'
                      : 'error'}
                  </span>
                  <span className="text-xs text-text-secondary-dark truncate">
                    {result.endpoint}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {result.responseTime && (
                    <span className="text-xs text-text-secondary-dark">
                      {result.responseTime}ms
                    </span>
                  )}
                  <span className="text-xs text-text-secondary-dark">{result.message}</span>
                </div>
              </div>
            ))}
          </div>

          {lastTestTime && (
            <p className="text-xs text-text-secondary-dark mt-4 text-center">
              Last tested: {lastTestTime.toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </div>
  );
};

