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
