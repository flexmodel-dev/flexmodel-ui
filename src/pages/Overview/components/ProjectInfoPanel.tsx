import React from 'react';
import {Card, Tag, Typography} from 'antd';
import {CheckCircleOutlined,} from '@ant-design/icons';
import {useProject} from '@/store/appStore';

const {Text} = Typography;

const mockDomain = 'https://api.flexmodel.dev';

const ProjectInfoPanel: React.FC = () => {
  const {currentProject} = useProject();
  const projectName = currentProject?.name || '未选择项目';

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
        <div style={{display: 'flex', alignItems: 'center', gap: 12, gridColumn: '1 / -1'}}>
          <Text style={{fontSize: 14, color: 'var(--ant-color-text-secondary)', whiteSpace: 'nowrap'}}>访问域名</Text>
          <Text copyable={{text: mockDomain}}>{mockDomain}</Text>
        </div>
      </div>
    </Card>
  );
};

export default ProjectInfoPanel;
