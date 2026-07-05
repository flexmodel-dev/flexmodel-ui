import React, {useCallback, useEffect, useState} from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography
} from "antd";
import {CopyOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {createApiKey, deleteApiKey, getApiKeys, regenerateApiKey} from "@/services/api-key";
import {getProjects} from "@/services/project";
import type {ApiKey, CreateApiKeyRequest} from "@/types/api-key";
import type {Project} from "@/types/project";
import {PageContainer} from "@/components/common";

const { Text } = Typography;

const ApiKeys: React.FC = () => {
  const { t } = useTranslation();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form] = Form.useForm();

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getApiKeys();
      setKeys(data);
    } catch {
      message.error(t("api_keys_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects({});
      setProjects(data);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchProjects();
  }, [fetchKeys, fetchProjects]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const req: CreateApiKeyRequest = {
        name: values.name,
        keyType: "custom",
        projectIds: (values.projectIds as string[] | undefined)?.join(",") || "",
        readOnly: values.readOnly ?? false,
      };
      const res = await createApiKey(req);
      setNewKeyValue(res.key || null);
      setCreateModalOpen(false);
      form.resetFields();
      await fetchKeys();
      message.success(t("api_key_created"));
    } catch {
      message.error(t("api_key_create_failed"));
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const res = await regenerateApiKey(id);
      setNewKeyValue(res.key || null);
      await fetchKeys();
      message.success(t("api_key_regenerated"));
    } catch {
      message.error(t("api_key_regenerate_failed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      await fetchKeys();
      message.success(t("api_key_deleted"));
    } catch {
      message.error(t("api_key_delete_failed"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(t("copied"));
    });
  };

  const getKeyTypeTag = (keyType: string) => {
    const colorMap: Record<string, string> = {
      anon: "blue",
      service: "red",
      custom: "default",
    };
    return <Tag color={colorMap[keyType] || "default"}>{t(`key_type_${keyType}`)}</Tag>;
  };

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("key_type"),
      dataIndex: "keyType",
      key: "keyType",
      render: (keyType: string) => getKeyTypeTag(keyType),
    },
    {
      title: t("key_prefix"),
      dataIndex: "keyPrefix",
      key: "keyPrefix",
      render: (prefix: string) => <Text code>{prefix}...</Text>,
    },
    {
      title: t("project_ids"),
      dataIndex: "projectIds",
      key: "projectIds",
      render: (projectIds: string) => {
        if (!projectIds) return <Tag color="green">{t("all_projects")}</Tag>;
        const nameMap = Object.fromEntries(projects.map(p => [p.id, p.name]));
        return (
          <Space size={[0, 4]} wrap>
            {projectIds.split(",").map(id => (
              <Tag key={id}>{nameMap[id] || id}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t("read_only"),
      dataIndex: "readOnly",
      key: "readOnly",
      render: (readOnly: boolean) => readOnly ? <Tag>{t("yes")}</Tag> : <Tag color="orange">{t("no")}</Tag>,
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_: unknown, record: ApiKey) => (
        <Space>
          <Popconfirm
            title={t("api_key_regenerate_confirm")}
            onConfirm={() => handleRegenerate(record.id)}
          >
            <Button size="small" icon={<ReloadOutlined />}>
              {t("regenerate")}
            </Button>
          </Popconfirm>
          {record.keyType === "custom" && (
            <Popconfirm
              title={t("api_key_delete_confirm")}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("delete")}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={t("api_keys")}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          {t("create_api_key")}
        </Button>
      </div>
      <Table
        dataSource={keys}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Create API Key Modal */}
      <Modal
        title={t("create_api_key")}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        okText={t("create")}
      >
        <Alert
          type="warning"
          showIcon
          message={t("api_key_frontend_warning")}
          style={{marginBottom: 16}}
        />
        <Form form={form} layout="vertical" initialValues={{ readOnly: false }}>
          <Form.Item name="name" label={t("name")} rules={[{ required: true, message: t("name_required") }]}>
            <Input placeholder={t("api_key_name_placeholder")} />
          </Form.Item>
          <Form.Item name="projectIds" label={t("project_ids")}>
            <Select
              mode="multiple"
              allowClear
              placeholder={t("project_ids_placeholder")}
              options={projects.map(p => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="readOnly" label={t("read_only")} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Show New Key Modal */}
      <Modal
        title={t("api_key_created")}
        open={!!newKeyValue}
        onCancel={() => setNewKeyValue(null)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => copyToClipboard(newKeyValue || "")}>
            {t("copy_key")}
          </Button>,
          <Button key="close" onClick={() => setNewKeyValue(null)}>
            {t("close")}
          </Button>,
        ]}
      >
        <div>
          <Text type="warning" style={{ display: "block", marginBottom: 12 }}>
            {t("api_key_warning")}
          </Text>
          <div style={{
            padding: 12,
            background: "#f8fafc",
            borderRadius: 6,
            wordBreak: "break-all",
            fontFamily: "monospace",
            fontSize: 13,
            position: "relative",
          }}>
            <Text code copyable={{ text: newKeyValue || "" }}>{newKeyValue}</Text>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ApiKeys;
