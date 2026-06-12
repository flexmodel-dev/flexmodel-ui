import React, {useCallback, useEffect, useState} from "react";
import {
  Button,
  Drawer,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import FunctionForm from "./components/FunctionForm";
import FunctionDetail from "./components/FunctionDetail";
import type {FunctionResponse, FunctionUpdateRequest} from "@/services/function";
import {
  deleteFunction,
  getFunctionList,
  getFunction,
  updateFunction,
} from "@/services/function";
import {useProject} from "@/store/appStore";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "green",
  CREATING: "blue",
  UPDATING: "orange",
  DEPLOY_FAILED: "red",
  DELETING: "volcano",
  INACTIVE: "default",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "function.status.active",
  CREATING: "function.status.creating",
  UPDATING: "function.status.updating",
  DEPLOY_FAILED: "function.status.deploy_failed",
  DELETING: "function.status.deleting",
  INACTIVE: "function.status.inactive",
};

const FunctionsPage: React.FC = () => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || "";

  // List state
  const [functions, setFunctions] = useState<FunctionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  // Form modal state
  const [formVisible, setFormVisible] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionResponse | null>(null);

  // Detail drawer state
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailFunction, setDetailFunction] = useState<FunctionResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getFunctionList(projectId, {
        name: searchName || undefined,
        status: filterStatus,
        page,
        size: pageSize,
      });
      setFunctions(res.list);
      setTotal(res.total);
    } catch {
      message.error(t("function.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [projectId, searchName, filterStatus, page, pageSize, t]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreate = () => {
    setEditingFunction(null);
    setFormVisible(true);
  };

  const handleEdit = (fn: FunctionResponse) => {
    setEditingFunction(fn);
    setFormVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingFunction(null);
    loadList();
  };

  const handleViewDetail = async (fn: FunctionResponse) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const detail = await getFunction(projectId, fn.slug);
      setDetailFunction(detail);
    } catch {
      // use the list item as fallback
      setDetailFunction(fn);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteFunction(projectId, slug);
      message.success(t("function.delete_success"));
      loadList();
    } catch {
      message.error(t("function.delete_failed"));
    }
  };

  const handleUpdateInline = async (
    slug: string,
    data: FunctionUpdateRequest,
  ) => {
    try {
      await updateFunction(projectId, slug, data);
      message.success(t("function.update_success"));
      loadList();
    } catch {
      message.error(t("function.update_failed"));
    }
  };

  const getEndpointText = (fn: FunctionResponse): string => {
    if (fn.triggers && fn.triggers.length > 0) {
      const t = fn.triggers[0];
      const method = t.method || "POST";
      const path = t.path || `/functions/${fn.slug}`;
      return `${method} ${path}`;
    }
    return "-";
  };

  const columns = [
    {
      title: t("function.name"),
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name: string, record: FunctionResponse) => (
        <a onClick={() => handleViewDetail(record)}>{name}</a>
      ),
    },
    {
      title: t("function.slug"),
      dataIndex: "slug",
      key: "slug",
      width: 150,
    },
    {
      title: t("function.status"),
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {t(STATUS_LABELS[status] || status)}
        </Tag>
      ),
    },
    {
      title: t("function.version"),
      dataIndex: "currentVersion",
      key: "currentVersion",
      width: 80,
      render: (v: number) => `v${v}`,
    },
    {
      title: t("function.endpoint"),
      key: "endpoint",
      width: 220,
      render: (_: any, record: FunctionResponse) => (
        <code style={{fontSize: 12}}>{getEndpointText(record)}</code>
      ),
    },
    {
      title: t("function.timeout"),
      dataIndex: "timeout",
      key: "timeout",
      width: 80,
      render: (timeout: number) => `${timeout}s`,
    },
    {
      title: t("updated_at"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: t("operations"),
      key: "operations",
      width: 160,
      render: (_: any, record: FunctionResponse) => (
        <Space size="small">
          <Tooltip title={t("function.view_detail")}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined/>}
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
            title={t("function.delete_confirm")}
            description={t("function.delete_confirm_desc", {name: record.name})}
            onConfirm={() => handleDelete(record.slug)}
            okText={t("confirm")}
            cancelText={t("cancel")}
          >
            <Tooltip title={t("delete")}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined/>}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const toolbarExtra = (
    <Space>
      <Button icon={<ReloadOutlined/>} onClick={loadList}>
        {t("refresh")}
      </Button>
      <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
        {t("function.create")}
      </Button>
    </Space>
  );

  const filterBar = (
    <Space style={{marginBottom: 16}} wrap>
      <Input
        placeholder={t("function.search_by_name")}
        prefix={<SearchOutlined/>}
        value={searchName}
        onChange={(e) => {
          setSearchName(e.target.value);
          setPage(1);
        }}
        style={{width: 220}}
        allowClear
      />
      <Select
        placeholder={t("function.filter_status")}
        value={filterStatus}
        onChange={(v) => {
          setFilterStatus(v);
          setPage(1);
        }}
        allowClear
        style={{width: 150}}
      >
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Select.Option key={key} value={key}>
            {t(label)}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );

  return (
    <>
      <PageContainer
        title={t("function.title")}
        extra={toolbarExtra}
        loading={loading}
      >
        {filterBar}
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
            showTotal: (total, range) =>
              t("pagination_total_text", {
                start: range[0],
                end: range[1],
                total,
              }),
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s || 20);
            },
            onShowSizeChange: (_c: number, s: number) => {
              setPage(1);
              setPageSize(s);
            },
          }}
        />
      </PageContainer>

      {/* Create / Edit Modal */}
      <FunctionForm
        visible={formVisible}
        editingFunction={editingFunction}
        projectId={projectId}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setFormVisible(false);
          setEditingFunction(null);
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        title={
          detailFunction
            ? `${t("function.detail")}: ${detailFunction.name}`
            : t("function.detail")
        }
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailFunction(null);
        }}
        width={800}
        destroyOnClose
      >
        <FunctionDetail
          function={detailFunction}
          loading={detailLoading}
          projectId={projectId}
          onUpdate={handleUpdateInline}
          onRefresh={() => {
            loadList();
            if (detailFunction) {
              handleViewDetail(detailFunction);
            }
          }}
        />
      </Drawer>
    </>
  );
};

export default FunctionsPage;
