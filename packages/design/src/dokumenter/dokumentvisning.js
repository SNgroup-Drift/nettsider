/**
 * Dokumentvisning: dokumentvelger (faner), bla side for side, innholdsliste og lysboks. Vanlig JavaScript, ingen avhengigheter.
 * Brukes av hengsel.no (Astro bundler den) og Visningsrommet (kopieres til dist/assets/dokumentvisning.js).
 *
 * Markeringen kommer fra Dokumentvisning (hengsel.no) og render.js (Visningsrommet): [data-dokvisning] med faner (role="tab", data-dok),
 * paneler ([data-panel]; de andre dokumentene ligger i en <template> som settes inn første gang de velges),
 * [data-ark] med [data-side] (bare den viste er synlig), [data-forrige], [data-neste], [data-gaa=«n»], [data-apne], [data-teller]
 * og <dialog data-lysboks>.
 *
 * Bla: knappene, ← og → når arket eller knappene har fokus, sveip til sidene på berøringsskjerm (også i lysboksen).
 * Lysboksen er en modal <dialog>: resten av siden er inert, Tab går rundt i dialogen, Esc lukker, ← og → blar,
 * og fokus går tilbake til knappen som åpnet den. Siden i lysboksen er en kopi av den viste A4-siden.
 */

/** Sveip: kaller `side(±1)` når fingeren går mer enn 48 px sidelengs og tydelig mer sidelengs enn loddrett. */
function sveip(el, side) {
  let x0 = 0, y0 = 0, aktiv = false;
  el.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { aktiv = false; return; }
    aktiv = true;
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener("touchend", (e) => {
    if (!aktiv) return;
    aktiv = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) side(dx < 0 ? 1 : -1);
  }, { passive: true });
}

for (const rot of document.querySelectorAll("[data-dokvisning]")) {
  const faner = [...rot.querySelectorAll('[role="tab"]')];
  const paneler = new Map();
  const lys = rot.querySelector("[data-lysboks]");
  const lysTittel = lys.querySelector("[data-lys-tittel]");
  const lysTeller = lys.querySelector("[data-lys-teller]");
  const lysSide = lys.querySelector("[data-lys-side]");
  const lysForrige = lys.querySelector("[data-lys-forrige]");
  const lysNeste = lys.querySelector("[data-lys-neste]");
  const lysLukk = lys.querySelector("[data-lukk]");
  let aktivt = null;
  let utloser = null;

  function bind(el) {
    const sider = [...el.querySelectorAll("[data-side]")];
    const lenker = [...el.querySelectorAll("[data-gaa]")];
    const forrige = el.querySelector("[data-forrige]");
    const neste = el.querySelector("[data-neste]");
    const teller = el.querySelector("[data-teller]");
    const p = {
      el,
      side: 0,
      sett(n) {
        p.side = Math.max(0, Math.min(sider.length - 1, n));
        sider.forEach((s, i) => (s.hidden = i !== p.side));
        lenker.forEach((l, i) => (i === p.side ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current")));
        forrige.disabled = p.side === 0;
        neste.disabled = p.side >= sider.length - 1;
        teller.textContent = `Side ${p.side + 1} av ${sider.length}`;
        if (lys.open && aktivt === p) visILys();
      },
    };
    forrige.addEventListener("click", () => p.sett(p.side - 1));
    neste.addEventListener("click", () => p.sett(p.side + 1));
    lenker.forEach((l, i) => l.addEventListener("click", () => p.sett(i)));
    el.querySelectorAll("[data-apne]").forEach((b) => b.addEventListener("click", () => apne(p, b)));
    // Tastatur: ← og → blar når fokus er på arket eller på bla-knappene (ikke i innholdslisten eller andre felt)
    const kol = el.querySelector(".dv-ark-kol") ?? el;
    kol.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); p.sett(p.side + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); p.sett(p.side - 1); }
    });
    const ark = el.querySelector("[data-ark]");
    if (ark) sveip(ark, (d) => p.sett(p.side + d));
    return p;
  }

  function panelFor(id) {
    let p = paneler.get(id);
    if (p) return p;
    const el = rot.querySelector(`[data-panel="${id}"]`);
    const mal = el.querySelector("template");
    if (mal) {
      el.append(mal.content.cloneNode(true));
      mal.remove();
    }
    p = bind(el);
    paneler.set(id, p);
    return p;
  }

  function velg(i, fokus = false) {
    const n = faner.length;
    i = (i + n) % n;
    faner.forEach((f, k) => {
      const valgt = k === i;
      f.setAttribute("aria-selected", String(valgt));
      f.tabIndex = valgt ? 0 : -1;
      const el = rot.querySelector(`[data-panel="${f.dataset.dok}"]`);
      if (valgt) {
        aktivt = panelFor(f.dataset.dok);
        el.hidden = false;
      } else el.hidden = true;
    });
    if (fokus) faner[i].focus();
    if (!fokus && history.replaceState && rot.hasAttribute("data-hash")) history.replaceState(null, "", "#" + faner[i].dataset.dok);
  }
  faner.forEach((f, i) => {
    f.addEventListener("click", () => velg(i));
    f.addEventListener("keydown", (e) => {
      const hopp = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: faner.length - 1 };
      if (e.key in hopp) {
        e.preventDefault();
        velg(hopp[e.key], true);
      }
    });
  });
  const start = Math.max(0, faner.findIndex((f) => f.getAttribute("aria-selected") === "true"));
  aktivt = panelFor(faner[start].dataset.dok);
  // Visningsrommet: #id i adressen åpner det dokumentet (lenker fra andre rom)
  if (rot.hasAttribute("data-hash")) {
    const fraHash = faner.findIndex((f) => "#" + f.dataset.dok === location.hash);
    if (fraHash >= 0) velg(fraHash);
    addEventListener("hashchange", () => {
      const k = faner.findIndex((f) => "#" + f.dataset.dok === location.hash);
      if (k >= 0) velg(k);
    });
  }

  // Lysboks
  function visILys() {
    const p = aktivt;
    const sider = p.el.querySelectorAll("[data-side]");
    const kopi = sider[p.side].querySelector(".a4").cloneNode(true);
    kopi.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
    lysSide.replaceChildren(kopi);
    lysSide.scrollTo(0, 0);
    const tittel = p.el.querySelector("[data-dok-tittel]")?.textContent ?? "";
    lysTittel.textContent = tittel;
    lys.setAttribute("aria-label", `${tittel} i lysboks`);
    lysTeller.textContent = `Side ${p.side + 1} av ${sider.length}`;
    lysForrige.disabled = p.side === 0;
    lysNeste.disabled = p.side >= sider.length - 1;
    const aktiv = document.activeElement;
    if (aktiv instanceof HTMLButtonElement && aktiv.disabled && lys.contains(aktiv)) (aktiv === lysNeste ? lysForrige : lysNeste).focus();
  }
  function apne(p, fra) {
    aktivt = p;
    utloser = fra;
    visILys();
    lys.showModal();
    lysLukk.focus();
  }
  lysForrige.addEventListener("click", () => aktivt.sett(aktivt.side - 1));
  lysNeste.addEventListener("click", () => aktivt.sett(aktivt.side + 1));
  lysLukk.addEventListener("click", () => lys.close());
  sveip(lys, (d) => aktivt.sett(aktivt.side + d));
  // Klikk på bakgrunnen (utenfor arket og knappene) lukker
  lys.addEventListener("click", (e) => {
    const t = e.target;
    if (t === lys || t === lysSide || t.classList.contains("lys-scene")) lys.close();
  });
  lys.addEventListener("close", () => {
    lysSide.replaceChildren();
    utloser?.focus();
    utloser = null;
  });
  lys.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); aktivt.sett(aktivt.side + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); aktivt.sett(aktivt.side - 1); }
    else if (e.key === "Tab") {
      // Fokusfelle: Tab og Shift+Tab går rundt blant knappene i lysboksen
      const k = [...lys.querySelectorAll("button:not(:disabled)")];
      if (!k.length) return;
      const forst = k[0], sist = k[k.length - 1];
      if (e.shiftKey && document.activeElement === forst) { e.preventDefault(); sist.focus(); }
      else if (!e.shiftKey && document.activeElement === sist) { e.preventDefault(); forst.focus(); }
    }
  });
}
