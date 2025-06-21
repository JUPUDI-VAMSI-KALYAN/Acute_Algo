import logging
from fastapi import APIRouter, HTTPException
from models import AnalysisRequest
from services.repository_service import RepositoryService
from services.file_scanner import FileScanner
from services.database_service import db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/database", tags=["database"])

# Initialize services
repository_service = RepositoryService()
file_scanner = FileScanner()


@router.get("/test")
async def test_database_connection():
    """Test database connection and basic operations"""
    try:
        # Test creating a repository
        test_repo = await db_service.create_repository(
            name="test-repo",
            github_url="https://github.com/test/test-repo",
            directory_tree="test/",
            file_contents="test content",
            total_characters=100
        )
        
        if test_repo:
            # Test retrieving the repository
            retrieved_repo = await db_service.get_repository_by_url("https://github.com/test/test-repo")
            
            return {
                "success": True,
                "message": "Database connection successful",
                "test_data": {
                    "created_repo": test_repo,
                    "retrieved_repo": retrieved_repo
                }
            }
        else:
            return {
                "success": False,
                "message": "Failed to create test repository"
            }
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Database test failed: {str(e)}"
        )


@router.post("/save-analysis")
async def save_analysis_to_database(request: AnalysisRequest):
    """Save analysis results to database"""
    try:
        # First, check if repository already exists
        existing_repo = await db_service.get_repository_by_url(request.github_url)
        
        if existing_repo:
            repo_id = existing_repo["id"]
            logger.info(f"Using existing repository: {repo_id}")
        else:
            # Create new repository
            new_repo = await db_service.create_repository(
                name=request.github_url.split("/")[-1],  # Extract repo name from URL
                github_url=request.github_url
            )
            if not new_repo:
                raise HTTPException(status_code=500, detail="Failed to create repository")
            repo_id = new_repo["id"]
            logger.info(f"Created new repository: {repo_id}")
        
        # Clone repository
        repo_path, repo_name = await repository_service.clone_repository(request.github_url)
        logger.info(f"Repository cloned successfully: {repo_name}")
        
        try:
            # Scan repository
            scan_result = file_scanner.scan_repository(repo_path)
            logger.info(f"Scan completed. Total files: {scan_result.file_counts['total']}, Characters: {scan_result.total_characters}")
            
            # Save analysis session
            total_functions = scan_result.function_analysis.total_functions if scan_result.function_analysis else 0
            total_algorithms = scan_result.function_analysis.total_algorithms if scan_result.function_analysis else 0
            total_files = scan_result.function_analysis.total_files if scan_result.function_analysis else len(scan_result.file_paths)
            
            # Create analysis session with individual parameters
            session = await db_service.create_analysis_session(
                repository_id=repo_id,
                total_functions=total_functions,
                total_algorithms=total_algorithms,
                total_analyzed_files=total_files,
                avg_functions_per_file=total_functions / total_files if total_files > 0 else 0.0,
                avg_algorithms_per_file=total_algorithms / total_files if total_files > 0 else 0.0,
                most_common_language=max(scan_result.file_counts.items(), key=lambda x: x[1])[0] if scan_result.file_counts else None
            )
            
            if not session:
                raise HTTPException(status_code=500, detail="Failed to create analysis session")
            
            session_id = session["id"]
            
            # Save file counts - convert to the expected format
            javascript_count = scan_result.file_counts.get('javascript', 0) + scan_result.file_counts.get('js', 0)
            python_count = scan_result.file_counts.get('python', 0) + scan_result.file_counts.get('py', 0)
            typescript_count = scan_result.file_counts.get('typescript', 0) + scan_result.file_counts.get('ts', 0)
            total_count = sum(scan_result.file_counts.values())
            
            await db_service.create_file_counts(
                repository_id=repo_id,
                javascript=javascript_count,
                python=python_count,
                typescript=typescript_count,
                total=total_count
            )
            
            # Save detailed analysis if function analysis is available
            if scan_result.function_analysis:
                fa = scan_result.function_analysis
                
                # Save language stats
                for lang, stats in fa.languages.items():
                    await db_service.create_language_stats(
                        analysis_session_id=session_id,
                        language=lang,
                        files=stats.get('files', 0),
                        functions=stats.get('functions', 0),
                        algorithms=stats.get('algorithms', 0)
                    )
                
                # Save file analyses and functions
                for file_data in fa.files:
                    file_analysis_record = await db_service.create_file_analysis(
                        analysis_session_id=session_id,
                        file_path=file_data.path,
                        language=file_data.language,
                        function_count=file_data.function_count,
                        algorithm_count=file_data.algorithm_count,
                        breakdown=file_data.breakdown,
                        algorithm_breakdown=file_data.algorithm_breakdown
                    )
                    
                    if file_analysis_record:
                        file_analysis_id = file_analysis_record["id"]
                        
                        # Save functions
                        for function in file_data.functions:
                            await db_service.create_function(
                                file_analysis_id=file_analysis_id,
                                name=function.name,
                                func_type=function.type,
                                start_line=function.start_line,
                                end_line=function.end_line,
                                line_count=function.line_count,
                                code=function.code if function.code else '',
                                is_algorithm=function.is_algorithm,
                                algorithm_score=function.algorithm_score,
                                classification_reason=function.classification_reason
                            )
            
            logger.info(f"Analysis saved to database for repository: {repo_id}")
            
            return {
                "success": True,
                "message": "Analysis saved to database successfully",
                "repository_id": repo_id,
                "analysis_session_id": session_id,
                "analysis_summary": {
                    "total_files": total_files,
                    "total_functions": total_functions,
                    "total_algorithms": total_algorithms,
                    "file_counts": scan_result.file_counts
                }
            }
            
        finally:
            # Cleanup temporary directory
            try:
                repository_service.cleanup()
                logger.info("Cleanup completed")
            except Exception as e:
                logger.warning(f"Cleanup failed: {e}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving analysis to database: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save analysis to database: {str(e)}"
        )


@router.get("/repositories")
async def get_repositories(limit: int = 10):
    """Get list of repositories from database"""
    try:
        repositories = await db_service.search_repositories("", limit=limit)
        return repositories
    except Exception as e:
        logger.error(f"Error getting repositories: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repositories: {str(e)}"
        )


@router.get("/repositories/summary")
async def get_repositories_summary(limit: int = 10):
    """Get repositories with summary data only"""
    try:
        repositories = await db_service.get_repositories_summary(limit=limit)
        return repositories
    except Exception as e:
        logger.error(f"Error getting repositories summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repositories summary: {str(e)}"
        )


@router.get("/repository/{repository_id}")
async def get_repository_analysis(repository_id: int):
    """Get complete repository analysis from database"""
    try:
        analysis_data = await db_service.get_repository_analysis(repository_id)
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return analysis_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting repository analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repository analysis: {str(e)}"
        )


@router.get("/repository/{repository_id}/overview")
async def get_repository_overview(repository_id: int):
    """Get repository overview data only"""
    try:
        overview_data = await db_service.get_repository_overview(repository_id)
        if not overview_data:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return overview_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting repository overview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repository overview: {str(e)}"
        )


@router.get("/repository/{repository_id}/functions")
async def get_repository_functions(repository_id: int, page: int = 1, limit: int = 20, algorithm_only: bool = False):
    """Get repository functions with pagination"""
    try:
        logger.info(f"Getting functions for repository {repository_id}, page {page}, limit {limit}, algorithm_only {algorithm_only}")
        functions_data = await db_service.get_repository_functions(
            repository_id, page=page, limit=limit, algorithm_only=algorithm_only
        )
        if functions_data is None:
            logger.warning(f"No functions data found for repository {repository_id}")
            raise HTTPException(status_code=404, detail="Repository not found")
        
        logger.info(f"Found {functions_data.get('total', 0)} total functions, returning page {page}")
        return functions_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting repository functions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repository functions: {str(e)}"
        )


@router.get("/repository/{repository_id}/files")
async def get_repository_files(repository_id: int, page: int = 1, limit: int = 20):
    """Get repository files with pagination"""
    try:
        files_data = await db_service.get_repository_files(
            repository_id, page=page, limit=limit
        )
        if files_data is None:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return files_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting repository files: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repository files: {str(e)}"
        )


@router.post("/ai-analysis")
async def save_ai_analysis(request: dict):
    """Save enhanced AI analysis from LangChain service to database"""
    try:
        function_id = request.get("functionId")
        enhanced_data = request.get("data", {})
        
        if not function_id:
            raise HTTPException(status_code=400, detail="Function ID is required")
        
        if not enhanced_data:
            raise HTTPException(status_code=400, detail="Analysis data is required")
        
        logger.info(f"Saving enhanced AI analysis for function {function_id}")
        
        # Save to database using enhanced method
        result = await db_service.create_ai_analysis(
            function_id=int(function_id),
            enhanced_data=enhanced_data
        )
        
        if result:
            return {
                "success": True,
                "message": "AI analysis saved successfully",
                "analysis_id": result["id"]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save AI analysis")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving AI analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save AI analysis: {str(e)}"
        )


@router.get("/function/{function_id}/ai-analysis")
async def get_function_ai_analysis(function_id: int):
    """Get function with AI analysis data"""
    try:
        function_data = await db_service.get_function_with_ai_analysis(function_id)
        if not function_data:
            raise HTTPException(status_code=404, detail="Function not found")
        
        return {
            "success": True,
            "data": function_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting function AI analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get function AI analysis: {str(e)}"
        )


@router.get("/algorithm/{algorithm_id}/ai-analysis")
async def get_algorithm_ai_analysis(algorithm_id: int):
    """Get algorithm with AI analysis data - same as function but with algorithm-specific context"""
    try:
        # Since algorithms are stored as functions with is_algorithm=true,
        # we can use the same service but ensure it's actually an algorithm
        algorithm_data = await db_service.get_function_with_ai_analysis(algorithm_id)
        if not algorithm_data:
            raise HTTPException(status_code=404, detail="Algorithm not found")
        
        # Verify this is actually an algorithm
        if not algorithm_data.get('is_algorithm', False):
            raise HTTPException(status_code=404, detail="Function is not classified as an algorithm")
        
        return {
            "success": True,
            "data": algorithm_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting algorithm AI analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get algorithm AI analysis: {str(e)}"
        )


@router.post("/chat/conversation")
async def create_chat_conversation(request: dict):
    """Create a new chat conversation"""
    try:
        conversation = await db_service.create_chat_conversation(
            repository_id=request.get("repository_id"),
            function_id=request.get("function_id"),
            context_type=request.get("context_type", "general")
        )
        
        if not conversation:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        return {
            "success": True,
            "data": conversation
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating chat conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create chat conversation: {str(e)}"
        )


@router.post("/chat/message")
async def save_chat_message(request: dict):
    """Save a chat message"""
    try:
        conversation_id = request.get("conversation_id")
        role = request.get("role")
        content = request.get("content")
        
        if not all([conversation_id, role, content]):
            raise HTTPException(
                status_code=400, 
                detail="conversation_id, role, and content are required"
            )
        
        if role not in ["user", "assistant"]:
            raise HTTPException(
                status_code=400,
                detail="role must be either 'user' or 'assistant'"
            )
        
        message = await db_service.create_chat_message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        
        if not message:
            raise HTTPException(status_code=500, detail="Failed to save message")
        
        return {
            "success": True,
            "data": message
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save chat message: {str(e)}"
        )