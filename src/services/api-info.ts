import {api} from '@/utils/request'
import {ApiDefinition, ApiDefinitionHistory} from "@/types/api-management";

/**
 * 获取 API 列表
 */
export const getApis = (projectId: string): Promise<ApiDefinition[]> => {
  return api.get(`/projects/${projectId}/apis`)
}

export const getApiHistories = (projectId: string, apiId: string): Promise<ApiDefinitionHistory[]> => {
  return api.get(`/projects/${projectId}/apis/${apiId}/histories`)
}

export const restoreApiHistory = (projectId: string, apiId: string, historyId: string): Promise<ApiDefinitionHistory> => {
  return api.post(`/projects/${projectId}/apis/${apiId}/histories/${historyId}/restore`)
}

/**
 * 新建 API
 */
export const createApi = (projectId: string, data: any): Promise<any> => {
  return api.post(`/projects/${projectId}/apis`, data)
}

/**
 * 批量生成 API
 */
export const generateAPIs = (projectId: string, data: any): Promise<any> => {
  return api.post(`/projects/${projectId}/apis/generate`, data)
}

/**
 * 更新 API
 */
export const updateApi = (projectId: string, id: string, data: any): Promise<any> => {
  return api.put(`/projects/${projectId}/apis/${id}`, data)
}

/**
 * 更新 API 启用状态
 */
export const updateApiStatus = (projectId: string, id: string, enabled: boolean): Promise<any> => {
  return api.patch(`/projects/${projectId}/apis/${id}`, {enabled})
}

/**
 * 更新 API 名称
 */
export const updateApiName = (projectId: string, id: string, name: string): Promise<any> => {
  return api.patch(`/projects/${projectId}/apis/${id}`, {name})
}

/**
 * 删除 API
 */
export const deleteApi = (projectId: string, id: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/apis/${id}`)
}

