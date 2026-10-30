export interface Model {
  id: string;
  name: string;
  description: string;
  family: string;
  accent: string;
  background: string;
  ink: string;
  art: string;
  photo: string;
  layout: "editorial" | "film" | "botanical" | "floral" | "gala";
  image: string;
  demo: string;
}
const make = (
  id: string,
  name: string,
  description: string,
  family: string,
  accent: string,
  background: string,
  ink: string,
  art: string,
  photo: string,
  layout: Model["layout"],
): Model => ({
  id,
  name,
  description,
  family,
  accent,
  background,
  ink,
  art: `/assets/${art}.png`,
  photo: `/assets/${photo}.png`,
  layout,
  image: `/assets/${photo}.png`,
  demo: `/demo/${id}`,
});
export const models: Model[] = [
  make(
    "magnolia-editorial",
    "Magnolia editorial",
    "Magnolias de gran escala, papel marfil y tipografía editorial. Una invitación de elegancia serena.",
    "Floral · Editorial",
    "#A58B57",
    "#F6F1E7",
    "#292D29",
    "magnolia",
    "couple-garden",
    "editorial",
  ),
  make(
    "memorias-de-pelicula",
    "Memorias de película",
    "Sus fotografías cuentan la historia. Colores cálidos y recuerdos para volver a ese primer encuentro.",
    "Fotografía · Cálido",
    "#754A34",
    "#F6EAD7",
    "#34251E",
    "magnolia",
    "couple-garden",
    "film",
  ),
  make(
    "jardin-botanico",
    "Jardín botánico",
    "Un pequeño jardín digital: verde profundo, helechos y orquídeas para celebrar un amor que florece.",
    "Botánico · Natural",
    "#DCE4CC",
    "#173F35",
    "#F4F2E8",
    "botanical",
    "couple-garden",
    "botanical",
  ),
  make(
    "rosa-contemporanea",
    "Rosa contemporánea",
    "Una flor protagonista, rosa suave y tinta cereza. Romanticismo con personalidad.",
    "Romántico · Floral",
    "#7E243B",
    "#F2DADD",
    "#7E243B",
    "rose",
    "couple-garden",
    "floral",
  ),
  make(
    "vino-de-gala",
    "Vino de gala",
    "Tonos vino y champán, detalles geométricos y una atmósfera de celebración a la luz de las velas.",
    "Gala · Nocturno",
    "#EAD9B7",
    "#481D2C",
    "#EAD9B7",
    "rose",
    "couple-evening",
    "gala",
  ),
  make(
    "oliva-serena",
    "Oliva serena",
    "Botánica sobre papel claro, verdes oliva y una composición tranquila para una boda al aire libre.",
    "Botánico · Sereno",
    "#647653",
    "#F1F0E5",
    "#3C4B31",
    "botanical",
    "couple-garden",
    "editorial",
  ),
  make(
    "carta-de-amor",
    "Carta de amor",
    "El encanto de una carta personal: crema, terracota y fotografías que guardan sus mejores momentos.",
    "Editorial · Nostálgico",
    "#A45B47",
    "#F4E8DB",
    "#663F32",
    "magnolia",
    "couple-evening",
    "film",
  ),
  make(
    "costa-eterna",
    "Costa eterna",
    "Una paleta de arena y azul profundo con flores claras. Un diseño fresco para celebrar sin prisa.",
    "Natural · Luminoso",
    "#476E83",
    "#EDF1EF",
    "#264B5A",
    "magnolia",
    "couple-garden",
    "floral",
  ),
  make(
    "cielo-de-seda",
    "Cielo de seda",
    "Malva suave, ilustración botánica y delicados contrastes para una celebración íntima.",
    "Botánico · Suave",
    "#786A91",
    "#EBE6F0",
    "#4E425F",
    "botanical",
    "couple-garden",
    "botanical",
  ),
  make(
    "noche-estrellada",
    "Noche estrellada",
    "Azul medianoche y acentos champán. Geometría sutil para una noche que merece recordarse.",
    "Gala · Clásico",
    "#D3BB87",
    "#1B2A3B",
    "#F0E6D4",
    "magnolia",
    "couple-evening",
    "gala",
  ),
];
export const findModel = (id?: string | null) =>
  models.find((m) => m.id === id);
export const features = [
  [
    "Users",
    "Nombres de invitados",
    "Una bienvenida con el nombre de cada invitado y sus acompañantes.",
  ],
  [
    "Send",
    "Envío ilimitado",
    "Comparte el enlace por WhatsApp, correo y tus redes favoritas.",
  ],
  [
    "Music2",
    "Música de fondo",
    "Su canción acompaña la invitación cuando el invitado activa el sonido.",
  ],
  [
    "Timer",
    "Cuenta regresiva",
    "La emoción de contar los días para encontrarse.",
  ],
  [
    "MapPin",
    "Ubicación e indicaciones",
    "Toda la información para llegar a la ceremonia y la celebración.",
  ],
  [
    "ListMusic",
    "Lista de canciones",
    "Los invitados pueden sugerir esa canción que no puede faltar.",
  ],
  [
    "Gift",
    "Regalos",
    "Comparte sus preferencias de regalos de una manera delicada.",
  ],
  ["CalendarDays", "Agenda", "Guarda la fecha del gran día en el calendario."],
  [
    "Images",
    "Álbum de fotos",
    "Un recorrido por los momentos que los trajeron hasta aquí.",
  ],
  [
    "ClipboardCheck",
    "Confirmación de asistencia",
    "Asistencia, acompañantes y detalles útiles para organizar el encuentro.",
  ],
  [
    "Camera",
    "Participación social",
    "Reúne las fotos del evento con un hashtag o un álbum compartido.",
  ],
  [
    "Shirt",
    "Código de vestimenta",
    "Ayuda a tus invitados a elegir cómo acompañarlos.",
  ],
  [
    "LockKeyhole",
    "Acceso privado",
    "La opción de limitar el acceso a quienes forman parte del evento.",
  ],
  [
    "Settings2",
    "Administración",
    "Consulta la información de invitados y canciones en un solo lugar.",
  ],
  [
    "Link",
    "Dirección personalizada",
    "Un enlace con los nombres de la pareja.",
  ],
  [
    "BedDouble",
    "Hospedaje",
    "Sugerencias para quienes vienen de otras ciudades.",
  ],
  [
    "Utensils",
    "Menú",
    "Comparte las opciones y conoce necesidades alimentarias.",
  ],
  [
    "Bus",
    "Transporte",
    "Información de traslados para disfrutar la celebración.",
  ],
];
export const benefits = [
  [
    "Sparkles",
    "Tan original como ustedes",
    "Una experiencia visual que acompaña su historia.",
  ],
  [
    "Heart",
    "Personalización",
    "Sus fotos, sus palabras y los detalles que los hacen únicos.",
  ],
  [
    "MousePointer2",
    "Todo en un lugar",
    "Información e interacciones a mano desde el celular.",
  ],
  [
    "Wallet",
    "Ahorra tiempo y papel",
    "Comparte un enlace y simplifica la distribución.",
  ],
  [
    "MessagesSquare",
    "Acompañamiento",
    "Orientación para preparar los detalles de la invitación.",
  ],
  ["Clock3", "Entrega ágil", ""],
  [
    "Globe2",
    "Sin distancias",
    "Comparte con tus invitados dondequiera que estén.",
  ],
  [
    "MonitorSmartphone",
    "Multidispositivo",
    "Una experiencia adaptable a celular, tablet y computador.",
  ],
  ["Leaf", "Menos papel", "Una forma digital de anunciar su gran día."],
];
