/**
 * Het rekenwerk van de terugkaart.
 *
 * NIEUW GEDRAG (17 september 2026). `src/cards/terug-logica.js` bestond niet
 * vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * ## Waarom deze twee functies een test verdienen
 *
 * Allebei falen ze STIL. Een uitlijning die als lege string terugkomt levert
 * `justify-content: ` op -- een ongeldige verklaring die de browser zonder een
 * woord negeert, waarna de knop terugvalt op de flex-standaard die toevallig
 * ook links is. Het ziet er dus goed uit, tot iemand de standaard verandert.
 *
 * En een tooltip die leeg blijft is op een knop zonder tekst het verschil
 * tussen "Terug" en niets: een pijltje zonder bijschrift zegt een schermlezer
 * niks, en er staat geen fout tegenover.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { terugTitel, uitlijning, uitlijningen } from "../../src/cards/terug-logica.js";

describe("uitlijning", () => {
  it("vertaalt de drie keuzes naar flex-waarden", () => {
    assert.equal(uitlijning("links"), "flex-start");
    assert.equal(uitlijning("midden"), "center");
    assert.equal(uitlijning("rechts"), "flex-end");
  });

  it("geeft ALTIJD een geldige waarde terug", () => {
    // Niet "" en niet undefined: dat is een verklaring die de browser stil
    // weggooit. Zie de kop van dit bestand.
    for (const rommel of [undefined, null, "", "center", "onzin", 0]) {
      assert.equal(uitlijning(rommel), "flex-start", `viel om op ${JSON.stringify(rommel)}`);
    }
  });
});

describe("uitlijningen", () => {
  it("geeft de keuzes in de volgorde waarin ze op het scherm staan", () => {
    assert.deepEqual(uitlijningen(), ["links", "midden", "rechts"]);
  });

  it("levert alleen keuzes op die de kaart ook echt kan", () => {
    // De editor bouwt zijn keuzelijst hieruit. Zou er een waarde in staan die
    // `uitlijning` niet kent, dan kies je iets dat stil op links terugvalt.
    for (const keuze of uitlijningen()) {
      assert.notEqual(
        uitlijning(keuze),
        undefined,
        `${keuze} staat in de keuzelijst maar is geen echte uitlijning`,
      );
    }
    assert.equal(uitlijning(uitlijningen()[1]), "center", "de keuzes zijn niet allemaal links");
  });

  it("heeft geen lege waarde", () => {
    // Valkuil 55: een keuze met waarde "" is in ha-form niet te kiezen, want
    // `DacEditor.patch_` haalt lege waarden uit de config.
    assert.ok(uitlijningen().every((v) => v !== ""));
  });
});

describe("terugTitel", () => {
  it("neemt de eigen tekst als die er is", () => {
    assert.equal(terugTitel({ label: "Naar huis", path: "/dashboard/thuis" }), "Naar huis");
  });

  it("noemt het pad als er geen tekst staat", () => {
    assert.equal(terugTitel({ path: "/dashboard/thuis" }), "Naar /dashboard/thuis");
  });

  it("zegt Terug als er niets is ingevuld", () => {
    assert.equal(terugTitel({}), "Terug");
    assert.equal(terugTitel(null), "Terug");
    assert.equal(terugTitel(undefined), "Terug");
  });

  it("telt witruimte niet als een ingevulde waarde", () => {
    // Een spatie in het tekstveld laten staan is makkelijk gedaan, en een
    // tooltip van één spatie is hetzelfde als geen tooltip.
    assert.equal(terugTitel({ label: "   " }), "Terug");
    assert.equal(terugTitel({ label: "  ", path: " /a " }), "Naar /a");
  });

  it("is nooit leeg", () => {
    for (const c of [{}, { label: "" }, { path: "" }, { label: " ", path: " " }]) {
      assert.ok(terugTitel(c).length > 0, `leeg op ${JSON.stringify(c)}`);
    }
  });
});
