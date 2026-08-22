import {test as base, expect, type Page} from "@playwright/test";
import {injectAuthState, setupApiMocks} from "./mocks";

/**
 * 扩展的 test fixture：
 * - `mockPage`：已注入登录态 + 已注册所有 /api mock 路由的 page
 * - `authedPage`：同 mockPage，语义上指"已登录后访问受保护页面"
 *
 * 用法：
 *   import { test, expect } from "./fixtures";
 *   test("xxx", async ({ mockPage }) => { ... });
 */

export const test = base.extend<{ mockPage: Page; authedPage: Page }>({
  mockPage: async ({page}, use) => {
    await injectAuthState(page);
    await setupApiMocks(page);
    await use(page);
  },
  authedPage: async ({page}, use) => {
    await injectAuthState(page);
    await setupApiMocks(page);
    await use(page);
  },
});

export {expect};
