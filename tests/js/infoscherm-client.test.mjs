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

import { RUST_NA_FOUT, bestandUrl, haal, upload } from "../../src/infoscherm-client.js";

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
