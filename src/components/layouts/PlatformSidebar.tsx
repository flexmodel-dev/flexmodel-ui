import React, { useCallback, useMemo, useState } from "react";
import { Layout, Menu, Button, theme, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { platformRoutes } from "@/routes";
import { useSidebar } from "@/store/appStore";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const PlatformSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const pathname = location.pathname.replace(/\/$/, '');
    const initialOpenKeys: string[] = [];

    platformRoutes.forEach(route => {
      if (route.children && route.children.length > 0) {
        const parentPath = route.path.replace(/\/$/, '');
        route.children.forEach(child => {
          const childPath = child.path.replace(/\/$/, '');
          if (pathname.startsWith(childPath) || pathname.startsWith(parentPath)) {
            initialOpenKeys.push(parentPath);
          }
        });
      }
    });

    return [...new Set(initialOpenKeys)];
  });

  const menuData = useMemo(() => {
    return platformRoutes
      .filter(route => !route?.hideInMenu)
      .map(route => {
        const IconComponent = route.icon;
        const path = route.path.replace(/\/$/, '');
        return {
          key: path,
          icon: <IconComponent />,
          label: t(route.translationKey),
        };
      });
  }, [t]);

  const selectedKeys = useMemo(() => {
    const pathname = location.pathname.replace(/\/$/, '');
    const routeMap = new Map<string, string>();
    const childRouteMap = new Map<string, string>();

    platformRoutes.forEach(route => {
      const path = route.path.replace(/\/$/, '');
      routeMap.set(path, path);
      if (route.children) {
        route.children.forEach(child => {
          const childPath = child.path.replace(/\/$/, '');
          childRouteMap.set(childPath, path);
        });
      }
    });

    if (routeMap.has(pathname)) {
      return [pathname];
    }

    if (childRouteMap.has(pathname)) {
      return [childRouteMap.get(pathname)!];
    }

    return [];
  }, [location.pathname]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (location.pathname !== key) {
      navigate(key);
    }
  }, [location.pathname, navigate]);

  const handleOpenChange = useCallback((keys: string[]) => {
    const latestOpenKey = keys.find(key => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  }, [openKeys]);

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
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          inlineCollapsed={isSidebarCollapsed}
          style={menuStyle}
          items={menuData}
        />
        <div style={{
          padding: token.padding,
          display: "flex",
          justifyContent: isSidebarCollapsed ? "center" : "right"
        }}>
          <Space>
            <Button
              type="text"
              icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
            />
          </Space>
        </div>
      </div>
    </Layout.Sider>
  );
};

export default React.memo(PlatformSidebar);
