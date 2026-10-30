import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const { values } = parseArgs({
  options: {
    package: { type: "string" },
    bucket: { type: "string", default: "kasa-victoria-media" },
    remote: { type: "boolean", default: false },
    "persist-to": { type: "string" },
  },
});
if (!values.package)
  throw new Error(
    "Provide --package with an offline export directory. Default destination is LOCAL R2.",
  );
if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(values.bucket))
  throw new Error("Invalid bucket name.");
const folder = resolve(values.package);
const manifest = JSON.parse(
  readFileSync(join(folder, "manifest.json"), "utf8"),
);
if (manifest.schema !== 1 || !Array.isArray(manifest.media))
  throw new Error("Invalid manifest.");
// Validate the complete package before any upload. No keys or filenames from outside uploads/.
for (const item of manifest.media) {
  if (
    !/^[a-f0-9]{32}$/.test(item.key) ||
    !["image/jpeg", "image/png", "image/webp"].includes(item.mime)
  )
    throw new Error("Invalid media record.");
  const bytes = readFileSync(join(folder, "uploads", item.key));
  if (
    bytes.length !== item.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== item.sha256
  )
    throw new Error("Media checksum mismatch.");
}
const wrangler = join(
  dirname(createRequire(import.meta.url).resolve("wrangler/package.json")),
  "bin",
  "wrangler.js",
);
for (const item of manifest.media)
  execFileSync(
    process.execPath,
    [
      wrangler,
      "r2",
      "object",
      "put",
      `${values.bucket}/${item.key}`,
      "--file",
      join(folder, "uploads", item.key),
      "--content-type",
      item.mime,
      values.remote ? "--remote" : "--local",
      ...(!values.remote && values["persist-to"]
        ? ["--persist-to", values["persist-to"]]
        : []),
    ],
    { stdio: "inherit" },
  );
console.log(
  `Imported ${manifest.media.length} objects into ${values.remote ? "REMOTE" : "LOCAL"} R2.`,
);
