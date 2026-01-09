import {api} from '@/utils/request'
import {EntitySchema, EnumSchema, IndexSchema, NativeQuerySchema, TypedFieldSchema} from '@/types/data-modeling'

/**
 * 获取模型列表
 */
export const getModelList = (projectId: string, datasourceName: string): Promise<(EntitySchema | EnumSchema | NativeQuerySchema)[]> => {
  return api.get(`/projects/${projectId}/datasources/${datasourceName}/models`)
}

/**
 * 新建模型
 */
export const createModel = (projectId: string, datasourceName: string, data: EntitySchema | EnumSchema | NativeQuerySchema): Promise<EntitySchema | EnumSchema | NativeQuerySchema> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/models`, data)
}

/**
 * 修改模型
 */
export const modifyModel = (projectId: string, datasourceName: string, data: EntitySchema | EnumSchema | NativeQuerySchema): Promise<EntitySchema | EnumSchema | NativeQuerySchema> => {
  return api.put(`/projects/${projectId}/datasources/${datasourceName}/models/${data.name}`, data)
}

/**
 * 删除模型
 */
export const dropModel = (projectId: string, datasourceName: string, modelName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}`)
}

/**
 * 新建字段
 */
export const createField = (projectId: string, datasourceName: string, modelName: string, data: TypedFieldSchema): Promise<TypedFieldSchema> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/fields`, data)
}

/**
 * 修改字段
 */
export const modifyField = (projectId: string, datasourceName: string, modelName: string, fieldName: string, data: TypedFieldSchema): Promise<TypedFieldSchema> => {
  return api.put(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/fields/${fieldName}`, data)
}

/**
 * 删除字段
 */
export const dropField = (projectId: string, datasourceName: string, modelName: string, fieldName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/fields/${fieldName}`)
}

/**
 * 新建索引
 */
export const createIndex = (projectId: string, datasourceName: string, modelName: string, data: IndexSchema): Promise<IndexSchema> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/indexes`, data)
}

/**
 * 修改索引
 */
export const modifyIndex = (projectId: string, datasourceName: string, modelName: string, indexName: string, data: IndexSchema): Promise<IndexSchema> => {
  return api.put(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/indexes/${indexName}`, data)
}

/**
 * 删除索引
 */
export const dropIndex = (projectId: string, datasourceName: string, modelName: string, indexName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/indexes/${indexName}`)
}
