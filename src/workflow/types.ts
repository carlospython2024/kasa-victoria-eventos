export type Stage =
  | "collecting"
  | "submitted"
  | "designing"
  | "review"
  | "approved"
  | "published"
  | "closed";
export const stageLabels: Record<Stage, string> = {
  collecting: "Preparando información",
  submitted: "Información enviada",
  designing: "En diseño",
  review: "Lista para revisar",
  approved: "Aprobada",
  published: "Publicada",
  closed: "Cerrada",
};
export interface Brief {
  lodging?: string;
  menu?: string;
  transportInfo?: string;
  social?: string;
  privateGuests?: boolean;
  names: string[];
  date: string;
  city: string;
  ceremony: { place: string; address: string; time: string };
  party: { place: string; address: string; time: string };
  story: string;
  dressCode: string;
  gifts: string;
  photos: string[];
  music: string;
  maxCompanions: number;
}
export interface Order {
  id: string;
  code: string;
  modelId: string;
  modelName: string;
  category: string;
  contact: { name: string; email: string; phone: string };
  stage: Stage;
  createdAt: string;
  updatedAt: string;
  version: number;
  total: number | null;
  deposit: number | null;
  paid: number;
  paymentInstructions: string;
  paymentUrl: string;
  paymentNotice: string;
  brief: Brief;
  revision: number;
  reviewRevision: number | null;
  approvedRevision: number | null;
  revisionsUsed: number;
  revisionsIncluded: number;
  activeDays: number;
  deliveryDays: number[];
  validatedAt: string | null;
  expiresAt: string | null;
  slug: string;
  publishedAt: string | null;
  timeline: { at: string; actor: string; text: string }[];
  payments: { id: string; amount: number; reference: string; at: string }[];
  termsConfirmed: boolean;
  termsAccepted: boolean;
}
export interface PublicInvitation {
  guest?: { name: string; maxCompanions: number };
  id: string;
  modelId: string;
  category: string;
  brief: Brief;
  preview?: boolean;
}
export interface GuestResponse {
  id: string;
  name: string;
  attending: string;
  companions: number;
  children: number;
  dietary: string;
  transport: string;
  comments: string;
  updatedAt: string;
}
export interface Song {
  song: string;
  artist: string;
  createdAt: string;
}
export interface WorkflowConfig {
  brand: string;
  email: string;
  whatsapp: string;
  publicUrl: string;
  total: number;
  deposit: number;
  revisionsIncluded: number;
  activeDays: number;
  deliveryDays: number[];
  provisional: boolean;
  paymentsConfigured: boolean;
  emailConfigured: boolean;
  privacyContact: string;
}
