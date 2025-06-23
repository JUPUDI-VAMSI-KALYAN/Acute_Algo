import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


class DatabaseService:
    """Service for handling Supabase database operations"""

    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and key must be provided")

        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)



    # Repository operations
    async def create_repository(
        self,
        name: str,
        github_url: str,
        directory_tree: str = "",
        file_contents: str = "",
        total_characters: int = 0,
    ) -> Dict[str, Any]:
        """Create a new repository record"""
        try:
            result = (
                self.supabase.table("repositories")
                .insert(
                    {
                        "name": name,
                        "github_url": github_url,
                        "directory_tree": directory_tree,
                        "file_contents": file_contents,
                        "total_characters": total_characters,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating repository: {e}")
            return None

    async def get_repository_by_url(self, github_url: str) -> Optional[Dict[str, Any]]:
        """Get repository by GitHub URL"""
        try:
            result = (
                self.supabase.table("repositories")
                .select("*")
                .eq("github_url", github_url)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting repository: {e}")
            return None

    async def update_repository(
        self, repo_id: int, **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Update repository record"""
        try:
            result = (
                self.supabase.table("repositories")
                .update(kwargs)
                .eq("id", repo_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating repository: {e}")
            return None

    # Analysis session operations
    async def create_analysis_session(
        self,
        repository_id: int,
        total_functions: int = 0,
        total_algorithms: int = 0,
        total_analyzed_files: int = 0,
        avg_functions_per_file: float = 0.0,
        avg_algorithms_per_file: float = 0.0,
        most_common_language: str = None,
    ) -> Dict[str, Any]:
        """Create a new analysis session"""
        try:
            result = (
                self.supabase.table("analysis_sessions")
                .insert(
                    {
                        "repository_id": repository_id,
                        "total_functions": total_functions,
                        "total_algorithms": total_algorithms,
                        "total_analyzed_files": total_analyzed_files,
                        "avg_functions_per_file": avg_functions_per_file,
                        "avg_algorithms_per_file": avg_algorithms_per_file,
                        "most_common_language": most_common_language,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating analysis session: {e}")
            return None

    # File counts operations
    async def create_file_counts(
        self,
        repository_id: int,
        javascript: int = 0,
        python: int = 0,
        typescript: int = 0,
        total: int = 0,
    ) -> Dict[str, Any]:
        """Create file counts record"""
        try:
            result = (
                self.supabase.table("file_counts")
                .insert(
                    {
                        "repository_id": repository_id,
                        "javascript": javascript,
                        "python": python,
                        "typescript": typescript,
                        "total": total,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating file counts: {e}")
            return None

    # Language stats operations
    async def create_language_stats(
        self,
        analysis_session_id: int,
        language: str,
        files: int = 0,
        functions: int = 0,
        algorithms: int = 0,
    ) -> Dict[str, Any]:
        """Create language statistics record"""
        try:
            result = (
                self.supabase.table("language_stats")
                .insert(
                    {
                        "analysis_session_id": analysis_session_id,
                        "language": language,
                        "files": files,
                        "functions": functions,
                        "algorithms": algorithms,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating language stats: {e}")
            return None

    # File analysis operations
    async def create_file_analysis(
        self,
        analysis_session_id: int,
        file_path: str,
        language: str,
        function_count: int = 0,
        algorithm_count: int = 0,
        breakdown: Dict = None,
        algorithm_breakdown: Dict = None,
    ) -> Dict[str, Any]:
        """Create file analysis record"""
        try:
            result = (
                self.supabase.table("file_analyses")
                .insert(
                    {
                        "analysis_session_id": analysis_session_id,
                        "file_path": file_path,
                        "language": language,
                        "function_count": function_count,
                        "algorithm_count": algorithm_count,
                        "breakdown": breakdown or {},
                        "algorithm_breakdown": algorithm_breakdown or {},
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating file analysis: {e}")
            return None

    # Function operations
    async def create_function(
        self,
        file_analysis_id: int,
        name: str,
        func_type: str,
        start_line: int,
        end_line: int,
        line_count: int,
        code: str = None,
        is_algorithm: bool = False,
        algorithm_score: float = 0.0,
        classification_reason: str = "",
    ) -> Dict[str, Any]:
        """Create function record"""
        try:
            # Clamp algorithm_score to [0.0, 1.0]
            safe_algorithm_score = min(max(algorithm_score, 0.0), 1.0)
            result = (
                self.supabase.table("functions")
                .insert(
                    {
                        "file_analysis_id": file_analysis_id,
                        "name": name,
                        "type": func_type,
                        "start_line": start_line,
                        "end_line": end_line,
                        "line_count": line_count,
                        "code": code,
                        "is_algorithm": is_algorithm,
                        "algorithm_score": safe_algorithm_score,
                        "classification_reason": classification_reason,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating function: {e}")
            return None

    # AI analysis operations
    async def create_ai_analysis(
        self, function_id: int, enhanced_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create AI analysis record from enhanced LangChain data"""
        try:
            # Map enhanced data to database schema
            data = {
                "function_id": function_id,
                "pseudocode": enhanced_data.get("pseudocode", ""),
                "flowchart": enhanced_data.get("flowchart", ""),
                "complexity_analysis": enhanced_data.get("complexityAnalysis", ""),
                "optimization_suggestions": enhanced_data.get(
                    "optimizationSuggestions", []
                ),
                "potential_issues": enhanced_data.get("potentialIssues", []),
                "analysis_type": enhanced_data.get("analysisType", "comprehensive"),
            }

            # Add enhanced LangChain fields (now with database support)
            if enhanced_data.get("shortDescription"):
                data["short_description"] = enhanced_data["shortDescription"]

            if enhanced_data.get("businessValue"):
                data["business_value"] = enhanced_data["businessValue"]

            if enhanced_data.get("useCases"):
                data["use_cases"] = enhanced_data["useCases"]

            if enhanced_data.get("performanceImpact"):
                data["performance_impact"] = enhanced_data["performanceImpact"]

            if enhanced_data.get("scalabilityNotes"):
                data["scalability_notes"] = enhanced_data["scalabilityNotes"]

            if enhanced_data.get("maintenanceComplexity"):
                data["maintenance_complexity"] = enhanced_data["maintenanceComplexity"]

            if enhanced_data.get("overallAssessment"):
                data["overall_assessment"] = enhanced_data["overallAssessment"]

            if enhanced_data.get("recommendations"):
                data["recommendations"] = enhanced_data["recommendations"]

            # Add legacy business analysis fields if available (for backward compatibility)
            business_analysis = enhanced_data.get("businessAnalysis")
            if business_analysis and isinstance(business_analysis, dict):
                if business_analysis.get("businessDescription") and not data.get(
                    "short_description"
                ):
                    data["business_description"] = business_analysis[
                        "businessDescription"
                    ]

                business_metrics = business_analysis.get("businessMetrics", {})
                if business_metrics:
                    data.update(
                        {
                            "complexity_score": business_metrics.get("complexityScore"),
                            "business_impact": business_metrics.get("businessImpact"),
                            "maintenance_risk": business_metrics.get("maintenanceRisk"),
                            "performance_risk": business_metrics.get("performanceRisk"),
                            "algorithm_type": business_metrics.get("algorithmType"),
                            "business_domain": business_metrics.get("businessDomain"),
                            "priority_level": business_metrics.get("priorityLevel"),
                        }
                    )
            else:
                # Fallback: use shortDescription as business_description if no legacy format
                if enhanced_data.get("shortDescription") and not data.get(
                    "business_description"
                ):
                    data["business_description"] = enhanced_data["shortDescription"]

            result = self.supabase.table("ai_analyses").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating AI analysis: {e}")
            return None

    # Chat operations
    async def create_chat_conversation(
        self,
        repository_id: int = None,
        function_id: int = None,
        context_type: str = "general",
    ) -> Dict[str, Any]:
        """Create chat conversation record"""
        try:
            result = (
                self.supabase.table("chat_conversations")
                .insert(
                    {
                        "repository_id": repository_id,
                        "function_id": function_id,
                        "context_type": context_type,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating chat conversation: {e}")
            return None

    async def create_chat_message(
        self, conversation_id: int, role: str, content: str
    ) -> Dict[str, Any]:
        """Create chat message record"""
        try:
            result = (
                self.supabase.table("chat_messages")
                .insert(
                    {
                        "conversation_id": conversation_id,
                        "role": role,
                        "content": content,
                    }
                )
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating chat message: {e}")
            return None

    # Query operations
    async def get_repository_analysis(
        self, repository_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get complete repository analysis data"""
        try:
            # Get repository data
            repo_result = (
                self.supabase.table("repositories")
                .select(
                    "id, name, github_url, directory_tree, file_contents, total_characters, created_at, updated_at"
                )
                .eq("id", repository_id)
                .execute()
            )

            if not repo_result.data:
                return None

            repo_data = repo_result.data[0]

            # Get latest analysis session
            session_result = (
                self.supabase.table("analysis_sessions")
                .select("*")
                .eq("repository_id", repository_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            latest_session = session_result.data[0] if session_result.data else None

            # Get file analyses with functions if session exists
            file_analyses = []
            functions = []
            language_stats = []

            if latest_session:
                session_id = latest_session["id"]

                # Get file analyses with functions
                files_result = (
                    self.supabase.table("file_analyses")
                    .select("*, functions(*, ai_analyses(*))")
                    .eq("analysis_session_id", session_id)
                    .execute()
                )

                file_analyses = files_result.data or []

                # Flatten functions from file analyses
                for file_analysis in file_analyses:
                    if file_analysis.get("functions"):
                        functions.extend(file_analysis["functions"])

                # Get language stats
                lang_result = (
                    self.supabase.table("language_stats")
                    .select("*")
                    .eq("analysis_session_id", session_id)
                    .execute()
                )

                language_stats = lang_result.data or []

            # Return structured response that matches frontend expectations
            return {
                "repository": {
                    "id": str(
                        repo_data["id"]
                    ),  # Convert to string for frontend consistency
                    "name": repo_data["name"],
                    "githubUrl": repo_data["github_url"],
                    "directoryTree": repo_data.get("directory_tree", ""),
                    "fileContents": repo_data.get("file_contents", ""),
                    "totalCharacters": repo_data.get("total_characters", 0),
                    "createdAt": repo_data["created_at"],
                    "updatedAt": repo_data["updated_at"],
                },
                "analysisSession": latest_session,
                "fileAnalyses": file_analyses,
                "functions": functions,
                "languageStats": language_stats,
            }
        except Exception as e:
            print(f"Error getting repository analysis: {e}")
            return None

    async def get_function_with_ai_analysis(
        self, function_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get function with AI analysis data including enhanced fields"""
        try:
            result = (
                self.supabase.table("functions")
                .select(
                    "*, ai_analyses(*, short_description, business_value, use_cases, performance_impact, scalability_notes, maintenance_complexity, overall_assessment, recommendations), file_analyses(file_path, language)"
                )
                .eq("id", function_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting function with AI analysis: {e}")
            return None

    async def search_repositories(
        self, query: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search repositories by name or URL"""
        try:
            result = (
                self.supabase.table("repositories")
                .select("id, name, github_url, created_at, total_characters")
                .or_(f"name.ilike.%{query}%,github_url.ilike.%{query}%")
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"Error searching repositories: {e}")
            return []

    async def get_repositories_summary(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get repositories with summary data only"""
        try:
            result = (
                self.supabase.table("repositories")
                .select("id, name, github_url, created_at, total_characters")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"Error getting repositories summary: {e}")
            return []

    async def get_repository_overview(
        self, repository_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get high-level overview of a repository's latest analysis"""
        try:
            # Step 1: Fetch the repository details
            repo_result = (
                self.supabase.table("repositories")
                .select("id, name, github_url, created_at, updated_at")
                .eq("id", repository_id)
                .execute()
            )

            if not repo_result.data:
                return None

            repo_data = repo_result.data[0]

            # Step 2: Fetch the latest analysis session
            session_result = (
                self.supabase.table("analysis_sessions")
                .select(
                    "total_functions, total_algorithms, total_analyzed_files, created_at"
                )
                .eq("repository_id", repository_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            session_data = session_result.data[0] if session_result.data else {}

            # Step 3: Fetch file counts
            file_counts_result = (
                self.supabase.table("file_counts")
                .select("javascript, python, typescript, total")
                .eq("repository_id", repository_id)
                .execute()
            )

            file_counts_data = (
                file_counts_result.data[0] if file_counts_result.data else {}
            )

            # Step 4: Combine the data into the final overview object
            # Use the latest analysis session created_at as last_analyzed, fallback to repository updated_at
            last_analyzed = session_data.get("created_at") or repo_data.get(
                "updated_at"
            )

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
                },
            }

            return overview

        except Exception as e:
            print(f"Error getting repository overview for repo_id {repository_id}: {e}")
            return None

    async def get_repository_functions(
        self,
        repository_id: int,
        page: int = 1,
        limit: int = 20,
        algorithm_only: bool = False,
        search_term: str = None,
        language_filter: str = None,
        score_filter: str = None,
    ) -> Optional[Dict[str, Any]]:
        """Get repository functions with pagination and filtering"""
        try:
            # Get latest analysis session
            session_result = (
                self.supabase.table("analysis_sessions")
                .select("id")
                .eq("repository_id", repository_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if not session_result.data:
                return None

            session_id = session_result.data[0]["id"]

            # Calculate offset
            offset = (page - 1) * limit

            # Get file analysis IDs for this session
            file_analyses_result = (
                self.supabase.table("file_analyses")
                .select("id, file_path, language")
                .eq("analysis_session_id", session_id)
                .execute()
            )

            if not file_analyses_result.data:
                return {
                    "functions": [],
                    "total": 0,
                    "page": page,
                    "limit": limit,
                    "total_pages": 0,
                }

            # Create mapping for file analysis data
            file_analysis_map = {
                fa["id"]: {"file_path": fa["file_path"], "language": fa["language"]}
                for fa in file_analyses_result.data
            }
            file_analysis_ids = list(file_analysis_map.keys())

            # Build base query for functions
            query = (
                self.supabase.table("functions")
                .select(
                    "id, name, type, start_line, end_line, line_count, is_algorithm, algorithm_score, classification_reason, file_analysis_id"
                )
                .in_("file_analysis_id", file_analysis_ids)
            )

            # Apply algorithm filter
            if algorithm_only:
                query = query.eq("is_algorithm", True)

            # Get all matching functions for filtering
            all_functions_result = query.execute()
            all_functions = all_functions_result.data or []

            # Add file analysis data to functions
            for func in all_functions:
                file_analysis_id = func["file_analysis_id"]
                if file_analysis_id in file_analysis_map:
                    func["file_analyses"] = file_analysis_map[file_analysis_id]

            # Apply client-side filters (since Supabase doesn't support complex text search easily)
            filtered_functions = all_functions

            # Search filter
            if search_term:
                search_term_lower = search_term.lower()
                filtered_functions = [
                    func for func in filtered_functions
                    if (search_term_lower in func["name"].lower() or
                        search_term_lower in func.get("file_analyses", {}).get("file_path", "").lower())
                ]

            # Language filter
            if language_filter and language_filter != "all":
                filtered_functions = [
                    func for func in filtered_functions
                    if func.get("file_analyses", {}).get("language") == language_filter
                ]

            # Score filter (for algorithms page)
            if score_filter and score_filter != "all":
                if score_filter == "high":
                    filtered_functions = [func for func in filtered_functions if func["algorithm_score"] >= 0.8]
                elif score_filter == "medium":
                    filtered_functions = [func for func in filtered_functions if 0.6 <= func["algorithm_score"] < 0.8]
                elif score_filter == "low":
                    filtered_functions = [func for func in filtered_functions if func["algorithm_score"] < 0.6]

            # Sort by algorithm score (descending)
            filtered_functions.sort(key=lambda x: x["algorithm_score"], reverse=True)

            # Calculate pagination
            total_count = len(filtered_functions)
            total_pages = (total_count + limit - 1) // limit

            # Apply pagination
            start_idx = offset
            end_idx = offset + limit
            paginated_functions = filtered_functions[start_idx:end_idx]

            return {
                "functions": paginated_functions,
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
            }
        except Exception as e:
            print(f"Error getting repository functions: {e}")
            return None

    async def get_repository_files(
        self, repository_id: int, page: int = 1, limit: int = 20
    ) -> Optional[Dict[str, Any]]:
        """Get repository files with pagination"""
        try:
            # Get latest analysis session
            session_result = (
                self.supabase.table("analysis_sessions")
                .select("id")
                .eq("repository_id", repository_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if not session_result.data:
                return None

            session_id = session_result.data[0]["id"]

            # Calculate offset
            offset = (page - 1) * limit

            # Get total count
            count_query = (
                self.supabase.table("file_analyses")
                .select("id")
                .eq("analysis_session_id", session_id)
            )
            count_result = count_query.execute()
            total_count = len(count_result.data) if count_result.data else 0

            # Get paginated results
            result = (
                self.supabase.table("file_analyses")
                .select("file_path, language, function_count, algorithm_count")
                .eq("analysis_session_id", session_id)
                .order("file_path")
                .range(offset, offset + limit - 1)
                .execute()
            )

            return {
                "files": result.data or [],
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit,
            }
        except Exception as e:
            print(f"Error getting repository files: {e}")
            return None

    # Feedback operations
    async def create_feedback(
        self,
        name: str,
        email: str,
        category: str,
        subject: str,
        message: str,
        rating: Optional[int] = None,
        allow_contact: bool = True,
    ) -> Optional[int]:
        """Create a new feedback record"""
        try:
            data = {
                "name": name,
                "email": email,
                "category": category,
                "subject": subject,
                "message": message,
                "allow_contact": allow_contact,
                "status": "open",
                "priority": "medium",
                "upvote_count": 0,
                # Automatically make feature requests public
                "is_public": category == "feature",
            }
            
            if rating is not None:
                data["rating"] = rating
            
            result = (
                self.supabase.table("feedback")
                .insert(data)
                .execute()
            )
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            print(f"Error creating feedback: {e}")
            return None

    async def get_feedback_list(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated feedback list with filters"""
        try:
            # Build query
            query = self.supabase.table("feedback").select("*")
            
            if category:
                query = query.eq("category", category)
            if status:
                query = query.eq("status", status)
            if priority:
                query = query.eq("priority", priority)
            
            # Get total count for pagination
            count_result = query.execute()
            total = len(count_result.data) if count_result.data else 0
            
            # Apply pagination and ordering
            offset = (page - 1) * limit
            result = (
                query.order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            # Convert data to match the model
            feedback_list = []
            if result.data:
                for item in result.data:
                    feedback_item = {
                        "id": item["id"],
                        "name": item["name"],
                        "email": item["email"],
                        "category": item["category"],
                        "subject": item["subject"],
                        "message": item["message"],
                        "rating": item.get("rating"),
                        "allowContact": item["allow_contact"],
                        "status": item["status"],
                        "priority": item["priority"],
                        "createdAt": item["created_at"],
                        "updatedAt": item["updated_at"],
                        "resolvedAt": item.get("resolved_at"),
                        "adminNotes": item.get("admin_notes"),
                    }
                    feedback_list.append(feedback_item)
            
            total_pages = (total + limit - 1) // limit
            
            return {
                "feedback": feedback_list,
                "total": total,
                "total_pages": total_pages,
            }
            
        except Exception as e:
            print(f"Error getting feedback list: {e}")
            return {"feedback": [], "total": 0, "total_pages": 0}

    async def get_feedback_by_id(self, feedback_id: int) -> Optional[Dict[str, Any]]:
        """Get feedback by ID"""
        try:
            result = (
                self.supabase.table("feedback")
                .select("*")
                .eq("id", feedback_id)
                .execute()
            )
            
            if result.data:
                item = result.data[0]
                return {
                    "id": item["id"],
                    "name": item["name"],
                    "email": item["email"],
                    "category": item["category"],
                    "subject": item["subject"],
                    "message": item["message"],
                    "rating": item.get("rating"),
                    "allowContact": item["allow_contact"],
                    "status": item["status"],
                    "priority": item["priority"],
                    "createdAt": item["created_at"],
                    "updatedAt": item["updated_at"],
                    "resolvedAt": item.get("resolved_at"),
                    "adminNotes": item.get("admin_notes"),
                    "isPublic": item.get("is_public", False),
                    "upvoteCount": item.get("upvote_count", 0),
                    "implementationNotes": item.get("implementation_notes"),
                    "estimatedCompletion": item.get("estimated_completion"),
                }
            return None
            
        except Exception as e:
            print(f"Error getting feedback by ID: {e}")
            return None

    async def update_feedback_status(
        self,
        feedback_id: int,
        status: str,
        admin_notes: Optional[str] = None,
    ) -> bool:
        """Update feedback status"""
        try:
            update_data = {
                "status": status,
                "updated_at": "now()",
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes
                
            if status == "resolved":
                update_data["resolved_at"] = "now()"
            
            result = (
                self.supabase.table("feedback")
                .update(update_data)
                .eq("id", feedback_id)
                .execute()
            )
            
            return len(result.data) > 0 if result.data else False
            
        except Exception as e:
            print(f"Error updating feedback status: {e}")
            return False

    async def update_feedback_priority(
        self, feedback_id: int, priority: str
    ) -> bool:
        """Update feedback priority"""
        try:
            result = (
                self.supabase.table("feedback")
                .update({"priority": priority, "updated_at": "now()"})
                .eq("id", feedback_id)
                .execute()
            )
            
            return len(result.data) > 0 if result.data else False
            
        except Exception as e:
            print(f"Error updating feedback priority: {e}")
            return False

    async def get_feedback_stats(self) -> Dict[str, Any]:
        """Get feedback statistics"""
        try:
            # Get all feedback
            result = self.supabase.table("feedback").select("*").execute()
            
            if not result.data:
                return {
                    "total": 0,
                    "by_category": {},
                    "by_status": {},
                    "by_priority": {},
                    "average_rating": 0,
                }
            
            feedback_list = result.data
            total = len(feedback_list)
            
            # Count by category
            by_category = {}
            by_status = {}
            by_priority = {}
            total_rating = 0
            rating_count = 0
            
            for item in feedback_list:
                # Category stats
                category = item["category"]
                by_category[category] = by_category.get(category, 0) + 1
                
                # Status stats
                status = item["status"]
                by_status[status] = by_status.get(status, 0) + 1
                
                # Priority stats
                priority = item["priority"]
                by_priority[priority] = by_priority.get(priority, 0) + 1
                
                # Rating stats
                if item.get("rating"):
                    total_rating += item["rating"]
                    rating_count += 1
            
            average_rating = total_rating / rating_count if rating_count > 0 else 0
            
            return {
                "total": total,
                "by_category": by_category,
                "by_status": by_status,
                "by_priority": by_priority,
                "average_rating": round(average_rating, 2),
            }
            
        except Exception as e:
            print(f"Error getting feedback stats: {e}")
            return {
                "total": 0,
                "by_category": {},
                "by_status": {},
                "by_priority": {},
                "average_rating": 0,
            }

    # ===================== UPVOTING FUNCTIONALITY =====================
    
    async def add_upvote(
        self,
        feedback_id: int,
        user_identifier: str,
        user_email: Optional[str] = None,
        user_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Add an upvote to a feedback item"""
        try:
            # Check if user already upvoted
            existing_upvote = (
                self.supabase.table("feedback_upvotes")
                .select("*")
                .eq("feedback_id", feedback_id)
                .eq("user_identifier", user_identifier)
                .execute()
            )
            
            if existing_upvote.data:
                return {
                    "success": False,
                    "message": "You have already upvoted this feature request",
                    "upvote_count": None
                }
            
            # Add upvote
            upvote_data = {
                "feedback_id": feedback_id,
                "user_identifier": user_identifier,
            }
            
            if user_email:
                upvote_data["user_email"] = user_email
            if user_name:
                upvote_data["user_name"] = user_name
            
            result = (
                self.supabase.table("feedback_upvotes")
                .insert(upvote_data)
                .execute()
            )
            
            if result.data:
                # Get updated upvote count
                feedback_result = (
                    self.supabase.table("feedback")
                    .select("upvote_count")
                    .eq("id", feedback_id)
                    .execute()
                )
                
                upvote_count = feedback_result.data[0]["upvote_count"] if feedback_result.data else 0
                
                return {
                    "success": True,
                    "message": "Upvote added successfully",
                    "upvote_count": upvote_count
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to add upvote",
                    "upvote_count": None
                }
                
        except Exception as e:
            print(f"Error adding upvote: {e}")
            return {
                "success": False,
                "message": "Failed to add upvote",
                "upvote_count": None
            }

    async def remove_upvote(
        self, feedback_id: int, user_identifier: str
    ) -> Dict[str, Any]:
        """Remove an upvote from a feedback item"""
        try:
            result = (
                self.supabase.table("feedback_upvotes")
                .delete()
                .eq("feedback_id", feedback_id)
                .eq("user_identifier", user_identifier)
                .execute()
            )
            
            if result.data:
                # Get updated upvote count
                feedback_result = (
                    self.supabase.table("feedback")
                    .select("upvote_count")
                    .eq("id", feedback_id)
                    .execute()
                )
                
                upvote_count = feedback_result.data[0]["upvote_count"] if feedback_result.data else 0
                
                return {
                    "success": True,
                    "message": "Upvote removed successfully",
                    "upvote_count": upvote_count
                }
            else:
                return {
                    "success": False,
                    "message": "Upvote not found",
                    "upvote_count": None
                }
                
        except Exception as e:
            print(f"Error removing upvote: {e}")
            return {
                "success": False,
                "message": "Failed to remove upvote",
                "upvote_count": None
            }

    async def get_public_feature_requests(
        self,
        page: int = 1,
        limit: int = 20,
        sort: str = "upvotes",
        status: Optional[str] = None,
        user_identifier: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get public feature requests with upvote information"""
        try:
            # Build base query
            query = (
                self.supabase.table("feedback")
                .select("*")
                .eq("category", "feature")
                .eq("is_public", True)
            )
            
            if status:
                query = query.eq("status", status)
            else:
                # Default to show open and in_progress features
                query = query.in_("status", ["open", "in_progress", "resolved"])
            
            # Apply sorting
            if sort == "recent":
                query = query.order("created_at", desc=True)
            elif sort == "trending":
                # For trending, we'll sort by upvote_count but filter recent
                query = query.order("upvote_count", desc=True)
            else:  # Default: upvotes
                query = query.order("upvote_count", desc=True).order("created_at", desc=True)
            
            # Get total count for pagination
            count_result = query.execute()
            total = len(count_result.data) if count_result.data else 0
            
            # Apply pagination
            offset = (page - 1) * limit
            result = query.range(offset, offset + limit - 1).execute()
            
            # Convert data and check upvote status
            features = []
            if result.data:
                for item in result.data:
                    user_has_upvoted = False
                    
                    # Check if user has upvoted (if user_identifier provided)
                    if user_identifier:
                        upvote_check = (
                            self.supabase.table("feedback_upvotes")
                            .select("id")
                            .eq("feedback_id", item["id"])
                            .eq("user_identifier", user_identifier)
                            .execute()
                        )
                        user_has_upvoted = len(upvote_check.data) > 0 if upvote_check.data else False
                    
                    # Get recent upvotes count (last 30 days)
                    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
                    recent_upvotes_result = (
                        self.supabase.table("feedback_upvotes")
                        .select("id")
                        .eq("feedback_id", item["id"])
                        .gte("created_at", thirty_days_ago)
                        .execute()
                    )
                    recent_upvotes = len(recent_upvotes_result.data) if recent_upvotes_result.data else 0
                    
                    feature = {
                        "id": item["id"],
                        "subject": item["subject"],
                        "message": item["message"],
                        "upvoteCount": item.get("upvote_count", 0),
                        "status": item["status"],
                        "priority": item["priority"],
                        "createdAt": item["created_at"],
                        "updatedAt": item["updated_at"],
                        "implementationNotes": item.get("implementation_notes"),
                        "estimatedCompletion": item.get("estimated_completion"),
                        "userHasUpvoted": user_has_upvoted,
                        "recentUpvotes": recent_upvotes,
                    }
                    features.append(feature)
            
            total_pages = (total + limit - 1) // limit
            
            return {
                "features": features,
                "total": total,
                "total_pages": total_pages,
            }
            
        except Exception as e:
            print(f"Error getting public feature requests: {e}")
            return {"features": [], "total": 0, "total_pages": 0}

    async def get_trending_feature_requests(
        self, limit: int = 10, user_identifier: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get trending feature requests (most upvotes in last 30 days)"""
        try:
            # Use the trending view or raw query for better performance
            result = (
                self.supabase.table("feedback")
                .select("*")
                .eq("category", "feature")
                .eq("is_public", True)
                .in_("status", ["open", "in_progress"])
                .order("upvote_count", desc=True)
                .limit(limit)
                .execute()
            )
            
            features = []
            if result.data:
                for item in result.data:
                    user_has_upvoted = False
                    
                    # Check if user has upvoted
                    if user_identifier:
                        upvote_check = (
                            self.supabase.table("feedback_upvotes")
                            .select("id")
                            .eq("feedback_id", item["id"])
                            .eq("user_identifier", user_identifier)
                            .execute()
                        )
                        user_has_upvoted = len(upvote_check.data) > 0 if upvote_check.data else False
                    
                    # Get recent upvotes count
                    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
                    recent_upvotes_result = (
                        self.supabase.table("feedback_upvotes")
                        .select("id")
                        .eq("feedback_id", item["id"])
                        .gte("created_at", thirty_days_ago)
                        .execute()
                    )
                    recent_upvotes = len(recent_upvotes_result.data) if recent_upvotes_result.data else 0
                    
                    feature = {
                        "id": item["id"],
                        "subject": item["subject"],
                        "message": item["message"],
                        "upvoteCount": item.get("upvote_count", 0),
                        "status": item["status"],
                        "priority": item["priority"],
                        "createdAt": item["created_at"],
                        "updatedAt": item["updated_at"],
                        "implementationNotes": item.get("implementation_notes"),
                        "estimatedCompletion": item.get("estimated_completion"),
                        "userHasUpvoted": user_has_upvoted,
                        "recentUpvotes": recent_upvotes,
                    }
                    features.append(feature)
            
            return {"features": features}
            
        except Exception as e:
            print(f"Error getting trending feature requests: {e}")
            return {"features": []}


# Global database service instance
db_service = DatabaseService()
