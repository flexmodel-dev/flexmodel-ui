import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, Input, message, Popconfirm, Select, Space, Table, Tag, Tooltip} from 'antd';
import {
  EyeOutlined,
  HistoryOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons';
import PageContainer from '@/components/common/PageContainer';
import UserTasksDrawer from './UserTasksDrawer.tsx';
import ElementInstancesDrawer from './ElementInstancesDrawer.tsx';
import StartFlowModal from './StartFlowModal.tsx';
import {useNavigate} from 'react-router-dom';
import {
  FlowInstance,
  FlowInstanceListParams,
  getFlowInstance,
  getFlowInstanceList,
  getFlowUserTasks,
  getElementInstances,
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
  const [tableScrollY, setTableScrollY] = useState<number>(300);

  // 用户任务相关状态
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentFlowInstance, setCurrentFlowInstance] = useState<FlowInstance | null>(null);
  const [userTasks, setUserTasks] = useState<NodeInstance[]>([]);

  // 历史元素相关状态
  const [elementsDrawerVisible, setElementsDrawerVisible] = useState(false);
  const [elementsLoading, setElementsLoading] = useState(false);
  const [elementInstances, setElementInstances] = useState<NodeInstance[]>([]);

  // 发起流程相关状态
  const [startFlowModalVisible, setStartFlowModalVisible] = useState(false);

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

  // 计算表格表体可用高度：用 table 顶部到 wrapper 底部的距离作为 table 的可用
  // 高度（flex:1 使 table 填满到 wrapper 底部），再减去表头、分页等占位。
  const updateTableHeight = useCallback(() => {
    const wrapper = tableContainerRef.current;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const table = wrapper.querySelector<HTMLElement>('.ant-table');
    if (!table) return;

    const tableRect = table.getBoundingClientRect();
    // table 顶部到 wrapper 底部的高度
    const tableAvailable = wrapperRect.bottom - tableRect.top;

    // 表头高度：滚动模式下为 .ant-table-header，否则取 .ant-table-thead
    const header =
      wrapper.querySelector<HTMLElement>('.ant-table-header') ||
      wrapper.querySelector<HTMLElement>('.ant-table-thead');
    const headerHeight = header ? header.getBoundingClientRect().height : 39;

    // 分页高度（含上下 margin，否则 .ant-table-pagination 的外边距会漏算导致表体过高、
    // 分页器被外层 overflow:hidden 裁掉底边）
    const pagination = wrapper.querySelector<HTMLElement>('.ant-table-pagination');
    let paginationHeight = 0;
    if (pagination) {
      const pr = pagination.getBoundingClientRect();
      const cs = getComputedStyle(pagination);
      paginationHeight =
        pr.height + parseFloat(cs.marginTop || '0') + parseFloat(cs.marginBottom || '0');
    }

    // 表格内部边距/边框等冗余间距
    const extraSpacing = 8;

    const available = tableAvailable - headerHeight - paginationHeight - extraSpacing;
    setTableScrollY(Math.max(available, 150));
  }, []);

  useLayoutEffect(() => {
    updateTableHeight();
    const ro = new ResizeObserver(updateTableHeight);
    if (tableContainerRef.current) {
      ro.observe(tableContainerRef.current);
    }
    window.addEventListener('resize', updateTableHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateTableHeight);
    };
  }, [updateTableHeight]);

  // 数据加载完成后、表头/分页高度可能变化，重新计算
  useEffect(() => {
    updateTableHeight();
  }, [flowInstanceList, total, loading, updateTableHeight]);

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

  // 获取历史元素列表
  const handleShowElements = async (record: FlowInstance) => {
    setCurrentFlowInstance(record);
    setElementsDrawerVisible(true);
    setElementsLoading(true);
    try {
      const instances = await getElementInstances(projectId, record.flowInstanceId);
      setElementInstances(instances || []);
    } catch (error) {
      console.error('获取历史元素列表失败:', error);
      message.error('获取历史元素列表失败');
    } finally {
      setElementsLoading(false);
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
      title: '发起人',
      dataIndex: 'initiator',
      key: 'initiator',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
                navigate(`/project/${projectId}/flow/instance/${record.flowInstanceId}`);
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
          <Tooltip title="历史元素列表">
            <Button
              type="link"
              icon={<NodeIndexOutlined/>}
              size="small"
              onClick={() => handleShowElements(record)}
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
          <Button type="primary" icon={<PlusOutlined/>} onClick={() => setStartFlowModalVisible(true)}>发起流程</Button>
        </Space>
      ]}
    >
      <div
        ref={tableContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
      <Table
        columns={columns}
        dataSource={flowInstanceList}
        rowKey="flowInstanceId"
        loading={loading}
        scroll={{y: tableScrollY}}
        style={{flex: 1, minHeight: 0}}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
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
      </div>
      {/* 用户任务 Drawer */}
      <UserTasksDrawer
        visible={historyDrawerVisible}
        loading={historyLoading}
        currentFlowInstance={currentFlowInstance}
        userTasks={userTasks}
        projectId={projectId}
        onClose={() => setHistoryDrawerVisible(false)}
        onCommitted={async () => {
          if (currentFlowInstance) {
            try {
              setHistoryLoading(true);
              // 刷新流程实例状态，以判断流程是否已完成并展示结束节点
              const instance = await getFlowInstance(projectId, currentFlowInstance.flowInstanceId);
              setCurrentFlowInstance(instance);
              // 刷新用户任务
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
      {/* 历史元素 Drawer */}
      <ElementInstancesDrawer
        visible={elementsDrawerVisible}
        loading={elementsLoading}
        currentFlowInstance={currentFlowInstance}
        elementInstances={elementInstances}
        projectId={projectId}
        onClose={() => setElementsDrawerVisible(false)}
        onCommitted={async () => {
          if (!currentFlowInstance) return;
          setElementsLoading(true);
          try {
            const instances = await getElementInstances(projectId, currentFlowInstance.flowInstanceId);
            setElementInstances(instances || []);
          } catch (error) {
            console.error('刷新历史元素列表失败:', error);
          } finally {
            setElementsLoading(false);
          }
        }}
      />
      {/* 发起流程 Modal */}
      <StartFlowModal
        visible={startFlowModalVisible}
        projectId={projectId}
        onClose={() => setStartFlowModalVisible(false)}
        onStarted={() => fetchFlowInstanceList()}
      />
    </PageContainer>
  );
};

export default FlowInstanceList;
