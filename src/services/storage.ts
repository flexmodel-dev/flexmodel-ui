import {api} from '@/utils/request'
import {StorageSchema, FileItem} from '@/types/storage'

export const getStorageList = (projectId: string): Promise<StorageSchema[]> => {
  return api.get(`/projects/${projectId}/storages`)
}

export const createStorage = (projectId: string, data: StorageSchema): Promise<StorageSchema> => {
  return api.post(`/projects/${projectId}/storages`, data)
}

export const updateStorage = (projectId: string, storageName: string, data: StorageSchema): Promise<StorageSchema> => {
  return api.put(`/projects/${projectId}/storages/${storageName}`, data)
}

export const deleteStorage = (projectId: string, storageName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/storages/${storageName}`)
}

export const getStorage = (projectId: string, storageName: string): Promise<StorageSchema> => {
  return api.get(`/projects/${projectId}/storages/${storageName}`)
}

export const listFiles = (projectId: string, storageName: string, path?: string): Promise<FileItem[]> => {
  const url = path 
    ? `/projects/${projectId}/storages/${storageName}/files?path=${encodeURIComponent(path)}`
    : `/projects/${projectId}/storages/${storageName}/files`
  return api.get(url)
}

export const deleteFile = (projectId: string, storageName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/storages/${storageName}/files/delete?path=${encodeURIComponent(path)}`, method: 'delete' })
}

export const checkFileExists = (projectId: string, storageName: string, path: string): Promise<{exists: boolean}> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/exists?path=${encodeURIComponent(path)}`)
}

export const getFileInfo = (projectId: string, storageName: string, path: string): Promise<FileItem> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/info?path=${encodeURIComponent(path)}`)
}

export const getFileSize = (projectId: string, storageName: string, path: string): Promise<{size: number}> => {
  return api.get(`/projects/${projectId}/storages/${storageName}/files/size?path=${encodeURIComponent(path)}`)
}

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

export const createFolder = (projectId: string, storageName: string, path: string): Promise<void> => {
  return api.request({ url: `/projects/${projectId}/storages/${storageName}/folders/create?path=${encodeURIComponent(path)}`, method: 'post' })
}
