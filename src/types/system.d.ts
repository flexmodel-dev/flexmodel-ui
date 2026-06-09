import type {StorageProviderInfo} from '@/types/storage'

/**
 * 系统配置接口
 */
export interface SystemProfile {
  settings: Record<string, any>;
  apiRootPath: string;
  storageProvider: StorageProviderInfo;
}
