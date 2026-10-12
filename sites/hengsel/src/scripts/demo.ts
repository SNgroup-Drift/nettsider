/**
 * Demoskjemaet på /priser-og-demo: sender til /api/demo med fetch, uten sideskifte.
 * - Setter tidsfeltet «t» (nå, i millisekunder) når siden er vist, og slår på «Send forespørsel» (deaktivert fra bygget uten skript).
 * - Navn og (e-post eller telefon) er påkrevd. Feil vises i varselet (role="alert", får fokus), feltene får aria-invalid.
 * - Ok: skjemaet byttes med «Takk, {fornavn}.» (får fokus) og «Ny forespørsel».
 * - Svarer ruten med noe annet enn ok (503, nettverksfeil, ukjent feil), vises mailto-reserven med utfylt emne og innhold.
 * Fasit: docs/design/hengsel/Priser-og-demo.dc.html (send, nullstill).
 */
const skjema = document.querySelector<HTMLFormElement>("[data-demo]");
if (skjema) {
  const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
  const tid = skjema.querySelector<HTMLInputElement>("[data-tid]")!;
  const send = skjema.querySelector<HTMLButtonElement>("[data-send]")!;
  const feilboks = skjema.querySelector<HTMLElement>("[data-feil]")!;
  const reserve = skjema.querySelector<HTMLElement>("[data-reserve]")!;
  const mailto = reserve.querySelector<HTMLAnchorElement>("[data-mailto]")!;
  const takk = q<HTMLElement>("[data-takk]");
  const takkTekst = takk.querySelector<HTMLElement>("[data-takk-tekst]")!;
  const takkStandard = takkTekst.dataset.ufullstendig ?? "";
  const felter = (n: string) => skjema.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement;
  const reserveTittel = reserve.querySelector<HTMLElement>("[data-reserve-tittel]")!;
  const feilTittel = reserveTittel.textContent ?? "";
  const feilLenke = mailto.textContent ?? "";
  // noytral: e-post er ikke slått på, så teksten er en vanlig oppfordring og ikke en feilmelding
  const visReserve = (noytral: boolean) => {
    reserveTittel.textContent = noytral ? skjema.dataset.noytralTittel || feilTittel : feilTittel;
    mailto.textContent = noytral ? skjema.dataset.noytralLenke || feilLenke : feilLenke;
    vis(reserve);
  };
  const feltFeil = (n: string) => skjema.querySelector<HTMLElement>(`[data-felt-feil="${n}"]`);
  const adresse = skjema.dataset.epost || "hei@hengsel.no";
  const emne0 = skjema.dataset.reserveEmne || "Demo av Hengsel";

  const markerTid = () => { tid.value = String(Date.now()); };
  markerTid();
  send.disabled = false;

  const verdi = (n: string) => felter(n).value.trim();
  const ugyldig = (n: string, ja: boolean) => {
    const el = felter(n);
    if (ja) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    const m = feltFeil(n);
    if (m) m.hidden = !ja;
  };
  const nullstillFeil = () => {
    for (const n of ["navn", "epost", "tlf"]) ugyldig(n, false);
    feilboks.hidden = true;
    reserve.hidden = true;
  };
  const vis = (el: HTMLElement) => { el.hidden = false; el.focus(); };

  // E-postreserven: emne og innhold URL-kodet
  const lagMailto = () => {
    const avd = skjema.querySelector<HTMLInputElement>('input[name="avdelinger"]:checked');
    const avdTekst = avd ? skjema.querySelector(`label[for="${avd.id}"]`)?.textContent ?? "" : "";
    const emne = `${emne0} – ${verdi("butikk") || verdi("navn")}`;
    const tekst = [
      `Navn: ${verdi("navn")}`, `Butikk: ${verdi("butikk")}`, `E-post: ${verdi("epost")}`, `Telefon: ${verdi("tlf")}`,
      `Antall avdelinger: ${avdTekst}`, "", "Hva vil dere se?", felter("melding").value.trim(),
    ].join("\n");
    mailto.href = `mailto:${adresse}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(tekst)}`;
  };

  const lykkes = () => {
    const fornavn = verdi("navn").split(/\s+/)[0];
    takkTekst.textContent = fornavn ? `Takk, ${fornavn}.` : takkStandard;
    skjema.hidden = true;
    vis(takk);
  };

  let sender = false;
  skjema.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sender) return;
    nullstillFeil();
    const mangler = !verdi("navn") || !(verdi("epost") || verdi("tlf"));
    if (mangler) {
      ugyldig("navn", !verdi("navn"));
      if (!verdi("epost") && !verdi("tlf")) { ugyldig("epost", true); ugyldig("tlf", true); feltFeil("epost")!.hidden = true; feltFeil("tlf")!.hidden = true; }
      vis(feilboks);
      return;
    }
    sender = true;
    send.disabled = true;
    skjema.setAttribute("aria-busy", "true");
    const data: Record<string, string> = {};
    for (const [k, v] of new FormData(skjema)) data[k] = String(v);
    try {
      // Tjeneren avviser forespørsler under 3 sekunder etter at skjemaet ble vist (robotvern): vent ut resten
      const rest = 3200 - (Date.now() - Number(tid.value));
      if (rest > 0) await new Promise((r) => setTimeout(r, rest));
      const svar = await fetch(skjema.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await svar.json().catch(() => null)) as { ok?: boolean; levert?: boolean; reserve?: string; feil?: Record<string, string> } | null;
      // E-postsending er ikke slått på (levert: false): ingen feilmelding, bare lenken til e-post
      if (svar.ok && json?.ok && json.levert === false && json.reserve === "mailto") { lagMailto(); visReserve(true); return; }
      if (svar.ok && json?.ok) { lykkes(); return; }
      const f = json?.feil;
      const kjente = ["navn", "epost", "tlf"];
      if (svar.status === 400 && f && Object.keys(f).every((k) => [...kjente, "butikk", "melding", "avdelinger"].includes(k))) {
        // Feil på feltene: vis dem (navn/e-post/telefon markeres, resten dekkes av varselet)
        for (const k of kjente) if (f[k]) ugyldig(k, true);
        if (f.epost && verdi("epost")) feltFeil("epost")!.hidden = false;
        if (f.tlf && verdi("tlf")) feltFeil("tlf")!.hidden = false;
        if (f.navn || !(verdi("epost") || verdi("tlf"))) vis(feilboks);
        else (skjema.querySelector<HTMLElement>('[aria-invalid="true"]') ?? feilboks).focus();
        return;
      }
      lagMailto();
      visReserve(false);
    } catch {
      lagMailto();
      visReserve(false);
    } finally {
      sender = false;
      send.disabled = false;
      skjema.removeAttribute("aria-busy");
    }
  });

  // Rydd feilmarkeringen når brukeren retter feltet
  for (const n of ["navn", "epost", "tlf"]) felter(n).addEventListener("input", () => { ugyldig(n, false); if (!skjema.querySelector('[aria-invalid="true"]')) feilboks.hidden = true; });

  takk.querySelector<HTMLButtonElement>("[data-ny]")!.addEventListener("click", () => {
    skjema.reset();
    nullstillFeil();
    markerTid();
    takk.hidden = true;
    skjema.hidden = false;
    felter("navn").focus();
  });
}
