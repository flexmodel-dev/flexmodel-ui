import React, {useState} from 'react';
import {Button, Drawer, message, Modal, Space, Spin, Steps, Tag, theme} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  SendOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import {getDarkModeFromStorage} from '@/utils/darkMode';
import dayjs from 'dayjs';
import {
  commitTask,
  CommitTaskRequest,
  FlowInstance,
  FlowInstanceStatus,
  getInstanceData,
  isSuccess,
  NodeInstance,
  NodeInstanceStatus,
  rollbackTask,
  RollbackTaskRequest,
} from '@/services/flow';
import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';

interface ElementInstancesDrawerProps {
  visible: boolean;
  loading: boolean;
  currentFlowInstance: FlowInstance | null;
  elementInstances: NodeInstance[];
  projectId: string;
  onClose: () => void;
  onCommitted?: () => void;
}

const ElementInstancesDrawer: React.FC<ElementInstancesDrawerProps> = ({
                                                                         visible,
                                                                         loading,
                                                                         currentFlowInstance,
                                                                         elementInstances,
                                                                         projectId,
                                                                         onClose,
                                                                         onCommitted,
                                                                       }) => {
  const {token} = theme.useToken();
  const [instanceDataModalVisible, setInstanceDataModalVisible] = useState(false);
  const [instanceDataLoading, setInstanceDataLoading] = useState(false);
  const [instanceDataText, setInstanceDataText] = useState('{}');
  const [commitLoading, setCommitLoading] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  // 获取元素状态标签
  const getStatusTag = (status: number) => {
    const statusMap = {
      [NodeInstanceStatus.DEFAULT]: {text: '未处理', color: token.colorTextSecondary},
      [NodeInstanceStatus.COMPLETED]: {text: '已完成', color: token.colorSuccess},
      [NodeInstanceStatus.ACTIVE]: {text: '处理中', color: token.colorInfo},
      [NodeInstanceStatus.FAILED]: {text: '失败', color: token.colorError},
      [NodeInstanceStatus.DISABLED]: {text: '撤销', color: token.colorTextTertiary},
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: '未知',
      color: token.colorTextSecondary
    };
    return <Tag color={statusInfo.color as any}>{statusInfo.text}</Tag>;
  };

  // 获取步骤状态和图标
  const getStepStatusAndIcon = (status: number) => {
    switch (status) {
      case NodeInstanceStatus.COMPLETED:
        return {
          status: 'finish' as const,
          icon: <CheckCircleOutlined style={{color: token.colorSuccess}}/>
        };
      case NodeInstanceStatus.FAILED:
        return {
          status: 'error' as const,
          icon: <CloseCircleOutlined style={{color: token.colorError}}/>
        };
      case NodeInstanceStatus.DISABLED:
        return {
          status: 'error' as const,
          icon: <MinusCircleOutlined style={{color: token.colorWarning}}/>
        };
      case NodeInstanceStatus.ACTIVE:
        return {
          status: 'process' as const,
          icon: <ClockCircleOutlined style={{color: token.colorWarning}}/>
        };
      default:
        return {
          status: 'wait' as const,
          icon: <PlayCircleOutlined style={{color: token.colorTextSecondary}}/>
        };
    }
  };

  // 查看元素实例数据
  const handleViewInstanceData = async (element: NodeInstance) => {
    if (!currentFlowInstance) {
      message.warning('流程实例信息缺失');
      return;
    }
    if (!element.instanceDataId) {
      message.warning('当前元素无实例数据ID');
      return;
    }
    setInstanceDataModalVisible(true);
    setInstanceDataLoading(true);
    try {
      const {errCode, errMsg, variables} = await getInstanceData(
        projectId,
        currentFlowInstance.flowInstanceId,
        element.instanceDataId
      );
      if (!isSuccess(errCode)) {
        message.warning(errMsg);
        setInstanceDataText('{}');
        return;
      }
      setInstanceDataText(JSON.stringify(variables ?? {}, null, 2));
    } catch (e) {
      console.error('获取元素实例数据失败:', e);
      message.error('获取元素实例数据失败');
      setInstanceDataText('{}');
    } finally {
      setInstanceDataLoading(false);
    }
  };

  // 提交任务
  const handleCommitTask = async (task: NodeInstance) => {
    let variablesText = '{}';
    const isDark = getDarkModeFromStorage();

    Modal.confirm({
      width: 500,
      title: '提交任务',
      content: (
        <div>
          <div style={{marginBottom: 8}}>请输入任务变量（JSON）</div>
          <div style={{border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 6}}>
            <Editor
              height="240px"
              defaultLanguage="json"
              defaultValue={variablesText}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                minimap: {enabled: false},
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
              }}
              onChange={(value) => {
                variablesText = (value || '').toString();
              }}
            />
          </div>
        </div>
      ),
      okText: '提交',
      cancelText: '取消',
      onOk: async () => {
        let variables: Record<string, any> = {};
        const text = (variablesText || '').trim();
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

        if (!currentFlowInstance) {
          message.error('流程实例信息缺失');
          return;
        }

        setCommitLoading(true);
        try {
          const commitData: CommitTaskRequest = {
            flowInstanceId: currentFlowInstance.flowInstanceId,
            taskInstanceId: task.nodeInstanceId,
            variables: variables,
          };

          const {errCode, errMsg} = await commitTask(projectId, currentFlowInstance.flowInstanceId, commitData);
          if (!isSuccess(errCode)) {
            message.warning(errMsg);
            return;
          }
          message.success('任务提交成功');
          if (onCommitted) {
            onCommitted();
          }
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
  const handleRollbackTask = async (task: NodeInstance) => {
    if (!currentFlowInstance) {
      message.error('流程实例信息缺失');
      return;
    }

    Modal.confirm({
      width: 380,
      title: '退回任务',
      content: (
        <div style={{marginTop: 8}}>
          将从【{task.name || task.key}】开始退回，退回到上一个用户任务节点（若已是第一个用户任务节点则退回失败）
        </div>
      ),
      okText: '退回',
      cancelText: '取消',
      onOk: async () => {
        setRollbackLoading(true);
        try {
          const data: RollbackTaskRequest = {
            flowInstanceId: currentFlowInstance.flowInstanceId,
            taskInstanceId: task.nodeInstanceId,
          };
          const {errCode, errMsg} = await rollbackTask(projectId, currentFlowInstance.flowInstanceId, data);
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
      }
    });
  };

  // 渲染操作按钮
  const renderActionButtons = (element: NodeInstance) => {
    const isUserTask = element.type === FlowElementType.USER_TASK;
    const canCommit = isUserTask
      && currentFlowInstance?.status === FlowInstanceStatus.RUNNING
      && element.status === NodeInstanceStatus.ACTIVE;
    if (!canCommit && !element.instanceDataId) {
      return null;
    }
    return (
      <Space size={8}>
        {canCommit && (
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined/>}
            loading={commitLoading}
            onClick={() => handleCommitTask(element)}
          >
            提交
          </Button>
        )}
        {canCommit && (
          <Button
            size="small"
            icon={<RollbackOutlined/>}
            loading={rollbackLoading}
            onClick={() => handleRollbackTask(element)}
          >
            退回
          </Button>
        )}
        <Button
          size="small"
          icon={<EyeOutlined/>}
          disabled={!element.instanceDataId}
          onClick={() => handleViewInstanceData(element)}
        >
          实例数据
        </Button>
      </Space>
    );
  };

  return (
    <>
      <Drawer
        title={
          <div>
            <NodeIndexOutlined style={{marginRight: 8}}/>
            历史元素列表
            {currentFlowInstance && (
              <div style={{fontSize: 14, fontWeight: 'normal', color: token.colorTextSecondary, marginTop: 4}}>
                {currentFlowInstance.flowName} ({currentFlowInstance.flowInstanceId})
              </div>
            )}
          </div>
        }
        width={600}
        open={visible}
        onClose={onClose}
        extra={
          <Button type="primary" onClick={onClose}>
            关闭
          </Button>
        }
      >
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px 0'}}>
            <div>加载中...</div>
          </div>
        ) : elementInstances.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary}}>
            暂无元素实例
          </div>
        ) : (
          <Steps
            orientation="vertical"
            size="small"
            items={elementInstances.map((element) => {
              const {status: stepStatus, icon} = getStepStatusAndIcon(element.status);
              return {
                title: (
                  <div style={{display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span>{element.name || element.key}</span>
                      {getStatusTag(element.status)}
                    </div>
                    {renderActionButtons(element)}
                  </div>
                ),
                description: (
                  <div style={{marginTop: 8}}>
                    <div style={{marginBottom: 4}}>
                      <strong>元素ID:</strong> {element.nodeInstanceId}
                    </div>
                    <div style={{marginBottom: 4}}>
                      <strong>节点键:</strong> {element.key}
                    </div>
                    {element.name && (
                      <div style={{marginBottom: 4}}>
                        <strong>节点名称:</strong> {element.name}
                      </div>
                    )}
                    {element.createdAt && (
                      <div style={{marginBottom: 4}}>
                        <strong>创建时间:</strong> {dayjs(element.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    )}
                  </div>
                ),
                status: stepStatus,
                icon: icon,
              };
            })}
          />
        )}
      </Drawer>
      <Modal
        title="元素实例数据"
        open={instanceDataModalVisible}
        width={600}
        onCancel={() => setInstanceDataModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setInstanceDataModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Spin spinning={instanceDataLoading}>
          <div style={{border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 6}}>
            <Editor
              height="320px"
              defaultLanguage="json"
              value={instanceDataText}
              theme={getDarkModeFromStorage() ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: {enabled: false},
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default ElementInstancesDrawer;
