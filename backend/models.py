from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional


class AnalysisRequest(BaseModel):
    """Request model for repository analysis"""

    github_url: str = Field(..., alias="githubUrl", description="GitHub repository URL")

    model_config = ConfigDict(populate_by_name=True)


class FileCounts(BaseModel):
    """File counts by extension"""

    javascript: int = Field(default=0, alias="javascript")
    python: int = Field(default=0, alias="python")
    typescript: int = Field(default=0, alias="typescript")
    total: int = Field(default=0, alias="total")

    model_config = ConfigDict(populate_by_name=True)


# Business Analysis Models
class BusinessMetrics(BaseModel):
    """Business-focused metrics for algorithms"""

    complexity_score: int = Field(
        ..., alias="complexityScore", description="Complexity score 1-10"
    )
    business_impact: int = Field(
        ..., alias="businessImpact", description="Business impact score 1-10"
    )
    maintenance_risk: int = Field(
        ..., alias="maintenanceRisk", description="Maintenance risk score 1-10"
    )
    performance_risk: int = Field(
        ..., alias="performanceRisk", description="Performance risk score 1-10"
    )
    algorithm_type: str = Field(
        ..., alias="algorithmType", description="Type of algorithm"
    )
    business_domain: str = Field(
        ..., alias="businessDomain", description="Business domain"
    )
    priority_level: str = Field(
        ..., alias="priorityLevel", description="Priority: Low, Medium, High"
    )

    model_config = ConfigDict(populate_by_name=True)


class BusinessAnalysisResult(BaseModel):
    """Business analysis results"""

    business_description: str = Field(
        ..., alias="businessDescription", description="Brief business purpose"
    )
    business_metrics: BusinessMetrics = Field(..., alias="businessMetrics")

    model_config = ConfigDict(populate_by_name=True)


class AIAnalysisData(BaseModel):
    """Enhanced AI analysis data supporting both legacy and new LangChain formats"""

    # Core technical fields
    pseudocode: str = Field(..., alias="pseudocode")
    flowchart: str = Field(..., alias="flowchart")
    complexity_analysis: str = Field(..., alias="complexityAnalysis")
    optimization_suggestions: List[str] = Field(
        default=[], alias="optimizationSuggestions"
    )
    potential_issues: List[str] = Field(default=[], alias="potentialIssues")
    analysis_timestamp: Optional[str] = Field(None, alias="analysisTimestamp")
    analysis_type: Optional[str] = Field("comprehensive", alias="analysisType")

    # Enhanced fields from LangChain
    short_description: Optional[str] = Field(None, alias="shortDescription")
    overall_assessment: Optional[str] = Field(None, alias="overallAssessment")
    recommendations: List[str] = Field(default=[], alias="recommendations")

    # Business analysis fields (legacy format for database compatibility)
    business_analysis: Optional[BusinessAnalysisResult] = Field(
        None, alias="businessAnalysis"
    )

    # Enhanced business fields from LangChain
    business_value: Optional[str] = Field(None, alias="businessValue")
    use_cases: List[str] = Field(default=[], alias="useCases")
    performance_impact: Optional[str] = Field(None, alias="performanceImpact")
    scalability_notes: Optional[str] = Field(None, alias="scalabilityNotes")
    maintenance_complexity: Optional[str] = Field(None, alias="maintenanceComplexity")

    model_config = ConfigDict(populate_by_name=True)


class FunctionInfo(BaseModel):
    """Information about a single function"""

    name: str = Field(..., alias="name")
    type: str = Field(..., alias="type")
    start_line: int = Field(..., alias="startLine")
    end_line: int = Field(..., alias="endLine")
    line_count: int = Field(..., alias="lineCount")
    code: Optional[str] = Field(None, alias="code", description="Function source code")
    is_algorithm: bool = Field(
        default=False,
        alias="isAlgorithm",
        description="Whether function is classified as algorithmic",
    )
    algorithm_score: float = Field(
        default=0.0,
        alias="algorithmScore",
        description="Algorithm classification score",
    )
    classification_reason: str = Field(
        default="",
        alias="classificationReason",
        description="Reason for classification",
    )
    ai_analysis: Optional[AIAnalysisData] = Field(
        None, alias="aiAnalysis", description="AI-generated analysis"
    )

    model_config = ConfigDict(populate_by_name=True)


class FileAnalysis(BaseModel):
    """Analysis data for a single file"""

    path: str = Field(..., alias="path")
    language: str = Field(..., alias="language")
    function_count: int = Field(..., alias="functionCount")
    algorithm_count: int = Field(default=0, alias="algorithmCount")
    functions: List[FunctionInfo] = Field(default=[], alias="functions")
    breakdown: Dict[str, int] = Field(default={}, alias="breakdown")
    algorithm_breakdown: Dict[str, int] = Field(default={}, alias="algorithmBreakdown")

    model_config = ConfigDict(populate_by_name=True)


class LanguageStats(BaseModel):
    """Statistics for a programming language"""

    files: int = Field(..., alias="files")
    functions: int = Field(..., alias="functions")
    algorithms: int = Field(default=0, alias="algorithms")

    model_config = ConfigDict(populate_by_name=True)


class FunctionAnalysis(BaseModel):
    """Function analysis results"""

    total_functions: int = Field(..., alias="totalFunctions")
    total_algorithms: int = Field(default=0, alias="totalAlgorithms")
    total_analyzed_files: int = Field(..., alias="totalAnalyzedFiles")
    languages: Dict[str, LanguageStats] = Field(default={}, alias="languages")
    files: List[FileAnalysis] = Field(default=[], alias="files")
    avg_functions_per_file: float = Field(..., alias="avgFunctionsPerFile")
    avg_algorithms_per_file: float = Field(default=0.0, alias="avgAlgorithmsPerFile")
    most_common_language: Optional[str] = Field(None, alias="mostCommonLanguage")
    largest_files: List[FileAnalysis] = Field(default=[], alias="largestFiles")

    model_config = ConfigDict(populate_by_name=True)


class AnalysisData(BaseModel):
    """Analysis data for a repository"""

    repository_name: str = Field(..., alias="repositoryName")
    file_counts: FileCounts = Field(..., alias="fileCounts")
    directory_tree: str = Field(..., alias="directoryTree")
    file_contents: str = Field(..., alias="fileContents")
    total_characters: int = Field(..., alias="totalCharacters")
    function_analysis: Optional[FunctionAnalysis] = Field(
        None, alias="functionAnalysis"
    )

    model_config = ConfigDict(populate_by_name=True)


class AnalysisResponse(BaseModel):
    """Response model for successful analysis"""

    success: bool = Field(default=True, alias="success")
    data: AnalysisData = Field(..., alias="data")

    model_config = ConfigDict(populate_by_name=True)


class ErrorResponse(BaseModel):
    """Response model for errors"""

    success: bool = Field(default=False, alias="success")
    error: str = Field(..., alias="error")

    model_config = ConfigDict(populate_by_name=True)


class AIAnalysisRequest(BaseModel):
    """Request model for AI function analysis"""

    function_code: str = Field(..., alias="functionCode")
    function_name: str = Field(..., alias="functionName")
    language: str = Field(..., alias="language")
    file_path: Optional[str] = Field(None, alias="filePath")
    function_id: Optional[int] = Field(
        None,
        alias="functionId",
        description="Database function ID for storing analysis results",
    )
    analysis_type: Optional[str] = Field(
        "comprehensive",
        alias="analysisType",
        description="Type of analysis: algorithm_only, business_focused, quick_assessment, comprehensive",
    )

    model_config = ConfigDict(populate_by_name=True)


class AIAnalysisResponse(BaseModel):
    """Response model for AI analysis"""

    success: bool = Field(default=True, alias="success")
    data: AIAnalysisData = Field(..., alias="data")

    model_config = ConfigDict(populate_by_name=True)


# Chat-related models
class ChatMessage(BaseModel):
    """Individual chat message"""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(None, description="Message timestamp")

    model_config = ConfigDict(populate_by_name=True)


class ChatRequest(BaseModel):
    """Request model for chat functionality"""

    message: str = Field(..., description="User message")
    context_type: str = Field(
        ...,
        alias="contextType",
        description="Context type: 'function', 'repository', 'general'",
    )
    function_info: Optional[dict] = Field(
        None, alias="functionInfo", description="Function context"
    )
    repository_info: Optional[dict] = Field(
        None, alias="repositoryInfo", description="Repository context"
    )
    conversation_history: List[ChatMessage] = Field(
        default=[], alias="conversationHistory"
    )

    model_config = ConfigDict(populate_by_name=True)


class ChatResponse(BaseModel):
    """Response model for chat"""

    success: bool = Field(default=True, alias="success")
    response: str = Field(..., description="AI response")
    conversation_id: Optional[str] = Field(None, alias="conversationId")

    model_config = ConfigDict(populate_by_name=True)


# Additional AI Analysis Models for LangChain
class AIAnalysisResult(BaseModel):
    """Technical analysis result from AI"""

    short_description: str = Field(
        ..., alias="shortDescription", description="Brief description of the algorithm"
    )
    pseudocode: str = Field(
        ..., alias="pseudocode", description="Pseudocode representation"
    )
    flowchart: str = Field(..., alias="flowchart", description="Flowchart description")
    complexity_analysis: str = Field(
        ...,
        alias="complexityAnalysis",
        description="Time and space complexity analysis",
    )
    optimization_suggestions: List[str] = Field(
        default=[],
        alias="optimizationSuggestions",
        description="Optimization recommendations",
    )
    potential_issues: List[str] = Field(
        default=[], alias="potentialIssues", description="Potential issues and risks"
    )

    model_config = ConfigDict(populate_by_name=True)


class LangChainBusinessAnalysisResult(BaseModel):
    """Business analysis result for LangChain AI service"""

    business_value: str = Field(
        ..., alias="businessValue", description="Business value description"
    )
    use_cases: List[str] = Field(
        default=[], alias="useCases", description="Potential use cases"
    )
    performance_impact: str = Field(
        ..., alias="performanceImpact", description="Performance impact assessment"
    )
    scalability_notes: str = Field(
        ..., alias="scalabilityNotes", description="Scalability considerations"
    )
    maintenance_complexity: str = Field(
        ...,
        alias="maintenanceComplexity",
        description="Maintenance complexity assessment",
    )

    model_config = ConfigDict(populate_by_name=True)


class ComprehensiveAnalysisResult(BaseModel):
    """Comprehensive analysis combining technical and business aspects"""

    technical_analysis: AIAnalysisResult = Field(
        ..., alias="technicalAnalysis", description="Technical analysis results"
    )
    business_analysis: LangChainBusinessAnalysisResult = Field(
        ..., alias="businessAnalysis", description="Business analysis results"
    )
    overall_assessment: str = Field(
        ..., alias="overallAssessment", description="Overall assessment summary"
    )
    recommendations: List[str] = Field(
        default=[], alias="recommendations", description="Overall recommendations"
    )

    model_config = ConfigDict(populate_by_name=True)


# Feedback Models
class FeedbackRequest(BaseModel):
    """Request model for submitting feedback"""
    
    name: str = Field(..., alias="name", description="User's name")
    email: str = Field(..., alias="email", description="User's email")
    category: str = Field(..., alias="category", description="Feedback category")
    subject: str = Field(..., alias="subject", description="Feedback subject")
    message: str = Field(..., alias="message", description="Feedback message")
    rating: Optional[int] = Field(None, alias="rating", description="Rating 1-5")
    allow_contact: bool = Field(True, alias="allowContact", description="Allow contact permission")
    
    model_config = ConfigDict(populate_by_name=True)


class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    
    success: bool = Field(default=True, alias="success")
    message: str = Field(..., alias="message")
    feedback_id: Optional[int] = Field(None, alias="feedbackId")
    
    model_config = ConfigDict(populate_by_name=True)


class FeedbackItem(BaseModel):
    """Model for feedback item"""
    
    id: int = Field(..., alias="id")
    name: str = Field(..., alias="name")
    email: str = Field(..., alias="email")
    category: str = Field(..., alias="category")
    subject: str = Field(..., alias="subject")
    message: str = Field(..., alias="message")
    rating: Optional[int] = Field(None, alias="rating")
    allow_contact: bool = Field(..., alias="allowContact")
    status: str = Field(..., alias="status")
    priority: str = Field(..., alias="priority")
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")
    resolved_at: Optional[str] = Field(None, alias="resolvedAt")
    admin_notes: Optional[str] = Field(None, alias="adminNotes")
    upvote_count: int = Field(default=0, alias="upvoteCount")
    is_public: bool = Field(default=False, alias="isPublic")
    implementation_notes: Optional[str] = Field(None, alias="implementationNotes")
    estimated_completion: Optional[str] = Field(None, alias="estimatedCompletion")
    user_has_upvoted: Optional[bool] = Field(None, alias="userHasUpvoted")
    recent_upvotes: Optional[int] = Field(None, alias="recentUpvotes")
    
    model_config = ConfigDict(populate_by_name=True)


class FeedbackListResponse(BaseModel):
    """Response model for feedback list"""
    
    success: bool = Field(default=True, alias="success")
    data: List[FeedbackItem] = Field(..., alias="data")
    total: int = Field(..., alias="total")
    page: int = Field(..., alias="page")
    limit: int = Field(..., alias="limit")
    total_pages: int = Field(..., alias="totalPages")
    
    model_config = ConfigDict(populate_by_name=True)


# Upvote Models
class UpvoteRequest(BaseModel):
    """Request model for upvoting feedback"""
    
    user_identifier: str = Field(..., alias="userIdentifier", description="Unique user identifier")
    user_email: Optional[str] = Field(None, alias="userEmail", description="User email (optional)")
    user_name: Optional[str] = Field(None, alias="userName", description="User name (optional)")
    
    model_config = ConfigDict(populate_by_name=True)


class UpvoteResponse(BaseModel):
    """Response model for upvote operations"""
    
    success: bool = Field(default=True, alias="success")
    message: str = Field(..., alias="message")
    upvote_count: int = Field(..., alias="upvoteCount")
    user_has_upvoted: bool = Field(..., alias="userHasUpvoted")
    
    model_config = ConfigDict(populate_by_name=True)


class PublicFeatureRequest(BaseModel):
    """Model for public feature requests"""
    
    id: int = Field(..., alias="id")
    subject: str = Field(..., alias="subject")
    message: str = Field(..., alias="message")
    upvote_count: int = Field(..., alias="upvoteCount")
    status: str = Field(..., alias="status")
    priority: str = Field(..., alias="priority")
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")
    implementation_notes: Optional[str] = Field(None, alias="implementationNotes")
    estimated_completion: Optional[str] = Field(None, alias="estimatedCompletion")
    user_has_upvoted: Optional[bool] = Field(None, alias="userHasUpvoted")
    recent_upvotes: Optional[int] = Field(None, alias="recentUpvotes")
    
    model_config = ConfigDict(populate_by_name=True)


class PublicFeatureListResponse(BaseModel):
    """Response model for public feature requests list"""
    
    success: bool = Field(default=True, alias="success")
    data: List[PublicFeatureRequest] = Field(..., alias="data")
    total: int = Field(..., alias="total")
    page: int = Field(..., alias="page")
    limit: int = Field(..., alias="limit")
    total_pages: int = Field(..., alias="totalPages")
    
    model_config = ConfigDict(populate_by_name=True)


# Authentication Models
class AuthUrlRequest(BaseModel):
    """Request model for generating auth URL"""
    redirect_url: str = Field(..., alias="redirectUrl", description="Frontend callback URL")
    
    model_config = ConfigDict(populate_by_name=True)


class AuthUrlResponse(BaseModel):
    """Response model for auth URL"""
    success: bool = Field(default=True, alias="success")
    auth_url: str = Field(..., alias="authUrl", description="GitHub OAuth URL")
    
    model_config = ConfigDict(populate_by_name=True)


class AuthCallbackRequest(BaseModel):
    """Request model for OAuth callback"""
    code: str = Field(..., alias="code", description="OAuth authorization code")
    
    model_config = ConfigDict(populate_by_name=True)


class AuthUser(BaseModel):
    """User authentication model"""
    id: str = Field(..., alias="id")
    email: str = Field(..., alias="email")
    name: Optional[str] = Field(None, alias="name")
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    github_username: Optional[str] = Field(None, alias="githubUsername")
    created_at: str = Field(..., alias="createdAt")
    
    model_config = ConfigDict(populate_by_name=True)


class AuthResponse(BaseModel):
    """Response model for authentication"""
    success: bool = Field(default=True, alias="success")
    user: AuthUser = Field(..., alias="user")
    access_token: str = Field(..., alias="accessToken")
    refresh_token: str = Field(..., alias="refreshToken")
    
    model_config = ConfigDict(populate_by_name=True)


class UserResponse(BaseModel):
    """Response model for user data"""
    success: bool = Field(default=True, alias="success")
    user: AuthUser = Field(..., alias="user")
    
    model_config = ConfigDict(populate_by_name=True)


class LogoutResponse(BaseModel):
    """Response model for logout"""
    success: bool = Field(default=True, alias="success")
    message: str = Field(..., alias="message")
    
    model_config = ConfigDict(populate_by_name=True)


class AuthStatusResponse(BaseModel):
    """Response model for auth status"""
    authenticated: bool = Field(..., alias="authenticated")
    user: Optional[AuthUser] = Field(None, alias="user")
    
    model_config = ConfigDict(populate_by_name=True)
