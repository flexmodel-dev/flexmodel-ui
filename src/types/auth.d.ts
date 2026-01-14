/**
 * 登录请求参数类型
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  name: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string;
  user: UserInfo;
  expiresIn: number;
}

/**
 * 刷新token响应类型
 */
export interface RefreshResponse {
  token: string;
  expiresIn: number;
}

/**
 * 认证状态类型
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 认证方法类型
 */
export interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  setUser: (user: UserInfo) => void;
  setToken: (token: string) => void;
  clearError: () => void;
}

/**
 * 完整的认证store类型
 */
export interface AuthStore extends AuthState, AuthActions {}
