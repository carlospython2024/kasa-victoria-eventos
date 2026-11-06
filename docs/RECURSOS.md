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

Durante el diseño se consultó Fixdate como referencia. El 5 de noviembre de 2026 se retiraron del árbol de trabajo las copias de sus páginas HTML, las 105 imágenes de referencia, los inventarios asociados y dos scripts históricos de extracción. Se conservaron 112 archivos, con sus hashes comprobados, en un respaldo local fuera del repositorio. No se usan para construir ni ejecutar la aplicación actual.

El catálogo actual contiene quince diseños configurados en el código del proyecto. El respaldo externo no se publica ni se ofrece bajo MIT. La retirada de los archivos actuales no elimina sus copias en el historial: ese saneamiento sigue pendiente antes de presentar el repositorio como libre de esas copias.

## Música de las invitaciones de matrimonio

Tres MP3 descargados de Pixabay y aportados para el proyecto. Las páginas individuales coinciden con los autores e identificadores de los archivos locales; se comprobaron el 4 de noviembre de 2026. No se dispone aquí de certificados de descarga. Se conservan para la ejecución local en `public/assets/audio/`, pero se excluyen del seguimiento de Git para no redistribuir los archivos originales desde el código fuente público.

- AtlasAudio, `piano-romantic-510293`: Magnolia editorial, Rosa contemporánea y Costa eterna.
- Leberch, `romantic-piano-584476`: Jardín botánico, Oliva serena y Cielo de seda.
- PaulYudin, `romantic-piano-164822`: Memorias de película, Vino de gala, Carta de amor y Noche estrellada.

Las fuentes individuales, condiciones y pasos de instalación están en [AUDIO.md](AUDIO.md). La música mantiene la licencia Pixabay Content License; no queda cubierta por una eventual licencia MIT del código. Conservar los créditos no sustituye el cumplimiento de las condiciones de la fuente.

Esta preparación retira los MP3 de la siguiente versión del árbol de archivos, pero no elimina las copias presentes en commits anteriores. La revisión del historial debe resolverse antes de afirmar que el repositorio público ya no distribuye esos archivos.

La asignación se edita en `src/music.ts`. Audio local con volumen inicial del 35 %, repetición, reproducción únicamente al pulsar el botón, pausa/reanudación y pausa al desmontar la invitación. `preload="none"` evita descargar la canción antes de escucharla.
