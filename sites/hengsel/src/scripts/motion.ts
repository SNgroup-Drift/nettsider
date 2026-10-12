/**
 * Hengsel Ute-motion: lazy-lasting. Kildene (data-webm, data-mp4) settes inn første gang videoen er nær skjermen, så filene ikke
 * lastes før de trengs. Ved prefers-reduced-motion settes ingen kilder og autoplay fjernes: bare plakaten vises.
 */
const redusert = window.matchMedia("(prefers-reduced-motion: reduce)");
const videoer = [...document.querySelectorAll<HTMLVideoElement>("video[data-webm]")];

const last = (v: HTMLVideoElement) => {
  if (v.dataset.lastet) return;
  v.dataset.lastet = "1";
  for (const [type, src] of [["video/webm", v.dataset.webm!], ["video/mp4", v.dataset.mp4!]]) {
    const s = document.createElement("source");
    s.src = src;
    s.type = type;
    v.appendChild(s);
  }
  v.load();
  v.play().catch(() => {});
};

if (redusert.matches) {
  for (const v of videoer) v.removeAttribute("autoplay");
} else if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((rader) => {
    for (const r of rader) {
      const v = r.target as HTMLVideoElement;
      if (r.isIntersecting) {
        io.unobserve(v);
        last(v);
      }
    }
  }, { rootMargin: "200px" });
  for (const v of videoer) io.observe(v);
} else {
  for (const v of videoer) last(v);
}
// Slår brukeren på «reduser bevegelse» mens siden er åpen, stoppes videoen på plakaten
redusert.addEventListener("change", () => {
  for (const v of videoer) if (redusert.matches) { v.pause(); v.currentTime = 0; }
});
