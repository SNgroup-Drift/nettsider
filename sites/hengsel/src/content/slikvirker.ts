// /slik-virker-det: «Ordrens reise». Fasit: docs/design/hengsel-no-2.0/Slik-virker-det.dc.html. Tekst ordrett fra LES-MEG.md.
export const SLIK = {
  tittel: "Slik virker det – ordrens reise i Hengsel",
  beskrivelse: "Én ordre, åtte scener. Følg kjøkkenet til Kari Nordmann fra befaring til faktura.",
  eyebrow: "Ordrens reise",
  h1: "Én ordre, åtte scener.",
  ingress:
    "Følg kjøkkenet til Kari Nordmann fra befaring til faktura. For hver scene ser du hva selgeren ser i Hengsel, og hva som skjer bak kulissene.",
  scenerLabel: "Scener",
  forrigeLabel: "Forrige scene",
  selgerenSer: "Selgeren ser",
  eksempel: "Eksempel",
  bakKulissene: "Bak kulissene",
  visesI: "Vises i ",
  neste: "Neste: ",
  ferdig: "Ferdig",
} as const;

export type Tone = "info" | "neutral" | "ok" | "warn" | "bad";
export type Scene = {
  t: string;
  s: string;
  ser: readonly (readonly [tittel: string, under: string, merke: string, tone: Tone])[];
  hvor: string;
  bak: readonly string[];
  eksempel?: boolean;
};

export const SCENER: readonly Scene[] = [
  { t: "Befaring", s: "Selgeren eller montøren måler opp hos kunden med Hengsel Ute. Mål, bilder og skisser legges rett på kundekortet.",
    ser: [["Befaring hos Kari Nordmann ferdig", "14 bilder · 6 mål · Oppdiktet allé 8", "Ny", "info"], ["Kontrollmål vegg A", "2 460 mm · målt med laser", "Mål", "neutral"]], hvor: "Min dag og kundekortet",
    bak: ["Bildene sendes fra køen på telefonen, også etter en tur uten dekning.", "Lasermålene lagres sammen med bildet de hører til.", "Befaringen blir en aktivitet på kundekortet."] },
  { t: "Tilbud", s: "Tegningen hentes fra CET, og tilbudet lages med prisgrupper og monteringskalkyle.",
    ser: [["Tilbud HA-T-2231 v3 sendt", "257 700 kr · gjelder til 15. oktober", "Sendt", "info"], ["Ring Kari – tilbudet åpnet 3 ganger", "6 dager i fasen", "Oppfølging", "warn"]], hvor: "Salgstavla og Min dag",
    bak: ["Artikler og tegninger importeres fra CET.", "Tilbudet blir en PDF med butikkens logo.", "Kunden får tilbudet i kundeportalen og en SMS."] },
  { t: "Aksept", s: "Kunden aksepterer tilbudet i kundeportalen og signerer kjøpsavtalen med BankID.",
    ser: [["Kari signerte kjøpsavtalen", "BankID · i dag 09.24", "Signert", "ok"], ["Tilbud v3 ble ordre O-2417", "41 linjer · montering uke 47", "Ordre", "neutral"]], hvor: "Kundekortet og ordren",
    bak: ["Kjøpsavtalen sendes til Penneo for signering.", "Den signerte avtalen lagres på ordren.", "Ordren opprettes med alle linjene fra tilbudet."] },
  { t: "Tilvalg", s: "Frem til endringsfristen velger kunden oppgraderinger i portalen. Selgeren ser valgene med en gang.", eksempel: true,
    ser: [["Kari valgte 2 tilvalg", "Benkeplate 30 mm · LED under overskap · + 9 100 kr", "Tilvalg", "info"], ["Bekreft endringsfrist", "Ordre O-2417 · fredag 16. oktober", "Frist", "warn"]], hvor: "Min dag og ordren",
    bak: ["Tilvalgene legges som linjer på ordren.", "Prisen og betalingsplanen oppdateres.", "Etter fristen låses tilvalgene i portalen."] },
  { t: "Bestilling", s: "Ordren bestilles hos leverandørene. Ordrebekreftelsen kontrolleres mot ordren før den godtas.",
    ser: [["Kontroller OB – avvik på benkeplate", "Leverandør A · 20 mm i stedet for 30 mm", "Avvik", "bad"], ["Bestilling sendt", "41 linjer · 3 leverandører", "Sendt", "neutral"]], hvor: "Min dag og bestillingen",
    bak: ["Bestillingen går til leverandøren, hvitevarer via Tradeplace.", "Ordrebekreftelsen sammenlignes med ordren, linje for linje.", "Avvik havner i Min dag hos selgeren."] },
  { t: "Levering", s: "Kolliene tas imot på lager og kjøres ut. Kunden får beskjed om leveringstid.", eksempel: true,
    ser: [["14 av 14 kolli mottatt", "Lager · Leverandør A og B", "Klar", "ok"], ["Utkjøring tirsdag 17. november", "07.00–09.00 · Utkjører To", "Plan", "neutral"]], hvor: "Ordren og montasjeplanen",
    bak: ["Kolli registreres på lager i appen.", "Utkjøreren får ruten og kvitterer med kundens signatur.", "Kunden får SMS med leveringstid."] },
  { t: "Montering og punkter", s: "Montøren har jobben i Hengsel Ute. Avvik og restpunkter får nummer og følges opp til de er løst.",
    ser: [["Montør En er på vei", "Kari Nordmann · dag 1 av 3", "På vei", "info"], ["Restpunkt 14-3", "Sokkel mangler 40 mm mot vegg", "Åpen", "warn"]], hvor: "Min dag, ordren og saker",
    bak: ["Montøren har plan, tegning og KS-sjekkliste i Hengsel Ute.", "Avvik og restpunkter har samme nummer i CRM, app og portal.", "Lasermåleren kobles til via Bluetooth og måler rett inn i bildet."] },
  { t: "Ferdig og faktura", s: "Kunden signerer ferdigmeldingen på montørens telefon. FDV legges i portalen, og fakturaen går til regnskapet.",
    ser: [["Ferdig montert", "Kari signerte 19. november · KS 12 av 12", "Ferdig", "ok"], ["Sluttfaktura overført", "PowerOffice Go · 10 % av 266 800 kr", "Faktura", "neutral"]], hvor: "Ordren og økonomi",
    bak: ["Kundens signatur lagres med KS-rapporten.", "FDV og garantier legges i kundeportalen.", "Fakturaen overføres til PowerOffice Go."] },
];

export const VIDERE = [
  { t: "Prøv CRM-demoen", s: "Min dag, avvik, import fra CET og montasjeplan.", href: "/crm", primar: false },
  { t: "Se montørappen", s: "I dag, jobben, KS, avvik, punkter og ferdig.", href: "/ute", primar: false },
  { t: "Be om demo", s: "Vi viser reisen med en ordre fra start til slutt.", href: "/priser-og-demo#demo", primar: true },
] as const;
