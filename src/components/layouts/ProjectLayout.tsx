import React, { useCallback, useMemo, useEffect } from "react";
import { Layout, Button, Dropdown, Space, Switch, theme as antdTheme, Breadcrumb } from "antd";
import type { MenuProps } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { useLocale, useTheme, useProject } from "@/store/appStore";
import { useTranslation } from "react-i18next";
import { Locale } from "antd/es/locale";
import {
  AppstoreOutlined,
  CodeOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HomeOutlined,
  MoonOutlined,
  SunOutlined
} from "@ant-design/icons";
import { applyDarkMode, setDarkModeToStorage } from "@/utils/darkMode";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import ProjectSidebar from "./ProjectSidebar";
import Console from "@/components/console/Console.tsx";
import ResizablePanel from "@/components/common/ResizablePanel";
import BranchSwitcher from "@/components/common/BranchSwitcher";
import { Outlet } from "react-router-dom";
import { getFullRoutePath, shouldHideLayout } from "@/routes";
import UserInfo from "@/components/UserInfo";
import { getProject, getProjects } from "@/services/project";
import type { Project } from "@/types/project";

const ProjectLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode: toggleDarkModeStore } = useTheme();
  const { setLocale: setLocaleStore, currentLang } = useLocale();
  const { currentProject, setCurrentProject } = useProject();
  const { i18n } = useTranslation();
  const { token } = antdTheme.useToken();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isConsoleVisible, setIsConsoleVisible] = React.useState(false);
  const [isProjectInitialized, setIsProjectInitialized] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [branchMenuItems, setBranchMenuItems] = React.useState<any[]>([]);

  useEffect(() => {
    const initializeProject = async () => {
      if (!projectId) return;

      try {
        const project = await getProject(projectId);
        if (project && currentProject?.id !== projectId) {
          setCurrentProject(project);
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
      setIsProjectInitialized(true);
    };
    initializeProject();
  }, [projectId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects({ include: null });
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

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
      navigate(`/project/${newProjectId}`);
    }
  }, [projects, setCurrentProject, navigate]);

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
            <AppstoreOutlined style={{ marginRight: token.marginXS }} />
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

      // 分支节点整合到面包屑中
      if (projectId) {
        items.push({
          title: (
            <BranchSwitcher projectId={projectId} onMenuItemsChange={setBranchMenuItems} />
          ),
          menu: branchMenuItems.length > 0 ? { items: branchMenuItems } : undefined
        });
      }
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
  }, [currentProject, projects, projectId, t, token.marginXS, handleProjectChange, branchMenuItems]);

  // hideLayout 路由（如流程设计、流程实例详情）只渲染内容区，不显示 Header/Sidebar
  if (shouldHideLayout(location.pathname)) {
    return <Outlet key={currentProject?.id} />;
  }

  return (
    <Layout style={{
      height: "100vh",
      overflow: "hidden"
    }}>
      <Layout.Header
        className="bg-white dark:bg-[#181d26] border-b border-[#f8fafc] dark:border-[#1d1f25] shadow-sm dark:shadow-lg"
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
              size="small"
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
            <a href={`${import.meta.env.BASE_URL}/swagger-ui/index.html`} target="_blank" rel="noopener noreferrer" style={{ color: token.colorText, cursor: 'pointer' }}>
              <FileSearchOutlined />
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
            overflow: "hidden",
            backgroundColor: token.colorFillQuaternary
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
            {isProjectInitialized ? <Outlet key={currentProject?.id} /> : null}
          </ResizablePanel>
        </Layout.Content>
      </Layout>

    </Layout>
  );
};

export default ProjectLayout;
