/**
 * Hovedmodulen til Worker-en «admin» (wrangler.jsonc: main). Standardeksporten er fetch-handleren i worker/index.js (alle HTTP-forespørsler,
 * bak Access). LeadInngang er det navngitte inngangspunktet for leads fra hengsel-Workeren (service binding, worker/inngang.js).
 * Delt i to filer slik at testene i Node kan importere worker/index.js uten modulen «cloudflare:workers».
 */
export { default } from "./index.js";
export { LeadInngang } from "./inngang.js";
