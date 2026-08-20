/**
 * De derde regel van de mediakaart: shuffle, herhalen, zoeken en groeperen.
 *
 * Dezelfde afspraak als bij de transportknoppen -- wat de speler niet kan, komt
 * er niet op -- met één zeef erbij: zoeken heeft Music Assistant nodig, want
 * daar komt de bibliotheek vandaan.
 *
 * Het groeperen zat hier eerst als eigen knop naast zoeken. Die is eruit: het
 * zoekscherm toont de speakers onderin, dus wie op zoeken tikt komt ze vanzelf
 * tegen, en twee knoppen naar hetzelfde scherm is er één te veel.
 *
 * NIEUW GEDRAG: `extraVoor` bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KENMERK,
  bronVoor,
  extraVoor,
  geluidsSpeler,
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
  it("een MA-speler die alles kan, krijgt shuffle, herhalen en zoeken", () => {
    const st = speler("playing", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search"]);
  });

  it("er komt geen aparte knop voor groeperen bij -- dat zit in het zoekscherm", () => {
    const st = speler("playing", { supported_features: ALLES, mass_player_type: "player" });
    assert.equal(extraVoor(st).includes("speakers"), false);
  });

  it("een speler die geen MA is, krijgt geen zoeken", () => {
    const st = speler("playing", { supported_features: ALLES });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat"]);
  });

  it("een MA-speler die zich niet laat koppelen, krijgt zoeken gewoon", () => {
    const st = speler("playing", {
      supported_features: KENMERK.SHUFFLE_SET | KENMERK.REPEAT_SET,
      mass_player_type: "player",
    });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search"]);
  });

  it("zoeken uitzetten laat alleen shuffle en herhalen over", () => {
    const st = speler("playing", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st, { zoeken: false }), ["shuffle", "repeat"]);
  });

  it("een speler die uit staat krijgt geen derde regel", () => {
    const st = speler("off", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), []);
  });

  it("en een speler die stil staat wél: daar stel je shuffle juist in", () => {
    const st = speler("idle", { supported_features: ALLES, mass_player_type: "player" });
    assert.deepEqual(extraVoor(st), ["shuffle", "repeat", "search"]);
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

describe("geluidsSpeler()", () => {
  it("is normaal de speler zelf", () => {
    assert.equal(geluidsSpeler({ entity: "media_player.sonos" }), "media_player.sonos");
  });

  it("maar de soundbar zodra die is ingevuld -- daar zit het geluid", () => {
    assert.equal(
      geluidsSpeler({ entity: "media_player.tv", volume_entity: "media_player.soundbar" }),
      "media_player.soundbar"
    );
  });

  it("een lege invulling telt niet als keuze", () => {
    assert.equal(
      geluidsSpeler({ entity: "media_player.tv", volume_entity: "" }),
      "media_player.tv"
    );
    assert.equal(geluidsSpeler(undefined), undefined);
  });
});

/**
 * De bronkiezer — NIEUW GEDRAG.
 *
 * `bronVoor` bestond niet vóór deze ronde. De getallen komen van het
 * Ziggo-kastje van de eigenaar, uitgelezen op 20 augustus 2026:
 * `supported_features: 154547` en 233 bronnen.
 */
describe("bronVoor()", () => {
  const ZIGGO = 154547; // bevat SELECT_SOURCE (2048), geen VOLUME_SET
  const speler = (attrs = {}, state = "playing") => ({
    entity_id: "media_player.opaenoma",
    state,
    attributes: { supported_features: ZIGGO, source_list: ["NPO 1", "RTL 4"], source: "RTL 4", ...attrs },
  });

  it("geeft de bron en het aantal terug", () => {
    assert.deepEqual(bronVoor(speler()), { nu: "RTL 4", aantal: 2 });
  });

  it("REGRESSIEWACHT: het echte kastje kan SELECT_SOURCE maar geen volume", () => {
    assert.equal(Boolean(ZIGGO & 2048), true, "SELECT_SOURCE");
    assert.equal(Boolean(ZIGGO & 4), false, "VOLUME_SET");
    assert.equal(Boolean(ZIGGO & 8), false, "VOLUME_MUTE");
  });

  it("niets als de speler geen bron kan kiezen", () => {
    assert.equal(bronVoor(speler({ supported_features: 4 })), null);
  });

  it("niets bij een lege lijst — een knop naar een leeg scherm is kapot", () => {
    assert.equal(bronVoor(speler({ source_list: [] })), null);
    assert.equal(bronVoor(speler({ source_list: undefined })), null);
  });

  it("niets als de ontvanger uit staat", () => {
    assert.equal(bronVoor(speler({}, "off")), null);
    assert.equal(bronVoor(speler({}, "unavailable")), null);
  });

  it("niets als je hem hebt uitgezet in de kaartinstellingen", () => {
    assert.equal(bronVoor(speler(), { tonen: false }), null);
  });

  it("zonder gekozen bron nog steeds een knop, maar zonder naam", () => {
    assert.deepEqual(bronVoor(speler({ source: undefined })), { nu: null, aantal: 2 });
  });

  it("geen knop bij één bron -- dat is geen keuze", () => {
    assert.equal(bronVoor(speler({ source_list: ["NPO 1"] })), null);
  });

  it("geen knop op een speler van Music Assistant", () => {
    // Gemeten op de Sonos van de eigenaar: de MA-entiteit meldt precies één
    // bron, "Music Assistant Queue". Dat is de eigen boekhouding van MA en geen
    // keuze die iemand maakt.
    assert.equal(
      bronVoor(
        speler({ mass_player_type: "player", source_list: ["Music Assistant Queue"],
                 source: "Music Assistant Queue" })
      ),
      null
    );
    // Ook niet als MA er ooit meerdere zou melden: het blijft zijn wachtrij.
    assert.equal(
      bronVoor(speler({ mass_player_type: "player", source_list: ["Queue", "Iets"] })),
      null
    );
  });

  it("de Sonos-entiteit ernaast houdt zijn eigen bronnen wél", () => {
    // Dezelfde speaker, maar de entiteit van Sonos zelf: veertien radiozenders.
    const sonos = speler({ mass_player_type: undefined,
      source_list: ["100% NL", "Qmusic", "Radio 538"], source: null });
    assert.deepEqual(bronVoor(sonos), { nu: null, aantal: 3 });
  });
});
