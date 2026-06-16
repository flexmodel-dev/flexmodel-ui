import React, { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { LogEntry } from '@/services/console.ts';

interface LogItemProps {
  log: LogEntry;
  token: any;
}

/** 一组颜色，按 model 名 hash 分配，保证同一 model 颜色一致 */
const MODEL_COLORS = [
  '#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1',
  '#13c2c2', '#f5222d', '#2f54eb', '#faad14', '#a0d911',
];

function hashModel(model: string): number {
  let hash = 0;
  for (let i = 0; i < model.length; i++) {
    hash = ((hash << 5) - hash) + model.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const LogItem: React.FC<LogItemProps> = React.memo(({ log, token }) => {
  const modelColor = useMemo(() => MODEL_COLORS[hashModel(log.model) % MODEL_COLORS.length], [log.model]);

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
      color: modelColor,
      flexShrink: 0,
      fontWeight: 600,
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
  }), [token, modelColor]);

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
