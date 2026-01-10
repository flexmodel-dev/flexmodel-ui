export type StorageType = 'S3' | 'LOCAL';

export type FileType = 'file' | 'folder';

export interface S3Config {
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  endpoint?: string;
  pathStyle?: boolean;
}

export interface LocalConfig {
  basePath: string;
  maxFileSize?: number;
}

export interface StorageConfig {
  type: StorageType;
  s3?: S3Config;
  local?: LocalConfig;
}

export interface StorageSchema {
  name: string;
  type: StorageType;
  config: StorageConfig;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  name: string;
  type: FileType;
  size?: number;
  lastModified?: string;
  path: string;
}
