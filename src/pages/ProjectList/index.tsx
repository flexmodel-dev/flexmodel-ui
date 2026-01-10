import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Space, Tag, Modal, Form, Input, message, Empty, Spin } from 'antd';
import { PlusOutlined, SettingOutlined, DatabaseOutlined, CloudServerOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/store/appStore';
import { createProject, getProjects } from '@/services/project';
import type { Project } from '@/types/project';
import { PageContainer } from '@/components/common';

const { Title, Text } = Typography;

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentProject } = useProject();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projects = await getProjects();
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
        project.description.toLowerCase().includes(searchKeyword.toLowerCase())
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
      message.success('项目创建成功');
      await fetchProjects();
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('项目创建失败');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'default';
      case 'archived':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'inactive':
        return '停用';
      case 'archived':
        return '归档';
      default:
        return status;
    }
  };

  return (
    <PageContainer loading={loading}>
      <div style={{ padding: '24px', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>项目管理</Title>
          <Space>
            <Input
              placeholder="搜索项目..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
              创建项目
            </Button>
          </Space>
        </div>

        {filteredProjects.length === 0 ? (
          <Empty
            description={searchKeyword ? '未找到匹配的项目' : '暂无项目'}
            style={{ marginTop: '100px' }}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProjects.map(project => (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                <Card
                  hoverable
                  style={{ height: '100%', cursor: 'pointer' }}
                  onClick={() => handleProjectClick(project.id)}
                  bodyStyle={{ padding: '24px' }}
                  styles={{
                    body: { padding: '24px' }
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                          {project.name}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {project.description}
                        </Text>
                      </div>
                      <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={(e) => handleSettingsClick(e, project.id)}
                        style={{ flexShrink: 0 }}
                      />
                    </div>

                    <Space size="small" wrap>
                      <Tag color={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Tag>
                      <Tag icon={<DatabaseOutlined />} color="blue">
                        {project.modelCount} 个模型
                      </Tag>
                      <Tag icon={<CloudServerOutlined />} color="purple">
                        {project.apiCount} 个API
                      </Tag>
                    </Space>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        所有者: {project.memberCount} 人
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        创建时间: {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title="创建新项目"
          open={isCreateModalVisible}
          onOk={handleCreateModalOk}
          onCancel={handleCreateModalCancel}
          okText="创建"
          cancelText="取消"
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="项目名称"
              name="name"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
            <Form.Item
              label="项目描述"
              name="description"
              rules={[{ required: true, message: '请输入项目描述' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入项目描述" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </PageContainer>

  );
};

export default ProjectList;
