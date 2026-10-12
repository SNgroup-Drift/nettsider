/**
 * Søk og fristfarger for admin.hengsel.no (K-184). Ingen nettverkskall, ingen lagring, ingen tredjepart.
 * - Søkefeltet filtrerer alle [data-sok]-elementer (lenker, kontoer, frister, kunder) og skjuler tomme seksjoner.
 * - Fristfargene regnes på nytt i nettleseren (siden kan være bygget for lenge siden).
 */
import { dagerIgjen, niva, tekstFor } from "../lib/frist";

const NAVN = { rod: "Haster", gul: "Snart", gronn: "God tid", ukjent: "Ukjent" } as const;

for (const li of document.querySelectorAll<HTMLElement>(".frist[data-dato]")) {
  const d = dagerIgjen(li.dataset.dato || null);
  const n = niva(d);
  li.dataset.niva = n;
  const status = li.querySelector<HTMLElement>(".status");
  if (status) {
    status.className = `status ${n}`;
    status.querySelector(".status-navn")!.textContent = NAVN[n];
    status.querySelector(".status-tekst")!.textContent = tekstFor(d);
  }
}

const felt = document.getElementById("sok") as HTMLInputElement | null;
const treff = document.getElementById("treff");
const elementer = [...document.querySelectorAll<HTMLElement>("[data-sok]:not([data-sok-nav])")];
const kundeNav = [...document.querySelectorAll<HTMLElement>("[data-sok-nav]")];
// Innerste seksjoner først (rekkefølgen i dokumentet er ytterst først, så vi snur den)
const seksjoner = [...document.querySelectorAll<HTMLElement>("[data-seksjon]")].reverse();

function filtrer() {
  const ord = (felt?.value ?? "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const passer = (el: HTMLElement) => ord.every((o) => (el.dataset.sok ?? "").includes(o));
  let synlige = 0;
  for (const el of elementer) {
    const ok = passer(el);
    el.hidden = !ok;
    if (ok) synlige++;
  }
  for (const el of kundeNav) el.hidden = !passer(el);
  // En seksjon uten synlige elementer skjules (men bare når det søkes)
  for (const s of seksjoner) s.hidden = ord.length > 0 && !s.querySelector("[data-sok]:not([hidden])");
  if (treff) treff.textContent = ord.length ? (synlige ? `${synlige} treff` : "Ingen treff") : "";
}

felt?.addEventListener("input", filtrer);
// «/» hopper til søkefeltet (som på GitHub), bortsett fra når man skriver et sted
document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
  e.preventDefault();
  felt?.focus();
});
