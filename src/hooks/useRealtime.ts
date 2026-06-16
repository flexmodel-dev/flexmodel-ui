import { useEffect, useRef, useState } from 'react';
import realtimeClient, { RealtimePayload, RealtimeChannel } from '@/services/realtime';

/**
 * React Hook：订阅指定项目下指定表（channel）的实时数据变更事件。
 *
 * @param projectId 项目 ID
 * @param channel   表名，支持单表字符串、多表数组或 "*" 通配符
 * @param callback  收到变更事件时的回调
 * @returns 连接状态和 channel 信息
 *
 * @example
 * ```tsx
 * // 订阅指定表
 * const { isConnected, channel } = useRealtime('my_project', 'User', (payload) => {
 *   console.log(`${payload.event} on ${payload.model}:`, payload.data);
 * });
 *
 * // 订阅多张表
 * const { isConnected } = useRealtime('my_project', ['User', 'Order'], (payload) => {
 *   console.log(`${payload.event} on ${payload.model}:`, payload.data);
 * });
 *
 * // 订阅所有表
 * const { isConnected } = useRealtime('my_project', '*', (payload) => {
 *   console.log(`${payload.event} on ${payload.model}:`, payload.data);
 * });
 * ```
 */
export function useRealtime(
  projectId: string,
  channel: string | string[],
  callback: (payload: RealtimePayload) => void
): { isConnected: boolean; channel: RealtimeChannel | null } {
  const [isConnected, setIsConnected] = useState(false);
  const [channelState, setChannelState] = useState<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // channel 可能为数组，序列化为字符串用于 useEffect 依赖比较
  const channelKey = Array.isArray(channel) ? channel.join(',') : channel;

  useEffect(() => {
    if (!projectId || !channelKey) return;

    realtimeClient.connect(projectId);

    const ch = realtimeClient.subscribe(channel, (payload) => {
      callbackRef.current(payload);
    });
    setChannelState(ch);
    setIsConnected(realtimeClient.isConnected());

    // 定期检查连接状态（简单实现，可优化为事件驱动）
    const statusCheck = setInterval(() => {
      setIsConnected(realtimeClient.isConnected());
    }, 5000);

    return () => {
      ch.unsubscribe();
      setChannelState(null);
      clearInterval(statusCheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, channelKey]);

  return { isConnected, channel: channelState };
}
