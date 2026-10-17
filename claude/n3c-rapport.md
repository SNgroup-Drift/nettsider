# N-3c · Enhetsrammene tilbake på hengsel.no (S-68, Eirik 17.10)

Gren `claude/n3c-enhetsrammer` fra `origin/main` (56dc9c5). PR mot `main`; Eirik fletter.

## Kort

- Ny fast regel 10 i `docs/design/hengsel-regler.md`: «Hver hengsel.no-side viser appen i enhetsrammer øverst: Studio Display for CRM, iPad/iPhone for Ute og
  kundeportal; bildene fra biblioteket, aldri lokalt.»
- De fem sidene som brukte `Enhet` i 2a1a969 (før N-3) har rammene igjen øverst, i det nye sporet `komposisjon` i `Sidetopp`. På PC 1440 står rammene til høyre for
  tittel, ingress og knapper (5 av 12 kolonner). På telefon 390 står de under knappene, før rad 1 i kitet. Kitets rader er uendret fra N-3. Sider uten sporet er uendret.
- `CrmSkjerm.astro` og `PortalSkjerm.astro` er hentet tilbake uendret fra 2a1a969, siden N-3 slettet dem. Det samme gjelder dataene de bruker:
  `content/crm.ts` (med N-3-tabellene og N-3b-ingressen) og `content/kundeportal.ts` i 2a1a969-utgaven.
- Vakttest `scripts/enhetsrammer.test.mjs` (lagt til i `npm test`). Den sjekker at sidene i `SIDER_MED_RAMMER` bruker `Enhet` i sporet `komposisjon`, og at den bygde
  toppen har en ramme før første rad, også i Sigdal-utgaven og /kunde/apptest. Den sjekker også at øverste bilde lastes med en gang (`forst`) og at bildene har bredde og høyde (ingen CLS).
- Ingen nye bilder lokalt: app-bildene kommer fra biblioteket, og CRM og kundeportal er HTML. Ingen hex, bare tokens. Ingen endring i hengsel-crm, `packages/` eller workflowene.

## Side → komposisjon

| Side | Komposisjon øverst (N-3c) | Før N-3 (2a1a969) |
|---|---|---|
| Forsiden `/` | Studio Display med Min dag (`CrmSkjerm`, HTML, `forst`) og iPhone med I dag (`app/idag-lys.webp`, lazy) nede til høyre over rammen | Den samme komposisjonen i heroen |
| `/crm` | Studio Display med Min dag (`CrmSkjerm`, `forst`) | Klikkbar demo i fire steg på PC, iPad og telefon; steg 1 på PC er nå rammen |
| `/ute` | iPhone med I dag (`app/idag-lys.webp`, `forst`) | iPhone med seks steg (fanene); steg 1 er nå rammen. Bildet «uten nett» i en egen seksjon er ikke tatt tilbake |
| `/kundeportal` | iPhone med kundeportalen, steg 1 «Tilbud og aksept» (`PortalSkjerm` telefon, HTML) | iPhone/PC-bryter med fem steg og SMS; telefon steg 1 er nå rammen |
| `/apptest` (og `/kunde/apptest`, `/kunde/sigdal/apptest`) | Bildevekslingen med fire iPhone-bilder (I dag, Jobben, KS, Ferdig montert; første `forst`, resten lazy) og prikker (`scripts/apptest.ts`) | Den samme bildevekslingen i heroen. Motion-ikonet er ikke tatt tilbake |

Sigdal-utgavene (`/kunde/sigdal`, `/kunde/sigdal/crm`, `/ute`, `/kundeportal`) får rammene av seg selv, med Sigdal-bildene fra biblioteket.

Ikke tatt med: `/integrasjoner`, `/priser-og-demo`, `/personvern` og KOMMER-sidene hadde ikke `Enhet` i 2a1a969 (/integrasjoner hadde systemkartet, ikke en ramme), så de er urørt.

## Avvik og merknader

- **Statiske rammer.** Stegvelgerne og demoene (/crm, /ute, /kundeportal) er ikke tatt tilbake, bare første skjerm i rammen. Grunnen er at rader og tabeller fra N-3 skal stå,
  og at skriptene til demoene (`scripts/crm.ts`, `ute.ts`, `kundeportal.ts`) ble slettet i N-3. CrmSkjerm og PortalSkjerm vises som illustrasjon (inert, `role="img"`).
- **/ute viser I dag to ganger.** Bildet står både i toppen og i Tegning-flisen «Hengsel Ute, I dag» i rad 3, som N-3 bygde etter sidekartet. Design bør velge et annet bilde til en av dem i neste runde.
- **Sidekartet 25-xxx må rettes i neste Design-runde (rad 0: komposisjon).** Tegningene 25-001–25-012 har ikke rammene i toppen. Etter regel 10 skal sidene med app ha dem.
- **Røde som ikke kom fra N-3c, nå rettet på `main` og flettet inn:** lenkesjekken i `vis` (tre skriftfiler gav 404; rettet i N-1b, #88) og test 205 i
  `scripts/skjermbilder-bibliotek.test.mjs` (23 nøkler i `KJENTE_MANGLER` fantes i det nye manifestet med 458 filer; rettet i #90). Workers Builds for design og admin
  er fortsatt røde i forhåndsvisningen, også på `main`.
- bilder.hengsel.no kan ikke nås fra økta. Derfor viser iPhone-rammene med app-bilder alt-teksten i skjermbildene. CRM- og portalskjermene er HTML og vises.

## Tester

- `npm run build`: grønt for alle nettstedene.
- `npm test`: 214 av 214 enhetstester er grønne (med `enhetsrammer.test.mjs`). Etter flettingen av `main` (#88 og #90): 214 av 214 grønne, og lenkesjekken er grønn for alle nettstedene (825 forespørsler, 0 feil).

## Skjermbilder

`claude/n3c-skjermbilder/`: forside, crm, ute og kundeportal på 1440 og 390 (hele siden, webp).

N-3c KLAR
