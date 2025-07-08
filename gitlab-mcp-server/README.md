# GitLab MCP Server

A Model Context Protocol (MCP) server that provides GitLab integration for AI assistants like Claude Desktop.

## Features

- **Project Management**: Access GitLab projects, repositories, and metadata
- **Issue Tracking**: Browse and manage GitLab issues
- **Merge Requests**: View and interact with merge requests
- **Repository Content**: Access file contents, commits, and branches
- **User Information**: Get user and group details
- **Secure Authentication**: Uses GitLab API tokens for secure access

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   cd gitlab-mcp-server
   pip install -e .
   ```

## Configuration

The server requires a GitLab API token for authentication. You can configure this in several ways:

### Environment Variable
```bash
export GITLAB_TOKEN="your-gitlab-token-here"
export GITLAB_URL="https://gitlab.com"  # Optional, defaults to gitlab.com
```

### Configuration File
Create a `config.json` file:
```json
{
  "gitlab_token": "your-gitlab-token-here",
  "gitlab_url": "https://gitlab.com"
}
```

### Command Line
```bash
gitlab-mcp-server --gitlab-token="your-token" --gitlab-url="https://gitlab.com"
```

## Usage

### With Claude Desktop

Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp-server",
      "env": {
        "GITLAB_TOKEN": "your-gitlab-token-here"
      }
    }
  }
}
```

### Standalone Testing

```bash
gitlab-mcp-server --gitlab-token="your-token"
```

## Available Resources

- `gitlab://project/{project_id}` - Project information
- `gitlab://project/{project_id}/issues` - Project issues
- `gitlab://project/{project_id}/merge_requests` - Project merge requests
- `gitlab://project/{project_id}/repository/tree` - Repository file tree
- `gitlab://project/{project_id}/repository/file/{file_path}` - File contents

## Available Tools

- `search_projects` - Search for GitLab projects
- `get_project_issues` - Get issues for a specific project
- `create_issue` - Create a new issue
- `get_merge_requests` - Get merge requests for a project
- `get_file_content` - Get content of a specific file
- `list_commits` - List commits in a repository

## Getting a GitLab Token

1. Go to GitLab.com (or your GitLab instance)
2. Click on your avatar → Preferences
3. Go to Access Tokens
4. Create a new token with appropriate scopes:
   - `read_user` - Read user information
   - `read_repository` - Read repository data
   - `read_api` - Read API access
   - `write_repository` - Write repository data (if needed)

## License

MIT