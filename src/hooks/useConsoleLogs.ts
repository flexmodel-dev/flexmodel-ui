import realtimeClient, { RealtimePayload } from '@/services/realtime';
import type { LogEntry } from '@/services/console';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseConsoleLogsOptions {
  maxLogs?: number;
  autoScroll?: boolean;
  projectId?: string;
}

interface UseConsoleLogsReturn {
  logs: LogEntry[];
  isConnected: boolean;
  connectionState: 'connecting' | 'open' | 'closing' | 'closed';
  clearLogs: () => void;
  reconnect: () => void;
  error: string | null;
  logsEndRef: React.RefObject<HTMLDivElement>;
  setAutoScrollEnabled: (enabled: boolean) => void;
}

function mapRealtimeToLogEntry(payload: RealtimePayload): LogEntry {
  return {
    id: String(payload.record_id),
    timestamp: (payload.data?.created_at as string) || payload.timestamp,
    message: JSON.stringify(payload.data),
    data: payload.data,
    level: 'INFO',
    source: '',
    thread: '',
  };
}

export const useConsoleLogs = (options: UseConsoleLogsOptions = {}): UseConsoleLogsReturn => {
  const { maxLogs = 500, autoScroll = true, projectId } = options;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');
  const [error, setError] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabledRef = useRef<boolean>(autoScroll);
  const setAutoScrollEnabled = useCallback((enabled: boolean) => {
    autoScrollEnabledRef.current = enabled;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const reconnect = useCallback(() => {
    if (projectId) {
      realtimeClient.reconnect();
    }
  }, [projectId]);

  const scrollToBottom = useCallback(() => {
    if (logsEndRef.current) {
      requestAnimationFrame(() => {
        if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      setIsConnected(false);
      setConnectionState('closed');
      return;
    }

    realtimeClient.connect(projectId);

    const statusCheck = setInterval(() => {
      const connected = realtimeClient.isConnected();
      setIsConnected(connected);
      setConnectionState(connected ? 'open' : 'closed');
    }, 2000);

    const channel = realtimeClient.subscribe('f_api_request_log', (payload: RealtimePayload) => {
      if (payload.event === 'INSERT' || payload.event === 'UPDATE') {
        setLogs(prev => {
          const next = [...prev, mapRealtimeToLogEntry(payload)];
          return next.length > maxLogs ? next.slice(-maxLogs) : next;
        });
      }
    });

    setIsConnected(realtimeClient.isConnected());
    setConnectionState(realtimeClient.isConnected() ? 'open' : 'closed');

    return () => {
      clearInterval(statusCheck);
      channel.unsubscribe();
    };
  }, [projectId, maxLogs]);

  useEffect(() => {
    if (logs.length > 0 && autoScrollEnabledRef.current) {
      scrollToBottom();
    }
  }, [logs.length, scrollToBottom]);

  return {
    logs,
    isConnected,
    connectionState,
    addLog: () => {},
    clearLogs,
    reconnect,
    error,
    logsEndRef,
    setAutoScrollEnabled,
  };
};
