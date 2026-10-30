import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Heart,
  Users,
  Send,
  Music2,
  Timer,
  MapPin,
  ListMusic,
  Gift,
  CalendarDays,
  Images,
  ClipboardCheck,
  Camera,
  Shirt,
  LockKeyhole,
  Settings2,
  Link,
  BedDouble,
  Utensils,
  Bus,
  Sparkles,
  MousePointer2,
  Wallet,
  MessagesSquare,
  Clock3,
  Globe2,
  MonitorSmartphone,
  Leaf,
  X,
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronsDown,
  ExternalLink,
  CircleCheck,
  Check,
  Copy,
  Share2,
  MessageCircle,
  ChevronDown,
  Mail,
  Instagram,
  Facebook,
  Pause,
  CalendarPlus,
  Church,
  Trees,
  Wine,
  HeartHandshake,
  Plus,
  GraduationCap,
  Cross,
  Baby,
  PartyPopper,
} from "lucide-react";
import { site, business } from "./config";
import { deliveryText, validateContact, type Contact } from "./logic";
import { benefits, type Model } from "./data";
import { useInvitation } from "./workflow/runtime";
import { api } from "./workflow/api";

export function Icon({
  name,
  size = 30,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icons: Record<string, typeof Heart> = {
    Heart,
    Users,
    Send,
    Music2,
    Timer,
    MapPin,
    ListMusic,
    Gift,
    CalendarDays,
    Images,
    ClipboardCheck,
    Camera,
    Shirt,
    LockKeyhole,
    Settings2,
    Link,
    BedDouble,
    Utensils,
    Bus,
    Sparkles,
    MousePointer2,
    Wallet,
    MessagesSquare,
    Clock3,
    Globe2,
    MonitorSmartphone,
    Leaf,
    X,
    ArrowUpRight,
    ArrowDown,
    ArrowRight,
    ArrowLeft,
    ChevronsDown,
    ExternalLink,
    CircleCheck,
    Check,
    Copy,
    Share2,
    MessageCircle,
    ChevronDown,
    Mail,
    Instagram,
    Facebook,
    Pause,
    CalendarPlus,
    Church,
    Trees,
    Wine,
    HeartHandshake,
    Plus,
    GraduationCap,
    Cross,
    Baby,
    PartyPopper,
  };
  const Component = icons[name] || Heart;
  return (
    <Component size={size} strokeWidth={1.45} aria-hidden={true} {...props} />
  );
}
export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="/"
      className={`brand ${dark ? "brand-dark" : ""}`}
      aria-label={`${site.name}, inicio`}
    >
      {site.logo ? (
        <img src={site.logo} alt={site.name} />
      ) : (
        <>
          {site.name}
          <span>.</span>
        </>
      )}
    </a>
  );
}
export function Button({
  children,
  onClick,
  secondary = false,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`button ${secondary ? "button-yellow" : ""} ${className}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function SectionHeading({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
      {children}
      {text && <p>{text}</p>}
    </header>
  );
}
export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`wave ${className}`}
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="var(--champagne)"
        d="M0 167C330 270 600 168 858 56S1220 0 1440 28V220H0Z"
      />
      <path
        fill="var(--rose)"
        d="M0 176C360 287 625 180 893 87S1230 39 1440 66V220H0Z"
      />
      <path
        fill="currentColor"
        d="M0 207C355 316 661 202 920 121S1248 92 1440 122V220H0Z"
      />
    </svg>
  );
}

export function Modal({
  children,
  title,
  onClose,
  full = false,
  className = "",
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  full?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    ref.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      active?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${full ? "modal-full" : ""} ${className}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Cerrar ventana"
        >
          <Icon name="X" size={25} />
        </button>
        <h2 id={titleId} className={full ? "sr-only" : ""}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

export function ContactForm({ modelName }: { modelName?: string }) {
  const [data, setData] = useState<Contact>({
    name: "",
    phone: "",
    email: "",
    event: modelName
      ? `Me interesa el diseño ${modelName} para mi evento.`
      : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>(
    {},
  );
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [consent, setConsent] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateContact(data);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    if (!consent) {
      setNotice("Autoriza el contacto para enviar la solicitud.");
      return;
    }
    setBusy(true);
    try {
      await api("/contact", { ...data, consent });
      setSent(true);
    } catch (error: any) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div className="success-state" role="status">
        <Icon name="CircleCheck" size={48} />
        <h3>¡Recibimos tu consulta!</h3>
        <p>
          Tu solicitud quedó guardada. El equipo podrá contactarte con los datos
          que compartiste.
        </p>
        <Button secondary onClick={() => setSent(false)}>
          Volver al formulario
        </Button>
      </div>
    );
  const fields: [keyof Contact, string, string][] = [
    ["name", "Tu nombre", "text"],
    ["phone", "Teléfono o WhatsApp", "tel"],
    ["email", "Correo electrónico", "email"],
    ["event", "Cuéntanos sobre tu evento", "textarea"],
  ];
  return (
    <form ref={form} className="contact-form" onSubmit={submit} noValidate>
      <p>Cuéntanos cómo imaginas su gran día.</p>
      {modelName && (
        <div className="selected-model-note">
          Modelo seleccionado: <strong>{modelName}</strong>
        </div>
      )}
      {fields.map(([key, label, type]) => (
        <label key={key} htmlFor={`contact-${key}`}>
          {label}
          {type === "textarea" ? (
            <textarea
              id={`contact-${key}`}
              rows={3}
              value={data[key]}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `error-${key}` : undefined}
              maxLength={2000}
            />
          ) : (
            <input
              id={`contact-${key}`}
              type={type}
              autoComplete={
                key === "name" ? "name" : key === "phone" ? "tel" : "email"
              }
              value={data[key]}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `error-${key}` : undefined}
              maxLength={150}
            />
          )}{" "}
          {errors[key] && (
            <span id={`error-${key}`} className="field-error">
              {errors[key]}
            </span>
          )}
        </label>
      ))}
      <label className="wf-check">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Autorizo el uso de mis datos para atender esta consulta.{" "}
          <a href="/privacidad" target="_blank" rel="noreferrer">
            Privacidad
          </a>
          .
        </span>
      </label>
      <button type="submit" className="button button-yellow" disabled={busy}>
        {busy ? "Enviando…" : "Enviar consulta"}
        <Icon name="ArrowUpRight" size={18} />
      </button>
      {notice && (
        <p role="status" className="form-note">
          {notice}
        </p>
      )}
    </form>
  );
}

export function InvitationCover({
  model,
  compact = false,
  action = true,
}: {
  model: Model;
  compact?: boolean;
  action?: boolean;
}) {
  const { wedding, live } = useInvitation();
  const dateLabel = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  })
    .format(new Date(wedding.date))
    .toUpperCase();
  const NameTag = compact ? "div" : "h1";
  return (
    <div
      className={`invitation-cover cover-${model.layout} ${compact ? "cover-compact" : ""}`}
      style={
        {
          "--invite-bg": model.background,
          "--invite-ink": model.ink,
          "--invite-accent": model.accent,
        } as React.CSSProperties
      }
    >
      <div className="invite-monogram">
        <span>
          {wedding.names[0].slice(0, 1)}
          <span className="mono-amp">&</span>
          {wedding.names[1].slice(0, 1)}
        </span>
        <span className="invite-location">{wedding.city.toUpperCase()}</span>
      </div>
      <span className="invite-eyebrow">
        {model.layout === "film" ? "Nuestra historia" : "NUESTRA BODA"}
      </span>
      <NameTag className="cover-names">
        <span>{wedding.names[0]}</span>
        <i>&</i>
        <span>{wedding.names[1]}</span>
      </NameTag>
      <img
        className="cover-photo"
        src={model.photo}
        alt={
          compact
            ? ""
            : `${wedding.names.join(" y ")}${live ? "" : ", fotografía ilustrativa"}`
        }
        loading={compact ? "lazy" : "eager"}
      />
      {model.layout !== "film" && model.layout !== "gala" && (
        <img
          className="cover-art"
          src={model.art}
          alt=""
          loading={compact ? "lazy" : "eager"}
        />
      )}
      {model.layout === "gala" && (
        <div className="deco-frame" aria-hidden="true" />
      )}
      <div className="cover-bottom">
        <p className="invite-date">{dateLabel}</p>
        <p className="invite-city">{wedding.city}</p>
        {model.layout === "film" && <p className="handwritten">para siempre</p>}
        {action && (
          <>
            <a className="invite-button" href="#asistencia">
              Confirmar asistencia <span aria-hidden="true">→</span>
            </a>
            <a className="invite-text-link" href="#detalles">
              Ver detalles <span aria-hidden="true">⌄</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
export function Benefits({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`benefits-grid ${compact ? "benefits-compact" : ""}`}>
      {benefits.map(([icon, title, desc]) => (
        <article key={title} className="benefit-card">
          <span className="illustrated-icon">
            <Icon name={icon} size={37} />
          </span>
          <h3>{title}</h3>
          <p>{desc || deliveryText()}</p>
        </article>
      ))}
    </div>
  );
}
export function DemoNotice() {
  return business.demo ? (
    <span className="demo-pill">
      Propuesta demostrativa · tarifas de ejemplo
    </span>
  ) : null;
}
