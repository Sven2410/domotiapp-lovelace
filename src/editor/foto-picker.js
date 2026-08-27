/**
 * Een foto kiezen: uploaden, of een pad intypen.
 *
 * WAAROM DIT ER ZELF STAAT
 *
 * De autokaart had `{ image: {} }` in zijn schema staan -- de selector waarmee
 * Home Assistant zijn eigen picture-kaart een uploadknop geeft. Gemeld op
 * 27 augustus 2026: *"ik kan geen foto uploaden voor de auto."*
 *
 * Nagemeten in de testinstance, en het klopte precies:
 *
 *     customElements.get("ha-selector-text")     -> gedefinieerd
 *     customElements.get("ha-selector-entity")   -> gedefinieerd
 *     customElements.get("ha-selector-boolean")  -> gedefinieerd
 *     customElements.get("ha-selector-select")   -> gedefinieerd
 *     customElements.get("ha-selector-number")   -> gedefinieerd
 *     customElements.get("ha-selector-image")    -> undefined, ook na 8 seconden
 *
 * `ha-selector` zet het element wél in de DOM, maar de klasse komt nooit. Het
 * resultaat is een leeg vak van nul pixels hoog: geen fout, geen knop, niets.
 * Dat is dezelfde val als valkuil 26 met `dialog-box` -- een lui geladen element
 * van Home Assistant waar je niet op kunt rekenen.
 *
 * Dus doen we het zelf. Wat hier staat is precies wat `ha-picture-upload` doet:
 * een POST naar `/api/image/upload`, en het antwoord wordt
 * `/api/image/serve/<id>/original`. Plus een tekstveld ernaast, want wie zijn
 * foto al in `/local/` heeft staan hoeft niets te uploaden.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens } from "../theme.js";
import { resolve } from "../icons.js";
import { keurBestand, serveerUrl } from "./foto-logica.js";

const css = /* css */ `
  :host { ${tokens} display: block; font-family: var(--dac-font); color: var(--dac-ink); }
  *, *::before, *::after { box-sizing: border-box; }

  .kop { font-size: 12px; color: var(--dac-ink-2); margin-bottom: 6px; }

  .vak {
    display: flex; align-items: center; gap: 12px;
    padding: 12px; border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
  }

  .voorbeeld {
    flex: 0 0 auto; width: 88px; height: 54px; overflow: hidden;
    border-radius: var(--dac-radius-sm); background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    display: grid; place-items: center;
  }
  .voorbeeld img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .voorbeeld .icon { width: 20px; height: 20px; color: var(--dac-ink-3); }

  .rechts { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 8px; }

  input[type="text"] {
    width: 100%; padding: 9px 10px; font: inherit; font-size: 13px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm); color: var(--dac-ink);
  }
  input[type="text"]:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="file"] { display: none; }

  .knoppen { display: flex; gap: 6px; flex-wrap: wrap; }
  button {
    padding: 8px 12px; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 500;
    border-radius: var(--dac-radius-pill);
    border: 1px solid var(--dac-border-hi); background: transparent; color: var(--dac-ink);
    display: inline-flex; align-items: center; gap: 6px;
  }
  button .icon { width: 14px; height: 14px; }
  button.doe { background: var(--dac-accent); border-color: var(--dac-accent); color: #fff; }
  button.weg { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
  button:disabled { opacity: .5; cursor: default; }
  @media (hover: hover) { button:not(:disabled):hover { border-color: var(--dac-accent-hi); } }

  .melding { font-size: 11.5px; color: var(--dac-ink-3); }
  .melding[data-fout="true"] { color: var(--dac-bad); }
  .melding[hidden] { display: none; }
`;

class FotoPicker extends HTMLElement {
  static get sheet_() {
    if (!Object.hasOwn(this, "s_")) this.s_ = sheet(css);
    return this.s_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [this.constructor.sheet_];
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
    this.teken_();
  }

  set value(v) {
    this.value_ = v ?? "";
    if (this.gebouwd_) this.teken_();
  }

  get value() {
    return this.value_ ?? "";
  }

  set label(v) {
    this.label_ = v;
    if (this.gebouwd_) this.teken_();
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="kop"></div>
      <div class="vak">
        <span class="voorbeeld"></span>
        <span class="rechts">
          <input type="text" placeholder="/local/auto.png" aria-label="Pad naar de afbeelding" />
          <span class="knoppen">
            <button class="doe kies" type="button">${resolve("plus")}<span>Kies een bestand</span></button>
            <button class="weg leeg" type="button">Wissen</button>
          </span>
          <span class="melding" hidden></span>
        </span>
      </div>
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" />`;
    this.gebouwd_ = true;

    const bestand = this.$('input[type="file"]');
    this.$(".kies").addEventListener("click", () => bestand.click());
    bestand.addEventListener("change", () => {
      const f = bestand.files?.[0];
      // Meteen leegmaken: kiest iemand twee keer hetzelfde bestand, dan vuurt
      // `change` anders niet nog een keer.
      bestand.value = "";
      this.upload_(f);
    });

    this.$(".leeg").addEventListener("click", () => this.zet_(""));

    const tekst = this.$('input[type="text"]');
    // Bij `change` en niet bij `input`: anders schrijft elke toetsaanslag een
    // halve URL naar de config, en herbouwt de editor zich onder je vingers
    // (valkuil 23).
    tekst.addEventListener("change", () => this.zet_(tekst.value.trim()));
  }

  teken_() {
    this.$(".kop").textContent = this.label_ ?? "Afbeelding";
    const tekst = this.$('input[type="text"]');

    // NIET `document.activeElement`. Die geeft nooit dit element terug: bij
    // focus binnen geneste shadow roots wijst hij het BUITENSTE host-element
    // aan, en dat is `home-assistant`. De toets sloeg dus nooit aan.
    //
    // Wat dat kostte, gemeld op 27 augustus 2026: *"hij springt steeds weg als
    // ik type."* De editor geeft de picker bij ELKE nieuwe `hass` zijn waarde
    // uit de config opnieuw, en dan overschreef dit wat er stond. Op een kale
    // testinstance valt dat niet op; op een installatie met 479 componenten
    // komt er meerdere keren per seconde een update binnen, en dan is het veld
    // onbruikbaar.
    //
    // `shadowRoot.activeElement` kijkt wél binnen deze root.
    const inGebruik = this.shadowRoot.activeElement === tekst;
    if (!inGebruik && tekst.value !== this.value) tekst.value = this.value;

    const vak = this.$(".voorbeeld");
    if (this.value) {
      if (vak.dataset.bron !== this.value) {
        vak.dataset.bron = this.value;
        const img = document.createElement("img");
        img.src = this.value;
        img.alt = "";
        img.onerror = () => {
          vak.dataset.bron = "";
          vak.innerHTML = resolve("car");
        };
        vak.replaceChildren(img);
      }
    } else if (vak.dataset.bron !== "") {
      vak.dataset.bron = "";
      vak.innerHTML = resolve("car");
    }
  }

  zet_(waarde) {
    this.value_ = waarde;
    this.teken_();
    this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: waarde }, bubbles: true, composed: true })
    );
  }

  melding_(tekst, fout = false) {
    const el = this.$(".melding");
    el.textContent = tekst;
    el.dataset.fout = String(fout);
    el.hidden = !tekst;
  }

  /**
   * Het bestand naar Home Assistant, en het antwoord wordt de URL.
   *
   * `hass.fetchWithAuth` bestaat niet overal; het token komt daarom rechtstreeks
   * uit de verbinding. Zonder die kop weigert Home Assistant de upload met een
   * 401, en dan lijkt het of het bestand niet deugt.
   */
  async upload_(bestand) {
    const klacht = keurBestand(bestand);
    if (klacht) return this.melding_(klacht, true);

    this.melding_("Bezig met uploaden…");
    this.$(".kies").disabled = true;
    try {
      const body = new FormData();
      body.append("file", bestand);
      const token = this.hass?.auth?.data?.access_token ?? this.hass?.auth?.accessToken;
      const antwoord = await fetch("/api/image/upload", {
        method: "POST",
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!antwoord.ok) throw new Error(`Home Assistant antwoordde met ${antwoord.status}`);
      const gegevens = await antwoord.json();
      if (!gegevens?.id) throw new Error("Home Assistant gaf geen id terug.");
      this.zet_(serveerUrl(gegevens.id));
      this.melding_("Geüpload.");
    } catch (fout) {
      this.melding_(
        `${fout?.message ?? "Uploaden lukte niet"}. Je kunt het pad ook zelf intypen, bijvoorbeeld /local/auto.png.`,
        true
      );
    } finally {
      this.$(".kies").disabled = false;
    }
  }
}

meldAan("dac-foto-picker", FotoPicker);

export { FotoPicker };
