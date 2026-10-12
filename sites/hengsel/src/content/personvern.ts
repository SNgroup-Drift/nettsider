import type { Avsnitt } from "@sngroup/design/types";

/**
 * Personvern for hengsel.no. Dagens tekst fra hengsel.no (docs/kilde/hengsel.no/personvern.raw.html) ordrett,
 * med to endringer Eirik godkjente 07.10.2026: skriftene ligger på egen server, og driften er hos Cloudflare.
 * 09.10.2026: tilpasset den nye forsiden (fil 51): ingen fane som huskes i nettleseren, og skjemaet har bare
 * navn, butikk, e-post og telefon. Linjen om informasjonskapsler nevner testsiden for montørappen (K-107).
 */
const epost = '<a href="mailto:drift@sngroup.no">drift@sngroup.no</a>';

export const personvern = {
  etikett: "hengsel.no",
  tittel: "Personvern",
  ingress: "Slik behandler vi opplysningene dine når du besøker hengsel.no eller tar kontakt med oss.",
  oppdatert: "Sist oppdatert 9. oktober 2026",
  behandlingsansvarlig: "ES-HOLDING AS",
  kontakt: "drift@sngroup.no",
  avsnitt: [
    {
      overskrift: "Hvem er ansvarlig",
      tekst: ["ES-HOLDING AS er behandlingsansvarlig for nettsiden hengsel.no."],
      boks: `ES-HOLDING AS · Org.nr. 927 363 585<br>Enromvegen 173, 7026 Trondheim<br>E-post: ${epost}`,
    },
    {
      overskrift: "Når du besøker siden",
      punkter: [
        "Siden har ingen innlogging, ingen analyseverktøy og ingen sporing.",
        "Vi bruker ingen informasjonskapsler (cookies). Unntaket er en passordbeskyttet testside for inviterte testere av montørappen: når du har skrevet riktig passord der, lagres én nødvendig informasjonskapsel i 30 dager, så du slipper å skrive passordet på nytt. Den brukes ikke til noe annet.",
        // Endret 07.10.2026 (var: «Skriftene lastes fra Google Fonts. …»)
        "Skriftene ligger på vår egen server. Nettsiden henter ingenting fra andre nettsteder.",
        // Endret 07.10.2026 (var: «Nettsiden driftes hos Lovable, …»)
        "Nettsiden driftes hos Cloudflare, og domenet er registrert hos Domeneshop. Cloudflare fører tekniske logger med blant annet IP-adresse og tidspunkt, som brukes til drift og sikkerhet.",
      ],
    },
    {
      overskrift: "Når du ber om demo eller skriver til oss",
      tekst: [
        "Skjemaet på forsiden lagrer ingenting. Det fyller ut en e-post i ditt eget e-postprogram, og ingenting blir sendt før du selv trykker send.",
        "Når du sender e-posten, mottar vi det du har skrevet: navn, butikk, e-post og telefon, og det du eventuelt skriver i e-posten.",
      ],
      punkter: [
        "<b>Formål:</b> å svare deg, avtale en gjennomgang og følge opp henvendelsen.",
        "<b>Grunnlag:</b> vår berettigede interesse i å svare på henvendelser, og tiltak du ber om før en eventuell avtale (personvernforordningen artikkel 6 nr. 1 bokstav f og b).",
        "<b>Hvor:</b> e-posten behandles i Microsoft 365.",
        "<b>Hvor lenge:</b> så lenge det trengs for å følge opp henvendelsen. Blir du kunde, gjelder avtalen og databehandleravtalen vi inngår med butikken.",
        "Vi selger ikke opplysningene og deler dem ikke med andre.",
      ],
    },
    {
      overskrift: "Montørappen Hengsel Ute",
      tekst: [
        'Personvernerklæringen for montørappen Hengsel Ute ligger på <a href="https://sngroup.no/personvern">sngroup.no/personvern</a>.',
      ],
    },
    {
      overskrift: "Dine rettigheter",
      tekst: [
        `Du kan be om innsyn i, retting av eller sletting av opplysninger vi har om deg, og du kan protestere mot behandlingen. Skriv til ${epost}, så svarer vi innen 30 dager.`,
        'Mener du at vi behandler opplysningene feil, kan du klage til <a href="https://www.datatilsynet.no">Datatilsynet</a>.',
      ],
    },
  ] satisfies Avsnitt[],
};
