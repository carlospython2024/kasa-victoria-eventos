# Próximas 20 horas: un servicio más claro para el cliente y el equipo

Estado: trabajo propuesto, aún no implementado. Alcance acordado con Carlos Matallana el 5 de noviembre de 2026. Las horas son estimaciones de desarrollo y verificación; no son horas ya realizadas ni una promesa de pago.

## Objetivo

Mejorar la experiencia existente desde elegir una invitación hasta recibir su enlace, y simplificar la operación de Gestión. La aplicación ya tiene pedidos, cotización, pagos manuales, datos de personalización, revisión, aprobación, publicación e invitados. El objetivo es reorganizar esas capacidades, mejorar su presentación y corregir instrucciones y textos.

El servicio seguirá siendo personalizado: el cliente transfiere por Nequi y se comunica con el equipo; el equipo verifica el ingreso fuera de la plataforma, registra el estado correspondiente y prepara la invitación. Una notificación del cliente no acredita dinero. La entrega ocurre después de la revisión y de cumplir las condiciones del pedido, no inmediatamente al transferir.

## Recorrido que debe quedar comprensible

Elegir diseño → solicitar y confirmar condiciones → recibir instrucciones de pago → transferir y contactar al equipo → esperar verificación → completar/enviar información → revisar la invitación → recibir el enlace publicado.

Este esquema explica el recorrido; no obliga a bloquear la preparación anticipada de información que ya permite la aplicación. Cada pantalla debe indicar qué puede hacer el cliente, qué está esperando y quién debe actuar.

## Entregables

| Bloque | Estimación | Trabajo pendiente | Criterios de aceptación |
| --- | --- | --- | --- |
| 1. Elección y solicitud | 4 h | Mejorar la jerarquía de catálogo/demostración y el inicio del pedido: diseño elegido, qué incluye el servicio, precio confirmado o necesidad de cotización, y explicación de los pasos siguientes. | El diseño elegido se conserva al solicitar; el resumen distingue un precio orientativo de una cotización confirmada; los campos obligatorios y errores son claros; el formulario funciona en móvil sin desbordamiento. No se modifica la política comercial. |
| 2. Pago manual y seguimiento del cliente | 4 h | Reorganizar el resumen del pedido y sus acciones para explicar Nequi, contacto con el equipo, aceptación de condiciones y espera de verificación. Priorizar una acción pertinente por estado en el portal, utilizando los estados existentes. | Se distingue «pendiente de pago», «aviso recibido» y «pago verificado por el equipo» según los datos reales del pedido. El aviso del cliente nunca confirma dinero. El cliente encuentra la siguiente acción o un mensaje claro de espera; conserva la posibilidad de preparar datos anticipadamente. |
| 3. Revisión y recepción de la invitación | 4 h | Clarificar vista previa, solicitud de ajustes, aprobación, publicación y entrega. Hacer visibles las consecuencias de cada acción y distinguir el enlace del cliente del enlace de invitados. | La vista previa no se presenta como una invitación entregada. Una aprobación no equivale a publicación. El pedido publicado destaca su enlace y la acción de compartirlo; el enlace privado no se ofrece como enlace para invitados. Se conservan los controles existentes de aprobación, versión y saldo. |
| 4. Gestión diaria | 5 h | Reorganizar la lista y ficha de pedidos para priorizar qué necesita atención: cotizar, verificar pago externamente, revisar datos, preparar, resolver ajustes o publicar. Reducir el peso de cabeceras y paneles secundarios y ordenar las acciones existentes. | Con varios pedidos ficticios el operador identifica el pendiente y el responsable. La ficha permite encontrar condiciones, estado de pago y siguiente acción sin recorrer secciones irrelevantes. Las acciones inválidas permanecen bloqueadas y se explica el motivo cuando corresponda. |
| 5. Coherencia visual, textos y comprobación | 3 h | Completar la revisión transversal de títulos, tratamiento al cliente, botones, confirmaciones y errores. Revisar las pantallas modificadas en móvil y escritorio, adaptar las comprobaciones necesarias y documentar el nuevo recorrido. | Los botones nombran acciones concretas y las confirmaciones explican qué cambió. Se revisan foco de teclado, legibilidad y disposición a 390 px y 1440 px. Pasan las suites existentes y la compilación; se añaden o ajustan pruebas solo para los comportamientos modificados. Se documenta un recorrido completo con datos ficticios. |
| **Total estimado** | **20 h** | **Mejoras de uso sobre el producto existente** | **Evidencia: cambios reales, capturas comparables, escenarios verificados y resultados de pruebas.** |

Las modificaciones visuales se realizan en las pantallas de los bloques 1 a 4; el bloque 5 es la revisión transversal final, no un rediseño completo de todo el sitio en tres horas. Si el alcance excede las estimaciones, se acordará una porción funcional menor y se registrará el trabajo real.

## Escenarios de comprobación

1. Solicitud nueva con diseño seleccionado y condiciones todavía sin confirmar.
2. Condiciones confirmadas; cliente acepta y recibe instrucciones de pago.
3. Cliente informa que transfirió, pero el equipo todavía no ha verificado el ingreso.
4. Equipo registra un pago comprobado fuera de la plataforma; la información del evento todavía está incompleta.
5. Información enviada y preparación a cargo del equipo.
6. Versión enviada a revisión; el cliente solicita ajustes o aprueba.
7. Diseño aprobado con un saldo pendiente, si el pedido admite anticipo.
8. Pedido aprobado y pagado; publicación y entrega del enlace de invitados.

Estos escenarios usarán identidades, referencias y pagos ficticios. No requieren recibir dinero, conectar una cuenta de Nequi ni cargar datos de clientes reales.

## Fuera de este bloque

- Pasarela de pago, conciliación bancaria, cobros dentro de la aplicación y confirmación automática de transferencias.
- Generación o entrega automática del producto sin intervención del equipo.
- Cambios de precios, políticas de ajustes, condiciones comerciales o plazos sin una decisión del propietario.
- Migración de Cloudflare, implementación inicial de pedidos o creación de las pruebas que ya existen: ese trabajo ya se hizo.
- Incorporación de modelos de IA, entrenamiento, inferencia o infraestructura de machine learning.

## Base técnica y preparación

El 5 de noviembre de 2026 se verificaron 15 pruebas de lógica/servidor, 8 de Cloudflare/exportación y las compilaciones correspondientes. El empaquetado de Workers fue un dry-run. Estos resultados son la base existente, no entregables pendientes de este roadmap. Ver [VALIDACION.md](docs/VALIDACION.md) y [REVISION-DE-USO.md](docs/REVISION-DE-USO.md).

Licencia, revisión de recursos de terceros, saneamiento del historial y preparación del formulario se gestionan aparte. La presentación debe describir honestamente la finalidad del producto y su futuro uso con datos de clientes e invitados; este roadmap no certifica elegibilidad ni aceptación del programa. Las sesiones propuestas usarán únicamente datos ficticios.
