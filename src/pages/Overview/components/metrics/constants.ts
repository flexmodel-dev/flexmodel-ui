// 监控组件常量配置

// 定义固定的颜色常量，避免因token变化导致重新计算
export const TAB_COLORS = {
  primary: '#181d26',
  error: '#aa2d00', 
  success: '#39bf45',
  info: '#a8d8c4',
  warning: '#d9a441'
};

// 获取图例配置的函数，支持国际化
export const getChartLegends = (t: (key: string) => string) => ({
  system: [
    `CPU ${t('metrics.usage_percentage')} (%)`, 
    `${t('metrics.memory')} ${t('metrics.usage_percentage')} (%)`, 
    t('metrics.thread'), 
    `${t('metrics.disk')} ${t('metrics.usage_percentage')} (%)`
  ],
  thread: [
    t('metrics.current_threads'), 
    t('metrics.active_interfaces'), 
    t('metrics.blocked_count'), 
    t('metrics.waited_count')
  ],
  disk: [
    `读取速度 (${t('metrics.mb')}/s)`, 
    `写入速度 (${t('metrics.mb')}/s)`, 
    '读取IOPS', 
    '写入IOPS'
  ],
  network: [
    `入站流量 (${t('metrics.mb')}/s)`, 
    `出站流量 (${t('metrics.mb')}/s)`, 
    `入站数据包 (${t('metrics.count')}/s)`, 
    `出站数据包 (${t('metrics.count')}/s)`
  ],
  jvm: [
    `${t('metrics.heap_memory')} ${t('metrics.used')} (${t('metrics.mb')})`, 
    `${t('metrics.non_heap_memory')} ${t('metrics.used')} (${t('metrics.mb')})`, 
    `GC${t('metrics.collection_time')} (${t('metrics.ms')})`, 
    `GC${t('metrics.collection_count')} (${t('metrics.count')})`
  ]
});

// 获取标题配置的函数，支持国际化
export const getChartTitles = (t: (key: string) => string) => ({
  system: t('metrics.system_monitoring_trend'),
  thread: t('metrics.thread_monitoring_trend'),
  disk: t('metrics.disk_io_monitoring_trend'),
  network: t('metrics.network_monitoring_trend'),
  jvm: t('metrics.jvm_monitoring_trend')
});

// 监控Tab接口
export interface MonitoringTab {
  key: string;
  title: string;
  value: number;
  color: string;
  unit?: string;
  showAsProgress?: boolean; // 是否显示为进度条，默认为true
}
