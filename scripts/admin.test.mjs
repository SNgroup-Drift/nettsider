// K-184: vakter for admin.hengsel.no (sites/admin). Kjøres av npm test. Ingen hemmeligheter leses eller skrives her.
//  1. Datafilene har ingenting som ligner en nøkkel, et token eller et passord, og følger skjemaet (kunde-id = tenant-nøkkel osv.).
//  2. Workeren avviser alt uten gyldig Cloudflare Access-token (signatur, utsteder, målgruppe, utløp, e-post, rolle).
//  3. Oppsettet (wrangler.jsonc, _headers) holder siden bak Workeren, uten indeksering og uten tredjepart.
//  4. Fristfargene: rød under 7 dager, gul under 30, grønn ellers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const rot = join(import.meta.dirname, "..", "sites", "admin");
const les = (sti) => readFileSync(join(rot, sti), "utf8");
const utenKommentarer = (jsonc) => jsonc.replace(/^\s*\/\/.*$/gm, "");
function filer(dir) {
  return readdirSync(dir).flatMap((n) => {
    const s = join(dir, n);
    return statSync(s).isDirectory() ? filer(s) : [s];
  });
}
const dataFiler = filer(join(rot, "src", "data"));

// ── 1. Hemmeligheter og skjema ───────────────────────────────────────────────────────────────────────────────────────
/** Mønstre for nøkler, tokens og passord. Hvert treff er en feil. */
export const MONSTRE = [
  ["sk-… (API-nøkkel)", /\bsk-[A-Za-z0-9_-]{8,}/],
  ["GitHub-token", /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ["JWT eller Supabase-nøkkel (eyJ…)", /eyJ[A-Za-z0-9_-]{10,}/],
  ["privatnøkkel", /BEGIN [A-Z ]*PRIVATE KEY/],
  ["AWS-nøkkel", /\bAKIA[0-9A-Z]{16}\b/],
  ["Slack-token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ["Supabase-token (sbp_/sb_secret_)", /\b(?:sbp_[a-f0-9]{20,}|sb_secret_[A-Za-z0-9_-]{10,})/],
  ["lang hex-streng (40+ tegn)", /\b[a-f0-9]{40,}\b/i],
];
/** Lange blandede strenger (store og små bokstaver og tall, 40+ tegn) som ligner base64. Vanlige adresser og stier treffer ikke. */
function langBase64(tekst) {
  return (tekst.match(/[A-Za-z0-9+=]{40,}/g) ?? []).filter((t) => /[A-Z]/.test(t) && /[a-z]/.test(t) && /\d/.test(t));
}
export function finnHemmeligheter(tekst) {
  const treff = MONSTRE.filter(([, re]) => re.test(tekst)).map(([navn]) => navn);
  if (langBase64(tekst).length) treff.push("lang base64-lignende streng");
  return treff;
}
// «onepassword» er det ene tillatte feltet med «pass» i navnet: lenken til elementet i 1Password (verdien sjekkes under)
const FORBUDTE_NOKLER = /pass(?:word|ord)|secret|hemmelig|token|api[-_]?key|private|credential|nokkel(?!$)|recovery|gjenoppretting|kode$/i;
function nokler(verdi, ut = []) {
  if (Array.isArray(verdi)) verdi.forEach((v) => nokler(v, ut));
  else if (verdi && typeof verdi === "object") for (const [k, v] of Object.entries(verdi)) { ut.push(k); nokler(v, ut); }
  return ut;
}

test("skanneren finner nøkler og passord (selvtest)", () => {
  const prov = {
    "sk-": ["sk", "ant-api03-abcdEFGH1234"].join("-"),
    "ghp_": "gh" + "p_" + "a1".repeat(18),
    "eyJ": "ey" + "J" + "hbGciOiJIUzI1NiIsInR5cCI6",
    "BEGIN PRIVATE KEY": "-----BEGIN " + "PRIVATE KEY-----",
    "base64": "dGhpcy1pcy1ub3QtYS1yZWFsLWtleS1qdXN0LWEtdGVzdA" + "Zm9vQmFyMTIz",
    "hex": "0123456789abcdef".repeat(3),
  };
  for (const [navn, tekst] of Object.entries(prov)) assert.ok(finnHemmeligheter(`x ${tekst} y`).length > 0, `skanneren fanger ikke ${navn}`);
  // Vanlige adresser, prosjekt-id-er og navn skal ikke gi falsk alarm
  for (const ok of [
    "https://github.com/SNgroup-Drift/innlandet-crm-sync/actions",
    "https://supabase.com/dashboard/project/jzqglcldsqkxvwsaovth",
    "https://claude.ai/artifact/VbjHUSP9HP63CsL142RG4u",
    "MS_EPOST_CLIENT_SECRET",
  ]) assert.deepEqual(finnHemmeligheter(ok), [], ok);
});

test("datafilene inneholder ingen nøkler, tokens, passord eller koder", () => {
  assert.ok(dataFiler.length >= 10, "fant ikke datafilene");
  const feil = [];
  for (const f of dataFiler) {
    const tekst = readFileSync(f, "utf8");
    for (const t of finnHemmeligheter(tekst)) feil.push(`${relative(rot, f)}: ${t}`);
    if (f.endsWith(".json")) {
      for (const k of nokler(JSON.parse(tekst))) if (k !== "onepassword" && FORBUDTE_NOKLER.test(k)) feil.push(`${relative(rot, f)}: feltnavnet «${k}» er ikke tillatt (bare navn og lenker)`);
    }
  }
  assert.deepEqual(feil, []);
});

test("kontoer har bare tillatte felt, og innlogging er en e-postadresse eller tom", () => {
  const TILLATT = ["tjeneste", "innlogging", "eier", "tofa", "hvelv", "element", "onepassword", "merknad"];
  for (const f of dataFiler.filter((f) => f.endsWith("kontoer.json"))) {
    for (const k of JSON.parse(readFileSync(f, "utf8")).kontoer) {
      assert.deepEqual(Object.keys(k).sort(), [...TILLATT].sort(), `${relative(rot, f)}: ${k.tjeneste}`);
      assert.ok(k.innlogging === null || /^[^\s@]+@[^\s@]+\.[a-z]+$/i.test(k.innlogging), `${k.tjeneste}: innlogging må være e-post eller null`);
      assert.ok(k.onepassword === null || /^https:\/\/[\w.-]*1password\.(?:com|eu)\//.test(k.onepassword), `${k.tjeneste}: onepassword må være en 1Password-lenke eller null`);
    }
  }
});

test("lenker er https uten innlogging eller nøkler i adressen, og frister har ÅÅÅÅ-MM-DD eller tom dato", () => {
  for (const f of dataFiler.filter((f) => f.endsWith("lenker.json"))) {
    for (const g of JSON.parse(readFileSync(f, "utf8")).grupper)
      for (const l of g.lenker) {
        if (l.url === null) continue;
        const u = new URL(l.url);
        assert.equal(u.protocol, "https:", `${l.navn}`);
        assert.equal(u.username + u.password, "", `${l.navn}: innlogging i adressen`);
        assert.ok(![...u.searchParams.keys()].some((k) => /key|token|secret|pass|auth|sig/i.test(k)), `${l.navn}: nøkkel i adressen`);
      }
  }
  for (const f of dataFiler.filter((f) => f.endsWith("frister.json"))) {
    const ider = new Set();
    for (const fr of JSON.parse(readFileSync(f, "utf8")).frister) {
      assert.ok(fr.dato === null || /^\d{4}-\d{2}-\d{2}$/.test(fr.dato), `${fr.id}: dato`);
      assert.ok(["hemmelighet", "sertifikat", "domene", "ssl", "abonnement"].includes(fr.type), `${fr.id}: type`);
      assert.ok(!ider.has(fr.id), `${fr.id}: dobbel id`);
      ider.add(fr.id);
    }
  }
});

test("hver kunde er en mappe med fire filer, og kunde-id = mappenavn = tenant-nøkkel", () => {
  const kundeDir = join(rot, "src", "data", "kunder");
  const ider = readdirSync(kundeDir);
  assert.ok(ider.includes("sigdal-innlandet") && ider.includes("eksempel-kjokken"));
  for (const id of ider) {
    assert.deepEqual(readdirSync(join(kundeDir, id)).sort(), ["frister.json", "kontoer.json", "kunde.json", "lenker.json"], id);
    const k = JSON.parse(readFileSync(join(kundeDir, id, "kunde.json"), "utf8"));
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(k.id, id);
    assert.equal(k.tenant.nokkel, id);
    assert.equal(typeof k.eksempel, "boolean");
    for (const felt of ["navn", "selskaper", "kontaktperson", "domener", "moduler", "integrasjoner", "lisens", "status"]) assert.ok(k[felt] !== undefined, `${id}: mangler ${felt}`);
  }
  const eks = JSON.parse(readFileSync(join(kundeDir, "eksempel-kjokken", "kunde.json"), "utf8"));
  assert.equal(eks.eksempel, true);
  assert.match(eks.navn, /^Eksempel/);
  assert.equal(JSON.parse(readFileSync(join(kundeDir, "sigdal-innlandet", "kunde.json"), "utf8")).eksempel, false);
});

// ── 2. Workeren og Cloudflare Access ───────────────────────────────────────────────────────────────────────────────
const { sjekkAccess, nullstillBuffer } = await import("../sites/admin/worker/access.js");
const { default: worker } = await import("../sites/admin/worker/index.js");
const { rolleFor, kanSe } = await import("../sites/admin/worker/tilgang.js");

const TEAM = "test.cloudflareaccess.com";
const AUD = "a".repeat(64);
const b64 = (data) => Buffer.from(data).toString("base64url");
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const annetPar = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", par.publicKey)), kid: "k1", alg: "RS256", use: "sig" };

async function lagToken({ krav = {}, hode = {}, nokkel = par.privateKey } = {}) {
  const na = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT", ...hode }));
  const p = b64(JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email: "es@sngroup.no", iat: na, nbf: na - 5, exp: na + 3600, ...krav }));
  const sig = Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", nokkel, new TextEncoder().encode(`${h}.${p}`)));
  return `${h}.${p}.${b64(sig)}`;
}
const originalFetch = globalThis.fetch;
function medNokler(fn) {
  return async () => {
    nullstillBuffer();
    globalThis.fetch = async (url) => {
      assert.equal(String(url), `https://${TEAM}/cdn-cgi/access/certs`);
      return new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } });
    };
    try { await fn(); } finally { globalThis.fetch = originalFetch; }
  };
}
const env = (ekstra = {}) => ({ ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ASSETS: { fetch: async () => new Response("<h1>admin</h1>", { headers: { "Content-Type": "text/html" } }) }, ...ekstra });
const be = (sti, token, metode = "GET") => new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: token ? { "Cf-Access-Jwt-Assertion": token } : {} });

test("Workeren er låst (503) uten Access-oppsett, og viser ingenting", async () => {
  for (const e of [{ ACCESS_TEAM_DOMAIN: "" }, { ACCESS_AUD: "" }, { ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined }]) {
    const r = await worker.fetch(be("/", await lagToken()), env(e));
    assert.equal(r.status, 503);
    assert.doesNotMatch(await r.text(), /admin<\/h1>/);
  }
});

test("uten Cf-Access-Jwt-Assertion: 401, og alle svar er noindex og no-store", medNokler(async () => {
  const r = await worker.fetch(be("/"), env({ ASSETS: { fetch: async (req) => new Response(new URL(req.url).pathname === "/logg-inn" ? "<h1>Logg inn</h1>" : "<h1>admin</h1>", { headers: { "Content-Type": "text/html" } }) } }));
  assert.equal(r.status, 401);
  assert.match(r.headers.get("X-Robots-Tag"), /noindex/);
  assert.match(r.headers.get("Cache-Control"), /no-store/);
  assert.doesNotMatch(await r.text(), /admin<\/h1>/);
}));

test("N-4 (26-001): uten innlogging får sider bare innloggingskortet /logg-inn (401), aldri siden som ble bedt om", medNokler(async () => {
  const hentet = [];
  const assets = { fetch: async (req) => { const sti = new URL(req.url).pathname; hentet.push(sti); return new Response(sti === "/logg-inn" ? "<h1>Hengsel Admin</h1><a>Logg inn med Access</a>" : "<h1>admin</h1>", { headers: { "Content-Type": "text/html" } }); } };
  for (const sti of ["/", "/salg/eiere", "/avtaler/A-2026-001"]) {
    const r = await worker.fetch(be(sti), env({ ASSETS: assets }));
    assert.equal(r.status, 401, sti);
    const tekst = await r.text();
    assert.match(tekst, /Logg inn med Access/);
    assert.doesNotMatch(tekst, /admin<\/h1>/);
    assert.match(r.headers.get("Cache-Control"), /no-store/);
  }
  assert.deepEqual([...new Set(hentet)], ["/logg-inn"]);
  const api = await worker.fetch(be("/api/eiere"), env({ ASSETS: assets }));
  assert.equal(api.status, 401);
  assert.equal((await api.json()).kode, "ADM-401");
  assert.equal((await worker.fetch(be("/", null, "POST"), env({ ASSETS: assets }))).status, 401);
  // Med gyldig token serveres innloggingssiden ikke i stedet for den ekte siden
  assert.equal(await (await worker.fetch(be("/", await lagToken()), env())).text(), "<h1>admin</h1>");
}));

test("gyldig token for es@sngroup.no: siden serveres", medNokler(async () => {
  const r = await worker.fetch(be("/", await lagToken()), env());
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "<h1>admin</h1>");
  assert.match(r.headers.get("X-Robots-Tag"), /noindex/);
  assert.match(r.headers.get("Cache-Control"), /private, no-store/);
  assert.equal((await worker.fetch(be("/drift/kunder/sigdal-innlandet", await lagToken()), env())).status, 200);
}));

test("ugyldige tokens avvises (401): feil signatur, endret innhold, feil app, feil utsteder, utløpt, alg none, uten e-post", medNokler(async () => {
  const gyldig = await lagToken();
  const [h, p, s] = gyldig.split(".");
  const endret = `${h}.${b64(JSON.stringify({ ...JSON.parse(Buffer.from(p, "base64url")), email: "annen@eksempel.no" }))}.${s}`;
  const tilfeller = {
    "signert med en annen nøkkel": await lagToken({ nokkel: annetPar.privateKey }),
    "endret innhold": endret,
    "feil Access-app (aud)": await lagToken({ krav: { aud: ["b".repeat(64)] } }),
    "feil utsteder": await lagToken({ krav: { iss: "https://annet.cloudflareaccess.com" } }),
    "utløpt": await lagToken({ krav: { exp: Math.floor(Date.now() / 1000) - 10 } }),
    "ikke gyldig ennå": await lagToken({ krav: { nbf: Math.floor(Date.now() / 1000) + 3600 } }),
    "alg none": `${b64(JSON.stringify({ alg: "none", kid: "k1" }))}.${p}.`,
    "ukjent nøkkel-id": await lagToken({ hode: { kid: "ukjent" } }),
    "uten e-post": await lagToken({ krav: { email: undefined } }),
    "rot": "abc.def.ghi",
    "ingen punktum": "abc",
  };
  for (const [navn, token] of Object.entries(tilfeller)) {
    const r = await worker.fetch(be("/", token), env());
    assert.equal(r.status, 401, navn);
  }
  assert.deepEqual((await sjekkAccess(gyldig, { team: TEAM, aud: AUD })).ok, true);
}));

test("gyldig token for en adresse som ikke står i worker/tilgang.js: 403", medNokler(async () => {
  const r = await worker.fetch(be("/", await lagToken({ krav: { email: "noen@annet.no" } })), env());
  assert.equal(r.status, 403);
}));

test("andre metoder enn GET og HEAD utenfor /api: 405", medNokler(async () => {
  assert.equal((await worker.fetch(be("/", await lagToken(), "POST"), env())).status, 405);
}));

test("e-postadressen sjekkes uten hensyn til store og små bokstaver", medNokler(async () => {
  assert.equal((await worker.fetch(be("/", await lagToken({ krav: { email: "ES@sngroup.no" } })), env())).status, 200);
}));

test("rolle: Eirik ser alt; en senere kunde-admin ser bare sin egen kundemappe", async () => {
  assert.deepEqual(rolleFor("es@sngroup.no"), { alle: true, rolle: "eier", navn: "Eirik" });
  assert.equal(rolleFor("ukjent@eksempel.no"), null);
  assert.equal(kanSe(null, "/"), false);
  assert.equal(kanSe({ alle: true }, "/kunder/hvilken-som-helst"), true);
  const kundeAdmin = { kunder: ["eksempel-kjokken"] };
  assert.equal(kanSe(kundeAdmin, "/drift/kunder/eksempel-kjokken"), true);
  assert.equal(kanSe(kundeAdmin, "/drift/kunder/eksempel-kjokken.html"), true);
  assert.equal(kanSe(kundeAdmin, "/drift/kunder/sigdal-innlandet"), false);
  assert.equal(kanSe(kundeAdmin, "/"), false);
  assert.equal(kanSe(kundeAdmin, "/drift"), false);
  assert.equal(kanSe(kundeAdmin, "/drift/kunder"), false);
  assert.equal(kanSe(kundeAdmin, "/kunder"), false);
  assert.equal(kanSe(kundeAdmin, "/salg/tavle"), false);
  assert.equal(kanSe(kundeAdmin, "/api/oversikt"), false);
  assert.equal(kanSe(kundeAdmin, "/drift/kunder/eksempel-kjokken/../sigdal-innlandet"), false);
  assert.equal(kanSe(kundeAdmin, "/_astro/Side.js"), true);
  // K-240: bare rollen eier skriver
  const { kanSkrive } = await import("../sites/admin/worker/tilgang.js");
  assert.equal(kanSkrive(rolleFor("es@sngroup.no")), true);
  assert.equal(kanSkrive(kundeAdmin), false);
  assert.equal(kanSkrive({ alle: true }), false);
  assert.equal(kanSkrive(null), false);
});

// ── 3. Oppsett ───────────────────────────────────────────────────────────────────────────────────────────────────────
test("wrangler.jsonc: alle forespørsler går gjennom Workeren, variablene overskrives ikke, og ingen hemmeligheter står der", () => {
  const w = JSON.parse(utenKommentarer(les("wrangler.jsonc")));
  assert.equal(w.name, "admin");
  assert.equal(w.main, "./worker/index.js");
  assert.equal(w.assets.run_worker_first, true);
  assert.equal(w.assets.not_found_handling, "404-page");
  assert.equal(w.keep_vars, true);
  assert.equal(w.vars, undefined, "ACCESS_* settes i dashbordet, ikke i repoet");
  // K-240: D1 med binding DB, migreringer i ./migrations, plassholder-id til Oversikt har laget databasen
  assert.equal(w.d1_databases?.[0]?.binding, "DB");
  assert.equal(w.d1_databases[0].database_name, "hengsel-admin");
  assert.equal(w.d1_databases[0].migrations_dir, "migrations");
  assert.match(w.d1_databases[0].database_id, /^[0-9a-f-]{36}$/);
  assert.equal(w.secrets, undefined); assert.equal(w.PENNEO_API_KEY, undefined);
  assert.deepEqual(finnHemmeligheter(les("wrangler.jsonc")), []);
});

test("wrangler.jsonc (N-4): tom previews-blokk, så `wrangler preview` i Workers Builds går, uten produksjons-D1 eller variabler i forhåndsvisningen", () => {
  for (const sted of ["admin", "design"]) {
    const w = JSON.parse(utenKommentarer(readFileSync(join(rot, "..", sted, "wrangler.jsonc"), "utf8")));
    assert.deepEqual(w.previews, {}, `${sted}: previews må finnes og være tom`);
  }
  const hosting = readFileSync(join(rot, "..", "..", "docs", "hosting.md"), "utf8");
  for (const sted of ["admin", "design"]) {
    assert.ok(hosting.includes(`npx wrangler deploy -c sites/${sted}/wrangler.jsonc`), `hosting.md: Deploy command for ${sted}`);
    assert.ok(hosting.includes(`npx wrangler preview -c sites/${sted}/wrangler.jsonc`), `hosting.md: Preview command for ${sted}`);
  }
});

test("_headers: noindex, streng CSP uten inline-skript og uten tredjepart", () => {
  const h = les("public/_headers");
  assert.match(h, /X-Robots-Tag: noindex, nofollow/);
  const csp = /Content-Security-Policy: (.*)/.exec(h)[1];
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /script-src 'self'(?:;|$)/);
  assert.match(csp, /connect-src 'self'(?:;|$)/, "K-240: bare eget API");
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:|\*/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(les("public/robots.txt"), /Disallow: \//);
});

test("ingen tredjepartsskript, -stiler eller -skrifter i koden; nettverkskall bare fra src/lib/dom.ts mot eget /api (K-240)", () => {
  for (const f of filer(join(rot, "src")).filter((f) => /\.(astro|ts|js|css)$/.test(f))) {
    const t = readFileSync(f, "utf8");
    assert.doesNotMatch(t, /<script[^>]+src=["']https?:/i, relative(rot, f));
    assert.doesNotMatch(t, /<link[^>]+href=["']https?:/i, relative(rot, f));
    assert.doesNotMatch(t, /@import\s+url\(["']?https?:/i, relative(rot, f));
    assert.doesNotMatch(t, /XMLHttpRequest|sendBeacon|WebSocket/, `${relative(rot, f)}: bare fetch mot eget API`);
    if (!f.endsWith(join("src", "lib", "dom.ts"))) assert.doesNotMatch(t, /\bfetch\(/, `${relative(rot, f)}: nettverkskall skal gå gjennom api() i src/lib/dom.ts`);
    assert.doesNotMatch(t, /https?:\/\/(?!hengsel\.no|admin\.hengsel\.no|\$\{)[\w.-]+/i, `${relative(rot, f)}: ingen eksterne adresser i koden`);
  }
  const dom = les("src/lib/dom.ts");
  assert.match(dom, /fetch\(sti, \{ method: metode, headers: hoder, body, credentials: "same-origin" \}\)/, "api() kaller fetch med samme opprinnelse");
  // Alle stiene som kalles starter med /api eller /salg/tilbud (samme Worker)
  for (const f of filer(join(rot, "src", "scripts")).filter((f) => f.endsWith(".ts"))) {
    for (const m of readFileSync(f, "utf8").matchAll(/api(?:<[^>]*>)?\("(?:GET|POST|PATCH|PUT|DELETE)", [`"]([^`"]+)/g)) assert.ok(m[1].startsWith("/api/"), `${relative(rot, f)}: ${m[1]}`);
  }
});

// ── 4. Fristfarger ───────────────────────────────────────────────────────────────────────────────────────────────────
const { dagerIgjen, niva, tekstFor } = await import("../sites/admin/src/lib/frist.ts").catch(() => ({}));
test("fristfarger: rød under 7 dager, gul under 30, grønn ellers, ukjent uten dato", { skip: !niva && "TypeScript-import ikke tilgjengelig" }, () => {
  const na = new Date("2026-10-12T10:00:00Z");
  assert.equal(niva(dagerIgjen("2026-10-12", na)), "rod"); // i dag
  assert.equal(niva(dagerIgjen("2026-10-01", na)), "rod"); // utløpt
  assert.equal(niva(dagerIgjen("2026-10-18", na)), "rod"); // 6 dager
  assert.equal(niva(dagerIgjen("2026-10-19", na)), "gul"); // 7 dager
  assert.equal(niva(dagerIgjen("2026-11-10", na)), "gul"); // 29 dager
  assert.equal(niva(dagerIgjen("2026-11-11", na)), "gronn"); // 30 dager
  assert.equal(niva(dagerIgjen(null, na)), "ukjent");
  assert.equal(tekstFor(null), "fyll inn");
});

test("N-4: menyen følger sidekartet 26-001–26-013, og Kommer-sidene (26-011, 26-012) finnes, men står ikke i menyen", async () => {
  const { MENY } = await import("../sites/admin/src/lib/meny.ts");
  assert.deepEqual(MENY[0].punkter.map((p) => p.navn), ["Salg", "Eiere og butikker", "Prisberegner", "Avtaler"]);
  assert.equal(MENY[1].navn, "Innstillinger");
  assert.deepEqual(MENY[1].punkter.map((p) => p.navn), ["Prisliste", "Leverandør", "Excel-import", "Tilbakemeldinger"]);
  const stier = MENY.flatMap((g) => g.punkter.map((p) => p.sti));
  for (const s of ["/stotte", "/fakturering"]) assert.ok(!stier.includes(s), `${s} står ikke i menyen`);
  for (const f of ["stotte.astro", "fakturering/index.astro", "logg-inn.astro", "salg/import.astro", "innstillinger/tilbakemeldinger.astro"]) assert.ok(statSync(join(rot, "src", "pages", f)).isFile(), f);
  // Kitet er kopiert inn (ikke importert på tvers av nettsteder)
  for (const f of readdirSync(join(rot, "src"), { recursive: true }).filter((f) => /\.(astro|ts)$/.test(f))) assert.doesNotMatch(les(join("src", f)), /(?:from|import)\s*\(?\s*["'][^"']*(?:sites\/hengsel|\.\.\/\.\.\/\.\.\/hengsel)/, f);
});

test("N-4b: prislisten har ikke fasitteksten «Support etter første år (forslag)»; vilkårene i tilbud-PDF-en gjelder (Eirik 17.10)", () => {
  const kode = les("src/scripts/prisliste.ts").replace(/^\s*(\/\*\*|\*).*$/gm, "");
  assert.doesNotMatch(kode, /Support etter første år/);
  assert.doesNotMatch(kode, /halveres fra år 2/);
});
