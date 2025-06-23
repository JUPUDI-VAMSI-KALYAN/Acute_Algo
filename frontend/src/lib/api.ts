import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication API types
export interface AuthUrlRequest {
  redirectUrl: string;
}

export interface AuthUrlResponse {
  success: boolean;
  authUrl: string;
}

export interface AuthCallbackRequest {
  code: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  githubUsername?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  success: boolean;
  user: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: AuthUser;
}

// Authentication API functions
export const authApi = {
  // Get GitHub OAuth URL
  getGithubAuthUrl: async (redirectUrl: string): Promise<AuthUrlResponse> => {
    const response: AxiosResponse<AuthUrlResponse> = await api.post('/auth/github/url', {
      redirectUrl
    });
    return response.data;
  },

  // Handle GitHub OAuth callback
  handleGithubCallback: async (code: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/github/callback', {
      code
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get('/auth/user');
    return response.data;
  },

  // Logout user
  logout: async (): Promise<LogoutResponse> => {
    const response: AxiosResponse<LogoutResponse> = await api.post('/auth/logout');
    return response.data;
  },

  // Check auth status
  getAuthStatus: async (): Promise<AuthStatusResponse> => {
    const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth/status');
    return response.data;
  },
};

// Analysis API functions
export const analysisApi = {
  analyzeRepository: async (githubUrl: string) => {
    const response = await api.post('/analysis/analyze', { githubUrl });
    return response.data;
  },

  getRepositories: async () => {
    const response = await api.get('/analysis/repositories');
    return response.data;
  },

  getRepository: async (repoId: string) => {
    const response = await api.get(`/analysis/repositories/${repoId}`);
    return response.data;
  },
};

// AI API functions
export const aiApi = {
  chat: async (message: string, context?: Record<string, unknown>) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },
};

// Database API functions
export const databaseApi = {
  getAlgorithms: async () => {
    const response = await api.get('/database/algorithms');
    return response.data;
  },

  getAlgorithm: async (algorithmId: string) => {
    const response = await api.get(`/database/algorithms/${algorithmId}`);
    return response.data;
  },

  getFunctions: async () => {
    const response = await api.get('/database/functions');
    return response.data;
  },

  getFunction: async (functionId: string) => {
    const response = await api.get(`/database/functions/${functionId}`);
    return response.data;
  },
};

// Feedback API functions
export const feedbackApi = {
  createFeatureRequest: async (title: string, description: string) => {
    const response = await api.post('/feedback/feature-request', { title, description });
    return response.data;
  },

  getFeatureRequests: async () => {
    const response = await api.get('/feedback/feature-requests');
    return response.data;
  },
};

// Health API functions
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

// TypeScript interfaces
export interface FileCounts {
  javascript: number;
  python: number;
  typescript: number;
  total: number;
}

export interface BusinessMetrics {
  complexityScore: number;
  businessImpact: number;
  maintenanceRisk: number;
  performanceRisk: number;
  algorithmType: string;
  businessDomain: string;
  priorityLevel: string;
}

export interface BusinessAnalysisResult {
  businessDescription: string;
  businessMetrics: BusinessMetrics;
}

// Enhanced AI Analysis Data supporting new LangChain responses
export interface AIAnalysisData {
  // Core technical fields
  pseudocode: string;
  flowchart: string;
  complexityAnalysis: string;
  optimizationSuggestions: string[];
  potentialIssues: string[];
  analysisTimestamp?: string;
  analysisType?: string;
  
  // Enhanced fields from LangChain
  shortDescription?: string;
  overallAssessment?: string;
  recommendations?: string[];
  
  // Business analysis fields (legacy format for database compatibility)
  businessAnalysis?: BusinessAnalysisResult;
  
  // Enhanced business fields from LangChain
  businessValue?: string;
  useCases?: string[];
  performanceImpact?: string;
  scalabilityNotes?: string;
  maintenanceComplexity?: string;
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
  functionId?: string; // Database function ID for storing analysis results
  analysisType?: string; // 'algorithm_only', 'business_focused', 'quick_assessment', 'comprehensive'
}

export interface AIAnalysisResponse {
  success: boolean;
  data: AIAnalysisData;
}

export interface EnhancedAIAnalysisResponse {
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
  businessAnalysis?: BusinessAnalysisResult;
  analysisType?: string;
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
  algorithmOnly: boolean = false,
  searchTerm?: string,
  languageFilter?: string,
  scoreFilter?: string,
): Promise<{ functions: unknown[], total: number, page: number, limit: number, total_pages: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    algorithm_only: algorithmOnly.toString(),
  });
  
  if (searchTerm) {
    params.append('search_term', searchTerm);
  }
  
  if (languageFilter && languageFilter !== 'all') {
    params.append('language_filter', languageFilter);
  }
  
  if (scoreFilter && scoreFilter !== 'all') {
    params.append('score_filter', scoreFilter);
  }

  const response = await api.get(`/api/database/repository/${repositoryId}/functions?${params.toString()}`);
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
  data: AIAnalysisData;
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
    console.log('Getting function with AI analysis:', functionId);
    const response = await api.get(`/api/database/function/${functionId}/ai-analysis`);
    console.log('Function with AI analysis response:', response.data);
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error getting function with AI analysis:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 'Failed to fetch function details';
      throw new Error(message);
    }
    throw error;
  }
};

export const getAlgorithmWithAIAnalysis = async (algorithmId: string): Promise<unknown> => {
  try {
    console.log('Getting algorithm with AI analysis:', algorithmId);
    const response = await api.get(`/api/database/algorithm/${algorithmId}/ai-analysis`);
    console.log('Algorithm with AI analysis response:', response.data);
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error getting algorithm with AI analysis:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 'Failed to fetch algorithm details';
      throw new Error(message);
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

// Feedback interfaces
export interface FeedbackFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  rating: number;
  allowContact: boolean;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: number;
}

export interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  rating?: number;
  allowContact: boolean;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackStats {
  total: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  average_rating: number;
}

// ===================== FEEDBACK API FUNCTIONS =====================

export const submitFeedback = async (feedbackData: FeedbackFormData): Promise<FeedbackResponse> => {
  try {
    const response = await api.post<FeedbackResponse>('/api/feedback/', feedbackData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getFeedbackList = async (
  page: number = 1,
  limit: number = 20,
  category?: string,
  status?: string,
  priority?: string
): Promise<FeedbackListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    const response = await api.get<FeedbackListResponse>(`/api/feedback/?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getFeedbackById = async (feedbackId: number): Promise<FeedbackItem> => {
  try {
    const response = await api.get<FeedbackItem>(`/api/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const updateFeedbackStatus = async (
  feedbackId: number,
  status: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const data: { status: string; admin_notes?: string } = { status };
    if (adminNotes) data.admin_notes = adminNotes;
    
    const response = await api.put<{ success: boolean; message: string }>(
      `/api/feedback/${feedbackId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const updateFeedbackPriority = async (
  feedbackId: number,
  priority: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put<{ success: boolean; message: string }>(
      `/api/feedback/${feedbackId}/priority`,
      { priority }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  try {
    const response = await api.get<{ success: boolean; data: FeedbackStats }>('/api/feedback/stats/summary');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// ===================== PUBLIC FEATURE REQUESTS =====================

export interface UpvoteRequest {
  userIdentifier: string;
  userEmail?: string;
  userName?: string;
}

export interface UpvoteResponse {
  success: boolean;
  message: string;
  upvoteCount: number;
  userHasUpvoted: boolean;
}

export interface PublicFeatureRequest {
  id: number;
  subject: string;
  message: string;
  upvoteCount: number;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  implementationNotes?: string;
  estimatedCompletion?: string;
  userHasUpvoted?: boolean;
  recentUpvotes?: number;
}

export interface PublicFeatureListResponse {
  success: boolean;
  data: PublicFeatureRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPublicFeatureRequests = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'upvotes',
  status?: string,
  userIdentifier?: string
): Promise<PublicFeatureListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: sort,
    });
    
    if (status) params.append('status', status);
    if (userIdentifier) params.append('user_identifier', userIdentifier);
    
    const response = await api.get<PublicFeatureListResponse>(`/api/feedback/features/public?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getTrendingFeatureRequests = async (
  limit: number = 10,
  userIdentifier?: string
): Promise<PublicFeatureListResponse> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (userIdentifier) params.append('user_identifier', userIdentifier);
    
    const response = await api.get<PublicFeatureListResponse>(`/api/feedback/features/trending?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const upvoteFeatureRequest = async (
  feedbackId: number,
  upvoteData: UpvoteRequest
): Promise<UpvoteResponse> => {
  try {
    const response = await api.post<UpvoteResponse>(`/api/feedback/${feedbackId}/upvote`, upvoteData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const removeUpvoteFromFeatureRequest = async (
  feedbackId: number,
  userIdentifier: string
): Promise<UpvoteResponse> => {
  try {
    const params = new URLSearchParams({
      user_identifier: userIdentifier,
    });
    
    const response = await api.delete<UpvoteResponse>(`/api/feedback/${feedbackId}/upvote?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};