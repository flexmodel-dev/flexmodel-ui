import React, {useEffect, useState} from 'react';
import {
  Button,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {EyeOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import {DownOutlined, UpOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import PageContainer from '@/components/common/PageContainer';
import {getAuditLogs, AuditLogParams} from '@/services/audit-log';
import type {AuditLog} from '@/types/log';
import {useProject} from '@/store/appStore';
import {DiffEditor} from '@monaco-editor/react';
import {getDarkModeFromStorage} from '@/utils/darkMode';
import {useTableScrollHeight} from '@/hooks/useTableScrollHeight';

const {Text} = Typography;

// 操作类型 -> 标签颜色
const actionTag = (action: string) => {
  switch (action) {
    case 'INSERTED':
      return <Tag color="green">{action}</Tag>;
    case 'UPDATED':
      return <Tag color="blue">{action}</Tag>;
    case 'DELETED':
      return <Tag color="red">{action}</Tag>;
    default:
      return <Tag color="default">{action}</Tag>;
  }
};

// 后端 oldData/newData 以 JSON 字符串存储，尝试美化输出
const prettyJson = (raw?: string) => {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

const AuditLogList: React.FC = () => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [form] = Form.useForm();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {containerRef, scrollY} = useTableScrollHeight();

  const loadLogs = async (params?: AuditLogParams) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getAuditLogs(projectId, {
        page: currentPage,
        size: pageSize,
        ...params,
      });
      setLogs(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error(t('load_audit_log_failed'));
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (values: any) => {
    const params: AuditLogParams = {};
    if (values.action) params.action = values.action;
    if (values.resourceType) params.resourceType = values.resourceType;
    if (values.userId) params.userId = values.userId;
    if (values.traceId) params.traceId = values.traceId;
    setCurrentPage(1);
    loadLogs({...params, page: 1, size: pageSize});
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    loadLogs({page: 1, size: pageSize});
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: t('action_type'),
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => actionTag(action),
    },
    {
      title: t('resource_type'),
      dataIndex: 'resourceType',
      key: 'resourceType',
      width: 180,
      ellipsis: true,
    },
    {
      title: t('resource_name'),
      dataIndex: 'resourceName',
      key: 'resourceName',
      width: 180,
      ellipsis: true,
      render: (name?: string) => name || '-',
    },
    {
      title: t('resource_id'),
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 140,
      ellipsis: true,
    },
    {
      title: t('operator'),
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: true,
      render: (userId?: string) => userId || '-',
    },
    {
      title: t('operation_time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
    },
    {
      title: t('trace_id'),
      dataIndex: 'traceId',
      key: 'traceId',
      width: 140,
      ellipsis: true,
      render: (traceId?: string) =>
        traceId ? (
          <span>
            {traceId.slice(0, 8)}…
          </span>
        ) : null,
    },
    {
      title: t('operation'),
      key: 'action_col',
      width: 90,
      render: (_: any, record: AuditLog) => (
        <Button type="link" icon={<EyeOutlined/>} onClick={() => handleViewDetail(record)}>
          {t('detail')}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('log.audit_logs', '审计日志')}
      extra={
        <Form form={form} layout="inline" onFinish={handleSearch}
              style={{flexDirection: 'column', alignItems: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Form.Item name="action" label={t('action_type')} style={{marginBottom: 0}}>
              <Select placeholder={t('select_action_type')} allowClear style={{width: 140}}>
                <Select.Option value="INSERTED">INSERTED</Select.Option>
                <Select.Option value="UPDATED">UPDATED</Select.Option>
                <Select.Option value="DELETED">DELETED</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="resourceType" label={t('resource_type')} style={{marginBottom: 0}}>
              <Input placeholder={t('input_resource_type')} allowClear style={{width: 180}}/>
            </Form.Item>
            <Form.Item style={{marginBottom: 0}}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined/>}>
                  {t('search')}
                </Button>
                <Button onClick={handleReset}>{t('reset')}</Button>
                <Button icon={<ReloadOutlined/>} onClick={() => loadLogs()}>{t('refresh')}</Button>
                <Button type="link" onClick={() => setShowAdvanced(v => !v)}>
                  {t('more_filters')}
                  {showAdvanced ? <UpOutlined/> : <DownOutlined/>}
                </Button>
              </Space>
            </Form.Item>
          </div>
          {showAdvanced && (
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
              <Form.Item name="userId" label={t('operator')} style={{marginBottom: 0}}>
                <Input placeholder={t('input_operator_id')} allowClear style={{width: 160}}/>
              </Form.Item>
              <Form.Item name="traceId" label={t('trace_id')} style={{marginBottom: 0}}>
                <Input placeholder={t('input_trace_id')} allowClear style={{width: 180}}/>
              </Form.Item>
            </div>
          )}
        </Form>
      }
    >
      <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <div ref={containerRef} style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
          <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="id"
            size="small"
            scroll={{y: scrollY}}
            style={{flex: 1, minHeight: 0}}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                t('pagination_total_text', {start: range[0], end: range[1], total}),
              onChange: handlePageChange,
              onShowSizeChange: (_current, size) => {
                setCurrentPage(1);
                setPageSize(size);
              },
            }}
          />
        </div>
      </div>

      <Modal
        title={t('audit_log_detail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            {t('close')}
          </Button>,
        ]}
        width={800}
      >
        {selectedLog && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label={t('action_type')} span={2}>
              {actionTag(selectedLog.action)}
            </Descriptions.Item>
            <Descriptions.Item label={t('resource_type')}>
              {selectedLog.resourceType}
            </Descriptions.Item>
            <Descriptions.Item label={t('resource_name')}>
              {selectedLog.resourceName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('resource_id')} span={2}>
              {selectedLog.resourceId}
            </Descriptions.Item>
            <Descriptions.Item label={t('operator')}>
              {selectedLog.userId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('operation_time')}>
              {selectedLog.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label={t('trace_id')} span={2}>
              {selectedLog.traceId ? (
                <span>
                  {selectedLog.traceId}
                </span>
              ) : '-'}
            </Descriptions.Item>
            {selectedLog.errorMessage && (
              <Descriptions.Item label={t('error_message')} span={2}>
                <Text type="danger">{selectedLog.errorMessage}</Text>
              </Descriptions.Item>
            )}
            {(selectedLog.oldData || selectedLog.newData) && (
              <Descriptions.Item label={t('change_diff')} span={2}>
                <div style={{height: 400}}>
                  <DiffEditor
                    language="json"
                    theme={getDarkModeFromStorage() ? 'vs-dark' : 'light'}
                    original={prettyJson(selectedLog.oldData)}
                    modified={prettyJson(selectedLog.newData)}
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: {enabled: false},
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  );
};

export default AuditLogList;
