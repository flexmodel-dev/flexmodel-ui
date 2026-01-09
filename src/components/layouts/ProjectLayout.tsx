import React, { useCallback, useMemo } from "react";
import { Layout, Button, Dropdown, Space, Switch, theme as antdTheme, Breadcrumb } from "antd";
import type { MenuProps } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { useLocale, useTheme, useProject } from "@/store/appStore";
import { useTranslation } from "react-i18next";
import { Locale } from "antd/es/locale";
import {
  ApartmentOutlined,
  CodeOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HomeOutlined,
  MoonOutlined,
  SunOutlined
} from "@ant-design/icons";
import { applyDarkMode, setDarkModeToStorage } from "@/utils/darkMode";
import { Link, useParams } from "react-router-dom";
import ProjectSidebar from "./ProjectSidebar";
import AIChatBox from "@/components/ai-chatbox/index";
import Console from "@/components/console/Console.tsx";
import { Message } from "../ai-chatbox/types";
import ResizablePanel from "@/components/common/ResizablePanel";
import { Outlet } from "react-router-dom";
import { getFullRoutePath } from "@/routes";
import UserInfo from "@/components/UserInfo";

const ProjectLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode: toggleDarkModeStore } = useTheme();
  const { setLocale: setLocaleStore, currentLang } = useLocale();
  const { currentProject, projects, setCurrentProject } = useProject();
  const { i18n } = useTranslation();
  const { token } = antdTheme.useToken();
  const { projectId } = useParams<{ projectId: string }>();

  const [isAIChatVisible, setIsAIChatVisible] = React.useState(false);
  const [isAIChatFloating, setIsAIChatFloating] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [isConsoleVisible, setIsConsoleVisible] = React.useState(false);

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

  const handleProjectChange = useCallback((newProjectId: string) => {
    const project = projects?.find(p => p.id === newProjectId);
    if (project) {
      setCurrentProject(project);
    }
  }, [projects, setCurrentProject]);

  const breadcrumbItems = useMemo(() => {
    const pathname = window.location.hash.replace('#', '');
    const items: any[] = [];

    items.push({
      title: (
        <Link to="/">
          <HomeOutlined style={{ marginRight: token.marginXS }} />
          <span>{t('platform.home')}</span>
        </Link>
      )
    });

    if (currentProject) {
      items.push({
        title: (
          <span className="cursor-pointer">
            <ApartmentOutlined style={{ marginRight: token.marginXS }} />
            <span>{currentProject.name}</span>
          </span>
        ),
        menu: projects && projects.length > 1 ? {
          items: projects.map(project => ({
            key: project.id,
            label: project.name,
            onClick: () => handleProjectChange(project.id)
          }))
        } : undefined
      });
    }

    const routePath = pathname.replace(`/project/${projectId}`, '') || '/';
    const fullRoutePath = getFullRoutePath(routePath);

    fullRoutePath.forEach((route) => {
      const IconComponent = route.icon;
      items.push({
        title: (
          <span>
            <IconComponent style={{ marginRight: token.marginXS }} />
            {t(route.translationKey)}
          </span>
        )
      });
    });

    return items;
  }, [currentProject, projects, projectId, t, token.marginXS, handleProjectChange]);

  return (
    <Layout style={{
      height: "100vh",
      overflow: "hidden"
    }}>
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
            <Link to={`/project/${projectId}`} style={{
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
              }}>{currentProject?.name}</span>
            </Link>
            <div style={{
              width: 1,
              height: 20,
              backgroundColor: token.colorBorder,
              margin: `0 ${token.marginXS}px`
            }} />
            <Breadcrumb
              items={breadcrumbItems}
            />
          </div>

          <Space size={token.marginSM}>
            <Button
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g fill="none" stroke={token.colorTextBase} strokeWidth="1.5">
                  <path strokeLinecap="round" d="M11.5 6C7.022 6 4.782 6 3.391 7.172S2 10.229 2 14s0 5.657 1.391 6.828S7.021 22 11.5 22c4.478 0 6.718 0 8.109-1.172S21 17.771 21 14c0-1.17 0-2.158-.041-3" />
                  <path strokeLinejoin="round" d="m18.5 2l.258.697c.338.914.507 1.371.84 1.704c.334.334.791.503 1.705.841L22 5.5l-.697.258c-.914.338-1.371.507-1.704.84c-.334-.503.791-.841 1.705L18.5 9l-.258-.697c-.338-.914-.507-1.371-.84-1.704c-.334-.334-.791-.503-1.705-.841L15 5.5l.697-.258c.914-.338 1.371-.507 1.704-.84c.334-.334.503-.791.841-1.705z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.5 12l1.227 1.057c.515.445.773.667.773.943s-.258.498-.773.943L15.5 16m-8-4l-1.227 1.057c-.515.445-.773.667-.773.943s.258.498.773.943L7.5 16m5-5l-2 6" />
                </g>
              </svg>}
              onClick={() => setIsAIChatVisible((v) => !v)}
            />
            <Button
              icon={<CodeOutlined />}
              onClick={() => setIsConsoleVisible((v) => !v)}
            />
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
            <a href={`${import.meta.env.BASE_URL}/swagger-ui/index.html`} target="_blank" rel="noopener noreferrer">
              <FileSearchOutlined style={{ fontSize: token.fontSizeLG }} />
            </a>
            <UserInfo />
          </Space>
        </div>
      </Layout.Header>
      <Layout>
        <ProjectSidebar />
        <Layout.Content
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden"
          }}
        >
          <ResizablePanel
            visible={isConsoleVisible}
            placement="bottom"
            defaultSize={300}
            minSize={150}
            maxSize={600}
            renderPanel={() => (
              <Console onToggle={() => setIsConsoleVisible((v) => !v)} />
            )}
          >
            <ResizablePanel
              visible={isAIChatVisible && !isAIChatFloating}
              placement="right"
              defaultSize={420}
              minSize={320}
              maxSize={600}
              mainStyle={{ padding: token.padding }}
              renderPanel={() => (
                <AIChatBox
                  conversationId={conversationId}
                  messages={messages}
                  onMessages={(msg: Message[]) => {
                    setConversationId(msg[0]?.conversationId);
                    setMessages(msg);
                  }}
                  isVisible={isAIChatVisible}
                  onToggle={setIsAIChatVisible}
                  isFloating={isAIChatFloating}
                  onToggleFloating={setIsAIChatFloating}
                />
              )}
            >
              <Outlet />
            </ResizablePanel>
          </ResizablePanel>
        </Layout.Content>
      </Layout>

      {isAIChatFloating && (
        <AIChatBox
          conversationId={conversationId}
          messages={messages}
          onMessages={(msg: Message[]) => {
            setConversationId(msg[0].conversationId);
            setMessages(msg);
          }}
          isVisible={isAIChatVisible}
          onToggle={setIsAIChatVisible}
          isFloating={isAIChatFloating}
          onToggleFloating={setIsAIChatFloating}
        />
      )}
    </Layout>
  );
};

export default ProjectLayout;
