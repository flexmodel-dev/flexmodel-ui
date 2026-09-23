import {api} from '@/utils/request'
import type {PagedResult} from '@/types/record'
import type {FunctionLog} from '@/types/log'

export interface FunctionLogQuery {
  page?: number
  size?: number
  functionName?: string
  level?: string
  dateRange?: string
  traceId?: string
  keyword?: string
}

export const getFunctionLogs = (
  projectId: string,
  filter?: FunctionLogQuery,
): Promise<PagedResult<FunctionLog>> => {
  return api.get(`/projects/${projectId}/functions/logs`, filter)
}
