-- Opprett kunde (K-272, S-65): oppstartsjobber og steg for «Opprett kunde» i Oppstart. Teknisk oppsett av en ny kunde (Supabase, Cloudflare Pages,
-- GitHub-miljø, seed) kjøres av GitHub Action «Ny kunde» i SNgroup-Drift/hengsel-crm og rapporterer hvert steg hit (worker/ny-kunde-rapport.js).
-- Samme regler som 0001: id er ULID (TEXT), tider ISO med Z. INGEN hemmeligheter i noen kolonne: innstilling er kundens JSON (navn, org.nr.,
-- butikker, merker, domene, administrator-e-post), logg er renset i Workeren før den lagres, resultat har bare offentlige verdier.
-- Avhenger ikke av tidligere migreringer. Ingen eksempeldata.

CREATE TABLE ny_kunde_jobb (
  id TEXT PRIMARY KEY,
  kunde_id TEXT NOT NULL,                                  -- slug, f.eks. testkunde-k272
  navn TEXT NOT NULL,
  test INTEGER NOT NULL DEFAULT 0 CHECK (test IN (0, 1)),  -- merket test: kan rives ned igjen
  innstilling TEXT NOT NULL,                               -- kundens JSON slik den ble sendt til Action-en
  git_ref TEXT NOT NULL DEFAULT 'main' CHECK (git_ref IN ('main', 'demo')),
  torrkjoring INTEGER NOT NULL DEFAULT 0 CHECK (torrkjoring IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'ny' CHECK (status IN ('ny', 'kjorer', 'feil', 'ferdig', 'fjerner', 'fjernet')),
  gjeldende_steg TEXT,
  run_id TEXT,
  run_url TEXT,
  resultat TEXT,                                           -- JSON: pages_adresse, domene, supabase_ref (offentlige verdier)
  startet_av TEXT NOT NULL,                                -- e-post fra Access
  opprettet TEXT NOT NULL,
  endret TEXT NOT NULL,
  ferdig_tid TEXT
);
-- Én levende jobb per kunde-id. Når testkunden er revet ned (fjernet), kan id-en brukes på nytt.
CREATE UNIQUE INDEX ny_kunde_jobb_levende ON ny_kunde_jobb(kunde_id) WHERE status <> 'fjernet';
CREATE INDEX ny_kunde_jobb_opprettet ON ny_kunde_jobb(opprettet);

CREATE TABLE ny_kunde_steg (
  id TEXT PRIMARY KEY,
  jobb_id TEXT NOT NULL REFERENCES ny_kunde_jobb(id) ON DELETE CASCADE,
  nr INTEGER NOT NULL,
  kode TEXT NOT NULL,
  navn TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'venter' CHECK (status IN ('venter', 'kjorer', 'ok', 'feil')),
  forsok INTEGER NOT NULL DEFAULT 0,                       -- økes av «Prøv igjen»
  startet TEXT,
  ferdig TEXT,
  sekunder INTEGER,
  feil TEXT,
  logg TEXT,                                               -- renset, maks ca. 12 000 tegn
  resultat TEXT,                                           -- JSON med offentlige verdier fra steget
  endret TEXT NOT NULL,
  UNIQUE (jobb_id, kode)
);

-- Hvem gjorde hva og når: start, prøv igjen, fjern, og hver rapport fra Action-en
CREATE TABLE ny_kunde_logg (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jobb_id TEXT NOT NULL REFERENCES ny_kunde_jobb(id) ON DELETE CASCADE,
  tid TEXT NOT NULL,
  hvem TEXT NOT NULL,
  handling TEXT NOT NULL,
  detalj TEXT
);
CREATE INDEX ny_kunde_logg_jobb ON ny_kunde_logg(jobb_id, id);
