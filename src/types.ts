export interface GitLabConfig {
  token: string;
  baseUrl?: string;
  projectId?: string | number;
}

export interface GitLabProject {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  default_branch: string;
  namespace: {
    name: string;
    full_path: string;
  };
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string | null;
  state: string;
  web_url: string;
  author: {
    name: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
  labels: string[];
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string | null;
  state: string;
  web_url: string;
  source_branch: string;
  target_branch: string;
  author: {
    name: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GitLabCommit {
  id: string;
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  web_url: string;
}