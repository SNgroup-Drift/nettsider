# Hengsel Ute – motion

Hengselet åpner seg fra 0 til 18°, og stiften fanger lyset. 3 s, 30 bilder/s, sømløs loop (siste bilde går rett over i første). Bare merkevarefarger, ingen lyd, ingen metadata (ingen c2pa).

| Fil | Bruk |
|---|---|
| `ute-motion-1080x1080.mp4` / `.webm` | hengsel.no/apptest og /ute |
| `ute-motion-1080x1080-plakat.png` | `poster` for 1080 × 1080 |
| `ute-motion-1080x1920.mp4` / `.webm` | App Store-forhåndsvisning, Reels/Stories |
| `ute-motion-1080x1920-plakat.png` | `poster` for 1080 × 1920 |

MP4 er H.264 Baseline, WebM er VP9. 10 Mbit/s.

## På nettsidene
```html
<video autoplay muted loop playsinline width="1080" height="1080" poster="/media/ute-motion-1080x1080-plakat.png" aria-label="Hengsel Ute-ikonet: hengselet åpner seg">
  <source src="/media/ute-motion-1080x1080.webm" type="video/webm">
  <source src="/media/ute-motion-1080x1080.mp4" type="video/mp4">
</video>
```
Ved `prefers-reduced-motion: reduce` vises bare plakaten (fjern `autoplay` eller sett `video.pause()`).

## App Store
App Store krever at en forhåndsvisning er 15–30 s, med oppløsning per enhet (f.eks. 886 × 1920 for iPhone 6,9″). Klippet på 3 s kan ikke lastes opp alene. Bruk det som åpning eller avslutning i en lengre forhåndsvisning, og eksporter den i Apples format.

Kilde: `Ute-motion.dc.html` i Claude Design (kan eksporteres på nytt via Share › Export › Video).
