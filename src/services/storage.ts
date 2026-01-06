import {StorageSchema, ValidateStorageResult} from '@/types/storage'

const mockStorageList: StorageSchema[] = [
  {
    name: 'default-s3',
    type: 'S3',
    config: {
      type: 'S3',
      s3: {
        accessKey: 'AKIAIOSFODNN7EXAMPLE',
        secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        bucket: 'my-bucket',
        region: 'us-east-1',
        endpoint: 'https://s3.amazonaws.com',
        pathStyle: false
      }
    },
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    name: 'local-storage',
    type: 'LOCAL',
    config: {
      type: 'LOCAL',
      local: {
        basePath: '/data/storage',
        maxFileSize: 104857600
      }
    },
    enabled: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

export const getStorageList = (): Promise<StorageSchema[]> => {
  return Promise.resolve(mockStorageList)
}

export const createStorage = (data: StorageSchema): Promise<StorageSchema> => {
  const newStorage = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockStorageList.push(newStorage)
  return Promise.resolve(newStorage)
}

export const updateStorage = (storageName: string, data: StorageSchema): Promise<StorageSchema> => {
  const index = mockStorageList.findIndex(s => s.name === storageName)
  if (index !== -1) {
    mockStorageList[index] = {
      ...data,
      name: storageName,
      updatedAt: new Date().toISOString()
    }
    return Promise.resolve(mockStorageList[index])
  }
  return Promise.reject(new Error('Storage not found'))
}

export const deleteStorage = (storageName: string): Promise<void> => {
  const index = mockStorageList.findIndex(s => s.name === storageName)
  if (index !== -1) {
    mockStorageList.splice(index, 1)
    return Promise.resolve()
  }
  return Promise.reject(new Error('Storage not found'))
}

export const validateStorage = (data: StorageSchema): Promise<ValidateStorageResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.type === 'S3' && !data.config.s3?.accessKey) {
        resolve({
          success: false,
          errorMsg: 'Access key is required'
        })
      } else {
        resolve({
          success: true,
          time: Math.floor(Math.random() * 500) + 100
        })
      }
    }, 500)
  })
}

export const getStorage = (storageName: string): Promise<StorageSchema> => {
  const storage = mockStorageList.find(s => s.name === storageName)
  if (storage) {
    return Promise.resolve(storage)
  }
  return Promise.reject(new Error('Storage not found'))
}
