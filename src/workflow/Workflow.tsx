import React, {
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { Brand, Icon, InvitationCover } from "../components";
import { CelebrationCover } from "../Celebration";
import { models, findModel } from "../data";
import { celebrations, findCelebration } from "../celebrations";
import { money, whatsappUrl } from "../logic";
import { site } from "../config";
import { api } from "./api";
import {
  stageLabels,
  type Order,
  type Brief,
  type GuestResponse,
  type Song,
  type WorkflowConfig,
} from "./types";
import { LiveInvitation } from "./live";

const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("es-CO", { dateStyle: "medium" })
    : "Por confirmar";
const durations: Record<number, string> = {
  30: "1 mes",
  90: "3 meses",
  180: "6 meses",
  365: "1 año",
};
function Status({ text }: { text: string }) {
  return text ? (
    <p className="wf-notice" role="status">
      {text}
    </p>
  ) : null;
}
function Shell({
  children,
  title,
  subtitle,
  admin = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  admin?: boolean;
}) {
  return (
    <div className="workflow">
      <header className="wf-top">
        <Brand dark />
        <nav>
          <a href="/#modelos">Ver diseños</a>
          {admin ? (
            <button
              onClick={async () => {
                await api("/auth/logout", {});
                window.location.href = "/gestion";
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <a
              href={whatsappUrl(
                "Hola, necesito ayuda con mi invitación.",
                site.whatsapp,
              )}
              target="_blank"
              rel="noreferrer"
            >
              ¿Necesitas ayuda?
            </a>
          )}
        </nav>
      </header>
      <main className="wf-main">
        <header className="wf-heading">
          <span className="eyebrow">CADA DETALLE, EN SU LUGAR</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>
        {children}
      </main>
      <footer className="wf-footer">
        <span>{site.name} · Contigo hasta el gran día</span>
        <a href="/privacidad">Privacidad y uso de datos</a>
      </footer>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength = 200,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="wf-field">
      {label}
      {type === "textarea" ? (
        <textarea
          rows={4}
          value={value}
          maxLength={maxLength}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          value={value}
          maxLength={maxLength}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function useConfig() {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<WorkflowConfig>("/config")
      .then(setConfig)
      .catch((e) => setError(e.message));
  }, []);
  return { config, error };
}
function StartOrder({ selected }: { selected: string }) {
  const { config, error } = useConfig();
  const [modelId, setModel] = useState(selected || models[0].id);
  const model = findModel(modelId),
    celebration = findCelebration(modelId);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    consent: false,
    website: "",
    activeDays: 90,
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const result = await api("/orders", { ...form, modelId });
      window.location.href = `/pedido/${result.id}#acceso=${result.token}`;
    } catch (e: any) {
      setNotice(e.message);
      setBusy(false);
    }
  }
  return (
    <Shell
      title="Su historia empieza aquí."
      subtitle="Elige tu diseño. Tendrás un espacio privado para preparar, revisar y recibir tu invitación."
    >
      <div className="wf-start-grid">
        <section className="wf-card">
          <span className="wf-kicker">01 · TU ELECCIÓN</span>
          <label className="wf-field">
            Diseño
            <select value={modelId} onChange={(e) => setModel(e.target.value)}>
              <optgroup label="Matrimonio">
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Otras celebraciones">
                {celebrations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category} · {c.design}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <div className="wf-cover">
            {model ? (
              <InvitationCover model={model} compact action={false} />
            ) : (
              celebration && <CelebrationCover event={celebration} compact />
            )}
          </div>
          <div className="wf-price">
            {model && config ? (
              <>
                <span>
                  {config.provisional ? "Valor de referencia" : "Tu invitación"}
                </span>
                <strong>{money(config.total)}</strong>
              </>
            ) : (
              <strong>Cotización personalizada</strong>
            )}
          </div>
          <p>
            Personalización, enlace para compartir y confirmaciones de invitados
            en tu espacio privado.
          </p>
          <p className="wf-muted">
            Solicitar no realiza ningún cobro. Confirmaremos valor, vigencia y
            ajustes incluidos antes del pago.
          </p>
        </section>
        <form className="wf-card" onSubmit={submit}>
          <span className="wf-kicker">02 · VAMOS A CONOCERNOS</span>
          <h2>Solo lo esencial para empezar.</h2>
          <p>
            Las fotos y los detalles del evento los puedes completar después.
          </p>
          <Field
            label="Tu nombre"
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            required
          />
          <Field
            label="Correo electrónico"
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
            type="email"
            required
          />
          <Field
            label="WhatsApp con indicativo"
            value={form.phone}
            onChange={(phone) => setForm({ ...form, phone })}
            type="tel"
            required
          />
          <label className="wf-field">
            ¿Cuánto tiempo la quieres activa después del evento?
            <select
              value={form.activeDays}
              onChange={(e) =>
                setForm({ ...form, activeDays: Number(e.target.value) })
              }
            >
              {Object.entries(durations).map(([days, label]) => (
                <option key={days} value={days}>
                  {label} después del evento
                </option>
              ))}
            </select>
            <small>
              La elección se incluirá en tu cotización. El equipo confirmará si
              cambia el valor.
            </small>
          </label>
          <input
            className="wf-honeypot"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <label className="wf-check">
            <input
              type="checkbox"
              checked={form.consent}
              required
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
            <span>
              Autorizo el uso de mis datos para gestionar esta solicitud y
              contactarme sobre ella.{" "}
              <a href="/privacidad" target="_blank" rel="noreferrer">
                Ver privacidad
              </a>
              .
            </span>
          </label>
          <button className="button" disabled={busy || !config}>
            {busy ? "Creando tu espacio…" : "Crear mi solicitud"}
            <Icon name="ArrowRight" size={18} />
          </button>
          <Status text={notice || error} />
          <p className="wf-muted">
            Acompañamiento por WhatsApp · Sin crear contraseña · Entrega de 3 a
            5 días hábiles desde la validación
          </p>
        </form>
      </div>
    </Shell>
  );
}

function BriefEditor({
  order,
  admin = false,
  save,
}: {
  order: Order;
  admin?: boolean;
  save: (brief: Brief) => Promise<void>;
}) {
  const [brief, setBrief] = useState<Brief>(order.brief);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => setBrief(order.brief), [order.version]);
  const editable =
    order.stage === "collecting" || (admin && order.stage === "designing");
  const update = <K extends keyof Brief>(key: K, value: Brief[K]) => {
    setBrief((b) => ({ ...b, [key]: value }));
    setNotice("Tienes cambios por guardar.");
  };
  async function persist(next = false) {
    setBusy(true);
    try {
      await save(brief);
      setNotice("Información guardada. Puedes continuar más tarde.");
      if (next) setStep((s) => Math.min(s + 1, 2));
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Cada fotografía debe pesar como máximo 5 MB.");
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const result = await api(`/orders/${order.id}/upload`, { data });
      update("photos", [...brief.photos, result.url].slice(0, 8));
      setNotice("Foto añadida. Guarda para conservarla en la invitación.");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="wf-card">
      <div className="wf-section-top">
        <div>
          <span className="wf-kicker">PERSONALIZACIÓN</span>
          <h2>Los detalles de su día.</h2>
        </div>
        <span className="wf-pill">
          {editable ? "Puedes editar" : "En revisión por el equipo"}
        </span>
      </div>
      <div
        className="wf-tabs"
        role="tablist"
        aria-label="Información del evento"
      >
        {["Personas y fecha", "Lugares", "Fotos y ambiente"].map((label, i) => (
          <button
            role="tab"
            aria-selected={step === i}
            key={label}
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>
      <fieldset disabled={!editable || busy} className="wf-fields">
        <div className="wf-form-grid">
          {step === 0 && (
            <>
              <Field
                label={
                  order.category === "Matrimonio"
                    ? "Nombre de la primera persona"
                    : "Nombre del protagonista"
                }
                value={brief.names[0]}
                onChange={(v) => update("names", [v, brief.names[1]])}
              />
              {order.category === "Matrimonio" && (
                <Field
                  label="Nombre de la segunda persona"
                  value={brief.names[1]}
                  onChange={(v) => update("names", [brief.names[0], v])}
                />
              )}
              <Field
                label="Fecha y hora del evento (Colombia)"
                type="datetime-local"
                value={brief.date.slice(0, 16)}
                onChange={(v) => update("date", v ? `${v}:00-05:00` : "")}
              />
              <Field
                label="Ciudad y país"
                value={brief.city}
                onChange={(v) => update("city", v)}
              />
              <label className="wf-field">
                Máximo de acompañantes por respuesta
                <select
                  value={brief.maxCompanions}
                  onChange={(e) =>
                    update("maxCompanions", Number(e.target.value))
                  }
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} acompañantes
                    </option>
                  ))}
                </select>
                <small>El invitado principal se cuenta adicionalmente.</small>
              </label>
              <div className="wf-span">
                <Field
                  label="Su historia o mensaje de bienvenida (opcional)"
                  value={brief.story}
                  onChange={(v) => update("story", v)}
                  type="textarea"
                  maxLength={1600}
                />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              {(
                [
                  "ceremony",
                  ...(order.category === "Matrimonio" ? ["party"] : []),
                ] as const
              ).map((key: any) => {
                const k = key as "ceremony" | "party";
                return (
                  <div className="wf-subcard" key={k}>
                    <h3>
                      {k === "ceremony"
                        ? order.category === "Matrimonio"
                          ? "Ceremonia"
                          : "Celebración"
                        : "Recepción (opcional)"}
                    </h3>
                    {(
                      [
                        ["place", "Nombre del lugar"],
                        ["address", "Dirección completa para el mapa"],
                        ["time", "Hora, por ejemplo 4:00 p. m."],
                      ] as const
                    ).map(([field, label]) => (
                      <Field
                        key={field}
                        label={label}
                        value={brief[k][field]}
                        onChange={(v) => update(k, { ...brief[k], [field]: v })}
                      />
                    ))}
                  </div>
                );
              })}
              <p className="wf-span wf-muted">
                Revisa la dirección: será la que abra el mapa de tus invitados.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <div className="wf-span">
                <label className="wf-field">
                  Fotografías
                  {brief.photos.length < 8 && (
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        void upload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  )}
                  <small>
                    Hasta 8 fotos · JPG, PNG o WebP · 5 MB por foto. La primera
                    será la portada de la boda.
                  </small>
                </label>
                <div className="wf-photo-grid">
                  {brief.photos.map((src, i) => (
                    <div key={src}>
                      <img src={src} alt={`Fotografía ${i + 1}`} />
                      <span>{i === 0 ? "Portada" : `Foto ${i + 1}`}</span>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "photos",
                            brief.photos.filter((_, n) => n !== i),
                          )
                        }
                      >
                        Quitar
                      </button>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            update("photos", [
                              src,
                              ...brief.photos.filter((_, n) => n !== i),
                            ])
                          }
                        >
                          Usar de portada
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Field
                label="Vestimenta (opcional)"
                value={brief.dressCode}
                onChange={(v) => update("dressCode", v)}
                type="textarea"
                maxLength={600}
              />
              <Field
                label="Regalos o detalle importante (opcional)"
                value={brief.gifts}
                onChange={(v) => update("gifts", v)}
                type="textarea"
                maxLength={600}
              />
              <label className="wf-field">
                Música
                <select
                  value={brief.music}
                  onChange={(e) => update("music", e.target.value)}
                >
                  <option value="">Sin música</option>
                  <option value="/assets/audio/atlasaudio-piano-romantic-510293.mp3">
                    Piano romántico · AtlasAudio
                  </option>
                  <option value="/assets/audio/leberch-romantic-piano-584476.mp3">
                    Piano romántico · Leberch
                  </option>
                  <option value="/assets/audio/paulyudin-romantic-piano-164822.mp3">
                    Piano romántico · PaulYudin
                  </option>
                </select>
                {brief.music && (
                  <audio controls src={brief.music} preload="none" />
                )}
              </label>
              <div className="wf-span">
                <details className="wf-details">
                  <summary>Más detalles para tus invitados (opcional)</summary>
                  <div className="wf-form-grid">
                    {(
                      [
                        ["lodging", "Hospedaje sugerido"],
                        ["menu", "Menú del evento"],
                        ["transportInfo", "Información de transporte"],
                        ["social", "Hashtag para compartir fotografías"],
                      ] as const
                    ).map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={brief[key] || ""}
                        onChange={(v) => update(key, v)}
                        type="textarea"
                        maxLength={key === "social" ? 300 : 1000}
                      />
                    ))}
                  </div>
                  <label className="wf-check">
                    <input
                      type="checkbox"
                      checked={!!brief.privateGuests}
                      onChange={(e) =>
                        update("privateGuests", e.target.checked)
                      }
                    />
                    <span>
                      Usar solo enlaces personales para invitados. Al publicar
                      generarás un enlace por invitado desde la sección
                      Invitados. El enlace general no mostrará el evento.
                    </span>
                  </label>
                </details>
              </div>
            </>
          )}
        </div>
      </fieldset>
      <Status text={notice} />
      {editable && (
        <div className="wf-actions">
          <button
            className="button"
            disabled={busy}
            onClick={() => persist(step < 2)}
          >
            {busy
              ? "Guardando…"
              : step < 2
                ? "Guardar y continuar"
                : "Guardar información"}
          </button>
          <span className="wf-muted">
            Tus datos quedan guardados en el pedido.
          </span>
        </div>
      )}
    </section>
  );
}

function GuestLinks({ order }: { order: Order }) {
  const [guests, setGuests] = useState<
    { id: string; name: string; companions: number; active: number }[]
  >([]);
  const [name, setName] = useState("");
  const [companions, setCompanions] = useState(order.brief.maxCompanions);
  const [link, setLink] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { config } = useConfig();
  async function refresh() {
    setGuests(await api(`/orders/${order.id}/guests`));
  }
  useEffect(() => {
    void refresh().catch((e) => setNotice(e.message));
  }, [order.id]);
  async function generate(id?: string) {
    setBusy(true);
    try {
      const result = await api(
        `/orders/${order.id}/guests`,
        id ? { id } : { name, companions },
      );
      setLink((config?.publicUrl || window.location.origin) + result.path);
      setName("");
      await refresh();
      setNotice(
        "Enlace creado. Cópialo antes de cerrar esta sección; renovarlo invalidará el anterior.",
      );
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!order.publishedAt) return null;
  return (
    <details className="wf-details">
      <summary>Enlaces personalizados y cupos por invitado</summary>
      <p>
        El invitado verá su nombre y tendrá sus propios cupos. Su respuesta se
        actualizará aunque use otro dispositivo.
      </p>
      {order.brief.privateGuests && (
        <p className="wf-notice">
          Esta invitación requiere un enlace personal para acceder.
        </p>
      )}
      <div className="wf-form-grid">
        <Field
          label="Nombre del invitado o familia"
          value={name}
          onChange={setName}
        />
        <Field
          label="Acompañantes adicionales"
          type="number"
          value={String(companions)}
          onChange={(v) => setCompanions(Number(v))}
        />
      </div>
      <button
        className="button"
        disabled={busy || name.trim().length < 2}
        onClick={() => generate()}
      >
        Crear enlace personal
      </button>
      <Status text={notice} />
      {link && (
        <div className="wf-payment-box">
          <a href={link} target="_blank" rel="noreferrer">
            Abrir invitación personal
          </a>
          <button
            className="text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setNotice("Enlace personal copiado.");
              } catch {
                setNotice(link);
              }
            }}
          >
            Copiar enlace personal
          </button>
          {!config?.publicUrl && (
            <p className="wf-muted">
              Este enlace solo funciona en el equipo de prueba hasta configurar
              el dominio.
            </p>
          )}
        </div>
      )}
      <ul className="wf-guest-links">
        {guests.map((g) => (
          <li key={g.id}>
            <span>
              {g.name} · +{g.companions} · {g.active ? "Activo" : "Revocado"}
            </span>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => generate(g.id)}
            >
              Renovar enlace
            </button>
            {!!g.active && (
              <button
                className="text-button"
                disabled={busy}
                onClick={async () => {
                  try {
                    await api(`/orders/${order.id}/guests`, {
                      action: "revoke",
                      id: g.id,
                    });
                    await refresh();
                    setNotice("Enlace de invitado revocado.");
                  } catch (e: any) {
                    setNotice(e.message);
                  }
                }}
              >
                Revocar
              </button>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
function Responses({ order }: { order: Order }) {
  const [data, setData] = useState<{
    responses: GuestResponse[];
    songs: Song[];
  }>({ responses: [], songs: [] });
  const [notice, setNotice] = useState("");
  async function refresh() {
    try {
      setData(await api(`/orders/${order.id}/responses`));
      setNotice("");
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  useEffect(() => {
    void refresh();
  }, [order.id]);
  const yes = data.responses.filter((r) => r.attending === "yes");
  const guests = yes.reduce((sum, r) => sum + 1 + r.companions, 0);
  return (
    <section className="wf-card">
      <GuestLinks order={order} />
      <div className="wf-section-top">
        <div>
          <span className="wf-kicker">TODO A MANO</span>
          <h2>Invitados y canciones.</h2>
        </div>
        <button className="text-button" onClick={refresh}>
          Actualizar
        </button>
      </div>
      <div className="wf-stats">
        <div>
          <strong>{guests}</strong>
          <span>Personas confirmadas</span>
        </div>
        <div>
          <strong>
            {data.responses.filter((r) => r.attending === "no").length}
          </strong>
          <span>No asistirán</span>
        </div>
        <div>
          <strong>{yes.reduce((s, r) => s + r.children, 0)}</strong>
          <span>Niños incluidos</span>
        </div>
      </div>
      <p className="wf-muted">
        Una respuesta por navegador; al reenviarla desde el mismo navegador se
        actualiza. Si una persona usa otro dispositivo puede aparecer duplicada:
        revisa los nombres antes del conteo final.
      </p>
      {data.responses.length ? (
        <>
          <a
            className="button button-yellow"
            href={`/api/orders/${order.id}/responses?format=csv`}
          >
            Descargar invitados CSV
          </a>
          <div className="wf-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invitado</th>
                  <th>Asistencia</th>
                  <th>Acompañantes</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {data.responses.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.attending === "yes" ? "Sí" : "No"}</td>
                    <td>{r.companions}</td>
                    <td>
                      {[
                        r.dietary,
                        r.transport === "yes" ? "Solicita transporte" : "",
                        r.comments,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="wf-empty">
          Las confirmaciones aparecerán aquí cuando compartas la invitación
          publicada.
        </p>
      )}
      <h3>Canciones sugeridas</h3>
      {data.songs.length ? (
        <ul>
          {data.songs.map((s, i) => (
            <li key={i}>
              {s.song}
              {s.artist && ` · ${s.artist}`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="wf-muted">Todavía no hay canciones sugeridas.</p>
      )}
      <Status text={notice} />
    </section>
  );
}

function PaymentCard({
  order,
  action,
}: {
  order: Order;
  action: (route: string, data?: any) => Promise<void>;
}) {
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function report(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await action("payment-notice", { reference });
      setNotice(
        "Aviso recibido. Verificaremos el ingreso en la cuenta de Nequi.",
      );
      setReference("");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="wf-card">
      <span className="wf-kicker">SIN SORPRESAS</span>
      <h2>Tu pedido, en números.</h2>
      <dl className="wf-summary">
        <div>
          <dt>Total {order.termsConfirmed ? "acordado" : "de referencia"}</dt>
          <dd>{order.total === null ? "Por cotizar" : money(order.total)}</dd>
        </div>
        <div>
          <dt>Pago para comenzar</dt>
          <dd>
            {order.deposit === null ? "Por confirmar" : money(order.deposit)}
          </dd>
        </div>
        <div>
          <dt>Pagos verificados</dt>
          <dd>{money(order.paid)}</dd>
        </div>
        <div>
          <dt>Saldo</dt>
          <dd>
            {order.total === null
              ? "Por confirmar"
              : money(order.total - order.paid)}
          </dd>
        </div>
        <div>
          <dt>Vigencia después del evento</dt>
          <dd>{durations[order.activeDays] || `${order.activeDays} días`}</dd>
        </div>
        <div>
          <dt>Rondas de ajustes incluidas</dt>
          <dd>{order.revisionsIncluded}</dd>
        </div>
        <div>
          <dt>Entrega desde la validación</dt>
          <dd>{order.deliveryDays.join(" a ")} días hábiles</dd>
        </div>
      </dl>
      {!order.termsConfirmed ? (
        <p className="wf-notice">
          Estamos confirmando las condiciones de tu solicitud. Mientras tanto
          puedes completar tus datos. Aún no debes pagar.
        </p>
      ) : !order.termsAccepted ? (
        <div>
          <p>
            Revisa el valor, la vigencia y los ajustes incluidos antes de
            continuar.
          </p>
          <button
            className="button"
            onClick={async () => {
              try {
                await action("accept-terms");
              } catch (e: any) {
                setNotice(e.message);
              }
            }}
          >
            Acepto estas condiciones
          </button>
        </div>
      ) : order.total !== null &&
        order.paid < order.total &&
        order.stage !== "closed" ? (
        <>
          <div className="wf-payment-box">
            <h3>Paga por Nequi</h3>
            <p>
              {order.paymentInstructions ||
                "El equipo está preparando las instrucciones de pago."}
            </p>
            <p>
              Referencia del pedido: <strong>{order.code}</strong>
            </p>
            {order.paymentUrl && (
              <a
                className="button"
                href={order.paymentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir enlace de pago
              </a>
            )}
          </div>
          <form onSubmit={report}>
            <Field
              label="¿Ya pagaste? Escribe el valor y la referencia del movimiento"
              value={reference}
              onChange={setReference}
              required
            />
            <button className="button button-yellow" disabled={busy}>
              {busy ? "Enviando…" : "Avisar que ya pagué"}
            </button>
            <small className="wf-muted">
              Este aviso no confirma el pago. El equipo comprobará el movimiento
              recibido.
            </small>
          </form>
          {order.paymentNotice && (
            <p className="wf-notice">
              Pago pendiente de verificar: {order.paymentNotice}
            </p>
          )}
        </>
      ) : (
        order.paid > 0 && (
          <p className="wf-success">
            Pago completo verificado. Gracias por confiar en nosotros.
          </p>
        )
      )}
      <Status text={notice} />
    </section>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <section className="wf-card">
      <h2>Así vamos.</h2>
      <ol className="wf-timeline">
        {order.timeline
          .slice()
          .reverse()
          .map((item, i) => (
            <li key={i}>
              <span>
                {date(item.at)} · {item.actor}
              </span>
              <p>{item.text}</p>
            </li>
          ))}
      </ol>
    </section>
  );
}

function Portal({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("datos");
  const [busy, setBusy] = useState(false);
  const [changes, setChanges] = useState("");
  const [privateLink, setPrivateLink] = useState("");
  const { config } = useConfig();
  useEffect(() => {
    (async () => {
      try {
        const token = new URLSearchParams(window.location.hash.slice(1)).get(
          "acceso",
        );
        if (token) {
          await api("/auth/redeem", { id, token });
          setPrivateLink(
            `${window.location.origin}/pedido/${id}#acceso=${token}`,
          );
          window.history.replaceState(null, "", `/pedido/${id}`);
        }
        setOrder(await api(`/orders/${id}`));
      } catch (e: any) {
        setNotice(e.message);
      }
    })();
  }, [id]);
  async function action(route: string, data = {}) {
    if (!order) return;
    const result = await api<Order>(`/orders/${id}/${route}`, {
      version: order.version,
      ...data,
    });
    setOrder(result);
  }
  async function run(route: string, data = {}) {
    setBusy(true);
    setNotice("");
    try {
      await action(route, data);
      setNotice("Listo. Tu pedido se actualizó.");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  const step =
    !order || order.stage === "collecting"
      ? 0
      : ["submitted", "designing"].includes(order.stage)
        ? 1
        : ["review", "approved"].includes(order.stage)
          ? 2
          : 3;
  const next =
    order &&
    {
      collecting: !order.termsConfirmed
        ? "Completa tus datos mientras confirmamos la cotización."
        : !order.termsAccepted
          ? "Revisa y acepta las condiciones en Pagos."
          : order.paid < (order.deposit || 0)
            ? "Realiza el pago y avísanos desde Pagos. Puedes ir completando tus datos."
            : "Completa la información y envíala al equipo.",
      submitted:
        "Recibimos tu información. El equipo revisará que esté completa.",
      designing:
        "Estamos preparando tu invitación. Te avisaremos cuando esté lista para revisar.",
      review:
        "Tu invitación está lista: revísala y aprueba o pide los ajustes que necesites.",
      approved:
        order.paid < (order.total || 0)
          ? "Tu diseño está aprobado. Completa el saldo para publicar."
          : "Todo está aprobado. El equipo ya puede publicar tu invitación.",
      published:
        "Tu invitación está lista para compartir. Aquí también verás las confirmaciones.",
      closed:
        "Este pedido está cerrado. Puedes consultar su historial o contactar al equipo.",
    }[order.stage];
  return (
    <Shell
      title={
        order
          ? `Hola, ${order.contact.name.split(" ")[0]}.`
          : "Tu espacio privado."
      }
      subtitle={
        order
          ? `${order.code} · ${order.modelName}`
          : "Abre el enlace privado que recibiste al crear tu solicitud."
      }
    >
      <Status text={notice} />
      {order && (
        <>
          <div className="wf-progress">
            {["Datos y pago", "Diseño", "Tu revisión", "A celebrar"].map(
              (label, i) => (
                <div className={i <= step ? "is-complete" : ""} key={label}>
                  <span>{i < step ? "✓" : i + 1}</span>
                  <strong>{label}</strong>
                </div>
              ),
            )}
          </div>
          <div className="wf-next">
            <span className="wf-pill">{stageLabels[order.stage]}</span>
            <h2>{next}</h2>
            {order.validatedAt && (
              <p>
                Información validada el {date(order.validatedAt)}. Plazo
                acordado: {order.deliveryDays.join(" a ")} días hábiles.
              </p>
            )}
            {privateLink && (
              <button
                className="text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(privateLink);
                    setNotice(
                      "Enlace privado copiado. Guárdalo para volver; no lo envíes a tus invitados.",
                    );
                  } catch {
                    setNotice(`Guarda este enlace privado: ${privateLink}`);
                  }
                }}
              >
                Guardar mi enlace de acceso
              </button>
            )}
            <p className="wf-muted">
              Este espacio es privado. El enlace para tus invitados se entrega
              al publicar.
              {!config?.emailConfigured &&
                " Mientras se configura el correo, conserva tu enlace de acceso."}
            </p>
          </div>
          <nav className="wf-tabs" aria-label="Secciones del pedido">
            {[
              ["datos", "Mis datos"],
              ["pagos", "Pagos"],
              ["revision", "Revisión y entrega"],
              ["invitados", "Invitados"],
              ["historial", "Historial"],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-current={tab === key ? "page" : undefined}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
            <button
              onClick={async () => {
                try {
                  setOrder(await api(`/orders/${id}`));
                  setNotice("Estado actualizado.");
                } catch (e: any) {
                  setNotice(e.message);
                }
              }}
            >
              ↻ Actualizar
            </button>
          </nav>
          {tab === "datos" && (
            <>
              <BriefEditor
                order={order}
                save={(brief) => action("brief", { brief })}
              />
              {order.stage === "collecting" && (
                <section className="wf-card wf-compact">
                  <h3>¿Ya tienes todo listo?</h3>
                  <p>
                    Guarda los datos antes de enviarlos. El equipo validará la
                    información y desde ese momento comienza el plazo de
                    entrega.
                  </p>
                  <button
                    className="button"
                    disabled={
                      busy ||
                      !order.termsAccepted ||
                      order.paid < (order.deposit ?? Infinity)
                    }
                    onClick={() => run("submit")}
                  >
                    Enviar información al equipo
                  </button>
                </section>
              )}
            </>
          )}
          {tab === "pagos" && <PaymentCard order={order} action={action} />}
          {tab === "revision" && (
            <section className="wf-card">
              <h2>Una última mirada antes de compartir.</h2>
              {["review", "approved", "published"].includes(order.stage) ? (
                <>
                  <a
                    className="button button-yellow"
                    href={`/vista/${id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir vista previa privada{" "}
                    <Icon name="ArrowUpRight" size={17} />
                  </a>
                  <p>
                    Revisa nombres, fecha, fotografías, direcciones y horarios.
                    Los formularios de la vista previa no envían respuestas.
                  </p>
                  {order.stage === "review" && (
                    <>
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => run("approve")}
                      >
                        Revisé todo y apruebo esta versión
                      </button>
                      <details className="wf-details">
                        <summary>Quiero solicitar ajustes</summary>
                        <Field
                          label="Reúne aquí todos los cambios de esta ronda"
                          value={changes}
                          onChange={setChanges}
                          type="textarea"
                          maxLength={1800}
                        />
                        <p>
                          {order.revisionsUsed} de {order.revisionsIncluded}{" "}
                          rondas utilizadas.
                        </p>
                        <button
                          className="button button-yellow"
                          disabled={
                            busy ||
                            changes.trim().length < 5 ||
                            order.revisionsUsed >= order.revisionsIncluded
                          }
                          onClick={() => run("changes", { note: changes })}
                        >
                          Enviar ajustes al equipo
                        </button>
                      </details>
                    </>
                  )}
                </>
              ) : (
                <p>
                  La vista para aprobación aparecerá cuando el equipo termine el
                  diseño.
                </p>
              )}
              {order.publishedAt && (
                <div className="wf-delivery">
                  <span className="wf-kicker">LISTA PARA COMPARTIR</span>
                  <h3>Su gran día ya tiene enlace.</h3>
                  <a href={`/i/${order.slug}`} target="_blank" rel="noreferrer">
                    Abrir invitación de invitados
                  </a>
                  <p>Activa hasta el {date(order.expiresAt)}.</p>
                  {order.brief.privateGuests ? (
                    <p>
                      Genera los enlaces personales desde la sección Invitados.
                      Cada persona recibirá su propio enlace y cupos.
                    </p>
                  ) : config?.publicUrl ? (
                    <div className="wf-actions">
                      <button
                        className="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `${config.publicUrl}/i/${order.slug}`,
                            );
                            setNotice("Enlace para invitados copiado.");
                          } catch {
                            setNotice(`${config.publicUrl}/i/${order.slug}`);
                          }
                        }}
                      >
                        Copiar enlace
                      </button>
                      <a
                        className="button button-yellow"
                        href={whatsappUrl(
                          `¡Nos encantaría que nos acompañaras! Aquí encontrarás nuestra invitación: ${config.publicUrl}/i/${order.slug}`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Compartir por WhatsApp
                      </a>
                    </div>
                  ) : (
                    <p className="wf-notice">
                      La invitación está publicada en este entorno local. Falta
                      conectar el dominio para compartirla fuera de este
                      computador.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
          {tab === "invitados" && <Responses order={order} />}
          {tab === "historial" && <Timeline order={order} />}
        </>
      )}
    </Shell>
  );
}

function AdminOrder({
  order: initial,
  changed,
  back,
}: {
  order: Order;
  changed: () => void;
  back: () => void;
}) {
  const [order, setOrder] = useState(initial);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("gestionar");
  const [note, setNote] = useState("");
  const [privatePath, setPrivatePath] = useState("");
  const [terms, setTerms] = useState({
    total: initial.total ?? 0,
    deposit: initial.deposit ?? 0,
    revisionsIncluded: initial.revisionsIncluded,
    activeDays: initial.activeDays,
    deliveryMin: initial.deliveryDays[0],
    deliveryMax: initial.deliveryDays[1],
  });
  const [payment, setPayment] = useState({
    amount: Math.max(0, (initial.total || 0) - initial.paid),
    reference: "",
    verified: false,
  });
  const [method, setMethod] = useState({
    instructions: initial.paymentInstructions,
    url: initial.paymentUrl,
  });
  async function action(route: string, data: any) {
    const result = await api<Order>(`/orders/${order.id}/${route}`, {
      version: order.version,
      ...data,
    });
    setOrder(result);
    changed();
  }
  async function run(actionName: string, data = {}) {
    setBusy(true);
    setNotice("");
    try {
      await action("admin", { action: actionName, ...data });
      setNotice("Pedido actualizado.");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    try {
      setOrder(await api(`/orders/${order.id}`));
      setNotice("Estado actualizado.");
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  return (
    <>
      <button className="text-button" onClick={back}>
        ← Todos los pedidos
      </button>
      <div className="wf-section-top">
        <div>
          <h2>
            {order.contact.name}{" "}
            <span className="wf-pill">{stageLabels[order.stage]}</span>
          </h2>
          <p>
            {order.code} · {order.category} · {order.modelName}
          </p>
          <p>
            <a href={`mailto:${order.contact.email}`}>{order.contact.email}</a>{" "}
            ·{" "}
            <a
              href={whatsappUrl(
                `Hola ${order.contact.name}, te escribimos sobre tu pedido ${order.code}.`,
                order.contact.phone,
              )}
              target="_blank"
              rel="noreferrer"
            >
              {order.contact.phone}
            </a>
          </p>
        </div>
        <button className="text-button" onClick={refresh}>
          Actualizar pedido
        </button>
      </div>
      <Status text={notice} />
      <nav className="wf-tabs">
        {[
          ["gestionar", "Gestionar"],
          ["datos", "Editar invitación"],
          ["invitados", "Invitados"],
          ["historial", "Historial"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-current={tab === key ? "page" : undefined}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "gestionar" && (
        <div className="wf-admin-grid">
          <section className="wf-card">
            <h2>Siguiente paso.</h2>
            <p className="wf-muted">
              Solo se muestran acciones válidas para el estado actual.
            </p>
            {order.stage === "collecting" && (
              <p>
                {!order.termsConfirmed
                  ? "Confirma la cotización para que el cliente la acepte y pague."
                  : !order.termsAccepted
                    ? "Esperando que el cliente acepte las condiciones."
                    : order.paid < (order.deposit ?? Infinity)
                      ? "Verifica el pago recibido antes de comenzar."
                      : "Esperando que el cliente envíe su información."}
              </p>
            )}
            {order.stage === "submitted" && (
              <button
                className="button"
                disabled={busy}
                onClick={() => run("validate")}
              >
                Validar información e iniciar diseño
              </button>
            )}
            {order.stage === "designing" && (
              <button
                className="button"
                disabled={busy}
                onClick={() => run("review")}
              >
                Enviar versión a revisión
              </button>
            )}
            {order.stage === "review" && (
              <p>Esperando aprobación o ajustes del cliente.</p>
            )}
            {order.stage === "approved" && (
              <button
                className="button"
                disabled={busy || order.paid !== order.total}
                onClick={() => run("publish")}
              >
                Publicar y entregar invitación
              </button>
            )}
            {order.stage === "published" && (
              <a
                className="button"
                href={`/i/${order.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver invitación publicada
              </a>
            )}
            {order.brief.date && order.brief.names[0] && (
              <p>
                <a href={`/vista/${order.id}`} target="_blank" rel="noreferrer">
                  Vista previa privada ↗
                </a>
              </p>
            )}
            <details className="wf-details">
              <summary>Comunicación y ajustes del pedido</summary>
              <Field
                label="Nota para el cliente o motivo del cierre"
                value={note}
                onChange={setNote}
                type="textarea"
                maxLength={1500}
              />
              <div className="wf-actions">
                {["submitted", "designing"].includes(order.stage) && (
                  <button
                    className="button button-yellow"
                    disabled={busy || note.length < 5}
                    onClick={() => run("return", { note })}
                  >
                    Pedir información faltante
                  </button>
                )}
                {["review", "approved", "published"].includes(order.stage) && (
                  <button
                    className="button button-yellow"
                    disabled={busy}
                    onClick={() => run("reopen")}
                  >
                    Reabrir diseño
                  </button>
                )}
                {order.stage !== "closed" && (
                  <button
                    className="wf-danger"
                    disabled={busy || note.length < 5}
                    onClick={() => run("close", { note })}
                  >
                    Cerrar pedido y retirar enlace
                  </button>
                )}
              </div>
              <p>
                Reabrir exige otra aprobación antes de publicar cambios. Cerrar
                desactiva el enlace de invitados.
              </p>
            </details>
            <details className="wf-details">
              <summary>Recuperar acceso del cliente</summary>
              <p>
                Generar otro enlace revoca los enlaces privados y sesiones
                anteriores de este pedido. Compártelo únicamente con el cliente.
              </p>
              <button
                className="button button-yellow"
                disabled={busy}
                onClick={async () => {
                  try {
                    const r = await api("/admin/link", { id: order.id });
                    setPrivatePath(window.location.origin + r.path);
                    await refresh();
                  } catch (e: any) {
                    setNotice(e.message);
                  }
                }}
              >
                Generar nuevo enlace privado
              </button>
              {privatePath && (
                <div className="wf-break">
                  <a href={privatePath} target="_blank" rel="noreferrer">
                    Abrir enlace privado
                  </a>
                  <button
                    className="text-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(privatePath);
                        setNotice("Enlace privado copiado.");
                      } catch {
                        setNotice(privatePath);
                      }
                    }}
                  >
                    Copiar enlace
                  </button>
                </div>
              )}
            </details>
          </section>
          <section className="wf-card">
            <h2>Cotización y condiciones.</h2>
            <p>
              El cliente solicitó{" "}
              {durations[order.activeDays] || `${order.activeDays} días`}{" "}
              después del evento. Confirma el precio para esa vigencia.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run("terms", terms);
              }}
            >
              <fieldset
                className="wf-fields"
                disabled={
                  busy || order.paid > 0 || order.stage !== "collecting"
                }
              >
                <div className="wf-form-grid">
                  {(
                    [
                      ["total", "Total COP"],
                      ["deposit", "Pago para comenzar COP"],
                      ["revisionsIncluded", "Rondas de ajustes"],
                      ["activeDays", "Días activa después del evento"],
                      ["deliveryMin", "Entrega mínima (días hábiles)"],
                      ["deliveryMax", "Entrega máxima (días hábiles)"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      type="number"
                      value={String(terms[key])}
                      onChange={(v) => setTerms({ ...terms, [key]: Number(v) })}
                    />
                  ))}
                </div>
                <p className="wf-muted">
                  Para pago completo, el pago inicial es igual al total. Para
                  anticipo, escribe un valor menor.
                </p>
                <button className="button">
                  Confirmar condiciones para el cliente
                </button>
              </fieldset>
            </form>
            <details className="wf-details">
              <summary>Ampliar rondas de ajustes</summary>
              <Field
                label="Total de rondas acordadas"
                type="number"
                value={String(terms.revisionsIncluded)}
                onChange={(v) =>
                  setTerms({ ...terms, revisionsIncluded: Number(v) })
                }
              />
              <button
                className="button button-yellow"
                disabled={busy}
                onClick={() =>
                  run("extend-revisions", {
                    revisionsIncluded: terms.revisionsIncluded,
                  })
                }
              >
                Actualizar rondas
              </button>
            </details>
          </section>
          <section className="wf-card">
            <h2>Pagos.</h2>
            <dl className="wf-summary">
              <div>
                <dt>Verificado</dt>
                <dd>{money(order.paid)}</dd>
              </div>
              <div>
                <dt>Saldo</dt>
                <dd>
                  {order.total === null
                    ? "Por cotizar"
                    : money(order.total - order.paid)}
                </dd>
              </div>
            </dl>
            {order.paymentNotice && (
              <p className="wf-notice">
                El cliente reportó: {order.paymentNotice}
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run("verify-payment", payment);
              }}
            >
              <Field
                label="Valor recibido COP"
                type="number"
                value={String(payment.amount)}
                onChange={(v) => setPayment({ ...payment, amount: Number(v) })}
              />
              <Field
                label="Referencia única del movimiento recibido"
                value={payment.reference}
                onChange={(reference) => setPayment({ ...payment, reference })}
              />
              <label className="wf-check">
                <input
                  type="checkbox"
                  checked={payment.verified}
                  onChange={(e) =>
                    setPayment({ ...payment, verified: e.target.checked })
                  }
                />
                Verifiqué el ingreso en la cuenta receptora.
              </label>
              <button
                className="button"
                disabled={
                  busy ||
                  !payment.verified ||
                  !order.termsAccepted ||
                  order.paid === order.total
                }
              >
                Registrar pago verificado
              </button>
            </form>
            <ul className="wf-payment-list">
              {order.payments.map((p) => (
                <li key={p.id}>
                  {date(p.at)} · {money(p.amount)} · {p.reference}
                </li>
              ))}
            </ul>
          </section>
          <section className="wf-card">
            <h2>Cómo puede pagar.</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run("payment-method", method);
              }}
            >
              <Field
                label="Instrucciones y titular de la cuenta"
                value={method.instructions}
                onChange={(instructions) =>
                  setMethod({ ...method, instructions })
                }
                type="textarea"
                maxLength={1500}
              />
              <Field
                label="Enlace de pago oficial (opcional)"
                value={method.url}
                onChange={(url) => setMethod({ ...method, url })}
                type="url"
                maxLength={500}
              />
              <button className="button button-yellow" disabled={busy}>
                Guardar instrucciones
              </button>
            </form>
            <p className="wf-muted">
              Admite transferencia Nequi o un enlace oficial de Nequi Negocios.
              La confirmación del ingreso sigue siendo manual.
            </p>
          </section>
        </div>
      )}
      {tab === "datos" && (
        <BriefEditor
          order={order}
          admin
          save={(brief) => action("brief", { brief })}
        />
      )}
      {tab === "invitados" && <Responses order={order} />}
      {tab === "historial" && <Timeline order={order} />}
    </>
  );
}

function Admin() {
  const [auth, setAuth] = useState<{
    admin: boolean;
    setup: boolean;
    production: boolean;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [data, setData] = useState<any>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("pedidos");
  async function refresh() {
    setData(await api("/admin"));
  }
  useEffect(() => {
    api("/auth/status")
      .then((a) => {
        setAuth(a);
        if (a.admin) return refresh();
      })
      .catch((e) => setNotice(e.message));
  }, []);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(auth?.setup ? "/auth/setup" : "/auth/login", {
        password,
        setupToken,
      });
      setPassword("");
      setAuth({ admin: true, setup: false, production: !!auth?.production });
      setNotice("");
      await refresh();
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  const orders: Order[] = data?.orders || [];
  const shown = orders.filter(
    (o) =>
      (filter === "all" ||
        o.stage === filter ||
        (filter === "payments" && o.paymentNotice)) &&
      `${o.contact.name} ${o.code} ${o.contact.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <Shell
      title="Cada celebración, bajo control."
      subtitle="Solicitudes, diseño, pagos y entrega en un solo lugar."
      admin={!!auth?.admin}
    >
      <Status text={notice} />
      {auth && !auth.admin ? (
        <form className="wf-card wf-login" onSubmit={login}>
          <span className="wf-kicker">ACCESO DEL EQUIPO</span>
          <h2>
            {auth.setup ? "Configura tu acceso." : "Bienvenida de nuevo."}
          </h2>
          <p>
            {auth.setup
              ? "Crea una contraseña de al menos 12 caracteres. Este acceso permite gestionar pedidos y datos de clientes."
              : "Inicia sesión para gestionar las celebraciones."}
          </p>
          <Field
            label={auth.setup ? "Crear contraseña" : "Contraseña"}
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          {auth.setup && auth.production && (
            <Field
              label="Código de instalación del servidor"
              type="password"
              value={setupToken}
              onChange={setSetupToken}
              required
            />
          )}
          <button className="button" disabled={busy}>
            {busy
              ? "Entrando…"
              : auth.setup
                ? "Crear acceso de gestión"
                : "Entrar a gestión"}
          </button>
        </form>
      ) : (
        data &&
        (selected ? (
          <AdminOrder
            key={selected.id}
            order={selected}
            changed={() => {
              void refresh().catch((e) => setNotice(e.message));
            }}
            back={() => {
              setSelected(null);
              void refresh().catch((e) => setNotice(e.message));
            }}
          />
        ) : (
          <>
            <div className="wf-stats">
              <div>
                <strong>
                  {
                    orders.filter(
                      (o) => !["published", "closed"].includes(o.stage),
                    ).length
                  }
                </strong>
                <span>Pedidos en curso</span>
              </div>
              <div>
                <strong>{orders.filter((o) => o.paymentNotice).length}</strong>
                <span>Pagos por verificar</span>
              </div>
              <div>
                <strong>
                  {orders.filter((o) => o.stage === "review").length}
                </strong>
                <span>En revisión del cliente</span>
              </div>
              <div>
                <strong>
                  {orders.filter((o) => o.stage === "published").length}
                </strong>
                <span>Publicados</span>
              </div>
            </div>
            <nav className="wf-tabs">
              {[
                ["pedidos", "Pedidos"],
                ["consultas", "Consultas"],
                ["salida", "Correos y puesta en marcha"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-current={section === key ? "page" : undefined}
                  onClick={() => setSection(key)}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => refresh().catch((e) => setNotice(e.message))}
              >
                ↻ Actualizar
              </button>
            </nav>
            {section === "pedidos" && (
              <section className="wf-card">
                <div className="wf-filters">
                  <Field
                    label="Buscar pedido"
                    value={search}
                    onChange={setSearch}
                  />
                  <label className="wf-field">
                    Estado
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="payments">Pagos por verificar</option>
                      {Object.entries(stageLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {shown.length ? (
                  <div className="wf-order-list">
                    {shown.map((o) => (
                      <button
                        key={o.id}
                        className="wf-order-row"
                        onClick={() => setSelected(o)}
                      >
                        <span>
                          <strong>{o.contact.name}</strong>
                          <small>
                            {o.code} · {o.modelName}
                          </small>
                        </span>
                        <span className="wf-pill">
                          {o.paymentNotice
                            ? "Pago por verificar"
                            : stageLabels[o.stage]}
                        </span>
                        <span>
                          {date(o.createdAt)}{" "}
                          <Icon name="ArrowRight" size={17} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="wf-empty">
                    <Icon name="Heart" size={38} />
                    <h3>Aquí empieza cada historia.</h3>
                    <p>
                      Las solicitudes del catálogo aparecerán aquí. Puedes
                      recorrer el proceso creando un pedido con tus propios
                      datos.
                    </p>
                    <a className="button" href="/crear">
                      Crear una solicitud
                    </a>
                  </div>
                )}
              </section>
            )}
            {section === "consultas" && (
              <section className="wf-card">
                <h2>Personas que quieren conversar.</h2>
                {data.leads.length ? (
                  data.leads.map((lead: any) => (
                    <article className="wf-lead" key={lead.id}>
                      <span className="wf-pill">
                        {lead.resolved ? "Atendida" : "Pendiente"}
                      </span>
                      <h3>{lead.data.name}</h3>
                      <p>{lead.data.event}</p>
                      <p>
                        {lead.data.email} · {lead.data.phone}
                      </p>
                      <div className="wf-actions">
                        <a
                          className="button button-yellow"
                          href={whatsappUrl(
                            `Hola ${lead.data.name}, recibimos tu consulta sobre las invitaciones.`,
                            lead.data.phone,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Responder por WhatsApp
                        </a>
                        <a href="/crear">Crear pedido con el cliente</a>
                        {!lead.resolved && (
                          <button
                            className="text-button"
                            onClick={async () => {
                              try {
                                await api("/admin/lead", { id: lead.id });
                                await refresh();
                              } catch (e: any) {
                                setNotice(e.message);
                              }
                            }}
                          >
                            Marcar atendida
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="wf-empty">
                    Las consultas del formulario de contacto se guardarán aquí.
                  </p>
                )}
              </section>
            )}
            {section === "salida" && (
              <section className="wf-card">
                <h2>Conexiones del negocio.</h2>
                <ul className="wf-checklist">
                  <li>
                    ✓ Pedidos, fotografías y respuestas guardados en el
                    servidor.
                  </li>
                  <li>✓ Nequi con verificación manual del movimiento.</li>
                  <li>
                    {data.config.publicUrl
                      ? `✓ Dominio: ${data.config.publicUrl}`
                      : "Pendiente: dominio público y alojamiento permanente."}
                  </li>
                  <li>
                    {data.config.emailConfigured
                      ? "✓ Proveedor de correo configurado."
                      : "Pendiente: correo del negocio y proveedor de envío. Los correos de abajo todavía no se envían."}
                  </li>
                  <li>
                    {data.config.provisional
                      ? "Pendiente: nombre definitivo y tarifas generales. Se confirma cada cotización desde el pedido."
                      : "✓ Condiciones generales configuradas."}
                  </li>
                </ul>
                <h3>Correo transaccional</h3>
                <p className="wf-muted">
                  Los avisos quedan registrados. Solo figuran enviados cuando el
                  proveedor los acepta; eso no garantiza su lectura.
                </p>
                <div className="wf-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Destinatario</th>
                        <th>Asunto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.outbox.map((m: any) => (
                        <tr key={m.id}>
                          <td>{m.recipient}</td>
                          <td>{m.subject}</td>
                          <td>
                            {
                              (
                                {
                                  pending: "Pendiente",
                                  sent: "Aceptado por proveedor",
                                  failed: "Falló",
                                } as any
                              )[m.status]
                            }
                            {m.error && <small>{m.error}</small>}
                            {m.status === "failed" && (
                              <button
                                className="text-button"
                                onClick={async () => {
                                  try {
                                    await api("/admin/retry-email", {
                                      id: m.id,
                                    });
                                    await refresh();
                                  } catch (e: any) {
                                    setNotice(e.message);
                                  }
                                }}
                              >
                                Reintentar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ))
      )}
    </Shell>
  );
}

function Privacy() {
  return (
    <Shell
      title="Tu información tiene un propósito."
      subtitle="Preparar tu invitación, acompañarte en el proceso y organizar las respuestas de tu evento."
    >
      <article className="wf-card wf-readable">
        <h2>Qué guardamos y para qué.</h2>
        <p>
          Al solicitar una invitación guardamos tus datos de contacto, el diseño
          elegido, la información del evento, las fotografías que aportes y el
          historial del pedido. Los usamos para atenderte, personalizar la
          invitación y gestionar su entrega. Los avisos de pago incluyen
          referencias; no solicitamos claves de Nequi ni datos de tarjetas.
        </p>
        <h2>Qué ven los invitados.</h2>
        <p>
          Al aprobar la publicación autorizas que nombres, fotografías y
          detalles del evento aparezcan en el enlace compartido. Cualquier
          persona que reciba ese enlace puede verlo mientras esté activo. El
          enlace del pedido es distinto y permite gestionar información privada:
          consérvalo solo para ti.
        </p>
        <h2>Confirmaciones de asistencia.</h2>
        <p>
          Las respuestas se entregan a los organizadores y al equipo que
          gestiona la invitación. Las preferencias alimentarias y los
          comentarios son opcionales. No escribas información sensible que no
          quieras compartir con ellos.
        </p>
        <h2>Acceso, corrección y eliminación.</h2>
        <p>
          Puedes corregir los datos durante la preparación del pedido y
          solicitar acceso o eliminación contactándonos por{" "}
          <a
            href={whatsappUrl(
              "Hola, quiero consultar o gestionar mis datos personales.",
              site.whatsapp,
            )}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          . Desactivar una invitación retira el enlace público; la eliminación
          de sus registros y copias de respaldo se gestiona por separado.
        </p>
        <h2>Almacenamiento y comunicaciones.</h2>
        <p>
          El sistema utiliza cookies necesarias para mantener tu acceso privado
          y actualizar tu respuesta de asistencia desde el mismo navegador. Si
          se activa el correo transaccional, el proveedor recibe la dirección y
          el contenido necesario para entregar los avisos del pedido. No usamos
          estos datos para campañas publicitarias sin otra autorización.
        </p>
        <p className="wf-notice">
          Versión de preparación del servicio. Antes del lanzamiento deben
          completarse la identidad del responsable y los plazos de conservación
          acordados por el negocio.
        </p>
      </article>
    </Shell>
  );
}
export function Workflow({ path, search }: { path: string; search: string }) {
  if (path.startsWith("/i/") || path.startsWith("/vista/"))
    return (
      <LiveInvitation
        id={path.split("/")[2]}
        preview={path.startsWith("/vista/")}
      />
    );
  if (path.startsWith("/pedido/")) return <Portal id={path.split("/")[2]} />;
  if (path === "/gestion") return <Admin />;
  if (path === "/privacidad") return <Privacy />;
  return (
    <StartOrder selected={new URLSearchParams(search).get("modelo") || ""} />
  );
}
