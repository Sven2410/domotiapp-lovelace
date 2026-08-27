/**
 * De sleeptimer: nog even muziek, en dan zachtjes uit.
 *
 * Gevraagd op 27 augustus 2026: *"Dan wil ik een sleeptimer hebben, hier wil ik
 * zelf de minuten in kunnen zetten. Als ik hem start dan loopt de tijd af en dan
 * wordt op de speaker die geselecteerd is fade out toegepast bij het eind."*
 *
 * ## Wat hier NIET gebeurt
 *
 * Het aftellen. Dat doet Home Assistant, in
 * `custom_components/domotiapp_lovelace/media/sleeptimer.py`. Dit scherm zet de
 * timer, vraagt zijn stand op en telt zichtbaar af -- maar het is niet de klok.
 * Was het dat wel, dan zou de muziek doorspelen zodra de telefoon in het
 * nachtkastje verdwijnt, en dat is precies het moment waarop een sleeptimer zijn
 * werk hoort te doen.
 *
 * Dat verschil is ook waarom het aftellen hier uit `ends_at` wordt gerekend en
 * niet uit een eigen teller: een browser die twintig minuten geslapen heeft,
 * heeft twintig tikken gemist maar de eindtijd staat nog.
 *
 * ## Waarom dit aan `document.body` hangt
 *
 * Zelfde reden als bij het zoekscherm, de bronkiezer en de speakerkiezer: een
 * `position: fixed` binnen een kolom met `overflow` of `transform` wordt tegen
 * die kolom uitgelijnd in plaats van tegen het scherm.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens } from "../theme.js";
import { resolve } from "../icons.js";
import { nameOf } from "../ha.js";
import { FADE_STANDAARD, SNELKEUZES, alsKlok, minutenUit } from "./sleeptimer-logica.js";

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 88%, transparent);
    backdrop-filter: blur(14px);
    display: grid; place-items: center; padding: 16px;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* Zie valkuil 29: mét border-box hierboven, want dit vak heeft padding en
     stond eerder over allebei de schermranden heen op een telefoon. */
  .vak {
    width: min(360px, 100%); padding: 20px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow-float);
    display: flex; flex-direction: column; gap: 14px;
  }

  header { display: flex; align-items: center; gap: 10px; }
  header .ic { width: 22px; height: 22px; color: var(--dac-accent-hi); flex: 0 0 auto; }
  header .t { flex: 1 1 auto; min-width: 0; }
  header h2 { margin: 0; font-size: 16px; font-weight: 600; }
  header .waar {
    display: block; font-size: 12px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  header .sluit {
    width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center;
    border: 0; background: transparent; color: var(--dac-ink-2);
    border-radius: var(--dac-radius-pill); cursor: pointer;
  }
  header .sluit .icon { width: 18px; height: 18px; }

  /* ---- er loopt er een ---- */
  .loopt { display: none; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 2px; }
  :host([loopt]) .loopt { display: flex; }
  .loopt .rest {
    font-size: 40px; font-weight: 600; letter-spacing: -.02em;
    font-variant-numeric: tabular-nums; color: var(--dac-ink); line-height: 1;
  }
  .loopt .uitleg { font-size: 12px; color: var(--dac-ink-3); text-align: center; }

  /* ---- instellen ---- */
  .instel { display: flex; flex-direction: column; gap: 12px; }
  :host([loopt]) .instel { display: none; }

  .snel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .snel button {
    padding: 10px 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-s); color: var(--dac-ink);
    font-variant-numeric: tabular-nums;
  }
  .snel button[aria-pressed="true"] {
    border-color: var(--dac-accent-hi); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
  }
  @media (hover: hover) { .snel button:hover { border-color: var(--dac-border-hi); } }

  label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dac-ink-2); }
  .veld { display: flex; align-items: center; gap: 8px; }
  input {
    flex: 1 1 auto; min-width: 0; padding: 11px 12px;
    font: inherit; font-size: 15px; font-variant-numeric: tabular-nums;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-s); color: var(--dac-ink);
  }
  input:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .eenheid { font-size: 12.5px; color: var(--dac-ink-3); flex: 0 0 auto; }

  .fout { font-size: 12px; color: var(--dac-bad); }
  .fout[hidden] { display: none; }

  .knoppen { display: flex; gap: 8px; }
  .knoppen button {
    flex: 1 1 0; padding: 12px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border-radius: var(--dac-radius-s); border: 1px solid var(--dac-border-hi);
    background: transparent; color: var(--dac-ink);
  }
  .knoppen button.doe {
    background: var(--dac-accent); border-color: var(--dac-accent);
    color: #fff;
  }
  .knoppen button.weg { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
  .knoppen button[hidden] { display: none; }
`;

class SleepTimer extends HTMLElement {
  static get sheet_() {
    if (!Object.hasOwn(this, "s_")) this.s_ = sheet(css);
    return this.s_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [this.constructor.sheet_];
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-label="Sleeptimer">
          <header>
            <span class="ic">${resolve("sleep")}</span>
            <span class="t">
              <h2>Sleeptimer</h2>
              <span class="waar"></span>
            </span>
            <button class="sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
          </header>

          <div class="loopt">
            <span class="rest" aria-live="polite">--:--</span>
            <span class="uitleg"></span>
          </div>

          <div class="instel">
            <div class="snel"></div>
            <label>
              Of typ het zelf
              <span class="veld">
                <input class="min" type="number" inputmode="numeric" min="1" max="720"
                       aria-label="Minuten" />
                <span class="eenheid">minuten</span>
              </span>
            </label>
            <label>
              Uitfaden aan het eind
              <span class="veld">
                <input class="fade" type="number" inputmode="numeric" min="0" max="600"
                       aria-label="Seconden uitfaden" />
                <span class="eenheid">seconden</span>
              </span>
            </label>
            <span class="fout" hidden></span>
          </div>

          <div class="knoppen">
            <button class="weg" type="button" hidden>Timer stoppen</button>
            <button class="doe" type="button">Starten</button>
          </div>
        </div>
      </div>`;

    this.$(".snel").innerHTML = SNELKEUZES.map(
      (m) => `<button type="button" data-m="${m}" aria-pressed="false">${m}</button>`
    ).join("");

    this.$(".sluit").addEventListener("click", () => this.dicht_());
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.dicht_();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.dicht_();
      // Enter in een van de velden start hem. Wie een getal typt, wil niet
      // daarna nog met de muis naar een knop.
      if (e.key === "Enter" && !this.hasAttribute("loopt")) this.start_();
    });

    this.$(".snel").addEventListener("click", (e) => {
      const knop = e.target.closest("[data-m]");
      if (!knop) return;
      this.$(".min").value = knop.dataset.m;
      this.markeer_();
    });
    // Typen in het veld haalt de markering van de snelknop weg, tenzij het
    // toevallig hetzelfde getal is.
    this.$(".min").addEventListener("input", () => this.markeer_());

    this.$(".doe").addEventListener("click", () => this.start_());
    this.$(".weg").addEventListener("click", () => this.stop_());

    this.gebouwd_ = true;
  }

  markeer_() {
    const nu = this.$(".min").value.trim();
    for (const knop of this.$(".snel").querySelectorAll("[data-m]")) {
      knop.setAttribute("aria-pressed", String(knop.dataset.m === nu));
    }
    this.$(".fout").hidden = true;
  }

  /* --------------------------------------------------------------- openen */

  async open(hass, entityId, naam) {
    if (!this.gebouwd_) this.bouw_();
    this.hass = hass;
    this.entity_ = entityId;
    this.$(".waar").textContent = naam ?? entityId;
    this.$(".min").value = String(SNELKEUZES[1]);
    this.$(".fade").value = String(FADE_STANDAARD);
    this.markeer_();
    this.setAttribute("open", "");
    this.tabIndex = -1;
    this.focus?.();

    await this.haalStand_();
    // Pas na de stand: loopt er al een, dan hoort de cursor niet in een veld te
    // staan dat niemand kan zien.
    if (!this.hasAttribute("loopt")) setTimeout(() => this.$(".min")?.focus(), 60);
  }

  dicht_() {
    this.removeAttribute("open");
    clearInterval(this.tik_);
    this.tik_ = null;
  }

  /* ----------------------------------------------------------- de stand */

  async haalStand_() {
    let stand = null;
    try {
      const antwoord = await this.hass.callWS({
        type: "domotiapp_lovelace/media/sleeptimer/list",
      });
      stand = (antwoord?.timers ?? []).find((t) => t.entity_id === this.entity_) ?? null;
    } catch {
      // Geen commando (de integratie start nog op, zie valkuil 28) of geen
      // antwoord. Dan tonen we gewoon het instelscherm; starten mag het
      // opnieuw proberen en meldt dan wél wat er mis is.
      stand = null;
    }
    this.toon_(stand);
  }

  toon_(stand) {
    clearInterval(this.tik_);
    this.tik_ = null;
    this.$(".weg").hidden = !stand;

    if (!stand) {
      this.removeAttribute("loopt");
      this.$(".doe").textContent = "Starten";
      this.$(".doe").hidden = false;
      return;
    }

    this.setAttribute("loopt", "");
    this.$(".doe").textContent = "Opnieuw instellen";
    this.$(".doe").hidden = false;
    this.$(".uitleg").textContent = stand.fade
      ? `De laatste ${stand.fade} seconden zakt het volume weg, daarna pauzeert de muziek en gaat het volume terug.`
      : "Aan het eind pauzeert de muziek.";

    const eind = Date.parse(stand.ends_at);
    const teken = () => {
      // Uit de EINDTIJD en niet uit een eigen teller: een browser die geslapen
      // heeft, heeft tikken gemist maar de eindtijd staat nog.
      const over = (eind - Date.now()) / 1000;
      this.$(".rest").textContent = alsKlok(over);
      if (over <= 0) {
        clearInterval(this.tik_);
        this.tik_ = null;
        // De server is degene die het echt afrondt; even later navragen.
        setTimeout(() => this.hasAttribute("open") && this.haalStand_(), 1500);
      }
    };
    teken();
    this.tik_ = setInterval(teken, 1000);
  }

  /* ---------------------------------------------------------------- doen */

  async start_() {
    // "Opnieuw instellen" haalt eerst het instelscherm terug; pas de tweede
    // klik zet een nieuwe timer. Zonder die tussenstap zou hij de lopende
    // timer vervangen door dezelfde standaardwaarde, en dat is niet wat je
    // bedoelt als je op een lopende timer klikt.
    if (this.hasAttribute("loopt")) {
      this.removeAttribute("loopt");
      this.$(".doe").textContent = "Starten";
      clearInterval(this.tik_);
      this.tik_ = null;
      setTimeout(() => this.$(".min")?.focus(), 40);
      return;
    }

    const minuten = minutenUit(this.$(".min").value);
    if (minuten === null) {
      this.melding_("Vul een heel aantal minuten in, tussen 1 en 720.");
      return;
    }
    const fade = minutenUit(this.$(".fade").value, { min: 0, max: 600 }) ?? FADE_STANDAARD;

    try {
      const stand = await this.hass.callWS({
        type: "domotiapp_lovelace/media/sleeptimer/set",
        entity_id: this.entity_,
        minutes: minuten,
        fade,
      });
      this.toon_(stand);
    } catch (fout) {
      this.melding_(
        fout?.message ??
          "De sleeptimer kon niet gezet worden. Is DomotiApp Lovelace klaar met opstarten?"
      );
    }
  }

  async stop_() {
    try {
      await this.hass.callWS({
        type: "domotiapp_lovelace/media/sleeptimer/cancel",
        entity_id: this.entity_,
      });
    } catch {
      // Ook als het antwoord uitblijft: de stand opnieuw ophalen is eerlijker
      // dan doen alsof het gelukt is.
    }
    await this.haalStand_();
  }

  melding_(tekst) {
    const vak = this.$(".fout");
    vak.textContent = tekst;
    vak.hidden = false;
  }
}

meldAan("domotiapp-sleeptimer", SleepTimer);

/**
 * Open de sleeptimer voor deze speler.
 *
 * Eén scherm voor de hele pagina, net als bij de andere schermen van deze
 * familie.
 */
export function toonSleepTimer(hass, entityId, naam) {
  let scherm = document.querySelector("domotiapp-sleeptimer");
  if (!scherm) {
    scherm = document.createElement("domotiapp-sleeptimer");
    document.body.appendChild(scherm);
  }
  scherm.open(hass, entityId, naam ?? nameOf(hass, entityId));
  return scherm;
}
