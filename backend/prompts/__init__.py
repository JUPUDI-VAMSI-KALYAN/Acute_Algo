"""
Prompts package for AI analysis services.

This package contains all AI prompts used for algorithm analysis,
organized by analysis type for better maintainability.
"""

from .algorithm_analysis import AlgorithmAnalysisPrompts
from .business_metrics import BusinessMetricsPrompts
from .code_analysis import CodeAnalysisPrompts
from .chat_prompts import ChatPrompts
from .prompt_config import PromptConfig, PromptSelector, AnalysisType, USAGE_EXAMPLES

__all__ = [
    "AlgorithmAnalysisPrompts",
    "BusinessMetricsPrompts", 
    "CodeAnalysisPrompts",
    "ChatPrompts",
    "PromptConfig",
    "PromptSelector",
    "AnalysisType",
    "USAGE_EXAMPLES"
]