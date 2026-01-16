/**
 * 代理路由接口
 */
interface ProxyRoute {
  path: string;
  to: string;
}

/**
 * 安全设置接口
 */
interface SecuritySettings {
  rateLimitingEnabled: boolean;
  intervalInSeconds: number;
  maxRequestCount: number;
  graphqlEndpointPath?: string;
  graphqlEndpointIdentityProvider?: string | null;
}

/**
 * 代理设置接口
 */
interface ProxySettings {
  routesEnabled: boolean;
  routes: ProxyRoute[];
}

/**
 * 设置接口
 */
export interface Settings {
  appName: string;
  log: Log;
  security: Security;
  proxy: Proxy;
}

/**
 * 日志接口
 */
export interface Log {
  maxDays: number;
  consoleLoggingEnabled: boolean;
}

/**
 * 安全接口
 */
export interface Security {
  rateLimitingEnabled: boolean;
  maxRequestCount: number;
  intervalInSeconds: number;
  graphqlEndpointPath: string;
  graphqlEndpointIdentityProvider: string;
}

/**
 * 代理接口
 */
export interface Proxy {
  routesEnabled: boolean;
  routes: Route[];
}

/**
 * 路由接口
 */
export interface Route {
  path: string;
  to: string;
}
