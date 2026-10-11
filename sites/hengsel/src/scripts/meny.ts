/** Menypanelet under 1180 px: ≡ åpner og lukker, Escape og valg av et punkt lukker. Uten skript står «Be om demo» og logoen likevel. */
const knapp = document.querySelector<HTMLButtonElement>("[data-burger]");
const panel = document.querySelector<HTMLElement>("[data-panel]");
if (knapp && panel) {
  const sett = (apen: boolean) => {
    panel.hidden = !apen;
    knapp.setAttribute("aria-expanded", String(apen));
  };
  knapp.addEventListener("click", () => sett(panel.hidden));
  panel.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) sett(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { sett(false); knapp.focus(); } });
  matchMedia("(min-width: 1181px)").addEventListener("change", (m) => { if (m.matches) sett(false); });
}
