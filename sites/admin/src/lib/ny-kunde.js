/**
 * Opprett kunde (K-272): felles for Workeren og nettleseren. Kontrollen av kundens oppsett er den samme som i Action-en
 * (SNgroup-Drift/hengsel-crm, scripts/ny-kunde/lib/kunde.mjs), som kontrollerer på nytt før noe opprettes. Test-vektorene i
 * scripts/admin-k272.test.mjs og i hengsel-crm holder de to like. Ingen hemmeligheter her.
 */
export const TEMAER = [["hengsel", "Hengsel furu"], ["sigdal", "Sigdal"]];
export const RESERVERTE = ["innlandet", "visning", "crm-demo", "demo", "prod", "admin", "app", "www", "test", "hengsel", "sigdal"];
export const STEG = [
  { nr: 1, kode: "miljo", navn: "GitHub-miljø og hemmeligheter", forklaring: "Miljøet kunde-<id> med bare main som tillatt gren, og hemmelighetene kunden trenger" },
  { nr: 2, kode: "supabase", navn: "Supabase-prosjekt", forklaring: "Nytt prosjekt i EU-regionen (samme som produksjon), Pro, sterkt databasepassord" },
  { nr: 3, kode: "kundelista", navn: "Kundelista (PR)", forklaring: "Pull request som legger kunden i kunder/kunder.json" },
  { nr: 4, kode: "database", navn: "Migreringer, bøtter og cron", forklaring: "supabase db push, storage-bøtter, cron-jobber og auth-hook-funksjonen" },
  { nr: 5, kode: "funksjoner", navn: "Edge-funksjoner og hemmeligheter", forklaring: "Alle edge-funksjoner og funksjonshemmelighetene" },
  { nr: 6, kode: "auth", navn: "Auth-innstillinger og auth-hook", forklaring: "Site URL, redirect-URL-er, e-postmaler, passordregler, MFA og auth-hooken" },
  { nr: 7, kode: "cloudflare", navn: "Cloudflare Pages og første bygg", forklaring: "Pages-prosjekt hengsel-<id>, custom domain og første bygg med kundens tema" },
  { nr: 8, kode: "seed", navn: "Seed og første administrator", forklaring: "Kjede, butikker, merker, innstillinger, nummerserier og invitasjon av administrator" },
  { nr: 9, kode: "royktest", navn: "Røyktest", forklaring: "Innlogging, claims fra auth-hooken, og opprett/slett kunde i en tilbakerullet transaksjon" },
];
export const STATUSNAVN = { ny: "Venter på Action", kjorer: "Pågår", feil: "Stoppet", ferdig: "Ferdig", fjerner: "Rives ned", fjernet: "Revet ned" };
export const STEGSTATUSNAVN = { venter: "Venter", kjorer: "Pågår", ok: "Ferdig", feil: "Feilet" };

const SLUG = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;
const KODE = /^[a-z][a-z0-9_]{1,29}$/;
const VERT = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const EPOST = /^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/i;
const NOKKEL = /sb_(secret|publishable)_|eyJ[A-Za-z0-9_-]{20,}|service_role|-----BEGIN|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_|sbp_[a-f0-9]{20,}/;

/** Norsk organisasjonsnummer: 9 siffer med kontrollsiffer (mod 11) */
export function gyldigOrgnr(v) {
  const s = String(v ?? "").replace(/\s+/g, "");
  if (!/^\d{9}$/.test(s)) return false;
  const vekt = [3, 2, 7, 6, 5, 4, 3, 2];
  const sum = vekt.reduce((a, w, i) => a + w * Number(s[i]), 0);
  const k = 11 - (sum % 11);
  return (k === 11 ? 0 : k) === Number(s[8]);
}

const tekst = (v) => (typeof v === "string" ? v.trim() : "");
export const kodeFra = (s) => tekst(s).toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^([0-9])/, "x$1").slice(0, 30);

/**
 * @param {unknown} inn skjemaet fra veiviseren
 * @returns {{ kunde?: object, feil: Record<string, string> }} feil per felt (norsk), eller den normaliserte kunden med avledede navn
 */
export function normaliser(inn, { eksisterendeIder = [] } = {}) {
  const feil = {};
  const k = inn && typeof inn === "object" ? inn : {};
  if (NOKKEL.test(JSON.stringify(k))) feil.generelt = "Oppsettet ser ut til å inneholde en nøkkel eller et token. Fjern den.";
  const id = tekst(k.id).toLowerCase();
  if (!SLUG.test(id)) feil.id = "Kunde-id må være 3–40 tegn: små bokstaver, tall og bindestrek, og begynne med bokstav.";
  else if (RESERVERTE.includes(id)) feil.id = `Kunde-id «${id}» er reservert.`;
  else if (eksisterendeIder.includes(id)) feil.id = `Kunde-id «${id}» finnes allerede.`;
  const navn = tekst(k.navn);
  if (navn.length < 2 || navn.length > 80) feil.navn = "Navn må være 2–80 tegn.";
  const kjede = { navn: tekst(k.kjede?.navn || k.kjede) || navn, kode: tekst(k.kjede_kode || k.kjede?.kode) || kodeFra(id) };
  if (kjede.navn.length < 2) feil.kjede = "Kjeden mangler navn.";
  if (!KODE.test(kjede.kode)) feil.kjede_kode = "Kjedekode må være 2–30 tegn: små bokstaver, tall og understrek, og begynne med bokstav.";
  else if (kjede.kode === "sigdal_innlandet") feil.kjede_kode = "Kjedekoden sigdal_innlandet er Innlandets. Velg en annen.";
  const orgnr = String(k.orgnr ?? "").replace(/\s+/g, "");
  if (!gyldigOrgnr(orgnr)) feil.orgnr = "Org.nr. må være 9 siffer med gyldig kontrollsiffer.";

  const butikker = (Array.isArray(k.butikker) ? k.butikker : []).map((b) => {
    const bn = tekst(typeof b === "string" ? b : b?.navn);
    return { navn: bn, kode: tekst(b?.kode) || kodeFra(bn), orgnr: String(b?.orgnr ?? "").replace(/\s+/g, "") || undefined };
  });
  if (!butikker.length) feil.butikker = "Minst én butikk.";
  else if (butikker.length > 50) feil.butikker = "Maks 50 butikker i oppstarten.";
  else if (butikker.some((b) => b.navn.length < 2 || !KODE.test(b.kode))) feil.butikker = "Hver butikk trenger et navn (2+ tegn) som gir en gyldig kode.";
  else if (butikker.some((b) => b.orgnr && !gyldigOrgnr(b.orgnr))) feil.butikker = "En butikk har ugyldig org.nr.";
  else if (new Set(butikker.map((b) => b.kode)).size !== butikker.length) feil.butikker = "To butikker har samme kode.";

  const merker = (Array.isArray(k.merker) ? k.merker : []).map((m) => {
    const mn = tekst(typeof m === "string" ? m : m?.navn);
    return { navn: mn, kode: tekst(m?.kode) || kodeFra(mn) };
  });
  if (!merker.length) feil.merker = "Minst ett merke.";
  else if (merker.some((m) => !m.navn || !KODE.test(m.kode))) feil.merker = "Hvert merke trenger et navn som gir en gyldig kode.";
  else if (new Set(merker.map((m) => m.kode)).size !== merker.length) feil.merker = "To merker har samme kode.";

  const tema = tekst(k.tema) || "hengsel";
  if (!TEMAER.some(([t]) => t === tema)) feil.tema = `Tema «${tema}» finnes ikke.`;

  const domeneType = k.domene?.type === "eget" ? "eget" : "app";
  const hoveddomene = domeneType === "app" ? `${id}.app.hengsel.no` : tekst(k.domene?.verdi).toLowerCase();
  if (!VERT.test(hoveddomene)) feil.domene = "Domenet er ikke et gyldig vertsnavn.";
  else if (domeneType === "eget" && /(^|\.)hengsel\.no$/.test(hoveddomene)) feil.domene = "Eget domene kan ikke ligge under hengsel.no. Velg «<kunde>.app.hengsel.no».";
  else if (["crm.studiosigdal-innlandet.no", "minside.studiosigdal-innlandet.no", "app.hengsel.no", "demo.hengsel.no"].includes(hoveddomene)) feil.domene = "Domenet tilhører en eksisterende kunde.";

  const epost = tekst(k.admin?.epost ?? k.admin_epost).toLowerCase();
  if (!EPOST.test(epost)) feil.admin_epost = "Første administrator trenger en gyldig e-postadresse.";
  const adminNavn = tekst(k.admin?.navn ?? k.admin_navn) || epost.split("@")[0];

  if (Object.keys(feil).length) return { feil };
  return {
    feil,
    kunde: {
      id, navn, test: k.test === true, orgnr, kjede, butikker, merker, tema,
      domene: { type: domeneType, ...(domeneType === "eget" ? { verdi: hoveddomene } : {}), hoveddomene },
      admin: { epost, navn: adminNavn },
      pages_prosjekt: `hengsel-${id}`, pages_adresse: `hengsel-${id}.pages.dev`, github_miljo: `kunde-${id}`, supabase_navn: `hengsel-${id}`, app_url: `https://${hoveddomene}`,
    },
  };
}

/** Det som sendes til Action-en (uten avledede felt; Action-en regner dem ut selv) */
export function tilAction(kunde) {
  const { id, navn, test, orgnr, kjede, butikker, merker, tema, domene, admin } = kunde;
  return { id, navn, test, orgnr, kjede, butikker, merker, tema, domene: domene.type === "eget" ? { type: "eget", verdi: domene.hoveddomene } : { type: "app" }, admin };
}

/**
 * Sjekklisten når oppsettet er ferdig: først det kunden gjør (DNS, e-post, første innlogging), så det Eirik gjør. Bare tekst og lenker,
 * ingen hemmeligheter. `jobb` har kunde_id, navn, test, innstilling (kundens JSON), resultat og eventuelt pr_url.
 */
export function sjekkliste(jobb) {
  const k = normaliser(typeof jobb.innstilling === "string" ? JSON.parse(jobb.innstilling) : jobb.innstilling).kunde;
  if (!k) return { kunde: [], intern: [] };
  const eget = k.domene.type === "eget";
  const kunde = [
    eget
      ? { tittel: `Legg inn DNS-posten for ${k.domene.hoveddomene}`, tekst: `Opprett en CNAME-post: navn ${k.domene.hoveddomene} (hos de fleste leverandører bare «${k.domene.hoveddomene.split(".")[0]}»), verdi ${k.pages_adresse}. Bruk et underdomene (f.eks. crm.), ikke selve rotdomenet. Sertifikatet kommer av seg selv, vanligvis innen 15 minutter etter at DNS-posten er synlig.`, kopi: `CNAME ${k.domene.hoveddomene} → ${k.pages_adresse}` }
      : { tittel: `DNS for ${k.domene.hoveddomene}`, tekst: `Domenet ligger hos oss. Posten settes automatisk når Cloudflare-tokenet for DNS er lagt inn; ellers legger Eirik inn CNAME ${k.domene.hoveddomene} → ${k.pages_adresse}.`, kopi: `CNAME ${k.domene.hoveddomene} → ${k.pages_adresse}` },
    { tittel: "Koble e-posten", tekst: "Kunden kobler avsenderadressen sin til Microsoft 365 slik at e-post fra systemet går fra deres eget domene. Se K-273 for oppskriften.", lenke: null },
    { tittel: "Første innlogging", tekst: `${k.admin.navn} (${k.admin.epost}) får en e-post med invitasjonslenke. Lenken åpner ${k.app_url}, der administratoren velger passord (minst 12 tegn med store og små bokstaver og tall). Tofaktor (TOTP) er slått på i databasen; innrulleringen i appen kommer med eget oppdrag.` },
    { tittel: "Etter første innlogging", tekst: `Kontroller at butikkene (${k.butikker.map((b) => b.navn).join(", ")}) og merkene (${k.merker.map((m) => m.navn).join(", ")}) stemmer, og legg inn de øvrige brukerne og rollene.` },
  ];
  const intern = [
    { tittel: "Sjekk domenet", tekst: `Kjør Actions › Domenesjekk i hengsel-crm med kunde = ${k.id} når DNS er på plass.` },
    ...(k.test ? [{ tittel: "Testkunde", tekst: "Denne kunden er merket test. Riv den ned igjen med «Fjern testkunde» når du er ferdig; PR-en med kundelista flettes ikke." }]
      : [{ tittel: "Flett kundelista", tekst: `Pull requesten i hengsel-crm${jobb.pr_url ? ` (${jobb.pr_url})` : ""} legger ${k.id} i kunder/kunder.json. Flett den etter «ja, main», så tar neste Prod-utrulling kunden med.` }]),
    { tittel: "Hvis invitasjonen ikke kom fram", tekst: "E-posten sendes av funksjonen auth-epost og trenger e-postkoblingen (K-273). Når den er på plass: send invitasjonen på nytt fra Supabase › Authentication › Users." },
  ];
  return { kunde, intern };
}

/** Sjekklisten som ren tekst (kopieres til en e-post til kunden) */
export function sjekklisteTekst(jobb) {
  const s = sjekkliste(jobb);
  const linjer = (l) => l.map((p, i) => `${i + 1}. ${p.tittel}\n   ${p.tekst}`).join("\n");
  return `Sjekkliste for ${jobb.navn}\n\n${linjer(s.kunde)}\n`;
}
