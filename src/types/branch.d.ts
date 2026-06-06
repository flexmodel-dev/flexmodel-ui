/**
 * 分支接口
 */
export interface Branch {
  id: string;
  projectId: string;
  name: string;
  databaseName: string;
  sourceBranch?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

/**
 * 创建分支请求接口
 */
export interface BranchCreateRequest {
  name: string;
  sourceBranch?: string;
  description?: string;
}

/**
 * 冲突策略
 */
export type ConflictStrategy = "OVERWRITE" | "SKIP";

/**
 * 合并分支请求接口
 */
export interface BranchMergeRequest {
  sourceBranch: string;
  targetBranch?: string;
  conflictStrategy: ConflictStrategy;
}
