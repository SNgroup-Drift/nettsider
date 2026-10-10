// hengsel.no – teksten på forsiden. Fasit: konstantene i docs/design/hengsel/56 Hengsel forside.dc.html (10.10.2026, kveld), ordrett.

// Innloggingsadressen («Logg inn» i menyen) settes med miljøvariabelen LOGIN ved bygging, se astro.config.mjs. Tom = skjult.
export const TEL = "+47 454 10 001";
/** tel:-lenken: nummeret uten mellomrom */
export const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
export const EPOST = "hei@hengsel.no";

/** Tre løfter: tittel, setning */
export const LOFTER: [string, string][] = [
  ["Ett sted for kunden.", "Tilbud, ordre, bestilling, montering, saker og faktura på samme kundekort."],
  ["Montøren slipper papir.", "Jobben, tegningene, målene og KS-sjekklista ligger i lomma."],
  ["Kunden følger med selv.", "Kundeportal med tilvalg, leveringsdag, punkter og dokumenter."],
];

/** Tre flater, samme ordre */
export const FLOW: { who: string; title: string; text: string }[] = [
  { who: "Kontoret", title: "Hengsel CRM", text: "Min dag, salgstavle, kundekort, tilbud, bestilling, ordre, montasje, saker og resultater. På PC, iPad og telefon." },
  { who: "Kunden", title: "Min side", text: "Kunden ser tilbudet med bilde og pris, velger tilvalg, signerer og følger reisen til kjøkkenet er montert. Uten app." },
  { who: "Montøren", title: "Hengsel Ute", text: "Dagens jobber, varer og tegning, KS med typeskilt, avvik med bilde og ferdigmelding med kundens signatur." },
];

/** Sju steg: tittel, tekst, bilde, enhet, hvor (metalinjen), alt */
export const STEG: [string, string, string, "phone" | "pc", string, string][] = [
  ["Befaring", "Mål og bilder tas på stedet med laser og telefon, rett inn på kunden. Målene følger tilbudet videre.", "ute-laser", "phone", "Hengsel Ute", "Hengsel Ute: mål med laser"],
  ["Tilbud", "Tegningen fra CET blir tilbud med bilde og pris. Kunden får det i kundeportalen og kan velge tilvalg.", "crm-tilbud", "pc", "Hengsel CRM", "Hengsel CRM: tilbudslisten"],
  ["Ordre og bestilling", "Signert avtale blir ordre. Bestilling går per leverandør, og ordrebekreftelsen leses mot bestillingen.", "crm-bestilling", "pc", "Hengsel CRM", "Hengsel CRM: bestilling"],
  ["Levering", "Leveringsdag til kunden på SMS. Mottak på lager og utkjøring registreres i appen.", "crm-ordre-kontrollmal", "pc", "Hengsel CRM", "Hengsel CRM: ordre med kontrollmål og tildeling"],
  ["Montering", "Montøren har tegning, varer og KS på telefonen. Punkter som krever bilde åpner kameraet.", "ute-ks", "phone", "Hengsel Ute", "Hengsel Ute: KS-sjekklisten"],
  ["Punkter og saker", "Restpunkter og avvik med bilde, nummerert på kunden. Saken går til butikken med en gang.", "ute-punkter", "phone", "Hengsel Ute", "Hengsel Ute: punkter hos kunden"],
  ["Ferdig og faktura", "Kunden signerer på stedet. Faktura går til regnskapet, og etterkalkylen viser hva jobben ga.", "ute-ferdig", "phone", "Hengsel Ute", "Hengsel Ute: ferdig montert"],
];

/** Elleve moduler: navn, setning */
export const MODULER: [string, string][] = [
  ["Grunnpakke", "Kundekort, Min dag, samtaler og innstillinger. Alltid med."],
  ["Salg", "Salgstavle, tilbud fra CET-tegningen og prisvarsler."],
  ["Kjøpsavtale og e-signering", "Avtalen signeres i kundeportalen og lagres på ordren."],
  ["Ordre og leveranse", "Bestilling, ordrebekreftelse mot bestilling og leveringsstatus per leverandør."],
  ["Montasje", "Montasjeplan per montør, monteringskalkyle og ferdigmelding fra Hengsel Ute."],
  ["Punkter og bildeverktøy", "Restpunkter og avvik med bilde, rett på ordren."],
  ["Prosjektsalg", "Leiligheter med standard, tilvalg og kjøperens godkjenning."],
  ["Ettermarked", "Saker, reklamasjoner og produkter hos kunden med typeskilt."],
  ["Økonomi", "Fakturastatus og etterkalkyle, koblet til regnskapet."],
  ["Kommunikasjon", "E-post, SMS og meldinger fra kundeportalen på kundekortet."],
  ["Automatikk", "Varsler til kunden og lesing av ordrebekreftelser i PDF."],
];

/** Hengsel Ute, åtte grep: tittel, tekst, bilde, alt, og for KS og Merking et andre bilde med alt */
export const GREP: [string, string, string, string, string?, string?][] = [
  ["I dag", "Neste jobb øverst, med adresse, hva som mangler og åpne restpunkter. «På vei» varsler kunden.", "ute-i-dag", "Hengsel Ute: I dag med neste jobb"],
  ["Befaring med laser", "Bosch-laseren kobles til over Bluetooth. Velg et mål på bildet, trykk på laseren, og tallet står der med kilde.", "ute-laser", "Hengsel Ute: mål på bildet fra Bosch-laser"],
  ["Varer og tegning på jobben", "Tegning og spesifikasjon, mål og skisser, bilder og restpunkter samlet på jobben. Før, under og etter.", "ute-jobb-under", "Hengsel Ute: jobben under arbeid"],
  ["KS punkt for punkt", "OK, avvik eller ikke relevant. Punkter som krever bilde åpner kameraet med en gang.", "ute-ks", "Hengsel Ute: KS-sjekkliste med punkt som krever bilde"],
  ["Typeskilt på hvitevarer", "Fotografer typeskiltet. Modell og serienummer legges på produktene hos kunden og følger med til FDV og reklamasjon.", "ute-typeskilt", "Hengsel Ute: hvitevarer skannet fra typeskilt"],
  ["Avvik med bilde", "Hva som er galt, bilde og om det trengs ny vare. Saken går til butikken med en gang.", "ute-avvik", "Hengsel Ute: meld avvik"],
  ["Merking av punkter", "Punkter markeres rett på bildet og får et nummer som følger kunden fra befaring til reklamasjon. Før- og etterbilde på hvert punkt.", "ute-punkter", "Hengsel Ute: punktliste på kunden", "ute-punktkort", "Hengsel Ute: punkt med før- og etterbilde"],
  ["Ferdigmelding", "Når KS er fylt ut, melder montøren ferdig og kunden bekrefter på stedet.", "ute-ferdig", "Hengsel Ute: klart for ferdigmelding"],
];

/** For kontoret, fire faner: tittel, tekst, bilde, alt */
export const KONTOR: [string, string, string, string][] = [
  ["Ledertavle", "Frister og tall for butikken, per selger og per uke. Det som haster står øverst.", "crm-resultater", "Hengsel CRM: ledertavle"],
  ["Montasjeplan", "Hvem som monterer hva, når kontrollmålene må være tatt, og monteringskalkylen per jobb.", "crm-montasje", "Hengsel CRM: kontrollmål per ordre i montasjeplanen"],
  ["Bestilling", "Bestilling per leverandør. Ordrebekreftelsen leses mot bestillingen, og avvik merkes.", "crm-bestilling", "Hengsel CRM: bestilling"],
  ["Økonomi", "Fakturastatus mot PowerOffice Go og etterkalkyle per ordre.", "crm-etterkalkyle", "Hengsel CRM: etterkalkyle"],
];

export const PORTAL = ["Tilbudet med bilde, pris og tilvalg", "Kjøpsavtale med e-signering", "Leveringsdag og montering", "Punkter, FDV og dokumenter etterpå"];

/** Integrasjoner: teknisk navn, setning med merkenavnet */
export const INTEG: [string, string][] = [
  ["Tegneprogram", "Tegning og varelinjer leses inn i tilbud, kalkyle og tilvalg. I dag: Configura CET."],
  ["Leverandørbestilling", "Bestilling og ordrebekreftelse per leverandør. I dag: Sigdal og Nobia."],
  ["Regnskap", "Kunde, prosjekt og faktura fra ordren, fakturastatus tilbake. I dag: PowerOffice Go."],
  ["E-signering", "Kjøpsavtalen signeres med BankID. I dag: Penneo."],
  ["Avstandsmåler", "Mål over Bluetooth rett inn i bildet i Hengsel Ute. I dag: Bosch GLM."],
  ["E-post og kalender", "Innlogging, e-post og møter fra kontoret. I dag: Microsoft 365."],
  ["SMS og e-post til kunden", "Beskjeder om levering og montering, sendt fra ordren."],
];

/** Trygghet: tittel, setning */
export const TRYGG: [string, string][] = [
  ["Data i EU", "Lagret i Frankfurt, hos en leverandør med databehandleravtale."],
  ["Roller og butikktilgang", "Hver bruker ser sin butikk og sin rolle. Ikke mer."],
  ["Logg på alle endringer", "Hvem som endret hva, og når."],
  ["Daglig sikkerhetskopi", "Automatisk, med gjenoppretting."],
];
