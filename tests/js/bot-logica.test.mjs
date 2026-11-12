/**
 * De botkaart: "Vraag het de DomotiTech Bot" (0.124.0). Alles NIEUW GEDRAG: op 0.123.0 bestaat `bot-logica.js` niet.
 *
 * De tickets hebben de vorm van contract 1 van de coach (`domotiapp_coach/tickets/*`), zoals afgesproken op
 * 12 november 2026. Zodra de coach ze uitbrengt, komt er een echte dump bij als vaste invoer.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const BRAM = "u-bram";
const ANNA = "u-anna";

const ticket = (id, extra = {}) => ({
  id,
  soort: "vraag",
  stand: "in_behandeling",
  onderwerp: "Hoe vol is mijn accu?",
  gemaakt: "2026-11-12T23:10:00+01:00",
  bijgewerkt: "2026-11-12T23:12:00+01:00",
  door: { user_id: BRAM, naam: "Bram" },
  berichten: [
    { id: 1, van: "klant", naam: "Bram", tekst: "Hoe vol is mijn accu?", at: "2026-11-12T23:10:00+01:00" },
    { id: 2, van: "domotitech", naam: "DomotiTech", tekst: "Hij staat op 64%.", at: "2026-11-12T23:12:00+01:00" },
  ],
  gelezen: { [BRAM]: 1 },
  ...extra,
});

describe("het abonnement", () => {
  it("begint met de hele lijst, nieuwste eerst", () => {
    const oud = ticket(1, { bijgewerkt: "2026-11-10T10:00:00+01:00" });
    const nieuw = ticket(2);
    assert.deepEqual(B.verwerk(null, { contract: 1, tickets: [oud, nieuw] }).map((x) => x.id), [2, 1]);
  });

  it("vervangt daarna één ticket, en een antwoord zet hem bovenaan", () => {
    const lijst = B.verwerk(null, { contract: 1, tickets: [ticket(1, { bijgewerkt: "2026-11-10T10:00:00+01:00" }), ticket(2)] });
    const bij = B.verwerk(lijst, { ticket: ticket(1, { bijgewerkt: "2026-11-13T09:00:00+01:00", stand: "klaar" }) });
    assert.deepEqual(bij.map((x) => [x.id, x.stand]), [[1, "klaar"], [2, "in_behandeling"]]);
  });

  it("zet een nieuw ticket erbij", () => {
    const bij = B.verwerk([ticket(1)], { ticket: ticket(2, { bijgewerkt: "2026-11-13T09:00:00+01:00" }) });
    assert.deepEqual(bij.map((x) => x.id), [2, 1]);
  });

  it("laat een bericht zonder ticket liggen", () => {
    assert.equal(B.verwerk([ticket(1)], {}), null);
    assert.equal(B.verwerk([ticket(1)], { ticket: {} }), null);
  });

  it("kent contract 1, en een hoger contract is geen fout", () => {
    assert.equal(B.kentContract({ contract: 1 }), true);
    assert.equal(B.kentContract({ contract: 2 }), true);
    assert.equal(B.kentContract({}), false);
  });
});

describe("gelezen", () => {
  it("telt de antwoorden van DomotiTech na het laatst gelezene, per gebruiker", () => {
    assert.equal(B.ongelezen(ticket(1), BRAM), 1);
    assert.equal(B.ongelezen(ticket(1, { gelezen: { [BRAM]: 2 } }), BRAM), 0);
    // Een huisgenoot die het ticket nooit opende.
    assert.equal(B.ongelezen(ticket(1), ANNA), 1);
  });

  it("telt een eigen bericht nooit als nieuw", () => {
    const t = ticket(1, { berichten: [ticket(1).berichten[0]], gelezen: {} });
    assert.equal(B.ongelezen(t, BRAM), 0);
  });

  it("vraagt alleen om read als er iets na het gelezene kwam", () => {
    assert.equal(B.moetLezen(ticket(1), BRAM), true);
    assert.equal(B.moetLezen(ticket(1, { gelezen: { [BRAM]: 2 } }), BRAM), false);
  });
});

describe("de regel op de kaart", () => {
  it("zegt het zonder coach, en met een coach die te oud is", () => {
    _reset();
    assert.equal(B.tegelRegel({ coach: false, tickets: null }), "Heeft DomotiApp Coach nodig");
    assert.equal(B.tegelRegel({ coach: true, teOud: true, tickets: null }), "Werk DomotiApp Coach bij");
  });

  it("noemt eerst de nieuwe antwoorden, dan wat er loopt, en anders niets", () => {
    _reset();
    assert.equal(B.tegelRegel({ coach: true, tickets: [ticket(1), ticket(2)], userId: BRAM }), "2 nieuwe antwoorden");
    const gelezen = { gelezen: { [BRAM]: 2 } };
    assert.equal(B.tegelRegel({ coach: true, tickets: [ticket(1, gelezen)], userId: BRAM }), "1 vraag loopt");
    assert.equal(B.tegelRegel({ coach: true, tickets: [ticket(1, { ...gelezen, stand: "klaar" })], userId: BRAM }), "");
    assert.equal(B.tegelRegel({ coach: true, tickets: null }), "");
  });

  it("spreekt Engels", () => {
    _reset({ instelling: "en" });
    assert.equal(B.tegelRegel({ coach: true, tickets: [ticket(1)], userId: BRAM }), "1 new answer");
    _reset();
  });
});

describe("de stand en de soort voor de klant", () => {
  it("heeft een woord voor elke stand, ook een die nog niet bestaat", () => {
    _reset();
    assert.equal(B.standNaam("nieuw"), "Ontvangen");
    assert.equal(B.standNaam("in_behandeling"), "In behandeling");
    assert.equal(B.standNaam("bij_beheerder"), "Ligt bij DomotiTech");
    assert.equal(B.standNaam("klaar"), "Afgerond");
    assert.equal(B.standNaam("iets_nieuws"), "In behandeling");
  });

  it("kent de drie soorten, en valt bij een onbekende terug op een vraag", () => {
    assert.deepEqual(B.SOORTEN.map((s) => s.id), ["vraag", "aanvraag", "storing"]);
    assert.equal(B.soortVan("storing").icoon, "warning");
    assert.equal(B.soortVan("iets").icoon, "question");
  });
});

describe("versturen", () => {
  it("weigert leeg en te lang, zoals de coach", () => {
    _reset();
    assert.equal(B.waaromNiet("   "), "Typ eerst wat je wilt vragen.");
    assert.equal(B.waaromNiet("x".repeat(4001)), "Dat is te lang: hoogstens 4000 tekens.");
    assert.equal(B.waaromNiet(" Hoe vol is mijn accu? "), null);
  });

  it("zegt een fout in een zin, met wat de coach zelf zegt", () => {
    _reset();
    assert.equal(B.foutTekst({ code: "rate_limited", message: "Te veel" }), "Versturen lukte niet: Te veel");
    assert.equal(B.foutTekst({ code: "unknown_command" }), "De coach kent de bot nog niet. Werk DomotiApp Coach bij.");
    assert.equal(B.foutTekst({}), "Versturen lukte niet.");
  });
});

describe("wanneer", () => {
  it("is vandaag een tijd, gisteren gisteren, en anders een datum", () => {
    _reset();
    const nu = new Date(2026, 10, 13, 10, 0);
    assert.equal(B.wanneer(new Date(2026, 10, 13, 9, 5).toISOString(), nu), "09:05");
    assert.equal(B.wanneer(new Date(2026, 10, 12, 23, 12).toISOString(), nu), "gisteren 23:12");
    assert.equal(B.wanneer(new Date(2026, 10, 2, 8, 0).toISOString(), nu), "2 nov");
    assert.equal(B.wanneer(new Date(2025, 10, 2, 8, 0).toISOString(), nu), "2 nov 2025");
    assert.equal(B.wanneer("niets", nu), "");
  });
});

describe("de coach", () => {
  it("staat er als zijn domein in de componenten staat", () => {
    assert.equal(B.heeftCoach({ config: { components: ["domotiapp_coach", "light"] } }), true);
    assert.equal(B.heeftCoach({ config: { components: ["light"] } }), false);
    assert.equal(B.heeftCoach(undefined), false);
  });
});
