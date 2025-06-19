import tree_sitter_python as tspython
import tree_sitter_javascript as tsjs
import tree_sitter_typescript as tsts
from tree_sitter import Language, Parser, Query
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class FunctionInfo:
    name: str
    type: str
    start_line: int
    end_line: int
    line_count: int


@dataclass
class FileAnalysis:
    path: str
    language: str
    function_count: int
    functions: List[FunctionInfo]
    breakdown: Dict[str, int]


@dataclass
class FunctionAnalysisResult:
    total_functions: int
    total_files: int
    languages: Dict[str, Dict[str, int]]  # language -> {files: int, functions: int}
    files: List[FileAnalysis]


class FunctionCounter:
    def __init__(self):
        self.languages = {}
        self.queries = {}
        self._setup_languages()

    def _setup_languages(self):
        """Initialize tree-sitter languages and queries"""
        try:
            # Initialize languages
            self.languages['python'] = Language(tspython.language())
            self.languages['javascript'] = Language(tsjs.language())
            # self.languages['typescript'] = Language(tsts.language_typescript())

            # Define language-specific queries as separate query objects
            self.queries = {}
            
            # Python queries
            self.queries['python'] = {
                'functions': self.languages['python'].query("(function_definition name: (identifier) @name) @function"),
                'classes': self.languages['python'].query("(class_definition name: (identifier) @name) @class")
            }
            
            # JavaScript queries  
            self.queries['javascript'] = {
                'functions': self.languages['javascript'].query("(function_declaration name: (identifier) @name) @function"),
                'classes': self.languages['javascript'].query("(class_declaration name: (identifier) @name) @class")
            }
            
            # TypeScript queries - commented out for now
            # print("Creating TypeScript queries...")
            # self.queries['typescript'] = {
            #     'functions': self.languages['typescript'].query("(function_declaration name: (identifier) @name) @function"),
            #     'classes': self.languages['typescript'].query("(class_declaration name: (identifier) @name) @class")
            # }
            # print("TypeScript queries created successfully")

        except Exception as e:
            print(f"Warning: Failed to initialize tree-sitter: {e}")
            self.languages = {}
            self.queries = {}

    def is_available(self) -> bool:
        """Check if tree-sitter is properly initialized"""
        return len(self.languages) > 0

    def _get_language_from_extension(self, file_path: str) -> Optional[str]:
        """Determine language from file extension"""
        ext = Path(file_path).suffix.lower()
        if ext == '.py':
            return 'python'
        elif ext in ['.js', '.jsx']:
            return 'javascript'
        # TypeScript temporarily disabled
        # elif ext in ['.ts', '.tsx']:
        #     return 'typescript'
        return None

    def _extract_functions(self, source_code: str, language: str) -> List[FunctionInfo]:
        """Extract function information using tree-sitter"""
        if language not in self.languages or language not in self.queries:
            return []

        try:
            # Parse the source code using the new API
            parser = Parser(self.languages[language])
            tree = parser.parse(bytes(source_code, 'utf8'))
            
            functions = []
            
            # Execute each query type for this language
            for query_type, query in self.queries[language].items():
                captures = query.captures(tree.root_node)
                
                # Process captures - captures is now a dictionary
                for capture_name, nodes in captures.items():
                    for node in nodes:
                        if capture_name in ['function', 'method', 'class']:
                            # Try to find the name from the same query
                            name = "anonymous"
                            if 'name' in captures:
                                # Find the corresponding name node
                                for name_node in captures['name']:
                                    # Check if this name node is a child of our function node
                                    if (name_node.start_point[0] >= node.start_point[0] and 
                                        name_node.end_point[0] <= node.end_point[0]):
                                        name = name_node.text.decode('utf-8')
                                        break
                            
                            functions.append(FunctionInfo(
                                name=name,
                                type=capture_name,
                                start_line=node.start_point[0] + 1,  # Convert to 1-based line numbers
                                end_line=node.end_point[0] + 1,
                                line_count=node.end_point[0] - node.start_point[0] + 1
                            ))
            
            return functions

        except Exception as e:
            print(f"Error parsing {language} code: {e}")
            return []

    def analyze_file(self, file_path: str, content: Optional[str] = None) -> Optional[FileAnalysis]:
        """Analyze a single file for functions"""
        if not self.is_available():
            return None
            
        language = self._get_language_from_extension(file_path)
        if not language:
            return None

        try:
            if content is None:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            
            functions = self._extract_functions(content, language)
            
            # Create breakdown by function type
            breakdown = {}
            for func in functions:
                breakdown[func.type] = breakdown.get(func.type, 0) + 1
            
            return FileAnalysis(
                path=file_path,
                language=language,
                function_count=len(functions),
                functions=functions,
                breakdown=breakdown
            )
            
        except Exception as e:
            print(f"Error analyzing file {file_path}: {e}")
            return None

    def analyze_directory(self, directory_path: str, 
                         include_patterns: Optional[List[str]] = None,
                         exclude_patterns: Optional[List[str]] = None) -> FunctionAnalysisResult:
        """Analyze all supported files in a directory"""
        if not self.is_available():
            return FunctionAnalysisResult(0, 0, {}, [])

        include_patterns = include_patterns or ['*.py', '*.js', '*.jsx', '*.ts', '*.tsx']
        exclude_patterns = exclude_patterns or ['**/node_modules/**', '**/__pycache__/**', '**/.*/**']
        
        directory = Path(directory_path)
        files_analyzed = []
        total_functions = 0
        languages_stats = {}
        
        # Find all matching files
        for pattern in include_patterns:
            for file_path in directory.rglob(pattern):
                # Skip if matches exclude patterns
                if any(file_path.match(exclude) for exclude in exclude_patterns):
                    continue
                    
                if file_path.is_file():
                    analysis = self.analyze_file(str(file_path))
                    if analysis:
                        files_analyzed.append(analysis)
                        total_functions += analysis.function_count
                        
                        # Update language stats
                        lang = analysis.language
                        if lang not in languages_stats:
                            languages_stats[lang] = {'files': 0, 'functions': 0}
                        languages_stats[lang]['files'] += 1
                        languages_stats[lang]['functions'] += analysis.function_count
        
        return FunctionAnalysisResult(
            total_functions=total_functions,
            total_files=len(files_analyzed),
            languages=languages_stats,
            files=files_analyzed
        )
    
 