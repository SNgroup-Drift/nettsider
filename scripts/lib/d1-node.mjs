/**
 * K-240: etterligning av Cloudflare D1 over node:sqlite, til testene og skjermbildene. Samme lille API som Workeren bruker:
 * prepare(sql).bind(...).all() / first(kolonne?) / run(), batch([...]) i én transaksjon, og exec(sql).
 * Migreringene i sites/admin/migrations kjøres med kjorMigreringer(db). Ingen nettverk, ingen fil med mindre en sti oppgis.
 */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export const MIGRERINGER = resolve(import.meta.dirname, "..", "..", "sites", "admin", "migrations");

class Setning {
  constructor(db, sql, args = []) { this.db = db; this.sql = sql; this.args = args; }
  bind(...args) { return new Setning(this.db, this.sql, args); }
  async all() {
    const rader = this.db.prepare(this.sql).all(...this.args).map((r) => ({ ...r }));
    return { results: rader, success: true, meta: { rows_read: rader.length } };
  }
  async first(kolonne) {
    const r = (await this.all()).results[0] ?? null;
    return kolonne === undefined ? r : r ? r[kolonne] : null;
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...this.args);
    return { success: true, results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async raw() { return (await this.all()).results.map((r) => Object.values(r)); }
}

export function lagD1(sti = ":memory:") {
  const db = new DatabaseSync(sti);
  db.exec("PRAGMA foreign_keys = ON");
  return {
    prepare: (sql) => new Setning(db, sql),
    async batch(setninger) {
      db.exec("BEGIN");
      try { const ut = []; for (const s of setninger) ut.push(await s.run()); db.exec("COMMIT"); return ut; }
      catch (e) { db.exec("ROLLBACK"); throw e; }
    },
    async exec(sql) { db.exec(sql); return { count: sql.split(";").filter((s) => s.trim()).length, duration: 0 }; },
    lukk: () => db.close(),
  };
}

/** Kjører alle migreringene i rekkefølge (samme filer som `wrangler d1 migrations apply`). */
export async function kjorMigreringer(db, mappe = MIGRERINGER) {
  const filer = readdirSync(mappe).filter((f) => f.endsWith(".sql")).sort();
  for (const f of filer) await db.exec(readFileSync(join(mappe, f), "utf8"));
  return filer;
}

/** En fersk database med migreringene kjørt */
export async function lagTestdatabase() {
  const db = lagD1();
  await kjorMigreringer(db);
  return db;
}
