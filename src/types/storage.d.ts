/**
 * 存储类型
 */
export type StorageType = 'S3' | 'LOCAL';

/**
 * 文件类型
 */
export type FileType = 'file' | 'folder';

/**
 * S3配置接口
 */
export interface S3Config {
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  endpoint?: string;
  pathStyle?: boolean;
}

/**
 * 本地配置接口
 */
export interface LocalConfig {
  basePath: string;
  maxFileSize?: number;
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  type: StorageType;
  s3?: S3Config;
  local?: LocalConfig;
}

/**
 * 存储模式接口
 */
export interface StorageSchema {
  name: string;
  type: StorageType;
  config: StorageConfig;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
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
