import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncpg
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    """Service for handling Supabase database operations"""
    
    def __init__(self):
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.database_url = os.getenv("DATABASE_URL")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and key must be provided")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.pool: Optional[asyncpg.Pool] = None
    
    async def init_pool(self):
        """Initialize asyncpg connection pool for direct PostgreSQL access"""
        if self.database_url and not self.pool:
            self.pool = await asyncpg.create_pool(self.database_url)
    
    async def close_pool(self):
        """Close the connection pool"""
        if self.pool:
            await self.pool.close()
            self.pool = None
    
    # Repository operations
    async def create_repository(self, name: str, github_url: str, 
                              directory_tree: str = "", file_contents: str = "", 
                              total_characters: int = 0) -> Dict[str, Any]:
        """Create a new repository record"""
        try:
            result = self.supabase.table("repositories").insert({
                "name": name,
                "github_url": github_url,
                "directory_tree": directory_tree,
                "file_contents": file_contents,
                "total_characters": total_characters
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating repository: {e}")
            return None
    
    async def get_repository_by_url(self, github_url: str) -> Optional[Dict[str, Any]]:
        """Get repository by GitHub URL"""
        try:
            result = self.supabase.table("repositories").select("*").eq("github_url", github_url).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting repository: {e}")
            return None
    
    async def update_repository(self, repo_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """Update repository record"""
        try:
            result = self.supabase.table("repositories").update(kwargs).eq("id", repo_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating repository: {e}")
            return None
    
    # Analysis session operations
    async def create_analysis_session(self, repository_id: int, 
                                    total_functions: int = 0, total_algorithms: int = 0,
                                    total_analyzed_files: int = 0, 
                                    avg_functions_per_file: float = 0.0,
                                    avg_algorithms_per_file: float = 0.0,
                                    most_common_language: str = None) -> Dict[str, Any]:
        """Create a new analysis session"""
        try:
            result = self.supabase.table("analysis_sessions").insert({
                "repository_id": repository_id,
                "total_functions": total_functions,
                "total_algorithms": total_algorithms,
                "total_analyzed_files": total_analyzed_files,
                "avg_functions_per_file": avg_functions_per_file,
                "avg_algorithms_per_file": avg_algorithms_per_file,
                "most_common_language": most_common_language
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating analysis session: {e}")
            return None
    
    # File counts operations
    async def create_file_counts(self, repository_id: int, javascript: int = 0, 
                               python: int = 0, typescript: int = 0, total: int = 0) -> Dict[str, Any]:
        """Create file counts record"""
        try:
            result = self.supabase.table("file_counts").insert({
                "repository_id": repository_id,
                "javascript": javascript,
                "python": python,
                "typescript": typescript,
                "total": total
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating file counts: {e}")
            return None
    
    # Language stats operations
    async def create_language_stats(self, analysis_session_id: int, language: str,
                                  files: int = 0, functions: int = 0, algorithms: int = 0) -> Dict[str, Any]:
        """Create language statistics record"""
        try:
            result = self.supabase.table("language_stats").insert({
                "analysis_session_id": analysis_session_id,
                "language": language,
                "files": files,
                "functions": functions,
                "algorithms": algorithms
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating language stats: {e}")
            return None
    
    # File analysis operations
    async def create_file_analysis(self, analysis_session_id: int, file_path: str,
                                 language: str, function_count: int = 0, 
                                 algorithm_count: int = 0, breakdown: Dict = None,
                                 algorithm_breakdown: Dict = None) -> Dict[str, Any]:
        """Create file analysis record"""
        try:
            result = self.supabase.table("file_analyses").insert({
                "analysis_session_id": analysis_session_id,
                "file_path": file_path,
                "language": language,
                "function_count": function_count,
                "algorithm_count": algorithm_count,
                "breakdown": breakdown or {},
                "algorithm_breakdown": algorithm_breakdown or {}
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating file analysis: {e}")
            return None
    
    # Function operations
    async def create_function(self, file_analysis_id: int, name: str, func_type: str,
                            start_line: int, end_line: int, line_count: int,
                            code: str = None, is_algorithm: bool = False,
                            algorithm_score: float = 0.0, classification_reason: str = "") -> Dict[str, Any]:
        """Create function record"""
        try:
            # Clamp algorithm_score to [0.0, 1.0]
            safe_algorithm_score = min(max(algorithm_score, 0.0), 1.0)
            result = self.supabase.table("functions").insert({
                "file_analysis_id": file_analysis_id,
                "name": name,
                "type": func_type,
                "start_line": start_line,
                "end_line": end_line,
                "line_count": line_count,
                "code": code,
                "is_algorithm": is_algorithm,
                "algorithm_score": safe_algorithm_score,
                "classification_reason": classification_reason
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating function: {e}")
            return None
    
    # AI analysis operations
    async def create_ai_analysis(self, function_id: int, pseudocode: str, flowchart: str,
                               complexity_analysis: str, optimization_suggestions: List[str] = None,
                               potential_issues: List[str] = None) -> Dict[str, Any]:
        """Create AI analysis record"""
        try:
            result = self.supabase.table("ai_analyses").insert({
                "function_id": function_id,
                "pseudocode": pseudocode,
                "flowchart": flowchart,
                "complexity_analysis": complexity_analysis,
                "optimization_suggestions": optimization_suggestions or [],
                "potential_issues": potential_issues or []
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating AI analysis: {e}")
            return None
    
    # Chat operations
    async def create_chat_conversation(self, repository_id: int = None, function_id: int = None,
                                     context_type: str = "general") -> Dict[str, Any]:
        """Create chat conversation record"""
        try:
            result = self.supabase.table("chat_conversations").insert({
                "repository_id": repository_id,
                "function_id": function_id,
                "context_type": context_type
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating chat conversation: {e}")
            return None
    
    async def create_chat_message(self, conversation_id: int, role: str, content: str) -> Dict[str, Any]:
        """Create chat message record"""
        try:
            result = self.supabase.table("chat_messages").insert({
                "conversation_id": conversation_id,
                "role": role,
                "content": content
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating chat message: {e}")
            return None
    
    # Query operations
    async def get_repository_analysis(self, repository_id: int) -> Optional[Dict[str, Any]]:
        """Get complete repository analysis data"""
        try:
            # Get repository data
            repo_result = self.supabase.table("repositories").select(
                "id, name, github_url, directory_tree, file_contents, total_characters, created_at, updated_at"
            ).eq("id", repository_id).execute()
            
            if not repo_result.data:
                return None
            
            repo_data = repo_result.data[0]
            
            # Get latest analysis session
            session_result = self.supabase.table("analysis_sessions").select(
                "*"
            ).eq("repository_id", repository_id).order("created_at", desc=True).limit(1).execute()
            
            latest_session = session_result.data[0] if session_result.data else None
            
            # Get file analyses with functions if session exists
            file_analyses = []
            functions = []
            language_stats = []
            
            if latest_session:
                session_id = latest_session["id"]
                
                # Get file analyses with functions
                files_result = self.supabase.table("file_analyses").select(
                    "*, functions(*, ai_analyses(*))"
                ).eq("analysis_session_id", session_id).execute()
                
                file_analyses = files_result.data or []
                
                # Flatten functions from file analyses
                for file_analysis in file_analyses:
                    if file_analysis.get("functions"):
                        functions.extend(file_analysis["functions"])
                
                # Get language stats
                lang_result = self.supabase.table("language_stats").select(
                    "*"
                ).eq("analysis_session_id", session_id).execute()
                
                language_stats = lang_result.data or []
            
            # Return structured response that matches frontend expectations
            return {
                "repository": {
                    "id": str(repo_data["id"]),  # Convert to string for frontend consistency
                    "name": repo_data["name"],
                    "githubUrl": repo_data["github_url"],
                    "directoryTree": repo_data.get("directory_tree", ""),
                    "fileContents": repo_data.get("file_contents", ""),
                    "totalCharacters": repo_data.get("total_characters", 0),
                    "createdAt": repo_data["created_at"],
                    "updatedAt": repo_data["updated_at"]
                },
                "analysisSession": latest_session,
                "fileAnalyses": file_analyses,
                "functions": functions,
                "languageStats": language_stats
            }
        except Exception as e:
            print(f"Error getting repository analysis: {e}")
            return None
    
    async def get_function_with_ai_analysis(self, function_id: int) -> Optional[Dict[str, Any]]:
        """Get function with AI analysis data"""
        try:
            result = self.supabase.table("functions").select(
                "*, ai_analyses(*), file_analyses(file_path, language)"
            ).eq("id", function_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting function with AI analysis: {e}")
            return None
    
    async def search_repositories(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search repositories by name or URL"""
        try:
            result = self.supabase.table("repositories").select(
                "id, name, github_url, created_at, total_characters"
            ).or_(f"name.ilike.%{query}%,github_url.ilike.%{query}%").limit(limit).execute()
            return result.data or []
        except Exception as e:
            print(f"Error searching repositories: {e}")
            return []
    
    async def get_repositories_summary(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get repositories with summary data only"""
        try:
            result = self.supabase.table("repositories").select(
                "id, name, github_url, created_at, total_characters"
            ).order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting repositories summary: {e}")
            return []
    
    async def get_repository_overview(self, repository_id: int) -> Optional[Dict[str, Any]]:
        """Get high-level overview of a repository's latest analysis"""
        try:
            # Step 1: Fetch the repository details
            repo_result = self.supabase.table("repositories").select(
                "id, name, github_url, created_at, updated_at"
            ).eq("id", repository_id).execute()

            if not repo_result.data:
                return None
            
            repo_data = repo_result.data[0]

            # Step 2: Fetch the latest analysis session
            session_result = self.supabase.table("analysis_sessions").select(
                "total_functions, total_algorithms, total_analyzed_files, created_at"
            ).eq("repository_id", repository_id).order("created_at", desc=True).limit(1).execute()
            
            session_data = session_result.data[0] if session_result.data else {}

            # Step 3: Fetch file counts
            file_counts_result = self.supabase.table("file_counts").select(
                "javascript, python, typescript, total"
            ).eq("repository_id", repository_id).execute()

            file_counts_data = file_counts_result.data[0] if file_counts_result.data else {}

            # Step 4: Combine the data into the final overview object
            # Use the latest analysis session created_at as last_analyzed, fallback to repository updated_at
            last_analyzed = session_data.get("created_at") or repo_data.get("updated_at")
            
            overview = {
                "id": repo_data.get("id"),
                "name": repo_data.get("name"),
                "githubUrl": repo_data.get("github_url"),
                "lastAnalyzed": last_analyzed,
                "totalFunctions": session_data.get("total_functions", 0),
                "totalAlgorithms": session_data.get("total_algorithms", 0),
                "totalAnalyzedFiles": session_data.get("total_analyzed_files", 0),
                "fileCounts": {
                    "javascript": file_counts_data.get("javascript", 0),
                    "python": file_counts_data.get("python", 0),
                    "typescript": file_counts_data.get("typescript", 0),
                    "total": file_counts_data.get("total", 0),
                }
            }
            
            return overview

        except Exception as e:
            print(f"Error getting repository overview for repo_id {repository_id}: {e}")
            return None
    
    async def get_repository_functions(self, repository_id: int, page: int = 1, limit: int = 20, algorithm_only: bool = False) -> Optional[Dict[str, Any]]:
        """Get repository functions with pagination"""
        try:
            # Get latest analysis session
            session_result = self.supabase.table("analysis_sessions").select(
                "id"
            ).eq("repository_id", repository_id).order("created_at", desc=True).limit(1).execute()
            
            if not session_result.data:
                return None
            
            session_id = session_result.data[0]["id"]
            
            # Calculate offset
            offset = (page - 1) * limit
            
            # Build query using JOIN through file_analyses
            base_query = """
                functions(
                    id, name, func_type, start_line, end_line, line_count, 
                    is_algorithm, algorithm_score, classification_reason,
                    file_analyses(file_path, language)
                )
            """
            
            # Get file analysis IDs for this session
            file_analyses_result = self.supabase.table("file_analyses").select(
                "id"
            ).eq("analysis_session_id", session_id).execute()
            
            if not file_analyses_result.data:
                return {
                    "functions": [],
                    "total": 0,
                    "page": page,
                    "limit": limit,
                    "total_pages": 0
                }
            
            file_analysis_ids = [fa["id"] for fa in file_analyses_result.data]
            
            # Build query for functions with proper column names
            query = self.supabase.table("functions").select(
                "id, name, type, start_line, end_line, line_count, is_algorithm, algorithm_score, classification_reason, file_analyses(file_path, language)"
            ).in_("file_analysis_id", file_analysis_ids)
            
            if algorithm_only:
                query = query.eq("is_algorithm", True)
            
            # Get total count by fetching all IDs first
            count_query = self.supabase.table("functions").select(
                "id"
            ).in_("file_analysis_id", file_analysis_ids)
            
            if algorithm_only:
                count_query = count_query.eq("is_algorithm", True)
            
            count_result = count_query.execute()
            total_count = len(count_result.data) if count_result.data else 0
            
            # Get paginated results
            result = query.order("algorithm_score", desc=True).range(offset, offset + limit - 1).execute()
            
            return {
                "functions": result.data or [],
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit
            }
        except Exception as e:
            print(f"Error getting repository functions: {e}")
            return None
    
    async def get_repository_files(self, repository_id: int, page: int = 1, limit: int = 20) -> Optional[Dict[str, Any]]:
        """Get repository files with pagination"""
        try:
            # Get latest analysis session
            session_result = self.supabase.table("analysis_sessions").select(
                "id"
            ).eq("repository_id", repository_id).order("created_at", desc=True).limit(1).execute()
            
            if not session_result.data:
                return None
            
            session_id = session_result.data[0]["id"]
            
            # Calculate offset
            offset = (page - 1) * limit
            
            # Get total count
            count_query = self.supabase.table("file_analyses").select(
                "id"
            ).eq("analysis_session_id", session_id)
            count_result = count_query.execute()
            total_count = len(count_result.data) if count_result.data else 0
            
            # Get paginated results
            result = self.supabase.table("file_analyses").select(
                "file_path, language, function_count, algorithm_count"
            ).eq("analysis_session_id", session_id).order("file_path").range(offset, offset + limit - 1).execute()
            
            return {
                "files": result.data or [],
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit
            }
        except Exception as e:
            print(f"Error getting repository files: {e}")
            return None

# Global database service instance
db_service = DatabaseService()