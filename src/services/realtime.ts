export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload {
  type: 'realtime';
  sub_id: string;
  event: RealtimeEventType;
  model: string;
  record_id: string | number;
  timestamp: string;
  affected_rows: number;
  data?: Record<string, any>;
  old_data?: Record<string, any>;
}

export interface RealtimeChannel {
  id: string;
  channel: string | string[];
  unsubscribe: () => void;
}

type RealtimeCallback = (payload: RealtimePayload) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private currentProjectId: string | null = null;
  private subscriptions = new Map<string, RealtimeCallback>();
  private subCounter = 0;
  private isConnecting = false;
  private isManualDisconnect = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  private getWebSocketUrl(projectId: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/projects/${projectId}/realtime`;
  }

  /**
   * 建立与指定项目的 WebSocket 连接。
   * 如果已连接相同项目则复用，项目变更时自动重连。
   */
  connect(projectId: string): void {
    // 相同项目且已连接，直接复用
    if (this.currentProjectId === projectId && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    // 项目切换或断线，先断开旧连接
    if (this.ws) {
      this.isManualDisconnect = true;
      this.ws.close();
      this.ws = null;
    }

    this.currentProjectId = projectId;
    this.isConnecting = true;
    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;
    const wsUrl = this.getWebSocketUrl(projectId);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Realtime WebSocket connected:', projectId);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.isManualDisconnect = false;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 处理系统消息
          if (data.type === 'system') {
            switch (data.event) {
              case 'subscribe_ok':
                console.log(`Realtime subscribed: ${data.id} ->`, data.channel);
                break;
              case 'unsubscribe_ok':
                console.log(`Realtime unsubscribed: ${data.id}`);
                break;
              case 'heartbeat_ok':
                break;
              case 'error':
                console.error('Realtime error:', data.message);
                break;
            }
            return;
          }

          // 处理实时事件推送
          if (data.type === 'realtime') {
            const callback = this.subscriptions.get(data.sub_id);
            if (callback) {
              callback(data as RealtimePayload);
            }
            return;
          }
        } catch (error) {
          console.error('Failed to parse Realtime WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Realtime WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();

        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Realtime reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            if (this.currentProjectId) {
              this.connect(this.currentProjectId);
            }
          }, this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Realtime WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create Realtime WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * 订阅指定表（channel）的变更事件。
   *
   * @param channel  表名，支持单表字符串、多表数组或 "*" 通配符
   * @param callback 收到变更事件时的回调
   */
  subscribe(channel: string | string[], callback: RealtimeCallback): RealtimeChannel {
    const id = `sub-${++this.subCounter}`;
    this.subscriptions.set(id, callback);

    const sendSubscribe = () => {
      this.ws!.send(JSON.stringify({
        type: 'subscribe',
        id,
        channel,
      }));
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      sendSubscribe();
    } else {
      // 连接就绪后自动发送订阅
      const checkAndSubscribe = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          sendSubscribe();
        } else {
          setTimeout(checkAndSubscribe, 200);
        }
      };
      checkAndSubscribe();
    }

    return {
      id,
      channel,
      unsubscribe: () => this.unsubscribe(id),
    };
  }

  private unsubscribe(id: string): void {
    this.subscriptions.delete(id);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        id,
      }));
    }
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentProjectId = null;
    this.subscriptions.clear();
  }

  reconnect(): void {
    if (this.currentProjectId) {
      const projectId = this.currentProjectId;
      this.disconnect();
      this.connect(projectId);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // 每 30 秒心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const realtimeClient = new RealtimeClient();
export default realtimeClient;
