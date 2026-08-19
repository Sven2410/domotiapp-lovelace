/**
 * De rookmelder: één regel die zegt of het goed is, en de metingen eronder.
 *
 * Een rookmelder is 364 dagen per jaar saai, en dat is precies de eis. De kaart
 * moet in één oogopslag "rustig" zeggen, en op de ene dag dat het misgaat moet
 * er geen twijfel zijn. Vandaar dat de kop de toestand draagt en niet een
 * getal: temperatuur en batterij zijn ondersteunend, geen nieuws.
 *
 * ALLE ENTITEITEN ZIJN OPTIONEEL
 *
 * Rook, koolmonoxide, warmte, temperatuur en batterij: vul in wat je melder
 * heeft. Een Zigbee-melder van veertig euro meldt rook en batterij; een
 * bekabelde meldt daarnaast warmte en CO. De kaart toont wat er is en verzint
 * niets bij -- een lege regel "Koolmonoxide: onbekend" is erger dan geen regel.
 *
 * ROOD EN GROEN MOGEN HIER WEL
 *
 * In de rest van de familie zijn die kleuren gereserveerd voor status en dus
 * verboden als identiteit. Dit ís status: rook is kritiek, rustig is goed. Dat
 * is de uitzondering waar de regel voor bedoeld is. Ze komen nooit alleen: er
 * staat altijd een icoon en een woord bij, want kleur alleen is voor wie hem
 * ziet.
 */

import { DacCard, registerCard, registerEditor, rowsFor, TONES, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import {
  bindActions,
  fmtNumber,
  isDead,
  isOn,
  localizeState,
  moreInfo,
  nameOf,
  runAction,
  stateOf,
} from "../ha.js";
import { BATTERIJ_LAAG, SOORTEN, batterijPct, toestand } from "./smoke-logica.js";

/** Van een kleurnaam uit de logica naar de token van het thema. */
const TOON = {
  good: TONES.good,
  warn: TONES.warn,
  bad: TONES.bad,
  neutral: TONES.neutral,
  accent: TONES.accent,
};

class SmokeCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); }
    /* Bij alarm draagt de tekst de kleur mee: wie de chip niet ziet, leest hem. */
    :host([alarm]) .st { color: var(--tone); font-weight: 600; }

    /* Een alarm hoort te bewegen. Niet fel -- de kaart moet opvallen, niet
       knipperen als een kermis. Wie bewegingen uit heeft staan (prefers-reduced-
       motion) krijgt hem stil; de kleur en het woord blijven. */
    :host([alarm]) .chip { animation: pols 1.6s ease-in-out infinite; }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 55%, transparent); }
      50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--tone) 0%, transparent); }
    }

    /* ---- de metingen ----
       Eén regel die schuift, en niet twee die afbreken. De kaart claimt twee
       rasterrijen; zouden de pillen doorlopen naar een derde regel, dan valt de
       onderste buiten de hoogte die Home Assistant heeft gereserveerd. Bij een
       kaart over de volle breedte passen alle vijf ernaast. */
    .meta {
      display: flex; flex-wrap: nowrap; gap: 6px;
      overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    }
    .meta::-webkit-scrollbar { display: none; }
    .pil { flex: 0 0 auto; }
    .meta[hidden] { display: none; }
    .pil {
      display: flex; align-items: center; gap: 7px; padding: 5px 11px 5px 8px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      font-size: 11.5px; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
    }
    .pil .icon { width: 14px; height: 14px; color: var(--dac-ink-3); flex: 0 0 auto; }
    .pil b { font-weight: 600; color: var(--dac-ink); }
    /* Een pil die zelf iets te melden heeft -- een lege batterij, een melder die
       aanslaat -- kleurt mee. De rest blijft stil. */
    .pil[data-let="warn"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 40%, transparent); }
    .pil[data-let="warn"] .icon, .pil[data-let="warn"] b { color: var(--dac-warn); }
    .pil[data-let="bad"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
    .pil[data-let="bad"] .icon, .pil[data-let="bad"] b { color: var(--dac-bad); }

    .top.unavailable { opacity: .42; }
  `;

  validate(config) {
    const gekozen = SOORTEN.filter((s) => config[s.sleutel]);
    if (!gekozen.length) {
      return {
        ...config,
        [INCOMPLETE]: "Kies minstens één entiteit: rook, koolmonoxide, warmte, temperatuur of batterij.",
      };
    }
    return { ...config };
  }

  watched() {
    return SOORTEN.map((s) => this.config[s.sleutel]).filter(Boolean);
  }

  /** De soorten die deze kaart daadwerkelijk toont. */
  gekozen_() {
    return SOORTEN.filter((s) => this.config[s.sleutel]);
  }

  /**
   * Wat er nu aan de hand is.
   *
   * De rangorde -- alarm boven onbereikbaar, onbereikbaar boven een lege
   * batterij -- staat in `smoke-logica.js` en heeft daar zijn eigen tests.
   */
  toestand_() {
    const nu = toestand(this.gekozen_(), (sleutel) =>
      stateOf(this.hass, this.config[sleutel])
    );
    return { ...nu, tone: TOON[nu.tone] ?? TONES.accent };
  }

  /** De batterijstand als getal, of null. */
  batterijPct_() {
    return batterijPct(stateOf(this.hass, this.config.battery));
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    const pillen = this.gekozen_()
      .map(
        (s) => `<span class="pil" data-soort="${s.sleutel}">${resolve(s.icoon)}
          <span class="lb">${s.label}</span> <b></b></span>`
      )
      .join("");
    return `
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${TONES.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${pillen}</div>
      </div>`;
  }

  wire() {
    const c = this.config;
    // Tikken opent de melder die het meest te zeggen heeft: de rookmelder als
    // die er is, anders de eerste die ingevuld staat.
    const eerste = this.gekozen_()[0];
    this.teardown_.push(
      bindActions(this.$(".top"), {
        onTap: () =>
          c.tap_action
            ? runAction(this, this.hass, c, c.tap_action)
            : moreInfo(this, c.smoke ?? c[eerste.sleutel]),
        onHold: () => runAction(this, this.hass, c, c.hold_action ?? { action: "more-info" }),
      })
    );

    this.$$(".pil").forEach((pil) => {
      const id = c[pil.dataset.soort];
      if (!id) return;
      this.on(pil, "click", (e) => {
        e.stopPropagation();
        moreInfo(this, id);
      });
      this.on(pil, "pointerdown", (e) => e.stopPropagation());
      pil.style.cursor = "pointer";
    });
  }

  paint() {
    const c = this.config;
    const nu = this.toestand_();
    const top = this.$(".top");

    this.toggleAttribute("alarm", nu.soort === "alarm");
    top.style.setProperty("--tone", nu.tone);
    top.classList.toggle("unavailable", nu.soort === "weg");

    const chip = this.$(".chip");
    const wens = c.icon || nu.icoon;
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "smoke");
    }
    chip.style.setProperty("--tone", nu.tone);

    const eerste = this.gekozen_()[0];
    this.text(".nm", c.name || nameOf(this.hass, c.smoke ?? c[eerste.sleutel], null));
    this.text(".st", nu.tekst);
    top.setAttribute("aria-label", `${this.$(".nm").textContent}${nu.tekst ? `, ${nu.tekst}` : ""}`);

    this.$$(".pil").forEach((pil) => this.paintPil_(pil));
    this.$(".meta").hidden = this.gekozen_().length <= 1 && !this.config.always_meta;
  }

  paintPil_(pil) {
    const soort = SOORTEN.find((s) => s.sleutel === pil.dataset.soort);
    const st = stateOf(this.hass, this.config[soort.sleutel]);
    const waarde = pil.querySelector("b");

    if (!st || isDead(st)) {
      waarde.textContent = "—";
      pil.dataset.let = "";
      return;
    }

    if (soort.meting) {
      const eenheid = st.attributes.unit_of_measurement ?? "";
      const n = Number(st.state);
      waarde.textContent = Number.isFinite(n)
        ? `${fmtNumber(this.hass, n, soort.sleutel === "temperature" ? 1 : 0)} ${eenheid}`.trim()
        : localizeState(this.hass, st);
      // Alleen de batterij heeft een grens die iets betekent. Een temperatuur
      // van 24 graden is geen nieuws; die kleurt dus niet.
      const pct = soort.sleutel === "battery" ? this.batterijPct_() : null;
      pil.dataset.let = pct != null && pct <= BATTERIJ_LAAG ? "warn" : "";
      return;
    }

    const aan = isOn(st);
    waarde.textContent = aan ? "Alarm" : "Rustig";
    pil.dataset.let = aan ? "bad" : "";
  }

  regels_() {
    return this.gekozen_().length > 1 ? 2 : 1;
  }

  getCardSize() {
    return this.regels_();
  }

  getGridOptions() {
    const rijen = this.regels_() === 1 ? 1 : rowsFor(14 + 40 + 8 + 28);
    return { columns: 12, rows: rijen, min_columns: 4, min_rows: rijen, max_rows: rijen };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-smoke-card-editor");
  }

  static getStubConfig(hass, entities) {
    const rook = entities?.find(
      (e) => e.startsWith("binary_sensor.") && /rook|smoke/i.test(e)
    );
    return rook ? { smoke: rook } : {};
  }
}

class SmokeEditor extends DacEditor {
  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon", fallback: "smoke" },
    ];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      { name: "smoke", selector: sel.entity() },
      { name: "co", selector: sel.entity() },
      { name: "heat", selector: sel.entity() },
      { name: "temperature", selector: sel.entity() },
      { name: "battery", selector: sel.entity() },
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("more-info") },
    ];
  }

  label(s) {
    return (
      {
        name: "Naam (overschrijft die van de melder)",
        smoke: "Rook",
        co: "Koolmonoxide",
        heat: "Warmte",
        temperature: "Temperatuur",
        battery: "Batterij",
        tap_action: "Tikken op de kaart",
        hold_action: "Vasthouden op de kaart",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "smoke")
      return "Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";
    if (s.name === "battery")
      return "Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf.";
    return undefined;
  }
}

registerEditor("domotiapp-smoke-card-editor", SmokeEditor);
registerCard("domotiapp-smoke-card", SmokeCard, {
  name: "DomotiApp Rookmelder",
  description: "Rook, koolmonoxide, warmte, temperatuur en batterij — alles optioneel.",
});
