import { api } from '@/utils/request'
import type { ResourceNode, ResourceResponse } from '@/types/resource'

export const getResources = (): Promise<ResourceResponse[]> => {
  return api.get('/resources')
}

export const getResourceTree = (): Promise<ResourceNode[]> => {
  return api.get('/resources/tree')
}
