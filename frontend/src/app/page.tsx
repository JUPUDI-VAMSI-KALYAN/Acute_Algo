'use client';

import React, { useState } from 'react';
import { RepositoryForm, DashboardLayout } from '../components';
import { AnalysisData } from '../lib/api';

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string>('');
  const [currentGithubUrl, setCurrentGithubUrl] = useState<string>('');

  const handleAnalysisComplete = (data: AnalysisData, githubUrl?: string) => {
    setAnalysisData(data);
    setError('');
    if (githubUrl) {
      setCurrentGithubUrl(githubUrl);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAnalysisData(null);
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError('');
    setCurrentGithubUrl('');
  };

  const handleRescan = (data: AnalysisData) => {
    setAnalysisData(data);
    setError('');
  };

  // If we have analysis data, show the full-screen dashboard
  if (analysisData) {
    return (
      <DashboardLayout 
        data={analysisData} 
        onReset={handleReset}
        onRescan={handleRescan}
        onError={handleError}
        githubUrl={currentGithubUrl}
      />
    );
  }

  // Otherwise, show the repository form with the original layout
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Acute Algo</h1>
          <p className="text-lg text-gray-600">GitHub Repository Analysis Tool</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Repository Form */}
        <RepositoryForm 
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with Next.js, FastAPI, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
}
