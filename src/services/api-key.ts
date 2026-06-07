import { api } from "@/utils/request";
import type { ApiKey, CreateApiKeyRequest } from "@/types/api-key";

/**
 * 获取所有 API Key 列表
 */
export const getApiKeys = (): Promise<ApiKey[]> => {
  return api.get(`/api-keys`);
};

/**
 * 创建 API Key（返回包含明文 key，仅此一次）
 */
export const createApiKey = (data: CreateApiKeyRequest): Promise<ApiKey> => {
  return api.post(`/api-keys`, data);
};

/**
 * 重新生成 API Key（轮换密钥）
 */
export const regenerateApiKey = (id: string): Promise<ApiKey> => {
  return api.post(`/api-keys/${id}/regenerate`);
};

/**
 * 删除 API Key
 */
export const deleteApiKey = (id: string): Promise<void> => {
  return api.delete(`/api-keys/${id}`);
};
