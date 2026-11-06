import { loadEnv } from "vite";

// Import before the page modules so SSR and the browser use the same settings.
const production = process.argv.includes("--mode=production");
if (production) {
  const values = loadEnv("production", process.cwd(), "VITE_");
  for (const name of [
    "VITE_PUBLIC_ORIGIN",
    "VITE_BUSINESS_WHATSAPP",
    "VITE_BUSINESS_EMAIL",
  ]) {
    if (process.env[name] === undefined && values[name] !== undefined)
      process.env[name] = values[name];
  }
} else {
  // Demo generation must not inherit production contacts from the shell.
  process.env.VITE_BUSINESS_WHATSAPP = "";
  process.env.VITE_BUSINESS_EMAIL = "";
}
