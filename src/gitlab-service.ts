import { Gitlab } from '@gitbeaker/rest';
import { GitLabConfig } from './types.js';

export class GitLabService {
  private gitlab: InstanceType<typeof Gitlab>;
  private projectId?: string | number;

  constructor(config: GitLabConfig) {
    this.gitlab = new Gitlab({
      token: config.token,
      host: config.baseUrl || 'https://gitlab.com',
    });
    this.projectId = config.projectId;
  }

  async getProjects(search?: string): Promise<any[]> {
    const options: any = { membership: true, simple: true };
    if (search) {
      options.search = search;
    }
    
    const projects = await this.gitlab.Projects.all(options);
    return projects;
  }

  async getProject(projectId: string | number): Promise<any> {
    // @ts-ignore - GitLab API accepts both string and number for project ID
    const project = await this.gitlab.Projects.show(projectId);
    return project;
  }

  async getIssues(projectId?: string | number, options?: { state?: string; labels?: string }): Promise<any[]> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    const queryOptions: any = {};
    if (options?.state) {
      queryOptions.state = options.state;
    }
    if (options?.labels) {
      queryOptions.labels = options.labels;
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const issues = await this.gitlab.Issues.all({ projectId: targetProjectId, ...queryOptions });
    return issues;
  }

  async getIssue(issueIid: number, projectId?: string | number): Promise<any> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const issue = await this.gitlab.Issues.show(targetProjectId, issueIid);
    return issue;
  }

  async getMergeRequests(projectId?: string | number, options?: { state?: string; target_branch?: string }): Promise<any[]> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    const queryOptions: any = {};
    if (options?.state) {
      queryOptions.state = options.state;
    }
    if (options?.target_branch) {
      queryOptions.target_branch = options.target_branch;
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const mergeRequests = await this.gitlab.MergeRequests.all({ projectId: targetProjectId, ...queryOptions });
    return mergeRequests;
  }

  async getMergeRequest(mergeRequestIid: number, projectId?: string | number): Promise<any> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const mergeRequest = await this.gitlab.MergeRequests.show(targetProjectId, mergeRequestIid);
    return mergeRequest;
  }

  async getCommits(projectId?: string | number, options?: { ref_name?: string; since?: string; until?: string }): Promise<any[]> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    const queryOptions: any = {};
    if (options?.ref_name) {
      queryOptions.ref_name = options.ref_name;
    }
    if (options?.since) {
      queryOptions.since = options.since;
    }
    if (options?.until) {
      queryOptions.until = options.until;
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const commits = await this.gitlab.Commits.all(targetProjectId, queryOptions);
    return commits;
  }

  async getFileContent(filePath: string, ref = 'main', projectId?: string | number): Promise<string> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const file = await this.gitlab.RepositoryFiles.show(targetProjectId, filePath, ref);
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }

  async searchCode(query: string, projectId?: string | number): Promise<any[]> {
    const targetProjectId = projectId || this.projectId;
    if (!targetProjectId) {
      throw new Error('Project ID is required');
    }

    // @ts-ignore - GitLab API accepts both string and number for project ID
    const results = await this.gitlab.Search.all('blobs', query, { projectId: targetProjectId });
    return results;
  }
}