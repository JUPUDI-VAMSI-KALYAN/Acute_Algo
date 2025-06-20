import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for large repositories like React
  withCredentials: true, // For https-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the api instance for direct use
export { api };

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
  is_algorithm: boolean;
  algorithm_score: number;
  classification_reason: string;
}

export interface FileAnalysis {
  path: string;
  language: string;
  functionCount: number;
  algorithm_count: number;
  functions: FunctionInfo[];
  breakdown: Record<string, number>;
  algorithm_breakdown: Record<string, number>;
}

export interface LanguageStats {
  files: number;
  functions: number;
  algorithms: number;
}

export interface FunctionAnalysis {
  totalFunctions: number;
  totalAlgorithms: number;
  totalAnalyzedFiles: number;
  languages: Record<string, LanguageStats>;
  files: FileAnalysis[];
  avgFunctionsPerFile: number;
  avgAlgorithmsPerFile: number;
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

// ===================== AI ANALYSIS FUNCTIONS =====================

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

// New database-related interfaces
export interface Repository {
  id: string;
  name: string;
  githubUrl: string;
  directoryTree?: string;
  fileContents?: string;
  totalCharacters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisSession {
  id: string;
  repositoryId: string;
  totalFunctions: number;
  totalAlgorithms: number;
  totalAnalyzedFiles: number;
  avgFunctionsPerFile: number;
  avgAlgorithmsPerFile: number;
  mostCommonLanguage?: string;
  createdAt: string;
}

export interface DatabaseAIAnalysis {
  id: string;
  functionId: string;
  pseudocode: string;
  flowchart: string;
  complexityAnalysis: string;
  optimizationSuggestions: string[];
  potentialIssues: string[];
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  contextType: string;
  contextData?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatMessageDB {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

// New API functions for database operations
export const analyzeAndSaveRepository = async (githubUrl: string): Promise<{
  success: boolean;
  message: string;
  repositoryId: string;
  analysisSessionId: string;
  data: AnalysisData;
}> => {
  try {
    const response = await api.post('/api/analyze-and-save', { github_url: githubUrl });
    const responseData = response.data;

    // The backend might send snake_case, let's normalize it to what the frontend expects.
    const normalizedData = {
      ...responseData,
      repositoryId: responseData.repositoryId || responseData.repository_id,
      analysisSessionId: responseData.analysisSessionId || responseData.analysis_session_id,
    };

    return normalizedData;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Error Response:', error.response.data);
    }
    throw error;
  }
};

export const getRepositories = async (): Promise<Repository[]> => {
  try {
    const response = await api.get('/api/database/repositories');
    return response.data;
  } catch (error) {
    console.error('Failed to get repositories:', error);
    return [];
  }
};

export const getRepositoriesSummary = async (limit: number = 10): Promise<Repository[]> => {
  const response = await api.get(`/api/database/repositories/summary?limit=${limit}`);
  return response.data;
};

export const getRepositoryAnalysis = async (repositoryId: string): Promise<{
  repository: Repository;
  analysisSession: AnalysisSession;
  fileAnalyses: unknown[];
  functions: unknown[];
  languageStats: unknown[];
}> => {
  try {
    const response = await api.get(`/api/database/repository/${repositoryId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getRepositoryOverview = async (repositoryId: number): Promise<{
  repository: Repository;
  analysisSession: AnalysisSession;
  fileAnalyses: unknown[];
  functions: unknown[];
  languageStats: unknown[];
}> => {
  const response = await api.get(`/api/database/repository/${repositoryId}/overview`);
  return response.data;
};

export const getRepositoryFunctions = async (
  repositoryId: number, 
  page: number = 1, 
  limit: number = 20, 
  algorithmOnly: boolean = false
): Promise<{ functions: unknown[], total: number, page: number, limit: number, total_pages: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    algorithm_only: algorithmOnly.toString()
  });
  const response = await api.get(`/api/database/repository/${repositoryId}/functions?${params}`);
  return response.data;
};

export const getRepositoryFiles = async (
  repositoryId: number, 
  page: number = 1, 
  limit: number = 20
): Promise<{ files: unknown[], total: number, page: number, limit: number, total_pages: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  const response = await api.get(`/api/database/repository/${repositoryId}/files?${params}`);
  return response.data;
};

export const saveAIAnalysis = async (data: {
  functionId: string;
  pseudocode: string;
  flowchart: string;
  complexityAnalysis: string;
  optimizationSuggestions: string[];
  potentialIssues: string[];
}): Promise<unknown> => {
  try {
    const response = await api.post('/api/database/ai-analysis', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getFunctionWithAIAnalysis = async (functionId: string): Promise<unknown> => {
  try {
    const response = await api.get(`/api/database/function/${functionId}/ai-analysis`);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to get function data');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const createChatConversation = async (data: {
  title: string;
  contextType: string;
  contextData?: Record<string, unknown>;
}): Promise<ChatConversation> => {
  try {
    const response = await api.post('/api/database/chat/conversation', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const saveChatMessage = async (data: {
  conversationId: string;
  role: string;
  content: string;
}): Promise<unknown> => {
  try {
    const response = await api.post('/api/database/chat/message', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export interface AlgorithmFunction {
  id: string;
  name: string;
  type: string;
  start_line: number;
  end_line: number;
  line_count: number;
  is_algorithm: boolean;
  algorithm_score: number;
  classification_reason: string;
  file_analyses: {
    file_path: string;
    language: string;
  };
}