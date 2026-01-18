import React, {useCallback, useMemo} from "react";
import {Layout, Menu, theme as antdTheme} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {routes} from "@/routes";
import {useSidebar} from "@/store/appStore";
import UserInfo from "@/components/UserInfo";

// 预计算路由映射表，避免每次查找
const routeMap = new Map<string, string>();
const childRouteMap = new Map<string, string>();

// 初始化路由映射
routes.forEach(route => {
  routeMap.set(route.path, route.path);
  if (route.children) {
    route.children.forEach(child => {
      childRouteMap.set(child.path, route.path);
    });
  }
});

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const { token } = antdTheme.useToken();

  // 使用 useMemo 缓存菜单数据，避免每次渲染都重新创建
  const menuData = useMemo(() => {
    return routes
      .filter(route => !route?.hideInMenu) // 过滤掉隐藏的路由
      .map(route => {
        const IconComponent = route.icon;
        return {
          key: route.path,
          icon: <IconComponent />,
          label: t(route.translationKey),
        };
      });
  }, [t]); // 只依赖翻译函数

  // 优化路由匹配逻辑，使用预计算的映射表
  const selectedKeys = useMemo(() => {
    const pathname = location.pathname;

    // 使用预计算的映射表进行快速查找
    if (routeMap.has(pathname)) {
      return [pathname];
    }

    if (childRouteMap.has(pathname)) {
      return [childRouteMap.get(pathname)!];
    }

    return [];
  }, [location.pathname]);

  // 使用 useCallback 缓存点击处理函数
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (location.pathname !== key) {
      navigate(key);
    }
  }, [location.pathname, navigate]);

  // 使用 useMemo 缓存样式对象，避免每次渲染都重新创建
  const siderStyle = useMemo(() => ({
    minHeight: "100vh",
    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "2px 0 8px 0 rgba(0,0,0,0.04)",
    zIndex: 10,
    position: "fixed" as const, // 固定定位
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden" // 防止sidebar内部滚动
  }), []);

  const logoContainerStyle = useMemo(() => ({
    height: token.controlHeight * 1.5,
    display: "flex",
    alignItems: "center",
    justifyContent: isSidebarCollapsed ? "center" : "flex-start",
    paddingLeft: isSidebarCollapsed ? 0 : token.padding,
    overflow: 'hidden'
  }), [isSidebarCollapsed, token.controlHeight, token.padding]);

  const logoStyle = useMemo(() => ({
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    transform: isSidebarCollapsed ? 'scale(1)' : 'scale(1.1)',
    flexShrink: 0,
    borderRadius: token.borderRadius // 添加圆角
  }), [isSidebarCollapsed, token.borderRadius]);

  const logoTextStyle = useMemo(() => ({
    marginLeft: token.marginSM,
    fontWeight: 400,
    fontSize: token.fontSizeXL,
    letterSpacing: 1,
    fontFamily: token.fontFamily,
    opacity: isSidebarCollapsed ? 0 : 1,
    transform: isSidebarCollapsed ? 'translateX(-10px) scale(0.95)' : 'translateX(0) scale(1)',
    transition: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1), max-width 0.3s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    maxWidth: isSidebarCollapsed ? 0 : 120,
    overflow: 'hidden',
    display: 'inline-block',
    verticalAlign: 'middle',
    color: token.colorText,
  }), [isSidebarCollapsed, token.fontFamily, token.colorText, token.marginSM, token.fontSizeXL]);

  const menuStyle = useMemo(() => ({
    flex: 1,
    borderRight: 0,
  }), []);

  // 处理用户相关事件
  const handleHelpClick = useCallback(() => {
    window.open('https://flexmodel.dev/', '_blank', 'noopener,noreferrer');
  }, []);

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
        <div style={logoContainerStyle}>
          <img
            src={`${import.meta.env.BASE_URL}/logo.png`}
            width={32}
            alt="logo"
            style={logoStyle}
          />
          <span style={logoTextStyle}>
            Flexmodel
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          inlineCollapsed={isSidebarCollapsed}
          style={menuStyle}
          items={menuData}
        />
        <UserInfo
          isCollapsed={isSidebarCollapsed}
          onHelpClick={handleHelpClick}
        />
      </div>
    </Layout.Sider>
  );
};

export default React.memo(Sidebar);
