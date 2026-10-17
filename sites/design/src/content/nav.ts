/** Menyen på design.hengsel.no: sidene i Designfasit. */
export const MENY = [
  ["merke", "Merket", "/merke"],
  ["farger", "Farger", "/farger"],
  ["skrift", "Skrift", "/skrift"],
  ["komponenter", "Komponenter", "/komponenter"],
  ["skjermer", "Skjermer", "/skjermer"],
  ["monstre", "Mønstre", "/monstre"], // N-5: mønstersidene 29-001–29-006 fra sidekartet
  ["last-ned", "Last ned", "/last-ned"],
] as const;
export type MenyNokkel = (typeof MENY)[number][0];
