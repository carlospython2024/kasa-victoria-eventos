# Registro de verificación

Las entradas describen lo comprobado en cada fecha. Para el estado actual deben leerse también las verificaciones posteriores y `CLOUDFLARE-MIGRATION.md`; los límites de una entrada antigua no implican que ese trabajo siga pendiente hoy.

## Verificación del flujo · 28 de octubre de 2026

- TypeScript: cliente y servidor sin errores.
- Quince pruebas correctas: lógica comercial, autenticación, origen de solicitudes, separación de pedidos, fotografía privada, pago inicial configurable, referencias duplicadas, aprobación, publicación, CSV, enlaces personales, cupos, revocación y vigencia.
- Prueba en navegador con base separada: acceso a gestión, revisión del cliente, aprobación, publicación de una invitación con sus datos, envío de asistencia y consulta de esa respuesta en el pedido.
- Versión comercial: 18 rutas prerenderizadas más entrada para rutas dinámicas.
- Formulario de solicitud comprobado en escritorio y a 390 px mediante visor responsive: sin desbordamiento ni imágenes rotas.
- Respaldo real de la base de pruebas y sus imágenes: se abrió la copia y se comprobaron sus pedidos y fotografías.
- Los datos de QA están en `tmp/workflow-qa/`. El panel real de `var/` conserva cero pedidos y no tiene contraseña administrativa creada.

Capturas en `docs/screenshots/`: `flujo-gestion.png`, `flujo-cliente.png` y `flujo-solicitud-movil.png`. Los nombres y pagos de estas capturas son pruebas ficticias, no clientes ni cobros reales.

## Límites de verificación

No se realizó un cobro real en Nequi ni se enviaron correos externos. El adaptador de correo está preparado, pendiente de credenciales y remitente verificado. El servidor se comprobó en Windows con Node 24; no se ejecutó la imagen Docker ni un despliegue público con dominio HTTPS.

Antes de lanzar faltan marca definitiva, dominio, alojamiento persistente, correo y las condiciones generales que el negocio aún debe cerrar. Los pagos actuales se verifican manualmente y cada cotización debe confirmarse antes de cobrar.

## Verificación local · 5 de noviembre de 2026

Carlos ejecutó estos comandos en Windows con Node.js 26.13.0 y pnpm 11.28.11 y compartió sus resultados:

- `pnpm test`: 15 pruebas correctas, sin fallos ni pruebas omitidas.
- `pnpm build`: comprobaciones de TypeScript y compilación de Vite correctas; 18 rutas prerenderizadas. Esta ejecución usó modo local sin dominio público.
- `pnpm test:cloudflare`: compilación del cliente y del Worker correcta; 8 pruebas correctas, sin fallos ni pruebas omitidas. La compilación usó el origen HTTPS configurado para Workers.
- El empaquetado de Wrangler terminó con `--dry-run: exiting now.`; este comando no publicó una nueva versión ni validó por sí solo el comportamiento del servicio remoto.

Son 23 pruebas correctas entre la suite de servidor/lógica y la suite Cloudflare/exportación. Las pruebas de Cloudflare usan Miniflare y recursos de prueba locales. No se certifican mediante estos resultados el envío de correos reales, cobros, recuperación en producción, rendimiento con tráfico real ni compatibilidad con todas las versiones de Node.

La compilación y el despliegue de prueba de Cloudflare ya existen; no deben proponerse como funcionalidades aún no implementadas. Cualquier trabajo futuro debe especificar qué comportamiento adicional o escenario faltante se abordará.

### Revisión de secretos del historial

Gitleaks 8.30.1 revisó las referencias locales accesibles: 9 commits y aproximadamente 1,10 MB de contenido. No detectó secretos. La revisión de rutas registradas encontró únicamente las plantillas `.env.example` y `.dev.vars.example`, sin `.env`, `.dev.vars`, bases SQLite ni archivos de `var/` registrados bajo los patrones inspeccionados.

Este resultado es un control acotado, no una garantía de ausencia absoluta de secretos o datos personales. No cubre todos los archivos ignorados, datos remotos, objetos Git inalcanzables ni derechos sobre recursos de terceros. La retirada actual de los MP3 tampoco elimina sus versiones históricas.

### Separación posterior de configuración pública y privada

Se retiraron los contactos y destinatarios Nequi fijos del código y de la documentación operativa pública. Los valores existentes se conservaron en archivos locales excluidos de Git, sin cambiar la aplicación remota.

`pnpm test:all` pasó 19 pruebas de lógica/servidor/configuración y 9 de Cloudflare/exportación: 28 en total. Las nuevas comprobaciones incluyen aislamiento de contactos en modo demo, configuración pública de producción sin cargar claves del servidor en el prerender, prioridad de variables explícitas y configuración de contactos/pago en ambos servidores.

También pasó `pnpm build:worker:production` con dry-run. Se verificó que el bundle del navegador y la configuración usada por el prerender corresponden al contacto conservado para producción. La compilación demo se inspeccionó y no contenía los números ni el titular conocidos. Estas comprobaciones no implican una publicación remota ni un ensayo con dinero o clientes reales.
