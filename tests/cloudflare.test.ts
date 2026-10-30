// Runs the original workflow scenarios against the actual Workers runtime, D1 and R2.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";
const schema = readFileSync(
  new URL("../migrations/0001_initial.sql", import.meta.url),
  "utf8",
);
async function environment(t: any, origin = "https://review.example") {
  const mf = new Miniflare({
    modules: true,
    scriptPath: "worker-dist/index.js",
    compatibilityDate: "2026-08-01",
    compatibilityFlags: ["nodejs_compat"],
    d1Databases: ["DB"],
    r2Buckets: ["MEDIA"],
    bindings: {
      PUBLIC_ORIGIN: origin,
      ADMIN_SETUP_TOKEN: "review-setup-token",
    },
    assets: {
      directory: "dist",
      binding: "ASSETS",
      routerConfig: {
        invoke_user_worker_ahead_of_assets: true,
        has_user_worker: true,
      },
      assetConfig: {
        html_handling: "auto-trailing-slash",
        not_found_handling: "404-page",
      },
    },
  });
  t.after(() => mf.dispose());
  const db = await mf.getD1Database("DB");
  await db.batch(
    schema
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => db.prepare(s)),
  );
  function client() {
    const jar = new Map<string, string>();
    return async (path: string, body?: any, override: any = {}) => {
      const res = await mf.dispatchFetch(origin + "/api" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "),
          "CF-Connecting-IP": "192.0.2.10",
          ...override,
        },
        body:
          body === undefined
            ? undefined
            : JSON.stringify(
                path === "/auth/setup"
                  ? {
                      ...body,
                      setupToken: body.setupToken ?? "review-setup-token",
                    }
                  : body,
              ),
      });
      for (const entry of res.headers.getSetCookie()) {
        const [key, value] = entry.split(";")[0].split("=");
        jar.set(key, value);
      }
      const raw = await res.text();
      if (res.status >= 500) console.error(raw.slice(0, 5000));
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
      return { status: res.status, data, headers: res.headers };
    };
  }
  return {
    mf,
    rawDb: db,
    origin,
    client,
    app: {
      db: {
        prepare: (sql: string) => ({
          get: (...v: any[]) =>
            db
              .prepare(sql)
              .bind(...v)
              .first(),
          run: (...v: any[]) =>
            db
              .prepare(sql)
              .bind(...v)
              .run(),
        }),
      },
    },
  };
}
const request = {
  name: "Cliente de prueba",
  email: "cliente@example.test",
  phone: "+573000000000",
  modelId: "jardin-botanico",
  activeDays: 180,
  consent: true,
};
const terms = {
  action: "terms",
  total: 130500,
  deposit: 130500,
  revisionsIncluded: 2,
  activeDays: 180,
  deliveryMin: 3,
  deliveryMax: 5,
};
const image =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=";
test("pedido completo: datos, Nequi verificado, revisión, publicación, respuestas y revocación", async (t) => {
  const env = await environment(t);
  const admin = env.client(),
    customer = env.client(),
    guest = env.client(),
    outsider = env.client();
  assert.equal(
    (await admin("/auth/setup", { password: "Una clave de prueba larga" }))
      .status,
    200,
  );
  assert.equal((await outsider("/admin")).status, 401);
  const created = await customer("/orders", request);
  assert.equal(created.status, 201);
  const id = created.data.id;
  let order = (await customer(`/orders/${id}`)).data;
  assert.equal(order.activeDays, 180);
  assert.equal(order.deposit, 130500);
  assert.equal(order.accessHash, undefined);
  assert.equal((await outsider(`/orders/${id}`)).status, 401);
  assert.equal((await outsider(`/orders/${id}/preview`)).status, 401);
  assert.equal(
    (
      await customer(`/orders/${id}/admin`, {
        version: order.version,
        action: "publish",
      })
    ).status,
    401,
  );
  assert.equal(
    (await customer(`/orders/${id}/submit`, { version: order.version })).status,
    400,
  );
  order = (
    await admin(`/orders/${id}/admin`, { version: order.version, ...terms })
  ).data;
  order = (
    await customer(`/orders/${id}/accept-terms`, { version: order.version })
  ).data;
  order = (
    await customer(`/orders/${id}/payment-notice`, {
      version: order.version,
      reference: "130500 COP · comprobante cliente",
    })
  ).data;
  assert.equal(order.paid, 0, "reportar pago no acredita dinero");
  assert.equal(
    (await customer(`/orders/${id}/submit`, { version: order.version })).status,
    400,
  );
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "verify-payment",
      amount: 130500,
      reference: "NEQUI-0001",
      verified: true,
    })
  ).data;
  assert.equal(order.paid, 130500);
  assert.equal(
    (
      await admin(`/orders/${id}/admin`, {
        version: order.version,
        action: "publish",
      })
    ).status,
    400,
  );
  const media = await customer(`/orders/${id}/upload`, { data: image });
  assert.equal(media.status, 201);
  assert.equal((await outsider(media.data.url.slice(4))).status, 401);
  const brief = {
    ...order.brief,
    names: ["Lucía", "Andrés"],
    date: "2030-06-18T16:00:00-05:00",
    city: "Bogotá, Colombia",
    ceremony: {
      place: "Jardín",
      address: "Calle 10 # 20-30",
      time: "4:00 p. m.",
    },
    photos: [media.data.url],
    story: "Una historia propia",
  };
  order = (
    await customer(`/orders/${id}/brief`, { version: order.version, brief })
  ).data;
  assert.equal(
    (await customer(`/orders/${id}/brief`, { version: 0, brief })).status,
    409,
  );
  assert.equal((await guest(`/invitations/${order.slug}`)).status, 404);
  order = (await customer(`/orders/${id}/submit`, { version: order.version }))
    .data;
  assert.equal(order.stage, "submitted");
  assert.equal(
    (await customer(`/orders/${id}/brief`, { version: order.version, brief }))
      .status,
    409,
  );
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "validate",
    })
  ).data;
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "review",
    })
  ).data;
  order = (
    await customer(`/orders/${id}/changes`, {
      version: order.version,
      note: "Cambiar el mensaje de bienvenida",
    })
  ).data;
  assert.equal(order.revisionsUsed, 1);
  assert.equal(order.stage, "designing");
  order = (
    await admin(`/orders/${id}/brief`, {
      version: order.version,
      brief: { ...brief, story: "Historia revisada" },
    })
  ).data;
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "review",
    })
  ).data;
  order = (await customer(`/orders/${id}/approve`, { version: order.version }))
    .data;
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "publish",
    })
  ).data;
  assert.equal(order.stage, "published");
  const publicData = (await guest(`/invitations/${order.slug}`)).data;
  assert.equal(publicData.brief.names[0], "Lucía");
  assert.equal(publicData.contact, undefined);
  assert.equal(publicData.payments, undefined);
  assert.equal((await outsider(media.data.url.slice(4))).status, 200);
  const rsvp = {
    name: "=Una invitada",
    attending: "yes",
    companions: 1,
    children: 0,
    dietary: "Vegetariana",
    transport: "no",
    comments: "Nos vemos",
    consent: true,
  };
  assert.equal(
    (
      await guest(`/invitations/${order.slug}/rsvp`, {
        ...rsvp,
        companions: 25,
      })
    ).status,
    400,
  );
  assert.equal(
    (await guest(`/invitations/${order.slug}/rsvp`, rsvp)).status,
    200,
  );
  assert.equal(
    (await guest(`/invitations/${order.slug}/rsvp`, { ...rsvp, companions: 2 }))
      .status,
    200,
  );
  const results = (await customer(`/orders/${id}/responses`)).data;
  assert.equal(results.responses.length, 1);
  assert.equal(results.responses[0].companions, 2);
  assert.equal((await outsider(`/orders/${id}/responses`)).status, 401);
  assert.ok(
    (await customer(`/orders/${id}/responses?format=csv`)).data.includes(
      "'=Una invitada",
    ),
  );
  assert.equal(
    (
      await guest(`/invitations/${order.slug}/song`, {
        song: "Nuestra canción",
        artist: "Artista",
        consent: true,
      })
    ).status,
    200,
  );
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "reopen",
    })
  ).data;
  order = (
    await admin(`/orders/${id}/brief`, {
      version: order.version,
      brief: { ...brief, names: ["Cambio pendiente", "Andrés"] },
    })
  ).data;
  assert.equal(
    (await guest(`/invitations/${order.slug}`)).data.brief.names[0],
    "Lucía",
    "la edición no modifica la versión publicada",
  );
  assert.equal(
    (
      await admin(`/orders/${id}/admin`, {
        version: order.version,
        action: "publish",
      })
    ).status,
    400,
  );
  const newLink = await admin("/admin/link", { id });
  assert.equal(newLink.status, 200);
  assert.equal((await customer(`/orders/${id}`)).status, 401);
  assert.equal(
    (await customer("/auth/redeem", { id, token: created.data.token })).status,
    401,
  );
  const token = newLink.data.path.split("acceso=")[1];
  assert.equal((await customer("/auth/redeem", { id, token })).status, 200);
  order = (await admin(`/orders/${id}`)).data;
  order = (
    await admin(`/orders/${id}/admin`, {
      version: order.version,
      action: "close",
      note: "Cierre solicitado por el cliente",
    })
  ).data;
  assert.equal((await guest(`/invitations/${order.slug}`)).status, 404);
  assert.equal((await outsider(media.data.url.slice(4))).status, 401);
  assert.ok(
    (await env.app.db.prepare("SELECT count(*) AS n FROM audit").get())!.n > 10,
  );
});
test("protecciones: CSRF, otros pedidos, fotos, cotización de celebraciones y validación de contacto", async (t) => {
  const env = await environment(t);
  const admin = env.client(),
    a = env.client(),
    b = env.client();
  assert.equal(
    (
      await admin(
        "/auth/setup",
        { password: "Otra clave larga de prueba" },
        { Origin: "https://otro.example" },
      )
    ).status,
    403,
  );
  await admin("/auth/setup", { password: "Otra clave larga de prueba" });
  assert.equal(
    (await admin("/auth/setup", { password: "Otra clave larga de prueba" }))
      .status,
    409,
  );
  const first = (await a("/orders", request)).data;
  const second = (await b("/orders", { ...request, modelId: "baby-shower" }))
    .data;
  const secondOrder = (await b(`/orders/${second.id}`)).data;
  assert.equal(secondOrder.total, null);
  assert.equal((await b(`/orders/${first.id}`)).status, 401);
  assert.equal(
    (
      await a(`/orders/${first.id}/upload`, {
        data: Buffer.from("<svg onload=alert(1)></svg>").toString("base64"),
      })
    ).status,
    400,
  );
  const imageA = (await a(`/orders/${first.id}/upload`, { data: image })).data;
  assert.equal(
    (
      await b(`/orders/${second.id}/brief`, {
        version: secondOrder.version,
        brief: { ...secondOrder.brief, photos: [imageA.url] },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a("/contact", {
        ...request,
        event: "Quiero información de las invitaciones",
        consent: false,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a("/contact", {
        ...request,
        event: "Quiero información de las invitaciones",
      })
    ).status,
    201,
  );
  assert.equal((await admin("/admin")).data.leads.length, 1);
  assert.equal(
    (
      await a(`/orders/${first.id}/brief`, {
        version: 1,
        brief: {
          ...secondOrder.brief,
          music: "https://evil.example/audio.mp3",
        },
      })
    ).status,
    400,
  );
});
test("anticipo configurable, saldo, enlaces personales, cupos y acceso privado", async (t) => {
  const env = await environment(t);
  const admin = env.client(),
    customer = env.client(),
    guest = env.client();
  await admin("/auth/setup", { password: "Prueba privada de invitaciones" });
  const created = (await customer("/orders", request)).data;
  const id = created.id;
  let o = (await customer(`/orders/${id}`)).data;
  o = (
    await admin(`/orders/${id}/admin`, {
      version: o.version,
      ...terms,
      deposit: 65000,
    })
  ).data;
  assert.equal(
    (await admin(`/orders/${id}/accept-terms`, { version: o.version })).status,
    403,
  );
  o = (await customer(`/orders/${id}/accept-terms`, { version: o.version }))
    .data;
  o = (
    await admin(`/orders/${id}/admin`, {
      version: o.version,
      action: "verify-payment",
      amount: 65000,
      reference: "NEQUI-A",
      verified: true,
    })
  ).data;
  assert.equal(
    (
      await admin(`/orders/${id}/admin`, {
        version: o.version,
        action: "verify-payment",
        amount: 65500,
        reference: "NEQUI-A",
        verified: true,
      })
    ).status,
    409,
  );
  const photo = (await customer(`/orders/${id}/upload`, { data: image })).data
    .url;
  o = (
    await customer(`/orders/${id}/brief`, {
      version: o.version,
      brief: {
        ...o.brief,
        names: ["Lina", "Pablo"],
        date: "2030-07-01T15:00:00-05:00",
        city: "Bogotá",
        ceremony: { place: "Jardín", address: "Calle 1", time: "3 pm" },
        photos: [photo],
        privateGuests: true,
      },
    })
  ).data;
  o = (await customer(`/orders/${id}/submit`, { version: o.version })).data;
  o = (
    await admin(`/orders/${id}/admin`, {
      version: o.version,
      action: "validate",
    })
  ).data;
  o = (
    await admin(`/orders/${id}/admin`, { version: o.version, action: "review" })
  ).data;
  assert.equal(
    (await admin(`/orders/${id}/approve`, { version: o.version })).status,
    403,
  );
  o = (await customer(`/orders/${id}/approve`, { version: o.version })).data;
  assert.equal(
    (
      await admin(`/orders/${id}/admin`, {
        version: o.version,
        action: "publish",
      })
    ).status,
    400,
  );
  o = (
    await admin(`/orders/${id}/admin`, {
      version: o.version,
      action: "verify-payment",
      amount: 65500,
      reference: "NEQUI-B",
      verified: true,
    })
  ).data;
  o = (
    await admin(`/orders/${id}/admin`, {
      version: o.version,
      action: "publish",
    })
  ).data;
  assert.match(o.slug, /lina-y-pablo-/);
  assert.equal((await guest(`/invitations/${o.slug}`)).status, 404);
  assert.equal((await guest(photo.slice(4))).status, 401);
  const link = (
    await customer(`/orders/${id}/guests`, {
      name: "Familia Pérez",
      companions: 1,
    })
  ).data.path;
  const query = link.slice(link.indexOf("?"));
  const personal = (await guest(`/invitations/${o.slug}${query}`)).data;
  assert.equal(personal.guest.name, "Familia Pérez");
  assert.equal(personal.brief.maxCompanions, 1);
  assert.equal((await guest(personal.brief.photos[0].slice(4))).status, 200);
  const reply = {
    name: "Otro nombre",
    attending: "yes",
    companions: 2,
    children: 0,
    dietary: "",
    transport: "no",
    comments: "",
    consent: true,
  };
  assert.equal(
    (await guest(`/invitations/${o.slug}/rsvp${query}`, reply)).status,
    400,
  );
  assert.equal(
    (
      await guest(`/invitations/${o.slug}/rsvp${query}`, {
        ...reply,
        companions: 1,
      })
    ).status,
    200,
  );
  const otherDevice = env.client();
  await otherDevice(`/invitations/${o.slug}/rsvp${query}`, {
    ...reply,
    companions: 0,
  });
  const replies = (await customer(`/orders/${id}/responses`)).data.responses;
  assert.equal(replies.length, 1);
  assert.equal(replies[0].name, "Familia Pérez");
  assert.equal(replies[0].companions, 0);
  const list = (await customer(`/orders/${id}/guests`)).data;
  await customer(`/orders/${id}/guests`, { action: "revoke", id: list[0].id });
  assert.equal((await guest(`/invitations/${o.slug}${query}`)).status, 404);
  assert.equal((await guest(personal.brief.photos[0].slice(4))).status, 401);
  // Expired invitations also reject direct API access.
  const stored = JSON.parse(
    (
      (await env.app.db
        .prepare("SELECT data FROM orders WHERE id=?")
        .get(id)) as any
    ).data,
  );
  stored.expiresAt = "2000-01-01T00:00:00Z";
  await env.app.db
    .prepare("UPDATE orders SET data=? WHERE id=?")
    .run(JSON.stringify(stored), id);
  assert.equal((await guest(`/invitations/${o.slug}${query}`)).status, 404);
});

test("D1: cambios simultáneos conservan una sola versión y revierten auditoría", async (t) => {
  const env = await environment(t),
    customer = env.client();
  const created = (await customer("/orders", request)).data;
  const before = (await customer(`/orders/${created.id}`)).data;
  const write = (story: string) =>
    customer(`/orders/${created.id}/brief`, {
      version: before.version,
      brief: { ...before.brief, story },
    });
  const results = await Promise.all([
    write("Versión uno"),
    write("Versión dos"),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const after = (await customer(`/orders/${created.id}`)).data;
  assert.equal(after.version, before.version + 1);
  assert.equal(after.timeline.length, before.timeline.length + 1);
  assert.equal(
    (await env.rawDb
      .prepare("SELECT count(*) n FROM audit WHERE order_id=?")
      .bind(created.id)
      .first())!.n,
    2,
  );
});

test("Workers: login, cookies, límite de intentos y rutas HTML", async (t) => {
  const env = await environment(t),
    admin = env.client();
  assert.equal(
    (
      await admin("/auth/setup", {
        password: "Contraseña nueva de revisión",
        setupToken: "incorrecto",
      })
    ).status,
    403,
  );
  assert.equal(
    (await admin("/auth/setup", { password: "Contraseña nueva de revisión" }))
      .status,
    200,
  );
  assert.match(
    (
      await admin("/auth/login", { password: "Contraseña nueva de revisión" })
    ).headers.get("set-cookie")!,
    /HttpOnly; SameSite=Strict; Max-Age=43200; Secure/,
  );
  assert.equal((await admin("/auth/logout", {})).status, 200);
  assert.equal((await admin("/admin")).status, 401);
  assert.equal(
    (await admin("/auth/login", { password: "incorrecta" })).status,
    401,
  );
  for (let i = 0; i < 11; i++)
    await admin("/auth/login", { password: "incorrecta" });
  assert.equal(
    (await admin("/auth/login", { password: "incorrecta" })).status,
    429,
  );
  assert.equal(
    (await env.mf.dispatchFetch(env.origin + "/gestion")).status,
    200,
  );
  const invalid = await env.mf.dispatchFetch(env.origin + "/i/no-existe");
  assert.equal(invalid.status, 404);
  assert.equal(invalid.headers.get("cache-control"), "no-store");
  const head = await env.mf.dispatchFetch(env.origin + "/api/health", {
    method: "HEAD",
  });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(
    (await env.mf.dispatchFetch(env.origin + "/api/missing")).status,
    404,
  );
  assert.equal(
    (await env.mf.dispatchFetch(env.origin + "/missing")).status,
    404,
  );
  const home = await env.mf.dispatchFetch(env.origin + "/");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /invitaci/i);
});

test("D1: una referencia Nequi simultánea solo acredita un pedido", async (t) => {
  const env = await environment(t),
    admin = env.client();
  await admin("/auth/setup", { password: "Contraseña de prueba de pagos" });
  async function ready() {
    const customer = env.client();
    const { id } = (await customer("/orders", request)).data;
    let order = (await customer(`/orders/${id}`)).data;
    order = (
      await admin(`/orders/${id}/admin`, { version: order.version, ...terms })
    ).data;
    order = (
      await customer(`/orders/${id}/accept-terms`, { version: order.version })
    ).data;
    return order;
  }
  const first = await ready(),
    second = await ready();
  const results = await Promise.all(
    [first, second].map((order) =>
      admin(`/orders/${order.id}/admin`, {
        version: order.version,
        action: "verify-payment",
        amount: 1000,
        reference: "NEQUI-CONCURRENT",
        verified: true,
      }),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const stored = await Promise.all(
    [first, second].map((o) => admin(`/orders/${o.id}`)),
  );
  assert.equal(
    stored.reduce((sum, r) => sum + r.data.paid, 0),
    1000,
  );
  assert.equal(
    (await env.rawDb
      .prepare("SELECT count(*) n FROM payment_references")
      .first())!.n,
    1,
  );
});

test("navegación local: 127.0.0.1 redirige a localhost conservando diseño y parámetros", async (t) => {
  const env = await environment(t, "http://localhost:8787");
  const path = "/crear?modelo=carta-de-amor";
  const response = await env.mf.dispatchFetch("http://127.0.0.1:8787" + path, {
    redirect: "manual",
  });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), env.origin + path);
  const page = await env.mf.dispatchFetch(response.headers.get("location")!);
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type")!, /text\/html/);
  const config = await env.mf.dispatchFetch(env.origin + "/api/config");
  assert.equal(config.status, 200);
  assert.equal(((await config.json()) as any).publicUrl, env.origin);
  assert.equal(
    (
      await env.client()("/orders", request, {
        Origin: "http://127.0.0.1:8787",
      })
    ).status,
    403,
  );
});
