import {test, expect} from "./fixtures";

const TRIGGER = "/project/demo/scheduling/trigger";
const JOB_LOG = "/project/demo/scheduling/job-execution-log";

test.describe("项目 - 任务调度", () => {
  test("触发器列表：展示触发器与创建按钮", async ({mockPage: page}) => {
    await page.goto(TRIGGER);
    await expect(page.getByRole("heading", {name: "触发器"})).toBeVisible();
    await expect(page.getByText("每分钟触发")).toBeVisible();
    await expect(page.getByRole("button", {name: "创建触发器"})).toBeVisible();
  });

  test("触发器列表：打开创建触发器弹窗", async ({mockPage: page}) => {
    await page.goto(TRIGGER);
    await page.getByRole("button", {name: "创建触发器"}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("任务执行日志：展示日志与详情", async ({mockPage: page}) => {
    await page.goto(JOB_LOG);
    await expect(page.getByRole("heading", {name: "任务执行日志"})).toBeVisible();
    await expect(page.getByText("审批流程").first()).toBeVisible();
    // 点击"详情"打开日志详情弹窗
    await page.getByRole("button", {name: "详情"}).first().click();
    await expect(page.getByText("任务执行日志详情")).toBeVisible();
  });
});
