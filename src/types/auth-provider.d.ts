/**
 * 认证提供商配置
 */
export interface AuthProviderConfig {
  name: string;
  projectId?: string;
  type: 'oidc' | 'function';
  enabled: boolean;
  config: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * OIDC 配置
 */
export interface OidcConfig {
  type: 'oidc';
  issuer: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Function 配置
 */
export interface FunctionConfig {
  type: 'function';
  functionName: string;
}
