import React, { useCallback, useMemo, useState } from "react";
import { Layout, Button, Drawer, Dropdown, Space, Switch, Typography, theme as antdTheme } from "antd";
import type { MenuProps } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { useLocale, useTheme } from "@/store/appStore";
import { useTranslation } from "react-i18next";
import { Locale } from "antd/es/locale";
import {
  ApiOutlined,
  GlobalOutlined,
  HomeOutlined,
  MoonOutlined,
  SunOutlined
} from "@ant-design/icons";
import { applyDarkMode, setDarkModeToStorage } from "@/utils/darkMode";
import { Link } from "react-router-dom";
import PlatformSidebar from "./PlatformSidebar";
import { Outlet } from "react-router-dom";
import UserInfo from "@/components/UserInfo";

const PlatformLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode: toggleDarkModeStore } = useTheme();
  const { setLocale: setLocaleStore, currentLang } = useLocale();
  const { i18n } = useTranslation();
  const { token } = antdTheme.useToken();
  const [mcpDrawerOpen, setMcpDrawerOpen] = useState(false);
  const mcpUrl = useMemo(() => `${window.location.origin}/api/mcp?api_key=<your_api_key>`, []);

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDark;
    applyDarkMode(newDarkMode);
    setDarkModeToStorage(newDarkMode);
    toggleDarkModeStore();
  }, [isDark, toggleDarkModeStore]);

  const changeLocale = useCallback((localeValue: Locale) => {
    const lang = localeValue === zhCN ? 'zh' : 'en';
    setLocaleStore(localeValue, lang);
    i18n.changeLanguage(lang);
    if (lang === 'zh') {
      dayjs.locale("zh-cn");
    } else {
      dayjs.locale("en");
    }
  }, [setLocaleStore, i18n]);

  const localeMenuItems: MenuProps["items"] = useMemo(() => [
    {
      key: "zh",
      label: "中文",
      onClick: () => changeLocale(zhCN),
    },
    {
      key: "en",
      label: "English",
      onClick: () => changeLocale(enUS),
    },
  ], [changeLocale]);

  const currentLocaleText = useMemo(() =>
    currentLang === 'zh' ? "中文" : "English",
    [currentLang]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          padding: 0,
          height: token.controlHeight * 1.5,
          lineHeight: `${token.controlHeight * 1.5}px`,
          zIndex: 10,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: `0 ${token.paddingLG}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: token.paddingMD }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              borderRadius: token.borderRadius,
              transition: 'all 0.3s'
            }}>
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                width={28}
                alt="logo"
                style={{ marginRight: token.marginXS }}
              />
              <span style={{
                fontWeight: 600,
                fontSize: token.fontSizeLG,
                letterSpacing: 0.5,
                color: token.colorText
              }}>Flexmodel</span>
            </Link>
            <div style={{
              width: 1,
              height: 20,
              backgroundColor: token.colorBorder,
              margin: `0 ${token.marginXS}px`
            }} />
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: token.colorText,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              borderRadius: token.borderRadius,
              transition: 'all 0.3s'
            }}>
              <HomeOutlined style={{ marginRight: token.marginXS }} />
              <span>{t('platform.home')}</span>
            </Link>
          </div>

          <Space size={token.marginSM}>
            <Button size="small" icon={<ApiOutlined />} onClick={() => setMcpDrawerOpen(true)}>{t('platform.mcp_connection')}</Button>
            <Switch
              checked={isDark}
              onChange={toggleDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              style={{ marginRight: token.marginXS }}
            />
            <Dropdown
              menu={{ items: localeMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button size="small" icon={<GlobalOutlined />}>{currentLocaleText}</Button>
            </Dropdown>
            <UserInfo />
          </Space>
        </div>
      </Layout.Header>
      <Layout>
        <PlatformSidebar />
        <Layout.Content
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            padding: token.padding,
            backgroundColor: token.colorFillQuaternary
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
      <Drawer
        title={t('platform.mcp_drawer_title')}
        open={mcpDrawerOpen}
        onClose={() => setMcpDrawerOpen(false)}
        width={560}
        destroyOnHidden
      >
        <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_overview_title')}</Typography.Paragraph>
        <Typography.Paragraph>{t('platform.mcp_overview_desc')}</Typography.Paragraph>

        <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_endpoint_title')}</Typography.Paragraph>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.marginSM,
          padding: token.padding,
          backgroundColor: token.colorFillQuaternary,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: token.marginLG,
        }}>
          <Typography.Text code copyable={{ text: mcpUrl }} style={{ flex: 1, wordBreak: 'break-all' }}>{mcpUrl}</Typography.Text>
        </div>

        <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_tools_title')}</Typography.Paragraph>
        <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginSM, marginBottom: token.marginLG }}>
          {[
            { label: t('platform.mcp_project_tools'), desc: t('platform.mcp_project_tools_desc') },
            { label: t('platform.mcp_modeling_tools'), desc: t('platform.mcp_modeling_tools_desc') },
            { label: t('platform.mcp_data_tools'), desc: t('platform.mcp_data_tools_desc') },
          ].map((item) => (
            <div key={item.label} style={{
              padding: token.padding,
              backgroundColor: token.colorFillQuaternary,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}>
              <Typography.Text strong>{item.label}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>{item.desc}</Typography.Text>
            </div>
          ))}
        </div>

        <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_config_title')}</Typography.Paragraph>
        <Typography.Text type="secondary">{t('platform.mcp_config_subtitle')}</Typography.Text>
        <pre style={{
          padding: token.padding,
          backgroundColor: token.colorFillQuaternary,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorderSecondary}`,
          overflow: 'auto',
          marginTop: token.marginSM,
          marginBottom: token.marginSM,
        }}>{JSON.stringify({ mcpServers: { flexmodel: { url: mcpUrl } } }, null, 2)}</pre>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>{t('platform.mcp_config_note')}</Typography.Text>

        <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG, marginTop: token.marginLG }}>{t('platform.mcp_scenarios_title')}</Typography.Paragraph>
        <ul style={{ paddingLeft: token.paddingLG }}>
          {[
            t('platform.mcp_scenario_1'),
            t('platform.mcp_scenario_2'),
            t('platform.mcp_scenario_3'),
            t('platform.mcp_scenario_4'),
          ].map((scenario, i) => (
            <li key={i} style={{ marginBottom: token.marginXS }}>
              <Typography.Text>{scenario}</Typography.Text>
            </li>
          ))}
        </ul>
      </Drawer>
    </Layout>
  );
};

export default PlatformLayout;
