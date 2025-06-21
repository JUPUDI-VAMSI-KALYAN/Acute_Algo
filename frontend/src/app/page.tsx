'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection, RepositoryInput, UseCases } from '../components';
import { AnalysisData } from '../lib/api';

export default function Home() {
  const [error, setError] = useState<string>('');
  const repositoryInputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleAnalysisComplete = (data: AnalysisData, githubUrl?: string, repositoryId?: string) => {
    if (repositoryId) {
      // Navigate to dashboard with repository ID
      router.push(`/dashboard?repo=${repositoryId}`);
    } else {
      handleError('Repository ID not found. Please try again.');
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
