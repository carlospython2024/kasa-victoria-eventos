# Music: Sources and Local Installation

Track identification verified on November 4, 2026. Individual links are used because the order of Pixabay search results may change.

| Artist and Track | Original Page | Expected Filename in `public/assets/audio/` |
| --- | --- | --- |
| AtlasAudio — Piano Romantic | https://pixabay.com/music/solo-piano-piano-romantic-510293/ | `atlasaudio-piano-romantic-510293.mp3` |
| leberch — Romantic Piano | https://pixabay.com/music/beautiful-plays-romantic-piano-584476/ | `leberch-romantic-piano-584476.mp3` |
| PaulYudin — Romantic Piano | https://pixabay.com/music/wedding-romantic-piano-164822/ | `paulyudin-romantic-piano-164822.mp3` |

## Installing the Tracks

1. Open each original page and review the license and terms applicable to your download and use.
2. Manually download the MP3 from Pixabay. If a license certificate or proof is offered, keep a copy with your download records.
3. Create `public/assets/audio/` if it does not exist, and place each file there using the exact filename from the table. Do not replace local files you want to keep.
4. Start the development environment or rebuild the application if it has already been built. Assets in `public/` are included in the build output.

The application preserves the paths defined in `src/music.ts` and the editor's music selection. Installation is necessary for those paths to resolve to playable files in a fresh checkout. An order can use the no-music option. Automatic detection of missing files has not been implemented; if an uninstalled track is selected, the player displays an error when playback is attempted.

MP3 files are excluded by `.gitignore`. Do not use `git add -f` to reintroduce them into the public repository. Git exclusion does not prevent their inclusion in a local build or deployment: review the terms for the use you plan to publish.

## License and Evidence

The identified pages refer to the [Pixabay Content License](https://pixabay.com/service/license-summary/). The [full terms](https://pixabay.com/service/terms/) allow commercial and noncommercial uses subject to their conditions and restrict standalone distribution of the content. Interpretation and compliance must consider how each use is actually integrated.

To avoid treating original MP3 files as assets freely redistributable with the code, this repository publishes references and installation instructions; each person obtains the music from its source. These files are not relicensed under MIT. No claim is made that the project author created the compositions or that Pixabay or its contributors endorse the project.

For each track, retain the original page, artist, download date, and any available certificate or proof. This documentation identifies the sources; it does not replace proof of download or certify additional rights that have not been verified.

## History

MP3 files were tracked in earlier versions. On November 5, 2026, a cleaned history was published on the main branch, preserving contribution authors, dates, and messages while removing MP3 paths. The prepared reachable history and the tree published on GitHub were checked. This does not remove previously downloaded copies or guarantee that the provider has removed old objects from its caches; the original music is not offered as part of the current public source code.
