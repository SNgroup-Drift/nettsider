/**
 * Skriptet på /apptest. Siden virker uten det: uten skript står første bilde stille, alle tre installeringsveiene vises,
 * avkrysningene huskes ikke og «Kopier»-knappene er skjult. Ingen nettverk, ingen sporing, ingen style-attributter (CSP).
 *  1. Bildeveksling i heroen (4 s, 0,7 s overgang i CSS; står stille ved prefers-reduced-motion, men prikkene virker).
 *  2. Telefongjenkjenning: iPhone/iPad → TestFlight, Android → Google Play, ellers PC. ?enhet=iphone|android|apk|pc overstyrer.
 *  3. «Kopier» for brukernavn og demopassord.
 *  4. Sjekklista huskes i localStorage under hengsel-apptest-sjekk-{versjon}.
 */
document.documentElement.classList.add("js");

const alle = <T extends Element>(velger: string, rot: ParentNode = document) => Array.from(rot.querySelectorAll<T>(velger));

// 1. Bildeveksling
(() => {
  const bilder = alle<HTMLElement>("[data-slide]");
  const prikker = alle<HTMLButtonElement>("[data-prikk]");
  const navn = document.querySelector<HTMLElement>("[data-slidenavn]");
  if (bilder.length < 2) return;
  const redusert = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0;
  let tidtaker: number | undefined;
  const vis = (n: number) => {
    i = n;
    bilder.forEach((b, k) => {
      b.classList.toggle("on", k === n);
      if (k === n) b.removeAttribute("aria-hidden");
      else b.setAttribute("aria-hidden", "true");
    });
    prikker.forEach((p, k) => {
      p.setAttribute("aria-selected", String(k === n));
      p.classList.toggle("on", k === n);
    });
    if (navn) navn.textContent = prikker[n]?.getAttribute("aria-label") ?? "";
  };
  const start = () => {
    window.clearInterval(tidtaker);
    if (!redusert) tidtaker = window.setInterval(() => vis((i + 1) % bilder.length), 4000);
  };
  prikker.forEach((p, k) => p.addEventListener("click", () => { vis(k); start(); }));
  start();
})();

// 2. Telefongjenkjenning
(() => {
  const rot = document.querySelector<HTMLElement>("[data-install]");
  if (!rot) return;
  const ua = navigator.userAgent;
  const param = new URLSearchParams(location.search).get("enhet");
  let enhet = param && ["iphone", "android", "apk", "pc"].includes(param) ? param : "";
  if (!enhet) {
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) enhet = "iphone";
    else if (/Android/.test(ua)) enhet = "android";
    else enhet = "pc";
  }
  const smal = matchMedia("(max-width: 759px)");
  const hoved = enhet === "android" || enhet === "apk" ? enhet : "iphone";
  alle<HTMLElement>("[data-vei]", rot).forEach((v) => v.classList.toggle("hoved", v.dataset.vei === hoved));
  const knapp = rot.querySelector<HTMLButtonElement>("[data-andre]");
  const sett = () => { rot.dataset.modus = enhet === "pc" && !smal.matches ? "pc" : "tlf"; };
  sett();
  smal.addEventListener("change", sett);
  knapp?.addEventListener("click", () => {
    const apen = rot.classList.toggle("andre-apen");
    knapp.setAttribute("aria-expanded", String(apen));
    knapp.textContent = apen ? "Skjul andre telefoner" : "Andre telefoner";
  });
})();

// 3. Kopier
(() => {
  const status = document.querySelector<HTMLElement>("[data-kopier-status]");
  alle<HTMLButtonElement>("[data-kopier]").forEach((knapp) => {
    const merkelapp = knapp.textContent ?? "Kopier";
    let tidtaker: number | undefined;
    knapp.addEventListener("click", async () => {
      const kilde = knapp.dataset.kopier ?? "";
      const el = kilde.startsWith("#") ? document.querySelector<HTMLElement>(kilde) : null;
      const tekst = (el ? el.textContent : kilde) ?? "";
      if (!tekst) return;
      let ok = false;
      try {
        await navigator.clipboard.writeText(tekst);
        ok = true;
      } catch {
        // Uten tilgang til utklippstavlen: marker teksten, så brukeren kan kopiere selv
        if (el) {
          const utvalg = window.getSelection();
          const omrade = document.createRange();
          omrade.selectNodeContents(el);
          utvalg?.removeAllRanges();
          utvalg?.addRange(omrade);
        }
      }
      knapp.textContent = ok ? "Kopiert" : "Trykk Ctrl+C";
      if (status) status.textContent = ok ? "Kopiert." : "Markert. Trykk Ctrl+C eller Cmd+C for å kopiere.";
      window.clearTimeout(tidtaker);
      tidtaker = window.setTimeout(() => { knapp.textContent = merkelapp; }, 2000);
    });
  });
})();

// 4. Sjekkliste
(() => {
  const liste = document.querySelector<HTMLElement>("[data-sjekk]");
  if (!liste) return;
  const nokkel = `hengsel-apptest-sjekk-${liste.dataset.versjon ?? ""}`;
  const bokser = alle<HTMLInputElement>("input[type=checkbox]", liste);
  const fremdrift = document.querySelector<HTMLElement>("[data-fremdrift]");
  const stolpe = document.querySelector<HTMLProgressElement>("[data-stolpe]");
  const oppdater = () => {
    const n = bokser.filter((b) => b.checked).length;
    if (fremdrift) fremdrift.textContent = `${n} av ${bokser.length}`;
    if (stolpe) stolpe.value = n;
  };
  try {
    const lagret = JSON.parse(localStorage.getItem(nokkel) ?? "null");
    if (Array.isArray(lagret)) bokser.forEach((b, k) => { b.checked = lagret.includes(k); });
  } catch {
    // localStorage kan være blokkert: sjekklista virker likevel, den huskes bare ikke
  }
  oppdater();
  bokser.forEach((b) => b.addEventListener("change", () => {
    oppdater();
    try {
      localStorage.setItem(nokkel, JSON.stringify(bokser.flatMap((x, k) => (x.checked ? [k] : []))));
    } catch {
      // se over
    }
  }));
})();
