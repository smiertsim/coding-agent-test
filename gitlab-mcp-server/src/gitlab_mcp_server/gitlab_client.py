"""GitLab API client wrapper."""

import logging
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import gitlab
from gitlab.exceptions import GitlabError

from .config import GitLabConfig

logger = logging.getLogger(__name__)


class GitLabClient:
    """Wrapper around python-gitlab for MCP server."""
    
    def __init__(self, config: GitLabConfig):
        """Initialize GitLab client."""
        self.config = config
        self.gl = gitlab.Gitlab(
            url=config.gitlab_url,
            private_token=config.gitlab_token,
            timeout=config.timeout,
        )
        
    def authenticate(self) -> Dict[str, Any]:
        """Test authentication and return user info."""
        try:
            user = self.gl.auth()
            return {
                "authenticated": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "name": user.name,
                    "email": getattr(user, "email", None),
                }
            }
        except GitlabError as e:
            logger.error(f"Authentication failed: {e}")
            return {"authenticated": False, "error": str(e)}
    
    def search_projects(
        self, 
        search: Optional[str] = None, 
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Search for projects."""
        try:
            projects = self.gl.projects.list(
                search=search,
                all=False,
                per_page=limit or self.config.max_results,
            )
            
            return [
                {
                    "id": project.id,
                    "name": project.name,
                    "path": project.path,
                    "path_with_namespace": project.path_with_namespace,
                    "description": getattr(project, "description", None),
                    "web_url": project.web_url,
                    "default_branch": getattr(project, "default_branch", None),
                    "visibility": getattr(project, "visibility", None),
                    "created_at": getattr(project, "created_at", None),
                    "last_activity_at": getattr(project, "last_activity_at", None),
                }
                for project in projects
            ]
        except GitlabError as e:
            logger.error(f"Error searching projects: {e}")
            raise
    
    def get_project(self, project_id: int) -> Dict[str, Any]:
        """Get project details."""
        try:
            project = self.gl.projects.get(project_id)
            return {
                "id": project.id,
                "name": project.name,
                "path": project.path,
                "path_with_namespace": project.path_with_namespace,
                "description": getattr(project, "description", None),
                "web_url": project.web_url,
                "default_branch": getattr(project, "default_branch", None),
                "visibility": getattr(project, "visibility", None),
                "created_at": getattr(project, "created_at", None),
                "last_activity_at": getattr(project, "last_activity_at", None),
                "star_count": getattr(project, "star_count", 0),
                "forks_count": getattr(project, "forks_count", 0),
                "open_issues_count": getattr(project, "open_issues_count", 0),
            }
        except GitlabError as e:
            logger.error(f"Error getting project {project_id}: {e}")
            raise
    
    def get_project_issues(
        self, 
        project_id: int, 
        state: str = "opened",
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get project issues."""
        try:
            project = self.gl.projects.get(project_id)
            issues = project.issues.list(
                state=state,
                all=False,
                per_page=limit or self.config.max_results,
            )
            
            return [
                {
                    "id": issue.id,
                    "iid": issue.iid,
                    "title": issue.title,
                    "description": getattr(issue, "description", None),
                    "state": issue.state,
                    "web_url": issue.web_url,
                    "created_at": issue.created_at,
                    "updated_at": issue.updated_at,
                    "labels": getattr(issue, "labels", []),
                    "author": {
                        "id": issue.author["id"],
                        "username": issue.author["username"],
                        "name": issue.author["name"],
                    },
                    "assignees": [
                        {
                            "id": assignee["id"],
                            "username": assignee["username"], 
                            "name": assignee["name"],
                        }
                        for assignee in getattr(issue, "assignees", [])
                    ],
                }
                for issue in issues
            ]
        except GitlabError as e:
            logger.error(f"Error getting project {project_id} issues: {e}")
            raise
    
    def get_project_merge_requests(
        self,
        project_id: int,
        state: str = "opened",
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get project merge requests."""
        try:
            project = self.gl.projects.get(project_id)
            mrs = project.mergerequests.list(
                state=state,
                all=False,
                per_page=limit or self.config.max_results,
            )
            
            return [
                {
                    "id": mr.id,
                    "iid": mr.iid,
                    "title": mr.title,
                    "description": getattr(mr, "description", None),
                    "state": mr.state,
                    "web_url": mr.web_url,
                    "source_branch": mr.source_branch,
                    "target_branch": mr.target_branch,
                    "created_at": mr.created_at,
                    "updated_at": mr.updated_at,
                    "labels": getattr(mr, "labels", []),
                    "author": {
                        "id": mr.author["id"],
                        "username": mr.author["username"],
                        "name": mr.author["name"],
                    },
                    "assignees": [
                        {
                            "id": assignee["id"],
                            "username": assignee["username"],
                            "name": assignee["name"],
                        }
                        for assignee in getattr(mr, "assignees", [])
                    ],
                }
                for mr in mrs
            ]
        except GitlabError as e:
            logger.error(f"Error getting project {project_id} merge requests: {e}")
            raise
    
    def get_file_content(
        self, 
        project_id: int, 
        file_path: str, 
        ref: str = "main"
    ) -> Dict[str, Any]:
        """Get file content from repository."""
        try:
            project = self.gl.projects.get(project_id)
            file_info = project.files.get(file_path=file_path, ref=ref)
            
            return {
                "file_name": file_info.file_name,
                "file_path": file_info.file_path,
                "size": file_info.size,
                "encoding": file_info.encoding,
                "content": file_info.decode().decode("utf-8"),
                "ref": ref,
                "blob_id": getattr(file_info, "blob_id", None),
                "commit_id": getattr(file_info, "commit_id", None),
                "last_commit_id": getattr(file_info, "last_commit_id", None),
            }
        except GitlabError as e:
            logger.error(f"Error getting file {file_path} from project {project_id}: {e}")
            raise
    
    def list_repository_tree(
        self,
        project_id: int,
        path: str = "",
        ref: str = "main",
        recursive: bool = False
    ) -> List[Dict[str, Any]]:
        """List repository tree."""
        try:
            project = self.gl.projects.get(project_id)
            tree = project.repository_tree(
                path=path,
                ref=ref,
                recursive=recursive,
                all=False,
                per_page=self.config.max_results,
            )
            
            return [
                {
                    "id": item["id"],
                    "name": item["name"],
                    "type": item["type"],
                    "path": item["path"],
                    "mode": item["mode"],
                }
                for item in tree
            ]
        except GitlabError as e:
            logger.error(f"Error listing repository tree for project {project_id}: {e}")
            raise
    
    def list_commits(
        self,
        project_id: int,
        ref_name: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """List repository commits."""
        try:
            project = self.gl.projects.get(project_id)
            commits = project.commits.list(
                ref_name=ref_name,
                all=False,
                per_page=limit or min(20, self.config.max_results),
            )
            
            return [
                {
                    "id": commit.id,
                    "short_id": commit.short_id,
                    "title": commit.title,
                    "message": commit.message,
                    "author_name": commit.author_name,
                    "author_email": commit.author_email,
                    "authored_date": commit.authored_date,
                    "committer_name": commit.committer_name,
                    "committer_email": commit.committer_email,
                    "committed_date": commit.committed_date,
                    "web_url": getattr(commit, "web_url", None),
                }
                for commit in commits
            ]
        except GitlabError as e:
            logger.error(f"Error listing commits for project {project_id}: {e}")
            raise