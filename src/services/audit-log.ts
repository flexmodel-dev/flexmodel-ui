import {api} from '@/utils/request'
import type {PagedResult} from '@/types/record'
import type {AuditLog} from '@/types/log'

export interface AuditLogParams {
  action?: string
  resourceType?: string
  userId?: string
  traceId?: string
  page?: number
  size?: number
}

/**
 * 分页查询审计日志
 */
export const getAuditLogs = (
  projectId: string,
  params?: AuditLogParams,
): Promise<PagedResult<AuditLog>> => {
  return api.get(`/projects/${projectId}/audit-logs`, {...params})
}
