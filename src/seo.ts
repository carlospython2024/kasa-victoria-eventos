import { site } from "./config";
import { publicOrigin } from "./logic";
export const htmlEscape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function seoTags(
  route: { path: string; title: string; description: string },
  domain = site.publicUrl,
) {
  const origin = publicOrigin(domain);
  const canonical = origin ? new URL(route.path, origin).href : null;
  return `<title>${htmlEscape(route.title)}</title><meta name="description" content="${htmlEscape(route.description)}"/><meta property="og:type" content="website"/><meta property="og:locale" content="es_CO"/><meta property="og:site_name" content="${htmlEscape(site.name)}"/><meta property="og:title" content="${htmlEscape(route.title)}"/><meta property="og:description" content="${htmlEscape(route.description)}"/><meta name="twitter:card" content="summary_large_image"/>${canonical ? `<link rel="canonical" href="${htmlEscape(canonical)}"/><meta property="og:url" content="${htmlEscape(canonical)}"/><meta property="og:image" content="${origin}/assets/propuesta-bodas-preview.png"/><meta property="og:image:width" content="1024"/><meta property="og:image:height" content="1536"/><meta property="og:image:alt" content="Una pareja celebra su boda en un jardín"/>` : '<meta name="robots" content="noindex,nofollow"/><!-- Configura site.publicUrl y vuelve a compilar para generar canonical y Open Graph con URLs públicas. -->'}`;
}
