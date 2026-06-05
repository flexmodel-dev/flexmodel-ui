import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';
import {NodeInstanceStatus} from '@/services/flow.ts';
import {Handle, Position} from '@xyflow/react';
import {Tag, theme} from 'antd';
import {
  CloseCircleOutlined,
  LinkOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import React, {useMemo} from 'react';

interface FlowNodeData {
  name?: string;
  key?: string;
  flowElementType?: number;
  status?: number;
  __selected?: boolean;
  [key: string]: any;
}

interface FlowNodeProps {
  data: FlowNodeData;
}

const FlowNode: React.FC<FlowNodeProps> = ({ data }) => {
  const { token } = theme.useToken();
  const status: number | undefined = data?.status;
  const type: number | undefined = data?.flowElementType;

  const { bgColor, borderColor, textColor, tagColor, tagText } = useMemo(() => {
    // 状态色基于 AntD 设计令牌
    if (status === NodeInstanceStatus.COMPLETED) {
      return {
        bgColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        textColor: token.colorSuccessText,
        tagColor: token.colorSuccess,
        tagText: '已完成'
      };
    }
    if (status === NodeInstanceStatus.ACTIVE) {
      return {
        bgColor: token.colorInfoBg,
        borderColor: token.colorInfoBorder,
        textColor: token.colorInfoText,
        tagColor: token.colorInfo,
        tagText: '处理中'
      };
    }
    if (status === NodeInstanceStatus.FAILED) {
      return {
        bgColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
        textColor: token.colorErrorText,
        tagColor: token.colorError,
        tagText: '失败'
      };
    }
    if (status === NodeInstanceStatus.DISABLED) {
      return {
        bgColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderSecondary,
        textColor: token.colorTextTertiary,
        tagColor: token.colorTextTertiary,
        tagText: '撤销'
      };
    }
    return {
      bgColor: token.colorFillSecondary,
      borderColor: token.colorBorderSecondary,
      textColor: token.colorTextSecondary,
      tagColor: token.colorTextSecondary,
      tagText: '未处理'
    };
  }, [status, token]);

  const isSelected = Boolean(data?.__selected);
  const displayName: string = (data?.name && String(data?.name).trim()) ? data?.name : (data?.key || '未命名');

  // 渲染开始/结束事件节点（椭圆形）
  if (type === FlowElementType.START_EVENT || type === FlowElementType.END_EVENT) {
    return (
      <div
        style={{
          width: 96,
          height: 48,
          background: bgColor,
          border: `2px solid ${isSelected ? token.colorPrimary : borderColor}`,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 10px',
          position: 'relative',
          boxShadow: isSelected
            ? '0 4px 12px rgba(27, 97, 201, 0.25)'
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Handle type="target" position={Position.Left} id="left" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Right} id="right" style={{ visibility: 'hidden' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 12, color: textColor, fontWeight: 500 }}>
            {displayName}
          </span>
          <Tag color={tagColor as any} style={{ marginRight: 0, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
            {tagText}
          </Tag>
        </div>
      </div>
    );
  }

  // 渲染网关节点（菱形）
  if (
    type === FlowElementType.EXCLUSIVE_GATEWAY ||
    type === FlowElementType.PARALLEL_GATEWAY ||
    type === FlowElementType.INCLUSIVE_GATEWAY
  ) {
    const gatewayIcon =
      type === FlowElementType.EXCLUSIVE_GATEWAY ? (
        <CloseCircleOutlined style={{ fontSize: '20px', color: textColor, transform: 'rotate(-45deg)' }} />
      ) : type === FlowElementType.PARALLEL_GATEWAY ? (
        <PlusCircleOutlined style={{ fontSize: '20px', color: textColor, transform: 'rotate(-45deg)' }} />
      ) : (
        <MinusCircleOutlined style={{ fontSize: '20px', color: textColor, transform: 'rotate(-45deg)' }} />
      );

    return (
      <div
        style={{
          width: 60,
          height: 60,
          background: bgColor,
          border: `2px solid ${isSelected ? token.colorPrimary : borderColor}`,
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 8,
          boxShadow: isSelected
            ? '0 4px 12px rgba(27, 97, 201, 0.25)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Handle type="target" position={Position.Left} id="left" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Right} id="right" style={{ visibility: 'hidden' }} />
        {gatewayIcon}
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%) rotate(-45deg)',
            fontSize: '10px',
            color: token.colorTextSecondary,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Tag color={tagColor as any} style={{ marginRight: 0, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
            {tagText}
          </Tag>
        </div>
      </div>
    );
  }

  // 渲染调用活动节点
  if (type === FlowElementType.CALL_ACTIVITY) {
    return (
      <div
        style={{
          minWidth: 120,
          minHeight: 60,
          background: bgColor,
          border: `2px solid ${isSelected ? token.colorPrimary : borderColor}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          position: 'relative',
          boxShadow: isSelected
            ? '0 4px 12px rgba(27, 97, 201, 0.25)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Handle type="target" position={Position.Left} id="left" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Right} id="right" style={{ visibility: 'hidden' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LinkOutlined style={{ fontSize: '14px', color: textColor }} />
          <span style={{ fontSize: '13px', color: textColor, fontWeight: 500 }}>
            {displayName}
          </span>
        </div>
        <Tag color={tagColor as any} style={{ marginTop: 4, marginRight: 0, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
          {tagText}
        </Tag>
      </div>
    );
  }

  // 渲染任务节点（用户任务、服务任务等）
  const taskIcon =
    type === FlowElementType.USER_TASK ? (
      <UserOutlined style={{ fontSize: '16px', color: textColor }} />
    ) : (
      <SettingOutlined style={{ fontSize: '16px', color: textColor }} />
    );

  return (
    <div
      style={{
        minWidth: 140,
        minHeight: 64,
        background: bgColor,
        border: `2px solid ${isSelected ? token.colorPrimary : borderColor}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 14px',
        position: 'relative',
        boxShadow: isSelected
          ? '0 4px 12px rgba(27, 97, 201, 0.25)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Handle type="target" position={Position.Left} id="left" style={{ visibility: 'hidden' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ visibility: 'hidden' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {taskIcon}
        <div style={{ fontSize: '13px', color: textColor, fontWeight: 500 }}>
          {displayName}
        </div>
      </div>
      <Tag color={tagColor as any} style={{ marginTop: 4, marginRight: 0 }}>
        {tagText}
      </Tag>
    </div>
  );
};

export default FlowNode;
