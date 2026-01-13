import React, { useEffect, useState } from 'react';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { PromptsProps } from '@ant-design/x';
import { Bubble, Prompts, Sender, Welcome, XProvider } from '@ant-design/x';
import { theme, Tooltip, Typography } from 'antd';
import { ChatContentProps } from './types';
import markdownit from 'markdown-it';

const items: PromptsProps['items'] = [
  {
    key: '1',
    description: '获取数据源列表',
    disabled: false,
  },
  {
    key: '2',
    description: '获取[数据源名称]中所有可用数据模型的列表',
    disabled: false,
  },
  {
    key: '2',
    description: '获取[数据源名称]中[模型名称]的详细信息',
    disabled: false,
  },
 
];

const ChatContent: React.FC<ChatContentProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onCancelRequest
}) => {
  const { token } = theme.useToken();
  const [chatInputValue, setChatInputValue] = useState<string>();

  const handleSubmit = (value: string) => {
    if (value.trim()) {
      onSendMessage(value);
      setChatInputValue(''); // 清空输入框
    }
  };

  const handleCancel = () => {
    if (onCancelRequest) {
      onCancelRequest();
    }
  };

  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    }
  }, [messages]);

  const md = markdownit({ html: true, breaks: true });

  const renderMarkdown = (content: string) => {
    return (
      <Typography>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
        <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
      </Typography>
    );
  };

  return (
    <XProvider>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        color: token.colorText
      }}>
        {/* 对话区域 */}
        <div
          className="chat-messages-container"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: token.paddingSM,
            backgroundColor: token.colorBgContainer,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginMD
          }}
        >
          <Welcome
            style={{ padding: 20 }}
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title="你好, 我是Flexmodel AI助手"
            description="Flexmodel是开源、自主可控的数据处理平台，让数据接口开发更简单、更高效"
          />
          <Prompts
            title="🤔 你想做什么？"
            items={items}
            vertical
            onItemClick={(info: { data: any }) => setChatInputValue(info?.data?.description as string)}
          />
          {messages.map((message, index) => (
            <Bubble
              key={message.id}
              content={renderMarkdown(message.content)}
              placement={message.role === 'user' ? 'end' : 'start'}
              avatar={
                message.role === 'assistant' ? (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: token.colorPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    <RobotOutlined />
                  </div>
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: token.colorSuccess,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    <UserOutlined />
                  </div>
                )
              }
              styles={
                index > 0 && messages[index - 1].role === message.role ?
                  { avatar: { visibility: 'hidden' } } :
                  {}
              }
            />
          ))}

          {isLoading && (
            <Bubble
              content="🤔 AI正在思考中..."
              placement="start"
              avatar={
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: token.colorPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <RobotOutlined />
                </div>
              }
              loading={true}
            />
          )}
        </div>

        {/* 输入区域 */}
        <div style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: token.paddingSM,
          backgroundColor: token.colorBgContainer
        }}>
          <Sender
            placeholder="请输入您的问题..."
            value={chatInputValue}
            onChange={setChatInputValue}
            onSubmit={handleSubmit}
            disabled={isLoading}
            onCancel={handleCancel}
            style={{ width: '100%' }}
            suffix={(_, info) => {
              const { SendButton, LoadingButton } = info.components;
              if (isLoading) {
                return (
                  <Tooltip title="Click to cancel">
                    <LoadingButton onClick={handleCancel} disabled={!isLoading} />
                  </Tooltip>
                );
              }

              return <SendButton disabled={isLoading} />;
            }}
          />
        </div>
      </div>
    </XProvider>
  );
};

export default ChatContent;
