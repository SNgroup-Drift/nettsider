/**
 * Lar testene i Node importere moduler som bruker «cloudflare:workers» (f.eks. sites/admin/worker/main.js og inngang.js).
 * Registrerer en modul-hook som peker «cloudflare:workers» til en liten etterligning av WorkerEntrypoint (ctx og env som i Workers).
 * Bruk: import "./lib/cloudflare-workers-stub.mjs"; og deretter dynamisk import() av modulen som skal testes.
 */
import { register } from "node:module";

const ETTERLIGNING = "export class WorkerEntrypoint { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }";
const HOOKS = `export async function resolve(spesifikator, kontekst, neste) {
  if (spesifikator === "cloudflare:workers") return { url: "data:text/javascript," + encodeURIComponent(${JSON.stringify(ETTERLIGNING)}), shortCircuit: true };
  return neste(spesifikator, kontekst);
}`;

register("data:text/javascript," + encodeURIComponent(HOOKS));
