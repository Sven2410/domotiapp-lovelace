/**
 * Icon picker: the drawn set first, Home Assistant's whole library behind it.
 *
 * The order is the point. Every icon in the grid is one of ours, drawn at the
 * same 1.6px weight, so the easy path keeps a dashboard consistent. The `mdi:`
 * field underneath is the escape hatch for the long tail -- a Bambu printer, a
 * heat pump, whatever this customer happens to own -- and it is one step
 * further away on purpose.
 */

import { icons, resolve } from "../icons.js";
import { sheet } from "../theme.js";
import { tokens } from "../theme.js";
import { meldAan } from "../registratie.js";

/**
 * Grouped so the grid can be scanned rather than read.
 * Anything added to icons.js should be listed here too, or it will only be
 * reachable by typing its name.
 */
const GROUPS = [
  ["Woning", ["house", "floorB", "floor1", "floor2", "garage", "door", "window", "grid"]],
  ["Rolluiken", ["shutter", "shutterOpen", "awning", "garageOpen", "garageClosed", "arrowUp", "arrowDown", "stop"]],
  ["Licht en stroom", ["bulb", "bulbGroup", "switchOn", "power", "plug", "bolt", "battery"]],
  ["Personen", ["person", "people", "away"]],
  ["Apparaten", ["tv", "speaker", "camera", "car", "washer", "dishwasher", "printer", "fan", "airco", "radio"]],
  ["Afval", ["bin", "binWheeled", "calendar"]],
  ["Weer", ["sun", "cloud", "cloudSun", "rain", "snow", "fog", "wind", "drop", "uv", "sunrise", "sunset", "thermo"]],
  ["Status", ["shield", "lock", "lockOpen", "key", "wifi", "smoke", "warning", "check", "close", "clock", "gaugeArrow"]],
  ["Overig", ["star", "moon", "leaf", "cog", "dots", "plus", "minus", "chevronRight", "chevronDown", "question"]],
];

const css = /* css */ `
  :host { ${tokens} display: block; font-family: var(--dac-font); }
  *, *::before, *::after { box-sizing: border-box; }

  .label {
    font-size: 12px; font-weight: 500; margin-bottom: 6px;
    color: var(--secondary-text-color, var(--dac-ink-2));
  }

  .box {
    border: 1px solid var(--divider-color, var(--dac-border));
    border-radius: 12px; overflow: hidden;
    background: var(--card-background-color, var(--dac-bg-raise));
  }

  .current {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px;
    cursor: pointer; background: none; border: 0; width: 100%; text-align: left;
    font: inherit; color: var(--primary-text-color, var(--dac-ink));
  }
  .current:hover { background: rgba(127,127,127,0.08); }
  .current .preview {
    width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px;
    color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 32%, transparent);
  }
  .current .preview .icon, .current .preview ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
  .current .who { min-width: 0; }
  .current .who b { display: block; font-size: 13.5px; font-weight: 500; }
  .current .who small { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3)); }
  .current .caret { margin-left: auto; color: var(--secondary-text-color, var(--dac-ink-3)); }
  .current .caret .icon { width: 18px; height: 18px; transition: transform 220ms ease; }
  :host([open]) .current .caret .icon { transform: rotate(180deg); }

  .panel { display: none; border-top: 1px solid var(--divider-color, var(--dac-border)); padding: 10px 12px 12px; }
  :host([open]) .panel { display: block; }

  .group + .group { margin-top: 12px; }
  .group h4 {
    margin: 0 0 6px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 6px; }

  .opt {
    aspect-ratio: 1; display: grid; place-items: center; cursor: pointer;
    border-radius: 10px; border: 1px solid transparent; background: rgba(127,127,127,0.08);
    color: var(--primary-text-color, var(--dac-ink)); padding: 0;
    transition: border-color 160ms ease, background 160ms ease;
  }
  .opt:hover { background: rgba(127,127,127,0.16); }
  .opt[aria-pressed="true"] {
    border-color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    color: var(--dac-accent-hi);
  }
  .opt .icon { width: 19px; height: 19px; }

  .mdi { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .mdi label { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3)); white-space: nowrap; }
  .mdi input {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .mdi input:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .mdi button {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
  }
  .mdi button:hover { color: var(--primary-text-color, var(--dac-ink)); }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

class DacIconPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.value_ = "";
    this.label = "Icoon";
    this.fallback = "question";
    // Sommige velden hebben geen zinnige automatische keuze -- daar is leeg
    // laten geen instelling maar een half ingevuld formulier.
    this.auto = true;
  }

  set value(v) {
    this.value_ = v ?? "";
    if (this.built_) this.paint_();
  }

  get value() {
    return this.value_;
  }

  connectedCallback() {
    if (this.built_) return;
    this.built_ = true;
    this.build_();
  }

  build_() {
    this.shadowRoot.innerHTML = `
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${icons.chevronDown}</span>
        </button>
        <div class="panel">
          ${GROUPS.map(
            ([title, keys]) => `
            <div class="group">
              <h4>${title}</h4>
              <div class="grid">
                ${keys
                  .map(
                    (k) =>
                      `<button type="button" class="opt" data-icon="${k}" title="${k}" aria-pressed="false">${icons[k] ?? ""}</button>`
                  )
                  .join("")}
              </div>
            </div>`
          ).join("")}
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`;

    this.$(".current").addEventListener("click", () => {
      const open = this.toggleAttribute("open");
      this.$(".current").setAttribute("aria-expanded", String(open));
    });

    this.shadowRoot.querySelectorAll(".opt").forEach((b) =>
      b.addEventListener("click", () => this.emit_(b.dataset.icon))
    );

    const input = this.$("#mdi");
    input.addEventListener("change", () => this.emit_(input.value.trim()));
    this.$(".clear").addEventListener("click", () => this.emit_(""));

    this.paint_();
  }

  paint_() {
    if (!this.shadowRoot.firstElementChild) return;
    this.$(".label").textContent = this.label ?? "Icoon";

    const v = this.value_;
    const shown = v || this.fallback || "question";
    this.$(".preview").innerHTML = resolve(shown, this.fallback);
    this.$(".who b").textContent = v || (this.auto ? "Automatisch" : "Kies een icoon");
    this.$(".who small").textContent = v
      ? v.includes(":")
        ? "Home Assistant-icoon"
        : "DomotiApp-icoon"
      : this.auto
        ? "Past zich aan de entiteit aan"
        : "Nog niets gekozen";

    this.shadowRoot
      .querySelectorAll(".opt")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.icon === v)));

    // Never write into the field while somebody is typing in it.
    //
    // Home Assistant pushes a fresh hass object at the editor on every state
    // change in the house, and the editor syncs its pickers each time. Without
    // this guard every one of those wipes the half-typed `mdi:` name, which
    // reads as "I cannot type in this field at all".
    const input = this.$("#mdi");
    if (this.shadowRoot.activeElement === input) return;
    const mdi = v && v.includes(":") ? v : "";
    if (input.value !== mdi) input.value = mdi;
  }

  emit_(value) {
    this.value_ = value;
    this.paint_();
    this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true })
    );
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }
}

meldAan("dac-icon-picker", DacIconPicker);
