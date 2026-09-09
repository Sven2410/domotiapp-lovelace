/**
 * Het rekenwerk van het infoscherm.
 *
 * NIEUW GEDRAG: `src/cards/infoscherm-logica.js` bestond niet vóór deze ronde
 * (9 september 2026).
 *
 * Wat hier bewaakt wordt is wat op een wachtkamerscherm stil misgaat: een
 * scherm dat om 17:00 nog "open" zegt, een mededeling die na zijn einddatum
 * blijft hangen, een lampenpagina die verschijnt terwijl de receptie hem
 * uitzette, en een datum die door de UTC-verschuiving een dag opschuift.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  actieveMededelingen,
  dagSleutel,
  datumKort,
  datumLang,
  formatteerTijdvakken,
  geldigNu,
  geslotenRegel,
  groepeerOpFunctie,
  heeftOpeningstijden,
  initialen,
  isoDatum,
  klok,
  nieuwsLijst,
  omDeBeurt,
  openingVandaag,
  openingsRegels,
  paginas,
  relatieveTijd,
  verlichtingZichtbaar,
  volgendeOpening,
} from "../../src/cards/infoscherm-logica.js";

// Woensdag 9 september 2026, 10:42 lokale tijd.
const NU = new Date(2026, 8, 9, 10, 42);

const PRAKTIJK = {
  openingstijden: {
    ma: [["08:00", "17:00"]],
    di: [["08:00", "17:00"]],
    wo: [["08:00", "12:30"], ["13:30", "20:00"]],
    do: [["08:00", "17:00"]],
    vr: [["08:00", "12:30"]],
    za: [],
    zo: [],
  },
  uitzonderingen: [{ datum: "2026-09-16", tijden: [], reden: "Studiedag" }],
};

describe("klok en datum", () => {
  it("dagSleutel telt vanaf maandag, niet vanaf zondag", () => {
    assert.equal(dagSleutel(new Date(2026, 8, 7)), "ma");
    assert.equal(dagSleutel(new Date(2026, 8, 13)), "zo");
  });

  it("isoDatum is de LOKALE datum, ook vlak na middernacht", () => {
    assert.equal(isoDatum(new Date(2026, 8, 9, 0, 30)), "2026-09-09");
  });

  it("klok en datumLang", () => {
    assert.equal(klok(NU), "10:42");
    assert.equal(klok(new Date(2026, 8, 9, 8, 5)), "08:05");
    assert.equal(datumLang(NU), "woensdag 9 september");
    assert.equal(datumKort("2026-09-20"), "20 september");
  });
});

describe("geldig nu", () => {
  it("van en tot zijn inclusief, en ontbreken is open", () => {
    assert.equal(geldigNu({ van: "2026-09-09", tot: "2026-09-09" }, "2026-09-09"), true);
    assert.equal(geldigNu({ tot: "2026-09-08" }, "2026-09-09"), false);
    assert.equal(geldigNu({ van: "2026-09-10" }, "2026-09-09"), false);
    assert.equal(geldigNu({}, "2026-09-09"), true);
  });

  it("actieveMededelingen laat verlopen en lege weg", () => {
    const uit = actieveMededelingen(
      [{ tekst: "Blijft" }, { tekst: "Verlopen", tot: "2026-09-01" }, { tekst: "" }],
      "2026-09-09"
    );
    assert.deepEqual(uit.map((m) => m.tekst), ["Blijft"]);
  });
});

describe("nieuws", () => {
  it("eigen nieuws eerst, vastgezet bovenaan, daarna de feeds nieuwste eerst", () => {
    const eigen = [
      { titel: "Oud eigen", gemaakt: "2026-09-01T10:00:00Z" },
      { titel: "Vast", gemaakt: "2026-08-01T10:00:00Z", vast: true },
      { titel: "Nieuw eigen", gemaakt: "2026-09-08T10:00:00Z" },
      { titel: "Verlopen", tot: "2026-09-01" },
    ];
    const feeds = [
      { titel: "NOS oud", datum: "2026-09-09T06:00:00Z" },
      { titel: "NOS nieuw", datum: "2026-09-09T08:00:00Z" },
    ];
    const uit = nieuwsLijst(eigen, feeds, "2026-09-09");
    assert.deepEqual(
      uit.map((n) => n.titel),
      ["Vast", "Nieuw eigen", "Oud eigen", "NOS nieuw", "NOS oud"]
    );
    assert.equal(uit[0].eigen, true);
    assert.equal(uit[3].eigen, false);
  });
});

describe("openingstijden", () => {
  it("formatteerTijdvakken", () => {
    assert.equal(formatteerTijdvakken([["08:00", "12:30"], ["13:30", "17:00"]]), "08:00 – 12:30, 13:30 – 17:00");
    assert.equal(formatteerTijdvakken([]), "gesloten");
    assert.equal(formatteerTijdvakken(undefined), "gesloten");
  });

  it("open om 10:42 op woensdag, dicht in de pauze, en de sluittijd telt niet meer", () => {
    assert.deepEqual(openingVandaag(PRAKTIJK, NU), {
      open: true, tot: "12:30", straks: "13:30", tijden: PRAKTIJK.openingstijden.wo, reden: "",
    });
    const pauze = openingVandaag(PRAKTIJK, new Date(2026, 8, 9, 13, 0));
    assert.equal(pauze.open, false);
    assert.equal(pauze.straks, "13:30");
    assert.equal(openingVandaag(PRAKTIJK, new Date(2026, 8, 9, 20, 0)).open, false);
  });

  it("een uitzondering wint van de weekdag", () => {
    const studiedag = openingVandaag(PRAKTIJK, new Date(2026, 8, 16, 10, 0));
    assert.equal(studiedag.open, false);
    assert.equal(studiedag.reden, "Studiedag");
  });

  it("volgendeOpening: vandaag na de pauze, morgen, of de eerstvolgende werkdag", () => {
    assert.deepEqual(volgendeOpening(PRAKTIJK, new Date(2026, 8, 9, 13, 0)), { dag: "vandaag", tijd: "13:30" });
    assert.deepEqual(volgendeOpening(PRAKTIJK, new Date(2026, 8, 9, 21, 0)), { dag: "morgen", tijd: "08:00" });
    // Vrijdagmiddag: het weekend is dicht, dus maandag.
    assert.deepEqual(volgendeOpening(PRAKTIJK, new Date(2026, 8, 11, 14, 0)), { dag: "maandag", tijd: "08:00" });
    // Dinsdagavond 15 september: woensdag is een studiedag, dus donderdag.
    assert.deepEqual(volgendeOpening(PRAKTIJK, new Date(2026, 8, 15, 21, 0)), { dag: "donderdag", tijd: "08:00" });
    assert.equal(volgendeOpening({ openingstijden: {} }, NU), null);
  });

  it("geslotenRegel", () => {
    assert.equal(geslotenRegel(PRAKTIJK, new Date(2026, 8, 9, 21, 0)), "Gesloten · morgen open om 08:00");
    assert.equal(geslotenRegel(PRAKTIJK, new Date(2026, 8, 16, 10, 0)), "Gesloten · Studiedag · morgen open om 08:00");
    assert.equal(geslotenRegel({ openingstijden: {} }, NU), "Gesloten");
  });

  it("openingsRegels: zeven regels, maandag eerst, vandaag gemarkeerd met de uitzondering", () => {
    const regels = openingsRegels(PRAKTIJK, new Date(2026, 8, 16, 10, 0));
    assert.equal(regels.length, 7);
    assert.equal(regels[0].naam, "maandag");
    const wo = regels[2];
    assert.equal(wo.vandaag, true);
    assert.equal(wo.tekst, "gesloten");
    assert.equal(wo.reden, "Studiedag");
    assert.equal(regels[5].tekst, "gesloten");
    assert.equal(heeftOpeningstijden(PRAKTIJK), true);
    assert.equal(heeftOpeningstijden({ openingstijden: { ma: [] } }), false);
  });
});

describe("pagina's", () => {
  const stand = { personen: [{ naam: "A" }], instellingen: { verlichting_tonen: true } };

  it("standaard: welkom, aanwezig, nieuws; verlichting alleen met lampen", () => {
    assert.deepEqual(paginas({}, stand), ["welkom", "aanwezig", "nieuws"]);
    assert.deepEqual(paginas({ lights: ["light.a"] }, stand), ["welkom", "aanwezig", "nieuws", "verlichting"]);
  });

  it("zonder personen geen aanwezigpagina, en de schakelaars in de config werken", () => {
    assert.deepEqual(paginas({ show_nieuws: false }, { personen: [] }), ["welkom"]);
    assert.deepEqual(paginas({ show_aanwezig: false, calendars: ["calendar.x"] }, stand), ["welkom", "nieuws", "agenda"]);
  });

  it("verlichting: beheer beslist, tenzij de installateur altijd of nooit koos", () => {
    const uit = { personen: [], instellingen: { verlichting_tonen: false } };
    assert.equal(verlichtingZichtbaar({ lights: ["light.a"] }, uit), false);
    assert.equal(verlichtingZichtbaar({ lights: ["light.a"], verlichting: "altijd" }, uit), true);
    assert.equal(verlichtingZichtbaar({ lights: ["light.a"], verlichting: "nooit" }, stand), false);
    assert.equal(verlichtingZichtbaar({ lights: [] , verlichting: "altijd" }, stand), false);
  });
});

describe("personen", () => {
  it("initialen zoals de server ze maakt", () => {
    assert.equal(initialen("Marieke de Vries"), "MV");
    assert.equal(initialen("Sanne"), "SA");
    assert.equal(initialen("anouk van den berg"), "AB");
    assert.equal(initialen(""), "?");
  });

  it("groepeerOpFunctie houdt de volgorde van eerste voorkomen", () => {
    const g = groepeerOpFunctie([
      { naam: "A", functie: "Tandarts" }, { naam: "B", functie: "Assistent" }, { naam: "C", functie: "Tandarts" }, { naam: "D" },
    ]);
    assert.deepEqual(g.map((x) => [x.functie, x.personen.length]), [["Tandarts", 2], ["Assistent", 1], ["", 1]]);
  });
});

describe("kleine helpers", () => {
  it("relatieveTijd", () => {
    assert.equal(relatieveTijd(new Date(2026, 8, 9, 10, 41, 40).toISOString(), NU), "zojuist");
    assert.equal(relatieveTijd(new Date(2026, 8, 9, 10, 30).toISOString(), NU), "12 min geleden");
    assert.equal(relatieveTijd(new Date(2026, 8, 9, 8, 0).toISOString(), NU), "vandaag 08:00");
    assert.equal(relatieveTijd(new Date(2026, 8, 8, 18, 0).toISOString(), NU), "gisteren 18:00");
    assert.equal(relatieveTijd(new Date(2026, 8, 1, 18, 0).toISOString(), NU), "1 sep");
    assert.equal(relatieveTijd("kapot", NU), "");
    assert.equal(relatieveTijd(null, NU), "");
  });

  it("omDeBeurt", () => {
    assert.equal(omDeBeurt(["a", "b", "c"], 4), "b");
    assert.equal(omDeBeurt(["a"], 99), "a");
    assert.equal(omDeBeurt([], 0), "");
  });
});
