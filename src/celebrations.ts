export interface Celebration {
  id: string;
  category: string;
  design: string;
  name: string;
  headline: string;
  intro: string;
  date: string;
  time: string;
  location: string;
  mapQuery: string;
  background: string;
  ink: string;
  accent: string;
  icon: string;
  number?: string;
  dress: string;
  note: string;
  maxGuests: number;
}
export const celebrations: Celebration[] = [
  {
    id: "16-anos",
    category: "16 años",
    design: "Un cielo de sueños",
    name: "Sofía",
    headline: "Mis dieciséis",
    intro: "Una noche para brillar, bailar y crear recuerdos contigo.",
    date: "2027-08-21T18:00:00-05:00",
    time: "6:00 p. m.",
    location: "Bogotá, Colombia",
    mapQuery: "Bogotá Colombia",
    background: "#EAE1F4",
    ink: "#49345F",
    accent: "#8B65A7",
    icon: "Sparkles",
    number: "16",
    dress: "Elegante, con un toque de brillo. ¡Ven listo para bailar!",
    note: "Tu compañía hará esta noche inolvidable.",
    maxGuests: 2,
  },
  {
    id: "primera-comunion",
    category: "Primera comunión",
    design: "Luz y esperanza",
    name: "Samuel",
    headline: "Mi primera comunión",
    intro:
      "Con alegría y gratitud, te invito a compartir este día especial con mi familia.",
    date: "2027-05-16T10:00:00-05:00",
    time: "10:00 a. m.",
    location: "Bogotá, Colombia",
    mapQuery: "Bogotá Colombia",
    background: "#F7F4E9",
    ink: "#596349",
    accent: "#AA9160",
    icon: "Cross",
    dress: "Vestimenta formal en tonos claros.",
    note: "Celebremos juntos la fe, el amor y la alegría de estar en familia.",
    maxGuests: 4,
  },
  {
    id: "grado",
    category: "Grado",
    design: "El comienzo de todo",
    name: "Valentina",
    headline: "Lo soñé. Lo logré.",
    intro:
      "Después de tantos aprendizajes, llega el momento de celebrar un nuevo comienzo.",
    date: "2027-07-10T19:00:00-05:00",
    time: "7:00 p. m.",
    location: "Bogotá, Colombia",
    mapQuery: "Bogotá Colombia",
    background: "#182E48",
    ink: "#F4E6C8",
    accent: "#C9A46A",
    icon: "GraduationCap",
    number: "2027",
    dress: "Formal. Brindemos por todo lo que viene.",
    note: "Gracias por ser parte del camino. Este logro también lleva un poquito de ti.",
    maxGuests: 3,
  },
  {
    id: "infantil",
    category: "Infantil",
    design: "Una gran aventura",
    name: "Nicolás",
    headline: "¡Vamos a celebrar!",
    intro:
      "Te esperamos para una tarde llena de juegos, risas y pequeñas grandes aventuras.",
    date: "2027-04-24T15:00:00-05:00",
    time: "3:00 p. m.",
    location: "Bogotá, Colombia",
    mapQuery: "Bogotá Colombia",
    background: "#FFF3D3",
    ink: "#365F65",
    accent: "#D97550",
    icon: "PartyPopper",
    number: "5",
    dress: "Ropa cómoda para jugar y explorar.",
    note: "Los menores deben asistir acompañados por un adulto responsable.",
    maxGuests: 4,
  },
  {
    id: "baby-shower",
    category: "Baby shower",
    design: "Un pequeño gran amor",
    name: "Emilia",
    headline: "Un amor que crece",
    intro:
      "Mientras esperamos su llegada, queremos celebrar esta nueva aventura contigo.",
    date: "2027-03-20T15:30:00-05:00",
    time: "3:30 p. m.",
    location: "Bogotá, Colombia",
    mapQuery: "Bogotá Colombia",
    background: "#F3E7DD",
    ink: "#657761",
    accent: "#B37C63",
    icon: "Baby",
    dress: "Casual, en tonos suaves y con muchas ganas de compartir.",
    note: "Tu presencia es nuestro mejor regalo. Gracias por acompañar este nuevo capítulo.",
    maxGuests: 3,
  },
];
export const findCelebration = (id: string) =>
  celebrations.find((e) => e.id === id);
