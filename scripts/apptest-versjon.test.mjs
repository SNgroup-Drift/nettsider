// Tester for scripts/apptest-versjon.mjs. Byggdataene er hentet fra EAS (hengsel-appen, 10.10.2026); EAS Update-lista er en
// antatt form (den er ikke hentet), og skriptet godtar både liste og objekt med currentPage.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { beregn, lesBlokk, lesJson, lesNytt, osloDato, punkterIFil, sammendrag, skrivBlokk, velgBygg } from "./apptest-versjon.mjs";

const ARTIFACT = (id, ende) => ({ buildUrl: `https://expo.dev/artifacts/eas/${id}.${ende}`, applicationArchiveUrl: `https://expo.dev/artifacts/eas/${id}.${ende}` });
const ANDROID = [
  { id: "dc029e8b", status: "FINISHED", platform: "ANDROID", appVersion: "1.7.0", appBuildVersion: "24", buildProfile: "preview", completedAt: "2026-10-10T11:33:05.390Z", artifacts: ARTIFACT("i5HzdDLSpElUZcYjZJFDXYvgT_KXYR81KBMme53i5b4", "apk") },
  { id: "1f72d08a", status: "FINISHED", platform: "ANDROID", appVersion: "1.7.0", appBuildVersion: "23", buildProfile: "production", completedAt: "2026-10-10T11:28:22.919Z", artifacts: ARTIFACT("wSMktiCVybGM-i31DNyQ0VlcT5D9uuhhtneqF7W-4Nw", "aab") },
  { id: "d0a61073", status: "FINISHED", platform: "ANDROID", appVersion: "1.6.0", appBuildVersion: "22", buildProfile: "production", completedAt: "2026-10-09T19:08:44.297Z", artifacts: ARTIFACT("yvY45S-z01yUSSXP45J1QGYmnXqHSLc9pxXuHDnYjCA", "aab") },
];
const IOS = [
  { id: "576a0aa4", status: "FINISHED", platform: "IOS", appVersion: "1.7.0", appBuildVersion: "16", buildProfile: "production", completedAt: "2026-10-10T11:13:43.639Z", artifacts: ARTIFACT("Tk10EDLuc66pMtQAl1ADvpRCFDWujrppsAX3FgLJomU", "ipa") },
  { id: "c8680665", status: "FINISHED", platform: "IOS", appVersion: "1.6.0", appBuildVersion: "15", buildProfile: "production", completedAt: "2026-10-09T16:58:24.412Z", artifacts: ARTIFACT("Ve8TzCRgyO7bSaTFcMG5UVRWqaQwm25HizCPkj5hhQY", "ipa") },
];
const APK_1_7_0 = "https://expo.dev/artifacts/eas/i5HzdDLSpElUZcYjZJFDXYvgT_KXYR81KBMme53i5b4.apk";

const KILDE = `export const APPTEST = {
  // <apptest-versjon>
  versjon: "1.6.0",
  apk: "https://expo.dev/artifacts/eas/BvyOesdnZzUkOMf47EDOJKT_tEBTWuQxCXqAiC8iU1I.apk", // bygg 21
  oppdatert: "2026-10-09",
  nytt: [
    "Gammelt punkt",
  ],
  // </apptest-versjon>
  testflight: "https://testflight.apple.com/join/MygfVe9U",
};
`;

const NOTAT_11 = `# Hengsel bygg 11 (1.7.0) – 10.10

Byggordre.

## Hva er nytt i 1.7.0

- Kompakt visning og tre tettheter
- Nytt målark som ikke dekker bildet
* Pil og ring i bildeverktøyet
1. Laser med alle tilstander
- KS med **kamera**
- Utlevering bare av [skannede kolli](https://example.com)
  som fortsetter her
- Kø som overlever appdrap
- «Klar uten nett»
- Face ID-frysen rettet
- Knip-zoom og Apple Pencil på iPad

## Steg 1 – før bygget

- Ikke et nytt-punkt
`;

function notater(filer) {
  const mappe = mkdtempSync(join(tmpdir(), "bygg-"));
  for (const [navn, tekst] of Object.entries(filer)) writeFileSync(join(mappe, navn), tekst);
  return mappe;
}

test("velgBygg tar nyeste ferdige iOS og nyeste APK, ikke AAB-en som ble ferdig senere i serien", () => {
  const { ios, apk } = velgBygg(IOS, ANDROID);
  assert.equal(ios.appBuildVersion, "16");
  assert.equal(apk.appBuildVersion, "24");
  // Kommer en AAB som nyeste, skal APK-en fortsatt velges
  const medNyAab = [{ ...ANDROID[1], completedAt: "2026-10-11T08:00:00Z", appBuildVersion: "25" }, ...ANDROID];
  assert.equal(velgBygg(IOS, medNyAab).apk.appBuildVersion, "24");
  // Bygg som ikke er FINISHED teller ikke
  assert.equal(velgBygg(IOS, [{ ...ANDROID[0], status: "ERRORED" }]).apk, null);
  // Lenker utenfor expo.dev/artifacts/eas godtas ikke
  assert.equal(velgBygg(IOS, [{ ...ANDROID[0], artifacts: { buildUrl: "https://evil.example/x.apk" } }]).apk, null);
});

test("lesJson tåler tekst rundt JSON-en", () => {
  assert.deepEqual(lesJson('Henter…\n[{"a":1}]\n'), [{ a: 1 }]);
  assert.throws(() => lesJson("ingenting her"));
});

test("osloDato regner om fra UTC", () => {
  assert.equal(osloDato("2026-10-10T22:30:00Z"), "2026-10-11"); // sommertid, UTC+2
  assert.equal(osloDato("2026-12-10T22:30:00Z"), "2026-12-10"); // vintertid, UTC+1
  assert.equal(osloDato("ikke en dato"), null);
});

test("punkterIFil leser punktlista, renser markdown og stopper ved neste overskrift", () => {
  const { punkter, grunn } = punkterIFil(NOTAT_11, "1.7.0");
  assert.equal(grunn, null);
  assert.equal(punkter.length, 10);
  assert.equal(punkter[4], "KS med kamera");
  assert.equal(punkter[5], "Utlevering bare av skannede kolli som fortsetter her");
  assert.equal(punkter[9], "Knip-zoom og Apple Pencil på iPad");
  assert.ok(!punkter.includes("Ikke et nytt-punkt"));
});

test("punkterIFil avviser feil versjon i overskriften, manglende del, for mange og for lange punkter", () => {
  assert.match(punkterIFil("## Hva er nytt i 1.6.0\n- a\n", "1.7.0").grunn, /fant ingen del/);
  assert.match(punkterIFil("# Tittel\n\nIngenting.\n", "1.7.0").grunn, /fant ingen del/);
  assert.match(punkterIFil("## Hva er nytt\n\nBare tekst.\n", "1.7.0").grunn, /ingen punkter/);
  assert.match(punkterIFil(`## Hva er nytt\n${Array.from({ length: 16 }, (_, i) => `- p${i}`).join("\n")}\n`, "1.7.0").grunn, /16 punkter/);
  assert.match(punkterIFil(`## Hva er nytt\n- ${"x".repeat(201)}\n`, "1.7.0").grunn, /lengre enn 200/);
  assert.equal(punkterIFil("## Hva er nytt\n- ok\n", "1.7.0").punkter[0], "ok"); // uten versjon i overskriften
});

test("lesNytt velger høyeste bygg for versjonen og hopper over andre versjoner og andre filnavn", () => {
  const mappe = notater({
    "hengsel-bygg-10.md": "# Hengsel bygg 10 (1.6.0) – 09.10\n\n## Hva er nytt\n- fra 10\n",
    "hengsel-bygg-11.md": NOTAT_11,
    "hengsel-bygg-12.md": "# Hengsel bygg 12 (1.7.0) – 11.10\n\n## Hva er nytt\n- fra 12\n",
    "hengsel-bygg-13-klar.md": "# Hengsel bygg 13 (1.7.0)\n\n## Hva er nytt\n- feil fil\n",
  });
  const r = lesNytt(mappe, "1.7.0");
  assert.equal(r.fil, "claude/hengsel-bygg-12.md");
  assert.deepEqual(r.punkter, ["fra 12"]);
  assert.equal(lesNytt(mappe, "1.6.0").n, 10);
  assert.match(lesNytt(mappe, "9.9.9").grunn, /fant ingen hengsel-bygg/);
});

test("skrivBlokk: skriver bare mellom merkene, og lesBlokk leser det tilbake", () => {
  const ny = skrivBlokk(KILDE, { versjon: "1.7.0", apk: APK_1_7_0, apkBygg: 24, oppdatert: "2026-10-10", nytt: ["a «b»", 'sitat "x"'] });
  assert.ok(ny.includes('testflight: "https://testflight.apple.com/join/MygfVe9U"'));
  assert.ok(ny.includes("// bygg 24"));
  assert.deepEqual(lesBlokk(ny), { versjon: "1.7.0", apk: APK_1_7_0, oppdatert: "2026-10-10", nytt: ["a «b»", 'sitat "x"'] });
  assert.equal(skrivBlokk(ny, lesBlokk(ny) && { versjon: "1.7.0", apk: APK_1_7_0, apkBygg: 24, oppdatert: "2026-10-10", nytt: ["a «b»", 'sitat "x"'] }), ny); // idempotent
  assert.ok(skrivBlokk(KILDE, { versjon: "1.7.0", apk: APK_1_7_0, apkBygg: 24, oppdatert: "2026-10-10", nytt: [] }).includes("nytt: [],"));
});

test("skrivBlokk nekter ugyldige verdier", () => {
  const ok = { versjon: "1.7.0", apk: APK_1_7_0, apkBygg: 24, oppdatert: "2026-10-10", nytt: [] };
  assert.throws(() => skrivBlokk(KILDE, { ...ok, versjon: '1.7.0"; evil()' }), /ugyldig versjon/);
  assert.throws(() => skrivBlokk(KILDE, { ...ok, apk: "https://expo.dev/artifacts/eas/x.apk\nevil" }), /ugyldig APK/);
  assert.throws(() => skrivBlokk(KILDE, { ...ok, oppdatert: "i går" }), /ugyldig dato/);
  assert.throws(() => skrivBlokk("ingen merker", ok), /fant ikke/);
});

test("beregn: ny versjon med notat gir alt oppdatert, og andre kjøring gir ingen endring", () => {
  const mappe = notater({ "hengsel-bygg-11.md": NOTAT_11 });
  const r = beregn({ kilde: KILDE, ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: mappe });
  assert.equal(r.endret, true);
  assert.equal(r.versjon, "1.7.0");
  assert.equal(r.apk, APK_1_7_0);
  assert.equal(r.apkBygg, 24);
  assert.equal(r.oppdatert, "2026-10-10");
  assert.equal(r.nytt.length, 10);
  assert.deepEqual(r.advarsler, []);
  const igjen = beregn({ kilde: r.ny, ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: mappe });
  assert.equal(igjen.endret, false);
  assert.match(sammendrag(r), /Ikke auto-merget/);
});

test("beregn: en nyere EAS Update flytter bare datoen, og en update til en annen kjøretid teller ikke", () => {
  const mappe = notater({ "hengsel-bygg-11.md": NOTAT_11 });
  const forst = beregn({ kilde: KILDE, ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: mappe });
  const medUpdate = [
    { group: "g2", createdAt: "2026-10-12T07:00:00Z", runtimeVersion: "1.7.0", branch: "preview" },
    { group: "g3", createdAt: "2026-10-15T07:00:00Z", runtimeVersion: "1.8.0", branch: "preview" },
  ];
  const r = beregn({ kilde: forst.ny, ios: IOS, android: ANDROID, oppdateringer: { currentPage: medUpdate }, claudeMappe: mappe });
  assert.equal(r.endret, true);
  assert.equal(r.oppdatert, "2026-10-12");
  assert.deepEqual(r.nytt, forst.nytt);
});

test("beregn: mangler «Hva er nytt» beholdes punktene for samme versjon, men tømmes for ny versjon", () => {
  const utenDel = notater({ "hengsel-bygg-11.md": "# Hengsel bygg 11 (1.7.0) – 10.10\n\n## Steg 1\n\n- bare commits\n" });
  // Samme versjon som i filen: dagens punkter beholdes
  const samme = beregn({ kilde: skrivBlokk(KILDE, { versjon: "1.7.0", apk: APK_1_7_0, apkBygg: 24, oppdatert: "2026-10-09", nytt: ["Beholdes"] }), ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: utenDel });
  assert.deepEqual(samme.nytt, ["Beholdes"]);
  assert.equal(samme.advarsler.length, 1);
  assert.match(samme.advarsler[0], /Dagens punkter er beholdt/);
  // Ny versjon (KILDE står på 1.6.0): lista tømmes i stedet for å vise gamle punkter under ny overskrift
  const ny = beregn({ kilde: KILDE, ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: utenDel });
  assert.deepEqual(ny.nytt, []);
  assert.match(ny.advarsler[0], /Lista er tømt/);
  // Ingen notatmappe i det hele tatt
  assert.deepEqual(beregn({ kilde: KILDE, ios: IOS, android: ANDROID, oppdateringer: [], claudeMappe: "/finnes/ikke" }).nytt, []);
});

test("beregn: iOS på annen versjon gir advarsel, ingen APK gir feil", () => {
  const mappe = notater({ "hengsel-bygg-11.md": NOTAT_11 });
  const nyIos = [{ ...IOS[0], appVersion: "1.8.0", appBuildVersion: "17", completedAt: "2026-10-11T10:00:00Z" }, ...IOS];
  const r = beregn({ kilde: KILDE, ios: nyIos, android: ANDROID, oppdateringer: [], claudeMappe: mappe });
  assert.equal(r.versjon, "1.7.0");
  assert.match(r.advarsler[0], /iOS ligger på 1\.8\.0/);
  assert.match(sammendrag(r), /Nyeste ferdige iOS-bygg: 1\.8\.0 \(17\)/);
  assert.doesNotMatch(sammendrag(r), /iOS-bygg: 1\.7\.0/);
  assert.equal(r.oppdatert, "2026-10-10"); // iOS 1.8.0 teller ikke for 1.7.0
  assert.throws(() => beregn({ kilde: KILDE, ios: IOS, android: [ANDROID[1]], oppdateringer: [], claudeMappe: mappe }), /ingen ferdig Android-APK/);
});

test("apptest-lenker.ts i repoet har merkene og gyldige verdier", () => {
  const kilde = readFileSync(new URL("../sites/hengsel/src/apptest-lenker.ts", import.meta.url), "utf8");
  const b = lesBlokk(kilde);
  assert.match(b.versjon, /^\d+\.\d+\.\d+$/);
  assert.match(b.apk, /^https:\/\/expo\.dev\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/);
  assert.match(b.oppdatert, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(b.nytt));
});
