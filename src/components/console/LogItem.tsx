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
      position: 'relative' as const,
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
    },
    model: {
      color: token.colorText,
      flexShrink: 0,
    },
    content: {
      color: token.colorText,
    },
    copyBtn: {
      position: 'absolute' as const,
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: token.colorTextQuaternary,
      fontSize: '12px',
      padding: '2px 4px',
      background: token.colorBgElevated,
      borderRadius: '2px',
      opacity: 0,
      pointerEvents: 'none' as const,
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
        if (btn) {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget.querySelector('.copy-btn') as HTMLElement;
        if (btn) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        }
      }}
    >
      <span style={styles.timestamp}>{log.timestamp}</span>
      <span style={styles.model}>{log.model}</span>
      <span style={styles.content}>{log.message}</span>
      <CopyOutlined className="copy-btn" style={styles.copyBtn} onClick={handleCopy} />
    </div>
  );
});

LogItem.displayName = 'LogItem';

export default LogItem;
