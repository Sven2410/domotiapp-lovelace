/**
 * Wat een rookmelderkaart moet zeggen, los van hoe hij eruitziet.
 *
 * De volgorde is het hele punt en daarom staat hij hier, met tests eronder: een
 * melder die afgaat verslaat een lege batterij, een lege batterij verslaat
 * "alles rustig", en een kaart waarvan alles onbereikbaar is zegt dát in plaats
 * van te doen alsof het rustig is. Die rangorde in een `paint()` verstoppen is
 * hoe je er per ongeluk eentje omdraait.
 *
 * Kleuren staan hier als naam (`good`, `warn`, `bad`, `neutral`) en niet als
 * waarde: dit bestand mag geen DOM en geen thema kennen, anders is het niet te
 * toetsen in een gewone Node-test.
 */

/** De vijf soorten, in de volgorde waarin ze op de kaart staan. */
export const SOORTEN = [
  { sleutel: "smoke", label: "Rook", icoon: "smoke", alarm: "Rook gedetecteerd" },
  { sleutel: "co", label: "Koolmonoxide", icoon: "warning", alarm: "Koolmonoxide gedetecteerd" },
  { sleutel: "heat", label: "Warmte", icoon: "thermo", alarm: "Te warm" },
  { sleutel: "temperature", label: "Temperatuur", icoon: "thermo", meting: true },
  { sleutel: "battery", label: "Batterij", icoon: "battery", meting: true },
];

/** Onder deze stand heet een batterij bijna leeg. */
export const BATTERIJ_LAAG = 20;

/**
 * De batterijstand als getal van 0 tot 100, of null.
 *
 * Werkt met allebei de vormen die in huis hangen: een sensor met een percentage
 * en een binary_sensor die alleen "bijna leeg" zegt. Die tweede levert 0 op --
 * niet omdat de batterij leeg ís, maar omdat dat het enige is wat hij meldt, en
 * elke drempel eroverheen moet aanslaan.
 */
export function batterijPct(st) {
  if (!st || st.state === "unavailable" || st.state === "unknown") return null;
  if (String(st.entity_id ?? "").startsWith("binary_sensor.")) {
    return st.state === "on" ? 0 : null;
  }
  const n = Number(st.state);
  return Number.isFinite(n) ? n : null;
}

const isAan = (st) => Boolean(st) && st.state === "on";
const isWeg = (st) => !st || st.state === "unavailable" || st.state === "unknown";

/**
 * Wat de kop van de kaart zegt.
 *
 * @param {Array<{sleutel: string}>} gekozen de soorten die ingevuld zijn
 * @param {(sleutel: string) => object|null} lees de state per soort
 * @returns {{soort: string, tekst: string, tone: string, icoon: string}}
 */
export function toestand(gekozen, lees) {
  const melders = gekozen.filter((s) => !s.meting);

  // 1. Een melder die afgaat. Alles daarna doet er niet toe.
  for (const soort of melders) {
    if (isAan(lees(soort.sleutel))) {
      return { soort: "alarm", tekst: soort.alarm, tone: "bad", icoon: soort.icoon };
    }
  }

  // 2. Alles weg. Eén weggevallen sensor is geen kapotte melder -- alle
  //    sensoren weg wel, en dan mag er geen "alles rustig" staan.
  if (gekozen.length && gekozen.every((s) => isWeg(lees(s.sleutel)))) {
    return { soort: "weg", tekst: "Niet bereikbaar", tone: "neutral", icoon: "smoke" };
  }

  // 3. Een lege batterij. Een melder die niet kan melden is geen melder.
  const pct = batterijPct(lees("battery"));
  if (pct != null && pct <= BATTERIJ_LAAG) {
    return {
      soort: "batterij",
      tekst: `Batterij bijna leeg (${Math.round(pct)}%)`,
      tone: "warn",
      icoon: "battery",
    };
  }

  // 4. Alleen metingen ingevuld: dan is er niets beloofd en zegt de kaart niets.
  //    "Alles rustig" op een kaart die alleen de temperatuur kent, is een
  //    belofte die niemand gedaan heeft.
  if (!melders.length) {
    return { soort: "meting", tekst: "", tone: "accent", icoon: "smoke" };
  }

  return { soort: "goed", tekst: "Alles rustig", tone: "good", icoon: "smoke" };
}
