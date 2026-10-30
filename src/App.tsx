import React, { useState } from "react";
import { site } from "./config";
import { findModel, models, type Model } from "./data";
import {
  Brand,
  Button,
  ContactForm,
  Icon,
  InvitationCover,
  Modal,
} from "./components";
import { Home } from "./Home";
import { Proposal } from "./Proposal";
import { Invitation } from "./Invitation";
import { whatsappUrl } from "./logic";
import { findCelebration } from "./celebrations";
import { CelebrationInvitation } from "./Celebration";

import { Workflow } from "./workflow/Workflow";

type Overlay =
  | { type: "menu" | "country" | "whatsapp" }
  | { type: "contact"; modelName?: string }
  | { type: "model"; model: Model }
  | null;
export function App({
  path = "/",
  search = "",
}: {
  path?: string;
  search?: string;
}) {
  const query = new URLSearchParams(search);
  const consultation = findCelebration(query.get("consulta") || "");
  const [overlay, setOverlay] = useState<Overlay>(
    consultation
      ? {
          type: "contact",
          modelName: `${consultation.category} · ${consultation.design}`,
        }
      : null,
  );
  const proposal = path.replace(/\/$/, "") === site.proposalPath;
  const contact = (modelName?: string) =>
    setOverlay({ type: "contact", modelName });
  function whatsapp() {
    if (site.whatsapp)
      window.open(
        whatsappUrl(
          `Hola, me gustaría conocer las invitaciones de boda de ${site.name}.`,
          site.whatsapp,
        ),
        "_blank",
        "noopener,noreferrer",
      );
    else setOverlay({ type: "whatsapp" });
  }
  if (/^\/(crear|pedido|gestion|vista|i|privacidad)(\/|$)/.test(path))
    return <Workflow path={path.replace(/\/$/, "")} search={search} />;
  if (path.startsWith("/demo/")) {
    const id = path.split("/")[2];
    const model =
      findModel(id === "boda" ? query.get("modelo") : id) ||
      (id === "boda" ? models[2] : undefined);
    return model ? (
      <Invitation model={model} embedded={query.get("embed") === "1"} />
    ) : (
      <main className="not-found">
        <Brand dark />
        <h1>No encontramos ese diseño.</h1>
        <p>Los diez modelos disponibles te esperan en el catálogo.</p>
        <a className="button" href="/#modelos">
          Ver diseños
        </a>
      </main>
    );
  }
  if (path.startsWith("/celebraciones/")) {
    const event = findCelebration(path.split("/")[2]);
    if (event) return <CelebrationInvitation event={event} />;
  }
  if (path !== "/" && !proposal)
    return (
      <main className="not-found">
        <Brand dark />
        <h1>Esta página no está disponible.</h1>
        <a href="/" className="button">
          Volver al inicio
        </a>
      </main>
    );
  const nav = [
    ["inicio", "Inicio"],
    ["modelos", "Matrimonio"],
    ["celebraciones", "Otras celebraciones"],
    ["caracteristicas", "¿Qué incluyen?"],
    ["proceso", "¿Cómo obtenerla?"],
    ["beneficios", "Ventajas"],
    ["novedades", "Novedades"],
  ];
  return (
    <>
      <a className="skip-link" href={proposal ? "#inicio" : "#main"}>
        Ir al contenido
      </a>
      <button
        className="menu-toggle"
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        aria-expanded={overlay?.type === "menu"}
        onClick={() => setOverlay({ type: "menu" })}
      >
        <span />
        <span />
        <span />
      </button>
      {proposal ? (
        <Proposal
          selectedId={query.get("modelo") || undefined}
          contact={contact}
        />
      ) : (
        <main id="main">
          <Home
            contact={() => contact()}
            details={(model) => setOverlay({ type: "model", model })}
          />
        </main>
      )}
      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <Brand dark />
            <p>{site.tagline}</p>
          </div>
          <div className="footer-contacts">
            <button onClick={whatsapp}>
              <Icon name="MessageCircle" size={18} />
              WhatsApp
            </button>
            {site.email ? (
              <a href={`mailto:${site.email}`}>
                <Icon name="Mail" size={18} />
                {site.email}
              </a>
            ) : (
              <button onClick={() => contact()}>
                <Icon name="Mail" size={18} />
                Escríbenos
              </button>
            )}
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noreferrer">
                <Icon name="Instagram" size={18} />
                Instagram
              </a>
            )}
            {site.facebook && (
              <a href={site.facebook} target="_blank" rel="noreferrer">
                <Icon name="Facebook" size={18} />
                Facebook
              </a>
            )}
          </div>
          <button
            className="country-button"
            onClick={() => setOverlay({ type: "country" })}
          >
            <span>🇨🇴</span> Colombia <Icon name="ChevronDown" size={15} />
          </button>
        </div>
        <div className="container copyright">
          <span>
            © {new Date().getFullYear()} {site.name}. Invitaciones digitales.
          </span>
          <span>
            <a href="/gestion">Gestión</a> ·{" "}
            <a href="/privacidad">Privacidad</a>
          </span>
        </div>
      </footer>
      {!proposal && (
        <a className="floating-demo" href="/demo/jardin-botanico">
          <span>Explora la demo</span>
          <span aria-hidden="true">♡</span>
        </a>
      )}
      <button
        className="floating-whatsapp"
        onClick={whatsapp}
        aria-label="Contactar por WhatsApp"
      >
        <Icon name="MessageCircle" size={29} />
      </button>
      {overlay?.type === "menu" && (
        <Modal
          title="Navegación principal"
          full
          onClose={() => setOverlay(null)}
          className="navigation-modal"
        >
          <Brand />
          <nav aria-label="Navegación principal">
            {nav.map(([id, label]) => (
              <a
                href={`/${id === "inicio" ? "" : `#${id}`}`}
                onClick={() => setOverlay(null)}
                key={id}
              >
                {label}
              </a>
            ))}
            <button onClick={() => contact()}>Contacto</button>
          </nav>
          <div className="menu-bottom">
            <button onClick={() => setOverlay({ type: "country" })}>
              🇨🇴 Colombia <Icon name="ChevronDown" size={18} />
            </button>
            <a href={site.proposalPath}>
              Consultar propuesta <Icon name="ArrowUpRight" size={18} />
            </a>
          </div>
        </Modal>
      )}
      {overlay?.type === "contact" && (
        <Modal
          title={
            consultation ? "Hablemos de tu celebración" : "Hablemos de su boda"
          }
          onClose={() => setOverlay(null)}
          className="contact-modal"
        >
          <ContactForm modelName={overlay.modelName} />
        </Modal>
      )}
      {overlay?.type === "country" && (
        <Modal title="Selecciona tu país" onClose={() => setOverlay(null)}>
          <p>
            Esta propuesta está preparada para Colombia, con valores en pesos
            colombianos.
          </p>
          <button className="country-option" onClick={() => setOverlay(null)}>
            🇨🇴 Colombia <Icon name="Check" size={20} />
          </button>
          <p className="form-note">
            Otros países estarán disponibles cuando se configuren sus
            condiciones comerciales.
          </p>
        </Modal>
      )}
      {overlay?.type === "whatsapp" && (
        <Modal title="Conversemos pronto" onClose={() => setOverlay(null)}>
          <Icon name="MessageCircle" size={45} />
          <p>
            El número de WhatsApp de Siempre está pendiente de configuración.
            Puedes contactarnos mediante el formulario.
          </p>
          <Button onClick={() => contact()}>Abrir formulario</Button>
        </Modal>
      )}
      {overlay?.type === "model" && (
        <Modal
          title={overlay.model.name}
          onClose={() => setOverlay(null)}
          className="model-modal"
        >
          <div className="model-detail">
            <div className="detail-preview">
              <InvitationCover model={overlay.model} compact action={false} />
            </div>
            <div>
              <span className="eyebrow">{overlay.model.family}</span>
              <p>{overlay.model.description}</p>
              <p>
                Personalizamos nombres, fotografías, fecha e información del
                evento. La demostración permite probar la asistencia y las
                sugerencias musicales.
              </p>
              <a className="button button-yellow" href={overlay.model.demo}>
                Ver demostración <Icon name="ArrowUpRight" size={16} />
              </a>
              <a className="button" href={`/crear?modelo=${overlay.model.id}`}>
                Quiero este diseño
              </a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
