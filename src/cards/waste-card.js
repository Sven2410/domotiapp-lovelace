/**
 * Afvalkalender: which bin, and how long you have.
 *
 * The card is built around the only question anyone actually asks it -- "do I
 * need to put something out tonight" -- so the soonest pickup is the hero and
 * everything else is a list underneath. A row of four equal dates makes the
 * reader do the sorting, which is work a card should have done.
 *
 * Dates are read with our own parser rather than `new Date()`. Dutch waste
 * integrations emit `18-08-2026`, which JavaScript reads as an American
 * month-day: silently the wrong day for the first twelve of each month, and
 * NaN for the rest. That is a bug you find in December.
 *
 * Fraction colours follow the actual bins -- orange for PMD, blue for paper,
 * grey for restafval -- because that is the mapping already in the customer's
 * head. GFT gets the teal identity token rather than the status green: it
 * reads as the green bin without spending the colour that means "in orde".
 */

import { DacCard, registerCard, registerEditor, rowsFor, toneValue, INCOMPLETE } from "../base.js";
import { DacEditor } from "../editor/base.js";
import { resolve } from "../icons.js";
import { dayCount, daysBetween, nameOf, parseDate, relativeDay, shortDate, stateOf } from "../ha.js";

/** Bin colours, matched on what the sensor happens to be called. */
const FRACTIONS = [
  [/gft|groente|tuin|organi/i, "teal", "binWheeled"],
  [/pmd|plastic|verpakking/i, "solar", "binWheeled"],
  [/papier|karton/i, "water", "binWheeled"],
  [/rest|grijs/i, "neutral", "binWheeled"],
  [/textiel|kleding/i, "pink", "bin"],
  [/glas/i, "magenta", "bin"],
  [/kerstboom|snoei|takken/i, "teal", "bin"],
];

function fractionStyle(label) {
  for (const [re, tone, icon] of FRACTIONS) {
    if (re.test(label)) return { tone, icon };
  }
  return { tone: "accent", icon: "bin" };
}

/** Strip the boilerplate integrations put in front of the useful bit. */
const cleanLabel = (name) =>
  String(name ?? "")
    .replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i, "")
    .replace(/\s*(mijnafvalwijzer)\s*/i, " ")
    .trim();

class WasteCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; }

    /* ---- hero ---- */
    .hero {
      display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
      min-height: 56px; padding: 8px 12px; border-radius: var(--dac-radius-sm);
      background: color-mix(in srgb, var(--tone) 11%, transparent);
      border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
    }
    .hero .bin {
      width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); color: var(--tone);
      background: color-mix(in srgb, var(--tone) 18%, transparent);
    }
    .hero .bin .icon, .hero .bin ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    .hero .what { min-width: 0; }
    .hero .big {
      font-size: 18px; font-weight: 500; letter-spacing: -.02em; line-height: 1.15;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hero .when {
      margin-left: auto; text-align: right; flex: 0 0 auto;
      display: flex; align-items: baseline; gap: 5px;
    }
    .hero .when .n { font-size: 18px; font-weight: 500; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

    /* Today and tomorrow are the only two states that need to shout. */
    :host([urgency="today"]) .hero { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { border-color: color-mix(in srgb, var(--tone) 34%, transparent); }
      50%      { border-color: color-mix(in srgb, var(--tone) 72%, transparent); }
    }

    /* ---- list ---- */
    .list { flex: 1 1 auto; display: flex; flex-direction: column; }
    .r {
      display: grid; grid-template-columns: 10px 1fr auto; gap: 12px; align-items: center;
      flex: 1 1 auto; min-height: 32px; padding: 0 2px; font-size: 13px;
    }
    .r + .r { border-top: 1px solid var(--dac-border); }
    .r i { width: 10px; height: 10px; border-radius: 3px; background: var(--tone); }
    .r .d { color: var(--dac-ink-2); font-variant-numeric: tabular-nums; text-align: right; }
    .r .d small { color: var(--dac-ink-3); margin-left: 6px; }

    .empty { padding: 18px 2px; font-size: 13px; color: var(--dac-ink-3); }
  `;

  validate(config) {
    const list = config.sensors ?? config.entities ?? (config.entity ? [config.entity] : []);
    if (!list.length) {
      return { ...config, [INCOMPLETE]: "Kies minstens één afvalsensor waarvan de status een datum is." };
    }
    return {
      show_hero: true,
      show_list: true,
      ...config,
      sensors: list.map((s) => (typeof s === "string" ? { entity: s } : s)),
    };
  }

  watched() {
    return this.config.sensors.map((s) => s.entity);
  }

  /** Read every sensor, drop the ones without a usable date, sort by date. */
  read_() {
    const now = new Date();
    return this.config.sensors
      .map((cfg) => {
        const st = stateOf(this.hass, cfg.entity);
        if (!st) return null;
        // The date is usually the state; some integrations park it in an attribute.
        const date =
          parseDate(st.state) ??
          parseDate(st.attributes.date) ??
          parseDate(st.attributes.next_date);
        if (!date) return null;

        const label = cfg.label ?? cleanLabel(nameOf(this.hass, cfg.entity, cfg.name));
        const style = fractionStyle(cfg.label ?? cfg.entity + label);
        // Wat de config zegt wint van wat de naam suggereert: een gemeente die
        // haar bakken anders kleurt hoeft niet met de regexen te vechten.
        const perEntity = this.config.tones?.[cfg.entity];
        return {
          label,
          date,
          days: daysBetween(now, date),
          tone: toneValue(perEntity ?? cfg.tone ?? style.tone),
          icon: cfg.icon ?? style.icon,
        };
      })
      .filter((x) => x && x.days >= 0)
      .sort((a, b) => a.date - b.date);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    return `
      <div class="card surface">
        ${c.title ? `<div class="head"><b>${c.title}</b></div>` : ""}
        ${c.show_hero === false ? "" : `<div class="hero" hidden>
          <span class="bin"></span>
          <span class="what">
            <span class="eyebrow"></span>
            <span class="big"></span>
          </span>
          <span class="when"><span class="n tnum"></span><span class="eyebrow u"></span></span>
        </div>`}
        ${c.show_list === false ? "" : `<div class="list"></div>`}
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`;
  }

  paint() {
    const items = this.read_();
    const hero = this.$(".hero");
    const list = this.$(".list");
    const empty = this.$(".empty");

    empty.hidden = items.length > 0;

    if (hero) {
      hero.hidden = items.length === 0;
      if (items.length) {
        const next = items[0];
        hero.style.setProperty("--tone", next.tone);
        this.setAttribute(
          "urgency",
          next.days === 0 ? "today" : next.days === 1 ? "tomorrow" : "later"
        );

        const bin = hero.querySelector(".bin");
        if (bin.dataset.icon !== next.icon) {
          bin.dataset.icon = next.icon;
          bin.innerHTML = resolve(next.icon, "bin");
        }
        this.text(hero.querySelector(".eyebrow"), relativeDay(next.date));
        this.text(hero.querySelector(".big"), next.label);
        this.text(hero.querySelector(".n"), next.days === 0 ? "nu" : String(next.days));
        this.text(
          hero.querySelector(".u"),
          next.days === 0 ? "aan de weg" : next.days === 1 ? "dag" : "dagen"
        );
      }
    }

    if (list) {
      // Skipping the hero's own fraction would leave a gap in the calendar, so
      // the list stays complete and simply starts where the hero left off.
      const rest = this.config.show_hero === false ? items : items.slice(1);
      const wanted = rest.map((i) => `${i.label}${+i.date}`).join("|");
      if (list.dataset.sig === wanted) return;
      list.dataset.sig = wanted;

      list.innerHTML = rest
        .map((i) => {
          // Beyond a week `relativeDay` already falls back to a date, so
          // appending the short date again just prints it twice.
          const when = relativeDay(i.date);
          const extra = i.days <= 6 ? `<small>${shortDate(i.date)}</small>` : "";
          return `
        <div class="r" style="--tone:${i.tone}">
          <i></i><span>${i.label}</span>
          <span class="d">${when}${extra}</span>
        </div>`;
        })
        .join("");
    }
  }

  /**
   * Eén rasterrij per fractie.
   *
   * Vier fracties is dus vier rijen: precies de hoogte van vier Mushroom-kaarten
   * ernaast, en dat is waar de kaart naast komt te staan. De inhoud is lager dan
   * dat, maar de lijstregels rekken mee, zodat er geen gat onderin valt maar de
   * regels wat meer lucht krijgen.
   */
  rows_() {
    const n = this.config?.sensors?.length ?? 1;
    if (this.config?.show_list === false) return 1;
    if (this.config?.show_hero === false) return Math.max(1, rowsFor(20 + n * 33));
    return Math.max(2, n);
  }

  getCardSize() {
    return this.rows_();
  }

  getGridOptions() {
    const rows = this.rows_();
    return { columns: 12, rows, min_columns: 6, min_rows: rows, max_rows: rows };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-waste-card-editor");
  }

  static getStubConfig(hass) {
    const sensors = Object.keys(hass?.states ?? {})
      .filter((e) => /afval|waste|trash|garbage|ophaal/i.test(e) && e.startsWith("sensor."))
      .filter((e) => parseDate(hass.states[e]?.state))
      .slice(0, 6);
    return { sensors, title: "Afvalkalender" };
  }
}

/**
 * De editor werkt plat, de config houdt de kleuren in een map.
 *
 * `ha-form` kent geen herhalende rij, dus krijgt elke gekozen sensor een eigen
 * platte sleutel `kleur:<entity>`, die `serialize` terugvouwt naar `tones`. De
 * kleur zelf kiest hij met onze eigen stalenrij en niet met een keuzelijst: een
 * kleur kies je op kleur, niet op de naam "Groenblauw".
 */
class WasteEditor extends DacEditor {
  defaults() {
    return { show_hero: true, show_list: true };
  }

  setConfig(config) {
    const flat = { ...config };
    for (const [id, tone] of Object.entries(config.tones ?? {})) flat[`kleur:${id}`] = tone;
    delete flat.tones;
    super.setConfig(flat);
  }

  serialize(config) {
    const out = { ...config };
    const tones = {};
    for (const k of Object.keys(out)) {
      if (!k.startsWith("kleur:")) continue;
      if (out[k]) tones[k.slice(6)] = out[k];
      delete out[k];
    }
    if (Object.keys(tones).length) out.tones = tones;
    else delete out.tones;
    return out;
  }

  /** De sensoren van deze kaart, in de vorm waarin je ze kunt aanwijzen. */
  ids_() {
    return (this.config_?.sensors ?? [])
      .map((s) => (typeof s === "string" ? s : s.entity))
      .filter(Boolean);
  }

  /**
   * De kleur per fractie is een rij stalen, niet een keuzelijst.
   *
   * Er stonden namen in een dropdown -- "Oranje", "Groenblauw" -- en dan zit je
   * te gokken welke van de twee blauwen je bedoelt en wat de bak straks wordt.
   * Een kleur kies je op kleur. Ze staan ná het formulier, want je kunt pas een
   * kleur per sensor kiezen als je de sensoren hebt aangewezen.
   */
  pickers() {
    return this.ids_().map((id) => ({
      key: `kleur:${id}`,
      kind: "tone",
      label: `Kleur voor ${cleanLabel(this.hass?.states?.[id]?.attributes?.friendly_name ?? id) || id}`,
      compact: true,
      after: true,
    }));
  }

  schema() {
    return [{ name: "sensors", selector: { entity: { domain: "sensor", multiple: true } } }];
  }

  label(s) {
    return (
      {
        sensors: "Afvalsensoren",
        show_hero: "Eerstvolgende uitlichten",
        show_list: "Overige data tonen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "sensors")
      return "Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen.";
    return undefined;
  }
}

registerEditor("domotiapp-waste-card-editor", WasteEditor);
registerCard("domotiapp-waste-card", WasteCard, {
  name: "DomotiApp Afvalkalender",
  description: "Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie.",
});
