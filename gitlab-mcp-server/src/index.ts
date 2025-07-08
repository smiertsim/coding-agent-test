#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GitLabClient } from './gitlab-client.js';
import { GitLabMCPServer } from './server.js';
import { loadConfig } from './config.js';
import { program } from 'commander';

async function main() {
  program
    .name('gitlab-mcp-server')
    .description('MCP Server for GitLab integration')
    .version('0.1.0')
    .option('-t, --gitlab-token <token>', 'GitLab access token')
    .option('-u, --gitlab-url <url>', 'GitLab base URL', 'https://gitlab.com')
    .option('-c, --config <path>', 'Path to configuration file')
    .parse();

  const options = program.opts();

  try {
    const config = await loadConfig(options);
    
    if (!config.gitlab_token) {
      console.error('GitLab token is required. Set GITLAB_TOKEN environment variable, use --gitlab-token flag, or specify in config file.');
      process.exit(1);
    }

    const gitlabClient = new GitLabClient(config.gitlab_token, config.gitlab_url);
    const mcpServer = new GitLabMCPServer(gitlabClient);
    
    const server = new Server(
      {
        name: 'gitlab-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    await mcpServer.setupServer(server);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('GitLab MCP Server started');
  } catch (error) {
    console.error('Failed to start GitLab MCP Server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}