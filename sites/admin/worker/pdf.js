/**
 * Tilbud som PDF (K-240, SA6, 60-213 punkt i og tegningen 60-203). Liten PDF-skriver uten avhengigheter: A4 stående, marger 16 mm,
 * standardskriftene Helvetica og Helvetica-Bold med WinAnsi (æøå), Hengsel-logoen tegnet fra SVG-stiene i den pinnede logofila.
 * Fargene kommer som hex fra hengsel.tokens.json (sendes inn av api.js), aldri fra denne fila. Flere sider når linjene ikke får plass.
 * Alt innhold kommer fra Innstillinger og databasen: leverandør, kunde, kontakt, nr., datoer, prisliste, beløp, maler. Setningene i vilkårene
 * rundt verdiene er fast tekst (punkt i).
 */
import { kr } from "../src/lib/pris.js";

export const A4 = { b: 595.28, h: 841.89 };
export const MARG = 16 * 72 / 25.4; // 45,35 pt

// ── Skriftbredder (AFM, per 1000) for Helvetica og Helvetica-Bold, ASCII 32–126 ──────────────────────────────────────────────────
const B_R = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const B_B = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const EKSTRA_R = { "æ": 889, "ø": 611, "å": 556, "Æ": 1000, "Ø": 778, "Å": 667, "«": 556, "»": 556, "–": 556, "—": 1000, "×": 584, "·": 278, "à": 556, "é": 556, "è": 556, "ä": 556, "ö": 556, "ü": 556, "°": 400, "§": 556, "’": 222, "‘": 222, "“": 333, "”": 333, "…": 1000, "›": 333, "‹": 333, " ": 278 };
const EKSTRA_B = { "æ": 889, "ø": 611, "å": 556, "Æ": 1000, "Ø": 778, "Å": 722, "«": 556, "»": 556, "–": 556, "—": 1000, "×": 584, "·": 278, "à": 556, "é": 556, "è": 556, "ä": 556, "ö": 556, "ü": 611, "°": 400, "§": 556, "’": 278, "‘": 278, "“": 500, "”": 500, "…": 1000, "›": 333, "‹": 333, " ": 278 };

export function bredde(s, fet, str) {
  let w = 0;
  const tab = fet ? B_B : B_R, ekstra = fet ? EKSTRA_B : EKSTRA_R;
  for (const c of s) {
    const k = c.charCodeAt(0);
    w += k >= 32 && k <= 126 ? tab[k - 32] : (ekstra[c] ?? (c === "−" ? 584 : 556));
  }
  return (w / 1000) * str;
}

// ── cp1252 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const CP = { "€": 0x80, "…": 0x85, "‹": 0x8b, "›": 0x9b, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "™": 0x99, "−": 0x2d, " ": 0x20, " ": 0x20 };
function tilBytes(s) {
  const ut = [];
  for (const c of s) {
    const k = c.codePointAt(0);
    let b;
    if (k < 128) b = k;
    else if (k >= 0xa0 && k <= 0xff) b = k;
    else if (CP[c] !== undefined) b = CP[c];
    else b = 0x3f;
    if (b === 0x5c || b === 0x28 || b === 0x29) ut.push(0x5c);
    ut.push(b);
  }
  return ut;
}
const bytesTilStreng = (bytes) => String.fromCharCode(...bytes);
const tall = (n) => (Math.round(n * 100) / 100).toString();

export function hexTilRgb(hex) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ── Skriveren ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export class PdfSkriver {
  constructor() { this.sider = []; this.nySide(); }
  nySide() { this.ops = []; this.sider.push(this.ops); this.y = MARG; return this.sider.length; }
  farge(hex) { const [r, g, b] = hexTilRgb(hex); return `${tall(r)} ${tall(g)} ${tall(b)}`; }
  /** Tekst med (x, y) fra øverste venstre hjørne; y er grunnlinjen. */
  tekst(x, y, s, { fet = false, str = 10, farge, juster = "venstre" } = {}) {
    let xx = x;
    const w = bredde(s, fet, str);
    if (juster === "hoyre") xx = x - w;
    if (juster === "midt") xx = x - w / 2;
    const b = tilBytes(s);
    this.ops.push(`BT /${fet ? "F2" : "F1"} ${tall(str)} Tf ${farge ? `${this.farge(farge)} rg ` : ""}${tall(xx)} ${tall(A4.h - y)} Td (${bytesTilStreng(b)}) Tj ET`);
    return w;
  }
  linje(x1, y1, x2, y2, farge, tykkelse = 0.75) {
    this.ops.push(`${this.farge(farge)} RG ${tall(tykkelse)} w ${tall(x1)} ${tall(A4.h - y1)} m ${tall(x2)} ${tall(A4.h - y2)} l S`);
  }
  rekt(x, y, b, h, farge) {
    this.ops.push(`${this.farge(farge)} rg ${tall(x)} ${tall(A4.h - y - h)} ${tall(b)} ${tall(h)} re f`);
  }
  /** Avrundet rektangel (bezier-hjørner) */
  rundRekt(x, y, b, h, r, farge) {
    const k = 0.5523 * r, Y = (v) => tall(A4.h - v), X = tall;
    const p = [
      `${X(x + r)} ${Y(y)} m`, `${X(x + b - r)} ${Y(y)} l`, `${X(x + b - r + k)} ${Y(y)} ${X(x + b)} ${Y(y + r - k)} ${X(x + b)} ${Y(y + r)} c`,
      `${X(x + b)} ${Y(y + h - r)} l`, `${X(x + b)} ${Y(y + h - r + k)} ${X(x + b - r + k)} ${Y(y + h)} ${X(x + b - r)} ${Y(y + h)} c`,
      `${X(x + r)} ${Y(y + h)} l`, `${X(x + r - k)} ${Y(y + h)} ${X(x)} ${Y(y + h - r + k)} ${X(x)} ${Y(y + h - r)} c`,
      `${X(x)} ${Y(y + r)} l`, `${X(x)} ${Y(y + r - k)} ${X(x + r - k)} ${Y(y)} ${X(x + r)} ${Y(y)} c`, "h f",
    ];
    this.ops.push(`${this.farge(farge)} rg ${p.join(" ")}`);
  }
  /** Ordbryting til en bredde; returnerer linjene */
  bryt(s, fet, str, maks) {
    const ut = [];
    for (const avsnitt of String(s).split("\n")) {
      let linje = "";
      for (const ord of avsnitt.split(" ")) {
        const prov = linje ? `${linje} ${ord}` : ord;
        if (bredde(prov, fet, str) <= maks || !linje) linje = prov;
        else { ut.push(linje); linje = ord; }
      }
      ut.push(linje);
    }
    return ut;
  }
  /** Tegner SVG-stier (fra logofila) på siden: x, y øverst venstre, hoyde i pt. Bare M L H V C S Q T A Z og <g transform="scale() translate()">. */
  svg(svgTekst, x, y, hoyde, standardFarge) {
    const vb = /viewBox="([\d.\s-]+)"/.exec(svgTekst);
    const [, , vbB, vbH] = (vb ? vb[1].trim().split(/[\s,]+/).map(Number) : [0, 0, 100, 100]);
    const skala = hoyde / vbH;
    const grupper = [];
    const gRe = /<g\b([^>]*)>([\s\S]*?)<\/g>/g;
    let rest = svgTekst, m;
    while ((m = gRe.exec(svgTekst))) {
      const tr = /transform="([^"]+)"/.exec(m[1]);
      grupper.push({ innhold: m[2], transform: tr ? tr[1] : "" });
      rest = rest.replace(m[0], "");
    }
    grupper.push({ innhold: rest, transform: "" });
    for (const g of grupper) {
      let s = 1, tx = 0, ty = 0;
      const sm = /scale\(([\d.-]+)\)/.exec(g.transform); if (sm) s = Number(sm[1]);
      const tm = /translate\(([\d.-]+)[\s,]+([\d.-]+)\)/.exec(g.transform); if (tm) { tx = Number(tm[1]); ty = Number(tm[2]); }
      for (const pm of g.innhold.matchAll(/<path\b([^>]*)\/?>/g)) {
        const d = /\bd="([^"]+)"/.exec(pm[1]);
        if (!d) continue;
        const fill = /\bfill="([^"]+)"/.exec(pm[1]);
        const farge = fill && fill[1] !== "none" ? fill[1] : standardFarge;
        const til = (px, py) => [x + (s * (px + tx)) * skala, y + (s * (py + ty)) * skala];
        const ops = stiTilPdf(d[1], til);
        if (ops) this.ops.push(`${this.farge(farge)} rg ${ops} f`);
      }
    }
    return vbB * skala;
  }
  /** Hele PDF-fila som bytes */
  bytes() {
    const obj = [];
    const legg = (s) => { obj.push(s); return obj.length; };
    legg("<< /Type /Catalog /Pages 2 0 R >>");
    legg(""); // 2: Pages, fylles under
    const fontR = legg("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const fontB = legg("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const sideIder = [];
    for (const ops of this.sider) {
      const innhold = ops.join("\n");
      const c = legg(`<< /Length ${innhold.length} >>\nstream\n${innhold}\nendstream`);
      sideIder.push(legg(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${tall(A4.b)} ${tall(A4.h)}] /Resources << /Font << /F1 ${fontR} 0 R /F2 ${fontB} 0 R >> >> /Contents ${c} 0 R >>`));
    }
    obj[1] = `<< /Type /Pages /Kids [${sideIder.map((i) => `${i} 0 R`).join(" ")}] /Count ${sideIder.length} >>`;
    let ut = "%PDF-1.4\n%âãÏÓ\n";
    const pos = [];
    obj.forEach((o, i) => { pos.push(ut.length); ut += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = ut.length;
    ut += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n${pos.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("")}`;
    ut += `trailer\n<< /Size ${obj.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    const bytes = new Uint8Array(ut.length);
    for (let i = 0; i < ut.length; i++) bytes[i] = ut.charCodeAt(i) & 255;
    return bytes;
  }
}

/** SVG-sti → PDF-operatorer. Alle segmenter gjøres til linjer og kubiske kurver. */
export function stiTilPdf(d, til) {
  const tok = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tok) return "";
  const ut = [];
  let i = 0, cmd = "", cx = 0, cy = 0, sx = 0, sy = 0, px = 0, py = 0;
  const num = () => Number(tok[i++]);
  const P = (x, y) => { const [a, b] = til(x, y); return `${tall(a)} ${tall(A4.h - b)}`; };
  const m = (x, y) => { ut.push(`${P(x, y)} m`); cx = sx = x; cy = sy = y; px = x; py = y; };
  const l = (x, y) => { ut.push(`${P(x, y)} l`); cx = x; cy = y; px = x; py = y; };
  const c = (x1, y1, x2, y2, x, y) => { ut.push(`${P(x1, y1)} ${P(x2, y2)} ${P(x, y)} c`); px = x2; py = y2; cx = x; cy = y; };
  const q = (x1, y1, x, y) => { c(cx + 2 / 3 * (x1 - cx), cy + 2 / 3 * (y1 - cy), x + 2 / 3 * (x1 - x), y + 2 / 3 * (y1 - y), x, y); px = x1; py = y1; };
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    switch (cmd.toUpperCase()) {
      case "M": { const x = num() + ox, y = num() + oy; m(x, y); cmd = rel ? "l" : "L"; break; }
      case "L": l(num() + ox, num() + oy); break;
      case "H": l(num() + ox, cy); break;
      case "V": l(cx, num() + oy); break;
      case "C": c(num() + ox, num() + oy, num() + ox, num() + oy, num() + ox, num() + oy); break;
      case "S": { const x2 = num() + ox, y2 = num() + oy, x = num() + ox, y = num() + oy; c(2 * cx - px, 2 * cy - py, x2, y2, x, y); break; }
      case "Q": q(num() + ox, num() + oy, num() + ox, num() + oy); break;
      case "T": { const x = num() + ox, y = num() + oy; q(2 * cx - px, 2 * cy - py, x, y); break; }
      case "A": { const rx = num(), ry = num(), rot = num(), stor = num(), sveip = num(), x = num() + ox, y = num() + oy; for (const b of bueTilBezier(cx, cy, rx, ry, rot, stor, sveip, x, y)) c(...b); break; }
      case "Z": ut.push("h"); cx = sx; cy = sy; break;
      default: i++;
    }
  }
  return ut.join(" ");
}

/** SVG-bue (endepunkter) → kubiske bezier-segmenter */
function bueTilBezier(x1, y1, rx, ry, rotGrader, stor, sveip, x2, y2) {
  if (rx === 0 || ry === 0) return [[x1, y1, x2, y2, x2, y2]];
  const rot = (rotGrader * Math.PI) / 180, cos = Math.cos(rot), sin = Math.sin(rot);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const tel = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const nev = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let k = Math.sqrt(Math.max(0, tel / nev));
  if (stor === sveip) k = -k;
  const cxp = (k * rx * y1p) / ry, cyp = (-k * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const vink = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
  const t1 = vink(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = vink((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sveip && dt > 0) dt -= 2 * Math.PI;
  if (sveip && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2)));
  const del = dt / n;
  const ut = [];
  let t = t1;
  for (let i = 0; i < n; i++) {
    const a = (4 / 3) * Math.tan(del / 4);
    const p = (ang) => [cx + cos * rx * Math.cos(ang) - sin * ry * Math.sin(ang), cy + sin * rx * Math.cos(ang) + cos * ry * Math.sin(ang)];
    const d1 = (ang) => [-cos * rx * Math.sin(ang) - sin * ry * Math.cos(ang), -sin * rx * Math.sin(ang) + cos * ry * Math.cos(ang)];
    const [ax, ay] = p(t), [bx, by] = p(t + del), [dax, day] = d1(t), [dbx, dby] = d1(t + del);
    ut.push([ax + a * dax, ay + a * day, bx - a * dbx, by - a * dby, bx, by]);
    t += del;
  }
  return ut;
}

const TALLORD = ["", "én", "to", "tre", "fire", "fem", "seks", "sju", "åtte", "ni", "ti", "elleve", "tolv"];
export const datoNorsk = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : "");

/**
 * Lager tilbudet. data:
 *  { tilbud, linjer, eier, kontakt, leverandor, prisliste: {versjon, binding_mnd, oppsigelse_mnd, viderefakturering_prosent, mva_prosent},
 *    avtalemaler: [{navn, versjon}], erstatter: {versjon, dato}|null, support_timer, linjeNavn, linjeMerknad, eksempel, farger: {...hex}, logoSvg }
 */
export function lagTilbudPdf(data) {
  const { tilbud: t, linjer, eier, kontakt, leverandor: lev, prisliste: pl, farger: F } = data;
  const p = new PdfSkriver();
  const venstre = MARG, hoyre = A4.b - MARG, bredde0 = hoyre - venstre;
  const nyttSideOmNodvendig = (plass) => { if (p.y + plass > A4.h - MARG - 30) p.nySide(); };
  const grunn = 9.5, meta = 8.5;
  const D = F.tekstDempet;

  // 1. Topp: logo og leverandør
  let logoB = 0;
  if (data.logoSvg) logoB = p.svg(data.logoSvg, venstre, p.y, 20, F.tekst);
  else { p.tekst(venstre, p.y + 16, "Hengsel", { fet: true, str: 20, farge: F.tekst }); logoB = 80; }
  if (data.eksempel) {
    const mt = "Eksempel – leverandør og priser er ikke låst";
    const mb = bredde(mt, true, 7.5) + 14;
    p.rundRekt(venstre, p.y + 26, mb, 14, 7, F.varselFlate);
    p.tekst(venstre + 7, p.y + 36, mt, { fet: true, str: 7.5, farge: F.varselTekst });
  }
  let ly = p.y + 8;
  p.tekst(hoyre, ly, "Leverandør", { str: meta, farge: D, juster: "hoyre" }); ly += 12;
  p.tekst(hoyre, ly, lev.navn || "Leverandør ikke satt", { fet: true, str: grunn, farge: F.tekst, juster: "hoyre" }); ly += 12;
  if (lev.orgnr) { p.tekst(hoyre, ly, `Org.nr. ${formatOrgnr(lev.orgnr)}`, { str: grunn, farge: F.tekst, juster: "hoyre" }); ly += 12; }
  if (lev.adresse) { p.tekst(hoyre, ly, lev.adresse, { str: grunn, farge: F.tekst, juster: "hoyre" }); ly += 12; }
  if (lev.epost) { p.tekst(hoyre, ly, lev.epost, { str: grunn, farge: D, juster: "hoyre" }); ly += 12; }
  p.y = Math.max(ly, p.y + 48) + 10;

  // 2. Tittel
  const antall = data.antall_butikker;
  const overskrift = t.overskrift || `${data.linjeNavn} for ${TALLORD[antall] ?? antall} ${antall === 1 ? "butikk" : "butikker"}`;
  p.tekst(venstre, p.y + 8, "Tilbud", { str: meta, farge: D });
  p.tekst(venstre, p.y + 30, overskrift, { fet: true, str: 22, farge: F.tekst });
  let ry = p.y + 6;
  const par = [["Nr.", `${t.nr} v${t.versjon}`, true], ["Dato", datoNorsk(t.dato), false], ["Gyldig til", datoNorsk(t.gyldig_til), true]];
  for (const [n, v, fet] of par) { p.tekst(hoyre - 90, ry, n, { str: meta, farge: D, juster: "hoyre" }); p.tekst(hoyre, ry, v, { fet, str: grunn, farge: F.tekst, juster: "hoyre" }); ry += 11; }
  p.y += 40;
  p.linje(venstre, p.y, hoyre, p.y, F.aksent, 1.5);
  p.y += 14;

  // 3. Til og produktlinje
  const kol2 = venstre + bredde0 / 2;
  let ty = p.y;
  p.tekst(venstre, ty, "Til", { str: meta, farge: D }); ty += 12;
  p.tekst(venstre, ty, eier.navn, { fet: true, str: grunn, farge: F.tekst }); ty += 12;
  if (eier.orgnr) { p.tekst(venstre, ty, `Org.nr. ${formatOrgnr(eier.orgnr)}`, { str: grunn, farge: F.tekst }); ty += 12; }
  const adr = [eier.adresse, [eier.postnr, eier.sted].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  if (adr) { p.tekst(venstre, ty, adr, { str: grunn, farge: F.tekst }); ty += 12; }
  if (kontakt) { p.tekst(venstre, ty, `Att.: ${kontakt.navn}${kontakt.rolle ? `, ${kontakt.rolle}` : ""}`, { str: grunn, farge: F.tekst }); ty += 12; }
  let py = p.y;
  p.tekst(kol2, py, "Produktlinje", { str: meta, farge: D }); py += 12;
  p.tekst(kol2, py, data.linjeNavn, { fet: true, str: grunn, farge: F.tekst }); py += 12;
  if (data.linjeMerknad) { p.tekst(kol2, py, data.linjeMerknad, { str: grunn, farge: F.tekst }); py += 12; }
  p.tekst(kol2, py, `Pakke per butikk · prisliste ${pl.versjon}`, { str: grunn, farge: F.tekst }); py += 12;
  p.y = Math.max(ty, py) + 10;

  // 4. Linjer per måned
  const kB = hoyre - 90, kG = hoyre - 210;
  const hode = () => {
    p.tekst(venstre, p.y + 9, "Per måned", { fet: true, str: meta, farge: D });
    p.tekst(kB, p.y + 9, "Grunnlag", { fet: true, str: meta, farge: D, juster: "hoyre" });
    p.tekst(hoyre, p.y + 9, "Beløp", { fet: true, str: meta, farge: D, juster: "hoyre" });
    p.y += 14; p.linje(venstre, p.y, hoyre, p.y, F.ramme, 0.75); p.y += 2;
  };
  hode();
  const rad = (tittel, grunnlag, belop, under, farge) => {
    nyttSideOmNodvendig(30);
    if (p.y === MARG) hode();
    p.tekst(venstre, p.y + 11, tittel, { fet: true, str: grunn, farge: farge ?? F.tekst });
    p.tekst(kB, p.y + 11, grunnlag, { str: grunn, farge: farge ?? D, juster: "hoyre" });
    p.tekst(hoyre, p.y + 11, belop, { fet: !!farge, str: grunn, farge: farge ?? F.tekst, juster: "hoyre" });
    let h = 15;
    if (under) { p.tekst(venstre, p.y + 22, under, { str: meta, farge: D }); h = 26; }
    p.y += h; p.linje(venstre, p.y, hoyre, p.y, F.linje, 0.5); p.y += 2;
  };
  const perButikk = new Map();
  for (const l of linjer) {
    if (l.type === "pakke") perButikk.set(l.butikk_navn, { pakke: l, ekstra: null });
    if (l.type === "ekstra_brukere" && perButikk.has(l.butikk_navn)) perButikk.get(l.butikk_navn).ekstra = l;
  }
  for (const [navn, { pakke, ekstra }] of perButikk) {
    const pakkeNavn = data.pakkeNavn?.[pakke.pakke] ?? pakke.pakke;
    const grunnlag = ekstra ? `${pakkeNavn} + ${ekstra.antall} ${ekstra.antall === 1 ? "bruker" : "brukere"}` : pakkeNavn;
    const belop = kr(pakke.belop_ore + (ekstra ? ekstra.belop_ore : 0));
    const under = ekstra ? `${pakke.tekst}. ${kr(pakke.belop_ore)} + ${ekstra.antall} × ${kr(ekstra.enhetspris_ore)}` : pakke.tekst;
    rad(navn, grunnlag, belop, under);
  }
  for (const l of linjer.filter((x) => x.type === "ute")) {
    const firma = /firmapris/i.test(l.tekst) && !/billigere/i.test(l.tekst) && !/gjelder ikke/i.test(l.tekst);
    rad("Hengsel Ute", firma ? `Firmapris, ${l.antall} montører` : `${l.antall} ${l.antall === 1 ? "montør" : "montører"} × ${kr(l.enhetspris_ore)}`, kr(l.belop_ore), l.tekst);
  }
  for (const l of linjer.filter((x) => x.type === "rabatt")) {
    const m = /^(Kjederabatt \d+(?:,\d+)? % \(\d+ butikker\)) av (.+)$/.exec(l.tekst);
    rad(m ? m[1] : "Kjederabatt", m ? `av ${m[2]}` : "", kr(l.belop_ore), "Gjelder pakker, ekstra brukere og Ute over", F.ferdig);
  }
  for (const l of linjer.filter((x) => x.type === "tillegg")) {
    const inkludert = l.belop_ore === 0;
    const navn = l.tekst.split(/[:,]/)[0];
    rad(navn, inkludert ? "Inkludert" : "Tillegg", kr(l.belop_ore), inkludert ? `${l.tekst.split(": ")[1] ?? "Inkludert"}. Tillegg får ikke rabatt` : "Uten rabatt");
  }
  p.y += 10;

  // 5–6. Etablering og sum
  nyttSideOmNodvendig(120);
  const boksB = 230, boksX = hoyre - boksB;
  let ey = p.y;
  p.tekst(venstre, ey + 9, "Etablering, engangs, uten rabatt", { fet: true, str: grunn, farge: F.tekst }); ey += 22;
  const ebredde = boksX - 20 - venstre;
  for (const l of linjer.filter((x) => x.type === "etablering")) { p.tekst(venstre, ey, l.tekst, { str: grunn, farge: F.tekst }); p.tekst(venstre + ebredde, ey, kr(l.belop_ore), { str: grunn, farge: F.tekst, juster: "hoyre" }); ey += 12; }
  p.tekst(venstre, ey, `Mva ${tallNorsk(pl.mva_prosent)} %`, { str: grunn, farge: D }); p.tekst(venstre + ebredde, ey, kr(data.etablering_mva_ore), { str: grunn, farge: D, juster: "hoyre" }); ey += 12;
  p.tekst(venstre, ey, "Etablering med mva", { fet: true, str: grunn, farge: F.tekst }); p.tekst(venstre + ebredde, ey, kr(data.etablering_inkl_ore), { fet: true, str: grunn, farge: F.tekst, juster: "hoyre" }); ey += 12;
  for (const s of p.bryt("Oppsett av kundemiljø, import og opplæring. Faktureres ved oppstart.", false, meta, ebredde)) { p.tekst(venstre, ey, s, { str: meta, farge: D }); ey += 11; }
  ey += 6;
  p.tekst(venstre, ey, "Viderefakturert etter bruk", { fet: true, str: grunn, farge: F.tekst }); ey += 12;
  const vf = linjer.find((x) => x.type === "viderefakturering");
  for (const s of p.bryt(vf ? vf.tekst : `SMS, Penneo og AI faktureres etter bruk til kostpris + ${tallNorsk(pl.viderefakturering_prosent)} %, uten rabatt.`, false, meta, ebredde)) { p.tekst(venstre, ey, s, { str: meta, farge: D }); ey += 11; }

  const sumRader = [
    ["Per måned uten mva", kr(t.sum_mnd_ore), true, F.tekst], [`Mva ${tallNorsk(pl.mva_prosent)} %`, kr(t.mva_mnd_ore), false, D], ["Per måned med mva", kr(t.sum_mnd_ore + t.mva_mnd_ore), true, F.tekst],
    ["Per år uten mva", kr(data.aar_ore), false, D], [`Mva ${tallNorsk(pl.mva_prosent)} %`, kr(data.aar_mva_ore), false, D], ["Per år med mva", kr(data.aar_ore + data.aar_mva_ore), false, F.tekst],
  ];
  const boksH = 14 + sumRader.length * 13 + 6;
  p.rundRekt(boksX, p.y, boksB, boksH, 6, F.flateSenket);
  let sy = p.y + 15;
  sumRader.forEach(([n, v, fet, farge], i) => {
    p.tekst(boksX + 12, sy, n, { fet, str: grunn, farge });
    p.tekst(boksX + boksB - 12, sy, v, { fet, str: grunn, farge, juster: "hoyre" });
    if (i === 2) { p.linje(boksX + 12, sy + 5, boksX + boksB - 12, sy + 5, F.ramme, 0.5); sy += 4; }
    sy += 13;
  });
  p.y = Math.max(ey, p.y + boksH) + 14;

  // 7. Vilkår
  nyttSideOmNodvendig(90);
  p.tekst(venstre, p.y + 9, "Vilkår", { fet: true, str: grunn, farge: F.tekst }); p.y += 20;
  const vilkar = `Bindingstid ${pl.binding_mnd} måneder fra oppstart, deretter fornyelse med ${pl.binding_mnd} måneder om gangen. Oppsigelsesfrist ${pl.oppsigelse_mnd} måneder. Prisene justeres årlig etter KPI. Månedsbeløpet faktureres forskuddsvis. Alle priser er oppgitt uten mva. Kjederabatten følger antall butikker hos eieren. Support inkludert første år: ${data.support_timer} timer per måned til sammen.`;
  for (const s of p.bryt(vilkar, false, grunn, bredde0)) { nyttSideOmNodvendig(12); p.tekst(venstre, p.y, s, { str: grunn, farge: F.tekst }); p.y += 12; }
  const maler = (data.avtalemaler ?? []).map((m) => `${m.navn.toLowerCase().startsWith("supportnivå") ? m.navn.replace(/^Supportnivå\s*/i, "supportnivå ") : m.navn.toLowerCase()} (mal ${m.versjon})`);
  const avtaleTekst = `Ved aksept lages ${maler.length ? maler.join(", ").replace(/, ([^,]*)$/, " og $1") : "kundeavtale, databehandleravtale og supportnivå"}. Signering i Penneo: først ${eier.navn} (signaturrett), deretter leverandøren.`;
  for (const s of p.bryt(avtaleTekst, false, grunn, bredde0)) { nyttSideOmNodvendig(12); p.tekst(venstre, p.y, s, { str: grunn, farge: D }); p.y += 12; }

  // 8. Bunntekst på hver side
  const antallSider = p.sider.length;
  const erst = data.erstatter ? ` · erstatter versjon ${data.erstatter.versjon} av ${datoNorsk(data.erstatter.dato)}` : "";
  p.sider.forEach((ops, i) => {
    p.ops = ops;
    const by = A4.h - MARG + 4;
    p.linje(venstre, by - 12, hoyre, by - 12, F.ramme, 0.5);
    p.tekst(venstre, by, `${t.nr} versjon ${t.versjon} · prisliste ${pl.versjon}${erst} · leverandør fra Innstillinger › Leverandør`, { str: 8, farge: D });
    p.tekst(hoyre, by, `Side ${i + 1} av ${antallSider}`, { str: 8, farge: D, juster: "hoyre" });
  });
  return p.bytes();
}

export const formatOrgnr = (s) => (s && /^\d{9}$/.test(s) ? `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}` : s ?? "");
const tallNorsk = (n) => String(n).replace(".", ",");
