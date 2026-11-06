import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import ts from "typescript";

// Production uses private local settings; the default remains a demo dry-run.
const production = process.argv.includes("--production");
const configPath = production ? "wrangler.production.jsonc" : "wrangler.jsonc";
const { config, error } = ts.parseConfigFileTextToJson(
  configPath,
  readFileSync(configPath, "utf8"),
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
    `Configure the actual HTTPS PUBLIC_ORIGIN in ${configPath} before building.`,
  );
const manager = process.env.npm_execpath;
if (!manager) throw new Error("Run this build with pnpm build:worker.");
const env = { ...process.env, VITE_PUBLIC_ORIGIN: origin };
for (const args of [
  ["run", production ? "build:production" : "build"],
  ["run", "check:worker"],
  [
    "exec",
    "wrangler",
    "deploy",
    "--config",
    configPath,
    "--dry-run",
    "--outdir",
    "worker-dist",
  ],
]) {
  const result = spawnSync(process.execPath, [manager, ...args], {
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
