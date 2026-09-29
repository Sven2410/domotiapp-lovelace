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
  // Blauw is het ACCENT, het blauw van het merk. Tot 0.51.0 was dat het
  // identiteitsblauw van het huis (#235efa), maar de eigenaar vroeg op
  // 29 september 2026 "alle andere dingen gewoon blauw", en dat blauw is het
  // accent dat overal op de kaarten staat.
  blauw: "accent",
  donkerblauw: "house",
  lichtblauw: "water",
  magenta: "magenta",
  paars: "magenta",
  roze: "pink",
  groenblauw: "teal",
  lamp: "lit",
  lampkleur: "lit",
  lampgeel: "lit",
  neutraal: "neutral",
  grijs: "neutral",
  groen: "good",
  rood: "bad",
  geel: "warn",
  // De namen van Mushroom. Zijn badges kwamen daarvandaan, met `color: red` of
  // een sjabloon dat "amber" teruggaf, en die hoorden hier stil blauw te worden.
  red: "bad",
  green: "good",
  "light-green": "good",
  lime: "good",
  yellow: "warn",
  amber: "warn",
  orange: "solar",
  "deep-orange": "solar",
  brown: "solar",
  blue: "accent",
  "light-blue": "water",
  cyan: "water",
  indigo: "house",
  purple: "magenta",
  "deep-purple": "magenta",
  pink: "pink",
  grey: "neutral",
  gray: "neutral",
  "blue-grey": "neutral",
  disabled: "neutral",
};

/**
 * Wat elke kleursleutel in CSS is. Dezelfde waarden als `TONES` in base.js;
 * die kan hier niet geïmporteerd worden (zie de kop van dit bestand).
 */
const TOON_CSS = {
  accent: "var(--dac-accent-hi)",
  solar: "var(--dac-solar)",
  house: "var(--dac-house)",
  water: "var(--dac-grid-in)",
  magenta: "var(--dac-grid-out)",
  pink: "var(--dac-device-1)",
  teal: "var(--dac-device-2)",
  lit: "var(--dac-lit)",
  good: "var(--dac-good)",
  warn: "var(--dac-warn)",
  bad: "var(--dac-bad)",
  neutral: "var(--dac-ink-3)",
};

/**
 * De keuzes in de keuzelijst "Kleur". Sleutel = wat er in de YAML komt.
 *
 * Een KEUZELIJST en geen tekstveld, en dat is gevraagd: *"bij die badges kan ik
 * de kleur niet instellen (...) DIe kleur dinges werkt nu niet namelijk"*. Het
 * veld was een tekstveld waarin alleen onze eigen woorden werkten; `red` of een
 * Mushroom-naam gaf stil het accent. Een lijst laat zien wat er kan.
 *
 * Geen kleurkiezer voor identiteit (zie de vormregels in CLAUDE.md): dit is
 * STATUS -- een verbruik dat te hoog is, een alarm dat aanstaat.
 */
export const KLEUREN = [
  ["blauw", "Blauw"],
  ["groen", "Groen"],
  ["geel", "Geel"],
  ["oranje", "Oranje"],
  ["rood", "Rood"],
  ["lamp", "Lampkleur"],
  ["grijs", "Grijs"],
];

/**
 * Een kleur uit de config of een sjabloon naar CSS, of null.
 *
 * Kent: de keuzes hierboven, de Nederlandse namen, de Engelse sleutels van de
 * familie, de namen van Mushroom, en `#hex`, `rgb(...)` en `var(...)`. Een
 * gewone CSS-kleurnaam (`purple`, `teal`) gaat door als `geldig` hem kent; dat
 * is `CSS.supports` in de browser, en in een test een eigen functie.
 *
 * Null en geen terugval: de aanroeper beslist wat "niets gekozen" betekent.
 */
export function kleurCss(waarde, geldig = cssKleurGeldig) {
  const tekst = String(waarde ?? "").trim();
  if (!tekst) return null;
  const sleutel = KLEURNAMEN[tekst.toLowerCase()] ?? tekst;
  if (TOON_CSS[sleutel]) return TOON_CSS[sleutel];
  if (/^#|^rgba?\(|^hsla?\(|^var\(/i.test(sleutel)) return sleutel;
  return geldig(sleutel) ? sleutel : null;
}

const cssKleurGeldig = (x) =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("color", x);

/**
 * Een naam uit het kleurveld naar iets dat `toneValue` begrijpt.
 *
 * Alles wat hier niet in staat gaat ongewijzigd door -- dus een `#hex` of een
 * `var(--...)` ook, en de Engelse sleutels blijven gewoon werken.
 */
/**
 * @deprecated sinds 0.51.0; gebruik `kleurCss`. Blijft voor wie hem nog aanroept.
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

/**
 * Waar de terugknop heen gaat.
 *
 * Twee uitkomsten, en het verschil zit in één lege string -- precies het soort
 * ding dat je in een browser niet ziet misgaan, want allebei de gevallen doen
 * IETS. Een knop die naar de voorpagina springt terwijl je een stap terug
 * verwachtte ziet er niet stuk uit.
 *
 * Leeg (of alleen witruimte) betekent: één stap terug in de geschiedenis, net
 * als de back-chip van Mushroom. Dat is met opzet het gedrag zonder
 * configuratie -- "terug" betekent voor de meeste mensen "waar ik vandaan
 * kwam".
 */
export function terugDoel(config) {
  const pad = String(config?.path ?? "").trim();
  return pad ? { soort: "pad", pad } : { soort: "geschiedenis" };
}

/**
 * Is dit een lamp die uit andere lampen bestaat?
 *
 * Twee soorten, en allebei tellen ze een lamp dubbel als je ze meeneemt: een
 * lichtgroep van Home Assistant draagt zijn leden in `entity_id`, en een kamer
 * of zone van Hue is een eigen lamp met `is_hue_group`. Zet je in de
 * woonkamer drie spots aan, dan zijn er drie lampen aan -- en niet vier omdat
 * de groep "Woonkamer" ook aan staat.
 */
export const isLampgroep = (st) =>
  Array.isArray(st?.attributes?.entity_id) || st?.attributes?.is_hue_group === true;

/**
 * De lampen die de lampenteller meetelt: aan, geen groep, niet uitgesloten.
 *
 * Gevraagd op 29 september 2026: *"Ik wil daar een optie kunnen aanvinken in
 * de GUI van dat het een light counter is. En dat ik dan verlichting kan
 * uitsluiten dat hij niet moet meenemen."* Zijn oude badge deed dit met
 * `states.light | selectattr('state','eq','on') | list | count`, en die telde
 * de groepen gewoon mee.
 *
 * Alleen `on` telt. Een lamp die `unavailable` is, staat niet aan; dat is ook
 * wat het sjabloon deed.
 *
 * @param {Record<string, object>} states `hass.states`
 * @param {string[]} [uitsluiten] de lampen die hij overslaat
 * @returns {string[]} de entity_id's, gesorteerd
 */
export function lampenAan(states, uitsluiten = []) {
  const weg = new Set(Array.isArray(uitsluiten) ? uitsluiten : []);
  return Object.values(states ?? {})
    .filter(
      (st) =>
        String(st?.entity_id ?? "").startsWith("light.") &&
        st.state === "on" &&
        !weg.has(st.entity_id) &&
        !isLampgroep(st),
    )
    .map((st) => st.entity_id)
    .sort();
}

/**
 * De kleur van de verlichting: het gemiddelde van de lampen die er een melden.
 *
 * Gevraagd op 29 september 2026: *"nu is de lampen blauw maar die wil ik de
 * kleur van de verlichting hebben en dat moet standaard zijn"*. Een lamp in
 * Home Assistant meldt zijn kleur als `rgb_color`, ook een witte (die rekent
 * Home Assistant om uit de kleurtemperatuur). Het gemiddelde van twaalf warme
 * lampen is warm; één rode ertussen kleurt het niet rood.
 *
 * Null als geen enkele lamp een kleur meldt (lampen die alleen aan en uit
 * kunnen). De badge valt dan terug op het lampgeel van de familie.
 *
 * @param {Record<string, object>} states `hass.states`
 * @param {string[]} ids de lampen die meetellen
 */
export function lampKleur(states, ids) {
  const kleuren = (ids ?? [])
    .map((id) => states?.[id]?.attributes?.rgb_color)
    .filter((rgb) => Array.isArray(rgb) && rgb.length >= 3 && rgb.slice(0, 3).every(Number.isFinite));
  if (!kleuren.length) return null;
  const gem = [0, 1, 2].map((i) => Math.round(kleuren.reduce((n, rgb) => n + rgb[i], 0) / kleuren.length));
  return `rgb(${gem.join(",")})`;
}

/* ============================ soorten badges ============================ */

/**
 * Wat de badge laat zien.
 *
 * | `mode` | wat |
 * |---|---|
 * | (leeg) | eigen tekst: label, content en icoon, alle drie een sjabloon |
 * | `lights` | lampenteller (0.49.0) |
 * | `energy` | vermogen met een kleur per band (0.51.0) |
 * | `alarm` | de stand van een alarm met een kleur per stand (0.51.0) |
 *
 * Een badge uit 0.49.0 heeft `light_counter: true` en geen `mode`; dat is een
 * lampenteller, en dat blijft zo.
 */
export const BADGE_SOORTEN = ["lights", "energy", "alarm"];

export function badgeSoort(config) {
  if (BADGE_SOORTEN.includes(config?.mode)) return config.mode;
  return config?.light_counter ? "lights" : "";
}

/**
 * Wat een soort meebrengt als je hem kiest: kop, icoon, en de velden die er
 * zonder waarde niets zouden doen.
 *
 * De editor vult dit in als het leeg is (zie `patch_` in template-badge.js),
 * zodat het ZICHTBAAR in de velden staat en je het kunt aanpassen. De badge
 * zelf leest dezelfde waarden als terugval, voor wie het in YAML schrijft.
 */
export const SOORT_STANDAARD = {
  lights: { label: "Lampen aan", icon: "bulb" },
  energy: {
    label: "Verbruik",
    icon: "bolt",
    energy_green_max: 1000,
    energy_orange_max: 5000,
    energy_color_low: "groen",
    energy_color_mid: "oranje",
    energy_color_high: "rood",
  },
  alarm: {
    label: "Alarm",
    alarm_disarmed: "disarmed",
    alarm_partial: "armed_home, armed_night",
    alarm_armed: "armed_away, armed_vacation",
    alarm_disarmed_color: "groen",
    alarm_partial_color: "oranje",
    alarm_armed_color: "rood",
  },
};

const standaard = (config, sleutel) => config?.[sleutel] ?? SOORT_STANDAARD[badgeSoort(config)]?.[sleutel];

/** "1.234,5" of "-411" -- een getal zoals een Nederlander het leest. */
const nl = (getal, decimalen) =>
  getal.toLocaleString("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });

/**
 * Het vermogen van een sensor in watt, en hoe het op de badge staat.
 *
 * De drempels staan in WATT, ook als de sensor in kW meet: "tot 1000 W groen"
 * is wat de eigenaar opgaf, en een drempel die van betekenis verandert als de
 * sensor een andere eenheid heeft, is een valkuil. Boven de 1000 W staat er kW
 * met één decimaal: "4,2 kW" leest sneller dan "4.217 W".
 *
 * @returns {{watt: number, tekst: string}|null} null als er geen getal is
 */
export function vermogen(st) {
  const waarde = Number.parseFloat(st?.state);
  if (!Number.isFinite(waarde)) return null;
  const eenheid = String(st?.attributes?.unit_of_measurement ?? "W").trim();
  const factor = { W: 1, kW: 1000, MW: 1e6 }[eenheid];
  if (factor === undefined) return { watt: waarde, tekst: `${nl(waarde, Number.isInteger(waarde) ? 0 : 1)} ${eenheid}`.trim() };
  const watt = waarde * factor;
  const tekst = Math.abs(watt) >= 1000 ? `${nl(watt / 1000, 1)} kW` : `${nl(Math.round(watt), 0)} W`;
  return { watt, tekst };
}

/**
 * In welke band dit vermogen valt: `low`, `mid` of `high`.
 *
 * *"<0 tm 1000w (1kw) is groen 1kw tot 5kw is oranje en daarboven rood"* --
 * dus tot en met de eerste grens is laag, ook als het negatief is (terug-
 * leveren is geen probleem), tot en met de tweede is midden, en daarboven hoog.
 */
export function energieBand(watt, config) {
  const eerste = Number(standaard(config, "energy_green_max"));
  const tweede = Number(standaard(config, "energy_orange_max"));
  if (!Number.isFinite(watt)) return null;
  if (watt <= eerste) return "low";
  if (watt <= tweede) return "mid";
  return "high";
}

/** De kleursleutel van een band, uit de config of de standaard. */
export const energieKleur = (band, config) =>
  band ? standaard(config, { low: "energy_color_low", mid: "energy_color_mid", high: "energy_color_high" }[band]) : null;

/** "armed_home, armed_night" -> ["armed_home", "armed_night"], zonder hoofdletters. */
const lijst = (tekst) =>
  String(tekst ?? "")
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** De standen van een alarm, in de volgorde waarin ze getoetst worden. */
export const ALARM_STANDEN = [
  { stand: "disarmed", waarden: "alarm_disarmed", kleur: "alarm_disarmed_color", tekst: "Uitgeschakeld", icoon: "alarmOff" },
  { stand: "partial", waarden: "alarm_partial", kleur: "alarm_partial_color", tekst: "Deels ingeschakeld", icoon: "alarmPartial" },
  { stand: "armed", waarden: "alarm_armed", kleur: "alarm_armed_color", tekst: "Ingeschakeld", icoon: "alarmOn" },
];

/**
 * In welke stand het alarm staat, volgens wat de eigenaar zelf invulde.
 *
 * *"status zelf invullen die ik uit de atributen haal want dat is nog wel eens
 * anders"* -- dus: een attribuut is optioneel (anders de toestand), en per
 * stand een of meer waarden, gescheiden door komma's. Hoofdletters tellen niet.
 *
 * @returns {{waarde: string, stand: object|null}} `stand` null als niets past
 */
export function alarmStand(st, config) {
  const attr = String(config?.alarm_attribute ?? "").trim();
  const ruw = attr ? st?.attributes?.[attr] : st?.state;
  const waarde = ruw === undefined || ruw === null ? "" : String(ruw);
  const zoek = waarde.trim().toLowerCase();
  const stand = zoek ? ALARM_STANDEN.find((s) => lijst(standaard(config, s.waarden)).includes(zoek)) ?? null : null;
  return { waarde, stand };
}

/** De kleursleutel van een alarmstand, uit de config of de standaard. */
export const alarmKleur = (stand, config) => (stand ? standaard(config, stand.kleur) : null);
