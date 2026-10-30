import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { exportCloudflare } from "../scripts/export-cloudflare.ts";

test("exportación offline: pedidos, fotos, sesiones y referencias; restablece administración", async () => {
  const root = mkdtempSync(join(tmpdir(), "kasa-export-"));
  let db: DatabaseSync | undefined;
  let imported: DatabaseSync | undefined;
  try {
    const src = join(root, "source"),
      out = join(root, "export");
    mkdirSync(src);
    mkdirSync(join(src, "uploads"));
    db = new DatabaseSync(join(src, "siempre.sqlite"));
    const schema = readFileSync(
      new URL("../migrations/0001_initial.sql", import.meta.url),
      "utf8",
    );
    db.exec(schema);
    const mediaId = "a".repeat(32),
      bytes = Buffer.from("fixture photo");
    writeFileSync(join(src, "uploads", mediaId), bytes);
    const order = {
      id: "order-1",
      payments: [{ reference: "NEQUI-TEST" }],
      version: 3,
    };
    db.prepare("INSERT INTO settings VALUES (?,?)").run(
      "password",
      "legacy-scrypt-hash",
    );
    db.prepare("INSERT INTO orders VALUES (?,?)").run(
      order.id,
      JSON.stringify(order),
    );
    db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
      "client-hash",
      "client",
      order.id,
      Date.now() + 60000,
    );
    db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
      "admin-hash",
      "admin",
      null,
      Date.now() + 60000,
    );
    db.prepare("INSERT INTO media VALUES (?,?,?)").run(
      mediaId,
      order.id,
      "image/png",
    );
    db.prepare("INSERT INTO outbox VALUES (?,?,?,?,?,0,NULL,?)").run(
      "email",
      "test@example.test",
      "Asunto",
      "https://old.example/pedido/order-1#acceso=secret",
      "pending",
      "2026-01-01",
    );
    const result = await exportCloudflare(
      src,
      out,
      "https://old.example",
      "https://new.example",
    );
    assert.equal(result.counts.orders, 1);
    assert.equal(result.counts.sessions, 1);
    assert.equal(result.counts.settings, 0);
    assert.equal(
      db.prepare("SELECT value FROM settings").get()!.value,
      "legacy-scrypt-hash",
    );
    assert.deepEqual(readFileSync(join(out, "uploads", mediaId)), bytes);
    const uploadOutput = execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        fileURLToPath(
          new URL("../scripts/import-cloudflare-media.ts", import.meta.url),
        ),
        "--package",
        out,
        "--persist-to",
        join(root, "local-r2"),
      ],
      {
        encoding: "utf8",
        env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
      },
    );
    assert.match(uploadOutput, /Imported 1 objects into LOCAL R2/);
    imported = new DatabaseSync(":memory:");
    imported.exec(schema);
    imported.exec(readFileSync(join(out, "data.sql"), "utf8"));
    assert.deepEqual(
      JSON.parse(
        imported.prepare("SELECT data FROM orders").get()!.data as string,
      ),
      order,
    );
    assert.equal(
      imported.prepare("SELECT count(*) n FROM settings").get()!.n,
      0,
    );
    assert.equal(
      imported.prepare("SELECT reference FROM payment_references").get()!
        .reference,
      "nequi-test",
    );
    assert.match(
      imported.prepare("SELECT body FROM outbox").get()!.body as string,
      /https:\/\/new.example\/pedido\/order-1#acceso=secret/,
    );
    await assert.rejects(exportCloudflare(src, out));
  } finally {
    imported?.close();
    db?.close();
    if (!root.startsWith(join(tmpdir(), "kasa-export-")))
      throw new Error("Unexpected cleanup target");
    rmSync(root, { recursive: true, force: true });
  }
});
