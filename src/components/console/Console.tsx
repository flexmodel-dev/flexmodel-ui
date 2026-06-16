import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Input, message, Select, Space, theme, Tooltip, Typography} from 'antd';
import {
  ClearOutlined,
  DisconnectOutlined,
  DownOutlined,
  ReloadOutlined,
  SearchOutlined,
  VerticalAlignBottomOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import {useConsoleLogs} from '@/hooks/useConsoleLogs.ts';
import realtimeClient from '@/services/realtime';
import LogItem from './LogItem.tsx';
import ConsolePerformanceMonitor from './ConsolePerformanceMonitor.tsx';
import {useTranslation} from 'react-i18next';

const { Text } = Typography;
const { Option } = Select;

interface ConsoleProps {
  onToggle: () => void;
  projectId?: string;
}


const Console: React.FC<ConsoleProps> = ({ onToggle, projectId }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [displayLimit, setDisplayLimit] = useState<number>(100); // 默认显示100条

  // 使用WebSocket Hook
  const {
    logs,
    isConnected,
    connectionState,
    clearLogs,
    reconnect,
    error,
    logsEndRef,
    setAutoScrollEnabled
  } = useConsoleLogs({
    maxLogs: 1000, // 减少到1000条以提高性能
    autoScroll: true,
    projectId,
  });

  // 始终置底开关：选中后不管是否滚动，始终保持在底部
  const [stayAtBottom, setStayAtBottom] = useState(false);

  // 选中“始终置底”时，确保自动滚动始终开启
  useEffect(() => {
    if (stayAtBottom) {
      setAutoScrollEnabled(true);
    }
  }, [stayAtBottom, setAutoScrollEnabled]);

  // 根据滚动位置更新自动滚动开关
  const handleContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (stayAtBottom) {
      // 强制保持在底部
      setAutoScrollEnabled(true);
      if (logsEndRef.current) {
        // 使用同步滚动，避免视觉抖动
        logsEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
      return;
    }

    const target = e.currentTarget;
    const threshold = 16; // 离底部阈值
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const isNearBottom = distanceToBottom <= threshold;
    setAutoScrollEnabled(isNearBottom);
  }, [stayAtBottom, setAutoScrollEnabled, logsEndRef]);


  // 智能连接/断开按钮
  const toggleConnection = useCallback(() => {
    if (isConnected) {
      // 当前已连接，执行断开操作
      realtimeClient.disconnect();
      message.success(t('console.ws_disconnected'));
    } else {
      // 当前未连接，执行连接操作
      reconnect();
      message.success(t('console.connecting'));
    }
  }, [isConnected, reconnect, t]);

  // 手动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsEndRef]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 300); // 300ms防抖

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 过滤日志 - 只按关键词过滤
  const filteredLogs = useMemo(() => {
    if (!debouncedSearchKeyword) {
      if (displayLimit === -1 || logs.length <= displayLimit) return logs;
      return logs.slice(-displayLimit);
    }

    const keyword = debouncedSearchKeyword.toLowerCase();
    let result = logs.filter(log =>
      log.message.toLowerCase().includes(keyword)
    );

    if (displayLimit === -1) return result;
    if (result.length > displayLimit) return result.slice(-displayLimit);
    return result;
  }, [logs, debouncedSearchKeyword, displayLimit]);

  // 添加调试信息和性能监控
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Console组件 - 当前日志数量:', logs.length);
      console.log('Console组件 - 连接状态:', isConnected);
      console.log('Console组件 - 过滤后日志数量:', filteredLogs.length);

      // 性能警告
      if (logs.length > 400) {
        console.warn(`Console日志数量较多 (${logs.length}条)，可能影响性能`);
      }
    }
  }, [logs, isConnected, filteredLogs]);

  // 当过滤条件或显示限制变化时，滚动到底部
  useEffect(() => {
    if (filteredLogs.length > 0 && logsEndRef.current) {
      // 使用setTimeout确保DOM更新后再滚动
      setTimeout(() => {
        if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [filteredLogs.length, displayLimit, debouncedSearchKeyword, logsEndRef]);

  // 打开时滚动到底部（交由父组件控制可见性，这里仅在有日志时尝试）
  useEffect(() => {
    if (filteredLogs.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [filteredLogs.length, scrollToBottom]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      borderTop: `1px solid ${token.colorBorder}`,
      background: token.colorBgContainer
    }}>
      {/* 控制栏 */}
      <div style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${token.colorBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: token.colorFillQuaternary,
        width: '100%'
      }}>
        <Space>
          <Text strong>{t('console.title')}</Text>
          <Text type="secondary">
            ({displayLimit === -1 ? t('console.logs_count', { count: filteredLogs.length }) :
              filteredLogs.length > displayLimit ? t('console.showing_last', { displayLimit, total: filteredLogs.length }) :
                t('console.logs_count', { count: filteredLogs.length })})
          </Text>
          <ConsolePerformanceMonitor
            logCount={logs.length}
            filteredCount={filteredLogs.length}
            displayLimit={displayLimit}
            isConnected={isConnected}
          />
          {error && (
            <Text type="danger" style={{ fontSize: '12px' }}>
              {error}
            </Text>
          )}
        </Space>

        <Space>
          <Input
            size="small"
            placeholder={t('console.search_placeholder')}
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            size="small"
            value={displayLimit}
            onChange={setDisplayLimit}
            style={{ width: 80 }}
          >
            <Option value={100}>{t('console.limit_items', { count: 100 })}</Option>
            <Option value={300}>{t('console.limit_items', { count: 300 })}</Option>
            <Option value={500}>{t('console.limit_items', { count: 500 })}</Option>
            <Option value={1000}>{t('console.limit_items', { count: 1000 })}</Option>
            <Option value={-1}>{t('console.limit_all')}</Option>
          </Select>
          <Tooltip title={t('console.font_size')}>
            <div style={{ display: 'inline-flex' }}>
              <Button
                size="small"
                icon={<ZoomOutOutlined />}
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <Button
                size="small"
                icon={<ZoomInOutlined />}
                onClick={() => setFontSize(Math.min(16, fontSize + 1))}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 }}
              />
            </div>
          </Tooltip>
          <Tooltip title={isConnected ? t('console.disconnect') : t('console.connect')}>
            <Button
              size="small"
              icon={isConnected ? <DisconnectOutlined /> : <ReloadOutlined />}
              onClick={toggleConnection}
              loading={connectionState === 'connecting'}
              type={isConnected ? "default" : "primary"}
              danger={isConnected}
            />
          </Tooltip>
          <Tooltip title={stayAtBottom ? t('console.stay_at_bottom_on') : t('console.stay_at_bottom_off')}>
            <Button
              size="small"
              icon={<VerticalAlignBottomOutlined />}
              type={stayAtBottom ? 'primary' : 'default'}
              onClick={() => {
                const next = !stayAtBottom;
                setStayAtBottom(next);
                setAutoScrollEnabled(true);
                if (next) {
                  scrollToBottom();
                }
              }}
              disabled={filteredLogs.length === 0}
            />
          </Tooltip>
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={clearLogs}
          />
          <Button
            size="small"
            icon={<DownOutlined />}
            onClick={onToggle}
          />
        </Space>
      </div>

      {/* 日志内容区域 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: `${fontSize}px`,
        lineHeight: '1.4',
        background: token.colorBgLayout,
        width: '100%'
      }} onScroll={handleContentScroll}>
        {filteredLogs.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: token.colorTextSecondary
          }}>
            <Text type="secondary">{t('console.no_logs')}</Text>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogItem
              key={log.id}
              log={log}
              token={token}
            />
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default Console;
