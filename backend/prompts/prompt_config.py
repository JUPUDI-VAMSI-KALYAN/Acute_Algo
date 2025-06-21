"""
Prompt configuration for different analysis scenarios.
Defines which prompts to use for comprehensive vs. focused analysis.
"""

from enum import Enum
from typing import List, Dict


class AnalysisType(Enum):
    """Types of analysis available."""
    BUSINESS_FOCUSED = "business_focused"
    TECHNICAL_COMPREHENSIVE = "technical_comprehensive"
    QUICK_ASSESSMENT = "quick_assessment"
    ALGORITHM_ONLY = "algorithm_only"


class PromptConfig:
    """Configuration for prompt selection based on analysis type."""
    
    # Business-focused analysis (recommended for algorithms)
    BUSINESS_FOCUSED_PROMPTS = [
        "short_description",      # Quick business description
        "business_metrics",       # Core business metrics
        "business_risk_assessment"  # Risk and cost analysis
    ]
    
    # Technical comprehensive analysis (detailed technical analysis)
    TECHNICAL_COMPREHENSIVE_PROMPTS = [
        "pseudocode",
        "flowchart", 
        "complexity_analysis",
        "optimization_suggestions",
        "issues_identification"
    ]
    
    # Quick assessment (minimal analysis for fast results)
    QUICK_ASSESSMENT_PROMPTS = [
        "short_description",
        "business_metrics"
    ]
    
    # Algorithm-specific analysis (balanced approach)
    ALGORITHM_SPECIFIC_PROMPTS = [
        "short_description",      # Business context
        "business_metrics",       # Business impact
        "complexity_analysis",    # Technical complexity
        "optimization_suggestions"  # Improvement recommendations
    ]
    
    @classmethod
    def get_prompts_for_analysis_type(cls, analysis_type: AnalysisType) -> List[str]:
        """Get list of prompts to run for a specific analysis type."""
        config_map = {
            AnalysisType.BUSINESS_FOCUSED: cls.BUSINESS_FOCUSED_PROMPTS,
            AnalysisType.TECHNICAL_COMPREHENSIVE: cls.TECHNICAL_COMPREHENSIVE_PROMPTS,
            AnalysisType.QUICK_ASSESSMENT: cls.QUICK_ASSESSMENT_PROMPTS,
            AnalysisType.ALGORITHM_ONLY: cls.ALGORITHM_SPECIFIC_PROMPTS
        }
        return config_map.get(analysis_type, cls.ALGORITHM_SPECIFIC_PROMPTS)
    
    @classmethod
    def get_default_analysis_type(cls, is_algorithm: bool = True) -> AnalysisType:
        """Get the default analysis type based on function classification."""
        if is_algorithm:
            return AnalysisType.ALGORITHM_ONLY
        else:
            return AnalysisType.QUICK_ASSESSMENT
    
    @classmethod
    def get_analysis_description(cls, analysis_type: AnalysisType) -> str:
        """Get human-readable description of analysis type."""
        descriptions = {
            AnalysisType.BUSINESS_FOCUSED: "Business impact and metrics analysis",
            AnalysisType.TECHNICAL_COMPREHENSIVE: "Complete technical analysis with all details",
            AnalysisType.QUICK_ASSESSMENT: "Fast business overview and basic metrics",
            AnalysisType.ALGORITHM_ONLY: "Balanced analysis for business algorithms"
        }
        return descriptions.get(analysis_type, "Standard analysis")
    
    @classmethod
    def get_estimated_time(cls, analysis_type: AnalysisType) -> str:
        """Get estimated completion time for analysis type."""
        times = {
            AnalysisType.BUSINESS_FOCUSED: "30-45 seconds",
            AnalysisType.TECHNICAL_COMPREHENSIVE: "60-90 seconds", 
            AnalysisType.QUICK_ASSESSMENT: "15-25 seconds",
            AnalysisType.ALGORITHM_ONLY: "45-60 seconds"
        }
        return times.get(analysis_type, "30-60 seconds")


class PromptSelector:
    """Helper class to select and organize prompts for analysis."""
    
    @staticmethod
    def get_prompt_methods(analysis_type: AnalysisType) -> Dict[str, str]:
        """Map prompt names to their method names in the prompt classes."""
        method_mapping = {
            # Business metrics prompts
            "short_description": ("BusinessMetricsPrompts", "get_short_description_prompt"),
            "business_metrics": ("BusinessMetricsPrompts", "get_business_metrics_prompt"),
            "business_risk_assessment": ("BusinessMetricsPrompts", "get_business_risk_assessment_prompt"),
            "algorithm_classification": ("BusinessMetricsPrompts", "get_algorithm_classification_prompt"),
            
            # Algorithm analysis prompts
            "pseudocode": ("AlgorithmAnalysisPrompts", "get_pseudocode_prompt"),
            "flowchart": ("AlgorithmAnalysisPrompts", "get_flowchart_prompt"),
            "complexity_analysis": ("AlgorithmAnalysisPrompts", "get_complexity_analysis_prompt"),
            "optimization_suggestions": ("AlgorithmAnalysisPrompts", "get_optimization_suggestions_prompt"),
            "issues_identification": ("AlgorithmAnalysisPrompts", "get_issues_identification_prompt"),
            
            # Code analysis prompts
            "code_quality_assessment": ("CodeAnalysisPrompts", "get_code_quality_assessment_prompt"),
            "maintainability_analysis": ("CodeAnalysisPrompts", "get_maintainability_analysis_prompt"),
            "refactoring_recommendations": ("CodeAnalysisPrompts", "get_refactoring_recommendations_prompt"),
            "testing_recommendations": ("CodeAnalysisPrompts", "get_testing_recommendations_prompt")
        }
        
        selected_prompts = PromptConfig.get_prompts_for_analysis_type(analysis_type)
        return {prompt: method_mapping[prompt] for prompt in selected_prompts if prompt in method_mapping}
    
    @staticmethod
    def validate_analysis_type(analysis_type_str: str) -> AnalysisType:
        """Validate and convert string to AnalysisType enum."""
        try:
            return AnalysisType(analysis_type_str)
        except ValueError:
            # Default to algorithm analysis for invalid types
            return AnalysisType.ALGORITHM_ONLY


# Usage examples and documentation
USAGE_EXAMPLES = {
    "business_focused": {
        "description": "For algorithms that need business impact assessment",
        "use_case": "Executive reporting, business prioritization",
        "output": "Business metrics, risk assessment, cost analysis"
    },
    "technical_comprehensive": {
        "description": "Full technical analysis for deep code review",
        "use_case": "Code reviews, refactoring planning, technical debt assessment",
        "output": "Pseudocode, flowcharts, complexity analysis, optimization suggestions"
    },
    "quick_assessment": {
        "description": "Fast analysis for large codebases",
        "use_case": "Initial screening, batch processing, quick insights",
        "output": "Short description and basic business metrics"
    },
    "algorithm_only": {
        "description": "Balanced analysis specifically for business algorithms",
        "use_case": "Algorithm-focused analysis with business context",
        "output": "Business description, metrics, complexity, and optimization suggestions"
    }
} 