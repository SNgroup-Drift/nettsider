/** Menyen på design.hengsel.no: sidene i Designfasit. */
export const MENY = [
  ["merke", "Merket", "/merke"],
  ["farger", "Farger", "/farger"],
  ["skrift", "Skrift", "/skrift"],
  ["komponenter", "Komponenter", "/komponenter"],
  ["skjermer", "Skjermer", "/skjermer"],
  ["last-ned", "Last ned", "/last-ned"],
] as const;
export type MenyNokkel = (typeof MENY)[number][0];
