/**
 * LeadInngang: det navngitte inngangspunktet hengsel-Workeren kaller gjennom service bindingen ADMIN_LEAD (sites/hengsel/wrangler.jsonc).
 * RPC-metoder på et WorkerEntrypoint kan bare nås fra Workere i samme Cloudflare-konto som har en binding hit, aldri fra internett.
 * All sjekk og lagring står i worker/lead.js (mottaLead), som testes uten Cloudflare. Eksportert fra worker/main.js.
 */
import { WorkerEntrypoint } from "cloudflare:workers";
import { mottaLead } from "./lead.js";

export class LeadInngang extends WorkerEntrypoint {
  /** Lagrer et lead fra «Be om demo». Svar: { ok: true, ny, dublett } eller { ok: false, kode, feil? } (kaster aldri). */
  async lagre(felt) {
    return mottaLead(this.env, felt);
  }
}
