#!/usr/bin/env node
/**
 * Oppdaterer versjon, APK-lenke, «Siste oppdatering» og «Hva er nytt» på hengsel.no/apptest.
 * Kjøres av .github/workflows/apptest-versjon.yml, men tar bare filer som input og kan kjøres lokalt.
 *
 *   node scripts/apptest-versjon.mjs --ios ios.json --android android.json --update update.json \
 *        --claude crm/claude [--fil sites/hengsel/src/apptest-lenker.ts] [--sammendrag pr.md]
 *
 * Input:
 *   --ios, --android   utdata fra `eas build:list --platform … --status finished --json`
 *   --update           utdata fra `eas update:list --branch preview --json`
 *   --claude           mappen med claude/hengsel-bygg-<n>.md fra innlandet-crm-sync (demo)
 *
 * Regler:
 *   - APK-en er det nyeste ferdige Android-bygget med en .apk-lenke på expo.dev (AAB-er for Play hoppes over).
 *   - versjon = appVersion på den APK-en. Står iOS på en annen versjon, sier sammendraget fra om det.
 *   - «Hva er nytt» leses fra claude/hengsel-bygg-<n>.md der tittelen er «# Hengsel bygg <n> (<versjon>)», med høyeste <n>
 *     for versjonen, fra delen «## Hva er nytt» (eller «## Hva er nytt i <versjon>») som punktliste.
 *     Mangler delen, beholdes dagens punkter hvis versjonen er den samme; ellers tømmes lista («Punktene kommer.»).
 *   - oppdatert = nyeste av APK-bygget, iOS-bygget (samme versjon) og EAS Update med kjøretid = versjonen, som dato i Oslo.
 *   - Alt som skrives, valideres først (versjon, URL, dato, lengder). Verdiene settes inn som JSON-strenger.
 *
 * Skriver bare området mellom «// <apptest-versjon>» og «// </apptest-versjon>» i apptest-lenker.ts.
 * Setter `endret=true|false` (og `versjon`, `apk_bygg`) i $GITHUB_OUTPUT når den finnes. Utfall 0 også når det ikke er noe å endre.
 */
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+$/;
const APK_URL = /^https:\/\/expo\.dev\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/;
const DATO = /^\d{4}-\d{2}-\d{2}$/;
const MAKS_PUNKTER = 15;
const MAKS_PUNKTLENGDE = 200;
const START = "// <apptest-versjon>";
const SLUTT = "// </apptest-versjon>";

/** JSON fra eas-cli kan ha tekst foran eller bak; ta det som ligger mellom første og siste klammeparentes. */
export function lesJson(tekst) {
  try {
    return JSON.parse(tekst);
  } catch {
    const start = tekst.search(/[[{]/);
    const slutt = Math.max(tekst.lastIndexOf("]"), tekst.lastIndexOf("}"));
    if (start < 0 || slutt < start) throw new Error("fant ingen JSON i utdataene");
    return JSON.parse(tekst.slice(start, slutt + 1));
  }
}

/** Tar imot en liste, eller et objekt som pakker den inn (builds, currentPage, updates, data). */
function somListe(x) {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object") {
    for (const nokkel of ["builds", "currentPage", "updates", "data", "items"]) if (Array.isArray(x[nokkel])) return x[nokkel];
  }
  return [];
}

const tid = (b) => Date.parse(b?.completedAt ?? b?.updatedAt ?? b?.createdAt ?? "") || 0;
const nyestFor = (liste) => [...liste].sort((a, b) => tid(b) - tid(a));
const erFerdig = (b) => String(b?.status ?? "").toUpperCase() === "FINISHED";
const tallBygg = (b) => (/^\d+$/.test(String(b?.appBuildVersion ?? "")) ? Number(b.appBuildVersion) : null);

/** Nyeste ferdige iOS-bygg og nyeste ferdige Android-bygg som er en APK. */
export function velgBygg(iosJson, androidJson) {
  const ios = nyestFor(somListe(iosJson).filter((b) => erFerdig(b) && String(b.platform ?? "IOS").toUpperCase() === "IOS" && SEMVER.test(String(b.appVersion))))[0] ?? null;
  const apk =
    nyestFor(
      somListe(androidJson).filter(
        (b) => erFerdig(b) && String(b.platform ?? "ANDROID").toUpperCase() === "ANDROID" && SEMVER.test(String(b.appVersion)) && APK_URL.test(String(b.artifacts?.buildUrl ?? "")),
      ),
    )[0] ?? null;
  return { ios, apk };
}

/** ÅÅÅÅ-MM-DD i Oslo for et tidspunkt. */
export function osloDato(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

/** Datoen for siste oppdatering: nyeste av APK-bygget, iOS-bygget (samme versjon) og EAS Update for kjøretiden = versjonen. */
export function sisteOppdatering({ apk, ios, oppdateringer, versjon }) {
  const tider = [apk?.completedAt, ios?.appVersion === versjon ? ios.completedAt : null];
  for (const u of somListe(oppdateringer)) {
    if (u?.runtimeVersion !== undefined && u.runtimeVersion !== versjon) continue; // en update til en annen kjøretid når ikke denne versjonen
    tider.push(u?.createdAt ?? u?.updatedAt);
  }
  const nyeste = tider.map((t) => Date.parse(t ?? "")).filter(Number.isFinite).sort((a, b) => b - a)[0];
  return nyeste ? osloDato(new Date(nyeste).toISOString()) : null;
}

const rens = (s) =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [tekst](lenke) → tekst
    .replace(/(\*\*|__|`)/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const regexTekst = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Punktene i delen «Hva er nytt» i én fil, eller null (med grunn) hvis delen mangler eller er ugyldig. */
export function punkterIFil(tekst, versjon) {
  const linjer = tekst.split(/\r?\n/);
  const overskrift = new RegExp(`^#{2,4}\\s*Hva er nytt(?:\\s+i\\s+${regexTekst(versjon)})?\\s*:?$`, "i");
  const start = linjer.findIndex((l) => overskrift.test(l.trim()));
  if (start < 0) return { punkter: null, grunn: `fant ingen del «Hva er nytt» eller «Hva er nytt i ${versjon}»` };
  const punkter = [];
  let aktiv = false;
  for (const linje of linjer.slice(start + 1)) {
    if (/^#{1,6}\s/.test(linje)) break;
    const punkt = linje.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*\S)\s*$/);
    if (punkt) {
      punkter.push(punkt[1]);
      aktiv = true;
    } else if (aktiv && /^\s+\S/.test(linje)) {
      punkter[punkter.length - 1] += ` ${linje.trim()}`; // fortsettelse av forrige punkt
    } else if (aktiv && linje.trim() !== "") {
      break; // et nytt avsnitt etter lista
    }
  }
  const renset = punkter.map(rens).filter(Boolean);
  if (!renset.length) return { punkter: null, grunn: "delen «Hva er nytt» har ingen punkter" };
  if (renset.length > MAKS_PUNKTER) return { punkter: null, grunn: `${renset.length} punkter (mest ${MAKS_PUNKTER})` };
  const for_lang = renset.find((p) => p.length > MAKS_PUNKTLENGDE);
  if (for_lang) return { punkter: null, grunn: `et punkt er lengre enn ${MAKS_PUNKTLENGDE} tegn: «${for_lang.slice(0, 40)}…»` };
  return { punkter: renset, grunn: null };
}

/** Finner notatfilen for versjonen (høyeste byggnummer med «(versjon)» i tittelen) i mappen med hengsel-bygg-<n>.md. */
export function lesNytt(mappe, versjon) {
  if (!mappe || !existsSync(mappe)) return { fil: null, n: null, punkter: null, grunn: "mappen med byggnotater finnes ikke" };
  const kandidater = [];
  for (const navn of readdirSync(mappe)) {
    const m = navn.match(/^hengsel-bygg-(\d+)\.md$/);
    if (!m) continue;
    const tekst = readFileSync(join(mappe, navn), "utf8");
    const tittel = tekst.match(/^#\s+Hengsel bygg (\d+)\s*\((\d+\.\d+\.\d+)\)/m);
    if (tittel && tittel[2] === versjon) kandidater.push({ navn, n: Number(m[1]), tekst });
  }
  if (!kandidater.length) return { fil: null, n: null, punkter: null, grunn: `fant ingen hengsel-bygg-<n>.md med «(${versjon})» i tittelen` };
  kandidater.sort((a, b) => b.n - a.n);
  const valgt = kandidater[0];
  return { fil: `claude/${valgt.navn}`, n: valgt.n, ...punkterIFil(valgt.tekst, versjon) };
}

/** Skriver blokken mellom merkene. Verdiene er validert og settes inn som JSON-strenger. */
export function skrivBlokk(kilde, { versjon, apk, apkBygg, oppdatert, nytt }) {
  if (!SEMVER.test(versjon)) throw new Error(`ugyldig versjon: ${versjon}`);
  if (!APK_URL.test(apk)) throw new Error(`ugyldig APK-lenke: ${apk}`);
  if (!DATO.test(oppdatert)) throw new Error(`ugyldig dato: ${oppdatert}`);
  const rad = (s) => `    ${JSON.stringify(s)},`;
  const blokk = [
    `  versjon: ${JSON.stringify(versjon)},`,
    `  apk: ${JSON.stringify(apk)},${apkBygg ? ` // bygg ${apkBygg}` : ""}`,
    `  oppdatert: ${JSON.stringify(oppdatert)},`,
    nytt.length ? `  nytt: [\n${nytt.map(rad).join("\n")}\n  ],` : "  nytt: [],",
  ].join("\n");
  const a = kilde.indexOf(START);
  const b = kilde.indexOf(SLUTT);
  if (a < 0 || b < a) throw new Error(`fant ikke «${START}» og «${SLUTT}» i apptest-lenker.ts`);
  const etterStart = kilde.indexOf("\n", a) + 1;
  const innrykk = kilde.slice(kilde.lastIndexOf("\n", b) + 1, b);
  return `${kilde.slice(0, etterStart)}${blokk}\n${innrykk}${kilde.slice(b)}`;
}

/** Leser dagens verdier ut av blokken, for sammenligning og for «beholdt»-regelen. */
export function lesBlokk(kilde) {
  const a = kilde.indexOf(START);
  const b = kilde.indexOf(SLUTT);
  if (a < 0 || b < a) throw new Error(`fant ikke «${START}» og «${SLUTT}» i apptest-lenker.ts`);
  const blokk = kilde.slice(a, b);
  const streng = (nokkel) => blokk.match(new RegExp(`^\\s*${nokkel}:\\s*("(?:[^"\\\\]|\\\\.)*")`, "m"))?.[1];
  const nytt = [...(blokk.match(/nytt:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"(?:[^"\\]|\\.)*"/g)].map((m) => JSON.parse(m[0]));
  return {
    versjon: streng("versjon") && JSON.parse(streng("versjon")),
    apk: streng("apk") && JSON.parse(streng("apk")),
    oppdatert: streng("oppdatert") && JSON.parse(streng("oppdatert")),
    nytt,
  };
}

/** Selve utregningen: gir ny kildetekst, verdiene og advarsler. Kaster ved feil som må stoppe kjøringen. */
export function beregn({ kilde, ios, android, oppdateringer, claudeMappe }) {
  const { ios: iosBygg, apk } = velgBygg(ios, android);
  if (!apk) throw new Error("fant ingen ferdig Android-APK (FINISHED med .apk-lenke på expo.dev) i byggene fra EAS");
  const advarsler = [];
  const versjon = apk.appVersion;
  const apkBygg = tallBygg(apk);
  if (iosBygg && iosBygg.appVersion !== versjon) {
    advarsler.push(`iOS ligger på ${iosBygg.appVersion} (bygg ${tallBygg(iosBygg) ?? "?"}), APK-en på ${versjon}. Siden bruker APK-ens versjon.`);
  }
  if (!iosBygg) advarsler.push("fant ingen ferdig iOS-bygg");

  const oppdatert = sisteOppdatering({ apk, ios: iosBygg, oppdateringer, versjon });
  if (!oppdatert) throw new Error("fant ingen dato for siste oppdatering (verken bygg eller update)");

  const dagens = lesBlokk(kilde);
  const notat = lesNytt(claudeMappe, versjon);
  let nytt;
  let nyttKilde;
  if (notat.punkter) {
    nytt = notat.punkter;
    nyttKilde = `${notat.fil} (bygg ${notat.n})`;
  } else if (dagens.versjon === versjon) {
    nytt = dagens.nytt;
    nyttKilde = "uendret (dagens punkter beholdt)";
    advarsler.push(`«Hva er nytt» ble ikke oppdatert: ${notat.grunn}${notat.fil ? ` (${notat.fil})` : ""}. Dagens punkter er beholdt.`);
  } else {
    nytt = [];
    nyttKilde = "ingen (lista er tømt)";
    advarsler.push(`«Hva er nytt» kunne ikke leses for ${versjon}: ${notat.grunn}${notat.fil ? ` (${notat.fil})` : ""}. Lista er tømt, og siden viser «Punktene kommer.». Legg inn delen «## Hva er nytt» i notatet.`);
  }

  const ny = skrivBlokk(kilde, { versjon, apk: apk.artifacts.buildUrl, apkBygg, oppdatert, nytt });
  return { ny, endret: ny !== kilde, versjon, apk: apk.artifacts.buildUrl, apkBygg, iosBygg: iosBygg ? tallBygg(iosBygg) : null, iosVersjon: iosBygg?.appVersion ?? null, oppdatert, nytt, nyttKilde, advarsler, dagens };
}

export function sammendrag(r) {
  const linjer = [
    `Automatisk oppdatering av \`/apptest\` fra EAS og byggnotatene (\`.github/workflows/apptest-versjon.yml\`). **Ikke auto-merget; les gjennom før du slår den sammen.**`,
    "",
    "| | Før | Nå |",
    "|---|---|---|",
    `| Versjon | ${r.dagens.versjon ?? "–"} | **${r.versjon}** |`,
    `| APK | ${r.dagens.apk ? `\`…${r.dagens.apk.slice(-14)}\`` : "–"} | \`…${r.apk.slice(-14)}\` (bygg ${r.apkBygg ?? "?"}) |`,
    `| Siste oppdatering | ${r.dagens.oppdatert ?? "–"} | **${r.oppdatert}** |`,
    `| Hva er nytt | ${r.dagens.nytt.length} punkter | ${r.nytt.length} punkter, fra ${r.nyttKilde} |`,
  ];
  if (r.iosVersjon) linjer.push("", `Nyeste ferdige iOS-bygg: ${r.iosVersjon} (${r.iosBygg}).`);
  if (r.advarsler.length) linjer.push("", "**Å se på:**", ...r.advarsler.map((a) => `- ${a}`));
  if (r.nytt.length) linjer.push("", `<details><summary>Hva er nytt i ${r.versjon}</summary>`, "", ...r.nytt.map((p) => `- ${p}`), "", "</details>");
  return linjer.join("\n");
}

function main() {
  const { values: v } = parseArgs({
    options: {
      ios: { type: "string" },
      android: { type: "string" },
      update: { type: "string" },
      claude: { type: "string" },
      fil: { type: "string", default: "sites/hengsel/src/apptest-lenker.ts" },
      sammendrag: { type: "string" },
    },
  });
  for (const k of ["ios", "android", "claude"]) if (!v[k]) throw new Error(`mangler --${k}`);
  const les = (sti) => lesJson(readFileSync(sti, "utf8"));
  const kilde = readFileSync(v.fil, "utf8");
  let oppdateringer = [];
  try {
    oppdateringer = v.update ? les(v.update) : [];
  } catch (feil) {
    console.log(`::warning::Kunne ikke lese EAS Update-lista (${feil.message}); datoen regnes bare fra byggene.`);
  }
  const r = beregn({ kilde, ios: les(v.ios), android: les(v.android), oppdateringer, claudeMappe: v.claude });
  for (const a of r.advarsler) console.log(`::warning::${a}`);
  console.log(r.endret ? `Endret: versjon ${r.versjon}, APK bygg ${r.apkBygg}, oppdatert ${r.oppdatert}, ${r.nytt.length} punkter (${r.nyttKilde}).` : "Ingen endring.");
  if (r.endret) writeFileSync(v.fil, r.ny);
  if (v.sammendrag) writeFileSync(v.sammendrag, `${sammendrag(r)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `endret=${r.endret}\nversjon=${r.versjon}\napk_bygg=${r.apkBygg ?? ""}\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (feil) {
    console.error(`::error::${feil.message}`);
    process.exit(1);
  }
}
