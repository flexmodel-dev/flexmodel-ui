import {test, expect} from "./fixtures";

test.describe("平台页面", () => {
  test("项目管理页：展示项目卡片", async ({mockPage: page}) => {
    await page.goto("/project");
    await expect(page.getByRole("heading", {name: "项目"})).toBeVisible();
    await expect(page.getByText("演示项目")).toBeVisible();
  });

  test("项目管理页：创建项目弹窗", async ({mockPage: page}) => {
    await page.goto("/project");
    await expect(page.getByText("演示项目")).toBeVisible();
    // 点击"创建项目"按钮打开弹窗
    await page.getByRole("button", {name: "创建项目"}).click();
    await expect(page.getByRole("dialog").getByText("项目ID")).toBeVisible();
  });

  test("成员管理页：展示用户与角色 Tab", async ({mockPage: page}) => {
    await page.goto("/member");
    await expect(page.getByRole("heading", {name: "成员"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "用户"})).toBeVisible();
    await expect(page.getByRole("tab", {name: "角色"})).toBeVisible();
    // 用户列表数据
    await expect(page.getByText("admin@example.com")).toBeVisible();
  });

  test("成员管理页：切换到角色 Tab", async ({mockPage: page}) => {
    await page.goto("/member");
    await page.getByRole("tab", {name: "角色"}).click();
    await expect(page.getByText("管理员")).toBeVisible();
  });

  test("API Key 管理页：展示 Key 列表", async ({mockPage: page}) => {
    await page.goto("/api-keys");
    await expect(page.getByRole("heading", {name: "API Key 管理"})).toBeVisible();
    await expect(page.getByText("测试 Key")).toBeVisible();
    await expect(page.getByRole("button", {name: "创建 API Key"})).toBeVisible();
  });

  test("API Key 管理页：打开创建弹窗", async ({mockPage: page}) => {
    await page.goto("/api-keys");
    await page.getByRole("button", {name: "创建 API Key"}).click();
    await expect(page.getByRole("dialog").getByText("名称")).toBeVisible();
  });

  test("平台设置页：展示基础设置菜单", async ({mockPage: page}) => {
    await page.goto("/settings");
    await expect(page.getByText("基础设置")).toBeVisible();
    await expect(page.getByText("代理")).toBeVisible();
    await expect(page.getByText("关于")).toBeVisible();
  });
});
