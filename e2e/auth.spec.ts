import {test, expect} from "@playwright/test";
import {setupApiMocks} from "./mocks";

test.describe("登录与认证", () => {
  test("未登录访问受保护路由会跳转到登录页", async ({page}) => {
    await setupApiMocks(page);
    await page.goto("/project");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", {name: "Flexmodel"})).toBeVisible();
  });

  test("登录页展示标题与演示登录入口", async ({page}) => {
    await setupApiMocks(page);
    await page.goto("/login");
    await expect(page.getByRole("heading", {name: "Flexmodel"})).toBeVisible();
    await expect(page.getByText("使用演示账号登录")).toBeVisible();
  });

  test("使用演示账号登录后跳转离开登录页", async ({page}) => {
    await setupApiMocks(page);
    await page.goto("/login");
    await page.getByText("使用演示账号登录").click();
    // 登录成功后会导航到首页或来源页
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("手动输入用户名密码登录", async ({page}) => {
    await setupApiMocks(page);
    await page.goto("/login");
    await page.getByPlaceholder("请输入用户名").fill("admin");
    await page.getByPlaceholder("请输入密码").fill("admin123");
    await page.getByRole("button", {name: "登录"}).click();
    await expect(page).not.toHaveURL(/\/login/);
  });
});
