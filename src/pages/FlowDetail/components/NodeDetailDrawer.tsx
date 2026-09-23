import React, {useEffect, useState} from 'react';
import {Button, Descriptions, Drawer, message, Modal, Space, Spin, Tag, theme} from 'antd';
import {SendOutlined, RollbackOutlined} from '@ant-design/icons';
import {Node} from '@xyflow/react';
import Editor from '@monaco-editor/react';
import {getDarkModeFromStorage} from '@/utils/darkMode';
import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';
import {
  commitTask,
  CommitTaskRequest,
  FlowInstanceStatus,
  getInstanceData,
  isSuccess,
  NodeInstanceStatus,
  rollbackTask,
  RollbackTaskRequest
} from '@/services/flow';

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

interface NodeDetailDrawerProps {
  node: Node | null;
  projectId: string;
  flowInstanceId: string;
  flowStatus: number | undefined;
  onClose: () => void;
  onCommitted?: () => void;
}

const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
                                                             node,
                                                             projectId,
                                                             flowInstanceId,
                                                             flowStatus,
                                                             onClose,
                                                             onCommitted
                                                           }) => {
  const {token} = theme.useToken();
  const [commitLoading, setCommitLoading] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [variablesLoading, setVariablesLoading] = useState(false);
  const [variablesText, setVariablesText] = useState('{}');

  const d: any = node?.data || {};
  const instanceDataId: string | undefined = d.instanceDataId;

  // 选中节点变化时加载节点变量
  useEffect(() => {
    if (!instanceDataId || !projectId || !flowInstanceId) {
      setVariablesText('{}');
      return;
    }
    let cancelled = false;
    setVariablesLoading(true);
    getInstanceData(projectId, flowInstanceId, instanceDataId)
      .then(({errCode, errMsg, variables}) => {
        if (cancelled) return;
        if (!isSuccess(errCode)) {
          message.warning(errMsg);
          setVariablesText('{}');
          return;
        }
        setVariablesText(JSON.stringify(variables ?? {}, null, 2));
      })
      .catch(e => {
        if (cancelled) return;
        console.error('获取节点变量失败:', e);
        message.error('获取节点变量失败');
        setVariablesText('{}');
      })
      .finally(() => {
        if (!cancelled) setVariablesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [node?.id, instanceDataId, projectId, flowInstanceId]);

  if (!node) return null;
  const name = (d.name && String(d.name).trim()) ? d.name : (d.key || '未命名');
  const typeLabel = TYPE_LABEL[d.flowElementType] || '未知';
  const isUserTask = d.flowElementType === FlowElementType.USER_TASK;
  const canCommit = isUserTask && flowStatus === FlowInstanceStatus.RUNNING && d.status === NodeInstanceStatus.ACTIVE;

  const statusInfo = (() => {
    switch (d.status) {
      case NodeInstanceStatus.COMPLETED:
        return {text: '已完成', color: token.colorSuccess};
      case NodeInstanceStatus.ACTIVE:
        return {text: '处理中', color: token.colorInfo};
      case NodeInstanceStatus.FAILED:
        return {text: '失败', color: token.colorError};
      case NodeInstanceStatus.DISABLED:
        return {text: '撤销', color: token.colorTextTertiary};
      default:
        return {text: '未处理', color: token.colorTextSecondary};
    }
  })();

  const excludeKeys = new Set(['name', 'key', 'flowElementType', 'status', 'nodeInstanceId', 'instanceDataId', '__selected']);
  const properties: Record<string, any> = {};
  Object.keys(d).forEach(k => {
    if (!excludeKeys.has(k)) properties[k] = d[k];
  });
  const hasProperties = Object.keys(properties).length > 0;
  const borderStyle = '1px solid ' + token.colorBorderSecondary;
  const isDark = getDarkModeFromStorage();

  // 提交任务
  const handleCommitTask = async () => {
    let variablesInput = '{}';
    Modal.confirm({
      width: 500,
      title: '提交任务',
      content: (
        <div>
          <div style={{marginBottom: 8}}>请输入任务变量（JSON）</div>
          <div style={{border: '1px solid ' + token.colorBorderSecondary, borderRadius: 6}}>
            <Editor
              height='240px'
              defaultLanguage='json'
              defaultValue={variablesInput}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                minimap: {enabled: false},
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
              }}
              onChange={(value) => {
                variablesInput = (value || '').toString();
              }}
            />
          </div>
        </div>
      ),
      okText: '提交',
      cancelText: '取消',
      onOk: async () => {
        let variables: Record<string, any> = {};
        const text = (variablesInput || '').trim();
        if (text.length === 0) {
          variables = {};
        } else {
          try {
            variables = JSON.parse(text);
          } catch (e) {
            message.error('变量需为合法的 JSON');
            throw e as Error;
          }
        }
        setCommitLoading(true);
        try {
          const commitData: CommitTaskRequest = {
            flowInstanceId: flowInstanceId,
            taskInstanceId: d.nodeInstanceId,
            variables: variables,
          };
          const {errCode, errMsg} = await commitTask(projectId, flowInstanceId, commitData);
          if (!isSuccess(errCode)) {
            message.warning(errMsg);
            return;
          }
          message.success('任务提交成功');
          if (onCommitted) onCommitted();
        } catch (error) {
          console.error('提交任务失败:', error);
          message.error('提交任务失败');
        } finally {
          setCommitLoading(false);
        }
      },
    });
  };

  // 退回任务
  const handleRollbackTask = async () => {
    Modal.confirm({
      width: 380,
      title: '退回任务',
      content: (
        <div style={{marginTop: 8}}>
          将从【{name}】开始退回，退回到上一个用户任务节点（若已是第一个用户任务节点则退回失败）
        </div>
      ),
      okText: '退回',
      cancelText: '取消',
      onOk: async () => {
        setRollbackLoading(true);
        try {
          const data: RollbackTaskRequest = {
            flowInstanceId: flowInstanceId,
            taskInstanceId: d.nodeInstanceId,
          };
          const {errCode, errMsg} = await rollbackTask(projectId, flowInstanceId, data);
          if (!isSuccess(errCode)) {
            message.warning(errMsg);
            return;
          }
          message.success('任务已退回');
          if (onCommitted) onCommitted();
        } catch (e) {
          console.error('退回任务失败:', e);
          message.error('退回任务失败');
        } finally {
          setRollbackLoading(false);
        }
      },
    });
  };

  return (
    <Drawer
      title='节点详情'
      width={420}
      open={!!node}
      onClose={onClose}
      mask={false}
      maskClosable={false}
      rootStyle={{filter: 'none'}}
      styles={{body: {padding: 16}}}
      extra={
        canCommit ? (
          <Space size={8}>
            <Button type='primary' size='small' icon={<SendOutlined/>} loading={commitLoading}
                    onClick={handleCommitTask}>提交</Button>
            <Button size='small' icon={<RollbackOutlined/>} loading={rollbackLoading}
                    onClick={handleRollbackTask}>退回</Button>
          </Space>
        ) : undefined
      }
    >
      <Descriptions column={1} size='small' bordered>
        <Descriptions.Item label='节点名称'>{name}</Descriptions.Item>
        <Descriptions.Item label='节点键'>{d.key ?? '-'}</Descriptions.Item>
        <Descriptions.Item label='节点类型'>{typeLabel}</Descriptions.Item>
        <Descriptions.Item label='状态'>
          <Tag color={statusInfo.color as any}>{statusInfo.text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label='节点实例ID'>{d.nodeInstanceId ?? '-'}</Descriptions.Item>
        <Descriptions.Item label='实例数据ID'>{d.instanceDataId ?? '-'}</Descriptions.Item>
      </Descriptions>

      {/* 节点变量 */}
      <div style={{marginTop: 16, marginBottom: 8, fontWeight: 500}}>节点变量</div>
      <Spin spinning={variablesLoading}>
        <div style={{border: borderStyle, borderRadius: 6}}>
          <Editor
            key={'vars-' + variablesText}
            height='220px'
            defaultLanguage='json'
            value={variablesText}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              readOnly: true,
              minimap: {enabled: false},
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </Spin>

      {hasProperties && (
        <>
          <div style={{marginTop: 16, marginBottom: 8, fontWeight: 500}}>节点属性</div>
          <div style={{border: borderStyle, borderRadius: 6}}>
            <Editor
              height='260px'
              defaultLanguage='json'
              value={JSON.stringify(properties, null, 2)}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: {enabled: false},
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </>
      )}
    </Drawer>
  );
};

export default NodeDetailDrawer;
