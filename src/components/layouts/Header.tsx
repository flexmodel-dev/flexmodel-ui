import React, {useCallback, useMemo} from "react";
import {Breadcrumb, Button, Dropdown, Layout, Row, Space, Switch, theme} from "antd";
import type {MenuProps} from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import {useLocale, useSidebar, useTheme} from "@/store/appStore.ts";
import {useTranslation} from "react-i18next";
import {Locale} from "antd/es/locale";
import {
  CodeOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SunOutlined
} from "@ant-design/icons";
import {applyDarkMode, setDarkModeToStorage} from "@/utils/darkMode.ts";
import {Link, useLocation} from "react-router-dom";
import {getFullRoutePath} from "@/routes";

type HeaderProps = {
  onToggleAIChat?: () => void;
  onToggleConsole?: () => void;
};


const Header: React.FC<HeaderProps> = ({ onToggleAIChat, onToggleConsole }) => {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode: toggleDarkModeStore } = useTheme();
  const { setLocale: setLocaleStore, currentLang } = useLocale();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const { i18n } = useTranslation();
  const location = useLocation();
  const { token } = theme.useToken();

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

  // 使用 useCallback 缓存侧边栏折叠切换函数
  const handleSidebarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  // 使用 useMemo 缓存面包屑数据，避免每次渲染都重新计算
  const breadcrumbItems = useMemo(() => {
    const pathname = location.pathname;
    const items: any[] = [];

    // 添加首页
    items.push({
      title: <Link to="/"><HomeOutlined /></Link>
    });

    // 获取完整的路由路径（包括父路由和子路由）
    const fullRoutePath = getFullRoutePath(pathname);

    // 为每个路由段生成面包屑项
    fullRoutePath.forEach((route) => {
      const IconComponent = route.icon;

      items.push({
        title: (
          <span>
            <IconComponent style={{ marginRight: token.marginXS }} />
            {t(route.translationKey)}
          </span>
        )
        // 移除 href 属性，使面包屑不可点击
      });
    });

    return items;
  }, [location.pathname, t, token.marginXS]);

  // 使用 useMemo 缓存语言菜单
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

  // 使用 useMemo 缓存当前语言显示文本
  const currentLocaleText = useMemo(() =>
    currentLang === 'zh' ? "中文" : "English",
    [currentLang]
  );

  return (
    <Layout.Header
      className="bg-white dark:bg-[#18181c] border-b border-[#f5f5f5] dark:border-[#23232a] shadow-sm dark:shadow-lg"
      style={{
        padding: 0,
        height: token.controlHeight * 1.5,
        lineHeight: `${token.controlHeight * 1.5}px`,
        position: "fixed" as const, // 固定定位
        top: 0,
        left: isSidebarCollapsed ? 56 : 180, // 根据sidebar状态调整左边距
        right: 0,
        transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)" // 与sidebar动画同步
      }}
    >
      <Row justify="space-between" align="middle" style={{ height: '100%' }}>
        {/* 左侧面包屑和折叠按钮 */}
        <div style={{ paddingLeft: token.padding, display: 'flex', alignItems: 'center' }}>
          <Button
            icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleSidebarToggle}
            style={{
              marginRight: token.marginSM,
              fontSize: token.fontSizeLG
            }}
          />
          <Breadcrumb
            items={breadcrumbItems}
          />
        </div>

        {/* 右侧功能按钮 */}
        <Space style={{ paddingRight: token.padding }} size={token.marginSM}>
          <Button
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <g fill="none" stroke={token.colorTextBase} strokeWidth="1.5">
                <path strokeLinecap="round" d="M11.5 6C7.022 6 4.782 6 3.391 7.172S2 10.229 2 14s0 5.657 1.391 6.828S7.021 22 11.5 22c4.478 0 6.718 0 8.109-1.172S21 17.771 21 14c0-1.17 0-2.158-.041-3" />
                <path strokeLinejoin="round" d="m18.5 2l.258.697c.338.914.507 1.371.84 1.704c.334.334.791.503 1.705.841L22 5.5l-.697.258c-.914.338-1.371.507-1.704.84c-.334.334-.503.791-.841 1.705L18.5 9l-.258-.697c-.338-.914-.507-1.371-.84-1.704c-.334-.334-.791-.503-1.705-.841L15 5.5l.697-.258c.914-.338 1.371-.507 1.704-.84c.334-.334.503-.791.841-1.705z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.5 12l1.227 1.057c.515.445.773.667.773.943s-.258.498-.773.943L15.5 16m-8-4l-1.227 1.057c-.515.445-.773.667-.773.943s.258.498.773.943L7.5 16m5-5l-2 6" />
              </g>
            </svg>}
            onClick={onToggleAIChat}
          />
          <Button
            icon={<CodeOutlined />}
            onClick={onToggleConsole}
          />
          <Switch
            checked={isDark}
            onChange={toggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            style={{ marginRight: token.marginXS }}
          />
          <Dropdown
            menu={{items: localeMenuItems}}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button size="small" icon={<GlobalOutlined />}>{currentLocaleText}</Button>
          </Dropdown>
          <a href={`${import.meta.env.BASE_URL}/swagger-ui/index.html`} target="_blank" rel="noopener noreferrer">
            <FileSearchOutlined style={{ fontSize: token.fontSizeLG }} />
          </a>
          <a href="https://flexmodel.wetech.tech" target="_blank" rel="noopener noreferrer">
            <QuestionCircleOutlined style={{ fontSize: token.fontSizeLG }} />
          </a>
        </Space>
      </Row>
    </Layout.Header>
  );
};

export default React.memo(Header);
