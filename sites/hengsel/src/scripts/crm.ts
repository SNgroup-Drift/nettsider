/**
 * /crm: demoen i fire steg. Stegene er en tablist (piltaster, Home/End), enhetene en radiogroup. «Neste:»-knappen, den røde raden og
 * knappene i skjermen går videre. Siden fungerer uten dette skriptet (steg 1 på PC). Enheten byttes uten at høyden endres
 * (rammene ligger i samme rutenettcelle, se crm.astro).
 */
const rot = document.querySelector<HTMLElement>("[data-crm]");
if (rot) {
  const scene = rot.querySelector<HTMLElement>("[data-scene]")!;
  const steg = [...rot.querySelectorAll<HTMLButtonElement>("[data-steg]")];
  const valg = [...rot.querySelectorAll<HTMLButtonElement>("[data-enhet-valg]")];
  const tekster = [...rot.querySelectorAll<HTMLElement>("[data-bt]")];
  const paneler = [...rot.querySelectorAll<HTMLElement>("[data-panel]")];
  const neste = rot.querySelector<HTMLButtonElement>("[data-neste-knapp]")!;
  const navn = steg.map((s) => s.textContent!.replace(/^\d+/, "").trim());
  const NESTE = "Neste: ", START = "Start på nytt";
  let i = 0;

  const vis = (n: number, fokus = false) => {
    i = Math.max(0, Math.min(steg.length - 1, n));
    steg.forEach((s, k) => { s.setAttribute("aria-selected", String(k === i)); s.tabIndex = k === i ? 0 : -1; });
    paneler.forEach((p) => { p.hidden = Number(p.dataset.panel) !== i; });
    tekster.forEach((t, k) => { t.dataset.aktiv = k === i ? "ja" : "nei"; });
    scene.setAttribute("aria-labelledby", steg[i].id);
    neste.textContent = i < steg.length - 1 ? NESTE + navn[i + 1] : START;
    if (fokus) steg[i].focus();
  };
  const enhet = (k: string, fokus = false) => {
    scene.dataset.vis = k;
    valg.forEach((v) => { const p = v.dataset.enhetValg === k; v.setAttribute("aria-checked", String(p)); v.tabIndex = p ? 0 : -1; if (p && fokus) v.focus(); });
  };
  const piltaster = (e: KeyboardEvent, antall: number, na: number, til: (n: number) => void) => {
    const nokler: Record<string, number> = { ArrowRight: na + 1, ArrowDown: na + 1, ArrowLeft: na - 1, ArrowUp: na - 1, Home: 0, End: antall - 1 };
    if (!(e.key in nokler)) return;
    e.preventDefault();
    til((nokler[e.key] + antall) % antall);
  };

  steg.forEach((s, k) => {
    s.addEventListener("click", () => vis(k));
    s.addEventListener("keydown", (e) => piltaster(e, steg.length, k, (n) => vis(n, true)));
  });
  valg.forEach((v, k) => {
    v.addEventListener("click", () => enhet(v.dataset.enhetValg!));
    v.addEventListener("keydown", (e) => piltaster(e, valg.length, k, (n) => enhet(valg[n].dataset.enhetValg!, true)));
  });
  neste.addEventListener("click", () => vis(i < steg.length - 1 ? i + 1 : 0));
  // Raden og knappene i skjermen går videre (ikke fra siste steg)
  scene.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-neste]") && i < steg.length - 1) vis(i + 1);
  });

  // Smal skjerm: start på telefon (PC-rammen blir for liten til å lese)
  if (matchMedia("(max-width: 699px)").matches) enhet("telefon");
}
