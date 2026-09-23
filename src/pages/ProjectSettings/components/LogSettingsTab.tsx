import React, {useEffect, useState} from 'react';
import {Button, Form, InputNumber, message, Select, Spin, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import {getProject, patchProject} from '@/services/project';
import {getModelList} from '@/services/model';
import type {EntitySchema} from '@/types/data-modeling';

const DEFAULT_AUDIT_RESOURCES = [
  'f_trigger',
  'f_em_flow_definition',
  'f_em_flow_deployment',
  'f_function',
  'f_bucket',
  'f_auth_provider_config',
];
const DEFAULT_LOG_RETENTION_DAYS = 7;

interface LogSettingsTabProps {
  projectId: string;
  disabled?: boolean;
}

interface FormValues {
  logRetentionDays: number;
  auditResources: string[];
}

const LogSettingsTab: React.FC<LogSettingsTabProps> = ({projectId, disabled}) => {
  const {t} = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    // 同时加载项目设置与模型列表，审计资源从实体表中选取
    Promise.all([
      getProject(projectId),
      getModelList(projectId),
    ])
      .then(([project, models]) => {
        const settings = (project.metadata?.logSettings ?? {}) as Record<string, any>;
        setMetadata(project.metadata ?? {});
        form.setFieldsValue({
          logRetentionDays: settings.logRetentionDays ?? DEFAULT_LOG_RETENTION_DAYS,
          auditResources: settings.auditResources ?? [...DEFAULT_AUDIT_RESOURCES],
        });
        // 仅实体（表）可选为审计资源，枚举/本地查询不参与审计
        setModelOptions(
          (models as EntitySchema[])
            .filter((m) => m.type === 'Entity')
            .map((m) => ({label: m.name, value: m.name}))
        );
      })
      .finally(() => setLoading(false));
  }, [projectId, form]);

  const handleSave = async () => {
    if (!projectId) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      const updated = await patchProject(projectId, {
        metadata: {
          ...metadata,
          logSettings: {
            logRetentionDays: values.logRetentionDays,
            auditResources: values.auditResources,
          },
        },
      });
      setMetadata(updated.metadata ?? {});
      message.success(t('form_save_success'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" style={{maxWidth: 800}} disabled={disabled}>
        <Form.Item
          name="logRetentionDays"
          label={t('project_log_settings_log_retention_days')}
          extra={t('project_log_settings_log_retention_days_desc')}
        >
          <InputNumber min={1} max={365} style={{width: 160}}/>
        </Form.Item>
        <Form.Item
          name="auditResources"
          label={t('project_log_settings_audit_resources')}
          extra={t('project_log_settings_audit_resources_desc')}
          rules={[{required: true, message: t('project_log_settings_audit_resources_required')}]}
        >
          <Select
            mode="multiple"
            showSearch
            optionFilterProp="label"
            placeholder={t('project_log_settings_audit_resources_placeholder')}
            options={modelOptions}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={saving} onClick={handleSave} disabled={disabled}>
            {t('save')}
          </Button>
        </Form.Item>
        <Typography.Text type="secondary">
          {t('project_log_settings_hint')}
        </Typography.Text>
      </Form>
    </Spin>
  );
};

export default LogSettingsTab;
