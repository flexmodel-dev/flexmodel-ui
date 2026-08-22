import {test, expect} from "./fixtures";

const FUNCTIONS = "/project/demo/functions";

test.describe("项目 - 边缘函数", () => {
  test("函数列表：展示函数与创建按钮", async ({mockPage: page}) => {
    await page.goto(FUNCTIONS);
    await expect(page.getByRole("heading", {name: "边缘函数"})).toBeVisible();
    await expect(page.getByText("hello")).toBeVisible();
    await expect(page.getByRole("button", {name: "创建函数"})).toBeVisible();
    await expect(page.getByPlaceholder("搜索函数名称")).toBeVisible();
  });

  test("函数列表：点击函数名打开详情抽屉", async ({mockPage: page}) => {
    await page.goto(FUNCTIONS);
    await page.getByText("hello").first().click();
    await expect(page.locator(".ant-drawer")).toBeVisible();
  });

  test("函数编辑器（新建）：展示编辑器与部署按钮", async ({mockPage: page}) => {
    await page.goto(`${FUNCTIONS}/editor`);
    await expect(page.getByText("新建函数")).toBeVisible();
    await expect(page.getByRole("button", {name: "部署"})).toBeVisible();
    await expect(page.getByRole("button", {name: "模板"})).toBeVisible();
  });

  test("函数编辑器（编辑）：加载已有函数", async ({mockPage: page}) => {
    await page.goto(`${FUNCTIONS}/editor/hello`);
    await expect(page.getByText("hello").first()).toBeVisible();
    await expect(page.getByRole("button", {name: "部署"})).toBeVisible();
  });
});
