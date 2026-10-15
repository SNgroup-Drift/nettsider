-- Hengsel Admin fase C og Drift (K-260, S-62): fakturering, KPI, konto, frist og rutine fra docs/design/admin-fase-a/60-211 (datamodell).
-- Samme regler som 0001: id er ULID (TEXT), datoer ISO (2026-11-01), tider ISO med tidssone, beløp INTEGER i øre, prosent REAL.
-- Avhenger bare av 0001 (eier, avtale, prisliste, innstilling). 0002 (fase B, K-259) er ikke nødvendig; tidsføringen derfra leses når den finnes.
-- Ingen eksempeldata her (eksemplene ligger i scripts/lib/admin-eksempeldata-c.mjs). Kjederabatten lagres ikke; den regnes ut av src/lib/pris.js.
-- Utestående og kundemiljøenes tall leses (PowerOffice, kundemiljøene) og lagres ikke.

-- ── Abonnement (SC1): ett per eier, laget fra signert avtale ──
CREATE TABLE abonnement (
  id TEXT PRIMARY KEY,
  eier_id TEXT NOT NULL REFERENCES eier(id),
  avtale_id TEXT NOT NULL REFERENCES avtale(id),
  prisliste_id TEXT NOT NULL REFERENCES prisliste(id),   -- prislisten avtalen ble laget med
  produktlinje TEXT NOT NULL CHECK (produktlinje IN ('sigdal', 'hengsel')),
  gjelder_fra TEXT NOT NULL,
  binding_til TEXT,
  neste_kpi_dato TEXT,                                   -- avtalens årsdag (60-212 valg 12)
  opphorer TEXT,                                         -- satt når avtalen er sagt opp
  status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'sagt_opp', 'avsluttet')),
  poweroffice_kunde_id TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE UNIQUE INDEX abonnement_eier ON abonnement(eier_id);
CREATE UNIQUE INDEX abonnement_avtale ON abonnement(avtale_id);

-- Linjer per butikk og tillegg. En endring lukker linjen (gjelder_til) og lager en ny fra «gjelder fra».
CREATE TABLE abonnementslinje (
  id TEXT PRIMARY KEY,
  abonnement_id TEXT NOT NULL REFERENCES abonnement(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('butikk', 'tillegg')),
  butikk_navn TEXT,
  pakke TEXT CHECK (pakke IS NULL OR pakke IN ('start', 'butikk', 'komplett')),
  ekstra_brukere INTEGER NOT NULL DEFAULT 0,             -- ut over de inkluderte
  montorer INTEGER NOT NULL DEFAULT 0,
  tillegg_kode TEXT,                                     -- backup / domene
  rekkefolge INTEGER NOT NULL DEFAULT 0,
  gjelder_fra TEXT NOT NULL,
  gjelder_til TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  CHECK ((type = 'butikk' AND butikk_navn IS NOT NULL AND pakke IS NOT NULL) OR (type = 'tillegg' AND tillegg_kode IS NOT NULL))
);
CREATE INDEX abonnementslinje_abo ON abonnementslinje(abonnement_id, gjelder_fra);

CREATE TABLE abonnementsendring (
  id TEXT PRIMARY KEY,
  abonnement_id TEXT NOT NULL REFERENCES abonnement(id) ON DELETE CASCADE,
  gjelder_fra TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('start', 'pakke', 'ekstra_brukere', 'montorer', 'butikk_lagt_til', 'butikk_fjernet', 'tillegg', 'opphor')),
  tekst TEXT NOT NULL,
  hvem TEXT NOT NULL,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX abonnementsendring_abo ON abonnementsendring(abonnement_id, gjelder_fra);

-- ── Fakturakjøring (SC2): én per måned, forskuddsvis den 1. ──
CREATE TABLE fakturakjoring (
  id TEXT PRIMARY KEY,
  maaned TEXT NOT NULL UNIQUE,                           -- 2026-11
  fakturadato TEXT NOT NULL,                             -- 2026-11-01
  status TEXT NOT NULL DEFAULT 'utkast' CHECK (status IN ('utkast', 'delvis_sendt', 'sendt')),
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE faktura (
  id TEXT PRIMARY KEY,
  kjoring_id TEXT NOT NULL REFERENCES fakturakjoring(id) ON DELETE CASCADE,
  eier_id TEXT NOT NULL REFERENCES eier(id),
  abonnement_id TEXT NOT NULL REFERENCES abonnement(id),
  status TEXT NOT NULL DEFAULT 'klar' CHECK (status IN ('klar', 'sendt', 'feil')),
  feilmelding TEXT,
  poweroffice_id TEXT,
  endringer TEXT NOT NULL DEFAULT '[]',                  -- JSON-liste: «Endret:» mot forrige måned
  sum_ore INTEGER NOT NULL DEFAULT 0,                    -- uten mva
  mva_ore INTEGER NOT NULL DEFAULT 0,
  sendt TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  UNIQUE (kjoring_id, eier_id)
);
CREATE INDEX faktura_kjoring ON faktura(kjoring_id);

CREATE TABLE fakturalinje (
  id TEXT PRIMARY KEY,
  faktura_id TEXT NOT NULL REFERENCES faktura(id) ON DELETE CASCADE,
  rekkefolge INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('abonnement', 'etablering', 'timer', 'viderefakturert')),
  kilde TEXT NOT NULL DEFAULT 'auto' CHECK (kilde IN ('auto', 'manuell')), -- manuell = kostpris lagt inn for hånd (overlever nytt utkast)
  tekst TEXT NOT NULL,
  antall REAL NOT NULL DEFAULT 1,
  pris_ore INTEGER,
  kostpris_ore INTEGER,                                  -- viderefakturert
  paaslag_prosent REAL,                                  -- viderefakturert, 15 fra prislisten
  rabatt_ore INTEGER NOT NULL DEFAULT 0,                 -- bare abonnement (kjederabatten, regnet ut ved utkast)
  belop_ore INTEGER NOT NULL,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX fakturalinje_faktura ON fakturalinje(faktura_id, rekkefolge);

-- ── KPI-justering (SC3): prosent for hånd per år, og per kunde når kunden er varslet ──
CREATE TABLE kpi_justering (
  id TEXT PRIMARY KEY,
  aar INTEGER NOT NULL UNIQUE,
  prosent REAL NOT NULL,
  kilde TEXT,
  varsel_dager INTEGER NOT NULL DEFAULT 30,
  eksempel INTEGER NOT NULL DEFAULT 0,                   -- 1 = varsel dager før er ikke besluttet (60-211: Eksempel 30)
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE kpi_justering_kunde (
  id TEXT PRIMARY KEY,
  kpi_justering_id TEXT NOT NULL REFERENCES kpi_justering(id) ON DELETE CASCADE,
  abonnement_id TEXT NOT NULL REFERENCES abonnement(id) ON DELETE CASCADE,
  kpi_dato TEXT NOT NULL,
  prosent REAL NOT NULL,
  pris_ore INTEGER NOT NULL,                             -- pris i dag
  ny_pris_ore INTEGER NOT NULL,                          -- hele kroner
  varseldato TEXT NOT NULL,
  epost_emne TEXT, epost_utkast TEXT,                    -- utkast, sendes aldri fra Admin
  varslet TEXT,                                          -- dato kunden ble varslet (merket for hånd)
  opprettet TEXT NOT NULL, endret TEXT NOT NULL,
  UNIQUE (kpi_justering_id, abonnement_id)
);

-- ── Drift (SD2): kontoer, frister og rutiner. Aldri passord eller nøkler; kontoer lenker til et 1Password-hvelv. ──
CREATE TABLE konto (
  id TEXT PRIMARY KEY,
  tjeneste TEXT NOT NULL,
  eier TEXT,
  plan TEXT,
  kost_mnd_ore INTEGER NOT NULL DEFAULT 0,
  fornyes TEXT,                                          -- dato, eller NULL når fornyes_tekst sier «Månedlig» / «Løpende»
  fornyes_tekst TEXT,
  hvelv TEXT,                                            -- navnet på hvelvet
  hvelv_url TEXT CHECK (hvelv_url IS NULL OR hvelv_url LIKE 'https://%'),
  merknad TEXT,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE frist (
  id TEXT PRIMARY KEY,
  tekst TEXT NOT NULL,
  kategori TEXT NOT NULL,
  dato TEXT NOT NULL,
  varsel_dager INTEGER NOT NULL DEFAULT 14,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);
CREATE INDEX frist_dato ON frist(dato);

CREATE TABLE rutine (
  id TEXT PRIMARY KEY,
  gruppe TEXT NOT NULL CHECK (gruppe IN ('maaned', 'uke', 'kvartal')),
  navn TEXT NOT NULL,
  rekkefolge INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

CREATE TABLE rutinepunkt (
  id TEXT PRIMARY KEY,
  rutine_id TEXT NOT NULL REFERENCES rutine(id) ON DELETE CASCADE,
  tekst TEXT NOT NULL,
  rekkefolge INTEGER NOT NULL DEFAULT 0,
  opprettet TEXT NOT NULL, endret TEXT NOT NULL
);

-- Avkryssing per periode: 2026-10 (måned), 2026-U42 (uke), 2026-K4 (kvartal)
CREATE TABLE rutineavkryssing (
  rutinepunkt_id TEXT NOT NULL REFERENCES rutinepunkt(id) ON DELETE CASCADE,
  periode TEXT NOT NULL,
  hvem TEXT NOT NULL,
  tid TEXT NOT NULL,
  PRIMARY KEY (rutinepunkt_id, periode)
);

-- ── Innstillinger for fase C (verdiene endres i Admin, ikke i koden) ──
INSERT INTO innstilling (nokkel, verdi, eksempel, opprettet, endret) VALUES
  ('varsler', '{"frister":true,"fornyelser":true,"kpi":true,"svarfrist":true,"fakturakjoring":false}', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Kundemiljøene Status (SD1) viser. Tom liste: Status bruker kundenes miljøadresse fra eierkortet.
  ('kundemiljoer', '[]', 0, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z'),
  -- Intern kost per supporttime i Tall (60-212 valg 15), eksempel til det er besluttet
  ('internkost_time_ore', '65000', 1, '2026-10-15T00:00:00Z', '2026-10-15T00:00:00Z')
ON CONFLICT(nokkel) DO NOTHING;
