/**
 * Icon picker: the drawn set first, Home Assistant's whole library behind it.
 *
 * The order is the point. Every icon in the grid is one of ours, drawn at the
 * same 1.6px weight, so the easy path keeps a dashboard consistent. The `mdi:`
 * field underneath is the escape hatch for the long tail -- a Bambu printer, a
 * heat pump, whatever this customer happens to own -- and it is one step
 * further away on purpose.
 *
 * Bovenaan staat sinds deze ronde een zoekveld, en dat is geen versiering. Het
 * raster telt ruim honderd iconen in dertien groepen; zolang je weet in welke
 * groep iets zit werkt scannen, en daarna niet meer. Erger nog: de sleutels
 * zijn Engels en de kaarten Nederlands, dus het woord dat je intypt -- "slapen",
 * "gordijn", "vaatwasser" -- is precies het woord dat er niet staat. Waar een
 * icoon op te vinden is staat in `icoon-zoek.js`, buiten de DOM, zodat het
 * getoetst kan worden zonder browser.
 *
 * Onder elk icoon staat nu zijn Nederlandse naam. Dat kost hoogte en het levert
 * op dat je niet meer hoeft te raden wat een tekening voorstelt: `floorB` en
 * `gaugeArrow` zijn duidelijk zodra er "begane grond" en "meter" onder staat.
 */

import { icons, resolve } from "../icons.js";
import { sheet } from "../theme.js";
import { tokens } from "../theme.js";
import { meldAan } from "../registratie.js";
import { GROEPEN, naamVan, zoekIconen } from "./icoon-zoek.js";

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

  /* Het zoekveld blijft staan terwijl het raster eronder scrollt: bij een
     zoekopdracht die niets oplevert wil je het woord kunnen aanpassen zonder
     eerst terug te scrollen. */
  .zoekrij {
    position: sticky; top: 0; z-index: 1;
    display: flex; align-items: center; gap: 8px;
    padding: 2px 0 10px;
    background: var(--card-background-color, var(--dac-bg-raise));
  }
  .zoekveld {
    flex: 1 1 auto; min-width: 0; position: relative;
    display: flex; align-items: center;
  }
  .zoekveld .loep {
    position: absolute; left: 9px; display: flex; pointer-events: none;
    color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .zoekveld .loep .icon { width: 16px; height: 16px; }
  .zoekveld input {
    width: 100%; font: inherit; font-size: 13px;
    padding: 8px 30px 8px 31px; border-radius: 9px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .zoekveld input:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  /* Een type=search krijgt van de browser zijn eigen kruisje. Naast het onze
     staan er dan twee naast elkaar, en de linker doet iets anders dan de
     rechter. Het onze blijft, want dat past bij de rest van de kiezer. */
  .zoekveld input::-webkit-search-cancel-button,
  .zoekveld input::-webkit-search-decoration { -webkit-appearance: none; appearance: none; }
  .zoekveld .wis {
    position: absolute; right: 4px; display: none; place-items: center;
    width: 24px; height: 24px; padding: 0; border: 0; border-radius: 999px;
    background: none; cursor: pointer; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .zoekveld .wis .icon { width: 15px; height: 15px; }
  :host([zoekt]) .zoekveld .wis { display: grid; }
  .zoekveld .wis:hover { color: var(--primary-text-color, var(--dac-ink)); }

  .groepen { max-height: 320px; overflow-y: auto; }

  .group + .group { margin-top: 12px; }
  .group h4 {
    margin: 0 0 6px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }

  .opt {
    display: grid; grid-template-rows: auto auto; gap: 3px;
    justify-items: center; align-content: center;
    padding: 7px 3px 5px; cursor: pointer;
    border-radius: 10px; border: 1px solid transparent; background: rgba(127,127,127,0.08);
    color: var(--primary-text-color, var(--dac-ink));
    transition: border-color 160ms ease, background 160ms ease;
  }
  .opt:hover { background: rgba(127,127,127,0.16); }
  .opt[aria-pressed="true"] {
    border-color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    color: var(--dac-accent-hi);
  }
  .opt .icon { width: 19px; height: 19px; }
  .opt .naam {
    max-width: 100%; font-size: 9.5px; line-height: 1.15; text-align: center;
    color: var(--secondary-text-color, var(--dac-ink-3));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .opt[aria-pressed="true"] .naam { color: inherit; }

  .niets {
    padding: 18px 4px; text-align: center; font-size: 12.5px;
    color: var(--secondary-text-color, var(--dac-ink-3));
  }

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

/** Een groepenlijst als HTML. Eén plek, of het nu het raster of een zoekresultaat is. */
const rasterHtml = (groepen) =>
  groepen
    .map(
      ([titel, keys]) => `
      <div class="group">
        <h4>${titel}</h4>
        <div class="grid">
          ${keys
            .map(
              (k) =>
                `<button type="button" class="opt" data-icon="${k}" title="${naamVan(k)} (${k})" aria-pressed="false">` +
                `${icons[k] ?? ""}<span class="naam">${naamVan(k)}</span></button>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

class DacIconPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.value_ = "";
    this.vraag_ = "";
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
          <div class="zoekrij">
            <span class="zoekveld">
              <span class="loep">${icons.search}</span>
              <input id="zoek" type="search" placeholder="Zoek een icoon -- slapen, gordijn, vaatwasser"
                     spellcheck="false" autocomplete="off" />
              <button type="button" class="wis" title="Zoekopdracht wissen">${icons.close}</button>
            </span>
          </div>
          <div class="groepen">${rasterHtml(GROEPEN)}</div>
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
      // Openklappen zet de aandacht in het zoekveld: negen van de tien keer is
      // dat de volgende handeling, en anders kost het niets.
      if (open) requestAnimationFrame(() => this.$("#zoek").focus());
    });

    const zoek = this.$("#zoek");
    zoek.addEventListener("input", () => this.zoek_(zoek.value));
    zoek.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this.zoek_("");
        zoek.value = "";
        return;
      }
      // Precies één treffer? Dan is Enter de knop.
      if (e.key !== "Enter") return;
      const enige = this.shadowRoot.querySelectorAll(".opt");
      if (enige.length === 1) {
        e.preventDefault();
        this.emit_(enige[0].dataset.icon);
      }
    });
    this.$(".wis").addEventListener("click", () => {
      zoek.value = "";
      this.zoek_("");
      zoek.focus();
    });

    // Eén luisteraar op de container in plaats van één per icoon: het raster
    // wordt bij elke aanslag opnieuw getekend, en dan is elke knop een nieuwe.
    this.$(".groepen").addEventListener("click", (e) => {
      const knop = e.target.closest?.(".opt");
      if (knop) this.emit_(knop.dataset.icon);
    });

    const input = this.$("#mdi");
    input.addEventListener("change", () => this.emit_(input.value.trim()));
    this.$(".clear").addEventListener("click", () => this.emit_(""));

    this.paint_();
  }

  /** Het raster opnieuw tekenen voor deze zoekopdracht. */
  zoek_(vraag) {
    this.vraag_ = vraag ?? "";
    this.toggleAttribute("zoekt", Boolean(this.vraag_.trim()));

    const groepen = zoekIconen(this.vraag_);
    const bak = this.$(".groepen");
    const leeg = groepen.length === 1 && !groepen[0][1].length;
    bak.innerHTML = leeg
      ? `<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>` +
        `Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`
      : rasterHtml(groepen);
    bak.scrollTop = 0;
    this.markeer_();
  }

  /** Welke knop de gekozen is. Los van `zoek_`, want dat raster wisselt. */
  markeer_() {
    for (const b of this.shadowRoot.querySelectorAll(".opt")) {
      b.setAttribute("aria-pressed", String(b.dataset.icon === this.value_));
    }
  }

  paint_() {
    if (!this.shadowRoot.firstElementChild) return;
    this.$(".label").textContent = this.label ?? "Icoon";

    const v = this.value_;
    const shown = v || this.fallback || "question";
    this.$(".preview").innerHTML = resolve(shown, this.fallback);
    this.$(".who b").textContent = v
      ? v.includes(":")
        ? v
        : naamVan(v)
      : this.auto
        ? "Automatisch"
        : "Kies een icoon";
    this.$(".who small").textContent = v
      ? v.includes(":")
        ? "Home Assistant-icoon"
        : `DomotiApp-icoon -- ${v}`
      : this.auto
        ? "Past zich aan de entiteit aan"
        : "Nog niets gekozen";

    this.markeer_();

    // Never write into the field while somebody is typing in it.
    //
    // Home Assistant pushes a fresh hass object at the editor on every state
    // change in the house, and the editor syncs its pickers each time. Without
    // this guard every one of those wipes the half-typed `mdi:` name, which
    // reads as "I cannot type in this field at all". Hetzelfde geldt sinds deze
    // ronde voor het zoekveld: dat wordt hier met opzet nergens aangeraakt.
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
