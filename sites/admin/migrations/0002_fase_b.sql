-- Hengsel Admin fase B (K-259, S-62, 60-211): Support (saker, meldinger, tidsføring), Oppstart (ni punkter, opplæringsøkter) og rollen Support.
-- Beløp i øre, ULID-id-er, opprettet/endret overalt, som i 0001. Ingen eksempeldata her (de ligger i scripts/lib/admin-eksempeldata-b.mjs);
-- innstillingene som ikke er besluttet er merket eksempel=1 og vises med merket «Eksempel» i Admin.

-- ── Rollen support (60-211 «Bruker og rolle»). SQLite kan ikke endre en CHECK, så tabellen bygges på nytt. ──
CREATE TABLE bruker_ny (
  id TEXT PRIMARY KEY,
  epost TEXT NOT NULL UNIQUE,
  navn TEXT NOT NULL,
  rolle TEXT NOT NULL CHECK (rolle IN ('eier', 'support')),
  aktiv INTEGER NOT NULL DEFAULT 1,
  sist_innlogget TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
INSERT INTO bruker_ny (id, epost, navn, rolle, opprettet, endret) SELECT id, epost, navn, rolle, opprettet, endret FROM bruker;
DROP TABLE bruker;
ALTER TABLE bruker_ny RENAME TO bruker;

-- ── Sak (H-nnnn). nr_tall er løpenummeret; nr vises som «H-» + nr_tall. Første sak blir H-1001. ──
CREATE TABLE sak (
  id TEXT PRIMARY KEY,
  nr_tall INTEGER NOT NULL UNIQUE CHECK (nr_tall > 0),
  emne TEXT NOT NULL,
  eier_id TEXT REFERENCES eier(id) ON DELETE SET NULL,      -- kan mangle når «Hjelp» kommer fra en ukjent adresse
  butikk_id TEXT REFERENCES butikk(id) ON DELETE SET NULL,
  kontakt_id TEXT REFERENCES kontakt(id) ON DELETE SET NULL,
  kontakt_navn TEXT, kontakt_epost TEXT,                     -- fra «Hjelp» (innlogget bruker) eller skrevet inn ved ny sak
  kilde TEXT NOT NULL CHECK (kilde IN ('hjelp-crm', 'hjelp-ute', 'epost', 'telefon')),
  prioritet TEXT NOT NULL CHECK (prioritet IN ('kritisk', 'hoy', 'normal', 'lav')),
  status TEXT NOT NULL DEFAULT 'ny' CHECK (status IN ('ny', 'aapen', 'venter', 'lost')),
  svarfrist TEXT NOT NULL,                                   -- tidspunkt (ISO, Z), regnet i arbeidstid fra supportnivået
  frist_stoppet TEXT,                                        -- satt mens status = venter (klokka står)
  frist_igjen_min INTEGER,                                   -- arbeidsminutter som var igjen da klokka ble stoppet (negativ = forfalt)
  lost_tid TEXT,
  sist_aktivitet TEXT NOT NULL,
  -- Sendt med «Hjelp» (60-209 SB4). Mangler for e-post og telefon.
  hjelp_side TEXT, hjelp_adresse TEXT, hjelp_versjon TEXT, hjelp_enhet TEXT, hjelp_bruker TEXT,
  skjermbilde_nokkel TEXT, skjermbilde_type TEXT, skjermbilde_navn TEXT, skjermbilde_bytes INTEGER,
  opprettet_av TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX sak_status ON sak(status);
CREATE INDEX sak_eier ON sak(eier_id);

-- ── Melding i saken. Internt notat (type intern) sendes ALDRI til kunden. Svar lagres som e-postutkast (utsendelse = utkast) til
--    e-postløsningen er bestemt; ingenting sendes fra Admin. ──
CREATE TABLE melding (
  id TEXT PRIMARY KEY,
  sak_id TEXT NOT NULL REFERENCES sak(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kunde', 'svar', 'intern')),
  hvem TEXT NOT NULL,
  tid TEXT NOT NULL,
  kanal TEXT,
  tekst TEXT NOT NULL,
  vedlegg_json TEXT,
  utsendelse TEXT CHECK (utsendelse IS NULL OR utsendelse IN ('utkast', 'sendt')),
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  CHECK (type != 'intern' OR utsendelse IS NULL)
);
CREATE INDEX melding_sak ON melding(sak_id, tid);

-- ── Tidsføring. Minutter er rundet opp til påbegynte enheter (innstilling support_foring_min, Eksempel 15). fakturert_i fylles av
--    fakturakjøringen (fase C) og låser føringen. ──
CREATE TABLE tidsforing (
  id TEXT PRIMARY KEY,
  sak_id TEXT NOT NULL REFERENCES sak(id) ON DELETE CASCADE,
  eier_id TEXT REFERENCES eier(id) ON DELETE SET NULL,
  dato TEXT NOT NULL,
  fra TEXT, til TEXT,
  minutter INTEGER NOT NULL CHECK (minutter > 0 AND minutter <= 1440),
  hvem TEXT NOT NULL,
  hvem_epost TEXT,
  tekst TEXT,
  maate TEXT NOT NULL CHECK (maate IN ('tidtaker', 'manuell')),
  fakturert_i TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX tidsforing_eier_dato ON tidsforing(eier_id, dato);
CREATE INDEX tidsforing_sak ON tidsforing(sak_id);

-- Tidtakeren som går (én per person og sak), så den overlever at siden lukkes
CREATE TABLE tidtaker (
  sak_id TEXT NOT NULL REFERENCES sak(id) ON DELETE CASCADE,
  hvem_epost TEXT NOT NULL,
  startet TEXT NOT NULL,
  PRIMARY KEY (sak_id, hvem_epost)
);

-- ── Oppstart (60-211 SO1/SO2). Status beregnes fra punktene og lagres ikke. ──
CREATE TABLE oppstart (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id) ON DELETE CASCADE,
  avtale_id TEXT REFERENCES avtale(id) ON DELETE SET NULL,
  oppstartsdato TEXT NOT NULL,
  ansvarlig TEXT NOT NULL DEFAULT 'Eirik',
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE UNIQUE INDEX oppstart_avtale ON oppstart(avtale_id) WHERE avtale_id IS NOT NULL;

CREATE TABLE oppstartspunkt (
  id TEXT PRIMARY KEY,
  oppstart_id TEXT NOT NULL REFERENCES oppstart(id) ON DELETE CASCADE,
  nr INTEGER NOT NULL CHECK (nr BETWEEN 1 AND 9),
  punkt TEXT NOT NULL,
  ansvarlig TEXT NOT NULL CHECK (ansvarlig IN ('eirik', 'code', 'kunden')),
  dato TEXT,
  er_frist INTEGER NOT NULL DEFAULT 0,                      -- 1 = datoen er en frist («Frist 27.10.2026»)
  status TEXT NOT NULL DEFAULT 'ikke' CHECK (status IN ('ikke', 'igang', 'venter', 'stopper', 'ferdig')),
  detalj TEXT,
  ferdig_tid TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  UNIQUE (oppstart_id, nr)
);

CREATE TABLE opplaeringsokt (
  id TEXT PRIMARY KEY,
  punkt_id TEXT NOT NULL REFERENCES oppstartspunkt(id) ON DELETE CASCADE,
  navn TEXT NOT NULL,
  dato TEXT NOT NULL,
  fra TEXT, til TEXT,
  sted TEXT,
  deltakere TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

-- ── Innstillinger for Support (60-211 «Innstilling», 60-212 spørsmål 2 og 3). Ikke besluttet: eksempel=1. Endres i Admin. ──
INSERT INTO innstilling (nokkel, verdi, eksempel, opprettet, endret) VALUES
  ('supportniva', '{"frister":{"kritisk":{"min":60,"tekst":"1 time"},"hoy":{"min":240,"tekst":"4 timer"},"normal":{"virkedager":1,"tekst":"1 virkedag"},"lav":{"virkedager":3,"tekst":"3 virkedager"}},"arbeidstid":{"fra":"08:00","til":"16:00","dager":[1,2,3,4,5]}}', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('support_timepris_ore', '115000', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('support_foring_min', '15', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('svarmaler', '[{"navn":"Takk, vi ser på det","tekst":"Hei {fornavn}. Takk for beskjed. Vi ser på det nå og kommer tilbake innen {svarfrist}."},{"navn":"Trenger mer informasjon","tekst":"Hei {fornavn}. Kan du sende et skjermbilde og fortelle hva du gjorde rett før feilen kom?"},{"navn":"Løst, si fra om det dukker opp igjen","tekst":"Hei {fornavn}. Dette er nå rettet. Si fra hvis du ser det igjen, så åpner vi saken på nytt."},{"navn":"Se brukerveiledningen","tekst":"Hei {fornavn}. Dette er beskrevet i brukerveiledningen: {lenke}."}]', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('brukerveiledning_url', '"https://hjelp.hengsel.no"', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Hvor POST /api/hjelp kan komme fra (Origin). «*.» gjelder alle underdomener (kundemiljøene, f.eks. strand.hengsel.no).
  ('hjelp_origins', '["https://*.hengsel.no"]', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  ('oppstart_punkter', '[{"nr":1,"punkt":"Avtale signert","ansvarlig":"kunden"},{"nr":2,"punkt":"Kundemiljø opprettet","ansvarlig":"code"},{"nr":3,"punkt":"Microsoft-godkjenning hos kunden","ansvarlig":"kunden"},{"nr":4,"punkt":"Tema og logo","ansvarlig":"eirik"},{"nr":5,"punkt":"Import av åpne tilbud og ordre","ansvarlig":"code"},{"nr":6,"punkt":"Brukere opprettet","ansvarlig":"eirik"},{"nr":7,"punkt":"Opplæring 1 og 2","ansvarlig":"eirik"},{"nr":8,"punkt":"Lagt i utrullingslista","ansvarlig":"code"},{"nr":9,"punkt":"Første faktura klar","ansvarlig":"eirik"}]', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z');
