import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import ts from "typescript";

// Use the same public origin for the Vite client, prerendered HTML and Worker API.
const { config, error } = ts.parseConfigFileTextToJson(
  "wrangler.jsonc",
  readFileSync("wrangler.jsonc", "utf8"),
);
if (error) throw new Error("Invalid wrangler.jsonc");
const origin = config.vars?.PUBLIC_ORIGIN;
const url = new URL(origin);
if (
  url.protocol !== "https:" ||
  url.origin !== origin ||
  url.username ||
  url.password ||
  url.hostname.endsWith(".example")
)
  throw new Error(
    "Configure the actual HTTPS PUBLIC_ORIGIN in wrangler.jsonc before building.",
  );
const manager = process.env.npm_execpath;
if (!manager) throw new Error("Run this build with pnpm build:worker.");
const env = { ...process.env, VITE_PUBLIC_ORIGIN: origin };
for (const args of [
  ["run", "build"],
  ["run", "check:worker"],
  ["exec", "wrangler", "deploy", "--dry-run", "--outdir", "worker-dist"],
]) {
  const result = spawnSync(process.execPath, [manager, ...args], {
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
