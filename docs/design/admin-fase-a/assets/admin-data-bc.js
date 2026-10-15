/* Hengsel Admin, fase B, C og Drift (S-62, 15.10.2026). Eksempeldata, alt er oppdiktet. «Nå» i tegningene: onsdag 14.10.2026 kl. 10:20, som i fase A.
   Admin har egen database. Fra kundemiljøene leses bare tall: brukere, siste innlogging, versjon og feil. Ingen ordre eller sluttkunder. */
window.AdminBC = {
  naa: '14.10.2026 10:20',
  eksempel: {
    timepris: 1150,
    svarfrist: { kritisk: '1 time', hoy: '4 timer', normal: '1 virkedag', lav: '3 virkedager' },
    kpiVarselDager: 30,
    leverandor: 'ES-Holding AS'
  },
  /* Meny. type p = punkt, g = gruppe. fil: a = 60-201, b = 60-207. roller: hvem ser punktet */
  meny: [
    ['p', 'oversikt', 'Oversikt', 'oversikt', 'a', 'e'],
    ['g', 'Salg', '', '', '', 'e'],
    ['p', 'tavle', 'Tavle', 'salgstavle', 'a', 'e', 1],
    ['p', 'eiere', 'Eiere og butikker', 'utstillinger', 'a', 'e', 1],
    ['p', 'pris', 'Prisberegner', 'etterkalkyler', 'a', 'e', 1],
    ['p', 'kunder', 'Kunder', 'kunder', 'a', 'es'],
    ['p', 'avtaler', 'Avtaler', 'signert', 'a', 'e'],
    ['g', 'Support', '', '', '', 'es'],
    ['p', 'saker', 'Saker', 'saker', 'b', 'es', 1],
    ['p', 'timer', 'Timer', 'kalender', 'b', 'es', 1],
    ['p', 'oppstart', 'Oppstart', 'prosjektplan', 'b', 'e'],
    ['g', 'Fakturering', '', '', '', 'e'],
    ['p', 'abonnement', 'Abonnement', 'ordre', 'b', 'e', 1],
    ['p', 'kjoring', 'Fakturakjøring', 'fakturaer', 'b', 'e', 1],
    ['p', 'kpi', 'KPI', 'prisavvik', 'b', 'e', 1],
    ['p', 'utestaende', 'Utestående', 'forskudd-leverandor', 'b', 'e', 1],
    ['p', 'tall', 'Tall', 'rapporter', 'b', 'e'],
    ['g', 'Drift', '', '', '', 'e'],
    ['p', 'd-status', 'Status', 'resultater', 'b', 'e', 1],
    ['p', 'd-lenker', 'Lenker', 'lenke', 'b', 'e', 1],
    ['p', 'd-kontoer', 'Kontoer', 'profil', 'b', 'e', 1],
    ['p', 'd-frister', 'Frister', 'frist', 'b', 'e', 1],
    ['p', 'd-rutiner', 'Rutiner', 'kontrollmal', 'b', 'e', 1],
    ['p', 'innstillinger', 'Innstillinger', 'innstillinger', 'b', 'e']
  ],
  filer: { a: '60-201_admin_pc.dc.html', b: '60-207_admin_pc_fase_bc.dc.html' },
  roller: {
    eirik: { navn: 'Eirik', under: 'Eier av Admin', init: 'E', kode: 'e' },
    support: { navn: 'Supportperson', under: 'Rolle: Support', init: 'S', kode: 's' }
  },

  /* SUPPORT */
  prioriteter: { kritisk: 'Kritisk', hoy: 'Høy', normal: 'Normal', lav: 'Lav' },
  kilder: { crm: '«Hjelp» i CRM', ute: '«Hjelp» i Ute', epost: 'E-post' },
  saker: [
    { nr: 'H-1048', emne: 'Montørene får ikke åpnet dagens oppdrag', eier: 'granlund', butikk: 'Granlund Drammen', kontakt: 'Mette Aas', kilde: 'ute', prioritet: 'kritisk', status: 'ny', opprettet: '14.10 10:02', frist: '42 min igjen', fristTilstand: 'snart', sist: '10:02' },
    { nr: 'H-1047', emne: 'Logoen mangler på tilbud-PDF', eier: 'strand', butikk: 'Strand Interiør Kvadraturen', kontakt: 'Eva Strand', kilde: 'crm', prioritet: 'hoy', status: 'aapen', opprettet: '14.10 08:05', frist: '1 t 45 min igjen', fristTilstand: 'ok', sist: '09:58' },
    { nr: 'H-1046', emne: 'Hvordan legger vi til en ny selger?', eier: 'aune', butikk: 'Aune Kjøkken Bodø', kontakt: 'Bjørn Aune', kilde: 'epost', prioritet: 'normal', status: 'aapen', opprettet: '13.10 09:30', frist: 'Forfalt 50 min', fristTilstand: 'forfalt', sist: '13.10 09:30' },
    { nr: 'H-1045', emne: 'Import av kundeliste fra gammelt system', eier: 'vestby', butikk: 'Vestby Kjøkken', kontakt: 'Anne Vestby', kilde: 'crm', prioritet: 'normal', status: 'venter', opprettet: '12.10 13:15', frist: 'Pause, venter på kunden', fristTilstand: 'pause', sist: '13.10 11:40' },
    { nr: 'H-1044', emne: 'Oktoberrapporten viser feil sum', eier: 'granlund', butikk: 'Granlund Hønefoss', kontakt: 'Lars Granlund', kilde: 'crm', prioritet: 'hoy', status: 'aapen', opprettet: '13.10 15:10', frist: 'Forfalt 10 min', fristTilstand: 'forfalt', sist: '13.10 15:42' },
    { nr: 'H-1043', emne: 'Ønske: eksport av montørtimer til Excel', eier: 'strand', butikk: 'Strand Interiør Sørlandsparken', kontakt: 'Eva Strand', kilde: 'epost', prioritet: 'lav', status: 'aapen', opprettet: '12.10 14:20', frist: '1 d 4 t igjen', fristTilstand: 'ok', sist: '12.10 14:20' },
    { nr: 'H-1042', emne: 'Bilder lastes ikke opp fra montasje', eier: 'aune', butikk: 'Aune Kjøkken Fauske', kontakt: 'Bjørn Aune', kilde: 'ute', prioritet: 'hoy', status: 'lost', opprettet: '12.10 07:50', frist: 'Løst 12.10 10:05', fristTilstand: 'lost', sist: '12.10 10:05' },
    { nr: 'H-1041', emne: 'Feil adresse på ordrebekreftelse', eier: 'granlund', butikk: 'Granlund Kongsberg', kontakt: 'Mette Aas', kilde: 'crm', prioritet: 'normal', status: 'lost', opprettet: '09.10 12:00', frist: 'Løst 09.10 15:30', fristTilstand: 'lost', sist: '09.10 15:30' },
    { nr: 'H-1040', emne: 'Kan ikke logge inn etter nytt passord', eier: 'vestby', butikk: 'Vestby Kjøkken', kontakt: 'Anne Vestby', kilde: 'epost', prioritet: 'kritisk', status: 'lost', opprettet: '08.10 08:10', frist: 'Løst 08.10 08:55', fristTilstand: 'lost', sist: '08.10 08:55' }
  ],
  sak: {
    nr: 'H-1047',
    hjelp: { side: 'Tilbud › T-2026-118 › Forhåndsvis PDF', adresse: 'strand.hengsel.no/tilbud/T-2026-118', versjon: 'Hengsel CRM 2.0.4', nettleser: 'Chrome 129 · Windows 11 · 1920 × 1080', skjermbilde: 'skjermbilde-tilbud-pdf.png', bruker: 'Eva Strand (admin i CRM)' },
    traad: [
      { type: 'kunde', hvem: 'Eva Strand', tid: '14.10 08:05', kanal: 'Sendt med «Hjelp» i CRM', tekst: 'Logoen vår kommer ikke med når vi lager PDF av tilbudet. Den vises på skjermen, men ikke i PDF-en. Gjelder alle tilbud i dag. Vi skal sende tre tilbud før lunsj.' },
      { type: 'intern', hvem: 'Eirik', tid: '14.10 08:20', tekst: 'Logoen ble lastet opp på nytt i går (SVG). PDF-motoren støtter kanskje ikke SVG med innebygd font. Sjekker med Code.' },
      { type: 'svar', hvem: 'Eirik', tid: '14.10 08:24', tekst: 'Hei Eva. Takk, jeg ser det samme hos meg. Vi ser på det nå. Til saken er løst kan du laste opp logoen som PNG under Innstillinger › Tema, så kommer den med i PDF-en.' },
      { type: 'kunde', hvem: 'Eva Strand', tid: '14.10 09:58', kanal: 'Svar på e-post', tekst: 'PNG fungerte for nye tilbud. Men de som allerede er sendt har fortsatt ikke logo. Må vi lage dem på nytt?' }
    ],
    tid: [
      { dato: '14.10', fra: '08:10', til: '08:30', min: 20, hvem: 'Eirik', tekst: 'Feilsøking, gjenskapt feilen' },
      { dato: '14.10', fra: '09:05', til: '09:20', min: 15, hvem: 'Eirik', tekst: 'Telefon med Eva' }
    ],
    lopende: '00:18:24'
  },
  svarmaler: [
    { navn: 'Takk, vi ser på det', tekst: 'Hei {fornavn}. Takk for beskjed. Vi ser på det nå og kommer tilbake innen {svarfrist}.' },
    { navn: 'Trenger mer informasjon', tekst: 'Hei {fornavn}. Kan du sende et skjermbilde og fortelle hva du gjorde rett før feilen kom?' },
    { navn: 'Løst, si fra om det dukker opp igjen', tekst: 'Hei {fornavn}. Dette er nå rettet. Si fra hvis du ser det igjen, så åpner vi saken på nytt.' },
    { navn: 'Se brukerveiledningen', tekst: 'Hei {fornavn}. Dette er beskrevet i brukerveiledningen: {lenke}.' }
  ],
  /* Timer per kunde, oktober 2026. Inkludert = 1/2/3 t per butikk per måned etter pakke, første år. */
  timer: [
    { eier: 'granlund', butikker: '2 × Komplett, 2 × Butikk, 1 × Start', inkl: 11, brukt: 4.5, saker: 6, aar: 'År 1 til 28.02.2027' },
    { eier: 'strand', butikker: '2 × Butikk', inkl: 4, brukt: 3.75, saker: 3, aar: 'År 1 til 31.01.2027' },
    { eier: 'aune', butikker: '3 × Start', inkl: 3, brukt: 4.5, saker: 4, aar: 'År 2 fra 15.11.2025. Tegnet som år 1 til regelen er avklart' },
    { eier: 'vestby', butikker: '1 × Butikk', inkl: 2, brukt: 0.75, saker: 2, aar: 'År 2 fra 01.12.2025. Tegnet som år 1 til regelen er avklart' }
  ],
  timerMnd: ['Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt'],
  timerHistorikk: { granlund: [3, 5.5, 2, 6, 7.5, 4.5], strand: [2, 3.5, 1, 4.5, 3, 3.75], aune: [1.5, 2, 0.5, 3.5, 2.5, 4.5], vestby: [1, 0.5, 0, 1.5, 1, 0.75] },

  /* OPPSTART */
  oppstartStatus: { ikke: 'Ikke startet', igang: 'I gang', venter: 'Venter på kunden', stopper: 'Stopper', ferdig: 'Ferdig' },
  oppstarter: [
    { eier: 'nordli', avtale: 'A-2026-019', start: '01.11.2026', ferdig: 2, av: 9, neste: 'Avtale signert', nesteHvem: 'Kunden', stopper: 'Microsoft-godkjenning hos kunden', status: 'stopper' },
    { eier: 'elvetangen', avtale: 'A-2026-020', start: '01.12.2026', ferdig: 0, av: 9, neste: 'Avtale signert', nesteHvem: 'Eirik', stopper: null, status: 'ikke' },
    { eier: 'strand', avtale: 'A-2026-009', start: '01.02.2026', ferdig: 9, av: 9, neste: null, status: 'ferdig', fullfort: '06.02.2026' },
    { eier: 'granlund', avtale: 'A-2026-011', start: '01.03.2026', ferdig: 9, av: 9, neste: null, status: 'ferdig', fullfort: '10.03.2026' }
  ],
  sjekkliste: [
    { punkt: 'Avtale signert', detalj: 'A-2026-019 i Penneo. Kari Nordli har ikke signert. Sendt 13.10, påminnelse 16.10.', hvem: 'Kunden', dato: '13.10.2026', status: 'venter' },
    { punkt: 'Kundemiljø opprettet', detalj: 'Egen database (eu-nord-1 · nordli), nettsted og adressen nordli.hengsel.no. Klar, ikke åpnet for brukere.', hvem: 'Code', dato: '12.10.2026', status: 'ferdig' },
    { punkt: 'Microsoft-godkjenning hos kunden', detalj: 'IT-ansvarlig hos Nordli må godkjenne Hengsel i Microsoft 365 før innlogging virker. Lenke sendt 09.10. Ingen svar.', hvem: 'Kunden', dato: '09.10.2026', status: 'stopper' },
    { punkt: 'Tema og logo', detalj: 'Sigdal-tema. Logo mottatt som PNG.', hvem: 'Eirik', dato: '13.10.2026', status: 'ferdig' },
    { punkt: 'Import av åpne tilbud og ordre', detalj: 'Fra Excel og eldre system. Venter på at Microsoft-godkjenningen er på plass.', hvem: 'Code', dato: 'Frist 27.10.2026', status: 'ikke' },
    { punkt: 'Brukere opprettet', detalj: '14 brukere og 4 montører, fordelt på tre butikker.', hvem: 'Eirik', dato: 'Frist 28.10.2026', status: 'igang' },
    { punkt: 'Opplæring 1 og 2', detalj: '', hvem: 'Eirik', dato: '29.10 og 05.11', status: 'igang', okter: [
      { navn: 'Opplæring 1: selgere', dato: 'Torsdag 29.10.2026 kl. 09–11', sted: 'Nordli Kjøkken Hamar', deltakere: 'Kari Nordli, Per Nordli og 6 selgere' },
      { navn: 'Opplæring 2: montører og ordre', dato: 'Torsdag 05.11.2026 kl. 13–15', sted: 'Video', deltakere: 'Per Nordli, Siri Haug og 4 montører' } ] },
    { punkt: 'Lagt i utrullingslista', detalj: 'Kundemiljøet får nye versjoner sammen med de andre. Utrullingen skjer ikke fra Admin.', hvem: 'Code', dato: 'Frist 30.10.2026', status: 'ikke' },
    { punkt: 'Første faktura klar', detalj: 'Abonnement fra 01.11 og etablering (3 × Butikk). Ligger i fakturakjøringen for november.', hvem: 'Eirik', dato: '01.11.2026', status: 'ikke' }
  ],

  /* FAKTURERING */
  abonnementHistorikk: [
    { dato: '01.10.2026', tekst: 'Granlund Hokksund: Start → Butikk', endring: 'Pakke', hvem: 'Eirik' },
    { dato: '01.09.2026', tekst: 'Granlund Drammen: 2 ekstra brukere (8 → 10)', endring: 'Brukere', hvem: 'Eirik' },
    { dato: '15.06.2026', tekst: 'Granlund Jevnaker lagt til med Start. Rabattrinn 15 % fra 3 butikker gjelder fortsatt', endring: 'Butikk', hvem: 'Eirik' },
    { dato: '01.03.2026', tekst: 'Abonnement startet fra avtale A-2026-011, prisliste 2026.1', endring: 'Start', hvem: 'Eirik' }
  ],
  abonnementer: [
    { eier: 'granlund', fra: '01.03.2026', binding: '28.02.2027', kpi: '01.03.2027', neste: '01.11.2026', avtale: 'A-2026-011' },
    { eier: 'strand', fra: '01.02.2026', binding: '31.01.2027', kpi: '01.02.2027', neste: '01.11.2026', avtale: 'A-2026-009' },
    { eier: 'vestby', fra: '01.12.2024', binding: '30.11.2026', kpi: '01.12.2026', neste: '01.11.2026', avtale: 'A-2025-014' },
    { eier: 'aune', fra: '15.11.2024', binding: '14.11.2026', kpi: '15.11.2026', neste: '01.11.2026', avtale: 'A-2025-006' }
  ],
  /* Fakturakjøring november 2026. Faktureres forskuddsvis 01.11. Fast = abonnement per mnd uten mva */
  kjoring: {
    mnd: 'November 2026', dato: '01.11.2026', forrige: 'Oktober 2026',
    fakturaer: [
      { eier: 'granlund', fast: 29860, status: 'sendt', endret: ['Hokksund: Start → Butikk fra 01.10 (+1 700 kr)'], engang: [
        { tekst: 'SMS, oktober (kostpris 412,00 + 15 %)', belop: 473.80, type: 'videre' },
        { tekst: 'AI, oktober (kostpris 286,00 + 15 %)', belop: 328.90, type: 'videre' } ] },
      { eier: 'strand', fast: 9290, status: 'sendt', endret: [], engang: [
        { tekst: 'Penneo, 2 signeringer (kostpris 98,00 + 15 %)', belop: 112.70, type: 'videre' } ] },
      { eier: 'aune', fast: 8134, status: 'klar', endret: ['Ny linje: support ut over inkludert'], engang: [
        { tekst: 'Support oktober: 1,5 t ut over 3 t inkludert × 1 150 kr (eksempel)', belop: 1725, type: 'timer' },
        { tekst: 'SMS, oktober (kostpris 64,00 + 15 %)', belop: 73.60, type: 'videre' } ] },
      { eier: 'vestby', fast: 5290, status: 'klar', endret: [], engang: [] },
      { eier: 'hovde', eierNavn: 'Hovde Interiør AS', fast: 5990, status: 'klar', endret: ['Sagt opp. To fakturaer igjen (november og desember)'], engang: [] },
      { eier: 'nordli', fast: 13234, status: 'feil', feil: 'PowerOffice: kunden finnes ikke. Opprett kunden i PowerOffice og prøv igjen.', endret: ['Ny kunde fra 01.11'], engang: [
        { tekst: 'Etablering, 3 × Butikk (uten rabatt)', belop: 75000, type: 'etablering' } ] }
    ]
  },
  kpi: {
    prosent: '3,1', aar: 2026, kilde: 'Legges inn for hånd fra SSB',
    rader: [
      { eier: 'aune', dato: '15.11.2026', naa: 8134, varsel: '16.10.2026', utkast: true },
      { eier: 'vestby', dato: '01.12.2026', naa: 5290, varsel: '01.11.2026', utkast: false },
      { eier: 'strand', dato: '01.02.2027', naa: 9290, varsel: '02.01.2027', utkast: false },
      { eier: 'granlund', dato: '01.03.2027', naa: 29860, varsel: '30.01.2027', utkast: false }
    ]
  },
  utestaende: {
    hentet: '14.10.2026 06:00',
    rader: [
      { nr: '10231', eier: 'aune', belop: 10167.50, fakturadato: '01.10.2026', forfall: '15.10.2026', dager: 0, purring: 'Ikke forfalt' },
      { nr: '10219', eier: 'hovde', eierNavn: 'Hovde Interiør AS', belop: 7487.50, fakturadato: '01.09.2026', forfall: '15.09.2026', dager: 29, purring: 'Purring 1 sendt 25.09' },
      { nr: '10228', eier: 'vestby', belop: 6612.50, fakturadato: '01.10.2026', forfall: '15.10.2026', dager: 0, purring: 'Ikke forfalt' },
      { nr: '10224', eier: 'granlund', belop: 1250.00, fakturadato: '15.09.2026', forfall: '29.09.2026', dager: 15, purring: 'Ikke purret' }
    ]
  },

  /* TALL. Alle tall er eksempler */
  tall: {
    mnd: ['Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt'],
    inntekt: [19414, 19414, 19414, 28704, 56864, 56864, 56864, 57904, 57904, 57904, 58564, 58564],
    kunder: [3, 3, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5],
    butikker: [5, 5, 5, 7, 11, 11, 11, 12, 12, 12, 12, 12],
    aar: [{ aar: '2025', inntekt: 232968, merknad: 'Hele året' }, { aar: '2026', inntekt: 584436, merknad: 'Januar–oktober' }, { aar: '2026 prognose', inntekt: 716000, merknad: 'Med Nordli fra november' }],
    driftPerTime: 650,
    drift: [
      { eier: 'granlund', inntekt: 29860, database: 690, timer: 4.5 },
      { eier: 'strand', inntekt: 9290, database: 390, timer: 3.75 },
      { eier: 'aune', inntekt: 8134, database: 390, timer: 4.5 },
      { eier: 'vestby', inntekt: 5290, database: 390, timer: 0.75 },
      { eier: 'hovde', eierNavn: 'Hovde Interiør AS', inntekt: 5990, database: 390, timer: 0 }
    ],
    trakt: [{ steg: 'Ny', antall: 24 }, { steg: 'Demo avtalt', antall: 15 }, { steg: 'Tilbud sendt', antall: 10 }, { steg: 'Forhandling', antall: 7 }, { steg: 'Signert', antall: 5 }],
    tapt: [{ grunn: 'Valgte annen leverandør', antall: 4 }, { grunn: 'For dyrt', antall: 3 }, { grunn: 'Ikke nå, kanskje neste år', antall: 3 }, { grunn: 'Ikke aktuell (lead)', antall: 2 }],
    fornyes: [
      { eier: 'aune', dato: '15.11.2026', dager: 32, perMnd: 8134, merknad: 'Forslag om oppgradering til Butikk 21.10' },
      { eier: 'vestby', dato: '01.12.2026', dager: 48, perMnd: 5290, merknad: 'Fornyelsessamtale 28.10' },
      { eier: 'hovde', eierNavn: 'Hovde Interiør AS', dato: 'Opphører 31.12.2026', dager: 78, perMnd: 5990, merknad: 'Sagt opp' }
    ]
  },

  /* DRIFT. Leses fra kundemiljøene. Bare til å lese */
  miljoer: [
    { eier: 'granlund', adresse: 'granlund.hengsel.no', versjon: '2.0.4', utrulling: '13.10 22:00', feil: 3, innlogget: '14.10 07:42', brukere: 34, backup: 'På', backupTekst: 'Utvidet, 07:00' },
    { eier: 'strand', adresse: 'strand.hengsel.no', versjon: '2.0.4', utrulling: '13.10 22:00', feil: 7, innlogget: '14.10 08:30', brukere: 11, backup: 'På', backupTekst: 'Utvidet, 07:00' },
    { eier: 'vestby', adresse: 'vestby.hengsel.no', versjon: '2.0.4', utrulling: '13.10 22:00', feil: 0, innlogget: '13.10 16:05', brukere: 5, backup: 'På', backupTekst: 'Daglig, 03:00' },
    { eier: 'aune', adresse: 'aune.hengsel.no', versjon: '2.0.3', utrulling: '29.09 22:00', feil: 0, innlogget: '12.10 11:18', brukere: 8, backup: 'På', backupTekst: 'Utvidet, 07:00' },
    { eier: 'hovde', eierNavn: 'Hovde Interiør AS', adresse: 'hovde.hengsel.no', versjon: '2.0.4', utrulling: '13.10 22:00', feil: 0, innlogget: '10.10 14:02', brukere: 4, backup: 'På', backupTekst: 'Daglig, 03:00' },
    { eier: 'nordli', adresse: 'nordli.hengsel.no', versjon: '2.0.4', utrulling: '12.10 15:30', feil: 0, innlogget: 'Ikke åpnet', brukere: 0, backup: 'Av', backupTekst: 'Slås på ved oppstart' }
  ],
  lenker: [
    { navn: 'Utrullingslista', tekst: 'Hvilke kundemiljøer får hvilken versjon. Endres ikke herfra', adresse: 'drift.hengsel.no/utrulling' },
    { navn: 'Kildekode', tekst: 'Repo for Hengsel CRM, Ute og Admin', adresse: 'kode.hengsel.no' },
    { navn: 'Databasepanel', tekst: 'eu-nord-1, én database per eier', adresse: 'db.hengsel.no' },
    { navn: 'Feillogg', tekst: 'Feil fra alle kundemiljøer', adresse: 'feil.hengsel.no' },
    { navn: 'PowerOffice', tekst: 'Regnskap og fakturaer', adresse: 'poweroffice.no' },
    { navn: 'Penneo', tekst: 'Signering av avtaler', adresse: 'penneo.com' },
    { navn: '1Password', tekst: 'Hvelvet «Hengsel drift»', adresse: '1password.com' },
    { navn: 'Brukerveiledningen', tekst: 'Det kundene ser fra «Hjelp»', adresse: 'hjelp.hengsel.no' }
  ],
  kontoer: [
    { tjeneste: 'Database og lagring', eier: 'ES-Holding AS (eksempel)', plan: 'Pro, eu-nord-1', kost: 2650, fornyes: 'Månedlig', hvelv: 'Hengsel drift' },
    { tjeneste: 'Nettsted og hosting', eier: 'ES-Holding AS (eksempel)', plan: 'Team', kost: 420, fornyes: 'Månedlig', hvelv: 'Hengsel drift' },
    { tjeneste: 'Domene hengsel.no', eier: 'Eirik', plan: '1 år', kost: 18, fornyes: '03.02.2027', hvelv: 'Hengsel drift' },
    { tjeneste: 'Domene sigdal-crm.no', eier: 'Eirik', plan: '1 år', kost: 18, fornyes: '22.10.2026', hvelv: 'Hengsel drift', snart: true },
    { tjeneste: 'Microsoft 365, support@hengsel.no', eier: 'ES-Holding AS (eksempel)', plan: 'Business Basic, 2 lisenser', kost: 140, fornyes: '01.01.2027', hvelv: 'Hengsel drift' },
    { tjeneste: 'Penneo', eier: 'ES-Holding AS (eksempel)', plan: 'Per signering', kost: 0, fornyes: 'Løpende', hvelv: 'Hengsel økonomi', merknad: 'Viderefaktureres' },
    { tjeneste: 'SMS-leverandør', eier: 'ES-Holding AS (eksempel)', plan: 'Per melding', kost: 0, fornyes: 'Løpende', hvelv: 'Hengsel drift', merknad: 'Viderefaktureres' },
    { tjeneste: 'AI-tjeneste', eier: 'ES-Holding AS (eksempel)', plan: 'Per bruk', kost: 0, fornyes: 'Løpende', hvelv: 'Hengsel drift', merknad: 'Viderefaktureres' },
    { tjeneste: 'PowerOffice Go', eier: 'ES-Holding AS (eksempel)', plan: 'Standard', kost: 590, fornyes: 'Månedlig', hvelv: 'Hengsel økonomi' }
  ],
  frister: [
    { tekst: 'Fornye domenet sigdal-crm.no', dato: '22.10.2026', varsel: '14 dager før', kategori: 'Domene', dager: 8 },
    { tekst: 'Årlig gjennomgang av databehandleravtaler', dato: '31.10.2026', varsel: '30 dager før', kategori: 'Personvern', dager: 17 },
    { tekst: 'Test gjenoppretting av sikkerhetskopi', dato: '01.11.2026', varsel: '7 dager før', kategori: 'Drift', dager: 18 },
    { tekst: 'KPI-varsel til Aune Kjøkken', dato: '16.10.2026', varsel: 'Fra KPI-justering', kategori: 'Fakturering', dager: 2 },
    { tekst: 'Fornyelse Microsoft 365', dato: '01.01.2027', varsel: '30 dager før', kategori: 'Konto', dager: 79 }
  ],
  rutiner: [
    { navn: 'Hver måned, før den 1.', punkter: [{ t: 'Gå gjennom fakturakjøringen og endringene siden forrige måned', ok: true }, { t: 'Før timer ut over inkludert som fakturalinjer', ok: true }, { t: 'Legg inn kostpris for SMS, Penneo og AI', ok: false }, { t: 'Send til PowerOffice og sjekk at ingen står med Feil', ok: false }] },
    { navn: 'Hver uke', punkter: [{ t: 'Se over feil siste 7 dager i Status', ok: true }, { t: 'Sjekk at alle kundemiljøer har sikkerhetskopi på', ok: true }, { t: 'Lukk saker som har ventet på kunden i mer enn 14 dager', ok: false }] },
    { navn: 'Hvert kvartal', punkter: [{ t: 'Test gjenoppretting av én kundedatabase', ok: false }, { t: 'Gå gjennom kontoer og kost per måned', ok: false }] }
  ],

  /* INNSTILLINGER */
  avtalemaler: [
    { navn: 'Kundeavtale', versjon: 'v3.1', gjelderFra: '01.09.2026', status: 'Aktiv', brukt: 3 },
    { navn: 'Databehandleravtale', versjon: 'v2.0', gjelderFra: '01.03.2026', status: 'Aktiv', brukt: 6 },
    { navn: 'Supportnivå: Standard', versjon: 'v1.2', gjelderFra: '01.09.2026', status: 'Aktiv', brukt: 3 },
    { navn: 'Kundeavtale', versjon: 'v3.2', gjelderFra: '01.01.2027', status: 'Utkast', brukt: 0 }
  ],
  brukere: [
    { navn: 'Eirik', epost: 'eirik@hengsel.no', rolle: 'Eier', tilgang: 'Alt', sist: '14.10 10:18' },
    { navn: 'Supportperson', epost: 'support@hengsel.no', rolle: 'Support', tilgang: 'Oversikt, Kunder, Support (Saker og Timer, uten beløp)', sist: 'Ikke invitert', eksempel: true }
  ],
  varsler: [
    { navn: 'Frister i Drift', tekst: 'E-post og varsel i Admin etter fristens varsel', paa: true },
    { navn: 'Avtaler som fornyes', tekst: '90 dager før fornyelsesdatoen', paa: true },
    { navn: 'KPI-justering', tekst: 'Når et KPI-varsel skal sendes til kunden (30 dager før, eksempel)', paa: true },
    { navn: 'Svarfrist på saker', tekst: 'Når en sak har 25 % av fristen igjen, og når den er forfalt', paa: true },
    { navn: 'Fakturakjøring', tekst: '3 dager før den 1. i måneden', paa: false }
  ]
};
