import React, {useCallback, useEffect, useState} from 'react';
import {Button, DatePicker, Drawer, Form, Input, Select, Space, Table, theme} from 'antd';
import {DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import {getFunctionLogs} from '@/services/function-log';
import type {FunctionLog} from '@/types/log';

const {RangePicker} = DatePicker;

interface FunctionLogPanelProps {
  projectId: string;
  functionName: string;
}

const FunctionLogPanel: React.FC<FunctionLogPanelProps> = ({projectId, functionName}) => {
  const {token} = theme.useToken();
  const {t} = useTranslation();

  const [tableData, setTableData] = useState<{ list: FunctionLog[]; total: number }>({list: [], total: 0});
  const [log, setLog] = useState<FunctionLog | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({page: 1, size: 20});
  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchData = useCallback(async () => {
    if (!projectId || !functionName) return;
    setLoading(true);
    try {
      const filter = form.getFieldsValue();
      const dateRange = filter?.dateRange
        ?.map((d: any) => d?.format('YYYY-MM-DD HH:mm:ss'))
        ?.join(',');
      const res = await getFunctionLogs(projectId, {
        ...query,
        functionName,
        level: filter?.level,
        dateRange,
        traceId: filter?.traceId,
        keyword: filter?.keyword,
      });
      setTableData({list: res.list, total: res.total});
    } finally {
      setLoading(false);
    }
  }, [projectId, functionName, query, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const search = () => {
    setQuery({page: 1, size: 20});
  };

  const levelColor = (level: string) => {
    if (level === 'error') return token.colorError;
    if (level === 'warn') return token.colorWarning;
    return token.colorText;
  };

  const columns = [
    {
      title: t('function.logLevel', '级别'),
      dataIndex: 'level',
      width: 70,
      render: (level: string) => (
        <span style={{color: levelColor(level), fontFamily: 'monospace'}}>
          {level.toUpperCase()}
        </span>
      ),
    },
    {
      title: t('function.logMessage', '消息'),
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: t('trace_id', 'Trace ID'),
      dataIndex: 'traceId',
      width: 110,
      ellipsis: true,
      render: (traceId: string) => (traceId ? <span>{traceId.slice(0, 8)}…</span> : null),
    },
    {
      title: t('created_at'),
      dataIndex: 'createdAt',
      width: 160,
    },
  ];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Form form={form} layout="inline">
        <div style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
          <Form.Item name="level" label={t('function.logLevel', '级别')} style={{marginBottom: 0}}>
            <Select allowClear style={{width: 120}} placeholder={t('function.logLevel', '级别')}>
              <Select.Option value="log">LOG</Select.Option>
              <Select.Option value="warn">WARN</Select.Option>
              <Select.Option value="error">ERROR</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label={t('date_range')} style={{marginBottom: 0}}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>
          </Form.Item>
          <Form.Item style={{marginBottom: 0}}>
            <Space>
              <Button type="primary" icon={<SearchOutlined/>} onClick={search}>
                {t('search')}
              </Button>
              <Button icon={<ReloadOutlined/>} onClick={fetchData}>
                {t('refresh')}
              </Button>
              <Button type="link" onClick={() => setShowAdvanced(v => !v)}>
                {t('more_filters', '更多筛选')}
                {showAdvanced ? <UpOutlined/> : <DownOutlined/>}
              </Button>
            </Space>
          </Form.Item>
        </div>
        {showAdvanced && (
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
            <Form.Item name="traceId" label="Trace ID" style={{marginBottom: 0}}>
              <Input allowClear placeholder="traceId" style={{width: 180}}/>
            </Form.Item>
            <Form.Item name="keyword" label={t('search_keywords')} style={{marginBottom: 0}}>
              <Input allowClear placeholder={t('search_keywords')} style={{width: 180}}/>
            </Form.Item>
          </div>
        )}
      </Form>

      <Table
        bordered={false}
        size="small"
        loading={loading}
        scroll={{y: 360}}
        columns={columns}
        dataSource={tableData.list}
        rowKey="id"
        rowClassName={() => 'cursor-pointer'}
        onRow={(record) => ({
          onClick: () => {
            setLog(record);
            setDrawerVisible(true);
          },
        })}
        pagination={{
          current: query.page,
          pageSize: query.size,
          total: tableData.total,
          showSizeChanger: true,
          size: 'small',
          showTotal: (total: number, range: [number, number]) =>
            t('pagination_total_text', {start: range[0], end: range[1], total}),
          onChange: (page, size) => setQuery({page, size}),
        }}
      />

      <Drawer
        title={t('function.logDetail', '函数日志详情')}
        size={560}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {log && (
          <div style={{fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
            <p><strong>ID:</strong> {log.id}</p>
            <p><strong>Function:</strong> {log.functionName}</p>
            <p><strong>Level:</strong> <span style={{color: levelColor(log.level)}}>{log.level.toUpperCase()}</span></p>
            <p><strong>Trace ID:</strong> {log.traceId}</p>
            <p><strong>Time:</strong> {log.createdAt}</p>
            <p><strong>Message:</strong></p>
            <div style={{
              background: token.colorFillSecondary,
              padding: 'var(--ant-padding-sm)',
              borderRadius: token.borderRadius,
            }}>
              {log.message}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FunctionLogPanel;
