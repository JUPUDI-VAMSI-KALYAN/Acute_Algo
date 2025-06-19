import os
from pathlib import Path
from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from .function_counter import FunctionCounter, FunctionAnalysisResult


@dataclass
class ScanResult:
    file_paths: List[str]
    file_counts: Dict[str, int]
    directory_tree: str
    file_contents: str
    total_characters: int
    function_analysis: Optional[FunctionAnalysisResult] = None


class FileScanner:
    def __init__(self):
        # File extensions to scan
        self.target_extensions = {'.js', '.py', '.ts', '.jsx', '.tsx'}
        
        # Directories to ignore
        self.ignore_dirs = {
            'node_modules', '.git', '__pycache__', 'dist', 'build', 
            '.next', 'coverage', '.pytest_cache', 'venv', 'env',
            '.env', 'logs', 'tmp', 'temp', '.cache', '.idea', '.vscode'
        }
        
        # Initialize function counter
        self.function_counter = FunctionCounter()
    
    def scan_repository(self, repo_path: str) -> ScanResult:
        """Scan repository for target files and analyze functions"""
        print(f"Scanning repository: {repo_path}")
        
        # Find all target files
        file_paths = self._find_target_files(repo_path)
        
        # Count files by extension
        file_counts = self._count_files_by_extension(file_paths)
        
        # Generate directory tree
        directory_tree = self._generate_directory_tree(repo_path)
        
        # Read all file contents
        file_contents, total_characters = self._read_all_files(file_paths)
        
        # Analyze functions if Tree-sitter is available
        function_analysis = None
        if self.function_counter.is_available():
            print("Analyzing functions with Tree-sitter...")
            function_analysis = self.function_counter.analyze_directory(repo_path)
            print(f"Function analysis completed: {function_analysis.total_functions} functions found")
        else:
            print("Tree-sitter not available, skipping function analysis")
        
        return ScanResult(
            file_paths=file_paths,
            file_counts=file_counts,
            directory_tree=directory_tree,
            file_contents=file_contents,
            total_characters=total_characters,
            function_analysis=function_analysis
        )
    
    def _find_target_files(self, repo_path: str) -> List[str]:
        """Find all target files in the repository"""
        target_files = []
        repo_path_obj = Path(repo_path)
        
        for root, dirs, files in os.walk(repo_path):
            # Remove ignored directories from dirs list to prevent walking into them
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                file_path = Path(root) / file
                
                # Check if file has target extension
                if file_path.suffix in self.target_extensions:
                    target_files.append(str(file_path))
        
        return target_files
    
    def _count_files_by_extension(self, file_paths: List[str]) -> Dict[str, int]:
        """Count files by their extensions"""
        counts = {
            'javascript': 0,
            'python': 0,
            'typescript': 0,
            'total': 0
        }
        
        for file_path in file_paths:
            path_obj = Path(file_path)
            extension = path_obj.suffix
            
            if extension == '.py':
                counts['python'] += 1
            elif extension in ['.js', '.jsx']:
                counts['javascript'] += 1
            elif extension in ['.ts', '.tsx']:
                counts['typescript'] += 1
            
            counts['total'] += 1
        
        return counts
    
    def _generate_directory_tree(self, repo_path: str) -> str:
        """Generate a directory tree structure"""
        tree_lines = []
        repo_name = Path(repo_path).name
        tree_lines.append(f"{repo_name}/")
        
        def _add_directory_contents(current_path: Path, prefix: str = ""):
            try:
                # Get all items in current directory
                items = list(current_path.iterdir())
                # Filter out ignored directories and sort
                items = [item for item in items if item.name not in self.ignore_dirs]
                items.sort(key=lambda x: (x.is_file(), x.name.lower()))
                
                for i, item in enumerate(items):
                    is_last = i == len(items) - 1
                    current_prefix = "└── " if is_last else "├── "
                    tree_lines.append(f"{prefix}{current_prefix}{item.name}")
                    
                    # If it's a directory, recursively add its contents
                    if item.is_dir():
                        next_prefix = prefix + ("    " if is_last else "│   ")
                        _add_directory_contents(item, next_prefix)
                        
            except PermissionError:
                # Skip directories we can't read
                pass
        
        _add_directory_contents(Path(repo_path))
        return "\n".join(tree_lines)
    
    def _read_all_files(self, file_paths: List[str]) -> tuple[str, int]:
        """Read contents of all target files"""
        all_contents = []
        total_chars = 0
        
        for file_path in file_paths:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Create relative path for header
                path_obj = Path(file_path)
                relative_path = str(path_obj.name)  # Just filename for now
                
                # Add file header and content
                file_section = f"\n{'='*60}\n"
                file_section += f"FILE: {relative_path}\n"
                file_section += f"{'='*60}\n\n"
                file_section += content
                file_section += f"\n\n{'='*60}\n"
                
                all_contents.append(file_section)
                total_chars += len(content)
                
            except Exception as e:
                # Skip files that can't be read
                print(f"Warning: Could not read {file_path}: {e}")
                continue
        
        return "".join(all_contents), total_chars 