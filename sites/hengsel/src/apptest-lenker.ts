// hengsel.no/apptest: lenker og versjon for testversjonen av Hengsel Ute. Alt som siden kan trenge å få byttet, står her.
// En verdi som begynner med «TODO_» vises som deaktivert knapp («Lenke kommer») til den er fylt inn.
export const APPTEST = {
  versjon: "1.7.0",
  testflight: "https://testflight.apple.com/join/MygfVe9U",
  play: "https://play.google.com/apps/internaltest/4701475978909247435",
  apk: "https://expo.dev/artifacts/eas/i5HzdDLSpElUZcYjZJFDXYvgT_KXYR81KBMme53i5b4.apk", // bygg 24
  epost: "test@hengsel.no",
};

export const erTodo = (verdi: string) => verdi.startsWith("TODO_");
