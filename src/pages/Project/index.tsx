import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Dropdown,
  Table,
  theme
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  SearchOutlined,
  BranchesOutlined,
  CloudOutlined,
  MoreOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/store/appStore';
import { createProject, getProjects, deleteProject } from '@/services/project';
import type { Project } from '@/types/project';
import { PageContainer } from '@/components/common';
import { t } from 'i18next';

const { Title, Text } = Typography;

const Project: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { setCurrentProject } = useProject();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card'); // 'card' or 'list'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projects = await getProjects({ include: 'stats' });
      setProjects(projects);
      setFilteredProjects(projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchKeyword) {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false)
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchKeyword]);

  const handleCreateProject = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalOk = async () => {
    try {
      const values = await form.validateFields();
      await createProject(values);
      setIsCreateModalVisible(false);
      form.resetFields();
      message.success(t('project.createSuccess'));
      await fetchProjects();
    } catch (error) {
      console.error('Validation failed:', error);
      message.error(t('project.createFailed'));
    }
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
    navigate(`/project/${projectId}`);
  };

  const handleSettingsClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    navigate(`/project/${projectId}/settings`);
  };

  const showDeleteConfirm = (projectId: string, projectName: string) => {
    Modal.confirm({
      title: t('project.deleteConfirm'),
      icon: <ExclamationCircleFilled />,
      content: `${t('project.deleteConfirmDesc', { name: projectName })}`,
      okText: t('common.confirm'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await deleteProject(projectId);
          message.success(t('project.deleteSuccess'));
          await fetchProjects();
        } catch (error: any) {
          console.error('Failed to delete project:', error);
          message.error(error?.message);
          throw error;
        }
      }
    });
  };

  return (
    <PageContainer
      title={t('platform.project')}
      extra={[
        <Space>
          <Input
            placeholder={t('project.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Space>
            <Button
              type={viewMode === 'card' ? 'default' : 'text'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
              style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
            />
            <Button
              type={viewMode === 'list' ? 'default' : 'text'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
              style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4, marginLeft: -1 }}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
            {t('project.create')}
          </Button>
        </Space>
      ]}
      loading={loading}>
      {filteredProjects.length === 0 ? (
        <Empty
          description={searchKeyword ? t('project.noResults') : t('project.empty')}
          style={{ marginTop: '100px' }}
        />
      ) : viewMode === 'list' ? (
        <Table
          dataSource={filteredProjects}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleProjectClick(record.id)
          })}
          style={{ cursor: 'pointer' }}
          pagination={false}
          bordered
          rowClassName={() => 'table-row'}
          columns={[
            {
              title: t('project.name'),
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <div>
                  <div style={{ fontWeight: '500' }}>{text}</div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.description}</div>
                </div>
              )
            },
            {
              title: t('project.owner'),
              dataIndex: 'ownerId',
              key: 'ownerId',
              render: (text) => text || '-'
            },
            {
              title: t('project.stats'),
              key: 'stats',
              render: (_, record) => (
                <Space size="small" wrap>
                  {(record.stats?.apiCount ?? 0) > 0 && (
                    <Tag icon={<CloudServerOutlined />} color="blue">
                      {record.stats?.apiCount} {t('project.api')}
                    </Tag>
                  )}
                  {(record.stats?.datasourceCount ?? 0) > 0 && (
                    <Tag icon={<DatabaseOutlined />} color="green">
                      {record.stats?.datasourceCount} {t('project.dataSource')}
                    </Tag>
                  )}
                  {(record.stats?.flowCount ?? 0) > 0 && (
                    <Tag icon={<BranchesOutlined />} color="purple">
                      {record.stats?.flowCount} {t('project.flow')}
                    </Tag>
                  )}
                  {(record.stats?.storageCount ?? 0) > 0 && (
                    <Tag icon={<CloudOutlined />} color="orange">
                      {record.stats?.storageCount} {t('project.storage')}
                    </Tag>
                  )}
                </Space>
              )
            },
            {
              title: t('project.createdAt'),
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (text) => new Date(text).toLocaleString('zh-CN')
            },
            {
              title: '',
              key: 'actions',
              render: (_, record) => (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'settings',
                        label: t('project.settings'),
                        icon: <SettingOutlined />,
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                          handleSettingsClick(e.domEvent as React.MouseEvent, record.id);
                        }
                      },
                      {
                        key: 'delete',
                        label: t('project.delete'),
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                          showDeleteConfirm(record.id, record.name);
                        }
                      }
                    ]
                  }}
                  trigger={['hover']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )
            }
          ]}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map(project => (
            <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
              <Card
                hoverable
                style={{ height: '100%', cursor: 'pointer' }}
                onClick={() => handleProjectClick(project.id)}
                styles={{
                  body: { padding: token.paddingLG, display: 'flex', flexDirection: 'column', height: '100%' }
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ margin: 0, marginBottom: token.marginMD }}>
                        {project.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                        {project.description}
                      </Text>
                    </div>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'settings',
                            label: t('project.settings'),
                            icon: <SettingOutlined />,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              handleSettingsClick(e.domEvent as React.MouseEvent, project.id);
                            }
                          },
                          {
                            key: 'delete',
                            label: t('project.delete'),
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              showDeleteConfirm(project.id, project.name);
                            }
                          }
                        ]
                      }}
                      trigger={['hover']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        style={{ flexShrink: 0 }}
                      />
                    </Dropdown>
                  </div>
                  <Space size="small" style={{ overflow: 'hidden', width: '100%' }}>
                    {(project.stats?.apiCount ?? 0) > 0 && (
                      <Tag icon={<CloudServerOutlined />} color="blue">
                        {project.stats?.apiCount} {t('project.api')}
                      </Tag>
                    )}
                    {(project.stats?.datasourceCount ?? 0) > 0 && (
                      <Tag icon={<DatabaseOutlined />} color="green">
                        {project.stats?.datasourceCount} {t('project.dataSource')}
                      </Tag>
                    )}
                    {(project.stats?.flowCount ?? 0) > 0 && (
                      <Tag icon={<BranchesOutlined />} color="purple">
                        {project.stats?.flowCount} {t('project.flow')}
                      </Tag>
                    )}
                    {(project.stats?.storageCount ?? 0) > 0 && (
                      <Tag icon={<CloudOutlined />} color="orange">
                        {project.stats?.storageCount} {t('project.storage')}
                      </Tag>
                    )}
                  </Space>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('project.owner')}: {project.ownerId}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('project.createdAt')}: {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={t('project.createModalTitle')}
        open={isCreateModalVisible}
        onOk={handleCreateModalOk}
        onCancel={handleCreateModalCancel}
        okText={t('common.create')}
        cancelText={t('common.cancel')}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('project.projectId')}
            name="id"
            tooltip={t('project.projectIdHelp')}
          >
            <Input placeholder={t('project.projectIdPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('project.name')}
            name="name"
            rules={[{ required: true, message: t('project.nameRequired') }]}
          >
            <Input placeholder={t('project.namePlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('project.description')}
            name="description"
            rules={[{ required: true, message: t('project.descriptionRequired') }]}
          >
            <Input.TextArea rows={4} placeholder={t('project.descriptionPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>

  );
};

export default Project;
