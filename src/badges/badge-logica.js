/**
 * Het rekenwerk van de badge, los van de DOM.
 *
 * Staat apart om dezelfde reden als `cover-logica.js` en `hvac-logica.js`: het
 * is te toetsen zonder browser, en het is precies het soort werk dat stilletjes
 * fout gaat. Een icoon dat uit het verkeerde veld komt of een kleurnaam die
 * niet herkend wordt geeft geen enkele fout -- je krijgt het verkeerde plaatje
 * of de verkeerde kleur, en verder niets.
 *
 * En het moet hier staan en niet in `template-badge.js`: dat bestand importeert
 * `base.js`, waar `class DacCard extends HTMLElement` op modulescope staat.
 * Een gewone Node-test die dat aanraakt valt om op "HTMLElement is not defined"
 * (valkuil 27 in CLAUDE.md).
 */

/**
 * De kleurnamen in het Nederlands, want dat is wat er in het veld getypt wordt.
 *
 * `toneValue` in base.js kent alleen de Engelse sleutels (`good`, `warn`,
 * `bad`), en dat blijft zo: die namen staan in elke kaartconfig in dit pakket
 * en hernoemen zou elk bestaand dashboard breken. Maar het kleurveld van de
 * badge is een TEKSTVELD met een Nederlandse hulptekst, en iemand die "goed"
 * intypt hoort groen te krijgen en niet stilzwijgend het accent.
 *
 * Gemeten op 17 september 2026 op de testinstance: een badge met
 * `tone: "{% if ... %}kritiek{% else %}goed{% endif %}"` kreeg
 * `rgb(25, 143, 217)` -- het accent. Er stond nergens dat het misging.
 */
const KLEURNAMEN = {
  goed: "good",
  "let op": "warn",
  letop: "warn",
  kritiek: "bad",
  accent: "accent",
  oranje: "solar",
  blauw: "house",
  lichtblauw: "water",
  magenta: "magenta",
  roze: "pink",
  groenblauw: "teal",
  lampgeel: "lit",
  neutraal: "neutral",
  grijs: "neutral",
  groen: "good",
  rood: "bad",
  geel: "warn",
};

/**
 * Een naam uit het kleurveld naar iets dat `toneValue` begrijpt.
 *
 * Alles wat hier niet in staat gaat ongewijzigd door -- dus een `#hex` of een
 * `var(--...)` ook, en de Engelse sleutels blijven gewoon werken.
 */
export const kleurnaam = (waarde) => {
  const tekst = String(waarde ?? "").trim();
  if (!tekst) return "";
  return KLEURNAMEN[tekst.toLowerCase()] ?? tekst;
};

/**
 * Domeinen waar "aan" en "uit" echt iets betekenen.
 *
 * Een `input_select` die op "Run" staat is niet "uit", en een sensor met een
 * getal al helemaal niet. Toch is dat wat `isOn` ervan maakt, en dan staat een
 * vaatwasser die draait gedempt in de kop van de view -- gemeten op
 * 17 september 2026. Voor alles buiten deze lijst is neutrale inkt het eerlijke
 * antwoord: de badge weet niet of er iets "aan" is, en doet dan ook niet alsof.
 */
export const AANUIT_DOMEINEN = new Set([
  "light", "switch", "fan", "input_boolean", "binary_sensor", "automation",
  "script", "siren", "lock", "cover", "media_player", "person", "device_tracker",
  "alarm_control_panel", "climate", "water_heater", "humidifier", "vacuum", "remote",
]);

/** Zegt "aan" of "uit" iets over deze entiteit? */
export const heeftAanUit = (entityId) =>
  AANUIT_DOMEINEN.has(String(entityId ?? "").split(".")[0]);

/**
 * Het icoon komt uit twee velden, en dat is een keuze met een reden.
 *
 * `icon` is wat de icoonkiezer schrijft: een naam uit onze eigen set, of een
 * `mdi:`-naam uit de terugval. Dat is de gewone weg en de eigenaar vroeg er op
 * 17 september 2026 expliciet om -- *"zorg wel dat ik de icons kan kiezen uit
 * onze eigen icon bibliotheek"*. Een kiezer kan geen Jinja tonen, dus daar is
 * `icon_template` voor: staat daar iets in, dan wint dat.
 *
 * En er is een derde geval, dat de reden is dat dit een functie is en geen
 * `??`: zijn BESTAANDE YAML zet de Jinja gewoon in `icon`. Dat moet blijven
 * werken zonder dat hij acht badges hoeft over te typen. Staat er dus Jinja in
 * `icon` en is `icon_template` leeg, dan is `icon` het sjabloon -- en de
 * sjabloonlaag ziet vanzelf dat het er een is.
 */
export function icoonBron(config) {
  const sjabloon = String(config?.icon_template ?? "").trim();
  if (sjabloon) return sjabloon;
  return config?.icon ?? "";
}
