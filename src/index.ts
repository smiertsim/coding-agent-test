#!/usr/bin/env node

import GitLabMCPServer from './gitlab-mcp-server.js';

async function main() {
  try {
    const server = new GitLabMCPServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start GitLab MCP server:', error);
    process.exit(1);
  }
}

main();