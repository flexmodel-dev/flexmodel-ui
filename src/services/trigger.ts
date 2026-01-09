import {api} from "@/utils/request";

// 根据OpenAPI规范定义的触发器类型
export type TriggerType = "EVENT" | "SCHEDULED";

export interface Trigger {
  id?: string;
  name: string;
  description?: string;
  type: TriggerType;
  config: Record<string, any>;
  jobType: string; // 任务类型，如 "FLOW"
  jobId: string; // flowId
  jobGroup: string;
  state: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TriggerDTO extends Trigger {
  jobName?: string;
  nextFireTime?: string;
  previousFireTime?: string;
}

export interface PageDTOTriggerDTO {
  list: TriggerDTO[];
  total: number;
}

export interface TriggerListParams {
  name?: string;
  jobGroup?: string;
  jobType?: string;
  jobId?: string;
  page?: number;
  size?: number;
}

/**
 * 获取触发器列表
 * @param params 查询参数
 * @returns 触发器列表
 */
export const getTriggerPage = (
  projectId: string,
  params?: TriggerListParams,
): Promise<PageDTOTriggerDTO> => {
  return api.get(`/projects/${projectId}/triggers`, {...params});
};

/**
 * 创建触发器
 * @param data 触发器数据
 * @returns 创建的触发器
 */
export const createTrigger = (projectId: string, data: Trigger): Promise<Trigger> => {
  return api.post(`/projects/${projectId}/triggers`, data);
};

/**
 * 获取单个触发器
 * @param id 触发器ID
 * @returns 触发器详情
 */
export const getTrigger = (projectId: string, id: string): Promise<TriggerDTO> => {
  return api.get(`/projects/${projectId}/triggers/${id}`);
};

/**
 * 更新触发器
 * @param id 触发器ID
 * @param data 触发器数据
 * @returns 更新后的触发器
 */
export const updateTrigger = (projectId: string, id: string, data: Trigger): Promise<Trigger> => {
  return api.put(`/projects/${projectId}/triggers/${id}`, data);
};

/**
 * 部分更新触发器
 * @param id 触发器ID
 * @param data 触发器数据
 * @returns 更新后的触发器
 */
export const patchTrigger = (projectId: string, id: string, data: Trigger): Promise<Trigger> => {
  return api.patch(`/projects/${projectId}/triggers/${id}`, data);
};

/**
 * 删除触发器
 * @param id 触发器ID
 * @returns 删除结果
 */
export const deleteTrigger = (projectId: string, id: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/triggers/${id}`);
};

/**
 * 立即执行触发器
 * @param id 触发器ID
 * @returns 执行结果
 */
export const executeTrigger = (projectId: string, id: string): Promise<void> => {
  return api.post(`/projects/${projectId}/triggers/${id}/execute`);
};
