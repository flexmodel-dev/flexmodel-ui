import { api } from '@/utils/request'
import type { RoleRequest, RoleResponse } from '@/types/role'

export const getRoles = (): Promise<RoleResponse[]> => {
  return api.get('/roles')
}

export const getRole = (roleId: string): Promise<RoleResponse> => {
  return api.get(`/roles/${roleId}`)
}

export const createRole = (data: RoleRequest): Promise<RoleResponse> => {
  return api.post('/roles', data)
}

export const updateRole = (roleId: string, data: RoleRequest): Promise<RoleResponse> => {
  return api.put(`/roles/${roleId}`, data)
}

export const deleteRole = (roleId: string): Promise<void> => {
  return api.delete(`/roles/${roleId}`)
}
