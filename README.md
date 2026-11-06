# Siempre · Invitaciones y gestión de pedidos

React y TypeScript con servidor Node.js 24 y SQLite. Conserva diez diseños de matrimonio, cinco celebraciones adicionales y la identidad Ciruela editorial. «Siempre» continúa como nombre provisional.

## Música en una copia nueva

Los tres MP3 de Pixabay se instalan por separado siguiendo [docs/AUDIO.md](docs/AUDIO.md). Se conservan las rutas y la función de reproducción; los archivos originales no se incluyen en el código público. Si ya tienes los MP3 locales, este cambio los conserva. El 5 de noviembre de 2026 se retiraron también de la historia publicada en la rama principal. La música conserva su propia licencia y no se incorpora a la licencia del código.

## Licencia y recursos

El código propio del proyecto se distribuye bajo la [licencia MIT](LICENSE), a nombre de Carlos Matallana. La música, las fuentes y las dependencias conservan sus propias licencias y avisos; consulta [docs/RECURSOS.md](docs/RECURSOS.md). Las copias de páginas e imágenes de referencia de terceros se conservaron fuera del repositorio y se retiraron del árbol actual y de la historia publicada en la rama principal.

## Próximo trabajo de producto

El [roadmap de 20 horas](ROADMAP.md) propone mejorar elección y solicitud, pago manual y seguimiento, revisión y entrega, Gestión y coherencia visual y de textos. Son mejoras pendientes del flujo existente; el servicio seguirá siendo personalizado y la transferencia Nequi se verificará fuera de la plataforma. No incluye una pasarela de pago ni entrega automática.

## Configuración de ejemplo y del negocio real

El código público no contiene destinatarios Nequi ni contactos reales como valores predeterminados. `pnpm build` y `pnpm build:worker` generan la versión de ejemplo; `pnpm build:worker:production` utiliza la configuración privada del negocio para compilar y empaquetar sin desplegar. Consulta [docs/CONFIGURACION.md](docs/CONFIGURACION.md) antes de preparar una publicación. Las mejoras se comparten en el mismo código; los datos y secretos se configuran aparte.

## Iniciar

En Windows puedes hacer doble clic en `Iniciar.cmd`, o ejecutar `.\Iniciar.cmd` desde PowerShell. Esta opción funciona cuando PowerShell bloquea archivos `.ps1`, sin cambiar la política de ejecución.

```powershell
.\Iniciar.ps1
```

Abre http://127.0.0.1:5173. El mismo proceso sirve la web y su API; los pedidos se guardan en el servidor.

| Ruta | Uso |
| --- | --- |
| `/` | Catálogo comercial |
| `/crear?modelo=jardin-botanico` | Crear solicitud con diseño elegido |
| `/gestion` | Consultas, pedidos, pagos y entrega |
| `/pedido/ID` | Espacio privado del cliente |
| `/vista/ID` | Vista previa privada |
| `/i/nombres-identificador` | Invitación publicada |
| `/privacidad` | Uso de información y contacto |

En la primera visita a Gestión, crea tu propia contraseña de al menos 12 caracteres. No existe una contraseña predeterminada. El alta inicial solo se permite desde el equipo local; en producción requiere el código de instalación del servidor.

## Recorrido completo

1. El cliente selecciona diseño, deja sus datos y propone una vigencia de 30, 90, 180 o 365 días después del evento.
2. Se crea un pedido persistente con enlace privado. El cliente guarda su enlace y puede completar la información en tres secciones.
3. El equipo confirma valor, pago inicial, vigencia, rondas de ajustes y plazo desde Gestión. Los precios generales siguen siendo de referencia; otras celebraciones se cotizan individualmente.
4. El cliente acepta las condiciones y transfiere por Nequi siguiendo las instrucciones confirmadas del pedido. El contacto del negocio y el destinatario se configuran aparte; esta documentación no publica datos de una cuenta real.
5. «Ya pagué» registra un aviso. El equipo comprueba el ingreso y registra valor y referencia única. El aviso del cliente no acredita dinero.
6. Con el pago inicial verificado, el cliente envía sus datos. El equipo los valida y comienza el plazo acordado de 3 a 5 días hábiles.
7. El equipo prepara la invitación y la envía a revisión. El cliente aprueba o solicita ajustes desde su espacio privado.
8. Se publica únicamente con la versión aprobada y el pago completo. Se conserva una copia: editar el borrador no cambia la invitación publicada hasta otra aprobación y publicación.
9. El cliente comparte el enlace y consulta asistencia, alimentación, transporte y canciones. Puede descargar las respuestas en CSV.

El pago inicial predeterminado es el **100 %**. Se puede cambiar a anticipo por pedido antes de recibir pagos. Las rondas se inicializan en dos, pero son editables y deben confirmarse en cada cotización; falta definir la política general del negocio.

## Personalización e invitados

Datos editables: nombres, fecha y hora de Colombia, lugares, direcciones, horarios, fotos, historia, vestimenta, regalos, música, hospedaje, menú, transporte y hashtag. Las bodas usan la primera foto como portada. Las celebraciones conservan sus estilos. Los tres MP3 fueron aportados por la usuaria.

Desde Invitados, después de publicar, se generan enlaces personales con nombre y cupos. Las respuestas se actualizan incluso desde otro dispositivo. Se pueden renovar o revocar. La personalización permite exigir enlaces personales: en ese modo el enlace general no abre el evento.

En el enlace general, una cookie identifica la respuesta del navegador. Una persona que responde desde otro navegador puede aparecer duplicada; el panel lo advierte. Para controlar cupos, utiliza enlaces personales.

El enlace privado del **pedido** administra información y respuestas: nunca se envía a invitados. Si el cliente lo pierde, el equipo verifica su identidad y genera otro en Gestión. Renovarlo revoca accesos anteriores.

## Contacto y correo

El formulario comercial guarda consultas reales en Gestión → Consultas. El correo transaccional utiliza una cola persistente y un adaptador Resend. Si faltan dominio, remitente o clave, no se envía y el panel lo indica. Los botones de WhatsApp preparan el texto; la persona decide enviarlo.

Variables del servidor para correo:

- `PUBLIC_ORIGIN`: origen HTTPS público, sin ruta ni barra final.
- `BUSINESS_EMAIL`: buzón del negocio.
- `EMAIL_FROM`: remitente verificado con el proveedor.
- `RESEND_API_KEY`: clave privada, nunca en el navegador.

Los correos fallidos se pueden volver a poner en cola. «Aceptado por proveedor» no significa leído. En modo local, guarda el enlace privado mostrado al crear el pedido.

## Datos y respaldo

Registros en `var/siempre.sqlite` y fotos en `var/uploads/`, fuera de la carpeta pública. Persisten al cerrar el servidor. El panel del negocio empieza vacío: las pruebas usan otra base.

```sh
node --env-file-if-exists=.env.local --import tsx scripts/backup.ts
```

La copia usa el respaldo de SQLite e incluye fotos y manifiesto en `var/backups/`. Conserva otra copia fuera del servidor con acceso restringido. Para restaurar, detén la aplicación y restaura juntos base y `uploads` de un mismo respaldo en una carpeta nueva; inicia con `DATA_DIR` apuntando allí. Ensaya la restauración por separado antes de depender de ella.

La vigencia desactiva el acceso público. **No borra automáticamente los registros privados.** La conservación y la identidad del responsable deben completarse antes del lanzamiento.

## Construir y publicar

Requiere Node.js 24+. En desarrollo puedes copiar `.env.example` a `.env.local`, sin subirlo al repositorio.

```sh
pnpm install
pnpm test
pnpm build
pnpm start
```

También funciona con npm. `npm run dev` usa Vite y la API. `npm start` sirve compilación y API desde el mismo origen, con audio por rangos y metadatos públicos. `Iniciar.ps1 -Produccion` construye y sirve en el puerto 4173.

**Publicar solo `dist` en alojamiento estático no habilita este flujo.** Se necesita una instancia Node 24 detrás de HTTPS, disco persistente para `DATA_DIR`, reinicio del proceso y copias externas. SQLite no debe almacenarse en disco efímero ni en réplicas independientes.

Variables de producción:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://dominio-real`
- `ADMIN_SETUP_TOKEN`: código largo y aleatorio para el alta inicial; retirarlo después.
- `DATA_DIR`: volumen persistente separado del código publicado.
- `HOST`, `PORT`: interfaz y puerto, por defecto 127.0.0.1:4173.
- `PAYMENT_INSTRUCTIONS`: sustituye instrucciones de Nequi.
- Variables de correo anteriores, cuando se active el proveedor.

El `Dockerfile` usa Node 24 y `/data` como volumen. Requiere dominio, código de instalación y almacenamiento persistente. La construcción con Docker no se ha ejecutado en este equipo.

`src/config.ts` conserva marca, contacto y precios. Configura también `site.publicUrl` con el dominio y vuelve a construir para generar metadatos públicos del catálogo. Pedidos e invitaciones tienen `noindex`.

## Límites operativos

- Nequi se verifica manualmente. No hay conciliación automática, cobro dentro de la web, reembolsos ni facturación electrónica.
- Gestión utiliza un acceso de equipo; el historial distingue Equipo/Cliente, sin usuarios individuales.
- Se edita contenido dentro de los diseños, sin editor de arrastrar elementos.
- Los enlaces personales funcionan por posesión del enlace y se pueden reenviar.
- Hasta ocho fotos, 5 MB por foto, 40 archivos por pedido y 500 enlaces personales.
- Recuperación de acceso de gestión a cargo del operador del servidor.
- Faltan nombre definitivo, dominio, alojamiento, correo, tarifas generales y conservación de datos para el lanzamiento público.

## Verificación

`pnpm test` cubre precios y el flujo HTTP: aislamiento de pedidos, autenticación, origen de solicitudes, fotos, pagos, referencias duplicadas, aprobación, publicación, vigencia, CSV, cupos y revocación. `pnpm build` comprueba tipos del cliente y servidor y genera 18 rutas comerciales/demostrativas y la entrada dinámica.

Las pruebas visuales usan `tmp/workflow-qa/`, nunca `var/`. `qa.html` permite revisar tamaños durante desarrollo. Consulta `docs/FLUJO-OPERATIVO.md` y `docs/RECURSOS.md`.

## Cloudflare (revisión local)

Migración preparada para Workers con Static Assets, D1 y R2. Consulta [la guía de migración](docs/CLOUDFLARE-MIGRATION.md). Ejecuta `pnpm test:all` para validar ambos entornos. No hay despliegue automático.
