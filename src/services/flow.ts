import {api} from "@/utils/request";

// 流程相关类型定义
export interface FlowModule {
  flowModuleId: string;
  flowName: string;
  flowKey: string;
  status: number; // 1-草稿，2-设计，3-测试，4-已发布
  remark?: string;
  tenant: string;
  caller: string;
  operator: string;
  modifyTime: string;
}

export interface FlowInstance {
  flowInstanceId: string;
  flowModuleId: string;
  flowDeployId: string;
  flowName?: string;
  flowKey?: string;
  status: number; // 1-已完成，2-运行中，3-已终止，4-已完成
  parentFlowInstanceId?: string;
  tenant: string;
  caller: string;
  operator: string;
  createTime: string;
  modifyTime: string;
}

export interface FlowModuleDetail extends FlowModule {
  flowDeployId?: string;
  flowModel?: string;
}

export interface CreateFlowRequest {
  flowKey: string;
  flowName: string;
  remark?: string;
  tenant?: string;
  caller?: string;
  operator?: string;
}

export interface CreateFlowResponse {
  errCode: number;
  errMsg: string;
  flowModuleId: string;
}

export interface DeployFlowRequest {
  flowModuleId: string;
  tenant?: string;
  caller?: string;
  operator?: string;
}

export interface DeployFlowResponse {
  errCode: number;
  errMsg: string;
  flowDeployId: string;
  flowModuleId: string;
}

export interface UpdateFlowRequest {
  flowName?: string;
  flowKey?: string;
  remark?: string;
  flowModel?: string;
  tenant?: string;
  caller?: string;
  operator?: string;
}

export interface UpdateFlowResponse {
  errCode: number;
  errMsg: string;
}

export interface StartProcessRequest {
  flowModuleId?: string; // 流程模块ID，flowModuleId和flowDeployId必须有一个
  flowDeployId?: string; // 流程部署ID，flowModuleId和flowDeployId必须有一个
  variables?: Record<string, any>; // 流程变量
}

export interface StartProcessResponse {
  errCode: number;
  errMsg: string;
  flowInstanceId: string;
  status: number;
  flowDeployId?: string;
  flowModuleId?: string;
  nodeExecuteResults?: NodeExecuteResult[];
  extendProperties?: Record<string, any>;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface CommitTaskRequest {
  flowInstanceId: string;
  nodeInstanceId?: string;
  variables?: Record<string, any>;
  tenant?: string;
  caller?: string;
  operator?: string;
  taskInstanceId?: string;
  extendProperties?: Record<string, any>;
  callActivityFlowModuleId?: string;
}

export interface CommitTaskResponse {
  errCode: number;
  errMsg: string;
  flowInstanceId: string;
  status: number;
  nodeExecuteResults?: NodeExecuteResult[];
  extendProperties?: Record<string, any>;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface RollbackTaskRequest {
  flowInstanceId: string;
  nodeInstanceId?: string;
  tenant?: string;
  caller?: string;
  operator?: string;
  taskInstanceId?: string;
  extendProperties?: Record<string, any>;
}

export interface RollbackTaskResponse {
  errCode: number;
  errMsg: string;
  flowInstanceId: string;
  status: number;
  nodeExecuteResults?: NodeExecuteResult[];
  extendProperties?: Record<string, any>;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface TerminateResponse {
  errCode: number;
  errMsg: string;
  flowInstanceId: string;
  status: number;
  nodeExecuteResults?: NodeExecuteResult[];
  extendProperties?: Record<string, any>;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface RuntimeContext {
  parentRuntimeContext?: RuntimeContext;
  flowDeployId?: string;
  flowModuleId?: string;
  tenant?: string;
  caller?: string;
  flowElementMap?: Record<string, FlowElement>;
  flowInstanceId?: string;
  flowInstanceStatus?: number;
  suspendNodeInstance?: NodeInstanceBO;
  nodeInstanceList?: NodeInstanceBO[];
  suspendNodeInstanceStack?: string[];
  currentNodeModel?: FlowElement;
  currentNodeInstance?: NodeInstanceBO;
  instanceDataId?: string;
  instanceDataMap?: Record<string, any>;
  processStatus?: number;
  callActivityFlowModuleId?: string;
  callActivityRuntimeResultList?: RuntimeResult[];
  extendProperties?: Record<string, any>;
  extendRuntimeContextList?: ExtendRuntimeContext[];
}

export interface FlowElement {
  key: string;
  type: number;
  outgoing?: string[];
  properties?: Record<string, any>;
  incoming?: string[];
}

export interface NodeInstanceBO {
  id?: number;
  nodeInstanceId: string;
  nodeKey: string;
  sourceNodeInstanceId?: string;
  sourceNodeKey?: string;
  instanceDataId?: string;
  status: number;
  nodeType: number;
  properties?: Record<string, any>;
}

export interface ExtendRuntimeContext {
  branchExecuteDataMap?: Record<string, any>;
  branchSuspendNodeInstance?: NodeInstanceBO;
  currentNodeModel?: FlowElement;
  exception?: TurboException;
}

export interface TurboException {
  errNo: number;
  errMsg: string;
}

export interface RuntimeResult {
  errCode: number;
  errMsg: string;
  flowInstanceId?: string;
  status: number;
  nodeExecuteResults?: NodeExecuteResult[];
  extendProperties?: Record<string, any>;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface NodeExecuteResult {
  errCode: number;
  errMsg: string;
  activeTaskInstance?: NodeInstance;
  variables?: Record<string, any>;
}

export interface NodeInstance extends ElementInstance {
  nodeInstanceId: string;
  flowElementType?: number;
  subNodeResultList?: RuntimeResult[];
  createTime?: string;
  modifyTime?: string;
  properties?: Record<string, any>;
}

export interface ElementInstance {
  key?: string;
  name?: string;
  properties?: Record<string, any>;
  status: number;
  nodeInstanceId: string;
  subFlowInstanceIdList?: string[];
  subElementInstanceList?: ElementInstance[];
  instanceDataId?: string;
}

export interface PagedResult<T> {
  list: T[];
  total: number;
}

export interface FlowListParams {
  flowModuleId?: string;
  flowName?: string;
  page?: number;
  size?: number;
}

export interface FlowInstanceListParams {
  caller?: string;
  flowDeployId?: string;
  flowInstanceId?: string;
  flowModuleId?: string;
  page?: number;
  size?: number;
  status?: number;
}

export const FlowInstanceStatus = {
  DEFAULT: 0,    // 默认值
  ACTIVE: 1,     // 执行完成
  RUNNING: 2,  // 执行中
  TERMINATED: 3, // 已终止
  END: 4,     // 执行结束 主要是解决从父流程实例回滚到已执行结束的子流程实例的情况
} as const;

// 节点实例状态枚举
export const NodeInstanceStatus = {
  DEFAULT: 0,    // 数据库默认值
  COMPLETED: 1,  // 处理成功
  ACTIVE: 2,     // 处理中
  FAILED: 3,     // 处理失败
  DISABLED: 4,   // 处理已撤销
} as const;

export type NodeInstanceStatusType = typeof NodeInstanceStatus[keyof typeof NodeInstanceStatus];

/**
 * 获取流程列表
 * @param projectId 项目ID
 * @param params 查询参数
 * @returns 流程列表
 */
export const getFlowList = (
  projectId: string,
  params?: FlowListParams,
): Promise<PagedResult<FlowModule>> => {
  return api.get(`/projects/${projectId}/flows`, { ...params });
};

/**
 * 创建流程
 * @param projectId 项目ID
 * @param data 流程信息
 * @returns 创建的流程
 */
export const createFlow = (
  projectId: string,
  data: CreateFlowRequest,
): Promise<CreateFlowResponse> => {
  return api.post(`/projects/${projectId}/flows`, data);
};

/**
 * 获取流程模块信息
 * @param projectId 项目ID
 * @param flowModuleId 流程模块ID
 * @param flowDeployId 流程部署ID（可选）
 * @returns 流程模块详情
 */
export const getFlowModule = (
  projectId: string,
  flowModuleId: string,
  flowDeployId?: string,
): Promise<FlowModuleDetail> => {
  return api.get(`/projects/${projectId}/flows/${flowModuleId}`, flowDeployId ? { flowDeployId } : undefined);
};

/**
 * 部署流程
 * @param projectId 项目ID
 * @param flowModuleId 流程模块ID
 * @param data 部署参数
 * @returns 部署结果
 */
export const deployFlow = (
  projectId: string,
  flowModuleId: string,
  data: DeployFlowRequest,
): Promise<DeployFlowResponse> => {
  return api.post(`/projects/${projectId}/flows/${flowModuleId}/deploy`, data);
};

/**
 * 更新流程
 * @param projectId 项目ID
 * @param flowModuleId 流程模块ID
 * @param data 更新参数
 * @returns 更新结果
 */
export const updateFlow = (
  projectId: string,
  flowModuleId: string,
  data: UpdateFlowRequest,
): Promise<UpdateFlowResponse> => {
  return api.put(`/projects/${projectId}/flows/${flowModuleId}`, data);
};

/**
 * 获取流程实例列表
 * @param projectId 项目ID
 * @param params 查询参数
 * @returns 流程实例列表
 */
export const getFlowInstanceList = (
  projectId: string,
  params?: FlowInstanceListParams,
): Promise<PagedResult<FlowInstance>> => {
  return api.get(`/projects/${projectId}/flows/instances`, { ...params });
};

/**
 * 启动流程实例
 * @param projectId 项目ID
 * @param data 启动参数
 * @returns 启动结果
 */
export const startProcess = (
  projectId: string,
  data: StartProcessRequest,
): Promise<StartProcessResponse> => {
  return api.post(`/projects/${projectId}/flows/instances/start`, data);
};

/**
 * 获取流程实例信息
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @returns 流程实例详情
 */
export const getFlowInstance = (
  projectId: string,
  flowInstanceId: string,
): Promise<FlowInstance> => {
  return api.get(`/projects/${projectId}/flows/instances/${flowInstanceId}`);
};

/**
 * 提交任务
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @param data 任务参数
 * @returns 提交结果
 */
export const commitTask = (
  projectId: string,
  flowInstanceId: string,
  data: CommitTaskRequest,
): Promise<CommitTaskResponse> => {
  return api.post(`/projects/${projectId}/flows/instances/${flowInstanceId}/commit`, data);
};

/**
 * 回滚任务
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @param data 回滚参数
 * @returns 回滚结果
 */
export const rollbackTask = (
  projectId: string,
  flowInstanceId: string,
  data: RollbackTaskRequest,
): Promise<RollbackTaskResponse> => {
  return api.post(`/projects/${projectId}/flows/instances/${flowInstanceId}/rollback`, data);
};

/**
 * 删除流程模块
 * @param projectId 项目ID
 * @param flowModuleId 流程模块ID
 * @returns 删除结果
 */
export interface DeleteFlowResponse {
  errCode: number;
  errMsg: string;
}

export const deleteFlow = (
  projectId: string,
  flowModuleId: string,
): Promise<DeleteFlowResponse> => {
  return api.delete(`/projects/${projectId}/flows/${flowModuleId}`);
};

/**
 * 终止流程实例
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @param effectiveForSubFlowInstance 是否对子流程实例生效
 * @returns 终止结果
 */
export const terminateFlowInstance = (
  projectId: string,
  flowInstanceId: string,
  effectiveForSubFlowInstance: boolean = true,
): Promise<TerminateResponse> => {
  return api.post(
    `/projects/${projectId}/flows/instances/${flowInstanceId}/terminate?effectiveForSubFlowInstance=${effectiveForSubFlowInstance}`,
  );
};

/**
 * 获取流程实例的用户任务列表
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @returns 用户任务列表
 */
export const getFlowUserTasks = (
  projectId: string,
  flowInstanceId: string,
): Promise<NodeInstance[]> => {
  return api.get(`/projects/${projectId}/flows/instances/${flowInstanceId}/user-tasks`);
};

/**
 * 判断是否成功
 * @param errCode 错误码
 * @returns 是否成功
 */
export const isSuccess = (errCode: number): boolean => {
  return errCode >= 1000 && errCode < 2000;
}

/**
 * 获取元素实例列表
 * @param projectId 项目ID
 * @param flowInstanceId 流程实例ID
 * @returns 元素实例列表
 */
export const getElementInstances= (
  projectId: string,
  flowInstanceId: string,
): Promise<NodeInstance[]> => {
  return api.get(`/projects/${projectId}/flows/instances/${flowInstanceId}/elements`);
};