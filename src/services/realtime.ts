export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload {
  type: 'realtime';
  id: string;
  event: RealtimeEventType;
  schema: string;
  model: string;
  commit_timestamp: string;
  new: Record<string, any>;
  old: Record<string, any>;
}

export interface RealtimeChannel {
  id: string;
  channel: string;
  model: string;
  unsubscribe: () => void;
}

type RealtimeCallback = (payload: RealtimePayload) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, RealtimeCallback>();
  private subCounter = 0;
  private isConnecting = false;
  private isManualDisconnect = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/realtime`;
  }

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = this.getWebSocketUrl();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Realtime WebSocket connected');
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
                console.log(`Realtime subscribed: ${data.id} -> ${data.channel}`);
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
            const callback = this.subscriptions.get(data.id);
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
            this.connect();
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

  subscribe(projectId: string, callback: RealtimeCallback, model: string = '*'): RealtimeChannel {
    const id = `sub-${++this.subCounter}`;
    this.subscriptions.set(id, callback);

    const sendSubscribe = () => {
      this.ws!.send(JSON.stringify({
        type: 'subscribe',
        id,
        channel: projectId,
        model,
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
      channel: projectId,
      model,
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
    this.subscriptions.clear();
  }

  reconnect(): void {
    this.isManualDisconnect = false;
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
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
