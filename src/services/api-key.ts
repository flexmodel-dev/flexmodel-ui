import { api } from "@/utils/request";
import type { ApiKey, CreateApiKeyRequest } from "@/types/api-key";

/**
 * 获取项目的 API Key 列表
 */
export const getApiKeys = (projectId: string): Promise<ApiKey[]> => {
  return api.get(`/projects/${projectId}/api-keys`);
};

/**
 * 创建 API Key（返回包含明文 key，仅此一次）
 */
export const createApiKey = (projectId: string, data: CreateApiKeyRequest): Promise<ApiKey> => {
  return api.post(`/projects/${projectId}/api-keys`, data);
};

/**
 * 重新生成 API Key（轮换密钥）
 */
export const regenerateApiKey = (projectId: string, id: string): Promise<ApiKey> => {
  return api.post(`/projects/${projectId}/api-keys/${id}/regenerate`);
};

/**
 * 删除 API Key
 */
export const deleteApiKey = (projectId: string, id: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/api-keys/${id}`);
};
