import logging
from fastapi import APIRouter, HTTPException
from models import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisData,
    FileCounts,
    FunctionAnalysis,
    LanguageStats,
    FileAnalysis,
    FunctionInfo,
)
from services.repository_service import RepositoryService
from services.file_scanner import FileScanner
from services.database_service import db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analysis"])

# Initialize services
repository_service = RepositoryService()
file_scanner = FileScanner()


@router.get("/test-functions/{test_file}")
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
            test_content = """function greet(name) {
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
"""

        if not test_content:
            raise HTTPException(status_code=400, detail="Unsupported test file type")

        # Test function detection
        analysis = file_scanner.function_counter.analyze_file(
            f"test.{test_file}", content=test_content, include_code=True
        )

        if not analysis:
            return {"error": "Function analysis failed", "content": test_content}

        # Convert to response format
        functions = []
        for func in analysis.functions:
            functions.append(
                {
                    "name": func.name,
                    "type": func.type,
                    "startLine": func.start_line,
                    "endLine": func.end_line,
                    "lineCount": func.line_count,
                    "code": func.code,
                }
            )

        return {
            "language": language,
            "totalFunctions": len(functions),
            "functions": functions,
            "breakdown": analysis.breakdown,
            "testContent": test_content,
        }

    except Exception as e:
        logger.error(f"Function test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")


@router.post("/analyze-repo", response_model=AnalysisResponse)
async def analyze_repository(request: AnalysisRequest):
    """Analyze a GitHub repository"""

    try:
        logger.info(f"Starting analysis for repository: {request.github_url}")

        # Clone repository
        repo_path, repo_name = await repository_service.clone_repository(
            request.github_url
        )
        logger.info(f"Repository cloned successfully: {repo_name}")

        # Scan repository
        scan_result = file_scanner.scan_repository(repo_path)
        logger.info(
            f"Scan completed. Total files: {scan_result.file_counts['total']}, Characters: {scan_result.total_characters}"
        )

        # Prepare function analysis data
        function_analysis = None
        if scan_result.function_analysis:
            fa = scan_result.function_analysis

            # Convert LanguageStats
            languages = {}
            for lang, stats in fa.languages.items():
                languages[lang] = LanguageStats(
                    files=stats["files"],
                    functions=stats["functions"],
                    algorithms=stats.get("algorithms", 0),
                )

            # Convert FileAnalysis
            files = []
            for file_data in fa.files:
                # Convert FunctionInfo
                functions = []
                for func in file_data.functions:
                    functions.append(
                        FunctionInfo(
                            name=func.name,
                            type=func.type,
                            start_line=func.start_line,
                            end_line=func.end_line,
                            line_count=func.line_count,
                            code=func.code,
                            is_algorithm=func.is_algorithm,
                            algorithm_score=func.algorithm_score,
                            classification_reason=func.classification_reason,
                        )
                    )

                files.append(
                    FileAnalysis(
                        path=file_data.path,
                        language=file_data.language,
                        function_count=file_data.function_count,
                        algorithm_count=file_data.algorithm_count,
                        functions=functions,
                        breakdown=file_data.breakdown,
                        algorithm_breakdown=file_data.algorithm_breakdown,
                    )
                )

            # Calculate avg functions per file and algorithms per file
            avg_functions_per_file = (
                round(fa.total_functions / fa.total_files, 2)
                if fa.total_files > 0
                else 0
            )
            avg_algorithms_per_file = (
                round(fa.total_algorithms / fa.total_files, 2)
                if fa.total_files > 0
                else 0
            )

            # Find most common language by function count
            most_common_language = None
            if fa.languages:
                most_common_language = max(
                    fa.languages.items(), key=lambda x: x[1]["functions"]
                )[0]

            # Get largest files by function count (top 5)
            largest_files = []
            sorted_files = sorted(
                fa.files, key=lambda x: x.function_count, reverse=True
            )[:5]
            for file_data in sorted_files:
                largest_functions = []
                for func in file_data.functions:
                    largest_functions.append(
                        FunctionInfo(
                            name=func.name,
                            type=func.type,
                            start_line=func.start_line,
                            end_line=func.end_line,
                            line_count=func.line_count,
                            code=func.code,
                            is_algorithm=func.is_algorithm,
                            algorithm_score=func.algorithm_score,
                            classification_reason=func.classification_reason,
                        )
                    )

                largest_files.append(
                    FileAnalysis(
                        path=file_data.path,
                        language=file_data.language,
                        function_count=file_data.function_count,
                        algorithm_count=file_data.algorithm_count,
                        functions=largest_functions,
                        breakdown=file_data.breakdown,
                        algorithm_breakdown=file_data.algorithm_breakdown,
                    )
                )

            function_analysis = FunctionAnalysis(
                total_functions=fa.total_functions,
                total_algorithms=fa.total_algorithms,
                total_analyzed_files=fa.total_files,
                languages=languages,
                files=files,
                avg_functions_per_file=avg_functions_per_file,
                avg_algorithms_per_file=avg_algorithms_per_file,
                most_common_language=most_common_language,
                largest_files=largest_files,
            )

        # Create response data
        analysis_data = AnalysisData(
            repository_name=repo_name,
            file_counts=FileCounts(**scan_result.file_counts),
            directory_tree=scan_result.directory_tree,
            file_contents=scan_result.file_contents,
            total_characters=scan_result.total_characters,
            function_analysis=function_analysis,
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


@router.post("/analyze-and-save")
async def analyze_and_save_repository(request: AnalysisRequest):
    """Comprehensive endpoint: Analyze repository and save everything to database"""
    try:
        logger.info(
            f"Starting comprehensive analysis for repository: {request.github_url}"
        )

        # First, check if repository already exists
        existing_repo = await db_service.get_repository_by_url(request.github_url)

        if existing_repo:
            repo_id = existing_repo["id"]
            logger.info(f"Using existing repository: {repo_id}")
        else:
            # Create new repository
            repo_name = request.github_url.split("/")[-1]
            new_repo = await db_service.create_repository(
                name=repo_name, github_url=request.github_url
            )
            if not new_repo:
                raise HTTPException(
                    status_code=500, detail="Failed to create repository"
                )
            repo_id = new_repo["id"]
            logger.info(f"Created new repository: {repo_id}")

        # Clone and analyze repository
        repo_path, repo_name = await repository_service.clone_repository(
            request.github_url
        )
        logger.info(f"Repository cloned successfully: {repo_name}")

        try:
            # Scan repository
            scan_result = file_scanner.scan_repository(repo_path)
            logger.info(
                f"Scan completed. Total files: {scan_result.file_counts['total']}, Characters: {scan_result.total_characters}"
            )

            # Update repository with scan results
            await db_service.update_repository(
                repo_id=repo_id,
                directory_tree=scan_result.directory_tree,
                file_contents=scan_result.file_contents,
                total_characters=scan_result.total_characters,
            )

            # Create analysis session
            total_functions = (
                scan_result.function_analysis.total_functions
                if scan_result.function_analysis
                else 0
            )
            total_algorithms = (
                scan_result.function_analysis.total_algorithms
                if scan_result.function_analysis
                else 0
            )
            total_files = (
                scan_result.function_analysis.total_files
                if scan_result.function_analysis
                else len(scan_result.file_paths)
            )

            session = await db_service.create_analysis_session(
                repository_id=repo_id,
                total_functions=total_functions,
                total_algorithms=total_algorithms,
                total_analyzed_files=total_files,
                avg_functions_per_file=(
                    total_functions / total_files if total_files > 0 else 0.0
                ),
                avg_algorithms_per_file=(
                    total_algorithms / total_files if total_files > 0 else 0.0
                ),
                most_common_language=(
                    max(scan_result.file_counts.items(), key=lambda x: x[1])[0]
                    if scan_result.file_counts
                    else None
                ),
            )

            if not session:
                raise HTTPException(
                    status_code=500, detail="Failed to create analysis session"
                )

            session_id = session["id"]

            # Save file counts
            javascript_count = scan_result.file_counts.get(
                "javascript", 0
            ) + scan_result.file_counts.get("js", 0)
            python_count = scan_result.file_counts.get(
                "python", 0
            ) + scan_result.file_counts.get("py", 0)
            typescript_count = scan_result.file_counts.get(
                "typescript", 0
            ) + scan_result.file_counts.get("ts", 0)
            total_count = sum(scan_result.file_counts.values())

            await db_service.create_file_counts(
                repository_id=repo_id,
                javascript=javascript_count,
                python=python_count,
                typescript=typescript_count,
                total=total_count,
            )

            # Save detailed analysis if available
            if scan_result.function_analysis:
                fa = scan_result.function_analysis

                # Save language stats
                for lang, stats in fa.languages.items():
                    await db_service.create_language_stats(
                        analysis_session_id=session_id,
                        language=lang,
                        files=stats.get("files", 0),
                        functions=stats.get("functions", 0),
                        algorithms=stats.get("algorithms", 0),
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
                        algorithm_breakdown=file_data.algorithm_breakdown,
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
                                code=function.code if function.code else "",
                                is_algorithm=function.is_algorithm,
                                algorithm_score=function.algorithm_score,
                                classification_reason=function.classification_reason,
                            )

            # Prepare response data (same as original analyze endpoint)
            function_analysis = None
            if scan_result.function_analysis:
                fa = scan_result.function_analysis

                # Convert LanguageStats
                languages = {}
                for lang, stats in fa.languages.items():
                    languages[lang] = LanguageStats(
                        files=stats["files"],
                        functions=stats["functions"],
                        algorithms=stats.get("algorithms", 0),
                    )

                # Convert FileAnalysis
                files = []
                for file_data in fa.files:
                    functions = []
                    for func in file_data.functions:
                        functions.append(
                            FunctionInfo(
                                name=func.name,
                                type=func.type,
                                start_line=func.start_line,
                                end_line=func.end_line,
                                line_count=func.line_count,
                                code=func.code,
                                is_algorithm=func.is_algorithm,
                                algorithm_score=func.algorithm_score,
                                classification_reason=func.classification_reason,
                            )
                        )

                    files.append(
                        FileAnalysis(
                            path=file_data.path,
                            language=file_data.language,
                            function_count=file_data.function_count,
                            algorithm_count=file_data.algorithm_count,
                            functions=functions,
                            breakdown=file_data.breakdown,
                            algorithm_breakdown=file_data.algorithm_breakdown,
                        )
                    )

                avg_functions_per_file = (
                    round(fa.total_functions / fa.total_files, 2)
                    if fa.total_files > 0
                    else 0
                )
                avg_algorithms_per_file = (
                    round(fa.total_algorithms / fa.total_files, 2)
                    if fa.total_files > 0
                    else 0
                )

                most_common_language = None
                if fa.languages:
                    most_common_language = max(
                        fa.languages.items(), key=lambda x: x[1]["functions"]
                    )[0]

                largest_files = []
                sorted_files = sorted(
                    fa.files, key=lambda x: x.function_count, reverse=True
                )[:5]
                for file_data in sorted_files:
                    largest_functions = []
                    for func in file_data.functions:
                        largest_functions.append(
                            FunctionInfo(
                                name=func.name,
                                type=func.type,
                                start_line=func.start_line,
                                end_line=func.end_line,
                                line_count=func.line_count,
                                code=func.code,
                                is_algorithm=func.is_algorithm,
                                algorithm_score=func.algorithm_score,
                                classification_reason=func.classification_reason,
                            )
                        )

                    largest_files.append(
                        FileAnalysis(
                            path=file_data.path,
                            language=file_data.language,
                            function_count=file_data.function_count,
                            algorithm_count=file_data.algorithm_count,
                            functions=largest_functions,
                            breakdown=file_data.breakdown,
                            algorithm_breakdown=file_data.algorithm_breakdown,
                        )
                    )

                function_analysis = FunctionAnalysis(
                    total_functions=fa.total_functions,
                    total_algorithms=fa.total_algorithms,
                    total_analyzed_files=fa.total_files,
                    languages=languages,
                    files=files,
                    avg_functions_per_file=avg_functions_per_file,
                    avg_algorithms_per_file=avg_algorithms_per_file,
                    most_common_language=most_common_language,
                    largest_files=largest_files,
                )

            # Create response data
            analysis_data = AnalysisData(
                repository_name=repo_name,
                file_counts=FileCounts(**scan_result.file_counts),
                directory_tree=scan_result.directory_tree,
                file_contents=scan_result.file_contents,
                total_characters=scan_result.total_characters,
                function_analysis=function_analysis,
            )

            logger.info(
                f"Comprehensive analysis completed and saved for repository: {repo_id}"
            )

            return {
                "success": True,
                "message": "Repository analyzed and saved to database successfully",
                "repository_id": repo_id,
                "analysis_session_id": session_id,
                "data": analysis_data,
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
        logger.error(f"Comprehensive analysis failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Comprehensive analysis failed: {str(e)}"
        )
