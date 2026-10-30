import test from "node:test";
import assert from "node:assert/strict";
import { business } from "../src/config";
import { models } from "../src/data";
import { celebrations } from "../src/celebrations";
import { seoTags } from "../src/seo";
import {
  pricing,
  publicOrigin,
  proposalMessage,
  proposalUrl,
  whatsappUrl,
  validateContact,
  validateRsvp,
  countdown,
} from "../src/logic";
test("metadatos iniciales tienen URLs públicas absolutas solo con dominio configurado", () => {
  const route = {
    path: "/propuesta/bodas-colombia",
    title: 'Propuesta "Bodas"',
    description: "Diseños & celebración",
  };
  const local = seoTags(route, "");
  assert.ok(local.includes("noindex"));
  assert.ok(!local.includes('og:image"'));
  const hosted = seoTags(route, "https://invitaciones.example.com");
  assert.ok(
    hosted.includes(
      'href="https://invitaciones.example.com/propuesta/bodas-colombia"',
    ),
  );
  assert.ok(
    hosted.includes(
      'content="https://invitaciones.example.com/assets/propuesta-bodas-preview.png"',
    ),
  );
  assert.ok(hosted.includes("Propuesta &quot;Bodas&quot;"));
  assert.ok(hosted.includes("Diseños &amp; celebración"));
  assert.ok(!hosted.includes("noindex"));
});

test("catálogo: 10 bodas y exactamente una opción para cada celebración adicional", () => {
  assert.equal(models.length, 10);
  assert.equal(celebrations.length, 5);
  assert.equal(new Set([...models, ...celebrations].map((x) => x.id)).size, 15);
  assert.deepEqual(
    celebrations.map((c) => c.category),
    ["16 años", "Primera comunión", "Grado", "Infantil", "Baby shower"],
  );
});
test("precio promocional y anticipo consistentes", () => {
  const p = pricing(business);
  assert.equal(p.amount, 130500);
  assert.equal(p.deposit, 130500);
  assert.equal(p.balance, 0);
  const installment = pricing({ ...business, depositPercent: 50 });
  assert.equal(installment.deposit, 65250);
  assert.equal(installment.balance, 65250);
  assert.equal(p.promotion, true);
});
test("promoción vencida y fecha inválida dejan de aplicarse", () => {
  for (const date of ["2020-01-01T00:00:00Z", "not-a-date"]) {
    const p = pricing(
      { ...business, promotionExpiresAt: date },
      new Date("2026-10-26"),
    );
    assert.equal(p.amount, 163000);
    assert.equal(p.promotion, false);
  }
});
test("no presenta ahorro cuando el precio promocional no es menor", () => {
  for (const p of [undefined, 163000, 180000])
    assert.equal(
      pricing({ ...business, promotionalPrice: p }).promotion,
      false,
    );
});
test("sin vencimiento la promoción permanece configurable, nunca inventa una fecha", () => {
  assert.equal(
    pricing(
      { ...business, promotionExpiresAt: undefined },
      new Date("2099-01-01"),
    ).promotion,
    true,
  );
});
test("no se comparten direcciones locales", () => {
  for (const u of [
    "",
    "http://localhost:5173",
    "https://localhost",
    "https://127.0.0.1",
    "https://192.168.1.4",
    "https://test.local",
    "http://example.com",
  ]) {
    assert.equal(publicOrigin(u), null);
    assert.equal(proposalUrl("rosa", u), null);
    assert.equal(proposalMessage("Rosa", "rosa", u), null);
  }
});
test("enlace público conserva el modelo y WhatsApp codifica el mensaje", () => {
  const domain = "https://invitaciones.example.com";
  const url = proposalUrl("jardin-botanico", domain)!;
  assert.equal(new URL(url).searchParams.get("modelo"), "jardin-botanico");
  const msg = proposalMessage("Jardín botánico", "jardin-botanico", domain)!;
  assert.ok(msg.includes("Jardín botánico"));
  assert.ok(msg.includes("COP"));
  const wa = new URL(whatsappUrl(msg, "573001234567"));
  assert.equal(wa.searchParams.get("text"), msg);
  assert.equal(wa.pathname, "/573001234567");
});
test("contacto valida cada campo, incluyendo un correo incorrecto", () => {
  assert.equal(
    Object.keys(
      validateContact({ name: "", phone: "abc", email: "bad", event: "x" }),
    ).length,
    4,
  );
  assert.deepEqual(
    validateContact({
      name: "Carla",
      phone: "+57 300 123 4567",
      email: "carla@example.com",
      event: "Mi boda será en junio.",
    }),
    {},
  );
});
test("RSVP limita acompañantes y niños incluidos en los cupos", () => {
  const base = {
    name: "Valentina",
    attending: "yes",
    companions: 2,
    children: 1,
    dietary: "",
    transport: "no",
    comments: "",
  };
  assert.deepEqual(validateRsvp(base), {});
  assert.ok(validateRsvp({ ...base, companions: 3 }).companions);
  assert.ok(validateRsvp({ ...base, children: 3 }).children);
  assert.ok(validateRsvp({ ...base, companions: 1.5 }).companions);
  assert.deepEqual(
    validateRsvp({ ...base, attending: "no", companions: 99, children: 99 }),
    {},
  );
});
test("contador nunca resulta negativo y cambia de día correctamente", () => {
  assert.deepEqual(
    countdown(
      "2027-06-18T16:00:00-05:00",
      Date.parse("2027-06-17T16:00:00-05:00"),
    ),
    [1, 0, 0, 0],
  );
  assert.deepEqual(countdown("2020-01-01", Date.now()), [0, 0, 0, 0]);
});
