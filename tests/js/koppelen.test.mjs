/**
 * Speakers koppelen vanuit de speakerkiezer — NIEUW GEDRAG.
 *
 * De openstaande wens sinds 0.16.1: op een algemene mediakaart kon je wel
 * groeperen, maar alleen via de zoekknop — een scherm verder dan de
 * speakerkiezer. Een echte Sonos-kaart doet kiezen én koppelen naast elkaar.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  KENMERK_GROUPING,
  groepVan,
  kanKoppelen,
  koppelOproep,
  koppelStand,
  speeltMee,
} from "../../src/media/koppelen.js";

const HOOFD = "media_player.woonkamer";
const KEUKEN = "media_player.keuken";
const TV = "media_player.tv";

function nepHass({ groep = [], keukenKan = true } = {}) {
  return {
    states: {
      [HOOFD]: {
        state: "playing",
        attributes: { supported_features: KENMERK_GROUPING, group_members: groep },
      },
      [KEUKEN]: {
        state: "idle",
        attributes: {
          supported_features: keukenKan ? KENMERK_GROUPING : 0,
          // HA zet dezelfde lijst op ELKE speler in de groep.
          group_members: groep,
        },
      },
      // Een tv-kastje meldt GROUPING niet.
      [TV]: { state: "playing", attributes: { supported_features: 4 } },
    },
  };
}

describe("groepVan — NIEUW GEDRAG", () => {
  it("leest wie er meespeelt", () => {
    const g = groepVan(nepHass({ groep: [HOOFD, KEUKEN] }), HOOFD);
    assert.equal(g.has(KEUKEN), true);
    assert.equal(g.has(TV), false);
  });

  it("een speler zonder groep geeft een lege verzameling", () => {
    assert.equal(groepVan(nepHass(), HOOFD).size, 0);
    assert.equal(groepVan({}, HOOFD).size, 0);
  });
});

describe("kanKoppelen — NIEUW GEDRAG", () => {
  it("kijkt naar het GROUPING-kenmerk", () => {
    const h = nepHass();
    assert.equal(kanKoppelen(h, HOOFD), true);
    // Een knop aanbieden die gegarandeerd mislukt is erger dan geen knop.
    assert.equal(kanKoppelen(h, TV), false);
  });

  it("een speler die er niet is of wegviel kan niet", () => {
    assert.equal(kanKoppelen(nepHass(), "media_player.bestaat_niet"), false);
    const weg = nepHass();
    weg.states[KEUKEN].state = "unavailable";
    assert.equal(kanKoppelen(weg, KEUKEN), false);
  });
});

describe("koppelStand — NIEUW GEDRAG", () => {
  it("de speler van de kaart is 'zelf'", () => {
    assert.equal(koppelStand(nepHass(), HOOFD, HOOFD), "zelf");
  });

  it("los, mee, en kan-niet", () => {
    assert.equal(koppelStand(nepHass(), KEUKEN, HOOFD), "los");
    assert.equal(koppelStand(nepHass({ groep: [HOOFD, KEUKEN] }), KEUKEN, HOOFD), "mee");
    assert.equal(koppelStand(nepHass(), TV, HOOFD), "kan-niet");
  });

  it("kan-niet gaat vóór mee: een speaker die het niet kan hoort geen knop te krijgen", () => {
    assert.equal(koppelStand(nepHass({ keukenKan: false }), KEUKEN, HOOFD), "kan-niet");
  });
});

describe("koppelOproep — NIEUW GEDRAG", () => {
  it("erbij zetten gaat naar de BAAS, met de nieuwe speaker als lid", () => {
    const o = koppelOproep(nepHass(), KEUKEN, HOOFD);
    assert.deepEqual(o, {
      domein: "media_player",
      service: "join",
      data: { group_members: [KEUKEN] },
      doel: { entity_id: HOOFD },
    });
  });

  it("loskoppelen gaat naar de SPEAKER ZELF", () => {
    // Dit naar de baas sturen zou de hele groep opheffen — en `group_members`
    // staat op élke speler in de groep, dus die verwarring is echt te maken.
    const o = koppelOproep(nepHass({ groep: [HOOFD, KEUKEN] }), KEUKEN, HOOFD);
    assert.deepEqual(o, {
      domein: "media_player",
      service: "unjoin",
      data: {},
      doel: { entity_id: KEUKEN },
    });
  });

  it("doet niets bij de speler zelf of bij een speaker die het niet kan", () => {
    assert.equal(koppelOproep(nepHass(), HOOFD, HOOFD), null);
    assert.equal(koppelOproep(nepHass(), TV, HOOFD), null);
  });
});

describe("speeltMee — welke lijst wint — NIEUW GEDRAG", () => {
  /**
   * Dit is twee keer gemeten en één keer teruggedraaid, en dat is het opschrijven
   * waard. In de testinstance bleef de demo-integratie na een `unjoin` de
   * losgekoppelde speaker in de lijst van de BAAS melden, terwijl die speaker
   * zelf `[]` zei. Toen is de speaker zelf geloofd — waarna KOPPELEN niet meer
   * leek te werken, want diezelfde demo zet bij `join` óók alleen de lijst van
   * de baas bij.
   *
   * De demo is aan de kant van het lid in beide richtingen onbetrouwbaar. De
   * afspraak van Home Assistant (en wat Sonos en Music Assistant doen) is dat
   * `group_members` op élke speler staat; die afspraak volgen we.
   */
  function hass({ hoofdLijst, eigenLijst }) {
    return {
      states: {
        [HOOFD]: {
          state: "playing",
          attributes: { supported_features: KENMERK_GROUPING, group_members: hoofdLijst },
        },
        [KEUKEN]: {
          state: "playing",
          attributes: { supported_features: KENMERK_GROUPING, group_members: eigenLijst },
        },
      },
    };
  }

  it("de lijst van de hoofdspeler is leidend", () => {
    const h = hass({ hoofdLijst: [HOOFD, KEUKEN], eigenLijst: [] });
    assert.equal(speeltMee(h, KEUKEN, HOOFD), true);
    assert.equal(koppelStand(h, KEUKEN, HOOFD), "mee");
  });

  it("meldt het hoofd niets, dan telt de eigen lijst van de speaker", () => {
    // Voor integraties die `group_members` alleen bij het lid zetten.
    assert.equal(speeltMee(hass({ hoofdLijst: [], eigenLijst: [HOOFD, KEUKEN] }), KEUKEN, HOOFD), true);
  });

  it("de eigen lijst spreekt het hoofd niet tegen", () => {
    // Zou hij dat wel doen, dan lijkt koppelen niet te werken bij elke
    // integratie die alleen de baas bijwerkt.
    assert.equal(speeltMee(hass({ hoofdLijst: [HOOFD, KEUKEN], eigenLijst: [] }), KEUKEN, HOOFD), true);
  });

  it("allebei leeg is niet gekoppeld", () => {
    assert.equal(speeltMee(hass({ hoofdLijst: [], eigenLijst: [] }), KEUKEN, HOOFD), false);
  });
});
