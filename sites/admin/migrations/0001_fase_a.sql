-- Hengsel Admin fase A (K-240, S-62): datamodellen fra docs/design/admin-fase-a/60-213_overlevering_code_fase_a.md punkt d.
-- Cloudflare D1 (SQLite). id er ULID (TEXT), datoer er ISO (2026-10-14), tider er ISO med tidssone, beløp er INTEGER i øre, prosent er REAL.
-- Alle tabeller har opprettet og endret (TEXT, påkrevd). Ingen eksempeldata her bortsett fra prisliste 2026.2 (utkast, eksempel=1),
-- avtalemalene og innstillingene fra punkt e og k, som alle er merket eksempel der de er det.

CREATE TABLE eier (
  id TEXT PRIMARY KEY,
  navn TEXT NOT NULL,
  orgnr TEXT,                                   -- 9 siffer uten mellomrom
  adresse TEXT, postnr TEXT, sted TEXT, fylke TEXT,
  kjede TEXT NOT NULL DEFAULT 'annen' CHECK (kjede IN ('sigdal', 'annen')),
  produktlinje TEXT NOT NULL DEFAULT 'hengsel' CHECK (produktlinje IN ('sigdal', 'hengsel')),
  status TEXT NOT NULL DEFAULT 'ny' CHECK (status IN ('ny', 'demo', 'tilbud', 'forhandling', 'signert', 'tapt')),
  er_kunde INTEGER NOT NULL DEFAULT 0,
  kilde TEXT CHECK (kilde IS NULL OR kilde IN ('be_om_demo', 'sigdal_kjedemote', 'anbefaling', 'messe', 'import', 'annet')),
  tap_grunn TEXT, tap_merknad TEXT,
  neste_tekst TEXT, neste_dato TEXT,
  lead_tid TEXT, lead_kanal TEXT, lead_melding TEXT, lead_butikker TEXT, lead_ansatte TEXT,
  lead_ny INTEGER NOT NULL DEFAULT 0,
  miljo_adresse TEXT, miljo_database TEXT, miljo_tema TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE UNIQUE INDEX eier_orgnr ON eier(orgnr) WHERE orgnr IS NOT NULL;
CREATE INDEX eier_status ON eier(status);

CREATE TABLE butikk (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id) ON DELETE CASCADE,
  navn TEXT NOT NULL, sted TEXT,
  pakke TEXT CHECK (pakke IS NULL OR pakke IN ('start', 'butikk', 'komplett')),
  brukere INTEGER, montorer INTEGER,
  rekkefolge INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX butikk_eier ON butikk(eier_id);

CREATE TABLE kontakt (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id) ON DELETE CASCADE,
  navn TEXT NOT NULL, rolle TEXT, telefon TEXT, epost TEXT,
  signaturrett INTEGER NOT NULL DEFAULT 0,
  primaer INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX kontakt_eier ON kontakt(eier_id);

CREATE TABLE mulighet (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id) ON DELETE CASCADE,
  produktlinje TEXT NOT NULL CHECK (produktlinje IN ('sigdal', 'hengsel')),
  fase TEXT NOT NULL CHECK (fase IN ('ny', 'demo', 'tilbud', 'forhandling', 'signert', 'tapt')),
  antall_butikker INTEGER NOT NULL DEFAULT 1,
  verdi_mnd_ore INTEGER,
  aapnet TEXT NOT NULL, lukket TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX mulighet_eier ON mulighet(eier_id);

CREATE TABLE aktivitet (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id) ON DELETE CASCADE,
  kontakt_id TEXT REFERENCES kontakt(id) ON DELETE SET NULL,
  mulighet_id TEXT REFERENCES mulighet(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('samtale', 'mote', 'demo', 'epost', 'notat')),
  dato TEXT NOT NULL,
  tittel TEXT NOT NULL,
  tekst TEXT,
  hvem TEXT NOT NULL,
  neste_tekst TEXT, neste_dato TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX aktivitet_eier ON aktivitet(eier_id, dato);

CREATE TABLE prisliste (
  id TEXT PRIMARY KEY,
  versjon TEXT NOT NULL UNIQUE,
  gjelder_fra TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('utkast', 'aktiv', 'arkivert')),
  binding_mnd INTEGER NOT NULL DEFAULT 12,
  oppsigelse_mnd INTEGER NOT NULL DEFAULT 3,
  prisjustering TEXT NOT NULL DEFAULT 'kpi',
  viderefakturering_prosent REAL NOT NULL DEFAULT 15,
  mva_prosent REAL NOT NULL DEFAULT 25,
  rabatt_gjelder TEXT NOT NULL DEFAULT '["pakke","ekstra_brukere","ute"]',
  publisert TEXT,
  eksempel INTEGER NOT NULL DEFAULT 0,          -- 1 = «Eksempel – prislisten er ikke låst»
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
-- Bare én aktiv om gangen
CREATE UNIQUE INDEX prisliste_aktiv ON prisliste(status) WHERE status = 'aktiv';

CREATE TABLE prislisterad (
  id TEXT PRIMARY KEY,
  prisliste_id TEXT NOT NULL REFERENCES prisliste(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pakke', 'ute', 'tillegg', 'rabattrinn')),
  produktlinje TEXT,                            -- pakke: sigdal / hengsel
  kode TEXT,                                    -- pakke: start/butikk/komplett · ute: montor/firma · tillegg: backup/domene · rabattrinn: trinn-<fra>
  navn TEXT,
  pris_ore INTEGER,
  inkl_brukere INTEGER, ekstra_bruker_ore INTEGER, support_timer INTEGER, etablering_ore INTEGER,
  moduler TEXT,                                 -- JSON-liste
  maks_antall INTEGER,                          -- ute/firma: maks montører for firmapris
  inkludert_regel TEXT,                         -- tillegg: komplett_eller_flere_butikker
  merknad TEXT,
  fra_butikker INTEGER, prosent REAL,           -- rabattrinn
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  UNIQUE (prisliste_id, type, produktlinje, kode)
);

CREATE TABLE tilbud (
  id TEXT PRIMARY KEY,
  nr TEXT NOT NULL,
  versjon INTEGER NOT NULL,
  mulighet_id TEXT NOT NULL REFERENCES mulighet(id),
  eier_id TEXT NOT NULL REFERENCES eier(id),
  kontakt_id TEXT REFERENCES kontakt(id) ON DELETE SET NULL,
  prisliste_id TEXT NOT NULL REFERENCES prisliste(id),
  produktlinje TEXT NOT NULL CHECK (produktlinje IN ('sigdal', 'hengsel')),
  dato TEXT NOT NULL, gyldig_til TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('utkast', 'sendt', 'erstattet', 'akseptert')),
  erstatter_id TEXT REFERENCES tilbud(id),
  leverandor_json TEXT NOT NULL,
  sum_mnd_ore INTEGER NOT NULL, mva_mnd_ore INTEGER NOT NULL,
  rabatt_prosent REAL NOT NULL, rabatt_ore INTEGER NOT NULL, etablering_ore INTEGER NOT NULL,
  pdf_nokkel TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  UNIQUE (nr, versjon)
);
CREATE INDEX tilbud_eier ON tilbud(eier_id);

CREATE TABLE tilbudslinje (
  id TEXT PRIMARY KEY,
  tilbud_id TEXT NOT NULL REFERENCES tilbud(id) ON DELETE CASCADE,
  rekkefolge INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pakke', 'ekstra_brukere', 'ute', 'rabatt', 'tillegg', 'etablering', 'viderefakturering')),
  butikk_navn TEXT, pakke TEXT, antall INTEGER, enhetspris_ore INTEGER,
  belop_ore INTEGER NOT NULL,
  rabatterbar INTEGER NOT NULL DEFAULT 0,
  tekst TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX tilbudslinje_tilbud ON tilbudslinje(tilbud_id, rekkefolge);

CREATE TABLE avtalemal (
  id TEXT PRIMARY KEY,
  navn TEXT NOT NULL,
  versjon TEXT NOT NULL,
  gjelder_fra TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('utkast', 'aktiv', 'arkivert')),
  fil_nokkel TEXT NOT NULL,
  eksempel INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE avtale (
  id TEXT PRIMARY KEY,
  nr TEXT NOT NULL UNIQUE,
  eier_id TEXT NOT NULL REFERENCES eier(id),
  tilbud_id TEXT REFERENCES tilbud(id),
  status TEXT NOT NULL CHECK (status IN ('utkast', 'signering', 'signert', 'sagt_opp')),
  leverandor_json TEXT NOT NULL,
  binding_mnd INTEGER NOT NULL, oppsigelse_mnd INTEGER NOT NULL,
  start TEXT, fornyes TEXT, opphorer TEXT,
  prisjustering TEXT NOT NULL DEFAULT 'kpi',
  per_mnd_ore INTEGER NOT NULL,
  prisliste_id TEXT NOT NULL REFERENCES prisliste(id),
  penneo_sak_id TEXT, signert_pdf_nokkel TEXT, signert_tid TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX avtale_eier ON avtale(eier_id);

CREATE TABLE avtaledokument (
  id TEXT PRIMARY KEY,
  avtale_id TEXT NOT NULL REFERENCES avtale(id) ON DELETE CASCADE,
  avtalemal_id TEXT NOT NULL REFERENCES avtalemal(id),
  rekkefolge INTEGER NOT NULL,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE signatar (
  id TEXT PRIMARY KEY,
  avtale_id TEXT NOT NULL REFERENCES avtale(id) ON DELETE CASCADE,
  rekkefolge INTEGER NOT NULL,                  -- 1 kunden, 2 leverandøren
  part TEXT NOT NULL CHECK (part IN ('kunde', 'leverandor')),
  navn TEXT NOT NULL, epost TEXT NOT NULL, rolle TEXT,
  status TEXT NOT NULL CHECK (status IN ('ikke_sendt', 'venter', 'signert')),
  sendt TEXT, signert TEXT, penneo_id TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX signatar_avtale ON signatar(avtale_id, rekkefolge);

CREATE TABLE innstilling (
  nokkel TEXT PRIMARY KEY,
  verdi TEXT NOT NULL,                          -- JSON
  eksempel INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE bruker (
  id TEXT PRIMARY KEY,
  epost TEXT NOT NULL UNIQUE,
  navn TEXT NOT NULL,
  rolle TEXT NOT NULL CHECK (rolle IN ('eier')),
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

-- Teller for løpenumre (T-2026-031, A-2026-019): én rad per type og år
CREATE TABLE lopenummer (
  type TEXT NOT NULL CHECK (type IN ('T', 'A')),
  aar INTEGER NOT NULL,
  neste INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (type, aar)
);

-- ── Innstillinger (60-213 punkt k: Designs forslag som standard). Verdiene endres i Admin, ikke i koden. ──
INSERT INTO innstilling (nokkel, verdi, eksempel, opprettet, endret) VALUES
  ('fornyes_snart_dager', '90', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('tilbud_gyldig_dager', '14', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Leverandør: det er ikke besluttet hvilket selskap som selger Hengsel (punkt k.2). ES-Holding AS står som eksempel; org.nr., adresse og e-post
  -- fylles inn under Innstillinger › Leverandør når det er besluttet. eksempel=1 gir merket «Eksempel» i tilbud og avtaler.
  ('leverandor', '{"navn":"ES-Holding AS","orgnr":"","adresse":"","epost":"","signatar":"Eirik","signatar_rolle":"daglig leder","signatar_epost":""}', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');

-- ── Bruker: rollen eier (samme adresse som worker/tilgang.js) ──
INSERT INTO bruker (id, epost, navn, rolle, opprettet, endret) VALUES
  ('01K7JX00000000000000BRK001', 'es@sngroup.no', 'Eirik', 'eier', '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');

-- ── Avtalemaler (navn og versjon fra tilbudet i 60-203; filene legges inn senere, eksempel=1 til da) ──
INSERT INTO avtalemal (id, navn, versjon, gjelder_fra, status, fil_nokkel, eksempel, opprettet, endret) VALUES
  ('01K7JX00000000000000MA1001', 'Kundeavtale', 'v3.1', '2026-09-01', 'aktiv', 'maler/kundeavtale-v3.1.pdf', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX00000000000000MA1002', 'Databehandleravtale', 'v2.0', '2026-03-01', 'aktiv', 'maler/databehandleravtale-v2.0.pdf', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX00000000000000MA1003', 'Supportnivå Standard', 'v1.2', '2026-09-01', 'aktiv', 'maler/supportniva-standard-v1.2.pdf', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');

-- ── Prisliste 2026.2 fra 60-213 punkt e, som UTKAST med eksempel=1 («Eksempel – prislisten er ikke låst»). Beløp i øre. ──
INSERT INTO prisliste (id, versjon, gjelder_fra, status, binding_mnd, oppsigelse_mnd, prisjustering, viderefakturering_prosent, mva_prosent, rabatt_gjelder, publisert, eksempel, opprettet, endret) VALUES
  ('01K7JX0000000000000P120262', '2026.2', '2026-09-01', 'utkast', 12, 3, 'kpi', 15, 25, '["pakke","ekstra_brukere","ute"]', NULL, 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');

INSERT INTO prislisterad (id, prisliste_id, type, produktlinje, kode, navn, pris_ore, inkl_brukere, ekstra_bruker_ore, support_timer, etablering_ore, moduler, maks_antall, inkludert_regel, merknad, fra_butikker, prosent, opprettet, endret) VALUES
  -- Pakker per butikk per måned. Inkluderte brukere, ekstrapris, support og etablering er like for begge linjer (punkt k.15), men lagres per linje.
  ('01K7JX000000000000PR000001', '01K7JX0000000000000P120262', 'pakke', 'sigdal',  'start',    'Start',    299000, 3, 35000, 1, 1500000, '["CRM","Tilbud og ordre"]', NULL, NULL, 'Hengsel med Sigdal-pakken', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000002', '01K7JX0000000000000P120262', 'pakke', 'sigdal',  'butikk',   'Butikk',   499000, 5, 45000, 2, 2500000, '["CRM","Tilbud og ordre","Montørapp","Kundeportal"]', NULL, NULL, 'Hengsel med Sigdal-pakken', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000003', '01K7JX0000000000000P120262', 'pakke', 'sigdal',  'komplett', 'Komplett', 699000, 6, 55000, 3, 3900000, '["CRM","Tilbud og ordre","Montørapp","Kundeportal","Prosjekt og leiligheter","Rapporter"]', NULL, NULL, 'Hengsel med Sigdal-pakken', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000004', '01K7JX0000000000000P120262', 'pakke', 'hengsel', 'start',    'Start',    199000, 3, 35000, 1, 1500000, '["CRM","Tilbud og ordre"]', NULL, NULL, 'For alle kjøkken- og interiørbutikker', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000005', '01K7JX0000000000000P120262', 'pakke', 'hengsel', 'butikk',   'Butikk',   399000, 5, 45000, 2, 2500000, '["CRM","Tilbud og ordre","Montørapp","Kundeportal"]', NULL, NULL, 'For alle kjøkken- og interiørbutikker', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000006', '01K7JX0000000000000P120262', 'pakke', 'hengsel', 'komplett', 'Komplett', 599000, 6, 55000, 3, 3900000, '["CRM","Tilbud og ordre","Montørapp","Kundeportal","Prosjekt og leiligheter","Rapporter"]', NULL, NULL, 'For alle kjøkken- og interiørbutikker', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Hengsel Ute: per montør, eller firmapris for opptil 8 montører (per eier, punkt k.10)
  ('01K7JX000000000000PR000007', '01K7JX0000000000000P120262', 'ute', NULL, 'montor', 'Hengsel Ute per montør', 15000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Per montør per måned', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000008', '01K7JX0000000000000P120262', 'ute', NULL, 'firma',  'Hengsel Ute firmapris',  99000, NULL, NULL, NULL, NULL, NULL, 8, NULL, 'For opptil 8 montører hos samme eier', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Tillegg per eier, uten rabatt (punkt k.9). Sikkerhetskopi inkludert ved Komplett eller 2 eller flere butikker (punkt k.11).
  ('01K7JX000000000000PR000009', '01K7JX0000000000000P120262', 'tillegg', NULL, 'backup', 'Utvidet sikkerhetskopi', 109000, NULL, NULL, NULL, NULL, NULL, NULL, 'komplett_eller_flere_butikker', 'Gjenoppretting til et tidspunkt. Inkludert i Komplett og for eiere med flere butikker', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000010', '01K7JX0000000000000P120262', 'tillegg', NULL, 'domene', 'Eget domene på innloggingen', 11000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Per eier per måned', NULL, NULL, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Kjederabatt: 15 % fra 3 butikker, 25 % fra 10 butikker hos samme eier
  ('01K7JX000000000000PR000011', '01K7JX0000000000000P120262', 'rabattrinn', NULL, 'trinn-3',  'Kjederabatt fra 3 butikker',  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3,  15, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('01K7JX000000000000PR000012', '01K7JX0000000000000P120262', 'rabattrinn', NULL, 'trinn-10', 'Kjederabatt fra 10 butikker', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 25, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');
