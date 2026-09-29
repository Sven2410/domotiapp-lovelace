/**
 * Een kaart die anders uitvalt dan hij opgaf, laat Home Assistant opnieuw
 * vragen — NIEUW GEDRAG.
 *
 * Gemeld op 29 september 2026 met een schermafdruk uit een pop-up: een
 * tv-kaart met een volumeregel en een bronknop, en de separator "Lampen" er
 * dwars overheen. Nagespeeld in de testinstance: Home Assistant vroeg
 * `getGridOptions()` op vóórdat de kaart gemeten had, kreeg de schatting (2),
 * klemde `grid_options: {rows: 1}` daarop tot een vak van 120px, en de kaart
 * tekende 184px. De gemeten 3 stond klaar, maar er werd niet meer naar gevraagd.
 *
 * Geen jsdom (CLAUDE.md). Het vak is nagemaakt met precies wat `meetRaster`
 * leest: de hoogtes van de kinderen, de opmaak van het vak, en de host van zijn
 * shadow root. Dat de gebeurtenis in Home Assistant ook echt tot een groter vak
 * leidt, is in een echte browser gemeten; zie het rapport.
 *
 * Met `import *` en niet met losse namen: dan laadt dit bestand ook tegen de
 * code van vóór de fix, en faalt het daar op wat er gebeurt en niet op een
 * ontbrekende naam.
 */
import { strict as assert } from "node:assert";
import { after, before, describe, it } from "node:test";

import * as raster from "../../src/rasterhoogte.js";

/** De opmaak van `.card` in de mediakaart: 7px tussen de regels, 7px marge. */
const OPMAAK = {
  rowGap: "7px",
  paddingTop: "7px",
  paddingBottom: "7px",
  borderTopWidth: "0px",
  borderBottomWidth: "0px",
};

let echteOpmaak;
before(() => {
  echteOpmaak = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => OPMAAK;
});
after(() => {
  globalThis.getComputedStyle = echteOpmaak;
});

/**
 * Een nagemaakt `.card`-vak met regels van deze hoogtes erin, in de shadow
 * root van een kaart die bijhoudt welke gebeurtenissen hij afvuurt.
 */
function nepVak(regels) {
  const stijl = new Map();
  const gebeurtenissen = [];
  const vak = {
    regels,
    get children() {
      return this.regels.map((h) => ({ getBoundingClientRect: () => ({ height: h }) }));
    },
    style: {
      getPropertyValue: (naam) => stijl.get(naam) ?? "",
      setProperty: (naam, waarde) => stijl.set(naam, waarde),
    },
    getRootNode: () => ({ host: { dispatchEvent: (e) => gebeurtenissen.push(e) } }),
  };
  return { vak, gebeurtenissen };
}

/** De drie regels van de tv-kaart: speler, volume met bron, shuffle. */
const DRIE_REGELS = [40, 30, 30]; // 14 + 100 + 14 = 128px -> 184
const EEN_REGEL = [40]; // 54px -> 56

describe("meetRaster laat Home Assistant opnieuw vragen — NIEUW GEDRAG", () => {
  it("vuurt card-updated als Home Assistant een schatting kreeg die niet klopt", () => {
    const { vak, gebeurtenissen } = nepVak(DRIE_REGELS);

    // Home Assistant vraagt vóór de eerste meting en hoort de schatting.
    raster.opgegevenRijen?.(vak, 2);

    raster.meetRaster(vak);
    assert.equal(vak.style.getPropertyValue("--dac-raster"), "184px");
    assert.equal(gebeurtenissen.length, 1, "één seintje: de kaart is 3 rijen, HA hoorde 2");
    assert.equal(gebeurtenissen[0].type, "card-updated");
    // Opborrelen is geen detail: de luisteraar van Home Assistant zit op de
    // `hui-card` BOVEN de kaart, niet op de kaart zelf.
    assert.equal(gebeurtenissen[0].bubbles, true);
    assert.equal(gebeurtenissen[0].composed, true);
  });

  it("zwijgt zodra Home Assistant het goede getal heeft", () => {
    const { vak, gebeurtenissen } = nepVak(DRIE_REGELS);
    raster.opgegevenRijen?.(vak, 2);
    raster.meetRaster(vak);
    assert.equal(gebeurtenissen.length, 1);
    // Home Assistant vraagt opnieuw en hoort nu de meting.
    assert.equal(raster.opgegevenRijen?.(vak, 2), 3);

    // Dezelfde inhoud nog eens meten -- dat gebeurt bij elke paint() -- levert
    // niets meer op. Anders tekent de sectie zichzelf eindeloos opnieuw.
    raster.meetRaster(vak);
    raster.meetRaster(vak);
    assert.equal(gebeurtenissen.length, 1);
  });

  it("meldt het ook als de kaart KRIMPT", () => {
    // De tv gaat uit: van drie regels naar één. Met `rows: 1` in de config
    // bleef het vak anders op 184px staan, met 128px leegte eronder.
    const { vak, gebeurtenissen } = nepVak(DRIE_REGELS);
    raster.opgegevenRijen?.(vak, 3);
    raster.meetRaster(vak);
    assert.equal(gebeurtenissen.length, 0, "HA hoorde al 3");

    vak.regels = EEN_REGEL;
    raster.meetRaster(vak);
    assert.equal(vak.style.getPropertyValue("--dac-raster"), "56px");
    assert.equal(gebeurtenissen.length, 1);
  });

  it("laat een kaart waar Home Assistant nooit naar vroeg met rust — REGRESSIEWACHT", () => {
    // Een masonry-view of een stapel: daar wordt `getGridOptions()` niet
    // opgevraagd en klemt niemand iets. Een seintje zou daar de kolommen laten
    // herverdelen, en een camerabeeld dat verhuist begint opnieuw.
    const { vak, gebeurtenissen } = nepVak(EEN_REGEL);
    raster.meetRaster(vak);
    vak.regels = DRIE_REGELS;
    raster.meetRaster(vak);
    assert.equal(vak.style.getPropertyValue("--dac-raster"), "184px");
    assert.equal(gebeurtenissen.length, 0);
  });
});
