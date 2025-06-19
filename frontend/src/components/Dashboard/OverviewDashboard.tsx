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

  // Calculate repository health score (basic implementation)
  const calculateHealthScore = (): number => {
    let score = 0;
    const maxScore = 100;
    
    // File organization (20 points)
    if (data.fileCounts.total > 0) {
      const avgFunctions = data.functionAnalysis?.avgFunctionsPerFile || 0;
      if (avgFunctions >= 2 && avgFunctions <= 8) score += 20;
      else if (avgFunctions > 0) score += 10;
    }
    
    // Language diversity (15 points)
    const languages = Object.keys(data.functionAnalysis?.languages || {}).length;
    if (languages >= 2) score += 15;
    else if (languages === 1) score += 10;
    
    // Code size (15 points)
    const totalFunctions = data.functionAnalysis?.totalFunctions || 0;
    if (totalFunctions >= 50) score += 15;
    else if (totalFunctions >= 20) score += 10;
    else if (totalFunctions >= 5) score += 5;
    
    // File structure (25 points)
    if (data.fileCounts.total >= 10) score += 25;
    else if (data.fileCounts.total >= 5) score += 15;
    else if (data.fileCounts.total >= 2) score += 10;
    
    // Content richness (25 points)
    const avgCharsPerFile = data.totalCharacters / Math.max(data.fileCounts.total, 1);
    if (avgCharsPerFile >= 1000) score += 25;
    else if (avgCharsPerFile >= 500) score += 15;
    else if (avgCharsPerFile >= 100) score += 10;
    
    return Math.min(score, maxScore);
  };

  const healthScore = calculateHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Calculate code density
  const codeDensity = data.functionAnalysis?.totalFunctions 
    ? (data.functionAnalysis.totalFunctions / data.fileCounts.total).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Repository Health & Key Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Repository Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Health Score */}
          <div className={`p-4 rounded-lg border-2 ${getHealthColor(healthScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Health Score</p>
                <p className="text-2xl font-bold">{healthScore}/100</p>
              </div>
              <div className="text-2xl">
                {healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : healthScore >= 40 ? '🟠' : '🔴'}
              </div>
            </div>
          </div>

          {/* Total Functions */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Functions</p>
                <p className="text-2xl font-bold text-blue-900">{data.functionAnalysis?.totalFunctions || 0}</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>

          {/* Code Density */}
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Code Density</p>
                <p className="text-2xl font-bold text-purple-900">{codeDensity}</p>
                <p className="text-xs text-purple-600">functions/file</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>

          {/* Languages Count */}
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Languages</p>
                <p className="text-2xl font-bold text-green-900">
                  {Object.keys(data.functionAnalysis?.languages || {}).length}
                </p>
              </div>
              <div className="text-2xl">🌐</div>
            </div>
          </div>
        </div>
      </div>

      {/* File Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">File Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📄</div>
            <p className="text-xl font-bold text-gray-900">{data.fileCounts.total}</p>
            <p className="text-sm text-gray-600">Total Files</p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">📜</div>
            <p className="text-xl font-bold text-yellow-900">{data.fileCounts.javascript}</p>
            <p className="text-sm text-yellow-700">JavaScript</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🐍</div>
            <p className="text-xl font-bold text-green-900">{data.fileCounts.python}</p>
            <p className="text-sm text-green-700">Python</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🔷</div>
            <p className="text-xl font-bold text-blue-900">{data.fileCounts.typescript}</p>
            <p className="text-sm text-blue-700">TypeScript</p>
          </div>
        </div>
      </div>

      {/* Language Analysis Deep Dive */}
      {data.functionAnalysis && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Language Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.functionAnalysis.languages).map(([language, stats]) => (
              <div key={language} className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-400">
                <h4 className="font-medium text-gray-700 capitalize mb-3 flex items-center">
                  <span className="mr-2">
                    {language === 'python' ? '🐍' : 
                     language === 'javascript' ? '📜' : 
                     language === 'typescript' ? '🔷' : '💻'}
                  </span>
                  {language}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Functions</span>
                    <span className="font-semibold text-indigo-600">{stats.functions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Files</span>
                    <span className="font-semibold text-green-600">{stats.files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Density</span>
                    <span className="font-semibold text-purple-600">
                      {stats.files > 0 ? (stats.functions / stats.files).toFixed(1) : '0'}/file
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {((stats.functions / (data.functionAnalysis?.totalFunctions || 1)) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repository Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Repository Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Code Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Characters</span>
                <span className="font-semibold text-gray-900">{formatNumber(data.totalCharacters)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Characters/File</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(Math.round(data.totalCharacters / Math.max(data.fileCounts.total, 1)))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Primary Language</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {data.functionAnalysis?.mostCommonLanguage || 'Mixed'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Quick Actions</h4>
            <div className="space-y-3">
              <button
                onClick={handleCopyAll}
                disabled={copyStatus === 'copying'}
                className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${getStatusColor(copyStatus)}`}
              >
                {getStatusText(copyStatus)}
              </button>
              <div className="text-xs text-gray-500 text-center">
                Export all analyzed code for external processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 