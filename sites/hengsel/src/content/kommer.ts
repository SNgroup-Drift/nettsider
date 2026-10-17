// Sidene merket KOMMER i sidekartet (S-68): 25-008 For butikkleder, 25-009 Kunder og referanser, 25-010 Om oss.
// Titlene og flisene er fra tegningene (25-008.webp, 25-009.webp, 25-010.webp); ingressene er nøytrale (N-3b), og fliser uten innhold viser «Kommer.»
// (Tekstflis kommer). Sidene har noindex, står ikke i sitemap.txt og lenkes ikke fra menyen eller bunnen før teksten er på plass (Eirik 17.10, svar A).
import { EPOST, TEL } from "./forside";

export interface KommerSide {
  tittel: string;
  beskrivelse: string;
  ingress: string;
  /** Rad 1 (120): fliser – tittel og tekst (uten tekst: «Kommer.») */
  fliser: { tittel: string; tekst?: string }[];
}

export const FOR_BUTIKKLEDER: KommerSide = {
  tittel: "For butikkleder",
  beskrivelse: "Hengsel for butikkleder. Siden kommer.",
  ingress: "Siden kommer. Her samler vi det butikkleder trenger: tall per selger, «Trenger deg», montasjeplan og rabattoversikt.",
  fliser: [{ tittel: "Seksjon 1" }, { tittel: "Seksjon 2" }, { tittel: "Seksjon 3" }],
};

export const KUNDER: KommerSide = {
  tittel: "Kunder og referanser",
  beskrivelse: "Kunder og referanser for Hengsel. Siden kommer.",
  ingress: "Siden kommer. Referansene legges ut etter avtale med kundene.",
  fliser: [{ tittel: "Referanse 1" }, { tittel: "Referanse 2" }, { tittel: "Referanse 3" }],
};

export const OM_OSS: KommerSide = {
  tittel: "Om oss",
  beskrivelse: "Om Hengsel og ES-HOLDING AS.",
  ingress: "Siden kommer.",
  fliser: [
    { tittel: "Hvem vi er", tekst: "Hengsel · ES-HOLDING AS · org.nr. 927 363 585 · Enromvegen 173, 7026 Trondheim." },
    { tittel: "Kontakt", tekst: `${TEL} · ${EPOST}` },
  ],
};
