/**
 * Ny forside (prøveside): tidslinjen «En dag i butikken» (components/Tidslinje.astro). Faner etter ARIA-mønsteret: klikk, piltaster, Home og End.
 * Uten skript står alle panelene som en liste; skriptet setter klassen «klar» og skjuler de andre panelene med hidden. Ingen stil settes herfra (CSP).
 */
for (const rot of document.querySelectorAll<HTMLElement>("[data-tidslinje]")) {
  const faner = [...rot.querySelectorAll<HTMLButtonElement>("[data-fane]")];
  const paneler = [...rot.querySelectorAll<HTMLElement>("[data-panel]")];
  if (faner.length < 2 || faner.length !== paneler.length) continue;

  const velg = (i: number, fokus = false) => {
    faner.forEach((f, j) => {
      const valgt = j === i;
      f.classList.toggle("aktiv", valgt);
      f.setAttribute("aria-selected", valgt ? "true" : "false");
      f.tabIndex = valgt ? 0 : -1;
      paneler[j].hidden = !valgt;
    });
    if (fokus) {
      faner[i].focus();
      faner[i].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  faner.forEach((f, i) => {
    f.addEventListener("click", () => velg(i));
    f.addEventListener("keydown", (e) => {
      const n = faner.length;
      const til = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }[e.key];
      if (til === undefined) return;
      e.preventDefault();
      velg((til + n) % n, true);
    });
  });
  rot.classList.add("klar");
  velg(0);
}
