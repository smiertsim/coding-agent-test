# MCP Servers Collection

This repository holds a set of MCP (Model Context Protocol) servers that can be used in MCP clients like Claude Desktop.

## GitLab MCP Server

A TypeScript-based MCP server that provides GitLab integration and context to MCP clients.

### Features

- **Project Management**: List and get details of GitLab projects
- **Issue Tracking**: Access issues with filtering by state and labels
- **Merge Requests**: List and view merge requests with filtering options
- **Code Access**: Search code and access file contents from repositories
- **Commit History**: Browse commits with date and branch filtering
- **Configurable Access**: Uses GitLab API tokens for secure access

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure GitLab Access**
   
   Copy the example environment file and configure your GitLab access:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your GitLab token:
   ```
   GITLAB_TOKEN=your_gitlab_token_here
   GITLAB_BASE_URL=https://gitlab.com  # Optional, for self-hosted GitLab
   GITLAB_PROJECT_ID=123  # Optional, default project ID
   ```

3. **Build the Server**
   ```bash
   npm run build
   ```

4. **Run the Server**
   ```bash
   npm start
   ```

### GitLab API Token

You need a GitLab Personal Access Token to use this server. Create one at:
- **GitLab.com**: [Personal Access Tokens](https://gitlab.com/-/profile/personal_access_tokens)
- **Self-hosted GitLab**: `YOUR_GITLAB_URL/-/profile/personal_access_tokens`

Required scopes:
- `read_api` - To read project information, issues, merge requests
- `read_repository` - To access code and file contents

### Available Tools

The server provides the following MCP tools:

#### Project Tools
- `list_projects` - List accessible GitLab projects with optional search
- `get_project` - Get details of a specific project

#### Issue Tools  
- `list_issues` - List issues in a project with filtering options
- `get_issue` - Get details of a specific issue

#### Merge Request Tools
- `list_merge_requests` - List merge requests with filtering
- `get_merge_request` - Get details of a specific merge request

#### Code Tools
- `list_commits` - List commits with date and branch filtering
- `search_code` - Search for code within a project

#### Resources
- `gitlab://projects` - Resource providing list of accessible projects
- `gitlab://project/{projectId}/file/{filePath}?ref={ref}` - Access file contents

### Usage Examples

#### List Projects
```json
{
  "name": "list_projects",
  "arguments": {
    "search": "my-project"
  }
}
```

#### Get Issues
```json
{
  "name": "list_issues",
  "arguments": {
    "projectId": "123",
    "state": "opened",
    "labels": "bug,priority::high"
  }
}
```

#### Search Code
```json
{
  "name": "search_code",
  "arguments": {
    "query": "function authenticate",
    "projectId": "123"
  }
}
```

### Configuration Options

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `GITLAB_TOKEN` | Yes | - | GitLab Personal Access Token |
| `GITLAB_BASE_URL` | No | `https://gitlab.com` | GitLab instance URL |
| `GITLAB_PROJECT_ID` | No | - | Default project ID for operations |

### Development

- **Build**: `npm run build`
- **Watch**: `npm run dev` (builds on file changes)
- **Lint**: `npm run lint`
- **Format**: `npm run format`

### MCP Client Configuration

To use this server with Claude Desktop, add it to your MCP settings:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/coding-agent-test/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```
