export interface BusinessConfig {
  currency: string;
  country: string;
  locale: string;
  regularPrice: number;
  promotionalPrice?: number;
  depositPercent: number;
  deliveryDays: [number, number];
  deliveryStartsWhen: string;
  promotionExpiresAt?: string;
  demo: boolean;
  unlimitedDistribution: boolean;
  sharedBy: string;
  included: string[];
  extras: { name: string; terms: string }[];
  changesPolicy: string;
}

// Fuente única de identidad y contacto. Completar con datos propios antes de publicar.
export const site = {
  name: "siempre",
  tagline: "Historias que merecen una gran invitación.",
  logo: "", // URL local opcional, por ejemplo /assets/marca.svg
  publicUrl:
    (import.meta as ImportMeta & { env?: { VITE_PUBLIC_ORIGIN?: string } }).env
      ?.VITE_PUBLIC_ORIGIN ||
    (typeof process !== "undefined" ? process.env.VITE_PUBLIC_ORIGIN : "") ||
    "", // Dominio HTTPS público, sin ruta.
  whatsapp: "000000000000", // Colombia, número facilitado por la usuaria.
  email: "",
  instagram: "",
  facebook: "",
  proposalPath: "/propuesta/bodas-colombia",
};

export const business: BusinessConfig = {
  currency: "COP",
  country: "Colombia",
  locale: "es-CO",
  regularPrice: 163000,
  promotionalPrice: 130500,
  depositPercent: 100,
  deliveryDays: [3, 5],
  deliveryStartsWhen: "recibir y validar toda la información del evento",
  promotionExpiresAt: undefined,
  demo: true,
  unlimitedDistribution: true,
  sharedBy:
    "La pareja comparte el enlace con sus invitados por WhatsApp, correo o redes sociales.",
  included: [
    "Un diseño del catálogo personalizado con sus nombres, textos y fotografías",
    "Información del evento, galería, ubicación y cuenta regresiva",
    "Confirmación de asistencia y sugerencias de canciones",
    "Un enlace de invitación para compartir sin límite de envíos",
  ],
  extras: [
    { name: "Idiomas adicionales", terms: "Se cotizan por separado." },
    {
      name: "Recursos gráficos para el evento",
      terms: "Pack opcional; valor por confirmar.",
    },
  ],
  changesPolicy:
    "Los ajustes de información se revisan con el asesor. El alcance, la cantidad de revisiones y cualquier costo deben confirmarse antes de contratar.",
};

export interface Review {
  name: string;
  text: string;
  sourceUrl: string;
}
export const reviews: Review[] = []; // Solo reseñas propias con fuente pública verificable.

export const wedding = {
  names: ["Ana", "Mateo"],
  date: "2027-06-18T16:00:00-05:00",
  city: "Bogotá, Colombia",
  guestName: "Valentina",
  maxCompanions: 2,
  rsvpFields: {
    children: true,
    dietary: true,
    transport: true,
    comments: true,
  },
  ceremony: {
    title: "Ceremonia",
    time: "4:00 p. m.",
    place: "Jardín Botánico de Bogotá",
    address: "Av. Calle 63 #68-95, Bogotá",
    query: "Jardín Botánico de Bogotá Colombia",
  },
  party: {
    title: "Celebración",
    time: "7:00 p. m.",
    place: "Encuentro en el jardín",
    address: "Ubicación ilustrativa: Jardín Botánico de Bogotá",
    query: "Jardín Botánico de Bogotá Colombia",
  },
  dressCode:
    "Formal. Tonos suaves y zapatos cómodos para disfrutar del jardín. Reservemos el blanco para la novia.",
  gifts:
    "Su compañía es nuestro regalo favorito. Si desean tener un detalle adicional, pueden elegir lluvia de sobres el día de la celebración.",
  storageKey: "siempre-boda-demo-v1",
};
