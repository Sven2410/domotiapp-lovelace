/**
 * The base every DomotiApp card is built on -- no framework, no build step.
 *
 * Er zitten drie taken in, en ze staan bewust uit elkaar.
 *
 *   template()  bouwt de DOM, eenmalig per config.
 *   wire()      hangt listeners op, bij ELKE keer dat de kaart in de pagina komt.
 *   paint()     schrijft waarden in de bestaande DOM, bij elke relevante wijziging.
 *
 * Dat `wire()` bij elke aankoppeling opnieuw draait is geen netheid maar een
 * noodzaak. Home Assistant haalt kaarten los en hangt ze terug: een sections-view
 * verplaatst ze tijdens het opbouwen, en views worden in de cache gezet en weer
 * teruggezet. Elke losmaking ruimt de listeners op. Werd er daarna niet opnieuw
 * gekoppeld, dan staat er een kaart die er perfect uitziet en nergens meer op
 * reageert -- terwijl hij in de kaarteditor wel werkt, want daar wordt niets
 * verplaatst. Precies die val staat ook in domotiapp-coach/frontend/src/base.js
 * beschreven; deze klasse trapte er alsnog in.
 *
 * `paint()` schrijft in de bestaande DOM in plaats van innerHTML opnieuw te
 * bouwen. Dat laatste zou minder code zijn en zou ook focus, een half afgemaakte
 * sleepbeweging en de scrollpositie weggooien -- elke keer dat er ergens in huis
 * iets veranderde.
 */

import { baseCss, sheet, tokens } from "./theme.js";
import { entitiesChanged } from "./ha.js";
import { gemetenRijen, volgRaster } from "./rasterhoogte.js";
import { meldAan, meldInKiezer } from "./registratie.js";

const hostCss = /* css */ `
  :host {
    ${tokens}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`;

/**
 * The palette a config may name.
 *
 * Names rather than hex, so a customer's dashboard follows the token file when
 * it moves. `status` names are separated in the editor, because handing someone
 * a colour called "good" to use as decoration is how status stops meaning
 * anything.
 */
export const TONES = {
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

export const TONE_LABELS = {
  accent: "Accent",
  solar: "Oranje",
  house: "Blauw",
  water: "Lichtblauw",
  magenta: "Magenta",
  pink: "Roze",
  teal: "Groenblauw",
  lit: "Lampgeel",
  good: "Goed",
  warn: "Let op",
  bad: "Kritiek",
  neutral: "Neutraal",
};

/**
 * Tekst uit een config die via innerHTML op het scherm komt.
 *
 * Elke kaart bouwt zijn DOM met een template-string, en een naam of een optie
 * die iemand zelf heeft ingetypt gaat daar doorheen. Zonder dit is een naam met
 * een < erin genoeg om de kaart te verbouwen.
 */
export const escapeHtml = (tekst) =>
  String(tekst ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A tone name, a CSS variable, or a plain colour -- all end up usable. */
export const toneValue = (tone, fallback = "accent") =>
  TONES[tone] ?? (tone && /[#(]|^var/.test(tone) ? tone : TONES[fallback]);

/**
 * Marks a config that is valid YAML but not yet pointed at anything.
 *
 * A Symbol rather than a string key, so it can never collide with a setting and
 * never ends up written back into somebody's dashboard YAML.
 */
export const INCOMPLETE = Symbol("incomplete");

/** Say what is missing, in the card's own shape. */
const placeholder = (message) => `
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${message}</span></span>
  </div>`;

/**
 * Home Assistant's sections-raster: een rij is 56px hoog met 8px ertussen.
 *
 * Een kaart van n rijen is dus 64n - 8 pixels. Die maat staat hier omdat elke
 * kaart in de familie dezelfde hoogte moet halen als een Mushroom-kaart ernaast
 * -- een kolom waarin de ene kaart 56 en de andere 64 hoog is, leest als slordig
 * werk, ook al klopt elke kaart op zichzelf.
 */
export const ROW_H = 56;
export const ROW_GAP = 8;
export const rowsFor = (px) => Math.max(1, Math.ceil((px + ROW_GAP) / (ROW_H + ROW_GAP)));

export class DacCard extends HTMLElement {
  /** Component-specific CSS, overridden by subclasses. */
  static css = "";

  static get styleSheets_() {
    if (!Object.hasOwn(this, "sheets_")) {
      this.sheets_ = [sheet(hostCss + baseCss + this.css)];
    }
    return this.sheets_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = new.target.styleSheets_;
    this.built_ = false;
    this.wired_ = false;
    this.teardown_ = [];
    this.bewaakFocusRing_();
  }

  /**
   * Haalt de focusring weg die blijft staan nadat een pop-up gesloten is.
   *
   * WAT ER GEBEURT
   *
   * Tik op een kaart die `more-info` opent. Home Assistant zet de focus op het
   * element dat de dialoog opende, en geeft die focus terug zodra de dialoog
   * dichtgaat. Die teruggave is PROGRAMMATISCH, en dan matcht `:focus-visible`
   * wél -- ook als je met je vinger of je muis was begonnen. Resultaat: een
   * accentkleurige ring om de kaart, die blijft staan tot je ergens anders
   * tikt. Op 26 augustus 2026 gemeten op de rookmelderkaart:
   * `matches(":focus-visible") === true`, `outline: 2px solid rgb(25,143,217)`.
   *
   * Dit is dus NIET dezelfde fout als de blijvende hover (valkuil 14). Die zat
   * in de opmaak en is met een mediaquery opgelost; deze zit in de focus en
   * blijft daarna over. Ze zagen er alleen hetzelfde uit.
   *
   * WAAROM DE RING NIET GEWOON WEG MAG
   *
   * Omdat hij voor een toetsenbordgebruiker het enige is dat laat zien waar hij
   * staat. Daarom wordt er niet op de ring gestuurd maar op de MANIER waarop de
   * focus kwam: was de laatste handeling in deze kaart een tik of een klik, en
   * matcht het element daarna toch `:focus-visible`, dan is dat een teruggave
   * en gaat de focus eraf. Kwam de laatste handeling van het toetsenbord, dan
   * blijft alles staan.
   *
   * Een gewone muisklik raakt dit niet: die geeft `:focus` maar geen
   * `:focus-visible`, en dan gebeurt hier niets.
   */
  bewaakFocusRing_() {
    let tik = 0;
    let toets = 0;

    this.shadowRoot.addEventListener("pointerdown", () => { tik = Date.now(); }, true);
    this.shadowRoot.addEventListener("keydown", () => { toets = Date.now(); }, true);

    this.shadowRoot.addEventListener(
      "focusin",
      (e) => {
        if (toets >= tik) return;
        const doel = e.target;
        // Velden waarin je typt of kiest houden hun focus: die hebben hem nodig.
        if (!doel?.matches || doel.matches("input, textarea, select, [contenteditable]")) return;
        // Pas ná deze tik meten: op het moment van focusin heeft de browser zijn
        // oordeel over :focus-visible nog niet altijd klaar.
        requestAnimationFrame(() => {
          if (toets >= tik) return;
          if (doel.isConnected && doel.matches(":focus-visible")) doel.blur?.();
        });
      },
      true,
    );
  }

  /* ------------------------------------------------ Lovelace contract */

  setConfig(config) {
    const next = this.validate(config ?? {});
    this.config = next;
    // A config edit can change the shape of the card, not just its values, so
    // the DOM is thrown away rather than patched. This runs on every keystroke
    // in the editor's preview and nowhere else.
    if (this.built_) {
      this.destroy_();
      this.shadowRoot.replaceChildren();
      this.built_ = false;
      this.wired_ = false;
    }
    if (this.isConnected) this.build_();
  }

  set hass(hass) {
    const prev = this.hass_;
    this.hass_ = hass;
    if (!this.config) return;
    if (!this.built_) {
      this.build_();
      return;
    }
    // Nothing to repaint, and `watched()` would be reaching into a config that
    // has no entities in it yet.
    if (this.config[INCOMPLETE]) return;
    if (entitiesChanged(prev, hass, this.watched())) this.paint();
  }

  get hass() {
    return this.hass_;
  }

  connectedCallback() {
    if (!this.config) return;
    if (!this.built_) {
      this.build_();
      return;
    }
    // Een kaart die nog nergens op wijst heeft alleen een uitlegkaart in zijn
    // shadow root staan. `wire()` zou daar naar knoppen zoeken die er niet zijn.
    if (this.config[INCOMPLETE]) return;
    // De DOM staat er nog, de listeners niet meer: opnieuw koppelen.
    if (!this.wired_) {
      this.wire();
      this.wired_ = true;
      if (this.hass_) this.paint();
    }
  }

  disconnectedCallback() {
    this.destroy_();
    this.wired_ = false;
  }

  /* ------------------------------------------------------- subclass API */

  /** Check and normalise the config. Throw a readable message when it is wrong. */
  validate(config) {
    return config;
  }

  /** Entity ids whose changes should repaint this card. */
  watched() {
    return this.config?.entity ? [this.config.entity] : [];
  }

  /** HTML for the shadow root. Built once per config. */
  template() {
    return "";
  }

  /** Wire listeners onto the freshly built DOM. Push teardowns onto `this.teardown_`. */
  wire() {}

  /** Write current values into the built DOM. Runs on every relevant change. */
  paint() {}

  /* ------------------------------------------------------------ internals */

  build_() {
    const tpl = document.createElement("template");
    // A card that has been added but not yet pointed at anything explains
    // itself instead of throwing. `setConfig` runs on every keystroke in the
    // editor, and it runs once with an empty stub the moment a card is picked
    // from the list -- throwing there replaces the preview with "Ongeldige
    // configuratie", which names neither the card nor what is missing.
    const missing = this.config?.[INCOMPLETE];
    tpl.innerHTML = missing ? placeholder(missing) : this.template();
    this.shadowRoot.appendChild(tpl.content);
    this.built_ = true;
    if (missing) {
      // Ook de uitlegkaart hoort op een rasterrij uit te komen; anders begint
      // de kaart eronder op een halve rij zolang er nog niets gekozen is.
      this.teardown_.push(volgRaster(this.$(".needs")));
      return;
    }
    this.wire();
    this.wired_ = true;
    if (this.hass_) this.paint();
  }

  destroy_() {
    for (const fn of this.teardown_) {
      try {
        fn();
      } catch {
        // A listener that is already gone is not worth breaking a repaint over.
      }
    }
    this.teardown_ = [];
  }

  /**
   * Een luisteraar die zichzelf opruimt.
   *
   * Gebruik deze in `wire()` en nergens `addEventListener` rechtstreeks. Sinds
   * `wire()` bij elke aankoppeling opnieuw draait, stapelt een kale luisteraar
   * zich op: na drie keer verplaatsen telt één tik op de plusknop van de
   * thermostaat drie keer, en springt hij met anderhalve graad. Dat is precies
   * hoe dat gemeld werd.
   */
  on(el, type, fn, opts) {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    this.teardown_.push(() => el.removeEventListener(type, fn, opts));
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  $$(sel) {
    return [...this.shadowRoot.querySelectorAll(sel)];
  }

  /** Set text only when it differs -- a no-op write still costs a layout pass. */
  text(sel, value) {
    const el = typeof sel === "string" ? this.$(sel) : sel;
    if (el && el.textContent !== String(value)) el.textContent = value;
  }

  /** How many rows this card takes in a masonry column. */
  getCardSize() {
    return 1;
  }

  /**
   * De ondergrens in rasterrijen die deze kaart aan Home Assistant opgeeft.
   *
   * Zie `gemetenRijen` in rasterhoogte.js voor waarom dit moet: zonder eerlijke
   * ondergrens mag iemand het vak kleiner slepen dan de inhoud, en dan schildert
   * de kaart over zijn buurman heen. De schatting is er voor de allereerste
   * aanroep, vóór de eerste meting; Home Assistant vraagt het bij de volgende
   * `hass` opnieuw en dan klopt het getal.
   */
  minRijen_(selector = ".card", schatting = 1) {
    return gemetenRijen(this.$(selector)) ?? schatting;
  }
}

/**
 * Meld een kaart aan bij de kaartkiezer en zet hem in de registratiewachtrij.
 *
 * Hier wordt niets gedefinieerd. Dat gebeurt in `registratie.js`, zodra Home
 * Assistants eigen frontend geladen is -- registreren we eerder, dan landen we
 * in de verkeerde custom-element-registry en is de kaart onzichtbaar zonder dat
 * er ergens een fout verschijnt. Zie dat bestand voor het hele verhaal.
 *
 * De dubbele-laadwacht die hier stond zit nu in de wachtrij zelf: die slaat een
 * naam over die al bestaat. HACS en een handmatige resource die naar hetzelfde
 * bestand wijzen is iets dat één keer gebeurt, en het mag geen dashboard slopen.
 */
export function registerCard(tag, cls, { name, description, preview = true } = {}) {
  meldAan(tag, cls);
  meldInKiezer({ type: tag, name, description, preview });
}

/** Register an editor element. Same deferred registration. */
export function registerEditor(tag, cls) {
  meldAan(tag, cls);
}
