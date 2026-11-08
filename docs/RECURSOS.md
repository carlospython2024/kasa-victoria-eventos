# Implementation Assets

The five PNG files in `public/assets/` were generated for this project using the built-in image_gen tool. They are standalone artwork, rather than crops from interface mockups.

| File | Use and Prompt Direction |
| --- | --- |
| `magnolia.png` | Botanical illustration of an ivory magnolia with olive leaves and a transparent background, for the editorial design. |
| `rose.png` | Cherry and coral garden rose with a long stem, gouache illustration with a transparent background. |
| `botanical.png` | Fern and white orchid arrangement, Colombian herbarium aesthetic with a transparent background. |
| `couple-garden.png` | Synthetic editorial photograph of an adult Colombian couple walking in a garden, with warm light and mountains. |
| `couple-evening.png` | Synthetic editorial photograph of an adult couple at an evening reception with candles and wine tones. |

The original generated files were retained in the Codex images folder and copied into the project. The people in the photographs are not clients or testimonials. The images serve as customizable examples.

The children's design uses CSS balloons and shapes; the other additional events combine typography, icons, and original illustrations. The complete interface is built with accessible HTML and CSS, without embedding full screens as images.

Icons are from Lucide React. Poppins and Cormorant Garamond were downloaded from Google Fonts for local hosting. Their license notices are retained in `public/assets/fonts/`.

Fixdate was consulted as a reference during design. On November 5, 2026, copies of its HTML pages, 105 reference images, associated inventories, and two historical extraction scripts were removed from the working tree. A total of 112 files, with verified hashes, were preserved in a local backup outside the repository. They are not used to build or run the current application.

The current catalog contains fifteen designs configured in the project's code. The external backup is neither published nor offered under MIT. On November 5, 2026, the main branch history cleanup was published, and the removed paths were confirmed absent from its reachable history.

## Wedding Invitation Music

Three MP3 files downloaded from Pixabay and supplied for the project. The individual pages match the artists and identifiers of the local files; they were checked on November 4, 2026. Download certificates are not available here. The files are retained for local execution in `public/assets/audio/`, but excluded from Git tracking to avoid redistributing the original files through the public source code.

- AtlasAudio, `piano-romantic-510293`: Magnolia editorial, Rosa contemporánea, and Costa eterna.
- Leberch, `romantic-piano-584476`: Jardín botánico, Oliva serena, and Cielo de seda.
- PaulYudin, `romantic-piano-164822`: Memorias de película, Vino de gala, Carta de amor, and Noche estrellada.

Individual sources, terms, and installation steps are in [AUDIO.md](AUDIO.md). Music retains the Pixabay Content License; it is not covered by any MIT license for the code. Retaining credits does not replace compliance with the source's terms.

The three MP3 files were removed from the public tree and the main branch's reachable history in the cleanup published on November 5, 2026. They remain in the local environment for running and building the application with music, subject to their source's terms.

Assignments are edited in `src/music.ts`. Local audio starts at 35% volume, loops, plays only after pressing the button, supports pause/resume, and pauses when the invitation unmounts. `preload="none"` avoids downloading the song before listening.
