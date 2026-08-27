/**
 * Inzoomen en schuiven op een camerabeeld — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026. Wat hier vastligt is het klemmen: schuif je
 * verder dan de rand, dan kijk je naar de achtergrond in plaats van naar de
 * camera — en dat ziet eruit als een camera die het niet doet.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  MAX_ZOOM,
  MIN_ZOOM,
  alsTransform,
  klemPositie,
  klemZoom,
  maxSchuif,
  zoomRondom,
} from "../../src/cards/zoom-logica.js";

describe("klemZoom — NIEUW GEDRAG", () => {
  it("blijft tussen 1x en het maximum", () => {
    assert.equal(klemZoom(0.2), MIN_ZOOM);
    assert.equal(klemZoom(99), MAX_ZOOM);
    assert.equal(klemZoom(2.5), 2.5);
  });

  it("valt terug op 1x bij onzin", () => {
    assert.equal(klemZoom("veel"), MIN_ZOOM);
    assert.equal(klemZoom(undefined), MIN_ZOOM);
  });
});

describe("maxSchuif — NIEUW GEDRAG", () => {
  it("op 1x valt er niets te schuiven", () => {
    assert.equal(maxSchuif(1), 0);
  });

  it("op 2x is dat een kwart van het beeld per kant", () => {
    assert.equal(maxSchuif(2), 0.25);
  });

  it("op 4x drie achtste", () => {
    assert.equal(maxSchuif(4), 0.375);
  });
});

describe("klemPositie — NIEUW GEDRAG", () => {
  it("houdt de uitsnede binnen het beeld", () => {
    assert.deepEqual(klemPositie(5, -5, 2), { x: 0.25, y: -0.25 });
  });

  it("dwingt op 1x alles terug naar het midden", () => {
    // Zonder dit blijft een verschoven beeld hangen zodra je uitzoomt, en kijk
    // je naar een zwarte rand.
    assert.deepEqual(klemPositie(0.3, 0.3, 1), { x: 0, y: 0 });
  });

  it("laat wat binnen de grens valt met rust", () => {
    assert.deepEqual(klemPositie(0.1, -0.05, 3), { x: 0.1, y: -0.05 });
  });

  it("valt niet over onzin", () => {
    assert.deepEqual(klemPositie(undefined, NaN, 2), { x: 0, y: 0 });
  });
});

describe("zoomRondom — NIEUW GEDRAG", () => {
  it("zoomt in en houdt zich aan de grens", () => {
    assert.equal(zoomRondom({ zoom: 1, x: 0, y: 0 }, 1.5).zoom, 1.5);
    assert.equal(zoomRondom({ zoom: 5, x: 0, y: 0 }, 4).zoom, MAX_ZOOM);
    assert.equal(zoomRondom({ zoom: 1.2, x: 0, y: 0 }, 0.1).zoom, MIN_ZOOM);
  });

  it("uitzoomen naar 1x zet de uitsnede terug in het midden", () => {
    const uit = zoomRondom({ zoom: 3, x: 0.3, y: -0.3 }, 0.01);
    assert.deepEqual(uit, { zoom: 1, x: 0, y: 0 });
  });

  it("houdt het punt onder de vinger op zijn plek", () => {
    // Inzoomen op de rechterkant schuift de uitsnede naar rechts mee. Zonder
    // dit springt het beeld weg onder je vinger.
    const uit = zoomRondom({ zoom: 1, x: 0, y: 0 }, 2, { x: 0.4, y: 0 });
    assert.ok(uit.x > 0, `verwacht een verschuiving naar rechts, kreeg ${uit.x}`);
    assert.equal(uit.y, 0);
  });

  it("verschuift niets als er niets veranderd is", () => {
    const uit = zoomRondom({ zoom: MAX_ZOOM, x: 0.1, y: 0 }, 2, { x: 0.4, y: 0.4 });
    assert.deepEqual(uit, { zoom: MAX_ZOOM, x: 0.1, y: 0 });
  });
});

describe("alsTransform — NIEUW GEDRAG", () => {
  it("op 1x staat er geen verschuiving in", () => {
    assert.equal(alsTransform({ zoom: 1, x: 0, y: 0 }), "scale(1) translate(0.000%, 0.000%)");
  });

  it("schaalt eerst en verschuift daarna", () => {
    // De vololgorde doet ertoe: een verschuiving vóór de schaling zou vier keer
    // zo groot uitvallen op 4x.
    const tf = alsTransform({ zoom: 2, x: 0.25, y: 0 });
    assert.ok(tf.startsWith("scale(2) translate("), tf);
    assert.ok(tf.includes("-25.000%"), tf);
  });

  it("klemt ook hier, zodat een oude stand niet buiten beeld valt", () => {
    assert.equal(alsTransform({ zoom: 1, x: 0.4, y: 0.4 }), "scale(1) translate(0.000%, 0.000%)");
  });

  it("valt niet over een lege stand", () => {
    assert.equal(alsTransform(), "scale(1) translate(0.000%, 0.000%)");
  });
});
