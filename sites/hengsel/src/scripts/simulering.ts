/**
 * N-6: simuleringene (Simulering.astro, TreEnheter.astro). Bytter mellom bildene i rammen med myk overgang (CSS) ca. hvert 3,5 s, bare mens rammen er
 * synlig (IntersectionObserver). Stegmerkene under rammen kan trykkes. Med prefers-reduced-motion går den ikke av seg selv: første bilde står, og
 * merkene bytter for hånd. Uten skript står første bilde. Bare klasser og attributter settes; ingen stil settes herfra (CSP).
 * En enhet = en [data-simulering] alene, eller en [data-sim-gruppe] med flere (TreEnheter): gruppen bytter i takt og deler stegmerkene.
 */
const INTERVALL = 3500;
const rolig = matchMedia("(prefers-reduced-motion: reduce)");

for (const rot of document.querySelectorAll<HTMLElement>("[data-sim-gruppe], [data-simulering]:not([data-sim-gruppe] [data-simulering])")) {
  const sims = rot.matches("[data-simulering]") ? [rot] : [...rot.querySelectorAll<HTMLElement>("[data-simulering]")];
  const serier = sims.map((s) => [...s.querySelectorAll<HTMLElement>("[data-steg]")]);
  const merker = [...rot.querySelectorAll<HTMLButtonElement>("[data-merke]")];
  const antall = Math.max(merker.length, ...serier.map((s) => s.length));
  if (antall < 2) continue;
  let nå = 0;
  let timer = 0;
  let synlig = false;

  const vis = (i: number) => {
    nå = ((i % antall) + antall) % antall;
    serier.forEach((steg) => {
      if (!steg.length) return;
      const k = nå % steg.length;
      steg.forEach((el, j) => {
        el.classList.toggle("aktiv", j === k);
        el.setAttribute("aria-hidden", j === k ? "false" : "true");
      });
    });
    merker.forEach((m, j) => {
      m.classList.toggle("aktiv", j === nå);
      m.setAttribute("aria-pressed", j === nå ? "true" : "false");
    });
  };
  const stopp = () => { window.clearInterval(timer); timer = 0; };
  const start = () => {
    stopp();
    if (synlig && !rolig.matches && !document.hidden) timer = window.setInterval(() => vis(nå + 1), INTERVALL);
  };
  // Resten av bildene er lazy: når rammen er synlig, hentes de, så ingen steg er blanke ved første bytte
  const hentAlle = () => rot.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => { img.loading = "eager"; });

  merker.forEach((m, j) => m.addEventListener("click", () => { vis(j); start(); }));
  new IntersectionObserver((rader) => {
    synlig = rader.some((r) => r.isIntersecting);
    if (synlig) hentAlle();
    start();
  }, { threshold: 0.35 }).observe(rot);
  rolig.addEventListener("change", start);
  document.addEventListener("visibilitychange", start);
  vis(0);
}
