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

export interface InvokeTokenResponse {
  invokeToken: string;
  runtimeUrl: string;
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

// ---- Invoke Token (Edge Function) ----

/**
 * Get an invoke-token for edge function direct invocation.
 * Returns invokeToken + runtimeUrl for direct Deno Runtime call.
 */
export const getInvokeToken = (
  projectId: string,
  name: string,
): Promise<InvokeTokenResponse> => {
  return api.post(`/projects/${projectId}/functions/${encodeURIComponent(name)}/invoke-token`);
};

// ---- Invoke (Edge Function — direct Deno call) ----

/**
 * Invoke a function via edge route (direct Deno Runtime call).
 * 1. Get invoke-token from Java server
 * 2. Call Deno Runtime directly with the token
 */
export const invokeFunction = async (
  projectId: string,
  name: string,
  data: any,
): Promise<FunctionInvokeResult> => {
  // 1. Get invoke-token from Java server
  const {invokeToken, runtimeUrl} = await getInvokeToken(projectId, name);

  // 2. Call Deno Runtime directly
  const response = await fetch(runtimeUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${invokeToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // 3. Parse response
  let meta: FunctionInvokeMeta | undefined;
  const metaStr = response.headers.get('x-function-meta');
  if (metaStr) {
    try {
      meta = JSON.parse(metaStr);
    } catch { /* ignore */
    }
  }

  let responseData: any;
  try {
    responseData = await response.json();
  } catch {
    responseData = await response.text();
  }

  return {status: response.status, data: responseData, meta};
};

// ---- Invoke (Legacy — via Java server, kept as fallback) ----

/**
 * Invoke a function via Java server (legacy path).
 * Use invokeFunction() for edge function direct invocation instead.
 */
export const invokeFunctionViaServer = async (
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
