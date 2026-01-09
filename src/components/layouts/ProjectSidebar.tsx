import React, {useCallback, useMemo} from "react";
import {Layout, Menu} from "antd";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {routes} from "@/routes";
import {useSidebar} from "@/store/appStore";

const ProjectSidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const { projectId } = useParams<{ projectId: string }>();

  const menuData = useMemo(() => {
    return routes
      .filter(route => !route?.hideInMenu)
      .map(route => {
        const IconComponent = route.icon;
        const path = route.path.replace(':projectId', projectId || '').replace(/\/$/, '');
        return {
          key: path,
          icon: <IconComponent />,
          label: t(route.translationKey),
        };
      });
  }, [t, projectId]);

  const selectedKeys = useMemo(() => {
    const pathname = location.pathname.replace(/\/$/, '');
    const routeMap = new Map<string, string>();
    const childRouteMap = new Map<string, string>();

    routes.forEach(route => {
      const path = route.path.replace(':projectId', projectId || '').replace(/\/$/, '');
      routeMap.set(path, path);
      if (route.children) {
        route.children.forEach(child => {
          const childPath = child.path.replace(':projectId', projectId || '').replace(/\/$/, '');
          childRouteMap.set(childPath, path);
        });
      }
    });

    if (routeMap.has(pathname)) {
      return [routeMap.get(pathname)!];
    }

    if (childRouteMap.has(pathname)) {
      return [childRouteMap.get(pathname)!];
    }

    return [];
  }, [location.pathname, projectId]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (location.pathname !== key) {
      navigate(key);
    }
  }, [location.pathname, navigate]);

  const siderStyle = useMemo(() => ({
    minHeight: "100%",
    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "2px 0 8px 0 rgba(0,0,0,0.04)",
    overflow: "hidden"
  }), []);

  const menuStyle = useMemo(() => ({
    flex: 1,
    borderRight: 0,
    overflow: "auto"
  }), []);

  return (
    <Layout.Sider
      theme="light"
      collapsible
      collapsed={isSidebarCollapsed}
      onCollapse={toggleSidebar}
      collapsedWidth={56}
      width={180}
      trigger={null}
      style={siderStyle}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          inlineCollapsed={isSidebarCollapsed}
          style={menuStyle}
          items={menuData}
        />
      </div>
    </Layout.Sider>
  );
};

export default React.memo(ProjectSidebar);
