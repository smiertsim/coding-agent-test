"""Main MCP server implementation for GitLab integration."""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import unquote, urlparse

import click
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)
from gitlab.exceptions import GitlabError

from .config import GitLabConfig, load_config
from .gitlab_client import GitLabClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global client instance
gitlab_client: Optional[GitLabClient] = None


def create_app(config: GitLabConfig) -> Server:
    """Create the MCP server application."""
    global gitlab_client
    
    # Initialize GitLab client
    gitlab_client = GitLabClient(config)
    
    # Test authentication
    auth_result = gitlab_client.authenticate()
    if not auth_result["authenticated"]:
        raise RuntimeError(f"GitLab authentication failed: {auth_result.get('error', 'Unknown error')}")
    
    logger.info(f"Authenticated as: {auth_result['user']['username']}")
    
    # Create MCP server
    server = Server("gitlab-mcp-server")
    
    @server.list_resources()
    async def handle_list_resources() -> List[Resource]:
        """List available GitLab resources."""
        return [
            Resource(
                uri="gitlab://projects",
                name="GitLab Projects",
                description="Search and browse GitLab projects",
                mimeType="application/json",
            ),
            Resource(
                uri="gitlab://user",
                name="Current User",
                description="Information about the authenticated user",
                mimeType="application/json",
            ),
        ]
    
    @server.read_resource()
    async def handle_read_resource(uri: str) -> str:
        """Read a GitLab resource."""
        if not gitlab_client:
            raise RuntimeError("GitLab client not initialized")
        
        try:
            parsed = urlparse(uri)
            path_parts = [p for p in parsed.path.split("/") if p]
            
            if uri == "gitlab://projects":
                # List projects
                projects = gitlab_client.search_projects(limit=20)
                return json.dumps(projects, indent=2)
            
            elif uri == "gitlab://user":
                # Get user info
                auth_result = gitlab_client.authenticate()
                return json.dumps(auth_result["user"], indent=2)
            
            elif path_parts[0] == "project" and len(path_parts) >= 2:
                project_id = int(path_parts[1])
                
                if len(path_parts) == 2:
                    # Get project details
                    project = gitlab_client.get_project(project_id)
                    return json.dumps(project, indent=2)
                
                elif path_parts[2] == "issues":
                    # Get project issues
                    issues = gitlab_client.get_project_issues(project_id)
                    return json.dumps(issues, indent=2)
                
                elif path_parts[2] == "merge_requests":
                    # Get project merge requests
                    mrs = gitlab_client.get_project_merge_requests(project_id)
                    return json.dumps(mrs, indent=2)
                
                elif path_parts[2] == "repository":
                    if len(path_parts) >= 4 and path_parts[3] == "tree":
                        # Get repository tree
                        tree_path = "/".join(path_parts[4:]) if len(path_parts) > 4 else ""
                        tree = gitlab_client.list_repository_tree(
                            project_id, 
                            path=unquote(tree_path)
                        )
                        return json.dumps(tree, indent=2)
                    
                    elif len(path_parts) >= 5 and path_parts[3] == "file":
                        # Get file content
                        file_path = "/".join(path_parts[4:])
                        file_content = gitlab_client.get_file_content(
                            project_id,
                            unquote(file_path)
                        )
                        return json.dumps(file_content, indent=2)
            
            raise ValueError(f"Unknown resource URI: {uri}")
        
        except (GitlabError, ValueError) as e:
            logger.error(f"Error reading resource {uri}: {e}")
            return json.dumps({"error": str(e)}, indent=2)
    
    @server.list_tools()
    async def handle_list_tools() -> List[Tool]:
        """List available GitLab tools."""
        return [
            Tool(
                name="search_projects",
                description="Search for GitLab projects",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query for projects",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results (default: 20)",
                            "default": 20,
                        },
                    },
                },
            ),
            Tool(
                name="get_project_info",
                description="Get detailed information about a specific project",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                    },
                    "required": ["project_id"],
                },
            ),
            Tool(
                name="get_project_issues",
                description="Get issues for a specific project",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                        "state": {
                            "type": "string",
                            "description": "Issue state (opened, closed, all)",
                            "default": "opened",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results",
                            "default": 20,
                        },
                    },
                    "required": ["project_id"],
                },
            ),
            Tool(
                name="get_merge_requests",
                description="Get merge requests for a specific project",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                        "state": {
                            "type": "string",
                            "description": "MR state (opened, closed, merged, all)",
                            "default": "opened",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results",
                            "default": 20,
                        },
                    },
                    "required": ["project_id"],
                },
            ),
            Tool(
                name="get_file_content",
                description="Get content of a specific file from a repository",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                        "file_path": {
                            "type": "string",
                            "description": "Path to the file in the repository",
                        },
                        "ref": {
                            "type": "string",
                            "description": "Git reference (branch, tag, commit)",
                            "default": "main",
                        },
                    },
                    "required": ["project_id", "file_path"],
                },
            ),
            Tool(
                name="list_commits",
                description="List commits for a project repository",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                        "ref_name": {
                            "type": "string",
                            "description": "Branch or tag name",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results",
                            "default": 10,
                        },
                    },
                    "required": ["project_id"],
                },
            ),
            Tool(
                name="list_repository_tree",
                description="List files and directories in a repository",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {
                            "type": "integer",
                            "description": "GitLab project ID",
                        },
                        "path": {
                            "type": "string",
                            "description": "Directory path to list",
                            "default": "",
                        },
                        "ref": {
                            "type": "string",
                            "description": "Git reference (branch, tag, commit)",
                            "default": "main",
                        },
                        "recursive": {
                            "type": "boolean",
                            "description": "Include subdirectories recursively",
                            "default": False,
                        },
                    },
                    "required": ["project_id"],
                },
            ),
        ]
    
    @server.call_tool()
    async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """Handle tool calls."""
        if not gitlab_client:
            raise RuntimeError("GitLab client not initialized")
        
        try:
            if name == "search_projects":
                query = arguments.get("query")
                limit = arguments.get("limit", 20)
                projects = gitlab_client.search_projects(search=query, limit=limit)
                return [TextContent(type="text", text=json.dumps(projects, indent=2))]
            
            elif name == "get_project_info":
                project_id = arguments["project_id"]
                project = gitlab_client.get_project(project_id)
                return [TextContent(type="text", text=json.dumps(project, indent=2))]
            
            elif name == "get_project_issues":
                project_id = arguments["project_id"]
                state = arguments.get("state", "opened")
                limit = arguments.get("limit", 20)
                issues = gitlab_client.get_project_issues(project_id, state=state, limit=limit)
                return [TextContent(type="text", text=json.dumps(issues, indent=2))]
            
            elif name == "get_merge_requests":
                project_id = arguments["project_id"]
                state = arguments.get("state", "opened")
                limit = arguments.get("limit", 20)
                mrs = gitlab_client.get_project_merge_requests(project_id, state=state, limit=limit)
                return [TextContent(type="text", text=json.dumps(mrs, indent=2))]
            
            elif name == "get_file_content":
                project_id = arguments["project_id"]
                file_path = arguments["file_path"]
                ref = arguments.get("ref", "main")
                file_content = gitlab_client.get_file_content(project_id, file_path, ref)
                return [TextContent(type="text", text=json.dumps(file_content, indent=2))]
            
            elif name == "list_commits":
                project_id = arguments["project_id"]
                ref_name = arguments.get("ref_name")
                limit = arguments.get("limit", 10)
                commits = gitlab_client.list_commits(project_id, ref_name=ref_name, limit=limit)
                return [TextContent(type="text", text=json.dumps(commits, indent=2))]
            
            elif name == "list_repository_tree":
                project_id = arguments["project_id"]
                path = arguments.get("path", "")
                ref = arguments.get("ref", "main")
                recursive = arguments.get("recursive", False)
                tree = gitlab_client.list_repository_tree(
                    project_id, path=path, ref=ref, recursive=recursive
                )
                return [TextContent(type="text", text=json.dumps(tree, indent=2))]
            
            else:
                raise ValueError(f"Unknown tool: {name}")
        
        except (GitlabError, ValueError) as e:
            logger.error(f"Error calling tool {name}: {e}")
            return [TextContent(type="text", text=json.dumps({"error": str(e)}, indent=2))]
    
    return server


@click.command()
@click.option(
    "--gitlab-token",
    help="GitLab API token (can also use GITLAB_TOKEN env var)",
)
@click.option(
    "--gitlab-url",
    default="https://gitlab.com",
    help="GitLab instance URL (default: https://gitlab.com)",
)
@click.option(
    "--config-file",
    type=click.Path(exists=True),
    help="Path to configuration file",
)
@click.option(
    "--host",
    default="localhost",
    help="Host to bind to (default: localhost)",
)
@click.option(
    "--port",
    default=8080,
    type=int,
    help="Port to bind to (default: 8080)",
)
@click.option(
    "--debug",
    is_flag=True,
    help="Enable debug logging",
)
def main(
    gitlab_token: Optional[str],
    gitlab_url: str,
    config_file: Optional[str],
    host: str,
    port: int,
    debug: bool,
) -> None:
    """GitLab MCP Server - Provides GitLab integration for MCP clients."""
    if debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Load configuration
        config = load_config(
            config_file=config_file,
            gitlab_token=gitlab_token,
            gitlab_url=gitlab_url,
        )
        
        # Create and run server
        server = create_app(config)
        
        # Run the server
        import asyncio
        from mcp.server.stdio import stdio_server
        
        async def run_server():
            async with stdio_server() as (read_stream, write_stream):
                await server.run(
                    read_stream,
                    write_stream,
                    InitializationOptions(
                        server_name="gitlab-mcp-server",
                        server_version="0.1.0",
                        capabilities=server.get_capabilities(
                            notification_options=None,
                            experimental_capabilities=None,
                        ),
                    ),
                )
        
        asyncio.run(run_server())
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise click.ClickException(str(e))


if __name__ == "__main__":
    main()