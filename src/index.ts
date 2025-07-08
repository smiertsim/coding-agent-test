#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GitLabService } from './gitlab-service.js';
import { GitLabConfig } from './types.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class GitLabMCPServer {
  private server: Server;
  private gitlabService: GitLabService;

  constructor() {
    this.server = new Server(
      {
        name: 'gitlab-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize GitLab service with configuration
    const config: GitLabConfig = {
      token: process.env.GITLAB_TOKEN || '',
      baseUrl: process.env.GITLAB_BASE_URL,
      projectId: process.env.GITLAB_PROJECT_ID,
    };

    if (!config.token) {
      throw new Error('GITLAB_TOKEN environment variable is required');
    }

    this.gitlabService = new GitLabService(config);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'List GitLab projects',
            inputSchema: {
              type: 'object',
              properties: {
                search: {
                  type: 'string',
                  description: 'Search term to filter projects',
                },
              },
            },
          },
          {
            name: 'get_project',
            description: 'Get details of a specific GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path',
                },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'list_issues',
            description: 'List issues in a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
                state: {
                  type: 'string',
                  enum: ['opened', 'closed', 'all'],
                  description: 'Filter issues by state',
                },
                labels: {
                  type: 'string',
                  description: 'Comma-separated list of labels to filter by',
                },
              },
            },
          },
          {
            name: 'get_issue',
            description: 'Get details of a specific issue',
            inputSchema: {
              type: 'object',
              properties: {
                issueIid: {
                  type: 'number',
                  description: 'Issue internal ID',
                },
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
              },
              required: ['issueIid'],
            },
          },
          {
            name: 'list_merge_requests',
            description: 'List merge requests in a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
                state: {
                  type: 'string',
                  enum: ['opened', 'closed', 'merged', 'all'],
                  description: 'Filter merge requests by state',
                },
                target_branch: {
                  type: 'string',
                  description: 'Filter by target branch',
                },
              },
            },
          },
          {
            name: 'get_merge_request',
            description: 'Get details of a specific merge request',
            inputSchema: {
              type: 'object',
              properties: {
                mergeRequestIid: {
                  type: 'number',
                  description: 'Merge request internal ID',
                },
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
              },
              required: ['mergeRequestIid'],
            },
          },
          {
            name: 'list_commits',
            description: 'List commits in a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
                ref_name: {
                  type: 'string',
                  description: 'Branch or tag name',
                },
                since: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                },
                until: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                },
              },
            },
          },
          {
            name: 'search_code',
            description: 'Search for code in a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                projectId: {
                  type: ['string', 'number'],
                  description: 'Project ID or path (optional if default project is set)',
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_projects': {
            const search = args?.search as string | undefined;
            const projects = await this.gitlabService.getProjects(search);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projects, null, 2),
                },
              ],
            };
          }

          case 'get_project': {
            if (!args?.projectId) {
              throw new Error('projectId is required');
            }
            const project = await this.gitlabService.getProject(args.projectId as string | number);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(project, null, 2),
                },
              ],
            };
          }

          case 'list_issues': {
            const projectId = args?.projectId as string | number | undefined;
            const state = args?.state as string | undefined;
            const labels = args?.labels as string | undefined;
            const issues = await this.gitlabService.getIssues(projectId, {
              state,
              labels,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(issues, null, 2),
                },
              ],
            };
          }

          case 'get_issue': {
            if (!args?.issueIid) {
              throw new Error('issueIid is required');
            }
            const issueIid = args.issueIid as number;
            const projectId = args?.projectId as string | number | undefined;
            const issue = await this.gitlabService.getIssue(issueIid, projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(issue, null, 2),
                },
              ],
            };
          }

          case 'list_merge_requests': {
            const projectId = args?.projectId as string | number | undefined;
            const state = args?.state as string | undefined;
            const target_branch = args?.target_branch as string | undefined;
            const mergeRequests = await this.gitlabService.getMergeRequests(projectId, {
              state,
              target_branch,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(mergeRequests, null, 2),
                },
              ],
            };
          }

          case 'get_merge_request': {
            if (!args?.mergeRequestIid) {
              throw new Error('mergeRequestIid is required');
            }
            const mergeRequestIid = args.mergeRequestIid as number;
            const projectId = args?.projectId as string | number | undefined;
            const mergeRequest = await this.gitlabService.getMergeRequest(mergeRequestIid, projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(mergeRequest, null, 2),
                },
              ],
            };
          }

          case 'list_commits': {
            const projectId = args?.projectId as string | number | undefined;
            const ref_name = args?.ref_name as string | undefined;
            const since = args?.since as string | undefined;
            const until = args?.until as string | undefined;
            const commits = await this.gitlabService.getCommits(projectId, {
              ref_name,
              since,
              until,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(commits, null, 2),
                },
              ],
            };
          }

          case 'search_code': {
            if (!args?.query) {
              throw new Error('query is required');
            }
            const query = args.query as string;
            const projectId = args?.projectId as string | number | undefined;
            const results = await this.gitlabService.searchCode(query, projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'gitlab://projects',
            name: 'GitLab Projects',
            description: 'List of accessible GitLab projects',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === 'gitlab://projects') {
          const projects = await this.gitlabService.getProjects();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(projects, null, 2),
              },
            ],
          };
        }

        // Handle file content requests: gitlab://project/{projectId}/file/{filePath}?ref={ref}
        const fileMatch = uri.match(/^gitlab:\/\/project\/([^\/]+)\/file\/(.+)$/);
        if (fileMatch) {
          const [, projectId, filePath] = fileMatch;
          const url = new URL(uri);
          const ref = url.searchParams.get('ref') || 'main';
          
          const content = await this.gitlabService.getFileContent(filePath, ref, projectId);
          return {
            contents: [
              {
                uri,
                mimeType: 'text/plain',
                text: content,
              },
            ],
          };
        }

        throw new Error(`Unknown resource: ${uri}`);
      } catch (error) {
        throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitLab MCP Server started');
  }
}

// Start the server
const server = new GitLabMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});