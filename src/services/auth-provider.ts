import { api } from "@/utils/request";
import type { AuthProviderConfig } from "@/types/auth-provider";

/**
 * 获取项目的认证提供商列表
 */
export const getAuthProviders = (projectId: string): Promise<AuthProviderConfig[]> => {
  return api.get(`/projects/${projectId}/auth-providers`);
};

/**
 * 创建认证提供商
 */
export const createAuthProvider = (projectId: string, data: AuthProviderConfig): Promise<AuthProviderConfig> => {
  return api.post(`/projects/${projectId}/auth-providers`, data);
};

/**
 * 更新认证提供商
 */
export const updateAuthProvider = (projectId: string, name: string, data: AuthProviderConfig): Promise<AuthProviderConfig> => {
  return api.put(`/projects/${projectId}/auth-providers/${name}`, data);
};

/**
 * 删除认证提供商
 */
export const deleteAuthProvider = (projectId: string, name: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/auth-providers/${name}`);
};
