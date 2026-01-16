/**
 * 执行接口
 */
export interface Execution {
  preScript?: string;
  postScript?: string;
  executionType?: string;
  query?: string;
  executionScript?: string;
  variables?: Record<string, any>;
  operationName?: string;
  headers?: Record<string, any>;
}

/**
 * GraphQL数据接口
 */
export interface GraphQLData {
  operationName?: string;
  query: string;
  variables?: Record<string, any> | null;
  headers?: Record<string, any> | null;
}

/**
 * 文档IO配置接口
 */
export interface DocumentIOConfig {
  schema?: Record<string, any>;
}

/**
 * 文档配置接口
 */
export interface DocumentConfig {
  input?: DocumentIOConfig;
  output?: DocumentIOConfig;
}

/**
 * API元数据接口
 */
export interface ApiMeta {
  auth?: boolean;
  identityProvider?: string;
  rateLimitingEnabled?: boolean;
  maxRequestCount?: number;
  intervalInSeconds?: number;
  execution?: Execution;
  document?: DocumentConfig;
}

/**
 * API定义接口
 */
export interface ApiDefinition {
  id: string;
  name: string;
  parentId?: string | null;
  type?: string;
  method?: string;
  path?: string;
  children?: ApiDefinition[];
  settingVisible?: boolean;
  data: any;
  meta: ApiMeta;
  enabled: boolean;
  graphql?: GraphQLData;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API定义历史接口
 */
export interface ApiDefinitionHistory {
  id: string;
  name: string;
  parentId?: string | null;
  type?: string;
  method?: string;
  path?: string;
  data: any;
  meta: ApiMeta;
  enabled: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 树节点接口
 */
export interface TreeNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: TreeNode[];
  settingVisible?: boolean;
  data: ApiDefinition;
}

/**
 * API定义模式接口
 */
export interface ApiDefinitionSchema {
  id: string;
  type: ApiType;
  path: string;
  meta: ApiMeta;
  name: string;
  createdAt: string;
  updatedAt: string;
  parentId: string;
  enabled: boolean;
  method: string;
}

/**
 * API定义树DTO接口
 */
export interface ApiDefinitionTreeDTO {
  id: string;
  name: string;
  parentId: string;
  type: ApiType;
  method: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  meta: ApiMeta;
  enabled: boolean;
  children: ApiDefinitionTreeDTO[];
}

/**
 * API定义树模式接口
 */
export interface ApiDefinitionTreeSchema extends ApiDefinitionSchema {
  children: ApiDefinitionTreeDTO[];
}

/**
 * 生成APIs DTO接口
 */
export interface GenerateAPIsDTO {
  datasourceName: string;
  modelName: string;
  apiFolder: string;
  idFieldOfPath: string;
  generateAPIs: string[];
}

/**
 * API类型
 */
export type ApiType = 'FOLDER' | 'API';

/**
 * GraphQL响应接口
 */
export interface GraphQLResponse<T = any> {
  errors: any[];
  data: T;
  extensions: any | null;
  dataPresent: boolean;
}

/**
 * GraphQL内省响应类型
 */
export type GraphQLIntrospectionResponse = GraphQLResponse<{
  __schema: any;
}>;

/**
 * GraphQL查询参数接口
 */
export interface GraphQLQueryParams {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}
