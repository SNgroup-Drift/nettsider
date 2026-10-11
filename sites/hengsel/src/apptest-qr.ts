// QR-koden til hengsel.no/apptest, laget ved bygging (ingen eksterne kall og ingen skript i nettleseren).
// Returnerer en SVG-sti med én rute per mørk modul, så koden kan tegnes som <svg viewBox="0 0 {storrelse} {storrelse}">.
import qrcode from "qrcode-generator";

export const APPTEST_ADRESSE = "https://hengsel.no/apptest";

export function lagQr(tekst: string = APPTEST_ADRESSE): { sti: string; storrelse: number } {
  const qr = qrcode(0, "M");
  qr.addData(tekst);
  qr.make();
  const n = qr.getModuleCount();
  let sti = "";
  // Sammenhengende mørke moduler på en rad tegnes som ett rektangel
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!qr.isDark(y, x)) { x++; continue; }
      const start = x;
      while (x < n && qr.isDark(y, x)) x++;
      sti += `M${start} ${y}h${x - start}v1h-${x - start}z`;
    }
  }
  return { sti, storrelse: n };
}
