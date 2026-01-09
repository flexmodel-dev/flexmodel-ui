import {api} from '@/utils/request'

// 聊天消息类型
export interface ChatMessage {
  role: string;
  content: string;
}

// 聊天请求参数
export interface ChatRequest {
  conversationId?: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

// 创建对话请求
export interface CreateConversationRequest {
  title?: string;
}

// 发送消息请求
export interface SendMessageRequest {
  conversationId?: string;
  content: string;
}

// 对话信息
export interface Conversation {
  id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: ChatMessage[];
}

/**
 * 发送聊天消息（流式响应）
 */
export const sendChatMessage = async (params: ChatRequest, signal?: AbortSignal): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  return fetch('/api/f/ai/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
    signal
  });
};

/**
 * 获取对话列表
 */
export const getConversations = async (): Promise<Conversation[]> => {
  return api.get<Conversation[]>('/ai/chat/conversations');
};

/**
 * 创建新对话
 */
export const createConversation = async (params: CreateConversationRequest): Promise<Conversation> => {
  return api.post<Conversation>('/ai/chat/conversations', params);
};

/**
 * 获取指定对话信息
 */
export const getConversation = async (id: string): Promise<Conversation> => {
  return api.get<Conversation>(`/ai/chat/conversations/${id}`);
};

/**
 * 删除指定对话
 */
export const deleteConversation = async (id: string): Promise<void> => {
  return api.delete<void>(`/ai/chat/conversations/${id}`);
};

/**
 * 获取对话消息列表
 */
export const getConversationMessages = async (id: string): Promise<ChatMessage[]> => {
  return api.get<ChatMessage[]>(`/ai/chat/conversations/${id}/messages`);
};

/**
 * 向对话发送消息
 */
export const sendMessage = async (params: SendMessageRequest, signal?: AbortSignal): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  return fetch(`/api/f/ai/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
    signal
  });
};
