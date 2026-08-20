/**
 * Wat de kaart aan de serverkant vraagt voor de bibliotheek.
 *
 * NIEUW GEDRAG: `src/media/bibliotheek.js` bestond niet vóór deze ronde.
 *
 * Het scherp punt is `favorietBericht`. Een hartje aanzetten gaat op **uri**,
 * uitzetten op **bibliotheeknummer plus soort** -- dat is de eis van Music
 * Assistant, niet onze keuze, en precies het soort verschil dat iemand een keer
 * omdraait. Dat draait hier vast.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BIB_SOORTEN,
  favorietBericht,
  kanFavoriet,
  soortVan,
} from "../../src/media/bibliotheek.js";

const nummer = (extra = {}) => ({
  name: "Het Nummer",
  uri: "library://track/12",
  media_type: "track",
  library_item_id: "12",
  favorite: false,
  ...extra,
});

describe("favorietBericht()", () => {
  it("aanzetten gaat op uri", () => {
    assert.deepEqual(favorietBericht(nummer(), true), {
      type: "domotiapp_lovelace/media/favorite",
      favorite: true,
      uri: "library://track/12",
    });
  });

  it("uitzetten gaat op bibliotheeknummer en soort, niet op uri", () => {
    const b = favorietBericht(nummer({ favorite: true }), false);
    assert.deepEqual(b, {
      type: "domotiapp_lovelace/media/favorite",
      favorite: false,
      kind: "tracks",
      library_item_id: "12",
    });
    assert.equal("uri" in b, false, "de uri hoort er bij uitzetten niet in te zitten");
  });

  it("het bibliotheeknummer gaat als string mee, ook als MA een getal gaf", () => {
    const b = favorietBericht(nummer({ library_item_id: 7 }), false);
    assert.strictEqual(b.library_item_id, "7");
  });

  it("niets zonder uri bij aanzetten", () => {
    assert.equal(favorietBericht(nummer({ uri: undefined }), true), null);
  });

  it("niets zonder bibliotheeknummer bij uitzetten", () => {
    // Zo ziet een zoekresultaat eruit dat nog niet in de bibliotheek staat.
    assert.equal(favorietBericht(nummer({ library_item_id: null }), false), null);
  });

  it("niets voor niets", () => {
    assert.equal(favorietBericht(null, true), null);
    assert.equal(favorietBericht(undefined, false), null);
  });
});

describe("soortVan()", () => {
  it("MA praat enkelvoud, onze commando's meervoud", () => {
    assert.equal(soortVan({ media_type: "track" }), "tracks");
    assert.equal(soortVan({ media_type: "album" }), "albums");
    assert.equal(soortVan({ media_type: "artist" }), "artists");
    assert.equal(soortVan({ media_type: "playlist" }), "playlists");
  });

  it("radio is in allebei hetzelfde woord", () => {
    // Dit is de uitzondering waarom er een tabel staat en geen + "s".
    assert.equal(soortVan({ media_type: "radio" }), "radio");
  });

  it("onbekend blijft onbekend in plaats van te gokken", () => {
    assert.equal(soortVan({ media_type: "iets" }), null);
    assert.equal(soortVan({}), null);
    assert.equal(soortVan(null), null);
  });

  it("elke soort uit de filterknoppen komt ook uit soortVan", () => {
    // Anders staat er een filterknop waarvan het hartje niet werkt.
    const uitTabel = new Set(
      ["track", "album", "artist", "playlist", "radio"].map((t) => soortVan({ media_type: t }))
    );
    for (const [soort] of BIB_SOORTEN) {
      assert.equal(uitTabel.has(soort), true, `${soort} ontbreekt in soortVan`);
    }
  });
});

describe("kanFavoriet()", () => {
  it("alles met een uri kan favoriet worden", () => {
    assert.equal(kanFavoriet(nummer()), true);
  });

  it("zonder uri niet -- dan hoort het hartje er niet te staan", () => {
    assert.equal(kanFavoriet({ name: "Iets" }), false);
    assert.equal(kanFavoriet(null), false);
  });
});
