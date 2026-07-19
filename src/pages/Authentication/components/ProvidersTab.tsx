import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Form, message, Radio, Spin} from "antd";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";
import {createAuthProvider, deleteAuthProvider, getAuthProviders, updateAuthProvider,} from "@/services/auth-provider";
import type {AuthProviderConfig} from "@/types/auth-provider";
import {getModelList} from "@/services/model";
import type {EntitySchema, NativeQuerySchema} from "@/types/data-modeling";
import OidcForm from "@/pages/Authentication/components/OidcForm";
import FunctionForm from "@/pages/Authentication/components/FunctionForm";
import {allPerms, compressPermissions, expandPermissions,} from "@/pages/Authentication/permissionScope";

type AuthMethod = "none" | "oidc" | "function";

// OIDC 表单字段（含权限范围 UI 状态字段），切换认证方式时一并重置。
const OIDC_FIELDS = ["issuer", "clientId", "clientSecret", "permissionScope", "permissionScopeAll"];

const ProvidersTab: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [providers, setProviders] = useState<AuthProviderConfig[]>([]);
  // 项目模型列表，用于 modeling/data 权限按模型细分勾选。
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // 获取项目模型（实体/本地查询参与权限细分；枚举不产出数据权限，忽略）。
  // 返回模型名列表（同步设置 state 并返回值，供后续 fetchProviders 展开通配使用）。
  const fetchModels = useCallback(async (): Promise<string[]> => {
    if (!projectId) return [];
    try {
      setLoadingModels(true);
      const list = await getModelList(projectId);
      const names = list
        .filter((m) => (m as EntitySchema).type === "entity" || (m as NativeQuerySchema).type === "native_query")
        .map((m) => m.name)
        .filter((n): n is string => !!n);
      setModelNames(names);
      return names;
    } catch {
      console.error("Failed to load models for permission scope");
      return [];
    } finally {
      setLoadingModels(false);
    }
  }, [projectId]);

  const fetchProviders = useCallback(async (models: string[]) => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getAuthProviders(projectId);
      setProviders(data);
      const active = data.find((p) => p.enabled) || data[0] || null;
      if (active) {
        setAuthMethod(active.type);
        const cfg = (active.config || {}) as Record<string, any>;
        if (active.type === "oidc") {
          // 权限范围回填：根据 permissionScope 展开为 UI 勾选状态。
          // 只有配置了 ["*"] 才算"全部范围"；不空不*则不勾全部，展开后回填细粒度。
          const stored = Array.isArray(cfg.permissionScope) ? cfg.permissionScope : [];
          const isFull = stored.includes("*");
          const individuals = isFull ? allPerms(models) : expandPermissions(stored, models);
          form.setFieldsValue({
            ...cfg,
            permissionScopeAll: isFull,
            permissionScope: individuals,
          });
        } else {
          form.setFieldsValue(cfg);
        }
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

  // 模型先于 providers 加载：展开通配串时需要模型集合。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const names = await fetchModels();
      if (!cancelled) await fetchProviders(names);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleMethodChange = (method: AuthMethod) => {
    form.resetFields([...OIDC_FIELDS, "functionName"]);
    setAuthMethod(method);
    // 切换到已有提供商时回填其配置（避免切换后空白）
    if (method !== "none") {
      const existing = providers.find((p) => p.type === method);
      if (existing) {
        const cfg = (existing.config || {}) as Record<string, any>;
        if (method === "oidc") {
          const stored = Array.isArray(cfg.permissionScope) ? cfg.permissionScope : [];
          const isFull = stored.includes("*");
          const individuals = isFull ? allPerms(modelNames) : expandPermissions(stored, modelNames);
          form.setFieldsValue({...cfg, permissionScopeAll: isFull, permissionScope: individuals});
        } else {
          form.setFieldsValue(cfg);
        }
      }
    }
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

      // 构造保存到后台的 config：
      // permissionScope 采用通配压缩格式——
      //   全部范围 → ["*"]；
      //   整组全选 → `${prefix}:*`；整模型全选 → `${prefix}:${model}:*`；
      //   其余 → 原始细粒度串。
      // 不再使用 UI-only 的 permissionScopeAll 字段，仅作为 UI 开关在保存时翻译。
      const config: Record<string, any> = {...values, type: authMethod};
      if (authMethod === "oidc") {
        const all = values.permissionScopeAll !== false;
        if (all) {
          config.permissionScope = ["*"];
        } else {
          config.permissionScope = compressPermissions(
            Array.isArray(values.permissionScope) ? values.permissionScope : [],
            modelNames,
          );
        }
        delete config.permissionScopeAll;
      }

      const payload: AuthProviderConfig = {
        name: "default",
        type: authMethod,
        enabled: true,
        config,
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

      await fetchProviders(modelNames);
      message.success(t("provider_updated"));
    } catch {
      message.error(t("provider_update_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
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

        {authMethod === "oidc" && <OidcForm models={modelNames} loadingModels={loadingModels}/>}
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
