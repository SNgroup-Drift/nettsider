/**
 * Leser Hengsel-designsystemets tokens (public/ds/tokens/hengsel.tokens.json, pinnet commit, se designsystem.pin.json) og gjør dem om til det siden viser:
 * roller, statustoner, kontrast, CSS-klasser for fargeflater og to temaflater (lys og mørk) som kan stå side om side uansett utgaven på siden.
 * Ingenting her er skrevet for hånd: endres JSON-en, endres siden. scripts/design-fasit.test.mjs sjekker at siden og tokens samsvarer.
 */
import json from "../../public/ds/tokens/hengsel.tokens.json";
import pin from "../../designsystem.pin.json";

export type Modus = "lys" | "mork";
export const MODI: Modus[] = ["lys", "mork"];
export const tokens = json;
export const designsystem = { versjon: json.versjon, dato: json.dato, commit: pin.commit, repo: pin.repo };

const uten$ = <T extends object>(o: T) => Object.entries(o).filter(([k]) => !k.startsWith("$")) as [string, any][];

export const palett = uten$(json.palett).map(([navn, hex]) => ({ navn, hex: hex as string }));
export const roller = uten$(json.farge).map(([navn, v]) => ({ navn, lys: v.lys as string, mork: (v.mork ?? v.lys) as string, bruk: v.bruk as string }));
export const status = uten$(json.status).map(([navn, v]) => ({ navn, lys: v.lys as TonePar, mork: (v.mork ?? v.lys) as TonePar }));
export type TonePar = { fg: string; bg: string; kant: string };

// ── Farger og kontrast (WCAG 2.x). Gjennomsiktige farger blandes over flaten de ligger på. ───────────────────────────
export type Rgba = { r: number; g: number; b: number; a: number };
export function lesFarge(tekst: string): Rgba {
  const t = tekst.trim();
  let m = /^#([0-9a-f]{6})$/i.exec(t);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[,/]\s*([\d.]+))?\s*\)$/i.exec(t);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  throw new Error(`Ugyldig farge: «${tekst}»`);
}
const over = (f: Rgba, bunn: Rgba): Rgba => ({ r: f.r * f.a + bunn.r * (1 - f.a), g: f.g * f.a + bunn.g * (1 - f.a), b: f.b * f.a + bunn.b * (1 - f.a), a: 1 });
const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (c: Rgba) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
export function kontrast(forgrunn: string, bakgrunn: string, under = "#000000"): number {
  const bak = over(lesFarge(bakgrunn), lesFarge(under));
  const fg = over(lesFarge(forgrunn), bak);
  const [a, b] = [lum(fg), lum(bak)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export const rolle = (navn: string, modus: Modus) => {
  const r = roller.find((x) => x.navn === navn);
  if (!r) throw new Error(`Ukjent rolle ${navn}`);
  return r[modus];
};
export const tilHex = (farge: string) => {
  const c = lesFarge(farge);
  return c.a === 1 ? `#${[c.r, c.g, c.b].map((n) => n.toString(16).toUpperCase().padStart(2, "0")).join("")}` : farge;
};

// ── Kontrastpar: hver rad er en tekst- eller grafikkfarge på en flate, i begge utgaver ──────────────────────────────
export type Par = { id: string; hva: string; fg: string; bg: string; krav: 4.5 | 3 };
/** `fg` og `bg` er rollenavn (flate/tekst i hver utgave), `fgTone`/`bgTone` bruker statustone. */
export const KONTRASTPAR: Par[] = [
  { id: "tekst-side", hva: "Tekst på siden", fg: "tekst", bg: "flate-side", krav: 4.5 },
  { id: "tekst-kort", hva: "Tekst på kort", fg: "tekst", bg: "flate-kort", krav: 4.5 },
  { id: "tekst-senket", hva: "Tekst på senket flate", fg: "tekst", bg: "flate-senket", krav: 4.5 },
  { id: "tekst-valgt", hva: "Tekst på valgt flate", fg: "tekst", bg: "flate-valgt", krav: 4.5 },
  { id: "dempet-side", hva: "Dempet tekst på siden", fg: "tekst-dempet", bg: "flate-side", krav: 4.5 },
  { id: "dempet-kort", hva: "Dempet tekst på kort", fg: "tekst-dempet", bg: "flate-kort", krav: 4.5 },
  { id: "svak-kort", hva: "Svak tekst (hjelpetekst) på kort", fg: "tekst-svak", bg: "flate-kort", krav: 4.5 },
  { id: "svak-side", hva: "Svak tekst (hjelpetekst) på siden", fg: "tekst-svak", bg: "flate-side", krav: 4.5 },
  { id: "lenke-side", hva: "Lenke (aksent-tekst) på siden", fg: "aksent-tekst", bg: "flate-side", krav: 4.5 },
  { id: "lenke-kort", hva: "Lenke (aksent-tekst) på kort", fg: "aksent-tekst", bg: "flate-kort", krav: 4.5 },
  { id: "paa-aksent", hva: "Tekst på primærknapp (på aksent)", fg: "paa-aksent", bg: "aksent", krav: 4.5 },
  { id: "varsel", hva: "Tekst i varsel", fg: "varsel-tekst", bg: "varsel-flate", krav: 4.5 },
  { id: "feil", hva: "Tekst i feilvarsel", fg: "feil-tekst", bg: "feil-flate", krav: 4.5 },
  { id: "aksent-side", hva: "Aksent som grafikk (fokusring, fremdrift) på siden", fg: "aksent", bg: "flate-side", krav: 3 },
  { id: "aksent-kort", hva: "Aksent som grafikk på kort", fg: "aksent", bg: "flate-kort", krav: 3 },
];
export function kontrastRader() {
  return KONTRASTPAR.map((p) => ({
    ...p,
    lys: kontrast(rolle(p.fg, "lys"), rolle(p.bg, "lys"), rolle("flate-side", "lys")),
    mork: kontrast(rolle(p.fg, "mork"), rolle(p.bg, "mork"), rolle("flate-side", "mork")),
  }));
}
export function statusKontrast() {
  return status.map((s) => ({
    navn: s.navn,
    lys: kontrast(s.lys.fg, s.lys.bg, rolle("flate-kort", "lys")),
    mork: kontrast(s.mork.fg, s.mork.bg, rolle("flate-kort", "mork")),
  }));
}
/** Verdien som vises: 1 desimal avrundet NED, så «4,5:1» aldri er en avrundet 4,46. */
export const fmtKontrast = (n: number) => `${(Math.floor(n * 10) / 10).toFixed(1).replace(".", ",")}:1`;

// ── Kundetema ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const kundetema = json.kundetema;
/** Eksemplene på kundetema fra designsystemet (K-190: bare fiktive kunder, skrift fra den frie listen). */
export const kundeEksempler = Object.entries(json.kundetema.eksempler).map(([nokkel, t]) => ({
  id: nokkel, navn: t.navn, aksent: t.aksent, paaAksent: t.paaAksent, skrift: { tekst: t.skrift.tekst, overskrift: t.skrift.overskrift },
}));
export function kundeAksentSjekk(aksent: string, paaAksent: string) {
  const offWhite = json.palett["off-white"];
  const mork = rolle("flate-side", "mork");
  const motLys = kontrast(aksent, offWhite);
  const tekstPaaAksent = kontrast(paaAksent, aksent);
  return { motLys, tekstPaaAksent, motMork: kontrast(aksent, mork), lysOk: motLys >= 4.5 || tekstPaaAksent >= 4.5, morkOk: kontrast(aksent, mork) >= 3 };
}

// ── CSS: klasser for fargeflater og to temaflater. Ingen style="" i HTML (CSP style-src 'self'), så alt ligger i ett <style> som hashes ved bygging. ──
const id = (s: string) => s.replace(/[^a-z0-9]+/gi, "-");
export const fargeKlasse = (navn: string, modus?: Modus) => `f-${id(navn)}${modus ? `-${modus}` : ""}`;
export const toneKlasse = (navn: string, modus: Modus) => `t-${id(navn)}-${modus}`;
export function lagFasitCss(): string {
  const ut: string[] = [];
  for (const p of palett) ut.push(`.${fargeKlasse(p.navn)}{background:${p.hex}}`);
  for (const r of roller) for (const m of MODI) ut.push(`.${fargeKlasse(r.navn, m)}{background:${r[m]}}`);
  for (const s of status) for (const m of MODI) ut.push(`.${toneKlasse(s.navn, m)}{background:${s[m].bg};color:${s[m].fg};border-color:${s[m].kant}}.${toneKlasse(s.navn, m)} i{background:${s[m].fg}}`);
  for (const s of status) ut.push(`.s-${id(s.navn)}{background:var(--status-${s.navn}-bg);color:var(--status-${s.navn}-fg);border-color:var(--status-${s.navn}-kant)}.s-${id(s.navn)} i{background:var(--status-${s.navn}-fg)}`);
  // Temaflater: alle roller og statustoner for én utgave, så lys og mørk kan vises ved siden av hverandre
  for (const m of MODI) {
    const vars = [
      ...roller.map((r) => `--${r.navn}:${r[m]}`),
      ...status.flatMap((s) => [`--status-${s.navn}-fg:${s[m].fg}`, `--status-${s.navn}-bg:${s[m].bg}`, `--status-${s.navn}-kant:${s[m].kant}`]),
      `--skygge-overlegg:${m === "lys" ? "0 1px 2px rgb(49 38 29 / 0.06), 0 8px 24px rgb(49 38 29 / 0.10)" : "0 1px 2px rgb(0 0 0 / 0.3), 0 8px 24px rgb(0 0 0 / 0.4)"}`,
      `color-scheme:${m === "lys" ? "light" : "dark"}`,
    ];
    ut.push(`.tema-${m}{${vars.join(";")}}`);
  }
  for (const t of kundeEksempler) {
    const navn = t.id;
    ut.push(`.f-kunde-${id(navn)}{background:${t.aksent}}`);
    ut.push(`.kunde-${id(navn)}{--kunde-aksent:${t.aksent};--kunde-paa-aksent:${t.paaAksent};--kunde-tekst:'${t.skrift.tekst}',system-ui,sans-serif;--kunde-overskrift:'${t.skrift.overskrift}',Georgia,serif}`);
  }
  // Skrift: størrelsene i skalaen (PC-bredde) og familiene i kundetemaets frie liste
  for (const [navn, [px, lh]] of Object.entries(json.skrift.storrelse).filter(([k]) => !k.startsWith("$")) as [string, [number, number]][]) ut.push(`.skala-${id(navn)}{font-size:${px}px;line-height:${lh}px}`);
  for (const f of json.kundetema.friListe) ut.push(`.fam-${id(f.navn.toLowerCase())}{font-family:'${f.navn}',${f.rolle === "overskrift" ? "Georgia,serif" : "system-ui,sans-serif"}}`);
  for (const v of [400, 500, 600]) ut.push(`.vekt-${v}{font-weight:${v}}`);
  return ut.join("\n");
}
export const skalaKlasse = (navn: string) => `skala-${id(navn)}`;
export const famKlasse = (navn: string) => `fam-${id(navn.toLowerCase())}`;
export const skriftStorrelser = (uten$(json.skrift.storrelse) as [string, [number, number]][]).map(([navn, [px, lh]]) => ({ navn, px, lh }));
