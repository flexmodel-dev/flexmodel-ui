import {useRoutes} from "react-router-dom";
import IdentityProvider from "./pages/IdentityProvider";
import Settings from "./pages/Settings";
import Overview from "./pages/Overview";
import DataView from "./pages/DataView";
import ApiView from "./pages/APIView";
import DataModeling from "./pages/DataModeling";
import DataSource from "./pages/DataSource";
import APILog from "./pages/APILog";
import Storage from "./pages/Storage";
import Member from "./pages/Member";

import {
  ApiOutlined,
  BranchesOutlined,
  CloudServerOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
  CloudUploadOutlined,
  AppstoreOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import GraphQLAPI from "@/pages/GraphQLAPI";
// import CustomAPI from "@/pages/CustomAPI";
import OpenAPI from "@/pages/OpenAPI";
import Flow from "@/pages/Flow";
import FlowList from "@/pages/Flow/components/FlowList.tsx";
import FlowDesign from "@/pages/FlowDesign/index.tsx";
import FlowInstanceList from "@/pages/Flow/components/FlowInstanceList.tsx";
import Schedule from "@/pages/Schedule/index.tsx";
import TriggerList from "./pages/Schedule/components/TriggerList";
import JobExecutionLogList from "./pages/Schedule/components/JobExecutionLogList";
import FlowDetail from "./pages/FlowDetail";
import Project from "./pages/Project";

export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  icon: React.ComponentType<any>;
  translationKey: string;
  children?: RouteConfig[];
  defaultChild?: string;
  hideInMenu?: boolean;
  hideLayout?: boolean;
}

export const platformRoutes: RouteConfig[] = [
  {
    path: "/project",
    element: <Project />,
    icon:  AppstoreOutlined,
    translationKey: "platform.project",
  },
  {
    path: "/member",
    element: <Member />,
    icon: UserOutlined,
    translationKey: "platform.member",
  },
  {
    path: "/settings",
    element: <Settings />,
    icon: SettingOutlined,
    translationKey: "platform.settings",
  },
];

export const projectRoutes: RouteConfig[] = [
  {
    path: "/project/:projectId/",
    element: <Overview />,
    icon: DashboardOutlined,
    translationKey: "overview",
  },
  {
    path: "/project/:projectId/api",
    element: <ApiView />,
    icon: ApiOutlined,
    translationKey: "api",
    children: [
      /*{
        path: "/project/:projectId/api/custom-api",
        element: <CustomAPI />,
        icon: DeploymentUnitOutlined,
        translationKey: "custom_api",
      },*/
      {
        path: "/project/:projectId/api/graphql",
        element: <GraphQLAPI />,
        icon: DeploymentUnitOutlined,
        translationKey: "graphql_api",
      },
      {
        path: "/project/:projectId/api/open-api",
        element: <OpenAPI />,
        icon: FileTextOutlined,
        translationKey: "open_api",
      },
      {
        path: "/project/:projectId/api/log",
        element: <APILog />,
        icon: LineChartOutlined,
        translationKey: "api_log",
      },
    ],
  },
  {
    path: "/project/:projectId/data",
    element: <DataView />,
    icon: CloudServerOutlined,
    translationKey: "data",
    defaultChild: "modeling",
    children: [
      {
        path: "/project/:projectId/data/modeling",
        element: <DataModeling />,
        icon: ContainerOutlined,
        translationKey: "data_modeling",
      },
      {
        path: "/project/:projectId/data/source",
        element: <DataSource />,
        icon: DatabaseOutlined,
        translationKey: "data_source",
      },
    ],
  },
  {
    path: "/project/:projectId/flow",
    element: <Flow />,
    icon: NodeIndexOutlined,
    translationKey: "flow",
    children: [
      {
        path: "/project/:projectId/flow/definition",
        element: <FlowList />,
        icon: BranchesOutlined,
        translationKey: "flow_definition",
      },
      {
        path: "/project/:projectId/flow/instance",
        element: <FlowInstanceList />,
        icon: PlayCircleOutlined,
        translationKey: "flow_instance",
      },
    ],
  },
  {
    path: "/project/:projectId/flow/instance/:flowInstanceId",
    element: <FlowDetail />,
    icon: PlayCircleOutlined,
    translationKey: "flow_instance_detail",
    hideInMenu: true,
    hideLayout: true,
  },
  {
    path: "/project/:projectId/flow/design/:flowModuleId",
    element: <FlowDesign />,
    icon: DatabaseOutlined,
    translationKey: "flow_design",
    hideInMenu: true,
    hideLayout: true,
  },
  {
    path: "/project/:projectId/schedule",
    element: <Schedule />,
    icon: ThunderboltOutlined,
    translationKey: "schedule",
    children: [
      {
        path: "/project/:projectId/schedule/trigger",
        element: <TriggerList />,
        icon: ThunderboltOutlined,
        translationKey: "trigger.title",
      },
      {
        path: "/project/:projectId/schedule/job-execution-log",
        element: <JobExecutionLogList />,
        icon: PlayCircleOutlined,
        translationKey: "job_execution_log",
      },
    ]
  },
  {
    path: "/project/:projectId/storage",
    element: <Storage />,
    icon: CloudUploadOutlined,
    translationKey: "storage",
  },
  {
    path: "/project/:projectId/authentication",
    element: <IdentityProvider />,
    icon: UserOutlined,
    translationKey: "identity_providers",
  },
];

export const routes = projectRoutes;

export const getRouteByPath = (path: string, routeList: RouteConfig[] = routes): RouteConfig | undefined => {
  const route = routeList.find(route => route.path === path);

  if (!route) {
    for (const parentRoute of routeList) {
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

export const shouldHideLayout = (currentPath: string, routeList: RouteConfig[] = routes): boolean => {
  const route = routeList.find(route => {
    if (route.path === currentPath) {
      return true;
    }
    if (route.path.includes(':')) {
      const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }
    return false;
  });

  return route?.hideLayout || false;
};

export const getFullRoutePath = (path: string, routeList: RouteConfig[] = routes): RouteConfig[] => {
  const pathSegments = path.split('/').filter(Boolean);
  const result: RouteConfig[] = [];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath, routeList);
    if (route) {
      result.push(route);
    }
  }

  return result;
};

export const getAllRoutePaths = (routeList: RouteConfig[] = routes): string[] => {
  const paths: string[] = [];

  const addPaths = (routes: RouteConfig[]) => {
    routes.forEach(route => {
      paths.push(route.path);
      if (route.children) {
        addPaths(route.children);
      }
    });
  };

  addPaths(routeList);
  return paths;
};

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

export const projectRouterRoutes = routes.map(({ path, element, children }) => {
  const relativePath = path.replace('/project/:projectId', '');
  const route: any = { path: relativePath || '/', element };
  if (children) {
    route.children = children.map(({ path: childPath, element: childElement }) => ({
      path: childPath.replace('/project/:projectId', ''),
      element: childElement,
    }));
  }
  return route;
});

export const platformRouterRoutes = platformRoutes.map(({ path, element }) => ({
  path,
  element,
}));

export const RenderRoutes = () => useRoutes(routerRoutes);
export const RenderPlatformRoutes = () => useRoutes(platformRouterRoutes);
export const RenderProjectRoutes = () => useRoutes(projectRouterRoutes);
