import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { createApplication } from "./server/app";
import { loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const demo = mode === "demo";
  if (demo) {
    process.env.VITE_BUSINESS_WHATSAPP = "";
    process.env.VITE_BUSINESS_EMAIL = "";
  } else {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  }
  return {
    envDir: demo ? false : undefined,
    plugins: [
      react(),
      {
        name: "invitation-workflow-api",
        configureServer(server) {
          const app = createApplication();
          server.middlewares.use(app.handler);
          server.httpServer?.once("close", () => app.close());
        },
        configurePreviewServer(server) {
          const app = createApplication();
          server.middlewares.use(app.handler);
          server.httpServer?.once("close", () => app.close());
        },
      },
      {
        name: "serve-prerendered-routes",
        configurePreviewServer(server) {
          const root = resolve(server.config.root, server.config.build.outDir);
          server.middlewares.use((req, res, next) => {
            if (req.method !== "GET" && req.method !== "HEAD") return next();
            let pathname: string;
            try {
              pathname = decodeURIComponent(
                new URL(req.url || "/", "http://preview.local").pathname,
              );
            } catch {
              return next();
            }
            const file = resolve(root, "." + pathname, "index.html");
            if (!file.startsWith(root + sep) || !existsSync(file))
              return next();
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            res.end(req.method === "HEAD" ? undefined : readFileSync(file));
          });
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: 5173,
      fs: {
        deny: [
          "**/.env*",
          "**/.git/**",
          "**/var/**",
          "**/tmp/**",
          "**/server/**",
          "**/*.sqlite*",
        ],
      },
    },
    preview: { host: "127.0.0.1", port: 4173 },
    build: { modulePreload: { polyfill: false } },
  };
});
