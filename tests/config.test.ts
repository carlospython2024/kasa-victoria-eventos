import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApplication } from "../server/app.ts";

const loader = new URL("../scripts/load-public-env.ts", import.meta.url).href;
const configuration = new URL("../src/config.ts", import.meta.url).href;
const keys = [
  "VITE_PUBLIC_ORIGIN",
  "VITE_BUSINESS_WHATSAPP",
  "VITE_BUSINESS_EMAIL",
  "RESEND_API_KEY",
  "BUSINESS_WHATSAPP",
  "BUSINESS_EMAIL",
  "PAYMENT_INSTRUCTIONS",
];
function renderSettings(mode: string, inherited: Record<string, string> = {}) {
  const directory = mkdtempSync(join(tmpdir(), "kasa-public-config-"));
  try {
    writeFileSync(
      join(directory, ".env.production.local"),
      [
        "VITE_PUBLIC_ORIGIN=https://fixture.example",
        "VITE_BUSINESS_WHATSAPP=573000000000",
        "VITE_BUSINESS_EMAIL=contact@example.test",
        "RESEND_API_KEY=server-only-fixture",
      ].join("\n"),
    );
    const env = { ...process.env };
    for (const name of keys) delete env[name];
    Object.assign(env, inherited);
    const source = `
      await import(${JSON.stringify(loader)});
      const {site} = await import(${JSON.stringify(configuration)});
      console.log(JSON.stringify({whatsapp:site.whatsapp,email:site.email,
        origin:site.publicUrl,serverSecretLoaded:!!process.env.RESEND_API_KEY}));
    `;
    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          "--import",
          import.meta.resolve("tsx"),
          "--input-type=module",
          "-e",
          source,
          "--",
          `--mode=${mode}`,
        ],
        { cwd: directory, env, encoding: "utf8" },
      ),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("demo: ignora contactos privados e incluso contactos heredados del terminal", () => {
  const result = renderSettings("demo", {
    VITE_BUSINESS_WHATSAPP: "573111111111",
    VITE_BUSINESS_EMAIL: "inherited@example.test",
  });
  assert.equal(result.whatsapp, "");
  assert.equal(result.email, "");
  assert.equal(result.serverSecretLoaded, false);
});

test("producción: prerender usa contactos configurados sin cargar claves del servidor", () => {
  assert.deepEqual(renderSettings("production"), {
    whatsapp: "573000000000",
    email: "contact@example.test",
    origin: "https://fixture.example",
    serverSecretLoaded: false,
  });
});

test("producción: una variable explícita conserva prioridad sobre el archivo local", () => {
  const result = renderSettings("production", {
    VITE_BUSINESS_WHATSAPP: "573111111111",
  });
  assert.equal(result.whatsapp, "573111111111");
});

test("servidor: contactos y disponibilidad de pago dependen de su configuración", async (t) => {
  const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  try {
    for (const k of keys) delete process.env[k];
    for (const configured of [false, true]) {
      if (configured) {
        process.env.BUSINESS_WHATSAPP = "573000000000";
        process.env.PAYMENT_INSTRUCTIONS =
          "Transferencia ficticia; no enviar dinero.";
      }
      const directory = mkdtempSync(join(tmpdir(), "kasa-server-config-"));
      const app = createApplication({ directory, production: false });
      const server = createServer(app.handler);
      try {
        await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
        const port = (server.address() as any).port;
        const response = await fetch(`http://127.0.0.1:${port}/api/config`);
        assert.equal(response.status, 200);
        const result = (await response.json()) as any;
        assert.equal(result.paymentsConfigured, configured);
        assert.equal(result.whatsapp, configured ? "573000000000" : "");
        assert.equal(result.privacyContact, configured ? "573000000000" : "");
      } finally {
        await new Promise<void>((r) => server.close(() => r()));
        app.close();
        rmSync(directory, { recursive: true, force: true });
      }
    }
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});
