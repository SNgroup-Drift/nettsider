/**
 * Ny forside (prøveside): på telefon er stegene i ordrerekka (components/Ordrerekke.astro) en vannrett rekke som kan sveipes. Når steget byttes
 * (av scripts/simulering.ts eller ved trykk), rulles rekka sidelengs så det aktive steget er synlig. Bare scrollLeft settes, aldri siden loddrett
 * eller stil (CSP). Ved prefers-reduced-motion rulles det uten animasjon.
 */
const rolig = matchMedia("(prefers-reduced-motion: reduce)");
for (const rekke of document.querySelectorAll<HTMLElement>("[data-ordrerekke]")) {
  const folg = () => {
    if (rekke.scrollWidth <= rekke.clientWidth) return;
    const aktiv = rekke.querySelector<HTMLElement>('[data-merke][aria-pressed="true"]');
    if (!aktiv) return;
    const venstre = aktiv.offsetLeft - (rekke.clientWidth - aktiv.offsetWidth) / 2;
    rekke.scrollTo({ left: Math.max(0, venstre), behavior: rolig.matches ? "auto" : "smooth" });
  };
  new MutationObserver(folg).observe(rekke, { subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
}
