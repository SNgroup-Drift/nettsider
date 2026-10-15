// GENERERT av scripts/design/lag-tokens.mjs fra tokens/hengsel.tokens.json. Ikke rediger for hånd.
// Hengsel-designsystemet, versjon 2.1.0 (palett «blekk med furu», K-206). Brukes av CRM (src) og Expo-montørappen (montorapp).

export const versjon = "2.1.0" as const;

/** Merkefargene (råfarger): blekk, furu og produktfargene. Bruk rollene under i komponenter. */
export const palett = {
  "blekk": "#1D2430",
  "blekk-mork": "#E8EBF1",
  "furu": "#068472",
  "aksent-mork": "#54B9A5",
  "produkt-crm": "#5165D3",
  "produkt-crm-mork": "#859DFF",
  "produkt-ute": "#B54F00",
  "produkt-ute-mork": "#F77E35",
  "produkt-levering": "#1C8742",
  "produkt-levering-mork": "#5BBD74",
  "produkt-admin": "#70757C",
  "produkt-admin-mork": "#A6ABB2"
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
    "tabell": "tabular-nums"
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
