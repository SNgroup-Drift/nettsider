/**
 * Nettside-kitet (N-3): søket i Tabell kompakt, rader som åpnes, og «Vis alle» i Kortliste/Liste. Sidene virker uten skriptet:
 * da står det som åpnes åpent på telefon, søkefeltet filtrerer ikke, og «Vis alle» er skjult (alle rader står allerede).
 */
const tlf = matchMedia("(max-width: 959px)");

// Søk: filtrerer radene i flisen. Telefon: ikonet åpner feltet over tittelen; Escape eller tomt felt som mister fokus lukker det.
for (const sok of document.querySelectorAll<HTMLElement>("[data-sok]")) {
  const flis = sok.closest(".flis");
  const felt = sok.querySelector<HTMLInputElement>("[data-sok-felt]");
  const knapp = sok.querySelector<HTMLButtonElement>("[data-sok-knapp]");
  const tabell = flis?.querySelector<HTMLTableElement>("[data-tabell]");
  if (!flis || !felt || !knapp || !tabell) continue;
  const ingen = tabell.querySelector<HTMLElement>("[data-ingen]");
  const filtrer = () => {
    const q = felt.value.trim().toLocaleLowerCase("nb");
    let treff = 0;
    for (const rad of tabell.querySelectorAll<HTMLTableRowElement>("tr[data-rad]")) {
      const ja = !q || (rad.textContent ?? "").toLocaleLowerCase("nb").includes(q);
      rad.hidden = !ja;
      if (ja) treff++;
      const det = rad.nextElementSibling as HTMLElement | null;
      if (det?.hasAttribute("data-detalj") && !ja) { det.hidden = true; rad.querySelector("[data-apne]")?.setAttribute("aria-expanded", "false"); }
    }
    if (ingen) ingen.hidden = treff > 0;
  };
  felt.addEventListener("input", filtrer);
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
