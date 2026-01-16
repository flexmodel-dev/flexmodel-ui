import {api} from '@/utils/request'
import {IdentityProviderSchema} from '@/types/identity-provider'

/**
 * 获取身份提供商列表
 */
export const getIdentityProviders = (projectId: string): Promise<IdentityProviderSchema[]> => {
  return api.get(`/projects/${projectId}/identity-providers`)
}

/**
 * 新建身份提供商
 */
export const createIdentityProvider = (projectId: string, data: IdentityProviderSchema): Promise<IdentityProviderSchema> => {
  return api.post(`/projects/${projectId}/identity-providers`, data)
}

/**
 * 更新身份提供商
 */
export const updateIdentityProvider = (projectId: string, id: string, data: IdentityProviderSchema): Promise<IdentityProviderSchema> => {
  return api.put(`/projects/${projectId}/identity-providers/${id}`, data)
}

/**
 * 删除身份提供商
 */
export const deleteIdentityProvider = (projectId: string, id: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/identity-providers/${id}`)
}

