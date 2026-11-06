# Un código, configuración de ejemplo y de producción

El código es el mismo para la revisión pública y el servicio real. La diferencia está en la configuración y los datos usados, no en dos aplicaciones con cambios separados.

## Comandos de ejemplo

- `pnpm build`: compila el frontend en modo `demo` y genera las páginas sin contactos privados.
- `pnpm build:worker`: construye y empaqueta el Worker con `wrangler.jsonc` y `--dry-run`; no despliega.
- `pnpm test:all`: ejecuta los escenarios de prueba y el empaquetado de ejemplo con datos ficticios.

El modo demo no carga archivos `.env` en Vite y elimina los contactos públicos heredados al prerenderizar. No debe usarse como configuración de publicación del negocio real.

En el servidor, sin `PAYMENT_INSTRUCTIONS` no hay destinatario Nequi predeterminado y `/api/config` informa `paymentsConfigured: false`. Los pedidos existentes conservan las instrucciones que ya tenían guardadas; cambiar la configuración no los reescribe.

## Archivos privados de producción

Los siguientes archivos locales están excluidos de Git:

| Archivo | Contenido y uso |
| --- | --- |
| `.env.production.local` | Contactos públicos para la compilación real (`VITE_BUSINESS_WHATSAPP`, `VITE_BUSINESS_EMAIL` y `VITE_PUBLIC_ORIGIN`). Puede conservar también la configuración del servidor Node. |
| `wrangler.production.jsonc` | Configuración del Worker real, sus recursos y variables como `BUSINESS_WHATSAPP`, `BUSINESS_EMAIL` y `PAYMENT_INSTRUCTIONS`. No debe contener contraseñas ni claves de API. |
| `.dev.vars` | Variables del desarrollo local con Wrangler; no se publica ni se incorpora automáticamente a los despliegues. |

Se conservaron los valores reales existentes al realizar esta separación. No los reemplaces al copiar plantillas. Para otra instalación, utiliza `.env.example` y `wrangler.production.example.jsonc` como guía y configura tus propios valores y recursos.

El contacto de compilación `VITE_BUSINESS_WHATSAPP` y el contacto del Worker `BUSINESS_WHATSAPP` deben corresponder al mismo negocio. Lo mismo aplica al correo público si se configura. El origen público del frontend y el del Worker deben coincidir. Si se cambia alguno, actualizar ambos archivos antes de construir la publicación.

## Comprobar la compilación real

```powershell
pnpm.cmd build:worker:production
```

Este comando selecciona `wrangler.production.jsonc`, compila el frontend en modo producción y realiza únicamente un empaquetado `--dry-run`. Lee los contactos de `.env.production.local` también durante la generación de HTML. **No publica cambios**.

El comando de publicación debe usar la misma configuración privada y una compilación real recién verificada. No publicar `dist` generado en modo demo. La publicación y cualquier cambio de variables remotas se revisan por separado antes de ejecutarlos. Esta preparación no cambió la página desplegada, D1, R2 ni los secretos de Cloudflare.

## Datos públicos y secretos

El WhatsApp, el correo de contacto y las instrucciones de pago que se muestran al cliente son información de la aplicación. Retirarlos del código fuente no los oculta a quienes usan la página real.

Las variables `VITE_*` se incorporan al navegador: nunca deben contener claves de API, contraseñas, tokens administrativos ni datos de clientes. Las claves del servidor se mantienen en los secretos de Cloudflare o en el entorno privado del servidor Node. No copiar pedidos, fotografías, bases de datos o registros reales al repositorio.

Antes de subir cambios, comprobar que Git no registre los archivos privados. Las plantillas contienen solo nombres y ejemplos; no deben copiarse sobre archivos configurados sin revisar. La limpieza de copias anteriores en el historial requiere un procedimiento independiente.

Referencias: [Vite: variables y modos](https://vite.dev/guide/env-and-mode), [Cloudflare: secretos y desarrollo local](https://developers.cloudflare.com/workers/configuration/secrets/).
