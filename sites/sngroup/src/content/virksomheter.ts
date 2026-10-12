/**
 * Virksomhetene på sngroup.no, i fast rekkefølge.
 *
 * Tekstene er hentet fra dagens sngroup.no (forslag D). ByggEM og Investeringer er godkjent av Eirik 07.10.2026.
 * «byggEM» skrives slik (byggEMs egen skrivemåte), og «byggEM AS» i teksten (docs/design/sngroup/Endringer.md, punkt 2).
 * Mangler en tekst, bruk PLASSHOLDER og `plassholder: true` (vises i kursiv), og merk feltet med TODO.
 * Ikke fyll inn tall, selskaper, kunder eller eiendommer som ikke er bekreftet av Eirik.
 */

export type VirksomhetId = "kjokken" | "hengsel" | "byggem" | "eiendom" | "investeringer";

export interface Virksomhet {
  id: VirksomhetId;
  /** Navnet på raden og i chipen */
  navn: string;
  undertittel?: string;
  /** Lengre tekst i raden under «Virksomheter» */
  tekst: string;
  /** Samme tekst med lenker (HTML), når teksten har lenker. Brukes i raden i stedet for `tekst`. */
  tekstHtml?: string;
  /** Kort tekst i plantegningen */
  kort: string;
  stikkord: string[];
  lenker: { href: string; label: string; primar?: boolean }[];
  /** Lenken under teksten i plantegningen */
  planLenke: { href: string; label: string };
  /** Rommet i plantegningen */
  rom: { navn: string; merke: string };
  plassholder?: boolean;
}

export const PLASSHOLDER = "Tekst kommer.";

export const virksomheter: Virksomhet[] = [
  {
    id: "kjokken",
    navn: "Kjøkken og interiør",
    tekst:
      "Vi selger og monterer kjøkken, bad og garderobe. Vi tegner sammen med kunden i butikk og følger jobben helt til siste skapdør er justert.",
    kort: "Kjøkken, bad og garderobe, med butikker på Hamar, Lillehammer og Gjøvik.",
    stikkord: ["Hamar", "Lillehammer", "Gjøvik", "Kjøkken", "Bad", "Garderobe"],
    lenker: [],
    planLenke: { href: "#rad-kjokken", label: "Les mer" },
    rom: { navn: "KJØKKEN", merke: "17,7 m²" },
  },
  {
    id: "hengsel",
    navn: "Hengsel",
    undertittel: "Hengsel CRM og montørappen Hengsel Ute",
    tekst:
      "Egne systemer for kundeoppfølging, bestilling og montering – og montørappen Hengsel Ute. Bygd for måten en kjøkkenbutikk faktisk jobber på.",
    kort: "Egne systemer for salg, bestilling og montering. Døra i entréen henger på et hengsel – og det gjør montørappen også.",
    stikkord: ["Kundeoppfølging", "Bestilling", "Montering", "Hengsel"],
    lenker: [
      { href: "https://hengsel.no", label: "hengsel.no" },
      { href: "mailto:drift@sngroup.no?subject=Be%20om%20demo%20%E2%80%93%20CRM%20by%20Hengsel", label: "Be om demo", primar: true },
    ],
    planLenke: { href: "#hengsel", label: "Se Hengsel" },
    rom: { navn: "ENTRÉ", merke: "Hengsel" },
  },
  {
    id: "byggem",
    navn: "byggEM",
    tekst:
      "byggEM AS gjør snekkerarbeid og monterer kjøkken og innredning, dører og vinduer. Selskapet er heleid av SN Group.",
    kort: "Snekkerarbeid og montering av kjøkken, innredning, dører og vinduer.",
    stikkord: [],
    lenker: [{ href: "https://byggem.no", label: "byggem.no" }],
    planLenke: { href: "#rad-byggem", label: "Les mer" },
    rom: { navn: "VERKSTED", merke: "7,2 m²" },
  },
  {
    id: "eiendom",
    navn: "Eiendom",
    tekst: "Kjøp, utvikling og utleie av fast eiendom.",
    kort: "Kjøp, utvikling og utleie av fast eiendom. Tomta og huset er rammen rundt alt det andre.",
    stikkord: ["Kjøp", "Utvikling", "Utleie"],
    lenker: [],
    planLenke: { href: "#rad-eiendom", label: "Les mer" },
    rom: { navn: "STUE", merke: "26,5 m²" },
  },
  {
    id: "investeringer",
    navn: "Investeringer",
    tekst:
      "Vi utvikler og leier ut boliger, blant annet fire boliger i rekke i Trymsvei 8 gjennom Vass Boligutvikling AS. I tillegg er vi en av flere eiere i regnskapsselskapet Iconomy (icgroup.no).",
    tekstHtml:
      'Vi utvikler og leier ut boliger, blant annet fire boliger i rekke i Trymsvei 8 gjennom Vass Boligutvikling AS. I tillegg er vi en av flere eiere i regnskapsselskapet Iconomy (<a href="https://icgroup.no" target="_blank" rel="noopener">icgroup.no<span class="visually-hidden"> (åpnes i ny fane)</span></a>).',
    kort: "Eiendom og eierskap i andre selskaper.",
    stikkord: [],
    lenker: [],
    planLenke: { href: "#rad-investeringer", label: "Les mer" },
    rom: { navn: "SOVEROM", merke: "14,7 m²" },
  },
];
