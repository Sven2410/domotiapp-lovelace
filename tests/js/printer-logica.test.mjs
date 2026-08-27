/**
 * Het rekenwerk van de 3D-printerkaart — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026 voor een Bambu Lab X1D met een AMS 2 Pro.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  alsDuur,
  draait,
  klaarOm,
  restMinuten,
  stand,
  temperatuur,
  tray,
  trayKleur,
  voortgangPct,
} from "../../src/cards/printer-logica.js";

const s = (state, attributes = {}) => ({ state, attributes });

describe("stand — NIEUW GEDRAG", () => {
  it("kent de woorden van Bambu", () => {
    assert.equal(stand(s("RUNNING")), "printing");
    assert.equal(stand(s("IDLE")), "idle");
    assert.equal(stand(s("FINISH")), "finished");
    assert.equal(stand(s("PAUSE")), "paused");
    assert.equal(stand(s("FAILED")), "failed");
    assert.equal(stand(s("PREPARE")), "prepare");
  });

  it("kent de korte vorm ook", () => {
    // Gemeten in de testinstance op 27 augustus 2026: een statushelper die "Run"
    // meldt kwam als "onbekend" op de kaart. Bambu zelf schrijft "RUNNING", maar
    // wie zijn eigen sjabloonsensor bouwt schrijft "Run".
    assert.equal(stand(s("Run")), "printing");
    assert.equal(draait(s("Run")), true);
  });

  it("kent die van Octoprint en Klipper ook", () => {
    assert.equal(stand(s("Printing")), "printing");
    assert.equal(stand(s("Operational")), "idle");
    assert.equal(stand(s("complete")), "finished");
    assert.equal(stand(s("standby")), "idle");
  });

  it("een wegvallende printer is offline en niet onbekend", () => {
    assert.equal(stand(s("unavailable")), "offline");
    assert.equal(stand(null), "unknown");
    assert.equal(stand(s("")), "unknown");
  });

  it("gokt niet bij een woord dat we niet kennen", () => {
    // De kaart toont dan het woord van de sensor zelf; een gok zou erger zijn.
    assert.equal(stand(s("bed_leveling")), "unknown");
  });
});

describe("draait — NIEUW GEDRAG", () => {
  it("printen en voorbereiden tellen allebei als bezig", () => {
    assert.equal(draait(s("RUNNING")), true);
    assert.equal(draait(s("PREPARE")), true);
  });

  it("klaar, gepauzeerd en stil tellen niet", () => {
    assert.equal(draait(s("FINISH")), false);
    assert.equal(draait(s("PAUSE")), false);
    assert.equal(draait(s("IDLE")), false);
    assert.equal(draait(null), false);
  });
});

describe("voortgangPct — NIEUW GEDRAG", () => {
  it("rondt af en blijft binnen 0 en 100", () => {
    assert.equal(voortgangPct(s("42.7")), 43);
    assert.equal(voortgangPct(s("-3")), 0);
    assert.equal(voortgangPct(s("140")), 100);
  });

  it("geeft null en niet 0 als er niets bekend is", () => {
    // Het verschil tussen een lege balk en geen balk.
    assert.equal(voortgangPct(s("unknown")), null);
    assert.equal(voortgangPct(null), null);
  });
});

describe("restMinuten — NIEUW GEDRAG", () => {
  const nu = Date.parse("2026-08-27T20:00:00Z");

  it("leest een aantal minuten", () => {
    assert.equal(restMinuten(s("135"), nu), 135);
  });

  it("rekent uren en seconden om naar minuten", () => {
    assert.equal(restMinuten(s("2", { unit_of_measurement: "h" }), nu), 120);
    assert.equal(restMinuten(s("900", { unit_of_measurement: "s" }), nu), 15);
  });

  it("leest een klok als 1:24:00", () => {
    assert.equal(restMinuten(s("1:24:00"), nu), 84);
    assert.equal(restMinuten(s("45:00"), nu), 45);
  });

  it("leest een EINDTIJD als het moment waarop hij klaar is", () => {
    // Zonder deze toets wordt een timestamp als een aantal minuten gelezen en
    // meldt de kaart dat het nog 2.941.204 minuten duurt.
    assert.equal(
      restMinuten(s("2026-08-27T22:15:00Z", { device_class: "timestamp" }), nu),
      135
    );
  });

  it("een eindtijd die al voorbij is wordt nul en niet negatief", () => {
    assert.equal(restMinuten(s("2026-08-27T19:00:00Z", { device_class: "timestamp" }), nu), 0);
  });

  it("geeft null bij niets", () => {
    assert.equal(restMinuten(s("unavailable"), nu), null);
    assert.equal(restMinuten(s(""), nu), null);
    assert.equal(restMinuten(null, nu), null);
  });
});

describe("alsDuur en klaarOm — NIEUW GEDRAG", () => {
  it("onder het uur in minuten, daarboven in uren", () => {
    assert.equal(alsDuur(45), "45 min");
    assert.equal(alsDuur(135), "2 u 15");
    assert.equal(alsDuur(60), "1 u 00");
  });

  it("zegt niets als er niets bekend is", () => {
    assert.equal(alsDuur(null), "");
    assert.equal(alsDuur(undefined), "");
  });

  it("telt de resterende tijd bij de klok op", () => {
    const nu = new Date(2026, 7, 27, 20, 5);
    assert.equal(klaarOm(135, nu), "22:20");
    assert.equal(klaarOm(60, nu), "21:05");
  });
});

describe("temperatuur — NIEUW GEDRAG", () => {
  it("rondt af en neemt de eenheid van de sensor over", () => {
    assert.deepEqual(temperatuur(s("219.4", { unit_of_measurement: "°C" })), {
      waarde: 219,
      eenheid: "°C",
    });
  });

  it("geeft null bij een sensor die niets meldt", () => {
    assert.equal(temperatuur(s("unknown")), null);
    assert.equal(temperatuur(null), null);
  });
});

describe("trayKleur — NIEUW GEDRAG", () => {
  it("haalt het alfakanaal van een Bambu-kleur af", () => {
    // DIT is waar het om gaat: `#FF6A13FF` is in CSS geen geldige achtergrond
    // in elke context, en de kaart toont dan een tray zonder kleur.
    assert.equal(trayKleur("FF6A13FF"), "#FF6A13");
    assert.equal(trayKleur("#ff6a13ff"), "#FF6A13");
  });

  it("neemt een gewone hexwaarde zoals hij is", () => {
    assert.equal(trayKleur("#FF6A13"), "#FF6A13");
    assert.equal(trayKleur("abc"), "#ABC");
  });

  it("een volledig doorzichtige kleur is GEEN kleur", () => {
    // Een lege tray meldt vaak juist `00000000`, en dat zou als zwart filament
    // op de kaart komen.
    assert.equal(trayKleur("00000000"), null);
  });

  it("laat een naam en een rgb() gewoon door", () => {
    assert.equal(trayKleur("red"), "red");
    assert.equal(trayKleur("rgb(12, 34, 56)"), "rgb(12, 34, 56)");
  });

  it("geeft null bij onzin", () => {
    assert.equal(trayKleur(""), null);
    assert.equal(trayKleur(null), null);
    assert.equal(trayKleur(42), null);
    assert.equal(trayKleur("#12345"), null);
  });
});

describe("tray — NIEUW GEDRAG", () => {
  it("haalt kleur en soort uit de attributen", () => {
    const t = tray(s("PLA", { color: "FF6A13FF", type: "PLA Basic", remain: 62 }));
    assert.deepEqual(t, { kleur: "#FF6A13", soort: "PLA Basic", leeg: false, rest: 62 });
  });

  it("kent de andere namen die integraties gebruiken", () => {
    assert.equal(tray(s("x", { filament_color: "#00A0FF" })).kleur, "#00A0FF");
    assert.equal(tray(s("x", { tray_color: "112233" })).kleur, "#112233");
    assert.equal(tray(s("x", { filament_type: "PETG" })).soort, "PETG");
  });

  it("leest de kleur ook als hij in de state zelf staat", () => {
    assert.equal(tray(s("#00FF88")).kleur, "#00FF88");
  });

  it("wat in de editor is ingevuld wint van de attributen", () => {
    // Wie zelf een kleur invult, doet dat omdat de entiteit het niet goed
    // meldt. Dan mag die entiteit hem niet overschrijven.
    const t = tray(s("PLA", { color: "FF0000FF" }), { color: "#00FF00", label: "Groen PLA" });
    assert.equal(t.kleur, "#00FF00");
    assert.equal(t.soort, "Groen PLA");
  });

  it("een lege tray is leeg en niet zwart", () => {
    assert.equal(tray(null).leeg, true);
    assert.equal(tray(s("", {})).leeg, true);
    assert.equal(tray(s("unknown", { color: "00000000" })).kleur, null);
  });

  it("laat een onzinnig restpercentage weg in plaats van het te tonen", () => {
    assert.equal(tray(s("PLA", { remain: -1 })).rest, null);
    assert.equal(tray(s("PLA", { remain: 250 })).rest, null);
    assert.equal(tray(s("PLA", { remain: 0 })).rest, 0);
  });
});
