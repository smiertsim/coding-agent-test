# MCP Servers Collection

This repository contains a collection of Model Context Protocol (MCP) servers that can be used with MCP clients like Claude Desktop.

## Available Servers

### GitLab MCP Server

A comprehensive MCP server that provides GitLab integration for AI assistants.

**Features:**
- Project management and browsing
- Issue tracking and management  
- Merge request handling
- Repository content access
- Commit history browsing
- Secure token-based authentication

**Location:** `gitlab-mcp-server/`

**Quick Start:**
```bash
cd gitlab-mcp-server
pip install -e .
export GITLAB_TOKEN="your-gitlab-token"
gitlab-mcp-server
```

See the [GitLab MCP Server README](gitlab-mcp-server/README.md) for detailed installation and usage instructions.
