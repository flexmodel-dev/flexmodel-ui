import React, {useCallback, useEffect, useState} from "react";
import {
  Button,
  Descriptions,
  message,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tabs,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import FunctionInvokePanel from "./FunctionInvokePanel";
import type {
  FunctionResponse,
  FunctionUpdateRequest,
  FunctionVersionResponse,
} from "@/services/function";
import {
  getFunctionVersions,
  rollbackFunction,
} from "@/services/function";

const {Text, Paragraph} = Typography;

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

interface FunctionDetailProps {
  function: FunctionResponse | null;
  loading: boolean;
  projectId: string;
  onUpdate: (slug: string, data: FunctionUpdateRequest) => Promise<void>;
  onRefresh: () => void;
}

const FunctionDetail: React.FC<FunctionDetailProps> = ({
  function: fn,
  loading,
  projectId,
  onRefresh,
}) => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [versions, setVersions] = useState<FunctionVersionResponse[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    if (!fn || !projectId) return;
    setVersionsLoading(true);
    try {
      const list = await getFunctionVersions(projectId, fn.slug);
      setVersions(list);
    } catch {
      // silent
    } finally {
      setVersionsLoading(false);
    }
  }, [fn, projectId]);

  useEffect(() => {
    if (activeTab === "versions") {
      loadVersions();
    }
  }, [activeTab, loadVersions]);

  if (loading || !fn) {
    return (
      <div style={{textAlign: "center", padding: 48}}>
        <Spin/>
      </div>
    );
  }

  const handleRollback = async (version: number) => {
    setRollingBack(`v${version}`);
    try {
      await rollbackFunction(projectId, fn.slug, version);
      message.success(t("function.rollback_success", {version}));
      onRefresh();
    } catch {
      message.error(t("function.rollback_failed"));
    } finally {
      setRollingBack(null);
    }
  };

  // ---- Overview Tab ----
  const overviewTab = (
    <div>
      <Descriptions
        column={2}
        bordered
        size="small"
        labelStyle={{fontWeight: 500, width: 120}}
      >
        <Descriptions.Item label={t("function.name")}>
          {fn.name}
        </Descriptions.Item>
        <Descriptions.Item label={t("function.slug")}>
          <code>{fn.slug}</code>
        </Descriptions.Item>
        <Descriptions.Item label={t("function.status")}>
          <Tag color={STATUS_COLORS[fn.status] || "default"}>
            {t(STATUS_LABELS[fn.status] || fn.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t("function.version")}>
          v{fn.currentVersion}
        </Descriptions.Item>
        <Descriptions.Item label={t("function.entry_point")}>
          <code>{fn.entryPoint}</code>
        </Descriptions.Item>
        <Descriptions.Item label={t("function.timeout")}>
          {fn.timeout}s
        </Descriptions.Item>
        <Descriptions.Item label={t("function.memory_limit")}>
          {fn.memoryLimit} MB
        </Descriptions.Item>
        <Descriptions.Item label={t("function.created_by")}>
          {fn.createdBy || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("description")}>
          {fn.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("created_at")}>
          {fn.createdAt ? new Date(fn.createdAt).toLocaleString() : "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("updated_at")}>
          {fn.updatedAt ? new Date(fn.updatedAt).toLocaleString() : "-"}
        </Descriptions.Item>
      </Descriptions>

      {fn.triggers && fn.triggers.length > 0 && (
        <div style={{marginTop: 20}}>
          <Text strong>{t("function.triggers")}</Text>
          <Table
            dataSource={fn.triggers}
            rowKey="id"
            pagination={false}
            size="small"
            style={{marginTop: 8}}
            columns={[
              {
                title: t("function.trigger_path"),
                dataIndex: "path",
                key: "path",
                render: (path: string) => <code>{path}</code>,
              },
              {
                title: t("function.trigger_method"),
                dataIndex: "method",
                key: "method",
                width: 80,
                render: (m: string) => <Tag>{m}</Tag>,
              },
              {
                title: t("function.auth_mode"),
                dataIndex: "authMode",
                key: "authMode",
                width: 100,
                render: (a: string) => (
                  <Tag color={a === "PUBLIC" ? "green" : a === "JWT" ? "blue" : "orange"}>
                    {a}
                  </Tag>
                ),
              },
              {
                title: t("status"),
                dataIndex: "enabled",
                key: "enabled",
                width: 80,
                render: (enabled: boolean) =>
                  enabled ? (
                    <Tag icon={<CheckCircleOutlined/>} color="success">
                      {t("active")}
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined/>} color="default">
                      {t("inactive")}
                    </Tag>
                  ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );

  // ---- Code Tab ----
  const codeTab = (
    <div>
      <Paragraph type="secondary">
        {t("function.code_hint")}
      </Paragraph>
      <ScriptEditor
        language="javascript"
        height={420}
        readOnly
        value={`// Source code is managed server-side.\n// Use the "Deploy" action to update the function code.`}
      />
    </div>
  );

  // ---- Versions Tab ----
  const versionColumns = [
    {
      title: t("function.version"),
      dataIndex: "version",
      key: "version",
      width: 80,
      render: (v: number) => `v${v}`,
    },
    {
      title: t("function.created_by"),
      dataIndex: "createdBy",
      key: "createdBy",
      render: (v: string) => v || "-",
    },
    {
      title: t("created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: t("operations"),
      key: "operations",
      width: 120,
      render: (_: any, record: FunctionVersionResponse) => (
        record.version !== fn.currentVersion ? (
          <Popconfirm
            title={t("function.rollback_confirm")}
            description={t("function.rollback_confirm_desc", {
              version: record.version,
            })}
            onConfirm={() => handleRollback(record.version)}
            okText={t("confirm")}
            cancelText={t("cancel")}
          >
            <Button
              type="link"
              size="small"
              icon={<RollbackOutlined/>}
              loading={rollingBack === `v${record.version}`}
              danger
            >
              {t("function.rollback")}
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="blue">{t("function.current_version")}</Tag>
        )
      ),
    },
  ];

  const versionsTab = (
    <div>
      <div style={{marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Text strong>{t("function.version_history")}</Text>
        <Button
          size="small"
          icon={<ReloadOutlined/>}
          onClick={loadVersions}
        >
          {t("refresh")}
        </Button>
      </div>
      <Table
        columns={versionColumns}
        dataSource={versions}
        rowKey="id"
        loading={versionsLoading}
        pagination={false}
        size="small"
      />
    </div>
  );

  // ---- Test Tab ----
  const testTab = (
    <FunctionInvokePanel
      projectId={projectId}
      functionSlug={fn.slug}
    />
  );

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          <CodeOutlined/>
          {t("function.tab_overview")}
        </span>
      ),
      children: overviewTab,
    },
    {
      key: "code",
      label: (
        <span>
          <CodeOutlined/>
          {t("function.tab_code")}
        </span>
      ),
      children: codeTab,
    },
    {
      key: "versions",
      label: (
        <span>
          <HistoryOutlined/>
          {t("function.tab_versions")}
        </span>
      ),
      children: versionsTab,
    },
    {
      key: "test",
      label: (
        <span>
          <PlayCircleOutlined/>
          {t("function.tab_test")}
        </span>
      ),
      children: testTab,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
    />
  );
};

export default FunctionDetail;
