/**
 * /ute: steg-fanene. Én tablist [data-ute] (knapper role="tab", aria-controls → panelet), paneler [data-panel],
 * og Forrige/Neste ([data-forrige], [data-neste]) med teller [data-teller].
 * Uten skript står steg 1 åpent (de andre panelene har hidden fra bygget). Piltaster (opp/ned/venstre/høyre), Home og End
 * flytter mellom stegene, som i WAI-ARIA-mønsteret for faner. Alle paneler har samme ramme, så stegbytte gir ingen layoutskift.
 */
const liste = document.querySelector<HTMLElement>("[data-ute]");
if (liste) {
  const faner = [...liste.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const paneler = faner.map((f) => document.getElementById(f.getAttribute("aria-controls") ?? "")!);
  const forrige = document.querySelector<HTMLButtonElement>("[data-forrige]");
  const neste = document.querySelector<HTMLButtonElement>("[data-neste]");
  const teller = document.querySelector<HTMLElement>("[data-teller]");
  const n = faner.length;
  let aktiv = Math.max(0, faner.findIndex((f) => f.getAttribute("aria-selected") === "true"));

  const velg = (i: number, fokus = false) => {
    aktiv = Math.min(n - 1, Math.max(0, i));
    faner.forEach((f, k) => {
      const valgt = k === aktiv;
      f.setAttribute("aria-selected", String(valgt));
      f.tabIndex = valgt ? 0 : -1;
      paneler[k].hidden = !valgt;
    });
    if (forrige) forrige.disabled = aktiv === 0;
    if (neste) neste.disabled = aktiv === n - 1;
    if (teller) teller.textContent = `${aktiv + 1} av ${n}`;
    if (fokus) faner[aktiv].focus();
  };

  faner.forEach((f, i) => {
    f.addEventListener("click", () => velg(i));
    f.addEventListener("keydown", (e) => {
      const hopp: Record<string, number> = {
        ArrowDown: aktiv + 1, ArrowRight: aktiv + 1, ArrowUp: aktiv - 1, ArrowLeft: aktiv - 1, Home: 0, End: n - 1,
      };
      if (e.key in hopp) { e.preventDefault(); velg(hopp[e.key], true); }
    });
  });
  forrige?.addEventListener("click", () => velg(aktiv - 1));
  neste?.addEventListener("click", () => velg(aktiv + 1));
  velg(aktiv);
}
