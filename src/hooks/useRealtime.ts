import { useEffect, useRef, useState } from 'react';
import realtimeClient, { RealtimePayload, RealtimeChannel } from '@/services/realtime';

/**
 * React Hook：订阅指定项目（可选指定模型）的实时数据变更事件。
 *
 * @param projectId 项目 ID（channel）
 * @param model     模型名称，"*" 表示所有模型
 * @param callback  收到变更事件时的回调
 * @returns 连接状态和 channel 信息
 *
 * @example
 * ```tsx
 * // 订阅指定模型
 * const { isConnected, channel } = useRealtime('my_project', 'User', (payload) => {
 *   console.log(`${payload.event} on ${payload.model}:`, payload.new);
 * });
 *
 * // 订阅所有模型
 * const { isConnected } = useRealtime('my_project', '*', (payload) => {
 *   console.log(`${payload.event} on ${payload.model}:`, payload.new);
 * });
 * ```
 */
export function useRealtime(
  projectId: string,
  model: string,
  callback: (payload: RealtimePayload) => void
): { isConnected: boolean; channel: RealtimeChannel | null } {
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!projectId) return;

    const ch = realtimeClient.subscribe(projectId, (payload) => {
      callbackRef.current(payload);
    }, model);
    setChannel(ch);
    setIsConnected(realtimeClient.isConnected());

    // 定期检查连接状态（简单实现，可优化为事件驱动）
    const statusCheck = setInterval(() => {
      setIsConnected(realtimeClient.isConnected());
    }, 5000);

    return () => {
      ch.unsubscribe();
      setChannel(null);
      clearInterval(statusCheck);
    };
  }, [projectId, model]);

  return { isConnected, channel };
}
