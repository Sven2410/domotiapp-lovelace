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

/*
 * Ronde 4 (10 september 2026). NIEUW GEDRAG: blokSchaal, pasLijst en de
 * energiehelpers bestonden niet vóór deze ronde.
 */
import {
  blokSchaal,
  energiePunten,
  energieReeks,
  energieSamenvatting,
  formatEnergie,
  isTellerstand,
  lijnPad,
  pasLijst,
} from "../../src/cards/infoscherm-logica.js";

describe("de maat van een blok (ronde 4)", () => {
  it("blokSchaal: 2×2 is 1, breder en hoger is groter, smaller en lager kleiner", () => {
    assert.equal(blokSchaal("weer", 2, 2), 1);
    assert.ok(blokSchaal("weer", 3, 3) > 1);
    assert.ok(blokSchaal("weer", 1, 1) < 1);
    assert.ok(blokSchaal("weer", 6, 6) > blokSchaal("weer", 3, 3));
    // Een welkomblok van 6×1 wordt niet reusachtig.
    assert.ok(blokSchaal("welkom", 6, 1) < 1.15);
  });

  it("blokSchaal: een lijstblok volgt alleen zijn breedte", () => {
    assert.equal(blokSchaal("nieuws", 2, 5), blokSchaal("nieuws", 2, 1));
    assert.ok(blokSchaal("nieuws", 4, 2) > blokSchaal("nieuws", 2, 2));
    assert.equal(blokSchaal("aanwezig", 2, 3), 1);
  });

  it("blokSchaal verdraagt onzin", () => {
    assert.equal(blokSchaal("weer", 0, 99), blokSchaal("weer", 1, 6));
    assert.equal(blokSchaal("weer", undefined, null), blokSchaal("weer", 1, 1));
  });

  it("pasLijst: de schermafdruk van het nieuws -- zes passen, er blijft bijna een rij over, dus zeven iets kleiner", () => {
    // Zes rijen van 92 met 8 ertussen is 592; er was 640 beschikbaar.
    const uit = pasLijst({ beschikbaar: 640, hoogte: 92, gap: 8, aantal: 10 });
    assert.equal(uit.rijen, 7);
    assert.equal(uit.tonen, 7);
    assert.ok(uit.pas < 1 && uit.pas > 0.85, `pas ${uit.pas}`);
    // En ze passen dan ook echt.
    assert.ok(7 * 92 * uit.pas + 6 * 8 <= 640 + 0.5);
  });

  it("pasLijst: past alles, dan niets kleiner en alles tonen", () => {
    assert.deepEqual(pasLijst({ beschikbaar: 640, hoogte: 92, gap: 8, aantal: 3 }), { rijen: 3, tonen: 3, pas: 1 });
  });

  it("pasLijst: een klein restje levert geen extra rij op", () => {
    const uit = pasLijst({ beschikbaar: 600, hoogte: 92, gap: 8, aantal: 10 });
    assert.equal(uit.rijen, 6);
    assert.equal(uit.pas, 1);
  });

  it("pasLijst: met twee kolommen tellen de rijen, niet de tegels", () => {
    const uit = pasLijst({ beschikbaar: 200, hoogte: 64, gap: 10, aantal: 7, kolommen: 2 });
    assert.equal(uit.rijen, 3);
    assert.equal(uit.tonen, 6);
  });

  it("pasLijst: past er niet één rij, dan toch één, kleiner", () => {
    const uit = pasLijst({ beschikbaar: 50, hoogte: 92, gap: 8, aantal: 4 });
    assert.equal(uit.rijen, 1);
    assert.equal(uit.tonen, 1);
    assert.ok(uit.pas >= 0.5 && uit.pas < 1);
  });

  it("pasLijst: niets te tonen of niets gemeten", () => {
    assert.deepEqual(pasLijst({ beschikbaar: 0, hoogte: 92, aantal: 4 }), { rijen: 0, tonen: 0, pas: 1 });
    assert.deepEqual(pasLijst({ beschikbaar: 400, hoogte: 0, aantal: 4 }), { rijen: 0, tonen: 0, pas: 1 });
    assert.deepEqual(pasLijst({ beschikbaar: 400, hoogte: 92, aantal: 0 }), { rijen: 0, tonen: 0, pas: 1 });
  });
});

describe("energie (ronde 4)", () => {
  const UUR = 3600000;
  const nu = new Date(2026, 8, 10, 12, 0).getTime();

  it("isTellerstand: kWh en total_increasing zijn een teller, W niet", () => {
    assert.equal(isTellerstand({ unit_of_measurement: "kWh" }), true);
    assert.equal(isTellerstand({ unit_of_measurement: "W", state_class: "total_increasing" }), true);
    assert.equal(isTellerstand({ unit_of_measurement: "W", state_class: "measurement" }), false);
    assert.equal(isTellerstand({}), false);
  });

  it("energiePunten leest beide vormen van de recorder en laat onzin weg", () => {
    const p = energiePunten([
      { state: "unavailable", last_updated: "2026-09-10T08:00:00+00:00" },
      { s: "120", lu: 1789000000 },
      { state: "100.5", last_updated: "2026-09-10T09:00:00+00:00" },
      { s: "kapot", lu: 1789000100 },
    ]);
    assert.equal(p.length, 2);
    assert.ok(p[0].t <= p[1].t);
    assert.deepEqual(p.map((x) => x.v).sort(), [100.5, 120]);
  });

  it("energieReeks (vermogen): het venster, met een punt vooraf en een punt op nu", () => {
    const punten = [
      { t: nu - 30 * UUR, v: 50 },
      { t: nu - 3 * UUR, v: 100 },
      { t: nu - 1 * UUR, v: 300 },
    ];
    const r = energieReeks(punten, { nu });
    assert.equal(r.perUur, false);
    assert.equal(r.van, nu - 24 * UUR);
    assert.equal(r.tot, nu);
    // Het punt van 30 uur geleden staat op de linkerrand, en de lijn loopt door tot nu.
    assert.deepEqual(r.punten[0], { t: nu - 24 * UUR, v: 50 });
    assert.deepEqual(r.punten[r.punten.length - 1], { t: nu, v: 300 });
    assert.equal(r.punten.length, 4);
  });

  it("energieReeks (teller): verbruik per uur, en een reset telt als nul", () => {
    const punten = [
      { t: nu - 25 * UUR, v: 1000 },
      { t: nu - 23.5 * UUR, v: 1001 },
      { t: nu - 22.5 * UUR, v: 1003 },
      { t: nu - 21.5 * UUR, v: 5 }, // gereset
      { t: nu - 20.5 * UUR, v: 6 },
    ];
    const r = energieReeks(punten, { nu, tellerstand: true });
    assert.equal(r.perUur, true);
    const v = Object.fromEntries(r.punten.map((p) => [(nu - p.t) / UUR, p.v]));
    assert.equal(v[24], 1);
    assert.equal(v[23], 2);
    assert.equal(v[22], 0);
    assert.equal(v[21], 1);
    assert.ok(r.punten.every((p) => p.t >= r.van));
  });

  it("energieSamenvatting: nu, gemiddeld, piek; totaal alleen per uur", () => {
    const s = energieSamenvatting({ punten: [{ t: 1, v: 100 }, { t: 2, v: 300 }], perUur: false });
    assert.deepEqual(s, { nu: 300, gemiddeld: 200, piek: 300, totaal: null });
    assert.equal(energieSamenvatting({ punten: [{ t: 1, v: 1 }, { t: 2, v: 2 }], perUur: true }).totaal, 3);
    assert.deepEqual(energieSamenvatting({ punten: [] }), { nu: null, gemiddeld: null, piek: null, totaal: null });
  });

  it("lijnPad: nul onderaan, piek op 5% van boven, en het vlak sluit op de nullijn", () => {
    const r = { punten: [{ t: 0, v: 0 }, { t: 50, v: 100 }, { t: 100, v: 50 }], van: 0, tot: 100, perUur: false };
    const p = lijnPad(r, { w: 1000, h: 400 });
    assert.equal(p.lijn, "M0.0,400.0 L500.0,20.0 L1000.0,210.0");
    assert.ok(p.vlak.endsWith("L1000.0,400.0 L0.0,400.0 Z"));
    assert.equal(p.min, 0);
    assert.equal(lijnPad({ punten: [{ t: 0, v: 1 }], van: 0, tot: 1 }).lijn, "");
  });

  it("lijnPad: teruglevering (negatief) legt de nullijn boven de bodem", () => {
    const r = { punten: [{ t: 0, v: -100 }, { t: 100, v: 100 }], van: 0, tot: 100 };
    const p = lijnPad(r, { w: 100, h: 100 });
    assert.equal(p.min, -100);
    assert.match(p.vlak, /L100\.0,5[0-9]\.\d L0\.0,5[0-9]\.\d Z$/);
  });

  it("formatEnergie: watt wordt kilowatt vanaf 1000, met Nederlandse komma", () => {
    assert.equal(formatEnergie(350, "W"), "350 W");
    assert.equal(formatEnergie(1234, "W"), "1,23 kW");
    assert.equal(formatEnergie(12345, "W"), "12,3 kW");
    assert.equal(formatEnergie(0.456, "kWh"), "0,46 kWh");
    assert.equal(formatEnergie(null, "W"), "--");
    assert.equal(formatEnergie("x", "W"), "--");
  });

  it("paginas en blokOntbreekt kennen energie", () => {
    assert.ok(paginas({ personen: [], installatie: { energie: "sensor.x" } }, []).includes("energie"));
    assert.ok(!paginas({ personen: [], installatie: {} }, []).includes("energie"));
    assert.match(blokOntbreekt("energie", { installatie: {} }, [], "2026-09-10"), /energiesensor/);
    assert.equal(blokOntbreekt("energie", { installatie: { energie: "sensor.x" } }, [], "2026-09-10"), null);
  });
});
