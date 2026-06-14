import React, {useCallback, useEffect, useState} from "react";
import {
  Button,
  Drawer,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from "antd";
import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import FunctionDetail from "./components/FunctionDetail";
import type {FunctionResponse} from "@/services/function";
import {
  deleteFunction,
  getFunctionList,
  getFunction,
} from "@/services/function";
import {useProject} from "@/store/appStore";

const FunctionsPage: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || "";

  const [functions, setFunctions] = useState<FunctionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchName, setSearchName] = useState("");

  // Detail drawer
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailFunction, setDetailFunction] = useState<FunctionResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getFunctionList(projectId, {
        name: searchName || undefined,
        page,
        size: pageSize,
      });
      setFunctions(res.list);
      setTotal(res.total);
    } catch {
      message.error(t("function.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [projectId, searchName, page, pageSize, t]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreate = () => {
    navigate(`/project/${projectId}/functions/editor`);
  };

  const handleEdit = (fn: FunctionResponse) => {
    navigate(`/project/${projectId}/functions/editor/${encodeURIComponent(fn.name)}`);
  };

  const handleViewDetail = async (fn: FunctionResponse) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const detail = await getFunction(projectId, fn.name);
      setDetailFunction(detail);
    } catch {
      setDetailFunction(fn);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteFunction(projectId, name);
      message.success(t("function.deleteSuccess"));
      loadList();
    } catch {
      message.error(t("function.deleteFailed"));
    }
  };

  const columns = [
    {
      title: t("function.name"),
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, record: FunctionResponse) => (
        <a onClick={() => handleViewDetail(record)} style={{fontWeight: 500}}>
          <CodeOutlined style={{marginRight: 8}}/>
          {name}
        </a>
      ),
    },
    {
      title: t("function.endpoint"),
      key: "endpoint",
      width: 280,
      render: (_: any, record: FunctionResponse) => (
        <code style={{fontSize: 11, color: "#666"}}>
          POST /functions/{record.name}
        </code>
      ),
    },
    {
      title: t("function.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: t("function.updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: t("function.actions"),
      key: "actions",
      width: 140,
      render: (_: any, record: FunctionResponse) => (
        <Space size="small">
          <Tooltip title={t("function.invoke")}>
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined/>}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title={t("edit")}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined/>}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t("function.deleteConfirm")}
            onConfirm={() => handleDelete(record.name)}
            okText={t("confirm")}
            cancelText={t("cancel")}
          >
            <Tooltip title={t("delete")}>
              <Button type="text" size="small" danger icon={<DeleteOutlined/>}/>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageContainer
        title={t("function.title")}
        extra={
          <Space>
            <Button icon={<ReloadOutlined/>} onClick={loadList}>
              {t("refresh")}
            </Button>
            <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
              {t("function.create")}
            </Button>
          </Space>
        }
        loading={loading}
      >
        <Space style={{marginBottom: 16}} wrap>
          <Input
            placeholder={t("function.searchByName")}
            prefix={<SearchOutlined/>}
            value={searchName}
            onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
            style={{width: 220}}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={functions}
          rowKey="id"
          loading={loading}
          scroll={{y: "calc(100vh - 340px)"}}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} / ${total}`,
            onChange: (p, s) => { setPage(p); setPageSize(s || 20); },
            onShowSizeChange: (_c: number, s: number) => { setPage(1); setPageSize(s); },
          }}
        />
      </PageContainer>

      <Drawer
        title={detailFunction ? detailFunction.name : t("function.detail")}
        open={detailVisible}
        onClose={() => { setDetailVisible(false); setDetailFunction(null); }}
        width={800}
        destroyOnClose
      >
        <FunctionDetail
          fn={detailFunction}
          loading={detailLoading}
          projectId={projectId}
          onRefresh={() => {
            loadList();
            if (detailFunction) handleViewDetail(detailFunction);
          }}
        />
      </Drawer>
    </>
  );
};

export default FunctionsPage;
