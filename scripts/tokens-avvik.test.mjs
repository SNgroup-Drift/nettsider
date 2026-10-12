/** K-182: verdiene som skal være like designsystemet er det (mørk sidebakgrunn, merkevarefargene på hengsel.no), og ingen gamle mørke bakgrunner er igjen i kode som tegner flater. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { avvikTabell, sjekk } from "./tokens-avvik.mjs";

test("verdier som skal være like designsystemet er like", () => {
  assert.deepEqual(sjekk(), []);
});

test("avviksoversikten for følgesaker kan lages", () => {
  assert.ok(Array.isArray(avvikTabell()));
});
