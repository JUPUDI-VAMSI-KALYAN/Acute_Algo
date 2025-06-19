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
    ErrorResponse,
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIAnalysisData,
    ChatRequest,
    ChatResponse,
    ChatMessage
)
from services.repository_service import RepositoryService
from services.file_scanner import FileScanner
from services.ai_service import ai_service

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


@app.get("/api/test-functions/{test_file}")
async def test_function_detection(test_file: str):
    """Test function detection on a specific file type"""
    
    try:
        # Create test content for different languages
        test_content = ""
        language = ""
        
        if test_file == "python":
            language = "python"
            test_content = '''def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}!"

class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b

async def fetch_data():
    # Simulate async operation
    await asyncio.sleep(1)
    return {"data": "example"}

lambda_func = lambda x: x * 2
'''
        elif test_file == "javascript":
            language = "javascript"
            test_content = '''function greet(name) {
    return `Hello, ${name}!`;
}

const add = (a, b) => {
    return a + b;
}

const subtract = (a, b) => a - b;

class Calculator {
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
    }
}

async function fetchData() {
    const response = await fetch('/api/data');
    return response.json();
}

const utils = {
    format: function(value) {
        return value.toString();
    },
    
    parse(text) {
        return JSON.parse(text);
    }
};
'''
        
        if not test_content:
            raise HTTPException(status_code=400, detail="Unsupported test file type")
        
        # Test function detection
        analysis = file_scanner.function_counter.analyze_file(
            f"test.{test_file}", 
            content=test_content, 
            include_code=True
        )
        
        if not analysis:
            return {"error": "Function analysis failed", "content": test_content}
        
        # Convert to response format
        functions = []
        for func in analysis.functions:
            functions.append({
                "name": func.name,
                "type": func.type,
                "startLine": func.start_line,
                "endLine": func.end_line,
                "lineCount": func.line_count,
                "code": func.code
            })
        
        return {
            "language": language,
            "totalFunctions": len(functions),
            "functions": functions,
            "breakdown": analysis.breakdown,
            "testContent": test_content
        }
        
    except Exception as e:
        logger.error(f"Function test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

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
                        line_count=func.line_count,
                        code=func.code
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
                        line_count=func.line_count,
                        code=func.code
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


@app.post("/api/ai/analyze-function", response_model=AIAnalysisResponse)
async def analyze_function_with_ai(request: AIAnalysisRequest):
    """Analyze a function using AI to generate pseudocode and flowchart"""
    
    try:
        logger.info(f"Starting AI analysis for function: {request.function_name}")
        
        # Check if AI service is available
        if not ai_service.is_available():
            raise HTTPException(
                status_code=503, 
                detail="AI service is not available. Please check DO_MODEL_ACCESS_KEY configuration."
            )
        
        # Perform comprehensive AI analysis
        analysis_result = await ai_service.analyze_function_comprehensive(
            function_code=request.function_code,
            function_name=request.function_name,
            language=request.language
        )
        
        if not analysis_result:
            raise HTTPException(
                status_code=500,
                detail="AI analysis failed. Please try again later."
            )
        
        # Add timestamp
        from datetime import datetime
        timestamp = datetime.now().isoformat()
        
        # Create response data
        ai_data = AIAnalysisData(
            pseudocode=analysis_result.pseudocode,
            flowchart=analysis_result.flowchart,
            complexity_analysis=analysis_result.complexity_analysis,
            optimization_suggestions=analysis_result.optimization_suggestions,
            potential_issues=analysis_result.potential_issues,
            analysis_timestamp=timestamp
        )
        
        logger.info(f"AI analysis completed for function: {request.function_name}")
        
        return AIAnalysisResponse(data=ai_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.get("/api/ai/models")
async def get_available_ai_models():
    """Get list of available AI models"""
    
    try:
        if not ai_service.is_available():
            return {
                "success": False,
                "message": "AI service not configured",
                "models": []
            }
        
        models = await ai_service.get_available_models()
        
        return {
            "success": True,
            "models": models,
            "current_model": ai_service.default_model
        }
        
    except Exception as e:
        logger.error(f"Failed to get AI models: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to get models: {str(e)}",
            "models": []
        }


@app.get("/api/ai/status")
async def get_ai_service_status():
    """Check AI service status"""
    
    return {
        "available": ai_service.is_available(),
        "model": ai_service.default_model,
        "configured": bool(ai_service.api_key)
    }


@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant about code, functions, or repository"""
    
    try:
        logger.info(f"Starting chat conversation - Context: {request.context_type}")
        
        # Check if AI service is available
        if not ai_service.is_available():
            raise HTTPException(
                status_code=503, 
                detail="AI service is not available. Please check DO_MODEL_ACCESS_KEY configuration."
            )
        
        # Build context based on the type
        context_info = ""
        
        if request.context_type == "function" and request.function_info:
            func_info = request.function_info
            context_info = f"""
Context: You are analyzing a specific function.

Function Details:
- Name: {func_info.get('name', 'Unknown')}
- Code:
```
{func_info.get('code', 'No code provided')}
```

Please provide helpful analysis and answer the user's question about this function.
"""
        elif request.context_type == "repository" and request.repository_info:
            repo_info = request.repository_info
            context_info = f"""
Context: You are analyzing a repository.

Repository Details:
- Name: {repo_info.get('name', 'Unknown')}
- Total Functions: {repo_info.get('totalFunctions', 'Unknown')}
- Languages: {repo_info.get('languages', 'Unknown')}
- File Structure: {repo_info.get('structure', 'Not provided')}

Please provide helpful analysis and answer the user's question about this repository.
"""
        else:
            context_info = """
Context: General code assistance.

You are a helpful AI assistant specialized in code analysis and software development.
Please provide helpful and accurate responses to the user's questions.
"""
        
        # Build conversation history
        conversation_context = ""
        if request.conversation_history:
            conversation_context = "\n\nPrevious conversation:\n"
            for msg in request.conversation_history[-5:]:  # Last 5 messages for context
                conversation_context += f"{msg.role.capitalize()}: {msg.content}\n"
        
        # Create the full prompt
        full_prompt = f"""{context_info}{conversation_context}

Current question: {request.message}

Please provide a helpful, accurate, and concise response. If discussing code, use proper formatting and explain concepts clearly."""
        
        # Get AI response
        response = await ai_service.generate_chat_response(full_prompt)
        
        if not response:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate AI response. Please try again."
            )
        
        logger.info(f"Chat response generated successfully")
        
        return ChatResponse(
            success=True,
            response=response,
            conversation_id=None  # Could implement conversation tracking later
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 