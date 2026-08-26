/**
 * Eén lamp, op de hoogte van een Mushroom-kaart ernaast.
 *
 * De rij is horizontaal: chip, naam met toestand, en de schuif ernaast. Dat is
 * niet alleen compacter dan de schuif eronder -- het maakt de kaart precies één
 * rasterrij hoog (56px), zodat een kolom met kaarten van verschillende makelij
 * toch één kolom blijft.
 *
 * De kleurstrips staan er alleen zolang de lamp brandt, en de kaart groeit
 * daarmee mee: `rows: "auto"` laat Home Assistant de hoogte de inhoud volgen, en
 * de kaarten eronder schuiven op. Uit is de kaart dus precies één rasterrij --
 * dezelfde hoogte als een Mushroom-kaart ernaast -- en aan is hij zo hoog als
 * hij moet zijn.
 *
 * De schuiven schrijven bij loslaten, niet tijdens het slepen: `light.turn_on`
 * op elke pixel overspoelt de bus en laat oudere Zigbee-lampen zichtbaar
 * stotteren. De vulling volgt de vinger meteen, dus het voelt wel live.
 */

import { DacCard, registerCard, registerEditor, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, isDead, moreInfo, nameOf, stateOf } from "../ha.js";
import { bindSlider, sliderCss, sliderHtml } from "../slider.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";

const DIMMABLE = new Set(["brightness", "color_temp", "hs", "rgb", "rgbw", "rgbww", "xy", "white"]);
const COLOURFUL = new Set(["hs", "rgb", "rgbw", "rgbww", "xy"]);

const modesOf = (st) => st?.attributes?.supported_color_modes ?? [];
const isDimmable = (st) => modesOf(st).some((m) => DIMMABLE.has(m));
const hasColour = (st) => modesOf(st).some((m) => COLOURFUL.has(m));
const hasTemp = (st) => modesOf(st).includes("color_temp");

const pct = (brightness) => Math.max(1, Math.round(((brightness ?? 0) / 255) * 100));

class LightCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    /* De hoogte komt op een rasterrij van Home Assistant uit; --dac-raster
       wordt gemeten en gezet door volgRaster in rasterhoogte.js. Uit is deze
       kaart 56px, met kleurstrips 120px -- en nooit de 93px ertussenin, want
       dan begint de kaart eronder op een halve rij. */
    .card {
      min-height: var(--dac-raster, 56px); padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .lamp { display: flex; align-items: center; gap: 11px; min-height: 40px; }

    .chip { width: 40px; height: 40px; cursor: pointer; }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    .lamp[data-on="false"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }
    /* Een brandende lamp gloeit een beetje. Dat is de enige plek in de familie
       waar een schaduw betekenis draagt in plaats van diepte. */
    .lamp[data-on="true"] .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 0 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .v { font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; line-height: 1.25; }

    ${sliderCss}

    .colour { display: flex; gap: 8px; }
    .colour[hidden] { display: none; }
    .colour .slider { height: 30px; flex: 1 1 0; }
    .colour .slider .track { border-radius: 8px; }
    .colour .slider .thumb { top: 4px; bottom: 4px; width: 6px; margin-left: -3px; }

    /* ---- aan/uit, voor lampen die alleen dat kunnen ---- */
    .toggle {
      flex: 0 0 auto; margin-left: auto; width: 52px; height: 30px; padding: 0; cursor: pointer;
      border-radius: var(--dac-radius-pill); position: relative;
      background: rgba(255,255,255,.08); border: 1px solid var(--dac-border);
      transition: background 200ms ease, border-color 200ms ease;
    }
    .toggle::after {
      content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
      border-radius: 50%; background: var(--dac-ink-2);
      transition: transform 220ms cubic-bezier(.3,.8,.4,1), background 200ms ease;
    }
    .lamp[data-on="true"] .toggle {
      background: color-mix(in srgb, var(--tone) 28%, transparent);
      border-color: color-mix(in srgb, var(--tone) 55%, transparent);
    }
    .lamp[data-on="true"] .toggle::after { transform: translateX(22px); background: var(--dac-ink); }

    .lamp.unavailable { opacity: .42; }
    .lamp.unavailable .slider, .lamp.unavailable .toggle { pointer-events: none; }
  `;

  validate(config) {
    const entity = config.entity ?? config.lights?.[0] ?? config.entities?.[0];
    const id = typeof entity === "string" ? entity : entity?.entity;
    if (!id) return { ...config, [INCOMPLETE]: "Kies een lamp." };
    return { show_colour: true, ...config, entity: id };
  }

  watched() {
    return [this.config.entity];
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    return `
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`;
  }

  wire() {
    const entity = this.config.entity;

    this.teardown_.push(
      bindActions(this.$(".chip"), {
        onTap: () => this.hass.callService("light", "toggle", { entity_id: entity }),
        onHold: () => moreInfo(this, entity),
      })
    );

    this.on(this.$(".card"), "click", (e) => {
      if (!e.target.closest(".toggle")) return;
      this.hass.callService("light", "toggle", { entity_id: entity });
    });

    this.teardown_.push(volgRaster(this.$(".card")));

    // De schuiven worden pas gebouwd als we weten wat de lamp kan, dus ze
    // krijgen hun gedrag in paint() aangehangen.
    this.sliders_ = new Map();
  }

  /** Hang een schuif aan zodra hij bestaat, en niet twee keer. */
  attach_(el, kind, opts) {
    if (!el || this.sliders_.has(kind)) return;
    const off = bindSlider(el, opts);
    this.sliders_.set(kind, off);
    this.teardown_.push(off);
  }

  setSlider_(el, v, min = 0, max = 100) {
    if (!el) return;
    const ratio = max > min ? ((v - min) / (max - min)) * 100 : 0;
    el.style.setProperty("--v", `${ratio}%`);
    el.setAttribute("aria-valuemin", String(min));
    el.setAttribute("aria-valuemax", String(max));
    el.setAttribute("aria-valuenow", String(v));
  }

  paint() {
    const c = this.config;
    const st = stateOf(this.hass, c.entity);
    const dead = isDead(st);
    const on = st?.state === "on";

    const lampEl = this.$(".lamp");
    lampEl.dataset.on = String(on);
    lampEl.classList.toggle("unavailable", dead);

    const chip = this.$(".chip");
    const wanted = c.icon || "bulb";
    if (chip.dataset.icon !== wanted) {
      chip.dataset.icon = wanted;
      chip.innerHTML = resolve(wanted, "bulb");
    }

    this.text(".nm", nameOf(this.hass, c.entity, c.name));

    // Een lamp die kleur maakt, toont die kleur. Dat is meer waard dan welk
    // label ook: je ziet wat je krijgt voordat je de kamer in loopt.
    //
    // Hier staat bewust geen groepstest, anders dan op de knop- en
    // entiteitenkaart (zie `lightTone` in ha.js). Dit is de kaart met de
    // kleurstrip: hier maak je de kleur, en dan hoort het icoon te laten zien
    // wat je aan het maken bent -- ook als het een groep is die je verzet.
    const rgb = on ? st?.attributes?.rgb_color : null;
    lampEl.style.setProperty("--tone", rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : "var(--dac-lit)");

    const ctl = this.$(".ctl");
    const kind = dead ? "none" : isDimmable(st) ? "range" : "toggle";
    if (ctl.dataset.kind !== kind) {
      ctl.dataset.kind = kind;
      ctl.innerHTML =
        kind === "range"
          ? sliderHtml("brightness")
          : kind === "toggle"
            ? `<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>`
            : "";
      this.sliders_.delete("brightness");
    }

    if (kind === "range") {
      const el = ctl.querySelector(".slider");
      this.attach_(el, "brightness", {
        value: () => (st?.state === "on" ? pct(stateOf(this.hass, c.entity)?.attributes?.brightness) : 0),
        onInput: (v) => {
          this.setSlider_(el, v);
          this.text(".v", v === 0 ? "Uit" : `${v}%`);
        },
        onCommit: (v) => {
          if (v === 0) this.hass.callService("light", "turn_off", { entity_id: c.entity });
          else this.hass.callService("light", "turn_on", { entity_id: c.entity, brightness_pct: v });
        },
        disabled: () => isDead(stateOf(this.hass, c.entity)),
      });
      if (!el.classList.contains("dragging")) {
        const v = on ? pct(st.attributes.brightness) : 0;
        this.setSlider_(el, v);
        this.text(".v", on ? `${v}%` : "Uit");
      }
    } else if (kind === "toggle") {
      ctl.querySelector(".toggle")?.setAttribute("aria-checked", String(on));
      this.text(".v", on ? "Aan" : "Uit");
    } else {
      this.text(".v", "Niet bereikbaar");
    }

    this.paintColour_(st, on);

    // De kaart zegt zelf wanneer zijn inhoud van maat verandert. De waarnemer
    // in volgRaster vangt alleen wat er daarna nog binnenkomt; een kind dat op
    // display:none gaat meldt zich daar niet af.
    meetRaster(this.$(".card"));
  }

  /** Kleur en wit: alleen wat de lamp kan, en alleen terwijl hij brandt. */
  paintColour_(st, on) {
    const box = this.$(".colour");
    const capable = this.config.show_colour !== false && (hasColour(st) || hasTemp(st));
    box.hidden = !(capable && on);
    if (!capable) return;

    const sig = `${hasColour(st) ? "c" : ""}${hasTemp(st) ? "t" : ""}`;
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML =
        (hasColour(st)
          ? `<span data-kind="hue" style="display:contents">${sliderHtml("hue")}</span>`
          : "") +
        (hasTemp(st)
          ? `<span data-kind="kelvin" style="display:contents">${sliderHtml("kelvin")}</span>`
          : "");
      const hueEl = box.querySelector(".slider.hue");
      if (hueEl) {
        hueEl.dataset.strip = "";
        hueEl.style.setProperty(
          "--strip",
          "linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%)," +
            " hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"
        );
        hueEl.setAttribute("aria-label", "Kleur");
      }
      const kEl = box.querySelector(".slider.kelvin");
      if (kEl) {
        kEl.dataset.strip = "";
        kEl.style.setProperty(
          "--strip",
          "linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"
        );
        kEl.setAttribute("aria-label", "Kleurtemperatuur");
      }
      this.sliders_.delete("hue");
      this.sliders_.delete("kelvin");
    }

    if (!on) return;
    const id = this.config.entity;

    const hueEl = box.querySelector(".slider.hue");
    if (hueEl) {
      this.attach_(hueEl, "hue", {
        min: 0,
        max: 360,
        value: () => stateOf(this.hass, id)?.attributes?.hs_color?.[0] ?? 0,
        onInput: (v) => this.setSlider_(hueEl, v, 0, 360),
        onCommit: (v) => {
          const sat = stateOf(this.hass, id)?.attributes?.hs_color?.[1] ?? 100;
          this.hass.callService("light", "turn_on", { entity_id: id, hs_color: [v, sat] });
        },
      });
      if (!hueEl.classList.contains("dragging")) {
        this.setSlider_(hueEl, Math.round(st.attributes.hs_color?.[0] ?? 0), 0, 360);
      }
    }

    const kEl = box.querySelector(".slider.kelvin");
    if (kEl) {
      const min = st.attributes.min_color_temp_kelvin ?? 2000;
      const max = st.attributes.max_color_temp_kelvin ?? 6500;
      this.attach_(kEl, "kelvin", {
        min,
        max,
        step: 50,
        value: () => stateOf(this.hass, id)?.attributes?.color_temp_kelvin ?? min,
        onInput: (v) => this.setSlider_(kEl, v, min, max),
        onCommit: (v) =>
          this.hass.callService("light", "turn_on", { entity_id: id, color_temp_kelvin: v }),
      });
      if (!kEl.classList.contains("dragging")) {
        const k = st.attributes.color_temp_kelvin;
        if (k != null) this.setSlider_(kEl, k, min, max);
      }
    }
  }

  getCardSize() {
    const st = stateOf(this.hass, this.config?.entity);
    return st?.state === "on" && (hasColour(st) || hasTemp(st)) ? 2 : 1;
  }

  getGridOptions() {
    // "auto" laat de hoogte de inhoud volgen, zodat de kleurstrips de kaarten
    // eronder naar beneden duwen in plaats van een lege regel achter te laten.
    // En de inhoud komt zelf op een rasterrij uit -- zie rasterhoogte.js. Een
    // getal hier zou de kaart klemmen op zijn vak, en dan steekt hij eruit
    // zodra de lamp aangaat en de strips erbij komen.
    // De ondergrens is gemeten, niet geraden -- zie gemetenRijen in
    // rasterhoogte.js. Met de kleurstrips erbij is deze kaart twee rijen.
    return { columns: 12, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".card", 1) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-light-card-editor");
  }

  static getStubConfig(hass, entities) {
    const light = entities?.find((e) => e.startsWith("light."));
    return light ? { entity: light } : {};
  }
}

class LightEditor extends DacEditor {
  defaults() {
    return { show_colour: true };
  }

  // Geen kleurkiezer: een brandende lamp draagt zijn eigen kleur, en uit is
  // gedempt. Daar valt niets aan te kiezen dat de kaart beter maakt.
  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "bulb" }];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("light") },
      { name: "name", selector: sel.text() },
      { name: "show_colour", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      { entity: "Lamp", name: "Naam (overschrijft die van de lamp)",
        show_colour: "Kleurstrips tonen" }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Eén lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";
    if (s.name === "show_colour")
      return "Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog.";
    return undefined;
  }
}

registerEditor("domotiapp-light-card-editor", LightEditor);
registerCard("domotiapp-light-card", LightCard, {
  name: "DomotiApp Verlichting",
  description: "Eén lamp op één rasterrij: dimmen, kleur en kleurtemperatuur.",
});
