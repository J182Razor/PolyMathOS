import React, { useState } from 'react';
import { DocumentService } from '../../services/DocumentService';
import { ApiErrorHandler, ApiError } from '../../utils/apiErrorHandler';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface ResourceScannerProps {
  userData: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const ResourceScanner: React.FC<ResourceScannerProps> = ({ userData, onNext, onBack }) => {
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);
  const documentService = new DocumentService();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleProcess(selectedFile);
    }
  };

  const handleProcess = async (fileToProcess?: File | null) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate processing progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // Integrate with DocumentService API
      let result;
      if (fileToProcess) {
        try {
          result = await documentService.readFile(fileToProcess);
        } catch (err) {
          clearInterval(interval);
          const apiError = ApiErrorHandler.handleError(err);
          setError(apiError);
          setIsProcessing(false);
          return;
        }
      } else if (url) {
        try {
          // For URL, we'd need a readFromUrl method or use parse
          result = await documentService.parse({ content: url, document_type: 'url' });
        } catch (err) {
          clearInterval(interval);
          const apiError = ApiErrorHandler.handleError(err);
          setError(apiError);
          setIsProcessing(false);
          return;
        }
      }

      // Complete processing
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        onNext({
          ...userData,
          documentsProcessed: fileToProcess ? [fileToProcess.name] : [url],
          documentData: result,
        });
      }, 1000);
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error);
      setError(apiError);
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      handleProcess();
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-text-primary-dark font-display">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={onBack} className="material-symbols-outlined text-text-primary-dark">arrow_back</button>
        </div>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Add Knowledge</h1>
        <div className="size-12 shrink-0"></div>
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-4 pt-4">
        {/* Segmented Buttons */}
        <div className="flex py-3">
          <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-surface-dark p-1">
            <label className="flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal text-text-secondary-dark has-[:checked]:bg-background-dark has-[:checked]:text-primary has-[:checked]:shadow-[0_0_8px_rgba(0,255,255,0.3)]">
              <span className="truncate">Upload File</span>
              <input
                checked={sourceType === 'upload'}
                onChange={() => setSourceType('upload')}
                className="invisible w-0"
                name="source_type"
                type="radio"
                value="Upload File"
              />
            </label>
            <label className="flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal text-text-secondary-dark has-[:checked]:bg-background-dark has-[:checked]:text-primary has-[:checked]:shadow-[0_0_8px_rgba(0,255,255,0.3)]">
              <span className="truncate">Add URL</span>
              <input
                checked={sourceType === 'url'}
                onChange={() => setSourceType('url')}
                className="invisible w-0"
                name="source_type"
                type="radio"
                value="Add URL"
              />
            </label>
          </div>
        </div>

        {/* Upload File Zone */}
        {sourceType === 'upload' && (
          <div className="flex flex-col pt-8">
            <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-surface-dark px-6 py-14">
              <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
              <div className="flex max-w-[480px] flex-col items-center gap-2 text-center">
                <p className="text-lg font-bold leading-tight tracking-tight text-text-primary-dark">Upload Document</p>
                <p className="text-sm font-normal leading-normal text-text-secondary-dark">Tap to select PDF, DOCX, or TXT file</p>
              </div>
              <label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-sm font-bold leading-normal tracking-wide text-text-primary-dark">
                  <span className="truncate">Select File</span>
                </button>
              </label>
            </div>
          </div>
        )}

        {/* URL Input */}
        {sourceType === 'url' && (
          <div className="flex flex-col gap-6 pt-8">
            <div className="flex flex-col items-start gap-2">
              <p className="text-lg font-bold leading-tight tracking-tight text-text-primary-dark">Scan Web Page</p>
              <p className="text-sm font-normal leading-normal text-text-secondary-dark">Paste a URL to add it to your knowledge base.</p>
            </div>
            <div className="relative">
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="w-full rounded-lg border border-surface-dark bg-surface-dark py-3 pl-4 pr-12 text-text-primary-dark placeholder:text-text-secondary-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleUrlSubmit}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-4 mt-4">
            <ErrorMessage 
              error={error} 
              onDismiss={() => setError(null)}
              retryable={ApiErrorHandler.isRetryable(error)}
              onRetry={() => handleProcess(file)}
            />
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="flex flex-col gap-3 p-4 mt-8">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium leading-normal text-text-primary-dark">Analyzing...</p>
              <p className="text-sm font-medium text-primary">{progress}%</p>
            </div>
            <div className="h-2 rounded-full bg-surface-dark">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm font-normal leading-normal text-text-secondary-dark">This may take a moment</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="mt-auto border-t border-surface-dark bg-background-dark">
        <div className="flex gap-2 px-4 pb-3 pt-2">
          <a className="flex flex-1 flex-col items-center justify-end gap-1" href="#">
            <span className="material-symbols-outlined text-text-secondary-dark">dashboard</span>
            <p className="text-xs font-medium tracking-wide text-text-secondary-dark">Dashboard</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1" href="#">
            <span className="material-symbols-outlined font-bold text-primary">center_focus_strong</span>
            <p className="text-xs font-bold tracking-wide text-primary">Scanner</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1" href="#">
            <span className="material-symbols-outlined text-text-secondary-dark">forum</span>
            <p className="text-xs font-medium tracking-wide text-text-secondary-dark">Chat</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1" href="#">
            <span className="material-symbols-outlined text-text-secondary-dark">person</span>
            <p className="text-xs font-medium tracking-wide text-text-secondary-dark">Profile</p>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ResourceScanner;
