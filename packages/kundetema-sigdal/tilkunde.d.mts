export interface KundeProfil {
  kunde: string;
  navn: string;
  produkt: string;
  sti: string;
  attributt: string;
  vis: string;
  sider: readonly string[];
  titler: Record<string, string>;
  tekst: readonly (readonly [string, string])[];
}
export function tilKunde(html: string, profil: KundeProfil, opsjoner?: { rot?: string; kunTekstOgLogo?: boolean }): string;
