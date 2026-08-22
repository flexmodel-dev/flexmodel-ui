import React from 'react';
import {Button, Divider, Space, Typography, theme} from 'antd';
import {BookOutlined, GithubOutlined, GlobalOutlined} from '@ant-design/icons';
import {useTranslation} from "react-i18next";
import {useConfig} from "@/store/appStore";

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const {config} = useConfig();
  const version = config.version || '';
  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      padding: token.paddingMD,
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Logo和标题区域 */}
        <div style={{ textAlign: 'center', padding: `${token.paddingXL}px 0` }}>
            <div style={{
              display: 'inline-block',
              padding: token.paddingLG,
              borderRadius: token.borderRadiusLG,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorTextSecondary} 100%)`,
              marginBottom: token.marginLG
            }}>
              <img
                style={{
                  width: '56px',
                  height: '56px',
                }}
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Flexmodel Logo"
              />
            </div>
          <Title level={2} style={{margin: `${token.marginSM}px ${token.marginXS}px`, fontWeight: 600}}>
              Flexmodel
            </Title>
            <Paragraph style={{
              fontSize: token.fontSize,
              color: 'var(--ant-color-text-secondary)',
              margin: `0 0 ${token.marginLG}px 0`
            }}>
              {t('app_description')}
            </Paragraph>
          </div>

        {/* 版本信息 */}
        <div style={{
          textAlign: 'center',
          marginBottom: token.marginLG,
        }}>
          <Text type="secondary" style={{fontSize: token.fontSize}}>
            {version}
          </Text>
        </div>

        <Divider style={{margin: `${token.marginLG}px 0`}}/>


          {/* 链接和文档 */}
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{marginBottom: '16px'}}>
              了解更多
            </Title>
            <Space size="middle" wrap>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                size="middle"
                href="https://github.com/flexmodel-dev"
                target="_blank"
                style={{borderRadius: token.borderRadius}}
              >
                GitHub
              </Button>
              <Button
                icon={<BookOutlined />}
                size="middle"
                href="https://flexmodel.dev/docs"
                target="_blank"
                style={{borderRadius: token.borderRadius}}
              >
                文档
              </Button>
              <Button
                icon={<GlobalOutlined />}
                size="middle"
                href="https://flexmodel.dev"
                target="_blank"
                style={{ borderRadius: token.borderRadius }}
              >
                官网
              </Button>
            </Space>
          </div>

          {/* 版权信息 */}
          <div style={{
            textAlign: 'center',
            marginTop: token.marginLG,
            padding: token.paddingSM,
            background: 'var(--ant-color-bg-layout)',
            borderRadius: token.borderRadius
          }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              © 2025 Flexmodel. All rights reserved.
            </Text>
          </div>
      </div>
    </div>
  );
};

export default About;
