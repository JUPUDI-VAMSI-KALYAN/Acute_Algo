import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIAnalysisData,
    ChatRequest,
    ChatResponse
)
from services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze-function", response_model=AIAnalysisResponse)
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


@router.get("/models")
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


@router.get("/status")
async def get_ai_service_status():
    """Check AI service status"""
    
    return {
        "available": ai_service.is_available(),
        "model": ai_service.default_model,
        "configured": bool(ai_service.api_key)
    }


@router.post("/chat", response_model=ChatResponse)
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