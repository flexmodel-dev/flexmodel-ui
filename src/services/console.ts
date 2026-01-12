export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  source: string;
  thread: string;
  message: string;
  data?: any;
}

export interface ConsoleWebSocketMessage {
  type: 'log' | 'error' | 'connected' | 'disconnected';
  data?: LogEntry;
  message?: string;
}

class ConsoleWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Set<(message: ConsoleWebSocketMessage) => void> = new Set();
  private isConnecting = false;
  private mockInterval: NodeJS.Timeout | null = null;
  private isMockMode = false; // 使用真实WebSocket接口
  private isManualDisconnect = false; // 标记是否为手动断开连接

  constructor() {
    if (this.isMockMode) {
      this.startMockMode();
    } else {
      this.connect();
    }
  }

  private getWebSocketUrl(): string {
    // 在开发环境中，使用Vite代理的WebSocket URL
    if (import.meta.env.DEV) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/api/v1/json-rpc-ws`;
    }

    // 生产环境中，根据页面协议选择 ws/wss，并与当前 host 保持一致
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/v1/json-rpc-ws`;
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = this.getWebSocketUrl();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Console WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.isManualDisconnect = false; // 连接成功后重置手动断开标记
        this.notifyListeners({type: 'connected'});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 处理JSON-RPC响应
          if (data.jsonrpc === '2.0') {
            // 处理错误响应
            if (data.error) {
              console.error('WebSocket JSON-RPC error:', data.error);
              this.notifyListeners({
                type: 'error',
                message: data.error.message || 'WebSocket error'
              });
              return;
            }

            // 处理 ping/pong
            if (data.result === 'pong') {
              console.log('WebSocket ping/pong successful');
              return;
            }

            // 处理新的控制台日志格式：result.messageType === 'log'
            if (data.result && data.result.messageType === 'log' && data.result.object) {
              const o = data.result.object;
              const logEntry: LogEntry = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23),
                level: (o.level || 'INFO') as LogEntry['level'],
                source: o.logger || 'unknown',
                thread: o.thread || 'unknown',
                message: o.message || '',
                data: o.data
              };
              this.notifyListeners({ type: 'log', data: logEntry });
              return;
            }

            // 兼容旧的 echo 流程
            if (data.result && typeof data.result === 'string' && data.result !== 'pong') {
              console.log('WebSocket echo response:', data.result);
              return;
            }

            // 兼容旧的日志事件 (method: 'logEvent')
            if (data.method === 'logEvent') {
              const logEntry: LogEntry = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23),
                level: data.level || 'INFO',
                source: data.logger || 'unknown',
                thread: data.thread || 'unknown',
                message: data.message || '',
                data: undefined
              };
              this.notifyListeners({ type: 'log', data: logEntry });
              return;
            }
          }

          // 处理其他格式的日志消息
          const message: ConsoleWebSocketMessage = data;
          this.notifyListeners(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.notifyListeners({
            type: 'error',
            message: 'Failed to parse log message'
          });
        }
      };

      this.ws.onclose = (event) => {
        console.log('Console WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.notifyListeners({type: 'disconnected'});

        // 只有在非手动断开的情况下才自动重连
        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, this.reconnectInterval);
        } else if (this.isManualDisconnect) {
          console.log('Manual disconnect, skipping auto-reconnect');
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      this.ws.onerror = (error) => {
        console.error('Console WebSocket error:', error);
        this.isConnecting = false;
        this.notifyListeners({
          type: 'error',
          message: 'WebSocket connection error'
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.notifyListeners({
        type: 'error',
        message: 'Failed to create WebSocket connection'
      });
    }
  }

  private notifyListeners(message: ConsoleWebSocketMessage): void {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  public subscribe(listener: (message: ConsoleWebSocketMessage) => void): () => void {
    this.listeners.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Mock模式相关方法
  private startMockMode(): void {
    console.log('Console WebSocket running in mock mode');
    this.notifyListeners({type: 'connected'});

    // 启动mock数据生成
    this.mockInterval = setInterval(() => {
      this.generateMockLog();
    }, 2000); // 每2秒生成一条日志
  }

  private generateMockLog(): void {
    const levels: LogEntry['level'][] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const sources = [
      'tec.wet.fle.sql.NamedParameterSqlExecutor',
      'org.quartz.core.QuartzScheduler',
      'com.flexmodel.service.JobService',
      'org.springframework.web.servlet.DispatcherServlet',
      'com.flexmodel.controller.ApiController',
      'com.flexmodel.service.DataSourceService',
      'org.hibernate.SQL',
      'com.flexmodel.security.AuthService'
    ];
    const threads = [
      'FlexmodelScheduler_QuartzSchedulerThread',
      'http-nio-8080-exec-1',
      'main',
      'pool-1-thread-1',
      'HikariPool-1',
      'scheduler-thread-1'
    ];

    const level = levels[Math.floor(Math.random() * levels.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const thread = threads[Math.floor(Math.random() * threads.length)];

    const messages = [
      'SQL Execution time: 2 ms',
      'BaseService initialized with sessionContext: SqlContext',
      'Job execution completed successfully',
      'API request processed',
      'Database connection established',
      'Cache updated',
      'User authentication successful',
      'Data synchronization completed',
      'Scheduled task triggered',
      'File upload completed',
      'Email notification sent',
      'System health check passed'
    ];

    const log: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23),
      level,
      source,
      thread,
      message: messages[Math.floor(Math.random() * messages.length)],
      data: level === 'DEBUG' && Math.random() > 0.5 ? {
        sql: 'SELECT * FROM f_qrtz_job_detail WHERE sched_name = ?',
        params: ['FlexmodelScheduler'],
        result: {count: Math.floor(Math.random() * 10) + 1}
      } : level === 'ERROR' && Math.random() > 0.7 ? {
        error: 'Connection timeout',
        stackTrace: 'at com.flexmodel.service.DatabaseService.connect(DatabaseService.java:45)',
        retryCount: Math.floor(Math.random() * 3) + 1
      } : undefined
    };

    this.notifyListeners({
      type: 'log',
      data: log
    });
  }

  public disconnect(): void {
    this.isManualDisconnect = true; // 标记为手动断开
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    // 不要在此处清空 listeners，避免 onclose 事件无法通知订阅者
    // 订阅者生命周期由 subscribe 返回的 unsubscribe 控制
  }

  public reconnect(): void {
    this.isManualDisconnect = false; // 重连时重置手动断开标记
    this.disconnect();
    this.reconnectAttempts = 0;
    if (this.isMockMode) {
      this.startMockMode();
    } else {
      this.connect();
    }
  }

  public getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (this.isMockMode) {
      return this.mockInterval ? 'open' : 'closed';
    }
    if (!this.ws) return 'closed';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }

  public isConnected(): boolean {
    if (this.isMockMode) {
      return this.mockInterval !== null;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // JSON-RPC方法
  public ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        jsonrpc: '2.0',
        method: 'ping',
        id: Date.now().toString()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  public echo(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        jsonrpc: '2.0',
        method: 'echo',
        params: data,
        id: Date.now().toString()
      };
      this.ws.send(JSON.stringify(message));
    }
  }
}

// 创建单例实例
export const consoleWebSocketService = new ConsoleWebSocketService();

// 导出类型和实例
export default consoleWebSocketService;
