import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GitLabClient } from './gitlab-client.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class GitLabMCPServer {
  private server: Server;
  private gitlabClient: GitLabClient;

  constructor() {
    this.server = new Server({
      name: 'gitlab-mcp-server',
      version: '1.0.0',
    });

    // Initialize GitLab client
    const gitlabToken = process.env.GITLAB_TOKEN;
    const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
    
    if (!gitlabToken) {
      throw new Error('GITLAB_TOKEN environment variable is required');
    }

    this.gitlabClient = new GitLabClient(gitlabUrl, gitlabToken);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'gitlab_get_projects',
            description: 'Get a list of GitLab projects',
            inputSchema: {
              type: 'object',
              properties: {
                search: {
                  type: 'string',
                  description: 'Search query to filter projects',
                },
                per_page: {
                  type: 'number',
                  description: 'Number of projects per page (default: 20)',
                  default: 20,
                },
                page: {
                  type: 'number',
                  description: 'Page number (default: 1)',
                  default: 1,
                },
              },
            },
          },
          {
            name: 'gitlab_get_project',
            description: 'Get details of a specific GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'gitlab_get_issues',
            description: 'Get issues from a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                state: {
                  type: 'string',
                  description: 'Issue state (opened, closed, all)',
                  enum: ['opened', 'closed', 'all'],
                  default: 'opened',
                },
                per_page: {
                  type: 'number',
                  description: 'Number of issues per page (default: 20)',
                  default: 20,
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'gitlab_get_issue',
            description: 'Get details of a specific GitLab issue',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                issue_iid: {
                  type: 'number',
                  description: 'Issue internal ID',
                },
              },
              required: ['project_id', 'issue_iid'],
            },
          },
          {
            name: 'gitlab_get_merge_requests',
            description: 'Get merge requests from a GitLab project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                state: {
                  type: 'string',
                  description: 'Merge request state (opened, closed, merged, all)',
                  enum: ['opened', 'closed', 'merged', 'all'],
                  default: 'opened',
                },
                per_page: {
                  type: 'number',
                  description: 'Number of merge requests per page (default: 20)',
                  default: 20,
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'gitlab_get_merge_request',
            description: 'Get details of a specific GitLab merge request',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                merge_request_iid: {
                  type: 'number',
                  description: 'Merge request internal ID',
                },
              },
              required: ['project_id', 'merge_request_iid'],
            },
          },
          {
            name: 'gitlab_get_user',
            description: 'Get current user information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'gitlab_get_repository_tree',
            description: 'Get repository tree (files and folders)',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                path: {
                  type: 'string',
                  description: 'Path to list (default: root)',
                  default: '',
                },
                ref: {
                  type: 'string',
                  description: 'Branch or tag name (default: main)',
                  default: 'main',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'gitlab_get_file_content',
            description: 'Get content of a specific file',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID or path',
                },
                file_path: {
                  type: 'string',
                  description: 'Path to the file',
                },
                ref: {
                  type: 'string',
                  description: 'Branch or tag name (default: main)',
                  default: 'main',
                },
              },
              required: ['project_id', 'file_path'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'gitlab_get_projects':
            return await this.handleGetProjects(args);
          case 'gitlab_get_project':
            return await this.handleGetProject(args);
          case 'gitlab_get_issues':
            return await this.handleGetIssues(args);
          case 'gitlab_get_issue':
            return await this.handleGetIssue(args);
          case 'gitlab_get_merge_requests':
            return await this.handleGetMergeRequests(args);
          case 'gitlab_get_merge_request':
            return await this.handleGetMergeRequest(args);
          case 'gitlab_get_user':
            return await this.handleGetUser();
          case 'gitlab_get_repository_tree':
            return await this.handleGetRepositoryTree(args);
          case 'gitlab_get_file_content':
            return await this.handleGetFileContent(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${errorMessage}`
        );
      }
    });
  }

  private async handleGetProjects(args: any) {
    const projects = await this.gitlabClient.getProjects(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    };
  }

  private async handleGetProject(args: any) {
    const project = await this.gitlabClient.getProject(args.project_id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  }

  private async handleGetIssues(args: any) {
    const issues = await this.gitlabClient.getIssues(args.project_id, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issues, null, 2),
        },
      ],
    };
  }

  private async handleGetIssue(args: any) {
    const issue = await this.gitlabClient.getIssue(args.project_id, args.issue_iid);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    };
  }

  private async handleGetMergeRequests(args: any) {
    const mergeRequests = await this.gitlabClient.getMergeRequests(args.project_id, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mergeRequests, null, 2),
        },
      ],
    };
  }

  private async handleGetMergeRequest(args: any) {
    const mergeRequest = await this.gitlabClient.getMergeRequest(args.project_id, args.merge_request_iid);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mergeRequest, null, 2),
        },
      ],
    };
  }

  private async handleGetUser() {
    const user = await this.gitlabClient.getCurrentUser();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(user, null, 2),
        },
      ],
    };
  }

  private async handleGetRepositoryTree(args: any) {
    const tree = await this.gitlabClient.getRepositoryTree(args.project_id, args.path || '', args.ref || 'main');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tree, null, 2),
        },
      ],
    };
  }

  private async handleGetFileContent(args: any) {
    const content = await this.gitlabClient.getFileContent(args.project_id, args.file_path, args.ref || 'main');
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitLab MCP server running on stdio');
  }
}

export default GitLabMCPServer;