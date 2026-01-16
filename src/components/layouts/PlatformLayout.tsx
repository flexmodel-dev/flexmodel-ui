import React, { useCallback, useMemo } from "react";
import { Layout, Button, Dropdown, Space, Switch, theme as antdTheme } from "antd";
import type { MenuProps } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { useLocale, useTheme } from "@/store/appStore";
import { useTranslation } from "react-i18next";
import { Locale } from "antd/es/locale";
import {
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
        className="bg-white dark:bg-[#18181c] border-b border-[#f5f5f5] dark:border-[#23232a] shadow-sm dark:shadow-lg"
        style={{
          padding: 0,
          height: token.controlHeight * 1.5,
          lineHeight: `${token.controlHeight * 1.5}px`,
          zIndex: 10
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
                src={`${import.meta.env.BASE_URL}/logo.png`}
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
            padding: token.padding
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default PlatformLayout;
