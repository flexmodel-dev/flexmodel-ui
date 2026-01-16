import {api} from '@/utils/request'
import type {MRecord} from '@/types/data-modeling';
import {PagedResult} from '@/types/record'

/**
 * 获取记录列表
 * @param datasourceName 数据源名称
 * @param modelName 模型名称
 * @param query 查询参数
 * @returns 记录列表
 * @example
 * const query = { page: 1, size: 10,
 *  filter: '{ "id": { "_eq": 1, "_and": { "name": { "_eq": "zhangsan" } } } }',
 *  nestedQuery: true,
 *  sort: [{ "field": "name", "order": "ASC" }, { "field": "id", "order": "DESC" }] }
 * const records = await getRecordList('datasourceName', 'modelName', query)
 */
export const getRecordList = (projectId: string, datasourceName: string, modelName: string, query?: { page: number, size: number, filter?: string, nestedQuery?: boolean, sort?: string }): Promise<PagedResult<MRecord>> => {
  return api.get(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/records`, query)
}

/**
 * 获取单条记录
 */
export const getOneRecord = (projectId: string, datasourceName: string, modelName: string, id: string): Promise<MRecord> => {
  return api.get(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/records/${id}`)
}

/**
 * 新建记录
 */
export const createRecord = (projectId: string, datasourceName: string, modelName: string, data: MRecord): Promise<MRecord> => {
  return api.post(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/records`, data)
}

/**
 * 更新记录
 */
export const updateRecord = (projectId: string, datasourceName: string, modelName: string, id: string, data: MRecord): Promise<MRecord> => {
  return api.put(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/records/${id}`, data)
}

/**
 * 删除记录
 */
export const deleteRecord = (projectId: string, datasourceName: string, modelName: string, id: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/datasources/${datasourceName}/models/${modelName}/records/${id}`)
}
