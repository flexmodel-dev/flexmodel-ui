import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Input, message, Popconfirm, Select, Space, Table, Tag, Tooltip} from 'antd';
import {EyeOutlined, HistoryOutlined, SearchOutlined, StopOutlined} from '@ant-design/icons';
import PageContainer from '@/components/common/PageContainer';
import UserTasksDrawer from './UserTasksDrawer.tsx';
import {useNavigate} from 'react-router-dom';
import {
  FlowInstance,
  FlowInstanceListParams,
  getFlowInstanceList,
  getFlowUserTasks,
  NodeInstance,
  terminateFlowInstance
} from '@/services/flow';
import dayjs from 'dayjs';
import {t} from 'i18next';
import {useProject} from '@/store/appStore';

const FlowInstanceList: React.FC = () => {
  const navigate = useNavigate();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [terminatingIds, setTerminatingIds] = useState<Set<string>>(new Set());
  const [flowInstanceList, setFlowInstanceList] = useState<FlowInstance[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<FlowInstanceListParams>({
    page: 1,
    size: 20
  });
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [tableScrollY, setTableScrollY] = useState<number>(0);

  // 用户任务相关状态
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentFlowInstance, setCurrentFlowInstance] = useState<FlowInstance | null>(null);
  const [userTasks, setUserTasks] = useState<NodeInstance[]>([]);

  // 获取流程实例列表
  const fetchFlowInstanceList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFlowInstanceList(projectId, searchParams);
      setFlowInstanceList(response.list);
      setTotal(response.total);
    } catch (error) {
      console.error('获取流程实例列表失败:', error);
      message.error('获取流程实例列表失败');
    } finally {
      setLoading(false);
    }
  }, [projectId, searchParams]);

  useEffect(() => {
    fetchFlowInstanceList();
  }, [fetchFlowInstanceList]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setTableScrollY(container.clientHeight - 80);
    };

    updateHeight();

    const ro = new ResizeObserver(() => updateHeight());
    ro.observe(container);

    window.addEventListener('resize', updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // 终止流程实例
  const handleTerminateFlowInstance = async (flowInstanceId: string) => {
    setTerminatingIds(prev => new Set(prev).add(flowInstanceId));
    try {
      await terminateFlowInstance(projectId, flowInstanceId);
      message.success('流程实例终止成功');
      fetchFlowInstanceList();
    } catch (error) {
      console.error('终止流程实例失败:', error);
      message.error('终止流程实例失败');
    } finally {
      setTerminatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowInstanceId);
        return newSet;
      });
    }
  };

  // 获取用户任务
  const handleShowHistory = async (record: FlowInstance) => {
    setCurrentFlowInstance(record);
    setHistoryDrawerVisible(true);
    setHistoryLoading(true);

    try {
      const tasks = await getFlowUserTasks(projectId, record.flowInstanceId);
      setUserTasks(tasks);
    } catch (error) {
      console.error('获取用户任务失败:', error);
      message.error('获取用户任务失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: number) => {
    const statusMap = {
      0: {text: '初始化', color: 'error'},
      1: {text: '已完成', color: 'success'},
      2: {text: '运行中', color: 'processing'},
      3: {text: '已终止', color: 'warning'},
      4: {text: '已结束', color: 'primary'}
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {text: '未知', color: 'default'};
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };


  // 表格列定义
  const columns = [
    {
      title: '流程名称',
      dataIndex: 'flowName',
      key: 'flowName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '流程键',
      dataIndex: 'flowKey',
      key: 'flowKey',
      width: 120,
      ellipsis: true,
    },
    {
      title: '流程实例ID',
      dataIndex: 'flowInstanceId',
      key: 'flowInstanceId',
      width: 200,
    },
    {
      title: '流程模块ID',
      dataIndex: 'flowModuleId',
      key: 'flowModuleId',
      width: 200,
    },
    {
      title: '流程部署ID',
      dataIndex: 'flowDeployId',
      key: 'flowDeployId',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '父流程实例ID',
      dataIndex: 'parentFlowInstanceId',
      key: 'parentFlowInstanceId',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '调用者',
      dataIndex: 'caller',
      key: 'caller',
      width: 120,
    },
    {
      title: '操作者',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: FlowInstance) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined/>}
              size="small"
              onClick={() => {
                navigate(`/flow/instance/${record.flowInstanceId}`);
              }}
            />
          </Tooltip>
          <Tooltip title="用户操作记录">
            <Button
              type="link"
              icon={<HistoryOutlined/>}
              size="small"
              onClick={() => handleShowHistory(record)}
            />
          </Tooltip>
          {record.status === 2 && (
            <Tooltip title="终止">
              <Popconfirm
                title="确定要终止这个流程实例吗？"
                onConfirm={() => handleTerminateFlowInstance(record.flowInstanceId)}
                okText="确定终止"
                cancelText="取消"
                okButtonProps={{danger: true}}
              >
                <Button
                  type="link"
                  danger
                  icon={<StopOutlined/>}
                  size="small"
                  loading={terminatingIds.has(record.flowInstanceId)}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={t("flow_instance")}
      extra={[
        <Space>
          <Input
            placeholder="搜索流程实例ID"
            prefix={<SearchOutlined/>}
            onChange={(e) => {
              setSearchParams({
                ...searchParams,
                flowInstanceId: e.target.value || undefined,
                page: 1
              });
            }}
          />
          <Select
            placeholder="选择状态"
            style={{width: 120}}
            allowClear
            onChange={(value) => {
              setSearchParams({
                ...searchParams,
                status: value,
                page: 1
              });
            }}
          >
            <Select.Option value={1}>已完成</Select.Option>
            <Select.Option value={2}>运行中</Select.Option>
            <Select.Option value={3}>已终止</Select.Option>
            <Select.Option value={4}>已结束</Select.Option>
          </Select>
        </Space>
      ]}
    >
      <Table
        columns={columns}
        dataSource={flowInstanceList}
        rowKey="flowInstanceId"
        loading={loading}
        scroll={{y: tableScrollY || undefined}}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.size,
          total: total,
          showTotal: (total: number, range: any) =>
            t("pagination_total_text", {
              start: range[0],
              end: range[1],
              total: total,
            }),
          onChange: (page: number, size: number) => {
            setSearchParams({
              ...searchParams,
              page,
              size
            });
          }
        }}
      />
      {/* 用户任务 Drawer */}
      <UserTasksDrawer
        visible={historyDrawerVisible}
        loading={historyLoading}
        currentFlowInstance={currentFlowInstance}
        userTasks={userTasks}
        projectId={projectId}
        onClose={() => setHistoryDrawerVisible(false)}
        onCommitted={async () => {
          // 刷新用户任务
          if (currentFlowInstance) {
            try {
              setHistoryLoading(true);
              const tasks = await getFlowUserTasks(projectId, currentFlowInstance.flowInstanceId);
              setUserTasks(tasks);
            } catch {
              // 忽略错误提示，保持最小打扰
            } finally {
              setHistoryLoading(false);
            }
          }
          // 刷新实例列表
          fetchFlowInstanceList();
        }}
      />
    </PageContainer>
  );
};

export default FlowInstanceList;
