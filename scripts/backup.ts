import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, cpSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const source = resolve(process.env.DATA_DIR || "var");
const destination = resolve(
  process.env.BACKUP_DIR || "var/backups",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
if (!existsSync(resolve(source, "siempre.sqlite")))
  throw new Error("No existe la base de datos de la aplicación.");
mkdirSync(destination, { recursive: true });
const db = new DatabaseSync(resolve(source, "siempre.sqlite"), {
  readOnly: true,
});
try {
  await backup(db, resolve(destination, "siempre.sqlite"));
} finally {
  db.close();
}
cpSync(resolve(source, "uploads"), resolve(destination, "uploads"), {
  recursive: true,
});
writeFileSync(
  resolve(destination, "manifest.json"),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      schema: 1,
      includes: ["siempre.sqlite", "uploads"],
    },
    null,
    2,
  ),
);
console.log(
  `Copia creada en ${destination}. Consérvala fuera del servidor con acceso restringido.`,
);
