 # GitLab MCP Server

A Model Context Protocol (MCP) server that provides GitLab integration capabilities.

## Features

- **Project Management**: List and retrieve GitLab projects
- **Issue Management**: Access and manage GitLab issues
- **Merge Request Management**: View and manage merge requests
- **Repository Access**: Browse repository files and content
- **User Information**: Get current user details

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The server requires a GitLab API token to authenticate with GitLab. Configure it using environment variables:

```bash
# Required: GitLab API token
GITLAB_TOKEN=your_gitlab_token_here

# Optional: GitLab instance URL (defaults to https://gitlab.com)
GITLAB_URL=https://gitlab.example.com
```

### Getting a GitLab API Token

1. Go to your GitLab instance
2. Navigate to User Settings → Access Tokens
3. Create a new Personal Access Token with the following scopes:
   - `read_api`
   - `read_repository`
   - `read_user`

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Using with Claude Desktop

Add the server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_gitlab_token_here",
        "GITLAB_URL": "https://gitlab.example.com"
      }
    }
  }
}
```

## Available Tools

### `gitlab_get_projects`
Get a list of GitLab projects with optional search and pagination.

### `gitlab_get_project`
Get details of a specific GitLab project by ID or path.

### `gitlab_get_issues`
Get issues from a GitLab project with filtering and pagination options.

### `gitlab_get_issue`
Get details of a specific GitLab issue.

### `gitlab_get_merge_requests`
Get merge requests from a GitLab project with filtering and pagination options.

### `gitlab_get_merge_request`
Get details of a specific GitLab merge request.

### `gitlab_get_user`
Get current user information.

### `gitlab_get_repository_tree`
Get repository tree (files and folders) for a specific path and branch.

### `gitlab_get_file_content`
Get the content of a specific file from the repository.

## Error Handling

The server includes comprehensive error handling for:
- Invalid GitLab API tokens
- Network connectivity issues
- Invalid project IDs or paths
- Missing required parameters
- GitLab API rate limits

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
npm test
```

## License

MIT
