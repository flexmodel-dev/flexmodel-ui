import {api} from '@/utils/request'
import {ApiLogSchema, ApiLogStatSchema} from '@/types/api-log'
import {PagedResult} from '@/types/record'

/**
 * 获取 API 日志列表
 */
export const getApiLogs = (projectId: string, filter?: {page?: number; size?: number; keyword?: string; dateRange?: string; level?: string; isSuccess?: boolean}): Promise<PagedResult<ApiLogSchema>> => {
  return api.get(`/projects/${projectId}/logs`, filter)
}

/**
 * 获取 API 日志统计
 */
export const getApiLogStat = (projectId: string, filter?: {keyword?: string; dateRange?: string; level?: string; isSuccess?: boolean}): Promise<ApiLogStatSchema> => {
  return api.get(`/projects/${projectId}/logs/stat`, filter)
}
