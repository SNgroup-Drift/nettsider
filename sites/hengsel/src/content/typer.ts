/** Et avsnitt på personvernsiden (PrivacyPage). Tekst kan inneholde enkel HTML, f.eks. mailto-lenker. */
export interface Avsnitt {
  overskrift: string;
  /** Avsnitt før listen */
  tekst?: string[];
  punkter?: string[];
  /** Avsnitt etter listen */
  etter?: string[];
  /** Fremhevet boks (HTML) etter første avsnitt, f.eks. adresse og org.nr. */
  boks?: string;
}
