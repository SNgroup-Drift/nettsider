/**
 * Signering i Penneo (K-240, 60-213 punkt g). Rekkefølgen og statusene er bygd; selve integrasjonen er AV til hemmeligheten PENNEO_API_KEY
 * er satt i Workeren (`npx wrangler secret put PENNEO_API_KEY -c sites/admin/wrangler.jsonc`). Uten nøkkelen viser avtalesiden
 * «Penneo er ikke koblet til», og avtalen kan markeres signert for hånd, i samme rekkefølge.
 *
 * Rekkefølge: 1 kunden (kontakt med signaturrett hos eieren), 2 leverandøren. Leverandøren får invitasjon først når kunden har signert.
 * Når én har signert: signatar 1 = signert med tid, avtalen står fortsatt som «Til signering», signatar 2 = venter.
 * Når begge har signert: avtalen = signert (resten gjøres i api.js: tilbud akseptert, eier og mulighet signert, er_kunde = 1).
 *
 * PenneoKlient er et tynt skall rundt Penneos REST-API. Endepunktene (base PENNEO_API_URL, standard Penneos produksjons-API) må bekreftes
 * mot Penneos dokumentasjon når nøkkelen settes; til da kalles de aldri. Ingen nøkler i koden.
 */

export function erKoblet(env) {
  return typeof env?.PENNEO_API_KEY === "string" && env.PENNEO_API_KEY.trim().length > 0;
}

export const PARTER = [{ rekkefolge: 1, part: "kunde" }, { rekkefolge: 2, part: "leverandor" }];

const sorter = (s) => [...s].sort((a, b) => a.rekkefolge - b.rekkefolge);

/** Starter signeringen: første signatar venter (sendt = tid), resten er ikke sendt. Ren funksjon. */
export function startSignering(signatarer, tid) {
  return sorter(signatarer).map((s, i) => ({ ...s, status: i === 0 ? "venter" : "ikke_sendt", sendt: i === 0 ? tid : null, signert: null }));
}

/** Den som venter nå (skal få påminnelse), eller null */
export function nesteSomVenter(signatarer) {
  return sorter(signatarer).find((s) => s.status === "venter") ?? null;
}

/**
 * Registrerer at signatar nr. `rekkefolge` har signert. Bare den som venter kan signere, og bare i rekkefølge.
 * Neste signatar får status venter (invitasjon) med sendt = tid. Returnerer { signatarer, alleSignert }.
 */
export function registrerSignert(signatarer, rekkefolge, tid) {
  const liste = sorter(signatarer);
  const i = liste.findIndex((s) => s.rekkefolge === rekkefolge);
  if (i < 0) throw new Error("Ukjent signatar");
  if (liste[i].status === "signert") throw new Error("Har allerede signert");
  if (liste.slice(0, i).some((s) => s.status !== "signert")) throw new Error("Kunden må signere først");
  if (liste[i].status !== "venter") throw new Error("Signatar er ikke sendt til signering");
  const ny = liste.map((s, j) => {
    if (j === i) return { ...s, status: "signert", signert: tid };
    if (j === i + 1) return { ...s, status: "venter", sendt: tid };
    return s;
  });
  return { signatarer: ny, alleSignert: ny.every((s) => s.status === "signert") };
}

/** Tekst til avtalesiden: hvem vi venter på */
export function ventetekst(signatarer) {
  const liste = sorter(signatarer);
  if (liste.every((s) => s.status === "signert")) return "Begge har signert.";
  const v = liste.find((s) => s.status === "venter");
  if (!v) return "Ikke sendt til signering.";
  return v.part === "kunde" ? "Venter på kunden." : "Venter på leverandøren.";
}

export class PenneoKlient {
  constructor(env, hent = fetch) {
    this.base = (env.PENNEO_API_URL ?? "https://app.penneo.com/api/v3").replace(/\/+$/, "");
    this.nokkel = env.PENNEO_API_KEY;
    this.hent = hent;
  }
  async kall(metode, sti, body) {
    const r = await this.hent(`${this.base}${sti}`, {
      method: metode,
      headers: { Authorization: `Bearer ${this.nokkel}`, "Content-Type": "application/json", Accept: "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`Penneo svarte ${r.status}`);
    return r.status === 204 ? null : r.json();
  }
  /** Oppretter en signeringssak med dokumentene og signatarene i rekkefølge. Returnerer { sakId, signatarIder: {rekkefolge: id} }. */
  async opprettSak({ avtale, signatarer, dokumenter }) {
    const sak = await this.kall("POST", "/casefiles", { title: `${avtale.nr} ${avtale.eier_navn}`, reference: avtale.nr, sensitiveData: false });
    for (const d of dokumenter) await this.kall("POST", `/casefiles/${sak.id}/documents`, { title: `${d.navn} ${d.versjon}`, documentType: "signable" });
    const signatarIder = {};
    for (const s of signatarer) {
      const sg = await this.kall("POST", `/casefiles/${sak.id}/signers`, { name: s.navn, email: s.epost, role: s.rolle ?? s.part, signingOrder: s.rekkefolge });
      signatarIder[s.rekkefolge] = String(sg.id);
    }
    await this.kall("PATCH", `/casefiles/${sak.id}`, { status: "sent", sendInOrder: true });
    return { sakId: String(sak.id), signatarIder };
  }
  async sendPaaminnelse(sakId, signatarId) {
    await this.kall("POST", `/casefiles/${sakId}/signers/${signatarId}/remind`, {});
  }
  async hentStatus(sakId) {
    return this.kall("GET", `/casefiles/${sakId}`);
  }
}
