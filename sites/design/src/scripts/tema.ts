/** Bryteren Auto / Lys / Mørk i menyen: setter data-theme på <html> (designsystemets tokens.css), uten lagring. Auto følger systemet. */
const knapper = [...document.querySelectorAll<HTMLButtonElement>("[data-valg]")];
const sett = (valg: string) => {
  if (valg === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", valg);
  for (const k of knapper) k.setAttribute("aria-pressed", String(k.dataset.valg === valg));
};
for (const k of knapper) k.addEventListener("click", () => sett(k.dataset.valg ?? "auto"));
// Adressen kan låse utgaven (?tema=lys eller ?tema=mork), som i designfilene
const t = new URLSearchParams(location.search).get("tema");
if (t === "lys" || t === "mork") sett(t === "lys" ? "light" : "dark");
