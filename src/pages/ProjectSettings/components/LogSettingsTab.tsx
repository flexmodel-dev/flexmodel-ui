import React, {useEffect, useState} from 'react';
import {Button, Form, InputNumber, message, Spin} from 'antd';
import {useTranslation} from 'react-i18next';
import {getProject, patchProject} from '@/services/project';

const DEFAULT_LOG_RETENTION_DAYS = 7;

interface LogSettingsTabProps {
  projectId: string;
  disabled?: boolean;
}

interface FormValues {
  logRetentionDays: number;
}

const LogSettingsTab: React.FC<LogSettingsTabProps> = ({projectId, disabled}) => {
  const {t} = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getProject(projectId)
      .then((project) => {
        const settings = (project.metadata?.logSettings ?? {}) as Record<string, any>;
        setMetadata(project.metadata ?? {});
        form.setFieldsValue({
          logRetentionDays: settings.logRetentionDays ?? DEFAULT_LOG_RETENTION_DAYS,
        });
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
        <Form.Item>
          <Button type="primary" loading={saving} onClick={handleSave} disabled={disabled}>
            {t('save')}
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default LogSettingsTab;
