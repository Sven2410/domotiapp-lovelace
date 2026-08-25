/**
 * Een tijd of datum die je op de regel zelf zet, zonder omweg.
 *
 * Een `input_datetime` op de entiteitenkaart toonde tot nu toe alleen zijn
 * waarde. Wilde je die veranderen, dan moest je de regel opentikken, wachten op
 * het venster van Home Assistant, daar het veld zoeken, invullen en het venster
 * weer sluiten -- vier handelingen voor het zetten van een wektijd. De
 * schuifschakelaar naast een lamp lost precies datzelfde op: de bediening staat
 * waar de waarde staat. Dit is die schakelaar, voor alles wat een klok of een
 * kalender draagt.
 *
 * Hier staat alleen het rekenwerk: welk soort veld hoort bij welke entiteit,
 * wat er in dat veld staat, en welke service-aanroep eruit komt als je iets
 * anders kiest. Geen DOM, geen `hass` -- anders is het niet te toetsen in een
 * gewone Node-test, en juist dit hoort getoetst te zijn: er zitten vier domeinen
 * in met elk hun eigen spelling van hetzelfde moment.
 *
 * VIER DOMEINEN, DRIE VELDSOORTEN
 *
 *   input_datetime  de helper van Home Assistant. Draagt een datum, een tijd of
 *                   allebei; `has_date` en `has_time` zeggen welke. Zijn ze er
 *                   niet -- oude opnames, een nagemaakte hass -- dan is de
 *                   toestand zelf nog te lezen.
 *   time / date     een apparaat dat een tijd of datum bewaart. Toestand is
 *                   "07:30:00" of "2026-08-25".
 *   datetime        idem, maar de toestand is een ISO-moment MET tijdzone, in
 *                   UTC. Dat is de enige van de vier die omgerekend moet worden,
 *                   en de enige waar we een zone meesturen: een kaal moment zou
 *                   aan de andere kant nogmaals uitgelegd worden.
 *
 * De seconden gaan er overal af. Een veld met een secondenvak is breder, en
 * niemand zet zijn wekker op 07:30:12.
 */

/** Het domein van een entiteit, zonder iets uit ha.js nodig te hebben. */
const domeinVan = (entityId) => String(entityId ?? "").split(".")[0];

/** De domeinen die een moment dragen dat je mag zetten. */
export const TIJD_DOMEINEN = new Set(["input_datetime", "time", "date", "datetime"]);

/**
 * Hoort hier een veld te staan?
 *
 * Op het domein, niet op de toestand: de kaart bouwt zijn DOM voordat er een
 * `hass` is, en de config kent het domein al.
 */
export const kanTijdZetten = (entityId) => TIJD_DOMEINEN.has(domeinVan(entityId));

const pad2 = (n) => String(n).padStart(2, "0");

/** Uit de toestand zelf aflezen wat erin zit, voor als de attributen ontbreken. */
function soortUitToestand(state) {
  const s = String(state ?? "");
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(s)) return "datetime-local";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return "date";
  if (/^\d{1,2}:\d{2}/.test(s)) return "time";
  return null;
}

/**
 * Welk invoerveld bij deze toestand hoort: `time`, `date`, `datetime-local`,
 * of `null` als er niets te zetten valt.
 */
export function tijdSoort(st) {
  if (!st) return null;
  const domein = domeinVan(st.entity_id);
  if (domein === "time") return "time";
  if (domein === "date") return "date";
  if (domein === "datetime") return "datetime-local";
  if (domein !== "input_datetime") return null;

  const a = st.attributes ?? {};
  if (typeof a.has_date === "boolean" || typeof a.has_time === "boolean") {
    if (a.has_date && a.has_time) return "datetime-local";
    if (a.has_date) return "date";
    if (a.has_time) return "time";
    return null;
  }
  return soortUitToestand(st.state);
}

/** Een moment als het veld het wil zien: lokale tijd, zonder zone. */
export const veldTijd = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
  `T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** De zone van dit apparaat als "+02:00", zodat een moment maar één lezing heeft. */
export function zoneVan(d) {
  const min = -d.getTimezoneOffset();
  const teken = min < 0 ? "-" : "+";
  const abs = Math.abs(min);
  return `${teken}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

/**
 * Wat er in het veld komt te staan, of "" als er niets bekend is.
 *
 * Leeg is hier een eerlijk antwoord: een `time`-entiteit die nog nooit gezet is
 * staat op `unknown`, en een veld dat dan middernacht toont zou een waarde
 * verzinnen die het apparaat niet heeft.
 */
export function veldWaarde(st, soort = tijdSoort(st)) {
  if (!st || !soort) return "";
  const s = String(st.state ?? "");
  if (!s || s === "unknown" || s === "unavailable") return "";

  if (soort === "time") {
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    return m ? `${pad2(m[1])}:${m[2]}` : "";
  }
  if (soort === "date") {
    const m = s.match(/^(\d{4}-\d{2}-\d{2})$/);
    return m ? m[1] : "";
  }
  // Alleen het `datetime`-domein draagt een zone; die moet naar lokale tijd
  // voordat er iets van te lezen valt.
  if (domeinVan(st.entity_id) === "datetime") {
    const d = new Date(s);
    return Number.isNaN(+d) ? "" : veldTijd(d);
  }
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);
  return m ? `${m[1]}T${pad2(m[2].split(":")[0])}:${m[2].split(":")[1]}` : "";
}

/**
 * De service-aanroep die deze waarde vastlegt, als `[domein, service, data]`.
 *
 * `null` bij een lege waarde: het veld leegmaken is geen opdracht om iets te
 * zetten, en er is geen dienst die een moment weer weghaalt.
 */
export function zetOproep(entityId, soort, waarde) {
  const domein = domeinVan(entityId);
  const v = String(waarde ?? "");
  if (!v || !TIJD_DOMEINEN.has(domein) || !soort) return null;

  if (soort === "time") {
    const m = v.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const tijd = `${pad2(m[1])}:${m[2]}:00`;
    return domein === "time"
      ? ["time", "set_value", { entity_id: entityId, time: tijd }]
      : ["input_datetime", "set_datetime", { entity_id: entityId, time: tijd }];
  }

  if (soort === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    return domein === "date"
      ? ["date", "set_value", { entity_id: entityId, date: v }]
      : ["input_datetime", "set_datetime", { entity_id: entityId, date: v }];
  }

  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);
  if (!m) return null;
  const [, jaar, maand, dag, uur, minuut] = m;
  const klok = `${pad2(uur)}:${minuut}:00`;
  if (domein === "datetime") {
    const zone = zoneVan(new Date(+jaar, +maand - 1, +dag, +uur, +minuut));
    return [
      "datetime",
      "set_value",
      { entity_id: entityId, datetime: `${jaar}-${maand}-${dag}T${klok}${zone}` },
    ];
  }
  return [
    "input_datetime",
    "set_datetime",
    { entity_id: entityId, datetime: `${jaar}-${maand}-${dag} ${klok}` },
  ];
}
