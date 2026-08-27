/**
 * Het rekenwerk van de fotokiezer — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026: *"ik kan geen foto uploaden voor de auto."* Dat
 * klopte: `{ image: {} }` in het schema laat Home Assistant een
 * `<ha-selector-image>` in de DOM zetten, maar die klasse wordt lui geladen en
 * komt in onze editor nooit — het veld bleef een leeg vak van nul pixels.
 *
 * Gemeten in de testinstance:
 *
 *     ha-selector-text / entity / boolean / select / number  -> gedefinieerd
 *     ha-selector-image                                      -> undefined, ook na 8s
 *
 * Wat hier getoetst wordt is het deel van onze eigen kiezer dat zonder browser
 * te toetsen is: welke bestanden erdoor mogen, en hoe de URL eruitziet. Het
 * element zelf staat in `src/editor/foto-picker.js` en hoort niet in een
 * Node-test (valkuil 27).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { MAX_BYTES, keurBestand, serveerUrl } from "../../src/editor/foto-logica.js";

const bestand = (type, mb = 1) => ({ type, size: mb * 1024 * 1024, name: "auto." + type.split("/")[1] });

describe("serveerUrl — NIEUW GEDRAG", () => {
  it("bouwt het pad waarop Home Assistant de afbeelding uitserveert", () => {
    // `/original` hoort erbij: zonder dat krijg je een verkleinde versie.
    assert.equal(serveerUrl("abc123"), "/api/image/serve/abc123/original");
  });
});

describe("keurBestand — NIEUW GEDRAG", () => {
  it("laat de gewone afbeeldingssoorten door", () => {
    for (const type of ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]) {
      assert.equal(keurBestand(bestand(type)), null, type);
    }
  });

  it("weigert wat geen afbeelding is, met een leesbare reden", () => {
    const klacht = keurBestand(bestand("application/pdf"));
    assert.ok(klacht && klacht.includes("afbeelding"), klacht);
  });

  it("weigert een foto die te groot is en zegt hoe groot hij was", () => {
    // Een foto rechtstreeks van een fototoestel haalt dit makkelijk.
    const klacht = keurBestand(bestand("image/jpeg", 20));
    assert.ok(klacht && klacht.includes("20 MB"), klacht);
    assert.equal(keurBestand(bestand("image/jpeg", MAX_BYTES / 1024 / 1024 - 1)), null);
  });

  it("zonder bestand is er niets te keuren", () => {
    assert.ok(keurBestand(null));
    assert.ok(keurBestand(undefined));
  });
});
