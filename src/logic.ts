import { business, site, wedding, type BusinessConfig } from "./config";

export function pricing(config: BusinessConfig = business, now = new Date()) {
  const expiration = config.promotionExpiresAt
    ? Date.parse(config.promotionExpiresAt)
    : null;
  const active =
    config.promotionalPrice !== undefined &&
    config.promotionalPrice >= 0 &&
    config.promotionalPrice < config.regularPrice &&
    (expiration === null ||
      (Number.isFinite(expiration) && now.getTime() < expiration));
  const amount = active ? config.promotionalPrice! : config.regularPrice;
  return {
    amount,
    promotion: active,
    deposit: Math.round((amount * config.depositPercent) / 100),
    balance: amount - Math.round((amount * config.depositPercent) / 100),
  };
}
export function money(amount: number) {
  return `${new Intl.NumberFormat(business.locale, { style: "currency", currency: business.currency, maximumFractionDigits: 0 }).format(amount)} ${business.currency}`;
}
export function deliveryText() {
  return `Entre ${business.deliveryDays[0]} y ${business.deliveryDays[1]} días hábiles después de ${business.deliveryStartsWhen}.`;
}
export function publicOrigin(value: string = site.publicUrl): string | null {
  try {
    const u = new URL(value);
    const h = u.hostname.toLowerCase();
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      h === "localhost" ||
      h.endsWith(".localhost") ||
      h.endsWith(".local") ||
      h === "[::1]" ||
      /^\d+\.\d+\.\d+\.\d+$/.test(h) ||
      !h.includes(".")
    )
      return null;
    return u.origin;
  } catch {
    return null;
  }
}
export function proposalUrl(model?: string, domain = site.publicUrl) {
  const origin = publicOrigin(domain);
  if (!origin) return null;
  const url = new URL(site.proposalPath, origin);
  if (model) url.searchParams.set("modelo", model);
  return url.href;
}
export function proposalMessage(
  name?: string,
  id?: string,
  domain = site.publicUrl,
) {
  const url = proposalUrl(id, domain);
  if (!url) return null;
  return `Hola, me interesa la propuesta de boda de ${site.name}.${name ? ` Modelo: ${name}.` : ""} Valor${business.demo ? " de demostración" : ""}: ${money(pricing().amount)}. ${url}`;
}
export function whatsappUrl(message: string, phone?: string) {
  return `https://wa.me/${phone?.replace(/\D/g, "") || ""}?text=${encodeURIComponent(message)}`;
}
export type Contact = {
  name: string;
  phone: string;
  email: string;
  event: string;
};
export function validateContact(data: Contact) {
  const errors: Partial<Record<keyof Contact, string>> = {};
  if (data.name.trim().length < 2)
    errors.name = "Escribe tu nombre (al menos 2 caracteres).";
  if (
    !/^\+?[\d\s()\-]{7,25}$/.test(data.phone.trim()) ||
    data.phone.replace(/\D/g, "").length < 7
  )
    errors.phone = "Escribe un teléfono válido, con indicativo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Escribe un correo válido.";
  if (data.event.trim().length < 10)
    errors.event = "Cuéntanos un poco más (al menos 10 caracteres).";
  return errors;
}
export interface Rsvp {
  name: string;
  attending: string;
  companions: number;
  children: number;
  dietary: string;
  transport: string;
  comments: string;
}
export function validateRsvp(data: Rsvp, max = wedding.maxCompanions) {
  const errors: Record<string, string> = {};
  if (data.name.trim().length < 2) errors.name = "Escribe tu nombre completo.";
  if (!["yes", "no"].includes(data.attending))
    errors.attending = "Selecciona si podrás acompañarnos.";
  if (data.attending === "yes") {
    if (
      !Number.isInteger(data.companions) ||
      data.companions < 0 ||
      data.companions > max
    )
      errors.companions = `Puedes llevar entre 0 y ${max} acompañantes.`;
    if (
      wedding.rsvpFields.children &&
      (!Number.isInteger(data.children) ||
        data.children < 0 ||
        data.children > data.companions)
    )
      errors.children =
        "Los niños deben estar incluidos entre tus acompañantes.";
  }
  return errors;
}
export function countdown(date: string, now: number) {
  const total = Math.max(0, Math.floor((Date.parse(date) - now) / 1000));
  return [
    Math.floor(total / 86400),
    Math.floor(total / 3600) % 24,
    Math.floor(total / 60) % 60,
    total % 60,
  ];
}
