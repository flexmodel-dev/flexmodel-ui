import React, {useCallback, useEffect, useRef, useState} from "react";
import {Card, Form, InputNumber, Select, Switch} from "antd";
import type {SelectProps} from "antd/es/select";
import {getIdentityProviders} from "@/services/identity-provider.ts";
import {useTranslation} from "react-i18next";
import {ApiMeta} from "@/types/api-management";
import {useProject} from "@/store/appStore";

interface AuthProps {
  data: ApiMeta;
  onChange: (data: ApiMeta) => void;
}

const AuthorizationForm: React.FC<AuthProps> = ({ data, onChange }: AuthProps) => {
  const [formData, setFormData] = useState<ApiMeta>(data);
  const [form] = Form.useForm();
  const prevDataRef = useRef<ApiMeta>(data);
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const { t } = useTranslation();

  // 获取身份源列表
  useEffect(() => {
    if (!projectId) return;
    getIdentityProviders(projectId).then((res) =>
      setOptions(
        res.map((d: { name: string }) => ({
          value: d.name,
          label: d.name,
        }))
      )
    );
  }, [projectId]);

  const sanitizeMeta = useCallback((meta: ApiMeta): ApiMeta => {
    const result: ApiMeta = {
      ...meta,
    };

    if (!result?.auth) {
      delete result.identityProvider;
    }
    if (!result?.rateLimitingEnabled) {
      delete result.intervalInSeconds;
      delete result.maxRequestCount;
    }

    return result;
  }, []);

  // 表单数据回填 - 只在data真正变化时执行
  useEffect(() => {
    // 深度比较，避免不必要的更新
    const isDataChanged =
      JSON.stringify(data) !== JSON.stringify(prevDataRef.current);

    if (isDataChanged && data && Object.keys(data).length > 0) {
      const sanitized = sanitizeMeta(data);
      form.setFieldsValue(sanitized);
      setFormData(sanitized);
      prevDataRef.current = sanitized;
    }
  }, [data, form, sanitizeMeta]);

  // 数据变化时通知父组件 - 使用useCallback避免无限循环
  const handleDataChange = useCallback(
    (newData: ApiMeta) => {
      const mergedData = sanitizeMeta({
        ...prevDataRef.current,
        ...newData,
      });

      // 避免重复调用onChange
      if (
        JSON.stringify(mergedData) !== JSON.stringify(prevDataRef.current)
      ) {
        prevDataRef.current = mergedData;
        onChange(mergedData);
      }
    },
    [onChange, sanitizeMeta]
  );

  // 表单值变化处理
  const handleFormValuesChange = useCallback(
    (changedValues: Partial<ApiMeta>) => {
      const newFormData = sanitizeMeta({ ...formData, ...changedValues });
      setFormData(newFormData);
      handleDataChange(newFormData);
    },
    [formData, handleDataChange, sanitizeMeta]
  );

  return (
    <Card className="h-full">
      <Form
        form={form}
        initialValues={data}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        layout="horizontal"
        onValuesChange={handleFormValuesChange}
      >
        <Form.Item name="auth" label={t("api_auth")}>
          <Switch />
        </Form.Item>
        {formData?.auth && (
          <Form.Item
            name="identityProvider"
            label={t("identity_provider")}
            required
          >
            <Select options={options} placeholder={t("select_a_provider")} />
          </Form.Item>
        )}
        <Form.Item name="rateLimitingEnabled" label={t("api_rate_limiting")}>
          <Switch />
        </Form.Item>
        {formData?.rateLimitingEnabled && (
          <>
            <Form.Item
              name="intervalInSeconds"
              label={t("interval_in_seconds")}
              required
            >
              <InputNumber defaultValue={60} addonAfter={t("sec")} />
            </Form.Item>
            <Form.Item
              name="maxRequestCount"
              label={t("max_request_count")}
              required
            >
              <InputNumber defaultValue={500} addonAfter={t("times")} />
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
};

export default AuthorizationForm;
