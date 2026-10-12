/**
 * Navn i designfilene som byttes til oppdiktede før skjermbildene tas (scripts/fiktive-skjermer.mjs).
 * Ingen ekte merke-, leverandør- eller personnavn: «Hovedleverandør A», «Hvitevaremerke X» og «Nordmann» som etternavn.
 */
export const ERSTATT_NAVN = [
  [/Sigdal/g, "Hovedleverandør A"],
  [/Elkjøp Proff/g, "Hovedleverandør B"],
  [/Electrolux/g, "Hvitevaremerke X"],
  [/Merke iQ700/g, "Hvitevaremerke X"],
  [/EIV84550/g, "X-1000"],
  [/Blanco Subline/g, "Vaskemerke Y"],
  [/Blanco/g, "Vaskemerke Y"],
  [/\bSteni\b/g, "Leverandør C"],
  [/Montasjefirma Innlandet/g, "Montasjefirma Nord"],
  [/\bHansen\b/g, "Nordmann"],
  [/Fjellmontasje AS/g, "Montasjefirma B AS"],
  [/Montasjefirma Nord AS/g, "Montasjefirma A AS"],
  [/\b(Eva|Per|Ola|Nils|Lise|Hans|Pål) (Berg|Dahl|Hammer|Lie|Moen|Hansen|Prøvesen)\b/g, "$1 Nordmann"],
];
