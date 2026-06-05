import React, {useCallback, useMemo} from 'react';
import type {LogEntry} from '@/services/console.ts';

interface LogItemProps {
  log: LogEntry;
  getLevelColor: (level: string) => string;
  token: any;
  searchKeyword?: string;
}

const LogItem: React.FC<LogItemProps> = React.memo(({ log, getLevelColor, token, searchKeyword }) => {
  // 缓存样式对象，避免每次渲染时重新创建
  const styles = useMemo(() => ({
    container: { marginBottom: '4px' },
    logLine: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      flexWrap: 'wrap' as const,
      wordBreak: 'break-all' as const
    },
    timestamp: { color: token.colorTextSecondary, flexShrink: 0 },
    level: { fontWeight: 'bold', minWidth: '30px', flexShrink: 0 },
    source: {
      color: token.colorTextSecondary,
      wordBreak: 'break-all' as const,
      overflowWrap: 'break-word' as const
    },
    thread: {
      color: token.colorTextSecondary,
      wordBreak: 'break-all' as const,
      overflowWrap: 'break-word' as const
    },
    message: {
      color: token.colorText,
      wordBreak: 'break-all' as const,
      overflowWrap: 'break-word' as const,
      flex: 1,
    },
    dataContainer: {
      marginLeft: '20px',
      marginTop: '4px',
      padding: '4px 8px',
      background: token.colorFillQuaternary,
      borderRadius: '4px',
      fontSize: '11px',
      wordBreak: 'break-all' as const,
      overflowWrap: 'break-word' as const
    },
    pre: {
      margin: 0,
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-all' as const,
      overflowWrap: 'break-word' as const
    }
  }), [token]);

  // 缓存级别颜色
  const levelColor = useMemo(() => getLevelColor(log.level), [getLevelColor, log.level]);

  // 高亮搜索关键字
  const highlightText = useCallback((text: string, keyword?: string) => {
    if (!keyword || !text) return text;

    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span
            key={index}
            style={{
              backgroundColor: '#f5e9d4',
              color: '#d9a441',
              padding: '1px 2px',
              borderRadius: '2px',
              fontWeight: 'bold',
              border: '1px solid #f4d35e',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }, []);
  return (
    <div style={styles.container}>
      <div style={styles.logLine}>
        <span style={styles.timestamp}>
          {log.timestamp}
        </span>
        <span style={{ ...styles.level, color: levelColor }}>
          {log.level}
        </span>
        <span style={styles.source}>
          [{highlightText(log.source, searchKeyword)}]
        </span>
        <span style={styles.thread}>
          ({highlightText(log.thread, searchKeyword)})
        </span>
        <span style={styles.message}>
          {highlightText(log.message, searchKeyword)}
        </span>
      </div>
      {log.data && (
        <div style={styles.dataContainer}>
          <pre style={styles.pre}>
            {highlightText(JSON.stringify(log.data, null, 2), searchKeyword)}
          </pre>
        </div>
      )}
    </div>
  );
});

LogItem.displayName = 'LogItem';

export default LogItem;
