/**
 * 用户请求接口
 */
export interface UserRequest {
  id?: string;
  name: string;
  email: string;
  /**
   *  如果提供了新密码，则 hash 后更新
   *  如果没有提供密码，则保留原有的密码 hash
   *  创建用户必传参数
   */
  password?: string;
  roleIds?: string[];
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 用户响应接口
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  roles?: {
    id: string;
    name: string;
  }[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
