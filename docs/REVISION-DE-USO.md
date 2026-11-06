# Revisión inicial de experiencia de uso

Fecha: 5 de noviembre de 2026. Documento de preparación para definir trabajo futuro; no describe un rediseño ya implementado.

## Necesidad expresada por el propietario

Mejorar cómo el cliente elige, compra y recibe su invitación; simplificar Gestión; mejorar la presentación visual y corregir los textos. La prioridad es hacer comprensible el servicio y la operación diaria.

## Base observada

Se revisaron las capturas locales `flujo-cliente.png` y `flujo-gestion.png`, el documento operativo y el código actual de `src/workflow/Workflow.tsx`. Las capturas son referencias existentes, no una prueba nueva en navegador ni un estudio con clientes. Las observaciones deben contrastarse con un recorrido actual usando datos ficticios.

La aplicación ya tiene selección de diseño, solicitud persistente, cotización y aceptación, aviso y verificación de pago, datos de personalización, revisión, aprobación, publicación y respuestas de invitados. También tiene estados, un indicador de progreso, mensajes de siguiente paso y acciones administrativas limitadas por estado. El trabajo futuro debe mejorar su claridad, no presentar estas capacidades como nuevas.

## Problemas e hipótesis a validar

| Área | Evidencia actual | Mejora a diseñar | Cómo comprobarla |
| --- | --- | --- | --- |
| Siguiente acción del cliente | El portal muestra un mensaje de siguiente paso y cinco pestañas; en varios estados el mensaje indica ir a Pagos o enviar información sin una acción principal asociada en esa misma tarjeta. | Una acción destacada que lleve al lugar correcto, o un estado explícito de espera cuando le corresponde actuar al equipo. | Recorrer cada estado con pedidos ficticios y comprobar que la acción principal coincide con la que realmente puede ejecutarse. |
| Precio y servicio | Cotización, aceptación, pago y datos del evento forman partes del mismo recorrido; no son una descarga inmediata. | Explicar qué se compra, cuánto está confirmado, qué falta y cuándo se entrega, en el momento adecuado. | El resumen de un pedido coincide con sus condiciones guardadas y no muestra un pago avisado como verificado. |
| Confirmaciones | La función genérica de acciones del cliente responde «Listo. Tu pedido se actualizó.»; Gestión usa «Pedido actualizado.». | Mensajes que nombren la acción realizada y su consecuencia: información enviada, aviso de pago recibido, ajustes solicitados o publicación terminada. | Cada acción importante tiene una confirmación específica; errores y operaciones pendientes siguen visibles. |
| Revisión y entrega | El cliente ve «Revisión y entrega»; los estados diferencian revisión, aprobación y publicación. | Distinguir con claridad una vista previa, una versión aprobada y la invitación que ya puede compartirse. | Un pedido en revisión no se presenta como entregado; el publicado expone el enlace de invitados sin confundirlo con el acceso privado. |
| Gestión diaria | La captura de Gestión presenta una gran cabecera y contadores antes de la búsqueda y lista de pedidos. El detalle reúne cotización, pagos y acciones. | Priorizar pedidos que necesitan intervención y una ficha resumida con siguiente acción y bloqueos. | Con varios pedidos ficticios, el operador identifica qué debe verificar, preparar, corregir o entregar sin abrir paneles innecesarios. |
| Tono y etiquetas | Coexisten «Los detalles de su día», «Tu pedido, en números» y títulos promocionales dentro del flujo operativo. | Usar un tratamiento consistente, títulos informativos y botones con verbos concretos; conservar el tono de marca donde ayude. | Revisar un inventario de textos y el recorrido completo en móvil y escritorio. |
| Pantallas pequeñas | Hay capturas móviles previas, pero no se ha validado un nuevo diseño de este alcance. | Mejorar jerarquía, espacios y agrupación en las pantallas que se modifiquen. | Comprobar legibilidad, navegación, foco, formularios, errores y acciones sin desbordamiento en los tamaños acordados. |

## Decisión de producto confirmada

El 5 de noviembre de 2026 Carlos confirmó que se mantendrá el servicio personalizado. El cliente realiza una transferencia por Nequi y se comunica con el equipo; el equipo comprueba el ingreso fuera de la plataforma y prepara la invitación. La plataforma debe explicar ese proceso y reflejar el estado que registre el equipo, sin presentar un aviso del cliente como una verificación bancaria.

Una pasarela de pago y la entrega automática son posibles trabajos posteriores; quedan fuera de este bloque de 20 horas. No se afirma que el programa prohíba toda pasarela: esta es una decisión de alcance para el proyecto actual.

## Límites del futuro trabajo

- Las reglas de acceso, pagos, cupos y publicación deben conservar sus comprobaciones.
- Usar únicamente datos y pagos ficticios durante las pruebas de desarrollo.
- No cambiar precios, condiciones comerciales, número de revisiones o plazos sin una decisión expresa del propietario.
- No atribuir mejoras de conversión o satisfacción a un rediseño sin medirlas.
- Las 23 pruebas existentes y la compilación son la base técnica ya comprobada; las comprobaciones adicionales deberán corresponder al comportamiento que cambie.
- La mejora de UX no elimina la duda de elegibilidad del proyecto frente a la exclusión de datos personales. Esa finalidad debe explicarse en la postulación.

El [roadmap de 20 horas](../ROADMAP.md) especifica pantallas, entregables y criterios de aceptación. No incluye como pendientes la migración de Cloudflare ni las funciones que ya existen.
