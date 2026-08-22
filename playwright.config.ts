import {defineConfig, devices} from "@playwright/test";

/**
 * Playwright 配置 — flexmodel-ui E2E 测试
 *
 * 所有后端接口通过 page.route() 拦截并返回 mock 数据，
 * 因此无需启动 Java 后端（localhost:8080）即可运行测试。
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: {timeout: 10_000},

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: "zh-CN",
  },

  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"], channel: undefined},
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
