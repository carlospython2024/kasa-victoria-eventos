import React from "react";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { renderToString } from "react-dom/server";
import { App } from "../src/App";
import { site } from "../src/config";
import { models } from "../src/data";
import { celebrations } from "../src/celebrations";
import { publicOrigin } from "../src/logic";
import { seoTags } from "../src/seo";

const dist = resolve("dist");
const template = readFileSync(resolve(dist, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>'))
  throw new Error(
    "La salida ya fue prerenderizada. Ejecuta vite build antes de volver a generar las rutas.",
  );
writeFileSync(resolve(dist, "workflow.html"), template);
const origin = publicOrigin();
const routes = [
  {
    path: "/",
    title: `${site.name} · Invitaciones digitales para cada celebración`,
    description:
      "Diez diseños de matrimonio y cinco celebraciones especiales. Encuentra su estilo y explora las invitaciones de demostración.",
  },
  {
    path: site.proposalPath,
    title: `Propuesta de bodas Colombia · ${site.name}`,
    description:
      "Conoce los diseños, funciones, condiciones de pago y entrega de nuestras invitaciones digitales de boda. Propuesta demostrativa con tarifas de ejemplo.",
  },
  {
    path: "/demo/boda",
    title: "Ana y Mateo · Invitación de boda de demostración",
    description:
      "Una invitación de boda para explorar todas las funciones de demostración.",
  },
  ...models.map((m) => ({
    path: m.demo,
    title: `${m.name} · Invitación de boda de demostración`,
    description: m.description,
  })),
  ...celebrations.map((e) => ({
    path: `/celebraciones/${e.id}`,
    title: `${e.category} · ${e.design} · ${site.name}`,
    description: e.intro,
  })),
];
for (const route of routes) {
  let html = template
    .replace(/<title>.*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*\/>/, "");
  const metas = seoTags(route);
  html = html
    .replace("</head>", metas + "</head>")
    .replace(
      '<div id="root"></div>',
      `<div id="root">${renderToString(<App path={route.path} />)}</div>`,
    );
  const target = resolve(dist, route.path.slice(1), "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}
if (existsSync(resolve(dist, "assets/couple-garden.png")))
  copyFileSync(
    resolve(dist, "assets/couple-garden.png"),
    resolve(dist, "assets/propuesta-bodas-preview.png"),
  );
writeFileSync(
  resolve(dist, "404.html"),
  template.replace(
    '<div id="root"></div>',
    '<div id="root"><main><h1>Página no disponible</h1><a href="/">Volver al inicio</a></main></div>',
  ),
);
writeFileSync(
  resolve(dist, "robots.txt"),
  origin ? "User-agent: *\nAllow: /\n" : "User-agent: *\nDisallow: /\n",
);
// Hosts such as Cloudflare Pages and Netlify can preserve physical route HTML
// through these canonical trailing-slash redirects instead of a global SPA rewrite.
writeFileSync(
  resolve(dist, "_redirects"),
  routes
    .filter((r) => r.path !== "/")
    .map((r) => `${r.path} ${r.path}/ 301`)
    .join("\n") + "\n",
);
console.log(
  `Prerenderizadas ${routes.length} rutas. ${origin ? "Dominio público: " + origin : "Modo local: dominio público pendiente; metadatos públicos se habilitan al configurarlo."}`,
);
