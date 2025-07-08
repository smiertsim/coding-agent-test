import axios, { AxiosInstance } from 'axios';

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  description: string;
  web_url: string;
  default_branch: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  assignees: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  web_url: string;
  labels: string[];
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  assignees: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  web_url: string;
  source_branch: string;
  target_branch: string;
  merge_status: string;
}

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface GitLabTreeItem {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}

export class GitLabClient {
  private api: AxiosInstance;

  constructor(baseURL: string, token: string) {
    this.api = axios.create({
      baseURL: `${baseURL}/api/v4`,
      headers: {
        'Private-Token': token,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProjects(options: {
    search?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<GitLabProject[]> {
    const params = new URLSearchParams();
    
    if (options.search) {
      params.append('search', options.search);
    }
    params.append('per_page', (options.per_page || 20).toString());
    params.append('page', (options.page || 1).toString());

    const response = await this.api.get(`/projects?${params.toString()}`);
    return response.data;
  }

  async getProject(projectId: string): Promise<GitLabProject> {
    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}`);
    return response.data;
  }

  async getIssues(projectId: string, options: {
    state?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<GitLabIssue[]> {
    const params = new URLSearchParams();
    
    if (options.state) {
      params.append('state', options.state);
    }
    params.append('per_page', (options.per_page || 20).toString());
    params.append('page', (options.page || 1).toString());

    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/issues?${params.toString()}`);
    return response.data;
  }

  async getIssue(projectId: string, issueIid: number): Promise<GitLabIssue> {
    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`);
    return response.data;
  }

  async getMergeRequests(projectId: string, options: {
    state?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<GitLabMergeRequest[]> {
    const params = new URLSearchParams();
    
    if (options.state) {
      params.append('state', options.state);
    }
    params.append('per_page', (options.per_page || 20).toString());
    params.append('page', (options.page || 1).toString());

    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/merge_requests?${params.toString()}`);
    return response.data;
  }

  async getMergeRequest(projectId: string, mergeRequestIid: number): Promise<GitLabMergeRequest> {
    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}`);
    return response.data;
  }

  async getCurrentUser(): Promise<GitLabUser> {
    const response = await this.api.get('/user');
    return response.data;
  }

  async getRepositoryTree(projectId: string, path: string = '', ref: string = 'main'): Promise<GitLabTreeItem[]> {
    const params = new URLSearchParams();
    params.append('ref', ref);
    if (path) {
      params.append('path', path);
    }

    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/repository/tree?${params.toString()}`);
    return response.data;
  }

  async getFileContent(projectId: string, filePath: string, ref: string = 'main'): Promise<string> {
    const params = new URLSearchParams();
    params.append('ref', ref);

    const response = await this.api.get(`/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}/raw?${params.toString()}`);
    return response.data;
  }
}