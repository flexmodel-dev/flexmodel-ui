import {api} from '@/utils/request'
import type {LoginRequest, LoginResponse, RefreshResponse} from '@/types/auth'

/**
 * 用户登录
 * @param data 登录请求参数
 * @returns 登录响应信息
 */
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return api.post('/auth/login', data)
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = (): Promise<LoginResponse> => {
  return api.get('/auth/whoami')
}

/**
 * 刷新访问令牌
 * @returns 新的token信息
 */
export const refreshToken = (): Promise<RefreshResponse> => {
  // refreshToken通过cookie自动传递，不需要在请求体中传递
  return api.post('/auth/refresh')
}

/**
 * 用户登出
 * @returns 登出结果
 */
export const logout = (): Promise<void> => {
  // 如果有登出API，可以调用
  // return api.post('/auth/logout')

  return Promise.resolve()
}
