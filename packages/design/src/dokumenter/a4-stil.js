const px = (n) => `calc(${n} * var(--u))`;
const malKlasse = (mal) => "a4-m-" + mal.replace(/px/g, "p").replace(/[^a-z0-9]+/gi, "_");
const hhKlasse = (hh) => "a4-hh-" + String(hh).replace(".", "_");
function a4DynamiskCss(dokumenter) {
  const maler = /* @__PURE__ */ new Set();
  const hoyder = /* @__PURE__ */ new Set();
  for (const d of dokumenter)
    for (const s of d.sider)
      for (const b of s.blokker ?? []) {
        if (b.type === "tabell") maler.add(b.mal);
        if (b.type === "bilder" || b.type === "bilde") hoyder.add(b.hh);
      }
  const regler = [];
  for (const m of maler) regler.push(`.${malKlasse(m)}{grid-template-columns:${m.replace(/(\d*\.?\d+)px/g, (_, n) => px(n))}}`);
  for (const h of hoyder) regler.push(`.${hhKlasse(h)}{height:${px(h)}}`);
  return regler.join("\n");
}
export {
  a4DynamiskCss,
  hhKlasse,
  malKlasse
};
