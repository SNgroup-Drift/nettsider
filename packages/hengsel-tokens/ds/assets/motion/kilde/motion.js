// Ute-motion, furu. Tegner ett bilde ved tid t (sekunder). Brukes av koderen i run_script.
const MOTION = globalThis.MOTION = {};
MOTION.VARIGHET = 10;
const C = { side: '#F6F8FB', ikon: '#EFF1F3', blekk: '#1D2430', furu: '#068472', tekst: '#1A1D22', aksentTekst: '#016D5E', hvit: '#FFFFFF' };
const M = {
  venstre: new Path2D('M325.52 186.4H377.52A74 74 0 0 1 451.52 260.4V379.62A155.4 155.4 0 0 0 451.52 644.38V763.6A74 74 0 0 1 377.52 837.6H325.52A74 74 0 0 1 251.52 763.6V260.4A74 74 0 0 1 325.52 186.4Z'),
  hoyre: new Path2D('M688.32 186.4H698.48A74 74 0 0 1 772.48 260.4V763.6A74 74 0 0 1 698.48 837.6H688.32A74 74 0 0 1 614.32 763.6V644.38A155.4 155.4 0 0 0 614.32 379.62V260.4A74 74 0 0 1 688.32 186.4Z'),
  sx: 532.92, sy: 512, sr: 111
};
const kl = x => Math.max(0, Math.min(1, x));
const ut = x => 1 - Math.pow(1 - x, 3);
const inut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const fase = (t, a, d, e = inut) => e(kl((t - a) / d));
// Ikon fra SVG-innhold til liste av { p: Path2D, fyll }
MOTION.ikon = inn => {
  const ut2 = [];
  inn.replace(/<(path|rect|circle)([^>]*)>/g, (_, tag, a) => {
    const g = n => { const m = a.match(new RegExp(n + '="([^"]+)"')); return m ? m[1] : null; };
    const fyll = /fill="currentColor"/.test(a);
    let p;
    if (tag === 'path') p = new Path2D(g('d'));
    if (tag === 'circle') { p = new Path2D(); p.arc(+g('cx'), +g('cy'), +g('r'), 0, Math.PI * 2); }
    if (tag === 'rect') { p = new Path2D(); p.roundRect(+g('x'), +g('y'), +g('width'), +g('height'), +(g('rx') || 0)); }
    ut2.push({ p, fyll, sw: g('stroke-width') });
  });
  return ut2;
};
MOTION.punkter = [
  { ikon: 'min-dag', tekst: 'Dagens jobber' },
  { ikon: 'ordre', tekst: 'Sjekkliste og avvik' },
  { ikon: 'signert', tekst: 'Signert hos kunden' }
];
MOTION.tegn = (ctx, t, W, H, ikoner) => {
  const S = Math.min(W, H) / 1080, cx = W / 2, cy = H / 2;
  const T = 400 * S, tcy = cy - 70 * S, tx = cx - T / 2, ty = tcy - T / 2, k = T / 1024;
  const dekk = Math.hypot(W, H);
  // faser
  const ut1 = fase(t, 1.0, 0.8), inn1 = fase(t, 7.4, 0.8);
  const blad = ut1 * (1 - inn1);           // 0 = på plass, 1 = ute av bildet
  const v1 = fase(t, 1.5, 0.8), v2 = fase(t, 6.9, 0.8);
  const vekst = v1 * (1 - v2);             // 0 = stift, 1 = fyller bildet
  const tekstA = (1 - kl((t - 0.8) / 0.35)) + kl((t - 8.2) / 0.5);
  // bakgrunn
  ctx.fillStyle = C.side; ctx.fillRect(0, 0, W, H);
  // flis
  const flisA = 1 - blad;
  if (flisA > 0.001) {
    ctx.save(); ctx.globalAlpha = flisA; ctx.shadowColor = 'rgba(26,29,34,.16)'; ctx.shadowBlur = 44 * S; ctx.shadowOffsetY = 18 * S;
    ctx.fillStyle = C.ikon; ctx.beginPath(); ctx.roundRect(tx, ty, T, T, T * 0.225); ctx.fill(); ctx.restore();
  }
  // blader
  const dy = blad * (H * 0.75);
  ctx.save(); ctx.fillStyle = C.blekk;
  ctx.save(); ctx.translate(tx, ty - dy); ctx.scale(k, k); ctx.fill(M.venstre); ctx.restore();
  ctx.save(); ctx.translate(tx, ty + dy); ctx.scale(k, k); ctx.fill(M.hoyre); ctx.restore();
  ctx.restore();
  // stift / furu-flate
  const sx0 = tx + M.sx * k, sy0 = ty + M.sy * k, r0 = M.sr * k;
  const scx = sx0 + (cx - sx0) * vekst, scy = sy0 + (cy - sy0) * vekst, r = r0 + (dekk - r0) * vekst;
  ctx.fillStyle = C.furu; ctx.beginPath(); ctx.arc(scx, scy, r, 0, Math.PI * 2); ctx.fill();
  // punkter
  const radH = 150 * S, topp = cy - radH * 1.5 + radH * 0.5, x0 = cx - 330 * S;
  MOTION.punkter.forEach((p, i) => {
    const a = fase(t, 2.4 + i * 1.2, 0.55, ut) * (1 - fase(t, 6.4, 0.45));
    if (a <= 0.001) return;
    const y = topp + i * radH + (1 - a) * 36 * S;
    ctx.save(); ctx.globalAlpha = a;
    const d = 104 * S, ic = { x: x0 + d / 2, y };
    ctx.strokeStyle = C.hvit; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(ic.x, ic.y, d / 2, 0, Math.PI * 2); ctx.stroke();
    const isz = 52 * S, ik = isz / 20;
    ctx.save(); ctx.translate(ic.x - isz / 2, ic.y - isz / 2); ctx.scale(ik, ik);
    ctx.strokeStyle = C.hvit; ctx.fillStyle = C.hvit; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const e of ikoner[p.ikon]) { if (e.fyll) ctx.fill(e.p); else { ctx.lineWidth = e.sw ? +e.sw : 1.6; ctx.stroke(e.p); } }
    ctx.restore();
    ctx.fillStyle = C.hvit; ctx.font = `700 ${58 * S}px SG`; ctx.letterSpacing = `${-0.02 * 58 * S}px`; ctx.textBaseline = 'middle';
    ctx.fillText(p.tekst, x0 + d + 36 * S, y + 2 * S);
    ctx.restore();
  });
  // tekst under flisen
  const ta = kl(tekstA);
  if (ta > 0.001 && vekst < 0.02) {
    ctx.save(); ctx.globalAlpha = ta; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.tekst; ctx.font = `700 ${76 * S}px SG`; ctx.letterSpacing = `${-0.02 * 76 * S}px`;
    ctx.fillText('Hengsel Ute', cx, tcy + T / 2 + 130 * S);
    const ua = t < 2 ? 0 : kl((t - 8.6) / 0.5);
    if (ua > 0) { ctx.globalAlpha = ta * ua; ctx.fillStyle = C.aksentTekst; ctx.font = `600 ${36 * S}px SG`; ctx.letterSpacing = '0px'; ctx.fillText('hengsel.no', cx, tcy + T / 2 + 200 * S); }
    ctx.restore();
  }
};
