import React, { useState } from 'react';
import { analyzeAndSaveRepository, AnalysisData, isValidGitHubUrl } from '../../lib/api';
import { Button } from '../ui/button';
import axios from 'axios';

interface RepositoryInputProps {
  onAnalysisComplete: (data: AnalysisData, githubUrl?: string, repositoryId?: string) => void;
  onError: (errorMessage: string) => void;
}

const exampleRepos = [
  'facebook/create-react-app',
  'hyperopt/hyperopt',
  'automl/auto-sklearn',
  'coin-or/pulp',
  'hudson-and-thames/mlfinlab',
  'ahmedfgad/GeneticAlgorithmPython'
];

export const RepositoryInput: React.FC<RepositoryInputProps> = ({ 
  onAnalysisComplete, 
  onError 
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!isValidGitHubUrl(url)) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analyzeAndSaveRepository(url);
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data, url, response.repositoryId);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.message;
        setError(errorMessage);
        onError(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
        onError(error.message);
      } else {
        const unknownError = 'An unknown error occurred.';
        setError(unknownError);
        onError(unknownError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (repo: string) => {
    setUrl(`https://github.com/${repo}`);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Analyze Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Repository</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Paste any GitHub repository URL and get instant insights into its algorithmic structure, 
            performance characteristics, and optimization opportunities.
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-700/50 shadow-2xl animate-fade-in-up delay-300">
          <div className="flex flex-col md:flex-row items-center gap-4 animate-fade-in-up delay-200">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter GitHub Repository URL (e.g., https://github.com/react-hook-form/react-hook-form)"
              className="flex-grow w-full px-5 py-3 bg-gray-700/50 text-white border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
              disabled={loading}
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-center text-red-400 animate-fade-in-up delay-300">
              {error}
            </div>
          )}

          {/* Example Repositories */}
          <div className="mt-12 animate-fade-in-up delay-500">
            <p className="text-center text-gray-400 mb-6 font-medium">
              Or try one of these popular repositories:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                             {exampleRepos.map((repo) => (
                 <button
                   key={repo}
                   onClick={() => handleExampleClick(repo)}
                   disabled={loading}
                   className="group relative px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/50 hover:border-gray-500/70 rounded-full text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-lg"
                 >
                   <span className="relative z-10">{repo}</span>
                   <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </button>
               ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-700">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">Fast Analysis</h4>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Results in under 30 seconds</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Secure & Private</h4>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Your code stays on GitHub</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">Deep Insights</h4>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Algorithm complexity analysis</p>
            </div>
          </div>
        </div>

        {/* Call to action footer */}
        <div className="mt-12 text-center animate-fade-in-up delay-900">
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Ready to discover what makes your code tick? 
            <span className="text-blue-400 font-semibold"> Paste your repository URL above</span> 
            and let&apos;s dive into the algorithms that power your project.
          </p>
        </div>
      </div>
    </section>
  );
};