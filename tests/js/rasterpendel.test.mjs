/**
 * De rasterhoogte die niet mag pendelen — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026: *"in mijn 3D-printerpopup shaked de 3D-printerkaart
 * de hele tijd, dat lijkt me niet goed."*
 *
 * De lus: een kaart die net te hoog is voor zijn pop-up krijgt een scrollbar,
 * die neemt breedte weg, en het camerabeeld met zijn `aspect-ratio` wordt
 * daardoor lager. Dan past hij weer, gaat de scrollbar weg, en begint het
 * opnieuw. Wat het zichtbaar maakt is het raster zelf: één pixel rond een grens
 * wordt hier een sprong van 64 — de kaart springt een hele rasterrij op en neer.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { stabielDoel } from "../../src/rasterhoogte.js";

/** Een nep-vak; `stabielDoel` gebruikt het alleen als sleutel in een WeakMap. */
const vak = () => ({});

describe("stabielDoel — NIEUW GEDRAG", () => {
  it("laat een rustige meting gewoon door", () => {
    const v = vak();
    for (let n = 0; n < 8; n++) assert.equal(stabielDoel(v, 248), 248);
  });

  it("laat een kaart die groeit gewoon groeien", () => {
    const v = vak();
    assert.equal(stabielDoel(v, 120), 120);
    assert.equal(stabielDoel(v, 184), 184);
    assert.equal(stabielDoel(v, 248), 248);
    assert.equal(stabielDoel(v, 312), 312);
  });

  it("zet een pendel vast op de GROOTSTE van de twee", () => {
    // Dit is de shake: 248 en 312 om en om.
    const v = vak();
    assert.equal(stabielDoel(v, 248), 248);
    assert.equal(stabielDoel(v, 312), 312);
    assert.equal(stabielDoel(v, 248), 248);
    // Vanaf hier is het een pendel en staat hij vast.
    assert.equal(stabielDoel(v, 312), 312);
    assert.equal(stabielDoel(v, 248), 312, "moet vastgezet zijn op de grootste");
    assert.equal(stabielDoel(v, 312), 312);
    assert.equal(stabielDoel(v, 248), 312);
  });

  it("kiest de grootste en niet de kleinste, want te klein is erger", () => {
    // Een kaart die te klein staat schildert over zijn buurman heen (valkuil
    // 12); een rasterrij te hoog kost hoogstens wat lege ruimte.
    const v = vak();
    for (const w of [184, 120, 184, 120, 184]) stabielDoel(v, w);
    assert.equal(stabielDoel(v, 120), 184);
  });

  it("laat los zodra de inhoud écht iets anders wordt", () => {
    const v = vak();
    for (const w of [248, 312, 248, 312]) stabielDoel(v, w);
    assert.equal(stabielDoel(v, 248), 312, "eerst vast");
    // Een derde waarde: de kaart is echt veranderd, dus de vergrendeling eraf.
    assert.equal(stabielDoel(v, 56), 56);
    assert.equal(stabielDoel(v, 56), 56);
  });

  it("twee kaarten houden hun eigen geschiedenis", () => {
    const a = vak();
    const b = vak();
    for (const w of [248, 312, 248, 312]) stabielDoel(a, w);
    assert.equal(stabielDoel(a, 248), 312);
    // b heeft niets meegemaakt en moet gewoon zijn eigen waarde krijgen.
    assert.equal(stabielDoel(b, 248), 248);
  });

  it("herkent een pendel MET herhalingen ertussen", () => {
    // Dit is de reeks zoals hij in een echte browser gemeten is: `meetRaster`
    // draait een paar keer met dezelfde uitkomst voordat hij omslaat. Een
    // detectie die eist dat elke meting van de vorige verschilt, ziet deze
    // pendel niet -- en dat was precies de eerste versie, die niets deed.
    const v = vak();
    for (const w of [568, 568, 504, 504, 568, 568, 504]) stabielDoel(v, w);
    assert.equal(stabielDoel(v, 504), 568, "moet vastgezet zijn op de grootste");
    assert.equal(stabielDoel(v, 568), 568);
  });

  it("twee keer omslaan is nog geen pendel", () => {
    // Een kaart die groeit en daarna één keer terugvalt is geen shake.
    const v = vak();
    assert.equal(stabielDoel(v, 184), 184);
    assert.equal(stabielDoel(v, 248), 248);
    assert.equal(stabielDoel(v, 184), 184);
  });
});
