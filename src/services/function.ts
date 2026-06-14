import {api} from "@/utils/request";

// ---- Types ----

export interface FunctionResponse {
  id: string;
  projectId: string;
  name: string;
  sourceFiles?: string;   // JSON string: filename → content
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
  sourceFiles: string;  // JSON string
  tags?: string;         // JSON array string
  icon?: string;
  sortOrder: number;
}

export interface FunctionDeployRequest {
  name: string;
  sourceFiles: Record<string, string>;
  timeout?: number;
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

export const invokeFunction = (
  projectId: string,
  name: string,
  data: FunctionInvokeRequest,
): Promise<FunctionInvokeResponse> => {
  return api.post(`/projects/${projectId}/functions/${encodeURIComponent(name)}/invoke`, data);
};

// ---- Templates ----

export const getFunctionTemplates = (): Promise<FunctionTemplate[]> => {
  return api.get("/function-templates");
};
