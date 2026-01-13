/**
 * 成员请求接口
 */
export interface MemberRequest {
  id?: string;
  username: string;
  email: string;
  password?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 成员响应接口
 */
export interface MemberResponse {
  id: string;
  username: string;
  email: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
