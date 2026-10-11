/**
 * «Kopier» ved demopassordet på /apptest: kopierer teksten i [data-demopassord-verdi] til utklippstavlen og viser «Kopiert»
 * en kort stund. Ingen lagring, ingen nettverk.
 */
const knapp = document.querySelector<HTMLButtonElement>("[data-kopier]");
const verdi = document.querySelector<HTMLElement>("[data-demopassord-verdi]");
if (knapp && verdi) {
  const merkelapp = knapp.textContent ?? "Kopier";
  const status = document.querySelector<HTMLElement>("[data-kopier-status]");
  let tidtaker: number | undefined;
  knapp.addEventListener("click", async () => {
    const tekst = verdi.textContent ?? "";
    if (!tekst) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(tekst);
      ok = true;
    } catch {
      // Uten tilgang til utklippstavlen: marker teksten, så brukeren kan kopiere selv
      const utvalg = window.getSelection();
      const omrade = document.createRange();
      omrade.selectNodeContents(verdi);
      utvalg?.removeAllRanges();
      utvalg?.addRange(omrade);
    }
    knapp.textContent = ok ? "Kopiert" : "Trykk Ctrl+C";
    if (status) status.textContent = ok ? "Passordet er kopiert." : "Passordet er markert. Trykk Ctrl+C eller Cmd+C for å kopiere.";
    window.clearTimeout(tidtaker);
    tidtaker = window.setTimeout(() => { knapp.textContent = merkelapp; }, 2500);
  });
}
