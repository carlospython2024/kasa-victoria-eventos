# Recursos de la implementación

Los cinco PNG de `public/assets/` fueron generados mediante la herramienta integrada image_gen para este proyecto. Son arte independiente; no son recortes de los mockups de interfaz.

| Archivo | Uso y dirección del prompt |
| --- | --- |
| `magnolia.png` | Ilustración botánica de una magnolia marfil con hojas oliva y fondo transparente, para el diseño editorial. |
| `rose.png` | Rosa de jardín cereza y coral con tallo largo, ilustración de gouache y fondo transparente. |
| `botanical.png` | Grupo de helecho y orquídea blanca, estética de herbario colombiano y fondo transparente. |
| `couple-garden.png` | Fotografía editorial sintética de una pareja adulta colombiana paseando por un jardín, luz cálida y montañas. |
| `couple-evening.png` | Fotografía editorial sintética de una pareja adulta en una recepción nocturna con velas y tonos vino. |

Los archivos originales generados se conservaron en la carpeta de imágenes de Codex y se copiaron al proyecto. Las personas de las fotografías no son clientes ni testimonios. Las imágenes se usan como ejemplos personalizables.

El diseño infantil utiliza globos y formas en CSS; los demás eventos adicionales combinan tipografía, iconos y las ilustraciones propias. La interfaz completa se construye con HTML y CSS accesibles, sin incrustar pantallas completas como imágenes.

Los iconos son de Lucide React. Poppins y Cormorant Garamond se descargaron de Google Fonts para servirlas localmente. Se conservan sus avisos de licencia en `public/assets/fonts/`.

Los recursos de Fixdate utilizados durante la inspección están en `docs/reference-assets/`, fuera de la salida publicada. No se reutilizan en la interfaz final sus contactos, logotipo ni testimonios. Se sustituyó el catálogo original por los quince diseños configurados en el código actual.

## Música de las invitaciones de matrimonio

Tres MP3 aportados por la usuaria, copiados a `public/assets/audio/`. Se conserva el nombre de autor incluido en cada archivo; no se adjuntaron certificados de licencia.

- AtlasAudio, `piano-romantic-510293`: Magnolia editorial, Rosa contemporánea y Costa eterna.
- Leberch, `romantic-piano-584476`: Jardín botánico, Oliva serena y Cielo de seda.
- PaulYudin, `romantic-piano-164822`: Memorias de película, Vino de gala, Carta de amor y Noche estrellada.

La asignación se edita en `src/music.ts`. Audio local con volumen inicial del 35 %, repetición, reproducción únicamente al pulsar el botón, pausa/reanudación y pausa al desmontar la invitación. `preload="none"` evita descargar la canción antes de escucharla.
