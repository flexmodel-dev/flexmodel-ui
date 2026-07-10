import {api} from "@/utils/request";

// ---- Types ----

export interface FunctionResponse {
  id: string;
  projectId: string;
  name: string;
  sourceFiles?: Record<string, string>;
  timeout: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FunctionTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  sourceFiles: Record<string, string>;
  tags?: string;         // JSON array string
  icon?: string;
  sortOrder: number;
}

export interface FunctionDeployRequest {
  name: string;
  sourceFiles: Record<string, string>;
  timeout?: number;
}

export interface FunctionInvokeMeta {
  executionTimeMs: number;
  logs?: Array<{ level: string; message: string; data?: any }>;
}

export interface FunctionInvokeResult {
  status: number;
  data: any;
  meta?: FunctionInvokeMeta;
}

export interface PageDTO<T> {
  list: T[];
  total: number;
}

// ---- Function CRUD ----

export const deployFunction = (
  projectId: string,
  name: string,
  data: FunctionDeployRequest,
): Promise<FunctionResponse> => {
  return api.post(`/projects/${projectId}/functions/${encodeURIComponent(name)}/deploy`, data);
};

export const getFunctionList = (
  projectId: string,
  params?: { name?: string; page?: number; size?: number },
): Promise<PageDTO<FunctionResponse>> => {
  return api.get(`/projects/${projectId}/functions`, params);
};

export const getFunction = (
  projectId: string,
  name: string,
): Promise<FunctionResponse> => {
  return api.get(`/projects/${projectId}/functions/${encodeURIComponent(name)}`);
};

export const deleteFunction = (
  projectId: string,
  name: string,
): Promise<void> => {
  return api.delete(`/projects/${projectId}/functions/${encodeURIComponent(name)}`);
};

// invoke — 请求体直接作为函数的 Request body（不再嵌套在 input 字段中）
export const invokeFunction = async (
  projectId: string,
  name: string,
  data: any,
): Promise<FunctionInvokeResult> => {
  const response = await api.rawPost(
    `/projects/${projectId}/functions/${encodeURIComponent(name)}/invoke`,
    data,
  );

  let meta: FunctionInvokeMeta | undefined;
  const metaStr = response.headers['x-function-meta'];
  if (metaStr) {
    try { meta = JSON.parse(metaStr); } catch { /* ignore */ }
  }

  return { status: response.status, data: response.data, meta };
};

// ---- Templates ----

export const getFunctionTemplates = (): Promise<FunctionTemplate[]> => {
  return api.get("/function-templates");
};
