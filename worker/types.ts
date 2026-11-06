export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  PUBLIC_ORIGIN: string;
  ADMIN_SETUP_TOKEN?: string;
  BUSINESS_EMAIL?: string;
  BUSINESS_WHATSAPP?: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
  PAYMENT_INSTRUCTIONS?: string;
}
