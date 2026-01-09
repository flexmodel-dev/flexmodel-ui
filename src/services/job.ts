import {api} from "@/utils/request";

// 任务执行日志接口
export interface JobExecutionLog {
  id: string;
  triggerId: string;
  jobId: string;
  jobGroup: string;
  jobType: string;
  jobName: string;
  executionStatus: string;
  startTime: string;
  endTime: string;
  executionDuration: number;
  isSuccess: boolean;
  errorMessage?: string;
  errorStackTrace?: any;
  inputData?: any;
  outputData?: any;
}

// 分页结果接口
export interface PageDTOJobExecutionLog {
  list: JobExecutionLog[];
  total: number;
}

// 查询参数接口
export interface JobExecutionLogParams {
  endTime?: string;
  isSuccess?: boolean;
  jobId?: string;
  page?: number;
  size?: number;
  startTime?: string;
  status?: string;
  triggerId?: string;
}

/**
 * 获取任务执行日志列表
 * @param params 查询参数
 * @returns 任务执行日志分页结果
 */
export const getJobExecutionLogs = (
  projectId: string,
  params?: JobExecutionLogParams,
): Promise<PageDTOJobExecutionLog> => {
  return api.get(`/projects/${projectId}/jobs/logs`, { ...params });
};
