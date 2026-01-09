import {api} from '@/utils/request'
import {EnvironmentVariables} from '@/types/environment'

/**
 * 获取环境变量
 */
export const getVariables = (projectId: string): Promise<EnvironmentVariables> => {
  return api.get(`/projects/${projectId}/environment/variables`)
}
