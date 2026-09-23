import React from 'react';
import {Tag, Space, theme, Typography, Divider} from 'antd';
import {Node} from '@xyflow/react';
import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';
import {FlowInstance, FlowInstanceStatus, NodeInstanceStatus} from '@/services/flow';
import {InfoCircleOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

const TYPE_LABEL: Record<number, string> = {
  [FlowElementType.START_EVENT]: '开始事件',
  [FlowElementType.END_EVENT]: '结束事件',
  [FlowElementType.USER_TASK]: '用户任务',
  [FlowElementType.SERVICE_TASK]: '服务任务',
  [FlowElementType.EXCLUSIVE_GATEWAY]: '排他网关',
  [FlowElementType.PARALLEL_GATEWAY]: '并行网关',
  [FlowElementType.INCLUSIVE_GATEWAY]: '包容网关',
  [FlowElementType.CALL_ACTIVITY]: '调用活动',
  [FlowElementType.SEQUENCE_FLOW]: '顺序流',
};

const STATUS_TAG: Record<number, { text: string; color: string }> = {
  [NodeInstanceStatus.COMPLETED]: {text: '已完成', color: 'colorSuccess'},
  [NodeInstanceStatus.ACTIVE]: {text: '处理中', color: 'colorInfo'},
  [NodeInstanceStatus.FAILED]: {text: '失败', color: 'colorError'},
  [NodeInstanceStatus.DISABLED]: {text: '撤销', color: 'colorTextTertiary'},
  [NodeInstanceStatus.DEFAULT]: {text: '未处理', color: 'colorTextSecondary'},
};

const FLOW_STATUS_TAG: Record<number, { text: string; color: string }> = {
  [FlowInstanceStatus.ACTIVE]: {text: '已完成', color: 'colorSuccess'},
  [FlowInstanceStatus.RUNNING]: {text: '运行中', color: 'colorInfo'},
  [FlowInstanceStatus.TERMINATED]: {text: '已终止', color: 'colorWarning'},
  [FlowInstanceStatus.END]: {text: '已结束', color: 'colorPrimary'},
  [FlowInstanceStatus.DEFAULT]: {text: '初始化', color: 'colorError'},
};

interface NodeSummaryToolbarProps {
  node: Node | null;
  flowInstance: FlowInstance | null;
}

const NodeSummaryToolbar: React.FC<NodeSummaryToolbarProps> = ({node, flowInstance}) => {
  const {token} = theme.useToken();
  const {Text} = Typography;
  const border = '1px solid ' + token.colorBorderSecondary;
  const bg = token.colorFillQuaternary;
  const itemStyle: React.CSSProperties = {display: 'flex', alignItems: 'center', gap: 6};
  const labelStyle: React.CSSProperties = {color: token.colorTextTertiary, fontSize: 12};
  const valueStyle: React.CSSProperties = {fontSize: 13};

  // 第一列：流程信息
  const flowName = flowInstance?.flowName || '-';
  const flowStatusInfo = FLOW_STATUS_TAG[flowInstance?.status ?? -1] || {text: '未知', color: 'colorTextSecondary'};
  const flowStatusColor = (token as any)[flowStatusInfo.color] || token.colorTextSecondary;
  const flowStatus = flowInstance ?
    <Tag color={flowStatusColor as any} style={{marginRight: 0}}>{flowStatusInfo.text}</Tag> : '-';
  const initiator = flowInstance?.initiator || '-';
  const created = flowInstance?.createdAt ? dayjs(flowInstance.createdAt).format('YYYY-MM-DD HH:mm') : '-';

  // 第二列：节点摘要
  const nodeSummary = (() => {
    if (!node) {
      return (
        <Space size={6}>
          <InfoCircleOutlined style={{color: token.colorTextTertiary}}/>
          <Text type='secondary'>点击节点查看详情</Text>
        </Space>
      );
    }
    const d: any = node.data || {};
    const name = (d.name && String(d.name).trim()) ? d.name : (d.key || '未命名');
    const typeLabel = TYPE_LABEL[d.flowElementType] || '未知';
    const statusInfo = STATUS_TAG[d.status] || {text: '未处理', color: 'colorTextSecondary'};
    const statusColor = (token as any)[statusInfo.color] || token.colorTextSecondary;
    return (
      <Space size={16} wrap>
        <div style={itemStyle}>
          <span style={labelStyle}>名称</span>
          <Text strong style={valueStyle}>{name}</Text>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>节点键</span>
          <Text style={valueStyle}>{d.key ?? '-'}</Text>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>类型</span>
          <Text style={valueStyle}>{typeLabel}</Text>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>状态</span>
          <Tag color={statusColor as any} style={{marginRight: 0}}>{statusInfo.text}</Tag>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>实例ID</span>
          <Text style={valueStyle}>{d.nodeInstanceId ?? '-'}</Text>
        </div>
      </Space>
    );
  })();

  return (
    <div style={{
      minHeight: 44,
      padding: '6px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      borderBottom: border,
      background: bg
    }}>
      {/* 第一列：流程信息 */}
      <Space size={16} wrap style={{flexShrink: 0}}>
        <div style={itemStyle}>
          <span style={labelStyle}>流程</span>
          <Text strong style={valueStyle}>{flowName}</Text>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>状态</span>
          {flowStatus}
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>发起人</span>
          <Text style={valueStyle}>{initiator}</Text>
        </div>
        <div style={itemStyle}>
          <span style={labelStyle}>创建时间</span>
          <Text style={valueStyle}>{created}</Text>
        </div>
      </Space>
      <Divider type='vertical' style={{height: 24, margin: '0 4px', alignSelf: 'center'}}/>
      {/* 第二列：节点摘要 */}
      <div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center'}}>
        {nodeSummary}
      </div>
    </div>
  );
};

export default NodeSummaryToolbar;
