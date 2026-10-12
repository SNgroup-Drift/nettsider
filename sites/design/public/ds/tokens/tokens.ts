// GENERERT av scripts/design/lag-tokens.mjs fra tokens/hengsel.tokens.json. Ikke rediger for hånd.
// Hengsel-designsystemet, versjon 1.1.0. Brukes av CRM (src) og Expo-montørappen (montorapp).

export const versjon = "1.1.0" as const;

/** Merkevarefargene (råfarger). Bruk rollene under i komponenter. */
export const palett = {
  "warm-black": "#31261D",
  "off-white": "#FBF9F6",
  "beige-4": "#F8F2EC",
  "beige-3": "#F2E9DB",
  "beige-2": "#E4D4C4",
  "beige-1": "#C3B5A7",
  "deep-blue": "#5074A9",
  "dusty-blue": "#9CA9BD",
  "aksent-mork": "#8FA9D1"
} as const;

/** Roller med lys og mørk verdi. Samme navn og form som TOKENS i montorapp/src/theme.ts. */
export const roller = {
  "flate-side": {
    "lys": "#F2E9DB",
    "mork": "#1F1914"
  },
  "flate-kort": {
    "lys": "#FBF9F6",
    "mork": "#2A221C"
  },
  "flate-senket": {
    "lys": "#F8F2EC",
    "mork": "#251E18"
  },
  "flate-valgt": {
    "lys": "#E4D4C4",
    "mork": "#3A3028"
  },
  "linje": {
    "lys": "#E4D4C4",
    "mork": "rgba(242, 233, 219, 0.14)"
  },
  "kant": {
    "lys": "rgba(49, 38, 29, 0.32)",
    "mork": "rgba(242, 233, 219, 0.32)"
  },
  "ramme": {
    "lys": "#C3B5A7",
    "mork": "#000000"
  },
  "tekst": {
    "lys": "#31261D",
    "mork": "#F2E9DB"
  },
  "tekst-dempet": {
    "lys": "rgba(49, 38, 29, 0.72)",
    "mork": "rgba(242, 233, 219, 0.72)"
  },
  "tekst-svak": {
    "lys": "#6F6458",
    "mork": "rgba(242, 233, 219, 0.56)"
  },
  "tekst-invers": {
    "lys": "#FBF9F6",
    "mork": "#1F1914"
  },
  "aksent": {
    "lys": "#5074A9",
    "mork": "#8FA9D1"
  },
  "aksent-trykk": {
    "lys": "#405D88",
    "mork": "#7891B8"
  },
  "aksent-tekst": {
    "lys": "#3D5E8E",
    "mork": "#8FA9D1"
  },
  "aksent-svak": {
    "lys": "#9CA9BD",
    "mork": "#9CA9BD"
  },
  "paa-aksent": {
    "lys": "#FBF9F6",
    "mork": "#1F1914"
  },
  "overlegg": {
    "lys": "rgba(20, 16, 12, 0.48)",
    "mork": "rgba(20, 16, 12, 0.48)"
  },
  "varsel-flate": {
    "lys": "#5074A9",
    "mork": "#9DB8E0"
  },
  "varsel-tekst": {
    "lys": "#FBF9F6",
    "mork": "#14100C"
  },
  "feil-flate": {
    "lys": "#B8432F",
    "mork": "#B8432F"
  },
  "feil-tekst": {
    "lys": "#FBF9F6",
    "mork": "#FBF9F6"
  },
  "alltid-mork": {
    "lys": "#14100C",
    "mork": "#14100C"
  }
} as const;

/** Statusfarger: fg = tekst og prikk, bg = flate, kant = ramme (mangler på «sannsynlig»). */
export const status = {
  "noytral": {
    "lys": {
      "fg": "#5E564C",
      "bg": "#ECE4D8",
      "kant": "#D9CFC2"
    },
    "mork": {
      "fg": "#D9CFC2",
      "bg": "#3A2F26",
      "kant": "#5A4D41"
    }
  },
  "info": {
    "lys": {
      "fg": "#31261D",
      "bg": "#E4D4C4",
      "kant": "#C3B5A7"
    },
    "mork": {
      "fg": "#F2E9DB",
      "bg": "#3A3028",
      "kant": "#6B6259"
    }
  },
  "venter": {
    "lys": {
      "fg": "#5A4A7C",
      "bg": "#E9E3F1",
      "kant": "#CFC4E0"
    },
    "mork": {
      "fg": "#C2B3E0",
      "bg": "#3A3248",
      "kant": "#6E6090"
    }
  },
  "sannsynlig": {
    "lys": {
      "fg": "#2E6466",
      "bg": "#DCEBEA",
      "kant": "#B3D1CF"
    },
    "mork": {
      "fg": "#8FCACB",
      "bg": "#223B3C",
      "kant": "#4F7C7E"
    }
  },
  "ok": {
    "lys": {
      "fg": "#3B6547",
      "bg": "#E0EADB",
      "kant": "#B9CFB0"
    },
    "mork": {
      "fg": "#9FC28A",
      "bg": "#2E3B2B",
      "kant": "#5E7A50"
    }
  },
  "haster": {
    "lys": {
      "fg": "#7A5212",
      "bg": "#F5E6C8",
      "kant": "#E4CFA0"
    },
    "mork": {
      "fg": "#E9C46A",
      "bg": "#45371E",
      "kant": "#8A6E30"
    }
  },
  "feil": {
    "lys": {
      "fg": "#8E3522",
      "bg": "#F4E2DB",
      "kant": "#E4B8A8"
    },
    "mork": {
      "fg": "#E5927A",
      "bg": "#47291F",
      "kant": "#8A4A38"
    }
  }
} as const;

export const skrift = {
  "familie": {
    "hengsel": {
      "tekst": "'Inter', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      "overskrift": "'Newsreader', Georgia, 'Times New Roman', serif"
    },
    "ios": {
      "tekst": "system",
      "tittel": "Newsreader"
    }
  },
  "vekt": {
    "inter-normal": 400,
    "inter-medium": 500,
    "inter-sterk": 600,
    "newsreader-normal": 400,
    "newsreader-medium": 500
  },
  "storrelse": {
    "h1": [
      36,
      40
    ],
    "h2": [
      26,
      30
    ],
    "tall": [
      34,
      38
    ],
    "tittel": [
      15,
      20
    ],
    "tekst": [
      14,
      20
    ],
    "meta": [
      14,
      20
    ],
    "minste": [
      12,
      16
    ]
  },
  "storrelseSmal": {
    "nettbrett": {
      "maksBredde": 1199.98,
      "h1": [
        34,
        38
      ]
    },
    "telefon": {
      "maksBredde": 767.98,
      "h1": [
        36,
        40
      ],
      "h2": [
        22,
        26
      ],
      "tall": [
        30,
        34
      ]
    }
  }
} as const;

export const radius = {
  "kort-stor": 12,
  "kort-lite": 8,
  "felt": 6,
  "bilde": 8,
  "pille": 999
} as const;

export const avstand = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 32,
  "8": 40,
  "9": 56
} as const;

/** Skygge-lag: [x, y, blur, farge]. */
export const skygge = {
  "side": {
    "lys": [],
    "mork": []
  },
  "overlegg": {
    "lys": [
      [
        0,
        1,
        2,
        "rgb(49 38 29 / 0.06)"
      ],
      [
        0,
        8,
        24,
        "rgb(49 38 29 / 0.10)"
      ]
    ],
    "mork": [
      [
        0,
        1,
        2,
        "rgb(0 0 0 / 0.3)"
      ],
      [
        0,
        8,
        24,
        "rgb(0 0 0 / 0.4)"
      ]
    ]
  },
  "dialog": {
    "lys": [
      [
        0,
        24,
        64,
        "rgb(49 38 29 / 0.18)"
      ]
    ],
    "mork": [
      [
        0,
        24,
        64,
        "rgb(0 0 0 / 0.45)"
      ]
    ]
  }
} as const;

/** Hengsel Ute (iOS): navngitt farge → rolle. Se HengselTokens.Ios i Swift-fila. */
export const ios = {
  "side": "flate-side",
  "kort": "flate-kort",
  "senket": "flate-senket",
  "valgt": "flate-valgt",
  "linje": "linje",
  "tekst": "tekst",
  "tekst-dempet": "tekst-dempet",
  "tekst-svak": "tekst-svak",
  "lenke": "aksent-tekst",
  "aksent": "aksent",
  "paa-aksent": "paa-aksent"
} as const;

/**
 * Kundetema: logo, aksent og skrift som butikken kan velge, bare på tilbud/kontrakt (PDF), e-post til kunde og kundeportal.
 * Alle disse flatene er alltid lyse. Lausanne og Reckless er Sigdals egne skrifter og står bare i Sigdals eget tema.
 */
export const kundetema = {
  "gjelder": [
    "tilbud-og-kontrakt-pdf",
    "epost-til-kunde",
    "kundeportal"
  ],
  "gjelderIkke": [
    "crm",
    "montorapp",
    "hengsel-ute",
    "admin"
  ],
  "skriftKilder": [
    "fri liste",
    "egen fil med lisens bekreftet av kunden"
  ],
  "friListe": [
    {
      "navn": "Inter",
      "rolle": "tekst",
      "vekter": [
        400,
        500,
        600
      ],
      "merknad": "Hengsel-standard"
    },
    {
      "navn": "DM Sans",
      "rolle": "tekst",
      "vekter": [
        400,
        500,
        600
      ]
    },
    {
      "navn": "Source Sans 3",
      "rolle": "tekst",
      "vekter": [
        400,
        600
      ]
    },
    {
      "navn": "Newsreader",
      "rolle": "overskrift",
      "vekter": [
        400,
        500
      ],
      "merknad": "Hengsel-standard"
    },
    {
      "navn": "Source Serif 4",
      "rolle": "overskrift",
      "vekter": [
        400,
        500
      ]
    },
    {
      "navn": "Lora",
      "rolle": "overskrift",
      "vekter": [
        400,
        500
      ]
    }
  ],
  "eksempler": {
    "studio-sigdal-innlandet": {
      "navn": "Studio Sigdal Innlandet",
      "logo": "sigdal",
      "aksent": "#5074A9",
      "paaAksent": "#FBF9F6",
      "skrift": {
        "tekst": "TWK Lausanne",
        "overskrift": "Reckless Standard M",
        "kilde": "egen fil med lisens bekreftet av kunden"
      }
    },
    "eksempel-kjokken-as": {
      "navn": "Eksempel Kjøkken AS",
      "logo": "eksempel",
      "aksent": "#2E7D6B",
      "paaAksent": "#FBF9F6",
      "skrift": {
        "tekst": "DM Sans",
        "overskrift": "Lora",
        "kilde": "fri liste"
      }
    }
  }
} as const;

export type Kundetema = (typeof kundetema.eksempler)[keyof typeof kundetema.eksempler];

/** CSS-variabler for et kundetema (settes på kundens flate: PDF-mal, e-postmal, kundeportal) */
export function kundetemaCss(t: { aksent: string; paaAksent: string; skrift: { tekst: string; overskrift: string } }): string {
  return [
    `--kunde-aksent: ${t.aksent};`,
    `--kunde-paa-aksent: ${t.paaAksent};`,
    `--kunde-skrift-tekst: '${t.skrift.tekst}', ${skrift.familie.hengsel.tekst};`,
    `--kunde-skrift-overskrift: '${t.skrift.overskrift}', ${skrift.familie.hengsel.overskrift};`,
  ].join(' ');
}

export type Rolle = keyof typeof roller;
export type Tone = keyof typeof status;
export type Modus = 'lys' | 'mork';

/** Fargen til en rolle i lys eller mørk utgave */
export function farge(rolle: Rolle, modus: Modus = 'lys'): string {
  return roller[rolle][modus];
}

/** Fargene til en statuston i lys eller mørk utgave */
export function toneFarge(tone: Tone, modus: Modus = 'lys'): { fg: string; bg: string; kant?: string } {
  return status[tone][modus] as { fg: string; bg: string; kant?: string };
}

/** CSS-skygge (box-shadow) for et navn og en utgave */
export function skyggeCss(navn: keyof typeof skygge, modus: Modus = 'lys'): string {
  const lag = skygge[navn][modus] as ReadonlyArray<readonly [number, number, number, string]>;
  return lag.length === 0 ? 'none' : lag.map(([x, y, blur, f]) => `${x}px ${y}px ${blur}px ${f}`).join(', ');
}
