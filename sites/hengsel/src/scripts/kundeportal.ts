/**
 * /kundeportal: steg-faner («Kundens reise»), bryteren Telefon · PC («Enhet») og SMS-varselet.
 * Uten skript står steg 1 på telefon (resten har hidden fra bygget). Faner og bryter følger WAI-ARIA-mønstrene:
 * piltaster, Home og End flytter og velger; bare den valgte har tabindex 0. SMS-en glir inn 450 ms etter et valg og
 * ut igjen etter ca. 5 s; med redusert bevegelse (CSS) vises den uten glid. Etter fanebytte flyttes ikke fokus.
 */
const side = document.querySelector<HTMLElement>("[data-visning]");
if (side) {
  const faner = [...side.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const valg = [...side.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
  const boks = new Map(
    [...side.querySelectorAll<HTMLElement>("[data-enhet-boks]")].map((b) => [b.dataset.enhetBoks!, b] as const),
  );
  const panel = side.querySelector<HTMLElement>('[role="tabpanel"]')!;
  const capT = side.querySelector<HTMLElement>("[data-cap-t]")!;
  const capS = side.querySelector<HTMLElement>("[data-cap-s]")!;
  const ids = ["tilbud", "tilvalg", "levering", "montering", "fdv"];
  let steg = 0;
  let enhet = "telefon";
  let t1 = 0, t2 = 0;

  const visSms = () => {
    clearTimeout(t1); clearTimeout(t2);
    side.querySelectorAll("[data-sms].inn").forEach((s) => s.classList.remove("inn"));
    const aktiv = boks.get(enhet)?.querySelector<HTMLElement>(`[data-steg="${ids[steg]}"] [data-sms]`);
    if (!aktiv) return;
    t1 = window.setTimeout(() => aktiv.classList.add("inn"), 450);
    t2 = window.setTimeout(() => aktiv.classList.remove("inn"), 5200);
  };

  const velgSteg = (i: number, fokus = false) => {
    steg = (i + faner.length) % faner.length;
    faner.forEach((f, k) => { f.setAttribute("aria-selected", String(k === steg)); f.tabIndex = k === steg ? 0 : -1; });
    side.querySelectorAll<HTMLElement>("[data-steg]").forEach((s) => { s.hidden = s.dataset.steg !== ids[steg]; });
    panel.setAttribute("aria-labelledby", faner[steg].id);
    capT.textContent = faner[steg].querySelector("b")!.textContent;
    capS.textContent = faner[steg].querySelector(".beskr")!.textContent;
    if (fokus) faner[steg].focus();
    visSms();
  };

  const velgEnhet = (i: number, fokus = false) => {
    const nytt = valg[(i + valg.length) % valg.length];
    enhet = nytt.dataset.enhetValg!;
    valg.forEach((v) => { v.setAttribute("aria-checked", String(v === nytt)); v.tabIndex = v === nytt ? 0 : -1; });
    boks.forEach((b, k) => { b.hidden = k !== enhet; });
    side.dataset.enhet = enhet;
    if (fokus) nytt.focus();
    visSms();
  };

  faner.forEach((f, i) => {
    f.addEventListener("click", () => velgSteg(i));
    f.addEventListener("keydown", (e) => {
      const hopp: Record<string, number> = { ArrowRight: steg + 1, ArrowDown: steg + 1, ArrowLeft: steg - 1, ArrowUp: steg - 1, Home: 0, End: faner.length - 1 };
      if (e.key in hopp) { e.preventDefault(); velgSteg(hopp[e.key], true); }
    });
  });
  valg.forEach((v, i) => {
    v.addEventListener("click", () => velgEnhet(i));
    v.addEventListener("keydown", (e) => {
      const hopp: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: valg.length - 1 };
      if (e.key in hopp) { e.preventDefault(); velgEnhet(hopp[e.key], true); }
    });
  });
  side.querySelector("[data-vis-sms]")?.addEventListener("click", visSms);

  side.classList.add("js");
  visSms();
}
