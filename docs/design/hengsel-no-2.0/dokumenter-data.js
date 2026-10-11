// Dokumentene på /dokumenter. Oppdiktet eksempelinnhold (Butikknavn, Kari Nordmann, Leverandør A).
// Forbilde: dokumentmalene i Visningsrommet (sites/vis/src/dokumenter/*.webp).
(function () {
  const KUNDE = 'Kari Nordmann';
  const ADR = 'Oppdiktet allé 8, 2850 Lena';
  const h = t => ({ type: 'h', t });
  const kv = (kv, kol) => ({ type: 'kv', kol: kol || 2, kv: kv.map(([k, v]) => ({ k, v })) });
  const linjer = (rader, sum) => ({ type: 'linjer', rader: rader.map(([l, v]) => ({ l, v })), sum: sum ? { l: sum[0], v: sum[1] } : null });
  const tabell = (kol, rader, mal, sum) => ({ type: 'tabell', kol, rader: rader.map(r => ({ c: r })), mal, sum: sum ? { l: sum[0], v: sum[1] } : null });
  const boks = (t, linjer) => ({ type: 'boks', t, linjer });
  const tekst = t => ({ type: 'tekst', t });
  const klausuler = r => ({ type: 'klausuler', rader: r.map(([nr, t, s]) => ({ nr, t, s })) });
  const bilder = (r, hh) => ({ type: 'bilder', rader: r, hh: hh || 150 });
  const bilde = (t, hh) => ({ type: 'bilde', t, hh: hh || 300 });
  const sign = r => ({ type: 'sign', rader: r.map(([navn, rolle]) => ({ navn, rolle })) });
  const signbokser = r => ({ type: 'signbokser', rader: r.map(([t, s]) => ({ t, s })) });
  const stats = r => ({ type: 'stats', rader: r.map(([k, v]) => ({ k, v })) });
  const ks = r => ({ type: 'ks', rader: r.map(([p, m, s]) => ({ p, m, s, avvik: s !== 'OK' })) });
  const punkter = r => ({ type: 'punkter', rader: r.map(([ref, fase, t, s, sist]) => ({ ref, fase, t, s, sist })) });
  const steg = r => ({ type: 'steg', rader: r.map(([t, s], i) => ({ n: String(i + 1), t, s })) });
  const fliser = r => ({ type: 'fliser', rader: r.map(([t, s], i) => ({ n: String(i + 1), t, s })) });
  const plan = (dager, rader) => ({ type: 'plan', dager, rader: rader.map(([navn, firma, celler]) => ({ navn, firma, celler: celler.map(c => c ? { t: c[0], s: c[1], tone: c[2] || '' } : { t: '', s: '', tone: 'tom' }) })) });

  const DOK = [
    {
      id: 'tilbud', t: 'Tilbud', s: 'Forside, kort fortalt, tegning, artikler og vilkår.', fot: 'Tilbud HA-T-2231 · versjon 3 · ' + KUNDE,
      lages: ['Tilbud HA-T-2231 på kundekortet', 'Prisgruppe 3 og betalingsplan', '«Lag tilbud»', 'Tilbud.pdf · 5 sider', 'Kundeportal og e-post'],
      sider: [
        { navn: 'Forside', forside: { eyebrow: 'Tilbud · Kjøkken', tittel: 'Kjøkkenet til ' + KUNDE, under: ADR, meta: [['Tilbud', 'HA-T-2231 · versjon 3'], ['Dato', '22. september 2026'], ['Gyldig til', '15. oktober 2026'], ['Selger', 'Kristine B.']], pris: '257 700 kr', prisTekst: 'inkl. mva, frakt og montering' } },
        { navn: 'Kort fortalt', tittel: 'Kort fortalt', ingress: 'Takk for et hyggelig møte. Her er tilbudet på kjøkkenet slik vi tegnet det sammen. Alt står i kundeportalen, der du også kan velge oppgraderinger og godta tilbudet.', blokker: [
          h('Dette får du'), kv([['Front', 'Eik natur, matt lakk'], ['Benkeplate', 'Laminat eik, 20 mm'], ['Grep', 'Sort stang, 160 mm'], ['Vask og batteri', 'Blandebatteri'], ['Hvitevarer', 'Platetopp, ovn, oppvask, kjøl/frys'], ['Belysning', 'Spot i tak']]),
          h('Pris'), linjer([['Skap og fronter', '168 400 kr'], ['Hvitevarer', '46 900 kr'], ['Benkeplate', '31 800 kr'], ['Vask og batteri', '10 600 kr'], ['Frakt og montering', '18 900 kr']], ['Totalt inkl. mva', '257 700 kr']),
          h('Betaling'), linjer([['Ved signering (30 %)', '77 310 kr'], ['Ved levering (60 %)', '154 620 kr'], ['Etter montering (10 %)', '25 770 kr']]),
          boks('Slik går du videre', ['1. Se tegningene og velg eventuelle oppgraderinger i kundeportalen.', '2. Godta tilbudet der når du er fornøyd. Tilbudet gjelder til 15. oktober.', '3. Vi sender kjøpsavtalen til signering med BankID og bestiller.'])] },
        { navn: 'Tegningen', tittel: 'Tegningen', ingress: 'Tegning 5971 · R08 fra CET. Kontrollmålene tas ved befaring før bestilling.', blokker: [bilde('Tegning 5971 · ark 1 av 3 · plan', 380), bilder(['Ark 2 · vegg A', 'Ark 3 · vegg B'], 190)] },
        { navn: 'Artikler', tittel: 'Artikler', ingress: '23 skap og 41 linjer. Utdrag, gruppert slik de står i tegningen.', blokker: [
          tabell(['Pos.', 'Artikkel', 'Antall', 'Pris'], [['1', 'Underskap 60 cm, 3 skuffer', '4', '22 400 kr'], ['2', 'Underskap 80 cm, vask', '1', '7 900 kr'], ['3', 'Høyskap 60 cm, integrert kjøl/frys', '1', '12 600 kr'], ['4', 'Overskap 60 cm, 2 hyller', '6', '19 800 kr'], ['5', 'Front eik natur, matt lakk', '31', '58 200 kr'], ['6', 'Sokkel og lister', '1', '6 300 kr'], ['7', 'Benkeplate laminat eik 20 mm', '2', '31 800 kr'], ['8', 'Platetopp induksjon 60 cm', '1', '11 900 kr'], ['9', 'Stekeovn 60 cm', '1', '13 400 kr'], ['10', 'Oppvaskmaskin integrert', '1', '9 800 kr'], ['11', 'Blandebatteri og vask', '1', '10 600 kr'], ['12', 'Frakt og montering', '1', '18 900 kr']], '48px 1fr 70px 110px', ['Totalt inkl. mva', '257 700 kr'])] },
        { navn: 'Vilkår', tittel: 'Vilkår', ingress: 'Kort om det som gjelder for tilbudet. Fullstendige leveringsvilkår følger kjøpsavtalen.', blokker: [klausuler([
          ['1', 'Gyldighet', 'Tilbudet gjelder til 15. oktober 2026. Priser kan endres etter fristen.'],
          ['2', 'Kontrollmål', 'Endelig bestilling skjer etter kontrollmål hos kunden. Avvik fra tegningen avtales skriftlig.'],
          ['3', 'Endringsfrist', 'Endringer kan gjøres i kundeportalen frem til 14 dager før levering.'],
          ['4', 'Levering og montering', 'Leveringsuke bekreftes i ordrebekreftelsen. Vann, strøm og ventilasjon klargjøres av kunden.'],
          ['5', 'Betaling', 'Etter betalingsplanen: 30 % ved signering, 60 % ved levering og 10 % etter montering.'],
          ['6', 'Reklamasjon', 'Etter forbrukerkjøpsloven. Punkter meldes i kundeportalen og får eget nummer.']])] },
      ],
    },
    {
      id: 'kjopsavtale', t: 'Kjøpsavtale', s: 'Forside, innhold, vilkår, signering og vedlegg.', fot: 'Kjøpsavtale · Ordre O-2417 · ' + KUNDE,
      lages: ['Kunden godtar tilbud v3 i portalen', 'Tilvalg, betalingsplan og vilkår', '«Send til signering»', 'Kjøpsavtale.pdf · 5 sider', 'Penneo og kundeportal'],
      sider: [
        { navn: 'Forside', forside: { eyebrow: 'Kjøpsavtale · Kjøkken', tittel: KUNDE, under: ADR, meta: [['Ordre', 'O-2417'], ['Tilbud', 'HA-T-2231 · versjon 3'], ['Dato', '12. oktober 2026'], ['Selger', 'Kristine B.']] } },
        { navn: 'Innhold', tittel: 'Avtalen', ingress: 'Avtalen gjelder kjøkken etter tegning 5971 med tilvalgene under. Prisene er inkludert mva.', blokker: [
          h('Partene'), kv([['Kjøper', KUNDE + ', ' + ADR], ['Selger', 'Butikknavn AS, Storgata 1, 2317 Hamar'], ['Kontakt kjøper', '900 00 000 · kari@eksempel.no'], ['Kontakt selger', 'Kristine B. · 900 00 001']]),
          h('Det som kjøpes'), linjer([['Kjøkken etter tegning 5971, 3 ark', '238 800 kr'], ['Tilvalg: benkeplate 30 mm', '6 200 kr'], ['Tilvalg: LED under overskap', '2 900 kr'], ['Frakt og montering', '18 900 kr']], ['Kjøpesum inkl. mva', '266 800 kr']),
          h('Betaling og levering'), kv([['Ved signering · 30 %', '80 040 kr'], ['Ved levering · 60 %', '160 080 kr'], ['Etter montering · 10 %', '26 680 kr'], ['Levering', 'uke 46 · montering uke 47']])] },
        { navn: 'Vilkår', tittel: 'Vilkår', ingress: 'Alminnelige leveringsvilkår for kjøkken og innredning.', blokker: [klausuler([
          ['1', 'Avtalens innhold', 'Avtalen består av denne kjøpsavtalen, tegningen, artikkellisten og disse vilkårene. Ved motstrid gjelder kjøpsavtalen.'],
          ['2', 'Endringer', 'Endringer etter signering avtales skriftlig i kundeportalen. Etter endringsfristen fredag 16. oktober kan endringer gi ny leveringstid og pris.'],
          ['3', 'Kontrollmål', 'Selger tar kontrollmål før bestilling. Kjøper sørger for at rommet er klart som avtalt.'],
          ['4', 'Levering', 'Leveringsdag varsles på SMS og i kundeportalen. Kjøper sørger for adkomst og plass til kolli.'],
          ['5', 'Montering', 'Montering skjer etter tegning. Rørlegger og elektriker er ikke med, med mindre det står i avtalen.'],
          ['6', 'Betaling', 'Faktura sendes etter betalingsplanen med 14 dagers forfall.'],
          ['7', 'Mangler og reklamasjon', 'Mangler meldes i kundeportalen. Reklamasjon etter forbrukerkjøpsloven.'],
          ['8', 'Angrerett', 'Varer laget etter kjøpers mål og ønsker omfattes ikke av angreretten.']])] },
        { navn: 'Signering', tittel: 'Signering', ingress: 'Avtalen signeres digitalt med BankID via Penneo. Kjøper signerer først, deretter motsignerer selger. Når begge har signert, får dere avtalen på e-post, og den ligger i kundeportalen.', blokker: [
          signbokser([['Kjøper · ' + KUNDE, 'Signeres med BankID'], ['Selger · Kristine B., Butikknavn', 'Signeres med BankID']]),
          boks('', ['Med signaturen bekrefter partene at de har lest og godtatt avtalen med vedlegg. Avtalen er utferdiget digitalt. Penneo legger til et signaturark med bevis for identitet og tidspunkt.'])] },
        { navn: 'Vedlegg 1', tittel: 'Vedlegg 1 · Tegning og artikler', ingress: 'Tegning 5971 · R09 og artikkellisten slik de var ved signering.', blokker: [bilde('Tegning 5971 · R09 · plan', 300), linjer([['Skap', '23 stk'], ['Fronter', '31 stk'], ['Hvitevarer', '4 stk'], ['Linjer i artikkellisten', '41']])] },
      ],
    },
    {
      id: 'ob', t: 'Ordrebekreftelse', s: 'Varelinjer, levering, endringer og leverandørenes bekreftelser.', fot: 'Ordrebekreftelse · Ordre O-2417 · ' + KUNDE,
      lages: ['Ordre O-2417 i CRM', 'OB fra leverandørene kontrollert', '«Send ordrebekreftelse»', 'Ordrebekreftelse.pdf · 3 sider', 'Kundeportal og e-post'],
      sider: [
        { navn: 'Ordrebekreftelse', tittel: 'Ordrebekreftelse', eyebrow: 'Ordre O-2417', hoyre: ['Ordre O-2417 · Hamar', '12. oktober 2026'], ingress: 'Takk for bestillingen. Her er det vi har bestilt til kjøkkenet ditt, og når det kommer.', blokker: [
          kv([['Kunde', KUNDE], ['Leveringsadresse', ADR], ['Levering', 'tirsdag 17. november'], ['Montering', '17.–19. november']], 4),
          h('Bestilt'), tabell(['Varegruppe', 'Leverandør', 'Antall', 'Levering'], [['Skap og fronter', 'Leverandør A', '54', 'uke 46'], ['Benkeplate 30 mm', 'Leverandør A', '2', 'uke 46'], ['Hvitevarer', 'Leverandør B', '4', 'uke 45'], ['Vask og blandebatteri', 'Leverandør C', '2', 'uke 45'], ['LED under overskap', 'Leverandør C', '4', 'uke 45']], '1.4fr 1fr 70px 90px')] },
        { navn: 'Levering og betaling', tittel: 'Levering og betaling', blokker: [
          h('Endret siden tilbudet'), linjer([['Benkeplate 30 mm (var 20 mm)', '+ 6 200 kr'], ['LED under overskap', '+ 2 900 kr']], ['Ny kjøpesum inkl. mva', '266 800 kr']),
          h('Betaling'), linjer([['Betalt ved signering', '80 040 kr'], ['Faktureres ved levering', '160 080 kr'], ['Faktureres etter montering', '26 680 kr']]),
          boks('Før levering', ['Ryddig vei inn og plass til 14 kolli i garasje eller gang.', 'Vann og strøm klargjort der tegningen viser.', 'Endringsfrist er passert. Nye endringer avtales med selger.'])] },
        { navn: 'Vedlegg', tittel: 'Vedlegg · leverandørenes bekreftelser', ingress: 'Hengsel sammenligner hver bekreftelse med ordren, linje for linje.', blokker: [
          tabell(['Leverandør', 'OB-nr.', 'Mottatt', 'Status'], [['Leverandør A', 'A-77120', '12.10', 'OK etter ny OB'], ['Leverandør B', 'B-3391', '09.10', 'OK'], ['Leverandør C', 'C-1180', '09.10', 'OK']], '1fr 100px 90px 130px'),
          tekst('Første OB fra Leverandør A hadde benkeplate 20 mm. Ny OB med 30 mm er mottatt og godkjent 12. oktober.')] },
      ],
    },
    {
      id: 'anbud', t: 'Anbud og tilvalgsliste', s: 'Liggende A4 til boligprosjekt: forside, leveransen, tilvalg og liste.', ligg: true, fot: 'Anbud A-2026-031 · Prosjekt Eksempelhagen · Byggmester A',
      lages: ['Prosjekt i CRM med 24 enheter', 'Standard og tilvalg per leilighet', '«Lag anbud»', 'Anbud.pdf · 4 sider', 'Byggmester og prosjektportal'],
      sider: [
        { navn: 'Forside', forside: { eyebrow: 'Anbud · Boligprosjekt', tittel: 'Kjøkken og garderobe til Prosjekt Eksempelhagen', under: 'Byggmester A · 24 leiligheter · innflytting høsten 2027', meta: [['Anbud', 'A-2026-031'], ['Dato', '1. oktober 2026'], ['Gyldig til', '1. desember 2026'], ['Kontakt', 'Kristine B.']] } },
        { navn: 'Leveransen', tittel: 'Leveransen', blokker: [
          tabell(['Leilighetstype', 'Antall', 'Kjøkken', 'Garderobe', 'Pris per enhet'], [['2-roms', '8', 'Rett vegg 3,0 m', '1 skap', '84 000 kr'], ['3-roms', '12', 'L-kjøkken 4,2 m', '2 skap', '118 000 kr'], ['4-roms', '4', 'L-kjøkken med øy', '3 skap', '164 000 kr']], '1.2fr 80px 1.3fr 1fr 140px', ['Sum 24 enheter eks. mva', '2 744 000 kr']),
          tekst('Prisene gjelder standard leveranse. Tilvalg betales av kjøper og faktureres via byggmester.')] },
        { navn: 'Tilvalg for kjøperne', todelt: { eyebrow: 'Tilvalg for kjøperne', t: 'Kjøperne velger selv, dere får grunnlaget', s: 'Hver kjøper får tilgang til kundeportalen med tegning av sin leilighet, standard og mulige oppgraderinger med pris. Dere ser status for alle leiligheter i prosjektportalen.', steg: [['Invitasjon', 'Kjøper får e-post med lenke til kundeportalen.'], ['Valg', 'Standard eller oppgradering, pris inkl. påslag.'], ['Frist', 'Påminnelse 7 og 2 dager før. Etter frist: standard.'], ['Grunnlag', 'Dere får sum per leilighet til fakturering av kjøper.']] } },
        { navn: 'Tilvalgsliste', tittel: 'Tilvalgsliste', blokker: [
          tabell(['Tilvalg', 'Gjelder', 'Standard', 'Oppgradering', 'Pris'], [['Front', 'Alle', 'Hvit matt', 'Eik natur', '9 800 kr'], ['Benkeplate', 'Alle', 'Laminat 30 mm', 'Kompaktlaminat 12 mm', '7 400 kr'], ['Grep', 'Alle', 'Knott børstet stål', 'Stang sort 160 mm', '1 900 kr'], ['Belysning', '3- og 4-roms', '–', 'LED under overskap', '2 900 kr'], ['Oppvask', 'Alle', 'Integrert 60 cm', 'Integrert, høy modell', '3 200 kr'], ['Garderobe', 'Alle', 'Hvite dører', 'Speildør', '2 600 kr']], '1fr 1fr 1.1fr 1.3fr 100px')] },
      ],
    },
    {
      id: 'montering', t: 'Monteringsrapport med KS', s: 'Kvalitetssjekk, bilder, restpunkt, hvitevarer og signaturer.', fot: 'Monteringsrapport · Ordre O-2417 · ' + KUNDE,
      lages: ['Jobben i Hengsel Ute', 'KS-sjekkliste med bilder', '«Ferdig montert» og kundens signatur', 'Monteringsrapport.pdf · 2 sider', 'Ordren og kundeportal'],
      sider: [
        { navn: 'Kvalitetssjekk', tittel: 'Kjøkken, ' + KUNDE, eyebrow: 'Monteringsrapport', hoyre: ['Ordre O-2417 · Hamar', 'Montert 19. november 2026'], blokker: [
          kv([['Adresse', ADR], ['Montør', 'Montør En, Montasjefirma A'], ['Tid', '17.–19. november · 21,5 timer']], 3),
          h('Kvalitetssjekk'), ks([['Skap i vater og lodd', 'Alle skap kontrollert med lasermåler', 'OK'], ['Benkeplate', 'Skjøt forseglet, fall mot vask 2 mm', 'OK'], ['Hvitevarer', 'Oppvaskmaskin tilkoblet og testet', 'OK'], ['Fronter og hengsler', 'Justert, lik spalte 3 mm', 'OK'], ['Sokkel', 'Mangler 40 mm ved vegg, kappet og montert', 'OK'], ['Fuge bak komfyr', 'Manglet, fuget dag 3', 'OK'], ['Belysning', 'LED under overskap virker', 'OK'], ['Rydding', 'Emballasje tatt med', 'OK']]),
          h('Bilder'), bilder(['Oversikt', 'Benkeplate skjøt', 'Sokkel ved vegg', 'Etter rydding'], 130)] },
        { navn: 'Signatur', tittel: 'Restpunkter og signatur', blokker: [
          h('Restpunkter'), linjer([['14-3 · Sokkel mangler 40 mm mot vegg', 'Løst 19.11'], ['14-5 · Sokkel mot vegg, 40 mm', 'Løst 18.11'], ['14-6 · Fuge mangler bak komfyr', 'Løst 19.11']]),
          h('Hvitevarer registrert'), tabell(['Hvitevare', 'Modell', 'Serienr.'], [['Platetopp induksjon', 'PT-60-I', '4411 0921'], ['Stekeovn', 'SO-60-P', '4411 3307'], ['Oppvaskmaskin', 'OM-60-I', '7720 1184'], ['Kjøl/frys integrert', 'KF-178', '9031 5562']], '1.2fr 1fr 1fr'),
          sign([[KUNDE, 'Kunde · signert på skjerm 19. november 2026 kl. 14.10'], ['Montør En', 'Montør · Montasjefirma A']])] },
      ],
    },
    {
      id: 'punkt', t: 'Punktrapport', s: 'Alle punkter på kunden med nummer, fase og status.', fot: 'Punktrapport · Ordre O-2417 · ' + KUNDE,
      lages: ['Punktene på kundekortet', 'Fase, status og bilder', '«Lag punktrapport»', 'Punktrapport.pdf · 2 sider', 'Kunde, montør eller leverandør'],
      sider: [
        { navn: 'Oversikt', tittel: 'Nordmann, Lena · Kjøkken', eyebrow: 'Punktrapport', ingress: 'Ordre O-2417 · montert 19.11.2026 · Montør En · rapport laget 20.11.2026', blokker: [
          stats([['Punkter totalt', '7'], ['Åpne', '0'], ['Løst', '6'], ['Utgått', '1']]),
          bilde('Oversiktsbilde med punkter · kjøkken, bilde 3', 280),
          punkter([['14-1', 'Befaring', 'Vannrør i vei for skuff under vask. Flyttes 60 mm mot høyre.', 'Løst', 'Rørlegger (kunde) · 05.11'], ['14-2', 'Befaring', 'Hull i vegg bak oppvaskmaskin.', 'Utgått', 'Montør En · 08.10'], ['14-3', 'Montering', 'Sokkel mangler 40 mm mot vegg, må kappes.', 'Løst', 'Montør En · 19.11']])] },
        { navn: 'Punkter', tittel: 'Punkter, fortsatt', blokker: [
          punkter([['14-4', 'Befaring', 'Stikkontakt flyttes 20 cm for å komme bak kjøleskap.', 'Løst', 'Elektriker (kunde) · 05.11'], ['14-5', 'Montering', 'Sokkel mot vegg, 40 mm.', 'Løst', 'Montør En · 18.11'], ['14-6', 'KS', 'Fuge mangler bak komfyr.', 'Løst', 'Montør En · 19.11'], ['14-7', 'Reklamasjon', 'Ripe i front under vask. Ny front bestilt.', 'Løst', 'Kristine B. · 02.12']]),
          tekst('Punktene har samme nummer i CRM, Hengsel Ute og kundeportalen.')] },
      ],
    },
    {
      id: 'fdv', t: 'Leveringspakke og FDV', s: 'Forside, FDV, garanti, hvitevarer og dokumentliste.', fot: 'Leveringspakke · Ordre O-2417 · ' + KUNDE,
      lages: ['Ordren etter ferdigmelding', 'FDV for valgte materialer og hvitevarer', '«Lag leveringspakke»', 'Leveringspakke.pdf · 5 sider', 'Kundeportal, «Kjøkkenet ditt»'],
      sider: [
        { navn: 'Forside', forside: { eyebrow: 'Leveringspakke · Del 2', tittel: 'Alt om kjøkkenet ditt', under: KUNDE + ' · ' + ADR + ' · Montert 19. november 2026', fliser: [['FDV', 'Drift og vedlikehold for skap, fronter og benkeplate'], ['Garanti', 'Hva som gjelder, og hvordan du melder fra'], ['Vedlikehold', 'Årlig: juster hengsler, sjekk fuger'], ['Hvitevarer', 'Typeskilt, modellnummer og garantibevis']], tekst: 'Du finner alt dette i kundeportalen også. Logg inn med telefonnummeret ditt, så ligger dokumentene der så lenge kjøkkenet står.' } },
        { navn: 'FDV', tittel: 'Forvaltning, drift og vedlikehold', blokker: [
          h('Fronter i eik, matt lakk'), tekst('Tørk av med lett fuktig klut og mildt såpevann. Unngå skurende midler og mikrofiberkluter med slipeeffekt.'),
          h('Benkeplate laminat 30 mm'), tekst('Bruk skjærebrett og grytebrikker. Tørk opp vann ved skjøter og rundt vask med en gang.'),
          h('Skuffer og hengsler'), tekst('Juster hengsler med skrutrekker ved behov. Skuffer justeres med hjulet bak frontfestet.'),
          boks('Årlig sjekk', ['Juster dører som henger.', 'Sjekk fugen rundt vask og bak komfyr.', 'Rens fettfilteret i ventilatoren.'])] },
        { navn: 'Garanti', tittel: 'Garanti og reklamasjon', blokker: [
          linjer([['Skap og skrog', '5 år'], ['Hengsler og skuffeskinner', '5 år'], ['Benkeplate', '2 år'], ['Hvitevarer', 'etter produsentens garanti'], ['Montering', '5 år etter forbrukerkjøpsloven']]),
          boks('Slik melder du fra', ['1. Logg inn i kundeportalen og velg «Meld punkt».', '2. Ta bilde og skriv kort hva som er feil.', '3. Punktet får nummer, og du ser status der.'])] },
        { navn: 'Hvitevarer', tittel: 'Hvitevarer', ingress: 'Registrert av montøren fra typeskiltet ved montering.', blokker: [
          tabell(['Hvitevare', 'Modell', 'Serienr.', 'Garanti til'], [['Platetopp induksjon', 'PT-60-I', '4411 0921', 'nov. 2028'], ['Stekeovn', 'SO-60-P', '4411 3307', 'nov. 2028'], ['Oppvaskmaskin', 'OM-60-I', '7720 1184', 'nov. 2028'], ['Kjøl/frys integrert', 'KF-178', '9031 5562', 'nov. 2028']], '1.3fr 1fr 1fr 110px'),
          bilder(['Typeskilt platetopp', 'Typeskilt stekeovn', 'Typeskilt oppvask', 'Typeskilt kjøl/frys'], 120)] },
        { navn: 'Vedlegg', tittel: 'Vedlegg', blokker: [
          tabell(['Dokument', 'Sider'], [['Tegning 5971 · R09', '3'], ['Monteringsrapport med KS', '2'], ['Punktrapport', '2'], ['Bruksanvisninger hvitevarer', '4 stk'], ['Vedlikehold av benkeplate', '2'], ['Garantibevis innredning', '1']], '1fr 90px')] },
      ],
    },
    {
      id: 'plan', t: 'Montasjeplan', s: 'Liggende A4 per uke, med arbeidsordrene for hver jobb.', ligg: true, fot: 'Montasjeplan · uke 47 · Butikknavn Hamar',
      lages: ['Montasjeplanen i CRM', 'Uke 47, alle montører', '«Skriv ut uke»', 'Montasjeplan.pdf · 2 sider', 'Montører og montasjefirma'],
      sider: [
        { navn: 'Uke 47', tittel: 'Montasjeplan uke 47', hoyre: ['16.–20. november 2026', '6 monteringer · 1 uten montør'], blokker: [
          plan(['Man 16.', 'Tir 17.', 'Ons 18.', 'Tor 19.', 'Fre 20.'], [
            ['Montør En', 'Montasjefirma A', [null, ['Kari Nordmann', 'Kjøkken · dag 1', 'ny'], ['Kari Nordmann', 'Kjøkken · dag 2', 'ny'], ['Kari Nordmann', 'Kjøkken · dag 3', 'ny'], null]],
            ['Montør To', 'Montasjefirma A', [['Per Nordmann', 'Kjøkken · dag 1'], ['Per Nordmann', 'Kjøkken · dag 2'], null, ['Lise Nordmann', 'Garderobe · venter svar', 'warn'], null]],
            ['Montør Tre', 'Montasjefirma B', [['Butikknavn', 'Utstilling'], null, ['Nina Nordmann', 'Kjøkken · dag 1'], ['Nina Nordmann', 'Kjøkken · dag 2'], null]],
            ['Uten montør', 'Venter på firma', [null, null, null, null, ['Tor Nordmann', 'Kjøkken · mangler montør', 'bad']]]])] },
        { navn: 'Arbeidsordrer', tittel: 'Arbeidsordrer uke 47', blokker: [
          tabell(['Kunde', 'Adresse', 'Montør', 'Start', 'Kolli', 'Merknad'], [['Kari Nordmann', ADR, 'Montør En', 'tir. 07.30', '14', 'Ny OB, benkeplate 30 mm'], ['Per Nordmann', 'Eksempelveien 4, Hamar', 'Montør To', 'man. 07.30', '11', '–'], ['Lise Nordmann', 'Prøvegata 2, Gjøvik', 'Montør To', 'tor. 08.00', '3', 'Venter svar fra firma'], ['Nina Nordmann', 'Testvegen 9, Brumunddal', 'Montør Tre', 'ons. 07.30', '12', 'Kontrollmål OK'], ['Tor Nordmann', 'Demoveien 1, Lillehammer', '–', 'fre.', '9', 'Mangler montør']], '1fr 1.5fr 0.9fr 0.8fr 60px 1.3fr')] },
      ],
    },
    {
      id: 'faktura', t: 'Faktura', s: 'Sluttfaktura etter montering, med betalingsoversikt.', fot: 'Faktura 26-1184 · Ordre O-2417 · ' + KUNDE,
      lages: ['Ordren etter ferdigmelding', 'Sluttfaktura 10 % etter betalingsplanen', '«Fakturer»', 'Faktura.pdf · 2 sider', 'PowerOffice Go og e-post'],
      sider: [
        { navn: 'Faktura', tittel: 'Faktura', eyebrow: 'Sluttfaktura', hoyre: ['Faktura 26-1184', '20. november 2026'], blokker: [
          kv([['Kunde', KUNDE + ', ' + ADR], ['Ordre', 'O-2417 · Kjøkken'], ['Forfall', '4. desember 2026'], ['KID', '0026118400417']], 2),
          tabell(['Beskrivelse', 'Antall', 'Beløp eks. mva', 'Mva'], [['Kjøkken etter kjøpsavtale, 10 % etter montering', '1', '21 344 kr', '5 336 kr']], '1.8fr 70px 140px 100px'),
          linjer([['Sum eks. mva', '21 344 kr'], ['Mva 25 %', '5 336 kr']], ['Å betale', '26 680 kr']),
          boks('Betaling', ['Kontonummer 0000 00 00000 · Butikknavn AS', 'Merk betalingen med KID 0026118400417.'])] },
        { navn: 'Betalingsoversikt', tittel: 'Betalingsoversikt', blokker: [
          linjer([['Kjøpesum inkl. mva', '266 800 kr'], ['Betalt ved signering · 12.10', '− 80 040 kr'], ['Betalt ved levering · 17.11', '− 160 080 kr']], ['Denne fakturaen', '26 680 kr']),
          tekst('Fakturaen er overført til regnskapet. Spørsmål om fakturaen sendes til Butikknavn i kundeportalen.')] },
      ],
    },
  ];
  window.HENGSEL_DOK = DOK;
})();
