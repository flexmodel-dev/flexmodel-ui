import {test, expect} from "./fixtures";

const PROJECT = "/project/demo";

test.describe("项目 - 概述与接口", () => {
  test("概述页：面包屑与统计卡片", async ({mockPage: page}) => {
    await page.goto(PROJECT);
    await expect(page.getByText("概述").first()).toBeVisible();
    // 面包屑中展示当前项目名称
    await expect(page.getByText("演示项目").first()).toBeVisible();
  });

  test("GraphQL API 页：展示标题与设置按钮", async ({mockPage: page}) => {
    await page.goto(`${PROJECT}/api/graphql`);
    await expect(page.getByRole("heading", {name: "GraphQL"})).toBeVisible();
    await expect(page.getByRole("button", {name: "设置"})).toBeVisible();
  });

  test("接口日志页：展示标题与日志表格", async ({mockPage: page}) => {
    await page.goto(`${PROJECT}/api/log`);
    // PageContainer 未设 title，通过列头确认页面已渲染
    await expect(page.getByRole("columnheader", {name: "请求方法"})).toBeVisible();
    // 日志数据中的请求方法标签
    await expect(page.getByText("GET").first()).toBeVisible();
    // 搜索 / 重置按钮（Ant Design 按钮在中文字符间插入空格，用正则匹配）
    await expect(page.getByRole("button", {name: /搜索/})).toBeVisible();
    await expect(page.getByRole("button", {name: /重\s*置/})).toBeVisible();
  });

  test("接口日志页：点击行打开详情抽屉", async ({mockPage: page}) => {
    await page.goto(`${PROJECT}/api/log`);
    await expect(page.getByText("GET").first()).toBeVisible();
    // 虚拟表格行以 div.ant-table-row 渲染，点击第一行打开 Drawer
    const row = page.locator(".ant-table-row").first();
    await row.click();
    await expect(page.getByText("请求日志").first()).toBeVisible();
  });
});
