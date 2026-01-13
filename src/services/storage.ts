import {api} from '@/utils/request'
import {StorageSchema, FileItem} from '@/types/storage'

/**
 * 获取存储列表
 * @param projectId 项目ID
 * @returns 存储列表
 */
export const getStorageList = (projectId: string): Promise<StorageSchema[]> => {
  return api.get(`/projects/${projectId}/storages`)
}

/**
 * 创建存储
 * @param projectId 项目ID
 * @param data 存储配置
 * @returns 创建的存储信息
 */
export const createStorage = (projectId: string, data: StorageSchema): Promise<StorageSchema> => {
  return api.post(`/projects/${projectId}/storages`, data)
}

/**
 * 更新存储
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param data 存储配置
 * @returns 更新后的存储信息
 */
export const updateStorage = (projectId: string, storageName: string, data: StorageSchema): Promise<StorageSchema> => {
  return api.put(`/projects/${projectId}/storages/${storageName}`, data)
}

/**
 * 删除存储
 * @param projectId 项目ID
 * @param storageName 存储名称
 */
export const deleteStorage = (projectId: string, storageName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/storages/${storageName}`)
}

/**
 * 获取存储详情
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @returns 存储详情
 */
export const getStorage = (projectId: string, storageName: string): Promise<StorageSchema> => {
  return api.get(`/projects/${projectId}/storages/${storageName}`)
}

/**
 * 列出文件
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 路径
 * @returns 文件列表
 */
export const listFiles = (projectId: string, storageName: string, path?: string): Promise<FileItem[]> => {
  const url = path 
    ? `/projects/${projectId}/storages/${storageName}/files?path=${encodeURIComponent(path)}`
    : `/projects/${projectId}/storages/${storageName}/files`
  return api.get(url)
}

/**
 * 删除文件
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 文件路径
 */
export const deleteFile = (projectId: string, storageName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/storages/${storageName}/files/delete?path=${encodeURIComponent(path)}`, method: 'delete' })
}

/**
 * 检查文件是否存在
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 文件路径
 * @returns 文件是否存在
 */
export const checkFileExists = (projectId: string, storageName: string, path: string): Promise<{exists: boolean}> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/exists?path=${encodeURIComponent(path)}`)
}

/**
 * 获取文件信息
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 文件路径
 * @returns 文件信息
 */
export const getFileInfo = (projectId: string, storageName: string, path: string): Promise<FileItem> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/info?path=${encodeURIComponent(path)}`)
}

/**
 * 获取文件大小
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 文件路径
 * @returns 文件大小
 */
export const getFileSize = (projectId: string, storageName: string, path: string): Promise<{size: number}> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/size?path=${encodeURIComponent(path)}`)
}

/**
 * 上传文件
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 目标路径
 * @param file 文件对象
 * @param fileSize 文件大小
 */
export const uploadFile = (projectId: string, storageName: string, path: string, file: File, fileSize?: number): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)
  if (fileSize !== undefined) {
    formData.append('fileSize', fileSize.toString())
  }
  return api.request({
    url: `/projects/${projectId}/storages/${storageName}/files/upload?path=${encodeURIComponent(path)}`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 创建文件夹
 * @param projectId 项目ID
 * @param storageName 存储名称
 * @param path 文件夹路径
 */
export const createFolder = (projectId: string, storageName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/storages/${storageName}/folders/create?path=${encodeURIComponent(path)}`, method: 'post' })
}
