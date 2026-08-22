import type {Page, Route} from "@playwright/test";

/**
 * 集中管理所有后端接口的 mock 数据与路由拦截。
 *
 * 所有业务接口走 /api 前缀（BASE_URI = "/api"），
 * 这里通过 page.route 拦截所有 /api 开头的请求，
 * 根据 method + pathname 返回对应的 mock JSON。
 */

const PROJECT_ID = "demo";

// ---- 公共 mock 数据 ----

export const mockUser = {id: "admin", name: "admin", createdAt: "2024-01-01", updatedAt: "2024-01-01"};

export const mockProject = {
  id: PROJECT_ID,
  name: "演示项目",
  description: "用于 E2E 测试的演示项目",
  databaseName: "flexmodel_demo",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ownerId: "admin",
  stats: {apiCount: 3, modelCount: 5, flowCount: 2, datasourceCount: 1, storageCount: 1},
  metadata: {showSystemModels: false},
};

export const mockProjects = [mockProject];

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  JSON.stringify(body) === undefined
    ? {status, headers: {"content-type": "application/json", ...headers}}
    : {
      status,
      headers: {"content-type": "application/json; charset=utf-8", ...headers},
      body: JSON.stringify(body),
    };

function ok(body: unknown) {
  return json(body, 200);
}

/** 在浏览器加载前注入已登录的认证态与默认语言（中文）。 */
export async function injectAuthState(page: Page) {
  await page.addInitScript(() => {
    const auth = {
      state: {
        isAuthenticated: true,
        user: {id: "admin", name: "admin", createdAt: "2024-01-01", updatedAt: "2024-01-01"},
        token: "mock-token",
        isLoading: false,
        error: null,
      },
      version: 0,
    };
    localStorage.setItem("auth-storage", JSON.stringify(auth));

    const app = {
      state: {isDark: false, currentLang: "zh", isSidebarCollapsed: false},
      version: 0,
    };
    localStorage.setItem("app-storage", JSON.stringify(app));
    localStorage.setItem("i18nextLng", "zh");
    localStorage.setItem("projectId", "demo");
  });
}

/**
 * 注册所有 /api 接口的 mock 路由。需要在 page 导航前调用。
 */
export async function setupApiMocks(page: Page) {
  // 仅拦截 pathname 以 /api/ 开头的请求（真正的后端接口调用）。
  // 使用函数谓词而非 glob "**/api/**"，避免误拦截 SPA 路由
  // （如 /project/demo/api/log 虽含 /api/ 但不是后端接口）。
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    (route) => handleRoute(route),
  );
}

async function handleRoute(route: Route) {
  const request = route.request();
  const url = new URL(request.url());
  const method = request.method();
  const path = url.pathname.replace(/^\/api/, "");

  // 去掉 query 的 path 匹配辅助
  const matchGet = (re: RegExp) => method === "GET" && re.test(path);
  const matchPost = (re: RegExp) => method === "POST" && re.test(path);
  const matchDelete = (re: RegExp) => method === "DELETE" && re.test(path);
  const matchPut = (re: RegExp) => method === "PUT" && re.test(path);
  const matchPatch = (re: RegExp) => method === "PATCH" && re.test(path);

  // ---- 全局 / 认证 ----
  if (matchGet(/^\/global\/profile$/)) return route.fulfill(ok(globalProfile()));
  if (matchGet(/^\/auth\/whoami$/)) return route.fulfill(ok({token: "mock-token", user: mockUser, expiresIn: 900}));
  if (matchPost(/^\/auth\/login$/)) return route.fulfill(ok({token: "mock-token", user: mockUser, expiresIn: 900}));
  if (matchPost(/^\/auth\/refresh$/)) return route.fulfill(ok({token: "mock-token", expiresIn: 900}));

  // ---- 平台设置 ----
  if (matchGet(/^\/settings$/)) return route.fulfill(ok(settingsData()));
  if (matchPatch(/^\/settings$/)) return route.fulfill(ok(settingsData()));

  // ---- 用户 / 角色 / 资源 ----
  if (matchGet(/^\/users$/)) return route.fulfill(ok(usersData()));
  if (matchGet(/^\/roles$/)) return route.fulfill(ok(rolesData()));
  if (matchGet(/^\/resources\/tree$/)) return route.fulfill(ok(resourceTree()));
  if (matchGet(/^\/resources$/)) return route.fulfill(ok(resourceTree()));

  // ---- API Key ----
  if (matchGet(/^\/api-keys$/)) return route.fulfill(ok(apiKeysData()));
  if (matchPost(/^\/api-keys$/)) return route.fulfill(ok({
    ...apiKeysData()[0],
    id: "key-new",
    key: "fmk-new-secret-key-value"
  }));
  if (matchPost(/^\/api-keys\/[^/]+\/regenerate$/)) return route.fulfill(ok({
    ...apiKeysData()[0],
    key: "fmk-regen-secret-key"
  }));

  // ---- 项目 ----
  if (matchGet(/^\/projects$/) || matchGet(/^\/projects$/)) {
    const include = url.searchParams.get("include");
    return route.fulfill(ok(include ? mockProjects : mockProjects));
  }
  if (matchGet(/^\/projects\/[^/]+\/stats$/)) return route.fulfill(ok(mockProject.stats));
  if (matchGet(/^\/projects\/[^/]+$/)) return route.fulfill(ok(mockProject));
  if (matchPost(/^\/projects$/)) return route.fulfill(ok(mockProject));
  if (matchPatch(/^\/projects\/[^/]+$/)) return route.fulfill(ok(mockProject));
  if (matchDelete(/^\/projects\/[^/]+$/)) return route.fulfill({status: 204});

  // ---- 监控指标 ----
  if (matchGet(/^\/projects\/[^/]+\/metrics\/fm$/)) return route.fulfill(ok(fmMetrics()));
  if (matchGet(/^\/projects\/[^/]+\/metrics\//)) return route.fulfill(ok({}));

  // ---- API 日志 ----
  if (matchGet(/^\/projects\/[^/]+\/logs\/stat$/)) return route.fulfill(ok(apiLogStat()));
  if (matchGet(/^\/projects\/[^/]+\/logs$/)) return route.fulfill(ok({list: apiLogs(), total: apiLogs().length}));

  // ---- API 管理 ----
  if (matchGet(/^\/projects\/[^/]+\/apis$/)) return route.fulfill(ok(apiDefinitions()));
  if (matchPost(/^\/projects\/[^/]+\/apis$/)) return route.fulfill(ok(apiDefinitions()[0]));
  if (matchPost(/^\/projects\/[^/]+\/apis\/generate$/)) return route.fulfill(ok({}));

  // ---- GraphQL ----
  if (matchPost(/^\/projects\/[^/]+\/graphql$/)) return route.fulfill(ok({data: {hello: "world"}}));

  // ---- 模型 / 数据源 ----
  if (matchGet(/^\/projects\/[^/]+\/models$/)) return route.fulfill(ok(models()));
  if (matchGet(/^\/projects\/[^/]+\/datasources$/)) return route.fulfill(ok(datasources()));

  // ---- 分支 ----
  if (matchGet(/^\/projects\/[^/]+\/branches$/)) return route.fulfill(ok([{
    name: "main",
    isDefault: true,
    active: true,
    createdAt: "2024-01-01"
  }]));

  // ---- 流程 ----
  if (matchGet(/^\/projects\/[^/]+\/flows\/instances$/)) return route.fulfill(ok({
    list: flowInstances(),
    total: flowInstances().length
  }));
  if (matchGet(/^\/projects\/[^/]+\/flows\/instances\/[^/]+\/elements$/)) return route.fulfill(ok([]));
  if (matchGet(/^\/projects\/[^/]+\/flows\/instances\/[^/]+\/user-tasks$/)) return route.fulfill(ok([]));
  if (matchGet(/^\/projects\/[^/]+\/flows\/instances\/[^/]+$/)) return route.fulfill(ok(flowInstances()[0]));
  if (matchGet(/^\/projects\/[^/]+\/flows\/[^/]+$/)) return route.fulfill(ok(flowModuleDetail()));
  if (matchGet(/^\/projects\/[^/]+\/flows$/)) return route.fulfill(ok({
    list: flowModules(),
    total: flowModules().length
  }));
  if (matchPost(/^\/projects\/[^/]+\/flows$/)) return route.fulfill(ok({
    errCode: 1000,
    errMsg: "ok",
    flowModuleId: "flow-new"
  }));
  if (matchPost(/^\/projects\/[^/]+\/flows\/instances\/start$/)) return route.fulfill(ok({
    errCode: 1000,
    errMsg: "ok",
    flowInstanceId: "inst-new",
    status: 2
  }));

  // ---- 触发器 / 任务日志 ----
  if (matchGet(/^\/projects\/[^/]+\/triggers$/)) return route.fulfill(ok({list: triggers(), total: triggers().length}));
  if (matchGet(/^\/projects\/[^/]+\/jobs\/logs$/)) return route.fulfill(ok({list: jobLogs(), total: jobLogs().length}));

  // ---- 边缘函数 ----
  if (matchGet(/^\/function-templates$/)) return route.fulfill(ok([]));
  if (matchGet(/^\/projects\/[^/]+\/functions$/)) return route.fulfill(ok({
    list: functions(),
    total: functions().length
  }));
  if (matchGet(/^\/projects\/[^/]+\/functions\/[^/]+$/)) return route.fulfill(ok(functions()[0]));

  // ---- 认证提供商 / Pages ----
  if (matchGet(/^\/projects\/[^/]+\/auth-providers$/)) return route.fulfill(ok([]));
  if (matchGet(/^\/projects\/[^/]+\/page$/)) return route.fulfill(ok(pageSite()));

  // ---- 存储桶 ----
  if (matchGet(/^\/projects\/[^/]+\/buckets$/)) return route.fulfill(ok(buckets()));

  if (matchGet(/^\/projects\/[^/]+\/buckets\/[^/]+\/objects/)) return route.fulfill(ok([]));

  // ---- 兜底：返回空数组，避免 Table 组件因非数组数据崩溃 ----
  return route.fulfill(ok([]));
}

// ---- mock 数据构造函数 ----

function globalProfile() {
  return {
    settings: {graphql: {enabled: true}},
    apiRootPath: "/api",
    storageProvider: {type: "local", readOnly: false},
    projectBaseDomain: "",
    edgeUrlTemplate: "",
    routingMode: "path",
    pagesUrlTemplate: "/pages/{{projectId}}",
    version: "test-1.0.0",
  };
}

function settingsData() {
  return {graphql: {enabled: true, introspection: true}};
}

function usersData() {
  return [
    {
      id: "admin",
      name: "admin",
      email: "admin@example.com",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      roleIds: ["1"]
    },
    {
      id: "u2",
      name: "alice",
      email: "alice@example.com",
      createdAt: "2024-02-01",
      updatedAt: "2024-02-01",
      roleIds: ["2"]
    },
  ];
}

function rolesData() {
  return [
    {id: "1", name: "管理员", description: "系统管理员", resourceIds: ["1", "2"], createdAt: "2024-01-01"},
    {id: "2", name: "开发者", description: "开发人员", resourceIds: ["2"], createdAt: "2024-01-01"},
  ];
}

function resourceTree() {
  return [
    {id: "1", name: "项目管理", children: [{id: "11", name: "查看项目"}]},
    {id: "2", name: "数据建模", children: [{id: "21", name: "查看模型"}]},
  ];
}

function apiKeysData() {
  return [
    {id: "k1", name: "测试 Key", keyPrefix: "fmk_abc123", projectIds: "demo", readOnly: false, createdAt: "2024-01-01"},
    {id: "k2", name: "只读 Key", keyPrefix: "fmk_def456", projectIds: "", readOnly: true, createdAt: "2024-02-01"},
  ];
}

function fmMetrics() {
  return {
    requestCount: 128,
    modelCount: 5,
    branchCount: 1,
    flowDefCount: 2,
    flowExecCount: 6,
    triggerTotalCount: 4,
    jobSuccessCount: 3,
    jobFailureCount: 1,
  };
}

function apiLogStat() {
  return {
    apiChart: {dateList: ["2024-03-01", "2024-03-02"], successData: [10, 12], failData: [1, 0]},
    apiRankingList: [{name: "GET /students", count: 20}],
    apiStatList: [{date: "2024-03-01", total: 11}],
  };
}

function apiLogs() {
  return [
    {
      id: "log-1",
      httpMethod: "GET",
      path: "/api/projects/demo/models",
      url: "/api/projects/demo/models",
      statusCode: 200,
      responseTime: 42,
      clientIp: "127.0.0.1",
      createdAt: "2024-03-01 10:00:00",
      isSuccess: true,
      requestBody: "",
      requestHeaders: {},
      errorMessage: "",
    },
    {
      id: "log-2",
      httpMethod: "POST",
      path: "/api/projects/demo/graphql",
      url: "/api/projects/demo/graphql",
      statusCode: 500,
      responseTime: 120,
      clientIp: "127.0.0.1",
      createdAt: "2024-03-01 11:00:00",
      isSuccess: false,
      requestBody: "{}",
      requestHeaders: {},
      errorMessage: "内部错误",
    },
  ];
}

function apiDefinitions() {
  return [
    {id: "api-1", name: "学生查询", path: "/students", method: "GET", enabled: true, version: 1},
    {id: "api-2", name: "创建学生", path: "/students", method: "POST", enabled: false, version: 1},
  ];
}

function models() {
  return [
    {
      type: "Entity",
      name: "Student",
      displayName: "学生",
      fields: [{name: "id", type: "Long", primaryKey: true, nullable: false}],
      indexes: [],
    },
    {
      type: "Enum",
      name: "Gender",
      displayName: "性别",
      values: [{name: "MALE", value: "MALE"}, {name: "FEMALE", value: "FEMALE"}],
    },
    {
      type: "NativeQuery",
      name: "StudentCount",
      displayName: "学生数量",
      sql: "SELECT count(*) FROM student",
    },
  ];
}

function datasources() {
  return [
    {name: "main_ds", type: "postgresql", url: "jdbc:postgresql://localhost:5432/demo", username: "demo"},
  ];
}

function flowModules() {
  return [
    {
      flowModuleId: "flow-1",
      flowName: "审批流程",
      flowKey: "approval",
      status: 4,
      remark: "示例",
      operator: "admin",
      modifyTime: "2024-03-01 10:00:00"
    },
    {
      flowModuleId: "flow-2",
      flowName: "请假流程",
      flowKey: "leave",
      status: 2,
      remark: "",
      operator: "admin",
      modifyTime: "2024-03-02 10:00:00"
    },
  ];
}

function flowModuleDetail() {
  return {
    ...flowModules()[0],
    flowDeployId: "deploy-1",
    flowModel: JSON.stringify({
      flowElements: [
        {key: "start", type: 1, properties: {name: "开始"}, outgoing: ["e1"]},
        {key: "end", type: 2, properties: {name: "结束"}, incoming: ["e1"]},
      ],
      edges: [{key: "e1", source: "start", target: "end"}],
    }),
  };
}

function flowInstances() {
  return [
    {
      flowInstanceId: "inst-1",
      flowModuleId: "flow-1",
      flowDeployId: "deploy-1",
      flowName: "审批流程",
      flowKey: "approval",
      status: 2,
      operator: "admin",
      caller: "test",
      createTime: "2024-03-01 10:00:00",
      modifyTime: "2024-03-01 10:30:00",
    },
    {
      flowInstanceId: "inst-2",
      flowModuleId: "flow-2",
      flowDeployId: "deploy-2",
      flowName: "请假流程",
      flowKey: "leave",
      status: 1,
      operator: "admin",
      caller: "test",
      createTime: "2024-03-02 10:00:00",
      modifyTime: "2024-03-02 10:30:00",
    },
  ];
}

function triggers() {
  return [
    {
      id: "t1",
      name: "每分钟触发",
      description: "测试",
      type: "SCHEDULE",
      jobType: "FLOW",
      jobId: "flow-1",
      jobName: "审批流程",
      jobGroup: "demo",
      state: true,
      createdAt: "2024-03-01"
    },
    {
      id: "t2",
      name: "事件触发",
      description: "",
      type: "EVENT",
      jobType: "FUNCTION",
      jobId: "hello",
      jobName: "hello",
      jobGroup: "demo",
      state: false,
      createdAt: "2024-03-02"
    },
  ];
}

function jobLogs() {
  return [
    {
      id: "j1",
      triggerId: "t1",
      jobId: "flow-1",
      jobGroup: "demo",
      jobType: "FLOW",
      jobName: "审批流程",
      executionStatus: "SUCCESS",
      startTime: "2024-03-01 10:00:00",
      endTime: "2024-03-01 10:00:05",
      executionDuration: 5000,
      isSuccess: true,
    },
    {
      id: "j2",
      triggerId: "t2",
      jobId: "hello",
      jobGroup: "demo",
      jobType: "FUNCTION",
      jobName: "hello",
      executionStatus: "FAILED",
      startTime: "2024-03-02 10:00:00",
      endTime: "2024-03-02 10:00:02",
      executionDuration: 2000,
      isSuccess: false,
      errorMessage: "执行超时",
    },
  ];
}

function functions() {
  return [
    {
      id: "fn-1",
      projectId: PROJECT_ID,
      name: "hello",
      sourceFiles: {"index.ts": 'export default async function(req){ return new Response("hi"); }'},
      timeout: 30,
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-03-01T00:00:00Z",
    },
    {
      id: "fn-2",
      projectId: PROJECT_ID,
      name: "echo",
      sourceFiles: {"index.ts": 'export default async function(req){ return new Response(req.body); }'},
      timeout: 10,
      createdAt: "2024-03-02T00:00:00Z",
      updatedAt: "2024-03-02T00:00:00Z",
    },
  ];
}

function pageSite() {
  return {
    id: "page-1",
    projectId: PROJECT_ID,
    customDomains: null,
    productionDeploymentId: "deploy-1",
    status: "READY",
    fileCount: 3,
    sizeBytes: 10240,
    errorMessage: null,
    createdBy: "admin",
    updatedBy: "admin",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  };
}

function buckets() {
  return [
    {name: "images", visibility: "PUBLIC", createdAt: "2024-03-01", updatedAt: "2024-03-01"},
    {name: "docs", visibility: "PRIVATE", createdAt: "2024-03-02", updatedAt: "2024-03-02"},
  ];
}
