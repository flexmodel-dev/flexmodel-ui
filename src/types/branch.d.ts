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

export type BranchProgressOperation = "CREATE" | "MERGE";

export type BranchProgressEventType =
  | "STARTED"
  | "STAGE_COMPLETED"
  | "MODEL_STARTED"
  | "MODEL_COMPLETED"
  | "MODEL_SKIPPED"
  | "MODEL_FAILED"
  | "COMPLETED"
  | "FAILED";

export type BranchProgressStage =
  | "VALIDATING"
  | "RESOLVING_SOURCE"
  | "CREATING_SCHEMA"
  | "COPYING_SCHEMA"
  | "MIGRATING_DATA"
  | "SAVING_RECORDS"
  | "REFRESHING_GRAPHQL"
  | "MERGING_SCHEMA"
  | "MERGING_DATA";

export interface BranchProgressEvent {
  operation: BranchProgressOperation;
  type: BranchProgressEventType;
  stage: BranchProgressStage;
  modelName?: string | null;
  totalModels?: number;
  processedModels?: number;
  progress?: number;
  sourceRecords?: number;
  targetRecords?: number;
  insertedRecords?: number;
  updatedRecords?: number;
  message?: string | null;
  result?: unknown;
  timestamp?: string;
}
