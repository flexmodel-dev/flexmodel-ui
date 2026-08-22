import {defineConfig, devices} from "@playwright/test";

/**
 * Playwright 配置 — flexmodel-ui E2E 测试
 *
 * 所有后端接口通过 page.route() 拦截并返回 mock 数据，
 * 因此无需启动 Java 后端（localhost:8080）即可运行测试。
 *
 * 性能优化：
 * - fullyParallel: 每个 spec 文件并行，文件内用例也并行
 * - workers: CI 自动按 CPU 核数分配；本地固定 4 线程
 * - video: off — 录制视频开销最大，关闭后仅保留 trace + screenshot 用于排查
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? undefined : 4,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: {timeout: 7_000},

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    locale: "zh-CN",
  },

  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"], channel: undefined},
    },
  ],

  // 所有并行 worker 共享同一个 Vite dev server，避免重复启动
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
