# Migración a Cloudflare — revisión antes de publicar

Estado: implementación local en `feature/cloudflare-migration`. La cuenta ya dispone de D1 `kasa-victoria` y R2 privado `kasa-victoria-bucket`, creados por el usuario. El esquema `0001_initial.sql` ya se aplicó a esa D1 y se verificó que pedidos, fotos y respuestas siguen vacíos. No se han importado datos de clientes ni cambiado DNS. El primer despliegue de prueba en Workers se realizó con autorización del usuario el 30 de octubre de 2026.

## Arquitectura

Se usa **Workers con Static Assets + D1 + R2**, bajo un mismo origen. Workers publica el mismo frontend que se podría alojar en Pages y atiende `/api/*`, las páginas privadas y los enlaces de invitación. Así no hacen falta CORS, cookies entre dominios ni una segunda aplicación de Pages. El frontend conserva las 18 páginas prerenderizadas, música y diseños.

- `worker/application.ts`: port asíncrono del flujo de `server/app.ts`; pedidos, Nequi manual, revisión, publicación, invitados privados, RSVP, CSV y consultas.
- `worker/store.ts`: escrituras agrupadas con `D1.batch()`. Una comprobación de versión dentro del mismo lote rechaza cambios simultáneos y revierte auditoría/correos. Las referencias de pago tienen unicidad global; las subidas comprueban cupo y etapa dentro del lote.
- `worker/index.ts`: entrada Fetch, páginas de invitación con metadatos, seguridad HTTP y tarea programada de correos/limpieza cada cinco minutos.
- R2 permanece **privado**. Las fotos pasan por la autorización de `/api/media/:id`; no se debe habilitar `r2.dev` ni un dominio público del bucket. Las rutas y claves existentes se conservan.
- `migrations/0001_initial.sql`: esquema equivalente a SQLite e índices para D1. La búsqueda pública usa un índice de slug en vez de leer todos los pedidos.
- El servidor Node original continúa disponible para respaldo local. Al cambiar reglas de negocio, mantener ambos flujos y sus pruebas sincronizados.

## Revisión local (sin cuenta de Cloudflare)

Node 24 o superior y pnpm 11. Las versiones están fijadas en el lockfile. `workerd` y `esbuild` necesitan ejecutar sus instaladores, autorizados en `pnpm-workspace.yaml`.

```powershell
pnpm install --frozen-lockfile
pnpm test:all
pnpm db:migrate:local
if (-not (Test-Path .dev.vars)) { Copy-Item .dev.vars.example .dev.vars }
pnpm dev:cloudflare
```

Abrir `http://localhost:8787`. `.dev.vars` solo se copia si todavía no existe; conservar cualquier configuración propia. El código permite HTTP únicamente para localhost/127.0.0.1. Producción exige HTTPS. La instalación de administración desde localhost está habilitada en `/gestion`; producción exige el código secreto de instalación.

`pnpm build:worker` compila el frontend, comprueba TypeScript y ejecuta **solamente** `wrangler deploy --dry-run`. No publica. La suite de Cloudflare ejecuta el código empaquetado en workerd con D1 y R2 locales; no simula estas bases mediante mapas en memoria.

## Datos existentes: paquete offline

Antes del corte definitivo, detener escrituras en el servidor anterior y crear una copia de seguridad. El exportador toma una instantánea consistente de SQLite mediante su API de backup y copia las fotos referenciadas. No modifica la base original ni contacta Cloudflare. Mantener el servidor en pausa durante la copia de fotos para que el paquete corresponda al mismo momento.

```powershell
pnpm export:cloudflare --source var --out var/cloudflare-review-01
```

Si ya se enviaban correos desde un origen anterior, añadir ambos parámetros para actualizar únicamente los enlaces guardados en el correo:

```powershell
pnpm export:cloudflare --source var --out var/cloudflare-review-02 --old-origin https://dominio-anterior.example --origin https://dominio-nuevo.example
```

El directorio de salida debe ser nuevo y su carpeta padre debe existir. Contiene `snapshot.sqlite`, `data.sql`, `manifest.json` con recuentos y SHA-256, y `uploads/`. Es información privada; mantenerla fuera de Git y del directorio público. Un fallo deja un paquete incompleto: corregir la causa y repetir en un directorio nuevo. No importar paquetes sin manifest final.

Se conservan pedidos, versiones publicadas, auditoría, fotografías, invitados, respuestas, canciones, consultas, correos y sesiones de clientes aún vigentes. Se reconstruye el índice de referencias de pago y se rechazan duplicados. Se omiten límites temporales y sesiones administrativas.

**Administración:** el hash scrypt del servidor anterior no se importa. Workers usa PBKDF2 SHA-256 mediante Web Crypto, sal aleatoria y comparación de tiempo constante. Después del corte habrá que establecer una contraseña nueva usando `ADMIN_SETUP_TOKEN`; quitar ese secreto al terminar. No editar ni borrar el administrador en la base original. Los enlaces privados de clientes siguen siendo válidos; las cookies del dominio anterior no se trasladan a un dominio nuevo.

Ensayar el paquete contra almacenamiento local vacío (si ya hay datos locales, usar otro directorio `--persist-to` en TODOS los comandos y en `wrangler dev`):

```powershell
pnpm exec wrangler d1 migrations apply kasa-victoria --local
pnpm exec wrangler d1 execute kasa-victoria --local --file var/cloudflare-review-01/data.sql
pnpm import:media:cloudflare --package var/cloudflare-review-01
```

El importador de fotos verifica todos los tamaños y hashes antes de empezar; usa R2 LOCAL por defecto. No sobrescribir una base D1 con datos existentes. Revisar los recuentos del manifest, fotografías, enlaces privados, pagos y respuestas en el ensayo. La importación de SQL y R2 no es una sola transacción: completar ambas antes de abrir tráfico.

## Procedimiento de publicación — primer despliegue de prueba realizado

1. Revisar cambios, pruebas, nombre del Worker, dominio, marca y datos de pago. `business.demo` sigue reflejando la configuración comercial original; revisar precios y textos antes de abrir ventas.
2. Crear una base D1 y un bucket R2 **Standard** privados desde la cuenta elegida. Sustituir `database_id` de ejemplo y nombres en `wrangler.jsonc`. No introducir credenciales en Git.
3. Configurar `PUBLIC_ORIGIN` con el dominio HTTPS definitivo sin barra final. Compilar con `VITE_PUBLIC_ORIGIN` igual al mismo dominio; esto genera canonical, Open Graph y robots públicos. Sin este valor, las páginas comerciales permanecen en modo noindex. `pnpm build:worker` toma automáticamente el dominio de `PUBLIC_ORIGIN` y lo usa tanto en Vite como en el HTML prerenderizado; no requiere configurar una segunda variable manualmente.
4. Crear `ADMIN_SETUP_TOKEN` aleatorio mediante `wrangler secret put ADMIN_SETUP_TOKEN`. Configurar opcionalmente `BUSINESS_EMAIL`, `EMAIL_FROM`, `RESEND_API_KEY` y `PAYMENT_INSTRUCTIONS`. Solo `VITE_PUBLIC_ORIGIN` es público; nunca prefijar secretos con `VITE_`. Resend requiere su propia cuenta/dominio verificado y cuotas.
5. En la base REMOTA VACÍA, aplicar migraciones y luego el paquete final aprobado. Los comandos son `pnpm exec wrangler d1 migrations apply kasa-victoria --remote` y `pnpm exec wrangler d1 execute kasa-victoria --remote --file <paquete>/data.sql`.
6. Importar fotos con `pnpm import:media:cloudflare --package <paquete> --remote`. Si se cambió el bucket, añadir `--bucket <nombre>`. Validar recuentos y objetos antes de permitir tráfico. Los comandos remotos de este apartado requieren revisión previa y no forman parte de las pruebas.
7. Solo después de revisión, ejecutar manualmente `pnpm exec wrangler deploy`. No se ha añadido despliegue automático por GitHub. Configurar dominio/DNS y, si se usa solo dominio propio, decidir si desactivar `workers_dev`.
8. Crear el administrador con contraseña nueva, eliminar `ADMIN_SETUP_TOKEN`, comprobar sesión, subida/lectura privada, flujo de Nequi, invitación pública/privada, RSVP, CSV y correo programado. Confirmar que una solicitud con otro Origin obtiene 403. Revisar consumo real de CPU en Workers Free: las pruebas locales no validan cuotas remotas.

Los correos se procesan de cinco en cinco cada cinco minutos si está configurado Resend. Los fallos quedan visibles en gestión y conservan la opción de reintento manual. La clave de idempotencia se mantiene por mensaje.

## Coste y límites

La arquitectura puede mantenerse dentro de cuotas gratuitas, pero **R2 no es un límite de gasto de cero dólares**: cobra excedentes. No habilitar Workers Paid por esta migración. Revisar métricas de D1, Workers y R2 y alertas de facturación antes de abrir tráfico; las alertas no bloquean gasto. No se crean reglas automáticas que borren fotos de clientes.

Referencias oficiales consultadas el 30 de octubre de 2026:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/): solicitudes estáticas gratuitas; las que ejecutan API cuentan como Workers.
- [Límites de Workers](https://developers.cloudflare.com/workers/platform/limits/): Free incluye 100.000 solicitudes diarias y 10 ms de CPU por invocación HTTP. Las cuotas locales no equivalen a producción.
- [D1](https://developers.cloudflare.com/d1/platform/pricing/): Free incluye 5 millones de filas leídas/día, 100.000 escritas/día y 5 GB totales. Cada base gratuita tiene límites propios adicionales.
- [R2 Standard](https://developers.cloudflare.com/r2/pricing/): 10 GB-mes, 1 millón de operaciones A y 10 millones B/mes; transferencia saliente gratuita. Excedentes facturables.
- [Transacciones D1 mediante batch](https://developers.cloudflare.com/d1/worker-api/d1-database/), [API de R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) y [Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/).

## Reversión

No borrar el servidor anterior ni sus copias. Antes de recibir nuevas escrituras en Cloudflare, se puede restaurar el dominio al origen anterior y arrancar su base intacta. Después de recibir pedidos o respuestas nuevos en Cloudflare, detener escrituras y exportar/reconciliar D1 y R2 antes de volver; cambiar solo DNS perdería esos cambios. La reversión de código de Workers no revierte los datos D1 ni R2.

## Validación realizada

- 15 pruebas originales y 8 pruebas Cloudflare/exportación aprobadas (23 en total). Incluyen el flujo completo, aislamiento, fotos privadas, vencimiento, CSV, login/cookies/CSRF, colisiones de versión y de referencia Nequi entre pedidos distintos.
- Exportación e importación de un paquete de prueba, con hash de fotos y carga a R2 local en almacenamiento temporal aislado. No se exportaron ni subieron los datos reales de clientes.
- Compilación TypeScript/React, 18 rutas prerenderizadas y empaquetado de Worker mediante dry-run. También se compiló con un dominio público de prueba para comprobar canonical/robots.
- Migración SQL aplicada a D1 local; comprobación HTTP con Wrangler de inicio, gestión, API, páginas inexistentes, redirecciones y cabeceras de seguridad.
- No se han medido cuotas/CPU en producción ni enviado correos reales. El circuito de Resend conserva el mecanismo original y requiere credenciales y prueba posterior.

## Dirección inicial elegida

Se verificó el subdominio de la cuenta mediante consulta de solo lectura y se eligió `https://kasa-victoria-eventos.invitaciones-kv.workers.dev`. La dirección ya está en `PUBLIC_ORIGIN`; el Worker ya está publicado con ese nombre. Se preparó un código de instalación aleatorio en `var/cloudflare-production-secrets.json`, excluido de Git. El código se cargó como secreto en Cloudflare durante la publicación autorizada; el usuario debe usarlo para crear su contraseña en `/gestion`. Eliminar el secreto de instalación una vez configurada la administración.

## Primera publicación de prueba — 30 de octubre de 2026

- URL: https://kasa-victoria-eventos.invitaciones-kv.workers.dev
- Versión: `c4761ec5-030f-437f-915b-5fdc964593d6`. D1 y R2 conectados; tarea programada cada cinco minutos.
- Verificación remota: inicio, creación de invitación, gestión y API responden 200; una ruta inexistente responde 404.
- Se creó un pedido sintético sin datos personales reales, se comprobó sesión de cliente, persistencia D1 y subida/lectura de PNG en R2. Un visitante sin sesión recibió 401 para el pedido y la foto. Un origen distinto recibió 403.
- El pedido sintético, su sesión, auditoría, correo pendiente, metadatos y objeto R2 fueron retirados. Se verificó ausencia de esos registros. No se importaron datos del proyecto local.
- Instalación de administración protegida por código aleatorio: un código incorrecto respondió 403. Falta que el usuario establezca su contraseña desde `/gestion`; el login con contraseña real todavía no se ha probado en producción.
- Correos reales pendientes de configurar y verificar. La aplicación sigue con los precios, instrucciones de pago y modo comercial de la configuración original; esta publicación es para pruebas.

## Corrección del subdominio a invitaciones-kv — 30 de octubre de 2026

El usuario cambió el subdominio de la cuenta a `invitaciones-kv`. Se actualizó `PUBLIC_ORIGIN`, se recompiló el frontend y se publicó la versión `2f4f0c26-a6a0-4b78-9ab2-01e4ea01d0cb`. Se verificaron respuestas 200 en inicio, creación de invitación, configuración y estado de acceso; la API confirma el origen HTTPS nuevo. D1 y R2 se conservaron.
