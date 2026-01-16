/**
 * 分页结果接口
 * @template T 数据类型
 */
export interface PagedResult<T> {
  list: T[];
  total: number;
}
