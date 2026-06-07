import React, {useState} from "react";
import {Layout, theme} from "antd";
import {useLocation} from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {RenderRoutes, shouldHideLayout} from "@/routes";
import {useSidebar} from "@/store/appStore";
import Console from "@/components/console/Console.tsx";
import ResizablePanel from "@/components/common/ResizablePanel";

const PageLayout: React.FC = () => {
  const {token} = theme.useToken();
  const {isSidebarCollapsed} = useSidebar();
  const location = useLocation();
  const hideLayout = shouldHideLayout(location.pathname);
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);

  // 如果需要隐藏布局，直接渲染路由内容
  if (hideLayout) {
    return <RenderRoutes/>;
  }

  return (
    <Layout style={{
      height: "100vh",
      overflow: "hidden" // 防止整体页面滚动
    }}>
      <Sidebar/>
      <Layout style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // 防止右侧布局滚动
        marginLeft: isSidebarCollapsed ? 56 : 180, // 为固定的sidebar留出空间
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" // 与sidebar动画同步
      }}>
        <Header
          onToggleConsole={() => setIsConsoleVisible((v) => !v)}
        />
        <Layout.Content
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            marginTop: token.controlHeight * 1.5
          }}
        >
          <ResizablePanel
            visible={isConsoleVisible}
            placement="bottom"
            defaultSize={300}
            minSize={150}
            maxSize={600}
            renderPanel={() => (
              <Console onToggle={() => setIsConsoleVisible((v) => !v)}/>
            )}
          >
            <RenderRoutes/>
          </ResizablePanel>
        </Layout.Content>
      </Layout>

      {/* Console 控制台已内联至底部 ResizablePanel 中 */}
    </Layout>
  );
};

export default PageLayout;
