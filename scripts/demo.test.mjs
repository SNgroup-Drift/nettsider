// Vakt for POST /api/demo (K-160): validering, honeypot, tidssjekk, metode, origin, størrelse og MIME-bygging.
// Importerer worker/demo.ts direkte (Node 22.18+ fjerner typene selv). Ingen e-post sendes; bindingen er en etterligning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { handterDemo, valider, byggMime, kodeEmne, MAKS_BODY } from "../sites/hengsel/worker/demo.ts";

const NA = Date.UTC(2026, 9, 11, 12, 0, 0);
const ORIGIN = "https://hengsel.no";
const gyldig = { navn: "Kari Nordmann", butikk: "Butikknavn", epost: "kari@butikknavn.no", tlf: "", avdelinger: "2-3", melding: "Montasjeplan og kundeportal", nettsted: "", t: String(NA - 20_000) };

function be(kropp = gyldig, { metode = "POST", origin = ORIGIN, type = "json", ekstra = {} } = {}) {
  const hoder = { ...(origin ? { Origin: origin } : {}), ...ekstra };
  let body;
  if (type === "json") { hoder["Content-Type"] = "application/json"; body = typeof kropp === "string" ? kropp : JSON.stringify(kropp); }
  else if (type === "form") { hoder["Content-Type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(kropp).toString(); }
  else { hoder["Content-Type"] = type; body = typeof kropp === "string" ? kropp : "x"; }
  return new Request(`${ORIGIN}/api/demo`, { method: metode, headers: hoder, body: metode === "GET" || metode === "HEAD" ? undefined : body });
}
function binding() {
  const sendt = [];
  return { sendt, DEMO_EPOST: { send: async (m) => { sendt.push(m); } } };
}
const lag = async (fra, til, raw) => ({ fra, til, raw });
const kjor = async (req, env = binding()) => {
  const svar = await handterDemo(req, env, NA, lag);
  return { svar, data: await svar.json(), env };
};

test("gyldig forespørsel sender én e-post til hei@hengsel.no og svarer 200 {ok:true}", async () => {
  const { svar, data, env } = await kjor(be());
  assert.equal(svar.status, 200);
  assert.deepEqual(data, { ok: true });
  assert.equal(env.sendt.length, 1);
  assert.equal(env.sendt[0].fra, "demo@hengsel.no");
  assert.equal(env.sendt[0].til, "hei@hengsel.no");
});

test("skjemaformat (urlencoded) fungerer også", async () => {
  const { svar, env } = await kjor(be(gyldig, { type: "form" }));
  assert.equal(svar.status, 200);
  assert.equal(env.sendt.length, 1);
});

test("bare POST: andre metoder gir 405 med Allow", async () => {
  for (const metode of ["GET", "HEAD", "PUT", "DELETE"]) {
    const svar = await handterDemo(be(gyldig, { metode }), binding(), NA, lag);
    assert.equal(svar.status, 405, metode);
    assert.equal(svar.headers.get("Allow"), "POST");
  }
});

test("Origin må være nettstedets egen: annen eller manglende gir 403", async () => {
  for (const origin of ["https://eksempel.no", "http://hengsel.no", "https://hengsel.no.eksempel.no", "null", ""]) {
    const { svar, env } = await kjor(be(gyldig, { origin }));
    assert.equal(svar.status, 403, origin);
    assert.equal(env.sendt.length, 0);
  }
});

test("honeypot utfylt: 200 {ok:true}, men ingenting sendes", async () => {
  const { svar, data, env } = await kjor(be({ ...gyldig, nettsted: "https://spam.example" }));
  assert.equal(svar.status, 200);
  assert.deepEqual(data, { ok: true });
  assert.equal(env.sendt.length, 0);
});

test("tidssjekk: mangler, ugyldig, for ny, for gammel eller fra fremtiden avvises", async () => {
  const uten = { ...gyldig }; delete uten.t;
  const ut = [uten, { ...gyldig, t: "abc" }, { ...gyldig, t: String(NA - 1000) }, { ...gyldig, t: String(NA - 25 * 3600 * 1000) }, { ...gyldig, t: String(NA + 3600 * 1000) }];
  for (const k of ut) {
    const { svar, data, env } = await kjor(be(k));
    assert.equal(svar.status, 400, JSON.stringify(k.t));
    assert.equal(data.ok, false);
    assert.equal(env.sendt.length, 0);
  }
  assert.equal((await kjor(be({ ...gyldig, t: String(NA - 3000) }))).svar.status, 200);
  assert.equal((await kjor(be({ ...gyldig, t: String(NA - 23 * 3600 * 1000) }))).svar.status, 200);
});

test("navn og (e-post eller telefon) er påkrevd; feil kommer per felt", async () => {
  let r = await kjor(be({ ...gyldig, navn: " " }));
  assert.equal(r.svar.status, 400);
  assert.ok(r.data.feil.navn);
  r = await kjor(be({ ...gyldig, epost: "", tlf: "" }));
  assert.equal(r.svar.status, 400);
  assert.ok(r.data.feil.epost && r.data.feil.tlf);
  assert.equal((await kjor(be({ ...gyldig, epost: "", tlf: "+47 454 10 001" }))).svar.status, 200);
  assert.equal((await kjor(be({ ...gyldig, epost: "kari@butikknavn.no", tlf: "" }))).svar.status, 200);
});

test("e-post og telefon valideres", () => {
  for (const epost of ["kari", "kari@", "@x.no", "kari@x", "kari @x.no", "kari@x.no, b@c.no", "kari@x.no>", "kari@x.no\r\nBcc: a@b.no"]) {
    assert.ok(valider({ ...gyldig, epost }).feil.epost, epost);
  }
  for (const tlf of ["12345", "abc", "+47 454 10 001x", "1".repeat(21)]) {
    assert.ok(valider({ ...gyldig, epost: "", tlf }).feil.tlf, tlf);
  }
  for (const tlf of ["454 10 001", "+4745410001", "(+47) 454-10-001"]) {
    assert.equal(valider({ ...gyldig, epost: "", tlf }).felt?.tlf, tlf);
  }
});

test("lengder og fast liste for antall avdelinger", () => {
  assert.ok(valider({ ...gyldig, navn: "a".repeat(121) }).feil.navn);
  assert.ok(valider({ ...gyldig, butikk: "a".repeat(121) }).feil.butikk);
  assert.ok(valider({ ...gyldig, melding: "a".repeat(1001) }).feil.melding);
  assert.ok(valider({ ...gyldig, avdelinger: "17" }).feil.avdelinger);
  for (const a of ["1", "2-3", "4+", ""]) assert.equal(valider({ ...gyldig, avdelinger: a }).felt?.avdelinger, a);
  assert.equal(valider({ ...gyldig, navn: "a".repeat(120) }).felt?.navn.length, 120);
});

test("kontrolltegn og header-injeksjon avvises i alle felt som kommer i e-posthoder", () => {
  for (const felt of ["navn", "butikk", "epost", "tlf"]) {
    for (const verdi of ["a\r\nBcc: x@y.no", "a\nBcc: x@y.no", "a\rb", "a\u0000b", "a b", "a\u0085b"]) {
      const v = valider({ ...gyldig, ...(felt === "tlf" ? { epost: "" } : {}), [felt]: verdi });
      assert.equal(v.felt, null, `${felt} ${JSON.stringify(verdi)}`);
    }
  }
  // Teksten i kroppen kan ha linjeskift, men ikke andre kontrolltegn
  assert.equal(valider({ ...gyldig, melding: "linje 1\nlinje 2" }).felt?.melding, "linje 1\nlinje 2");
  assert.ok(valider({ ...gyldig, melding: "a\u0000b" }).feil.melding);
});

test("ugyldig type, ugyldig JSON og for stor body", async () => {
  assert.equal((await kjor(be("x", { type: "text/plain" }))).svar.status, 415);
  assert.equal((await kjor(be("{ikke json", { type: "json" }))).svar.status, 400);
  assert.equal((await kjor(be("[1,2]", { type: "json" }))).svar.status, 400);
  assert.equal((await kjor(be({ ...gyldig, navn: 5 }))).svar.status, 400);
  const stor = await kjor(be({ ...gyldig, melding: "x".repeat(MAKS_BODY) }));
  assert.equal(stor.svar.status, 413);
  assert.equal(stor.env.sendt.length, 0);
  const lengde = await kjor(be(gyldig, { ekstra: { "Content-Length": String(MAKS_BODY + 1) } }));
  assert.equal(lengde.svar.status, 413);
});

test("mangler bindingen: 200 {ok:true, levert:false, reserve:'mailto'} (ingen feil); send() som kaster: 503 {ok:false, reserve:'mailto'}", async () => {
  let r = await kjor(be(), {});
  assert.equal(r.svar.status, 200);
  assert.deepEqual(r.data, { ok: true, levert: false, reserve: "mailto" });
  // Ugyldig forespørsel uten binding får fortsatt valideringsfeil
  r = await kjor(be({ ...gyldig, navn: "" }), {});
  assert.equal(r.svar.status, 400);
  const feilende = { DEMO_EPOST: { send: async () => { throw Object.assign(new Error("kari@butikknavn.no"), { code: "E_SENDER_NOT_VERIFIED" }); } } };
  const logg = [];
  const orig = console.error;
  console.error = (...a) => logg.push(a.join(" "));
  try { r = await kjor(be(), feilende); } finally { console.error = orig; }
  assert.equal(r.svar.status, 503);
  assert.deepEqual(r.data, { ok: false, reserve: "mailto" });
  assert.ok(logg.length === 1 && !/kari|Nordmann|butikk/i.test(logg[0]), "ingen persondata i loggen");
});

test("svarene er JSON uten mellomlagring", async () => {
  const { svar } = await kjor(be());
  assert.match(svar.headers.get("Content-Type"), /^application\/json/);
  assert.match(svar.headers.get("Cache-Control"), /no-store/);
});

// ---- MIME ----

const felt = { navn: "Kari Nørdmann", butikk: "Bøker & Bad – Øst", epost: "kari@butikknavn.no", tlf: "+4745410001", avdelinger: "4+", melding: "Montasjeplan\nog kundeportal æøå" };
const del = (raw) => { const i = raw.indexOf("\r\n\r\n"); return [raw.slice(0, i), raw.slice(i + 4)]; };

test("MIME: hoder, RFC 2047-emne, base64-kropp i UTF-8, Reply-To, Message-ID og Date", () => {
  const raw = byggMime(felt, new Date(NA), "1234-abcd");
  const [hoder, kropp] = del(raw);
  assert.match(hoder, /^From: Hengsel nettside <demo@hengsel\.no>\r\nTo: hei@hengsel\.no\r\nReply-To: kari@butikknavn\.no\r\n/);
  assert.match(hoder, /\r\nMessage-ID: <1234-abcd@hengsel\.no>\r\n/);
  assert.match(hoder, /\r\nDate: Sun, 11 Oct 2026 12:00:00 \+0000\r\n/);
  assert.match(hoder, /\r\nMIME-Version: 1\.0\r\nContent-Type: text\/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64$/);
  assert.ok(!/[^\x20-\x7e\r\n]/.test(raw), "hele meldingen er ASCII");
  // Emnet: dekod alle encoded-words
  const emnetRader = hoder.match(/Subject: ((?:.|\r\n )+?)\r\n[A-Z]/)[1].split("\r\n ");
  assert.ok(emnetRader.every((r) => r.length <= 75 && /^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/.test(r)));
  const emne = emnetRader.map((r) => Buffer.from(r.slice(10, -2), "base64").toString("utf8")).join("");
  assert.equal(emne, "Demo av Hengsel – Bøker & Bad – Øst");
  // Kroppen
  assert.ok(kropp.split("\r\n").every((l) => l.length <= 76));
  const tekst = Buffer.from(kropp.replace(/\r\n/g, ""), "base64").toString("utf8");
  for (const del of ["Navn: Kari Nørdmann", "Butikk: Bøker & Bad – Øst", "E-post: kari@butikknavn.no", "Telefon: +4745410001", "Antall avdelinger: 4 eller flere", "Montasjeplan", "og kundeportal æøå"]) {
    assert.ok(tekst.includes(del), del);
  }
});

test("MIME: uten e-post ingen Reply-To; uten butikk brukes navnet i emnet; langt emne deles uten å bryte tegn", () => {
  const raw = byggMime({ ...felt, epost: "", butikk: "" }, new Date(NA), "x");
  assert.ok(!/Reply-To/.test(raw));
  assert.equal(kodeEmne("Demo av Hengsel – Kari"), "=?UTF-8?B?" + Buffer.from("Demo av Hengsel – Kari").toString("base64") + "?=");
  const langt = "Demo av Hengsel – " + "Ø".repeat(120);
  const ord = kodeEmne(langt).split("\r\n ");
  assert.ok(ord.length > 1 && ord.every((o) => o.length <= 75));
  assert.equal(ord.map((o) => Buffer.from(o.slice(10, -2), "base64").toString("utf8")).join(""), langt);
  assert.equal(kodeEmne("Enkel ASCII"), "Enkel ASCII");
});

// ---- Konfigurasjon ----

test("wrangler.jsonc har /api/demo i run_worker_first og ingen aktiv send_email-binding (e-post er ikke slått på, K-160)", () => {
  const rot = join(import.meta.dirname, "..", "sites", "hengsel");
  const w = JSON.parse(readFileSync(join(rot, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  assert.equal(w.send_email, undefined);
  assert.ok(w.assets.run_worker_first.includes("/api/demo"));
});
