/**
 * Dokumentvisning: dokumentvelger (faner), bla side for side, innholdsliste og lysboks. Vanlig TypeScript, ingen avhengigheter.
 *
 * Markeringen kommer fra components/dokumenter/Dokumentvisning.astro: [data-dokvisning] med faner (role="tab", data-dok),
 * paneler ([data-panel]; de andre dokumentene ligger i en <template> som settes inn første gang de velges),
 * [data-side] (sidene, bare den viste er synlig), [data-forrige], [data-neste], [data-gaa=«n»], [data-apne], [data-teller]
 * og <dialog data-lysboks>.
 *
 * Lysboksen er en modal <dialog>: resten av siden er inert, Tab går rundt i dialogen, Esc lukker, ← og → blar,
 * og fokus går tilbake til knappen som åpnet den. Siden i lysboksen er en kopi av den viste A4-siden.
 */
interface Panel {
  el: HTMLElement;
  side: number;
  sett: (n: number) => void;
}

for (const rot of document.querySelectorAll<HTMLElement>("[data-dokvisning]")) {
  const faner = [...rot.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const paneler = new Map<string, Panel>();
  const lys = rot.querySelector<HTMLDialogElement>("[data-lysboks]")!;
  const lysTittel = lys.querySelector<HTMLElement>("[data-lys-tittel]")!;
  const lysTeller = lys.querySelector<HTMLElement>("[data-lys-teller]")!;
  const lysSide = lys.querySelector<HTMLElement>("[data-lys-side]")!;
  const lysForrige = lys.querySelector<HTMLButtonElement>("[data-lys-forrige]")!;
  const lysNeste = lys.querySelector<HTMLButtonElement>("[data-lys-neste]")!;
  const lysLukk = lys.querySelector<HTMLButtonElement>("[data-lukk]")!;
  let aktivt: Panel | null = null;
  let utloser: HTMLElement | null = null;

  const bind = (el: HTMLElement): Panel => {
    const sider = [...el.querySelectorAll<HTMLElement>("[data-side]")];
    const lenker = [...el.querySelectorAll<HTMLButtonElement>("[data-gaa]")];
    const forrige = el.querySelector<HTMLButtonElement>("[data-forrige]")!;
    const neste = el.querySelector<HTMLButtonElement>("[data-neste]")!;
    const teller = el.querySelector<HTMLElement>("[data-teller]")!;
    const p: Panel = {
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
    el.querySelectorAll<HTMLElement>("[data-apne]").forEach((b) => b.addEventListener("click", () => apne(p, b)));
    return p;
  };

  const panelFor = (id: string): Panel => {
    let p = paneler.get(id);
    if (p) return p;
    const el = rot.querySelector<HTMLElement>(`[data-panel="${id}"]`)!;
    const mal = el.querySelector("template");
    if (mal) {
      el.append(mal.content.cloneNode(true));
      mal.remove();
    }
    p = bind(el);
    paneler.set(id, p);
    return p;
  };

  const velg = (i: number, fokus = false) => {
    const n = faner.length;
    i = (i + n) % n;
    faner.forEach((f, k) => {
      const valgt = k === i;
      f.setAttribute("aria-selected", String(valgt));
      f.tabIndex = valgt ? 0 : -1;
      const el = rot.querySelector<HTMLElement>(`[data-panel="${f.dataset.dok}"]`)!;
      if (valgt) {
        aktivt = panelFor(f.dataset.dok!);
        el.hidden = false;
      } else el.hidden = true;
    });
    if (fokus) faner[i].focus();
  };
  faner.forEach((f, i) => {
    f.addEventListener("click", () => velg(i));
    f.addEventListener("keydown", (e) => {
      const hopp: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: faner.length - 1 };
      if (e.key in hopp) {
        e.preventDefault();
        velg(hopp[e.key], true);
      }
    });
  });
  const start = Math.max(0, faner.findIndex((f) => f.getAttribute("aria-selected") === "true"));
  aktivt = panelFor(faner[start].dataset.dok!);

  // Lysboks
  function visILys() {
    const p = aktivt!;
    const sider = p.el.querySelectorAll<HTMLElement>("[data-side]");
    const kopi = sider[p.side].querySelector(".a4")!.cloneNode(true) as HTMLElement;
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
  function apne(p: Panel, fra: HTMLElement) {
    aktivt = p;
    utloser = fra;
    visILys();
    lys.showModal();
    lysLukk.focus();
  }
  lysForrige.addEventListener("click", () => aktivt!.sett(aktivt!.side - 1));
  lysNeste.addEventListener("click", () => aktivt!.sett(aktivt!.side + 1));
  lysLukk.addEventListener("click", () => lys.close());
  // Klikk på bakgrunnen (utenfor arket og knappene) lukker
  lys.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t === lys || t === lysSide || t.classList.contains("lys-scene")) lys.close();
  });
  lys.addEventListener("close", () => {
    lysSide.replaceChildren();
    utloser?.focus();
    utloser = null;
  });
  lys.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); aktivt!.sett(aktivt!.side + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); aktivt!.sett(aktivt!.side - 1); }
    else if (e.key === "Tab") {
      // Fokusfelle: Tab og Shift+Tab går rundt blant knappene i lysboksen
      const k = [...lys.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
      if (!k.length) return;
      const forst = k[0], sist = k[k.length - 1];
      if (e.shiftKey && document.activeElement === forst) { e.preventDefault(); sist.focus(); }
      else if (!e.shiftKey && document.activeElement === sist) { e.preventDefault(); forst.focus(); }
    }
  });
}
