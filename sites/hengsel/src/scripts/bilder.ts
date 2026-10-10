/**
 * Skjermbildene i public/img: mål i piksler for Enhet.astro (kilde: Apple-pakken v3, 11.10.2026 (og v2 der v3 mangler filen), se docs/bilder.md).
 * Rammene (ramme-*.webp) er Apples Product Bezels med gjennomsiktig skjermhull; skjermbildene ligger under dem.
 */
/** Bredde og høyde i piksler, så nettleseren kan sette av plass før bildet er lastet */
export const MAAL: Record<string, [number, number]> = {
  "crm-bestilling": [2880, 1800],
  "crm-etterkalkyle": [2880, 1800],
  "crm-min-dag": [2880, 1800],
  "crm-montasje": [2880, 1800],
  "crm-ordre-kontrollmal": [1920, 1080],
  "crm-resultater": [2880, 1800],
  "kundeportalen-pc": [2876, 1796],
  "portal-kjokken": [1206, 2622],
  "ute-avvik": [1206, 2622],
  "ute-ferdig": [1206, 2622],
  "ute-i-dag": [1206, 2622],
  "ute-ipad-bildeverktoy": [2732, 2048],
  "ute-jobb-under": [1206, 2622],
  "ute-ks-kamera": [1206, 2622],
  "ute-ks": [1206, 2622],
  "ute-laser": [1206, 2622],
  "ute-punkter": [1206, 2622],
  "ute-punktkort": [1206, 2622],
  "ute-typeskilt": [1170, 2532]
};

/** Rammene: filnavn og mål (bredde, høyde) i piksler */
export const RAMMER = {
  pc: ["ramme-studio-display", 2160, 1664],
  mac: ["ramme-macbook", 2400, 1565],
  ipad: ["ramme-ipad", 2400, 1740],
  phone: ["ramme-iphone", 1174, 2400],
} as const;

export const src = (fil: string) => `/img/${fil}.webp`;
