// hengsel.no/apptest: lenker og versjon for testversjonen av Hengsel Ute. Alt som siden kan trenge å få byttet, står her.
// En verdi som begynner med «TODO_» vises som deaktivert knapp («Lenke kommer») til den er fylt inn.
//
// Området mellom <apptest-versjon>-merkene skrives av .github/workflows/apptest-versjon.yml (scripts/apptest-versjon.mjs):
// versjon, APK-lenke, «Siste oppdatering» og «Hva er nytt». Ikke rediger det for hånd; det blir overskrevet av neste kjøring.
export const APPTEST: {
  versjon: string;
  apk: string;
  oppdatert: string;
  nytt: string[];
  testflight: string;
  play: string;
  epost: string;
} = {
  // <apptest-versjon>
  versjon: "1.7.0",
  apk: "https://expo.dev/artifacts/eas/i5HzdDLSpElUZcYjZJFDXYvgT_KXYR81KBMme53i5b4.apk", // bygg 24
  oppdatert: "2026-10-10",
  nytt: [
    "Kompakt visning og tre tettheter",
    "Nytt målark som ikke dekker bildet",
    "Pil og ring i bildeverktøyet",
    "Laser med alle tilstander",
    "KS med kamera",
    "Utlevering bare av skannede kolli",
    "Kø som overlever appdrap",
    "«Klar uten nett»",
    "Face ID-frysen rettet",
    "Knip-zoom og Apple Pencil på iPad",
  ],
  // </apptest-versjon>
  testflight: "https://testflight.apple.com/join/MygfVe9U",
  play: "https://play.google.com/apps/internaltest/4701475978909247435",
  epost: "test@hengsel.no",
};

export const erTodo = (verdi: string) => verdi.startsWith("TODO_");
