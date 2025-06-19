import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    AnalysisRequest, 
    AnalysisResponse, 
    AnalysisData, 
    FileCounts,
    FunctionAnalysis,
    LanguageStats,
    FileAnalysis,
    FunctionInfo,
    ErrorResponse
)
from services.repository_service import RepositoryService
from services.file_scanner import FileScanner

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Acute Algo API server")
    yield
    # Shutdown
    logger.info("Shutting down Acute Algo API server")


# Initialize FastAPI app
app = FastAPI(
    title="Acute Algo API",
    description="GitHub Repository Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
repository_service = RepositoryService()
file_scanner = FileScanner()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/analyze-repo", response_model=AnalysisResponse)
async def analyze_repository(request: AnalysisRequest):
    """Analyze a GitHub repository"""
    
    try:
        logger.info(f"Starting analysis for repository: {request.github_url}")
        
        # Clone repository
        repo_path, repo_name = await repository_service.clone_repository(request.github_url)
        logger.info(f"Repository cloned successfully: {repo_name}")
        
        # Scan repository
        scan_result = file_scanner.scan_repository(repo_path)
        logger.info(f"Scan completed. Total files: {scan_result.file_counts['total']}, Characters: {scan_result.total_characters}")
        
        # Prepare function analysis data
        function_analysis = None
        if scan_result.function_analysis:
            fa = scan_result.function_analysis
            
            # Convert LanguageStats
            languages = {}
            for lang, stats in fa.languages.items():
                languages[lang] = LanguageStats(
                    files=stats['files'],
                    functions=stats['functions']
                )
            
            # Convert FileAnalysis
            files = []
            for file_data in fa.files:
                # Convert FunctionInfo
                functions = []
                for func in file_data.functions:
                    functions.append(FunctionInfo(
                        name=func.name,
                        type=func.type,
                        start_line=func.start_line,
                        end_line=func.end_line,
                        line_count=func.line_count
                    ))
                
                files.append(FileAnalysis(
                    path=file_data.path,
                    language=file_data.language,
                    function_count=file_data.function_count,
                    functions=functions,
                    breakdown=file_data.breakdown
                ))
            
            # Calculate avg functions per file
            avg_functions_per_file = round(fa.total_functions / fa.total_files, 2) if fa.total_files > 0 else 0
            
            # Find most common language by function count
            most_common_language = None
            if fa.languages:
                most_common_language = max(
                    fa.languages.items(), 
                    key=lambda x: x[1]['functions']
                )[0]
            
            # Get largest files by function count (top 5)
            largest_files = []
            sorted_files = sorted(fa.files, key=lambda x: x.function_count, reverse=True)[:5]
            for file_data in sorted_files:
                largest_functions = []
                for func in file_data.functions:
                    largest_functions.append(FunctionInfo(
                        name=func.name,
                        type=func.type,
                        start_line=func.start_line,
                        end_line=func.end_line,
                        line_count=func.line_count
                    ))
                
                largest_files.append(FileAnalysis(
                    path=file_data.path,
                    language=file_data.language,
                    function_count=file_data.function_count,
                    functions=largest_functions,
                    breakdown=file_data.breakdown
                ))
            
            function_analysis = FunctionAnalysis(
                total_functions=fa.total_functions,
                total_analyzed_files=fa.total_files,
                languages=languages,
                files=files,
                avg_functions_per_file=avg_functions_per_file,
                most_common_language=most_common_language,
                largest_files=largest_files
            )
        
        # Create response data
        analysis_data = AnalysisData(
            repository_name=repo_name,
            file_counts=FileCounts(**scan_result.file_counts),
            directory_tree=scan_result.directory_tree,
            file_contents=scan_result.file_contents,
            total_characters=scan_result.total_characters,
            function_analysis=function_analysis
        )
        
        logger.info("Analysis completed successfully")
        
        return AnalysisResponse(data=analysis_data)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
    finally:
        # Cleanup temporary directory
        try:
            repository_service.cleanup()
            logger.info("Cleanup completed")
        except Exception as e:
            logger.warning(f"Cleanup failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 