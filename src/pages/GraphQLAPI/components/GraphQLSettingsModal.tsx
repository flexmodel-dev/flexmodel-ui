import React, {useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, Select} from "antd";
import {getIdentityProviders} from "@/services/identity-provider";
import {saveSettings} from "@/services/settings";
import {Settings} from "@/types/settings";
import {useConfig, useProject} from "@/store/appStore";
import {useTranslation} from "react-i18next";

interface GraphQLSettingsModalProps {
  visible: boolean;
  settings: Settings | null;
  onCancel: () => void;
  onSuccess: (updatedSettings: Settings) => void;
}

const GraphQLSettingsModal: React.FC<GraphQLSettingsModalProps> = ({
  visible,
  settings,
  onCancel,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { config } = useConfig();
  const { currentProject } = useProject();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [identityProviders, setIdentityProviders] = useState<Array<{ name: string }>>([]);

  const projectId = currentProject?.id || '';

  // 加载身份提供商
  useEffect(() => {
    const loadProviders = async () => {
      if (!projectId) return;
      try {
        const providers = await getIdentityProviders(projectId);
        setIdentityProviders(providers);
      } catch (error) {
        console.error(t('identity_provider_load_failed'), error);
      }
    };

    if (visible) {
      loadProviders();
    }
  }, [visible, projectId, t]);

  // 设置表单初始值
  useEffect(() => {
    if (visible && settings) {
      form.setFieldsValue({
        graphqlEndpointPath: settings.security.graphqlEndpointPath || '/graphql',
        graphqlEndpointIdentityProvider: settings.security.graphqlEndpointIdentityProvider
      });
    }
  }, [visible, settings, form]);

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!settings || !projectId) return;

      setLoading(true);
      const updatedSettings = {
        ...settings,
        security: {
          ...settings.security,
          ...values
        }
      };

      await saveSettings(projectId, updatedSettings);
      message.success(t('config_save_success'));
      onSuccess(updatedSettings);
    } catch (error) {
      console.error(t('config_save_failed'), error);
      message.error(t('config_save_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('graphql_endpoint_config')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          {t('save')}
        </Button>
      ]}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="pt-4"
      >
        <Form.Item
          name="graphqlEndpointPath"
          label={t('graphql_endpoint_path')}
          rules={[{ required: true, message: t('graphql_endpoint_path_required') }]}
          extra={t('graphql_endpoint_full_address', { path: config?.apiRootPath || '' })}
        >
          <Input
            addonBefore={config?.apiRootPath || ''}
            placeholder="/graphql"
          />
        </Form.Item>

        <Form.Item
          name="graphqlEndpointIdentityProvider"
          label={t('identity_provider')}
          extra={t('identity_provider_help')}
        >
          <Select
            options={identityProviders.map(provider => ({
              value: provider.name,
              label: provider.name
            }))}
            placeholder={t('select_identity_provider')}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GraphQLSettingsModal;
