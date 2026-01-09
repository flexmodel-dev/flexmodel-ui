import React, {useEffect, useState} from "react";
import dayjs, {Dayjs} from "dayjs";
import type {ApiStat, RankingData} from '@/types/overview.d.ts';
import TrendAnalysis from '@/components/common/TrendAnalysis';
import StatisticsCards from '@/pages/Overview/components/StatisticsCards';
import UnifiedMonitoring from "@/pages/Overview/components/metrics/UnifiedMonitoring.tsx";
import {getApiLogStat} from "@/services/api-log";
import {ApiLogStatSchema} from "@/types/api-log";
import {useMetricsData} from "@/pages/Overview/components/metrics/useMetricsData";
import {FmMetricsResponse} from "@/services/metrics";
import {useProject} from "@/store/appStore";


const StatisticsPage: React.FC = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [stats, setStats] = useState<FmMetricsResponse>({
    queryCount: 0,
    mutationCount: 0,
    subscribeCount: 0,
    dataSourceCount: 0,
    modelCount: 0,
    flowDefCount: 0,
    flowExecCount: 0,
    triggerTotalCount: 0,
    jobSuccessCount: 0,
    jobFailureCount: 0,
    requestCount: 0,
  });
  const [apiStat, setApiStat] = useState<ApiStat>({
    dateList: [],
    successData: [],
    failData: [],
  });
  const [rankingData, setRankingData] = useState<RankingData[]>([]);

  // 默认日期范围设置为本周
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);

  // 使用 useMetricsData hook
  const { data: metricsData, loading: metricsLoading, error: metricsError, updateKey } = useMetricsData();

  // 当 metricsData 更新时，更新 stats
  useEffect(() => {
    if (metricsData?.fm) {
      setStats({
        queryCount: metricsData.fm.queryCount || 0,
        mutationCount: metricsData.fm.mutationCount || 0,
        subscribeCount: metricsData.fm.subscribeCount || 0,
        dataSourceCount: metricsData.fm.dataSourceCount || 0,
        modelCount: metricsData.fm.modelCount || 0,
        flowDefCount: metricsData.fm.flowDefCount || 0,
        flowExecCount: metricsData.fm.flowExecCount || 0,
        triggerTotalCount: metricsData.fm.triggerTotalCount || 0,
        jobSuccessCount: metricsData.fm.jobSuccessCount || 0,
        jobFailureCount: metricsData.fm.jobFailureCount || 0,
        requestCount: metricsData.fm.requestCount || 0,
      });
    }
  }, [metricsData]);

  useEffect(() => {
    if (!projectId) return;
    const loadData = async () => {
      const data: ApiLogStatSchema = await getApiLogStat(projectId, {
        dateRange: dateRange
          .map((date: any) => date?.format("YYYY-MM-DD HH:mm:ss"))
          ?.join(","),
      });
      if (data.apiChart) setApiStat(data.apiChart);
      if (data.apiRankingList) setRankingData(data.apiRankingList);
    };
    loadData();
  }, [projectId, dateRange]);

  const handleDateRangeChange = (newDateRange: [Dayjs, Dayjs]) => {
    setDateRange(newDateRange);
  };


  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* 统计卡片组件 */}
      <StatisticsCards stats={stats} />

      {/* 系统监控组件 */}
      <UnifiedMonitoring
        metricsData={metricsData}
        loading={metricsLoading}
        error={metricsError}
        updateKey={updateKey}
      />

      {/* 趋势分析组件 */}
      <TrendAnalysis
        apiStat={apiStat}
        rankingData={rankingData}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default StatisticsPage;

