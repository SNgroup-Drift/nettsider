/**
 * Ny forside (prøveside): priskalkulatoren (components/Priskalkulator.astro). Leser de tre tallene, regner med oppstilling() (content/kalkulator.ts,
 * som bruker beregn() fra Hengsel Admin med eksempelprislisten) og fyller oppstillingen. Bare tekst, hidden og disabled settes; ingen stil (CSP).
 */
import { KALKULATOR } from "../content/forside";
import { RADER, oppstilling, type Valg } from "../content/kalkulator";

type Navn = keyof Valg;

for (const rot of document.querySelectorAll<HTMLElement>("[data-kalkulator]")) {
  const felt = Object.fromEntries(
    (Object.keys(KALKULATOR.felt) as Navn[]).map((n) => [n, rot.querySelector<HTMLInputElement>(`[data-felt="${n}"]`)]),
  ) as Record<Navn, HTMLInputElement | null>;
  if (Object.values(felt).some((f) => !f)) continue;

  const grenser = (n: Navn) => KALKULATOR.felt[n];
  const verdi = (n: Navn) => {
    const { min, max, start } = grenser(n);
    const t = Math.trunc(Number(felt[n]!.value));
    return Number.isFinite(t) && felt[n]!.value !== "" ? Math.min(max, Math.max(min, t)) : start;
  };

  const oppdater = () => {
    const v: Valg = { butikker: verdi("butikker"), brukere: verdi("brukere"), montorer: verdi("montorer") };
    const o = oppstilling(v);
    for (const k of RADER) {
      const rad = rot.querySelector<HTMLElement>(`[data-rad="${k}"]`);
      if (!rad) continue;
      rad.hidden = !o.rader[k].vis;
      rad.querySelector("[data-tekst]")!.textContent = o.rader[k].tekst;
      rad.querySelector("[data-belop]")!.textContent = o.rader[k].belop;
    }
    rot.querySelector("[data-mva]")!.textContent = o.mva;
    rot.querySelector("[data-neste]")!.textContent = o.neste;
    for (const n of Object.keys(felt) as Navn[]) {
      const { min, max } = grenser(n);
      rot.querySelector<HTMLButtonElement>(`[data-steg-ned="${n}"]`)!.disabled = v[n] <= min;
      rot.querySelector<HTMLButtonElement>(`[data-steg-opp="${n}"]`)!.disabled = v[n] >= max;
    }
  };

  for (const n of Object.keys(felt) as Navn[]) {
    const f = felt[n]!;
    f.addEventListener("input", oppdater);
    // Når feltet forlates, rettes tallet til innenfor grensene
    f.addEventListener("change", () => { f.value = String(verdi(n)); oppdater(); });
    const steg = (d: number) => { f.value = String(Math.min(grenser(n).max, Math.max(grenser(n).min, verdi(n) + d))); oppdater(); };
    rot.querySelector(`[data-steg-ned="${n}"]`)!.addEventListener("click", () => steg(-1));
    rot.querySelector(`[data-steg-opp="${n}"]`)!.addEventListener("click", () => steg(1));
  }
  rot.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());
  oppdater();
}
