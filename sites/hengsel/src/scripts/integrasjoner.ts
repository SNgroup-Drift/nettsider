/**
 * /integrasjoner: systemkartet som radiogruppe. [data-kart] har knapper role="radio" (aria-controls → detaljpanelet), og
 * [data-paneler] har ett panel per kobling. Uten skript står første kobling åpen. Piltaster flytter og velger (som i
 * WAI-ARIA-radiogrupper), Home/End hopper til første/siste. På smal skjerm (liste) følger piltastene den synlige rekkefølgen,
 * med Hengsel øverst.
 */
const kart = document.querySelector<HTMLElement>("[data-kart]");
if (kart) {
  const knapper = [...kart.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
  const paneler = knapper.map((k) => document.getElementById(k.getAttribute("aria-controls") ?? "")!);
  const linjer = [...kart.querySelectorAll<SVGLineElement>("[data-linje]")];
  const smal = matchMedia("(max-width: 560px)");
  const midt = knapper.findIndex((k) => k.classList.contains("midten"));
  const rekkefolge = () => (smal.matches && midt >= 0 ? [midt, ...knapper.map((_, i) => i).filter((i) => i !== midt)] : knapper.map((_, i) => i));
  let valgt = Math.max(0, knapper.findIndex((k) => k.getAttribute("aria-checked") === "true"));

  const velg = (i: number, fokus = false) => {
    valgt = i;
    knapper.forEach((k, j) => {
      k.setAttribute("aria-checked", String(j === i));
      k.tabIndex = j === i ? 0 : -1;
      paneler[j].hidden = j !== i;
    });
    linjer.forEach((l) => l.classList.toggle("valgt", Number(l.dataset.linje) === i));
    if (fokus) knapper[i].focus();
  };

  knapper.forEach((k, i) => {
    k.addEventListener("click", () => velg(i));
    k.addEventListener("keydown", (e) => {
      const rek = rekkefolge();
      const p = rek.indexOf(i);
      const n = rek.length;
      const mal: Record<string, number> = {
        ArrowRight: rek[(p + 1) % n], ArrowDown: rek[(p + 1) % n], ArrowLeft: rek[(p - 1 + n) % n], ArrowUp: rek[(p - 1 + n) % n], Home: rek[0], End: rek[n - 1],
      };
      if (e.key in mal) { e.preventDefault(); velg(mal[e.key], true); }
    });
  });
  velg(valgt);
}
