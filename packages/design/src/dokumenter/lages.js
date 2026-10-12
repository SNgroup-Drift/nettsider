/**
 * «Slik lages det» per dokument (Visningsrommet, /dokumenter/): 3–5 steg fra ordren i CRM til ferdig PDF og utsending.
 * Hører til dokumentene i data.js (samme id). Skjermbildene er fra CRM-designfilene (sites/vis/src/skjermbilder, aldri fra kjørende demo),
 * vist i Studio Display-ramme. Samme bilde kan brukes i flere steg når CRM-skjermen er den samme; teksten sier da hva en skal se på.
 *
 * steg:   t = tittel, s = hva som skjer, knapp = knappen som trykkes (null når steget bare er å se på noe), bilde = fil i skjermbilder/, alt = alt-tekst.
 * etterpa: hva som skjer når PDF-en er laget. Typer: pdf, epost, sms, sign, lagret.
 * rom:    lenker til rommene som viser det samme.
 * Alt er oppdiktet eksempelinnhold (Butikknavn, Kari Nordmann, Leverandør A). Ingen merkenavn.
 */

/** @type {Record<string, import("./lages").LagesDok>} */
export const LAGES = {
  tilbud: {
    steg: [
      { t: "Åpne tilbudet på kundekortet", s: "Tegningen fra CET er hentet inn. Priser, prisgruppe, frakt og oppgraderinger står allerede på tilbudet, og Hengsel sier hva som mangler før det kan sendes.", knapp: null, bilde: "d1-lag-pdf-og-send", alt: "CRM: tilbudet på kundekortet med «Lag PDF og send», pris og mottaker" },
      { t: "Sjekk tegningen", s: "Kontrollmål, bilder og skisser følger tilbudet. Det som tegnes ved befaring havner på samme tilbud, og tegningen kommer med i PDF-en.", knapp: "Last ned PDF", bilde: "crm-mal-skisser", alt: "CRM: mål og skisser for kjøkkenet med målepunkter og bilder" },
      { t: "Se tilbudet slik kunden ser det", s: "Kunden får en egen visning med bilde, pris og «Aksepter tilbudet». Dokumentet og visningen bygger på de samme tallene.", knapp: "Send tilbud", bilde: "d10-sendt-til-kunden", alt: "CRM: «Send tilbud» og meldingen om at tilbudet er sendt til kunden, med loggen på ordren" },
    ],
    etterpa: [["pdf", "Tilbud.pdf lages med forside, kort fortalt, tegning, artikler og vilkår"], ["epost", "Kunden får e-post med lenke til kundeportalen"], ["sms", "SMS-varsel når tilbudet er klart"], ["lagret", "Lagres som versjon 3 på ordren, tidligere versjoner ligger igjen"]],
    rom: [{ u: "/reise/", t: "Ordrens reise, scene 1" }, { u: "/crm/", t: "Prøv CRM" }],
  },
  kjopsavtale: {
    steg: [
      { t: "Kunden godtar tilbudet", s: "I kundeportalen velger kunden oppgraderinger og trykker «Aksepter tilbudet». Valgene, betalingsplanen og vilkårene flyttes inn i avtalen.", knapp: "Aksepter tilbudet", bilde: "crm-tilbud-kunde", alt: "Kundens visning av tilbudet med knappen «Aksepter tilbudet»" },
      { t: "Ordren blir til", s: "Tilbudet blir ordre i CRM. Fanen «Dokumenter» på ordren viser kjøpsavtalen som utkast, med kontrollmålingen som neste oppgave.", knapp: null, bilde: "d2b-signert", alt: "CRM: ordren med fanen Dokumenter, kjøpsavtalen og status for signering" },
      { t: "Send til signering", s: "Selgeren sjekker utkastet og trykker «Send til signering». Kjøper signerer først med BankID, deretter motsignerer selger.", knapp: "Send til signering", bilde: "d2a-signer-med-bankid", alt: "Kundens avtale med «Signer med BankID» og oppsummering av kjøpsavtalen" },
    ],
    etterpa: [["pdf", "Kjøpsavtale.pdf lages med forside, avtale, vilkår, signering og vedlegg"], ["sign", "Penneo og BankID: kjøper signerer, så selger. Signaturark med tidspunkt legges til"], ["epost", "Begge parter får den signerte avtalen på e-post"], ["lagret", "Lagres på ordren og i kundeportalen. Endringsfrist og leveringsuke regnes ut"]],
    rom: [{ u: "/reise/", t: "Ordrens reise, scene 2 og 3" }, { u: "/minside/", t: "Kundens Min side" }],
  },
  ob: {
    steg: [
      { t: "Ordren er bestilt", s: "Varelinjene er sendt til leverandørene. Hver leverandør svarer med sin egen ordrebekreftelse.", knapp: null, bilde: "crm-ordre-kontrollmal", alt: "CRM: ordren med faner for bestillinger, kontrollmåling og dokumenter" },
      { t: "Kontroller bekreftelsene", s: "Hengsel sammenligner hver bekreftelse med ordren, linje for linje. Avvik, som benkeplate 20 mm i stedet for 30 mm, stoppes og bestilles på nytt.", knapp: "Koble", bilde: "crm-bestilling", alt: "CRM: Bestilling med ordrebekreftelser og fakturaer som kobles til ordren" },
      { t: "Send ordrebekreftelsen", s: "Når alle tre er godkjent, lages én bekreftelse til kunden med levering, montering og endringer siden tilbudet.", knapp: "Send ordrebekreftelse", bilde: "d3-send-ordrebekreftelse", alt: "CRM: «Send ordrebekreftelse» med vedlegg, e-post og SMS til kunden" },
    ],
    etterpa: [["pdf", "Ordrebekreftelse.pdf lages med varelinjer, levering og leverandørenes bekreftelser som vedlegg"], ["epost", "Kunden får e-post, og leveringsuken står i kundeportalen"], ["lagret", "Lagres på ordren. Ny OB fra en leverandør lager en ny versjon"]],
    rom: [{ u: "/reise/", t: "Ordrens reise, scene 4 til 6" }, { u: "/kontroll/", t: "Ordre- og fakturakontroll" }],
  },
  anbud: {
    steg: [
      { t: "Prosjektet i CRM", s: "Byggmesterens prosjekt ligger med 24 enheter og tre leilighetstyper. Hver type har kjøkken, garderobe og enhetspris.", knapp: null, bilde: "crm-tilbud", alt: "CRM: tilbud med pris, prisgruppe og oppgraderinger" },
      { t: "Standard og tilvalg", s: "For hver leilighet settes standard og mulige oppgraderinger med pris. Kjøperne velger selv i kundeportalen.", knapp: null, bilde: "crm-tilbud-kunde", alt: "Kundens visning med valg og pris" },
      { t: "Lag anbud", s: "Selgeren trykker «Lag anbud». Anbudet er en liggende presentasjon på A4 med leveransen og tilvalgslisten.", knapp: "Lag anbud", bilde: "d4-lag-tilvalgsliste", alt: "CRM: tilvalgslisten for prosjektet med «Lag tilvalgsliste»" },
    ],
    etterpa: [["pdf", "Anbud.pdf lages i liggende A4 med forside, leveransen, tilvalg og tilvalgsliste"], ["epost", "Byggmesteren får anbudet på e-post"], ["epost", "Kjøperne får invitasjon til kundeportalen. Påminnelse 7 og 2 dager før fristen"], ["lagret", "Lagres på prosjektet. Sum per leilighet blir grunnlaget for fakturering"]],
    rom: [{ u: "/prosjekt/", t: "Prosjektsalg" }],
  },
  montering: {
    steg: [
      { t: "Jobben ligger hos montøren", s: "Montasjeplanen sender jobben til montøren. Kontrollmal og tegning følger med i Hengsel Ute.", knapp: "Send uka til montørene", bilde: "crm-montasje", alt: "CRM: montasjeplan for uka med jobber per montør" },
      { t: "Kvalitetssjekk med bilder", s: "Montøren går gjennom KS-malen på kjøkkenet, punkt for punkt, med bilder og lasermåling. Avvik får eget nummer og blir lukket før jobben er ferdig.", knapp: "Åpne utfylling", bilde: "crm-ordre-kontrollmal", alt: "CRM: kontrollmalen på ordren med tildeling og utfylling" },
      { t: "Ferdig montert og signatur", s: "Montøren registrerer hvitevarer fra typeskiltet, og kunden signerer på skjermen. Rapporten kommer til CRM med en gang.", knapp: "Ferdig montert", bilde: "d5-lag-monteringsrapport", alt: "CRM: «Lag monteringsrapport» med KS-punkter, bilder og signaturer" },
    ],
    etterpa: [["pdf", "Monteringsrapport.pdf lages med kvalitetssjekk, bilder, restpunkter, hvitevarer og signaturer"], ["lagret", "Lagres på ordren, og restpunktene følger kunden videre"], ["epost", "Kunden får rapporten i kundeportalen"]],
    rom: [{ u: "/montoren/", t: "Montøren" }, { u: "/montor/", t: "Montørappen" }],
  },
  punkt: {
    steg: [
      { t: "Punktene samles på kunden", s: "Punkter fra befaring, montering, KS og reklamasjon får samme nummer i CRM, Hengsel Ute og kundeportalen.", knapp: null, bilde: "crm-min-dag", alt: "CRM: Min dag med avvik som må følges opp" },
      { t: "Fase, status og bilder", s: "Hvert punkt har fase, status og bilder. Selgeren ser hva som er åpent, løst eller utgått, og hvem som sist endret det.", knapp: null, bilde: "crm-ordre-kontrollmal", alt: "CRM: ordren med kontrollmåling og oppgaver" },
      { t: "Lag punktrapport", s: "Trykk «Lag punktrapport» på kundekortet for å få alle punktene på ett dokument, til kunde, montør eller leverandør.", knapp: "Lag punktrapport", bilde: "d6-lag-punktrapport", alt: "CRM: «Lag punktrapport» med punkter og forhåndsvisning" },
    ],
    etterpa: [["pdf", "Punktrapport.pdf lages med oversikt, punkter og status per fase"], ["epost", "Sendes til kunde, montør eller leverandør"], ["lagret", "Lagres på ordren, og nye punkter oppdaterer rapporten"]],
    rom: [{ u: "/montoren/", t: "Montøren" }, { u: "/minside/", t: "Kundens Min side" }],
  },
  fdv: {
    steg: [
      { t: "Ordren er ferdigmeldt", s: "Når montøren har meldt ferdig, er alt som trengs registrert: materialer, hvitevarer med serienummer og kundens signatur.", knapp: null, bilde: "crm-ordre-kontrollmal", alt: "CRM: ordren med dokumenter, montasje og kontrollmåling" },
      { t: "FDV følger det som er valgt", s: "Hengsel henter drift og vedlikehold for fronter, benkeplate og hvitevarer, og legger inn garanti og dokumentliste.", knapp: "Lag leveringspakke", bilde: "d7-lag-leveringspakke-fdv", alt: "CRM: «Lag leveringspakke (FDV)» med dokumenter og garanti" },
      { t: "Kunden åpner «Kjøkkenet ditt»", s: "Pakken ligger i kundeportalen så lenge kjøkkenet står. Kunden kan melde fra om en feil derfra.", knapp: "Meld en feil", bilde: "d11-min-side-nytt", alt: "Kundens Min side med dokumentene og leveringspakken" },
    ],
    etterpa: [["pdf", "Leveringspakke.pdf lages med forside, FDV, garanti, hvitevarer og dokumentliste"], ["epost", "Kunden får e-post, og pakken ligger i kundeportalen"], ["sms", "SMS-varsel når pakken er klar"], ["lagret", "Lagres på ordren"]],
    rom: [{ u: "/minside/", t: "Kundens Min side" }, { u: "/kunden/", t: "Kunden" }],
  },
  plan: {
    steg: [
      { t: "Åpne montasjeplanen", s: "Alle jobber og alle montører ligger i én uke. Jobber uten montør, konflikter og ledig kapasitet vises i planen.", knapp: null, bilde: "crm-montasje", alt: "CRM: montasjeplan med uke, montører og jobber" },
      { t: "Velg uke 47", s: "Planleggeren drar ikke-planlagte ordrer inn på riktig montør og dag, og ser belastningen på montasjefirmaene.", knapp: "Uke 47", bilde: "crm-saker", alt: "CRM: belastninger til montasjefirma per måned, firma og montør" },
      { t: "Skriv ut uka", s: "«Skriv ut uke» lager planen i liggende A4 med arbeidsordrene for hver jobb: adresse, start, kolli og merknad.", knapp: "Skriv ut uke", bilde: "d8-skriv-ut-plan", alt: "CRM: «Skriv ut plan» for montasjeplanen" },
    ],
    etterpa: [["pdf", "Montasjeplan.pdf lages i liggende A4, ett ark for uka og ett for arbeidsordrene"], ["epost", "Montørene og montasjefirmaene får planen på e-post"], ["lagret", "Lagres på uka, og endringer lager ny versjon"]],
    rom: [{ u: "/montasjeplan/", t: "Montasjeplan" }],
  },
  faktura: {
    steg: [
      { t: "Ordren er ferdigmeldt", s: "Når montøren har meldt ferdig og kunden har signert, er ordren klar for sluttfaktura etter betalingsplanen.", knapp: null, bilde: "crm-ordre-kontrollmal", alt: "CRM: ordren med faner for montasje, dokumenter og økonomi" },
      { t: "Sluttfaktura på 10 %", s: "Fanen «Økonomi» viser innkjøp, dekningsbidrag og hva som er fakturert. Sluttfakturaen er 10 % etter montering.", knapp: "Fakturer", bilde: "d9-lag-faktura", alt: "CRM: «Lag faktura» med sluttfaktura og betalingsplan" },
      { t: "Kontroller mot leverandørene", s: "Leverandørfakturaer kobles til ordren før regnskapet får tallene, så avvik oppdages før kunden faktureres.", knapp: "Koble", bilde: "crm-bestilling", alt: "CRM: leverandørfakturaer som kobles til ordren" },
    ],
    etterpa: [["pdf", "Faktura.pdf lages med betalingsinformasjon, KID og betalingsoversikt"], ["epost", "Kunden får fakturaen på e-post med forfall 14 dager frem"], ["lagret", "Overføres til regnskapet (PowerOffice Go) og lagres på ordren"]],
    rom: [{ u: "/kontroll/", t: "Ordre- og fakturakontroll" }, { u: "/reise/", t: "Ordrens reise, scene 8" }],
  },
};

/** Navn på chip-typene i «Etterpå». */
export const ETTERPA_TYPE = { pdf: "PDF", epost: "E-post", sms: "SMS", sign: "Signering", lagret: "Lagres" };
