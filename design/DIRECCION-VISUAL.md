# Exploración visual de invitaciones de boda

Fecha: 26 de octubre de 2026.

## Alcance actualizado

Por indicación del usuario, el catálogo final tendrá **10 modelos, no 88**. La implementación de la web queda detenida en la fase de preparación hasta revisar esta exploración. Los archivos de catálogo y recursos obtenidos anteriormente son material de referencia; no representan el catálogo aprobado. En esta etapa se crearon únicamente cinco mockups y documentación, sin avanzar el código de la aplicación.

Cada lámina muestra una portada móvil y una sección interior de una misma invitación. Son imágenes conceptuales estáticas generadas con la herramienta integrada image_gen, no pantallas funcionales ni capturas de una aplicación. Los nombres, fotografías, lugares, horarios y textos del evento son ilustrativos. Los cinco prompts completos están en `prompts.json`.

## Investigación y criterio

Se revisaron los cinco primeros modelos de https://fixdate.io/co/bodas: Magnolias Gold, Vintage, Hojas, Roses y Aurum Wine. Se retienen sus familias emocionales —elegancia floral, fotografía cálida, naturaleza, romanticismo y gala— cambiando composición, ilustraciones, jerarquía, fotografía y tratamiento tipográfico.

Fuentes consultadas:

- Canva, [Design Trends 2026](https://www.canva.com/newsroom/news/design-trends-2026/): texturas, autenticidad visual, narrativa cinematográfica y composiciones editoriales más tranquilas.
- Adobe, [Design trends for 2026](https://www.adobe.com/express/learn/blog/design-trends-2026): experiencias sensoriales, tipografía expresiva, diseño orgánico, narrativa y referencias culturales locales.
- Paperlust, [2026 Wedding Invitation Trends](https://paperlust.co/blog/2026-wedding-invitation-trends/): capas translúcidas, papel texturizado, acabados artesanales e ilustraciones con tipografía editorial.
- THE WED, [10 Major Wedding Stationery & Signage Trends for 2026](https://thewed.com/magazine/major-wedding-stationery-signage-trends-for-2026): transparencia, tipografía protagonista, materiales y apertura interactiva.

Estas publicaciones son señales editoriales y comerciales de tendencias, no una prueba de que un estilo vaya a vender mejor en Colombia. La adaptación digital y las interacciones propuestas a continuación son decisiones de diseño propias. Se priorizan elegancia, lectura y personalidad sobre la acumulación de efectos.

## Cinco propuestas

| Referencia | Concepto propio | Paleta | Diferencia principal |
| --- | --- | --- | --- |
| Magnolias Gold | Magnolia editorial | Marfil #F6F1E7, carbón #292D29, oro antiguo #A58B57 | Magnolia asimétrica de gran escala, nombres editoriales y agenda con dibujo arquitectónico. |
| Vintage | Memorias de película | Café #34251E, crema #F6EAD7, terracota #B56848 | Fotografía documental y relato de la pareja mediante recuerdos fotográficos. |
| Hojas | Jardín botánico | Bosque #173F35, pistacho #DCE4CC, blanco cálido #F4F2E8 | Herbario contemporáneo, vegetación local y mapa ilustrado como identidad de la invitación. |
| Roses | Rosa contemporánea | Rosa #F2DADD, cereza #7E243B, coral #D7897D | Una sola flor protagonista, nombres monumentales y bloques cromáticos. |
| Aurum Wine | Vino de gala | Vino #481D2C, champán #EAD9B7, latón #B79965 | Geometría arquitectónica, fotografía nocturna y una agenda de gala. |

Los colores son valores objetivo para la futura implementación; una imagen generada puede presentar variaciones. Los nombres de colección son provisionales.

## Innovaciones propuestas, todavía no implementadas

1. **Bienvenida personal:** mostrar el nombre del invitado y sus cupos de forma integrada en el diseño, siguiendo el alcance de demostración ya solicitado.
2. **Narración al desplazarse:** cada sección tiene un papel claro —pareja, lugar, agenda, confirmación— y cambia suavemente. Sin bloquear el desplazamiento ni ocultar acciones durante animaciones.
3. **Arte ligado al evento:** ilustración del lugar, monograma de la pareja o vegetación local. El mapa decorativo se complementará con direcciones verificadas y un enlace real de navegación.
4. **Movimiento discreto:** aparición de trazos en Magnolia, transiciones fotográficas en Memorias, revelado de un recorrido en Jardín, entrada suave de la ilustración en Rosa y un brillo breve en Vino. Sin reproducción automática de música; respetar reducción de movimiento.
5. **Confirmación clara:** formulario por etapas cortas con las preguntas configurables del alcance original, acompañado por un acceso visible a la agenda y el mapa.

La página comercial podrá conservar turquesa y amarillo. Cada invitación debe tener su propia paleta; repetir los colores comerciales dentro de todos los modelos reduciría la variedad.

## Revisión de los mockups y ajustes antes de programar

- Las cinco direcciones tienen composiciones diferentes y dos vistas coherentes por modelo.
- Para una pantalla real de 390 px será necesario aumentar varios textos secundarios, verificar contraste, permitir crecimiento del contenido y asegurar controles de al menos 44 px.
- Algunos encabezados de las láminas son muy grandes; se ajustarán con medidas adaptables sin perder su carácter editorial.
- En Jardín la fecha aparece dos veces: conviene conservar una sola y usar el otro espacio para la bienvenida personalizada.
- En Rosa la flor generada se acerca a una peonía; al producir el recurso final se debe elegir conscientemente entre una rosa botánica fiel o renombrar la colección floral.
- La lámina de Memorias muestra el botón en la continuación; en la implementación se añadirá también acceso temprano a confirmación desde la portada.
- Los mapas, lugares y horarios ilustrados no son información geográfica o de evento verificada.
- Las fotografías son sintéticas para esta exploración. La versión personalizada usará las fotografías suministradas por la pareja.
- No se propone usar las láminas completas como fondos de la web. Los textos y controles serán HTML accesible, y el arte se producirá como recursos separados.

## Recomendación

Jardín botánico es la dirección con más oportunidad de identidad local. Magnolia editorial sirve como alternativa sobria y amplia. Memorias de película aporta una opción centrada en las fotografías. Las siguientes cinco propuestas deberían ampliar familias visuales, en lugar de repetir estas con otros colores.

Antes de retomar la implementación, recoger preferencias del usuario sobre estas cinco direcciones y desarrollar la elegida o las elegidas con los ajustes anteriores.
