import {test, expect} from "./fixtures";

const MODELING = "/project/demo/data/modeling";

test.describe("项目 - 数据建模", () => {
  test("展示数据建模标题与模型树", async ({mockPage: page}) => {
    await page.goto(MODELING);
    await expect(page.getByRole("heading", {name: "数据建模"})).toBeVisible();
    // 模型树中包含 mock 的模型（displayName 或 name）
    await expect(page.getByText("学生").first()).toBeVisible();
  });

  test("打开 ER 视图弹窗", async ({mockPage: page}) => {
    await page.goto(MODELING);
    await expect(page.getByRole("heading", {name: "数据建模"})).toBeVisible();
    // ER 视图按钮（title 属性为"ER视图"）
    await page.locator('button[title="ER视图"]').click();
    await expect(page.getByText("ER视图").first()).toBeVisible();
  });
});
