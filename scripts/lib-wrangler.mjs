// K-223: starter `wrangler dev` for hengsel.no lokalt (Worker + statiske filer fra sites/hengsel/dist) og venter til den svarer.
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");

export function frittPort() {
  return new Promise((ok, feil) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => ok(port)); });
    s.on("error", feil);
  });
}

/** vars: {NAVN: "verdi"} sendes med --var (bare lokalt, aldri i wrangler.jsonc). Returnerer { base, stopp }. */
export async function startHengsel({ vars = {}, port } = {}) {
  port ??= await frittPort();
  const args = ["wrangler", "dev", "-c", join(rot, "sites/hengsel/wrangler.jsonc"), "--port", String(port), "--ip", "127.0.0.1", "--inspector-port", String(await frittPort()),
    ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`])];
  const barn = spawn("npx", args, { cwd: rot, detached: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" } });
  let logg = "";
  barn.stdout.on("data", (d) => (logg += d));
  barn.stderr.on("data", (d) => (logg += d));
  const base = `http://127.0.0.1:${port}`;
  const frist = Date.now() + 90_000;
  for (;;) {
    if (barn.exitCode !== null) throw new Error(`wrangler dev stoppet (${barn.exitCode}):\n${logg.slice(-2000)}`);
    if (Date.now() > frist) { barn.kill(); throw new Error(`wrangler dev svarte ikke:\n${logg.slice(-2000)}`); }
    try { const r = await fetch(`${base}/robots.txt`); if (r.status === 200) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  // npx starter wrangler, som starter workerd: hele prosessgruppen må stoppes, ellers blir workerd igjen og testene henger
  const stopp = () => new Promise((ok) => {
    const drep = (sig) => { try { process.kill(-barn.pid, sig); } catch {} };
    barn.once("exit", () => { drep("SIGKILL"); ok(); });
    drep("SIGTERM");
    setTimeout(() => { drep("SIGKILL"); ok(); }, 3000).unref();
  });
  return { base, stopp };
}
