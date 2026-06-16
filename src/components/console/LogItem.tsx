import React, { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { LogEntry } from '@/services/console.ts';

interface LogItemProps {
  log: LogEntry;
  token: any;
}

const LogItem: React.FC<LogItemProps> = React.memo(({ log, token }) => {
  const styles = useMemo(() => ({
    container: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '2px',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: '1.5',
    },
    timestamp: {
      color: token.colorTextSecondary,
      flexShrink: 0,
      whiteSpace: 'nowrap' as const,
    },
    content: {
      color: token.colorText,
      wordBreak: 'break-all' as const,
      flex: 1,
    },
    copyBtn: {
      flexShrink: 0,
      cursor: 'pointer',
      color: token.colorTextQuaternary,
      fontSize: '12px',
      padding: '0 2px',
      opacity: 0,
      transition: 'opacity 0.15s',
    },
  }), [token]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${log.timestamp} ${log.message}`).then(() => {
      message.success('已复制');
    });
  }, [log.timestamp, log.message]);

  return (
    <div
      style={styles.container}
      onMouseEnter={(e) => {
        const btn = e.currentTarget.querySelector('.copy-btn') as HTMLElement;
        if (btn) btn.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget.querySelector('.copy-btn') as HTMLElement;
        if (btn) btn.style.opacity = '0';
      }}
    >
      <span style={styles.timestamp}>{log.timestamp}</span>
      <span style={styles.content}>{log.message}</span>
      <CopyOutlined className="copy-btn" style={styles.copyBtn} onClick={handleCopy} />
    </div>
  );
});

LogItem.displayName = 'LogItem';

export default LogItem;
