/**
 * Leser datafilene (src/data) ved bygging. Plattformen ligger i src/data/plattform, hver kunde i src/data/kunder/<kunde-id>.
 * Ny kunde = ny mappe med kunde.json, lenker.json, kontoer.json og frister.json; ingen kodeendring.
 * Skjemafeil stopper bygget. Filene har bare NAVN og lenker, aldri passord, nøkler eller koder (se scripts/admin.test.mjs).
 */
import type { FristNiva } from "./frist";

export interface Lenke { navn: string; url: string | null; merknad?: string; status?: "kommer"; sak?: string }
export interface LenkeGruppe { id: string; tittel: string; plattformgruppe?: string; lenker: Lenke[] }
export interface Konto {
  tjeneste: string; innlogging: string | null; eier: string | null; tofa: string | null;
  hvelv: string | null; element: string | null; onepassword: string | null; merknad: string | null;
}
export type FristType = "hemmelighet" | "sertifikat" | "domene" | "ssl" | "abonnement";
export interface Frist { id: string; navn: string; type: FristType; tjeneste: string; dato: string | null; pris: string | null; merknad: string | null }
export interface Kunde {
  id: string; navn: string; eksempel: boolean;
  tenant: { nokkel: string; merknad?: string };
  selskaper: { navn: string; orgnr: string | null; butikk: string }[];
  kontaktperson: { navn: string; rolle: string; epost: string | null; telefon: string | null };
  domener: string[];
  moduler: Record<string, boolean>;
  moduler_merknad?: string;
  integrasjoner: { navn: string; bruk: string; konto: string | null }[];
  lisens: { plan: string | null; fra: string | null; pris: string | null; merknad?: string };
  status: { niva: "ok" | "fyll inn" | "feil"; tekst: string };
  lenker: LenkeGruppe[]; kontoer: Konto[]; frister: Frist[];
}

export const MODULER: { nokkel: string; navn: string }[] = [
  { nokkel: "butikk", navn: "Butikk" },
  { nokkel: "avtale_levering", navn: "Avtale og levering" },
  { nokkel: "montasje", navn: "Montasje" },
  { nokkel: "prosjekt", navn: "Prosjekt" },
  { nokkel: "etter_levering", navn: "Etter levering" },
  { nokkel: "okonomi", navn: "Økonomi" },
  { nokkel: "varsler", navn: "Varsler og automatikk" },
];

import plattformLenker from "../data/plattform/lenker.json";
import plattformKontoer from "../data/plattform/kontoer.json";
import plattformFrister from "../data/plattform/frister.json";
import * as rutinerMd from "../data/plattform/rutiner.md";

const kundefiler = import.meta.glob("../data/kunder/*/*.json", { eager: true, import: "default" }) as Record<string, any>;

function feil(msg: string): never {
  throw new Error(`Datafil: ${msg}`);
}

function sjekkLenker(grupper: LenkeGruppe[], hvor: string) {
  for (const g of grupper) {
    if (!g.id || !g.tittel || !Array.isArray(g.lenker)) feil(`${hvor}: gruppe mangler id/tittel/lenker`);
    for (const l of g.lenker) {
      if (!l.navn) feil(`${hvor}/${g.id}: lenke uten navn`);
      if (l.url !== null && !/^https:\/\/[^\s@]+$/.test(l.url)) feil(`${hvor}/${g.id}/${l.navn}: url må være https uten innlogging, eller null`);
    }
  }
}
function sjekkFrister(frister: Frist[], hvor: string) {
  const ider = new Set<string>();
  for (const f of frister) {
    if (!f.id || ider.has(f.id)) feil(`${hvor}: tom eller dobbel frist-id ${f.id}`);
    ider.add(f.id);
    if (f.dato !== null && !/^\d{4}-\d{2}-\d{2}$/.test(f.dato)) feil(`${hvor}/${f.id}: dato må være ÅÅÅÅ-MM-DD eller null`);
  }
}

sjekkLenker(plattformLenker.grupper as LenkeGruppe[], "plattform");
sjekkFrister(plattformFrister.frister as Frist[], "plattform");

export const plattform = {
  lenker: plattformLenker.grupper as LenkeGruppe[],
  kontoer: plattformKontoer.kontoer as Konto[],
  frister: plattformFrister.frister as Frist[],
  rutiner: rutinerMd,
};

const perKunde = new Map<string, Record<string, any>>();
for (const [sti, innhold] of Object.entries(kundefiler)) {
  const m = /data\/kunder\/([^/]+)\/([^/]+)\.json$/.exec(sti);
  if (!m) continue;
  perKunde.set(m[1], { ...(perKunde.get(m[1]) ?? {}), [m[2]]: innhold });
}

export const kunder: Kunde[] = [...perKunde.entries()]
  .map(([id, f]) => {
    for (const nokkel of ["kunde", "lenker", "kontoer", "frister"]) if (!f[nokkel]) feil(`kunder/${id}/${nokkel}.json mangler`);
    if (f.kunde.id !== id) feil(`kunder/${id}/kunde.json: id «${f.kunde.id}» må være lik mappenavnet`);
    if (f.kunde.tenant?.nokkel !== id) feil(`kunder/${id}/kunde.json: tenant.nokkel må være lik id`);
    sjekkLenker(f.lenker.grupper, `kunder/${id}`);
    sjekkFrister(f.frister.frister, `kunder/${id}`);
    return { ...f.kunde, lenker: f.lenker.grupper, kontoer: f.kontoer.kontoer, frister: f.frister.frister } as Kunde;
  })
  // Ekte kunder først, eksempelkunden sist
  .sort((a, b) => Number(a.eksempel) - Number(b.eksempel) || a.navn.localeCompare(b.navn, "nb"));

/** Plattformens lenkegrupper, utvidet med kundenes lenker som hører til samme gruppe (plattformgruppe). Eksempelkunden tas aldri med. */
export function plattformLenkegrupper(): (LenkeGruppe & { lenker: (Lenke & { kunde?: string })[] })[] {
  return plattform.lenker.map((g) => ({
    ...g,
    lenker: [
      ...g.lenker,
      ...kunder
        .filter((k) => !k.eksempel)
        .flatMap((k) => k.lenker.filter((kg) => kg.plattformgruppe === g.id).flatMap((kg) => kg.lenker.map((l) => ({ ...l, kunde: k.navn })))),
    ],
  }));
}

/** Alle frister: plattformens og kundenes (uten eksempelkunden) */
export function alleFrister(): (Frist & { horer: string; kundeId?: string })[] {
  return [
    ...plattform.frister.map((f) => ({ ...f, horer: "Plattform" })),
    ...kunder.filter((k) => !k.eksempel).flatMap((k) => k.frister.map((f) => ({ ...f, horer: k.navn, kundeId: k.id }))),
  ];
}

export const FRIST_TYPER: Record<FristType, string> = {
  hemmelighet: "Hemmelighet", sertifikat: "Sertifikat", domene: "Domene", ssl: "SSL", abonnement: "Abonnement",
};
export type { FristNiva };
