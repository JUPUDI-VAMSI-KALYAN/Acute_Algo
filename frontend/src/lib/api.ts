import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dolphin-app-tyzp9.ondigitalocean.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for large repositories like React
  withCredentials: true, // For https-only cookies
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

export interface AIAnalysisData {
  pseudocode: string;
  flowchart: string;
  complexityAnalysis: string;
  optimizationSuggestions: string[];
  potentialIssues: string[];
  analysisTimestamp?: string;
  analysis?: string;
}

export interface FunctionInfo {
  name: string;
  type: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  code?: string;
  aiAnalysis?: AIAnalysisData;
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

export interface AIAnalysisRequest {
  functionCode: string;
  functionName: string;
  language: string;
  filePath?: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  data: AIAnalysisData;
}

export interface AIServiceStatus {
  available: boolean;
  model: string;
  configured: boolean;
}

export interface ChatMessage {
  role: string; // 'user' or 'assistant'
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  contextType: string; // 'function', 'repository', 'general'
  functionInfo?: {
    name: string;
    code: string;
  };
  repositoryInfo?: {
    name: string;
    totalFunctions: number;
    languages: string[];
    structure?: string;
  };
  conversationHistory: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
  conversationId?: string;
}

// Add AIModelInfo interface for available AI models
export interface AIModelInfo {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Add ValidationError interface for validation errors
interface ValidationError {
  loc?: (string | number)[];
  msg: string;
}

// API functions
export const analyzeRepository = async (githubUrl: string): Promise<AnalysisData> => {
  try {
    // Use longer timeout for repository analysis - large repos like React can take 2-3 minutes
    const response = await api.post<AnalysisResponse>('/api/analyze-repo', {
      githubUrl,
    }, {
      timeout: 300000, // 5 minutes for very large repositories
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

export const analyzeFunctionWithAI = async (request: AIAnalysisRequest): Promise<AIAnalysisData> => {
  try {
    const response = await api.post<AIAnalysisResponse>('/api/ai/analyze-function', request);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('AI analysis failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getAIServiceStatus = async (): Promise<AIServiceStatus> => {
  try {
    const response = await api.get<AIServiceStatus>('/api/ai/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get AI service status:', error);
    return {
      available: false,
      model: 'unknown',
      configured: false
    };
  }
};

export const getAvailableAIModels = async (): Promise<AIModelInfo[]> => {
  try {
    const response = await api.get('/api/ai/models');
    return response.data.models || [];
  } catch (error) {
    console.error('Failed to get AI models:', error);
    return [];
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
export const chatWithAI = async (request: ChatRequest): Promise<string> => {
  try {
    console.log('Sending chat request:', request);
    const response = await api.post<ChatResponse>('/api/ai/chat', request);

    if (response.data.success) {
      return response.data.response;
    } else {
      throw new Error('Chat request failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Chat API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        request: request
      });
      
      // More detailed error message for 422 validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((err: ValidationError) => 
            `${err.loc?.join('.')} - ${err.msg}`
          ).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
      }
      
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

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