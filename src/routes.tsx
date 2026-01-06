import {useRoutes} from "react-router-dom";
import IdentityProvider from "./pages/IdentityProvider";
import Settings from "./pages/Settings";
import Overview from "./pages/Overview";
import DataView from "./pages/DataView";
import ApiView from "./pages/APIView";
import DataModeling from "./pages/DataModeling";
import DataSource from "./pages/DataSource";
import ERView from "./pages/DataView/components/ERView";
import APILog from "./pages/APILog";
import Storage from "./pages/Storage";

import {
  ApiOutlined,
  BranchesOutlined,
  CloudServerOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  HomeOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import GraphQLAPI from "@/pages/GraphQLAPI";
import CustomAPI from "@/pages/CustomAPI";
import OpenAPI from "@/pages/OpenAPI";
import Flow from "@/pages/Flow";
import FlowList from "@/pages/Flow/components/FlowList.tsx";
import FlowDesign from "@/pages/FlowDesign/index.tsx";
import FlowInstanceList from "@/pages/Flow/components/FlowInstanceList.tsx";
import Schedule from "@/pages/Schedule/index.tsx";
import TriggerList from "./pages/Schedule/components/TriggerList";
import JobExecutionLogList from "./pages/Schedule/components/JobExecutionLogList";
import FlowDetail from "./pages/FlowDetail";

export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  icon: React.ComponentType<any>;
  translationKey: string;
  children?: RouteConfig[];
  defaultChild?: string;
  hideInMenu?: boolean; // 是否在左侧菜单
  hideLayout?: boolean; // 是否在页面布局中隐藏
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Overview />,
    icon: HomeOutlined,
    translationKey: "overview",
  },
  {
    path: "/api",
    element: <ApiView />,
    icon: ApiOutlined,
    translationKey: "api",
    children: [
      {
        path: "/api/custom-api",
        element: <CustomAPI />,
        icon: DeploymentUnitOutlined,
        translationKey: "custom_api",
      },
      {
        path: "/api/graphql",
        element: <GraphQLAPI />,
        icon: DeploymentUnitOutlined,
        translationKey: "graphql_api",
      },
      {
        path: "/api/open-api",
        element: <OpenAPI />,
        icon: FileTextOutlined,
        translationKey: "open_api",
      },
      {
        path: "/api/log",
        element: <APILog />,
        icon: LineChartOutlined,
        translationKey: "api_log",
      },
    ],
  },
  {
    path: "/data",
    element: <DataView />,
    icon: CloudServerOutlined,
    translationKey: "data",
    defaultChild: "modeling",
    children: [
      {
        path: "/data/modeling",
        element: <DataModeling />,
        icon: ContainerOutlined,
        translationKey: "data_modeling",
      },
      {
        path: "/data/source",
        element: <DataSource />,
        icon: DatabaseOutlined,
        translationKey: "data_source",
      },
      {
        path: "/data/er",
        element: <ERView />,
        icon: BranchesOutlined,
        translationKey: "er_view",
      },
    ],
  },
  {
    path: "/flow",
    element: <Flow />,
    icon: NodeIndexOutlined,
    translationKey: "flow",
    children: [
      {
        path: "/flow/mgr",
        element: <FlowList />,
        icon: BranchesOutlined,
        translationKey: "flow_mgr",
      },
      {
        path: "/flow/instance",
        element: <FlowInstanceList />,
        icon: PlayCircleOutlined,
        translationKey: "flow_instance",
      },
    ],
  },
  {
    path: "/flow/instance/:flowInstanceId",
    element: <FlowDetail />,
    icon: PlayCircleOutlined,
    translationKey: "flow_instance_detail",
    hideInMenu: true,
    hideLayout: true,
  },
  {
    path: "/flow/design/:flowModuleId",
    element: <FlowDesign />,
    icon: DatabaseOutlined,
    translationKey: "flow_design",
    hideInMenu: true,
    hideLayout: true,
  },
  {
    path: "/schedule",
    element: <Schedule />,
    icon: ThunderboltOutlined,
    translationKey: "schedule",
    children: [
      {
        path: "/schedule/trigger",
        element: <TriggerList />,
        icon: ThunderboltOutlined,
        translationKey: "trigger.title",
      },
      {
        path: "/schedule/job-execution-log",
        element: <JobExecutionLogList />,
        icon: PlayCircleOutlined,
        translationKey: "job_execution_log",
      },
    ]
  },
  {
    path: "/storage",
    element: <Storage />,
    icon: CloudUploadOutlined,
    translationKey: "storage",
  },
  {
    path: "/identity-providers",
    element: <IdentityProvider />,
    icon: UserOutlined,
    translationKey: "identity_providers",
  },
  {
    path: "/settings",
    element: <Settings />,
    icon: SettingOutlined,
    translationKey: "settings",
  },
];

// 根据路径获取路由配置
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // 先查找精确匹配
  const route = routes.find(route => route.path === path);

  // 如果没有找到，查找子路由
  if (!route) {
    for (const parentRoute of routes) {
      if (parentRoute.children) {
        const childRoute = parentRoute.children.find(child => child.path === path);
        if (childRoute) {
          return childRoute;
        }
      }
    }
  }

  return route;
};

// 检查当前路径是否应该隐藏布局
export const shouldHideLayout = (currentPath: string): boolean => {
  // 处理动态路由参数（如 /flow/design/:flowModuleId）
  const route = routes.find(route => {
    if (route.path === currentPath) {
      return true;
    }
    // 检查是否匹配动态路由
    if (route.path.includes(':')) {
      const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }
    return false;
  });

  return route?.hideLayout || false;
};

// 获取路由的完整路径（包括父路由）
export const getFullRoutePath = (path: string): RouteConfig[] => {
  const pathSegments = path.split('/').filter(Boolean);
  const result: RouteConfig[] = [];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    if (route) {
      result.push(route);
    }
  }

  return result;
};

// 获取所有路由路径（包括子路由）
export const getAllRoutePaths = (): string[] => {
  const paths: string[] = [];

  const addPaths = (routeList: RouteConfig[]) => {
    routeList.forEach(route => {
      paths.push(route.path);
      if (route.children) {
        addPaths(route.children);
      }
    });
  };

  addPaths(routes);
  return paths;
};

// 为 react-router-dom 提供纯路由配置
export const routerRoutes = routes.map(({ path, element, children }) => {
  const route: any = { path, element };
  if (children) {
    route.children = children.map(({ path: childPath, element: childElement }) => ({
      path: childPath,
      element: childElement,
    }));
  }
  return route;
});

export const RenderRoutes = () => useRoutes(routerRoutes);
