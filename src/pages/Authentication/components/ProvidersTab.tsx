import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Modal, Popconfirm, Space, Switch, Table, Tag, Form, Input } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useProject } from "@/store/appStore";
import { getAuthProviders, updateAuthProvider, deleteAuthProvider } from "@/services/auth-provider";
import type { AuthProviderConfig } from "@/types/auth-provider";
import CreateProviderModal from "@/pages/Authentication/components/CreateProviderModal";
import OidcForm from "@/pages/Authentication/components/OidcForm";
import ScriptForm from "@/pages/Authentication/components/ScriptForm";

const ProvidersTab: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [providers, setProviders] = useState<AuthProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<AuthProviderConfig | null>(null);
  const [editForm] = Form.useForm();

  const fetchProviders = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getAuthProviders(projectId);
      setProviders(data);
    } catch {
      message.error(t("providers_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t, projectId]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleToggleEnabled = async (record: AuthProviderConfig) => {
    try {
      await updateAuthProvider(projectId, record.name, {
        ...record,
        enabled: !record.enabled,
      });
      await fetchProviders();
      message.success(t("provider_updated"));
    } catch {
      message.error(t("provider_update_failed"));
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteAuthProvider(projectId, name);
      await fetchProviders();
      message.success(t("provider_deleted"));
    } catch {
      message.error(t("provider_delete_failed"));
    }
  };

  const handleEdit = (record: AuthProviderConfig) => {
    setEditProvider(record);
    const configValues = record.config || {};
    editForm.setFieldsValue({
      name: record.name,
      enabled: record.enabled,
      ...configValues,
    });
  };

  const handleEditSave = async () => {
    if (!editProvider) return;
    try {
      const values = await editForm.validateFields();
      const { name, enabled, ...configFields } = values;
      const payload: AuthProviderConfig = {
        name,
        type: editProvider.type,
        enabled,
        config: configFields,
      };
      await updateAuthProvider(projectId, editProvider.name, payload);
      setEditProvider(null);
      editForm.resetFields();
      await fetchProviders();
      message.success(t("provider_updated"));
    } catch {
      message.error(t("provider_update_failed"));
    }
  };

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "oidc" ? "blue" : "green"}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: t("enabled"),
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: boolean, record: AuthProviderConfig) => (
        <Switch checked={enabled} onChange={() => handleToggleEnabled(record)} />
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_: unknown, record: AuthProviderConfig) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {t("edit")}
          </Button>
          <Popconfirm
            title={t("provider_delete_confirm", { name: record.name })}
            onConfirm={() => handleDelete(record.name)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              {t("delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          {t("create_provider")}
        </Button>
      </div>
      <Table
        dataSource={providers}
        columns={columns}
        rowKey="name"
        loading={loading}
        pagination={false}
      />

      <CreateProviderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setCreateModalOpen(false);
          fetchProviders();
        }}
      />

      {/* Edit Provider Modal */}
      <Modal
        title={t("edit_provider")}
        open={!!editProvider}
        onCancel={() => {
          setEditProvider(null);
          editForm.resetFields();
        }}
        onOk={handleEditSave}
        okText={t("save")}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label={t("name")} rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="enabled" label={t("enabled")} valuePropName="checked">
            <Switch />
          </Form.Item>
          {editProvider?.type === "oidc" && <OidcForm />}
          {editProvider?.type === "script" && <ScriptForm />}
        </Form>
      </Modal>
    </>
  );
};

export default ProvidersTab;
