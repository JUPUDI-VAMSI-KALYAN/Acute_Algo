import React, { useState } from 'react';
import { AnalysisData, copyToClipboard } from '../../lib/api';

interface OverviewDashboardProps {
  data: AnalysisData;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

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
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{data.fileCounts.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📜</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">JavaScript</p>
              <p className="text-2xl font-bold text-gray-900">{data.fileCounts.javascript}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🐍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Python</p>
              <p className="text-2xl font-bold text-gray-900">{data.fileCounts.python}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🔷</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">TypeScript</p>
              <p className="text-2xl font-bold text-gray-900">{data.fileCounts.typescript}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Function Analysis Overview */}
      {data.functionAnalysis && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Function Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-2xl font-bold text-blue-900">{data.functionAnalysis.totalFunctions}</p>
              <p className="text-sm text-blue-600 font-medium">Total Functions</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-2xl font-bold text-green-900">{data.functionAnalysis.avgFunctionsPerFile}</p>
              <p className="text-sm text-green-600 font-medium">Average per File</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-lg font-bold text-purple-900 capitalize">
                {data.functionAnalysis.mostCommonLanguage || 'N/A'}
              </p>
              <p className="text-sm text-purple-600 font-medium">Most Used Language</p>
            </div>
          </div>
        </div>
      )}

      {/* Languages Breakdown */}
      {data.functionAnalysis && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Languages Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.functionAnalysis.languages).map(([language, stats]) => (
              <div key={language} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-gray-700 capitalize mb-3 flex items-center">
                  <span className="mr-2">
                    {language === 'python' ? '🐍' : language === 'javascript' ? '📜' : '💻'}
                  </span>
                  {language}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Functions</span>
                    <span className="font-semibold text-blue-600">{stats.functions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Files</span>
                    <span className="font-semibold text-green-600">{stats.files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg/File</span>
                    <span className="font-semibold text-purple-600">
                      {stats.files > 0 ? (stats.functions / stats.files).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Statistics</h3>
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-2xl font-bold text-indigo-900">{formatNumber(data.totalCharacters)}</span>
                <p className="text-sm text-indigo-600 font-medium">Total Characters</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">{data.fileCounts.total}</span>
                <p className="text-sm text-gray-600 font-medium">Files Analyzed</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyAll}
            disabled={copyStatus === 'copying'}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${getStatusColor(copyStatus)}`}
          >
            {getStatusText(copyStatus)}
          </button>
        </div>
      </div>
    </div>
  );
}; 