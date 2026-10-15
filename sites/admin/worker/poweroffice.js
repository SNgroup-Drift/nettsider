/**
 * PowerOffice Go (K-260, 60-211 SC2 og SC4). Samme mønster som Penneo i K-240: integrasjonen er AV til alle hemmelighetene er satt i Workeren:
 *   npx wrangler secret put POWEROFFICE_APP_KEY -c sites/admin/wrangler.jsonc          (Application Key)
 *   npx wrangler secret put POWEROFFICE_CLIENT_KEY -c sites/admin/wrangler.jsonc       (Client Key, fra kunden ES-Holding i Go)
 *   npx wrangler secret put POWEROFFICE_SUBSCRIPTION_KEY -c sites/admin/wrangler.jsonc (Ocp-Apim-Subscription-Key)
 * Valgfri variabel POWEROFFICE_API_URL (standard produksjon https://goapi.poweroffice.net/v2; demo: https://goapi.poweroffice.net/demo/v2)
 * og POWEROFFICE_TOKEN_URL (standard https://goapi.poweroffice.net/OAuth/Token).
 * Uten nøklene er «Send til PowerOffice» grå med «PowerOffice er ikke koblet til», og Utestående viser tom tilstand. Klienten kalles aldri
 * uten nøkler (erKoblet sjekkes før hvert kall, og konstruktøren kaster). Ingen nøkler i repoet.
 *
 * API v2 (developer.poweroffice.net): OAuth 2 client credentials. Token: POST til token-adressen med
 * Authorization: Basic base64(ApplicationKey:ClientKey), Ocp-Apim-Subscription-Key og grant_type=client_credentials. Tokenet varer 20 minutter
 * og sendes som Bearer sammen med abonnementsnøkkelen på hvert kall.
 * Stiene under (Customers, SalesOrders, CustomerLedger/OpenItems) og feltnavnene er skrevet etter dokumentasjonen så godt det lot seg gjøre fra
 * denne økta (developer.poweroffice.net svarte ikke herfra). De MÅ sjekkes mot Postman-samlingen på developer.poweroffice.net før nøklene settes.
 */

const NOKLER = ["POWEROFFICE_APP_KEY", "POWEROFFICE_CLIENT_KEY", "POWEROFFICE_SUBSCRIPTION_KEY"];

export function erKoblet(env) {
  return NOKLER.every((k) => typeof env?.[k] === "string" && env[k].trim().length > 0);
}

export const IKKE_KOBLET = "PowerOffice er ikke koblet til.";

export class PowerOfficeKlient {
  /** @param {Record<string, any>} env @param {typeof fetch} [hent] */
  constructor(env, hent = fetch) {
    if (!erKoblet(env)) throw new Error(IKKE_KOBLET);
    this.base = (env.POWEROFFICE_API_URL ?? "https://goapi.poweroffice.net/v2").replace(/\/+$/, "");
    this.tokenUrl = env.POWEROFFICE_TOKEN_URL ?? "https://goapi.poweroffice.net/OAuth/Token";
    this.app = env.POWEROFFICE_APP_KEY.trim();
    this.klient = env.POWEROFFICE_CLIENT_KEY.trim();
    this.abonnement = env.POWEROFFICE_SUBSCRIPTION_KEY.trim();
    this.hent = hent;
    this.token = null;
    this.utloper = 0;
  }

  async hentToken() {
    if (this.token && Date.now() < this.utloper) return this.token;
    const r = await this.hent(this.tokenUrl, {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`${this.app}:${this.klient}`)}`, "Ocp-Apim-Subscription-Key": this.abonnement, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: "grant_type=client_credentials",
    });
    if (!r.ok) throw new Error(`PowerOffice: innloggingen feilet (${r.status}).`);
    const d = await r.json();
    this.token = d.access_token;
    // Tokenet varer 20 minutter; fornyes ett minutt før
    this.utloper = Date.now() + Math.max(60, Number(d.expires_in ?? 1200) - 60) * 1000;
    return this.token;
  }

  async kall(metode, sti, body) {
    const token = await this.hentToken();
    const r = await this.hent(`${this.base}${sti}`, {
      method: metode,
      headers: { Authorization: `Bearer ${token}`, "Ocp-Apim-Subscription-Key": this.abonnement, Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`PowerOffice svarte ${r.status}.`);
    return r.status === 204 ? null : r.json();
  }

  /** Kunden i Go etter org.nr., eller null */
  async finnKunde(orgnr) {
    if (!orgnr) return null;
    const svar = await this.kall("GET", `/Customers?organizationNumbers=${encodeURIComponent(orgnr)}`);
    const liste = Array.isArray(svar) ? svar : svar?.data ?? [];
    return liste[0] ?? null;
  }

  /**
   * Fakturaen som salgsordre i Go (utkast Go sender til kunden). Én per eier, butikkene står i teksten (60-212 spørsmål 8).
   * @param {{kundeId: string|number, fakturadato: string, referanse: string, linjer: Array<{tekst:string, antall:number, pris_ore:number, belop_ore:number}>}} f
   */
  async lagSalgsordre({ kundeId, fakturadato, referanse, linjer }) {
    const ordre = await this.kall("POST", "/SalesOrders/Complete", {
      CustomerId: kundeId,
      SalesOrderDate: fakturadato,
      CustomerReference: referanse,
      SalesOrderLines: linjer.map((l) => ({ Description: l.tekst, Quantity: l.antall, UnitPrice: l.antall ? Math.round(l.belop_ore / l.antall) / 100 : l.belop_ore / 100 })),
    });
    return String(ordre?.Id ?? ordre?.id ?? "");
  }

  /** Åpne poster i kundereskontroen per dato (Utestående). Lagres ikke. */
  async apnePoster(dato) {
    const svar = await this.kall("GET", `/CustomerLedger/OpenItems?toDate=${encodeURIComponent(dato)}`);
    const liste = Array.isArray(svar) ? svar : svar?.data ?? [];
    return liste.map((p) => ({
      fakturanr: String(p.DocumentNo ?? p.InvoiceNo ?? p.VoucherNo ?? ""),
      kunde_orgnr: p.CustomerOrganizationNumber ?? p.OrganizationNumber ?? null,
      kunde_navn: p.CustomerName ?? p.Name ?? "",
      belop_ore: Math.round(Number(p.Amount ?? p.RemainingAmount ?? 0) * 100),
      fakturadato: String(p.VoucherDate ?? p.InvoiceDate ?? "").slice(0, 10),
      forfall: String(p.DueDate ?? "").slice(0, 10),
      purring: p.ReminderStatus ?? p.Reminder ?? null,
    }));
  }
}
