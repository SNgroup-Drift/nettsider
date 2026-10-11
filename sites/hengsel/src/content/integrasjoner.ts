// /integrasjoner: tekstene ordrett fra docs/design/hengsel-no-2.0/LES-MEG.md («/integrasjoner · Integrasjoner.dc.html»).
import { EPOST } from "./forside";

export const HERO = {
  eyebrow: "Integrasjoner",
  tittel: "Koblet til det dere bruker.",
  ingress: "Tegningen kommer fra CET, avtalen signeres i Penneo, og fakturaen går til PowerOffice. Velg en kobling for å se hva som går inn og ut.",
} as const;

export const PANEL = { valgt: "Valgt kobling", inn: "Inn i Hengsel", ut: "Ut fra Hengsel", brukes: "Brukes i:" } as const;
export const KART_ARIA = "Koblinger";

/** Rekkefølgen er plasseringen i systemkartet (3 × 3); Hengsel (indeks 4) ligger i midten. */
export const KOBLINGER = [
  { t: "CET", s: "Tegning og artikler", om: "Tegneren lagrer i CET, og selgeren henter tegningen inn i tilbudet. Hengsel viser hva som er endret fra forrige versjon.", inn: "Tegninger, artikler og priser", ut: "–", hvor: "Tilbud" },
  { t: "Penneo", s: "E-signering", om: "Kjøpsavtalen signeres med BankID. Signert avtale kommer tilbake til ordren.", inn: "Signert avtale og tidspunkt", ut: "Kjøpsavtalen til signering", hvor: "Kundeportal og ordre" },
  { t: "PowerOffice Go", s: "Regnskap", om: "Fakturaer og kunder overføres til regnskapet, med forskudd og sluttfaktura etter betalingsplanen.", inn: "Betalingsstatus", ut: "Kunder og fakturaer", hvor: "Økonomi" },
  { t: "Tradeplace", s: "Hvitevarer", om: "Bestilling av hvitevarer går via Tradeplace. Ordrebekreftelsen kontrolleres mot ordren.", inn: "Ordrebekreftelse og leveringsdato", ut: "Bestilling", hvor: "Bestilling" },
  { t: "Hengsel", s: "CRM · Ute · Kundeportal", om: "Én ordre og ett kundekort. Koblingene leser og skriver til samme ordre.", inn: "Alt over", ut: "Alt over", hvor: "Hele løsningen", midten: true },
  { t: "Lasermåler", s: "Via Bluetooth", om: "Lasermåleren kobles til Hengsel Ute via Bluetooth. Målet går rett inn i bildet montøren tegner på.", inn: "Lasermål", ut: "–", hvor: "Hengsel Ute" },
  { t: "SMS og e-post", s: "Varsler", om: "Kunden får SMS når noe er nytt i portalen. Montøren får varsel om nye jobber og endringer.", inn: "Leveringsstatus", ut: "SMS og e-post", hvor: "Kundeportal og Hengsel Ute" },
  { t: "Leverandører", s: "Bestilling og OB", om: "Bestilling til leverandør med ordrebekreftelse. Avvik i OB havner i Min dag.", inn: "Ordrebekreftelse", ut: "Bestilling", hvor: "Bestilling" },
  { t: "Feilovervåking", s: "Drift", om: "Feil i løsningen varsles til oss, slik at vi kan rette dem raskt.", inn: "–", ut: "Feilmeldinger", hvor: "Drift" },
] as const;

export const SIKKERHET = {
  eyebrow: "Sikkerhet",
  tittel: "Kundens data, trygt lagret.",
  kort: [
    ["EU-lagring", "Data lagres i EU."],
    ["Roller", "Roller og butikktilgang styrer hvem som ser hva."],
    ["Logg", "Logg på alle endringer."],
    ["Sikkerhetskopi", "Daglig sikkerhetskopi."],
  ],
  selskap: "Hengsel eies av ES-HOLDING AS, org.nr. 927 363 585. Spørsmål om personvern og databehandleravtale:",
  epost: EPOST,
} as const;
