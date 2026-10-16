/**
 * De wifikaart: van een QR-code van UniFi naar wat er op het scherm staat.
 * Alles **NIEUW GEDRAG** (16 oktober 2026): `src/cards/wifi-logica.js`
 * bestond vóór deze ronde niet.
 *
 * De vaste invoer is een echte dump van een klant (Home Assistant 2026.10.1),
 * geanonimiseerd: `vaste-invoer/unifi-wlan-qr.json`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { apparaatVan, eersteWifiQr, geenQrReden, isWifiQr, netwerkNaam, qrAdres } from "../../src/cards/wifi-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/unifi-wlan-qr.json", import.meta.url), "utf8"));
const ID = dump.toestand.entity_id;

/** Een `hass` zoals de frontend hem heeft: toestanden, het register en de apparaten. */
function hassUit(extra = {}) {
  return {
    states: { [ID]: dump.toestand, "image.camera_snapshot": { entity_id: "image.camera_snapshot", state: "x", attributes: { entity_picture: "/x" } }, ...(extra.states ?? {}) },
    entities: { [ID]: dump.register, ...(extra.entities ?? {}) },
    devices: { [dump.apparaat.id]: dump.apparaat, ...(extra.devices ?? {}) },
    hassUrl: (p) => `http://ha.local:8123${p}`,
  };
}

describe("de dump", () => {
  it("is de QR-code van een wifi-netwerk, herkend op translation_key", () => {
    assert.equal(isWifiQr(hassUit(), ID), true);
    assert.equal(isWifiQr(hassUit(), "image.camera_snapshot"), false);
    assert.equal(isWifiQr(hassUit(), "camera.voordeur"), false);
  });

  it("zonder register: op het model van het apparaat", () => {
    const h = hassUit();
    h.entities[ID] = { device_id: dump.apparaat.id };
    assert.equal(isWifiQr(h, ID), true);
  });

  it("de netwerknaam komt uit het apparaat, niet uit friendly_name", () => {
    assert.equal(apparaatVan(hassUit(), ID).model, "UniFi WLAN");
    assert.equal(netwerkNaam(hassUit(), ID), "Gastnetwerk");
  });

  it("een eigen naam gaat voor, en een hernoemd apparaat ook", () => {
    assert.equal(netwerkNaam(hassUit(), ID, " Wifi voor patiënten "), "Wifi voor patiënten");
    const h = hassUit();
    h.devices[dump.apparaat.id] = { ...dump.apparaat, name_by_user: "Gasten" };
    assert.equal(netwerkNaam(h, ID), "Gasten");
  });

  it("zonder apparaat: friendly_name zonder de vertaalde QR-code erachter", () => {
    const zonder = { states: { [ID]: dump.toestand } };
    assert.equal(netwerkNaam(zonder, ID), "Gastnetwerk");
    const en = { states: { [ID]: { ...dump.toestand, attributes: { friendly_name: "Guests QR code" } } } };
    assert.equal(netwerkNaam(en, ID), "Guests");
  });

  it("het adres is het image_proxy-adres van NU, met het token erin en het beeld als versie", () => {
    assert.equal(
      qrAdres(hassUit(), ID),
      "http://ha.local:8123/api/image_proxy/image.gastnetwerk_qr_code?token=XXX&v=2026-10-16T11%3A46%3A30.903816%2B00%3A00"
    );
    // Een nieuw token: een nieuw adres, niets onthouden.
    const h = hassUit({ states: { [ID]: { ...dump.toestand, attributes: { ...dump.toestand.attributes, entity_picture: "/api/image_proxy/image.gastnetwerk_qr_code?token=YYY" } } } });
    assert.match(qrAdres(h, ID), /token=YYY&v=/);
  });

  it("een nieuw beeld met hetzelfde token is OOK een nieuw adres", () => {
    // Home Assistant verandert entity_picture niet als het beeld verandert,
    // alleen de toestand (het tijdstip van het beeld). Een nieuw wachtwoord in
    // UniFi mag niet tot vijf minuten de oude code laten staan.
    const nieuw = hassUit({ states: { [ID]: { ...dump.toestand, state: "2026-10-16T13:00:00+00:00" } } });
    assert.notEqual(qrAdres(nieuw, ID), qrAdres(hassUit(), ID));
    assert.match(qrAdres(nieuw, ID), /token=XXX&v=2026-10-16T13%3A00/);
  });
});

describe("als er geen QR-code is", () => {
  it("zegt de kaart waarom", () => {
    assert.match(geenQrReden(hassUit(), ""), /Kies/);
    assert.match(geenQrReden(hassUit(), "image.weg"), /staat hij standaard uit/);
    const dood = hassUit({ states: { [ID]: { ...dump.toestand, state: "unavailable" } } });
    assert.equal(qrAdres(dood, ID), null);
    assert.match(geenQrReden(dood, ID), /niet bereikbaar/);
    const zonderBeeld = hassUit({ states: { [ID]: { ...dump.toestand, attributes: { friendly_name: "x" } } } });
    assert.match(geenQrReden(zonderBeeld, ID), /geen afbeelding/);
    assert.equal(geenQrReden(hassUit(), ID), null);
  });
});

describe("eersteWifiQr, voor een nieuwe kaart", () => {
  it("liefst een gastnetwerk", () => {
    const kantoor = "image.kantoor_qr_code";
    const h = hassUit({
      states: { [kantoor]: { entity_id: kantoor, state: "x", attributes: { entity_picture: "/k" } } },
      entities: { [kantoor]: { translation_key: "wlan_qr_code", device_id: "k" } },
      devices: { k: { id: "k", name: "Kantoor", model: "UniFi WLAN" } },
    });
    assert.equal(eersteWifiQr(h), ID);
  });

  it("geen wifi-QR: null", () => {
    assert.equal(eersteWifiQr({ states: {} }), null);
  });
});
