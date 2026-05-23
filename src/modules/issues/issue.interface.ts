export const IssueTypeEnum = {
  bug: "bug",
  feature_request: "feature_request",
} as const;

export const IssueStatusEnum = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
} as const;

export type IssueType = (typeof IssueTypeEnum)[keyof typeof IssueTypeEnum];
export type IssueStatus = (typeof IssueStatusEnum)[keyof typeof IssueStatusEnum];

export interface IIssue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateIssue {
  title: string;
  description: string;
  type: IssueType;
  reporter_id: number;
}

export interface IUpdateIssue {
  id: string;
  title?: string | undefined;
  description?: string | undefined;
  type?: IssueType | undefined;
  status?: IssueStatus | undefined;
}

export interface IGetIssuesQuery {
  sort?: "newest" | "oldest" | undefined;
  type?: IssueType | undefined;
  status?: IssueStatus | undefined;
}
