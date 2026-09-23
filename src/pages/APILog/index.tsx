import React, {useEffect, useRef, useState} from "react";
import {Button, DatePicker, Descriptions, Drawer, Form, Input, Select, Space, Table, Tag, theme,} from "antd";
import PageContainer from "@/components/common/PageContainer";
import {DownOutlined, SearchOutlined, SettingOutlined, UpOutlined,} from "@ant-design/icons";
import {getApiLogs, getApiLogStat} from "@/services/api-log.ts";
import LogSettings from "./components/LogSettings";
import {useTranslation} from "react-i18next";
import type {ApiLog} from '@/types/api-log';
import ApiLogChart from "./components/ApiLogChart";
import {useProject} from "@/store/appStore";

const { RangePicker } = DatePicker;

const LogViewer: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [tableData, setTableData] = useState<{ list: ApiLog[]; total: number }>({ list: [], total: 0 });
  const [log, setLog] = useState<ApiLog | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [chartData, setChartData] = useState<{ xAxis: string[], series: number[] }>({ xAxis: [], series: [] });
  const [expand, setExpand] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [query, setQuery] = useState({ page: 1, size: 100 });
  const [settingsDialogVisible, setSettingsDialogVisible] = useState<boolean>(false);
  const [tableScrollY, setTableScrollY] = useState(300);
  const tableWrapperRef = useRef<HTMLDivElement>(null);


  const getApiLogsHandler = async () => {
    if (!projectId) return;
    const filter = form.getFieldsValue();
    const res = await getApiLogs(projectId, getFilterQuery(filter));
    setTableData({ list: res.list, total: res.total });
  };

  const getApiLogStatHandler = async () => {
    if (!projectId) return;
    const filter = form.getFieldsValue();
    const statList: any[] = (await getApiLogStat(projectId, getFilterQuery(filter)))?.apiStatList || [];
    setChartData({
      xAxis: statList.map((stat) => stat.date),
      series: statList.map((stat) => stat.total)
    });
  };

  const getFilterQuery = (filter: any) => {
    return {
      ...query,
      keyword: filter?.keyword,
      isSuccess:
        filter?.isSuccess === undefined || filter?.isSuccess === null
          ? undefined
          : filter?.isSuccess === true || filter?.isSuccess === "true"
            ? true
            : false,
      dateRange: filter?.dateRange
        ?.map((date: any) => date?.format("YYYY-MM-DD HH:mm:ss"))
        ?.join(","),
    };
  };

  useEffect(() => {
    getApiLogsHandler();
    getApiLogStatHandler();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getApiLogsHandler();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const calcTableHeight = () => {
      if (tableWrapperRef.current) {
        const paginationHeight = 56;
        const headerHeight = 55;
        const available = tableWrapperRef.current.clientHeight - paginationHeight - headerHeight;
        setTableScrollY(Math.max(available, 150));
      }
    };
    calcTableHeight();
    const observer = new ResizeObserver(calcTableHeight);
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current);
    }
    return () => observer.disconnect();
  }, [expand]);

  const showDetail = (record: any) => {
    setLog(record);
    setDrawerVisible(true);
  };

  const searchLog = async () => {
    setQuery({ page: 1, size: 100 });
    await getApiLogsHandler();
    await getApiLogStatHandler();
  };

  const resetLog = async () => {
    form.resetFields();
    setQuery({ page: 1, size: 100 });
    await getApiLogsHandler();
  };

  const columns = [
    {
      title: t("id"),
      dataIndex: "id",
      width: 80,
      ellipsis: true,
    },
    {
      title: t("http_method"),
      dataIndex: "httpMethod",
      width: 80,
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: t("path"),
      dataIndex: "path",
      width: 150,
      ellipsis: true,
    },
    {
      title: t("status_code"),
      dataIndex: "statusCode",
      width: 80,
      render: (code: number) => {
        const color = code >= 500 ? "red" : code >= 400 ? "orange" : "green";
        return <Tag color={color}>{code}</Tag>;
      },
    },
    {
      title: t("response_time"),
      dataIndex: "responseTime",
      width: 100,
      render: (time: number) => <span>{time}ms</span>,
    },
    {
      title: t("client_ip"),
      dataIndex: "clientIp",
      width: 100,
      ellipsis: true,
    },
    {
      title: t("created_at"),
      dataIndex: "createdAt",
      width: 140,
    },
    {
      title: t("trace_id"),
      dataIndex: "traceId",
      width: 140,
      ellipsis: true,
      render: (traceId: string) =>
        traceId ? (
          <span onClick={(e) => e.stopPropagation()}>
            {traceId.slice(0, 8)}…
          </span>
        ) : null,
    },
    {
      title: t("is_success"),
      dataIndex: "isSuccess",
      width: 80,
      render: (success: boolean) => success ? <Tag color="green">Success</Tag> : <Tag color="red">Fail</Tag>,
    },
    {
      title: t("error_message"),
      dataIndex: "errorMessage",
      width: 150,
      ellipsis: true,
      render: (msg: string) => msg ? <span style={{ color: 'red' }}>{msg}</span> : null,
    },
  ];

  return (
    <PageContainer
      title={t('log.api_logs', 'API 日志')}
      extra={
        <Form form={form} layout="inline" style={{flexDirection: 'column', alignItems: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Form.Item name="keyword" label={t("search_keywords")} style={{marginBottom: 0}}>
              <Input placeholder={t("search_keywords")} style={{width: 200}}/>
            </Form.Item>
            <Form.Item style={{marginBottom: 0}}>
              <Space>
                <Button type="primary" icon={<SearchOutlined/>} onClick={searchLog}>
                  {t("search")}
                </Button>
                <Button onClick={resetLog}>{t("reset")}</Button>
                <Button icon={<SettingOutlined/>} onClick={() => setSettingsDialogVisible(true)}/>
                <Button type="link" onClick={() => setExpand(!expand)}>
                  {t('more_filters', '更多筛选')}
                  {expand ? <UpOutlined/> : <DownOutlined/>}
                </Button>
              </Space>
            </Form.Item>
          </div>
          {expand && (
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
              <Form.Item name="isSuccess" label={t("is_success")} style={{marginBottom: 0}}>
                <Select allowClear style={{width: 120}}>
                  <Select.Option value={true}>{t("success")}</Select.Option>
                  <Select.Option value={false}>{t("fail")}</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="dateRange" label={t("date_range")} style={{marginBottom: 0}}>
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>
              </Form.Item>
            </div>
          )}
        </Form>
      }
    >
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: token.padding
      }}>
        {/* 图表区域 */}
        <div style={{
          height: '140px',
          marginBottom: '10px',
          flexShrink: 0
        }}>
          <ApiLogChart chartData={chartData} height="140px" />
        </div>

        {/* 表格区域 */}
        <div
          ref={tableWrapperRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            marginBottom: '10px'
          }}
        >
          <div style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Table
              bordered={false}
              virtual
              scroll={{ y: tableScrollY }}
              columns={columns}
              dataSource={tableData?.list}
              rowKey="id"
              rowClassName={() => "cursor-pointer"}
              onRow={(record) => ({
                onClick: () => showDetail(record),
              })}
              pagination={{
                current: query.page,
                pageSize: query.size,
                total: tableData.total,
                showTotal: (total, range) =>
                  t("pagination_total_text", {
                    start: range[0],
                    end: range[1],
                    total: total,
                  }),
                onChange: (page, size) =>
                  setQuery({ ...query, page, size })
              }}
            />
          </div>
        </div>
      </div>

      <Drawer
        title={t("request_log")}
        size={680}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="id">{log?.id}</Descriptions.Item>
          <Descriptions.Item label="url">{log?.url}</Descriptions.Item>
          <Descriptions.Item label="httpMethod">{log?.httpMethod}</Descriptions.Item>
          <Descriptions.Item label="path">{log?.path}</Descriptions.Item>
          <Descriptions.Item label="requestBody">{log?.requestBody}</Descriptions.Item>
          <Descriptions.Item label="requestHeaders">{log?.requestHeaders ? JSON.stringify(log.requestHeaders) : null}</Descriptions.Item>
          <Descriptions.Item label="statusCode">{log?.statusCode}</Descriptions.Item>
          <Descriptions.Item label="responseTime">{log?.responseTime}ms</Descriptions.Item>
          <Descriptions.Item label="clientIp">{log?.clientIp}</Descriptions.Item>
          <Descriptions.Item label={t("trace_id")}>{log?.traceId}</Descriptions.Item>
          <Descriptions.Item label="createdAt">{log?.createdAt}</Descriptions.Item>
          <Descriptions.Item label="isSuccess">{log?.isSuccess ? t("yes") : t("no")}</Descriptions.Item>
          <Descriptions.Item label="errorMessage">{log?.errorMessage}</Descriptions.Item>
        </Descriptions>
      </Drawer>

      <LogSettings
        visible={settingsDialogVisible}
        onConfirm={() => setSettingsDialogVisible(false)}
        onCancel={() => setSettingsDialogVisible(false)}
      />
    </PageContainer>
  );
};

export default LogViewer;
