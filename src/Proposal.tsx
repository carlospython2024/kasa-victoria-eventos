import React, { useState } from "react";
import { business, reviews, site, wedding } from "./config";
import { findModel, models, features } from "./data";
import {
  Benefits,
  Brand,
  Button,
  DemoNotice,
  Icon,
  InvitationCover,
} from "./components";
import {
  deliveryText,
  money,
  pricing,
  proposalMessage,
  proposalUrl,
  whatsappUrl,
} from "./logic";

export function Proposal({
  selectedId,
  contact,
}: {
  selectedId?: string;
  contact: (modelName?: string) => void;
}) {
  const selected = findModel(selectedId);
  const model = selected || models[0];
  const price = pricing();
  const [notice, setNotice] = useState("");
  const message = proposalMessage(selected?.name, selected?.id);
  const url = proposalUrl(selected?.id);
  async function copy() {
    if (!url) {
      setNotice(
        "Configura el dominio público de Siempre para copiar un enlace compartible. No se copiará una dirección local.",
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Enlace copiado. Ya puedes compartir la propuesta.");
    } catch {
      setNotice(
        `No fue posible copiar automáticamente. Puedes copiar este enlace: ${url}`,
      );
    }
  }
  function share(askAdvisor = false) {
    if (!message) {
      setNotice(
        "El dominio público está pendiente de configuración. La propuesta se podrá compartir al publicarla.",
      );
      return;
    }
    if (askAdvisor && !site.whatsapp) {
      setNotice(
        "El número de WhatsApp del asesor está pendiente de configuración.",
      );
      return;
    }
    window.open(
      whatsappUrl(message, askAdvisor ? site.whatsapp : undefined),
      "_blank",
      "noopener,noreferrer",
    );
  }
  const faq = [
    [
      "¿Cómo se distribuye el pago?",
      `La modalidad inicial es ${business.depositPercent === 100 ? "pago completo antes de comenzar" : `anticipo del ${business.depositPercent}%`}: ${money(price.deposit)}. ${price.balance ? `El saldo de ${money(price.balance)} se verifica antes de publicar.` : ""} La cotización final se confirma en tu pedido antes del pago.`,
    ],
    ["¿Cuándo estará lista?", deliveryText()],
    [
      "¿Debo pagar por cada envío?",
      business.unlimitedDistribution
        ? "No. La propuesta contempla un pago único y distribución ilimitada del enlace."
        : "La distribución se rige por las condiciones acordadas con el asesor.",
    ],
    ["¿Quién envía las invitaciones?", business.sharedBy],
    [
      "¿Puedo elegir cualquier diseño?",
      "Sí. Esta propuesta aplica a los diez modelos del catálogo. Puedes explorar las demostraciones antes de elegir.",
    ],
    ["¿Puedo cambiar la información?", business.changesPolicy],
  ];
  return (
    <main className="brochure" id="inicio">
      <section className="brochure-hero">
        <div className="brochure-top">
          <Brand />
          <span>
            COLOMBIA{" "}
            <span className="flag" aria-hidden="true">
              🇨🇴
            </span>
          </span>
        </div>
        <span className="eyebrow proposal-label">
          INVITACIONES DIGITALES · BODAS
        </span>
        <h1>
          Una invitación
          <br />
          tan especial
          <br />
          <em>como su historia.</em>
        </h1>
        <p>
          Todos los detalles de su gran día, en una experiencia que sus
          invitados van a recordar.
        </p>
        <DemoNotice />
        <div className="proposal-offer">
          <div className="price-card">
            <span className="price-label">
              {price.promotion ? "PRECIO ESPECIAL" : "SU INVITACIÓN DIGITAL"}
            </span>
            {price.promotion && <del>{money(business.regularPrice)}</del>}
            <strong>{money(price.amount)}</strong>
            <span>Un diseño personalizado</span>
            <div className="price-divider" />
            <p>
              {business.depositPercent === 100
                ? "Pago completo"
                : `Anticipo del ${business.depositPercent}%`}
              <br />
              <b>{money(price.deposit)}</b>
            </p>
            <small>
              {business.demo
                ? "Valores de ejemplo; no constituyen una cotización confirmada."
                : "Consulta las condiciones antes de contratar."}
            </small>
          </div>
          <div className="proposal-phone">
            <InvitationCover model={model} compact action={false} />
          </div>
        </div>
        <a className="button" href={`/crear?modelo=${model.id}`}>
          Preparar mi invitación <Icon name="ArrowRight" size={17} />
        </a>
        <a className="button button-yellow" href="/#modelos">
          Explorar los modelos <Icon name="ArrowUpRight" size={17} />
        </a>
      </section>
      <section className="brochure-section conditions">
        <span className="eyebrow">CLARO DESDE EL PRINCIPIO</span>
        <h2>
          Una propuesta.
          <br />
          Todos los detalles.
        </h2>
        <p className="delivery-note">
          <Icon name="Clock3" size={25} />
          <span>{deliveryText()}</span>
        </p>
        <h3>¿Qué incluye el precio?</h3>
        <ul className="check-list">
          {business.included.map((t) => (
            <li key={t}>
              <Icon name="Check" size={18} />
              {t}
            </li>
          ))}
        </ul>
        <p>{business.sharedBy}</p>
        <div className="extra-note">
          <h3>Servicios adicionales</h3>
          {business.extras.map((extra) => (
            <p key={extra.name}>
              <strong>{extra.name}.</strong> {extra.terms}
            </p>
          ))}
        </div>
        {business.promotionExpiresAt && price.promotion && (
          <p>
            Precio especial disponible hasta{" "}
            {new Intl.DateTimeFormat("es-CO", {
              dateStyle: "long",
              timeZone: "America/Bogota",
            }).format(new Date(business.promotionExpiresAt))}
            .
          </p>
        )}
      </section>
      <section className="brochure-section selected-design">
        <span className="eyebrow">EL DISEÑO ES EL COMIENZO</span>
        <h2>{selected ? "Ya tienes un favorito." : "Encuentren el suyo."}</h2>
        {selectedId && !selected && (
          <p className="inline-notice">
            El modelo del enlace no está disponible. Puedes elegir uno del
            catálogo.
          </p>
        )}
        <div className="selected-design-row">
          <div className="selected-mini">
            <InvitationCover model={model} compact action={false} />
          </div>
          <div>
            <span className="eyebrow">
              {selected ? "MODELO SELECCIONADO" : "UNA IDEA PARA INSPIRARSE"}
            </span>
            <h3>{model.name}</h3>
            <p>{model.description}</p>
            <a className="text-link" href={model.demo}>
              Ver invitación completa <Icon name="ArrowUpRight" size={16} />
            </a>
            <a className="button button-outline" href="/#modelos">
              {selected ? "Cambiar modelo" : "Ver los diez modelos"}
            </a>
          </div>
        </div>
      </section>
      <section className="brochure-section proposal-features">
        <span className="eyebrow">UNA EXPERIENCIA COMPLETA</span>
        <h2>
          Pequeños detalles.
          <br />
          Grandes posibilidades.
        </h2>
        <div className="proposal-feature-grid">
          {features.map(([icon, title, description]) => (
            <article key={title}>
              <Icon name={icon} size={26} />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="form-note">
          Tu pedido tiene un espacio privado para revisar el diseño y consultar
          las confirmaciones. También puedes usar enlaces personales con cupos
          para cada invitado.
        </p>
      </section>
      <section className="brochure-section rsvp-explainer">
        <span className="eyebrow">CONFIRMACIÓN DE ASISTENCIA</span>
        <h2>
          Menos dudas.
          <br />
          Más tiempo para disfrutar.
        </h2>
        <p>
          Una respuesta puede contar mucho más que un “sí”. Planifiquen con la
          información que realmente necesitan.
        </p>
        <div className="rsvp-demo-card">
          <div className="rsvp-card-top">
            <Icon name="ClipboardCheck" size={30} />
            <span>UNA CONFIRMACIÓN MÁS COMPLETA</span>
          </div>
          <ul>
            {[
              "Asistencia a la celebración",
              `Acompañantes permitidos: hasta ${wedding.maxCompanions} en esta demo`,
              "Asistencia de niños, cuando corresponda",
              "Restricciones alimentarias",
              "Necesidad de transporte",
              "Comentarios adicionales",
            ].map((t) => (
              <li key={t}>
                <Icon name="Check" size={17} />
                {t}
              </li>
            ))}
          </ul>
          <a className="button" href={`${model.demo}#asistencia`}>
            Probar la confirmación <Icon name="ArrowUpRight" size={17} />
          </a>
          <p className="form-note">
            La demo guarda respuestas únicamente en este navegador. No
            sincroniza datos ni envía respuestas a la pareja.
          </p>
        </div>
      </section>
      <section className="brochure-section proposal-benefits">
        <span className="eyebrow">HECHO PARA CELEBRAR</span>
        <h2>
          Más fácil para ustedes.
          <br />
          Más especial para todos.
        </h2>
        <Benefits compact />
      </section>
      {reviews.length > 0 && (
        <section className="brochure-section">
          <h2>Historias compartidas</h2>
          {reviews
            .filter((r) => /^https:\/\//.test(r.sourceUrl))
            .map((r) => (
              <blockquote key={r.sourceUrl}>
                <p>{r.text}</p>
                <cite>
                  {r.name} ·{" "}
                  <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                    Ver fuente
                  </a>
                </cite>
              </blockquote>
            ))}
        </section>
      )}
      <section className="brochure-section faq">
        <span className="eyebrow">ANTES DE COMENZAR</span>
        <h2>Preguntas frecuentes</h2>
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <Icon name="Plus" size={19} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="brochure-section proposal-final">
        <Icon name="Heart" size={45} />
        <h2>
          Su gran día
          <br />
          empieza con un hola.
        </h2>
        <p>
          {selected
            ? `Conversemos sobre ${selected.name} y los detalles de su boda.`
            : "Estamos listos para conocer su historia."}
        </p>
        <Button secondary onClick={() => contact(selected?.name)}>
          Consultar al asesor <Icon name="ArrowUpRight" size={18} />
        </Button>
        <div className="share-actions">
          <button onClick={copy}>
            <Icon name="Copy" size={17} />
            Copiar enlace
          </button>
          <button onClick={() => share()}>
            <Icon name="Share2" size={17} />
            Compartir por WhatsApp
          </button>
          <button onClick={() => share(true)}>
            <Icon name="MessageCircle" size={17} />
            WhatsApp del asesor
          </button>
        </div>
        <p className="share-status" role="status">
          {notice ||
            (!url
              ? "El enlace público estará disponible cuando se configure el dominio del proyecto."
              : "")}
        </p>
        <a href="/" className="proposal-back">
          Volver al inicio
        </a>
      </section>
    </main>
  );
}
