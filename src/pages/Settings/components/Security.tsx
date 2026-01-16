import React, {useEffect, useState} from 'react';
import {Button, Form, Input, InputNumber, Select, Switch} from 'antd';
import {useTranslation} from "react-i18next";
import type {SelectProps} from "antd/es/select";
import {getIdentityProviders} from "@/services/identity-provider.ts";
import {useConfig} from "@/store/appStore.ts";

interface SecurityProps {
  settings: any;
  onChange: (val: any) => void;
}

interface SecurityData {
  rateLimitingEnabled: boolean;
  intervalInSeconds: number;
  maxRequestCount: number;
  graphqlEndpointPath?: string;
  graphqlEndpointIdentityProvider?: string | null;
  systemIdentityProvider: string;
}

const Security: React.FC<SecurityProps> = ({settings, onChange}) => {
  const {t} = useTranslation();

  const { config } = useConfig();

  const [form] = Form.useForm();
  const [formData, setFormData] = useState<SecurityData>({
    rateLimitingEnabled: false,
    intervalInSeconds: 60,
    maxRequestCount: 500,
    graphqlEndpointPath: '/graphql',
    graphqlEndpointIdentityProvider: null,
    systemIdentityProvider: 'default'
  });
  const [options, setOptions] = useState<SelectProps['options']>([]);

  useEffect(() => {
    getIdentityProviders("default")
      .then(res => setOptions(res.map((d: { name: string }) => ({
        value: d.name,
        label: d.name,
      }))));
  }, []);

  useEffect(() => {
    form.setFieldsValue(settings.security);
    setFormData(settings.security);
  }, [settings, form]);

  const submit = async () => {
    const values = await form.validateFields();
    onChange({...settings, security: values})
  };

  return (

      <Form form={form}
            initialValues={formData}
            layout="vertical"
            onValuesChange={(changedValues) => setFormData((prev: any) => ({...prev, ...changedValues}))}
      >
        <Form.Item name="rateLimitingEnabled" label={t('settings_global_api_rate_limiting')}>
          <Switch/>
        </Form.Item>
        {formData?.rateLimitingEnabled && <>
          <Form.Item name="intervalInSeconds" label={t('interval_in_seconds')} required>
            <InputNumber min={1} addonAfter={t('sec')}/>
          </Form.Item>
          <Form.Item name="maxRequestCount" label={t('max_request_count')} required>
            <InputNumber min={1} addonAfter={t('times')}/>
          </Form.Item>
        </>}
        <Form.Item name="graphqlEndpointPath" label={t('graphql_endpoint_path')} required>
          <Input addonBefore={config?.apiRootPath+"/{tenantId}"}/>
        </Form.Item>
        <Form.Item name="graphqlEndpointIdentityProvider" label={t('graphql_identity_provider')}>
          <Select options={options} placeholder={t('select_a_provider')} allowClear/>
        </Form.Item>
        <Form.Item name="systemIdentityProvider" label={t('system_identity_provider')}>
          <Select options={options} placeholder={t('select_a_provider')}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={submit}>{t('save')}</Button>
        </Form.Item>
      </Form>
  );
};

export default Security;
