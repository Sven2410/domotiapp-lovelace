/**
 * Klimaat: een thermostaat, of alleen een meting, of allebei.
 *
 * Drie manieren om hem te vullen, en ze zijn niet drie kaarten geworden omdat
 * het in de praktijk door elkaar loopt. Een woonkamer heeft een thermostaat.
 * Een logeerkamer heeft alleen een sensor. En een slaapkamer heeft een
 * thermostaat die zelf een matige meting doet, terwijl er een losse sensor hangt
 * die het beter weet. Dat laatste is precies waarom de temperatuur apart
 * aangewezen mag worden: staat er een sensor ingevuld, dan wint die van wat de
 * thermostaat over zichzelf zegt.
 *
 * Alles op één rasterrij, net als de rest van de familie:
 *
 *   [icoon]  Woonkamer            [-]  19,5  [+]
 *            23,2 °C · 77%
 *
 * Zonder thermostaat vervalt de stelknop en blijft de meting over. De kleur zegt
 * wat de ketel doet: warm als hij stookt, blauw als hij koelt, stil als hij
 * niets doet. Dat is de enige plek waar deze kaart kleur gebruikt -- de graden
 * zelf blijven in neutrale inkt, zodat een rij kamers leesbaar blijft.
 */

import { DacCard, registerCard, registerEditor, toneValue, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { attrsOf, bindActions, fmtNumber, isDead, moreInfo, nameOf, stateOf } from "../ha.js";

/** Een getal uit een sensor, of null als er niets bruikbaars staat. */
function num(st) {
  if (!st) return null;
  const n = Number(st.state);
  return Number.isFinite(n) ? n : null;
}

/** Wat de installatie op dit moment doet. */
function action(st) {
  const a = st?.attributes?.hvac_action;
  if (a) return a;
  // Niet elke thermostaat meldt hvac_action. Dan is de stand het beste dat er is.
  if (st?.state === "off") return "off";
  if (st?.state === "cool") return "cooling";
  if (st?.state === "heat") return "idle";
  return null;
}

const ACTION_TONE = {
  heating: "var(--dac-solar)",
  cooling: "var(--dac-grid-in)",
  drying: "var(--dac-grid-in)",
  fan: "var(--dac-grid-in)",
};

const ACTION_WORD = {
  heating: "Verwarmt",
  cooling: "Koelt",
  drying: "Ontvochtigt",
  fan: "Ventileert",
  idle: "Uit",
  off: "Uit",
};

class ClimateCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; align-items: center; gap: 11px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .chip {
      width: 40px; height: 40px; flex: 0 0 auto; cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Alleen als er echt iets gebeurt gloeit het icoon. "Aan maar niets aan het
       doen" is de normale toestand van een thermostaat en hoort stil te zijn. */
    :host([busy]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .read {
      display: flex; align-items: center; gap: 7px;
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .read .sep { color: var(--dac-ink-3); }
    .read .hum { display: inline-flex; align-items: center; gap: 4px; }
    .read .hum .icon { width: 12px; height: 12px; color: var(--dac-grid-in); }
    .read .hum:empty { display: none; }

    /* Zonder thermostaat is de meting het onderwerp, dus die mag groter. */
    :host([readout]) .read { font-size: 15px; color: var(--dac-ink); }
    :host([readout]) .read .hum .icon { width: 14px; height: 14px; }

    /* ---- stelknop ---- */
    .set {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; padding: 3px;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); } }
    .set button:active { background: rgba(255,255,255,.14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .target {
      min-width: 44px; text-align: center;
      font-size: 14.5px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    /* Terwijl je tikt loopt het getal voor op de ketel. Dat mag je zien. */
    .set .target.pending { color: var(--tone); }

    :host([dead]) .card { opacity: .42; }
    :host([dead]) .set { pointer-events: none; }
  `;

  validate(config) {
    const has = config.entity || config.temperature || config.humidity;
    if (!has) {
      return { ...config, [INCOMPLETE]: "Kies een thermostaat, of een temperatuursensor." };
    }
    return { ...config };
  }

  watched() {
    const c = this.config;
    return [c.entity, c.temperature, c.humidity].filter(Boolean);
  }

  /** De stap waarmee de knoppen verzetten. */
  step_() {
    const a = attrsOf(this.hass, this.config.entity);
    // Veel thermostaten laten target_temp_step leeg. Een halve graad is dan de
    // gebruikelijke stap, en zeker niet één hele.
    return Number(this.config.step ?? a.target_temp_step) || 0.5;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    if (!c.entity) this.setAttribute("readout", "");

    return `
      <div class="card surface">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt">
          <div class="nm"></div>
          <div class="read">
            <span class="temp"></span>
            <span class="sep"></span>
            <span class="hum"></span>
          </div>
        </div>
        ${
          c.entity
            ? `<div class="set">
                 <button type="button" data-d="-1" aria-label="Lager">${icons.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${icons.plus}</button>
               </div>`
            : ""
        }
      </div>`;
  }

  wire() {
    const c = this.config;
    // Een lopende verzending overleeft een verplaatsing niet.
    this.teardown_.push(() => clearTimeout(this.sendTimer_));

    this.teardown_.push(
      bindActions(this.$(".chip"), {
        onTap: () => moreInfo(this, c.entity || c.temperature || c.humidity),
      })
    );

    const set = this.$(".set");
    if (!set) return;

    set.querySelectorAll("button").forEach((b) =>
      this.on(b, "click", () => this.nudge_(Number(b.dataset.d)))
    );
  }

  /**
   * Verzet het doel, en stuur het pas op als je klaar bent met tikken.
   *
   * Iemand die van 19 naar 22 wil, tikt zes keer. Elke tik meteen versturen zijn
   * zes service-aanroepen, waarvan de thermostaat er vijf weer terugmeldt terwijl
   * de vinger nog bezig is -- en dan springt het getal onder je duim terug.
   */
  nudge_(dir) {
    const c = this.config;
    const a = attrsOf(this.hass, c.entity);
    const step = this.step_();
    const min = Number(a.min_temp ?? 5);
    const max = Number(a.max_temp ?? 35);

    const base = this.pending_ ?? Number(a.temperature);
    if (!Number.isFinite(base)) return;

    const next = Math.min(max, Math.max(min, Math.round((base + dir * step) / step) * step));
    this.pending_ = next;
    this.paintTarget_();

    clearTimeout(this.sendTimer_);
    this.sendTimer_ = setTimeout(() => {
      this.sendTimer_ = null;
      this.hass.callService("climate", "set_temperature", {
        entity_id: c.entity,
        temperature: this.pending_,
      });
      // Nog even vasthouden: de thermostaat mag eerst zelf melden.
      setTimeout(() => {
        this.pending_ = null;
        this.paint();
      }, 1500);
    }, 450);
  }

  paintTarget_() {
    const el = this.$(".target");
    if (!el) return;
    const a = attrsOf(this.hass, this.config.entity);
    const v = this.pending_ ?? Number(a.temperature);
    el.classList.toggle("pending", this.pending_ != null);
    el.textContent = Number.isFinite(v)
      ? `${fmtNumber(this.hass, v, v % 1 ? 1 : 0)}°`
      : "--";
  }

  paint() {
    const c = this.config;

    const cl = c.entity ? stateOf(this.hass, c.entity) : null;
    const dead = c.entity ? isDead(cl) : false;
    this.toggleAttribute("dead", dead);

    const act = action(cl);
    const tone = c.tone ? toneValue(c.tone) : (ACTION_TONE[act] ?? "var(--dac-ink-3)");
    this.$(".card").style.setProperty("--tone", tone);
    this.toggleAttribute("busy", Boolean(ACTION_TONE[act]));

    const chip = this.$(".chip");
    const wanted = c.icon || "thermo";
    if (chip.dataset.icon !== wanted) {
      chip.dataset.icon = wanted;
      chip.innerHTML = resolve(wanted, "thermo");
    }
    chip.style.setProperty("--tone", ACTION_TONE[act] ? tone : "var(--dac-ink-3)");

    this.text(".nm", nameOf(this.hass, c.entity || c.temperature || c.humidity, c.name));

    // De aangewezen sensor wint van de meting van de thermostaat zelf.
    const t = c.temperature
      ? num(stateOf(this.hass, c.temperature))
      : Number(attrsOf(this.hass, c.entity).current_temperature);
    const unit = this.hass?.config?.unit_system?.temperature ?? "°C";
    this.text(".temp", Number.isFinite(t) ? `${fmtNumber(this.hass, t, 1)} ${unit}` : "--");

    const h = c.humidity ? num(stateOf(this.hass, c.humidity)) : null;
    const humEl = this.$(".hum");
    humEl.innerHTML =
      h == null ? "" : `${icons.drop}${fmtNumber(this.hass, h, 0)}%`;
    this.text(".sep", h == null ? "" : "·");

    // Wat de ketel doet staat er alleen bij als er iets te melden valt.
    if (c.entity && !c.humidity && ACTION_WORD[act] && act !== "idle") {
      this.text(".sep", "·");
      humEl.textContent = ACTION_WORD[act];
    }

    this.paintTarget_();

    const set = this.$(".set");
    if (set) {
      const a = attrsOf(this.hass, c.entity);
      const v = this.pending_ ?? Number(a.temperature);
      set.querySelector('[data-d="-1"]').disabled = dead || v <= Number(a.min_temp ?? 5);
      set.querySelector('[data-d="1"]').disabled = dead || v >= Number(a.max_temp ?? 35);
    }
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 4, min_rows: 1, max_rows: 1 };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-climate-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cl = entities?.find((e) => e.startsWith("climate."));
    return cl ? { entity: cl } : {};
  }
}

class ClimateEditor extends DacEditor {
  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon", fallback: "thermo" },
      { key: "tone", kind: "tone", label: "Vaste kleur (leeg = volgt de ketel)" },
    ];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("climate") },
      { name: "temperature", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
      { name: "humidity", selector: { entity: { domain: "sensor", device_class: "humidity" } } },
      { name: "name", selector: sel.text() },
      { name: "step", selector: sel.number(0.1, 5, 0.1) },
    ];
  }

  label(s) {
    return (
      {
        entity: "Thermostaat (optioneel)",
        temperature: "Temperatuursensor (optioneel)",
        humidity: "Vochtigheidssensor (optioneel)",
        name: "Naam",
        step: "Stap van de knoppen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";
    if (s.name === "temperature")
      return "Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";
    if (s.name === "step")
      return "Leeg laten volgt de thermostaat, en anders een halve graad.";
    return undefined;
  }
}

registerEditor("domotiapp-climate-card-editor", ClimateEditor);
registerCard("domotiapp-climate-card", ClimateCard, {
  name: "DomotiApp Klimaat",
  description: "Thermostaat, losse temperatuur- en vochtsensor, of allebei.",
});
