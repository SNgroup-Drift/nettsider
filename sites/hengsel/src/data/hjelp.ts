/**
 * Innholdet i brukerveiledningen på hengsel.no/hjelp (K-226). Kilde: docs/hjelp/hengsel-brukerveiledning.html (utkast 0.1, 14.10.2026).
 *
 * Alt innhold ligger her, ingen tekst står i siden. Oppbyggingen er den samme som «Hjelp» i CRM-et (K-225) bruker, så tekstene kan holdes like:
 * en oppgave har kapittel, rolle, tittel, menyvei, steg og skjermbilde. Tekster som endres i det ene stedet, kopieres til det andre.
 *
 * - kapittel: overskriften på kapittelet oppgaven står i (samme tekst som HJELP_ROLLER[rolle].kapittel)
 * - rolle:    kapittelets id, også ankeret i rollevelgeren (#selger)
 * - menyvei:  der man finner det i løsningen, for eksempel «Salg › Innkommende» (valgfri)
 * - tekst / steg: løpende tekst, eller nummererte steg (begge kan stå sammen: tekst først)
 * - tips:     fremhevet merknad under oppgaven
 * - skjermbilde: navnet på skjermbildet. Skjermbildene kommer senere fra demo.hengsel.no; til da vises plassholderen «Skjermbilde kommer».
 *   Når bildet finnes, legges stien i `fil` (under /img/hjelp/) og siden viser bildet i stedet for plassholderen.
 */

export type RolleId = "kom-i-gang" | "selger" | "prosjektleder" | "montasjeleder" | "leder" | "montor" | "kunde";

export interface Skjermbilde {
  /** Hva bildet viser, for eksempel «Min dag». Brukes i plassholderen og som alt-tekst når bildet er på plass. */
  navn: string;
  /** Sti til bildet, for eksempel «/img/hjelp/min-dag.webp». Tom = «Skjermbilde kommer». */
  fil?: string;
}

export interface Oppgave {
  kapittel: string;
  rolle: RolleId;
  tittel: string;
  menyvei?: string;
  tekst?: string;
  steg?: string[];
  tips?: { etikett: string; tekst: string };
  skjermbilde?: Skjermbilde;
}

export interface Rolle {
  id: RolleId;
  /** Kort navn i rollevelgeren */
  valg: string;
  /** Overskrift på kapittelet */
  kapittel: string;
  ingress: string;
  /** Menygruppene rollen bruker: [gruppe, innhold][] */
  meny?: [string, string][];
  /** Oppgavene vises i to kolonner når det passer (korte oppgaver uten nummerering) */
  rutenett?: boolean;
  merknad?: string;
}

export const HJELP = {
  tittel: "Hengsel brukerveiledning",
  overskrift: "Hengsel brukerveiledning",
  ingress: "Slik bruker du Hengsel CRM, Hengsel Ute og Min side i det daglige. Velg rollen din, så finner du de vanligste oppgavene steg for steg.",
  status: "Utkast 0.1 · 14.10.2026 · skjermbilder kommer når ny meny er i demo",
  plassholder: "Skjermbilde kommer",
  fotnote:
    "Utkast skrevet fra løsningen slik den er i demo 14.10.2026. Skjermbildene tas fra demo.hengsel.no med fiktive data når den nye menyen er i demo. Kunder med eget tema (for eksempel Sigdal) får en egen utgave med sitt utseende.",
  copyright:
    "© 2026 ES-Holding AS. Alle rettigheter forbeholdt. Hengsel og innholdet i denne veiledningen (tekst, skjermbilder og oppbygging) kan ikke kopieres, deles eller brukes utenfor egen virksomhet uten skriftlig samtykke.",
} as const;

export const HJELP_ROLLER: Rolle[] = [
  {
    id: "kom-i-gang",
    valg: "Kom i gang",
    kapittel: "Kom i gang",
    ingress: "Det alle trenger første dag.",
    rutenett: true,
  },
  {
    id: "selger",
    valg: "Selger",
    kapittel: "Selger",
    ingress: "Fra første henvendelse til signert avtale og levering.",
    meny: [
      ["Øverst", "Min dag, Samtaler"],
      ["Salg", "Innkommende, Salgstavle, Kunder, Tilbud, Ordre, Prosjekter"],
      ["Leveranse", "Montasje, Prosjektplan, Saker, Bestilling"],
      ["Tall", "Resultater, Fakturaer, Rapporter, Salgsbanken"],
    ],
  },
  {
    id: "prosjektleder",
    valg: "Prosjektleder",
    kapittel: "Prosjektleder",
    ingress: "Prosjekter med mange boenheter, anbud og tilvalg. Har alt selgeren har, pluss «Mine prosjekter».",
    merknad: "Full veiledning for tilvalg finnes i «Prosjektleder og tilvalg i Sigdal CRM». Den flyttes inn her når menyen er på plass.",
  },
  {
    id: "montasjeleder",
    valg: "Montasjeleder",
    kapittel: "Montasjeleder og bestilling",
    ingress: "Planlegger montører, følger opp KS og bestiller varer.",
    meny: [
      ["Øverst", "Min dag, Resultater"],
      ["Leveranse", "Montasje, Prosjektplan, Saker, Bestilling"],
      ["Oppslag", "Kunder, Ordre, Prosjekter, Fakturaer"],
    ],
  },
  {
    id: "leder",
    valg: "Leder og admin",
    kapittel: "Leder og admin",
    ingress: "Oversikt, team og tall. Har gruppen Ledelse øverst i menyen.",
    meny: [
      ["Ledelse", "Leder, Mitt team, Etterkalkyler, Bestilling, Utstillinger, Forskudd til leverandør, Unoterte til leverandør"],
      ["Ellers", "som selger"],
    ],
    rutenett: true,
  },
  {
    id: "montor",
    valg: "Montør (Ute)",
    kapittel: "Montør · Hengsel Ute",
    ingress: "Appen på iPhone, iPad og Android. Montører, montørfirma og utkjørere bruker den.",
  },
  {
    id: "kunde",
    valg: "Kunde (Min side)",
    kapittel: "Kunde · Min side",
    ingress: "Det kunden ser. Bruk dette når du forklarer Min side til en kunde.",
    rutenett: true,
  },
];

const KAP = Object.fromEntries(HJELP_ROLLER.map((r) => [r.id, r.kapittel])) as Record<RolleId, string>;
const oppgave = (rolle: RolleId, o: Omit<Oppgave, "kapittel" | "rolle">): Oppgave => ({ kapittel: KAP[rolle], rolle, ...o });

export const HJELP_OPPGAVER: Oppgave[] = [
  // Kom i gang
  oppgave("kom-i-gang", {
    tittel: "Logg inn",
    steg: [
      "Åpne adressen butikken din bruker i nettleseren.",
      "Velg «Logg inn med Microsoft» og bruk jobbkontoen din, eller e-post og passord hvis du har fått det.",
      "Glemt passord: trykk «Glemt passord» og følg lenken i e-posten.",
    ],
    tips: { etikett: "Tips", tekst: "Legg siden til på hjemskjermen på telefon og nettbrett. Den oppfører seg da som en app." },
  }),
  oppgave("kom-i-gang", {
    tittel: "Min dag",
    tekst:
      "Startsiden din. Øverst ligger det som trenger handling (avvik, oppfølging, svar fra kunder), og til høyre det du har i kalenderen i dag. Tallet ved Min dag i menyen viser hvor mange oppgaver som venter.",
    skjermbilde: { navn: "Min dag" },
  }),
  oppgave("kom-i-gang", {
    tittel: "Menyen",
    tekst:
      "På PC står menyen til venstre, gruppert i Salg, Leveranse, Tall og (for ledere) Ledelse. På mobil ligger Min dag, Kunder, Ordre og Saker nederst, og resten under «Mer». Hengsel CRM og versjonsnummeret står nederst i menyen.",
    skjermbilde: { navn: "Meny på PC og mobil" },
  }),
  oppgave("kom-i-gang", {
    tittel: "Innstillinger",
    tekst:
      "Under Innstillinger › Utseende velger du tetthet (tett, normal eller luftig). Valget følger brukeren din. Admin laster opp butikkens logo og styrer automatiske oppgaver.",
  }),

  // Selger
  oppgave("selger", {
    tittel: "1. Ta imot en ny henvendelse",
    menyvei: "Salg › Innkommende",
    steg: [
      "Åpne Innkommende. Fanene viser anbud, henvendelser fra nettsiden og fra kundeportalen.",
      "Åpne henvendelsen og velg «Opprett kunde», eller koble den til en kunde som finnes.",
      "Sett neste steg (befaring, tegnemøte eller ring tilbake). Det havner på Min dag.",
    ],
    skjermbilde: { navn: "Innkommende" },
  }),
  oppgave("selger", {
    tittel: "2. Lag et tilbud",
    menyvei: "Salg › Tilbud › Nytt tilbud",
    steg: [
      "Velg kunde og kategori (kjøkken, garderobe, bad).",
      "Importer fra tegneprogrammet eller legg inn linjene. Bruk priseksempler eller hurtigpris for et raskt anslag.",
      "Legg til montering og frakt. Sjekk dekningsgraden før du sender.",
      "«Lag PDF og send». Kunden får tilbudet på e-post og på Min side.",
    ],
    skjermbilde: { navn: "Tilbud" },
  }),
  oppgave("selger", {
    tittel: "3. Følg opp på Salgstavla",
    menyvei: "Salg › Salgstavle",
    tekst: "Hvert kort er et tilbud. Dra kortet til riktig kolonne når status endres. Tilbud som står stille, får et varsel på Min dag.",
  }),
  oppgave("selger", {
    tittel: "4. Fra signert tilbud til ordre",
    menyvei: "Tilbud › Signert › Ordre",
    steg: [
      "Kunden signerer med BankID. Tilbudet blir en ordre av seg selv.",
      "Kontroller leveringsdato og adresse på ordren.",
      "Send ordrebekreftelsen fra ordren.",
      "Bestill varene under Bestilling, eller gi beskjed til den som bestiller.",
    ],
    skjermbilde: { navn: "Ordre" },
  }),
  oppgave("selger", {
    tittel: "5. Snakk med kunden",
    menyvei: "Samtaler",
    tekst: "Alle meldinger med kunden (e-post og Min side) ligger samlet per kunde. Tallet i menyen viser ubesvarte.",
  }),
  oppgave("selger", {
    tittel: "6. Når noe går galt",
    menyvei: "Leveranse › Saker",
    steg: [
      "Opprett en sak fra ordren: avvik, reklamasjon eller mangel.",
      "Legg ved bilde. Alle bilder går gjennom bildeverktøyet, så du kan merke og måle.",
      "Saken får et nummer og følges til den er løst.",
    ],
  }),

  // Prosjektleder
  oppgave("prosjektleder", {
    tittel: "1. Fra anbud til prosjekt",
    menyvei: "Salg › Innkommende › Anbud",
    steg: [
      "Legg inn anbudet og kalkylen. Lag en kopi per entreprenør hvis flere regner.",
      "Sett påslag eller rabatt per entreprenør hvis den skal avvike fra prosjektet.",
      "Når anbudet er vunnet: «Lag prosjekt fra anbud».",
    ],
  }),
  oppgave("prosjektleder", {
    tittel: "2. Boenheter og tilvalg",
    menyvei: "Prosjekter › prosjektet › Boenheter",
    steg: [
      "Lås standardkjøkkenet.",
      "Importer tilvalgene per leilighet.",
      "«Send til kjøper». Kjøperen ser fratrekk, tillegg og samlet pris på Min side.",
      "Lag tilvalg-PDF når kjøperen vil ha det på papir.",
    ],
    tips: {
      etikett: "Faktura",
      tekst: "Hvem som faktureres for tilvalg, avtales per prosjekt. Velg «Delt» når standard skal til entreprenøren og tilvalg til kjøperen.",
    },
  }),
  oppgave("prosjektleder", {
    tittel: "3. Fremdrift",
    menyvei: "Leveranse › Prosjektplan",
    tekst: "Leveranser og frister per oppgang og uke. Endringer gir varsel til dem som berøres.",
  }),

  // Montasjeleder
  oppgave("montasjeleder", {
    tittel: "1. Planlegg montering",
    menyvei: "Leveranse › Montasje › Oversikt",
    steg: [
      "Finn ordren som er klar for montering.",
      "Velg montør eller montørfirma og dato. Forespørselen går til Ute-appen.",
      "Følg status: akseptert, i gang, ferdig montert.",
    ],
    skjermbilde: { navn: "Montasje, oversikt" },
  }),
  oppgave("montasjeleder", {
    tittel: "2. KS og montørfaktura",
    menyvei: "Ordre › KS / Fakturaer",
    steg: [
      "Montøren leverer KS i Ute-appen med bilder.",
      "Montørfakturaen kan ikke settes til «Klar til attestering» før KS er levert.",
      "Leder og admin kan overstyre med en årsak. Årsaken lagres på fakturaen.",
    ],
  }),
  oppgave("montasjeleder", {
    tittel: "3. Bestilling",
    menyvei: "Leveranse › Bestilling",
    tekst: "Alt som skal bestilles, samlet per leverandør. Når ordrebekreftelsen kommer, kontrolleres den mot ordren, og avvik vises.",
  }),

  // Leder og admin
  oppgave("leder", { tittel: "Leder", tekst: "Det som venter på deg: rabatter til godkjenning, avvik og frister som glipper." }),
  oppgave("leder", { tittel: "Mitt team", tekst: "Budsjett og resultat per selger og butikk." }),
  oppgave("leder", { tittel: "Etterkalkyler", tekst: "Faktisk dekningsgrad mot tilbudt, per ordre." }),
  oppgave("leder", {
    tittel: "Brukere og innstillinger",
    tekst: "Admin inviterer brukere, setter roller og slår automatiske oppgaver av og på, for eksempel tilvalgsinvitasjon på e-post.",
  }),

  // Montør
  oppgave("montor", {
    tittel: "1. Dagen din",
    menyvei: "I dag",
    tekst: "Jobbene for dagen med adresse og tid. Trykk på en jobb for tegninger, mål og kontaktinfo. «Naviger» åpner kartet.",
    skjermbilde: { navn: "I dag" },
  }),
  oppgave("montor", {
    tittel: "2. Under jobben",
    steg: [
      "Ta bilder underveis. Hvert bilde går gjennom bildeverktøyet, så du kan merke, måle og nummerere punkter.",
      "Mål med Bosch-laseren over Bluetooth der det trengs.",
      "Avvik: registrer det med bilde. Det går rett til butikken.",
    ],
  }),
  oppgave("montor", {
    tittel: "3. KS og Ferdig montert",
    steg: ["Gå gjennom KS-punktene. Et bilde kreves også når punktet er OK.", "Trykk «Ferdig montert» når KS er levert."],
    tips: { etikett: "Uten nett", tekst: "Appen lagrer alt og sender når du får dekning igjen." },
  }),
  oppgave("montor", {
    tittel: "Montørfirma og utkjører",
    tekst:
      "Firmaleder ser forespørsler, svarer og fordeler jobber på egne montører. Utkjøreren ser ruten, registrerer mottak på lager, levering og eventuell skade.",
  }),

  // Kunde
  oppgave("kunde", { tittel: "Tilbud og avtale", tekst: "Tilbudet, signering med BankID og avtalen samlet ett sted." }),
  oppgave("kunde", { tittel: "Tilvalg", tekst: "For boliger i prosjekt: standard, fratrekk, tillegg og samlet pris." }),
  oppgave("kunde", { tittel: "Levering og montering", tekst: "Datoer, hvem som kommer, og beskjed når noe endres." }),
  oppgave("kunde", { tittel: "FDV og meldinger", tekst: "Leveringspakken med dokumentasjon, og meldinger til butikken." }),
];
