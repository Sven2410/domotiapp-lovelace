/**
 * De openingstijden op het infoscherm: de week samengevat als hij dag voor
 * dag niet past, en wat er naast de kop staat.
 *
 * NIEUW GEDRAG (12 oktober 2026). `openingsGroepen`, `kolomVolgorde` en
 * `openingKop` bestonden niet vóór deze ronde; op de code van ervoor faalt
 * dit bestand bij het importeren.
 *
 * ## Waarom
 *
 * In een blok van één rij stonden maandag, dinsdag en woensdag, en verder
 * "nog 4". Zijn woorden: *"ik wil alles op de kaart kunnen zien is dat
 * mogelijk? Dus elke dag"*. En om 19:00 op een maandag van 09:00 tot 17:00
 * stond er "Vandaag gesloten", terwijl de praktijk die dag gewoon open was.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { kolomVolgorde, openingKop, openingsGroepen, openingsRegels } from "../../src/cards/infoscherm-logica.js";

const NEGEN_VIJF = [["09:00", "17:00"]];
const WERKWEEK = { openingstijden: { ma: NEGEN_VIJF, di: NEGEN_VIJF, wo: NEGEN_VIJF, do: NEGEN_VIJF, vr: NEGEN_VIJF } };
const MAANDAG = (uur, min = 0) => new Date(2026, 9, 12, uur, min); // maandag 12 oktober 2026

describe("openingsGroepen", () => {
  it("vat een werkweek samen in twee regels, met elke dag erin", () => {
    const groepen = openingsGroepen(openingsRegels(WERKWEEK, MAANDAG(19)));
    assert.deepEqual(
      groepen.map((g) => [g.naam, g.kort, g.tekst, g.vandaag]),
      [
        ["maandag t/m vrijdag", "ma–vr", "09:00 – 17:00", true],
        ["zaterdag en zondag", "za, zo", "gesloten", false],
      ]
    );
  });

  it("voegt alleen OPEENVOLGENDE dagen samen", () => {
    const p = { openingstijden: { ma: NEGEN_VIJF, wo: NEGEN_VIJF } };
    const namen = openingsGroepen(openingsRegels(p, MAANDAG(10))).map((g) => g.naam);
    assert.deepEqual(namen, ["maandag", "dinsdag", "woensdag", "donderdag t/m zondag"]);
  });

  it("een dag met een uitzondering blijft apart staan, met zijn reden", () => {
    const p = { ...WERKWEEK, uitzonderingen: [{ datum: "2026-10-14", tijden: [], reden: "Studiedag" }] };
    // Woensdag 14 oktober is vandaag: alleen voor vandaag telt de uitzondering.
    const groepen = openingsGroepen(openingsRegels(p, new Date(2026, 9, 14, 10)));
    assert.deepEqual(
      groepen.map((g) => [g.naam, g.tekst, g.reden]),
      [
        ["maandag en dinsdag", "09:00 – 17:00", ""],
        ["woensdag", "gesloten", "Studiedag"],
        ["donderdag en vrijdag", "09:00 – 17:00", ""],
        ["zaterdag en zondag", "gesloten", ""],
      ]
    );
  });

  it("zeven verschillende dagen blijven zeven regels", () => {
    const p = { openingstijden: Object.fromEntries(["ma", "di", "wo", "do", "vr", "za", "zo"].map((d, i) => [d, [[`0${i + 1}:00`, "17:00"]]])) };
    assert.equal(openingsGroepen(openingsRegels(p, MAANDAG(10))).length, 7);
  });
});

describe("kolomVolgorde", () => {
  it("vult twee kolommen van boven naar onder", () => {
    assert.deepEqual(kolomVolgorde(["ma", "di", "wo", "do", "vr", "za", "zo"]), ["ma", "vr", "di", "za", "wo", "zo", "do"]);
    assert.deepEqual(kolomVolgorde(["a", "b", "c"]), ["a", "c", "b"]);
    assert.deepEqual(kolomVolgorde(["a", "b"]), ["a", "b"]);
  });
});

describe("openingKop", () => {
  it("open, straks open, na sluitingstijd, en een dag zonder openingstijden", () => {
    const lunch = { openingstijden: { ...WERKWEEK.openingstijden, ma: [["09:00", "12:30"], ["13:30", "17:00"]] } };
    assert.equal(openingKop(WERKWEEK, MAANDAG(10)), "Nu geopend, tot 17:00");
    assert.equal(openingKop(lunch, MAANDAG(13)), "Nu gesloten, om 13:30 weer open");
    assert.equal(openingKop(WERKWEEK, MAANDAG(19)), "Nu gesloten, morgen om 09:00 weer open");
    assert.equal(openingKop(WERKWEEK, new Date(2026, 9, 17, 12)), "Vandaag gesloten"); // zaterdag
  });
});
