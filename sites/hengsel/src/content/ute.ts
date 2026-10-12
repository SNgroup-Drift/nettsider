// /ute: tekstene ordrett fra docs/design/hengsel/LES-MEG.md («/ute · Ute.dc.html»).
// Appbildene ligger i public/img/app (faste filnavn; byttes senere mot ekte skjermbilder).

export const APPTEST_URL = "https://hengsel.no/apptest";

export const HERO = {
  tittel: "Montøren slipper papir.",
  ingress: "Montørappen for iPhone og iPad. Jobben, tegningene, målene og KS-sjekklista ligger i lomma.",
  logoAlt: "Hengsel Ute",
} as const;

export const STEG_ARIA = "Steg i appen";
export const FORRIGE = "Forrige steg";
export const NESTE = "Neste steg";

/** Steg i appen: nøkkel (bildefil: app/<nokkel>-lys.webp og -mork.webp), tittel, setning, alt-tekst */
export const STEG = [
  { nokkel: "idag", tittel: "I dag", tekst: "Neste jobb, På vei, og det du må vite før du starter.", alt: "Hengsel Ute: I dag med neste jobb, adresse og knappen Jeg er på vei" },
  { nokkel: "jobben", tittel: "Jobben", tekst: "Tegning, mål, bilder og restpunkter samlet før, under og etter.", alt: "Hengsel Ute: jobben med Noe mangler, Før og Under" },
  { nokkel: "ks", tittel: "KS", tekst: "Punkt for punkt. OK med bilde åpner kameraet.", alt: "Hengsel Ute: KS-sjekkliste punkt for punkt" },
  { nokkel: "avvik", tittel: "Avvik", tekst: "Bilde med pil, og om det trengs ny vare.", alt: "Hengsel Ute: meld avvik med bilde" },
  { nokkel: "punkter", tittel: "Punkter", tekst: "Ett nummersystem, samme nummer i CRM og portal.", alt: "Hengsel Ute: punktlista på kunden med nummer og status" },
  { nokkel: "ferdig", tittel: "Ferdig", tekst: "Ferdig montert, eller det som gjenstår med dato.", alt: "Hengsel Ute: meld ferdig montert" },
] as const;

export const IPAD = {
  eyebrow: "På iPad",
  tittel: "Bildeverktøyet.",
  tekst: "Punkter, mål, piler og tekst rett på bildet, med Apple Pencil eller finger. Laseren kobles til, og målene går rett inn i bildet. Punktlista til høyre har samme nummer som i CRM og kundeportalen.",
  alt: "Hengsel Ute på iPad: bildeverktøyet med punkter på bildet og punktliste til høyre",
  /** Laserens modellnavn i bildet er «Lasermåler» */
  bilde: "/img/app/ipad-bildeverktoy-laser.webp",
  w: 2360,
  h: 1640,
} as const;

export const UTEN_NETT = {
  eyebrow: "Virker uten dekning",
  tittel: "Kjelleren, hytta og nybygget uten nett.",
  tekst: "Alt montøren sender inn, legges først i en kø på telefonen og vises med en gang som om det var sendt. Når nettet kommer tilbake, sendes køen av seg selv.",
  fraAppen: "Fra appen",
  venter: "Venter på nett",
  sitat: "«Alt er lagret på telefonen og sendes av seg selv når nettet er tilbake. Ingenting går tapt.»",
  punkter: [
    "Bilder, avvik, KS, ferdigmelding, restpunkt og kundens signatur.",
    "«Klar uten nett» henter dagens jobber før du kjører.",
    "Pillen øverst viser hva som venter: «3 venter på nett».",
  ],
  alt: "Hengsel Ute uten nett: I dag med varsel om at bilder og kryss sendes når nettet er tilbake",
  lys: "/img/app/uten-nett-lys.webp",
  mork: "/img/app/uten-nett-mork.webp",
} as const;

export const BLI_TESTER = {
  tittel: "Bli tester",
  tekst: "Hengsel Ute er i test på iPhone, iPad og Android. Testsiden har lenkene og forteller hvordan du melder feil.",
  knapp: "Bli tester",
  appStore: "App Store",
} as const;
