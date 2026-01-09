import {api} from '@/utils/request'
import {DatasourceSchema, ScriptImportPayload} from '@/types/data-source'
import {EntitySchema} from '@/types/data-modeling'

/**
 * 获取数据源列表
 */
export const getDatasourceList = (projectId: string): Promise<DatasourceSchema[]> => {
  return api.get(`/projects/${projectId}/datasources`)
}

/**
 * 同步模型
 */
export const syncModels = (projectId: string, datasourceName: string, models: string[]): Promise<EntitySchema[]> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/sync`, models)
}

/**
 * 导入模型
 */
export const importModels = (projectId: string, datasourceName: string, data: ScriptImportPayload): Promise<void> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/import`, data)
}

/**
 * 校验数据源
 */
export const validateDatasource = (projectId: string, data: DatasourceSchema): Promise<{success: boolean; errorMsg?: string; time?: number}> => {
  return api.post(`/projects/${projectId}/datasources/validate`, data)
}

/**
 * 获取物理模型名称
 */
export const getPhysicsModelNames = (projectId: string, data: DatasourceSchema): Promise<string[]> => {
  return api.post(`/projects/${projectId}/datasources/physics/names`, data)
}

/**
 * 新建数据源
 */
export const createDatasource = (projectId: string, data: DatasourceSchema): Promise<DatasourceSchema> => {
  return api.post(`/projects/${projectId}/datasources`, data)
}

/**
 * 更新数据源
 */
export const updateDatasource = (projectId: string, datasourceName: string, data: DatasourceSchema): Promise<DatasourceSchema> => {
  return api.put(`/projects/${projectId}/datasources/${datasourceName}`, data)
}

/**
 * 删除数据源
 */
export const deleteDatasource = (projectId: string, datasourceName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/datasources/${datasourceName}`)
}

/**
 * 执行原生查询
 */
export const executeNativeQuery = (projectId: string, datasourceName: string, data: {statement: string; parameters?: Record<string, any>}): Promise<{time: number; result: any[]}> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/native-query`, data)
}
