/**
 * API日志接口
 */
export interface ApiLog {
  id: string;
  url: string;
  httpMethod: string;
  path: string;
  requestBody: any;
  requestHeaders: Record<string, string>;
  statusCode: number;
  responseTime: number;
  clientIp: string;
  createdAt: string;
  isSuccess: boolean;
  errorMessage?: string;
}

/**
 * API日志模式接口
 */
export interface ApiLogSchema {
  id: string;
  uri?: string;
  level?: string;
  createdAt: string;
  data?: any;
  url: string;
  httpMethod: string;
  path: string;
  requestBody: any;
  requestHeaders: Record<string, any>;
  statusCode: number;
  responseTime: number;
  clientIp: string;
  isSuccess: boolean;
  errorMessage?: string;
}

/**
 * API日志统计模式接口
 */
export interface ApiLogStatSchema {
  apiStatList: {
    date: string;
    total: number;
  }[];
  apiChart: any;
  apiRankingList: any[];
}
