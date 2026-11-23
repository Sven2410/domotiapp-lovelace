/**
 * Een agenda als afvalbron (0.136.0): uit de afspraken per soort een bak.
 *
 * NIEUW GEDRAG. `src/cards/afval-agenda.js` bestond niet vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND. Zie de kop van dat bestand.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { bakId, bakkenUit, isAgenda, ophalingen, soortenOp, staatVan, vouwUit } from "../../src/cards/afval-agenda.js";
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
