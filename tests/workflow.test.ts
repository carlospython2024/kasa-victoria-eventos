import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApplication } from "../server/app.ts";

async function environment(t: any) {
  const directory = mkdtempSync(join(tmpdir(), "siempre-flow-"));
  const app = createApplication({ directory, production: false });
  const server = createServer(app.handler);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  t.after(async () => {
    await new Promise<void>((r) => server.close(() => r()));
    app.close();
    rmSync(directory, { recursive: true, force: true });
  });
  function client() {
    const jar = new Map<string, string>();
    return async (path: string, body?: any, override: any = {}) => {
      const res = await fetch(origin + "/api" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
          ...override,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      for (const entry of res.headers.getSetCookie()) {
        const [key, value] = entry.split(";")[0].split("=");
        jar.set(key, value);
      }
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      return { status: res.status, data, headers: res.headers };
    };
  }
  return { app, origin, client };
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
    env.app.db.prepare("SELECT count(*) AS n FROM audit").get()!.n > 10,
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

test("persistencia del almacenamiento al reiniciar la aplicación", async () => {
  const directory = mkdtempSync(join(tmpdir(), "siempre-persistence-"));
  try {
    const first = createApplication({ directory });
    first.db.prepare("INSERT INTO settings VALUES (?,?)").run("persist", "ok");
    first.close();
    const second = createApplication({ directory });
    assert.equal(
      (
        second.db
          .prepare("SELECT value FROM settings WHERE key='persist'")
          .get() as any
      ).value,
      "ok",
    );
    second.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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
    (env.app.db.prepare("SELECT data FROM orders WHERE id=?").get(id) as any)
      .data,
  );
  stored.expiresAt = "2000-01-01T00:00:00Z";
  env.app.db
    .prepare("UPDATE orders SET data=? WHERE id=?")
    .run(JSON.stringify(stored), id);
  assert.equal((await guest(`/invitations/${o.slug}${query}`)).status, 404);
});
