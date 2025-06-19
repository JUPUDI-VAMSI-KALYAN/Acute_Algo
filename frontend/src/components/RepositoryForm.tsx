import React, { useState } from 'react';
import { analyzeRepository, isValidGitHubUrl, AnalysisData } from '../lib/api';

interface RepositoryFormProps {
  onAnalysisComplete: (data: AnalysisData, githubUrl?: string) => void;
  onError: (error: string) => void;
}

export const RepositoryForm: React.FC<RepositoryFormProps> = ({ 
  onAnalysisComplete, 
  onError 
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGithubUrl(url);
    setIsValid(url.length > 0 && isValidGitHubUrl(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      onError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await analyzeRepository(githubUrl);
      onAnalysisComplete(data, githubUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Repository Analysis
          </h2>
          <p className="text-gray-600">
            Enter a GitHub repository URL to analyze its code structure and functions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="github-url" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              GitHub Repository URL
            </label>
            <input
              id="github-url"
              type="url"
              value={githubUrl}
              onChange={handleUrlChange}
              placeholder="https://github.com/username/repository"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                githubUrl && !isValid
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {githubUrl && !isValid && (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              isValid && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing Repository...
              </div>
            ) : (
              'Analyze Repository'
            )}
          </button>
        </form>

        {/* Example URLs */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Try these examples:</h3>
          <div className="space-y-1">
            {[
              'https://github.com/octocat/Hello-World',
              'https://github.com/facebook/create-react-app',
              'https://github.com/microsoft/vscode'
            ].map((url, index) => (
              <button
                key={index}
                onClick={() => {
                  setGithubUrl(url);
                  setIsValid(true);
                }}
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                disabled={isLoading}
              >
                {url}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 