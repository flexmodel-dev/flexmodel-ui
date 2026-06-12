import {api} from "@/utils/request";

// ---- Types ----

export interface TriggerRef {
  id: string;
  path: string;
  method: string;
  authMode: string;
  enabled: boolean;
}

export interface FunctionResponse {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string;
  entryPoint: string;
  status: string;
  currentVersion: number;
  timeout: number;
  memoryLimit: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  triggers?: TriggerRef[];
}

export interface FunctionVersionResponse {
  id: string;
  functionId: string;
  version: number;
  createdBy?: string;
  createdAt?: string;
}

export interface FunctionCreateRequest {
  name: string;
  slug: string;
  description?: string;
  sourceCode: string;
  entryPoint?: string;
  timeout?: number;
  memoryLimit?: number;
  triggerPath?: string;
  triggerMethod?: string;
  authMode?: string;
}

export interface FunctionUpdateRequest {
  description?: string;
  sourceCode: string;
  entryPoint?: string;
  timeout?: number;
  memoryLimit?: number;
}

export interface FunctionInvokeRequest {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface FunctionInvokeResponse {
  status: number;
  headers?: Record<string, string>;
  body?: any;
  _meta?: {
    executionTimeMs: number;
    logs?: Array<{ level: string; message: string; data?: any }>;
  };
}

export interface PageDTO<T> {
  list: T[];
  total: number;
}

// ---- Function CRUD ----

/** Create a cloud function */
export const createFunction = (
  projectId: string,
  data: FunctionCreateRequest,
): Promise<FunctionResponse> => {
  return api.post(`/projects/${projectId}/functions`, data);
};

/** Get paginated function list */
export const getFunctionList = (
  projectId: string,
  params?: { name?: string; status?: string; page?: number; size?: number },
): Promise<PageDTO<FunctionResponse>> => {
  return api.get(`/projects/${projectId}/functions`, params);
};

/** Get function detail */
export const getFunction = (
  projectId: string,
  slug: string,
): Promise<FunctionResponse> => {
  return api.get(`/projects/${projectId}/functions/${slug}`);
};

/** Update a function */
export const updateFunction = (
  projectId: string,
  slug: string,
  data: FunctionUpdateRequest,
): Promise<FunctionResponse> => {
  return api.put(`/projects/${projectId}/functions/${slug}`, data);
};

/** Delete a function */
export const deleteFunction = (
  projectId: string,
  slug: string,
): Promise<void> => {
  return api.delete(`/projects/${projectId}/functions/${slug}`);
};

/** Rollback to a specific version */
export const rollbackFunction = (
  projectId: string,
  slug: string,
  version: number,
): Promise<FunctionResponse> => {
  return api.post(
    `/projects/${projectId}/functions/${slug}/rollback?version=${version}`,
  );
};

/** Get version history */
export const getFunctionVersions = (
  projectId: string,
  slug: string,
): Promise<FunctionVersionResponse[]> => {
  return api.get(`/projects/${projectId}/functions/${slug}/versions`);
};

/** Invoke a function */
export const invokeFunction = (
  projectId: string,
  slug: string,
  data: FunctionInvokeRequest,
): Promise<FunctionInvokeResponse> => {
  return api.post(`/projects/${projectId}/functions/${slug}/invoke`, data);
};

// ---- Trigger Management ----

/** Get function triggers */
export const getFunctionTriggers = (
  projectId: string,
  slug: string,
): Promise<any[]> => {
  return api.get(`/projects/${projectId}/functions/${slug}/triggers`);
};

/** Add a trigger */
export const addFunctionTrigger = (
  projectId: string,
  slug: string,
  data: any,
): Promise<any> => {
  return api.post(`/projects/${projectId}/functions/${slug}/triggers`, data);
};

/** Update a trigger */
export const updateFunctionTrigger = (
  projectId: string,
  slug: string,
  triggerId: string,
  data: any,
): Promise<any> => {
  return api.put(
    `/projects/${projectId}/functions/${slug}/triggers/${triggerId}`,
    data,
  );
};

/** Delete a trigger */
export const deleteFunctionTrigger = (
  projectId: string,
  slug: string,
  triggerId: string,
): Promise<void> => {
  return api.delete(
    `/projects/${projectId}/functions/${slug}/triggers/${triggerId}`,
  );
};
