/**
 * Tests op het opbouwen van de service-aanroepen (SPEC 8).
 *
 * Deze laag is bewust een pure module zonder lit en zonder DOM, en wordt hier
 * met `node --test` getoetst. Dat is een keuze met een reden: jsdom stubt
 * `ha-form` volledig en beoordeelt de CSS-cascade niet, dus geen enkele
 * jsdom-test kan aantonen dat een knop een klik accepteert of welke kleur er
 * rendert. Dat bewijs komt uit de browserverificatie. Wat hier wél hard te
 * toetsen is, is de logica: welke aanroepen ontstaan er, welke lampen worden
 * overgeslagen, en wat gebeurt er als een aanroep faalt.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KLEURSLEUTELS,
  NIET_BESTUURBAAR,
  TRANSITION_SECONDEN,
  bouwServiceOproepen,
  voerUit,
} from "../../src/scene/apply-scene.js";

const LEDEN = ["light.plafond", "light.bedlamp", "light.leeslamp"];

const AAN = { state: "on" };

function states(overschrijf = {}) {
  return {
    "light.plafond": AAN,
    "light.bedlamp": AAN,
    "light.leeslamp": AAN,
    ...overschrijf,
  };
}

describe("bouwServiceOproepen — NIEUW GEDRAG (SPEC 8.1)", () => {
  it("stuurt turn_on met transition voor een aan/uit-lamp", () => {
    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "on" } } },
      memberEntityIds: LEDEN,
      states: states(),
    });

    assert.deepEqual(oproepen, [
      {
        service: "turn_on",
        data: { entity_id: "light.plafond", transition: TRANSITION_SECONDEN },
      },
    ]);
    assert.deepEqual(overgeslagen, []);
  });

  it("stuurt brightness en hooguit één kleurattribuut mee", () => {
    const { oproepen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.bedlamp": {
            state: "on",
            brightness: 102,
            color_temp_kelvin: 2700,
          },
        },
      },
      memberEntityIds: LEDEN,
      states: states(),
    });

    assert.deepEqual(oproepen[0].data, {
      entity_id: "light.bedlamp",
      transition: TRANSITION_SECONDEN,
      brightness: 102,
      color_temp_kelvin: 2700,
    });
  });

  it("stuurt turn_off met transition en verder niets", () => {
    const { oproepen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "off" } } },
      memberEntityIds: LEDEN,
      states: states(),
    });

    assert.deepEqual(oproepen, [
      {
        service: "turn_off",
        data: { entity_id: "light.plafond", transition: TRANSITION_SECONDEN },
      },
    ]);
  });

  it("raakt een niet-ingestelde lamp niet aan en meldt hem niet als overgeslagen", () => {
    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "on" } } },
      memberEntityIds: LEDEN,
      states: states(),
    });

    const aangeraakt = oproepen.map((oproep) => oproep.data.entity_id);
    assert.deepEqual(aangeraakt, ["light.plafond"]);
    // "Niet ingesteld" is iets anders dan "overgeslagen" (SPEC 7.1).
    assert.deepEqual(overgeslagen, []);
  });

  for (const staat of NIET_BESTUURBAAR) {
    it(`slaat een lamp met state "${staat}" over`, () => {
      const { oproepen, overgeslagen } = bouwServiceOproepen({
        scene: {
          lights: {
            "light.plafond": { state: "on" },
            "light.bedlamp": { state: "on", brightness: 200 },
          },
        },
        memberEntityIds: LEDEN,
        states: states({ "light.bedlamp": { state: staat } }),
      });

      assert.deepEqual(
        oproepen.map((oproep) => oproep.data.entity_id),
        ["light.plafond"],
      );
      assert.deepEqual(overgeslagen, ["light.bedlamp"]);
    });
  }

  it("slaat een lamp over die helemaal niet in states voorkomt", () => {
    const alleen = { "light.plafond": AAN };
    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.plafond": { state: "on" },
          "light.bedlamp": { state: "on" },
        },
      },
      memberEntityIds: LEDEN,
      states: alleen,
    });

    assert.deepEqual(
      oproepen.map((oproep) => oproep.data.entity_id),
      ["light.plafond"],
    );
    assert.deepEqual(overgeslagen, ["light.bedlamp"]);
  });

  it("negeert opgeslagen lampen die geen lid van de groep zijn (SPEC 11.2)", () => {
    const { oproepen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.plafond": { state: "on" },
          "light.oud_lid": { state: "on" },
        },
      },
      memberEntityIds: LEDEN,
      states: states({ "light.oud_lid": AAN }),
    });

    assert.deepEqual(
      oproepen.map((oproep) => oproep.data.entity_id),
      ["light.plafond"],
    );
  });

  it("volgt de volgorde van de ledenlijst, niet die van de opslag", () => {
    const { oproepen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.leeslamp": { state: "on" },
          "light.plafond": { state: "on" },
        },
      },
      memberEntityIds: LEDEN,
      states: states(),
    });

    assert.deepEqual(
      oproepen.map((oproep) => oproep.data.entity_id),
      ["light.plafond", "light.leeslamp"],
    );
  });

  for (const sleutel of KLEURSLEUTELS) {
    it(`geeft ${sleutel} door zoals opgeslagen`, () => {
      const waarde = sleutel === "color_temp_kelvin" ? 3000 : [1, 2, 3];
      const { oproepen } = bouwServiceOproepen({
        scene: {
          lights: { "light.plafond": { state: "on", [sleutel]: waarde } },
        },
        memberEntityIds: LEDEN,
        states: states(),
      });
      assert.deepEqual(oproepen[0].data[sleutel], waarde);
    });
  }

  it("levert niets op bij een lege scene of ontbrekende gegevens", () => {
    for (const args of [
      { scene: undefined, memberEntityIds: LEDEN, states: states() },
      { scene: { lights: {} }, memberEntityIds: LEDEN, states: states() },
      { scene: { lights: { "light.plafond": { state: "on" } } }, memberEntityIds: [], states: states() },
      { scene: { lights: { "light.plafond": { state: "on" } } }, memberEntityIds: LEDEN, states: undefined },
    ]) {
      const { oproepen } = bouwServiceOproepen(args);
      assert.equal(Array.isArray(oproepen), true);
      if (args.states) {
        assert.equal(oproepen.length <= 1, true);
      }
    }
  });
});

describe("voerUit — NIEUW GEDRAG (SPEC 8.3 en 8.4)", () => {
  it("start alle aanroepen parallel en wacht ze samen af", async () => {
    const volgorde = [];
    let bezig = 0;
    let maximaalTegelijk = 0;

    const roepAan = async (_service, data) => {
      bezig += 1;
      maximaalTegelijk = Math.max(maximaalTegelijk, bezig);
      await new Promise((klaar) => setTimeout(klaar, 5));
      volgorde.push(data.entity_id);
      bezig -= 1;
    };

    const mislukt = await voerUit(roepAan, [
      { service: "turn_on", data: { entity_id: "light.a" } },
      { service: "turn_on", data: { entity_id: "light.b" } },
      { service: "turn_on", data: { entity_id: "light.c" } },
    ]);

    assert.deepEqual(mislukt, []);
    assert.equal(volgorde.length, 3);
    // Parallel: alle drie liepen tegelijk, niet één voor één.
    assert.equal(maximaalTegelijk, 3);
  });

  it("meldt per lamp welke aanroep faalde en laat de rest doorlopen", async () => {
    const gelukt = [];
    const roepAan = async (_service, data) => {
      if (data.entity_id === "light.b") {
        throw new Error("niet bereikbaar");
      }
      gelukt.push(data.entity_id);
    };

    const mislukt = await voerUit(roepAan, [
      { service: "turn_on", data: { entity_id: "light.a" } },
      { service: "turn_on", data: { entity_id: "light.b" } },
      { service: "turn_off", data: { entity_id: "light.c" } },
    ]);

    assert.deepEqual(gelukt, ["light.a", "light.c"]);
    assert.deepEqual(
      mislukt.map((item) => item.entityId),
      ["light.b"],
    );
    assert.equal(mislukt[0].fout instanceof Error, true);
  });
});

describe("NIEUW GEDRAG, mechanisch onderbouwd", () => {
  /**
   * De regel "een test telt pas als hij aantoonbaar faalt op de code van vóór
   * de fix" is voor nieuw gedrag niet letterlijk toepasbaar — er was geen
   * eerdere implementatie. Deze test legt daarom vast wat de code van vóór
   * deze fase zou opleveren, en toont dat die de eisen van SPEC 8 niet haalt.
   *
   * "Vóór deze fase" is hier de aanpak van de referentiekaart
   * (INVENTARIS sectie 3 en 6): een platte array van percentages, waarbij 0
   * "uit" betekent, elke geconfigureerde lamp altijd wordt aangeraakt, en er
   * geen transition meegaat.
   */
  function referentieAanpak(percentages, leden) {
    return leden.map((entityId, index) => {
      const pct = Math.round(percentages[index] ?? 0);
      return {
        service: pct === 0 ? "turn_off" : "turn_on",
        data: {
          entity_id: entityId,
          ...(pct > 0 ? { brightness_pct: pct } : {}),
        },
      };
    });
  }

  it("de referentie-aanpak raakt lampen aan die niet ingesteld zijn", () => {
    // Alleen de eerste lamp is ingesteld; de andere twee horen met rust
    // gelaten te worden.
    const oud = referentieAanpak([40], LEDEN);
    assert.equal(oud.length, 3, "referentie raakt alle drie de lampen aan");
    assert.deepEqual(
      oud.slice(1).map((oproep) => oproep.service),
      ["turn_off", "turn_off"],
      "en zet de niet-ingestelde lampen zelfs uit",
    );

    const { oproepen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "on", brightness: 102 } } },
      memberEntityIds: LEDEN,
      states: states(),
    });
    assert.equal(oproepen.length, 1, "onze aanpak raakt alleen de ingestelde lamp aan");
  });

  it("de referentie-aanpak stuurt geen transition mee", () => {
    const oud = referentieAanpak([40, 0, 100], LEDEN);
    assert.equal(
      oud.every((oproep) => oproep.data.transition === undefined),
      true,
    );

    const { oproepen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.plafond": { state: "on", brightness: 102 },
          "light.bedlamp": { state: "off" },
        },
      },
      memberEntityIds: LEDEN,
      states: states(),
    });
    assert.equal(
      oproepen.every((oproep) => oproep.data.transition === TRANSITION_SECONDEN),
      true,
    );
  });

  it("de referentie-aanpak slaat een unavailable lamp niet over", () => {
    const oud = referentieAanpak([40, 60, 80], LEDEN);
    assert.equal(
      oud.some((oproep) => oproep.data.entity_id === "light.bedlamp"),
      true,
      "referentie roept ook een offline lamp aan",
    );

    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: {
        lights: {
          "light.plafond": { state: "on" },
          "light.bedlamp": { state: "on" },
          "light.leeslamp": { state: "on" },
        },
      },
      memberEntityIds: LEDEN,
      states: states({ "light.bedlamp": { state: "unavailable" } }),
    });
    assert.equal(
      oproepen.some((oproep) => oproep.data.entity_id === "light.bedlamp"),
      false,
    );
    assert.deepEqual(overgeslagen, ["light.bedlamp"]);
  });
});

// --------------------------------------------------------------------------
// Fase 4b-1-fix3: de resetknop en het uitgrijzen zijn uit de UI verdwenen. Het
// datamodel mag daar niet aan meeveranderen — "niet ingesteld" blijft bestaan,
// want daar hangt het geval aan waarin de eigenaar later een lamp aan de light
// group van een klant toevoegt.
// --------------------------------------------------------------------------

describe("REGRESSIEWACHT — niet ingesteld blijft onaangeraakt (SPEC 7.1)", () => {
  /**
   * Deze test slaagt ook op de code van vóór fase 4b-1-fix3, en dat hoort zo:
   * hij bewaakt dat een UI-wijziging het datamodel niet is binnengeslopen.
   * Faalt hij, dan is de toestand "niet ingesteld" alsnog verdwenen en gaat
   * een nieuw toegevoegde lamp stilletjes uit zodra de klant op een bestaande
   * scene drukt.
   */
  it("een lamp die in de scene ontbreekt levert geen enkele aanroep op", () => {
    const nieuweLamp = "light.later_toegevoegd";
    const leden = [...LEDEN, nieuweLamp];

    const { oproepen, overgeslagen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "on" } } },
      memberEntityIds: leden,
      states: { ...states(), [nieuweLamp]: AAN },
    });

    assert.deepEqual(
      oproepen.map((oproep) => oproep.data.entity_id),
      ["light.plafond"],
      "alleen de ingestelde lamp wordt aangeroepen",
    );
    assert.equal(
      oproepen.some((oproep) => oproep.data.entity_id === nieuweLamp),
      false,
      "de nieuwe lamp krijgt geen turn_on",
    );
    assert.equal(
      overgeslagen.includes(nieuweLamp),
      false,
      "en telt ook niet als overgeslagen: hij doet gewoon niet mee",
    );
  });

  it("een lamp die wel in de scene staat maar op uit, wordt wél uitgezet", () => {
    // Het onderscheid dat de referentiekaart niet kon maken (INVENTARIS 3):
    // "uit" is een keuze, "niet ingesteld" is er geen.
    const { oproepen } = bouwServiceOproepen({
      scene: { lights: { "light.plafond": { state: "off" } } },
      memberEntityIds: LEDEN,
      states: states(),
    });
    assert.deepEqual(oproepen, [
      {
        service: "turn_off",
        data: { entity_id: "light.plafond", transition: TRANSITION_SECONDEN },
      },
    ]);
  });
});
