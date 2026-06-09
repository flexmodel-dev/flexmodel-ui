/**
 * Bucket 访问可见性
 */
export type BucketVisibility = 'PRIVATE' | 'AUTHENTICATED' | 'PUBLIC';

/**
 * 文件类型
 */
export type FileType = 'file' | 'folder';

/**
 * Bucket 模式接口
 */
export interface BucketSchema {
  id: string;
  name: string;
  description?: string;
  visibility: BucketVisibility;
  maxFileSize?: number;
  ownerType: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 存储提供者信息接口
 */
export interface StorageProviderInfo {
  type: string;
  bucket?: string;
  endpoint?: string;
  localPath?: string;
  readOnly: boolean;
}

/**
 * 文件项接口
 */
export interface FileItem {
  name: string;
  type: FileType;
  size?: number;
  lastModified?: string;
  path: string;
}
