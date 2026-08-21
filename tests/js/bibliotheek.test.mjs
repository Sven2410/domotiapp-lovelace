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
  ZOEK_SOORTEN,
  bibSoortNa,
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

describe("de brug tussen zoeken en de bibliotheek", () => {
  it("elke zoeksoort wijst een bibliotheek aan die bestaat", () => {
    // Dit is de bug van 21 augustus 2026. Het favorietenblad vergeleek de
    // zoeksoort ("track") RECHTSTREEKS met de bibliotheeksoorten ("tracks").
    // Alleen radio heet in allebei hetzelfde, dus alleen radio kwam over; al het
    // andere viel terug op afspeellijsten. Wie een nummer favoriet maakte, kreeg
    // favoriete AFSPEELLIJSTEN te zien en dacht dat het hartje niet bewaard was.
    const bibliotheken = new Set(BIB_SOORTEN.map(([w]) => w));
    for (const [zoeksoort] of ZOEK_SOORTEN) {
      if (!zoeksoort) continue; // "Alles" heeft geen tegenhanger, dat mag
      const bib = soortVan({ media_type: zoeksoort });
      assert.equal(bibliotheken.has(bib), true, `${zoeksoort} wijst naar ${bib}`);
    }
  });

  it("de twee lijsten praten NIET dezelfde taal -- daar zat het misverstand", () => {
    const bibliotheken = new Set(BIB_SOORTEN.map(([w]) => w));
    assert.equal(bibliotheken.has("track"), false);
    assert.equal(bibliotheken.has("tracks"), true);
  });
});

describe("bibSoortNa()", () => {
  it("het antwoord van de serverkant wint -- die heeft het item opgezocht", () => {
    assert.equal(bibSoortNa({ kind: "albums" }, { media_type: "track" }, "playlists"), "albums");
  });

  it("zonder antwoord telt de soort van het item zelf", () => {
    assert.equal(bibSoortNa(null, { media_type: "track" }, "playlists"), "tracks");
    assert.equal(bibSoortNa({}, { media_type: "playlist" }, "tracks"), "playlists");
  });

  it("een nummer favoriet maken opent het favorietenblad op nummers", () => {
    // De melding zelf, in één regel: hartje op een nummer, dan naar Favorieten.
    assert.equal(bibSoortNa({ kind: "tracks", library_item_id: "12" }, nummer()), "tracks");
  });

  it("valt iets weg, dan blijft staan waar je was", () => {
    assert.equal(bibSoortNa(null, { media_type: "iets" }, "artists"), "artists");
  });

  it("en zonder ook maar iets is het afspeellijsten, zoals het blad altijd opende", () => {
    assert.equal(bibSoortNa(null, null), "playlists");
  });
});
