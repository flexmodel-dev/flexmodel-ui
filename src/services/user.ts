import {api} from '@/utils/request'
import type {UserRequest, UserResponse} from '@/types/user'

/**
 * 获取用户列表
 * @returns 用户列表
 */
export const getUsers = (): Promise<UserResponse[]> => {
  return api.get('/users')
}

/**
 * 获取用户详情
 * @param userId 用户ID
 * @returns 用户详情
 */
export const getUser = (userId: string): Promise<UserResponse> => {
  return api.get(`/users/${userId}`)
}

/**
 * 创建用户
 * @param data 用户信息
 * @returns 创建的用户信息
 */
export const createUser = (data: UserRequest): Promise<UserResponse> => {
  return api.post('/users', data)
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param data 用户信息
 * @returns 更新后的用户信息
 */
export const updateUser = (userId: string, data: UserRequest): Promise<UserResponse> => {
  return api.put(`/users/${userId}`, data)
}

/**
 * 删除用户
 * @param userId 用户ID
 */
export const deleteUser = (userId: string): Promise<void> => {
  return api.delete(`/users/${userId}`)
}
