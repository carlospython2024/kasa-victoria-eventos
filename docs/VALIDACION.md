# Verificación del flujo · 28 de octubre de 2026

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
