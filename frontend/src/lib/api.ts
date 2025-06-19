import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for large repositories
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// TypeScript interfaces
export interface FileCounts {
  javascript: number;
  python: number;
  typescript: number;
  total: number;
}

export interface FunctionInfo {
  name: string;
  type: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  code?: string;
}

export interface FileAnalysis {
  path: string;
  language: string;
  functionCount: number;
  functions: FunctionInfo[];
  breakdown: Record<string, number>;
}

export interface LanguageStats {
  files: number;
  functions: number;
}

export interface FunctionAnalysis {
  totalFunctions: number;
  totalAnalyzedFiles: number;
  languages: Record<string, LanguageStats>;
  files: FileAnalysis[];
  avgFunctionsPerFile: number;
  mostCommonLanguage: string | null;
  largestFiles: FileAnalysis[];
}

export interface AnalysisData {
  repositoryName: string;
  fileCounts: FileCounts;
  directoryTree: string;
  fileContents: string;
  totalCharacters: number;
  functionAnalysis?: FunctionAnalysis;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisData;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}

// API functions
export const analyzeRepository = async (githubUrl: string): Promise<AnalysisData> => {
  try {
    const response = await api.post<AnalysisResponse>('/api/analyze-repo', {
      githubUrl,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Analysis failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch {
    throw new Error('Health check failed');
  }
};

// Utility function to validate GitHub URL format
export const isValidGitHubUrl = (url: string): boolean => {
  const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
  return githubPattern.test(url);
};

// Utility function to copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }
}; 