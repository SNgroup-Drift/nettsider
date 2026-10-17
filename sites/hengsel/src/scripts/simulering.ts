/**
 * N-6: simuleringene (Simulering.astro, TreEnheter.astro). Bytter mellom bildene i rammen med myk overgang (CSS) ca. hvert 3,5 s, bare mens rammen er
 * synlig (IntersectionObserver). Stegmerkene under rammen kan trykkes. Med prefers-reduced-motion går den ikke av seg selv: første bilde står, og
 * merkene bytter for hånd. Uten skript står første bilde. Bare klasser og attributter settes; ingen stil settes herfra (CSP).
 * En enhet = en [data-simulering] alene, eller en [data-sim-gruppe] med flere (TreEnheter): gruppen bytter i takt og deler stegmerkene.
 *
 * N-6b (WCAG 2.2.2, pause/stopp): serien kan stoppes og startes igjen med pause-knappen ved merkene ([data-pause], aria-pressed="true" = på pause).
 * Den holdes også automatisk mens musen er over rammen (bare mus, ikke berøring) eller fokus er inne i gruppen, og går videre når musen/fokus går ut.
 * Knappen vises først her (klassen «klar»), og ikke ved prefers-reduced-motion.
 */
const INTERVALL = 3500;
const rolig = matchMedia("(prefers-reduced-motion: reduce)");

for (const rot of document.querySelectorAll<HTMLElement>("[data-sim-gruppe], [data-simulering]:not([data-sim-gruppe] [data-simulering])")) {
  const sims = rot.matches("[data-simulering]") ? [rot] : [...rot.querySelectorAll<HTMLElement>("[data-simulering]")];
  const serier = sims.map((s) => [...s.querySelectorAll<HTMLElement>("[data-steg]")]);
  const merker = [...rot.querySelectorAll<HTMLButtonElement>("[data-merke]")];
  const pause = rot.querySelector<HTMLButtonElement>("[data-pause]");
  const antall = Math.max(merker.length, ...serier.map((s) => s.length));
  if (antall < 2) continue;
  let nå = 0;
  let timer = 0;
  let synlig = false;
  let pauset = false; // satt på pause med knappen
  let over = false; // musen er over rammen
  let fokus = false; // fokus er inne i gruppen

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
    if (synlig && !rolig.matches && !document.hidden && !pauset && !over && !fokus) timer = window.setInterval(() => vis(nå + 1), INTERVALL);
  };
  const visPause = () => {
    if (!pause) return;
    pause.classList.toggle("klar", !rolig.matches);
    pause.setAttribute("aria-pressed", pauset ? "true" : "false");
  };
  // Resten av bildene er lazy: når rammen er synlig, hentes de, så ingen steg er blanke ved første bytte
  const hentAlle = () => rot.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => { img.loading = "eager"; });

  merker.forEach((m, j) => m.addEventListener("click", () => { vis(j); start(); }));
  pause?.addEventListener("click", () => { pauset = !pauset; visPause(); start(); });
  rot.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { over = true; start(); } });
  rot.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { over = false; start(); } });
  rot.addEventListener("focusin", () => { fokus = true; start(); });
  rot.addEventListener("focusout", (e) => {
    if (rot.contains(e.relatedTarget as Node | null)) return;
    fokus = false;
    start();
  });
  new IntersectionObserver((rader) => {
    synlig = rader.some((r) => r.isIntersecting);
    if (synlig) hentAlle();
    start();
  }, { threshold: 0.35 }).observe(rot);
  rolig.addEventListener("change", () => { visPause(); start(); });
  document.addEventListener("visibilitychange", start);
  vis(0);
  visPause();
}
