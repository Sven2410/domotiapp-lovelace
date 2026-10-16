/**
 * De verbinding van het infoscherm met de server: het token en de bestanden.
 *
 * ## Wat hier fout ging
 *
 * Tot 0.61.0 las `infoscherm-client.js` het token rechtstreeks uit
 * `hass.auth.data.access_token`. Dat is een half uur geldig, en de pagina
 * ververst het niet uit zichzelf: de websocket blijft gewoon open. Op een iPad
 * die dagen dezelfde pagina toont kreeg elk logo of elke foto die na het
 * eerste half uur werd geüpload een 401, en het scherm probeerde het daarna
 * nooit meer. Gemeld door een beheersessie op 12 oktober 2026.
 *
 * - "ververst een verlopen token": NIEUW GEDRAG, faalt op de code van ervoor
 *   (die stuurde het oude token, en de server antwoordde 401).
 * - "gaat via hass.fetchWithAuth": NIEUW GEDRAG, idem.
 * - "laat een mislukt bestand even met rust": NIEUW GEDRAG; de code van ervoor
 *   vroeg het bij elke `paint` opnieuw op (en de kaart vroeg het nooit meer).
 * - "upload met een verlopen token": NIEUW GEDRAG.
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { Abonnement, AgendaAbonnement, RUST_NA_FOUT, bestandUrl, boekRuimte, haal, upload } from "../../src/infoscherm-client.js";

const echteFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = echteFetch;
});

/** Een server die alleen het token "vers" accepteert, en telt wat er binnenkomt. */
function server() {
  const verzoeken = [];
  globalThis.fetch = async (pad, init = {}) => {
    const kop = init.headers?.Authorization ?? init.headers?.authorization;
    verzoeken.push({ pad, kop });
    if (kop !== "Bearer vers") return new Response("", { status: 401 });
    if (String(pad).endsWith("/upload")) return Response.json({ id: "01ABC", naam: "logo.png" });
    return new Response(new Blob(["png"], { type: "image/png" }));
  };
  return verzoeken;
}

/** Een `hass` zoals een iPad die al een uur openstaat: het token is verlopen. */
function verlopen() {
  const auth = {
    data: { access_token: "oud", expires: Date.now() - 60_000 },
    get expired() {
      return Date.now() > this.data.expires;
    },
    get accessToken() {
      return this.data.access_token;
    },
    async refreshAccessToken() {
      this.data.access_token = "vers";
      this.data.expires = Date.now() + 1_800_000;
    },
  };
  return { auth };
}

describe("haal", () => {
  it("ververst een verlopen token voordat het verzoek weggaat", async () => {
    const verzoeken = server();
    const antwoord = await haal(verlopen(), "/api/x");
    assert.equal(antwoord.status, 200);
    assert.deepEqual(verzoeken.map((v) => v.kop), ["Bearer vers"]);
  });

  it("gaat via hass.fetchWithAuth als die er is", async () => {
    const gevraagd = [];
    const hass = { ...verlopen(), fetchWithAuth: async (pad) => (gevraagd.push(pad), new Response("ok")) };
    globalThis.fetch = () => assert.fail("niet rechtstreeks");
    await haal(hass, "/api/y");
    assert.deepEqual(gevraagd, ["/api/y"]);
  });
});

describe("bestandUrl", () => {
  it("haalt een bestand op, ook als het token van de pagina verlopen is", async () => {
    server();
    const url = await bestandUrl(verlopen(), "01VERLOPEN");
    assert.match(String(url), /^blob:/);
  });

  it("laat een mislukt bestand even met rust, en probeert het daarna opnieuw", async () => {
    const verzoeken = server();
    const kapot = { auth: { data: { access_token: "fout", expires: Date.now() + 1_800_000 }, expired: false } };
    assert.equal(await bestandUrl(kapot, "01RUST", 1_000), null);
    assert.equal(await bestandUrl(kapot, "01RUST", 1_000 + RUST_NA_FOUT - 1), null);
    assert.equal(verzoeken.length, 1, "binnen de rust geen tweede verzoek");
    assert.match(String(await bestandUrl(verlopen(), "01RUST", 1_000 + RUST_NA_FOUT)), /^blob:/);
    assert.equal(verzoeken.length, 2);
  });
});

describe("upload", () => {
  it("lukt met een verlopen token", async () => {
    const verzoeken = server();
    const meta = await upload(verlopen(), new File(["png"], "logo.png", { type: "image/png" }));
    assert.equal(meta.id, "01ABC");
    assert.deepEqual(verzoeken.map((v) => v.kop), ["Bearer vers"]);
  });
});

/**
 * NIEUW GEDRAG (0.62.2): het abonnement overleeft een herstart van Home
 * Assistant. Tot dan mislukte het abonneren vlak na de herverbinding met
 * `unknown_command`, stil, en kwam er daarna niets meer binnen. Gemeten op
 * 12 oktober 2026: de server zei "3 van 8", het scherm bleef "2 van 8".
 */
describe("Abonnement", () => {
  /** Een verbinding die de eerste `weiger` keer zegt dat het commando onbekend is. */
  function verbinding(weiger = 0) {
    const log = { aanvragen: 0, opgezegd: 0, opties: [] };
    const connection = {
      async subscribeMessage(_cb, _bericht, opties) {
        log.aanvragen += 1;
        log.opties.push(opties);
        if (log.aanvragen <= weiger) throw { code: "unknown_command", message: "Unknown command." };
        return () => {
          log.opgezegd += 1;
        };
      },
    };
    return { hass: { connection }, log };
  }

  /** Een klok die je zelf laat tikken. */
  function klok() {
    const wacht = [];
    return {
      opties: { klok: (fn) => (wacht.push(fn), wacht.length), stopKlok: () => wacht.splice(0) },
      async tik() {
        const fn = wacht.shift();
        if (fn) await fn();
        await new Promise((k) => setTimeout(k, 0));
      },
    };
  }

  it("probeert het opnieuw zolang Home Assistant nog opstart, en laat dan zelf opnieuw abonneren", async () => {
    const { hass, log } = verbinding(2);
    const k = klok();
    const abo = new Abonnement(() => {}, k.opties);
    await abo.start(hass);
    assert.equal(abo.actief, false);
    await k.tik();
    assert.equal(abo.actief, false);
    await k.tik();
    assert.equal(abo.actief, true);
    assert.equal(log.aanvragen, 3);
    // De bibliotheek van Home Assistant abonneert niet zelf opnieuw: dat doet de kaart.
    assert.ok(log.opties.every((o) => o?.resubscribe === false));
  });

  it("een nieuwe start zegt het vorige abonnement eerst op", async () => {
    const { hass, log } = verbinding();
    const abo = new Abonnement(() => {});
    await abo.start(hass);
    await abo.start(hass);
    assert.equal(log.aanvragen, 2);
    assert.equal(log.opgezegd, 1);
    assert.equal(abo.actief, true);
  });

  it("stop zegt op en probeert niets meer", async () => {
    const { hass, log } = verbinding(5);
    const k = klok();
    const abo = new Abonnement(() => {}, k.opties);
    await abo.start(hass);
    abo.stop();
    await k.tik();
    assert.equal(log.aanvragen, 1);
    assert.equal(abo.actief, false);
  });

  it("een andere fout dan opstarten wordt niet herhaald", async () => {
    const k = klok();
    let aanvragen = 0;
    const hass = { connection: { subscribeMessage: async () => { aanvragen += 1; throw { code: "unauthorized" }; } } };
    const abo = new Abonnement(() => {}, k.opties);
    await abo.start(hass);
    await k.tik();
    assert.equal(aanvragen, 1);
  });
});

/**
 * De ruimtes (16 oktober 2026). NIEUW GEDRAG: `AgendaAbonnement` en
 * `boekRuimte` bestonden niet.
 */
describe("AgendaAbonnement", () => {
  function klok() {
    const wacht = [];
    return {
      opties: { klok: (fn) => (wacht.push(fn), wacht.length), stopKlok: () => wacht.splice(0) },
      async tik() {
        const fn = wacht.shift();
        if (fn) await fn();
        await new Promise((k) => setTimeout(k, 0));
      },
    };
  }

  it("vraagt calendar/event/subscribe voor die agenda en dat venster, en geeft de lijst door", async () => {
    const berichten = [];
    let gevraagd = null;
    const hass = {
      connection: {
        async subscribeMessage(cb, bericht) {
          gevraagd = bericht;
          cb({ events: [{ start: "2026-10-16T09:00:00+02:00", end: "2026-10-16T10:00:00+02:00" }] });
          cb({ events: null });
          return () => {};
        },
      },
    };
    const van = new Date(Date.UTC(2026, 9, 15, 22));
    const tot = new Date(Date.UTC(2026, 9, 16, 22));
    await new AgendaAbonnement("calendar.spreekruimte", van, tot, (l) => berichten.push(l)).start(hass);
    assert.deepEqual(gevraagd, {
      type: "calendar/event/subscribe",
      entity_id: "calendar.spreekruimte",
      start: "2026-10-15T22:00:00.000Z",
      end: "2026-10-16T22:00:00.000Z",
    });
    assert.equal(berichten[0].length, 1);
    assert.equal(berichten[1], null);
  });

  it("een agenda die er (nog) niet is: later opnieuw, want na een herstart komt hij soms na het scherm", async () => {
    let aanvragen = 0;
    const hass = {
      connection: {
        async subscribeMessage() {
          aanvragen += 1;
          if (aanvragen === 1) throw { code: "not_found", message: "Calendar entity not found" };
          return () => {};
        },
      },
    };
    const k = klok();
    const abo = new AgendaAbonnement("calendar.x", new Date(), new Date(), () => {}, k.opties);
    await abo.start(hass);
    assert.equal(abo.actief, false);
    await k.tik();
    assert.equal(abo.actief, true);
    assert.equal(aanvragen, 2);
  });

  it("REGRESSIEWACHT: het gewone abonnement herhaalt een not_found niet", async () => {
    let aanvragen = 0;
    const hass = { connection: { subscribeMessage: async () => { aanvragen += 1; throw { code: "not_found" }; } } };
    const k = klok();
    await new Abonnement(() => {}, k.opties).start(hass);
    await k.tik();
    assert.equal(aanvragen, 1);
  });
});

describe("boekRuimte", () => {
  it("het scherm stuurt de code mee, ook een lege; het beheer een omschrijving en geen code", async () => {
    const verstuurd = [];
    const hass = { connection: { sendMessagePromise: async (b) => (verstuurd.push(b), {}) } };
    await boekRuimte(hass, { ruimte: "calendar.a", start: "2026-10-16T10:00", eind: "2026-10-16T11:00", code: "" });
    await boekRuimte(hass, { ruimte: "calendar.a", start: "2026-10-16T10:00", eind: "2026-10-16T11:00", omschrijving: "Overleg" });
    assert.equal(verstuurd[0].type, "domotiapp_lovelace/infoscherm/ruimtes/boek");
    assert.equal(verstuurd[0].code, "");
    assert.ok(!("omschrijving" in verstuurd[0]));
    assert.ok(!("code" in verstuurd[1]));
    assert.equal(verstuurd[1].omschrijving, "Overleg");
  });
});
