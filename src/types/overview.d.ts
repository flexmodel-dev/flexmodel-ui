/**
 * 排名数据接口
 */
export interface RankingData {
  name: string;
  total: number;
}

/**
 * API统计接口
 */
export interface ApiStat {
  dateList: string[];
  successData: number[];
  failData: number[];
}
