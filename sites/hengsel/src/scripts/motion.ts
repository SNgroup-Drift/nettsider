// Motion-videoen (components/Motion.astro): kildene settes først når videoen nærmer seg synsfeltet. Ved prefers-reduced-motion står plakaten.
const videoer = document.querySelectorAll<HTMLVideoElement>("video[data-motion]");
const rolig = matchMedia("(prefers-reduced-motion: reduce)").matches;
const start = (v: HTMLVideoElement) => {
  v.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((s) => { s.src = s.dataset.src!; });
  v.load();
  v.play().catch(() => {});
};
if (!rolig && videoer.length) {
  if ("IntersectionObserver" in window) {
    const o = new IntersectionObserver((poster) => {
      for (const p of poster) if (p.isIntersecting) { start(p.target as HTMLVideoElement); o.unobserve(p.target); }
    }, { rootMargin: "200px" });
    videoer.forEach((v) => o.observe(v));
  } else videoer.forEach(start);
}
