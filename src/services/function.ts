import {api} from "@/utils/request";

// ---- Types ----

export interface FunctionResponse {
  id: string;
  projectId: string;
  name: string;
  slug: string;
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
  slug: string,
  data: FunctionDeployRequest,
): Promise<FunctionResponse> => {
  return api.post(`/projects/${projectId}/functions/${slug}/deploy`, data);
};

export const getFunctionList = (
  projectId: string,
  params?: { name?: string; page?: number; size?: number },
): Promise<PageDTO<FunctionResponse>> => {
  return api.get(`/projects/${projectId}/functions`, params);
};

export const getFunction = (
  projectId: string,
  slug: string,
): Promise<FunctionResponse> => {
  return api.get(`/projects/${projectId}/functions/${slug}`);
};

export const deleteFunction = (
  projectId: string,
  slug: string,
): Promise<void> => {
  return api.delete(`/projects/${projectId}/functions/${slug}`);
};

export const invokeFunction = (
  projectId: string,
  slug: string,
  data: FunctionInvokeRequest,
): Promise<FunctionInvokeResponse> => {
  return api.post(`/projects/${projectId}/functions/${slug}/invoke`, data);
};

// ---- Templates ----

export const getFunctionTemplates = (): Promise<FunctionTemplate[]> => {
  return api.get("/function-templates");
};
