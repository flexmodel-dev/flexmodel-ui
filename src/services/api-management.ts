import {api} from '@/utils/request'
import {GraphQLIntrospectionResponse, GraphQLQueryParams, GraphQLResponse} from '@/types/api-management'

/**
 * 执行 GraphQL 查询
 */
export const executeQuery = (projectId: string, data: GraphQLQueryParams): Promise<GraphQLResponse> => {
  return api.post(`/projects/${projectId}/graphql`, data)
}

/**
 * 执行 GraphQL 内省查询
 */
export const executeIntrospectionQuery = (projectId: string, data: GraphQLQueryParams): Promise<GraphQLIntrospectionResponse> => {
  return api.post(`/projects/${projectId}/graphql`, data)
}

/**
 * 执行自定义API查询
 */
export const executeCustomQuery = (
  method: string,
  path: string,
  data: GraphQLQueryParams
): Promise<GraphQLResponse> => {
  const config = {
    method: method.toLowerCase(),
    url: path,
    data: data
  };

  return api.request(config);
}
