/**
 * De botkaart: "Vraag het de DomotiTech Bot" (0.124.0). Alles NIEUW GEDRAG: op 0.123.0 bestaat `bot-logica.js` niet.
 *
 * Het gesprek en de tickets hebben de vorm van contract 1 van de coach (`domotiapp_coach/tickets/*`), met de wijziging
 * van 13 november 2026: één gesprek per huis met `id` 0 voor de vragen, tickets alleen voor storing en aanvraag, en
 * foto's. Wat coach v0.220.0 echt stuurt, staat in `bot-dump-0220.test.mjs`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const BRAM = "u-bram";
const ANNA = "u-anna";

const ticket = (id, extra = {}) => ({
  id,
  soort: "storing",
  stand: "in_behandeling",
  onderwerp: "De lamp in de gang doet het niet",
  gemaakt: "2026-11-12T23:10:00+01:00",
  bijgewerkt: "2026-11-12T23:12:00+01:00",
  door: { user_id: BRAM, naam: "Bram" },
  berichten: [
    { id: 1, van: "klant", naam: "Bram", tekst: "De lamp in de gang doet het niet", at: "2026-11-12T23:10:00+01:00" },
    { id: 2, van: "domotitech", naam: "DomotiTech", tekst: "Zit er een nieuwe lamp in?", at: "2026-11-12T23:12:00+01:00" },
  ],
  gelezen: { [BRAM]: 1 },
  ...extra,
});

const gesprek = (extra = {}) => ({
  id: 0,
  soort: "vraag",
  berichten: [
    { id: 1, van: "klant", naam: "Bram", tekst: "Hoe vol is mijn accu?", at: "2026-11-13T09:00:00+01:00" },
    { id: 2, van: "domotitech", naam: "DomotiTech", tekst: "Hij staat op 64%.", at: "2026-11-13T09:01:00+01:00" },
  ],
  gelezen: { [BRAM]: 2 },
  ...extra,
});

describe("het abonnement", () => {
  it("begint met het gesprek en de tickets, nieuwste ticket eerst", () => {
    const oud = ticket(1, { bijgewerkt: "2026-11-10T10:00:00+01:00" });
    const stand = B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [oud, ticket(2)] });
    assert.equal(stand.gesprek.id, 0);
    assert.deepEqual(stand.tickets.map((x) => x.id), [2, 1]);
  });

  it("begint met een leeg gesprek als de coach er geen meestuurt", () => {
    const stand = B.verwerk(null, { contract: 1, tickets: [] });
    assert.deepEqual(stand.gesprek.berichten, []);
  });

  it("zet een wijziging met id 0 in het gesprek, en niet bij de tickets", () => {
    const stand = B.verwerk(null, { contract: 1, gesprek: B.leegGesprek(), tickets: [ticket(1)] });
    const bij = B.verwerk(stand, { ticket: gesprek() });
    assert.equal(bij.gesprek.berichten.length, 2);
    assert.deepEqual(bij.tickets.map((x) => x.id), [1]);
  });

  it("vervangt een ticket, en een antwoord zet hem bovenaan", () => {
    const stand = B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [ticket(1, { bijgewerkt: "2026-11-10T10:00:00+01:00" }), ticket(2)] });
    const bij = B.verwerk(stand, { ticket: ticket(1, { bijgewerkt: "2026-11-13T09:00:00+01:00", stand: "klaar" }) });
    assert.deepEqual(bij.tickets.map((x) => [x.id, x.stand]), [[1, "klaar"], [2, "in_behandeling"]]);
    assert.equal(bij.gesprek.berichten.length, 2);
  });

  it("laat een bericht zonder ticket liggen", () => {
    assert.equal(B.verwerk({ gesprek: gesprek(), tickets: [] }, {}), null);
    assert.equal(B.verwerk({ gesprek: gesprek(), tickets: [] }, { ticket: {} }), null);
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

  it("telt het gesprek en de tickets samen", () => {
    const stand = { gesprek: gesprek({ gelezen: {} }), tickets: [ticket(1), ticket(2)] };
    assert.equal(B.allesOngelezen(stand, BRAM), 3);
    assert.equal(B.allesOngelezen(null, BRAM), 0);
  });

  it("vraagt alleen om read als er iets na het gelezene kwam", () => {
    assert.equal(B.moetLezen(ticket(1), BRAM), true);
    assert.equal(B.moetLezen(ticket(1, { gelezen: { [BRAM]: 2 } }), BRAM), false);
    assert.equal(B.moetLezen(gesprek(), BRAM), false);
  });
});

describe("de regel op de kaart", () => {
  it("zegt het zonder coach, en met een coach die te oud is", () => {
    _reset();
    assert.equal(B.tegelRegel({ coach: false, stand: null }), "Heeft COACH nodig");
    assert.equal(B.tegelRegel({ coach: true, teOud: true, stand: null }), "Werk COACH bij");
  });

  it("noemt eerst de nieuwe antwoorden, dan de lopende tickets, en anders niets", () => {
    _reset();
    const gelezen = { gelezen: { [BRAM]: 2 } };
    assert.equal(B.tegelRegel({ coach: true, stand: { gesprek: gesprek({ gelezen: {} }), tickets: [ticket(1)] }, userId: BRAM }), "2 nieuwe antwoorden");
    assert.equal(B.tegelRegel({ coach: true, stand: { gesprek: gesprek(), tickets: [ticket(1, gelezen)] }, userId: BRAM }), "1 ticket loopt");
    assert.equal(B.tegelRegel({ coach: true, stand: { gesprek: gesprek(), tickets: [ticket(1, { ...gelezen, stand: "klaar" })] }, userId: BRAM }), "");
    assert.equal(B.tegelRegel({ coach: true, stand: null }), "");
  });

  it("spreekt Engels", () => {
    _reset({ instelling: "en" });
    assert.equal(B.tegelRegel({ coach: true, stand: { gesprek: gesprek(), tickets: [ticket(1)] }, userId: BRAM }), "1 new answer");
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

  it("kent alleen storing en aanvraag als ticket; een vraag gaat in het gesprek", () => {
    assert.deepEqual(B.SOORTEN.map((s) => s.id), ["storing", "aanvraag"]);
    assert.equal(B.soortVan("storing").icoon, "warning");
    assert.equal(B.soortVan("iets").naam, "Ticket");
  });
});

describe("versturen", () => {
  it("weigert leeg en te lang, zoals de coach", () => {
    _reset();
    assert.equal(B.waaromNiet("   "), "Typ eerst wat je wilt vragen.");
    assert.equal(B.waaromNiet("x".repeat(4001)), "Dat is te lang: hoogstens 4000 tekens.");
    assert.equal(B.waaromNiet(" Hoe vol is mijn accu? "), null);
  });

  it("neemt een ticket met alleen een foto aan, en hoogstens vier", () => {
    _reset();
    assert.equal(B.waaromNiet("", { fotos: 1 }), null);
    assert.equal(B.waaromNiet("kijk", { fotos: 5 }), "Hoogstens 4 foto's per bericht.");
  });

  it("zegt een fout in een zin, met wat de coach zelf zegt", () => {
    _reset();
    assert.equal(
      B.foutTekst({ code: "te_veel", message: "Je kunt hoogstens 20 nieuwe vragen per uur stellen. Probeer het straks opnieuw." }),
      "Versturen lukte niet: Je kunt hoogstens 20 nieuwe vragen per uur stellen. Probeer het straks opnieuw."
    );
    assert.equal(B.foutTekst({ code: "unknown_command" }), "COACH kent Coach Assist nog niet. Werk COACH bij.");
    assert.equal(B.foutTekst({ code: "foto", message: "HTTP 415" }), "De foto kon niet mee: HTTP 415");
    assert.equal(B.foutTekst({}), "Versturen lukte niet.");
  });
});

describe("foto's", () => {
  it("gaan met de lange kant op hoogstens 2000 px, en nooit groter", () => {
    assert.deepEqual(B.fotoMaat(4032, 3024), { breed: 2000, hoog: 1500 });
    assert.deepEqual(B.fotoMaat(3024, 4032), { breed: 1500, hoog: 2000 });
    assert.deepEqual(B.fotoMaat(800, 600), { breed: 800, hoog: 600 });
  });

  it("krijgen alleen een adres met een echt id", () => {
    const id = "0123456789abcdef0123456789abcdef";
    assert.equal(B.bijlagePad(id), `/api/domotiapp_coach/tickets/bijlage/${id}`);
    assert.equal(B.bijlagePad("../../config"), null);
    assert.equal(B.bijlagePad("x"), null);
    assert.equal(B.bijlagePad(undefined), null);
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
