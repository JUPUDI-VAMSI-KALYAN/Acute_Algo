'use client';

import React, { useState, useRef } from 'react';
import { HeroSection, RepositoryInput, UseCases } from '../components';
import { AnalysisData } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [error, setError] = useState<string>('');
  const repositoryInputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleAnalysisComplete = (data: AnalysisData, githubUrl?: string) => {
    // Create a simplified version of the data for storage
    const essentialData = {
      repositoryName: data.repositoryName || '',
      fileCounts: data.fileCounts || {},
      totalCharacters: data.totalCharacters || 0,
      functionAnalysis: {
        totalFunctions: data.functionAnalysis?.totalFunctions || 0,
        totalAnalyzedFiles: data.functionAnalysis?.totalAnalyzedFiles || 0,
        avgFunctionsPerFile: data.functionAnalysis?.avgFunctionsPerFile || 0,
        mostCommonLanguage: data.functionAnalysis?.mostCommonLanguage || '',
        languages: data.functionAnalysis?.languages || {}
      }
    };

    try {
      // Store essential data in localStorage
      localStorage.setItem('analysisData', JSON.stringify(essentialData));
      // Store full data in sessionStorage (which has a larger quota)
      sessionStorage.setItem('fullAnalysisData', JSON.stringify(data));
      if (githubUrl) {
        localStorage.setItem('githubUrl', githubUrl);
      }
      // Navigate to dashboard page
      router.push('/dashboard');
    } catch (error) {
      console.error('Storage error:', error);
      // If storage fails, try with even more minimal data
      try {
        const minimalData = {
          repositoryName: data.repositoryName || '',
          functionAnalysis: {
            totalFunctions: data.functionAnalysis?.totalFunctions || 0,
            languages: data.functionAnalysis?.languages || {}
          }
        };
        localStorage.setItem('analysisData', JSON.stringify(minimalData));
        sessionStorage.setItem('fullAnalysisData', JSON.stringify(data));
        router.push('/dashboard');
      } catch {
        handleError('Unable to store analysis data. Please try a smaller repository.');
      }
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleGetStarted = () => {
    repositoryInputRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* Features section hidden for now */}
      {/* <FeatureGrid /> */}
      
      <UseCases />
      
      <div ref={repositoryInputRef}>
        <RepositoryInput 
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
        />
      </div>
      
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-400/50 rounded-2xl p-6 backdrop-blur-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-700/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-500 text-sm">
              © 2025 ThinkArc, Inc. Empowering developers worldwide.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
