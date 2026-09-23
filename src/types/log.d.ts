/**
 * 函数执行日志
 */
export interface FunctionLog {
  id: string;
  functionName: string;
  level: string;
  message: string;
  traceId?: string;
  createdAt: string;
}

export interface ApiLogRef {
  id: string;
  path: string;
  httpMethod: string;
  statusCode: number;
  responseTime: number;
  url?: string;
  clientIp?: string;
  isSuccess: boolean;
  errorMessage?: string;
  requestBody?: any;
  requestHeaders?: any;
  traceId?: string;
  createdAt: string;
}

export interface JobExecutionLogRef {
  id: string;
  jobId: string;
  jobName: string;
  jobType: string;
  jobGroup?: string;
  triggerId: string;
  executionStatus: string;
  startTime: string;
  endTime?: string;
  executionDuration?: number;
  isSuccess: boolean;
  errorMessage?: string;
  errorStackTrace?: string;
  inputData?: any;
  outputData?: any;
  retryCount?: number;
  maxRetryCount?: number;
  schedulerName?: string;
  instanceName?: string;
  firedTime?: number;
  scheduledTime?: number;
  traceId?: string;
  createdAt?: string;
}

export interface NodeInstanceLogRef {
  id: number;
  nodeInstanceId: string;
  flowInstanceId: string;
  instanceDataId?: string;
  nodeKey: string;
  type: number;
  status: number;
  archive?: number;
  traceId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

/**
 * 审计日志（配置变更）
 */
export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  userId?: string;
  success: boolean;
  errorMessage?: string;
  oldData?: string;
  newData?: string;
  traceId?: string;
  createdAt: string;
}
