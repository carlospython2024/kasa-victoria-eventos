import React from "react";
import { site } from "./config";
import { features, models, type Model } from "./data";
import {
  Benefits,
  Brand,
  Button,
  Icon,
  InvitationCover,
  SectionHeading,
  Wave,
} from "./components";
import { CelebrationCatalog } from "./Celebration";

export function Home({
  contact,
  details,
}: {
  contact: () => void;
  details: (model: Model) => void;
}) {
  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-photo" />
        <div className="hero-shade" />
        <div className="container hero-container">
          <header className="hero-header">
            <Brand />
          </header>
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="hero-kicker">
                Interactivas, personales e inolvidables
              </p>
              <h1>
                Invitaciones
                <br />
                digitales para
                <br />
                tu matrimonio
              </h1>
              <p className="hero-subtitle">El comienzo de su gran historia.</p>
              <div className="hero-actions">
                <Button onClick={contact}>
                  Contactar asesor <Icon name="ArrowUpRight" size={19} />
                </Button>
                <a className="button button-yellow" href="#modelos">
                  Ver modelos <Icon name="ArrowDown" size={18} />
                </a>
              </div>
              <a href={site.proposalPath} className="hero-proposal">
                Conoce nuestra propuesta <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="phone-stage">
              <div className="scroll-hint">
                ¡Explórala!
                <Icon name="ChevronsDown" size={27} />
              </div>
              <svg
                className="scroll-arrow"
                width="72"
                height="110"
                viewBox="0 0 72 110"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 3C-2 45 18 81 61 94M45 74L63 95L37 96"
                  stroke="white"
                  strokeWidth="2.4"
                />
              </svg>
              <div className="phone">
                <div className="phone-top">
                  <i />
                  <span />
                  <i />
                </div>
                <iframe
                  src="/demo/jardin-botanico?embed=1"
                  title="Invitación de demostración de Ana y Mateo, desplazable"
                />
                <div className="phone-bottom">
                  <span />
                </div>
              </div>
              <a
                className="phone-open"
                href="/demo/jardin-botanico"
                target="_blank"
                rel="noreferrer"
              >
                Abrir invitación completa <Icon name="ExternalLink" size={15} />
              </a>
              <div className="dot-pattern" />
            </div>
          </div>
        </div>
        <Wave />
      </section>

      <section id="novedades" className="news section">
        <div className="container">
          <SectionHeading
            title="Novedades"
            text="Pequeños detalles que hacen una gran diferencia."
          />
          <article className="news-card">
            <div className="news-copy">
              <span className="eyebrow pill-green">
                UNA INVITACIÓN MÁS PERSONAL
              </span>
              <h3>
                Cada invitado,
                <br />
                parte de la historia.
              </h3>
              <p>
                Una bienvenida con su nombre, sus acompañantes y toda la
                información que necesita. Porque una invitación especial empieza
                por hacer sentir especial a quien la recibe.
              </p>
            </div>
            <div className="news-art guest-art">
              <div className="mini-phone">
                <img src="/assets/magnolia.png" alt="" />
                <div className="guest-number">3</div>
                <h4>INVITADOS</h4>
                <span>Valentina Ruiz</span>
                <span>Samuel Ruiz</span>
                <span>Un acompañante</span>
                <p>
                  Este día es más bonito
                  <br />
                  si lo compartimos contigo.
                </p>
              </div>
              <span className="decor-star">✳</span>
            </div>
          </article>
          <article className="news-card">
            <div className="news-copy">
              <span className="eyebrow pill-yellow">
                RECURSOS PARA SU GRAN DÍA
              </span>
              <h3>
                Una misma esencia.
                <br />
                En cada detalle.
              </h3>
              <p>
                Invitación, menú, bienvenida y pequeños recuerdos: una identidad
                visual que acompaña la celebración. Consulta el pack opcional de
                recursos gráficos coordinados.
              </p>
            </div>
            <div className="news-art stationery-art">
              <div className="paper paper-back">
                <img src="/assets/botanical.png" alt="" />
                <span>BIENVENIDOS</span>
                <strong>
                  Ana
                  <br />
                  <i>&</i>
                  <br />
                  Mateo
                </strong>
              </div>
              <div className="paper paper-front">
                <span>GRACIAS POR</span>
                <strong>
                  ser parte
                  <br />
                  de nuestra
                  <br />
                  historia.
                </strong>
                <img src="/assets/botanical.png" alt="" />
              </div>
              <div className="paper-seal">A&M</div>
            </div>
          </article>
        </div>
      </section>

      <section id="caracteristicas" className="features section">
        <div className="container">
          <SectionHeading
            title="¿Qué incluyen?"
            text="Toda la emoción. Todos los detalles. En una invitación."
          />
          <div className="features-grid">
            {features.map(([icon, title, description]) => (
              <article className="feature" key={title}>
                <span className="illustrated-icon">
                  <Icon name={icon} size={42} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <p className="section-footnote">
            Tu espacio privado reúne datos, revisión, pagos y confirmaciones.
            Las funciones adicionales se acuerdan al confirmar la cotización.
          </p>
          <div className="center">
            <Button onClick={contact}>
              Quiero saber más <Icon name="ArrowUpRight" size={18} />
            </Button>
          </div>
        </div>
      </section>

      <section id="modelos" className="catalog section">
        <div className="container wide">
          <SectionHeading
            title="Encuentra su estilo"
            text="Diez formas distintas de decir: nos casamos."
          >
            <p className="catalog-count">
              <strong>{models.length}</strong> modelos disponibles
            </p>
          </SectionHeading>
          <div className="catalog-grid">
            {models.map((model, i) => (
              <article key={model.id} className="model-card">
                <h3>{model.name}</h3>
                <a
                  href={model.demo}
                  className="model-preview"
                  aria-label={`Ver invitación ${model.name}`}
                >
                  <InvitationCover model={model} compact action={false} />
                </a>
                <a href={model.demo} className="button button-yellow">
                  Ver ejemplo <Icon name="ArrowUpRight" size={14} />
                </a>
                <button className="text-button" onClick={() => details(model)}>
                  Más detalles
                </button>
                <span className="model-number">
                  {String(i + 1).padStart(2, "0")} / {model.family}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CelebrationCatalog />
      <section id="proceso" className="process section">
        <div className="container">
          <SectionHeading
            title="¿Cómo obtenerla?"
            text="Tres pasos para empezar a celebrar."
          />
          <div className="steps">
            {[
              ["Elige", "Encuentra el diseño que mejor cuenta su historia."],
              ["Personaliza", "Comparte sus fotos y los detalles del evento."],
              ["Comparte", "Recibe el enlace y hazlo llegar a tus invitados."],
            ].map(([title, desc], i) => (
              <article key={title}>
                <span className="step-number">{i + 1}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <p className="process-helper">
            Te acompañamos para que cada detalle tenga su lugar.
          </p>
          <div className="center action-row">
            <Button onClick={contact}>
              Contactar asesor <Icon name="ArrowUpRight" size={18} />
            </Button>
            <a className="button button-outline" href={site.proposalPath}>
              Consultar propuesta
            </a>
          </div>
        </div>
      </section>

      <section id="beneficios" className="benefits section">
        <Wave />
        <div className="container">
          <SectionHeading
            title="Mucho más que una invitación"
            text="Una forma más simple, personal y bonita de celebrar."
          />
          <Benefits />
        </div>
      </section>
    </>
  );
}
