/**
 * Een kleur kiezen -- en verder niets.
 *
 * WAT ER OP 26 AUGUSTUS 2026 IS VERANDERD, EN WAAROM
 *
 * Deze kiezer bood eerst negen identiteitskleuren aan, daarna nog twee
 * (Automatisch en Accent), en nu geen enkele. De eigenaar, met een
 * schermafdruk erbij: *"Dan bij de kleuren. Nu staat er accent en automatisch.
 * Ik wil gewoon dat dat helemaal weg is."*
 *
 * Dat is ook wat een dashboard rustig houdt. Kleur op deze kaarten is
 * identiteit, geen versiering, en de identiteit is het accent van het merk. Een
 * knop die zelf een kleur mag kiezen is een knop die uit de rij gaat lopen.
 *
 * Daarom staat deze kiezer nog maar op ÉÉN plek: de afvalkaart, waar de kleur
 * de bak ís. Een grijze kliko naast een groene naast een oranje -- dat is geen
 * versiering maar de enige manier om te zien welke bak er woensdag aan straat
 * moet. Overal elders is de kleurkiezer uit de editor gehaald; de kaarten
 * blijven een `tone` die al in een config staat gewoon tekenen, zodat er geen
 * dashboard van uiterlijk verandert.
 *
 * WAT ER DUS OVER IS
 *
 * Eén vakje dat de systeemkleurkiezer opent, een veld voor wie liever typt
 * (`#198fd9` of `var(--primary-color)`), en een knop om hem leeg te maken.
 * Leeg betekent: de kaart kiest zelf. Dat woord staat er niet meer bij als
 * knop, want leeg is geen keuze maar de rusttoestand.
 *
 * `compact` laat het veld en de uitleg weg, voor een editor die er één per rij
 * toont.
 */

import { TONES, TONE_LABELS } from "../base.js";
import { icons } from "../icons.js";
import { sheet, tokens } from "../theme.js";
import { meldAan } from "../registratie.js";

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

  .rij { display: flex; align-items: center; gap: 8px; }
  :host([compact]) .rij { gap: 6px; }

  .sw {
    position: relative; width: 34px; height: 34px; padding: 0; cursor: pointer;
    border-radius: 10px; border: 2px solid transparent; background: var(--c);
    display: grid; place-items: center; color: #0c0c0a; flex: 0 0 auto;
  }
  :host([compact]) .sw { width: 28px; height: 28px; border-radius: 8px; }
  .sw .icon { width: 16px; height: 16px; opacity: 0; }
  .sw[aria-pressed="true"] { border-color: var(--primary-text-color, var(--dac-ink)); }
  .sw[aria-pressed="true"] .icon { opacity: 1; }

  /* Het vakje IS de knop: de systeemkleurkiezer ligt er onzichtbaar overheen.
     Leeg toont hij het hele spectrum, zodat je ziet dat er iets te kiezen valt
     in plaats van een leeg gat. */
  .sw.eigen { overflow: hidden; }
  .sw.eigen.leeg {
    background: conic-gradient(#fd0774, #dc7300, #f5c451, #039580, #129be4, #235efa, #bc10c8, #fd0774);
  }
  .sw.eigen input[type="color"] {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; border: 0; padding: 0;
  }

  input[type="text"] {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  input[type="text"]:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="text"][aria-invalid="true"] { border-color: var(--error-color, #d03b3b); }
  :host([compact]) input[type="text"] { display: none; }

  .wissen {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
    flex: 0 0 auto;
  }
  @media (hover: hover) { .wissen:hover { color: var(--primary-text-color, var(--dac-ink)); } }
  /* Zonder kleur valt er niets te wissen, en een knop die niets doet leidt af. */
  .wissen[hidden] { display: none; }
  :host([compact]) .wissen { padding: 6px 9px; font-size: 11.5px; }

  .note { margin: 10px 0 0; font-size: 11.5px; line-height: 1.45;
          color: var(--secondary-text-color, var(--dac-ink-3)); }
  :host([compact]) .note { display: none; }

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

  /**
   * De kleur die het vakje moet tonen.
   *
   * Een config van vóór deze ronde kan nog een PALETNAAM dragen (`sun`,
   * `grid_in`). Die naam staat niet meer in een lijst om uit te kiezen, maar
   * hij hoort wel te zien te zijn -- anders draagt een kaart een kleur die
   * nergens meer terug te vinden is. Vandaar de vertaling hier.
   */
  kleur_() {
    return TONES[this.value_] ?? this.value_;
  }

  build_() {
    this.shadowRoot.innerHTML = `
      <div class="label"></div>
      <div class="box">
        <div class="rij">
          <span class="sw eigen leeg" role="button" tabindex="-1" title="Kleur kiezen"
                aria-pressed="false">
            ${icons.check}
            <input type="color" aria-label="Kleur kiezen" />
          </span>
          <input id="vrij" type="text" spellcheck="false"
                 aria-label="Kleur als tekst"
                 placeholder="#198fd9 of var(--primary-color)" />
          <button type="button" class="wissen">Wissen</button>
        </div>
        <p class="note">
          Leeg laten betekent dat de kaart de kleur zelf kiest. Een eigen kleur
          mag een hexwaarde zijn of een variabele uit je thema:
          <b>var(--primary-color)</b> volgt je thema mee, een hexwaarde staat vast.
        </p>
      </div>`;

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

    const gekozen = Boolean(this.value_);
    const sw = this.$(".sw");
    sw.setAttribute("aria-pressed", String(gekozen));
    sw.classList.toggle("leeg", !gekozen);
    sw.style.setProperty("--c", gekozen ? this.kleur_() : "transparent");
    sw.title = gekozen
      ? `Kleur: ${TONE_LABELS[this.value_] ?? this.value_}`
      : "Kleur kiezen";
    if (/^#[0-9a-f]{6}$/i.test(this.kleur_())) this.$('input[type="color"]').value = this.kleur_();
    this.$(".wissen").hidden = !gekozen;

    // Nooit in het veld schrijven terwijl iemand erin typt. Home Assistant duwt
    // bij elke toestandswijziging in huis een nieuw hass-object door de editor,
    // en elke ronde zou een half getypte waarde wissen.
    const vrij = this.$("#vrij");
    if (this.shadowRoot.activeElement !== vrij) {
      const wens = this.value_ in TONES ? "" : this.value_;
      if (vrij.value !== wens) vrij.value = wens;
      vrij.setAttribute("aria-invalid", "false");
    }
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
