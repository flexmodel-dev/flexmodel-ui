import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import {fileURLToPath} from "node:url";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {extname, resolve} from "node:path";
import {existsSync} from "node:fs";

// pages 静态文件根目录
// flexmodel 仓库根目录下的 pages/ 目录
const PAGES_ROOT = (() => {
  if (process.env.FLEXMODEL_PAGES_ROOT) {
    return resolve(process.env.FLEXMODEL_PAGES_ROOT);
  }
  // 默认：flexmodel-ui 的上级目录下的 pages/
  // 即 flexmodel/pages/
  return resolve(process.cwd(), "..", "pages");
})();

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
};

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexmodel Pages</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; justify-content: center; align-items: center; min-height: 100vh;
      margin: 0; background: #f5f5f5; color: #333; }
    .container { text-align: center; padding: 2rem; max-width: 600px; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.1rem; color: #666; line-height: 1.6; }
    code { background: #e8e8e8; padding: 2px 8px; border-radius: 4px; font-size: 0.95em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Flexmodel Pages</h1>
    <p>静态站点托管服务已就绪。</p>
    <p>部署你的静态文件到 <code>/pages/{projectId}/</code> 即可通过 URL 访问。</p>
  </div>
</body>
</html>`;

/**
 * Vite plugin: 直接从本地 pages 目录读取静态文件，带 SPA fallback。
 * 文件不存在时 fall through 到下一个中间件（proxy → Java server → Vite SPA handler）。
 */
function pagesDevPlugin(): any {
  return {
    name: "pages-dev-server",
    async configureServer(server: any) {
      // 确保 pages 根目录和默认欢迎页存在
      await mkdir(PAGES_ROOT, {recursive: true});
      const welcomePath = resolve(PAGES_ROOT, "index.html");
      if (!existsSync(welcomePath)) {
        await writeFile(welcomePath, WELCOME_HTML, "utf-8");
        console.log(`[pages-dev] Created welcome page: ${welcomePath}`);
      }

      // 拦截 /pages/ 请求，优先从本地文件系统读取
      server.middlewares.use("/pages", async (req: any, res: any, next: any) => {
        if (!req.url) return next();

        const pathname = new URL(req.url, "http://local").pathname;
        // /pages/{projectId}[/{alias}][/{rest...}]
        const segments = pathname.replace(/^\/pages\/?/, "").split("/").filter(Boolean);

        // 根路径 "/pages" 或 "/pages/" → 返回欢迎页
        if (segments.length === 0) {
          try {
            const content = await readFile(resolve(PAGES_ROOT, "index.html"));
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.statusCode = 200;
            res.end(content);
            return;
          } catch {
            // fall through
          }
          return next();
        }

        const projectId = segments[0];
        const alias = segments[1] || "production";
        const filePath = segments.slice(2).join("/") || "index.html";

        const baseDir = resolve(PAGES_ROOT, projectId, alias);

        const candidates = filePath === "index.html"
          ? [resolve(baseDir, "index.html")]
          : [
            resolve(baseDir, filePath),
            resolve(baseDir, filePath, "index.html"),
            resolve(baseDir, "index.html"),
          ];

        for (const fp of candidates) {
          try {
            const content = await readFile(fp);
            const ext = extname(fp).toLowerCase();
            res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
            res.setHeader("Content-Length", content.length);
            if (/\.(js|css|png|jpe?g|gif|svg|woff2?|ttf|ico|mjs)$/.test(ext)) {
              res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
            } else {
              res.setHeader("Cache-Control", "no-cache");
            }
            res.statusCode = 200;
            res.end(content);
            return;
          } catch (e: any) {
            if (e.code !== "ENOENT" && e.code !== "EISDIR" && e.code !== "ENOTDIR") {
              res.statusCode = 500;
              res.end("Internal server error");
              return;
            }
          }
        }

        // 本地无文件 → fall through（走 Vite proxy → Java server）
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["classProperties", "classPrivateProperties", "classPrivateMethods"],
        },
      },
    }),
    svgr({ svgrOptions: { icon: true } }),
    pagesDevPlugin(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
      // Edge Functions → Deno Runtime
      "/functions": {
        target: "http://localhost:9999",
        changeOrigin: true,
      },
      // Pages fallback → Java server (when local files not found)
      "/pages": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
