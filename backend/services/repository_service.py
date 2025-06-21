import tempfile
import shutil
import os
from typing import Optional, Tuple
from git import Repo, GitCommandError
import re


class RepositoryService:
    def __init__(self):
        self.temp_dir: Optional[str] = None

    def _validate_github_url(self, url: str) -> bool:
        """Validate if the URL is a proper GitHub repository URL"""
        github_pattern = r"^https://github\.com/[\w\-\.]+/[\w\-\.]+/?$"
        return bool(re.match(github_pattern, url))

    def _extract_repo_name(self, url: str) -> str:
        """Extract repository name from GitHub URL"""
        # Remove trailing slash and .git if present
        url = url.rstrip("/").replace(".git", "")
        # Extract the last part of the path
        return url.split("/")[-1]

    async def clone_repository(self, github_url: str) -> Tuple[str, str]:
        """
        Clone a GitHub repository to a temporary directory

        Args:
            github_url: The GitHub repository URL

        Returns:
            Tuple of (temp_directory_path, repository_name)

        Raises:
            ValueError: If URL is invalid
            GitCommandError: If cloning fails
        """
        if not self._validate_github_url(github_url):
            raise ValueError("Invalid GitHub repository URL")

        repo_name = self._extract_repo_name(github_url)

        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp(prefix=f"repo_analysis_{repo_name}_")
        clone_path = os.path.join(self.temp_dir, repo_name)

        try:
            # Clone the repository
            Repo.clone_from(github_url, clone_path, depth=1)
            return clone_path, repo_name
        except GitCommandError as e:
            # Clean up on failure
            self.cleanup()
            if "not found" in str(e).lower() or "does not exist" in str(e).lower():
                raise ValueError("Repository not found or is private")
            else:
                raise ValueError(f"Failed to clone repository: {str(e)}")

    def cleanup(self) -> None:
        """Clean up temporary directory"""
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
                self.temp_dir = None
            except OSError as e:
                print(f"Warning: Failed to clean up temporary directory: {e}")

    def __del__(self):
        """Ensure cleanup on object destruction"""
        self.cleanup()
