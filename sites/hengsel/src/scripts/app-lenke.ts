/**
 * Skriptet på /app/lenke (K-200). _redirects skriver /app/jobb/* og /app/foresporsel/* om til denne siden (200), så adressen står uendret.
 * PC: send videre til CRM-et med en gang (location.replace). Telefon uten appen: vis «Åpne jobben i CRM-et» og «Hent Hengsel-appen».
 * Adressen kommer fra src/content/crm-lenke.mjs, id-en kontrolleres der. Ugyldig id eller type uten CRM-rute: ingen videresending.
 */
import { crmAdresse, erTelefon, lesLenke } from "../content/crm-lenke.mjs";

const rot = document.querySelector<HTMLElement>("[data-app-lenke]");
if (rot) {
  const lenke = lesLenke(location.pathname);
  const adresse = lenke && crmAdresse(lenke.type, lenke.id);
  const crm = rot.querySelector<HTMLAnchorElement>("[data-crm-lenke]");
  const vis = (tilstand: string) => { rot.dataset.tilstand = tilstand; };
  if (!lenke) vis("ugyldig");
  else if (!adresse || !crm) vis("uten-crm");
  else {
    crm.href = adresse;
    const telefon = erTelefon(navigator.userAgent, navigator.maxTouchPoints);
    vis(telefon ? "telefon" : "pc");
    if (!telefon) location.replace(adresse);
  }
}
