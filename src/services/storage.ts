import {api} from '@/utils/request'
import {StorageSchema, ValidateStorageResult} from '@/types/storage'

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

export const validateStorage = (projectId: string, data: StorageSchema): Promise<ValidateStorageResult> => {
  return api.post(`/projects/${projectId}/storages/validate`, data)
}

export const getStorage = (projectId: string, storageName: string): Promise<StorageSchema> => {
  return api.get(`/projects/${projectId}/storages/${storageName}`)
}
