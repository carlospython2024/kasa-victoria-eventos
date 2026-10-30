import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApplication } from "./application.ts";
import type { Env } from "./types.ts";

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function secure(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  if (!headers.has("Content-Security-Policy"))
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; media-src 'self'; frame-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
    );
  return new Response(response.body, { status: response.status, headers });
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const local =
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.PUBLIC_ORIGIN) &&
        url.origin === env.PUBLIC_ORIGIN;
      const app = createApplication({ env, production: !local });
      let response: Response;
      if (url.pathname.startsWith("/api/")) {
        const headers = Object.fromEntries(request.headers);
        // Only Cloudflare's trusted connecting IP is used, never X-Forwarded-For.
        const req = {
          url: url.pathname + url.search,
          method: request.method,
          headers,
          socket: {
            remoteAddress: local
              ? "127.0.0.1"
              : request.headers.get("CF-Connecting-IP") || "unknown",
          },
          async *[Symbol.asyncIterator]() {
            if (!request.body) return;
            const reader = request.body.getReader();
            try {
              while (true) {
                const chunk = await reader.read();
                if (chunk.done) break;
                yield Buffer.from(chunk.value);
              }
            } finally {
              reader.releaseLock();
            }
          },
        } as unknown as IncomingMessage;
        const outgoing = new Headers();
        let payload: BodyInit | null = null;
        const res = {
          statusCode: 200,
          headersSent: false,
          setHeader(name: string, value: string) {
            outgoing.set(name, value);
          },
          end(value?: BodyInit) {
            payload = value ?? null;
            this.headersSent = true;
          },
        };
        await app.handler(req, res as unknown as ServerResponse);
        response = new Response(request.method === "HEAD" ? null : payload, {
          status: res.statusCode,
          headers: outgoing,
        });
      } else if (
        /^\/(pedido|gestion|crear|vista|i|privacidad)(\/|$)/.test(url.pathname)
      ) {
        if (!["GET", "HEAD"].includes(request.method))
          return secure(new Response(null, { status: 405 }));
        const shell = await env.ASSETS.fetch(
          new Request(new URL("/workflow.html", url), { method: "GET" }),
        );
        let html = await shell.text();
        let status = shell.status;
        if (url.pathname.startsWith("/i/")) {
          const invitation = await app.publicInvitation(
            url.pathname.split("/")[2],
            url.searchParams.get("invitado") || "",
          );
          if (!invitation) status = 404;
          else {
            const title = escape(
              invitation.brief.names.filter(Boolean).join(" & ") +
                " · Te esperamos",
            );
            const description = escape(
              `Celebremos juntos en ${invitation.brief.city}. Consulta los detalles y confirma tu asistencia.`,
            );
            // Private photos require a guest token; do not leak it in share metadata.
            const photo =
              !invitation.brief.privateGuests && invitation.brief.photos[0];
            html = html
              .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
              .replace(
                "</head>",
                `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">${photo ? `<meta property="og:image" content="${escape(env.PUBLIC_ORIGIN + photo)}">` : ""}</head>`,
              );
          }
        }
        response = new Response(request.method === "HEAD" ? null : html, {
          status,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      } else response = await env.ASSETS.fetch(request);
      return secure(response);
    } catch (error) {
      console.error(
        "Worker request failed",
        error instanceof Error ? error.message : "unknown",
      );
      return secure(
        Response.json(
          { error: "Servicio no disponible. Intenta nuevamente." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        ),
      );
    }
  },
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    const app = createApplication({ env });
    ctx.waitUntil(
      (async () => {
        await app.cleanup();
        await app.flushEmails();
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
