import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIAnalysisData,
    ChatRequest,
    ChatResponse,
    ComprehensiveAnalysisResult,
    AIAnalysisResult,
    LangChainBusinessAnalysisResult,
)
from services.langchain_ai_service import langchain_ai_service as ai_service
from services.database_service import DatabaseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Initialize database service
db_service = DatabaseService()


@router.post("/analyze-function", response_model=AIAnalysisResponse)
async def analyze_function(request: AIAnalysisRequest):
    """Analyze function with AI - supports comprehensive LangChain analysis"""
    try:
        # Check if AI service is available
        if not ai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please check DO_MODEL_ACCESS_KEY configuration.",
            )

        # Get analysis type from request, default to comprehensive
        analysis_type = request.analysis_type or "comprehensive"
        logger.info(
            f"Starting AI analysis for function '{request.function_name}' with type: {analysis_type}"
        )

        # Determine if this is an algorithm using function counter service
        from services.function_counter import FunctionCounter, FunctionInfo

        function_counter = FunctionCounter()

        # Create a temporary FunctionInfo object for classification
        temp_func = FunctionInfo(
            name=request.function_name,
            type="function",
            start_line=1,
            end_line=request.function_code.count("\n") + 1,
            line_count=request.function_code.count("\n") + 1,
        )

        is_algorithm, score, reason = function_counter._classify_function_as_algorithm(
            temp_func, request.function_code, request.language
        )

        logger.info(
            f"Function classification: is_algorithm={is_algorithm}, score={score}"
        )

        # Choose analysis method based on type and algorithm classification
        response_data = None

        if analysis_type == "comprehensive":
            # Use comprehensive analysis for all functions
            analysis_result = await ai_service.analyze_function_comprehensive(
                request.function_code, request.function_name
            )

            # Handle ComprehensiveAnalysisResult
            if isinstance(analysis_result, ComprehensiveAnalysisResult):
                tech_analysis = analysis_result.technical_analysis
                business_analysis = analysis_result.business_analysis

                response_data = AIAnalysisData(
                    pseudocode=tech_analysis.pseudocode or "",
                    flowchart=tech_analysis.flowchart or "",
                    complexityAnalysis=tech_analysis.complexity_analysis or "",
                    optimizationSuggestions=tech_analysis.optimization_suggestions
                    or [],
                    potentialIssues=tech_analysis.potential_issues or [],
                    analysisType=analysis_type,
                    shortDescription=tech_analysis.short_description or "",
                    overallAssessment=analysis_result.overall_assessment or "",
                    recommendations=analysis_result.recommendations or [],
                    businessValue=business_analysis.business_value or "",
                    useCases=business_analysis.use_cases or [],
                    performanceImpact=business_analysis.performance_impact or "",
                    scalabilityNotes=business_analysis.scalability_notes or "",
                    maintenanceComplexity=business_analysis.maintenance_complexity
                    or "",
                    analysisTimestamp=datetime.now().isoformat(),
                )
            else:
                # Fallback for unexpected result type
                response_data = AIAnalysisData(
                    pseudocode="Analysis completed but unexpected result format",
                    flowchart="Analysis completed but unexpected result format",
                    complexityAnalysis="Analysis completed but unexpected result format",
                    optimizationSuggestions=[],
                    potentialIssues=[],
                    analysisType=analysis_type,
                    shortDescription="Analysis completed but unexpected result format",
                    analysisTimestamp=datetime.now().isoformat(),
                )

        elif analysis_type == "business_focused" and is_algorithm:
            # Use business-focused analysis for algorithms
            business_result = await ai_service.analyze_business_focused(
                request.function_code, request.function_name
            )

            if isinstance(business_result, LangChainBusinessAnalysisResult):
                response_data = AIAnalysisData(
                    pseudocode="Business-focused analysis - pseudocode not generated",
                    flowchart="Business-focused analysis - flowchart not generated",
                    complexityAnalysis="See business analysis for complexity assessment",
                    optimizationSuggestions=[],
                    potentialIssues=[],
                    analysisType=analysis_type,
                    businessValue=business_result.business_value or "",
                    useCases=business_result.use_cases or [],
                    performanceImpact=business_result.performance_impact or "",
                    scalabilityNotes=business_result.scalability_notes or "",
                    maintenanceComplexity=business_result.maintenance_complexity or "",
                    analysisTimestamp=datetime.now().isoformat(),
                )

        elif analysis_type == "algorithm_only" and is_algorithm:
            # Use algorithm-focused analysis
            from prompts.prompt_config import AnalysisType

            tech_result = await ai_service.analyze_algorithm_focused(
                request.function_code,
                request.function_name,
                AnalysisType.ALGORITHM_ONLY,
            )

            if isinstance(tech_result, AIAnalysisResult):
                response_data = AIAnalysisData(
                    pseudocode=tech_result.pseudocode or "",
                    flowchart=tech_result.flowchart or "",
                    complexityAnalysis=tech_result.complexity_analysis or "",
                    optimizationSuggestions=tech_result.optimization_suggestions or [],
                    potentialIssues=tech_result.potential_issues or [],
                    analysisType=analysis_type,
                    shortDescription=tech_result.short_description or "",
                    analysisTimestamp=datetime.now().isoformat(),
                )
        else:
            # Fallback to comprehensive analysis
            analysis_result = await ai_service.analyze_function_comprehensive(
                request.function_code, request.function_name
            )

            # Handle any result type
            if isinstance(analysis_result, ComprehensiveAnalysisResult):
                tech_analysis = analysis_result.technical_analysis
                business_analysis = analysis_result.business_analysis

                response_data = AIAnalysisData(
                    pseudocode=tech_analysis.pseudocode or "",
                    flowchart=tech_analysis.flowchart or "",
                    complexityAnalysis=tech_analysis.complexity_analysis or "",
                    optimizationSuggestions=tech_analysis.optimization_suggestions
                    or [],
                    potentialIssues=tech_analysis.potential_issues or [],
                    analysisType="comprehensive",
                    shortDescription=tech_analysis.short_description or "",
                    overallAssessment=analysis_result.overall_assessment or "",
                    recommendations=analysis_result.recommendations or [],
                    businessValue=business_analysis.business_value or "",
                    useCases=business_analysis.use_cases or [],
                    performanceImpact=business_analysis.performance_impact or "",
                    scalabilityNotes=business_analysis.scalability_notes or "",
                    maintenanceComplexity=business_analysis.maintenance_complexity
                    or "",
                    analysisTimestamp=datetime.now().isoformat(),
                )
            else:
                # Handle other result types
                response_data = AIAnalysisData(
                    pseudocode=getattr(analysis_result, "pseudocode", "") or "",
                    flowchart=getattr(analysis_result, "flowchart", "") or "",
                    complexityAnalysis=getattr(
                        analysis_result, "complexity_analysis", ""
                    )
                    or "",
                    optimizationSuggestions=getattr(
                        analysis_result, "optimization_suggestions", []
                    )
                    or [],
                    potentialIssues=getattr(analysis_result, "potential_issues", [])
                    or [],
                    analysisType=analysis_type,
                    shortDescription=getattr(analysis_result, "short_description", "")
                    or "",
                    analysisTimestamp=datetime.now().isoformat(),
                )

        # Final safety check to ensure response_data is always set
        if response_data is None:
            response_data = AIAnalysisData(
                pseudocode="Analysis could not be completed",
                flowchart="Analysis could not be completed",
                complexityAnalysis="Analysis could not be completed",
                optimizationSuggestions=[],
                potentialIssues=[],
                analysisType=analysis_type,
                shortDescription="Analysis could not be completed",
                analysisTimestamp=datetime.now().isoformat(),
            )

        # Store analysis in database if function_id is provided
        if request.function_id:
            try:
                # Convert response_data to dict for database storage
                analysis_dict = response_data.model_dump(by_alias=True)

                # Store in database
                stored_analysis = await db_service.create_ai_analysis(
                    function_id=request.function_id, enhanced_data=analysis_dict
                )

                if stored_analysis:
                    logger.info(
                        f"AI analysis stored in database for function ID {request.function_id}"
                    )
                else:
                    logger.warning(
                        f"Failed to store AI analysis in database for function ID {request.function_id}"
                    )

            except Exception as db_error:
                logger.error(
                    f"Database storage error for function ID {request.function_id}: {db_error}"
                )
                # Don't fail the entire request if database storage fails

        logger.info(
            f"AI analysis completed successfully for function '{request.function_name}'"
        )
        return AIAnalysisResponse(success=True, data=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing function '{request.function_name}': {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze function: {str(e)}"
        )


@router.get("/models")
async def get_available_ai_models():
    """Get list of available AI models"""

    try:
        if not ai_service.is_available():
            return {
                "success": False,
                "message": "AI service not configured",
                "models": [],
            }

        models = ai_service.get_available_models()

        return {
            "success": True,
            "models": models,
            "current_model": ai_service.model_name,
        }

    except Exception as e:
        logger.error(f"Failed to get AI models: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to get models: {str(e)}",
            "models": [],
        }


@router.get("/status")
async def get_ai_service_status():
    """Check AI service status"""

    return {
        "available": ai_service.is_available(),
        "model": ai_service.model_name,
        "configured": ai_service.is_available(),
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
                detail="AI service is not available. Please check DO_MODEL_ACCESS_KEY configuration.",
            )

        # Use the new chat_with_context method with organized prompts
        response_text = await ai_service.chat_with_context(
            message=request.message,
            context_type=request.context_type,
            function_info=request.function_info,
            repository_info=request.repository_info,
            conversation_history=request.conversation_history,
        )

        if (
            not response_text
            or response_text.startswith("AI service is not available")
            or response_text.startswith("Chat failed")
        ):
            raise HTTPException(
                status_code=500,
                detail=response_text
                or "Failed to generate AI response. Please try again.",
            )

        logger.info("Chat response generated successfully")

        return ChatResponse(
            success=True,
            response=response_text,
            conversation_id=None,  # Could implement conversation tracking later
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
