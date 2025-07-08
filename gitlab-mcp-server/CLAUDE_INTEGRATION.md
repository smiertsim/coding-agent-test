# Claude Desktop Integration Example

This example shows how to integrate the GitLab MCP Server with Claude Desktop.

## Prerequisites

1. **GitLab API Token**: Get a personal access token from your GitLab instance
   - Go to GitLab → Preferences → Access Tokens
   - Create token with scopes: `read_user`, `read_repository`, `read_api`

2. **GitLab MCP Server**: Install the server
   ```bash
   cd gitlab-mcp-server
   pip install -e .
   ```

## Claude Desktop Configuration

Add the following to your Claude Desktop MCP configuration file:

### Location of config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Configuration:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp-server",
      "env": {
        "GITLAB_TOKEN": "your-gitlab-token-here",
        "GITLAB_URL": "https://gitlab.com"
      }
    }
  }
}
```

### For self-hosted GitLab:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp-server",
      "env": {
        "GITLAB_TOKEN": "your-gitlab-token-here",
        "GITLAB_URL": "https://your-gitlab-instance.com"
      }
    }
  }
}
```

### Advanced Configuration:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp-server",
      "args": ["--debug"],
      "env": {
        "GITLAB_TOKEN": "your-gitlab-token-here",
        "GITLAB_URL": "https://gitlab.com",
        "GITLAB_TIMEOUT": "60",
        "GITLAB_MAX_RESULTS": "50"
      }
    }
  }
}
```

## Usage Examples in Claude

Once configured, you can ask Claude to interact with your GitLab data:

### Project Information
> "Show me my GitLab projects"
> "Get details for project ID 12345"
> "What are the recent commits in my main project?"

### Issue Management
> "List open issues in project 12345"
> "Show me all issues assigned to me across projects"
> "What are the high-priority bugs in the frontend project?"

### Code Review
> "Show me open merge requests that need review"
> "Get the content of src/main.py from project 12345"
> "What files changed in the latest commit?"

### Repository Exploration
> "Show me the file structure of project 12345"
> "Get the README file from the main branch"
> "List all Python files in the src directory"

## Available Resources

The server exposes these GitLab resources:

- `gitlab://projects` - Your accessible projects
- `gitlab://user` - Your user information
- `gitlab://project/{id}` - Specific project details
- `gitlab://project/{id}/issues` - Project issues
- `gitlab://project/{id}/merge_requests` - Project merge requests
- `gitlab://project/{id}/repository/tree/{path}` - Repository file tree
- `gitlab://project/{id}/repository/file/{path}` - File content

## Available Tools

The server provides these interactive tools:

- `search_projects` - Search for projects by name/description
- `get_project_info` - Get detailed project information
- `get_project_issues` - List issues with filtering options
- `get_merge_requests` - List merge requests with state filtering
- `get_file_content` - Retrieve file content from any branch/commit
- `list_commits` - Browse commit history
- `list_repository_tree` - Explore repository structure

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your GitLab token is valid
   - Ensure token has required scopes
   - Verify GitLab URL is correct

2. **Server Not Starting**
   - Check Python path and dependencies
   - Verify gitlab-mcp-server command is available
   - Look at Claude Desktop logs for error messages

3. **No Data Returned**
   - Check project visibility (private vs public)
   - Ensure you have access to the requested projects
   - Verify project IDs are correct

### Debug Mode

Enable debug logging to troubleshoot issues:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp-server",
      "args": ["--debug"],
      "env": {
        "GITLAB_TOKEN": "your-token"
      }
    }
  }
}
```

### Manual Testing

Test the server manually before Claude Desktop integration:

```bash
# Set your token
export GITLAB_TOKEN="your-token-here"

# Run the server
gitlab-mcp-server

# The server will start and wait for MCP protocol messages
```

## Security Notes

- Never commit your GitLab token to version control
- Use tokens with minimal required permissions
- Consider using project-specific tokens for better security
- Regularly rotate your access tokens