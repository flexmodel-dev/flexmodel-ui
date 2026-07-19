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
  /**
   * 权限范围：该 OIDC Provider 认证通过后授予调用方的权限串集合。
   * 为 undefined/空数组表示"全部范围"（后端授予 ["*"]）；
   * 非空时仅授予其中列出的权限串。
   * 仅当 UI 上"全部范围"未勾选时才保存到后台。
   */
  permissionScope?: string[];
}

/**
 * Function 配置
 */
export interface FunctionConfig {
  type: 'function';
  functionName: string;
}
