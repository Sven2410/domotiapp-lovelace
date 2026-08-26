/**
 * De bovenrand van een dashboard: wie er kijkt, hoe laat het is, wat het buiten doet.
 *
 * Twee regels over de volle breedte. Eerst stond alles op één regel, maar dan
 * moet de zonsondergang wijken zodra er een lange naam in de begroeting staat --
 * en een waarde die half wegvalt is erger dan een kaart die een rij hoger is.
 * Onder elkaar past alles, en het scheelt bovendien flink in de breedte:
 *
 *   regel 1   begroeting en datum          |  weer en temperatuur
 *   regel 2   vochtigheid, wind, UV, ...   |  klok
 *
 * Onder een ingestelde breedte verdwijnt hij helemaal. Op een telefoon is de
 * bovenrand het schaarste stuk scherm dat er is, en HA's eigen kop toont daar de
 * tijd al. Dat gebeurt met matchMedia en niet met een CSS-mediaquery, omdat het
 * afkappunt instelbaar is en een mediaquery geen custom property kan lezen.
 *
 * Twee weerentiteiten, want dat is de praktijk: de ene integratie geeft de beste
 * temperatuur en wind, de andere is de enige met een UV-index. Ze afzonderlijk
 * kunnen aanwijzen scheelt een template-sensor.
 *
 * De klok tikt op de minuut. Een secondewijzer op een wandtablet is een repaint
 * per seconde, eeuwig, voor informatie waar niemand om vroeg.
 */

import { DacCard, registerCard, registerEditor, toneValue } from "../base.js";
import { DacEditor, sel, row, section } from "../editor/base.js";
import { icons, resolve, weatherIcon } from "../icons.js";
import { attrsOf, fmtNumber, localizeState, nameOf, stateOf } from "../ha.js";

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

const WEEKDAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
  "augustus", "september", "oktober", "november", "december"];

const CHIPS = {
  humidity: { icon: "drop", tone: "water", label: "Luchtvochtigheid" },
  wind: { icon: "wind", tone: "neutral", label: "Wind" },
  uv: { icon: "uv", tone: "solar", label: "UV-index" },
  precipitation: { icon: "rain", tone: "water", label: "Neerslag" },
  pressure: { icon: "gaugeArrow", tone: "neutral", label: "Luchtdruk" },
  sunrise: { icon: "sunrise", tone: "warn", label: "Zonsopkomst" },
  sunset: { icon: "sunset", tone: "warn", label: "Zonsondergang" },
};

/**
 * Vast, en niet instelbaar.
 *
 * Dit is wat een header hoort te tonen en het is ook wat de oude domotiapp-header
 * toonde. Een keuzelijst erbij levert vooral de vraag op welke vijf je ook alweer
 * had aangevinkt.
 */
const CHIP_ORDER = ["humidity", "wind", "uv", "precipitation", "sunset"];

const bearing = (deg) => {
  if (deg == null || Number.isNaN(+deg)) return "";
  return ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"][Math.round(+deg / 45) % 8];
};

class HeaderCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }
    /* Onder het afkappunt bestaat de kaart niet -- ook geen lege ruimte, want
       in een sections-view laat een verborgen kaart anders zijn gat staan. */
    :host([narrow]) { display: none; }

    .strip {
      height: 100%; min-height: 96px;
      display: grid; grid-template-columns: 1fr auto; align-items: center;
      gap: 6px 18px;
      padding: 10px 16px;
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius);
      box-shadow: var(--dac-shadow);
      position: relative; overflow: hidden;
    }
    :host([bare]) .strip { background: none; box-shadow: none; }

    /* Haarlijn accent onderlangs, dezelfde die de Coach-kop draagt. */
    .strip::after {
      content: ""; position: absolute; inset: auto 0 0 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--dac-accent) 22%,
                  var(--dac-accent-hi) 50%, var(--dac-accent) 78%, transparent);
      opacity: .55;
    }
    :host([no-rule]) .strip::after { display: none; }

    .who { min-width: 0; grid-column: 1; grid-row: 1; }
    .hello {
      font-size: 15.5px; font-weight: 400; letter-spacing: -.01em; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hello b { font-weight: 600; }
    .date { margin-top: 2px; font-size: 11.5px; color: var(--dac-ink-3); white-space: nowrap; }

    /* De weerdetails krijgen de ruimte die overblijft en schuiven horizontaal
       weg als die op is, in plaats van de strip twee regels hoog te maken. */
    /* De weerdetails krijgen de hele tweede regel voor zich, dus ze passen.
       Mocht het toch krap worden, dan valt er een hele chip weg en nooit een
       halve waarde -- "20:5" leest als een storing, niet als een hint. */
    .chips {
      grid-column: 1; grid-row: 2; min-width: 0;
      display: flex; align-items: center; flex-wrap: nowrap; gap: 18px;
      overflow: hidden;
    }
    .chips:empty { display: none; }
    .chip2 {
      display: inline-flex; align-items: center; gap: 6px; flex: 0 0 auto;
      font-size: 12.5px; color: var(--dac-ink-2); white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .chip2 .icon, .chip2 ha-icon { width: 15px; height: 15px; --mdc-icon-size: 15px; color: var(--tone); }

    .now { grid-column: 2; grid-row: 1; display: flex; align-items: center; gap: 9px; justify-self: end; }
    .now .ic { display: flex; color: var(--wtone); }
    .now .ic .icon, .now .ic ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
    .now .temp { font-size: 21px; font-weight: 300; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
        /* Het gradenteken als superscript, met lucht ertussen. Strak tegen het
       cijfer aan gezet leest het als een rendermisser. */
    .now .temp span {
      font-size: .5em; margin-left: 3px; vertical-align: .5em;
      color: var(--dac-ink-3); letter-spacing: .01em;
    }
    .now .cond {
      font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase;
      color: var(--dac-ink-3); white-space: nowrap;
    }

    .clock {
      grid-column: 2; grid-row: 2; justify-self: end;
      font-size: 19px; font-weight: 400; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 620px) {
      .now .cond { display: none; }
      .chips { gap: 12px; }
    }
  `;

  validate(config) {
    return {
      show_clock: true,
      show_weather: true,
      show_chips: true,
      show_rule: true,
      hide_below: 768,
      ...config,
    };
  }

  watched() {
    const c = this.config;
    return [c.weather, c.weather_uv, c.sun, c.precipitation_entity].filter(Boolean);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    if (c.show_rule === false) this.setAttribute("no-rule", "");

    return `
      <div class="strip">
        <div class="who">
          <div class="hello"></div>
          <div class="date"></div>
        </div>
        ${c.show_chips === false ? "" : `<div class="chips"></div>`}
        ${c.show_weather === false ? "" : `
        <div class="now">
          <span class="ic"></span>
          <span>
            <span class="temp tnum"></span>
            <span class="cond"></span>
          </span>
        </div>`}
        ${c.show_clock === false ? "" : `<div class="clock tnum"></div>`}
      </div>`;
  }

  wire() {
    // Tik op de minuut, dan elke minuut -- niet elke zestig seconden vanaf het
    // moment dat de kaart toevallig laadde, want dat loopt zichtbaar uit de pas
    // met de klok van de telefoon ernaast.
    const schedule = () => {
      const ms = 60000 - (Date.now() % 60000) + 50;
      this.timer_ = setTimeout(() => {
        this.paintClock_();
        schedule();
      }, ms);
    };
    schedule();
    this.teardown_.push(() => clearTimeout(this.timer_));

    const below = Number(this.config.hide_below) || 0;
    if (below > 0) {
      const mq = matchMedia(`(max-width: ${below - 1}px)`);
      const apply = () => this.toggleAttribute("narrow", mq.matches);
      apply();
      mq.addEventListener("change", apply);
      this.teardown_.push(() => mq.removeEventListener("change", apply));
    }
  }

  paintClock_() {
    const now = new Date();
    // De naam is die van de ingelogde gebruiker, tenzij de config er een geeft.
    // Een persoon-entiteit aanwijzen zou betekenen dat iedereen in huis dezelfde
    // begroeting krijgt, en dat is precies niet waar een begroeting voor is.
    const name = this.config.name ?? this.hass?.user?.name ?? "";
    const hello = greeting(now);
    this.$(".hello").innerHTML = name ? `${hello}, <b>${name}</b>` : hello;

    this.text(".date", `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`);

    const clock = this.$(".clock");
    if (clock) {
      this.text(
        clock,
        now.toLocaleTimeString(this.hass?.locale?.language ?? "nl", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }

  paint() {
    this.paintClock_();

    const c = this.config;
    const w = stateOf(this.hass, c.weather);
    const wa = attrsOf(this.hass, c.weather);

    const now = this.$(".now");
    if (now && w) {
      const icon = weatherIcon(w.state);
      now.style.setProperty("--wtone", toneValue(c.tone, "water"));

      const unit = this.hass?.config?.unit_system?.temperature ?? "°C";
      this.$(".temp").innerHTML =
        wa.temperature != null
          ? `${fmtNumber(this.hass, wa.temperature, 0)}<span>${unit}</span>`
          : "--";

      const ic = now.querySelector(".ic");
      if (ic.dataset.icon !== icon) {
        ic.dataset.icon = icon;
        ic.innerHTML = resolve(icon, "cloud");
      }
      this.text(now.querySelector(".cond"), localizeState(this.hass, w));
    }

    const chips = this.$(".chips");
    if (!chips) return;

    const wanted = CHIP_ORDER.map((key) => this.chip_(key, wa)).filter(Boolean);
    const sig = wanted.map((x) => `${x.key}${x.value}`).join("|");
    if (chips.dataset.sig === sig) return;
    chips.dataset.sig = sig;

    chips.innerHTML = wanted
      .map(
        (x) =>
          `<span class="chip2" style="--tone:${toneValue(CHIPS[x.key].tone)}" title="${CHIPS[x.key].label}">
             ${icons[CHIPS[x.key].icon] ?? ""}${x.value}
           </span>`
      )
      .join("");
  }

  /** Eén chip, of niets als dit huis daar niets over te melden heeft. */
  chip_(key, wa) {
    const c = this.config;
    switch (key) {
      case "humidity":
        return wa.humidity != null ? { key, value: `${Math.round(wa.humidity)}%` } : null;

      case "wind": {
        if (wa.wind_speed == null) return null;
        const unit = this.hass?.config?.unit_system?.wind_speed ?? "km/h";
        const dir = bearing(wa.wind_bearing);
        return {
          key,
          value: `${fmtNumber(this.hass, wa.wind_speed, 0)} ${unit}${dir ? ` ${dir}` : ""}`,
        };
      }

      case "uv": {
        // De UV-index komt van de tweede weerentiteit als die er is: niet elke
        // integratie levert hem, en de integratie met de beste temperatuur is
        // zelden dezelfde als die met UV.
        const alt = attrsOf(this.hass, c.weather_uv);
        const raw =
          alt.uv_index ??
          wa.uv_index ??
          (c.weather_uv ? Number(stateOf(this.hass, c.weather_uv)?.state) : null);
        return raw != null && !Number.isNaN(+raw)
          ? { key, value: `UV ${fmtNumber(this.hass, raw, 1)}` }
          : null;
      }

      case "precipitation": {
        // Een weerentiteit draagt de neerslag zelden als attribuut -- meestal
        // zit die in de voorspelling of in een losse sensor. Dus mag je er een
        // aanwijzen, en dan wint die.
        const st = stateOf(this.hass, c.precipitation_entity);
        if (st) {
          const n = Number(st.state);
          if (Number.isNaN(n)) return null;
          const unit = st.attributes.unit_of_measurement ?? "mm";
          return { key, value: `${fmtNumber(this.hass, n, 1)} ${unit}` };
        }
        return wa.precipitation != null && !Number.isNaN(+wa.precipitation)
          ? { key, value: `${fmtNumber(this.hass, wa.precipitation, 1)} mm` }
          : null;
      }

      case "pressure":
        return wa.pressure != null
          ? { key, value: `${fmtNumber(this.hass, wa.pressure, 0)} ${wa.pressure_unit ?? "hPa"}` }
          : null;

      case "sunset":
      case "sunrise": {
        const sun = stateOf(this.hass, c.sun);
        const iso = sun?.attributes?.[key === "sunset" ? "next_setting" : "next_rising"];
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(+d)) return null;
        return {
          key,
          value: d.toLocaleTimeString(this.hass?.locale?.language ?? "nl", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }

      default:
        return null;
    }
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: "full", rows: 2, min_rows: 2, max_rows: 2 };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-header-card-editor");
  }

  static getStubConfig(hass) {
    const weather = Object.keys(hass?.states ?? {}).find((e) => e.startsWith("weather."));
    return { weather, sun: "sun.sun" };
  }
}

class HeaderEditor extends DacEditor {
  defaults() {
    return {
      show_clock: true,
      show_weather: true,
      show_chips: true,
      show_rule: true,
      hide_below: 768,
    };
  }

  pickers() {
    return [{ key: "tone", kind: "tone", label: "Kleur weericoon" }];
  }

  schema() {
    return [
      row(
        { name: "weather", selector: sel.entity("weather") },
        { name: "weather_uv", selector: { entity: { domain: ["weather", "sensor"] } } }
      ),
      row(
        { name: "sun", selector: sel.entity("sun") },
        { name: "precipitation_entity", selector: sel.entity("sensor") }
      ),
      { name: "name", selector: sel.text() },
      { name: "hide_below", selector: sel.number(0, 1400, 8) },
    ];
  }

  label(s) {
    return (
      {
        weather: "Weer (temperatuur, wind)",
        weather_uv: "Tweede weerbron (UV-index)",
        precipitation_entity: "Neerslagsensor",

        show_rule: "Accentlijn tonen",
        hide_below: "Verbergen onder breedte (px)",
        name: "Naam",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "weather_uv")
      return "Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";
    if (s.name === "precipitation_entity")
      return "Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";
    if (s.name === "hide_below")
      return "768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";
    if (s.name === "name")
      return "Leeg laten voor de naam van de ingelogde gebruiker.";
    return undefined;
  }
}

registerEditor("domotiapp-header-card-editor", HeaderEditor);
registerCard("domotiapp-header-card", HeaderCard, {
  name: "DomotiApp Header",
  description: "Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons.",
});
