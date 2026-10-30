import React, { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
import { InvitationContext, useInvitation } from "./runtime";
import { wedding as example } from "../config";
import { Invitation, MusicToggle } from "../Invitation";
import { CelebrationInvitation } from "../Celebration";
import { findModel } from "../data";
import { findCelebration } from "../celebrations";
import type { PublicInvitation } from "./types";

export function LiveRsvp() {
  const { live, slug, wedding } = useInvitation();
  const [data, setData] = useState({
    name: live?.guest?.name || "",
    attending: "",
    companions: 0,
    children: 0,
    dietary: "",
    transport: "no",
    comments: "",
    consent: false,
    website: "",
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        `/invitations/${slug}/rsvp${typeof window !== "undefined" ? window.location.search : ""}`,
        data,
      );
      setNotice(
        "¡Gracias! Tu respuesta se envió a los organizadores. Si cambias de planes, puedes actualizarla desde este mismo navegador.",
      );
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (live?.preview)
    return (
      <p className="local-notice">
        Vista previa: aquí tus invitados podrán confirmar asistencia cuando
        publiquemos la invitación.
      </p>
    );
  return (
    <form className="rsvp-form" onSubmit={submit}>
      <label>
        Tu nombre
        <input
          required
          minLength={2}
          maxLength={100}
          value={data.name}
          readOnly={!!live?.guest}
          autoComplete="name"
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </label>
      <label>
        ¿Nos acompañas?
        <select
          required
          value={data.attending}
          onChange={(e) => setData({ ...data, attending: e.target.value })}
        >
          <option value="">Selecciona una opción</option>
          <option value="yes">Sí, allí estaré</option>
          <option value="no">No podré asistir</option>
        </select>
      </label>
      {data.attending === "yes" && (
        <>
          <label>
            Acompañantes, además de ti
            <select
              value={data.companions}
              onChange={(e) =>
                setData({
                  ...data,
                  companions: Number(e.target.value),
                  children: Math.min(data.children, Number(e.target.value)),
                })
              }
            >
              {Array.from({ length: wedding.maxCompanions + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label>
            Niños incluidos entre tus acompañantes
            <input
              type="number"
              min={0}
              max={data.companions}
              value={data.children}
              onChange={(e) =>
                setData({ ...data, children: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Preferencias alimentarias (opcional)
            <input
              maxLength={300}
              value={data.dietary}
              onChange={(e) => setData({ ...data, dietary: e.target.value })}
            />
          </label>
          <label>
            ¿Te interesa recibir información sobre transporte?
            <select
              value={data.transport}
              onChange={(e) => setData({ ...data, transport: e.target.value })}
            >
              <option value="no">No, gracias</option>
              <option value="yes">Sí</option>
            </select>
          </label>
        </>
      )}
      <label>
        Mensaje para los organizadores (opcional)
        <textarea
          maxLength={1000}
          value={data.comments}
          onChange={(e) => setData({ ...data, comments: e.target.value })}
        />
      </label>
      <input
        className="wf-honeypot"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        value={data.website}
        onChange={(e) => setData({ ...data, website: e.target.value })}
      />
      <label className="wf-check">
        <input
          type="checkbox"
          required
          checked={data.consent}
          onChange={(e) => setData({ ...data, consent: e.target.checked })}
        />
        <span>
          Autorizo compartir esta respuesta con los organizadores.{" "}
          <a href="/privacidad" target="_blank" rel="noreferrer">
            Privacidad
          </a>
          .
        </span>
      </label>
      <button className="invite-button event-button" disabled={busy}>
        {busy ? "Enviando…" : "Confirmar mi respuesta"}
      </button>
      {notice && (
        <p className="rsvp-status" role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
export function LiveSong() {
  const { live, slug } = useInvitation();
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        `/invitations/${slug}/song${typeof window !== "undefined" ? window.location.search : ""}`,
        { song, artist, consent },
      );
      setNotice("¡Canción enviada a los organizadores!");
      setSong("");
      setArtist("");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (live?.preview)
    return (
      <p className="local-notice">
        Las sugerencias de canciones se habilitan al publicar.
      </p>
    );
  return (
    <form className="song-form" onSubmit={submit}>
      <label>
        Canción
        <input
          required
          minLength={2}
          maxLength={120}
          value={song}
          onChange={(e) => setSong(e.target.value)}
        />
      </label>
      <label>
        Artista (opcional)
        <input
          maxLength={120}
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </label>
      <label className="wf-check">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Quiero compartir esta sugerencia con los organizadores.
      </label>
      <button className="invite-button" disabled={busy}>
        {busy ? "Enviando…" : "Sugerir canción"}
      </button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
}
export function LiveInvitation({
  id,
  preview,
}: {
  id: string;
  preview: boolean;
}) {
  const [data, setData] = useState<PublicInvitation | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<PublicInvitation>(
      preview
        ? `/orders/${id}/preview`
        : `/invitations/${id}${window.location.search}`,
    )
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id, preview]);
  useEffect(() => {
    if (data)
      document.title = `${data.brief.names.filter(Boolean).join(" & ")} · Su invitación`;
  }, [data]);
  if (!data || !data.brief.date)
    return (
      <main className="workflow wf-loading">
        <h1>
          {error
            ? "No pudimos abrir la invitación."
            : data
              ? "Aún faltan algunos detalles."
              : "Preparando su invitación…"}
        </h1>
        <p>
          {error ||
            (data
              ? "Completa la fecha, los nombres y el lugar en el pedido para ver la invitación."
              : "")}
        </p>
        {preview && <a href={`/pedido/${id}`}>Volver al pedido</a>}
      </main>
    );
  const b = data.brief;
  const model = findModel(data.modelId);
  const event = findCelebration(data.modelId);
  const makeEvent = (e: BriefEvent, title: string) => ({
    ...e,
    title,
    query: `${e.place} ${e.address} ${b.city}`,
  });
  const wedding = {
    ...example,
    names: b.names,
    date: b.date,
    city: b.city,
    guestName: data.guest?.name || "",
    maxCompanions: b.maxCompanions,
    ceremony: makeEvent(b.ceremony, "Ceremonia"),
    party: makeEvent(b.party, "Celebración"),
    dressCode: b.dressCode,
    gifts: b.gifts,
    storageKey: `event-${data.id}`,
  };
  return (
    <InvitationContext.Provider
      value={{ wedding, live: data, slug: preview ? undefined : id }}
    >
      {preview && (
        <div className="wf-preview-banner">
          Vista previa privada · Los formularios no envían respuestas.
          <a href={`/pedido/${id}`}>Volver al pedido</a>
        </div>
      )}
      {model ? (
        <Invitation model={{ ...model, photo: b.photos[0] || model.art }} />
      ) : event ? (
        <>
          <CelebrationInvitation
            event={{
              ...event,
              name: b.names[0],
              date: b.date,
              time: b.ceremony.time,
              location: `${b.ceremony.place} · ${b.ceremony.address}`,
              mapQuery: `${b.ceremony.place} ${b.ceremony.address} ${b.city}`,
              intro: b.story || "Nos encantará compartir este día contigo.",
              dress: b.dressCode,
              note: b.gifts,
              maxGuests: b.maxCompanions + 1,
            }}
          />
          {b.music && <MusicToggle src={b.music} />}
        </>
      ) : (
        <p>Diseño no disponible.</p>
      )}
    </InvitationContext.Provider>
  );
}
type BriefEvent = { place: string; address: string; time: string };
