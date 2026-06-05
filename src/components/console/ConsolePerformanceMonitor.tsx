import React, {useEffect, useState} from 'react';
import {Badge, Tooltip} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';

interface ConsolePerformanceMonitorProps {
  logCount: number;
  filteredCount: number;
  displayLimit: number;
  isConnected: boolean;
}

const ConsolePerformanceMonitor: React.FC<ConsolePerformanceMonitorProps> = React.memo(({
  logCount,
  filteredCount,
  displayLimit,
  isConnected
}) => {
  const [performanceLevel, setPerformanceLevel] = useState<'good' | 'warning' | 'poor'>('good');
  const { t } = useTranslation();

  useEffect(() => {
    // 根据日志数量和显示限制综合评估性能
    const effectiveLogCount = displayLimit === -1 ? logCount : Math.min(logCount, displayLimit);

    if (effectiveLogCount > 500 || (displayLimit > 500 && logCount > 200)) {
      setPerformanceLevel('poor');
    } else if (effectiveLogCount > 300 || (displayLimit > 300 && logCount > 100)) {
      setPerformanceLevel('warning');
    } else {
      setPerformanceLevel('good');
    }
  }, [logCount, displayLimit]);

  const getPerformanceColor = () => {
    switch (performanceLevel) {
      case 'good': return '#39bf45';
      case 'warning': return '#d9a441';
      case 'poor': return '#aa2d00';
      default: return '#9297a0';
    }
  };

  const getPerformanceText = () => {
    switch (performanceLevel) {
      case 'good': return t('console.perf_good');
      case 'warning': return t('console.perf_warning');
      case 'poor': return t('console.perf_poor');
      default: return t('console.unknown');
    }
  };

  const getTooltipContent = () => {
    return (
      <div>
        <div>{t('console.total_logs')}: {logCount}</div>
        <div>{t('console.filtered')}: {filteredCount}</div>
        <div>{t('console.display_limit')}: {displayLimit === -1 ? t('console.limit_all') : t('console.limit_items', { count: displayLimit })}</div>
        <div>{t('console.connection_status')}: {isConnected ? t('console.connected') : t('console.disconnected')}</div>
        <div>{t('console.performance_status')}: {getPerformanceText()}</div>
        {logCount > 400 && <div style={{ color: '#aa2d00' }}>{t('console.suggest_clear_logs')}</div>}
        {displayLimit > 500 && <div style={{ color: '#d9a441' }}>{t('console.too_many_items_may_affect_perf')}</div>}
      </div>
    );
  };

  return (
    <Tooltip title={getTooltipContent()} placement="top">
      <span style={{
        fontSize: '12px',
        color: getPerformanceColor(),
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap'
      }}>
        <Badge
          status={isConnected ? 'success' : 'error'}
          size="small"
        />
        <InfoCircleOutlined style={{ fontSize: '12px' }} />
        <span>{getPerformanceText()}</span>
      </span>
    </Tooltip>
  );
});

ConsolePerformanceMonitor.displayName = 'ConsolePerformanceMonitor';

export default ConsolePerformanceMonitor;
