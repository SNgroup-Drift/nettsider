// hengsel.no/apptest: innholdet som endres fra bygg til bygg. Lenker, versjon og dato ligger i apptest-lenker.ts.
//
// Slik legger du til et nytt bygg:
//  1. Legg et nytt objekt ØVERST i BYGG (nyeste først). Datoen skrives ÅÅÅÅ-MM-DD, punktene er korte setninger uten punktum til slutt.
//  2. Står en feil du kjenner til i appen, legg den i KJENTE_FEIL. Er lista tom, viser siden «Ingen kjente feil akkurat nå».
//  3. Bytt punktene i SJEKKLISTE når testen endrer seg. Avkrysningene lagres per versjon i nettleseren (apptest-lenker.ts), så en ny versjon starter på 0.
// scripts/apptest-innhold.test.mjs sjekker rekkefølge, datoer og at lista ikke er tom.
//
// Kilder: claude/hengsel-bygg-11.md, claude/hengsel-bygg-12.md, claude/hengsel-bygg-13.md og claude/k148-rapport.md i innlandet-crm-sync.

export interface Bygg {
  /** Bygg-nummeret i byggrapportene (claude/hengsel-bygg-<n>.md) */
  bygg: number;
  /** App-versjonen, f.eks. «1.8.0» */
  versjon: string;
  /** Byggnummer per plattform: iOS (TestFlight), Android via Play (AAB) og APK */
  nummer: { ios?: number; play?: number; apk?: number };
  /** ÅÅÅÅ-MM-DD */
  dato: string;
  nytt: string[];
}

export const BYGG: Bygg[] = [
  {
    bygg: 13,
    versjon: "1.8.0",
    nummer: { ios: 18, play: 27, apk: 28 },
    dato: "2026-10-11",
    nytt: [
      "Nytt app-ikon, også i mørk modus og som tonet ikon",
      "Utkjøreren har fått fanen Skann: skann et kolli, så åpnes riktig oppdrag",
      "«Lastet på bilen» på stoppet, og avstand i luftlinje mellom stoppene",
      "Kontrollmål på iPad: Punkt, Mål, Pil, Ring, Frihånd og Tekst ligger inni skjemaet",
      "Kunden får varsel når utkjøreren melder mangel, skade eller levert",
      "Tydeligere tekst når appen ber om Bluetooth til lasermåleren",
    ],
  },
  {
    bygg: 12,
    versjon: "1.7.0",
    nummer: { ios: 17, play: 25, apk: 26 },
    dato: "2026-10-11",
    nytt: [
      "Alle ikoner er SF Symbols på iPhone og iPad, også i fanelinja",
      "Polsk og de andre språkene er gjennomgått, uten norske eller engelske rester",
      "Mørk modus følges overalt, med eget mørkt app-ikon",
      "Plusstegnet for leder og selger: Ny kunde, Velg kunde, Befaring og Skann tegning",
      "Endre ankomsttid på en utkjøring",
      "Avvik kan meldes med bare bilde",
      "Ukjent KS-status sperrer ferdigmeldingen",
    ],
  },
  {
    bygg: 11,
    versjon: "1.7.0",
    nummer: { ios: 16, play: 23, apk: 24 },
    dato: "2026-10-10",
    nytt: [
      "Kompakt visning og tre tettheter",
      "Nytt målark som ikke dekker bildet",
      "Pil og ring i bildeverktøyet",
      "Laser med alle tilstander",
      "KS med kamera",
      "Utlevering bare av skannede kolli",
      "Kø som overlever at appen lukkes",
      "«Klar uten nett» sier fra når noe mangler",
      "Face ID-frysen rettet",
      "Knip-zoom og Apple Pencil på iPad",
    ],
  },
];

export interface KjentFeil {
  /** Hva som er feil */
  tekst: string;
  /** Hvem det gjelder og hva som skjer videre, f.eks. «Utkjører · retting kommer i neste bygg» */
  detalj?: string;
}

/** Feil vi vet om i nyeste bygg. Tom liste gir «Ingen kjente feil akkurat nå». */
export const KJENTE_FEIL: KjentFeil[] = [];

/** Punktene i sjekklista: K148-1 til K148-6 fra claude/k148-rapport.md, Bluetooth-teksten (K162-7) fra bygg 13 og ikonene (K145) fra bygg 12. */
export const SJEKKLISTE: string[] = [
  "Se det nye app-ikonet på hjemskjermen, i lys og mørk modus",
  "Åpne kontrollmål på iPad og bruk Punkt, Mål, Tekst og Frihånd",
  "Skann et kolli i fanen Skann som utkjører",
  "Trykk «Lastet på bilen» på en mottatt ordre",
  "Meld mangel, skade og levert på en demo-ordre som utkjører",
  "Test skanner og DXF på en ekte telefon",
  "Si ja til Bluetooth og les teksten appen viser",
  "Se at alle ikoner synes, også i fanelinja",
];

export interface Rolle {
  id: "montor" | "firmaleder" | "utkjorer" | "lager";
  chip: string;
  tittel: string;
  under: string;
  punkter: string[];
  /** Demobrukerens adresse i appen (som i listen fra K-114). Passordet står aldri her: Workeren setter det inn. */
  bruker: string;
  /** Skjermbildet i telefonrammen, fra biblioteket på bilder.hengsel.no (K-233): app/<bilde>-lys.webp (iOS-skjermene) eller apptest/<bilde>-lys.webp (rollene uten iOS-skjerm) */
  bilde: string;
  alt: string;
  /** Merknad under demobrukeren */
  merknad?: string;
}

export const ROLLER: Rolle[] = [
  {
    id: "montor",
    chip: "Montør",
    tittel: "Montør",
    under: "I dag, Plan, Saker og Meg.",
    punkter: [
      "Hent dagens jobber med «Klar uten nett».",
      "Trykk «På vei» og åpne jobben.",
      "Kryss av KS punkt for punkt, med bilde.",
      "Meld avvik og ferdig montert med signatur.",
    ],
    bruker: "montor1@demo.invalid",
    bilde: "avvik",
    alt: "Hengsel Ute: meld avvik med bilde og beskrivelse",
  },
  {
    id: "firmaleder",
    chip: "Firmaleder",
    tittel: "Firmaleder",
    under: "Alt montøren har, og fanen Nye.",
    punkter: [
      "Svar på en forespørsel med «Ta jobben» eller «Avslå».",
      "Sett en montør på jobben.",
      "Se varselet når en montering er flyttet.",
    ],
    bruker: "firmaleder1@demo.invalid",
    bilde: "foresporsler",
    alt: "Hengsel Ute: firmaleder godtar eller bestrider en belastning fra montasjefirmaet",
  },
  {
    id: "utkjorer",
    chip: "Utkjører",
    tittel: "Utkjører",
    under: "I dag (ruten), Lager og Meg.",
    punkter: [
      "Velg «Demo» på innloggingen og logg inn med demobrukeren. I drift logger utkjørere inn med engangskode på e-post.",
      "Åpne ruten og trykk «Start navigasjon».",
      "Meld mottatt med «Skann kolli».",
      "Lever med bilder og signatur.",
    ],
    bruker: "utkjorer@demo.invalid",
    bilde: "ruten",
    alt: "Hengsel Ute: rute for dagen med tre stopp og knappen Start navigasjon",
  },
  {
    id: "lager",
    chip: "Ansatt eller lager",
    tittel: "Ansatt eller lager",
    under: "I dag, Uke og Kontrollmål. Lager har også Mottak og Ut.",
    punkter: [
      "Registrer et kontrollmål.",
      "Ta imot kolli under Mottak.",
      "Lever ut under Ut, også delvis.",
      "Signer for mottakeren.",
    ],
    bruker: "selger1@demo.invalid",
    bilde: "mottak",
    alt: "Hengsel Ute: mottak på lager med tre leveranser og knappen Skann kolli",
    merknad: "Demoen har ingen egen lagerbruker. selger1 viser ansattmodus.",
  },
];

export const SPORSMAL: { q: string; a: string }[] = [
  { q: "Appen sier at den har utløpt", a: "Testversjoner i TestFlight varer i 90 dager. Åpne TestFlight og installer den nyeste versjonen." },
  { q: "Android sier ukjent kilde", a: "Det gjelder APK-fila. Trykk Innstillinger i meldingen, slå på «Tillat fra denne kilden» og gå tilbake." },
  { q: "Jeg kommer ikke inn", a: "Velg «Demo» nederst på innloggingen, skriv hele adressen til demobrukeren for rollen din, og kopier passordet fra denne siden. Virker det fortsatt ikke, skriv til hei@hengsel.no." },
  { q: "Hvordan logger jeg ut?", a: "Gå til Meg og trykk «Logg ut»." },
  { q: "Hvordan får jeg tilbake ekte data?", a: "Logg ut av demobrukeren og logg inn med din egen bruker." },
];
