/**
 * De berichten van de auto, zonder DOM: lezen per merk, en de knop die ze wist.
 *
 * Gevraagd op 27 november 2026, via de beheersessie van de eigenaar: *"een berichten melding in de kaart en
 * berichten wissen"*, en daarna *"dat moet eigenlijk voor elke auto merk zijn dus we moeten het kunnen
 * uitbreiden voor merken etc"*.
 *
 * Het merk is het `platform` van de gekozen sensor in het entiteitenregister (`hass.entities[id].platform`),
 * net als aan de serverkant. Per merk staat in `MERKEN` hoe de berichten gelezen worden, welke `translation_key`
 * de berichtensensor heeft, en welke knop op hetzelfde apparaat ze wist. Die knop zoekt de kaart zelf; een
 * merk zonder wisknop heeft geen knop. `MERKEN` in `meldingen/auto.py` hoort hetzelfde te zeggen
 * (`tests/js/auto-berichten.test.mjs`); hoe FordPass zijn berichten neerzet, staat in de kop daar.
 */

/** "11/10/2026 06:50:04 AM" in UTC (FordPass), als ms, of null. */
export function fordDatum(tekst) {
  const m = String(tekst ?? "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) ?(AM|PM)$/i);
  if (!m) return null;
  const [, maand, dag, jaar, uur, min, sec, ampm] = m;
  const u = (Number(uur) % 12) + (ampm.toUpperCase() === "PM" ? 12 : 0);
  const ms = Date.UTC(Number(jaar), Number(maand) - 1, Number(dag), u, Number(min), Number(sec));
  const d = new Date(ms);
  return d.getUTCMonth() === Number(maand) - 1 && d.getUTCDate() === Number(dag) ? ms : null;
}

const ENTITEITEN = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** De tekst zonder html: regeleindes blijven, tags gaan eruit. Zoals `platte_tekst` in auto.py. */
export function platteTekst(tekst) {
  return String(tekst ?? "")
    .replace(/<\s*(br|\/p|\/div|\/li)\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#\d+|[a-z]+);/gi, (heel, e) =>
      e[0] === "#" ? String.fromCharCode(Number(e.slice(1))) : (ENTITEITEN[e.toLowerCase()] ?? heel)
    )
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .join("\n");
}

const sleutel = (datum, onderwerp) => `${String(datum ?? "").trim()}|${String(onderwerp ?? "").trim()}`;

const bericht = (s, onderwerp, tekst, datum, gelezen) => ({
  sleutel: s,
  onderwerp: String(onderwerp ?? "").trim(),
  tekst: platteTekst(tekst),
  datum,
  gelezen: typeof gelezen === "boolean" ? gelezen : null,
});

/** FordPass: `json_src` als hij er is (alleen live), anders de platte `msgNNN_`. */
function leesFord(attr) {
  const lijst = attr?.json_src;
  if (Array.isArray(lijst) && lijst.length) {
    return lijst
      .filter((b) => b && typeof b === "object")
      .map((b) =>
        bericht(sleutel(b.createdDate, b.messageSubject), b.messageSubject, b.messageBody, fordDatum(b.createdDate), b.isRead)
      );
  }
  const per = {};
  for (const [k, v] of Object.entries(attr ?? {})) {
    const m = k.match(/^msg(\d+)_(Date|Type|Subject|Content)$/);
    if (m) (per[m[1]] ??= {})[m[2]] = v;
  }
  return Object.keys(per)
    .sort((a, b) => Number(a) - Number(b))
    .map((nr) => per[nr])
    .map((d) => bericht(sleutel(d.Date, d.Subject), d.Subject, d.Content, fordDatum(d.Date)));
}

/** Per `platform`. Een volgend merk is een lezer en een regel, met een echte dump als testinvoer. */
export const MERKEN = {
  fordpass: { naam: "Ford", lees: leesFord, sensor: "messages", wisKnop: "msgdeleteall" },
};

/** Het merk achter deze sensor, of null. */
export const merkVan = (hass, id) => MERKEN[hass?.entities?.[id]?.platform] ?? null;

const bruikbaar = (st) => st && !["", "unavailable", "unknown"].includes(String(st.state ?? ""));

/**
 * De berichten, de nieuwste eerst. `null` als de sensor niets zegt of het merk onbekend is; dat is iets anders
 * dan geen berichten. Een aantal boven 0 zonder één leesbaar bericht is ook `null`.
 */
export function berichtenVan(hass, id) {
  const merk = merkVan(hass, id);
  const st = hass?.states?.[id];
  if (!merk || !bruikbaar(st)) return null;
  const uit = merk.lees(st.attributes ?? {});
  if (!uit.length && Number(st.state) > 0) return null;
  return uit.sort((a, b) => (b.datum ?? -Infinity) - (a.datum ?? -Infinity));
}

/**
 * Hoeveel berichten er zijn: de toestand als die een getal is, anders de lijst. `null` als er niets te zeggen
 * valt. Een sensor van een merk dat we niet kennen, telt wel: dan staat er het getal en geen lijst.
 */
export function aantalVan(hass, id) {
  const st = hass?.states?.[id];
  if (!bruikbaar(st)) return null;
  const n = Number(st.state);
  if (Number.isFinite(n) && n >= 0) return Math.round(n);
  return berichtenVan(hass, id)?.length ?? null;
}

/**
 * De knop die alle berichten wist: wat er in de editor staat, anders de knop met de `translation_key` van het
 * merk op hetzelfde apparaat. Een uitgeschakelde knop staat niet in `hass.entities`, en telt dus niet.
 */
export function wisKnopVan(hass, id, ingevuld) {
  if (ingevuld) return hass?.states?.[ingevuld] ? ingevuld : null;
  const merk = merkVan(hass, id);
  const apparaat = hass?.entities?.[id]?.device_id;
  if (!merk?.wisKnop || !apparaat) return null;
  for (const e of Object.values(hass.entities)) {
    if (e?.device_id === apparaat && e.platform === hass.entities[id].platform && e.translation_key === merk.wisKnop) {
      return hass.states?.[e.entity_id] ? e.entity_id : null;
    }
  }
  return null;
}

/**
 * De berichtensensoren in dit huis, voor de editor: elke sensor van een bekend merk met de `translation_key`
 * van zijn berichten.
 */
export function berichtSensoren(hass) {
  return Object.values(hass?.entities ?? {})
    .filter((e) => MERKEN[e?.platform]?.sensor === e?.translation_key && e.entity_id.startsWith("sensor."))
    .map((e) => e.entity_id);
}

/**
 * De naam van de auto: het APPARAAT, niet de sensor (die heet "Berichten"). Zoals `auto_naam` in motor.py, zodat
 * de pop-up dezelfde naam noemt als de melding.
 */
export function autoNaamVan(hass, id) {
  const apparaat = hass?.devices?.[hass?.entities?.[id]?.device_id];
  const naam = String(apparaat?.name_by_user || apparaat?.name || "").trim();
  if (naam) return naam;
  const fn = String(hass?.states?.[id]?.attributes?.friendly_name ?? "").replace(/\s+/g, " ").trim();
  return fn || String(id ?? "");
}

/** De dienst die een knop indrukt. */
export function drukDienst(id) {
  const domein = String(id ?? "").split(".")[0];
  if (domein === "button") return ["button", "press"];
  if (domein === "input_button") return ["input_button", "press"];
  if (domein === "script") return ["script", "turn_on"];
  return null;
}
