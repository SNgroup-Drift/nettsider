#!/usr/bin/env node
/**
 * K-233: sjekker skjermbildebiblioteket på bilder.hengsel.no mot kopien i repoet, og at hver bildeadresse i manifestet svarer 200.
 *
 *   node scripts/sjekk-bibliotek.mjs            henter manifest.json, sammenlikner med packages/hengsel-tokens/skjermbilder-manifest.json
 *                                               (nye, borte, endrede mål/sha256), og ber om hver fil (HEAD, 200 og image/webp; GET ved HEAD-feil)
 *   node scripts/sjekk-bibliotek.mjs --skriv    skriver i tillegg det ekte manifestet over kopien (commit den etterpå)
 *   node scripts/sjekk-bibliotek.mjs --bare-manifest   hopper over bildeforespørslene
 *
 * Skriver et sammendrag i Markdown til claude/k233/bibliotek-sjekk.md (brukes i rapporten og i jobbsammendraget i Actions). Fila skrives ALLTID (K-238),
 * også når manifestet ikke nås (exit 2) eller sjekken stopper på en feil (exit 1), så sammendraget aldri står tomt. Exit 1 ved avvik eller feil. Ingen hemmeligheter.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { BILDEDOMENE, KJENTE_MANGLER, LOKALE_BILDER, MANIFEST_FIL, lesManifest, skjermbildeNokkel } from "./lib/bildedomene.mjs";

const rot = resolve(import.meta.dirname, "..");
const skriv = process.argv.includes("--skriv");
const bareManifest = process.argv.includes("--bare-manifest");
const ut = join(rot, "claude", "k233");
const linjer = [];
const si = (s = "") => { linjer.push(s); console.log(s); };

async function sjekk() {
  const kopi = lesManifest();
  const url = `${BILDEDOMENE}/manifest.json`;
  let ekte, ekteTekst;
  try {
    const svar = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!svar.ok) throw new Error(`svarte ${svar.status}`);
    ekteTekst = await svar.text();
    ekte = JSON.parse(ekteTekst);
  } catch (e) {
    si(`# Bibliotek-sjekk ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
    si();
    si(`✗ ${url} nås ikke: ${e?.message ?? e}`);
    return 2;
  }
  si(`# Bibliotek-sjekk ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
  si();
  si(`Ekte manifest: versjon ${ekte.versjon}, laget ${ekte.laget}, ${Object.keys(ekte.filer ?? {}).length} filer (antall-feltet: ${ekte.antall}).`);
  si(`Kopien i repoet: laget ${kopi.laget}, ${Object.keys(kopi.filer).length} filer.`);

  const eK = new Set(Object.keys(ekte.filer ?? {}));
  const kK = new Set(Object.keys(kopi.filer));
  const nye = [...eK].filter((k) => !kK.has(k)).sort();
  const borte = [...kK].filter((k) => !eK.has(k)).sort();
  const endret = [...eK].filter((k) => kK.has(k)).filter((k) => { const a = ekte.filer[k], b = kopi.filer[k]; return a.bredde !== b.bredde || a.hoyde !== b.hoyde || a.sha256 !== b.sha256 || a.bytes !== b.bytes; }).sort();
  si();
  si(`## Avvik fra kopien`);
  si(`- Nye filer i biblioteket (${nye.length}): ${nye.join(", ") || "ingen"}`);
  si(`- Filer i kopien som ikke finnes i biblioteket (${borte.length}): ${borte.join(", ") || "ingen"}`);
  si(`- Endrede filer (${endret.length}):${endret.length ? "" : " ingen"}`);
  for (const k of endret) {
    const a = ekte.filer[k], b = kopi.filer[k];
    const hva = [];
    if (a.bredde !== b.bredde || a.hoyde !== b.hoyde) hva.push(`mål ${b.bredde}×${b.hoyde} → ${a.bredde}×${a.hoyde}`);
    if (a.sha256 !== b.sha256) hva.push("nytt innhold (sha256)");
    if (a.bytes !== b.bytes && a.sha256 === b.sha256) hva.push(`bytes ${b.bytes} → ${a.bytes}`);
    si(`  - ${k}: ${hva.join(", ")}`);
  }
  // KJENTE_MANGLER og LOKALE_BILDER mot det ekte manifestet
  const nokler = new Set([...eK].map((k) => skjermbildeNokkel(k.replace(/^[a-z]+\//, ""))));
  const kommet = KJENTE_MANGLER.filter((k) => nokler.has(k));
  const lokaleIBib = Object.keys(LOKALE_BILDER).filter((k) => nokler.has(k));
  si(`- Kjente mangler som nå finnes i biblioteket (fjern fra KJENTE_MANGLER) (${kommet.length}): ${kommet.join(", ") || "ingen"}`);
  si(`- Nettsidenes egne bilder som likevel ligger i biblioteket (${lokaleIBib.length}): ${lokaleIBib.join(", ") || "ingen"}`);

  let feil = 0;
  if (!bareManifest) {
    si();
    si(`## Hver bildeadresse i manifestet`);
    const stier = [...eK].sort();
    const resultater = [];
    const ko = [...stier];
    const arbeid = async () => {
      while (ko.length) {
        const sti = ko.shift();
        const adresse = `${BILDEDOMENE}/${sti}`;
        let r;
        try {
          r = await fetch(adresse, { method: "HEAD", signal: AbortSignal.timeout(15000) });
          if (!r.ok) r = await fetch(adresse, { signal: AbortSignal.timeout(20000) });
        } catch (e) { resultater.push([sti, `feil: ${e?.message ?? e}`]); continue; }
        const type = r.headers.get("content-type") ?? "";
        const lengde = Number(r.headers.get("content-length") ?? -1);
        const problemer = [];
        if (r.status !== 200) problemer.push(`status ${r.status}`);
        if (!type.startsWith("image/webp")) problemer.push(`content-type ${type || "mangler"}`);
        if (lengde >= 0 && lengde !== ekte.filer[sti].bytes) problemer.push(`content-length ${lengde} ≠ ${ekte.filer[sti].bytes} bytes i manifestet`);
        if (problemer.length) resultater.push([sti, problemer.join(", ")]);
      }
    };
    await Promise.all(Array.from({ length: 8 }, arbeid));
    feil += resultater.length;
    si(`${stier.length} adresser bedt om, ${stier.length - resultater.length} svarte 200 som image/webp med riktig lengde, ${resultater.length} med avvik.`);
    for (const [sti, p] of resultater.sort()) si(`- ${sti}: ${p}`);
  }
  if (skriv) {
    // Samme tekst som biblioteket serverer (slik oppdaterManifest() i byggene også skriver den), så kopien ikke endres igjen ved neste bygg
    await writeFile(MANIFEST_FIL, ekteTekst.endsWith("\n") ? ekteTekst : `${ekteTekst}\n`);
    si();
    si(`Kopien ${MANIFEST_FIL.slice(rot.length + 1)} er skrevet over med det ekte manifestet.`);
  }
  return feil || borte.length || endret.length || kommet.length || lokaleIBib.length ? 1 : 0;
}

let kode = 1;
try {
  kode = await sjekk();
} catch (e) {
  si();
  si(`✗ Sjekken stoppet: ${e?.stack ?? e}`);
  kode = 1;
} finally {
  // Skrives alltid, også ved feil: workflowen Bibliotek-sjekk legger fila i jobbsammendraget og i artefaktet
  await mkdir(ut, { recursive: true });
  await writeFile(join(ut, "bibliotek-sjekk.md"), linjer.join("\n") + "\n");
}
process.exit(kode);
