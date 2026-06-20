/**
 * API Key 响应类型
 */
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyType: 'anon' | 'service' | 'custom';
  projectIds?: string;
  readOnly: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  /** 仅在创建时返回一次 */
  key?: string | null;
}

/**
 * 创建 API Key 请求
 */
export interface CreateApiKeyRequest {
  name: string;
  keyType?: string;
  projectIds?: string;
  readOnly?: boolean;
}
