import React, { useEffect, useState } from "react";
import {
  type Celebration as CelebrationData,
  celebrations,
} from "./celebrations";
import { Icon, SectionHeading } from "./components";
import { countdown } from "./logic";
import { useInvitation } from "./workflow/runtime";
import { LiveRsvp } from "./workflow/live";

export function CelebrationCover({
  event,
  compact = false,
}: {
  event: CelebrationData;
  compact?: boolean;
}) {
  const date = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(event.date));
  const NameTag = compact ? "div" : "h1";
  return (
    <div
      className={`celebration-cover celebration-${event.id} ${compact ? "celebration-compact" : ""}`}
      style={
        {
          "--event-bg": event.background,
          "--event-ink": event.ink,
          "--event-accent": event.accent,
        } as React.CSSProperties
      }
    >
      <div className="celebration-ornaments" aria-hidden="true">
        <span>✦</span>
        <span>✧</span>
        <span>✦</span>
        <span>✧</span>
      </div>
      <span className="celebration-eyebrow">
        {event.category.toUpperCase()}
      </span>
      <div className="celebration-symbol">
        <Icon name={event.icon} size={compact ? 36 : 66} />
      </div>
      {event.number && (
        <span className="celebration-number">{event.number}</span>
      )}
      <NameTag className="celebration-name">{event.name}</NameTag>
      <p className="celebration-headline">{event.headline}</p>
      {["primera-comunion", "baby-shower"].includes(event.id) && (
        <img
          className="celebration-botanical"
          src={`/assets/${event.id === "primera-comunion" ? "magnolia" : "botanical"}.png`}
          alt=""
          loading={compact ? "lazy" : "eager"}
        />
      )}
      {event.id === "infantil" && (
        <div className="balloons" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      <div className="celebration-date">
        <span>{date}</span>
        <span>
          {event.time} · {event.location}
        </span>
      </div>
      {!compact && (
        <a className="event-button" href="#confirmacion">
          Confirmar asistencia <Icon name="ArrowRight" size={17} />
        </a>
      )}
    </div>
  );
}
export function CelebrationCatalog() {
  return (
    <section className="celebration-catalog section" id="celebraciones">
      <div className="container wide">
        <SectionHeading
          title="Cada ocasión merece su invitación"
          text="Cinco celebraciones más. Un diseño especial para cada una."
        />
        <div className="celebration-grid">
          {celebrations.map((event) => (
            <article key={event.id}>
              <h3>{event.category}</h3>
              <a
                className="event-preview"
                href={`/celebraciones/${event.id}`}
                aria-label={`Ver diseño de ${event.category}`}
              >
                <CelebrationCover event={event} compact />
              </a>
              <p>{event.design}</p>
              <a
                className="button button-yellow"
                href={`/celebraciones/${event.id}`}
              >
                Ver ejemplo <Icon name="ArrowUpRight" size={14} />
              </a>
              <a className="text-link" href={`/crear?modelo=${event.id}`}>
                Consultar este diseño
              </a>
            </article>
          ))}
        </div>
        <p className="section-footnote">
          Estas celebraciones tienen condiciones propias. Consulta
          disponibilidad y precio; la propuesta de bodas no se aplica
          automáticamente.
        </p>
      </div>
    </section>
  );
}

function EventRsvp({ event }: { event: CelebrationData }) {
  const key = `siempre-event-${event.id}-v1`;
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [guests, setGuests] = useState(1);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const x = JSON.parse(raw);
        if (
          typeof x.name === "string" &&
          ["yes", "no"].includes(x.answer) &&
          Number.isInteger(x.guests) &&
          x.guests >= 0 &&
          x.guests <= event.maxGuests
        ) {
          setName(x.name);
          setAnswer(x.answer);
          setGuests(x.guests || 1);
          setComments(typeof x.comments === "string" ? x.comments : "");
          setStatus("Recuperamos tu respuesta guardada en este navegador.");
        }
      }
    } catch {}
  }, [key, event.maxGuests]);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (!["yes", "no"].includes(answer))
      next.answer = "Selecciona una respuesta.";
    if (
      answer === "yes" &&
      (!Number.isInteger(guests) || guests < 1 || guests > event.maxGuests)
    )
      next.guests = `Elige entre 1 y ${event.maxGuests} asistentes en total.`;
    setErrors(next);
    if (Object.keys(next).length) {
      const form = e.currentTarget;
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          name: name.trim(),
          answer,
          guests: answer === "yes" ? guests : 0,
          comments,
        }),
      );
      setStatus(
        "Respuesta guardada únicamente en este navegador. Es una demostración: no se envió a los organizadores.",
      );
    } catch {
      setStatus(
        "No se pudo guardar la respuesta en este navegador. No se envió ningún dato.",
      );
    }
  }
  return (
    <form className="event-rsvp" onSubmit={submit} noValidate>
      <label>
        Tu nombre
        <input
          value={name}
          maxLength={100}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "event-name-error" : undefined}
        />
        {errors.name && (
          <span className="field-error" id="event-name-error">
            {errors.name}
          </span>
        )}
      </label>
      <label>
        ¿Nos acompañas?
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          aria-invalid={!!errors.answer}
          aria-describedby={errors.answer ? "event-answer-error" : undefined}
        >
          <option value="">Selecciona una opción</option>
          <option value="yes">Sí, allí estaré</option>
          <option value="no">No podré asistir</option>
        </select>
        {errors.answer && (
          <span className="field-error" id="event-answer-error">
            {errors.answer}
          </span>
        )}
      </label>
      {answer === "yes" && (
        <label>
          Asistentes en total, incluyéndote
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            aria-invalid={!!errors.guests}
            aria-describedby={errors.guests ? "event-guests-error" : undefined}
          >
            {Array.from({ length: event.maxGuests }, (_, i) => (
              <option value={i + 1} key={i}>
                {i + 1}
              </option>
            ))}
          </select>
          {errors.guests && (
            <span className="field-error" id="event-guests-error">
              {errors.guests}
            </span>
          )}
        </label>
      )}
      <label>
        Comentarios <small>(opcional)</small>
        <textarea
          rows={3}
          value={comments}
          maxLength={1000}
          onChange={(e) => setComments(e.target.value)}
        />
      </label>
      <button type="submit" className="event-button">
        Guardar respuesta <Icon name="Check" size={17} />
      </button>
      <p className="local-notice">
        Demostración local. No hay envío ni sincronización de datos.
      </p>
      {status && (
        <p className="rsvp-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
export function CelebrationInvitation({ event }: { event: CelebrationData }) {
  const { live } = useInvitation();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const values = now === null ? [0, 0, 0, 0] : countdown(event.date, now);
  return (
    <main
      className={`event-page event-${event.id}`}
      style={
        {
          "--event-bg": event.background,
          "--event-ink": event.ink,
          "--event-accent": event.accent,
        } as React.CSSProperties
      }
    >
      {!live && (
        <div className="invitation-toolbar">
          <a href="/#celebraciones">
            <Icon name="ArrowLeft" size={15} /> Celebraciones
          </a>
          <span>DEMO · {event.design}</span>
          <a href={`/crear?modelo=${event.id}`}>
            Consultar diseño <Icon name="ArrowUpRight" size={15} />
          </a>
        </div>
      )}
      <div className="event-sheet">
        <CelebrationCover event={event} />
        <section className="event-section-content">
          <span className="eyebrow">ESTÁS INVITADO</span>
          <h2>{event.headline}</h2>
          <p>{event.intro}</p>
          <div className="countdown">
            {values.map((v, i) => (
              <div key={i}>
                <strong>{String(v).padStart(2, "0")}</strong>
                <span>{["días", "horas", "minutos", "segundos"][i]}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="event-section-content event-place">
          <Icon name="MapPin" size={37} />
          <h2>Nos vemos aquí.</h2>
          <p>
            {event.location}
            <br />
            {event.time}
          </p>
          {!live && (
            <p className="local-notice">
              Evento ficticio. El lugar exacto se personaliza al contratar.
            </p>
          )}
          <a
            className="event-button event-outline"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ver ciudad en el mapa <Icon name="ArrowUpRight" size={16} />
          </a>
        </section>
        <section className="event-section-content" id="confirmacion">
          <span className="eyebrow">GUARDAMOS TU LUGAR</span>
          <h2>¿Vienes a celebrar?</h2>
          <p>Confirma tu asistencia para preparar cada detalle.</p>
          {live ? <LiveRsvp /> : <EventRsvp event={event} />}
        </section>
        <section className="event-section-content event-details">
          <Icon name={event.icon} size={40} />
          <h2>Para disfrutar juntos.</h2>
          <h3>Vestimenta</h3>
          <p>{event.dress}</p>
          <h3>Un detalle importante</h3>
          <p>{event.note}</p>
        </section>
        {live && (
          <section className="event-section-content">
            {live.brief.photos.length > 0 && (
              <div className="couple-gallery">
                {live.brief.photos.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Recuerdo ${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            {[
              ["Hospedaje", live.brief.lodging],
              ["Menú", live.brief.menu],
              ["Transporte", live.brief.transportInfo],
              ["Compartamos recuerdos", live.brief.social],
            ]
              .filter(([, v]) => v)
              .map(([title, value]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{value}</p>
                </div>
              ))}
          </section>
        )}
        <footer className="event-footer">
          <p>{event.name}</p>
          <span>
            {event.category} · {event.design}
          </span>
          {!live && (
            <>
              <a href={`/crear?modelo=${event.id}`}>
                Quiero una invitación así <Icon name="ArrowUpRight" size={16} />
              </a>
              <small>Personas y evento ficticios · demostración local</small>
            </>
          )}
        </footer>
      </div>
    </main>
  );
}
