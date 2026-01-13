/**
 * 身份提供者接口
 */
export interface IdentityProvider {
  name: string;
  provider?: {
    type?: string;
    issuer?: string;
    clientId?: string;
    clientSecret?: string;
    [key: string]: any;
  };
  type?: string;
  children?: IdentityProvider[];
  [key: string]: any;
}

/**
 * 身份提供者模式接口
 */
export interface IdentityProviderSchema {
  name: string;
  provider: Record<string, any>;
  createdAt: string;
  updatedAt: string;
} 