import React from 'react';
import {Card, Tag, Typography} from 'antd';
import {CheckCircleOutlined,} from '@ant-design/icons';
import {useProject, useConfig} from '@/store/appStore';

const {Text} = Typography;

/**
 * Build a displayable URL from a template.
 * If the template is relative (starts with /), prepend window.location.origin
 * so the user sees the full URL they can actually visit.
 */
const resolveUrl = (template: string, projectId: string): string => {
  const url = template.replace('{{projectId}}', projectId).replace('/{{name}}', '');
  if (url.startsWith('/')) {
    return window.location.origin + url;
  }
  return url;
};

const ProjectInfoPanel: React.FC = () => {
  const {currentProject} = useProject();
  const {config} = useConfig();
  const projectName = currentProject?.name || '未选择项目';
  const projectId = currentProject?.id || '';

  const pagesUrl = resolveUrl(
    config.pagesUrlTemplate || '/pages/{{projectId}}',
    projectId,
  );

  return (
    <Card
      hoverable
      title="项目信息"
      style={{marginTop: 8}}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px 24px',
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Text style={{fontSize: 14, color: 'var(--ant-color-text-secondary)', whiteSpace: 'nowrap'}}>项目名称</Text>
          <Text strong>{projectName}</Text>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Text style={{fontSize: 14, color: 'var(--ant-color-text-secondary)', whiteSpace: 'nowrap'}}>健康状态</Text>
          <Tag color="success" icon={<CheckCircleOutlined/>}>正常</Tag>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Text style={{fontSize: 14, color: 'var(--ant-color-text-secondary)', whiteSpace: 'nowrap'}}>Pages 站点</Text>
          {projectId ? (
            <Text copyable={{text: pagesUrl}}>{pagesUrl}</Text>
          ) : (
            <Text type="secondary" style={{fontSize: 13}}>请先选择项目</Text>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectInfoPanel;
