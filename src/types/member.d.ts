/**
 * 成员请求接口
 */
export interface MemberRequest {
  id?: string;
  name: string;
  email: string;
  /**
   *  如果提供了新密码，则 hash 后更新
   *  如果没有提供密码，则保留原有的密码 hash
   *  创建成员必传参数
   */
  password?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 成员响应接口
 */
export interface MemberResponse {
  id: string;
  name: string;
  email: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
