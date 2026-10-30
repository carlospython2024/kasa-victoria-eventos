import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

// Offline only: creates a consistent snapshot and an import package; never contacts Cloudflare.
export async function exportCloudflare(
  source: string,
  destination: string,
  oldOrigin = "",
  newOrigin = "",
) {
  if (!!oldOrigin !== !!newOrigin)
    throw new Error(
      "Provide both old-origin and origin to rewrite email links.",
    );
  for (const value of [oldOrigin, newOrigin].filter(Boolean)) {
    const url = new URL(value);
    if (url.origin !== value || !["http:", "https:"].includes(url.protocol))
      throw new Error("Origins must have no path or trailing slash.");
  }
  const src = resolve(source),
    out = resolve(destination);
  // A new directory prevents accidental replacement of an earlier export.
  mkdirSync(out, { recursive: false });
  mkdirSync(join(out, "uploads"));
  const original = new DatabaseSync(join(src, "siempre.sqlite"), {
    readOnly: true,
  });
  try {
    await backup(original, join(out, "snapshot.sqlite"));
  } finally {
    original.close();
  }
  const db = new DatabaseSync(join(out, "snapshot.sqlite"), { readOnly: true });
  const quote = (v: any): string =>
    v === null
      ? "NULL"
      : typeof v === "number"
        ? String(v)
        : "'" + String(v).replaceAll("'", "''") + "'";
  const tables = [
    "settings",
    "orders",
    "sessions",
    "leads",
    "media",
    "responses",
    "guests",
    "songs",
    "audit",
    "outbox",
    "rate_limits",
  ];
  const counts: Record<string, number> = {};
  const sql: string[] = [
    "-- Import into an EMPTY D1 database after applying migrations. Contains private customer data.",
  ];
  const manifest: {
    key: string;
    mime: string;
    bytes: number;
    sha256: string;
  }[] = [];
  const references = new Set<string>();
  const emit = (table: string, row: Record<string, any>) =>
    sql.push(
      `INSERT INTO ${table} (${Object.keys(row)
        .map((k) => '"' + k + '"')
        .join(",")}) VALUES (${Object.values(row).map(quote).join(",")});`,
    );
  try {
    for (const table of tables) {
      let rows = db
        .prepare(
          `SELECT rowid AS _migration_rowid,* FROM ${table} ORDER BY rowid`,
        )
        .all() as Record<string, any>[];
      if (table === "settings") rows = rows.filter((r) => r.key !== "password");
      if (table === "sessions")
        rows = rows.filter(
          (r) => r.role === "client" && r.expires > Date.now(),
        );
      if (table === "rate_limits") rows = [];
      counts[table] = rows.length;
      for (const row of rows) {
        const { _migration_rowid, ...data } = row;
        if (table === "outbox" && oldOrigin)
          data.body = data.body.replaceAll(oldOrigin, newOrigin);
        // Preserve row order (used by the existing administration screens).
        emit(table, { rowid: _migration_rowid, ...data });
        if (table === "orders")
          for (const payment of JSON.parse(data.data).payments) {
            const ref = payment.reference.toLowerCase();
            if (references.has(ref))
              throw new Error(
                "Duplicate payment reference in source; resolve before import.",
              );
            references.add(ref);
            emit("payment_references", { reference: ref, order_id: data.id });
          }
        if (table === "media") {
          if (!/^[a-f0-9]{32}$/.test(data.id))
            throw new Error("Invalid media key; export stopped.");
          const bytes = readFileSync(join(src, "uploads", data.id));
          copyFileSync(
            join(src, "uploads", data.id),
            join(out, "uploads", data.id),
          );
          manifest.push({
            key: data.id,
            mime: data.mime,
            bytes: bytes.length,
            sha256: createHash("sha256").update(bytes).digest("hex"),
          });
        }
      }
    }
    counts.payment_references = references.size;
    writeFileSync(join(out, "data.sql"), sql.join("\n") + "\n");
    const result = {
      schema: 1,
      createdAt: new Date().toISOString(),
      counts,
      media: manifest,
      adminResetRequired: true,
      oldOrigin,
      newOrigin,
    };
    writeFileSync(
      join(out, "manifest.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
    return result;
  } finally {
    db.close();
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  const { values } = parseArgs({
    options: {
      source: { type: "string", default: "var" },
      out: { type: "string" },
      "old-origin": { type: "string" },
      origin: { type: "string" },
    },
  });
  if (!values.out)
    throw new Error(
      "Use --out with a new directory under var. Stop source writes before exporting.",
    );
  const result = await exportCloudflare(
    values.source,
    values.out,
    values["old-origin"],
    values.origin,
  );
  console.log(
    JSON.stringify({
      counts: result.counts,
      files: result.media.length,
      adminResetRequired: true,
    }),
  );
}
