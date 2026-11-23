/**
 * Een agenda als afvalbron (0.136.0): uit de afspraken per soort een bak.
 *
 * NIEUW GEDRAG. `src/cards/afval-agenda.js` bestond niet vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND. Zie de kop van dat bestand.
 *
 * De hele kalender (0.137.0, onderaan): NIEUW GEDRAG. `kalenderUit` en `perMaand` bestonden niet; op de code van
 * 0.136.1 faalt het importeren ("does not provide an export named 'kalenderUit'"). En `bakkenUit` hield geen grens:
 * met de afspraken van een heel jaar binnen kwam een soort van over drie maanden er ook als bak bij.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { bakId, bakkenUit, isAgenda, kalenderUit, ophalingen, perMaand, soortenOp, staatVan, vouwUit } from "../../src/cards/afval-agenda.js";
import { afvalLijst } from "../../src/cards/infoscherm-afval.js";

const TZ = "Europe/Amsterdam";
const NU = new Date(2026, 10, 23, 14, 0);
const dag = (d) => ({ start: `2026-11-${d}`, end: `2026-11-${Number(d) + 1}`, summary: "" });
const ophaling = (d, soort) => ({ ...dag(d), summary: soort });

const EVENTS = [
  ophaling("20", "Restafval"), // voorbij
  ophaling("24", "Papier"),
  ophaling("24", "restafval"),
  ophaling("26", "PMD"),
  ophaling("27", "Papier"),
  ophaling("28", "Geen ophaling"),
];

test("alleen een agenda zelf telt als agenda, niet een bak ervan", () => {
  assert.equal(isAgenda("calendar.afval"), true);
  assert.equal(isAgenda("sensor.gft"), false);
  assert.equal(isAgenda(bakId("calendar.afval", "Papier")), false);
});

test("per soort de eerstvolgende ophaling vanaf vandaag, met de naam netjes", () => {
  const bakken = bakkenUit("calendar.afval", EVENTS, TZ, NU);
  assert.deepEqual(
    bakken.map((b) => [b.soort, b.datum.getDate(), b.id]),
    [
      ["Papier", 24, "calendar.afval#papier"],
      ["Restafval", 24, "calendar.afval#restafval"],
      ["PMD", 26, "calendar.afval#pmd"],
    ]
  );
});

test("een ophaling van vandaag telt nog", () => {
  const bakken = bakkenUit("calendar.afval", [ophaling("23", "GFT")], TZ, NU);
  assert.equal(bakken[0].datum.getDate(), 23);
});

test("een afspraak op een tijd telt op de dag in de tijd van Home Assistant", () => {
  // 23:30 UTC op de 23e is 00:30 op de 24e in Amsterdam.
  const o = ophalingen([{ start: "2026-11-23T23:30:00+00:00", end: "2026-11-24T00:00:00+00:00", summary: "GFT" }], TZ);
  assert.equal(o[0].dag.getDate(), 24);
});

test("wat er op een dag opgehaald wordt, als toestand van een sensor", () => {
  assert.equal(soortenOp(EVENTS, TZ, new Date(2026, 10, 24)), "Papier, Restafval");
  assert.equal(soortenOp(EVENTS, TZ, new Date(2026, 10, 25)), "");
  assert.equal(soortenOp(EVENTS, TZ, new Date(2026, 10, 28)), "");
});

test("vouwUit zet de bakken op de plek van de agenda, en laat een lege agenda staan", () => {
  const bakken = new Map([["calendar.afval", bakkenUit("calendar.afval", EVENTS, TZ, NU)]]);
  assert.deepEqual(vouwUit(["sensor.gft", "calendar.afval"], bakken), [
    "sensor.gft",
    "calendar.afval#papier",
    "calendar.afval#pmd",
    "calendar.afval#restafval",
  ]);
  assert.deepEqual(vouwUit(["calendar.afval"], new Map()), ["calendar.afval"]);
  assert.deepEqual(vouwUit(["calendar.afval"], null), ["calendar.afval"]);
});

test("het infoscherm leest de bakken van een agenda zoals die van een sensor", () => {
  const bakken = new Map([["calendar.afval", bakkenUit("calendar.afval", EVENTS, TZ, NU)]]);
  const staten = new Map([...bakken.get("calendar.afval")].map((b) => [b.id, staatVan(b)]));
  const lijst = afvalLijst(
    vouwUit(["calendar.afval"], bakken),
    (id) => staten.get(id),
    (id) => staten.get(id)?.attributes.friendly_name ?? id,
    NU
  );
  assert.deepEqual(
    lijst.map((r) => [r.naam, r.dagen, r.reden ?? null]),
    [
      ["Papier", 1, null],
      ["Restafval", 1, null],
      ["PMD", 3, null],
    ]
  );
});

test("de bakken blijven binnen 62 dagen, ook als de afspraken van een heel jaar binnen zijn", () => {
  const ver = [...EVENTS, { start: "2027-02-10", end: "2027-02-11", summary: "Kerstbomen" }];
  assert.deepEqual(
    bakkenUit("calendar.afval", ver, TZ, NU).map((b) => b.soort),
    ["Papier", "Restafval", "PMD"]
  );
});

test("de hele kalender: vanaf vandaag, per dag de soorten uit elke agenda, zonder dubbele", () => {
  const tweede = [ophaling("24", "Papier"), ophaling("30", "Glas"), { start: "2027-01-08", end: "2027-01-09", summary: "Kerstbomen" }];
  const k = kalenderUit([EVENTS, tweede], TZ, NU);
  assert.deepEqual(
    k.map((d) => [d.dag.getMonth() + 1, d.dag.getDate(), d.soorten.join("+")]),
    [
      [11, 24, "Papier+Restafval"],
      [11, 26, "PMD"],
      [11, 27, "Papier"],
      [11, 30, "Glas"],
      [1, 8, "Kerstbomen"],
    ]
  );
  assert.deepEqual(kalenderUit([], TZ, NU), []);
});

test("de kalender per maand, ook over de jaargrens", () => {
  const k = kalenderUit([[...EVENTS, { start: "2026-12-01", end: "2026-12-02", summary: "GFT" }, { start: "2027-01-08", end: "2027-01-09", summary: "GFT" }]], TZ, NU);
  assert.deepEqual(
    perMaand(k).map((m) => [m.maand.getFullYear(), m.maand.getMonth() + 1, m.dagen.length]),
    [
      [2026, 11, 3],
      [2026, 12, 1],
      [2027, 1, 1],
    ]
  );
});
