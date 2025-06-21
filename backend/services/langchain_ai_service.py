"""LangChain-enhanced AI service for Acute Algo platform.

This module provides an enhanced AI service that integrates LangChain with DigitalOcean AI,
offering improved prompt management, chain composition, and analysis capabilities.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from langchain_digitalocean import ChatLangchainDigitalocean
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from models import AIAnalysisResult, ComprehensiveAnalysisResult, LangChainBusinessAnalysisResult
from prompts import AlgorithmAnalysisPrompts, BusinessMetricsPrompts, ChatPrompts
from prompts.prompt_config import AnalysisType

logger = logging.getLogger(__name__)


@dataclass
class LangChainConfig:
    """Configuration for LangChain AI service."""
    model: str = "llama3.3-70b-instruct"
    temperature: float = 0.1
    max_tokens: int = 4000
    buffer_length: int = 100
    timeout: int = 60
    max_retries: int = 3


class LangChainAIService:
    """Enhanced AI service using LangChain with DigitalOcean AI.
    
    This service provides advanced prompt management, chain composition,
    and structured output parsing for AI analysis tasks.
    """
    
    def __init__(self, config: Optional[LangChainConfig] = None):
        """Initialize the LangChain AI service.
        
        Args:
            config: Configuration for the LangChain service
        """
        self.config = config or LangChainConfig()
        # Try both environment variable names for backward compatibility
        self.api_key = os.getenv("DIGITALOCEAN_MODEL_ACCESS_KEY") or os.getenv("DO_MODEL_ACCESS_KEY")
        
        if not self.api_key:
            logger.warning("DIGITALOCEAN_MODEL_ACCESS_KEY or DO_MODEL_ACCESS_KEY not found in environment variables")
            self._available = False
        else:
            self._available = True
            self._initialize_llm()
            self._setup_chains()
    
    def _initialize_llm(self) -> None:
        """Initialize the ChatLangchainDigitalocean model."""
        try:
            self.llm = ChatLangchainDigitalocean(
                model=self.config.model,
                api_key=self.api_key,
                buffer_length=self.config.buffer_length,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                timeout=self.config.timeout,
                max_retries=self.config.max_retries
            )
            logger.info(f"Initialized LangChain AI service with model: {self.config.model}")
        except Exception as e:
            logger.error(f"Failed to initialize LangChain AI service: {e}")
            self._available = False
    
    def _setup_chains(self) -> None:
        """Setup LangChain chains for different analysis types."""
        # Function classification chain
        self.function_classifier_chain = self._create_function_classifier_chain()
        
        # Business analysis chain
        self.business_analysis_chain = self._create_business_analysis_chain()
        
        # Technical analysis chain
        self.technical_analysis_chain = self._create_technical_analysis_chain()
        
        # Comprehensive analysis chain
        self.comprehensive_analysis_chain = self._create_comprehensive_analysis_chain()
        
        # Chat chain for conversational AI
        self.chat_chain = self._create_chat_chain()
    
    def _create_function_classifier_chain(self):
        """Create a chain for classifying functions as algorithms."""
        system_prompt = SystemMessagePromptTemplate.from_template(
            "You are an expert code analyzer. Classify whether the given function is an algorithm.\n\n"
            "Respond with a valid JSON object containing:\n"
            "- is_algorithm: boolean (whether the function is an algorithm)\n"
            "- confidence: number between 0 and 1 (confidence score)\n\n"
            "Example response: {\"is_algorithm\": true, \"confidence\": 0.85}"
        )
        
        human_prompt = HumanMessagePromptTemplate.from_template(
            "Function to classify:\n\n{function_code}\n\nFunction name: {function_name}\n\n"
            "Please respond with only the JSON object, no additional text."
        )
        
        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
        parser = JsonOutputParser()
        
        return prompt | self.llm | parser
    
    def _create_business_analysis_chain(self):
        """Create a chain for business-focused analysis."""
        system_prompt = SystemMessagePromptTemplate.from_template(
            BusinessMetricsPrompts.BUSINESS_ANALYSIS_SYSTEM + "\n\n"
            "Respond with a valid JSON object containing:\n"
            "- business_value: string (business value description)\n"
            "- use_cases: array of strings (potential use cases)\n"
            "- performance_impact: string (performance impact assessment)\n"
            "- scalability_notes: string (scalability considerations)\n"
            "- maintenance_complexity: string (maintenance complexity assessment)\n\n"
            "Example: {\"business_value\": \"High\", \"use_cases\": [\"Data processing\"], \"performance_impact\": \"Medium\", \"scalability_notes\": \"Good\", \"maintenance_complexity\": \"Low\"}"
        )
        
        human_prompt = HumanMessagePromptTemplate.from_template(
            "Analyze this function from a business perspective:\n\n"
            "Function: {function_name}\n"
            "Code:\n{function_code}\n\n"
            "Please respond with only the JSON object, no additional text."
        )
        
        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
        parser = JsonOutputParser()
        
        return prompt | self.llm | parser
    
    def _create_technical_analysis_chain(self):
        """Create a chain for technical analysis."""
        system_prompt = SystemMessagePromptTemplate.from_template(
            AlgorithmAnalysisPrompts.TECHNICAL_ANALYSIS_SYSTEM + "\n\n"
            "Respond with a valid JSON object containing:\n"
            "- short_description: string (brief description of the algorithm)\n"
            "- pseudocode: string (pseudocode representation)\n"
            "- flowchart: string (flowchart description)\n"
            "- complexity_analysis: string (time and space complexity analysis)\n"
            "- optimization_suggestions: array of strings (optimization suggestions)\n"
            "- potential_issues: array of strings (potential issues or edge cases)\n\n"
            "Example: {\"short_description\": \"Sorting algorithm\", \"pseudocode\": \"...\", \"flowchart\": \"...\", \"complexity_analysis\": \"O(n log n)\", \"optimization_suggestions\": [], \"potential_issues\": []}"
        )
        
        human_prompt = HumanMessagePromptTemplate.from_template(
            "Perform technical analysis on this function:\n\n"
            "Function: {function_name}\n"
            "Code:\n{function_code}\n\n"
            "Analysis type: {analysis_type}\n"
            "Please respond with only the JSON object, no additional text."
        )
        
        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
        parser = JsonOutputParser()
        
        return prompt | self.llm | parser
    
    def _create_comprehensive_analysis_chain(self):
        """Create a chain for comprehensive analysis combining business and technical aspects."""
        system_prompt = SystemMessagePromptTemplate.from_template(
            "You are an expert software analyst capable of both business and technical analysis. "
            "Provide comprehensive analysis covering all aspects of the given function.\n\n"
            "TECHNICAL ANALYSIS REQUIREMENTS:\n"
            "- short_description: Brief 1-2 sentence description of what the function does\n"
            "- pseudocode: Create clear, structured pseudocode using BEGIN/END, IF/ELSE, WHILE/FOR format. Use \\n for line breaks.\n"
            "- flowchart: Generate valid Mermaid flowchart syntax starting with 'flowchart TD'. Use \\n for line breaks.\n"
            "- complexity_analysis: Analyze time and space complexity with Big O notation\n"
            "- optimization_suggestions: Array of specific optimization suggestions\n"
            "- potential_issues: Array of potential problems or edge cases\n\n"
            "BUSINESS ANALYSIS REQUIREMENTS:\n"
            "- business_value: Describe the business value and impact\n"
            "- use_cases: Array of specific use cases or applications\n"
            "- performance_impact: Performance implications for business operations\n"
            "- scalability_notes: Scalability considerations and recommendations\n"
            "- maintenance_complexity: Assessment of maintenance difficulty\n\n"
            "PSEUDOCODE FORMAT:\n"
            "Use structured format like: FUNCTION name:\\n    BEGIN\\n        IF condition THEN\\n            action\\n        END IF\\n        RETURN result\\n    END\n\n"
            "FLOWCHART FORMAT:\n"
            "Use Mermaid syntax like: flowchart TD\\n    A[Start] --> B[Process]\\n    B --> C{{Decision?}}\\n    C -->|Yes| D[Action]\\n    C -->|No| E[Alternative]\\n    D --> F[End]\\n    E --> F\n\n"
            "IMPORTANT: Respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no additional text.\n\n"
            "Required JSON structure:\n"
            "{{\n"
            "  \"technical_analysis\": {{\n"
            "    \"short_description\": \"string\",\n"
            "    \"pseudocode\": \"string with \\n for line breaks\",\n"
            "    \"flowchart\": \"string with \\n for line breaks\",\n"
            "    \"complexity_analysis\": \"string\",\n"
            "    \"optimization_suggestions\": [\"string\"],\n"
            "    \"potential_issues\": [\"string\"]\n"
            "  }},\n"
            "  \"business_analysis\": {{\n"
            "    \"business_value\": \"string\",\n"
            "    \"use_cases\": [\"string\"],\n"
            "    \"performance_impact\": \"string\",\n"
            "    \"scalability_notes\": \"string\",\n"
            "    \"maintenance_complexity\": \"string\"\n"
            "  }},\n"
            "  \"overall_assessment\": \"string\",\n"
            "  \"recommendations\": [\"string\"]\n"
            "}}\n\n"
            "Ensure all text fields are properly escaped for JSON and use \\n for line breaks within multi-line text."
        )
        
        human_prompt = HumanMessagePromptTemplate.from_template(
            "Analyze this function comprehensively for both technical and business aspects:\n\n"
            "**Function Name:** {function_name}\n\n"
            "**Source Code:**\n```\n{function_code}\n```\n\n"
            "Provide detailed analysis covering:\n"
            "1. Technical aspects (pseudocode, flowchart, complexity, optimizations, issues)\n"
            "2. Business aspects (value, use cases, performance impact, scalability, maintenance)\n"
            "3. Overall assessment and actionable recommendations\n\n"
            "IMPORTANT: Ensure pseudocode uses proper structured format and flowchart uses valid Mermaid syntax.\n"
            "Return ONLY the JSON object with no additional text or formatting."
        )
        
        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])
        parser = JsonOutputParser()
        
        return prompt | self.llm | parser
    
    def _create_chat_chain(self):
        """Create a chain for chat conversations with proper context handling."""
        # This will be a simple chain that uses the LLM directly with proper prompting
        return self.llm
    

    
    @property
    def model_name(self) -> str:
        """Get the current model name."""
        return self.config.model if self.is_available() else "unavailable"
    
    # Note: Manual JSON parsing methods removed - now using .with_structured_output()
    
    def is_available(self) -> bool:
        """Check if the LangChain AI service is available."""
        return self._available
    
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        if not self.is_available():
            return []
        
        # DigitalOcean AI supported models - using only 70B 3.3 model
        return [
            "llama3.3-70b-instruct"
        ]
    
    async def classify_function(self, function_code: str, function_name: str) -> Dict[str, Any]:
        """Classify whether a function is an algorithm using LangChain.
        
        Args:
            function_code: The source code of the function
            function_name: The name of the function
            
        Returns:
            Dictionary with classification results
        """
        if not self.is_available():
            return {"is_algorithm": False, "confidence": 0.0, "error": "Service not available"}
        
        try:
            result = await self.function_classifier_chain.ainvoke({
                "function_code": function_code,
                "function_name": function_name
            })
            return result
        except Exception as e:
            logger.error(f"Error in function classification: {e}")
            return {"is_algorithm": False, "confidence": 0.0, "error": str(e)}
    
    async def analyze_business_focused(self, function_code: str, function_name: str) -> LangChainBusinessAnalysisResult:
        """Perform business-focused analysis using LangChain.
        
        Args:
            function_code: The source code of the function
            function_name: The name of the function
            
        Returns:
            Business analysis result
        """
        if not self.is_available():
            return LangChainBusinessAnalysisResult(
                business_value="Service not available",
                use_cases=[],
                performance_impact="Unknown",
                scalability_notes="Service not available",
                maintenance_complexity="Unknown"
            )
        
        try:
            result = await self.business_analysis_chain.ainvoke({
                "function_code": function_code,
                "function_name": function_name
            })
            
            # Parse JSON result into proper model object
            if isinstance(result, dict):
                return LangChainBusinessAnalysisResult(
                    business_value=result.get("business_value", ""),
                    use_cases=result.get("use_cases", []),
                    performance_impact=result.get("performance_impact", ""),
                    scalability_notes=result.get("scalability_notes", ""),
                    maintenance_complexity=result.get("maintenance_complexity", "")
                )
            else:
                return result
        except Exception as e:
            logger.error(f"Error in business analysis: {e}")
            return LangChainBusinessAnalysisResult(
                business_value=f"Analysis failed: {str(e)}",
                use_cases=[],
                performance_impact="Unknown",
                scalability_notes="Analysis failed",
                maintenance_complexity="Unknown"
            )
    
    async def analyze_algorithm_focused(self, function_code: str, function_name: str, analysis_type: AnalysisType) -> AIAnalysisResult:
        """Perform algorithm-focused technical analysis using LangChain.
        
        Args:
            function_code: The source code of the function
            function_name: The name of the function
            analysis_type: Type of analysis to perform
            
        Returns:
            Technical analysis result
        """
        if not self.is_available():
            return AIAnalysisResult(
                short_description="Service not available",
                pseudocode="Service not available",
                flowchart="Service not available",
                complexity_analysis="Service not available",
                optimization_suggestions=[],
                potential_issues=[]
            )
        
        try:
            result = await self.technical_analysis_chain.ainvoke({
                "function_code": function_code,
                "function_name": function_name,
                "analysis_type": analysis_type.value
            })
            
            # Parse JSON result into proper model object
            if isinstance(result, dict):
                return AIAnalysisResult(
                    short_description=result.get("short_description", ""),
                    pseudocode=result.get("pseudocode", ""),
                    flowchart=result.get("flowchart", ""),
                    complexity_analysis=result.get("complexity_analysis", ""),
                    optimization_suggestions=result.get("optimization_suggestions", []),
                    potential_issues=result.get("potential_issues", [])
                )
            else:
                return result
        except Exception as e:
            logger.error(f"Error in technical analysis: {e}")
            return AIAnalysisResult(
                short_description="Analysis failed",
                pseudocode="Analysis failed",
                flowchart="Analysis failed",
                complexity_analysis="Analysis failed",
                optimization_suggestions=[],
                potential_issues=[]
            )
    
    async def analyze_function_comprehensive(self, function_code: str, function_name: str) -> ComprehensiveAnalysisResult:
        """Perform comprehensive analysis using LangChain.
        
        Args:
            function_code: The source code of the function
            function_name: The name of the function
            
        Returns:
            Comprehensive analysis result
        """
        if not self.is_available():
            return ComprehensiveAnalysisResult(
                technical_analysis=AIAnalysisResult(
                    short_description="Service not available",
                    pseudocode="Service not available",
                    flowchart="Service not available",
                    complexity_analysis="Service not available",
                    optimization_suggestions=[],
                    potential_issues=[]
                ),
                business_analysis=LangChainBusinessAnalysisResult(
                    business_value="Service not available",
                    use_cases=[],
                    performance_impact="Unknown",
                    scalability_notes="Service not available",
                    maintenance_complexity="Unknown"
                ),
                overall_assessment="Service not available",
                recommendations=[]
            )
        
        try:
            result = await self.comprehensive_analysis_chain.ainvoke({
                "function_code": function_code,
                "function_name": function_name
            })
            
            # Handle case where result might be a string with JSON content
            if isinstance(result, str):
                # Try to extract JSON from markdown code blocks
                import re
                json_match = re.search(r'```json\s*\n(.*?)\n```', result, re.DOTALL)
                if json_match:
                    try:
                        result = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse extracted JSON: {json_match.group(1)}")
                        raise
                else:
                    # Try to parse as direct JSON
                    try:
                        result = json.loads(result)
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse JSON from string: {result}")
                        raise
            
            # Parse the JSON result into proper model objects
            if isinstance(result, dict):
                # Extract technical analysis
                tech_data = result.get("technical_analysis", {})
                technical_analysis = AIAnalysisResult(
                    short_description=tech_data.get("short_description", ""),
                    pseudocode=tech_data.get("pseudocode", ""),
                    flowchart=tech_data.get("flowchart", ""),
                    complexity_analysis=tech_data.get("complexity_analysis", ""),
                    optimization_suggestions=tech_data.get("optimization_suggestions", []),
                    potential_issues=tech_data.get("potential_issues", [])
                )
                
                # Extract business analysis
                biz_data = result.get("business_analysis", {})
                business_analysis = LangChainBusinessAnalysisResult(
                    business_value=biz_data.get("business_value", ""),
                    use_cases=biz_data.get("use_cases", []),
                    performance_impact=biz_data.get("performance_impact", ""),
                    scalability_notes=biz_data.get("scalability_notes", ""),
                    maintenance_complexity=biz_data.get("maintenance_complexity", "")
                )
                
                # Create comprehensive result
                return ComprehensiveAnalysisResult(
                    technical_analysis=technical_analysis,
                    business_analysis=business_analysis,
                    overall_assessment=result.get("overall_assessment", ""),
                    recommendations=result.get("recommendations", [])
                )
            else:
                # If it's already the right type, return it
                return result
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {e}")
            return ComprehensiveAnalysisResult(
                technical_analysis=AIAnalysisResult(
                    short_description="Analysis failed",
                    pseudocode="Analysis failed",
                    flowchart="Analysis failed",
                    complexity_analysis="Analysis failed",
                    optimization_suggestions=[],
                    potential_issues=[]
                ),
                business_analysis=LangChainBusinessAnalysisResult(
                    business_value="Analysis failed",
                    use_cases=[],
                    performance_impact="Unknown",
                    scalability_notes="Analysis failed",
                    maintenance_complexity="Unknown"
                ),
                overall_assessment="Analysis failed",
                recommendations=[]
            )
    
    async def chat_with_context(self, 
                               message: str, 
                               context_type: str = "general",
                               function_info: dict = None,
                               repository_info: dict = None,
                               conversation_history: list = None) -> str:
        """Chat with AI using proper LangChain structure and organized prompts.
        
        Args:
            message: The user's message
            context_type: Type of context ('function', 'repository', or 'general')
            function_info: Function information for function context
            repository_info: Repository information for repository context
            conversation_history: Previous conversation messages
            
        Returns:
            AI response string
        """
        if not self.is_available():
            return "AI service is not available. Please check DO_MODEL_ACCESS_KEY configuration."
        
        try:
            # Get system prompt based on context type
            system_prompt = ChatPrompts.get_system_prompt(context_type)
            
            # Build context information
            context_info = ""
            if context_type == "function" and function_info:
                context_info = ChatPrompts.build_function_context(function_info)
            elif context_type == "repository" and repository_info:
                context_info = ChatPrompts.build_repository_context(repository_info)
            else:
                context_info = "Context: General code assistance.\n\nYou are a helpful AI assistant specialized in code analysis and software development.\nPlease provide helpful and accurate responses to the user's questions."
            
            # Build conversation history
            conversation_context = ChatPrompts.build_conversation_history(conversation_history or [])
            
            # Create the full prompt using the template
            full_prompt = ChatPrompts.CHAT_TEMPLATE.format(
                context_info=context_info,
                conversation_context=conversation_context,
                message=message
            )
            
            # Create messages for the chat
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=full_prompt)
            ]
            
            # Get AI response using LangChain
            response = await self.llm.ainvoke(messages)
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            if not response_text:
                return "Failed to generate AI response. Please try again."
            
            return response_text
            
        except Exception as e:
            logger.error(f"Chat failed: {str(e)}")
            return f"Chat failed: {str(e)}"


# Global instance for backward compatibility
langchain_ai_service = LangChainAIService()