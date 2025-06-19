import React, { useState } from 'react';
import { AnalysisData, copyToClipboard } from '../../lib/api';

interface CodeViewerProps {
  data: AnalysisData;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ data }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleCopyAll = async () => {
    setCopyStatus('copying');
    
    try {
      const success = await copyToClipboard(data.fileContents);
      if (success) {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3000);
      } else {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 3000);
      }
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'copying': return 'bg-blue-600';
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'copying': return 'Copying...';
      case 'success': return 'Copied!';
      case 'error': return 'Failed';
      default: return 'Copy All Files';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Code Files</h2>
            <p className="text-gray-600">
              All source code from <span className="font-medium">{data.repositoryName}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{formatNumber(data.totalCharacters)}</span> characters
            </div>
            <button
              onClick={handleCopyAll}
              disabled={copyStatus === 'copying'}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${getStatusColor(copyStatus)}`}
            >
              {getStatusText(copyStatus)}
            </button>
          </div>
        </div>
      </div>

      {/* Code Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-lg">📝</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Characters</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data.totalCharacters)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-lg">📄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-xl font-bold text-gray-900">{data.fileCounts.total}</p>
            </div>
          </div>
        </div>

        {data.functionAnalysis && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-lg">⚡</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Functions</p>
                  <p className="text-xl font-bold text-gray-900">{data.functionAnalysis.totalFunctions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-lg">📊</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Avg/File</p>
                  <p className="text-xl font-bold text-gray-900">{data.functionAnalysis.avgFunctionsPerFile}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Code Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💻</span>
              <h3 className="font-semibold text-gray-900">Source Code</h3>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className={`text-gray-100 font-mono text-sm overflow-x-auto ${
              isExpanded ? 'max-h-none' : 'max-h-96'
            } overflow-y-auto`}>
              {data.fileContents ? (
                <pre className="p-4 whitespace-pre-wrap">
                  {data.fileContents}
                </pre>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <span className="text-2xl mb-2 block">📄</span>
                  <p>No code files found or content not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!isExpanded && data.fileContents && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show full content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 