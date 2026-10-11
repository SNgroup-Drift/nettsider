/**
 * «Ordrens reise» på /slik-virker-det: åtte scener som ARIA-faner (piltaster, Home, End).
 * Uten skript står alle scenene som en vanlig liste (fanelinjen og Forrige/Neste er skjult fra bygget).
 * Med skript vises én scene om gangen. Fasit: Slik-virker-det.dc.html.
 */
const rot = document.querySelector<HTMLElement>("[data-slik]");
if (rot) {
  rot.classList.add("js");
  const faner = [...rot.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const paneler = [...rot.querySelectorAll<HTMLElement>("[data-scene]")];
  const n = faner.length;
  let aktiv = 0;

  paneler.forEach((p, k) => {
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", faner[k].id);
  });

  const velg = (i: number, fokus = false) => {
    aktiv = Math.min(n - 1, Math.max(0, i));
    faner.forEach((f, k) => {
      f.setAttribute("aria-selected", String(k === aktiv));
      f.tabIndex = k === aktiv ? 0 : -1;
      paneler[k].hidden = k !== aktiv;
    });
    if (fokus) faner[aktiv].focus();
  };

  faner.forEach((f, i) => {
    f.addEventListener("click", () => velg(i));
    f.addEventListener("keydown", (e) => {
      const hopp: Record<string, number> = { ArrowRight: aktiv + 1, ArrowDown: aktiv + 1, ArrowLeft: aktiv - 1, ArrowUp: aktiv - 1, Home: 0, End: n - 1 };
      if (e.key in hopp) { e.preventDefault(); velg((hopp[e.key] + n) % n, true); }
    });
  });
  for (const b of rot.querySelectorAll("[data-forrige]")) b.addEventListener("click", () => velg(aktiv - 1));
  for (const b of rot.querySelectorAll("[data-neste]")) b.addEventListener("click", () => velg(aktiv + 1));
  velg(0);
}
