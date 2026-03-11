import {api} from '@/utils/request'
import {EntitySchema, EnumSchema, IndexSchema, NativeQuerySchema, TypedFieldSchema} from '@/types/data-modeling'

/**
 * 获取模型列表
 */
export const getModelList = (projectId: string): Promise<(EntitySchema | EnumSchema | NativeQuerySchema)[]> => {
  return api.get(`/projects/${projectId}/models`)
}

/**
 * 新建模型
 */
export const createModel = (projectId: string, data: EntitySchema | EnumSchema | NativeQuerySchema): Promise<EntitySchema | EnumSchema | NativeQuerySchema> => {
  return api.post(`/projects/${projectId}/models`, data)
}

/**
 * 修改模型
 */
export const modifyModel = (projectId: string, data: EntitySchema | EnumSchema | NativeQuerySchema): Promise<EntitySchema | EnumSchema | NativeQuerySchema> => {
  return api.put(`/projects/${projectId}/models/${data.name}`, data)
}

/**
 * 删除模型
 */
export const dropModel = (projectId: string, modelName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/models/${modelName}`)
}

/**
 * 新建字段
 */
export const createField = (projectId: string, modelName: string, data: TypedFieldSchema): Promise<TypedFieldSchema> => {
  return api.post(`/projects/${projectId}/models/${modelName}/fields`, data)
}

/**
 * 修改字段
 */
export const modifyField = (projectId: string, modelName: string, fieldName: string, data: TypedFieldSchema): Promise<TypedFieldSchema> => {
  return api.put(`/projects/${projectId}/models/${modelName}/fields/${fieldName}`, data)
}

/**
 * 删除字段
 */
export const dropField = (projectId: string, modelName: string, fieldName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/models/${modelName}/fields/${fieldName}`)
}

/**
 * 新建索引
 */
export const createIndex = (projectId: string, modelName: string, data: IndexSchema): Promise<IndexSchema> => {
  return api.post(`/projects/${projectId}/models/${modelName}/indexes`, data)
}

/**
 * 修改索引
 */
export const modifyIndex = (projectId: string, modelName: string, indexName: string, data: IndexSchema): Promise<IndexSchema> => {
  return api.put(`/projects/${projectId}/models/${modelName}/indexes/${indexName}`, data)
}

/**
 * 删除索引
 */
export const dropIndex = (projectId: string, modelName: string, indexName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/models/${modelName}/indexes/${indexName}`)
}

/**
 * 执行IDL
 */
export const executeIdl = (projectId: string, idl: string): Promise<(EntitySchema | EnumSchema | NativeQuerySchema)[]> => {
  return api.post(`/projects/${projectId}/models/idl/execute`, { idl })
}
