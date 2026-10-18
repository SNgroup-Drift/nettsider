// GENERERT av scripts/design/lag-tokens.mjs fra tokens/hengsel.tokens.json. Ikke rediger for hånd.
// Hengsel-designsystemet, versjon 2.10.0 (palett «blekk med furu», K-206). Brukes av CRM (src) og Expo-montørappen (montorapp).

export const versjon = "2.10.0" as const;

/** Merkefargene (råfarger): blekk, furu og produktfargene. Bruk rollene under i komponenter. */
export const palett = {
  "blekk": "#1D2430",
  "blekk-mork": "#E8EBF1",
  "furu": "#068472",
  "aksent-mork": "#54B9A5",
  "produkt-crm": "#5165D3",
  "produkt-crm-mork": "#859DFF",
  "produkt-ute": "#068472",
  "produkt-ute-mork": "#54B9A5",
  "produkt-levering": "#1C8742",
  "produkt-levering-mork": "#5BBD74",
  "produkt-admin": "#8348BE",
  "produkt-admin-mork": "#B68FE7"
} as const;

/**
 * Roller. lys og mork er vanlig kontrast; 'lys-okt-kontrast' og 'mork-okt-kontrast' er økt kontrast. p3 har samme fire utgaver i
 * Display P3 (hex-sifrene er P3-koordinater). Rollene ramme, overlegg og alltid-mork har ikke økt kontrast eller p3.
 * Samme navn og form som TOKENS i montorapp/src/theme.ts.
 */
export const roller = {
  "flate-side": {
    "lys": "#F6F8FB",
    "mork": "#0B0D11",
    "lys-okt-kontrast": "#F6F8FB",
    "mork-okt-kontrast": "#0B0D11",
    "p3": {
      "lys": "#F7F8FB",
      "mork": "#0B0D11",
      "lys-okt-kontrast": "#F7F8FB",
      "mork-okt-kontrast": "#0B0D11"
    }
  },
  "flate-kort": {
    "lys": "#FBFDFF",
    "mork": "#111418",
    "lys-okt-kontrast": "#FBFDFF",
    "mork-okt-kontrast": "#111418",
    "p3": {
      "lys": "#FBFDFF",
      "mork": "#121417",
      "lys-okt-kontrast": "#FBFDFF",
      "mork-okt-kontrast": "#121417"
    }
  },
  "flate-senket": {
    "lys": "#EFF1F4",
    "mork": "#06080B",
    "lys-okt-kontrast": "#EFF1F4",
    "mork-okt-kontrast": "#06080B",
    "p3": {
      "lys": "#EFF1F4",
      "mork": "#07080B",
      "lys-okt-kontrast": "#EFF1F4",
      "mork-okt-kontrast": "#07080B"
    }
  },
  "flate-valgt": {
    "lys": "#E0F4EE",
    "mork": "#13332D",
    "lys-okt-kontrast": "#E0F4EE",
    "mork-okt-kontrast": "#13332D",
    "p3": {
      "lys": "#E4F3EE",
      "mork": "#1B322D",
      "lys-okt-kontrast": "#E4F3EE",
      "mork-okt-kontrast": "#1B322D"
    }
  },
  "flate-kolonne": {
    "lys": "#E3E6EA",
    "mork": "#191B1F",
    "lys-okt-kontrast": "#E3E6EA",
    "mork-okt-kontrast": "#191B1F",
    "p3": {
      "lys": "#E4E6EA",
      "mork": "#191B1F",
      "lys-okt-kontrast": "#E4E6EA",
      "mork-okt-kontrast": "#191B1F"
    }
  },
  "linje": {
    "lys": "#D7DADE",
    "mork": "#303439",
    "lys-okt-kontrast": "#9A9FA5",
    "mork-okt-kontrast": "#595E65",
    "p3": {
      "lys": "#D7DADE",
      "mork": "#303439",
      "lys-okt-kontrast": "#9B9FA5",
      "mork-okt-kontrast": "#5A5E64"
    }
  },
  "kant": {
    "lys": "#7B8188",
    "mork": "#767B82",
    "lys-okt-kontrast": "#494E54",
    "mork-okt-kontrast": "#A6ABB1",
    "p3": {
      "lys": "#7C8187",
      "mork": "#777B81",
      "lys-okt-kontrast": "#4A4D53",
      "mork-okt-kontrast": "#A7ABB1"
    }
  },
  "tekst": {
    "lys": "#1A1D22",
    "mork": "#EAEDF0",
    "lys-okt-kontrast": "#040608",
    "mork-okt-kontrast": "#FCFDFF",
    "p3": {
      "lys": "#1A1D21",
      "mork": "#EBEDF0",
      "lys-okt-kontrast": "#050608",
      "mork-okt-kontrast": "#FCFDFF"
    }
  },
  "tekst-dempet": {
    "lys": "#51565C",
    "mork": "#ADB1B7",
    "lys-okt-kontrast": "#2A2E33",
    "mork-okt-kontrast": "#DBDEE2",
    "p3": {
      "lys": "#52565C",
      "mork": "#AEB1B7",
      "lys-okt-kontrast": "#2B2E33",
      "mork-okt-kontrast": "#DCDEE2"
    }
  },
  "tekst-svak": {
    "lys": "#686E75",
    "mork": "#90969D",
    "lys-okt-kontrast": "#43484E",
    "mork-okt-kontrast": "#C0C4CA",
    "p3": {
      "lys": "#696E74",
      "mork": "#91969C",
      "lys-okt-kontrast": "#44484E",
      "mork-okt-kontrast": "#C1C4C9"
    }
  },
  "tekst-invers": {
    "lys": "#FBFDFF",
    "mork": "#0B0D11",
    "lys-okt-kontrast": "#FBFDFF",
    "mork-okt-kontrast": "#0B0D11",
    "p3": {
      "lys": "#FBFDFF",
      "mork": "#0B0D11",
      "lys-okt-kontrast": "#FBFDFF",
      "mork-okt-kontrast": "#0B0D11"
    }
  },
  "aksent": {
    "lys": "#05806F",
    "mork": "#54B9A5",
    "lys-okt-kontrast": "#006a5b",
    "mork-okt-kontrast": "#68CDB7",
    "p3": {
      "lys": "#387E6F",
      "mork": "#6FB7A5",
      "lys-okt-kontrast": "#206A5B",
      "mork-okt-kontrast": "#82CAB8"
    }
  },
  "aksent-trykk": {
    "lys": "#007665",
    "mork": "#63C8B3",
    "lys-okt-kontrast": "#005b4d",
    "mork-okt-kontrast": "#75DAC4",
    "p3": {
      "lys": "#2C7565",
      "mork": "#7DC5B3",
      "lys-okt-kontrast": "#1a5b4e",
      "mork-okt-kontrast": "#8ED7C5"
    }
  },
  "aksent-tekst": {
    "lys": "#016d5e",
    "mork": "#8ACDBE",
    "lys-okt-kontrast": "#004E42",
    "mork-okt-kontrast": "#B4ECDE",
    "p3": {
      "lys": "#2E6C5E",
      "mork": "#99CCBE",
      "lys-okt-kontrast": "#154E43",
      "mork-okt-kontrast": "#BFEADE"
    }
  },
  "aksent-svak": {
    "lys": "#E0F4EE",
    "mork": "#112823",
    "lys-okt-kontrast": "#E0F4EE",
    "mork-okt-kontrast": "#112823",
    "p3": {
      "lys": "#E4F3EE",
      "mork": "#172723",
      "lys-okt-kontrast": "#E4F3EE",
      "mork-okt-kontrast": "#172723"
    }
  },
  "aksent-valgt": {
    "lys": "#BCE6DB",
    "mork": "#163F37",
    "lys-okt-kontrast": "#AADDD0",
    "mork-okt-kontrast": "#194B41",
    "p3": {
      "lys": "#C4E5DC",
      "mork": "#213E37",
      "lys-okt-kontrast": "#B4DBD1",
      "mork-okt-kontrast": "#274a41"
    }
  },
  "paa-aksent": {
    "lys": "#FBF9F6",
    "mork": "#0D1013",
    "lys-okt-kontrast": "#FBF9F6",
    "mork-okt-kontrast": "#0D1013",
    "p3": {
      "lys": "#FBF9F6",
      "mork": "#0D1013",
      "lys-okt-kontrast": "#FBF9F6",
      "mork-okt-kontrast": "#0D1013"
    }
  },
  "aksent-paa-mork": {
    "lys": "#54B9A5",
    "mork": "#54B9A5",
    "lys-okt-kontrast": "#54B9A5",
    "mork-okt-kontrast": "#54B9A5",
    "p3": {
      "lys": "#6FB7A5",
      "mork": "#6FB7A5",
      "lys-okt-kontrast": "#6FB7A5",
      "mork-okt-kontrast": "#6FB7A5"
    }
  },
  "varsel-flate": {
    "lys": "#FFE9BC",
    "mork": "#3D2A00",
    "lys-okt-kontrast": "#FFF6E4",
    "mork-okt-kontrast": "#251800",
    "p3": {
      "lys": "#FEE9BB",
      "mork": "#3B2B01",
      "lys-okt-kontrast": "#FEF6E3",
      "mork-okt-kontrast": "#241800"
    }
  },
  "varsel-tekst": {
    "lys": "#6D5000",
    "mork": "#FCC959",
    "lys-okt-kontrast": "#503900",
    "mork-okt-kontrast": "#FFE9BC",
    "p3": {
      "lys": "#6C5000",
      "mork": "#F4CB6C",
      "lys-okt-kontrast": "#4E3900",
      "mork-okt-kontrast": "#FEE9BB"
    }
  },
  "feil-flate": {
    "lys": "#FFEBE8",
    "mork": "#421C18",
    "lys-okt-kontrast": "#FFF4F2",
    "mork-okt-kontrast": "#310D0A",
    "p3": {
      "lys": "#FDEBE8",
      "mork": "#3D1E1A",
      "lys-okt-kontrast": "#FEF4F2",
      "mork-okt-kontrast": "#2D0F0C"
    }
  },
  "feil-tekst": {
    "lys": "#9E2D28",
    "mork": "#FFBFB6",
    "lys-okt-kontrast": "#780007",
    "mork-okt-kontrast": "#FFE4E0",
    "p3": {
      "lys": "#91362E",
      "mork": "#FABFB5",
      "lys-okt-kontrast": "#6E100F",
      "mork-okt-kontrast": "#FDE4E0"
    }
  },
  "ramme": {
    "lys": "#CBCFD4",
    "mork": "#3D4248",
    "lys-okt-kontrast": "#CBCFD4",
    "mork-okt-kontrast": "#3D4248"
  },
  "overlegg": {
    "lys": "rgba(26, 29, 34, 0.40)",
    "mork": "rgba(0, 0, 0, 0.60)",
    "lys-okt-kontrast": "rgba(26, 29, 34, 0.40)",
    "mork-okt-kontrast": "rgba(0, 0, 0, 0.60)"
  },
  "alltid-mork": {
    "lys": "#0B0D11",
    "mork": "#0B0D11",
    "lys-okt-kontrast": "#0B0D11",
    "mork-okt-kontrast": "#0B0D11"
  },
  "paa-alltid-mork": {
    "lys": "#EAEDF0",
    "mork": "#EAEDF0",
    "lys-okt-kontrast": "#EAEDF0",
    "mork-okt-kontrast": "#EAEDF0"
  }
} as const;

/** Statusfarger: fg = tekst og prikk, bg = flate, kant = ramme. Samme utgaver som roller. */
export const status = {
  "ny": {
    "etikett": "Ny",
    "lys": {
      "fg": "#1A57AD",
      "bg": "#E7F1FF",
      "kant": "#A0C6FF"
    },
    "mork": {
      "fg": "#B5D3FF",
      "bg": "#152946",
      "kant": "#37588A"
    },
    "lys-okt-kontrast": {
      "fg": "#003882",
      "bg": "#F2F7FF",
      "kant": "#3E71BC"
    },
    "mork-okt-kontrast": {
      "fg": "#E0ECFF",
      "bg": "#071A36",
      "kant": "#759AD0"
    },
    "p3": {
      "lys": {
        "fg": "#2C56A7",
        "bg": "#E8F1FF",
        "kant": "#A8C5FA"
      },
      "mork": {
        "fg": "#B9D2FF",
        "bg": "#1A2844",
        "kant": "#3E5786"
      },
      "lys-okt-kontrast": {
        "fg": "#0C3584",
        "bg": "#F2F7FF",
        "kant": "#4A70B7"
      },
      "mork-okt-kontrast": {
        "fg": "#E1ECFF",
        "bg": "#0C1A34",
        "kant": "#7D99CB"
      }
    }
  },
  "pagar": {
    "etikett": "Pågår",
    "lys": {
      "fg": "#5C46A7",
      "bg": "#EFEEFF",
      "kant": "#C3BBFB"
    },
    "mork": {
      "fg": "#D0C9FF",
      "bg": "#292344",
      "kant": "#584E87"
    },
    "lys-okt-kontrast": {
      "fg": "#402584",
      "bg": "#F6F6FF",
      "kant": "#7262B7"
    },
    "mork-okt-kontrast": {
      "fg": "#EAE8FF",
      "bg": "#1B1434",
      "kant": "#978FCC"
    },
    "p3": {
      "lys": {
        "fg": "#5947A2",
        "bg": "#EFEEFF",
        "kant": "#C1BBF6"
      },
      "mork": {
        "fg": "#CEC9FF",
        "bg": "#282342",
        "kant": "#564F83"
      },
      "lys-okt-kontrast": {
        "fg": "#3C267F",
        "bg": "#F6F5FF",
        "kant": "#6F62B2"
      },
      "mork-okt-kontrast": {
        "fg": "#EAE8FF",
        "bg": "#1A1532",
        "kant": "#968FC8"
      }
    }
  },
  "venter": {
    "etikett": "Venter",
    "lys": {
      "fg": "#555B64",
      "bg": "#E9F1FB",
      "kant": "#BDC5CF"
    },
    "mork": {
      "fg": "#CAD2DC",
      "bg": "#242931",
      "kant": "#525961"
    },
    "lys-okt-kontrast": {
      "fg": "#383E46",
      "bg": "#F1F7FF",
      "kant": "#6B727B"
    },
    "mork-okt-kontrast": {
      "fg": "#E4ECF6",
      "bg": "#161B22",
      "kant": "#9299A2"
    },
    "p3": {
      "lys": {
        "fg": "#565B63",
        "bg": "#EBF1FA",
        "kant": "#BFC5CE"
      },
      "mork": {
        "fg": "#CCD1DB",
        "bg": "#252930",
        "kant": "#535860"
      },
      "lys-okt-kontrast": {
        "fg": "#393D45",
        "bg": "#F2F7FF",
        "kant": "#6D727A"
      },
      "mork-okt-kontrast": {
        "fg": "#E6ECF5",
        "bg": "#171B21",
        "kant": "#9399A1"
      }
    }
  },
  "sannsynlig": {
    "etikett": "Sannsynlig",
    "lys": {
      "fg": "#80378C",
      "bg": "#FCE9FF",
      "kant": "#E0B1E7"
    },
    "mork": {
      "fg": "#F3B9FC",
      "bg": "#361E3A",
      "kant": "#6F4676"
    },
    "lys-okt-kontrast": {
      "fg": "#5F136A",
      "bg": "#FEF3FF",
      "kant": "#94559E"
    },
    "mork-okt-kontrast": {
      "fg": "#FBE1FF",
      "bg": "#270F2B",
      "kant": "#B386B9"
    },
    "p3": {
      "lys": {
        "fg": "#773B87",
        "bg": "#FAE9FF",
        "kant": "#D9B3E4"
      },
      "mork": {
        "fg": "#EABBF8",
        "bg": "#331F39",
        "kant": "#694873"
      },
      "lys-okt-kontrast": {
        "fg": "#571A66",
        "bg": "#FCF3FF",
        "kant": "#8B589A"
      },
      "mork-okt-kontrast": {
        "fg": "#F8E1FF",
        "bg": "#241129",
        "kant": "#AC87B6"
      }
    }
  },
  "ferdig": {
    "etikett": "Ferdig",
    "lys": {
      "fg": "#1F6D02",
      "bg": "#E3F7DE",
      "kant": "#A5D39B"
    },
    "mork": {
      "fg": "#AAE39E",
      "bg": "#173012",
      "kant": "#3B6432"
    },
    "lys-okt-kontrast": {
      "fg": "#104B00",
      "bg": "#E9FEE5",
      "kant": "#448335"
    },
    "mork-okt-kontrast": {
      "fg": "#C4FEB7",
      "bg": "#092104",
      "kant": "#7AA671"
    },
    "p3": {
      "lys": {
        "fg": "#376C1D",
        "bg": "#E6F7E0",
        "kant": "#AFD2A0"
      },
      "mork": {
        "fg": "#B6E2A5",
        "bg": "#1D2F16",
        "kant": "#456338"
      },
      "lys-okt-kontrast": {
        "fg": "#1D4B01",
        "bg": "#EDFDE7",
        "kant": "#53823F"
      },
      "mork-okt-kontrast": {
        "fg": "#D0FCBE",
        "bg": "#0F2008",
        "kant": "#84A576"
      }
    }
  },
  "advarsel": {
    "etikett": "Prisavvik",
    "lys": {
      "fg": "#6D5000",
      "bg": "#FFE9BC",
      "kant": "#E0C07F"
    },
    "mork": {
      "fg": "#FCC959",
      "bg": "#3D2A00",
      "kant": "#70530B"
    },
    "lys-okt-kontrast": {
      "fg": "#503900",
      "bg": "#FFF6E4",
      "kant": "#916B00"
    },
    "mork-okt-kontrast": {
      "fg": "#FFE9BC",
      "bg": "#251800",
      "kant": "#B39454"
    },
    "p3": {
      "lys": {
        "fg": "#6C5000",
        "bg": "#FEE9BB",
        "kant": "#DBC188"
      },
      "mork": {
        "fg": "#F4CB6C",
        "bg": "#3B2B01",
        "kant": "#6B541D"
      },
      "lys-okt-kontrast": {
        "fg": "#4E3900",
        "bg": "#FEF6E3",
        "kant": "#8E6B00"
      },
      "mork-okt-kontrast": {
        "fg": "#FEE9BB",
        "bg": "#241800",
        "kant": "#AE955D"
      }
    }
  },
  "feil": {
    "etikett": "Stoppet",
    "lys": {
      "fg": "#9E2D28",
      "bg": "#FFEBE8",
      "kant": "#F9AEA5"
    },
    "mork": {
      "fg": "#FFBFB6",
      "bg": "#421C18",
      "kant": "#83423C"
    },
    "lys-okt-kontrast": {
      "fg": "#780007",
      "bg": "#FFF4F2",
      "kant": "#B14F46"
    },
    "mork-okt-kontrast": {
      "fg": "#FFE4E0",
      "bg": "#310D0A",
      "kant": "#CA837A"
    },
    "p3": {
      "lys": {
        "fg": "#91362E",
        "bg": "#FDEBE8",
        "kant": "#EEB1A7"
      },
      "mork": {
        "fg": "#FABFB5",
        "bg": "#3D1E1A",
        "kant": "#7B463F"
      },
      "lys-okt-kontrast": {
        "fg": "#6E100F",
        "bg": "#FEF4F2",
        "kant": "#A5544B"
      },
      "mork-okt-kontrast": {
        "fg": "#FDE4E0",
        "bg": "#2D0F0C",
        "kant": "#C0867D"
      }
    }
  }
} as const;

export const skrift = {
  "familie": {
    "hengsel": {
      "tekst": "'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      "overskrift": "'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
    },
    "ios": {
      "tekst": "system"
    }
  },
  "filer": [
    {
      "navn": "Schibsted Grotesk",
      "fil": "schibsted-grotesk-latin-wght-normal.woff2",
      "vekt": "400 800"
    },
    {
      "navn": "Schibsted Grotesk",
      "fil": "SchibstedGrotesk-Normal-latin-ext.woff2",
      "vekt": "400 800",
      "stil": "normal",
      "unicodeRange": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
    },
    {
      "navn": "Schibsted Grotesk",
      "fil": "SchibstedGrotesk-Kursiv-latin.woff2",
      "vekt": "400 800",
      "stil": "italic",
      "unicodeRange": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
    },
    {
      "navn": "Schibsted Grotesk",
      "fil": "SchibstedGrotesk-Kursiv-latin-ext.woff2",
      "vekt": "400 800",
      "stil": "italic",
      "unicodeRange": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
    }
  ],
  "vekt": {
    "normal": 400,
    "medium": 500,
    "sterk": 600,
    "fet": 700
  },
  "storrelse": {
    "h1": [
      28,
      34
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
      16,
      22
    ],
    "tekst": [
      14,
      20
    ],
    "meta": [
      13,
      18
    ],
    "minste": [
      12,
      16
    ]
  },
  "stil": {
    "h1": {
      "vekt": 700,
      "sporing": -0.8
    },
    "tittel": {
      "vekt": 700,
      "sporing": 0
    }
  },
  "egenskap": {
    "tabell": "tabular-nums",
    "sidetittel": "28px",
    "tall-stor": "32px",
    "mono": "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
  },
  "storrelseSmal": {
    "nettbrett": {
      "maksBredde": 1199.98,
      "h1": [
        28,
        34
      ]
    },
    "telefon": {
      "maksBredde": 767.98,
      "h1": [
        26,
        32
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
  "pille": 999,
  "liten": 4,
  "rad": 6
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
        "rgb(26 29 34 / 0.06)"
      ],
      [
        0,
        8,
        24,
        "rgb(26 29 34 / 0.10)"
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
        "rgb(26 29 34 / 0.18)"
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

/** Hengsel Ute (iOS): aksent, aksent-valgt og paa-aksent i lys, mørk og økt kontrast, sRGB og P3 (fra palett 1.0). */
export const iosVarianter = {
  "lys": {
    "aksent": {
      "srgb": "#05806F",
      "p3": "#387E6F"
    },
    "aksent-valgt": {
      "srgb": "#BCE6DB",
      "p3": "#C4E5DC"
    },
    "paa-aksent": {
      "srgb": "#FBF9F6",
      "p3": "#FBF9F6"
    },
    "status": {
      "ny": {
        "fg": {
          "srgb": "#1A57AD",
          "p3": "#2C56A7"
        },
        "bg": {
          "srgb": "#E7F1FF",
          "p3": "#E8F1FF"
        },
        "kant": {
          "srgb": "#A0C6FF",
          "p3": "#A8C5FA"
        }
      },
      "pagar": {
        "fg": {
          "srgb": "#5C46A7",
          "p3": "#5947A2"
        },
        "bg": {
          "srgb": "#EFEEFF",
          "p3": "#EFEEFF"
        },
        "kant": {
          "srgb": "#C3BBFB",
          "p3": "#C1BBF6"
        }
      },
      "venter": {
        "fg": {
          "srgb": "#555B64",
          "p3": "#565B63"
        },
        "bg": {
          "srgb": "#E9F1FB",
          "p3": "#EBF1FA"
        },
        "kant": {
          "srgb": "#BDC5CF",
          "p3": "#BFC5CE"
        }
      },
      "sannsynlig": {
        "fg": {
          "srgb": "#80378C",
          "p3": "#773B87"
        },
        "bg": {
          "srgb": "#FCE9FF",
          "p3": "#FAE9FF"
        },
        "kant": {
          "srgb": "#E0B1E7",
          "p3": "#D9B3E4"
        }
      },
      "ferdig": {
        "fg": {
          "srgb": "#1F6D02",
          "p3": "#376C1D"
        },
        "bg": {
          "srgb": "#E3F7DE",
          "p3": "#E6F7E0"
        },
        "kant": {
          "srgb": "#A5D39B",
          "p3": "#AFD2A0"
        }
      },
      "advarsel": {
        "fg": {
          "srgb": "#6D5000",
          "p3": "#6C5000"
        },
        "bg": {
          "srgb": "#FFE9BC",
          "p3": "#FEE9BB"
        },
        "kant": {
          "srgb": "#E0C07F",
          "p3": "#DBC188"
        }
      },
      "feil": {
        "fg": {
          "srgb": "#9E2D28",
          "p3": "#91362E"
        },
        "bg": {
          "srgb": "#FFEBE8",
          "p3": "#FDEBE8"
        },
        "kant": {
          "srgb": "#F9AEA5",
          "p3": "#EEB1A7"
        }
      }
    }
  },
  "mork": {
    "aksent": {
      "srgb": "#54B9A5",
      "p3": "#6FB7A5"
    },
    "aksent-valgt": {
      "srgb": "#163F37",
      "p3": "#213E37"
    },
    "paa-aksent": {
      "srgb": "#0D1013",
      "p3": "#0D1013"
    },
    "status": {
      "ny": {
        "fg": {
          "srgb": "#B5D3FF",
          "p3": "#B9D2FF"
        },
        "bg": {
          "srgb": "#152946",
          "p3": "#1A2844"
        },
        "kant": {
          "srgb": "#37588A",
          "p3": "#3E5786"
        }
      },
      "pagar": {
        "fg": {
          "srgb": "#D0C9FF",
          "p3": "#CEC9FF"
        },
        "bg": {
          "srgb": "#292344",
          "p3": "#282342"
        },
        "kant": {
          "srgb": "#584E87",
          "p3": "#564F83"
        }
      },
      "venter": {
        "fg": {
          "srgb": "#CAD2DC",
          "p3": "#CCD1DB"
        },
        "bg": {
          "srgb": "#242931",
          "p3": "#252930"
        },
        "kant": {
          "srgb": "#525961",
          "p3": "#535860"
        }
      },
      "sannsynlig": {
        "fg": {
          "srgb": "#F3B9FC",
          "p3": "#EABBF8"
        },
        "bg": {
          "srgb": "#361E3A",
          "p3": "#331F39"
        },
        "kant": {
          "srgb": "#6F4676",
          "p3": "#694873"
        }
      },
      "ferdig": {
        "fg": {
          "srgb": "#AAE39E",
          "p3": "#B6E2A5"
        },
        "bg": {
          "srgb": "#173012",
          "p3": "#1D2F16"
        },
        "kant": {
          "srgb": "#3B6432",
          "p3": "#456338"
        }
      },
      "advarsel": {
        "fg": {
          "srgb": "#FCC959",
          "p3": "#F4CB6C"
        },
        "bg": {
          "srgb": "#3D2A00",
          "p3": "#3B2B01"
        },
        "kant": {
          "srgb": "#70530B",
          "p3": "#6B541D"
        }
      },
      "feil": {
        "fg": {
          "srgb": "#FFBFB6",
          "p3": "#FABFB5"
        },
        "bg": {
          "srgb": "#421C18",
          "p3": "#3D1E1A"
        },
        "kant": {
          "srgb": "#83423C",
          "p3": "#7B463F"
        }
      }
    }
  },
  "lys-okt-kontrast": {
    "aksent": {
      "srgb": "#006a5b",
      "p3": "#206A5B"
    },
    "aksent-valgt": {
      "srgb": "#AADDD0",
      "p3": "#B4DBD1"
    },
    "paa-aksent": {
      "srgb": "#FBF9F6",
      "p3": "#FBF9F6"
    },
    "status": {
      "ny": {
        "fg": {
          "srgb": "#003882",
          "p3": "#0C3584"
        },
        "bg": {
          "srgb": "#F2F7FF",
          "p3": "#F2F7FF"
        },
        "kant": {
          "srgb": "#3E71BC",
          "p3": "#4A70B7"
        }
      },
      "pagar": {
        "fg": {
          "srgb": "#402584",
          "p3": "#3C267F"
        },
        "bg": {
          "srgb": "#F6F6FF",
          "p3": "#F6F5FF"
        },
        "kant": {
          "srgb": "#7262B7",
          "p3": "#6F62B2"
        }
      },
      "venter": {
        "fg": {
          "srgb": "#383E46",
          "p3": "#393D45"
        },
        "bg": {
          "srgb": "#F1F7FF",
          "p3": "#F2F7FF"
        },
        "kant": {
          "srgb": "#6B727B",
          "p3": "#6D727A"
        }
      },
      "sannsynlig": {
        "fg": {
          "srgb": "#5F136A",
          "p3": "#571A66"
        },
        "bg": {
          "srgb": "#FEF3FF",
          "p3": "#FCF3FF"
        },
        "kant": {
          "srgb": "#94559E",
          "p3": "#8B589A"
        }
      },
      "ferdig": {
        "fg": {
          "srgb": "#104B00",
          "p3": "#1D4B01"
        },
        "bg": {
          "srgb": "#E9FEE5",
          "p3": "#EDFDE7"
        },
        "kant": {
          "srgb": "#448335",
          "p3": "#53823F"
        }
      },
      "advarsel": {
        "fg": {
          "srgb": "#503900",
          "p3": "#4E3900"
        },
        "bg": {
          "srgb": "#FFF6E4",
          "p3": "#FEF6E3"
        },
        "kant": {
          "srgb": "#916B00",
          "p3": "#8E6B00"
        }
      },
      "feil": {
        "fg": {
          "srgb": "#780007",
          "p3": "#6E100F"
        },
        "bg": {
          "srgb": "#FFF4F2",
          "p3": "#FEF4F2"
        },
        "kant": {
          "srgb": "#B14F46",
          "p3": "#A5544B"
        }
      }
    }
  },
  "mork-okt-kontrast": {
    "aksent": {
      "srgb": "#68CDB7",
      "p3": "#82CAB8"
    },
    "aksent-valgt": {
      "srgb": "#194B41",
      "p3": "#274a41"
    },
    "paa-aksent": {
      "srgb": "#0D1013",
      "p3": "#0D1013"
    },
    "status": {
      "ny": {
        "fg": {
          "srgb": "#E0ECFF",
          "p3": "#E1ECFF"
        },
        "bg": {
          "srgb": "#071A36",
          "p3": "#0C1A34"
        },
        "kant": {
          "srgb": "#759AD0",
          "p3": "#7D99CB"
        }
      },
      "pagar": {
        "fg": {
          "srgb": "#EAE8FF",
          "p3": "#EAE8FF"
        },
        "bg": {
          "srgb": "#1B1434",
          "p3": "#1A1532"
        },
        "kant": {
          "srgb": "#978FCC",
          "p3": "#968FC8"
        }
      },
      "venter": {
        "fg": {
          "srgb": "#E4ECF6",
          "p3": "#E6ECF5"
        },
        "bg": {
          "srgb": "#161B22",
          "p3": "#171B21"
        },
        "kant": {
          "srgb": "#9299A2",
          "p3": "#9399A1"
        }
      },
      "sannsynlig": {
        "fg": {
          "srgb": "#FBE1FF",
          "p3": "#F8E1FF"
        },
        "bg": {
          "srgb": "#270F2B",
          "p3": "#241129"
        },
        "kant": {
          "srgb": "#B386B9",
          "p3": "#AC87B6"
        }
      },
      "ferdig": {
        "fg": {
          "srgb": "#C4FEB7",
          "p3": "#D0FCBE"
        },
        "bg": {
          "srgb": "#092104",
          "p3": "#0F2008"
        },
        "kant": {
          "srgb": "#7AA671",
          "p3": "#84A576"
        }
      },
      "advarsel": {
        "fg": {
          "srgb": "#FFE9BC",
          "p3": "#FEE9BB"
        },
        "bg": {
          "srgb": "#251800",
          "p3": "#241800"
        },
        "kant": {
          "srgb": "#B39454",
          "p3": "#AE955D"
        }
      },
      "feil": {
        "fg": {
          "srgb": "#FFE4E0",
          "p3": "#FDE4E0"
        },
        "bg": {
          "srgb": "#310D0A",
          "p3": "#2D0F0C"
        },
        "kant": {
          "srgb": "#CA837A",
          "p3": "#C0867D"
        }
      }
    }
  }
} as const;

/** Radix-lignende skalaer (trinn 1–12) for nøytral og aksent, lys og mørk, med OKLCH, sRGB og P3. */
export const skala = {
  "noytral": {
    "lys": [
      {
        "trinn": 1,
        "oklch": "oklch(99.3% 0.004 255)",
        "srgb": "#FBFDFF",
        "p3": "#FBFDFF"
      },
      {
        "trinn": 2,
        "oklch": "oklch(97.9% 0.004 255)",
        "srgb": "#F6F8FB",
        "p3": "#F7F8FB"
      },
      {
        "trinn": 3,
        "oklch": "oklch(95.7% 0.005 255)",
        "srgb": "#EFF1F4",
        "p3": "#EFF1F4"
      },
      {
        "trinn": 4,
        "oklch": "oklch(93.4% 0.006 255)",
        "srgb": "#E7E9ED",
        "p3": "#E7E9ED"
      },
      {
        "trinn": 5,
        "oklch": "oklch(91.2% 0.006 255)",
        "srgb": "#DFE2E6",
        "p3": "#E0E2E6"
      },
      {
        "trinn": 6,
        "oklch": "oklch(88.7% 0.007 255)",
        "srgb": "#D7DADE",
        "p3": "#D7DADE"
      },
      {
        "trinn": 7,
        "oklch": "oklch(85.3% 0.008 255)",
        "srgb": "#CBCFD4",
        "p3": "#CCCFD3"
      },
      {
        "trinn": 8,
        "oklch": "oklch(79.0% 0.009 255)",
        "srgb": "#B7BBC1",
        "p3": "#B7BBC0"
      },
      {
        "trinn": 9,
        "oklch": "oklch(60.0% 0.012 255)",
        "srgb": "#7B8188",
        "p3": "#7C8187"
      },
      {
        "trinn": 10,
        "oklch": "oklch(56.0% 0.012 255)",
        "srgb": "#70757C",
        "p3": "#71757B"
      },
      {
        "trinn": 11,
        "oklch": "oklch(45.0% 0.012 255)",
        "srgb": "#51565C",
        "p3": "#52565C"
      },
      {
        "trinn": 12,
        "oklch": "oklch(23.0% 0.010 255)",
        "srgb": "#1A1D22",
        "p3": "#1A1D21"
      }
    ],
    "mork": [
      {
        "trinn": 1,
        "oklch": "oklch(16.0% 0.008 255)",
        "srgb": "#0B0D11",
        "p3": "#0B0D11"
      },
      {
        "trinn": 2,
        "oklch": "oklch(19.0% 0.009 255)",
        "srgb": "#111418",
        "p3": "#121417"
      },
      {
        "trinn": 3,
        "oklch": "oklch(22.8% 0.010 255)",
        "srgb": "#191D21",
        "p3": "#1A1D21"
      },
      {
        "trinn": 4,
        "oklch": "oklch(25.8% 0.010 255)",
        "srgb": "#202429",
        "p3": "#212428"
      },
      {
        "trinn": 5,
        "oklch": "oklch(28.8% 0.011 255)",
        "srgb": "#272B30",
        "p3": "#282B30"
      },
      {
        "trinn": 6,
        "oklch": "oklch(32.2% 0.011 255)",
        "srgb": "#303439",
        "p3": "#303439"
      },
      {
        "trinn": 7,
        "oklch": "oklch(37.6% 0.012 255)",
        "srgb": "#3D4248",
        "p3": "#3E4247"
      },
      {
        "trinn": 8,
        "oklch": "oklch(45.5% 0.012 255)",
        "srgb": "#52575E",
        "p3": "#53575D"
      },
      {
        "trinn": 9,
        "oklch": "oklch(54.0% 0.012 255)",
        "srgb": "#6A6F76",
        "p3": "#6B6F75"
      },
      {
        "trinn": 10,
        "oklch": "oklch(58.5% 0.012 255)",
        "srgb": "#777C83",
        "p3": "#787C82"
      },
      {
        "trinn": 11,
        "oklch": "oklch(76.0% 0.010 255)",
        "srgb": "#ADB1B7",
        "p3": "#AEB1B7"
      },
      {
        "trinn": 12,
        "oklch": "oklch(94.5% 0.005 255)",
        "srgb": "#EAEDF0",
        "p3": "#EBEDF0"
      }
    ]
  },
  "aksent": {
    "lys": [
      {
        "trinn": 1,
        "oklch": "oklch(99.2% 0.005 178)",
        "srgb": "#F9FEFC",
        "p3": "#FAFDFC"
      },
      {
        "trinn": 2,
        "oklch": "oklch(97.7% 0.011 178)",
        "srgb": "#F0FAF7",
        "p3": "#F2FAF7"
      },
      {
        "trinn": 3,
        "oklch": "oklch(95.0% 0.022 178)",
        "srgb": "#E0F4EE",
        "p3": "#E4F3EE"
      },
      {
        "trinn": 4,
        "oklch": "oklch(92.2% 0.034 178)",
        "srgb": "#CEEDE5",
        "p3": "#D4ECE5"
      },
      {
        "trinn": 5,
        "oklch": "oklch(89.2% 0.046 178)",
        "srgb": "#BCE6DB",
        "p3": "#C4E5DC"
      },
      {
        "trinn": 6,
        "oklch": "oklch(85.8% 0.056 178)",
        "srgb": "#AADDD0",
        "p3": "#B4DBD1"
      },
      {
        "trinn": 7,
        "oklch": "oklch(81.0% 0.066 178)",
        "srgb": "#92CFC1",
        "p3": "#9FCEC1"
      },
      {
        "trinn": 8,
        "oklch": "oklch(74.5% 0.080 178)",
        "srgb": "#71BDAC",
        "p3": "#83BBAD"
      },
      {
        "trinn": 9,
        "oklch": "oklch(55.0% 0.100 178)",
        "srgb": "#068472",
        "p3": "#3A8272"
      },
      {
        "trinn": 10,
        "oklch": "oklch(50.5% 0.100 178)",
        "srgb": "#007665",
        "p3": "#2C7565"
      },
      {
        "trinn": 11,
        "oklch": "oklch(48.0% 0.088 178)",
        "srgb": "#016d5e",
        "p3": "#2E6C5E"
      },
      {
        "trinn": 12,
        "oklch": "oklch(29.0% 0.045 178)",
        "srgb": "#0C332B",
        "p3": "#17322B"
      }
    ],
    "mork": [
      {
        "trinn": 1,
        "oklch": "oklch(17.5% 0.012 178)",
        "srgb": "#0b1210",
        "p3": "#0C1210"
      },
      {
        "trinn": 2,
        "oklch": "oklch(20.5% 0.017 178)",
        "srgb": "#0F1A17",
        "p3": "#111917"
      },
      {
        "trinn": 3,
        "oklch": "oklch(25.5% 0.030 178)",
        "srgb": "#112823",
        "p3": "#172723"
      },
      {
        "trinn": 4,
        "oklch": "oklch(29.5% 0.040 178)",
        "srgb": "#13332D",
        "p3": "#1B322D"
      },
      {
        "trinn": 5,
        "oklch": "oklch(33.5% 0.048 178)",
        "srgb": "#163F37",
        "p3": "#213E37"
      },
      {
        "trinn": 6,
        "oklch": "oklch(37.5% 0.056 178)",
        "srgb": "#194B41",
        "p3": "#274a41"
      },
      {
        "trinn": 7,
        "oklch": "oklch(43.5% 0.064 178)",
        "srgb": "#225D51",
        "p3": "#325B51"
      },
      {
        "trinn": 8,
        "oklch": "oklch(51.5% 0.076 178)",
        "srgb": "#2d7667",
        "p3": "#417468"
      },
      {
        "trinn": 9,
        "oklch": "oklch(72.0% 0.100 178)",
        "srgb": "#54B9A5",
        "p3": "#6FB7A5"
      },
      {
        "trinn": 10,
        "oklch": "oklch(76.5% 0.100 178)",
        "srgb": "#63C8B3",
        "p3": "#7DC5B3"
      },
      {
        "trinn": 11,
        "oklch": "oklch(80.0% 0.072 178)",
        "srgb": "#8ACDBE",
        "p3": "#99CCBE"
      },
      {
        "trinn": 12,
        "oklch": "oklch(94.0% 0.030 178)",
        "srgb": "#D7F2EB",
        "p3": "#DCF1EB"
      }
    ]
  }
} as const;

/** Merket: blekk på bladene og furu på stiften, lys og mørk. */
export const merke = {
  "blekk": {
    "lys": "#1D2430",
    "mork": "#E8EBF1"
  },
  "stift": {
    "lys": "#068472",
    "mork": "#54B9A5"
  }
} as const;

/**
 * Kundetema: logo, aksent og skrift som butikken kan velge, bare på tilbud/kontrakt (PDF), e-post til kunde og kundeportal.
 * Alle disse flatene er alltid lyse. Kundens egne skrifter står bare i kundens eget tema.
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
      "merknad": "Kundetema-standard"
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
      "merknad": "Kundetema-standard"
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
    "eksempel-interior-as": {
      "navn": "Eksempel Interiør AS",
      "logo": "eksempel",
      "aksent": "#B0523A",
      "paaAksent": "#FBF9F6",
      "skrift": {
        "tekst": "Inter",
        "overskrift": "Newsreader",
        "kilde": "fri liste"
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

/**
 * Produktpaletter (designsystem 2.5, K-371): ute (lys og mork), nettsider, crm og admin (bare lys). Nøklene er rolle-/variabelnavnene i
 * data-produkt-blokkene i tokens.css: grunn = --flate-side, grunn-hevet = --flate-kort, grunn-senket = --flate-senket, prikk = --merke-stift.
 */
export const produkt = {
  "ute": {
    "navn": "Hengsel Ute (grønn)",
    "gjelder": [
      "Hengsel Ute",
      "montørappen"
    ],
    "modus": [
      "lys",
      "mork"
    ],
    "lys": {
      "aksent": "#05806F",
      "aksent-trykk": "#007665",
      "aksent-tekst": "#016d5e",
      "aksent-svak": "#E0F4EE",
      "aksent-valgt": "#BCE6DB",
      "paa-aksent": "#FBF9F6",
      "prikk": "#068472",
      "flate-valgt": "#E0F4EE",
      "grunn": "#F6F8FB",
      "grunn-hevet": "#FBFDFF",
      "grunn-senket": "#EFF1F4",
      "tekst": "#1A1D22",
      "tekst-dempet": "#51565C",
      "tekst-svak": "#686E75"
    },
    "mork": {
      "aksent": "#54B9A5",
      "aksent-trykk": "#63C8B3",
      "aksent-tekst": "#8ACDBE",
      "aksent-svak": "#112823",
      "aksent-valgt": "#163F37",
      "paa-aksent": "#0D1013",
      "prikk": "#54B9A5",
      "flate-valgt": "#13332D",
      "grunn": "#0B0D11",
      "grunn-hevet": "#111418",
      "grunn-senket": "#06080B",
      "tekst": "#EAEDF0",
      "tekst-dempet": "#ADB1B7",
      "tekst-svak": "#90969D"
    }
  },
  "nettsider": {
    "navn": "Nettsider (oransje)",
    "gjelder": [
      "hengsel.no",
      "vis.hengsel.no",
      "design.hengsel.no",
      "admin.hengsel.no",
      "demo.hengsel.no",
      "bilder.hengsel.no"
    ],
    "modus": [
      "lys"
    ],
    "lys": {
      "aksent": "#AD5626",
      "aksent-trykk": "#99440F",
      "aksent-tekst": "#964109",
      "aksent-svak": "#F8F1EE",
      "aksent-valgt": "#EFDDD4",
      "paa-aksent": "#FBF9F6",
      "prikk": "#B54F00",
      "flate-valgt": "#F8F1EE",
      "grunn": "#FAF6F2",
      "grunn-hevet": "#FEFDFB",
      "grunn-senket": "#F3EFE9",
      "tekst": "#272D38",
      "tekst-dempet": "#4E535C",
      "tekst-svak": "#666A71"
    },
    "lys-okt-kontrast": {
      "aksent": "#964109",
      "aksent-trykk": "#7E3400",
      "aksent-tekst": "#833600",
      "aksent-svak": "#F8F1EE",
      "aksent-valgt": "#EAD3C7",
      "paa-aksent": "#FBF9F6",
      "prikk": "#B54F00",
      "flate-valgt": "#F8F1EE",
      "grunn": "#FAF6F2",
      "grunn-hevet": "#FEFDFB",
      "grunn-senket": "#F3EFE9",
      "tekst": "#151B25",
      "tekst-dempet": "#3D424B",
      "tekst-svak": "#4B4F55"
    },
    "p3": {
      "lys": {
        "aksent": "#A25B32",
        "aksent-trykk": "#8E491F",
        "aksent-tekst": "#8C461C",
        "aksent-svak": "#F7F1EE",
        "aksent-valgt": "#ECDED5",
        "paa-aksent": "#FBF9F6",
        "prikk": "#A8551F",
        "flate-valgt": "#F7F1EE",
        "grunn": "#F9F6F2",
        "grunn-hevet": "#FEFDFB",
        "grunn-senket": "#F2EFEA",
        "tekst": "#282D37",
        "tekst-dempet": "#4F535B",
        "tekst-svak": "#676A70"
      },
      "lys-okt-kontrast": {
        "aksent": "#8C461C",
        "aksent-trykk": "#753812",
        "aksent-tekst": "#7A3B13",
        "aksent-svak": "#F7F1EE",
        "aksent-valgt": "#E6D4C9",
        "paa-aksent": "#FBF9F6",
        "prikk": "#A8551F",
        "flate-valgt": "#F7F1EE",
        "grunn": "#F9F6F2",
        "grunn-hevet": "#FEFDFB",
        "grunn-senket": "#F2EFEA",
        "tekst": "#161B24",
        "tekst-dempet": "#3E424A",
        "tekst-svak": "#4C4F54"
      }
    }
  },
  "crm": {
    "navn": "Hengsel CRM (blå, PC)",
    "gjelder": [
      "Hengsel CRM",
      "kundeportalen"
    ],
    "modus": [
      "lys"
    ],
    "lys": {
      "aksent": "#4C5FCB",
      "aksent-trykk": "#3D4DB7",
      "aksent-tekst": "#3A49A8",
      "aksent-svak": "#F6F7FC",
      "aksent-valgt": "#EAECF9",
      "paa-aksent": "#FBF9F6",
      "prikk": "#5165D3",
      "flate-valgt": "#EAECF9",
      "grunn": "#F1F1EF",
      "grunn-hevet": "#F9F9F7",
      "grunn-senket": "#EAEAE8",
      "tekst": "#232A34",
      "tekst-dempet": "#4D525B",
      "tekst-svak": "#64686F",
      "grunn-overlegg": "#FFFFFF",
      "tekst-invers": "#F9F9F7",
      "tekst-lenke": "#3A49A8",
      "kant": "#C7C6C3",
      "kant-sterk": "#656970",
      "skillelinje-tabell": "#E9E8E5",
      "kant-fokus": "#4C5FCB",
      "rad-stripe": "#F3F4F2",
      "rad-hover": "#F6F7FC",
      "tabellhode": "#EAEAE8",
      "tabellhode-tekst": "#4D525B",
      "sumrad": "#F9F9F7",
      "felt-bakgrunn": "#FFFFFF",
      "felt-kant": "#888B90",
      "felt-kant-fokus": "#4C5FCB",
      "felt-tekst": "#232A34",
      "felt-plassholder": "#64686F",
      "felt-feil": "#9E2D28",
      "felt-deaktivert": "#EAEAE8"
    },
    "lys-okt-kontrast": {
      "aksent": "#3A49B4",
      "aksent-trykk": "#2D37A0",
      "aksent-tekst": "#303D9B",
      "aksent-svak": "#F6F7FC",
      "aksent-valgt": "#E2E5F7",
      "paa-aksent": "#FBF9F6",
      "prikk": "#5165D3",
      "flate-valgt": "#E2E5F7",
      "grunn": "#F1F1EF",
      "grunn-hevet": "#F9F9F7",
      "grunn-senket": "#EAEAE8",
      "tekst": "#101620",
      "tekst-dempet": "#393E47",
      "tekst-svak": "#474B52",
      "grunn-overlegg": "#FFFFFF",
      "tekst-invers": "#F9F9F7",
      "tekst-lenke": "#303D9B",
      "kant": "#ADACA9",
      "kant-sterk": "#52555C",
      "skillelinje-tabell": "#D1D0CD",
      "kant-fokus": "#3A49B4",
      "rad-stripe": "#F3F4F2",
      "rad-hover": "#F6F7FC",
      "tabellhode": "#EAEAE8",
      "tabellhode-tekst": "#393E47",
      "sumrad": "#F9F9F7",
      "felt-bakgrunn": "#FFFFFF",
      "felt-kant": "#6B6E73",
      "felt-kant-fokus": "#3A49B4",
      "felt-tekst": "#101620",
      "felt-plassholder": "#474B52",
      "felt-feil": "#780007",
      "felt-deaktivert": "#EAEAE8"
    },
    "p3": {
      "lys": {
        "aksent": "#505EC4",
        "aksent-trykk": "#404DB1",
        "aksent-tekst": "#3D49A2",
        "aksent-svak": "#F6F7FC",
        "aksent-valgt": "#EAECF8",
        "paa-aksent": "#FBF9F6",
        "prikk": "#5564CC",
        "flate-valgt": "#EAECF8",
        "grunn": "#F1F1EF",
        "grunn-hevet": "#F9F9F7",
        "grunn-senket": "#EAEAE8",
        "tekst": "#242A33",
        "tekst-dempet": "#4E525A",
        "tekst-svak": "#65686E",
        "grunn-overlegg": "#FFFFFF",
        "tekst-invers": "#F9F9F7",
        "tekst-lenke": "#3D49A2",
        "kant": "#C7C6C3",
        "kant-sterk": "#66696F",
        "skillelinje-tabell": "#E9E8E5",
        "kant-fokus": "#505EC4",
        "rad-stripe": "#F3F4F2",
        "rad-hover": "#F6F7FC",
        "tabellhode": "#EAEAE8",
        "tabellhode-tekst": "#4E525A",
        "sumrad": "#F9F9F7",
        "felt-bakgrunn": "#FFFFFF",
        "felt-kant": "#898B90",
        "felt-kant-fokus": "#505EC4",
        "felt-tekst": "#242A33",
        "felt-plassholder": "#65686E",
        "felt-feil": "#92362E",
        "felt-deaktivert": "#EAEAE8"
      },
      "lys-okt-kontrast": {
        "aksent": "#3D49AE",
        "aksent-trykk": "#2F379A",
        "aksent-tekst": "#333D95",
        "aksent-svak": "#F6F7FC",
        "aksent-valgt": "#E3E5F5",
        "paa-aksent": "#FBF9F6",
        "prikk": "#5564CC",
        "flate-valgt": "#E3E5F5",
        "grunn": "#F1F1EF",
        "grunn-hevet": "#F9F9F7",
        "grunn-senket": "#EAEAE8",
        "tekst": "#11161F",
        "tekst-dempet": "#3A3E46",
        "tekst-svak": "#484B51",
        "grunn-overlegg": "#FFFFFF",
        "tekst-invers": "#F9F9F7",
        "tekst-lenke": "#333D95",
        "kant": "#ADACA9",
        "kant-sterk": "#53555B",
        "skillelinje-tabell": "#D1D0CD",
        "kant-fokus": "#3D49AE",
        "rad-stripe": "#F3F4F2",
        "rad-hover": "#F6F7FC",
        "tabellhode": "#EAEAE8",
        "tabellhode-tekst": "#3A3E46",
        "sumrad": "#F9F9F7",
        "felt-bakgrunn": "#FFFFFF",
        "felt-kant": "#6C6E73",
        "felt-kant-fokus": "#3D49AE",
        "felt-tekst": "#11161F",
        "felt-plassholder": "#484B51",
        "felt-feil": "#6E1210",
        "felt-deaktivert": "#EAEAE8"
      }
    },
    "status": {
      "lys": {
        "ny": {
          "fg": "#405B85",
          "bg": "#D4DDEA",
          "kant": "#9CB3D4"
        },
        "pagar": {
          "fg": "#5C46A7",
          "bg": "#DCDBEC",
          "kant": "#B1A9E7"
        },
        "venter": {
          "fg": "#555B64",
          "bg": "#D6DEE8",
          "kant": "#ABB3BC"
        },
        "sannsynlig": {
          "fg": "#80378C",
          "bg": "#EAD7ED",
          "kant": "#CEA0D5"
        },
        "ferdig": {
          "fg": "#1F6D02",
          "bg": "#CFE2CA",
          "kant": "#92BF88"
        },
        "advarsel": {
          "fg": "#6D5000",
          "bg": "#F0DAAE",
          "kant": "#D2B271"
        },
        "feil": {
          "fg": "#9E2D28",
          "bg": "#ECD9D6",
          "kant": "#E69C94"
        }
      },
      "lys-okt-kontrast": {
        "ny": {
          "fg": "#233D64",
          "bg": "#D8DDE5",
          "kant": "#465D7D"
        },
        "pagar": {
          "fg": "#402584",
          "bg": "#DCDCE5",
          "kant": "#5C4B9E"
        },
        "venter": {
          "fg": "#383E46",
          "bg": "#D7DDE5",
          "kant": "#555C64"
        },
        "sannsynlig": {
          "fg": "#5F136A",
          "bg": "#E4D9E5",
          "kant": "#7C3E86"
        },
        "ferdig": {
          "fg": "#104B00",
          "bg": "#CEE3CA",
          "kant": "#2C6B1B"
        },
        "advarsel": {
          "fg": "#503900",
          "bg": "#E5DCCB",
          "kant": "#755600"
        },
        "feil": {
          "fg": "#780007",
          "bg": "#E5DAD8",
          "kant": "#973830"
        }
      },
      "p3": {
        "lys": {
          "ny": {
            "fg": "#465A82",
            "bg": "#D6DDE9",
            "kant": "#A0B2D1"
          },
          "pagar": {
            "fg": "#5947A1",
            "bg": "#DCDBEB",
            "kant": "#B0A9E2"
          },
          "venter": {
            "fg": "#565B63",
            "bg": "#D7DEE7",
            "kant": "#ACB3BB"
          },
          "sannsynlig": {
            "fg": "#773B88",
            "bg": "#E7D8EB",
            "kant": "#C7A2D2"
          },
          "ferdig": {
            "fg": "#376B1C",
            "bg": "#D3E1CC",
            "kant": "#9BBE8D"
          },
          "advarsel": {
            "fg": "#695117",
            "bg": "#ECDBB3",
            "kant": "#CDB37A"
          },
          "feil": {
            "fg": "#92362E",
            "bg": "#E9DAD7",
            "kant": "#DB9F97"
          }
        },
        "lys-okt-kontrast": {
          "ny": {
            "fg": "#293C61",
            "bg": "#D9DDE4",
            "kant": "#4B5C7A"
          },
          "pagar": {
            "fg": "#3C267F",
            "bg": "#DCDCE4",
            "kant": "#594C99"
          },
          "venter": {
            "fg": "#393E45",
            "bg": "#D8DDE4",
            "kant": "#565C63"
          },
          "sannsynlig": {
            "fg": "#571A66",
            "bg": "#E2D9E4",
            "kant": "#744182"
          },
          "ferdig": {
            "fg": "#234A10",
            "bg": "#D2E2CC",
            "kant": "#3D6A28"
          },
          "advarsel": {
            "fg": "#4D3A0E",
            "bg": "#E3DCCD",
            "kant": "#705719"
          },
          "feil": {
            "fg": "#6E1210",
            "bg": "#E3DAD8",
            "kant": "#8C3E35"
          }
        }
      }
    },
    "maal": {
      "rad": "40px",
      "rad-tett": "36px",
      "felt-hoyde": "36px",
      "knapp-hoyde": "36px",
      "sidemeny-rad": "36px",
      "ikon": "16px",
      "ikon-stor": "20px",
      "font-grunn": "14px",
      "linjehoyde": "1.4286",
      "font-tabell": "13px",
      "linjehoyde-tabell": "18px",
      "font-meta": "12px",
      "font-pille": "12px",
      "font-korttittel": "16px",
      "font-sidetittel": "20px",
      "vekt-sidetittel": "600",
      "radius-felt": "6px",
      "radius-knapp": "6px",
      "radius-knapp-stor": "6px",
      "radius-kort": "10px",
      "trykk-min": "32px"
    },
    "skygge": {
      "kort": "0 1px 2px rgba(29,36,48,.05)",
      "skuff": "0 0 0 1px rgba(29,36,48,.06), -8px 0 24px -12px rgba(29,36,48,.18)",
      "dialog": "0 0 0 1px rgba(29,36,48,.06), 0 12px 32px -12px rgba(29,36,48,.20)"
    },
    "overlegg": "rgba(29,36,48,.32)",
    "fokus": {
      "innside": "#FFFFFF",
      "innside-bredde": "1px",
      "ytre": "3px"
    }
  },
  "admin": {
    "navn": "Hengsel Admin (lilla, PC)",
    "gjelder": [
      "admin.hengsel.no",
      "Innstillinger 21-901–911 i CRM",
      "brukere",
      "butikker"
    ],
    "modus": [
      "lys"
    ],
    "lys": {
      "aksent": "#7233AC",
      "aksent-trykk": "#611E98",
      "aksent-tekst": "#6929A2",
      "aksent-svak": "#F8F5FB",
      "aksent-valgt": "#EEE7F5",
      "paa-aksent": "#FBF9F6",
      "prikk": "#8348BE",
      "flate-valgt": "#EEE7F5",
      "grunn": "#F1F1EF",
      "grunn-hevet": "#F9F9F7",
      "grunn-senket": "#EAEAE8",
      "tekst": "#232A34",
      "tekst-dempet": "#4D525B",
      "tekst-svak": "#64686F",
      "grunn-overlegg": "#FFFFFF",
      "tekst-invers": "#F9F9F7",
      "tekst-lenke": "#6929A2",
      "kant": "#C7C6C3",
      "kant-sterk": "#656970",
      "skillelinje-tabell": "#E9E8E5",
      "kant-fokus": "#7233AC",
      "rad-stripe": "#F3F4F2",
      "rad-hover": "#F8F5FB",
      "tabellhode": "#EAEAE8",
      "tabellhode-tekst": "#4D525B",
      "sumrad": "#F9F9F7",
      "felt-bakgrunn": "#FFFFFF",
      "felt-kant": "#888B90",
      "felt-kant-fokus": "#7233AC",
      "felt-tekst": "#232A34",
      "felt-plassholder": "#64686F",
      "felt-feil": "#9E2D28",
      "felt-deaktivert": "#EAEAE8"
    },
    "lys-okt-kontrast": {
      "aksent": "#5F1A95",
      "aksent-trykk": "#4E007F",
      "aksent-tekst": "#570B8B",
      "aksent-svak": "#F7F4FA",
      "aksent-valgt": "#E8DEF2",
      "paa-aksent": "#FBF9F6",
      "prikk": "#8348BE",
      "flate-valgt": "#E8DEF2",
      "grunn": "#F1F1EF",
      "grunn-hevet": "#F9F9F7",
      "grunn-senket": "#EAEAE8",
      "tekst": "#101620",
      "tekst-dempet": "#373C45",
      "tekst-svak": "#45484F",
      "grunn-overlegg": "#FFFFFF",
      "tekst-invers": "#F9F9F7",
      "tekst-lenke": "#570B8B",
      "kant": "#ADACA9",
      "kant-sterk": "#52555C",
      "skillelinje-tabell": "#D1D0CD",
      "kant-fokus": "#5F1A95",
      "rad-stripe": "#F3F4F2",
      "rad-hover": "#F7F4FA",
      "tabellhode": "#EAEAE8",
      "tabellhode-tekst": "#373C45",
      "sumrad": "#F9F9F7",
      "felt-bakgrunn": "#FFFFFF",
      "felt-kant": "#6B6E73",
      "felt-kant-fokus": "#5F1A95",
      "felt-tekst": "#101620",
      "felt-plassholder": "#45484F",
      "felt-feil": "#780007",
      "felt-deaktivert": "#EAEAE8"
    },
    "p3": {
      "lys": {
        "aksent": "#6A37A6",
        "aksent-trykk": "#592392",
        "aksent-tekst": "#612D9C",
        "aksent-svak": "#F7F5FB",
        "aksent-valgt": "#EDE7F4",
        "paa-aksent": "#FBF9F6",
        "prikk": "#7B4BB8",
        "flate-valgt": "#EDE7F4",
        "grunn": "#F1F1EF",
        "grunn-hevet": "#F9F9F7",
        "grunn-senket": "#EAEAE8",
        "tekst": "#242A33",
        "tekst-dempet": "#4E525A",
        "tekst-svak": "#65686E",
        "grunn-overlegg": "#FFFFFF",
        "tekst-invers": "#F9F9F7",
        "tekst-lenke": "#612D9C",
        "kant": "#C7C6C3",
        "kant-sterk": "#66696F",
        "skillelinje-tabell": "#E9E8E5",
        "kant-fokus": "#6A37A6",
        "rad-stripe": "#F3F4F2",
        "rad-hover": "#F7F5FB",
        "tabellhode": "#EAEAE8",
        "tabellhode-tekst": "#4E525A",
        "sumrad": "#F9F9F7",
        "felt-bakgrunn": "#FFFFFF",
        "felt-kant": "#898B90",
        "felt-kant-fokus": "#6A37A6",
        "felt-tekst": "#242A33",
        "felt-plassholder": "#65686E",
        "felt-feil": "#92362E",
        "felt-deaktivert": "#EAEAE8"
      },
      "lys-okt-kontrast": {
        "aksent": "#571F8F",
        "aksent-trykk": "#47087A",
        "aksent-tekst": "#4F1386",
        "aksent-svak": "#F6F4FA",
        "aksent-valgt": "#E6DEF0",
        "paa-aksent": "#FBF9F6",
        "prikk": "#7B4BB8",
        "flate-valgt": "#E6DEF0",
        "grunn": "#F1F1EF",
        "grunn-hevet": "#F9F9F7",
        "grunn-senket": "#EAEAE8",
        "tekst": "#11161F",
        "tekst-dempet": "#383C44",
        "tekst-svak": "#46484E",
        "grunn-overlegg": "#FFFFFF",
        "tekst-invers": "#F9F9F7",
        "tekst-lenke": "#4F1386",
        "kant": "#ADACA9",
        "kant-sterk": "#53555B",
        "skillelinje-tabell": "#D1D0CD",
        "kant-fokus": "#571F8F",
        "rad-stripe": "#F3F4F2",
        "rad-hover": "#F6F4FA",
        "tabellhode": "#EAEAE8",
        "tabellhode-tekst": "#383C44",
        "sumrad": "#F9F9F7",
        "felt-bakgrunn": "#FFFFFF",
        "felt-kant": "#6C6E73",
        "felt-kant-fokus": "#571F8F",
        "felt-tekst": "#11161F",
        "felt-plassholder": "#46484E",
        "felt-feil": "#6E1210",
        "felt-deaktivert": "#EAEAE8"
      }
    },
    "status": {
      "lys": {
        "ny": {
          "fg": "#405B85",
          "bg": "#D4DDEA",
          "kant": "#9CB3D4"
        },
        "pagar": {
          "fg": "#5C46A7",
          "bg": "#DCDBEC",
          "kant": "#B1A9E7"
        },
        "venter": {
          "fg": "#555B64",
          "bg": "#D6DEE8",
          "kant": "#ABB3BC"
        },
        "sannsynlig": {
          "fg": "#80378C",
          "bg": "#EAD7ED",
          "kant": "#CEA0D5"
        },
        "ferdig": {
          "fg": "#1F6D02",
          "bg": "#CFE2CA",
          "kant": "#92BF88"
        },
        "advarsel": {
          "fg": "#6D5000",
          "bg": "#F0DAAE",
          "kant": "#D2B271"
        },
        "feil": {
          "fg": "#9E2D28",
          "bg": "#ECD9D6",
          "kant": "#E69C94"
        }
      },
      "lys-okt-kontrast": {
        "ny": {
          "fg": "#233D64",
          "bg": "#D8DDE5",
          "kant": "#465D7D"
        },
        "pagar": {
          "fg": "#402584",
          "bg": "#DCDCE5",
          "kant": "#5C4B9E"
        },
        "venter": {
          "fg": "#383E46",
          "bg": "#D7DDE5",
          "kant": "#555C64"
        },
        "sannsynlig": {
          "fg": "#5F136A",
          "bg": "#E4D9E5",
          "kant": "#7C3E86"
        },
        "ferdig": {
          "fg": "#104B00",
          "bg": "#CEE3CA",
          "kant": "#2C6B1B"
        },
        "advarsel": {
          "fg": "#503900",
          "bg": "#E5DCCB",
          "kant": "#755600"
        },
        "feil": {
          "fg": "#780007",
          "bg": "#E5DAD8",
          "kant": "#973830"
        }
      },
      "p3": {
        "lys": {
          "ny": {
            "fg": "#465A82",
            "bg": "#D6DDE9",
            "kant": "#A0B2D1"
          },
          "pagar": {
            "fg": "#5947A1",
            "bg": "#DCDBEB",
            "kant": "#B0A9E2"
          },
          "venter": {
            "fg": "#565B63",
            "bg": "#D7DEE7",
            "kant": "#ACB3BB"
          },
          "sannsynlig": {
            "fg": "#773B88",
            "bg": "#E7D8EB",
            "kant": "#C7A2D2"
          },
          "ferdig": {
            "fg": "#376B1C",
            "bg": "#D3E1CC",
            "kant": "#9BBE8D"
          },
          "advarsel": {
            "fg": "#695117",
            "bg": "#ECDBB3",
            "kant": "#CDB37A"
          },
          "feil": {
            "fg": "#92362E",
            "bg": "#E9DAD7",
            "kant": "#DB9F97"
          }
        },
        "lys-okt-kontrast": {
          "ny": {
            "fg": "#293C61",
            "bg": "#D9DDE4",
            "kant": "#4B5C7A"
          },
          "pagar": {
            "fg": "#3C267F",
            "bg": "#DCDCE4",
            "kant": "#594C99"
          },
          "venter": {
            "fg": "#393E45",
            "bg": "#D8DDE4",
            "kant": "#565C63"
          },
          "sannsynlig": {
            "fg": "#571A66",
            "bg": "#E2D9E4",
            "kant": "#744182"
          },
          "ferdig": {
            "fg": "#234A10",
            "bg": "#D2E2CC",
            "kant": "#3D6A28"
          },
          "advarsel": {
            "fg": "#4D3A0E",
            "bg": "#E3DCCD",
            "kant": "#705719"
          },
          "feil": {
            "fg": "#6E1210",
            "bg": "#E3DAD8",
            "kant": "#8C3E35"
          }
        }
      }
    },
    "maal": {
      "rad": "40px",
      "rad-tett": "36px",
      "felt-hoyde": "36px",
      "knapp-hoyde": "36px",
      "sidemeny-rad": "36px",
      "ikon": "16px",
      "ikon-stor": "20px",
      "font-grunn": "14px",
      "linjehoyde": "1.4286",
      "font-tabell": "13px",
      "linjehoyde-tabell": "18px",
      "font-meta": "12px",
      "font-pille": "12px",
      "font-korttittel": "16px",
      "font-sidetittel": "20px",
      "vekt-sidetittel": "600",
      "radius-felt": "6px",
      "radius-knapp": "6px",
      "radius-knapp-stor": "6px",
      "radius-kort": "10px",
      "trykk-min": "32px"
    },
    "skygge": {
      "kort": "0 1px 2px rgba(29,36,48,.05)",
      "skuff": "0 0 0 1px rgba(29,36,48,.06), -8px 0 24px -12px rgba(29,36,48,.18)",
      "dialog": "0 0 0 1px rgba(29,36,48,.06), 0 12px 32px -12px rgba(29,36,48,.20)"
    },
    "overlegg": "rgba(29,36,48,.32)",
    "fokus": {
      "innside": "#FFFFFF",
      "innside-bredde": "1px",
      "ytre": "3px"
    }
  }
} as const;

/** Hastenivåene (aliaser til statustonene, ingen nye farger) og stripebredden i px */
export const nivaa = {
  "haster": "feil",
  "snart": "advarsel",
  "stripe": 3
} as const;

export type Produkt = keyof typeof produkt;

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
export type Variant = 'lys' | 'mork' | 'lys-okt-kontrast' | 'mork-okt-kontrast';

const variantFor = (modus: Modus, oktKontrast: boolean): Variant => (oktKontrast ? `${modus}-okt-kontrast` : modus);

/** Fargen til en rolle i lys eller mørk utgave, med økt kontrast om ønsket */
export function farge(rolle: Rolle, modus: Modus = 'lys', oktKontrast = false): string {
  return roller[rolle][variantFor(modus, oktKontrast)];
}

/** Display P3-verdien (hex-sifre i P3) for en rolle, eller undefined når rollen ikke har P3 */
export function fargeP3(rolle: Rolle, modus: Modus = 'lys', oktKontrast = false): string | undefined {
  const p3 = (roller[rolle] as { p3?: Record<Variant, string> }).p3;
  return p3?.[variantFor(modus, oktKontrast)];
}

/** Fargene til en statuston i lys eller mørk utgave */
export function toneFarge(tone: Tone, modus: Modus = 'lys', oktKontrast = false): { fg: string; bg: string; kant?: string } {
  return status[tone][variantFor(modus, oktKontrast)] as { fg: string; bg: string; kant?: string };
}

/** CSS-skygge (box-shadow) for et navn og en utgave */
export function skyggeCss(navn: keyof typeof skygge, modus: Modus = 'lys'): string {
  const lag = skygge[navn][modus] as ReadonlyArray<readonly [number, number, number, string]>;
  return lag.length === 0 ? 'none' : lag.map(([x, y, blur, f]) => `${x}px ${y}px ${blur}px ${f}`).join(', ');
}
