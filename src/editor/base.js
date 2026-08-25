/**
 * The visual editor behind every card in this package.
 *
 * Written against Home Assistant's own `ha-form` rather than a hand-rolled set
 * of inputs. That is what buys the entity picker with its search, the action
 * editor with every service in the house, and the theme and translations the
 * rest of the dialog uses -- for the price of describing the fields in a
 * schema. A card library that ships its own half of an entity picker is a
 * library that breaks the first time Home Assistant changes one.
 *
 * The editor lives in the light DOM. `ha-form` inherits the dialog's styles
 * from above, and a shadow root would cut it off from them.
 *
 * Two fields are ours because Home Assistant has no equivalent: the icon picker
 * (which shows the drawn set first) and the tone picker (which shows the token
 * palette rather than a free colour wheel, so a dashboard cannot drift off the
 * system one card at a time).
 */

import "./icon-picker.js";
import "./tone-picker.js";

/** Selector shorthands, so a card's schema reads as a list of fields. */
export const sel = {
  entity: (domains) => ({ entity: domains ? { domain: domains } : {} }),
  text: () => ({ text: {} }),
  multiline: () => ({ text: { multiline: true } }),
  bool: () => ({ boolean: {} }),
  number: (min, max, step = 1) => ({
    number: { min, max, step, mode: "box" },
  }),
  select: (options) => ({
    select: { mode: "dropdown", options },
  }),
  /**
   * Home Assistant's eigen actie-editor.
   *
   * `default_action` is niet optioneel. Zonder die sleutel staat de keuzelijst
   * op "Geen actie", en zodra het formulier één keer terugmeldt staat er
   * `{action: "none"}` in de YAML. De kaart doet dan niets en dat is dan ook
   * precies wat er geconfigureerd staat -- alleen heeft niemand het zo bedoeld.
   */
  action: (defaultAction = "more-info") => ({
    ui_action: { default_action: defaultAction },
  }),
};

/**
 * Twee velden naast elkaar.
 *
 * De lege `name` is niet decoratief: zonder die sleutel rendert ha-form het
 * raster wel maar de velden erin niet. Dat is waarom een uitklapblok met rijen
 * erin leeg opende terwijl er drie instellingen in hoorden te staan.
 */
export const row = (...schema) => ({ type: "grid", name: "", schema });

/** A collapsible block. Keeps the first screen of the editor short. */
export const section = (name, icon, schema, expanded = false) => ({
  type: "expandable",
  name,
  icon,
  expanded,
  schema,
});

/**
 * Velden die ELKE kaart in de familie heeft, en die dus niet in elk schema
 * apart horen te staan.
 *
 * Nu staat er er een: het kaartvlak. `bare: true` zat al in negen kaarten en
 * werkte ook, maar stond in geen enkele editor -- je moest het met de hand in
 * de YAML zetten, en dat weet niemand. Wie zijn dashboard zonder vlakken wil
 * (achtergrond weg, alleen de inhoud) moest daarvoor tot nu toe per kaart de
 * code-editor in.
 *
 * Onderaan het formulier, want het gaat over hoe de kaart eruitziet en niet
 * over wat erin staat.
 */
const GEDEELD = [{ name: "bare", selector: sel.bool() }];

const GEDEELDE_HELPERS = {
  bare: "Haalt de achtergrond, de rand en de schaduw onder de kaart weg. De inhoud blijft staan -- handig als de kaart al in iets anders zit, of voor een dashboard zonder vlakken.",
};

export class DacEditor extends HTMLElement {
  constructor() {
    super();
    this.config_ = {};
    this.built_ = false;
  }

  setConfig(config) {
    // The card's own defaults are merged in before the form sees the config.
    //
    // Without this a setting that defaults to on renders as an unticked box:
    // the card behaves as if it is on, the editor says it is off, and ticking
    // it appears to do nothing because it was already true. Unticking is then
    // the only control that visibly works. Seeding the defaults makes the form
    // show what the card is actually doing.
    this.config_ = { ...this.defaults(), ...config };
    this.render_();
  }

  /**
   * Values the card applies when the config is silent.
   * Keep in step with the card's own `validate()`.
   */
  defaults() {
    return {};
  }

  set hass(hass) {
    this.hass_ = hass;
    if (this.form_) this.form_.hass = hass;
    for (const el of this.pickers_ ?? []) el.hass = hass;
    this.render_();
  }

  get hass() {
    return this.hass_;
  }

  connectedCallback() {
    this.render_();
  }

  /* ------------------------------------------------------- subclass API */

  /**
   * The fields, as an `ha-form` schema.
   * @returns {Array<object>}
   */
  schema() {
    return [];
  }

  /**
   * De gedeelde velden die achter het schema van deze kaart komen.
   *
   * Een editor van een kaart zonder vlak -- de sectiekop -- geeft hier een
   * lege lijst terug. Een schakelaar die niets doet is erger dan geen
   * schakelaar.
   */
  gedeeldeVelden() {
    return GEDEELD;
  }

  /** Wat het formulier werkelijk krijgt. */
  volledigSchema_() {
    return [...this.schema(), ...this.gedeeldeVelden()];
  }

  /**
   * Fields this card wants drawn with our own pickers, in order.
   *
   * Each is `{ key, kind: "icon" | "tone", label, fallback }`. They land above
   * the form, which is right for the icon and colour of the card itself -- those
   * are the first thing you set. A picker that only makes sense *after* a choice
   * in the form -- a colour per chosen sensor, say -- sets `after: true` and
   * lands below it, in the order you would fill the editor in. `compact: true`
   * drops the frame, for a list of them.
   */
  pickers() {
    return [];
  }

  /** Dutch labels for the schema keys. */
  label(schemaItem) {
    return LABELS[schemaItem.name] ?? schemaItem.name;
  }

  /** Optional helper text under a field. */
  helper() {
    return undefined;
  }

  /* ------------------------------------------------------------ internals */

  async render_() {
    if (!this.hass_ || !this.config_) return;
    if (this.built_) {
      this.sync_();
      return;
    }
    this.built_ = true;

    // The dialog defines these before it opens an editor, but a card previewed
    // straight after a page load can get here first.
    await customElements.whenDefined("ha-form");

    this.replaceChildren();
    this.pickers_ = [];

    const pickerDefs = this.pickers();
    this.pickerSig_ = pickerDefs.map((d) => d.key).join("|");

    const bak = (marge) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = `display:flex;flex-direction:column;gap:12px;${marge}`;
      return wrap;
    };
    const voor = bak("margin-bottom:16px");
    const na = bak("margin-top:16px");

    for (const def of pickerDefs) {
      const el = document.createElement(
        def.kind === "tone" ? "dac-tone-picker" : "dac-icon-picker"
      );
      el.label = def.label;
      el.fallback = def.fallback;
      if (def.auto === false) el.auto = false;
      if (def.statuses === false) el.statuses = false;
      if (def.compact) el.compact = true;
      el.hass = this.hass_;
      el.value = this.config_[def.key];
      el.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this.patch_({ [def.key]: e.detail.value });
      });
      this.pickers_.push(el);
      el.dataset.key = def.key;
      (def.after ? na : voor).appendChild(el);
    }
    if (voor.children.length) this.appendChild(voor);

    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.data = this.config_;
    form.schema = this.volledigSchema_();
    form.computeLabel = (s) => this.label(s);
    form.computeHelper = (s) => this.helper(s) ?? GEDEELDE_HELPERS[s.name];
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      this.patch_(e.detail.value, true);
    });
    this.form_ = form;
    this.appendChild(form);
    if (na.children.length) this.appendChild(na);
  }

  sync_() {
    // Sommige kaarten hebben een kiezer per gekozen entiteit. Verandert die
    // lijst, dan moet de editor opnieuw opgebouwd worden -- pickers worden
    // eenmalig aangemaakt, anders dan het schema.
    const wanted = this.pickers().map((d) => d.key).join("|");
    if (this.pickerSig_ !== undefined && this.pickerSig_ !== wanted) {
      this.built_ = false;
      this.form_ = null;
      this.render_();
      return;
    }

    if (this.form_) {
      this.form_.hass = this.hass_;
      // Het schema kan van de config afhangen -- een naamveld per gekozen
      // persoon, een kleurkeuze per gekozen sensor. Alleen `data` bijwerken
      // laat die velden nooit verschijnen.
      this.form_.schema = this.volledigSchema_();
      this.form_.data = this.config_;
    }
    for (const el of this.pickers_ ?? []) {
      el.hass = this.hass_;
      el.value = this.config_[el.dataset.key];
    }
  }

  /**
   * Merge a change and tell the dashboard.
   *
   * `replace` is set when the whole form reports back, because ha-form removes
   * a key by omitting it -- clearing a field would otherwise be impossible.
   * Empty strings are dropped either way, so a config does not fill up with
   * keys holding nothing.
   */
  patch_(patch, replace = false) {
    const next = replace ? { ...patch } : { ...this.config_, ...patch };
    if (this.config_.type) next.type = this.config_.type;

    for (const [k, v] of Object.entries(next)) {
      if (v === "" || v === undefined || v === null) delete next[k];
    }

    this.config_ = next;
    this.sync_();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.serialize(next) },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Turn the form's own shape back into the config that gets written to YAML.
   *
   * `ha-form` works on a flat object, but a config is sometimes a list of
   * objects -- a person with a name of their own, a fraction with its colour.
   * A card that needs that expands the list into flat fields in `setConfig` and
   * folds it back here, so the dashboard never sees the editor's scaffolding.
   */
  serialize(config) {
    return config;
  }
}

/**
 * Labels shared across the family.
 *
 * Written the way an installer would say them out loud, not the way the key is
 * spelled: a customer reads "Vasthouden", never "hold_action".
 */
export const LABELS = {
  entity: "Entiteit",
  entities: "Entiteiten",
  name: "Naam",
  icon: "Icoon",
  tone: "Kleur",
  secondary: "Tweede regel",
  layout: "Vorm",
  tap_action: "Tikken",
  hold_action: "Vasthouden",
  double_tap_action: "Dubbeltikken",
  show_state: "Status tonen",
  show_name: "Naam tonen",
  show_icon: "Icoon tonen",
  fill: "Vullen",
  collapsible: "Inklapbaar",
  title: "Titel",
  subtitle: "Ondertitel",
  weather: "Weerentiteit",
  sun: "Zon-entiteit",
  person: "Persoon",
  persons: "Personen",
  covers: "Rolluiken",
  lights: "Lampen",
  sensors: "Sensoren",
  greeting: "Begroeting",
  show_clock: "Klok tonen",
  show_weather: "Weer tonen",
  show_chips: "Weerdetails tonen",
  compact: "Compact",
  columns: "Kolommen",
  group: "Groepsregel tonen",
  invert: "Open en dicht omdraaien",
  label: "Label",
  color: "Kleur",
  date_format: "Datumnotatie",
  bare: "Achtergrond weglaten",
};
