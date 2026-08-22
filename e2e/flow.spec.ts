import {test, expect} from "./fixtures";

const FLOW_DEF = "/project/demo/flow/definition";
const FLOW_INST = "/project/demo/flow/instance";

test.describe("项目 - 流程", () => {
  test("流程定义列表：展示流程与新建按钮", async ({mockPage: page}) => {
    await page.goto(FLOW_DEF);
    await expect(page.getByRole("heading", {name: "流程定义"})).toBeVisible();
    await expect(page.getByText("审批流程")).toBeVisible();
    await expect(page.getByRole("button", {name: "新建流程"})).toBeVisible();
  });

  test("流程定义列表：打开新建流程弹窗", async ({mockPage: page}) => {
    await page.goto(FLOW_DEF);
    await page.getByRole("button", {name: "新建流程"}).click();
    await expect(page.getByRole("dialog").getByText("流程名称")).toBeVisible();
  });

  test("流程实例列表：展示实例与搜索", async ({mockPage: page}) => {
    await page.goto(FLOW_INST);
    await expect(page.getByRole("heading", {name: "流程实例"})).toBeVisible();
    await expect(page.getByText("审批流程").first()).toBeVisible();
    await expect(page.getByPlaceholder("搜索流程实例ID")).toBeVisible();
  });

  test("流程实例详情：渲染页面与返回按钮", async ({mockPage: page}) => {
    await page.goto("/project/demo/flow/instance/inst-1");
    // hideLayout 路由，直接渲染内容区；检查页面标题（含流程名和实例ID）
    await expect(page.getByText("审批流程").first()).toBeVisible({timeout: 15_000});
    await expect(page.getByText("inst-1").first()).toBeVisible();
  });

  test("流程设计器：渲染节点面板与画布", async ({mockPage: page}) => {
    await page.goto("/project/demo/flow/design/flow-1");
    await expect(page.getByText("开始事件")).toBeVisible();
    await expect(page.locator(".react-flow")).toBeAttached();
  });
});
