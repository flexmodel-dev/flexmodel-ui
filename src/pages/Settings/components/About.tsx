import React from 'react';
import {Button, Divider, Space, Typography} from 'antd';
import {BookOutlined, GithubOutlined, GlobalOutlined} from '@ant-design/icons';
import {useTranslation} from "react-i18next";

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Logo和标题区域 */}
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: '20px'
            }}>
              <img
                style={{
                  width: '56px',
                  height: '56px',
                }}
                src={`${import.meta.env.BASE_URL}/logo.png`}
                alt="Flexmodel Logo"
              />
            </div>
            <Title level={2} style={{ margin: '12px 0 6px 0', fontWeight: 600 }}>
              Flexmodel
            </Title>
            <Paragraph style={{
              fontSize: '15px',
              color: 'var(--ant-color-text-secondary)',
              margin: '0 0 20px 0'
            }}>
              {t('app_description')}
            </Paragraph>
          </div>

          <Divider style={{ margin: '20px 0' }} />


          {/* 链接和文档 */}
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ marginBottom: '20px' }}>
              了解更多
            </Title>
            <Space size="middle" wrap>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                size="middle"
                href="https://github.com/flexmodel-dev"
                target="_blank"
                style={{ borderRadius: '6px' }}
              >
                GitHub
              </Button>
              <Button
                icon={<BookOutlined />}
                size="middle"
                href="https://flexmodel.wetech.tech/docs"
                target="_blank"
                style={{ borderRadius: '6px' }}
              >
                文档
              </Button>
              <Button
                icon={<GlobalOutlined />}
                size="middle"
                href="https://flexmodel.wetech.tech"
                target="_blank"
                style={{ borderRadius: '6px' }}
              >
                官网
              </Button>
            </Space>
          </div>

          {/* 版权信息 */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            padding: '12px',
            background: 'var(--ant-color-bg-layout)',
            borderRadius: '6px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              © 2025 Flexmodel. All rights reserved.
            </Text>
          </div>
      </div>
    </div>
  );
};

export default About;
