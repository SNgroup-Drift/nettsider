/**
 * K-200: app-lenkene https://hengsel.no/app/jobb/<id> og /app/foresporsel/<id> sendes videre til CRM-et når de åpnes på PC.
 * CRM-adressen og rutene står BARE her. Ingen annen fil på nettstedet skal skrive CRM-adressen.
 *
 * Når CRM-et flytter til app.hengsel.no (K-183): bytt CRM_ADRESSE under til "https://app.hengsel.no" (og ruten i RUTER hvis den endres),
 * kjør `npm run build` og `npm test`. Ingenting annet trenger å endres.
 */

/** Opprinnelsen til CRM-et, uten skråstrek til slutt. */
export const CRM_ADRESSE = "https://crm.studiosigdal-innlandet.no";

/**
 * Rute i CRM-et per lenketype ({id} byttes ut). jobb: ordresiden (K-195). foresporsel: ingen rute i CRM-et ennå,
 * så lenketypen får ingen videresending, bare «Hent Hengsel-appen».
 */
export const RUTER = {
  jobb: "/#/orders/{id}",
  foresporsel: null,
};

/** Bare disse tegnene er lov i id-en (uuid, tall, nøkler). Alt annet gir ingen videresending. */
export const GYLDIG_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** Leser type og id fra stien, f.eks. «/app/jobb/123» → { type: "jobb", id: "123" }. Gir null hvis stien ikke har formen eller id-en er ugyldig. */
export function lesLenke(sti) {
  const m = /^\/app\/(jobb|foresporsel)\/([^/]+)\/?$/.exec(sti);
  if (!m || !GYLDIG_ID.test(m[2])) return null;
  return { type: m[1], id: m[2] };
}

/** CRM-adressen for lenken, eller null (ugyldig id, ukjent type eller type uten rute). Verten er alltid CRM_ADRESSE. */
export function crmAdresse(type, id) {
  const rute = Object.hasOwn(RUTER, type) ? RUTER[type] : null;
  if (!rute || typeof id !== "string" || !GYLDIG_ID.test(id)) return null;
  return CRM_ADRESSE + rute.replace("{id}", id);
}

/** Telefon eller nettbrett (iPadOS oppgir seg som Mac, men har berøring). Alt annet regnes som PC. */
export function erTelefon(ua, berøringspunkter = 0) {
  return /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && berøringspunkter > 1);
}
