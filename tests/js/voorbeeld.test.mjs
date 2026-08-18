/**
 * Tests op de levensloop van de snapshot (SPEC 9).
 *
 * Elke test is gelabeld als **NIEUW GEDRAG** of **REGRESSIEWACHT**. Alles op
 * `Snapshotbeheer` en `voerVoorbeeldUit` is NIEUW GEDRAG: vóór fase 4b-2
 * bestond `src/voorbeeld.js` niet. De regressiewachten staan onderaan; die
 * bewaken dat het voorbeeld precies dezelfde lampen aanraakt als het toepassen.
 *
 * Bewust geen jsdom: de vraag "hoe vaak wordt er een snapshot gemaakt en
 * hersteld" is pure volgordelogica, en die is hier scherper te toetsen dan in
 * een nagebootste browser.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bouwServiceOproepen } from "../../src/scene/apply-scene.js";
import {
  COMMANDO_CLOSE,
  COMMANDO_CREATE,
  Snapshotbeheer,
  voerVoorbeeldUit,
} from "../../src/scene/voorbeeld.js";

const ENTITY = "light.testlampen";

/** Een nagebootste `callWS` die onthoudt wat er gevraagd is. */
function nepCommando({ faalOp = null } = {}) {
  const aanroepen = [];
  const roep = async (type, data) => {
    aanroepen.push({ type, data });
    if (faalOp === type) {
      throw new Error(`${type} mislukt`);
    }
    return type === COMMANDO_CREATE
      ? { created: true }
      : { restored: true, deleted: true };
  };
  return { roep, aanroepen };
}

function beheerMet(opties) {
  const { roep, aanroepen } = nepCommando(opties);
  return {
    beheer: new Snapshotbeheer({ roepCommandoAan: roep, entityId: ENTITY }),
    aanroepen,
  };
}

const typen = (aanroepen) => aanroepen.map((a) => a.type);

// --------------------------------------------------------------------------

describe("Snapshotbeheer — NIEUW GEDRAG (SPEC 9.3)", () => {
  it("het eerste voorbeeld maakt een snapshot", async () => {
    const { beheer, aanroepen } = beheerMet();
    await beheer.zorgVoorSnapshot();

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE]);
    assert.deepEqual(aanroepen[0].data, { entity_id: ENTITY });
    assert.equal(beheer.heeftSnapshot, true);
  });

  it("het tweede voorbeeld maakt er geen tweede", async () => {
    const { beheer, aanroepen } = beheerMet();
    await beheer.zorgVoorSnapshot();
    await beheer.zorgVoorSnapshot();
    await beheer.zorgVoorSnapshot();

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE]);
  });

  it("twee voorbeelden tegelijk leveren ook één aanroep op", async () => {
    // Zonder het bewaren van de belofte zou dit er twee worden: de tweede
    // aanroep begint voordat de eerste klaar is.
    const { beheer, aanroepen } = beheerMet();
    await Promise.all([beheer.zorgVoorSnapshot(), beheer.zorgVoorSnapshot()]);

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE]);
  });

  it("laat een nieuwe poging toe als het aanmaken faalde", async () => {
    const aanroepen = [];
    let keer = 0;
    const roep = async (type, data) => {
      aanroepen.push({ type, data });
      keer += 1;
      if (keer === 1) {
        throw new Error("scene.create mislukt");
      }
      return { created: true };
    };
    const beheer = new Snapshotbeheer({ roepCommandoAan: roep, entityId: ENTITY });

    await assert.rejects(() => beheer.zorgVoorSnapshot());
    assert.equal(beheer.heeftSnapshot, false, "een mislukte poging telt niet");

    await beheer.zorgVoorSnapshot();
    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE, COMMANDO_CREATE]);
  });
});

describe("Snapshotbeheer — sluiten — NIEUW GEDRAG (SPEC 9.1 en 9.3)", () => {
  it("annuleren na een voorbeeld herstelt en verwijdert", async () => {
    const { beheer, aanroepen } = beheerMet();
    await beheer.zorgVoorSnapshot();
    const uit = await beheer.sluit();

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE, COMMANDO_CLOSE]);
    assert.deepEqual(aanroepen[1].data, { entity_id: ENTITY, restore: true });
    assert.deepEqual(uit, { gedaan: true });
  });

  it("opslaan verwijdert alleen, en herstelt niet", async () => {
    const { beheer, aanroepen } = beheerMet();
    await beheer.zorgVoorSnapshot();
    await beheer.sluit({ opslaan: true });

    assert.deepEqual(aanroepen[1].data, { entity_id: ENTITY, restore: false });
  });

  it("sluiten zonder ooit Voorbeeld te hebben gebruikt doet niets", async () => {
    const { beheer, aanroepen } = beheerMet();
    const uit = await beheer.sluit();

    assert.deepEqual(aanroepen, [], "geen enkel commando");
    assert.deepEqual(uit, { gedaan: false });
  });

  it("herstelt precies één keer bij twee sluit-events achter elkaar", async () => {
    // `ha-dialog` meldt het sluiten met een `closed`-event en zet zijn eigen
    // open-property niet terug; onze knop stuurt er zelf ook een. Beide paden
    // mogen samen hoogstens één herstel opleveren.
    const { beheer, aanroepen } = beheerMet();
    await beheer.zorgVoorSnapshot();

    await Promise.all([beheer.sluit(), beheer.sluit()]);
    await beheer.sluit();

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE, COMMANDO_CLOSE]);
  });

  it("sluit niet als het aanmaken van de snapshot faalde", async () => {
    const { beheer, aanroepen } = beheerMet({ faalOp: COMMANDO_CREATE });
    await assert.rejects(() => beheer.zorgVoorSnapshot());
    const uit = await beheer.sluit();

    assert.deepEqual(typen(aanroepen), [COMMANDO_CREATE], "geen close");
    assert.deepEqual(uit, { gedaan: false });
  });
});

describe("voerVoorbeeldUit — NIEUW GEDRAG (SPEC 9.1 en 18)", () => {
  const OPROEPEN = [
    { service: "turn_on", data: { entity_id: "light.a", transition: 1 } },
  ];

  it("maakt eerst de snapshot en zet daarna pas de lampen om", async () => {
    const volgorde = [];
    const beheer = new Snapshotbeheer({
      entityId: ENTITY,
      roepCommandoAan: async (type) => {
        volgorde.push(type);
        return {};
      },
    });

    await voerVoorbeeldUit({
      beheer,
      oproepen: OPROEPEN,
      voerUit: async () => {
        volgorde.push("lampen");
        return [];
      },
    });

    assert.deepEqual(volgorde, [COMMANDO_CREATE, "lampen"]);
  });

  it("zet géén enkele lamp om als de snapshot mislukt", async () => {
    // De kern van SPEC 18: liever niets doen dan een voorbeeld zonder weg terug.
    const { beheer } = beheerMet({ faalOp: COMMANDO_CREATE });
    let lampenAangeraakt = false;

    await assert.rejects(() =>
      voerVoorbeeldUit({
        beheer,
        oproepen: OPROEPEN,
        voerUit: async () => {
          lampenAangeraakt = true;
          return [];
        },
      }),
    );

    assert.equal(lampenAangeraakt, false);
  });

  it("geeft de mislukte lampen door aan de aanroeper", async () => {
    const { beheer } = beheerMet();
    const mislukt = await voerVoorbeeldUit({
      beheer,
      oproepen: OPROEPEN,
      voerUit: async () => [{ entityId: "light.a", fout: new Error("weg") }],
    });

    assert.deepEqual(
      mislukt.map((m) => m.entityId),
      ["light.a"],
    );
  });
});

// --------------------------------------------------------------------------
// Het voorbeeld gebruikt dezelfde functie als het toepassen. Deze twee tests
// slagen ook op de code van vóór fase 4b-2 — ze bewaken dat die functie blijft
// doen wat het voorbeeld ervan verwacht.
// --------------------------------------------------------------------------

describe("REGRESSIEWACHT — voorbeeld en toepassen delen bouwServiceOproepen", () => {
  const LEDEN = ["light.aan", "light.uit", "light.nietIngesteld", "light.weg"];
  const STATES = {
    "light.aan": { state: "off" },
    "light.uit": { state: "on" },
    "light.nietIngesteld": { state: "on" },
    "light.weg": { state: "unavailable" },
  };
  const CONCEPT = {
    lights: {
      "light.aan": { state: "on", brightness: 128 },
      "light.uit": { state: "off" },
      "light.weg": { state: "on", brightness: 10 },
    },
  };

  it("raakt een niet-ingestelde lamp niet aan (SPEC 7.1)", () => {
    const { oproepen } = bouwServiceOproepen({
      scene: CONCEPT,
      memberEntityIds: LEDEN,
      states: STATES,
    });

    assert.equal(
      oproepen.some((o) => o.data.entity_id === "light.nietIngesteld"),
      false,
    );
  });

  it("slaat unavailable over en gebruikt transition 1 (SPEC 8.1 en 8.2)", () => {
    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: CONCEPT,
      memberEntityIds: LEDEN,
      states: STATES,
    });

    assert.deepEqual(overgeslagen, ["light.weg"]);
    assert.deepEqual(oproepen, [
      {
        service: "turn_on",
        data: { entity_id: "light.aan", brightness: 128, transition: 1 },
      },
      { service: "turn_off", data: { entity_id: "light.uit", transition: 1 } },
    ]);
  });
});
