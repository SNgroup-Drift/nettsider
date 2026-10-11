// Fast tekst på /dokumenter. Fasit: Dokumenter.dc.html, tekst ordrett fra LES-MEG.md. Dokumentene ligger i dokumenter-data.ts.
import { LOGG_INN } from "./nav";

export const DOK_SIDE = {
  title: "Dokumenter – Hengsel",
  description: "Hengsel lager dokumentene av det som allerede står på ordren: forside, alle sider, vilkår, signatur og vedlegg.",
  eyebrow: "Dokumenter",
  h1: "Ferdige dokumenter, rett fra ordren.",
  lede: "Hengsel lager dokumentene av det som allerede står på ordren: forside, alle sider, vilkår, signatur og vedlegg. Velg et dokument og bla gjennom det side for side.",
};

export const DOK_KORT = [
  { t: "Butikkens navn på hver side", s: "Logo, navn og adresse hentes fra innstillingene. Hengsel står lite i bunnlinjen." },
  { t: "Alltid siste versjon", s: "Dokumentet lages på nytt når ordren endres. Tidligere versjoner ligger på ordren." },
  { t: "Signering og arkiv", s: "Kjøpsavtalen signeres med BankID i Penneo. Signerte dokumenter lagres på ordren og i kundeportalen." },
  { t: "Også i Visningsrommet", s: "De samme dokumentene finnes i Visningsrommet.", lenke: { tekst: "Logg inn", href: LOGG_INN } },
] as const;
