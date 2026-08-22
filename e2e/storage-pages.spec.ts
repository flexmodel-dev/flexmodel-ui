import {test, expect} from "./fixtures";

const STORAGE = "/project/demo/storage";
const PROJECT_SETTINGS = "/project/demo/settings";

test.describe("项目 - 存储", () => {
  test("存储页：展示标题与存储桶列表", async ({mockPage: page}) => {
    await page.goto(STORAGE);
    await expect(page.getByRole("heading", {name: "存储"})).toBeVisible();
    await expect(page.getByText("images")).toBeVisible();
  });

  test("存储页：展示存储提供商标签", async ({mockPage: page}) => {
    await page.goto(STORAGE);
    await expect(page.getByText("Local")).toBeVisible();
  });
});

test.describe("项目 - 项目设置与页面", () => {
  test("项目设置：展示设置菜单", async ({mockPage: page}) => {
    await page.goto(PROJECT_SETTINGS);
    await expect(page.getByText("基础设置")).toBeVisible();
    await expect(page.getByText("身份认证")).toBeVisible();
    await expect(page.getByText("页面")).toBeVisible();
  });

  test("项目设置 - 基础设置：展示项目名称表单", async ({mockPage: page}) => {
    await page.goto(PROJECT_SETTINGS);
    await expect(page.getByText("项目名称")).toBeVisible();
  });

  test("项目设置 - 页面 Tab：展示站点信息", async ({mockPage: page}) => {
    await page.goto(PROJECT_SETTINGS);
    // 切换到"页面"菜单
    await page.getByText("页面", {exact: true}).click();
    await expect(page.getByText("站点地址")).toBeVisible();
    await expect(page.getByText("当前部署")).toBeVisible();
  });

  test("项目设置 - 身份认证 Tab：展示认证提供商", async ({mockPage: page}) => {
    await page.goto(PROJECT_SETTINGS);
    await page.getByText("身份认证", {exact: true}).click();
    await expect(page.getByRole("heading", {name: "身份认证"})).toBeVisible();
  });
});
