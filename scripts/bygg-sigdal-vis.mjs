#!/usr/bin/env node
/**
 * K-223: Visningsrommet i Sigdal-utgave, bygget inn i hengsel.no/kunde/sigdal/vis/.
 *
 *   node scripts/bygg-sigdal-vis.mjs <mappe med bygd hengsel.no, vanligvis sites/hengsel/dist>
 *
 * Hvorfor her og ikke en egen kopi av rommene: rommene (sites/vis/src) bygges av sites/vis/bygg.mjs som før, til en midlertidig mappe, og så
 * gjøres de om til Sigdal-utgaven av dette skriptet: Sigdal-temaet (/kunde/sigdal/tema.css, samme fil som resten av /kunde/sigdal) legges over de delte
 * Hengsel-variablene, Hengsel-logoen byttes mot «Sigdal CRM · levert av Hengsel», stiene får /kunde/sigdal/vis som rot, skjermbildene hentes fra
 * plassholdermappa (/kunde/sigdal/img/vis/…) og tekstene følger profil.json. Ingen rom er kopiert for hånd, så en endring i et rom
 * kommer med i begge utgavene ved neste bygg. Hengsel-skriften, Hengsel-logoene og de grønne skjermbildene følger ikke med.
 * Sikkerhet: ligger under /kunde/sigdal/*, altså bak Cloudflare Access og Worker-sjekken (sites/hengsel/worker/kunde.ts).
 * Kjøres etter csp-hasher.mjs (rommene har inline stil og får egen CSP i Worker-en).
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { tilKunde } from "../packages/kundetema-sigdal/tilkunde.mjs";

const rot = resolve(import.meta.dirname, "..");
const dist = resolve(process.argv[2] ?? join(rot, "sites/hengsel/dist"));
const profil = JSON.parse(readFileSync(join(rot, "packages/kundetema-sigdal/profil.json"), "utf8"));
const tokens = readFileSync(join(rot, "packages/kundetema-sigdal/tokens.css"), "utf8");
const offWhite = /--sigdal-off-white:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
if (!offWhite) throw new Error("fant ikke --sigdal-off-white i kundetema-sigdal/tokens.css");
const kunderot = join(dist, ...profil.sti.split("/").filter(Boolean)); // dist/kunde/sigdal
if (!existsSync(join(kunderot, "tema.css"))) throw new Error(`${kunderot}/tema.css finnes ikke: bygg hengsel.no først (npm run build -w sites/hengsel)`);

const BASE = `${profil.sti}/vis`; // /kunde/sigdal/vis
const IMG = `${profil.sti}/img/vis`; // plassholderne
const mål = join(kunderot, "vis");

// 1. Vanlig vis-bygg til en midlertidig mappe
const tmp = mkdtempSync(join(tmpdir(), "vis-sigdal-"));
const bygg = spawnSync(process.execPath, [join(rot, "sites/vis/bygg.mjs")], { env: { ...process.env, VIS_DIST: tmp }, stdio: ["ignore", "ignore", "inherit"] });
if (bygg.status !== 0) throw new Error("bygget av sites/vis feilet");

// 2. Hva som ikke følger med: Hengsel-skriften, -logoene og -skjermbildene, favicon (hengsel.no har egne i roten), delingsbildet og _headers
const IKKE = [/^_headers$/, /^og\.png$/, /^robots\.txt$/, /^favicon-/, /^404\.html$/, /^img\//, /^skjermbilder\//, /^assets\/ds\//, /^assets\/hengsel-fonts\.css$/, /^assets\/logo\//, /^assets\/ill\//];
const toppNavn = readdirSync(tmp).filter((n) => !IKKE.some((re) => re.test(n + (statSync(join(tmp, n)).isDirectory() ? "/" : ""))));
// Rotstier som skal få /kunde/sigdal/vis foran (kataloger og filer i roten av vis, bortsett fra bilder, som har egen mappe)
const rotnavn = toppNavn.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
// (?!kunde/sigdal): Visningsrommet har et rom på /kunde/, og Sigdal-utgaven ligger selv under /kunde/sigdal (K-229). Adresser som alt har riktig rot, skal ikke få den én gang til.
const STI = new RegExp(`(["'(]|,\\s)/(?!kunde/sigdal)(${rotnavn.join("|")})(?![\\w-])`, "g");

function stier(t) {
  return t
    .replace(/(["'(]|,\s)\/img\/dok-forside\.webp/g, `$1${profil.sti}/img/dok-forside.webp`)
    .replace(/(["'(]|,\s)\/img\//g, `$1${IMG}/`)
    .replace(/(["'(]|,\s)\/skjermbilder\//g, `$1${IMG}/skjermbilder/`)
    .replace(/href="\/(?=["#])/g, `href="${BASE}/`)
    .replace(STI, `$1${BASE}/$2`);
}
function eksakt(t, fra, til, fil) {
  if (!t.includes(fra)) throw new Error(`${fil}: fant ikke «${fra}». Visningsrommet er endret; oppdater scripts/bygg-sigdal-vis.mjs`);
  return t.split(fra).join(til);
}

const VIS_TEKST = [
  ["Skrift: Schibsted Grotesk", "Skrift: Newsreader og Inter"],
  ['<span class="eyebrow">SN Group</span>', `<span class="eyebrow">${profil.produkt} · levert av Hengsel</span>`],
];
// «Sigdal CRM · levert av Hengsel» som ett PNG-merke i Warm Black (merkepakke v2, K-231) når filen finnes i public/kunde/sigdal/logo, ellers navnet som tekstmerke med «levert av Hengsel» under
// PNG (1x, 2x og 3x), ikke SVG: SVG-ene i merkepakke v2 mangler selve Sigdal-logoen
const merkeGrunn = `${profil.sti}/logo/${profil.kunde}-crm-levert-av-hengsel-warm-black`;
const harMerke = existsSync(join(rot, "sites/hengsel/public", ...profil.sti.split("/").filter(Boolean), "logo", `${profil.kunde}-crm-levert-av-hengsel-warm-black.png`));
const LOGO_INNHOLD = harMerke
  ? `<img class="kundelogo-merke" src="${merkeGrunn}-2x.png" srcset="${merkeGrunn}.png 1x, ${merkeGrunn}-2x.png 2x, ${merkeGrunn}-3x.png 3x" alt="${profil.produkt} · levert av Hengsel" width="416" height="48">`
  : `<span class="kundelogo-navn">${profil.navn}</span><span class="kundelogo-levert">levert av Hengsel</span>`;
const LOGO_NAVN = `<span class="kundelogo kundelogo-vis">${LOGO_INNHOLD}</span>`;

function html(t, fil) {
  let u = t;
  u = u.replace(/<meta (?:property="og:image(?::width|:height)?"|name="twitter:card")[^>]*>\n?/g, "");
  u = u.replace(/\s*<p class="demo-lenke">[\s\S]*?<\/p>/g, ""); // «Prøv i demoen» (K-229) er Hengsels demo; Sigdal-utgaven lenker ikke ut av /kunde/sigdal
  u = u.replace(/<link rel="preload" href="\/assets\/ds\/[^>]*>\n?/g, "");
  u = u.replace(/<link rel="stylesheet" href="\/assets\/hengsel-fonts\.css">\n?/g, "");
  u = u.replace(/(<link rel="stylesheet" href="\/assets\/hengsel-tokens\.css">)/, `$1\n<link rel="stylesheet" href="${profil.sti}/tema.css">`);
  u = u.replace(/<html lang="([a-z]+)">/, `<html lang="$1" ${profil.attributt}="${profil.kunde}">`);
  u = u.replace(/(<meta name="theme-color" content=")#[0-9A-Fa-f]{6}(">)/, `$1${offWhite}$2`);
  // Merket i toppfeltet: Sigdal med «levert av Hengsel»; Hengsel CRM → «Sigdal CRM»; «levert av» i bunnen → tekst
  u = u.replace(/(<span class="hlogo"[^>]*>)<img src="\/assets\/logo\/hengsel-(?:aksent-)?lys\.svg"[^>]*>(<\/span>)/g, `$1${LOGO_NAVN}$2`);
  u = u.replace(/(<span class="hlogo"[^>]*>)<img src="\/assets\/logo\/hengsel-crm-aksent-lys\.svg"[^>]*>(<\/span>)/g, `$1<span class="kl-ord">${profil.produkt}</span>$2`);
  u = u.replace(/(<span class="hlogo"[^>]*>)<img src="\/assets\/logo\/levert-av-hengsel-lys\.svg"[^>]*>(<\/span>)/g, `$1<span class="kundelogo-levert">levert av Hengsel</span>$2`);
  u = u.replace(/<img class="sn" src="\/img\/sn-logo\.svg"[^>]*>/g, ""); // SN Group-merket hører ikke til Sigdal-utgaven
  for (const [fra, til] of VIS_TEKST) u = u.split(fra).join(til);
  u = tilKunde(u, profil, { kunTekstOgLogo: true });
  return stier(u);
}

function js(t, fil) {
  let u = t;
  if (fil === "forside.js") {
    u = eksakt(u, "rom('/'+e.dataset.rom+'/')", `rom('${BASE}/'+e.dataset.rom+'/')`, fil);
    u = eksakt(u, "e.href='/'+g+'/'+", `e.href='${BASE}/'+g+'/'+`, fil);
  }
  u = tilKunde(u, profil, { kunTekstOgLogo: true });
  return stier(u);
}

let antall = 0;
function kopier(dir) {
  for (const n of readdirSync(dir)) {
    const fra = join(dir, n);
    const rel = relative(tmp, fra);
    if (IKKE.some((re) => re.test(rel + (statSync(fra).isDirectory() ? "/" : "")))) continue;
    if (statSync(fra).isDirectory()) { kopier(fra); continue; }
    const til = join(mål, rel);
    mkdirSync(dirname(til), { recursive: true });
    if (/\.html$/.test(n)) writeFileSync(til, html(readFileSync(fra, "utf8"), rel));
    else if (/\.js$/.test(n)) writeFileSync(til, js(readFileSync(fra, "utf8"), rel));
    else if (/\.css$/.test(n)) writeFileSync(til, stier(readFileSync(fra, "utf8")));
    else cpSync(fra, til);
    antall++;
  }
}
rmSync(mål, { recursive: true, force: true });
kopier(tmp);
// /kunde/sigdal/apptest viser innholdet til /apptest uten eget passord (Access er innloggingen). PDF-en med demobrukerne kopieres hit ved bygging,
// så den ikke ligger bak passordet til /apptest og ikke dobbelt i repoet.
const pdf = join(dist, "apptest", "Logg_inn_i_demoen.pdf");
// Det samme gjelder /kunde/apptest (K-229): Hengsel-utgaven bak Access, uten passord
if (existsSync(pdf)) {
  for (const mappe of [join(kunderot, "apptest"), join(dist, "kunde", "apptest")]) { mkdirSync(mappe, { recursive: true }); cpSync(pdf, join(mappe, "Logg_inn_i_demoen.pdf")); antall++; }
}
else throw new Error(`${pdf} finnes ikke`);
rmSync(tmp, { recursive: true, force: true });
console.log(`✓ Visningsrommet i Sigdal-utgave: ${antall} filer i ${relative(rot, mål)}`);
