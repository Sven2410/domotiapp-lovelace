/**
 * De meldingenkaart: wat hij in de kop zegt, en wie er aan staat.
 *
 * NIEUW GEDRAG: `src/cards/meldingen-logica.js` bestond niet vóór deze ronde.
 *
 * De afvalnamen staan ook aan de serverkant (`meldingen/afval.py`, met
 * `tests/meldingen/test_afval.py`). Dezelfde gevallen staan hier, zodat de kaart
 * en de telefoon hetzelfde zeggen: wat de kaart "Morgen GFT" noemt, heet in de
 * melding ook zo.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  afvalSoorten,
  isoDag,
  kopRegel,
  meldingId,
  opsomming,
  personenUit,
  staatAan,
  tijdKort,
} from "../../src/cards/meldingen-logica.js";

/** Zaterdag 26 september 2026, 12:00, lokale tijd. */
const NU = new Date(2026, 8, 26, 12, 0);

describe("de soorten afval, gelijk aan afval.py", () => {
  it("schrijft bekende afkortingen met hoofdletters", () => {
    assert.deepEqual(afvalSoorten("gft"), ["GFT"]);
    assert.deepEqual(afvalSoorten("pmd"), ["PMD"]);
    assert.deepEqual(afvalSoorten("papier"), ["Papier"]);
    assert.deepEqual(afvalSoorten("restafval"), ["Restafval"]);
  });

  it("laat niets vallen wat niet in een vaste lijst stond", () => {
    // Zijn automatisering kende alleen papier, gft, pmd en restafval.
    assert.deepEqual(afvalSoorten("textiel"), ["Textiel"]);
    assert.deepEqual(afvalSoorten("gft, papier"), ["GFT", "Papier"]);
    assert.deepEqual(afvalSoorten("gft en pmd"), ["GFT", "PMD"]);
    assert.deepEqual(afvalSoorten("snoeihout"), ["Snoeihout"]);
    assert.deepEqual(afvalSoorten("Grof Huisvuil"), ["Grof Huisvuil"]);
  });

  it("ziet niets als niets", () => {
    for (const s of ["", null, undefined, "Geen", "geen", "none", "unknown", "unavailable", "-", "2026-09-27", "0"]) {
      assert.deepEqual(afvalSoorten(s), [], String(s));
    }
  });

  it("somt op zoals een mens", () => {
    assert.equal(opsomming(["GFT"]), "GFT");
    assert.equal(opsomming(["GFT", "Papier"]), "GFT en Papier");
    assert.equal(opsomming(["GFT", "PMD", "Papier"]), "GFT, PMD en Papier");
    assert.equal(opsomming([]), "");
  });
});

describe("de regel onder de titel", () => {
  it("zegt wat er morgen komt, en wanneer de melding gaat", () => {
    assert.equal(kopRegel({ morgen: "gft", tijdMorgen: "19:30:00", nu: NU }), "Morgen GFT · melding om 19:30");
  });

  it("gaat voor vandaag als er vandaag iets opgehaald wordt", () => {
    assert.equal(kopRegel({ vandaag: "pmd", morgen: "gft", nu: NU }), "Vandaag PMD");
  });

  it("zegt wie het al buiten zette, in plaats van de tijd van de melding", () => {
    const buiten = { datum: "2026-09-27" };
    assert.equal(kopRegel({ morgen: "gft", tijdMorgen: "19:30", buiten, door: "Sven", nu: NU }), "Morgen GFT · staat buiten (Sven)");
    assert.equal(kopRegel({ vandaag: "gft", buiten: { datum: "2026-09-26" }, nu: NU }), "Vandaag GFT · staat buiten");
  });

  it("negeert een 'staat buiten' van een andere dag", () => {
    const gisteren = { datum: "2026-09-19" };
    assert.equal(kopRegel({ morgen: "gft", tijdMorgen: "19:30", buiten: gisteren, nu: NU }), "Morgen GFT · melding om 19:30");
  });

  it("zwijgt als er niets komt", () => {
    // Een zin die zegt dat er niets is, maakt de kaart alleen hoger.
    assert.equal(kopRegel({ vandaag: "Geen", morgen: "geen", nu: NU }), "");
  });

  it("rekent de dag in lokale tijd, zoals de server", () => {
    assert.equal(isoDag(new Date(2026, 8, 26, 23, 59)), "2026-09-26");
    assert.equal(isoDag(new Date(2026, 11, 31, 0, 0)), "2026-12-31");
  });

  it("leest de tijd uit de tijdkiezer", () => {
    assert.equal(tijdKort("19:30:00"), "19:30");
    assert.equal(tijdKort("7:05"), "07:05");
    assert.equal(tijdKort("25:00"), "");
  });
});

describe("wie er aan staat", () => {
  it("staat aan tot hij is uitgezet, net als aan de serverkant", () => {
    assert.equal(staatAan(null, "person.sven"), true);
    assert.equal(staatAan({ aan: {} }, "person.sven"), true);
    assert.equal(staatAan({ aan: { "person.sven": false } }, "person.sven"), false);
  });

  it("neemt alleen personen, zonder dubbelen", () => {
    assert.deepEqual(personenUit({ personen: ["person.sven", "notify.x", "person.sven", 3, "person.lieke"] }), [
      "person.sven",
      "person.lieke",
    ]);
    assert.deepEqual(personenUit({ personen: "person.sven" }), ["person.sven"]);
    assert.deepEqual(personenUit({}), []);
  });

  it("kent de melding onder hetzelfde id als de server", () => {
    assert.equal(meldingId({}), "afval");
    assert.equal(meldingId({ soort: "afval" }), "afval");
    assert.equal(meldingId({ soort: "afval", id: "tweede-adres" }), "tweede-adres");
  });
});
