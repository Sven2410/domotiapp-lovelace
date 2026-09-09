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
  aanwezigEerst,
  blokOntbreekt,
  dagKort,
  KOLOMMEN,
  overlapt,
  pastVrij,
  RIJEN,
  splitsAanwezig,
  standaardIndeling,
  vrijePlek,
  isoDatumTijd,
  komendeVerjaardagen,
  actieveMededelingen,
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

describe("nieuws (ronde 3: alleen nog van buiten)", () => {
  it("de feeds, nieuwste eerst, zonder titel valt weg", () => {
    const feeds = [
      { titel: "NOS oud", datum: "2026-09-09T06:00:00Z" },
      { titel: "", datum: "2026-09-09T09:00:00Z" },
      { titel: "NOS nieuw", datum: "2026-09-09T08:00:00Z" },
    ];
    const uit = nieuwsLijst(feeds);
    assert.deepEqual(uit.map((n) => n.titel), ["NOS nieuw", "NOS oud"]);
    assert.equal(uit[0].eigen, false);
  });
});

describe("mededelingen met een tijdstip (ronde 3, NIEUW GEDRAG)", () => {
  it("een grens met tijd telt op de minuut; een kale datum is de hele dag", () => {
    assert.equal(geldigNu({ van: "2026-09-10T15:00" }, "2026-09-10T14:59"), false);
    assert.equal(geldigNu({ van: "2026-09-10T15:00" }, "2026-09-10T15:00"), true);
    assert.equal(geldigNu({ tot: "2026-09-10T12:00" }, "2026-09-10T12:00"), true);
    assert.equal(geldigNu({ tot: "2026-09-10T12:00" }, "2026-09-10T12:01"), false);
    assert.equal(geldigNu({ tot: "2026-09-10" }, "2026-09-10T23:30"), true);
    assert.equal(geldigNu({ van: "2026-09-10" }, "2026-09-10T00:00"), true);
  });

  it("isoDatumTijd is lokaal en op de minuut", () => {
    assert.equal(isoDatumTijd(new Date(2026, 8, 10, 7, 5)), "2026-09-10T07:05");
  });

  it("actieveMededelingen met een datum met tijd als 'nu'", () => {
    const lijst = [
      { tekst: "Altijd" },
      { tekst: "Vanmiddag", van: "2026-09-10T12:00", tot: "2026-09-10T17:00" },
      { tekst: "Morgen", van: "2026-09-11" },
    ];
    assert.deepEqual(actieveMededelingen(lijst, "2026-09-10T11:00").map((m) => m.tekst), ["Altijd"]);
    assert.deepEqual(actieveMededelingen(lijst, "2026-09-10T13:00").map((m) => m.tekst), ["Altijd", "Vanmiddag"]);
  });
});

describe("verjaardagen (ronde 3, NIEUW GEDRAG)", () => {
  const nu = new Date(2026, 8, 10, 14, 30);
  it("vandaag eerst, dan op volgorde van hoe lang nog; de leeftijd is wat iemand WORDT", () => {
    const uit = komendeVerjaardagen(
      [
        { naam: "Volgend jaar", datum: "2000-09-09" },
        { naam: "Vandaag", datum: "1990-09-10" },
        { naam: "Morgen", datum: "1985-09-11" },
        { naam: "Zonder jaar", datum: "1800-10-01", jaar_tonen: false },
      ],
      nu
    );
    assert.deepEqual(
      uit.map((v) => [v.naam, v.dagen, v.wanneer, v.leeftijd]),
      [
        ["Vandaag", 0, "vandaag", 36],
        ["Morgen", 1, "morgen", 41],
        ["Zonder jaar", 21, "do 1 okt", null],
        ["Volgend jaar", 364, "do 9 sep", 27],
      ]
    );
  });

  it("zonder naam of datum telt niet mee; 29 februari valt in een gewoon jaar op 1 maart", () => {
    assert.deepEqual(komendeVerjaardagen([{ naam: "", datum: "2000-01-01" }, { naam: "X" }], nu), []);
    const [v] = komendeVerjaardagen([{ naam: "Schrikkel", datum: "1988-02-29" }], nu);
    assert.equal(v.wanneer, "ma 1 mrt");
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

describe("pagina's (sinds ronde 2 uit de opslag, niet uit een kaartconfig)", () => {
  const lampen = { verlichting: [{ entity: "light.a", naam: "A" }] };
  const stand = { personen: [{ naam: "A" }], instellingen: { verlichting_tonen: true }, installatie: {} };

  it("welkom altijd; aanwezig, nieuws, weer, verlichting, agenda en verjaardagen alleen met inhoud", () => {
    assert.deepEqual(paginas(stand, []), ["welkom", "aanwezig"]);
    assert.deepEqual(
      paginas({ ...stand, verjaardagen: [{ naam: "X", datum: "2000-01-01" }], installatie: { ...lampen, weer: "weather.x", agendas: ["calendar.x"] } }, [{ titel: "NOS" }]),
      ["welkom", "aanwezig", "nieuws", "weer", "verlichting", "agenda", "verjaardagen"]
    );
    assert.deepEqual(paginas({ personen: [] }, []), ["welkom"]);
    assert.deepEqual(paginas({ personen: [] }, [{ titel: "NOS" }]), ["welkom", "nieuws"]);
  });

  it("verlichting: lampen van de installateur én de schakelaar van de receptie", () => {
    assert.equal(verlichtingZichtbaar({ installatie: lampen, instellingen: { verlichting_tonen: false } }), false);
    assert.equal(verlichtingZichtbaar({ installatie: lampen, instellingen: { verlichting_tonen: true } }), true);
    assert.equal(verlichtingZichtbaar({ installatie: { verlichting: [] }, instellingen: {} }), false);
  });
});

describe("het raster van het welkomscherm", () => {
  it("de standaardindeling past in zes bij zes zonder overlap", () => {
    const { blokken } = standaardIndeling();
    assert.equal(KOLOMMEN, 6);
    assert.equal(RIJEN, 6);
    for (const b of blokken) assert.equal(pastVrij(blokken, b), true, b.soort);
  });

  it("overlapt en pastVrij", () => {
    const a = { id: "a", x: 0, y: 0, w: 2, h: 2 };
    assert.equal(overlapt(a, { x: 1, y: 1, w: 2, h: 2 }), true);
    assert.equal(overlapt(a, { x: 2, y: 0, w: 2, h: 2 }), false);
    assert.equal(pastVrij([a], { id: "b", x: 1, y: 0, w: 1, h: 1 }), false);
    assert.equal(pastVrij([a], { id: "a", x: 1, y: 0, w: 1, h: 1 }), true, "zichzelf telt niet mee");
    assert.equal(pastVrij([a], { id: "b", x: 5, y: 0, w: 2, h: 1 }), false, "buiten het raster");
  });

  it("vrijePlek zoekt van linksboven af, en geeft null als het vol is", () => {
    const { blokken } = standaardIndeling();
    // De standaardindeling vult alle 36 cellen: er past niets meer bij.
    assert.equal(vrijePlek(blokken, 1, 1), null);
    const zonderWelkom = blokken.filter((b) => b.soort !== "welkom");
    assert.deepEqual(vrijePlek(zonderWelkom, 2, 1), { x: 0, y: 0 });
    const vol = [{ id: "v", x: 0, y: 0, w: 6, h: 6 }];
    assert.equal(vrijePlek(vol, 1, 1), null);
    assert.deepEqual(vrijePlek([], 2, 2), { x: 0, y: 0 });
  });

  it("blokOntbreekt zegt waarom een blok niet op het scherm staat", () => {
    const stand = { personen: [], praktijk: { openingstijden: {} }, installatie: {}, instellingen: {} };
    assert.match(blokOntbreekt("weer", stand, [], "2026-09-10"), /weerentiteit/);
    assert.match(blokOntbreekt("aanwezig", stand, [], "2026-09-10"), /medewerkers/);
    assert.match(blokOntbreekt("verlichting", stand, [], "2026-09-10"), /lampen/);
    assert.equal(blokOntbreekt("welkom", stand, [], "2026-09-10"), null);
    assert.equal(blokOntbreekt("nieuws", stand, [], "2026-09-10"), null);
    const vol = {
      personen: [{ naam: "A" }],
      mededelingen: [{ tekst: "Hoi" }],
      praktijk: { openingstijden: { ma: [["08:00", "17:00"]] } },
      installatie: { weer: "weather.x", verlichting: [{ entity: "light.a" }], agendas: ["calendar.a"] },
      instellingen: { verlichting_tonen: false },
    };
    for (const soort of ["weer", "mededeling", "openingstijden", "aanwezig", "agenda"]) {
      assert.equal(blokOntbreekt(soort, vol, [], "2026-09-10"), null, soort);
    }
    assert.match(blokOntbreekt("verlichting", vol, [], "2026-09-10"), /uit in het beheer/);
  });
});

describe("personen", () => {
  it("initialen: eerste letter van het eerste en van het laatste woord", () => {
    assert.equal(initialen("Marieke de Vries"), "MV");
    assert.equal(initialen("Sanne"), "SA");
    assert.equal(initialen("anouk van den berg"), "AB");
    // NIEUW GEDRAG (10 september 2026): een tussenvoegsel in kleine letters
    // telde niet mee, en dan werd "Pieter van der berg" ten onrechte "PI".
    assert.equal(initialen("Pieter van der berg"), "PB");
    assert.equal(initialen("Tessa de groot"), "TG");
    assert.equal(initialen(""), "?");
  });

  it("aanwezig en afwezig uit elkaar, elk in de volgorde van het beheer", () => {
    const lijst = [
      { naam: "A", aanwezig: false }, { naam: "B", aanwezig: true }, { naam: "C", aanwezig: false }, { naam: "D", aanwezig: true },
    ];
    const { aanwezig, afwezig } = splitsAanwezig(lijst);
    assert.deepEqual(aanwezig.map((p) => p.naam), ["B", "D"]);
    assert.deepEqual(afwezig.map((p) => p.naam), ["A", "C"]);
    assert.deepEqual(aanwezigEerst(lijst).map((p) => p.naam), ["B", "D", "A", "C"]);
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

  it("dagKort: vandaag, morgen, dan de dagnaam", () => {
    assert.equal(dagKort(new Date(2026, 8, 9), NU), "vandaag");
    assert.equal(dagKort(new Date(2026, 8, 10), NU), "morgen");
    assert.equal(dagKort(new Date(2026, 8, 11), NU), "vrijdag");
  });

  it("omDeBeurt", () => {
    assert.equal(omDeBeurt(["a", "b", "c"], 4), "b");
    assert.equal(omDeBeurt(["a"], 99), "a");
    assert.equal(omDeBeurt([], 0), "");
  });
});
