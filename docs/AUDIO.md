# Música: fuentes e instalación local

Identificación de las pistas comprobada el 4 de noviembre de 2026. Se usan enlaces individuales porque el orden de los resultados de búsqueda de Pixabay puede cambiar.

| Autor y pista | Página original | Nombre esperado dentro de `public/assets/audio/` |
| --- | --- | --- |
| AtlasAudio — Piano Romantic | https://pixabay.com/music/solo-piano-piano-romantic-510293/ | `atlasaudio-piano-romantic-510293.mp3` |
| leberch — Romantic Piano | https://pixabay.com/music/beautiful-plays-romantic-piano-584476/ | `leberch-romantic-piano-584476.mp3` |
| PaulYudin — Romantic Piano | https://pixabay.com/music/wedding-romantic-piano-164822/ | `paulyudin-romantic-piano-164822.mp3` |

## Instalar las pistas

1. Abre cada página original y revisa la licencia y las condiciones aplicables a tu descarga y uso.
2. Descarga manualmente el MP3 desde Pixabay. Si se ofrece un certificado o comprobante de licencia, conserva una copia junto a tus registros de descarga.
3. Crea `public/assets/audio/` si no existe y coloca cada archivo con el nombre exacto de la tabla. No reemplaces archivos locales que quieras conservar.
4. Inicia el entorno de desarrollo o vuelve a construir la aplicación si ya la habías compilado. Los recursos de `public/` se incorporan a la salida de construcción.

La aplicación conserva las rutas definidas en `src/music.ts` y la selección de música del editor. La instalación es necesaria para que esas rutas tengan un archivo que reproducir en una copia nueva. En un pedido puede seleccionarse la opción sin música. No se ha implementado detección automática de archivos ausentes; si se selecciona una pista no instalada, el reproductor muestra un error al intentar reproducirla.

Los MP3 están excluidos por `.gitignore`. No uses `git add -f` para volver a introducirlos en el repositorio público. La exclusión de Git no evita que se incluyan en una compilación o despliegue local: revisa las condiciones del uso que vayas a publicar.

## Licencia y evidencia

Las páginas identificadas remiten a la [Pixabay Content License](https://pixabay.com/service/license-summary/). Los [términos completos](https://pixabay.com/service/terms/) permiten usos comerciales y no comerciales sujetos a sus condiciones; restringen la distribución del contenido de forma independiente (standalone). La interpretación y cumplimiento deben considerar la integración concreta de cada uso.

Para evitar tratar los MP3 originales como recursos de libre redistribución junto al código, este repositorio publica las referencias y las instrucciones de instalación; cada persona obtiene la música de su fuente. Estos archivos no se relicencian como MIT. No se afirma que el autor del proyecto haya creado las composiciones ni que Pixabay o sus autores respalden el proyecto.

Conserva por pista la página original, autor, fecha de descarga y certificado o comprobante disponible. Esta documentación identifica las fuentes; no sustituye un comprobante de descarga ni certifica derechos adicionales que no se hayan verificado.

## Historial

Los MP3 estaban registrados en versiones anteriores. El 5 de noviembre de 2026 se publicó un historial saneado en la rama principal, preservando autores, fechas y mensajes de las contribuciones y retirando las rutas de los MP3. Se comprobó la historia alcanzable preparada y el árbol publicado en GitHub. Esto no elimina copias descargadas previamente ni garantiza que el proveedor haya eliminado objetos antiguos de sus cachés; no se ofrece la música original como parte del código público actual.
