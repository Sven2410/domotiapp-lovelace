/**
 * De derde regel van de mediakaart: shuffle, herhalen, zoeken en groeperen.
 *
 * Dezelfde afspraak als bij de transportknoppen -- wat de speler niet kan, komt
 * er niet op -- maar met twee zeven erbij: zoeken en groeperen hebben Music
 * Assistant nodig, want daar komt de bibliotheek en het speakerlabel vandaan.
 *
 * NIEUW GEDRAG: `extraVoor` bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KENMERK,
  extraVoor,
  herhaalStand,
  isMaSpeler,
  shuffleAan,
  volgendeHerhaling,
} from "../../src/cards/media-logica.js";

const speler = (state, attributes = {}) => ({
  entity_id: "media_player.test",
  state,
  attributes,
});

const ALLES =
  KENMERK.SHUFFLE_SET | KENMERK.REPEAT_SET | KENMERK.GROUPING | KENMERK.PLAY | KENMERK.PAUSE;

describe("extraVoor()", () => {
  it("een MA-speler die alles kan, krijgt alle vier", () => {
    const st = speler("playing", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search", "speakers"]);
  });

  it("een speler die geen MA is, krijgt geen zoeken en geen groeperen", () => {
    const st = speler("playing", { supported_features: ALLES });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat"]);
  });

  it("een MA-speler die zich niet laat koppelen, krijgt wel zoeken maar geen speakers", () => {
    const st = speler("playing", {
      supported_features: KENMERK.SHUFFLE_SET | KENMERK.REPEAT_SET,
      mass_player_type: "player",
    });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search"]);
  });

  it("zoeken uitzetten haalt ook het groeperen weg -- ze delen één scherm", () => {
    const st = speler("playing", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st, { zoeken: false }), ["shuffle", "repeat"]);
  });

  it("een speler die uit staat krijgt geen derde regel", () => {
    const st = speler("off", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), []);
  });

  it("en een speler die stil staat wél: daar stel je shuffle juist in", () => {
    const st = speler("idle", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search", "speakers"]);
  });

  it("niets bekend is geen knoppen, in plaats van dode knoppen", () => {
    assert.deepEqual(extraVoor(speler("playing")), []);
    assert.deepEqual(extraVoor(null), []);
  });
});

describe("shuffle en herhalen", () => {
  it("de standen lopen rond: uit, alles, één, uit", () => {
    assert.equal(volgendeHerhaling("off"), "all");
    assert.equal(volgendeHerhaling("all"), "one");
    assert.equal(volgendeHerhaling("one"), "off");
  });

  it("een onbekende stand telt als uit, dus de eerste tik zet hem aan", () => {
    assert.equal(herhaalStand(speler("playing", { repeat: "kapot" })), "off");
    assert.equal(herhaalStand(speler("playing")), "off");
    assert.equal(volgendeHerhaling("kapot"), "all");
  });

  it("shuffle leest het attribuut en niet de stand van de speler", () => {
    assert.equal(shuffleAan(speler("playing", { shuffle: true })), true);
    assert.equal(shuffleAan(speler("playing", { shuffle: false })), false);
    assert.equal(shuffleAan(speler("playing")), false);
  });
});

describe("isMaSpeler()", () => {
  it("herkent een speler van Music Assistant aan zijn spelertype", () => {
    assert.equal(isMaSpeler(speler("playing", { mass_player_type: "player" })), true);
    assert.equal(isMaSpeler(speler("playing", { mass_player_type: "group" })), true);
  });

  it("een Sonos- of Cast-entiteit is het niet", () => {
    assert.equal(isMaSpeler(speler("playing", { supported_features: 1 })), false);
    assert.equal(isMaSpeler(null), false);
  });
});
