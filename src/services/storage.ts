import {api} from '@/utils/request'
import {BucketSchema, FileItem, StorageProviderInfo} from '@/types/storage'

/**
 * 获取 Bucket 列表
 * @param projectId 项目ID
 * @returns Bucket 列表
 */
export const getBucketList = (projectId: string): Promise<BucketSchema[]> => {
  return api.get(`/projects/${projectId}/buckets`)
}

/**
 * 创建 Bucket
 * @param projectId 项目ID
 * @param data Bucket 配置
 * @returns 创建的 Bucket 信息
 */
export const createBucket = (projectId: string, data: BucketSchema): Promise<BucketSchema> => {
  return api.post(`/projects/${projectId}/buckets`, data)
}

/**
 * 更新 Bucket
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param data Bucket 配置
 * @returns 更新后的 Bucket 信息
 */
export const updateBucket = (projectId: string, bucketName: string, data: BucketSchema): Promise<BucketSchema> => {
  return api.put(`/projects/${projectId}/buckets/${bucketName}`, data)
}

/**
 * 删除 Bucket
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param force 是否强制删除（含所有文件）
 */
export const deleteBucket = (projectId: string, bucketName: string, force?: boolean): Promise<void> => {
  const params = force ? '?force=true' : ''
  return api.delete(`/projects/${projectId}/buckets/${bucketName}${params}`)
}

/**
 * 获取 Bucket 详情
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @returns Bucket 详情
 */
export const getBucket = (projectId: string, bucketName: string): Promise<BucketSchema> => {
  return api.get(`/projects/${projectId}/buckets/${bucketName}`)
}

/**
 * 获取存储提供者信息
 * @returns 存储提供者信息
 */
export const getStorageProviderInfo = (): Promise<StorageProviderInfo> => {
  return api.get('/storage/provider')
}

/**
 * 列出文件
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 路径
 * @returns 文件列表
 */
export const listFiles = (projectId: string, bucketName: string, path?: string): Promise<FileItem[]> => {
  const url = path
    ? `/projects/${projectId}/buckets/${bucketName}/files?path=${encodeURIComponent(path)}`
    : `/projects/${projectId}/buckets/${bucketName}/files`
  return api.get(url)
}

/**
 * 删除文件
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件路径
 */
export const deleteFile = (projectId: string, bucketName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/buckets/${bucketName}/files/delete?path=${encodeURIComponent(path)}`, method: 'delete' })
}

/**
 * 检查文件是否存在
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件路径
 * @returns 文件是否存在
 */
export const checkFileExists = (projectId: string, bucketName: string, path: string): Promise<{exists: boolean}> => {
  return api.get(`/projects/${projectId}/buckets/${bucketName}/files/exists?path=${encodeURIComponent(path)}`)
}

/**
 * 获取文件信息
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件路径
 * @returns 文件信息
 */
export const getFileInfo = (projectId: string, bucketName: string, path: string): Promise<FileItem> => {
  return api.get(`/projects/${projectId}/buckets/${bucketName}/files/info?path=${encodeURIComponent(path)}`)
}

/**
 * 获取文件大小
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件路径
 * @returns 文件大小
 */
export const getFileSize = (projectId: string, bucketName: string, path: string): Promise<{size: number}> => {
  return api.get(`/projects/${projectId}/buckets/${bucketName}/files/size?path=${encodeURIComponent(path)}`)
}

/**
 * 下载文件
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件路径
 * @param fileName 文件名
 */
export const downloadFile = async (projectId: string, bucketName: string, path: string, fileName: string): Promise<void> => {
  const response = await api.request({
    url: `/projects/${projectId}/buckets/${bucketName}/files/download?path=${encodeURIComponent(path)}`,
    method: 'get',
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response as Blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * 上传文件
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 目标路径
 * @param file 文件对象
 * @param fileSize 文件大小
 */
export const uploadFile = (projectId: string, bucketName: string, path: string, file: File, fileSize?: number): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)
  if (fileSize !== undefined) {
    formData.append('fileSize', fileSize.toString())
  }
  return api.request({
    url: `/projects/${projectId}/buckets/${bucketName}/files/upload?path=${encodeURIComponent(path)}`,
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
 * @param bucketName Bucket 名称
 * @param path 文件夹路径
 */
export const createFolder = (projectId: string, bucketName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/buckets/${bucketName}/folders/create?path=${encodeURIComponent(path)}`, method: 'post' })
}
