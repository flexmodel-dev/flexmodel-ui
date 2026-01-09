import type {AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios'
import axios from 'axios'
import * as authService from '@/services/auth'

// 错误类型
type ApiError = {
  code: number
  message: string
  status?: number
}

// 基础请求参数类型
export interface BaseRequestParams {
  page?: number
  size?: number
  keywords?: string
}

// 基础响应类型
export interface BaseResponse<T = any> {
  data: T
  total?: number
  page?: number
  size?: number
}

// 错误码常量
const ERROR_CODES = {
  UNAUTHORIZED: 2001,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500
} as const

// API 基础路径
export const BASE_URI = "/api/f"

// 标记是否正在刷新token
let isRefreshing = false
// 存储等待刷新token完成的请求
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// 处理等待队列中的请求
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

/**
 * 统一错误处理
 */
const handleApiError = async (error: AxiosError): Promise<any> => {
  const { response, message: errorMessage, config } = error

  if (!response) {
    return Promise.reject({ code: -1, message: '网络连接失败' })
  }

  const { status, data } = response
  // 类型保护，确保 data 是对象且有 code/message
  let code = status
  let message = errorMessage || '未知错误'
  if (typeof data === 'object' && data !== null) {
    if ('code' in data && typeof (data as any).code === 'number') {
      code = (data as any).code
    }
    if ('message' in data && typeof (data as any).message === 'string') {
      message = (data as any).message
    }
  }

  const apiError: ApiError = {
    code,
    message,
    status
  }

  // 处理401未授权错误，尝试刷新token
  if (status === 401 && config && !config._retry) {
    if (isRefreshing) {
      // 如果正在刷新token，将请求加入队列
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => {
        // 刷新成功后重试原请求
        config._retry = true
        return axiosInstance(config)
      }).catch((err) => {
        return Promise.reject(err)
      })
    }

    config._retry = true
    isRefreshing = true

    try {
      // 尝试刷新token，refreshToken通过cookie自动传递
      const response = await authService.refreshToken()
      localStorage.setItem('token', response.token)

      // 更新当前请求的Authorization头
      if (config.headers) {
        config.headers.Authorization = `Bearer ${response.token}`
      }

      processQueue(null, response.token)
      isRefreshing = false

      // 重试原请求
      return axiosInstance(config)
    } catch (refreshError) {
      // 刷新token失败，清除认证状态
      authService.clearStoredToken()
      processQueue(refreshError, null)
      isRefreshing = false
      return Promise.reject(apiError)
    }
  }

  if (status >= 400 && status < 500) {
    if (code === ERROR_CODES.UNAUTHORIZED) {
      // 未授权
      return Promise.reject(apiError)
    }
    // 其他4xx错误也应该reject
    return Promise.reject(apiError)
  } else if (status >= 500) {
    return Promise.reject(apiError)
  }
  return Promise.resolve(response)
}

/**
 * 创建 axios 实例
 */
const axiosInstance = axios.create({
  baseURL: BASE_URI,
  withCredentials: true,
  timeout: 5 * 60 * 1000,
})

/**
 * 请求拦截器
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

/**
 * 响应拦截器
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleApiError
)

/**
 * 统一请求函数
 */
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config).then((response: AxiosResponse<T>) => {
    if (config.responseType === 'blob') {
      return response.data as T
    }
    return response.data
  })
}

/**
 * API 对象
 */
export const api = {
  get: <T = any>(url: string, params?: Record<string, any>): Promise<T> =>
    request({ url, method: 'get', params }),
  post: <T = any>(url: string, data?: any): Promise<T> =>
    request({ url, method: 'post', data }),
  put: <T = any>(url: string, data?: any): Promise<T> =>
    request({ url, method: 'put', data }),
  patch: <T = any>(url: string, data?: any): Promise<T> =>
    request({ url, method: 'patch', data }),
  delete: <T = any>(url: string): Promise<T> =>
    request({ url, method: 'delete' }),
  request: <T = any>(config: AxiosRequestConfig): Promise<T> =>
    request(config)
}

// 兼容原有导出
export default request
