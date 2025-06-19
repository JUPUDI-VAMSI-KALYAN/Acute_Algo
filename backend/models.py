from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Dict, List, Optional
from enum import Enum


class AnalysisRequest(BaseModel):
    """Request model for repository analysis"""
    github_url: str = Field(..., alias="githubUrl", description="GitHub repository URL")

    model_config = ConfigDict(populate_by_name=True)


class FileCounts(BaseModel):
    """File counts by extension"""
    javascript: int = Field(default=0, alias="javascript")
    python: int = Field(default=0, alias="python")
    typescript: int = Field(default=0, alias="typescript")
    total: int = Field(default=0, alias="total")

    model_config = ConfigDict(populate_by_name=True)


class FunctionInfo(BaseModel):
    """Information about a single function"""
    name: str = Field(..., alias="name")
    type: str = Field(..., alias="type")
    start_line: int = Field(..., alias="startLine")
    end_line: int = Field(..., alias="endLine")
    line_count: int = Field(..., alias="lineCount")
    code: Optional[str] = Field(None, alias="code", description="Function source code")

    model_config = ConfigDict(populate_by_name=True)


class FileAnalysis(BaseModel):
    """Analysis data for a single file"""
    path: str = Field(..., alias="path")
    language: str = Field(..., alias="language")
    function_count: int = Field(..., alias="functionCount")
    functions: List[FunctionInfo] = Field(default=[], alias="functions")
    breakdown: Dict[str, int] = Field(default={}, alias="breakdown")

    model_config = ConfigDict(populate_by_name=True)


class LanguageStats(BaseModel):
    """Statistics for a programming language"""
    files: int = Field(..., alias="files")
    functions: int = Field(..., alias="functions")

    model_config = ConfigDict(populate_by_name=True)


class FunctionAnalysis(BaseModel):
    """Function analysis results"""
    total_functions: int = Field(..., alias="totalFunctions")
    total_analyzed_files: int = Field(..., alias="totalAnalyzedFiles")
    languages: Dict[str, LanguageStats] = Field(default={}, alias="languages")
    files: List[FileAnalysis] = Field(default=[], alias="files")
    avg_functions_per_file: float = Field(..., alias="avgFunctionsPerFile")
    most_common_language: Optional[str] = Field(None, alias="mostCommonLanguage")
    largest_files: List[FileAnalysis] = Field(default=[], alias="largestFiles")

    model_config = ConfigDict(populate_by_name=True)


class AnalysisData(BaseModel):
    """Analysis data for a repository"""
    repository_name: str = Field(..., alias="repositoryName")
    file_counts: FileCounts = Field(..., alias="fileCounts")
    directory_tree: str = Field(..., alias="directoryTree")
    file_contents: str = Field(..., alias="fileContents")
    total_characters: int = Field(..., alias="totalCharacters")
    function_analysis: Optional[FunctionAnalysis] = Field(None, alias="functionAnalysis")

    model_config = ConfigDict(populate_by_name=True)


class AnalysisResponse(BaseModel):
    """Response model for successful analysis"""
    success: bool = Field(default=True, alias="success")
    data: AnalysisData = Field(..., alias="data")

    model_config = ConfigDict(populate_by_name=True)


class ErrorResponse(BaseModel):
    """Response model for errors"""
    success: bool = Field(default=False, alias="success")
    error: str = Field(..., alias="error")

    model_config = ConfigDict(populate_by_name=True) 