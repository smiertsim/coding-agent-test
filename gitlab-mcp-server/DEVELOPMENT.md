# GitLab MCP Server Development

## Development Setup

1. Install in development mode:
   ```bash
   pip install -e ".[dev]"
   ```

2. Run linting and formatting:
   ```bash
   black src/
   isort src/
   flake8 src/
   mypy src/
   ```

3. Run tests:
   ```bash
   pytest
   ```

## Testing with a GitLab Token

1. Get a GitLab token from your GitLab instance
2. Set environment variable:
   ```bash
   export GITLAB_TOKEN="your-token-here"
   ```
3. Run the server:
   ```bash
   gitlab-mcp-server
   ```

## MCP Protocol Implementation

This server implements the Model Context Protocol (MCP) specification:

- **Resources**: Static GitLab data accessible via URIs
- **Tools**: Dynamic operations that can be called with parameters
- **Prompts**: Template-based interactions (not implemented yet)

### Available Resources

- `gitlab://projects` - List accessible projects
- `gitlab://user` - Current user information  
- `gitlab://project/{id}` - Project details
- `gitlab://project/{id}/issues` - Project issues
- `gitlab://project/{id}/merge_requests` - Project merge requests
- `gitlab://project/{id}/repository/tree/{path}` - Repository file tree
- `gitlab://project/{id}/repository/file/{path}` - File content

### Available Tools

- `search_projects` - Search GitLab projects
- `get_project_info` - Get project details
- `get_project_issues` - List project issues
- `get_merge_requests` - List merge requests
- `get_file_content` - Get file content
- `list_commits` - List repository commits
- `list_repository_tree` - List repository files/directories

## Architecture

```
gitlab-mcp-server/
├── src/gitlab_mcp_server/
│   ├── __init__.py          # Package initialization
│   ├── server.py            # Main MCP server implementation
│   ├── config.py            # Configuration management
│   ├── gitlab_client.py     # GitLab API wrapper
│   └── handlers/            # Resource/tool handlers (future)
├── pyproject.toml           # Project configuration
├── README.md               # User documentation
└── config.example.json    # Example configuration
```