import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { actieveSpeler, schrijfSpeler, spelerSleutel, spelersVan } from "../../src/cards/media-logica.js";

/** Een nagemaakte localStorage: net genoeg om de keuze te bewaren. */
const opslag = (start = {}) => {
  const d = { ...start };
  return {
    getItem: (k) => (k in d ? d[k] : null),
    setItem: (k, v) => {
      d[k] = String(v);
    },
    alles: d,
  };
};

const hass = {
  states: {
    "media_player.woonkamer": { state: "playing", attributes: { friendly_name: "Woonkamer" } },
    "media_player.keuken": { state: "off", attributes: { friendly_name: "Keuken" } },
    "media_player.badkamer": { state: "idle", attributes: { friendly_name: "Badkamer" } },
    "light.hal": { state: "on", attributes: {} },
  },
};

describe("de algemene mediaspeler", () => {
  it("biedt alle mediaspelers aan als er niets is ingesteld", () => {
    const lijst = spelersVan({ entity: "media_player.keuken" }, hass);
    // Op naam gesorteerd, en niets uit een ander domein.
    assert.deepEqual(lijst, [
      "media_player.badkamer",
      "media_player.keuken",
      "media_player.woonkamer",
    ]);
  });

  it("houdt zich aan een ingestelde lijst, met de vaste speler erbij", () => {
    const lijst = spelersVan(
      { entity: "media_player.woonkamer", players: ["media_player.keuken"] },
      hass,
    );
    assert.deepEqual(lijst, ["media_player.keuken", "media_player.woonkamer"]);
  });

  it("laat een speaker die niet bestaat uit de lijst", () => {
    const lijst = spelersVan(
      { entity: "media_player.keuken", players: ["media_player.zolder"] },
      hass,
    );
    // Alleen de vaste speler blijft over -- geen entiteit die nergens is.
    assert.deepEqual(lijst, ["media_player.keuken"]);
  });

  it("bedient gewoon de vaste speler als het vinkje uit staat", () => {
    // REGRESSIEWACHT: zonder `speaker_select` verandert er niets aan de kaart.
    const lijst = spelersVan({ entity: "media_player.keuken" }, hass);
    const uit = actieveSpeler({ entity: "media_player.keuken" }, lijst, opslag());
    assert.equal(uit, "media_player.keuken");
  });

  it("valt terug op de speler uit de config als er niets onthouden is", () => {
    const config = { entity: "media_player.keuken", speaker_select: true };
    const lijst = spelersVan(config, hass);
    assert.equal(actieveSpeler(config, lijst, opslag()), "media_player.keuken");
  });

  it("onthoudt de keuze van dit apparaat", () => {
    const config = { entity: "media_player.keuken", speaker_select: true };
    const lijst = spelersVan(config, hass);
    const bak = opslag();
    schrijfSpeler(bak, lijst, "media_player.badkamer");
    assert.equal(actieveSpeler(config, lijst, bak), "media_player.badkamer");
    // En onder een sleutel die van de LIJST komt, niet van de kaart.
    assert.ok(spelerSleutel(lijst) in bak.alles);
  });

  it("vergeet een onthouden speler die er niet meer is", () => {
    const config = { entity: "media_player.keuken", speaker_select: true };
    const lijst = spelersVan(config, hass);
    const bak = opslag({ [spelerSleutel(lijst)]: "media_player.zolder" });
    // Anders bedient de kaart een entiteit die nergens bestaat en blijft hij
    // leeg zonder te zeggen waarom.
    assert.equal(actieveSpeler(config, lijst, bak), "media_player.keuken");
  });

  it("overleeft een opslag die dichtzit", () => {
    const stuk = {
      getItem: () => {
        throw new Error("privévenster");
      },
      setItem: () => {
        throw new Error("privévenster");
      },
    };
    const config = { entity: "media_player.keuken", speaker_select: true };
    const lijst = spelersVan(config, hass);
    assert.equal(actieveSpeler(config, lijst, stuk), "media_player.keuken");
    assert.equal(schrijfSpeler(stuk, lijst, "media_player.badkamer"), false);
  });

  it("kiest de eerste speaker als de kaart er zelf geen heeft", () => {
    const config = { entity: "", speaker_select: true };
    const lijst = spelersVan(config, hass);
    assert.equal(actieveSpeler(config, lijst, opslag()), "media_player.badkamer");
  });
});
