/**
 * De schatting van de mediakaart vóór de eerste meting — NIEUW GEDRAG.
 *
 * Home Assistant vraagt `getGridOptions()` vaak al op vóórdat de kaart zijn
 * inhoud heeft gemeten, en dan hoort hij deze schatting. De schatting die er
 * stond (`1 + volume + derde regel`, inline in `getCardSize`) keek alleen naar
 * het volume van de speler zelf. Twee kaarten kregen daardoor één rij te
 * weinig:
 *
 * - een tv-ontvanger met zenders: de bronknop staat op de volumeregel, dus die
 *   regel is er ook zonder volume;
 * - een tv met een soundbar eronder (`volume_entity`): het volume komt van de
 *   soundbar, niet van de speler.
 *
 * Dat is de kaart van de schermafdruk van 29 september 2026. De echte reparatie
 * is het seintje in rasterhoogte.js (zie rasterhoogte-melden.test.mjs); deze
 * schatting zorgt dat het eerste vak meteen klopt.
 *
 * Met `import *`, zodat dit bestand ook tegen de code van vóór de fix laadt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as media from "../../src/cards/media-logica.js";

const { KENMERK } = media;
const speler = (state, supported_features, extra = {}) => ({
  entity_id: "media_player.test",
  state,
  attributes: { supported_features, ...extra },
});

/** Een tv-ontvanger: afspelen en zenders, geen eigen volume. */
const ONTVANGER = KENMERK.PLAY | KENMERK.PAUSE | KENMERK.TURN_ON | KENMERK.TURN_OFF | KENMERK.SELECT_SOURCE;
const ZENDERS = { source_list: ["NPO 1", "RTL 4", "SBS6"], source: "RTL 4" };
/** Een soundbar: alleen volume. */
const SOUNDBAR = KENMERK.VOLUME_SET | KENMERK.VOLUME_MUTE | KENMERK.TURN_ON | KENMERK.TURN_OFF;

const rijen = (...a) => {
  assert.equal(typeof media.rijenVoor, "function", "rijenVoor bestaat niet");
  return media.rijenVoor(...a);
};

describe("rijenVoor() — NIEUW GEDRAG", () => {
  it("telt de volumeregel mee als er alleen een bronknop op staat", () => {
    const st = speler("playing", ONTVANGER, ZENDERS);
    assert.equal(rijen({ entity: st.entity_id }, st), 2);
  });

  it("telt het volume van de soundbar mee, niet dat van de speler", () => {
    const tv = speler("playing", KENMERK.PLAY | KENMERK.PAUSE);
    const bar = speler("on", SOUNDBAR, { volume_level: 0.14 });
    assert.equal(rijen({ entity: "media_player.tv", volume_entity: "media_player.bar" }, tv, bar), 2);
  });

  it("drie regels is drie rijen: speler, volume met bron, shuffle", () => {
    const st = speler("playing", ONTVANGER | KENMERK.VOLUME_SET | KENMERK.SHUFFLE_SET, ZENDERS);
    assert.equal(rijen({ entity: st.entity_id }, st), 3);
  });

  it("volgt de schakelaars in de editor", () => {
    const st = speler("playing", ONTVANGER | KENMERK.VOLUME_SET | KENMERK.SHUFFLE_SET, ZENDERS);
    assert.equal(rijen({ show_volume: false, show_source: false }, st), 2);
    assert.equal(rijen({ show_volume: false, show_source: false, show_controls: false }, st), 1);
  });

  it("de speakerbalk erbij blijft binnen drie rijen", () => {
    // 128px met drie regels, 167 met de balk erbij: allebei 184.
    const st = speler("playing", ONTVANGER | KENMERK.VOLUME_SET | KENMERK.SHUFFLE_SET, ZENDERS);
    assert.equal(rijen({ speaker_select: true }, st), 3);
    assert.equal(rijen({ speaker_select: true }, speler("off", ONTVANGER)), 2);
  });

  it("een speler die uit staat of weg is, is één rij", () => {
    assert.equal(rijen({}, speler("off", ONTVANGER | KENMERK.VOLUME_SET, ZENDERS)), 1);
    assert.equal(rijen({}, speler("unavailable", ONTVANGER, ZENDERS)), 1);
    assert.equal(rijen({}, null), 1);
  });
});
