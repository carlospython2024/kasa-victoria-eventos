import React, { useEffect, useRef, useState } from "react";
import { useInvitation } from "./workflow/runtime";
import { LiveRsvp, LiveSong } from "./workflow/live";
import { type Model } from "./data";
import { weddingMusic } from "./music";
import { Icon, InvitationCover, Modal } from "./components";
import { countdown, validateRsvp, type Rsvp } from "./logic";

function Countdown() {
  const { wedding } = useInvitation();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const values = now === null ? [0, 0, 0, 0] : countdown(wedding.date, now);
  return (
    <div className="countdown" aria-label="Tiempo hasta la boda">
      {values.map((v, i) => (
        <div key={i}>
          <strong>{String(v).padStart(2, "0")}</strong>
          <span>{["días", "horas", "minutos", "segundos"][i]}</span>
        </div>
      ))}
    </div>
  );
}
export function MusicToggle({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const player = audio.current;
    if (player) player.volume = 0.35;
    return () => {
      player?.pause();
    };
  }, []);
  async function toggle() {
    const player = audio.current;
    if (!player) return;
    setUnavailable(false);
    if (!player.paused) {
      player.pause();
      return;
    }
    try {
      await player.play();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setUnavailable(true);
      }
    }
  }
  return (
    <>
      <audio
        ref={audio}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setUnavailable(true);
        }}
      />
      <button
        className="music-toggle"
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Escuchar música"}
        aria-pressed={playing}
        title={playing ? "Pausar música" : "Escuchar música"}
      >
        <Icon name={playing ? "Pause" : "Music2"} size={18} />
      </button>
      {unavailable && (
        <p className="audio-error" role="status">
          No pudimos reproducir la música. Pulsa el botón para volver a
          intentar.
        </p>
      )}
    </>
  );
}

function RsvpForm() {
  const { wedding } = useInvitation();
  const initial: Rsvp = {
    name: "",
    attending: "",
    companions: 0,
    children: 0,
    dietary: "",
    transport: "no",
    comments: "",
  };
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(wedding.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.name === "string" &&
          Object.keys(validateRsvp(parsed)).length === 0
        ) {
          setData({ ...initial, ...parsed });
          setStatus(
            "Recuperamos tu respuesta guardada en este navegador. Puedes actualizarla.",
          );
        }
      }
    } catch {
      /* Storage may be unavailable; submission reports failures. */
    }
  }, []);
  function update(key: keyof Rsvp, value: string | number) {
    setData((d) => ({ ...d, [key]: value }));
    setStatus("");
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateRsvp(data);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const normalized = {
      ...data,
      ...(data.attending === "no"
        ? { companions: 0, children: 0, dietary: "", transport: "no" }
        : {}),
    };
    try {
      localStorage.setItem(wedding.storageKey, JSON.stringify(normalized));
      setData(normalized);
      setStatus(
        "¡Respuesta guardada en este navegador! Esta es una demostración: no se envió a la pareja ni se sincronizó con otros dispositivos.",
      );
    } catch {
      setStatus(
        "No pudimos guardar la respuesta. El almacenamiento local está deshabilitado o lleno. No se envió ningún dato.",
      );
    }
  }
  function error(key: string) {
    return errors[key] ? (
      <span className="field-error" id={`rsvp-error-${key}`}>
        {errors[key]}
      </span>
    ) : null;
  }
  const valid = (key: string) => ({
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `rsvp-error-${key}` : undefined,
  });
  return (
    <form ref={form} onSubmit={submit} className="rsvp-form" noValidate>
      <label>
        Tu nombre
        <input
          value={data.name}
          autoComplete="name"
          maxLength={100}
          onChange={(e) => update("name", e.target.value)}
          {...valid("name")}
        />
        {error("name")}
      </label>
      <label>
        ¿Nos acompañas?
        <select
          value={data.attending}
          onChange={(e) => update("attending", e.target.value)}
          {...valid("attending")}
        >
          <option value="">Selecciona una opción</option>
          <option value="yes">Sí, allí estaré</option>
          <option value="no">Esta vez no podré asistir</option>
        </select>
        {error("attending")}
      </label>
      {data.attending === "yes" && (
        <>
          <label>
            Acompañantes{" "}
            <small>(máximo {wedding.maxCompanions}, además de ti)</small>
            <select
              value={data.companions}
              onChange={(e) => update("companions", Number(e.target.value))}
              {...valid("companions")}
            >
              {Array.from({ length: wedding.maxCompanions + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            {error("companions")}
          </label>
          {wedding.rsvpFields.children && (
            <label>
              ¿Cuántos de tus acompañantes son niños?
              <input
                type="number"
                min={0}
                max={data.companions}
                step={1}
                value={data.children}
                onChange={(e) => update("children", Number(e.target.value))}
                {...valid("children")}
              />
              {error("children")}
            </label>
          )}
          {wedding.rsvpFields.dietary && (
            <label>
              Restricciones alimentarias
              <input
                value={data.dietary}
                maxLength={300}
                placeholder="Alergias, vegetariano, ninguna…"
                onChange={(e) => update("dietary", e.target.value)}
              />
            </label>
          )}
          {wedding.rsvpFields.transport && (
            <label>
              ¿Necesitas transporte?
              <select
                value={data.transport}
                onChange={(e) => update("transport", e.target.value)}
              >
                <option value="no">No, gracias</option>
                <option value="yes">Sí, me interesa</option>
              </select>
            </label>
          )}
        </>
      )}
      {wedding.rsvpFields.comments && (
        <label>
          Un mensaje para nosotros <small>(opcional)</small>
          <textarea
            rows={3}
            maxLength={1000}
            value={data.comments}
            onChange={(e) => update("comments", e.target.value)}
          />
        </label>
      )}
      <button className="invite-button" type="submit">
        Guardar mi respuesta <Icon name="ArrowRight" size={16} />
      </button>
      <p className="local-notice">
        Demo local: la respuesta permanece únicamente en este navegador.
      </p>
      {status && (
        <p className="rsvp-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}

function SongForm() {
  const { wedding } = useInvitation();
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ song: string; artist: string }[]>([]);
  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem(`${wedding.storageKey}-songs`) || "[]",
      );
      if (Array.isArray(s))
        setSaved(
          s.filter(
            (x) => typeof x.song === "string" && typeof x.artist === "string",
          ),
        );
    } catch {}
  }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (song.trim().length < 2) {
      setError("Escribe el nombre de una canción.");
      return;
    }
    setError("");
    const next = [...saved, { song: song.trim(), artist: artist.trim() }].slice(
      -50,
    );
    try {
      localStorage.setItem(`${wedding.storageKey}-songs`, JSON.stringify(next));
      setSaved(next);
      setSong("");
      setArtist("");
      setStatus("Sugerencia guardada solo en este navegador.");
    } catch {
      setStatus("No fue posible guardar la canción en este navegador.");
    }
  }
  return (
    <form className="song-form" onSubmit={submit} noValidate>
      <label>
        Canción
        <input
          value={song}
          maxLength={120}
          onChange={(e) => setSong(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "song-error" : undefined}
        />
        {error && (
          <span className="field-error" id="song-error">
            {error}
          </span>
        )}
      </label>
      <label>
        Artista <small>(opcional)</small>
        <input
          value={artist}
          maxLength={120}
          onChange={(e) => setArtist(e.target.value)}
        />
      </label>
      <button type="submit" className="invite-button">
        Sugerir canción <Icon name="Music2" size={17} />
      </button>
      {status && (
        <p role="status" className="local-notice">
          {status}
        </p>
      )}
      {saved.length > 0 && (
        <div className="saved-songs">
          <p>Tus sugerencias en este navegador</p>
          <ul>
            {saved.slice(-3).map((x, i) => (
              <li key={i}>
                {x.song}
                {x.artist ? ` · ${x.artist}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export function Invitation({
  model,
  embedded = false,
}: {
  model: Model;
  embedded?: boolean;
}) {
  const { wedding, live } = useInvitation();
  const [photo, setPhoto] = useState<string | null>(null);
  const dateLabel = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full",
    timeZone: "America/Bogota",
  }).format(new Date(wedding.date));
  function calendar() {
    const start = new Date(wedding.date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(".000", "");
    const end = new Date(Date.parse(wedding.date) + 6 * 3600 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(".000", "");
    const escapeCalendar = (value: string) =>
      value
        .replaceAll("\\", "\\\\")
        .replaceAll(";", "\\;")
        .replaceAll(",", "\\,")
        .replace(/\r?\n/g, "\\n");
    const content = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Siempre//Invitaciones//ES\r\nBEGIN:VEVENT\r\nUID:${live?.id || "siempre-demo"}\r\nDTSTAMP:${start}\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${escapeCalendar(`Boda de ${wedding.names.join(" y ")}${live ? "" : " (demostración)"}`)}\r\nLOCATION:${escapeCalendar(`${wedding.ceremony.place}, ${wedding.ceremony.address}, ${wedding.city}`)}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = live ? "nuestra-boda.ics" : "boda-demo.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main
      className={`invitation invitation-${model.layout} ${embedded ? "invitation-embedded" : ""}`}
      style={
        {
          "--invite-bg": model.background,
          "--invite-ink": model.ink,
          "--invite-accent": model.accent,
        } as React.CSSProperties
      }
    >
      {!embedded && !live && (
        <div className="invitation-toolbar">
          <a href="/#modelos">
            <Icon name="ArrowLeft" size={16} /> Modelos
          </a>
          <span>DEMO · {model.name}</span>
          <a href={`/propuesta/bodas-colombia?modelo=${model.id}`}>
            Elegir este diseño <Icon name="ArrowUpRight" size={15} />
          </a>
        </div>
      )}
      <div className="invitation-sheet">
        <InvitationCover model={model} />
        {(!live || live.brief.music) && (
          <MusicToggle
            key={model.id}
            src={live ? live.brief.music : weddingMusic[model.id]}
          />
        )}
        <section className="invite-section countdown-section">
          <span className="invite-eyebrow">UN NUEVO CAPÍTULO, JUNTOS</span>
          <h2>Nos falta muy poco.</h2>
          <Countdown />
          <button className="invite-text-link" onClick={calendar}>
            <Icon name="CalendarPlus" size={18} /> Guardar la fecha
          </button>
        </section>
        <section className="invite-section guest-section">
          <span className="guest-initial">{live ? "♡" : "V"}</span>
          <span className="invite-eyebrow">ESTA INVITACIÓN ES PARA TI</span>
          <h2>
            {wedding.guestName && (
              <>
                {wedding.guestName},<br />
              </>
            )}
            <em>nos encantaría verte.</em>
          </h2>
          <p>
            Hay momentos que se vuelven inolvidables por las personas que los
            comparten. Este es uno de ellos.
          </p>
          <p className="guest-capacity">
            Tu lugar + hasta {wedding.maxCompanions} acompañantes
          </p>
        </section>
        <section id="detalles" className="invite-section event-section">
          <span className="invite-section-number">01</span>
          <span className="invite-eyebrow">{dateLabel}</span>
          <h2>El gran día.</h2>
          <div className="event-illustration" aria-hidden="true">
            <Icon name="Church" size={82} />
            <span />
            <Icon name="Trees" size={72} />
          </div>
          <div className="event-cards">
            {[wedding.ceremony, wedding.party]
              .filter((event) => !live || event.place)
              .map((event, i) => (
                <article key={event.title}>
                  <Icon name={i ? "Wine" : "HeartHandshake"} size={36} />
                  <span className="invite-eyebrow">{event.time}</span>
                  <h3>{event.title}</h3>
                  <p>{event.place}</p>
                  <small>{event.address}</small>
                  <a
                    className="invite-button invite-button-outline"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.query)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Cómo llegar <Icon name="MapPin" size={15} />
                  </a>
                </article>
              ))}
          </div>
          {!live && (
            <p className="local-notice">
              Lugares y horarios ilustrativos para esta demostración.
            </p>
          )}
        </section>
        <section className="invite-section story-section">
          <span className="invite-section-number">02</span>
          <span className="invite-eyebrow">NUESTRA HISTORIA</span>
          <h2>
            La vida es más bonita
            <br />
            <em>cuando es contigo.</em>
          </h2>
          <p>
            {live
              ? live.brief.story ||
                "Cada momento nos trajo hasta aquí. Nos encantará compartir este día contigo."
              : "De un primer encuentro a todos los días por venir. Unas cuantas imágenes de nuestro capítulo favorito."}
          </p>
          <div className="couple-gallery">
            {(live
              ? live.brief.photos
              : ["/assets/couple-garden.png", "/assets/couple-evening.png"]
            ).map((src, i) => (
              <button
                key={src}
                onClick={() => setPhoto(src)}
                aria-label={`Ampliar foto ${i + 1} de la pareja`}
              >
                <img
                  src={src}
                  alt={
                    i
                      ? "Un abrazo a la luz de las velas"
                      : "Un paseo juntos por el jardín"
                  }
                  loading="lazy"
                />
                <span>
                  {i
                    ? "Y todos los días que vendrán."
                    : "Siempre es mejor contigo."}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section id="asistencia" className="invite-section attendance-section">
          <span className="invite-section-number">03</span>
          <span className="invite-eyebrow">GUARDAMOS UN LUGAR PARA TI</span>
          <h2>¿Nos acompañas?</h2>
          <p>Tu respuesta nos ayuda a preparar un día especial para todos.</p>
          {live ? <LiveRsvp /> : <RsvpForm />}
        </section>
        <section className="invite-section party-section">
          <span className="invite-eyebrow">LOS PEQUEÑOS DETALLES</span>
          <h2>
            Una celebración
            <br />
            <em>para recordar.</em>
          </h2>
          <div className="party-details">
            <article>
              <Icon name="Shirt" size={37} />
              <h3>Vestimenta</h3>
              <p>{wedding.dressCode}</p>
            </article>
            <article>
              <Icon name="Gift" size={37} />
              <h3>Regalos</h3>
              <p>{wedding.gifts}</p>
            </article>
          </div>
          {live && (
            <div className="party-details">
              {[
                ["Hospedaje", live.brief.lodging],
                ["Menú", live.brief.menu],
                ["Transporte", live.brief.transportInfo],
                ["Compartamos recuerdos", live.brief.social],
              ]
                .filter(([, value]) => value)
                .map(([title, value]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{value}</p>
                  </article>
                ))}
            </div>
          )}
          <div className="song-section">
            <Icon name="Music2" size={36} />
            <h3>Que no falte tu canción.</h3>
            <p>Ayúdanos a preparar la banda sonora de esta noche.</p>
            {live ? <LiveSong /> : <SongForm />}
          </div>
        </section>
        <footer className="invite-footer">
          <span className="invite-eyebrow">NOS VEMOS MUY PRONTO</span>
          <p>{wedding.names.join(" & ")}</p>
          <span>Con todo nuestro amor.</span>
          {!live && (
            <small>
              Invitación de demostración · personas y evento ficticios
            </small>
          )}
          {!embedded && !live && (
            <a href={`/propuesta/bodas-colombia?modelo=${model.id}`}>
              Quiero una invitación así <Icon name="ArrowUpRight" size={16} />
            </a>
          )}
        </footer>
      </div>
      {photo && (
        <Modal
          title="Un momento de nuestra historia"
          onClose={() => setPhoto(null)}
          className="photo-modal"
        >
          <img src={photo} alt="Retrato ilustrativo de la pareja ampliado" />
        </Modal>
      )}
    </main>
  );
}
