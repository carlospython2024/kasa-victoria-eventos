import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, createReadStream } from "node:fs";
import { resolve, sep } from "node:path";
import { createApplication } from "./app.ts";
const app = createApplication();
const root = resolve("dist");
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (x) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        x
      ]!,
  );
const types: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript",
  css: "text/css",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  woff2: "font/woff2",
  mp3: "audio/mpeg",
  txt: "text/plain",
};
createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; media-src 'self'; frame-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
  );
  void app.handler(req, res, () => {
    if (!["GET", "HEAD"].includes(req.method || "")) {
      res.statusCode = 405;
      return res.end();
    }
    let path: string;
    try {
      path = decodeURIComponent(
        new URL(req.url || "/", "http://local").pathname,
      );
    } catch {
      res.statusCode = 400;
      return res.end();
    }
    let file = resolve(root, "." + path);
    if (!file.startsWith(root + sep) && file !== root) {
      res.statusCode = 404;
      return res.end();
    }
    if (existsSync(file) && statSync(file).isDirectory())
      file = resolve(file, "index.html");
    if (!existsSync(file) || !statSync(file).isFile()) {
      if (!/^\/(pedido|gestion|crear|vista|i|privacidad)(\/|$)/.test(path)) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.end(
          '<h1>Página no encontrada</h1><a href="/">Ir al inicio</a>',
        );
      }
      let html = readFileSync(resolve(root, "workflow.html"), "utf8");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      if (path.startsWith("/i/")) {
        const invitation = app.publicInvitation(
          path.split("/")[2],
          new URL(req.url || "/", "http://local").searchParams.get(
            "invitado",
          ) || "",
        );
        if (!invitation) res.statusCode = 404;
        else {
          const title = `${invitation.brief.names.filter(Boolean).join(" & ")} · Te esperamos`;
          const description = `Celebremos juntos en ${invitation.brief.city}. Consulta los detalles y confirma tu asistencia.`;
          html = html
            .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
            .replace(
              "</head>",
              `<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${invitation.brief.photos[0] ? `<meta property="og:image" content="${escape((process.env.PUBLIC_ORIGIN || "") + invitation.brief.photos[0])}">` : ""}</head>`,
            );
        }
      }
      res.setHeader("Content-Type", types.html);
      return res.end(req.method === "HEAD" ? undefined : html);
    }
    const size = statSync(file).size;
    res.setHeader(
      "Content-Type",
      types[file.split(".").pop() || ""] || "application/octet-stream",
    );
    res.setHeader(
      "Cache-Control",
      file.endsWith(".html") ? "no-cache" : "public, max-age=3600",
    );
    res.setHeader("Accept-Ranges", "bytes");
    let start = 0,
      end = size - 1;
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!match) {
        res.statusCode = 416;
        res.setHeader("Content-Range", `bytes */${size}`);
        return res.end();
      }
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : end;
      if (start > end || start >= size) {
        res.statusCode = 416;
        return res.end();
      }
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    res.setHeader("Content-Length", end - start + 1);
    if (req.method === "HEAD") return res.end();
    createReadStream(file, { start, end }).pipe(res);
  });
}).listen(
  Number(process.env.PORT || 4173),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Siempre: http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 4173}`,
    ),
);
