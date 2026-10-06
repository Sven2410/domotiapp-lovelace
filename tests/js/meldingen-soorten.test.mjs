/**
 * De meldingenkaart is algemeen: personen, en per soort een schakelaar.
 *
 * Gevraagd op 26 september 2026: *"Ik wil een algemeen meldingen scherm zoals je
 * nu hebt bij afvalmeldingen. (...) Nu staat daar alleen afval meldingen dan
 * maar in de toekomst moeten er meerdere dingen bij komen."*
 *
 * Pure logica, geen browser (CLAUDE.md). Met `import *`, zodat dit bestand ook
 * tegen de code van vóór deze ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as logica from "../../src/cards/meldingen-logica.js";

const fn = (naam) => {
  assert.equal(typeof logica[naam], "function", `${naam} bestaat niet`);
  return logica[naam];
};

describe("soortAan() — NIEUW GEDRAG", () => {
  it("de schakelaar beslist", () => {
    assert.equal(fn("soortAan")({ afval: true }, "afval"), true);
    assert.equal(fn("soortAan")({ afval: false }, "afval"), false);
    // Ook als er van vroeger nog `soort: afval` in staat: de schakelaar wint.
    assert.equal(fn("soortAan")({ afval: false, soort: "afval" }, "afval"), false);
  });

  it("een kaart van vóór de schakelaar blijft afval", () => {
    // Zo staat hij bij de eigenaar in zijn dashboard (0.48.0).
    assert.equal(fn("soortAan")({ soort: "afval" }, "afval"), true);
    assert.equal(fn("soortAan")({}, "afval"), true);
    assert.equal(fn("soortAan")({ soort: "wasmachine" }, "afval"), false);
  });

  it("soortenVan geeft de soorten die aan staan, met naam en icoon", () => {
    assert.deepEqual(
      fn("soortenVan")({ afval: true }).map((s) => [s.id, s.naam, s.icoon]),
      [["afval", "Afvalmeldingen", "bin"]]
    );
    assert.deepEqual(fn("soortenVan")({ afval: false }), []);
  });
});

describe("meldingId() per soort — NIEUW GEDRAG", () => {
  it("afval houdt het id dat het had — REGRESSIEWACHT", () => {
    // Onder dit id staat bij hem opgeslagen wie er aan en uit staat.
    assert.equal(logica.meldingId({ afval: true }, "afval"), "afval");
    assert.equal(logica.meldingId({ afval: true, id: "tweede-adres" }, "afval"), "tweede-adres");
  });

  it("een andere soort heeft zijn eigen id", () => {
    assert.equal(logica.meldingId({ id: "tweede-adres" }, "wasmachine"), "wasmachine");
  });
});

describe("krijgtIets() — NIEUW GEDRAG", () => {
  const standen = { afval: { aan: { "person.lieke": false } } };

  it("iemand die een soort aan heeft staan, krijgt iets", () => {
    assert.equal(fn("krijgtIets")(standen, ["afval"], "person.sven"), true);
  });

  it("iemand die alles uit heeft staan, krijgt niets", () => {
    assert.equal(fn("krijgtIets")(standen, ["afval"], "person.lieke"), false);
  });

  it("op een kaart zonder soorten krijgt niemand iets", () => {
    assert.equal(fn("krijgtIets")(standen, [], "person.sven"), false);
  });
});

describe("afvalRegel() — NIEUW GEDRAG", () => {
  const nu = new Date(2026, 8, 29, 12, 0);
  const config = { afval_morgen: "sensor.m", afval_vandaag: "sensor.v", tijd_morgen: "19:30:00", tijd_vandaag: "07:30:00" };
  const stand = { bekend: true, buiten: null };

  it("zegt wat er komt, zoals eerst de kop van de kaart", () => {
    assert.equal(fn("afvalRegel")({ config, stand, morgen: "GFT", vandaag: "geen", nu }), "Morgen GFT · melding om 19:30");
    assert.equal(fn("afvalRegel")({ config, stand, morgen: "geen", vandaag: "papier", nu }), "Vandaag Papier");
  });

  it("en anders WANNEER hij komt", () => {
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "geen", vandaag: "geen", nu }),
      "De avond ervoor om 19:30 en de ochtend zelf om 07:30"
    );
    assert.equal(
      fn("afvalRegel")({ config: { afval_morgen: "sensor.m" }, stand, morgen: "geen", nu }),
      "De avond ervoor om 19:30"
    );
  });

  it("zegt wie hem buiten zette", () => {
    const buiten = { ...stand, buiten: { datum: "2026-09-30", door: "person.sven" } };
    assert.equal(
      fn("afvalRegel")({ config, stand: buiten, morgen: "GFT", vandaag: "geen", door: "Sven", nu }),
      "Morgen GFT · staat buiten (Sven)"
    );
  });

  it("zegt wat er ontbreekt", () => {
    assert.equal(fn("afvalRegel")({ config: {}, stand, nu }), "Nog geen afvalsensor gekozen");
    assert.equal(
      fn("afvalRegel")({ config, stand: { bekend: false }, morgen: "GFT", nu }),
      "Actief zodra het dashboard is opgeslagen"
    );
  });
});

describe("afvalRegel() na 6 oktober 2026 — NIEUW GEDRAG", () => {
  // "ik heb de tijd even op 22:00 gezet maar ik krijg geen melding op me
  // teelefoon". De pop-up zei "melding om 22:00" terwijl er die avond niets
  // meer kon komen, en terwijl de server een andere tijd gebruikte.
  const nu = new Date(2026, 9, 6, 21, 30);
  const config = { afval_morgen: "sensor.m", afval_vandaag: "sensor.v", tijd_morgen: "22:00:00", tijd_vandaag: "07:30:00" };

  it("zegt dat de melding van vanavond al verstuurd is", () => {
    const stand = { bekend: true, buiten: null, verstuurd: { morgen: "2026-10-06" } };
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "Papier, Restafval", vandaag: "Geen", nu }),
      "Morgen Papier en Restafval · melding verstuurd"
    );
  });

  it("een verstuurde melding van gisteren telt niet (REGRESSIEWACHT)", () => {
    const stand = { bekend: true, buiten: null, verstuurd: { morgen: "2026-10-05" }, tijden: { morgen: "22:00" } };
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "Papier, Restafval", vandaag: "Geen", nu }),
      "Morgen Papier en Restafval · melding om 22:00"
    );
  });

  it("toont de tijd die de server gebruikt, niet die van deze kaart", () => {
    const stand = { bekend: true, buiten: null, verstuurd: {}, tijden: { morgen: "19:30", vandaag: "07:30" } };
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "Papier, Restafval", vandaag: "Geen", nu }),
      "Morgen Papier en Restafval · melding om 19:30"
    );
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "Geen", vandaag: "Geen", nu }),
      "De avond ervoor om 19:30 en de ochtend zelf om 07:30"
    );
  });

  it("zonder tijden van de server: die van de kaart (REGRESSIEWACHT)", () => {
    const stand = { bekend: true, buiten: null };
    assert.equal(
      fn("afvalRegel")({ config, stand, morgen: "GFT", vandaag: "Geen", nu }),
      "Morgen GFT · melding om 22:00"
    );
  });
});

describe("proefUitkomst() — NIEUW GEDRAG", () => {
  it("verstuurd: met de titel, en de vraag om te kijken", () => {
    assert.deepEqual(
      fn("proefUitkomst")({ verstuurd: ["person.sven"], zonder_telefoon: [], titel: "Proef · Morgen GFT" }, "Sven"),
      { tekst: "Verstuurd naar Sven: “Proef · Morgen GFT”. Kijk op de telefoon.", fout: false }
    );
  });

  it("geen telefoon", () => {
    assert.deepEqual(
      fn("proefUitkomst")({ verstuurd: [], zonder_telefoon: ["person.sven"], titel: "x" }, "Sven"),
      { tekst: "Niet verstuurd: geen werkende telefoon gevonden voor Sven.", fout: true }
    );
  });

  it("de reden van de server komt er letterlijk te staan", () => {
    assert.deepEqual(
      fn("proefUitkomst")({ reden: "Deze melding staat op geen enkel opgeslagen dashboard" }, "Sven"),
      { tekst: "Deze melding staat op geen enkel opgeslagen dashboard", fout: true }
    );
  });
});
