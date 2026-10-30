import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { business, site } from "../src/config.ts";
import { models } from "../src/data.ts";
import { celebrations } from "../src/celebrations.ts";
import { pricing, validateContact, validateRsvp } from "../src/logic.ts";
import { weddingMusic } from "../src/music.ts";
import type { Brief, Order, PublicInvitation } from "../src/workflow/types.ts";

type StoredOrder = Order & {
  accessHash: string;
  published: PublicInvitation | null;
  termsConfirmed: boolean;
  termsAccepted: boolean;
};
type Options = {
  directory?: string;
  production?: boolean;
  origin?: string;
  setupToken?: string;
};
const now = () => new Date().toISOString();
const secret = () => randomBytes(32).toString("hex");
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const text = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function requireThat(ok: unknown, message: string, status = 400): asserts ok {
  if (!ok) throw Object.assign(new Error(message), { status });
}
function int(v: unknown, min: number, max: number) {
  requireThat(
    Number.isSafeInteger(v) && Number(v) >= min && Number(v) <= max,
    "Revisa los valores numéricos.",
  );
  return Number(v);
}
function blankBrief(modelId: string): Brief {
  return {
    names: ["", ""],
    date: "",
    city: "",
    ceremony: { place: "", address: "", time: "" },
    party: { place: "", address: "", time: "" },
    story: "",
    dressCode: "",
    gifts: "",
    photos: [],
    music: weddingMusic[modelId] || "",
    maxCompanions: 2,
  };
}
export function createApplication(options: Options = {}) {
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  const origin = options.origin || process.env.PUBLIC_ORIGIN || "";
  if (production)
    requireThat(
      /^https:\/\/[^/]+$/.test(origin),
      "PUBLIC_ORIGIN debe ser un origen HTTPS público.",
    );
  const directory = resolve(options.directory || process.env.DATA_DIR || "var");
  mkdirSync(resolve(directory, "uploads"), { recursive: true });
  const db = new DatabaseSync(resolve(directory, "siempre.sqlite"));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, role TEXT NOT NULL, order_id TEXT, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL, resolved INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, mime TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, visitor_hash TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(order_id,visitor_hash));
    CREATE TABLE IF NOT EXISTS guests (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, name TEXT NOT NULL, companions INTEGER NOT NULL, token_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, order_id TEXT NOT NULL, at TEXT NOT NULL, actor TEXT NOT NULL, message TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, error TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);`);
  const setting = (key: string) =>
    (db.prepare("SELECT value FROM settings WHERE key=?").get(key) as any)
      ?.value;
  const saveSetting = (key: string, value: string) =>
    db.prepare("INSERT OR REPLACE INTO settings VALUES (?,?)").run(key, value);
  const allOrders = () =>
    (
      db.prepare("SELECT data FROM orders ORDER BY rowid DESC").all() as any[]
    ).map((r) => JSON.parse(r.data) as StoredOrder);
  function load(id: string): StoredOrder {
    const row = db.prepare("SELECT data FROM orders WHERE id=?").get(id) as any;
    requireThat(row, "No encontramos este pedido.", 404);
    return JSON.parse(row.data);
  }
  function save(o: StoredOrder) {
    o.updatedAt = now();
    o.version++;
    db.prepare("INSERT OR REPLACE INTO orders VALUES (?,?)").run(
      o.id,
      JSON.stringify(o),
    );
  }
  function audit(o: StoredOrder, actor: string, message: string) {
    const at = now();
    o.timeline.push({ at, actor, text: message });
    db.prepare(
      "INSERT INTO audit(order_id,at,actor,message) VALUES (?,?,?,?)",
    ).run(o.id, at, actor, message);
  }
  function transaction<T>(fn: () => T): T {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  function sanitized(o: StoredOrder) {
    const { accessHash, published, ...safe } = o;
    return safe;
  }
  function queue(recipient: string, subject: string, body: string) {
    if (recipient)
      db.prepare("INSERT INTO outbox VALUES (?,?,?,?,?,0,NULL,?)").run(
        secret().slice(0, 24),
        recipient,
        subject,
        body,
        "pending",
        now(),
      );
  }
  function notify(o: StoredOrder, message: string) {
    queue(
      o.contact.email,
      `${site.name} · ${o.code}`,
      `${message}\n\nConsulta tu pedido desde tu enlace privado. Código: ${o.code}.`,
    );
    queue(
      process.env.BUSINESS_EMAIL || site.email,
      `Pedido ${o.code}`,
      `${message}\n${origin}/gestion`,
    );
  }
  function isActive(o: StoredOrder) {
    return (
      !!o.published &&
      !!o.publishedAt &&
      o.stage !== "closed" &&
      !!o.expiresAt &&
      Date.parse(o.expiresAt) > Date.now()
    );
  }
  function pub(slug: string) {
    const o = allOrders().find((o) => o.slug === slug);
    requireThat(o && isActive(o), "Esta invitación no está disponible.", 404);
    return o;
  }
  function guestAccess(id: string, token: string) {
    return token && /^[a-f0-9]{64}$/.test(token)
      ? (db
          .prepare(
            "SELECT * FROM guests WHERE order_id=? AND token_hash=? AND active=1",
          )
          .get(id, hash(token)) as any)
      : null;
  }
  const price = () => pricing();
  const paymentInstructions =
    process.env.PAYMENT_INSTRUCTIONS ||
    "Nequi: 0000000000. Titular: Titular de ejemplo. Comprueba el nombre antes de confirmar la transferencia e incluye el código del pedido en la referencia.";
  function config() {
    return {
      brand: site.name,
      email: process.env.BUSINESS_EMAIL || site.email,
      whatsapp: site.whatsapp,
      publicUrl: origin,
      total: price().amount,
      deposit: price().deposit,
      revisionsIncluded: 2,
      activeDays: 90,
      deliveryDays: business.deliveryDays,
      provisional: business.demo,
      paymentsConfigured: true,
      emailConfigured: !!(
        process.env.RESEND_API_KEY &&
        process.env.EMAIL_FROM &&
        origin
      ),
      privacyContact: process.env.BUSINESS_EMAIL || site.email || site.whatsapp,
    };
  }
  function rate(req: IncomingMessage, bucket: string, limit: number) {
    const key = `${bucket}:${req.socket.remoteAddress}`;
    const time = Date.now();
    const row = db
      .prepare("SELECT * FROM rate_limits WHERE key=?")
      .get(key) as any;
    if (!row || row.until < time)
      db.prepare("INSERT OR REPLACE INTO rate_limits VALUES (?,1,?)").run(
        key,
        time + 900_000,
      );
    else {
      requireThat(
        row.count < limit,
        "Demasiados intentos. Vuelve a intentarlo en unos minutos.",
        429,
      );
      db.prepare("UPDATE rate_limits SET count=count+1 WHERE key=?").run(key);
    }
  }
  function cookie(req: IncomingMessage, name: string) {
    return (
      (req.headers.cookie || "")
        .split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith(name + "="))
        ?.slice(name.length + 1) || ""
    );
  }
  function session(req: IncomingMessage, role: "admin" | "client") {
    const token = cookie(req, `siempre_${role}`);
    return token
      ? (db
          .prepare(
            "SELECT * FROM sessions WHERE hash=? AND role=? AND expires>?",
          )
          .get(hash(token), role, Date.now()) as any)
      : null;
  }
  function setSession(
    res: ServerResponse,
    role: "admin" | "client",
    id?: string,
  ) {
    const token = secret();
    const age = role === "admin" ? 43200 : 604800;
    db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
      hash(token),
      role,
      id || null,
      Date.now() + age * 1000,
    );
    res.setHeader(
      "Set-Cookie",
      `siempre_${role}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${production ? "; Secure" : ""}`,
    );
  }
  function admin(req: IncomingMessage) {
    requireThat(session(req, "admin"), "Inicia sesión en gestión.", 401);
  }
  function owner(req: IncomingMessage, id: string) {
    requireThat(
      session(req, "admin") || session(req, "client")?.order_id === id,
      "Abre tu enlace privado para acceder a este pedido.",
      401,
    );
  }
  function validBrief(input: any, o: StoredOrder): Brief {
    requireThat(
      input && typeof input === "object",
      "Completa la información del evento.",
    );
    const event = (v: any) => ({
      place: text(v?.place, 160),
      address: text(v?.address, 250),
      time: text(v?.time, 50),
    });
    const photos = Array.isArray(input.photos)
      ? input.photos.slice(0, 8).map((p: unknown) => text(p, 150))
      : [];
    for (const p of photos) {
      const id = p.replace("/api/media/", "");
      requireThat(
        p === `/api/media/${id}` &&
          (db.prepare("SELECT order_id FROM media WHERE id=?").get(id) as any)
            ?.order_id === o.id,
        "La fotografía no pertenece a este pedido.",
      );
    }
    const music = text(input.music, 150);
    requireThat(
      !music || Object.values(weddingMusic).includes(music),
      "Selecciona una canción del catálogo.",
    );
    const date = text(input.date, 35);
    requireThat(
      !date ||
        (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?-05:00$/.test(date) &&
          Number.isFinite(Date.parse(date))),
      "Revisa fecha y hora del evento (Colombia).",
    );
    return {
      lodging: text(input.lodging, 1000),
      menu: text(input.menu, 1000),
      transportInfo: text(input.transportInfo, 1000),
      social: text(input.social, 300),
      privateGuests: input.privateGuests === true,
      names: [text(input.names?.[0], 80), text(input.names?.[1], 80)],
      date,
      city: text(input.city, 120),
      ceremony: event(input.ceremony),
      party: event(input.party),
      story: text(input.story, 1600),
      dressCode: text(input.dressCode, 600),
      gifts: text(input.gifts, 600),
      photos,
      music,
      maxCompanions: int(input.maxCompanions, 0, 10),
    };
  }
  function complete(o: StoredOrder) {
    const b = o.brief;
    requireThat(
      b.names[0] &&
        (o.category !== "Matrimonio" || b.names[1]) &&
        b.date &&
        b.city &&
        b.ceremony.place &&
        b.ceremony.address &&
        b.ceremony.time,
      "Faltan nombres, fecha, ciudad o datos del lugar principal.",
    );
    requireThat(
      (!b.party.place && !b.party.address && !b.party.time) ||
        (b.party.place && b.party.address && b.party.time),
      "Completa lugar, dirección y hora de la recepción, o deja los tres vacíos.",
    );
    requireThat(
      Date.parse(b.date) > Date.now(),
      "La fecha del evento debe ser futura.",
    );
    requireThat(
      o.category !== "Matrimonio" || b.photos.length > 0,
      "Añade al menos una fotografía de la pareja.",
    );
  }
  async function body(req: IncomingMessage) {
    requireThat(
      (req.headers["content-type"] || "").startsWith("application/json"),
      "Envía la solicitud en JSON.",
      415,
    );
    let size = 0;
    const chunks: Buffer[] = [];
    for await (const c of req) {
      size += c.length;
      requireThat(size <= 7_100_000, "El archivo es demasiado grande.", 413);
      chunks.push(Buffer.from(c));
    }
    try {
      const value = JSON.parse(Buffer.concat(chunks).toString());
      requireThat(
        value && typeof value === "object" && !Array.isArray(value),
        "Solicitud no válida.",
      );
      return value;
    } catch {
      throw Object.assign(new Error("Solicitud no válida."), { status: 400 });
    }
  }
  function json(res: ServerResponse, data: unknown, code = 200) {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));
  }
  function csv(rows: any[]) {
    const fields = [
      "name",
      "attending",
      "companions",
      "children",
      "dietary",
      "transport",
      "comments",
      "updatedAt",
    ];
    const cell = (v: any) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    return (
      "\ufeff" +
      [fields, ...rows.map((r) => fields.map((f) => r[f]))]
        .map((r) => r.map(cell).join(","))
        .join("\r\n")
    );
  }
  async function handler(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void = () => {
      res.statusCode = 404;
      res.end();
    },
  ) {
    const url = new URL(req.url || "/", "http://localhost");
    if (!url.pathname.startsWith("/api/")) return next();
    const path = url.pathname.slice(4).split("/").filter(Boolean);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    try {
      const write = !["GET", "HEAD"].includes(req.method || "GET");
      if (write) {
        const expected = origin || `http://${req.headers.host}`;
        requireThat(
          req.headers.origin === expected,
          "Solicitud de otro origen rechazada.",
          403,
        );
        requireThat(req.method === "POST", "Método no permitido.", 405);
      }
      if (path[0] === "config" && !write) return json(res, config());
      if (path[0] === "health" && !write) return json(res, { ok: true });
      if (path[0] === "auth") {
        if (path[1] === "status" && !write)
          return json(res, {
            admin: !!session(req, "admin"),
            setup: !setting("password"),
            production,
          });
        requireThat(write, "Método no permitido.", 405);
        rate(req, "auth", 15);
        const b = await body(req);
        if (path[1] === "setup") {
          requireThat(
            !setting("password"),
            "La administración ya está configurada.",
            409,
          );
          const setupToken =
            options.setupToken || process.env.ADMIN_SETUP_TOKEN;
          const loopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
            req.socket.remoteAddress || "",
          );
          requireThat(
            production
              ? !!setupToken && hash(text(b.setupToken)) === hash(setupToken)
              : loopback,
            "Necesitas el código de instalación del servidor.",
            403,
          );
          requireThat(
            typeof b.password === "string" &&
              b.password.length >= 12 &&
              b.password.length <= 128,
            "Usa una contraseña de 12 a 128 caracteres.",
          );
          const salt = secret();
          saveSetting(
            "password",
            `${salt}:${scryptSync(b.password, salt, 64).toString("hex")}`,
          );
          setSession(res, "admin");
          return json(res, { ok: true });
        }
        if (path[1] === "login") {
          const saved = setting("password");
          requireThat(saved, "Configura la administración primero.", 401);
          const [salt, key] = saved.split(":");
          const actual = scryptSync(
            typeof b.password === "string" ? b.password.slice(0, 128) : "",
            salt,
            64,
          );
          requireThat(
            timingSafeEqual(actual, Buffer.from(key, "hex")),
            "Contraseña incorrecta.",
            401,
          );
          setSession(res, "admin");
          return json(res, { ok: true });
        }
        if (path[1] === "redeem") {
          const o = load(text(b.id));
          requireThat(
            hash(text(b.token)) === o.accessHash,
            "El enlace privado no es válido. Solicita uno nuevo.",
            401,
          );
          setSession(res, "client", o.id);
          return json(res, { ok: true });
        }
        if (path[1] === "logout") {
          const role = b.role === "client" ? "client" : "admin";
          db.prepare("DELETE FROM sessions WHERE hash=?").run(
            hash(cookie(req, `siempre_${role}`)),
          );
          res.setHeader(
            "Set-Cookie",
            `siempre_${role}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${production ? "; Secure" : ""}`,
          );
          return json(res, { ok: true });
        }
      }
      if (path[0] === "contact" && write) {
        rate(req, "contact", 8);
        const b = await body(req);
        const data = {
          name: text(b.name, 150),
          email: text(b.email, 150).toLowerCase(),
          phone: text(b.phone, 25),
          event: text(b.event, 2000),
        };
        requireThat(
          Object.keys(validateContact(data)).length === 0 &&
            b.consent === true &&
            !b.website,
          "Revisa los datos y autoriza el contacto.",
        );
        const id = secret().slice(0, 12);
        db.prepare("INSERT INTO leads VALUES (?,?,?,0)").run(
          id,
          JSON.stringify(data),
          now(),
        );
        queue(
          process.env.BUSINESS_EMAIL || site.email,
          "Nueva consulta",
          `${data.name}: ${data.event}\nConsulta los datos de contacto en ${origin}/gestion`,
        );
        return json(res, { id }, 201);
      }
      if (path[0] === "orders" && path.length === 1 && write) {
        rate(req, "orders", 10);
        const b = await body(req);
        const model = models.find((m) => m.id === b.modelId);
        const celebration = celebrations.find((c) => c.id === b.modelId);
        requireThat(model || celebration, "Selecciona un diseño del catálogo.");
        const contact = {
          name: text(b.name, 150),
          phone: text(b.phone, 25),
          email: text(b.email, 150).toLowerCase(),
        };
        requireThat(
          Object.keys(
            validateContact({ ...contact, event: "Solicitud de invitación" }),
          ).length === 0 &&
            b.consent === true &&
            !b.website,
          "Revisa tus datos y autoriza el tratamiento para gestionar el pedido.",
        );
        const id = secret().slice(0, 24),
          token = secret();
        const at = now();
        const o: StoredOrder = {
          id,
          code: `INV-${id.slice(0, 6).toUpperCase()}`,
          modelId: b.modelId,
          modelName: model?.name || celebration!.design,
          category: model ? "Matrimonio" : celebration!.category,
          contact,
          stage: "collecting",
          createdAt: at,
          updatedAt: at,
          version: 0,
          total: model ? price().amount : null,
          deposit: model ? price().deposit : null,
          paid: 0,
          paymentInstructions,
          paymentUrl: "",
          paymentNotice: "",
          brief: blankBrief(b.modelId),
          revision: 1,
          reviewRevision: null,
          approvedRevision: null,
          revisionsUsed: 0,
          revisionsIncluded: 2,
          activeDays: [30, 90, 180, 365].includes(b.activeDays)
            ? b.activeDays
            : 90,
          deliveryDays: business.deliveryDays,
          validatedAt: null,
          expiresAt: null,
          slug: `evento-${id.slice(0, 12)}`,
          publishedAt: null,
          timeline: [],
          payments: [],
          accessHash: hash(token),
          published: null,
          termsConfirmed: false,
          termsAccepted: false,
        };
        transaction(() => {
          audit(
            o,
            "Cliente",
            "Solicitud creada y autorización de contacto registrada.",
          );
          save(o);
          const link = `${origin}/pedido/${id}#acceso=${token}`;
          if (origin)
            queue(
              contact.email,
              `Tu invitación comienza aquí · ${o.code}`,
              `Gracias por elegir ${site.name}. Guarda este enlace privado; permite gestionar tu pedido:\n${link}\nNo lo compartas con tus invitados.`,
            );
          queue(
            process.env.BUSINESS_EMAIL || site.email,
            `Nueva solicitud ${o.code}`,
            `${contact.name} eligió ${o.modelName}.\n${origin}/gestion`,
          );
        });
        setSession(res, "client", id);
        return json(res, { id, token, code: o.code }, 201);
      }
      if (path[0] === "orders" && path[1]) {
        const id = path[1];
        owner(req, id);
        let o = load(id);
        if (!write && path.length === 2) return json(res, sanitized(o));
        if (!write && path[2] === "preview")
          return json(res, {
            id: o.id,
            modelId: o.modelId,
            category: o.category,
            brief: o.brief,
            preview: true,
          });
        if (path[2] === "guests") {
          if (!write)
            return json(
              res,
              db
                .prepare(
                  "SELECT id,name,companions,active FROM guests WHERE order_id=? ORDER BY rowid",
                )
                .all(id),
            );
          const b = await body(req);
          requireThat(
            o.publishedAt && o.stage !== "closed",
            "Los enlaces se generan después de publicar la invitación.",
          );
          if (b.action === "revoke") {
            db.prepare(
              "UPDATE guests SET active=0 WHERE id=? AND order_id=?",
            ).run(text(b.id), id);
            return json(res, { ok: true });
          }
          let guest: any;
          if (b.id) {
            guest = db
              .prepare("SELECT * FROM guests WHERE id=? AND order_id=?")
              .get(text(b.id), id);
            requireThat(guest, "Invitado no encontrado.", 404);
          } else {
            requireThat(
              (
                db
                  .prepare("SELECT count(*) AS n FROM guests WHERE order_id=?")
                  .get(id) as any
              ).n < 500,
              "Este pedido admite hasta 500 enlaces personalizados.",
            );
            guest = {
              id: secret().slice(0, 24),
              name: text(b.name, 100),
              companions: int(b.companions, 0, 10),
            };
            requireThat(
              guest.name.length >= 2,
              "Escribe el nombre del invitado.",
            );
          }
          const token = secret();
          db.prepare("INSERT OR REPLACE INTO guests VALUES (?,?,?,?,?,1)").run(
            guest.id,
            id,
            guest.name,
            guest.companions,
            hash(token),
          );
          return json(res, {
            path: `/i/${o.slug}?invitado=${token}`,
            name: guest.name,
          });
        }
        if (!write && path[2] === "responses") {
          const responses = (
            db
              .prepare(
                "SELECT data FROM responses WHERE order_id=? ORDER BY rowid DESC",
              )
              .all(id) as any[]
          ).map((r) => JSON.parse(r.data));
          const songs = (
            db
              .prepare(
                "SELECT data FROM songs WHERE order_id=? ORDER BY rowid DESC",
              )
              .all(id) as any[]
          ).map((r) => JSON.parse(r.data));
          if (url.searchParams.get("format") === "csv") {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="invitados-${o.code}.csv"`,
            );
            return res.end(csv(responses));
          }
          return json(res, { responses, songs });
        }
        requireThat(write, "Ruta no disponible.", 404);
        const b = await body(req);
        if (path[2] === "upload") {
          requireThat(
            ["collecting", "designing"].includes(o.stage),
            "Las fotografías solo se editan durante la preparación.",
            409,
          );
          const count = (
            db
              .prepare("SELECT count(*) AS n FROM media WHERE order_id=?")
              .get(id) as any
          ).n;
          requireThat(
            count < 40,
            "Se alcanzó el límite de archivos del pedido.",
          );
          requireThat(
            typeof b.data === "string" && /^[A-Za-z0-9+/]*={0,2}$/.test(b.data),
            "Archivo no válido.",
          );
          const bytes = Buffer.from(b.data, "base64");
          requireThat(
            bytes.length > 12 && bytes.length <= 5 * 1024 * 1024,
            "Cada foto debe pesar como máximo 5 MB.",
          );
          const mime =
            bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
              ? "image/jpeg"
              : bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
                ? "image/png"
                : bytes.subarray(0, 4).toString() === "RIFF" &&
                    bytes.subarray(8, 12).toString() === "WEBP"
                  ? "image/webp"
                  : "";
          requireThat(mime, "Usa fotografías JPG, PNG o WebP.");
          const mediaId = secret().slice(0, 32);
          writeFileSync(resolve(directory, "uploads", mediaId), bytes);
          db.prepare("INSERT INTO media VALUES (?,?,?)").run(mediaId, id, mime);
          return json(res, { url: `/api/media/${mediaId}` }, 201);
        }
        const isAdmin = !!session(req, "admin");
        transaction(() => {
          o = load(id);
          requireThat(
            b.version === o.version,
            "Este pedido cambió. Actualiza la página antes de continuar.",
            409,
          );
          if (["approve", "accept-terms", "changes"].includes(path[2]))
            requireThat(
              session(req, "client")?.order_id === id,
              "Esta acción debe realizarla el cliente desde su enlace privado.",
              403,
            );
          if (path[2] === "brief") {
            requireThat(
              o.stage === "collecting" || (isAdmin && o.stage === "designing"),
              "Para editar, solicita ajustes o reabre el diseño.",
              409,
            );
            o.brief = validBrief(b.brief, o);
            o.revision++;
            o.reviewRevision = null;
            o.approvedRevision = null;
            audit(o, isAdmin ? "Equipo" : "Cliente", "Información guardada.");
          } else if (path[2] === "payment-notice") {
            requireThat(
              o.termsConfirmed &&
                o.termsAccepted &&
                o.total !== null &&
                o.stage !== "closed",
              "Primero confirma las condiciones del pedido.",
            );
            o.paymentNotice = text(b.reference, 300);
            requireThat(
              o.paymentNotice.length >= 4,
              "Escribe la referencia y el valor de tu pago.",
            );
            audit(o, "Cliente", "Pago reportado; pendiente de verificación.");
            notify(
              o,
              "Recibimos tu aviso de pago. El equipo verificará el ingreso.",
            );
          } else if (path[2] === "accept-terms") {
            requireThat(
              o.termsConfirmed && o.stage === "collecting",
              "Las condiciones aún no están listas.",
            );
            o.termsAccepted = true;
            audit(o, "Cliente", "Condiciones del pedido aceptadas.");
          } else if (path[2] === "submit") {
            requireThat(
              o.stage === "collecting" &&
                o.termsConfirmed &&
                o.termsAccepted &&
                o.deposit !== null &&
                o.paid >= o.deposit,
              "Necesitamos las condiciones aceptadas y el anticipo verificado.",
            );
            complete(o);
            o.stage = "submitted";
            audit(o, "Cliente", "Información enviada para validación.");
            notify(
              o,
              "Tu información está lista para que el equipo la revise.",
            );
          } else if (path[2] === "approve") {
            requireThat(
              o.stage === "review" && o.reviewRevision === o.revision,
              "No hay una versión lista para aprobar.",
            );
            o.approvedRevision = o.revision;
            o.stage = "approved";
            audit(o, "Cliente", `Versión ${o.revision} aprobada.`);
            notify(
              o,
              "Invitación aprobada. Tras verificar el saldo, el equipo publicará el enlace.",
            );
          } else if (path[2] === "changes") {
            requireThat(
              o.stage === "review",
              "La invitación aún no está en revisión.",
            );
            requireThat(
              o.revisionsUsed < o.revisionsIncluded,
              "Se agotaron las rondas incluidas. Contacta al equipo para ampliar el alcance.",
            );
            const note = text(b.note, 1800);
            requireThat(
              note.length >= 5,
              "Describe los ajustes que necesitas.",
            );
            o.stage = "designing";
            o.revisionsUsed++;
            o.approvedRevision = null;
            audit(o, "Cliente", `Ajustes solicitados: ${note}`);
            notify(o, "Se registró una nueva solicitud de ajustes.");
          } else if (path[2] === "admin") {
            admin(req);
            if (b.action === "terms") {
              requireThat(
                o.paid === 0 && o.stage === "collecting",
                "Las condiciones económicas se fijan antes del primer pago.",
              );
              o.total = int(b.total, 1000, 100000000);
              o.deposit = int(b.deposit, 0, o.total);
              o.revisionsIncluded = int(b.revisionsIncluded, 0, 20);
              o.activeDays = int(b.activeDays, 1, 1095);
              o.deliveryDays = [
                int(b.deliveryMin, 1, 60),
                int(b.deliveryMax, 1, 90),
              ];
              requireThat(
                o.deliveryDays[0] <= o.deliveryDays[1],
                "Revisa el plazo de entrega.",
              );
              o.termsConfirmed = true;
              o.termsAccepted = false;
              audit(
                o,
                "Equipo",
                "Cotización y condiciones confirmadas para aceptación del cliente.",
              );
              notify(
                o,
                "Tus condiciones están listas. Revísalas en tu espacio privado antes de pagar.",
              );
            } else if (b.action === "payment-method") {
              o.paymentInstructions = text(b.instructions, 1500);
              o.paymentUrl = text(b.url, 500);
              if (o.paymentUrl) {
                const u = new URL(o.paymentUrl);
                requireThat(
                  u.protocol === "https:" && !u.username && !u.password,
                  "Usa un enlace de pago HTTPS válido.",
                );
              }
              audit(o, "Equipo", "Instrucciones de pago actualizadas.");
            } else if (b.action === "verify-payment") {
              requireThat(
                o.total !== null &&
                  o.termsConfirmed &&
                  o.termsAccepted &&
                  o.stage !== "closed",
                "Confirma y acepta las condiciones primero.",
              );
              const amount = int(b.amount, 1, o.total - o.paid);
              const reference = text(b.reference, 150);
              requireThat(
                reference.length >= 4 && b.verified === true,
                "Verifica el movimiento en la cuenta receptora e indica su referencia.",
              );
              requireThat(
                !allOrders().some((x) =>
                  x.payments.some(
                    (p) =>
                      p.reference.toLowerCase() === reference.toLowerCase(),
                  ),
                ),
                "Esa referencia ya se registró. No dupliques el pago.",
                409,
              );
              o.payments.push({
                id: secret().slice(0, 16),
                at: now(),
                amount,
                reference,
              });
              o.paid += amount;
              o.paymentNotice = "";
              audit(
                o,
                "Equipo",
                `Ingreso verificado: ${amount} COP. Referencia: ${reference}`,
              );
              notify(
                o,
                "Tu pago fue verificado y el saldo del pedido se actualizó.",
              );
            } else if (b.action === "validate") {
              requireThat(
                o.stage === "submitted",
                "Primero el cliente debe enviar su información.",
              );
              complete(o);
              o.stage = "designing";
              o.validatedAt = now();
              audit(
                o,
                "Equipo",
                "Información validada. Comienza el plazo de diseño.",
              );
              notify(
                o,
                "Validamos la información. Comienza el plazo acordado de diseño.",
              );
            } else if (b.action === "return") {
              requireThat(
                ["submitted", "designing"].includes(o.stage),
                "Este pedido no puede devolverse en su estado actual.",
              );
              const note = text(b.note, 1500);
              requireThat(note.length >= 5, "Explica qué información falta.");
              o.stage = "collecting";
              o.approvedRevision = null;
              audit(o, "Equipo", `Información por completar: ${note}`);
              notify(o, `Necesitamos completar información: ${note}`);
            } else if (b.action === "review") {
              requireThat(
                o.stage === "designing",
                "Valida la información antes de enviar a revisión.",
              );
              complete(o);
              o.stage = "review";
              o.reviewRevision = o.revision;
              audit(o, "Equipo", `Versión ${o.revision} enviada a revisión.`);
              notify(
                o,
                "Tu invitación está lista para revisar. Puedes aprobarla o solicitar ajustes.",
              );
            } else if (b.action === "publish") {
              requireThat(
                o.stage === "approved" &&
                  o.approvedRevision === o.revision &&
                  o.total !== null &&
                  o.paid === o.total &&
                  o.termsAccepted,
                "Para publicar necesitas la versión aprobada y el pago completo.",
              );
              complete(o);
              o.published = {
                id: o.id,
                modelId: o.modelId,
                category: o.category,
                brief: structuredClone(o.brief),
              };
              if (
                !o.publishedAt &&
                !db
                  .prepare("SELECT id FROM guests WHERE order_id=? LIMIT 1")
                  .get(o.id)
              ) {
                const slugName = o.brief.names
                  .filter(Boolean)
                  .join("-y-")
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
                  .slice(0, 60);
                o.slug = `${slugName || "evento"}-${o.id.slice(0, 12)}`;
              }
              o.stage = "published";
              o.publishedAt = now();
              o.expiresAt = new Date(
                Date.parse(o.brief.date) + o.activeDays * 86400000,
              ).toISOString();
              audit(
                o,
                "Equipo",
                "Invitación publicada. Enlace de invitados disponible.",
              );
              notify(
                o,
                `Tu invitación está lista: ${origin}/i/${o.slug}\nCompártela con tus invitados. Las confirmaciones aparecerán en tu espacio privado.`,
              );
            } else if (b.action === "reopen") {
              requireThat(
                ["approved", "published", "review"].includes(o.stage),
                "Este pedido no puede reabrirse ahora.",
              );
              o.stage = "designing";
              o.approvedRevision = null;
              audit(
                o,
                "Equipo",
                "Diseño reabierto. Se requerirá una nueva aprobación para publicar cambios.",
              );
            } else if (b.action === "close") {
              requireThat(
                text(b.note, 1000).length >= 5,
                "Escribe el motivo de cierre.",
              );
              o.stage = "closed";
              o.publishedAt = null;
              audit(o, "Equipo", `Pedido cerrado: ${text(b.note, 1000)}`);
            } else if (b.action === "extend-revisions") {
              o.revisionsIncluded = int(
                b.revisionsIncluded,
                o.revisionsUsed,
                20,
              );
              audit(
                o,
                "Equipo",
                `Rondas de ajustes disponibles: ${o.revisionsIncluded}.`,
              );
            } else {
              requireThat(false, "Acción desconocida.");
            }
          } else {
            requireThat(false, "Ruta no disponible.", 404);
          }
          save(o);
        });
        return json(res, sanitized(o));
      }
      if (path[0] === "admin") {
        admin(req);
        if (!write && path.length === 1)
          return json(res, {
            orders: allOrders().map(sanitized),
            leads: (
              db
                .prepare("SELECT * FROM leads ORDER BY created_at DESC")
                .all() as any[]
            ).map((r) => ({ ...r, data: JSON.parse(r.data) })),
            outbox: db
              .prepare(
                "SELECT id,recipient,subject,status,error,created_at FROM outbox ORDER BY created_at DESC LIMIT 50",
              )
              .all(),
            config: config(),
          });
        requireThat(write, "Ruta no disponible.", 404);
        const b = await body(req);
        if (path[1] === "link") {
          const o = load(text(b.id));
          const token = secret();
          transaction(() => {
            o.accessHash = hash(token);
            db.prepare("DELETE FROM sessions WHERE order_id=?").run(o.id);
            audit(
              o,
              "Equipo",
              "Enlace privado renovado; accesos anteriores revocados.",
            );
            save(o);
          });
          return json(res, { path: `/pedido/${o.id}#acceso=${token}` });
        }
        if (path[1] === "lead") {
          db.prepare("UPDATE leads SET resolved=1 WHERE id=?").run(text(b.id));
          return json(res, { ok: true });
        }
        if (path[1] === "retry-email") {
          db.prepare(
            "UPDATE outbox SET status='pending',attempts=0 WHERE id=? AND status='failed'",
          ).run(text(b.id));
          return json(res, { ok: true });
        }
      }
      if (path[0] === "media" && !write) {
        const file = db
          .prepare("SELECT * FROM media WHERE id=?")
          .get(path[1]) as any;
        requireThat(file, "Imagen no disponible.", 404);
        const o = load(file.order_id);
        const publicPhoto =
          isActive(o) &&
          o.published!.brief.photos.includes(`/api/media/${file.id}`);
        const canReadPublic =
          publicPhoto &&
          (!o.published!.brief.privateGuests ||
            guestAccess(o.id, url.searchParams.get("invitado") || ""));
        if (!canReadPublic) owner(req, o.id);
        res.setHeader("Content-Type", file.mime);
        res.setHeader("Content-Security-Policy", "default-src 'none'");
        return res.end(readFileSync(resolve(directory, "uploads", file.id)));
      }
      if (path[0] === "invitations") {
        const o = pub(path[1]);
        const guestToken = url.searchParams.get("invitado") || "";
        const invited = guestAccess(o.id, guestToken);
        requireThat(
          !guestToken || invited,
          "Este enlace de invitado ya no es válido.",
          404,
        );
        requireThat(
          !o.published!.brief.privateGuests || invited,
          "Necesitas tu enlace personal para abrir esta invitación.",
          404,
        );
        if (!write && path.length === 2) {
          const result = structuredClone(o.published!);
          if (invited) {
            result.guest = {
              name: invited.name,
              maxCompanions: invited.companions,
            };
            result.brief.maxCompanions = invited.companions;
          }
          if (result.brief.privateGuests)
            result.brief.photos = result.brief.photos.map(
              (p) => `${p}?invitado=${guestToken}`,
            );
          return json(res, result);
        }
        requireThat(write, "Ruta no disponible.", 404);
        rate(req, `guest-${o.id}`, 60);
        const b = await body(req);
        requireThat(
          b.consent === true && !b.website,
          "Autoriza el envío de tu respuesta a los organizadores.",
        );
        if (path[2] === "rsvp") {
          const data = {
            name: invited ? invited.name : text(b.name, 100),
            attending: text(b.attending),
            companions: b.companions,
            children: b.children,
            dietary: text(b.dietary, 300),
            transport: text(b.transport, 10),
            comments: text(b.comments, 1000),
          };
          requireThat(
            Object.keys(
              validateRsvp(
                data,
                invited ? invited.companions : o.published!.brief.maxCompanions,
              ),
            ).length === 0,
            "Revisa tu nombre, asistencia y número de acompañantes.",
          );
          requireThat(
            ["yes", "no"].includes(data.transport),
            "Revisa la opción de transporte.",
          );
          if (data.attending === "no")
            Object.assign(data, {
              companions: 0,
              children: 0,
              dietary: "",
              transport: "no",
            });
          let visitor = invited
            ? hash(`invited:${invited.id}`)
            : cookie(req, `siempre_guest_${o.id}`);
          if (!/^[a-f0-9]{64}$/.test(visitor)) visitor = secret();
          const previous = db
            .prepare(
              "SELECT id FROM responses WHERE order_id=? AND visitor_hash=?",
            )
            .get(o.id, hash(visitor)) as any;
          const id = previous?.id || secret().slice(0, 24);
          db.prepare("INSERT OR REPLACE INTO responses VALUES (?,?,?,?)").run(
            id,
            o.id,
            hash(visitor),
            JSON.stringify({ ...data, id, updatedAt: now() }),
          );
          res.setHeader(
            "Set-Cookie",
            `siempre_guest_${o.id}=${visitor}; Path=/api/invitations/${o.slug}; HttpOnly; SameSite=Strict; Max-Age=31536000${production ? "; Secure" : ""}`,
          );
          return json(res, { ok: true });
        }
        if (path[2] === "song") {
          const song = text(b.song, 120);
          requireThat(song.length >= 2, "Escribe el nombre de la canción.");
          db.prepare("INSERT INTO songs VALUES (?,?,?)").run(
            secret().slice(0, 24),
            o.id,
            JSON.stringify({
              song,
              artist: text(b.artist, 120),
              createdAt: now(),
            }),
          );
          return json(res, { ok: true });
        }
      }
      requireThat(false, "Ruta no disponible.", 404);
    } catch (error: any) {
      const status = error.status || 500;
      if (status === 500) console.error("API error:", error.message);
      if (!res.headersSent)
        json(
          res,
          {
            error:
              status === 500
                ? "No pudimos completar la operación. Intenta nuevamente."
                : error.message,
          },
          status,
        );
    }
  }
  let sending = false;
  async function flushEmails() {
    if (sending || !config().emailConfigured) return;
    sending = true;
    try {
      const pending = db
        .prepare(
          "SELECT * FROM outbox WHERE status='pending' AND attempts<3 ORDER BY created_at LIMIT 5",
        )
        .all() as any[];
      for (const email of pending) {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": email.id,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: [email.recipient],
              subject: email.subject,
              text: email.body,
            }),
            signal: AbortSignal.timeout(10000),
          });
          requireThat(
            response.ok,
            `Proveedor de correo: HTTP ${response.status}`,
          );
          db.prepare(
            "UPDATE outbox SET status='sent',attempts=attempts+1,error=NULL WHERE id=?",
          ).run(email.id);
        } catch (e: any) {
          db.prepare(
            "UPDATE outbox SET status='failed',attempts=attempts+1,error=? WHERE id=?",
          ).run(text(e.message, 200), email.id);
        }
      }
    } finally {
      sending = false;
    }
  }
  const timer = setInterval(() => {
    void flushEmails();
    db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
    db.prepare("DELETE FROM rate_limits WHERE until<?").run(Date.now());
  }, 30000);
  timer.unref();
  return {
    handler,
    db,
    directory,
    flushEmails,
    publicInvitation: (slug: string, token = "") => {
      try {
        const o = pub(slug);
        return o.published!.brief.privateGuests && !guestAccess(o.id, token)
          ? null
          : o.published;
      } catch {
        return null;
      }
    },
    close: () => {
      clearInterval(timer);
      db.close();
    },
  };
}
