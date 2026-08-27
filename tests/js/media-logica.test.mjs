/**
 * De mediaspelerkaart leest uit het apparaat wat het apparaat kan.
 *
 * Dat is de afspraak uit de familie -- `supported_color_modes` bij de lampkaart,
 * `supported_features` bij het rolluik -- en hier is hij het meest zichtbaar:
 * de knoppen op de kaart zijn letterlijk het bitmasker van de entiteit. Vier
 * echte spelers staan hieronder, met de maskers zoals Home Assistant ze
 * werkelijk meldt.
 *
 * Bewust geen jsdom: dit is pure logica en heeft geen DOM nodig (CLAUDE.md).
 * Hoe de knoppen er vervolgens UITZIEN is een browsermeting, geen unittest.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KENMERK,
  isActief,
  isGedempt,
  isUit,
  kan,
  knoppenVoor,
  mediaIcoon,
  volumePct,
  volumeVoor,
  heeftVolume,
  watSpeeltEr,
} from "../../src/cards/media-logica.js";

const speler = (state, attributes = {}) => ({
  entity_id: "media_player.test",
  state,
  attributes,
});

/** Sonos: alles behalve tv-dingen. */
const SONOS =
  KENMERK.PAUSE | KENMERK.VOLUME_SET | KENMERK.VOLUME_MUTE | KENMERK.PREVIOUS_TRACK |
  KENMERK.NEXT_TRACK | KENMERK.TURN_ON | KENMERK.TURN_OFF | KENMERK.PLAY | KENMERK.STOP |
  KENMERK.SHUFFLE_SET | KENMERK.REPEAT_SET;

/** Een radiostream: spelen en stoppen, geen pauze, geen tracks. */
const STREAM = KENMERK.VOLUME_SET | KENMERK.VOLUME_MUTE | KENMERK.STOP;

/** Een tv die alleen aan en uit kan en stapjes volume kent. */
const TV = KENMERK.TURN_ON | KENMERK.TURN_OFF | KENMERK.VOLUME_STEP | KENMERK.VOLUME_MUTE;

describe("kan()", () => {
  it("leest het bitmasker van de entiteit", () => {
    const st = speler("playing", { supported_features: SONOS });
    assert.equal(kan(st, KENMERK.NEXT_TRACK), true);
    assert.equal(kan(st, KENMERK.SEEK), false);
  });

  it("een speler zonder supported_features kan niets", () => {
    assert.equal(kan(speler("playing"), KENMERK.PAUSE), false);
    assert.equal(kan(null, KENMERK.PAUSE), false);
  });
});

describe("knoppenVoor()", () => {
  it("geeft de speler alles wat hij aankan, in vaste volgorde", () => {
    assert.deepEqual(knoppenVoor(speler("playing", { supported_features: SONOS })), [
      "power",
      "prev",
      "play",
      "next",
    ]);
  });

  it("laat weg wat de speler niet kan", () => {
    const st = speler("playing", { supported_features: KENMERK.PLAY | KENMERK.PAUSE });
    assert.deepEqual(knoppenVoor(st), ["play"]);
  });

  it("een stream zonder pauze krijgt stop in plaats van afspelen", () => {
    assert.deepEqual(knoppenVoor(speler("playing", { supported_features: STREAM })), ["stop"]);
  });

  it("een speler die uit staat toont alleen zijn aan-knop", () => {
    assert.deepEqual(knoppenVoor(speler("off", { supported_features: SONOS })), ["power"]);
  });

  it("een speler zonder kenmerken krijgt geen knoppen in plaats van dode knoppen", () => {
    assert.deepEqual(knoppenVoor(speler("playing")), []);
    assert.deepEqual(knoppenVoor(null), []);
  });
});

describe("volumeVoor()", () => {
  it("een schuif als de speler een niveau aanneemt", () => {
    assert.deepEqual(volumeVoor(speler("playing", { supported_features: SONOS })), [
      "mute",
      "slider",
    ]);
  });

  it("twee knoppen als hij alleen stapjes kent", () => {
    assert.deepEqual(volumeVoor(speler("playing", { supported_features: TV })), ["mute", "steps"]);
  });

  it("geen volumeregel als hij er niets van kan", () => {
    const st = speler("playing", { supported_features: KENMERK.TURN_ON });
    assert.deepEqual(volumeVoor(st), []);
  });

  it("geen volumeregel op een speler die uit of weg is", () => {
    assert.deepEqual(volumeVoor(speler("off", { supported_features: SONOS })), []);
    assert.deepEqual(volumeVoor(speler("unavailable", { supported_features: SONOS })), []);
    assert.deepEqual(volumeVoor(null), []);
  });

  it("maar wel op een speler die aanstaat zonder te spelen -- je zet het volume goed vooraf", () => {
    assert.deepEqual(volumeVoor(speler("idle", { supported_features: SONOS })), ["mute", "slider"]);
    assert.deepEqual(volumeVoor(speler("standby", { supported_features: TV })), ["mute", "steps"]);
  });
});

describe("volumePct()", () => {
  it("rekent 0..1 om naar hele procenten", () => {
    assert.equal(volumePct(speler("playing", { volume_level: 0.42 })), 42);
    assert.equal(volumePct(speler("playing", { volume_level: 1 })), 100);
  });

  it("houdt onzin binnen de schaal in plaats van een schuif buiten de kaart", () => {
    assert.equal(volumePct(speler("playing", { volume_level: 1.4 })), 100);
    assert.equal(volumePct(speler("playing", { volume_level: -3 })), 0);
    assert.equal(volumePct(speler("playing")), 0);
  });

  it("dempen is geen volume van nul", () => {
    const st = speler("playing", { volume_level: 0.3, is_volume_muted: true });
    assert.equal(isGedempt(st), true);
    assert.equal(volumePct(st), 30);
  });
});

describe("watSpeeltEr()", () => {
  it("titel met artiest erachter", () => {
    const st = speler("playing", { media_title: "Teardrop", media_artist: "Massive Attack" });
    assert.equal(watSpeeltEr(st), "Teardrop · Massive Attack");
  });

  it("een serie noemt de serie onder de aflevering", () => {
    const st = speler("playing", { media_title: "Aflevering 3", media_series_title: "Chernobyl" });
    assert.equal(watSpeeltEr(st), "Aflevering 3 · Chernobyl");
  });

  it("een tv meldt zijn zender", () => {
    const st = speler("playing", { media_channel: "NPO 1", app_name: "Live TV" });
    assert.equal(watSpeeltEr(st), "NPO 1 · Live TV");
  });

  it("zegt geen twee keer hetzelfde", () => {
    const st = speler("playing", { media_title: "Radio 538", media_artist: "Radio 538" });
    assert.equal(watSpeeltEr(st), "Radio 538");
  });

  it("zonder titel valt hij terug op de app of de bron", () => {
    assert.equal(watSpeeltEr(speler("idle", { app_name: "Spotify" })), "Spotify");
    assert.equal(watSpeeltEr(speler("playing", { source: "HDMI 2" })), "HDMI 2");
  });

  it("en anders op de vertaling van Home Assistant zelf", () => {
    const vertaal = (st) => ({ idle: "Inactief", playing: "Aan het spelen" })[st.state];
    assert.equal(watSpeeltEr(speler("idle"), vertaal), "Inactief");
  });

  it("uit, stand-by en onbereikbaar staan er in gewone taal", () => {
    assert.equal(watSpeeltEr(speler("off")), "Uit");
    assert.equal(watSpeeltEr(speler("standby")), "Stand-by");
    assert.equal(watSpeeltEr(speler("unavailable")), "Niet bereikbaar");
  });
});

describe("toestand en icoon", () => {
  it("uit is uit, en spelen of pauze is actief", () => {
    assert.equal(isUit(speler("off")), true);
    assert.equal(isUit(null), true);
    assert.equal(isActief(speler("playing")), true);
    assert.equal(isActief(speler("paused")), true);
    assert.equal(isActief(speler("idle")), false);
    assert.equal(isActief(speler("unavailable")), false);
  });

  it("het soort speler bepaalt het icoon, niet een instelling", () => {
    assert.equal(mediaIcoon(speler("playing", { device_class: "tv" })), "tv");
    assert.equal(mediaIcoon(speler("playing", { device_class: "receiver" })), "radio");
    assert.equal(mediaIcoon(speler("playing")), "speaker");
  });
});

describe("heeftVolume — de tv-ontvanger zonder eigen geluid — NIEUW GEDRAG", () => {
  /**
   * Gemeld op 27 augustus 2026 met een schermafdruk van zijn tv-ontvanger:
   * *"als ik een mediabox heb en geen speaker heb geselecteerd, staat het geluid
   * op nul, maar dan speelt het tv-geluid -- dus dan moet dat weg."*
   *
   * Zijn kastje meldt geen `volume_level`. `volumePct` maakt van een ontbrekende
   * waarde een 0, en dus stond er "0%" op de kaart terwijl de televisie gewoon
   * geluid gaf.
   */
  it("een speler zonder volume_level heeft geen volume", () => {
    // Zijn mediabox: hij speelt, hij kent zenders, maar geen geluid.
    const box = {
      state: "playing",
      attributes: {
        supported_features: KENMERK.SELECT_SOURCE | KENMERK.PAUSE,
        source: "RTL 4",
        media_title: "RTL Nieuws - 18:00 uur",
      },
    };
    assert.equal(heeftVolume(box), false);
    // En dit is waar het misging: het percentage werd 0.
    assert.equal(volumePct(box), 0);
  });

  it("een speaker die WEL een volume meldt houdt zijn percentage", () => {
    assert.equal(heeftVolume({ state: "playing", attributes: { volume_level: 0.42 } }), true);
    assert.equal(volumePct({ state: "playing", attributes: { volume_level: 0.42 } }), 42);
  });

  it("een volume van nul is iets anders dan geen volume", () => {
    // Een speaker die je zelf op nul hebt gezet MOET 0% tonen -- dat is waar.
    const stil = { state: "playing", attributes: { volume_level: 0 } };
    assert.equal(heeftVolume(stil), true);
    assert.equal(volumePct(stil), 0);
  });

  it("null telt als geen volume", () => {
    assert.equal(heeftVolume({ state: "playing", attributes: { volume_level: null } }), false);
    assert.equal(heeftVolume(null), false);
  });
});
