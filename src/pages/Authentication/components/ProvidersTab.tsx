import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Radio, Spin, message } from "antd";
import { useTranslation } from "react-i18next";
import { useProject } from "@/store/appStore";
import {
  getAuthProviders,
  createAuthProvider,
  updateAuthProvider,
  deleteAuthProvider,
} from "@/services/auth-provider";
import type { AuthProviderConfig } from "@/types/auth-provider";
import OidcForm from "@/pages/Authentication/components/OidcForm";
import FunctionForm from "@/pages/Authentication/components/FunctionForm";

type AuthMethod = "none" | "oidc" | "function";

const ProvidersTab: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [providers, setProviders] = useState<AuthProviderConfig[]>([]);

  const fetchProviders = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getAuthProviders(projectId);
      setProviders(data);
      const active = data.find((p) => p.enabled) || data[0] || null;
      if (active) {
        setAuthMethod(active.type);
        form.setFieldsValue(active.config || {});
      } else {
        setAuthMethod("none");
        form.resetFields();
      }
    } catch {
      message.error(t("providers_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t, projectId, form]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleMethodChange = (method: AuthMethod) => {
    form.resetFields(["issuer", "clientId", "clientSecret", "functionName"]);
    setAuthMethod(method);
  };

  const handleSave = async () => {
    let values: Record<string, any> = {};

    if (authMethod !== "none") {
      try {
        values = await form.validateFields();
      } catch {
        return;
      }
    }

    try {
      setSaving(true);

      if (authMethod === "none") {
        for (const p of providers) {
          await deleteAuthProvider(projectId, p.name);
        }
        setProviders([]);
        message.success(t("provider_updated"));
        return;
      }

      const payload: AuthProviderConfig = {
        name: "default",
        type: authMethod,
        enabled: true,
        config: values,
      };

      const existing = providers[0];
      if (existing) {
        await updateAuthProvider(projectId, existing.name, {
          ...payload,
          name: existing.name,
        });
        for (const p of providers.slice(1)) {
          await deleteAuthProvider(projectId, p.name);
        }
      } else {
        await createAuthProvider(projectId, payload);
      }

      await fetchProviders();
      message.success(t("provider_updated"));
    } catch {
      message.error(t("provider_update_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item label={t("auth_method")}>
          <Radio.Group
            value={authMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
          >
            <Radio value="none">{t("auth_none")}</Radio>
            <Radio value="oidc">OpenID Connect (OIDC)</Radio>
            <Radio value="function">{t("function")}</Radio>
          </Radio.Group>
        </Form.Item>

        {authMethod !== "none" && (
          <Alert
            type="info"
            showIcon
            message={t("auth_method_hint")}
            style={{ marginBottom: 24 }}
          />
        )}

        {authMethod === "oidc" && <OidcForm />}
        {authMethod === "function" && <FunctionForm />}

        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {t("save")}
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ProvidersTab;
