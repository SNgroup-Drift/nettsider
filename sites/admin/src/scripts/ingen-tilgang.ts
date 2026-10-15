/** «Ingen tilgang» for rollen Support (K-259, 60-207): Workeren serverer denne siden med status 403 på adressen som ble åpnet, så området leses fra adressen. */
import { q } from "../lib/dom";
import { omradeFor } from "../lib/meny";

const omrade = q("#omrade");
if (omrade && location.pathname !== "/ingen-tilgang") omrade.textContent = omradeFor(location.pathname);
