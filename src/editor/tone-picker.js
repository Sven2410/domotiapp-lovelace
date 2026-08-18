/**
 * Tone picker: the token palette first, an own colour behind it.
 *
 * The order is the point, the same way it is in the icon picker. Every swatch in
 * the rows is one of the system tones, so the easy path keeps a dashboard
 * consistent. An own colour is the escape hatch for the cases the palette does
 * not cover -- a customer's brand, a bin colour their council uses, a strip that
 * has to match the lamp above it -- and it is one step further away on purpose.
 *
 * The named rows mean different things and stay split:
 *
 *   Identiteit -- what a thing *is*. Safe to use decoratively.
 *   Status     -- how a thing *is doing*. Reserved, and the picker says so.
 *
 * `var(--iets)` is accepted next to a hex value, and that is the interesting
 * half: it lets a colour follow the Home Assistant theme instead of being
 * frozen into one card's config. `var(--primary-color)` on six cards is one
 * decision; `#198fd9` on six cards is six.
 *
 * `compact` leaves out the frame and the explanation, for editors that show one
 * of these per row in a list.
 */

import { TONES, TONE_LABELS } from "../base.js";
import { icons } from "../icons.js";
import { sheet, tokens } from "../theme.js";
import { meldAan } from "../registratie.js";

const IDENTITY = ["accent", "solar", "house", "water", "magenta", "pink", "teal", "lit", "neutral"];
const STATUS = ["good", "warn", "bad"];

/** Wat `toneValue` in base.js als losse kleur doorlaat, en dus wat wij toestaan. */
const EIGEN = /^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i;

const css = /* css */ `
  :host { ${tokens} display: block; font-family: var(--dac-font); }
  *, *::before, *::after { box-sizing: border-box; }

  .label { font-size: 12px; font-weight: 500; margin-bottom: 6px;
           color: var(--secondary-text-color, var(--dac-ink-2)); }

  .box {
    border: 1px solid var(--divider-color, var(--dac-border));
    border-radius: 12px; padding: 12px;
    background: var(--card-background-color, var(--dac-bg-raise));
  }
  :host([compact]) .box { border: 0; padding: 0; background: none; }
  :host([compact]) .label { font-size: 11.5px; margin-bottom: 5px; }

  h4 { margin: 0 0 7px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
       text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3)); }
  h4 + .row { margin-bottom: 14px; }
  .row:last-child { margin-bottom: 0; }

  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  :host([compact]) .row { gap: 6px; }

  .sw {
    position: relative; width: 34px; height: 34px; padding: 0; cursor: pointer;
    border-radius: 10px; border: 2px solid transparent; background: var(--c);
    display: grid; place-items: center; color: #0c0c0a;
  }
  :host([compact]) .sw { width: 28px; height: 28px; border-radius: 8px; }
  .sw .icon { width: 16px; height: 16px; opacity: 0; }
  .sw[aria-pressed="true"] { border-color: var(--primary-text-color, var(--dac-ink)); }
  .sw[aria-pressed="true"] .icon { opacity: 1; }
  .sw.auto {
    background: repeating-linear-gradient(45deg,
      rgba(127,127,127,.25) 0 5px, transparent 5px 10px);
    color: var(--primary-text-color, var(--dac-ink));
  }

  /* De eigen kleur is een echte kleurkiezer van het systeem, met het invoerveld
     eroverheen gelegd zodat de swatch zelf de knop is. */
  .eigen { position: relative; overflow: hidden; }
  .eigen.leeg {
    background: conic-gradient(#fd0774, #dc7300, #f5c451, #039580, #129be4, #235efa, #bc10c8, #fd0774);
  }
  .eigen input[type="color"] {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; border: 0; padding: 0;
  }

  .vrij { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .vrij label { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3));
                white-space: nowrap; }
  .vrij input[type="text"] {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .vrij input[type="text"]:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .vrij input[type="text"][aria-invalid="true"] { border-color: var(--error-color, #d03b3b); }
  .vrij button {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
  }
  .vrij button:hover { color: var(--primary-text-color, var(--dac-ink)); }
  :host([compact]) .vrij { display: none; }

  .note { margin: 10px 0 0; font-size: 11.5px; line-height: 1.45;
          color: var(--secondary-text-color, var(--dac-ink-3)); }

  .chosen { margin-top: 10px; font-size: 12px; color: var(--secondary-text-color, var(--dac-ink-2)); }
  .chosen b { color: var(--primary-text-color, var(--dac-ink)); font-weight: 500; }
  :host([compact]) .chosen, :host([compact]) .note { display: none; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

class DacTonePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.value_ = "";
    this.label = "Kleur";
    // Statuskleuren staan er niet in. Kleur is op deze kaarten identiteit -- wat
    // iets ís -- en geen oordeel. Goed, let op en kritiek blijven van de kaart
    // zelf: thuis of weg, brandt of niet. Ze uitdelen als decoratie is hoe rood
    // ophoudt iets te betekenen.
    this.statuses = false;
  }

  set value(v) {
    this.value_ = v ?? "";
    if (this.built_) this.paint_();
  }

  get value() {
    return this.value_;
  }

  set compact(v) {
    this.toggleAttribute("compact", Boolean(v));
  }

  get compact() {
    return this.hasAttribute("compact");
  }

  connectedCallback() {
    if (this.built_) return;
    this.built_ = true;
    this.build_();
  }

  /** Een kleur die geen naam uit het palet is, is een eigen kleur. */
  eigen_() {
    return Boolean(this.value_) && !(this.value_ in TONES);
  }

  swatch(key) {
    return `<button type="button" class="sw" data-tone="${key}" style="--c:${TONES[key]}"
      title="${TONE_LABELS[key]}" aria-label="${TONE_LABELS[key]}" aria-pressed="false">${icons.check}</button>`;
  }

  build_() {
    this.shadowRoot.innerHTML = `
      <div class="label"></div>
      <div class="box">
        ${this.statuses ? "<h4>Identiteit</h4>" : ""}
        <div class="row">
          <button type="button" class="sw auto" data-tone="" title="Automatisch"
            aria-label="Automatisch" aria-pressed="false">${icons.check}</button>
          ${IDENTITY.map((k) => this.swatch(k)).join("")}
          <span class="sw eigen leeg" title="Eigen kleur" aria-pressed="false">
            ${icons.check}
            <input type="color" aria-label="Eigen kleur kiezen" />
          </span>
        </div>
        ${
          this.statuses
            ? `<h4>Status</h4>
               <div class="row">${STATUS.map((k) => this.swatch(k)).join("")}</div>
               <p class="note">
                 Statuskleuren betekenen iets: goed, let op, kritiek. Gebruik ze niet om
                 een kaart mooier te maken &mdash; dan zegt rood straks niets meer.
               </p>`
            : ""
        }
        <div class="vrij">
          <label for="vrij">Of eigen kleur</label>
          <input id="vrij" type="text" spellcheck="false" placeholder="#198fd9 of var(--primary-color)" />
          <button type="button" class="wissen">Wissen</button>
        </div>
        <p class="note vrijnote">
          Een eigen kleur mag een hexwaarde zijn of een variabele uit je thema.
          <b>var(--primary-color)</b> volgt je thema mee; een hexwaarde staat vast.
        </p>
        <div class="chosen"></div>
      </div>`;

    this.shadowRoot.querySelectorAll("button.sw").forEach((b) =>
      b.addEventListener("click", () => this.emit_(b.dataset.tone))
    );

    // De systeemkiezer geeft altijd een hexwaarde terug. `input` volgt de
    // schuifknoppen live, wat hier precies goed is: de kaart ernaast kleurt mee
    // terwijl je kiest.
    const kleur = this.$('input[type="color"]');
    kleur.addEventListener("input", () => this.emit_(kleur.value));

    const vrij = this.$("#vrij");
    vrij.addEventListener("change", () => {
      const v = vrij.value.trim();
      if (!v) {
        this.emit_("");
        return;
      }
      const ok = EIGEN.test(v);
      vrij.setAttribute("aria-invalid", String(!ok));
      if (ok) this.emit_(v);
    });
    this.$(".wissen").addEventListener("click", () => this.emit_(""));

    this.paint_();
  }

  paint_() {
    if (!this.shadowRoot.firstElementChild) return;
    this.$(".label").textContent = this.label ?? "Kleur";

    const eigen = this.eigen_();
    this.shadowRoot
      .querySelectorAll("button.sw")
      .forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.tone || "") === this.value_)));

    const swEigen = this.$(".eigen");
    swEigen.setAttribute("aria-pressed", String(eigen));
    swEigen.classList.toggle("leeg", !eigen);
    swEigen.style.setProperty("--c", eigen ? this.value_ : "transparent");
    swEigen.title = eigen ? `Eigen kleur: ${this.value_}` : "Eigen kleur";
    if (eigen && /^#[0-9a-f]{6}$/i.test(this.value_)) this.$('input[type="color"]').value = this.value_;

    // Nooit in het veld schrijven terwijl iemand erin typt. Home Assistant duwt
    // bij elke toestandswijziging in huis een nieuw hass-object door de editor,
    // en elke ronde zou een half getypte waarde wissen.
    const vrij = this.$("#vrij");
    if (this.shadowRoot.activeElement !== vrij) {
      const wens = eigen ? this.value_ : "";
      if (vrij.value !== wens) vrij.value = wens;
      vrij.setAttribute("aria-invalid", "false");
    }

    this.$(".chosen").innerHTML = !this.value_
      ? `Gekozen: <b>Automatisch</b> &mdash; de kaart kiest op domein en toestand.`
      : eigen
        ? `Gekozen: <b>${this.value_}</b> &mdash; eigen kleur.`
        : `Gekozen: <b>${TONE_LABELS[this.value_] ?? this.value_}</b>`;
  }

  emit_(value) {
    this.value_ = value ?? "";
    this.paint_();
    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: this.value_ },
        bubbles: true,
        composed: true,
      })
    );
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }
}

meldAan("dac-tone-picker", DacTonePicker);
