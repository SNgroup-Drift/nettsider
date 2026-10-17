/**
 * Kitet (kopi fra N-3, sites/hengsel/src/scripts/kit.ts, utvidet i N-5): søk og filter i tabellene, rader som åpnes, «Vis alle» i en dialog
 * og kolonnevelgeren i Tavle og Uke på telefon. Sidene virker uten skriptet: da står det som åpnes åpent på telefon, søk og filter filtrerer
 * ikke, «Vis alle» er skjult og Tavle/Uke viser alle kolonnene under hverandre.
 */
const tlf = matchMedia("(max-width: 767.98px)");

// Søk og filter: filtrerer radene i flisen. Søket treffer teksten i raden, filteret statusen (data-status) og butikkvelgeren én kolonne.
for (const flis of document.querySelectorAll<HTMLElement>(".k-tabellflis")) {
  const tabell = flis.querySelector<HTMLTableElement>("[data-tabell]");
  if (!tabell) continue;
  const sok = flis.querySelector<HTMLElement>("[data-sok]");
  const felt = sok?.querySelector<HTMLInputElement>("[data-sok-felt]");
  const knapp = sok?.querySelector<HTMLButtonElement>("[data-sok-knapp]");
  const filterKnapper = [...flis.querySelectorAll<HTMLButtonElement>("[data-filter]")];
  const butikk = flis.querySelector<HTMLSelectElement>("[data-butikk-filter]");
  const ingen = tabell.querySelector<HTMLElement>("[data-ingen]");
  let status = "";
  const filtrer = () => {
    const q = (felt?.value ?? "").trim().toLocaleLowerCase("nb");
    const b = butikk?.value ?? "";
    const kol = Number(butikk?.dataset.butikkFilter ?? -1);
    let treff = 0;
    for (const rad of tabell.querySelectorAll<HTMLTableRowElement>("tr[data-rad]")) {
      const ja = (!q || (rad.textContent ?? "").toLocaleLowerCase("nb").includes(q))
        && (!status || rad.dataset.status === status)
        && (!b || kol < 0 || rad.cells[kol]?.textContent?.trim() === b);
      rad.hidden = !ja;
      if (ja) treff++;
      const det = rad.nextElementSibling as HTMLElement | null;
      if (det?.hasAttribute("data-detalj") && !ja) { det.hidden = true; rad.querySelector("[data-apne]")?.setAttribute("aria-expanded", "false"); }
    }
    if (ingen) ingen.hidden = treff > 0;
  };
  for (const k of filterKnapper) {
    k.addEventListener("click", () => {
      status = k.dataset.filter ?? "";
      for (const a of filterKnapper) a.setAttribute("aria-pressed", String(a === k));
      filtrer();
    });
  }
  butikk?.addEventListener("change", filtrer);
  if (!sok || !felt || !knapp) continue;
  felt.addEventListener("input", filtrer);
  // Telefon (Tabell kompakt): ikonet åpner feltet over tittelen; Escape eller tomt felt som mister fokus lukker det.
  const settApen = (apen: boolean) => {
    if (apen) sok.setAttribute("data-apen", ""); else sok.removeAttribute("data-apen");
    knapp.setAttribute("aria-expanded", String(apen));
  };
  knapp.addEventListener("click", () => { settApen(true); felt.focus(); });
  felt.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    felt.value = "";
    filtrer();
    if (tlf.matches) { settApen(false); knapp.focus(); }
  });
  felt.addEventListener("blur", () => { if (tlf.matches && !felt.value) settApen(false); });
}

// Rader som åpnes: «mer» åpnes overalt; kolonnene imellom bare på telefon (på PC står de i raden, så knappen er av der).
const apneKnapper = [...document.querySelectorAll<HTMLButtonElement>("[data-apne]")];
const oppdaterKnapper = () => {
  // Raden som åpnes spenner over de synlige kolonnene: alle på PC, første og siste på telefon
  for (const td of document.querySelectorAll<HTMLTableCellElement>("[data-detalj] > td")) {
    const n = td.closest("table")?.querySelectorAll("thead th").length ?? 2;
    td.colSpan = tlf.matches ? 2 : n;
  }
  for (const k of apneKnapper) {
    const bareTlf = k.closest("tr")?.hasAttribute("data-bare-tlf") ?? false;
    k.disabled = bareTlf && !tlf.matches;
    if (k.disabled) {
      k.setAttribute("aria-expanded", "false");
      const det = document.getElementById(k.getAttribute("aria-controls") ?? "");
      if (det) det.hidden = true;
    }
  }
};
for (const k of apneKnapper) {
  k.addEventListener("click", () => {
    const det = document.getElementById(k.getAttribute("aria-controls") ?? "");
    if (!det) return;
    const apen = k.getAttribute("aria-expanded") !== "true";
    k.setAttribute("aria-expanded", String(apen));
    det.hidden = !apen;
  });
}
oppdaterKnapper();
tlf.addEventListener("change", oppdaterKnapper);

// «Vis alle (n)»: hele lista i en dialog
for (const k of document.querySelectorAll<HTMLButtonElement>("[data-dialog-apne]")) {
  const d = document.getElementById(k.dataset.dialogApne ?? "") as HTMLDialogElement | null;
  if (!d) continue;
  k.addEventListener("click", () => d.showModal());
  d.querySelector("[data-dialog-lukk]")?.addEventListener("click", () => d.close());
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
}

// Tavle og Uke på telefon: én kolonne om gangen, valgt i velgeren over (flisklasser.md «Tavle», «Uke»)
for (const velger of document.querySelectorAll<HTMLSelectElement>("[data-kolonnevelger]")) {
  const kolonner = document.getElementById(velger.getAttribute("aria-controls") ?? "");
  if (!kolonner) continue;
  const vis = () => {
    kolonner.setAttribute("data-valgt", velger.value);
    for (const k of kolonner.querySelectorAll<HTMLElement>("[data-kolonne]")) k.toggleAttribute("data-vis", k.dataset.kolonne === velger.value);
  };
  velger.addEventListener("change", vis);
  vis();
}
