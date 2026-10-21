/* D-12 (20.10.2026): tillegg og endringer til sidekart-skjermer.js. Lastes etter den. Eksempeldata er oppdiktet. */
window.D12UteNav = {
  montor: [['idag', 'I dag', 'kalender', 3, 0], ['oppdrag', 'Oppdrag', 'ordre', 0, 0], ['punkter', 'Punkter', 'saker', 2, 1], ['timer', 'Timer', 'frist', 0, 0], ['varsler', 'Varsler', 'varsler', 1, 0]],
  utkjorer: [['idag', 'I dag', 'kalender', 3, 0], ['lager', 'Lager', 'ordre', 0, 0], ['skann', 'Skann', 'sok', 0, 0], ['varsler', 'Varsler', 'varsler', 1, 0], ['profil', 'Profil', 'profil', 0, 0]],
  firmaleder: [['idag', 'I dag', 'kalender', 0, 0], ['foresporsler', 'Forespørsler', 'ordre', 3, 1], ['montorer', 'Montører', 'kunder', 0, 0], ['fakturaer', 'Fakturaer', 'fakturaer', 0, 0], ['varsler', 'Varsler', 'varsler', 1, 0]],
  selger: [['idag', 'I dag', 'kalender', 3, 0], ['kunder', 'Kunder', 'kunder', 0, 0], ['oppdrag', 'Oppdrag', 'ordre', 0, 0], ['varsler', 'Varsler', 'varsler', 1, 0], ['profil', 'Profil', 'profil', 0, 0]]
};
(function kjor() {
  var S = window.SidekartSkjermer; if (!S || !window.Sidekart) { setTimeout(kjor, 20); return; }
  var r = function (a, b, s, st, lenke) { return [a, b, s || null, st || null, lenke]; };
  var KL = function (tittel, rader, n, b) { return { k: 'kortliste', b: b || '1/3', tittel: tittel, rader: rader, n: n || rader.length }; };
  var STA = function (tittel, s, pille, setning) { return { k: 'status', b: '1/3', tittel: tittel, s: s, pille: pille, setning: setning }; };
  var SK = function (tittel, felt, handling) { return { k: 'skjema', b: '1/2', tittel: tittel, felt: felt, handling: handling || 'Lagre' }; };
  var TB = function (tittel, kol, rader) { return { k: 'tabell', b: '1/1', tittel: tittel, kol: kol, rader: rader }; };
  var ute = function (tittel, under, rader, knapp) { return { flate: 'ute', tittel: tittel, under: under, rader: rader, knapp: knapp }; };

  /* Punkt 13: Ute-innlogging */
  var inn = function (o) { return Object.assign({ flate: 'ute-inn', tittel: 'Logg inn', tekst: 'Bruk e-posten og passordet fra arbeidsgiveren din.', felt: ['E-post', 'Passord'], knapp: 'Logg inn', lenke: 'Glemt passord?', miljo: 'Ekte' }, o || {}); };
  S['22-001'] = inn();
  S['22-001-demo'] = inn({ demo: true, miljo: 'Demo', tekst: 'Demobrukere logger inn med brukernavn uten @.', felt: ['Brukernavn: montor1', 'Passord: ••••••••'] });
  S['22-001-faceid'] = inn({ felt: ['E-post: montor.en@eksempel.no', 'Passord: ••••••••'], skuff: { pos: 'ark', tittel: 'Bruk Face ID neste gang?', under: 'Du logger inn med ansiktet i stedet for passordet.', deler: [{ t: 'tekst', tekst: 'Du kan slå det av under Profil og språk.' }], knapp: 'Bruk Face ID' } });
  S['22-001-varsler'] = inn({ felt: ['E-post: montor.en@eksempel.no', 'Passord: ••••••••'], skuff: { pos: 'ark', tittel: 'Vil du ha varsler?', under: 'Kommer etter valget om Face ID.', deler: [{ t: 'tekst', tekst: 'Du får varsel om nye oppdrag, endringer i oppdragene dine og meldinger fra butikken.' }], knapp: 'Slå på varsler' } });

  /* Punkt 2: iPad-oppsett */
  S['22-002-ipad'] = Object.assign({}, S['22-003'], { uteJobb: true });
  S['22-010-ipad'] = Object.assign({}, S['22-010'], { rader: [
    [KL('Forespørsler', [r('Tor Engen · Gjøvik', 'tir. 03.11 · 16 800 kr · kjøkken', 'advarsel', 'Svar i dag', 'Ta jobben · Avslå'), r('Familien Lie · Hamar', 'ons. 11.11 · 9 400 kr · bad', 'ny', 'Ny', 'Ta jobben · Avslå'), r('Hagen AS, Furulia · Hamar', 'fre. 13.11 · 4 leiligheter', 'ny', 'Ny', 'Ta jobben · Avslå')], 3, '1/1')],
    [SK('Avslå Tor Engen · Gjøvik', ['Årsak (påkrevd): Velg årsak ▾', 'Kommentar til montasjeleder', 'Foreslå annen dato: valgfritt'], 'Avslå'), KL('Ledige egne montører tir. 03.11', [r('Jon Moe', '1 dag ledig', 'ferdig', 'Ledig'), r('Per Dahl', 'service hele dagen', 'venter', 'Opptatt'), r('Lars Berg', 'Haugen hele dagen', 'venter', 'Opptatt')], 3, '1/2')],
    [{ k: 'uke', b: '1/1', tittel: 'Uke 45 · kapasitet 11 av 15 dagsverk', dager: [['Man 02.11 · 3 av 3', ['Lars Berg · Haugen', 'Jon Moe · Hagen AS', 'Per Dahl · service']], ['Tir 03.11 · 2 av 3', ['Lars Berg · Haugen', 'Jon Moe · Hagen AS']], ['Ons 04.11 · 2 av 3', ['Lars Berg · Sæther', 'Per Dahl · Lie']], ['Tor 05.11 · 3 av 3', ['Lars Berg · Sæther', 'Jon Moe · Hagen AS', 'Per Dahl · service']], ['Fre 06.11 · 1 av 3', ['Jon Moe · Hagen AS']]] }],
    [TB('Fordeling på egne montører', ['Montør', 'Uke 45', 'Uke 46', 'Uke 47', 'Ledig'], [['Lars Berg', '4 dager', '5 dager', '3 dager', '3 dager'], ['Jon Moe', '4 dager', '2 dager', '0 dager', '9 dager'], ['Per Dahl', '3 dager', '4 dager', '5 dager', '3 dager']])]
  ] });
  S['22-004-ipad'] = Object.assign({}, S['22-004'], { rader: [
    [{ k: 'valg', b: '1/1', tittel: 'Apple Pencil', valg: [['Penn', 'Svart, 2 pt', true], ['Markør', 'Gul'], ['Nål', 'Nytt punkt'], ['Viskelær', 'Dobbelttrykk på pennen']] }],
    [{ k: 'bilde', b: '1/1', tittel: 'Plan og oppriss', tekst: 'Tegn rett på tegningen med Apple Pencil. To fingre zoomer. Nålen lager et punkt på stedet.' }],
    [KL('Punkter på tegningen', [r('14-3', 'Sokkel mangler 40 mm', 'advarsel', 'Åpen'), r('14-5', 'Sokkel mot vegg', 'ferdig', 'Løst')], 2, '1/2'), KL('Versjoner', [r('Versjon 3', 'Kari Nordli · 12.10', 'ferdig', 'Gjelder'), r('Versjon 2', 'Kari Nordli · 02.10', 'venter', 'Erstattet')], 2, '1/2')]
  ] });
  S['22-006-ipad'] = Object.assign({}, S['22-006'], { rader: [
    [{ k: 'bilde', b: '1/1', tittel: 'Bilde av punkt 14-3', tekst: 'Tegn på bildet med Apple Pencil for å vise hvor feilen er. Streken lagres sammen med bildet.' }],
    [KL('Åpne punkter', [r('14-3', 'Sokkel mangler 40 mm mot vegg', 'advarsel', 'Åpen'), r('14-6', 'Fuge mangler bak komfyr', 'advarsel', 'Åpen')], 2, '1/2'), SK('Punkt 14-3', ['Hva er feil: Sokkel mangler 40 mm mot vegg', 'Rom: Kjøkken', 'Bilde: 1 bilde med tegning', 'Ansvar: Montør'], 'Lagre punkt')]
  ] });

  /* Punkt 5: bunnmeny per brukertype */
  ['22-009', '22-020', '22-021'].forEach(function (n) { if (S[n]) S[n].uteBunn = 'utkjorer'; });
  ['22-010', '22-010-ipad'].forEach(function (n) { if (S[n]) S[n].uteBunn = 'firmaleder'; });
  if (S['22-012']) S['22-012'].uteBunn = 'selger';

  /* Merkenavn byttet (svar 72) */
  if (S['22-020']) S['22-020'].rader.forEach(function (rad) { rad.forEach(function (f) { (f.rader || []).forEach(function (x) { if (x[0] === 'O-2026-0418 · Tradeplace') x[0] = 'O-2026-0418 · Hvitevarer'; }); }); });

  /* Punkt 4 og tilstandene: tekst for tom og ingen tilgang */
  var T = {
    '22-002': ['Ingen oppdrag', 'Når butikken gir deg et oppdrag, står det her.'], '22-003': ['Oppdraget er tomt', 'Oppdraget har ingen sjekkliste eller tegninger ennå.'],
    '22-004': ['Ingen tegning', 'Selgeren har ikke lagt ved tegning på dette oppdraget.'], '22-005': ['Ingen spesifikasjon', 'Butikken har ikke sendt montørspesifikasjonen ennå.'],
    '22-006': ['Ingen punkter', 'Det er ikke registrert punkter på dette oppdraget.'], '22-007': ['Ingen timer denne uka', 'Timer du fører på oppdragene, står her.'],
    '22-008': ['Ingenting å ferdigmelde', 'Oppdraget har ingen KS-punkter ennå.'], '22-009': ['Ingen leveranser i dag', 'Leveranser butikken gir deg, står her.'],
    '22-010': ['Ingen forespørsler', 'Når en butikk sender en forespørsel, står den her.'], '22-011': ['Ingen servicejobber', 'Rettejobber og service som er gitt deg, står her.'],
    '22-012': ['Ingen oppfølging i dag', 'Kunder du skal følge opp, står her.'], '22-013': ['Ingenting venter på nett', 'Alt du har gjort, er sendt.'],
    '22-014': ['Ingen innstillinger', ''], '22-015': ['Ingen varsler', 'Varsler om oppdrag og meldinger står her.'],
    '22-020': ['Ingenting ut i dag', 'Kolli som skal ut eller er mottatt, står her.'], '22-021': ['Ingenting skannet', 'Hold strekkoden på kolliet i rammen.']
  };
  Object.keys(T).forEach(function (n) { if (S[n]) { S[n].tomTittel = T[n][0]; S[n].tom = T[n][1]; } });
  ['22-003', '22-004', '22-005', '22-006', '22-008'].forEach(function (n) { if (S[n]) { S[n].ingenTittel = 'Oppdraget er ikke ditt'; S[n].ingen = 'Oppdraget er gitt til en annen montør. Spør firmalederen hvis det skal være ditt.'; } });
  if (S['22-010']) { S['22-010'].ingenTittel = 'Bare for firmaleder'; S['22-010'].ingen = 'Siden er for firmalederen i montørfirmaet. Du er registrert som montør.'; }
  ['22-009', '22-020', '22-021'].forEach(function (n) { if (S[n]) { S[n].ingenTittel = 'Bare for utkjører'; S[n].ingen = 'Siden er for utkjørere. Spør butikken om du skal ha tilgang.'; } });

  /* Svar 77: 22-003 i to kolonner på iPad */
  (function () { var j = S['22-003']; if (!j) return; var R = j.rader, st = function (f) { return Object.assign({}, f, { b: '1/2' }); }, h = function (f) { return Object.assign({}, f, { b: '1/2' }); };
    S['22-003-ipad'] = Object.assign({}, j, { rader: [[st(R[0][0]), st(R[1][0])], [h(R[2][0]), h(R[3][0])]].concat(R.slice(4)) }); })();

  /* Del B: Admin */
  var K = window.Sidekart;
  var TX = function (tittel, tekst, b) { return { k: 'tekst', b: b || '1/2', tittel: tittel, tekst: tekst }; };
  var B = /^(21-9[0-2]\d|26-0(0\d|1[0-3]))$/;
  if (K && K.forslag) K.forslag.forEach(function (s) { if (B.test(s.nr)) s.enh = 'P T'; });
  if (K) K.produkter.forEach(function (p) { p.tiere.forEach(function (t) { t.sider.forEach(function (s) { if (B.test(s.nr)) s.enh = 'P T'; }); if (t.id === '21-9' && !t.sider.some(function (s) { return s.nr === '21-921'; })) t.sider.push({ nr: '21-921', navn: 'Merkevare', rute: '/#/innstillinger/merkevare', rolle: 'Superadmin, hengsel_drift', enh: 'P T', st: 'NY', kilde: 'D-12', m: 'Kundetema per kjede', fil: null, side: '21-921 Merkevare.dc.html', tegnet: 'D-12' }); }); });
  if (S['21-905']) S['21-905'].rader.forEach(function (rad) { rad.forEach(function (f) { (f.rader || []).forEach(function (x) { for (var i = 0; i < x.length; i++) if (x[i] === 'Oppvaskmaskin Bosch') x[i] = 'Oppvaskmaskin 60 cm'; }); }); });
  var ktOk = { bakgrunn: 'oklch(0.97 0.01 80)', flate: 'oklch(1 0 0)', felt: 'oklch(0.99 0.004 80)', tekst: 'oklch(0.26 0.02 60)', aksent: 'oklch(0.45 0.09 150)', lenke: 'oklch(0.42 0.09 150)', kant: 'oklch(0.84 0.01 80)', radius: '6px' };
  var ktFeil = Object.assign({}, ktOk, { aksent: 'oklch(0.80 0.10 150)', lenke: 'oklch(0.74 0.10 150)' });
  var STA3 = function (t, s, p, set) { return STA(t, s, p, set); };
  var merkevare = function (kt, feil) {
    var farge = function (n, v) { return n + ': ' + v; };
    return { flate: 'crm', rolle: 'superadmin', aktiv: 'innstillinger', tittel: 'Merkevare', smule: ['Innstillinger', 'Eksempelkjøkken'], hoved: 'Lagre tema', status: feil ? 'feil' : 'ferdig', statusTekst: feil ? 'Kan ikke lagres' : 'Holder kravene',
      ingenTittel: 'Bare for superadmin og hengsel_drift', ingen: 'Merkevaren til kjeden settes av Hengsel. Spør Hengsel hvis logoen eller fargene skal endres.',
      tomTittel: 'Ingen merkevare satt', tom: 'Kjeden bruker nettsidebasis uten kundetema til noen fyller ut skjemaet.',
      rader: [
        feil ? [STA3('Tekst mot bakgrunn', 'ferdig', '11,9 : 1', 'Krav minst 4,5 : 1.'), STA3('Aksent mot hvit tekst', 'feil', '1,9 : 1', 'Krav minst 4,5 : 1. Gjør aksenten mørkere.'), STA3('Kant og fokus', 'feil', '1,6 : 1', 'Krav minst 3 : 1.')]
             : [STA3('Tekst mot bakgrunn', 'ferdig', '11,9 : 1', 'Krav minst 4,5 : 1.'), STA3('Aksent mot hvit tekst', 'ferdig', '6,4 : 1', 'Krav minst 4,5 : 1.'), STA3('Kant og fokus', 'ferdig', '4,8 : 1', 'Krav minst 3 : 1.')],
        [SK('Navn og logo', ['Navn: Eksempelkjøkken', 'Kortnavn: Eksempel', 'Logo lys og mørk: eksempel-lys.svg · eksempel-mork.svg', 'Favicon: eksempel-favicon.svg'], 'Lagre'), { k: 'bilde', b: '1/2', tittel: 'Forhåndsvisning', forhand: kt, tekst: 'Innloggingen, kundeportalen og e-posttoppen i temaet.' }],
        [SK('Farger', [farge('Bakgrunn', kt.bakgrunn), farge('Flate', kt.flate), farge('Felt', kt.felt), farge('Tekst', kt.tekst)], 'Lagre'), SK('Farger', [farge('Aksent', kt.aksent), farge('Lenke', kt.lenke), farge('Kant', kt.kant), 'Statusfarger: alltid Hengsels (kan ikke endres)'], feil ? 'Lagre (sperret)' : 'Lagre')],
        [SK('Skrift og hjørner', ['Skrift: Hengsel (Schibsted Grotesk) ▾', 'Egen fontfil: last opp .woff2', 'Hjørner: Kantet 6 · Myk 12 · Rund 999', 'Valgt: Kantet 6'], 'Lagre'),
         TX(feil ? 'Kan ikke lagres' : 'Kravene', feil ? 'Aksenten og kanten er for lyse. Tekst må ha minst 4,5 : 1 mot det den står på, og kant og fokus minst 3 : 1. Gjør aksenten og lenkefargen mørkere, så kan du lagre.' : 'Tekst må ha minst 4,5 : 1 mot det den står på, og kant og fokus minst 3 : 1. Holder ikke temaet kravet, kan det ikke lagres. Statusfargene er alltid Hengsels og kan ikke endres. «Levert av Hengsel» står alltid med det oransje merket.')]
      ] }; };
  S['21-921'] = merkevare(ktOk, false);
  S['21-921-kontrast'] = merkevare(ktFeil, true);

  /* Punkt 15: Admin-innlogging */
  var a26 = function (o) { return Object.assign({ flate: 'innlogging', tittel: 'Logg inn', tekst: 'Bare for Hengsel. Cloudflare Access sender en kode til jobb-e-posten din.', felt: ['E-post'], knapp: 'Send kode' }, o || {}); };
  S['26-001'] = a26();
  S['26-001-kode'] = a26({ tekst: 'Vi har sendt en kode til navn@hengsel.no. Koden gjelder i 10 minutter.', felt: ['E-post: navn@hengsel.no', 'Kode fra e-posten: 6 sifre'], knapp: 'Logg inn', lenke: 'Send ny kode' });
  S['26-001-ingen'] = a26({ tittel: 'Ingen tilgang', tekst: 'navn@eksempel.no har ikke tilgang til Hengsel Admin. Bruk jobb-e-posten din i Hengsel, eller spør en superadmin.', felt: [], knapp: 'Prøv en annen e-post' });

  /* Punkt 6: Støtte og Fakturering er nøytrale «Kommer»-sider utenfor menyen */
  ['26-011', '26-012'].forEach(function (n) { if (S[n]) { S[n].rader = [[TX('Kommer', 'Kommer.', '1/1')]]; S[n].utenMeny = true; S[n].aktiv = null; } });
  /* Svar 72: ekte navn byttet på sidene i del B */
  var bytt = function (o) { if (typeof o === 'string') return o.replace(/Eirik/g, 'Lene Dahl'); if (Array.isArray(o)) return o.map(bytt); if (o && typeof o === 'object') { Object.keys(o).forEach(function (k) { o[k] = bytt(o[k]); }); return o; } return o; };
  if (K) K.produkter.forEach(function (p) { p.tiere.forEach(function (t) { t.sider.forEach(function (s) { if (B.test(s.nr)) bytt(s); }); }); });
  Object.keys(S).forEach(function (n) { if (/^(21-9[0-2]\d|26-0(0\d|1[0-3]))/.test(n)) { bytt(S[n]); S[n].person = { navn: 'Lene Dahl', init: 'LD' }; } });
  window.D12 = true;
})();
