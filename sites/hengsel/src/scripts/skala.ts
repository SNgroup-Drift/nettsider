/**
 * Skalerer innhold som er tegnet i naturlig størrelse (CRM-skjermene, portalen) til skjermen i en enhetsramme.
 * Setter --k (skjermbredde / naturlig bredde), --nw, --nh og --inset på [data-skala] via CSSOM (CSP tillater ikke style-attributter i HTML).
 */
const els = document.querySelectorAll<HTMLElement>("[data-skala]");
const mal = (el: HTMLElement) => {
  const nw = Number(el.dataset.nw) || 1;
  if (!el.clientWidth) return;
  el.style.setProperty("--k", String(el.clientWidth / nw));
};
const ro = new ResizeObserver((rader) => rader.forEach((r) => mal(r.target as HTMLElement)));
els.forEach((el) => {
  el.style.setProperty("--nw", el.dataset.nw ?? "0");
  el.style.setProperty("--nh", el.dataset.nh ?? "0");
  el.style.setProperty("--inset", el.dataset.inset ?? "0");
  mal(el);
  ro.observe(el);
});
