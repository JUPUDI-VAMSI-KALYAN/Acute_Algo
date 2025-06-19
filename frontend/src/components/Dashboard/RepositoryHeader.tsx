'use client';

import React, { useState } from 'react';
import { AnalysisData, analyzeRepository } from '../../lib/api';

interface RepositoryHeaderProps {
  data: AnalysisData;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  data,
  onReset,
  onRescan,
  onError,
  githubUrl
}) => {
  const [isRescanning, setIsRescanning] = useState(false);

  const handleRescan = async () => {
    if (!githubUrl || !onRescan || !onError) {
      window.location.reload();
      return;
    }

    setIsRescanning(true);
    
    try {
      const newData = await analyzeRepository(githubUrl);
      onRescan(newData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rescan failed';
      onError(errorMessage);
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {data.repositoryName}
            </h1>
            <p className="text-sm text-gray-500">
              Repository analysis completed • {data.fileCounts.total} files analyzed
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            <div className="flex items-center space-x-2 text-sm">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">
                {data.fileCounts.total} Total Files
              </span>
            </div>
            {data.functionAnalysis && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">
                  {data.functionAnalysis.totalFunctions} Functions
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRescan}
            disabled={isRescanning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              isRescanning 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span>{isRescanning ? '⏳' : '🔄'}</span>
            <span>{isRescanning ? 'Rescanning...' : 'Rescan'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200"
          >
            New Analysis
          </button>
        </div>
      </div>
    </header>
  );
}; 