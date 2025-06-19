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
    code: Optional[str] = None


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

            # Define comprehensive language-specific queries
            self.queries = {}
            
            # Python queries - comprehensive function detection
            python_queries = [
                # Function definitions
                "(function_definition name: (identifier) @name) @function",
                # Method definitions within classes  
                "(class_definition body: (block [(function_definition name: (identifier) @name) @method]))",
                # Async function definitions
                "(async_function_definition name: (identifier) @name) @async_function",
                # Lambda functions (limited support)
                "(lambda) @lambda"
            ]
            
            self.queries['python'] = {}
            for i, query_str in enumerate(python_queries):
                try:
                    self.queries['python'][f'query_{i}'] = self.languages['python'].query(query_str)
                except Exception as e:
                    print(f"Failed to create Python query {i}: {e}")
            
            # JavaScript/TypeScript queries - comprehensive function detection
            js_queries = [
                # Function declarations
                "(function_declaration name: (identifier) @name) @function",
                # Function expressions
                "(function_expression name: (identifier)? @name) @function_expr",
                # Arrow functions with identifier
                "(variable_declarator name: (identifier) @name value: (arrow_function)) @arrow_function",
                # Method definitions
                "(method_definition name: (property_identifier) @name) @method",
                # Async functions
                "(function_declaration name: (identifier) @name) @async_function",
                # Class declarations
                "(class_declaration name: (identifier) @name) @class",
                # Object method shorthand
                "(pair key: (property_identifier) @name value: (function_expression)) @object_method"
            ]
            
            self.queries['javascript'] = {}
            for i, query_str in enumerate(js_queries):
                try:
                    self.queries['javascript'][f'query_{i}'] = self.languages['javascript'].query(query_str)
                except Exception as e:
                    print(f"Failed to create JavaScript query {i}: {e}")

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
            processed_positions = set()  # Avoid duplicates
            
            # Execute each query for this language
            for query_name, query in self.queries[language].items():
                try:
                    captures = query.captures(tree.root_node)
                    
                    # Group captures by node to match names with functions
                    function_nodes = []
                    name_nodes = {}
                    
                    # Separate function nodes and name nodes
                    for capture_name, nodes in captures.items():
                        for node in nodes:
                            node_key = (node.start_point[0], node.end_point[0])
                            
                            if capture_name == 'name':
                                # Store name nodes for lookup
                                name_nodes[node_key] = node.text.decode('utf-8')
                            elif capture_name in ['function', 'method', 'class', 'function_expr', 
                                                'arrow_function', 'async_function', 'lambda', 'object_method']:
                                # Skip if we've already processed this exact position
                                if node_key not in processed_positions:
                                    function_nodes.append((node, capture_name))
                                    processed_positions.add(node_key)
                    
                    # Match function nodes with their names
                    for node, func_type in function_nodes:
                        name = "anonymous"
                        
                        # Look for a name node that's contained within this function node
                        for name_pos, name_text in name_nodes.items():
                            name_start, name_end = name_pos
                            # Check if name is within function boundaries
                            if (name_start >= node.start_point[0] and 
                                name_end <= node.end_point[0] and
                                name_start <= node.start_point[0] + 3):  # Name should be near start
                                name = name_text
                                break
                        
                        # For some function types, try to extract name from node text
                        if name == "anonymous":
                            node_text = node.text.decode('utf-8', errors='ignore')
                            if language == 'python':
                                # Extract from "def function_name" or "class ClassName"
                                import re
                                if 'def ' in node_text:
                                    match = re.search(r'def\s+(\w+)', node_text)
                                    if match:
                                        name = match.group(1)
                                elif 'class ' in node_text:
                                    match = re.search(r'class\s+(\w+)', node_text)
                                    if match:
                                        name = match.group(1)
                            elif language == 'javascript':
                                # Extract from various JS function patterns
                                import re
                                patterns = [
                                    r'function\s+(\w+)',  # function declaration
                                    r'(\w+)\s*=\s*function',  # function expression
                                    r'(\w+)\s*=\s*\(',  # arrow function
                                    r'(\w+)\s*\(',  # method definition
                                    r'async\s+function\s+(\w+)',  # async function
                                ]
                                for pattern in patterns:
                                    match = re.search(pattern, node_text)
                                    if match:
                                        name = match.group(1)
                                        break
                        
                        # Create function info with precise boundaries
                        start_line = node.start_point[0] + 1
                        end_line = node.end_point[0] + 1
                        
                        # Ensure end_line is at least start_line for single-line functions
                        if end_line < start_line:
                            end_line = start_line
                        
                        functions.append(FunctionInfo(
                            name=name,
                            type=func_type,
                            start_line=start_line,
                            end_line=end_line,
                            line_count=end_line - start_line + 1
                        ))
                
                except Exception as e:
                    print(f"Error processing query {query_name}: {e}")
                    continue
            
            # Remove duplicates based on name and position
            unique_functions = []
            seen = set()
            for func in functions:
                key = (func.name, func.start_line, func.end_line)
                if key not in seen:
                    seen.add(key)
                    unique_functions.append(func)
            
            # Sort by start line for consistent ordering
            unique_functions.sort(key=lambda f: f.start_line)
            
            return unique_functions

        except Exception as e:
            print(f"Error parsing {language} code: {e}")
            return []

    def _extract_function_code(self, source_code: str, start_line: int, end_line: int) -> str:
        """Extract function code by line numbers"""
        try:
            lines = source_code.split('\n')
            # Convert to 0-based indexing and ensure bounds
            start_idx = max(0, start_line - 1)
            end_idx = min(len(lines), end_line)
            
            function_lines = lines[start_idx:end_idx]
            
            # Clean up the function code
            if function_lines:
                # Remove leading empty lines
                while function_lines and function_lines[0].strip() == '':
                    function_lines.pop(0)
                
                # Remove trailing empty lines
                while function_lines and function_lines[-1].strip() == '':
                    function_lines.pop()
                
                return '\n'.join(function_lines)
            
            return ""
        except Exception as e:
            print(f"Error extracting function code: {e}")
            return ""

    def analyze_file(self, file_path: str, content: Optional[str] = None, include_code: bool = False) -> Optional[FileAnalysis]:
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
            
            # Optionally include function code
            if include_code:
                for func in functions:
                    func.code = self._extract_function_code(content, func.start_line, func.end_line)
            
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
                         exclude_patterns: Optional[List[str]] = None,
                         include_code: bool = False) -> FunctionAnalysisResult:
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
                    analysis = self.analyze_file(str(file_path), include_code=include_code)
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
    
 