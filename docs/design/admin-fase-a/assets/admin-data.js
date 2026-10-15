/* Hengsel Admin, fase A (S-62). Eksempeldata, alt er oppdiktet. Dagens dato i tegningene: onsdag 14.10.2026. */
window.AdminData = {
  idag: '2026-10-14',
  prislister: [
    { versjon: '2026.1', gjelderFra: '2026-01-01', status: 'arkivert' },
    { versjon: '2026.2', gjelderFra: '2026-09-01', status: 'aktiv' },
    { versjon: '2027.1', gjelderFra: '2027-01-01', status: 'utkast' }
  ],
  pris: {
    versjon: '2026.2',
    eksempel: 'Eksempel – prislisten er ikke låst',
    linjer: {
      sigdal: { navn: 'Sigdal CRM', merknad: 'Hengsel med Sigdal-pakken', pakker: { start: 2990, butikk: 4990, komplett: 6990 } },
      hengsel: { navn: 'Hengsel', merknad: 'For alle kjøkken- og interiørbutikker', pakker: { start: 1990, butikk: 3990, komplett: 5990 } }
    },
    pakker: {
      start: { navn: 'Start', brukere: 3, ekstraBruker: 350, support: 1, etablering: 15000, moduler: ['CRM', 'Tilbud og ordre'] },
      butikk: { navn: 'Butikk', brukere: 5, ekstraBruker: 450, support: 2, etablering: 25000, moduler: ['CRM', 'Tilbud og ordre', 'Montørapp', 'Kundeportal'] },
      komplett: { navn: 'Komplett', brukere: 6, ekstraBruker: 550, support: 3, etablering: 39000, moduler: ['CRM', 'Tilbud og ordre', 'Montørapp', 'Kundeportal', 'Prosjekt og leiligheter', 'Rapporter'] }
    },
    ute: { montor: 150, firma: 990, firmaMaks: 8 },
    tillegg: [
      { id: 'backup', navn: 'Utvidet sikkerhetskopi', merknad: 'Gjenoppretting til et tidspunkt. Inkludert i Komplett og for eiere med flere butikker', pris: 1090 },
      { id: 'domene', navn: 'Eget domene på innloggingen', merknad: 'Per eier per måned', pris: 110 }
    ],
    rabattrinn: [{ fraButikker: 3, prosent: 15 }, { fraButikker: 10, prosent: 25 }],
    rabattGjelder: ['Pakker', 'Ekstra brukere', 'Hengsel Ute (montører)'],
    rabattGjelderIkke: ['Tillegg', 'Etablering', 'Viderefakturering'],
    viderefakturering: { prosent: 15, gjelder: 'SMS, Penneo og AI' },
    binding: 12,
    prisjustering: 'Årlig etter KPI',
    mva: 25
  },
  leverandor: { eksempel: true, navn: 'ES-Holding AS', orgnr: '929 551 304', adresse: 'Storgata 7, 3510 Hønefoss', epost: 'salg@hengsel.no', signatar: 'Eirik', signatarRolle: 'daglig leder' },
  eiere: [
    { id: 'nordli', navn: 'Nordli Kjøkken AS', orgnr: '923 456 781', adresse: 'Strandgata 14, 2317 Hamar', fylke: 'Innlandet', kjede: 'Sigdal', linje: 'sigdal', status: 'forhandling', kilde: 'Sigdal-kjedemøte',
      butikker: [{ navn: 'Nordli Kjøkken Hamar', sted: 'Hamar' }, { navn: 'Nordli Kjøkken Gjøvik', sted: 'Gjøvik' }, { navn: 'Nordli Kjøkken Lillehammer', sted: 'Lillehammer' }],
      kontakter: [{ navn: 'Kari Nordli', rolle: 'Daglig leder, beslutter', tlf: '913 42 118', epost: 'kari@nordli-kjokken.no' }, { navn: 'Per Nordli', rolle: 'Butikksjef Hamar', tlf: '936 10 204', epost: 'per@nordli-kjokken.no' }, { navn: 'Siri Haug', rolle: 'Økonomi', tlf: '482 77 015', epost: 'siri@nordli-kjokken.no' }],
      oppsett: { pakke: 'butikk', montorer: 4, brukere: 0, tillegg: [] }, neste: { tekst: 'Følg opp tilbud v2', dato: '2026-10-13' } },
    { id: 'fjordhuset', navn: 'Fjordhuset Interiør AS', orgnr: '918 222 405', adresse: 'Storgata 31, 6413 Molde', fylke: 'Møre og Romsdal', kjede: 'Annen', linje: 'hengsel', status: 'demo', kilde: 'Be om demo',
      butikker: [{ navn: 'Fjordhuset Interiør', sted: 'Molde' }], kontakter: [{ navn: 'Ola Fjeld', rolle: 'Daglig leder', tlf: '958 30 447', epost: 'ola@fjordhuset.no' }],
      oppsett: { pakke: 'butikk', montorer: 2, brukere: 0, tillegg: ['backup'] }, neste: { tekst: 'Demo på video', dato: '2026-10-16' } },
    { id: 'granlund', navn: 'Granlund Innredning AS', orgnr: '912 845 330', adresse: 'Industriveien 8, 3511 Hønefoss', fylke: 'Buskerud', kjede: 'Sigdal', linje: 'sigdal', status: 'signert', kunde: true, kilde: 'Anbefaling',
      butikker: [{ navn: 'Granlund Hønefoss', sted: 'Hønefoss', pakke: 'komplett', brukere: 12, montorer: 6 }, { navn: 'Granlund Drammen', sted: 'Drammen', pakke: 'komplett', brukere: 10, montorer: 5 }, { navn: 'Granlund Kongsberg', sted: 'Kongsberg', pakke: 'butikk', brukere: 5, montorer: 3 }, { navn: 'Granlund Hokksund', sted: 'Hokksund', pakke: 'butikk', brukere: 4, montorer: 2 }, { navn: 'Granlund Jevnaker', sted: 'Jevnaker', pakke: 'start', brukere: 3, montorer: 1 }],
      kontakter: [{ navn: 'Lars Granlund', rolle: 'Eier og daglig leder', tlf: '917 55 032', epost: 'lars@granlund.no' }, { navn: 'Mette Aas', rolle: 'Driftsleder, admin i CRM', tlf: '940 12 680', epost: 'mette@granlund.no' }],
      miljo: { adresse: 'granlund.hengsel.no', tema: 'Sigdal', versjon: '2.0.4', sistInnlogget: '14.10.2026 07:42', database: 'eu-nord-1 · granlund' },
      oppsett: { pakke: 'komplett', montorer: 17, brukere: 0, tillegg: ['domene'] }, neste: { tekst: 'Kvartalsmøte', dato: '2026-11-05' } },
    { id: 'bakken', navn: 'Bakken & Berg Kjøkken AS', orgnr: '925 117 093', adresse: 'Grønnegata 52, 9008 Tromsø', fylke: 'Troms', kjede: 'Annen', linje: 'hengsel', status: 'ny', kilde: 'Be om demo',
      butikker: [{ navn: 'Bakken & Berg Tromsø', sted: 'Tromsø' }, { navn: 'Bakken & Berg Harstad', sted: 'Harstad' }], kontakter: [{ navn: 'Jonas Berg', rolle: 'Daglig leder', tlf: '934 20 771', epost: 'jonas@bakkenberg.no' }],
      oppsett: { pakke: 'butikk', montorer: 3, brukere: 0, tillegg: [] }, neste: { tekst: 'Ring og avtal demo', dato: '2026-10-15' } },
    { id: 'solsiden', navn: 'Solsiden Interiør AS', orgnr: '931 004 562', adresse: 'Beddingen 10, 7042 Trondheim', fylke: 'Trøndelag', kjede: 'Annen', linje: 'hengsel', status: 'tilbud', kilde: 'Messe',
      butikker: [{ navn: 'Solsiden Interiør', sted: 'Trondheim' }], kontakter: [{ navn: 'Ingrid Lie', rolle: 'Daglig leder', tlf: '911 08 336', epost: 'ingrid@solsiden-interior.no' }],
      oppsett: { pakke: 'start', montorer: 1, brukere: 0, tillegg: [] }, neste: { tekst: 'Ring om tilbudet', dato: '2026-10-14' } },
    { id: 'elvetangen', navn: 'Elvetangen Kjøkkensenter AS', orgnr: '916 330 871', adresse: 'Elvegata 3, 3717 Skien', fylke: 'Telemark', kjede: 'Sigdal', linje: 'sigdal', status: 'tilbud', kilde: 'Sigdal-kjedemøte',
      butikker: [{ navn: 'Elvetangen Skien', sted: 'Skien' }, { navn: 'Elvetangen Porsgrunn', sted: 'Porsgrunn' }, { navn: 'Elvetangen Notodden', sted: 'Notodden' }, { navn: 'Elvetangen Bø', sted: 'Bø' }], kontakter: [{ navn: 'Tone Elvetangen', rolle: 'Daglig leder', tlf: '922 61 409', epost: 'tone@elvetangen.no' }],
      oppsett: { pakke: 'butikk', montorer: 7, brukere: 0, tillegg: [] }, neste: { tekst: 'Svar på spørsmål om montørapp', dato: '2026-10-17' } },
    { id: 'lysaker', navn: 'Lysaker Innredning AS', orgnr: '927 640 118', adresse: 'Lysaker torg 5, 1366 Lysaker', fylke: 'Akershus', kjede: 'Annen', linje: 'hengsel', status: 'tapt', tapGrunn: 'Valgte annen leverandør', kilde: 'Messe',
      butikker: [{ navn: 'Lysaker Innredning', sted: 'Bærum' }, { navn: 'Lysaker Innredning Asker', sted: 'Asker' }], kontakter: [{ navn: 'Henrik Moe', rolle: 'Daglig leder', tlf: '976 33 102', epost: 'henrik@lysaker-innredning.no' }],
      oppsett: { pakke: 'butikk', montorer: 2, brukere: 0, tillegg: [] }, neste: null },
    { id: 'haugen', navn: 'Haugen Kjøkken & Bad AS', orgnr: '932 118 640', adresse: 'Leirvikvegen 22, 5411 Stord', fylke: 'Vestland', kjede: 'Annen', linje: 'hengsel', status: 'ny', kilde: 'Be om demo', nyLead: true,
      butikker: [{ navn: 'Haugen Kjøkken & Bad', sted: 'Stord' }], kontakter: [{ navn: 'Silje Haugen', rolle: 'Daglig leder', tlf: '901 47 225', epost: 'silje@haugenkjokken.no' }],
      lead: { tid: '14.10.2026 08:12', melding: 'Vi er tre selgere og to montører. Bruker Excel og e-post i dag. Kan vi se hvordan tilbud og montasje henger sammen?', butikker: 1, ansatte: '5–10', kanal: 'hengsel.no/demo' },
      oppsett: { pakke: 'butikk', montorer: 2, brukere: 0, tillegg: [] }, neste: { tekst: 'Ta kontakt innen 24 timer', dato: '2026-10-14' } },
    { id: 'vestby', navn: 'Vestby Kjøkken AS', orgnr: '914 902 337', adresse: 'Sentrumsvegen 9, 1540 Vestby', fylke: 'Akershus', kjede: 'Sigdal', linje: 'sigdal', status: 'signert', kunde: true, kilde: 'Sigdal-kjedemøte',
      butikker: [{ navn: 'Vestby Kjøkken', sted: 'Vestby', pakke: 'butikk', brukere: 5, montorer: 2 }], kontakter: [{ navn: 'Anne Vestby', rolle: 'Daglig leder', tlf: '995 21 560', epost: 'anne@vestbykjokken.no' }],
      miljo: { adresse: 'vestby.hengsel.no', tema: 'Sigdal', versjon: '2.0.4', sistInnlogget: '13.10.2026 16:05', database: 'eu-nord-1 · vestby' },
      oppsett: { pakke: 'butikk', montorer: 2, brukere: 0, tillegg: [] }, neste: { tekst: 'Fornyelsessamtale', dato: '2026-10-28' } },
    { id: 'strand', navn: 'Strand Interiør AS', orgnr: '919 774 206', adresse: 'Markens gate 40, 4611 Kristiansand', fylke: 'Agder', kjede: 'Annen', linje: 'hengsel', status: 'signert', kunde: true, kilde: 'Be om demo',
      butikker: [{ navn: 'Strand Interiør Kvadraturen', sted: 'Kristiansand', pakke: 'butikk', brukere: 6, montorer: 3 }, { navn: 'Strand Interiør Sørlandsparken', sted: 'Kristiansand', pakke: 'butikk', brukere: 5, montorer: 2 }],
      kontakter: [{ navn: 'Eva Strand', rolle: 'Daglig leder', tlf: '948 70 113', epost: 'eva@strandinterior.no' }],
      miljo: { adresse: 'strand.hengsel.no', tema: 'Hengsel', versjon: '2.0.4', sistInnlogget: '14.10.2026 08:30', database: 'eu-nord-1 · strand' },
      oppsett: { pakke: 'butikk', montorer: 5, brukere: 1, tillegg: ['domene'] }, neste: null },
    { id: 'aune', navn: 'Aune Kjøkken AS', orgnr: '911 336 904', adresse: 'Kongens gate 18, 8006 Bodø', fylke: 'Nordland', kjede: 'Sigdal', linje: 'sigdal', status: 'signert', kunde: true, kilde: 'Sigdal-kjedemøte',
      butikker: [{ navn: 'Aune Kjøkken Bodø', sted: 'Bodø', pakke: 'start', brukere: 3, montorer: 2 }, { navn: 'Aune Kjøkken Fauske', sted: 'Fauske', pakke: 'start', brukere: 2, montorer: 1 }, { navn: 'Aune Kjøkken Mo', sted: 'Mo i Rana', pakke: 'start', brukere: 3, montorer: 1 }],
      kontakter: [{ navn: 'Bjørn Aune', rolle: 'Daglig leder', tlf: '913 80 254', epost: 'bjorn@aunekjokken.no' }],
      miljo: { adresse: 'aune.hengsel.no', tema: 'Sigdal', versjon: '2.0.3', sistInnlogget: '12.10.2026 11:18', database: 'eu-nord-1 · aune' },
      oppsett: { pakke: 'start', montorer: 4, brukere: 0, tillegg: [] }, neste: { tekst: 'Forslag om oppgradering til Butikk', dato: '2026-10-21' } },
    { id: 'fossum', navn: 'Fossum Interiør AS', orgnr: '926 551 870', adresse: 'Storgata 2, 2000 Lillestrøm', fylke: 'Akershus', kjede: 'Annen', linje: 'hengsel', status: 'forhandling', kilde: 'Anbefaling',
      butikker: [{ navn: 'Fossum Interiør Lillestrøm', sted: 'Lillestrøm' }, { navn: 'Fossum Interiør Jessheim', sted: 'Jessheim' }], kontakter: [{ navn: 'Mona Fossum', rolle: 'Daglig leder', tlf: '960 02 845', epost: 'mona@fossum-interior.no' }],
      oppsett: { pakke: 'komplett', montorer: 3, brukere: 2, tillegg: ['domene'] }, neste: { tekst: 'Send referat fra møtet', dato: '2026-10-10' } },
    { id: 'moen', navn: 'Moen Kjøkkenstudio AS', orgnr: '929 403 615', adresse: 'Sjøgata 12, 8006 Bodø', fylke: 'Nordland', kjede: 'Sigdal', linje: 'sigdal', status: 'demo', kilde: 'Sigdal-kjedemøte',
      butikker: [{ navn: 'Moen Kjøkkenstudio', sted: 'Bodø' }], kontakter: [{ navn: 'Rune Moen', rolle: 'Daglig leder', tlf: '977 41 920', epost: 'rune@moenkjokken.no' }],
      oppsett: { pakke: 'start', montorer: 1, brukere: 0, tillegg: [] }, neste: { tekst: 'Demo i butikken', dato: '2026-10-22' } }
  ],
  aktiviteter: {
    nordli: [
      { type: 'epost', dato: '13.10.2026', tittel: 'Tilbud T-2026-031 v2 sendt', tekst: 'Sendt til Kari Nordli. Butikk-pakken for tre butikker med Visning.', hvem: 'Eirik' },
      { type: 'mote', dato: '09.10.2026', tittel: 'Gjennomgang av pris', tekst: 'Kari og Siri ønsker færre brukere i Lillehammer og spør om binding.', hvem: 'Eirik' },
      { type: 'demo', dato: '02.10.2026', tittel: 'Demo i butikken på Hamar', tekst: 'Viste tilbud, montørapp og kundeportal. Per likte montasjeplanen.', hvem: 'Eirik' },
      { type: 'samtale', dato: '24.09.2026', tittel: 'Første samtale', tekst: 'Vil ha tilbud for tre butikker. Bruker Excel og et eldre system i dag.', hvem: 'Eirik' },
      { type: 'notat', dato: '20.09.2026', tittel: 'Kom inn via Sigdal-kjedemøtet', tekst: 'Anbefalt av Lars Granlund.', hvem: 'Eirik' }
    ]
  },
  tilbud: {
    nordli: [
      { nr: 'T-2026-031', versjon: 2, dato: '13.10.2026', gyldigTil: '27.10.2026', prisliste: '2026.2', status: 'Sendt', perMnd: 13234 },
      { nr: 'T-2026-031', versjon: 1, dato: '01.10.2026', gyldigTil: '15.10.2026', prisliste: '2026.2', status: 'Erstattet', perMnd: 15044 }
    ]
  },
  avtaler: [
    { nr: 'A-2026-019', eier: 'nordli', status: 'signering', opprettet: '13.10.2026', binding: '12 måneder', oppsigelse: '3 måneder', start: '01.11.2026', fornyes: '01.11.2027', perMnd: 13234,
      signatarer: [{ navn: 'Kari Nordli', rolle: 'Nordli Kjøkken AS · signaturrett', status: 'venter', tid: 'Sendt 13.10.2026' }, { navn: 'Eirik', rolle: 'ES-Holding AS (eksempel) · leverandør', status: 'venter', tid: 'Etter kunden' }] },
    { nr: 'A-2026-020', eier: 'elvetangen', status: 'utkast', opprettet: '11.10.2026', binding: '12 måneder', oppsigelse: '3 måneder', start: '–', fornyes: '–', perMnd: 17807 },
    { nr: 'A-2026-011', eier: 'granlund', status: 'signert', opprettet: '14.02.2026', binding: '12 måneder', oppsigelse: '3 måneder', start: '01.03.2026', fornyes: '01.03.2027', perMnd: 29860 },
    { nr: 'A-2025-014', eier: 'vestby', status: 'fornyes', opprettet: '20.11.2024', binding: '12 måneder', oppsigelse: '3 måneder', start: '01.12.2024', fornyes: '01.12.2026', perMnd: 5290 },
    { nr: 'A-2025-006', eier: 'aune', status: 'fornyes', opprettet: '02.11.2024', binding: '12 måneder', oppsigelse: '3 måneder', start: '15.11.2024', fornyes: '15.11.2026', perMnd: 8134 },
    { nr: 'A-2026-009', eier: 'strand', status: 'signert', opprettet: '18.01.2026', binding: '12 måneder', oppsigelse: '3 måneder', start: '01.02.2026', fornyes: '01.02.2027', perMnd: 9290 },
    { nr: 'A-2025-003', eier: 'hovde', eierNavn: 'Hovde Interiør AS', status: 'sagtopp', opprettet: '05.01.2025', binding: '12 måneder', oppsigelse: '3 måneder', start: '01.02.2025', fornyes: 'Opphører 31.12.2026', perMnd: 5990 }
  ],
  dokumenter: [
    { navn: 'Kundeavtale', mal: 'Kundeavtale v3.1', gjelderFra: '01.09.2026' },
    { navn: 'Databehandleravtale', mal: 'Databehandleravtale v2.0', gjelderFra: '01.03.2026' },
    { navn: 'Supportnivå: Standard', mal: 'Supportnivå v1.2', gjelderFra: '01.09.2026' }
  ],
  frister: [
    { tekst: 'Fornye domenet sigdal-crm.no', dato: '22.10.2026', kategori: 'Domene' },
    { tekst: 'Årlig gjennomgang av databehandleravtaler', dato: '31.10.2026', kategori: 'Personvern' },
    { tekst: 'Test gjenoppretting av sikkerhetskopi', dato: '01.11.2026', kategori: 'Drift' }
  ]
};

/* Prisberegning. Alt hentes fra prislisten.
   butikker: [{ navn, pakke, brukere (ekstra), montorer }], opts: { tillegg: [id], pris }
   Kjederabatt gjelder pakker, ekstra brukere og Ute. Avrundes til hele kroner. Tillegg, etablering og viderefakturering uten rabatt. */
window.AdminData.beregn = function (linje, butikker, opts) {
  opts = opts || {};
  const P = opts.pris || window.AdminData.pris, L = P.linjer[linje], n = butikker.length;
  const rader = butikker.map(b => { const pk = P.pakker[b.pakke], ant = b.brukere || 0;
    return { navn: b.navn, pakkeId: b.pakke, pakkeNavn: pk.navn, pakke: L.pakker[b.pakke], antallBrukere: ant, brukere: ant * pk.ekstraBruker, inkludert: pk.brukere, support: pk.support, montorer: b.montorer || 0, etablering: pk.etablering, sum: L.pakker[b.pakke] + ant * pk.ekstraBruker }; });
  const nM = rader.reduce((a, r) => a + r.montorer, 0), perM = nM * P.ute.montor;
  const firma = nM > 0 && nM <= P.ute.firmaMaks && P.ute.firma < perM;
  const ute = { antall: nM, modell: nM === 0 ? 'ingen' : firma ? 'firma' : 'montor', pris: nM === 0 ? 0 : firma ? P.ute.firma : perM };
  const grunnlag = rader.reduce((a, r) => a + r.sum, 0) + ute.pris;
  const trinn = P.rabattrinn.filter(t => n >= t.fraButikker).sort((a, b) => b.prosent - a.prosent)[0];
  const prosent = trinn ? trinn.prosent : 0, rabatt = Math.round(grunnlag * prosent / 100);
  const valgt = new Set(opts.tillegg || []);
  const backupInkl = rader.some(r => r.pakkeId === 'komplett') || n > 1;
  const tillegg = P.tillegg.map(t => { const inkl = t.id === 'backup' && backupInkl, med = inkl || valgt.has(t.id); return { ...t, valgt: med, inkludert: inkl, belop: med && !inkl ? t.pris : 0 }; });
  const tilleggSum = tillegg.reduce((a, t) => a + t.belop, 0);
  const netto = grunnlag - rabatt + tilleggSum, mva = netto * P.mva / 100;
  const etablering = rader.reduce((a, r) => a + r.etablering, 0);
  const aar = netto * 12;
  return { rader, ute, grunnlag, prosent, rabatt, tillegg, tilleggSum, netto, mva, inkl: netto + mva, aar, aarMva: aar * P.mva / 100, aarInkl: aar * (1 + P.mva / 100),
    etablering, etableringMva: etablering * P.mva / 100, etableringInkl: etablering * (1 + P.mva / 100), perButikk: n ? Math.round(netto / n * 100) / 100 : 0,
    support: rader.reduce((a, r) => a + r.support, 0), sum: grunnlag, versjon: P.versjon };
};
window.AdminData.kr = n => { const v = Math.round(n * 100) / 100, hel = Number.isInteger(v); return v.toLocaleString('nb-NO', { minimumFractionDigits: hel ? 0 : 2, maximumFractionDigits: 2 }).replace(/[\u00a0\u202f]/g, ' ').replace('\u2212', '−') + ' kr'; };
/* Standard oppsett for en eier: pakke og brukere per butikk, montører fordelt */
window.AdminData.oppsett = function (e) {
  const P = window.AdminData.pris, n = e.butikker.length, ant = e.oppsett.montorer;
  return e.butikker.map((b, i) => { const pakke = b.pakke || e.oppsett.pakke; return { navn: b.navn, pakke, brukere: b.brukere != null ? Math.max(0, b.brukere - P.pakker[pakke].brukere) : (i === 0 ? e.oppsett.brukere : 0), montorer: b.montorer != null ? b.montorer : Math.floor(ant / n) + (i < ant % n ? 1 : 0) }; });
};
window.AdminData.verdi = e => window.AdminData.beregn(e.linje, window.AdminData.oppsett(e), { tillegg: e.oppsett.tillegg });
