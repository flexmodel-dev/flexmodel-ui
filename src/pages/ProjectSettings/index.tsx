import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, theme, Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getProject, patchProject } from '@/services/project';
import { useProject } from '@/store/appStore';
import { PageContainer } from '@/components/common';

const { Text } = Typography;

const ProjectSettings: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject } = useProject();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getProject(projectId)
      .then((project) => {
        form.setFieldsValue({
          name: project.name,
          description: project.description || '',
        });
      })
      .finally(() => setLoading(false));
  }, [projectId, form]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      const updatedProject = await patchProject(projectId, {
        name: values.name,
        description: values.description,
      });
      // 更新全局 store 中的项目信息，使头部名称同步刷新
      setCurrentProject(updatedProject);
      message.success(t('form_save_success'));
    } catch (error: any) {
      message.error(error?.message || t('project.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const isDefaultProject = projectId === 'default';

  return (
    <PageContainer title={t('project_settings')} loading={loading}>
      <div style={{ maxWidth: 600, padding: `${token.paddingLG}px 0` }}>
        <Form
          form={form}
          layout="vertical"
          disabled={isDefaultProject}
        >
          <Form.Item
            label={t('project.name')}
            name="name"
            rules={[
              { required: true, message: t('project.nameRequired') },
            ]}
          >
            <Input placeholder={t('project.namePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('project.description')}
            name="description"
          >
            <Input.TextArea rows={4} placeholder={t('project.descriptionPlaceholder')} />
          </Form.Item>

          {!isDefaultProject && (
            <Form.Item>
              <Button type="primary" loading={saving} onClick={handleSave}>
                {t('save')}
              </Button>
            </Form.Item>
          )}

          {isDefaultProject && (
            <Text type="secondary">{t('project.defaultProjectNotEditable')}</Text>
          )}
        </Form>

        <Divider />

        <div style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}>
          <div><Text type="secondary">{t('project.projectId')}: </Text><Text code>{projectId}</Text></div>
          {currentProject?.databaseName && (
            <div style={{ marginTop: token.marginXS }}>
              <Text type="secondary">{t('project.databaseName')}: </Text>
              <Text code>{currentProject.databaseName}</Text>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ProjectSettings;
