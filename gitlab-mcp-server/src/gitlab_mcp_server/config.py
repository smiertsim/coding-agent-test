"""Configuration management for GitLab MCP Server."""

import json
import os
from typing import Optional
from pydantic import BaseModel, Field


class GitLabConfig(BaseModel):
    """Configuration for GitLab MCP Server."""
    
    gitlab_token: str = Field(..., description="GitLab API token")
    gitlab_url: str = Field(default="https://gitlab.com", description="GitLab instance URL")
    timeout: int = Field(default=30, description="Request timeout in seconds")
    max_results: int = Field(default=100, description="Maximum results per request")


def load_config(
    config_file: Optional[str] = None,
    gitlab_token: Optional[str] = None,
    gitlab_url: Optional[str] = None,
) -> GitLabConfig:
    """Load configuration from various sources."""
    config_data = {}
    
    # Start with defaults
    if gitlab_url:
        config_data["gitlab_url"] = gitlab_url
    
    # Load from config file if provided
    if config_file and os.path.exists(config_file):
        with open(config_file, "r") as f:
            file_config = json.load(f)
            config_data.update(file_config)
    
    # Override with environment variables
    if os.getenv("GITLAB_TOKEN"):
        config_data["gitlab_token"] = os.getenv("GITLAB_TOKEN")
    if os.getenv("GITLAB_URL"):
        config_data["gitlab_url"] = os.getenv("GITLAB_URL")
    if os.getenv("GITLAB_TIMEOUT"):
        config_data["timeout"] = int(os.getenv("GITLAB_TIMEOUT"))
    if os.getenv("GITLAB_MAX_RESULTS"):
        config_data["max_results"] = int(os.getenv("GITLAB_MAX_RESULTS"))
    
    # Override with explicit parameters
    if gitlab_token:
        config_data["gitlab_token"] = gitlab_token
    if gitlab_url:
        config_data["gitlab_url"] = gitlab_url
    
    # Validate required fields
    if "gitlab_token" not in config_data:
        raise ValueError(
            "GitLab token is required. Set GITLAB_TOKEN environment variable, "
            "provide --gitlab-token argument, or include in config file."
        )
    
    return GitLabConfig(**config_data)