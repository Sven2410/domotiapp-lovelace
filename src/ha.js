/**
 * The thin layer between a card and Home Assistant.
 *
 * Everything a card needs to know about hass lives here: reading a state,
 * deciding whether a repaint is warranted, running the action a config asked
 * for, and turning values into Dutch the customer would use. Cards stay about
 * layout; this file stays about Home Assistant.
 */

/* ------------------------------------------------------------------ state */

export const domainOf = (entityId) => String(entityId ?? "").split(".")[0];

/** The state object, or null. Never throws on a missing entity. */
export const stateOf = (hass, entityId) =>
  (entityId && hass?.states?.[entityId]) || null;

export const attrsOf = (hass, entityId) => stateOf(hass, entityId)?.attributes ?? {};

/**
 * De eigen afbeelding van een entiteit, of null.
 *
 * Een clublogo, een profielfoto, het merk van een integratie: dat is wat de
 * entiteit zelf meebrengt, en het is specifieker dan het icoon dat het domein
 * oplevert. Alleen een icoon dat jij zelf koos wint er nog van -- vandaar dat
 * `chosenIcon` hier binnenkomt in plaats van bij elke kaart apart getoetst te
 * worden. Wie een icoon kiest wil dat icoon, niet een logo eroverheen.
 */
export const pictureOf = (hass, entityId, chosenIcon) =>
  chosenIcon ? null : attrsOf(hass, entityId).entity_picture || null;

/**
 * De kleur die een brandende lamp zelf draagt, of null.
 *
 * Een groep krijgt hier bewust niets. Home Assistant leidt de kleur van een
 * lichtgroep af uit het lid dat toevallig aan staat: zet één ledstrip op paars
 * en de hele groep meldt paars, ook al hangen er drie witte spots in. En een
 * lamp op 2700 K meldt een oranjebruine rgb-waarde, wat op een icoon leest als
 * een storing in plaats van als warm wit. Dat is geen kleur van die groep, dus
 * die geven we niet terug -- daar hoort de vaste lichtkleur.
 *
 * De test is `attributes.entity_id`: alleen groepen dragen de lijst met leden.
 * Nagekeken op een echte installatie, en dus niet op ledental: er staat daar een
 * groep met één lid, en die is even hard een groep als een groep met drie.
 */
export function lightTone(st) {
  if (!st || st.state !== "on") return null;
  const a = st.attributes ?? {};
  if (Array.isArray(a.entity_id)) return null;
  const rgb = a.rgb_color;
  return Array.isArray(rgb) && rgb.length >= 3 ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : null;
}

/** The name to show: what the config said, else the entity's own. */
export function nameOf(hass, entityId, configured) {
  if (configured) return configured;
  const a = attrsOf(hass, entityId);
  return a.friendly_name || entityId || "";
}

export const isUnavailable = (st) =>
  !st || st.state === "unavailable" || st.state === "unknown";

/**
 * Domains that have nothing to remember between presses.
 *
 * A scene, a script or a button sits at `unknown` until it is first run, and
 * that is not a fault -- it is the normal resting state. Treating it as one is
 * why a freshly added scene button greys itself out and says "Niet bereikbaar"
 * on a perfectly healthy system.
 */
const STATELESS = new Set(["scene", "script", "input_button", "button", "event"]);

export const isStateless = (entityId) => STATELESS.has(domainOf(entityId));

/** Genuinely broken, as opposed to merely never used. */
export function isDead(st) {
  if (!st) return true;
  if (st.state === "unavailable") return true;
  if (st.state === "unknown") return !isStateless(st.entity_id);
  return false;
}

/**
 * Is this entity "on" in the way a human means it?
 *
 * Covers say `open`, alarms say `armed_*`, and a climate is on unless it is
 * `off`. Treating only the literal string "on" as on is the classic reason a
 * card looks dead while the device is clearly running.
 */
export function isOn(st) {
  if (!st) return false;
  const s = st.state;
  if (s === "unavailable" || s === "unknown") return false;
  switch (domainOf(st.entity_id)) {
    case "cover":
      return s === "open" || s === "opening";
    case "alarm_control_panel":
      return s.startsWith("armed") || s === "triggered" || s === "arming";
    case "climate":
    case "water_heater":
    case "humidifier":
      return s !== "off";
    case "person":
    case "device_tracker":
      return s === "home";
    case "media_player":
      return s !== "off" && s !== "idle" && s !== "standby";
    default:
      return s === "on" || s === "playing" || s === "active" || s === "heat";
  }
}

/**
 * Kan hier een schakelaar op?
 *
 * Een schuifschakelaar belooft twee standen die blijven staan. Dat klopt voor
 * een lamp, een stopcontact of een automatisering; niet voor een scene, een
 * script of een sensor -- die hebben geen "uit" om naartoe te schuiven. Een
 * schakelaar op een sensor is geen instelling die iemand bewust kiest maar een
 * kaart die liegt, dus de kaarten laten hem daar weg, ook als de config erom
 * vraagt.
 *
 * `media_player` staat er niet bij: die heeft een eigen kaart met een aan/uit
 * die het apparaat zelf aangeeft via `supported_features`.
 */
const SCHAKELBAAR = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "automation",
  "siren",
  "humidifier",
  "remote",
  "water_heater",
]);

export const kanSchakelen = (entityId) => SCHAKELBAAR.has(domainOf(entityId));

/**
 * Has anything this card draws actually changed?
 *
 * Home Assistant hands a card a fresh hass object on every state change in the
 * whole house -- thousands of them here. Repainting on each one is what makes a
 * dashboard feel heavy on a wall tablet. State objects are replaced rather than
 * mutated, so identity comparison is both correct and cheap.
 */
export function entitiesChanged(oldHass, newHass, ids) {
  if (!oldHass) return true;
  if (oldHass.themes !== newHass.themes || oldHass.language !== newHass.language) return true;
  for (const id of ids) {
    if (!id) continue;
    if (oldHass.states?.[id] !== newHass.states?.[id]) return true;
  }
  return false;
}

/* ----------------------------------------------------------------- events */

export function fireEvent(node, type, detail = {}) {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: false })
  );
}

export const moreInfo = (node, entityId) =>
  fireEvent(node, "hass-more-info", { entityId });

/* ---------------------------------------------------------------- actions */

/** What a tap does when the config says nothing, per domain. */
export function defaultTapAction(entityId) {
  switch (domainOf(entityId)) {
    case "light":
    case "switch":
    case "fan":
    case "input_boolean":
    case "automation":
    case "siren":
      return { action: "toggle" };
    case "script":
    case "scene":
    case "input_button":
    case "button":
      return { action: "toggle" };
    default:
      return { action: "more-info" };
  }
}

/** The service that toggles a thing, per domain. */
function toggleCall(entityId) {
  const domain = domainOf(entityId);
  switch (domain) {
    case "scene":
      return ["scene", "turn_on"];
    case "script":
      return ["script", "turn_on"];
    case "input_button":
      return ["input_button", "press"];
    case "button":
      return ["button", "press"];
    case "lock":
      return ["lock", "open"];
    case "cover":
      return ["cover", "toggle"];
    case "media_player":
      return ["media_player", "media_play_pause"];
    default:
      return ["homeassistant", "toggle"];
  }
}

/**
 * Run whatever the config asked for.
 *
 * The shape is Home Assistant's own action config, so anything a customer has
 * already written for a tile or a bubble-card keeps working when they move it
 * onto one of these. `perform-action` is the current name and `call-service`
 * the old one; both are accepted, because dashboards outlive renames.
 */
export function runAction(node, hass, config, action) {
  if (!action || action.action === "none") return;

  switch (action.action) {
    case "more-info":
      moreInfo(node, action.entity || config.entity);
      break;

    case "toggle": {
      const entity = action.entity || config.entity;
      if (!entity) break;
      const [domain, service] = toggleCall(entity);
      hass.callService(domain, service, { entity_id: entity });
      break;
    }

    case "perform-action":
    case "call-service": {
      const target = action.perform_action || action.service;
      if (!target) break;
      const [domain, service] = target.split(".");
      hass.callService(domain, service, action.data ?? action.service_data ?? {}, action.target);
      break;
    }

    case "navigate":
      if (!action.navigation_path) break;
      // A path starting with # is a bubble-card pop-up on the current view.
      // history.pushState keeps it a same-view navigation instead of a reload.
      history.pushState(null, "", action.navigation_path);
      fireEvent(window, "location-changed", { replace: false });
      break;

    case "url":
      if (action.url_path) window.open(action.url_path, action.target ?? "_blank");
      break;

    case "assist":
      fireEvent(node, "show-dialog", {
        dialogTag: "ha-voice-command-dialog",
        dialogImport: () => {},
        dialogParams: {},
      });
      break;

    case "fire-dom-event":
      fireEvent(node, "ll-custom", action);
      break;

    default:
      break;
  }
}

/**
 * Wire tap / hold / double-tap onto an element.
 *
 * Alles hangt aan `click`, en de duur wordt achteraf uit `pointerdown` gelezen.
 * Dat is de derde poging en de reden dat het nu wel klopt: de vorige twee
 * hielden zelf bij of er "al" een hold gaande was, en zodra Home Assistant een
 * pointerup opslokt -- wat op een echt dashboard gebeurt, waar een kaart in
 * lagen zit die de editor niet heeft -- bleef die vlag hangen en werd élke
 * volgende tik onderdrukt. Vandaar dat het in de editor werkte en op het
 * dashboard niet.
 *
 * Zonder eigen timer is er niets dat kan blijven hangen. `click` is de eigen
 * lezing van de browser van "dit element is geactiveerd" en komt overal
 * doorheen, inclusief toetsenbord en hulptechnologie. Het verschil is dat een
 * hold nu bij loslaten afgaat in plaats van na 500 ms; dat is de prijs, en die
 * is lager dan een knop die niets doet.
 *
 * Returns a teardown function.
 */
export function bindActions(el, { onTap, onHold, onDouble }) {
  const HOLD_MS = 500;
  const DOUBLE_MS = 260;

  let downAt = 0;
  let taps = 0;
  let tapTimer = null;

  const down = (e) => {
    if (e.button != null && e.button !== 0) return;
    downAt = Date.now();
  };

  const click = () => {
    const heldFor = downAt ? Date.now() - downAt : 0;
    downAt = 0;

    if (onHold && heldFor >= HOLD_MS) {
      navigator.vibrate?.(18);
      onHold();
      return;
    }

    if (!onDouble) {
      onTap?.();
      return;
    }

    taps++;
    if (taps === 1) {
      tapTimer = setTimeout(() => {
        taps = 0;
        onTap?.();
      }, DOUBLE_MS);
      return;
    }
    clearTimeout(tapTimer);
    taps = 0;
    onDouble();
  };

  el.addEventListener("pointerdown", down);
  el.addEventListener("click", click);
  // Lang indrukken op een aanraakscherm opent anders het eigen menu van de browser.
  el.addEventListener("contextmenu", (e) => e.preventDefault());

  return () => {
    clearTimeout(tapTimer);
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("click", click);
  };
}

/* -------------------------------------------------------------- formatting */

/** Home Assistant's own translation of a state, so cards speak the UI's language. */
export function localizeState(hass, st) {
  if (!st) return "";
  const domain = domainOf(st.entity_id);
  const dc = st.attributes.device_class;
  return (
    hass.formatEntityState?.(st) ??
    hass.localize?.(`component.${domain}.entity_component.${dc ?? "_"}.state.${st.state}`) ??
    hass.localize?.(`component.${domain}.entity_component._.state.${st.state}`) ??
    st.state
  );
}

/** A number the way this Home Assistant would print it. */
export function fmtNumber(hass, value, digits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toLocaleString(hass?.locale?.language ?? "nl", {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 0,
  });
}

const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** Midnight today, so day arithmetic is not thrown off by the clock. */
export const startOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysBetween = (from, to) =>
  Math.round((startOfDay(to) - startOfDay(from)) / 86400000);

/**
 * Parse the date shapes an integration might hand us.
 *
 * Dutch waste integrations commonly emit `18-08-2026`, which `Date.parse` reads
 * as an American month-day and quietly returns either the wrong day or NaN.
 * That is worth handling explicitly rather than discovering it in December.
 */
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(+value) ? null : value;
  const s = String(value).trim();

  let m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);

  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);

  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

/**
 * How a person would say when this is: "vandaag", "morgen", "dinsdag",
 * and a plain date once it is far enough out that a weekday stops helping.
 */
export function relativeDay(date, now = new Date()) {
  if (!date) return "";
  const d = daysBetween(now, date);
  if (d < 0) return `${Math.abs(d)} dagen geleden`;
  if (d === 0) return "vandaag";
  if (d === 1) return "morgen";
  if (d === 2) return "overmorgen";
  if (d <= 6) return DAYS[date.getDay()];
  return `${DAYS[date.getDay()].slice(0, 2)} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export const shortDate = (date) =>
  date ? `${date.getDate()} ${MONTHS[date.getMonth()]}` : "";

/** "1 dag" / "3 dagen" -- the singular is not optional in Dutch. */
export const dayCount = (n) => (Math.abs(n) === 1 ? "1 dag" : `${n} dagen`);
