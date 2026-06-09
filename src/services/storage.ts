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
 * 列出对象
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param prefix 前缀路径
 * @returns 对象列表
 */
export const listObjects = (projectId: string, bucketName: string, prefix?: string): Promise<FileItem[]> => {
  const url = prefix
    ? `/projects/${projectId}/buckets/${bucketName}/objects?prefix=${encodeURIComponent(prefix)}`
    : `/projects/${projectId}/buckets/${bucketName}/objects`
  return api.get(url)
}

/**
 * 上传对象（PUT binary）
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 对象路径
 * @param file 文件对象
 */
export const uploadObject = (projectId: string, bucketName: string, path: string, file: File): Promise<void> => {
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  return api.request({
    url: `/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}`,
    method: 'put',
    data: file,
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}

/**
 * 下载对象
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 对象路径
 * @param fileName 文件名
 */
export const downloadObject = async (projectId: string, bucketName: string, path: string, fileName: string): Promise<void> => {
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  const response = await api.request({
    url: `/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}`,
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
 * 删除对象
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 对象路径
 */
export const deleteObject = (projectId: string, bucketName: string, path: string): Promise<void> => {
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  return api.delete(`/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}`)
}

/**
 * 检查对象是否存在（HEAD 请求）
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 对象路径
 * @returns Response headers 包含 Content-Length、Last-Modified 等
 */
export const headObject = async (projectId: string, bucketName: string, path: string): Promise<{exists: boolean, headers?: Headers}> => {
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  try {
    const response = await api.request({
      url: `/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}`,
      method: 'head'
    });
    return { exists: true, headers: response as any };
  } catch {
    return { exists: false };
  }
}

/**
 * 获取对象元数据
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 对象路径
 * @returns 对象元数据
 */
export const getObjectMetadata = (projectId: string, bucketName: string, path: string): Promise<FileItem> => {
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  return api.get(`/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}/metadata`)
}

/**
 * 创建文件夹（PUT 空对象 + folder=true 查询参数）
 * @param projectId 项目ID
 * @param bucketName Bucket 名称
 * @param path 文件夹路径（如 images）
 */
export const createFolder = (projectId: string, bucketName: string, path: string): Promise<void> => {
  // Strip leading slash to avoid double-slash in URL
  const objectPath = path.startsWith('/') ? path.substring(1) : path;
  return api.request({
    url: `/projects/${projectId}/buckets/${bucketName}/objects/${objectPath}?folder=true`,
    method: 'put',
    data: new Blob([]),
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}
