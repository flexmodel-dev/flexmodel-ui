import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Modal, Popconfirm, Space, Table, Tag, Typography, Input, Form, Switch } from "antd";
import { CopyOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useProject } from "@/store/appStore";
import { getApiKeys, createApiKey, regenerateApiKey, deleteApiKey } from "@/services/api-key";
import type { ApiKey, CreateApiKeyRequest } from "@/types/api-key";

const { Text } = Typography;

const ApiKeysTab: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchKeys = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getApiKeys(projectId);
      setKeys(data);
    } catch {
      message.error(t("api_keys_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t, projectId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const req: CreateApiKeyRequest = {
        name: values.name,
        keyType: "custom",
        scopes: values.scopes || "*",
        readOnly: values.readOnly ?? false,
      };
      const res = await createApiKey(projectId, req);
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
      const res = await regenerateApiKey(projectId, id);
      setNewKeyValue(res.key || null);
      await fetchKeys();
      message.success(t("api_key_regenerated"));
    } catch {
      message.error(t("api_key_regenerate_failed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(projectId, id);
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
      title: t("scopes"),
      dataIndex: "scopes",
      key: "scopes",
      render: (scopes: string) => scopes === "*" ? <Tag color="green">*</Tag> : scopes,
    },
    {
      title: t("read_only"),
      dataIndex: "readOnly",
      key: "readOnly",
      render: (readOnly: boolean) => readOnly ? <Tag>{t("yes")}</Tag> : <Tag color="orange">{t("no")}</Tag>,
    },
    {
      title: t("enabled"),
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: boolean) => enabled ? <Tag color="green">{t("yes")}</Tag> : <Tag color="red">{t("no")}</Tag>,
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
    <>
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
        <Form form={form} layout="vertical" initialValues={{ scopes: "*", readOnly: false }}>
          <Form.Item name="name" label={t("name")} rules={[{ required: true, message: t("name_required") }]}>
            <Input placeholder={t("api_key_name_placeholder")} />
          </Form.Item>
          <Form.Item name="scopes" label={t("scopes")}>
            <Input placeholder="* 或 read,write" />
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
    </>
  );
};

export default ApiKeysTab;
