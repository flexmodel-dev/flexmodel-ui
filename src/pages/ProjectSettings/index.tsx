import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Menu, message, theme, Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { getProject, patchProject } from '@/services/project';
import { useProject } from '@/store/appStore';
import { PageContainer } from '@/components/common';
import ProvidersTab from '@/pages/Authentication/components/ProvidersTab';
import { spacing } from '@/theme/designTokens';

const { Title, Text } = Typography;

type ProjectSettingsTabKey = 'base' | 'auth';

const ProjectSettings: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject } = useProject();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as ProjectSettingsTabKey) || 'base';
  const [selectKey, setSelectKey] = useState<ProjectSettingsTabKey>(defaultTab);

  const menuMap: Record<ProjectSettingsTabKey, string> = {
    base: t('settings_basic_settings'),
    auth: t('authentication'),
  };

  const menuItems = (Object.keys(menuMap) as ProjectSettingsTabKey[]).map((key) => ({
    key,
    label: menuMap[key],
  }));

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

  const renderContent = () => {
    switch (selectKey) {
      case 'base':
        return (
          <Form
              form={form}
              layout="vertical"
              disabled={isDefaultProject}
              style={{ maxWidth: 800 }}
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
               <Divider />
               <div style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM, maxWidth: 600 }}>
              <div><Text type="secondary">{t('project.projectId')}: </Text><Text code>{projectId}</Text></div>
              {currentProject?.databaseName && (
                <div style={{ marginTop: token.marginXS }}>
                  <Text type="secondary">{t('project.databaseName')}: </Text>
                  <Text code>{currentProject.databaseName}</Text>
                </div>
              )}
            </div>
            </Form>
        );
      case 'auth':
        return <ProvidersTab />;
      default:
        return null;
    }
  };

  return (
    <PageContainer loading={loading}>
      <div className="flex w-full h-full">
        <div style={{ width: 240, borderRight: `1px solid ${token.colorBorderSecondary}` }}>
          <Menu
            className="h-full"
            mode="inline"
            selectedKeys={[selectKey]}
            onClick={({ key }) => setSelectKey(key as ProjectSettingsTabKey)}
            items={menuItems}
          />
        </div>
        <div className="flex-1" style={{ padding: `${spacing.md}px ${spacing.xl}px` }}>
          <div style={{ marginBottom: spacing.lg }}>
            <Title level={3} style={{ margin: 0 }}>{menuMap[selectKey]}</Title>
          </div>
          {renderContent()}
        </div>
      </div>
    </PageContainer>
  );
};

export default ProjectSettings;
