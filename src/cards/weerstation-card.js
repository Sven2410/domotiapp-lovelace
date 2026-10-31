/**
 * DomotiApp Weerstation: wat het station buiten meet, in één oogopslag.
 *
 * Gevraagd op 31 oktober 2026; de inhoud kwam van de beheersessie, in deze volgorde
 * van belang: temperatuur met vochtigheid en dauwpunt, wind met een kompas, regen, en
 * daarna zon, luchtdruk en een lege batterij.
 *
 * Je kiest de temperatuursensor; de rest zoekt de kaart op het apparaat (zie de kop
 * van `weerstation-logica.js`). Wat er niet is of niets meldt, staat er niet.
 *
 * Merk en type bepalen de foto, net als op de boiler en de stofzuiger.
 *
 * De kaart is een hele breedte, voor in een pop-up. Hoeveel tegels er naast elkaar passen
 * volgt de kaart, met een container query en niet met een mediaquery (valkuil 46).
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, section, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { metType, merkKeuzes, typeKeuzes } from "./productfoto.js";
import {
  ROLLEN,
  WEERSTATIONS,
  WIND_EENHEDEN,
  burenVan,
  drukTrend,
  trendWoord,
  weerRollen,
  weerStand,
  weerstationAfbeelding,
} from "./weerstation-logica.js";
import { nt, t } from "../taal.js";

/** Elke kwartier de trend opnieuw: de druk verandert niet per minuut. */
const TREND_ELKE_MS = 900000;
const TREND_VENSTER_MS = 3 * 3600000;

class WeerstationCard extends DacCard {
  static css = /* css */ `
    :host { display: block; container-type: inline-size; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card {
      min-height: var(--dac-raster, 56px); padding: 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 10px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop { display: flex; align-items: center; gap: 12px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .ico {
      width: 44px; height: 44px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: 50%; color: var(--dac-accent-hi);
      background: var(--dac-surface);
      border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    }
    .ico .icon { width: 22px; height: 22px; }
    /* De achtergrond volgt het thema: een wit station op een lichte kaart heeft anders geen rand. */
    .foto {
      display: block; flex: 0 0 auto; width: 58px; height: 72px;
      padding: 6px; object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
    }
    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm { font-size: 13px; color: var(--dac-ink-2); line-height: 1.25; }
    .temp { font-size: 28px; font-weight: 500; line-height: 1.15; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
    .onder { font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }

    .regen {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 9px;
      font-size: 12.5px; font-weight: 500; color: var(--dac-accent-hi);
      border-radius: var(--dac-radius-pill); background: var(--dac-surface);
      border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    }
    .regen .icon { width: 15px; height: 15px; }

    /* Twee naast twee, of vier op een rij: drie kolommen laat bij vier tegels een gat. */
    .tegels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    @container (min-width: 620px) { .tegels { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

    .tegel {
      min-width: 0; min-height: 62px; padding: 9px 10px; cursor: pointer;
      display: flex; flex-direction: column; gap: 2px; justify-content: center;
      border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .tegel:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
    .tegel.breed { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: 12px; justify-content: flex-start; }
    .tegel .wat { font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); }
    /* Het getal draagt nooit de kleur; de stip erachter wel. */
    .tegel .waarde { font-size: 15px; font-weight: 500; line-height: 1.25; font-variant-numeric: tabular-nums; }
    .tegel .extra { font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); display: flex; align-items: center; gap: 5px; }
    .stip { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: var(--stip); }

    .wind-txt { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .kompas { width: 44px; height: 44px; flex: 0 0 auto; color: var(--dac-ink-3); }
    .kompas circle { fill: none; stroke: currentColor; stroke-width: 1.2; }
    .kompas .naald { fill: var(--dac-accent-hi); transition: transform 300ms ease; transform-origin: 22px 22px; }

    .batterij { font-size: 12.5px; line-height: 1.4; color: var(--dac-warn); }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .kompas .naald { transition: none; } }
  `;

  validate(config) {
    const c = { ...config };
    if (!c.entity) c[INCOMPLETE] = t("Kies de temperatuursensor van het weerstation.");
    return c;
  }

  rollen_() {
    // De buren alleen opnieuw als de entiteiten veranderen: dit draait bij elke
    // wijziging in het huis, en `hass.entities` kan duizenden regels zijn.
    if (this.burenVan_ !== this.hass?.entities) {
      this.burenVan_ = this.hass?.entities;
      this.buren_ = burenVan(this.hass, this.config.entity);
    }
    return weerRollen(this.hass, this.config.entity, this.config, this.buren_);
  }

  watched() {
    return [this.config.entity, ...Object.values(this.rollen_())];
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="kop" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="ico">${resolve("thermo")}</span>
          <span class="txt">
            <span class="nm"></span>
            <span class="temp"></span>
            <span class="onder" hidden></span>
          </span>
          <span class="regen" hidden>${resolve("rain")}<span>${escapeHtml(t("Regent nu"))}</span></span>
        </div>
        <div class="tegels"></div>
        <div class="batterij" hidden></div>
      </div>`;
  }

  wire() {
    this.on(this.$(".kop"), "click", () => moreInfo(this, this.config.entity));
    this.on(this.$(".tegels"), "click", (e) => {
      const id = e.target.closest("[data-id]")?.dataset.id;
      if (id) moreInfo(this, id);
    });
    this.teardown_.push(volgRaster(this.$(".card")));

    this.trend_ = null;
    let dood = false;
    const haal = () => {
      if (!dood) this.haalTrend_(() => dood);
    };
    const klok = setInterval(haal, TREND_ELKE_MS);
    this.teardown_.push(() => {
      dood = true;
      clearInterval(klok);
    });
    haal();
  }

  /**
   * De richting van de luchtdruk, uit de geschiedenis. Lukt dat niet (geen recorder,
   * net na een herstart), dan staat er geen richting, en de volgende keer misschien wel.
   */
  async haalTrend_(isDood) {
    const id = this.rollen_().druk;
    if (!id || !this.hass?.connection) return;
    const nu = Date.now();
    try {
      const uit = await this.hass.connection.sendMessagePromise({
        type: "history/history_during_period",
        start_time: new Date(nu - TREND_VENSTER_MS).toISOString(),
        end_time: new Date(nu).toISOString(),
        entity_ids: [id],
        minimal_response: true,
        no_attributes: true,
      });
      if (isDood()) return;
      this.trend_ = drukTrend(uit?.[id]);
      this.paint();
    } catch {
      this.trend_ = null;
    }
  }

  tegelsHtml_(s, r) {
    const tegel = (id, wat, waarde, extra = "") =>
      waarde == null
        ? ""
        : `<div class="tegel" role="button" tabindex="0" data-id="${escapeHtml(id ?? "")}">
            <span class="wat">${escapeHtml(wat)}</span>
            <span class="waarde">${escapeHtml(waarde)}</span>
            ${extra ? `<span class="extra">${extra}</span>` : ""}
          </div>`;

    const kompas =
      s.richting == null
        ? ""
        : `<svg class="kompas" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="20"></circle>
            <path class="naald" d="M22 6 L27 24 L22 21 L17 24 Z" style="transform:rotate(${s.richting}deg)"></path>
          </svg>`;
    const windRegels = [s.stoot ? t("Windstoten {waarde}", { waarde: s.stoot }) : "", s.streek ? `${s.streek} (${Math.round(s.richting)}°)` : ""]
      .filter(Boolean)
      .map((x) => `<span class="extra">${escapeHtml(x)}</span>`)
      .join("");
    const wind = s.wind
      ? `<div class="tegel breed" role="button" tabindex="0" data-id="${escapeHtml(s.windEntiteit ?? "")}">
          ${kompas}
          <span class="wind-txt">
            <span class="wat">${escapeHtml(t("Wind"))}</span>
            <span class="waarde">${escapeHtml(s.wind)}</span>
            ${windRegels}
          </span>
        </div>`
      : "";

    const uvExtra = s.uvSchaal
      ? `<span class="stip" style="--stip:${TONES[s.uvSchaal.tone]}"></span>${escapeHtml(s.uvSchaal.woord)}`
      : "";
    const trend = trendWoord(this.trend_);
    return [
      wind,
      tegel(r.neerslag, t("Neerslag"), s.neerslag),
      tegel(r.uv, t("UV-index"), s.uv, uvExtra),
      tegel(r.licht, t("Lichtsterkte"), s.licht),
      tegel(r.druk, t("Luchtdruk"), s.druk, trend ? escapeHtml(trend) : ""),
    ].join("");
  }

  /** De foto: het gekozen type, de foto bij de modelcode, een eigen, of de thermometer. */
  paintFoto_() {
    const reg = this.hass?.entities?.[this.config.entity];
    const apparaat = reg?.device_id ? this.hass?.devices?.[reg.device_id] ?? null : null;
    const bron = weerstationAfbeelding(this.config, apparaat);
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        // Een foto die niet laadt: dan de thermometer.
        img.onerror = () => {
          img.dataset.kapot = "1";
          if (this.hass && this.wired_) this.paint();
        };
        img.src = bron;
      } else {
        img.removeAttribute("src");
      }
    }
    const toon = Boolean(bron) && img.dataset.kapot !== "1";
    img.hidden = !toon;
    this.$(".ico").hidden = toon;
  }

  paint() {
    const c = this.config;
    const r = this.rollen_();
    this.paintFoto_();
    const s = weerStand(this.hass, c.entity, r, { windEenheid: c.wind_eenheid ?? "auto" });

    this.text(".nm", c.name || nameOf(this.hass, c.entity));
    this.text(".temp", s.bereikbaar ? s.temperatuur : t("Niet bereikbaar"));
    const onder = [s.vocht ? t("Vochtigheid {waarde}", { waarde: s.vocht }) : "", s.dauwpunt ? t("Dauwpunt {waarde}", { waarde: s.dauwpunt }) : ""]
      .filter(Boolean)
      .join(" · ");
    this.text(".onder", onder);
    this.$(".onder").hidden = !onder;
    this.$(".regen").hidden = !s.regent;

    const tegels = this.$(".tegels");
    const html = this.tegelsHtml_(s, r);
    if (tegels.dataset.html !== html) {
      tegels.dataset.html = html;
      tegels.innerHTML = html;
    }
    tegels.hidden = !html;

    const bat = this.$(".batterij");
    bat.hidden = s.batterijLaag == null;
    if (s.batterijLaag != null) bat.textContent = t("Batterij bijna leeg: {pct}%", { pct: s.batterijLaag });

    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 3) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-weerstation-card-editor");
  }

  static getStubConfig(hass, entities) {
    const id = (entities ?? []).find((e) => e.startsWith("sensor.") && /weather_station|weerstation/.test(e) && /temp/.test(e));
    return id ? { entity: id } : {};
  }
}

const ROL_LABELS = {
  vocht: nt("Vochtigheid"),
  dauwpunt: nt("Dauwpunt"),
  wind: nt("Wind"),
  windstoot: nt("Windstoot"),
  richting: nt("Windrichting"),
  regent: nt("Regent nu"),
  neerslag: nt("Neerslag"),
  uv: nt("UV-index"),
  licht: nt("Lichtsterkte"),
  druk: nt("Luchtdruk"),
  batterij: nt("Batterij"),
};

class WeerstationEditor extends DacEditor {
  defaults() {
    return { merk: "auto", wind_eenheid: "auto" };
  }

  /** De fotokiezer alleen bij een ander merk: anders is het een veld dat niets doet. */
  pickers() {
    return this.config_?.merk === "eigen"
      ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: "thermo" }]
      : [];
  }

  serialize(config) {
    const uit = { ...config };
    if (uit.wind_eenheid === "auto") delete uit.wind_eenheid;
    const reg = this.hass_?.entities?.[uit.entity];
    return metType(uit, reg?.device_id ? this.hass_?.devices?.[reg.device_id] : null, WEERSTATIONS);
  }

  schema() {
    const types = typeKeuzes(this.config_?.merk, WEERSTATIONS);
    return [
      { name: "entity", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes(WEERSTATIONS)) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),
      {
        name: "wind_eenheid",
        selector: sel.select(WIND_EENHEDEN.map((k) => ({ value: k.value, label: k.value === "kmh" || k.value === "ms" ? k.label : t(k.label) }))),
      },
      section(
        t("Sensoren met de hand kiezen"),
        "mdi:tune",
        ROLLEN.map((rol) => ({
          name: rol,
          selector: sel.entity(rol === "regent" ? ["binary_sensor"] : ["sensor"]),
        }))
      ),
    ];
  }

  label(s) {
    if (ROL_LABELS[s.name]) return t(ROL_LABELS[s.name]);
    return (
      {
        entity: t("Temperatuur"),
        name: t("Naam"),
        merk: t("Merk"),
        model: t("Type"),
        wind_eenheid: t("Eenheid van de wind"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      entity: t("De temperatuursensor van het weerstation. De rest zoekt de kaart zelf op hetzelfde apparaat."),
      name: t("Leeg laten: de naam van de sensor."),
      merk: t("Een Shelly via BTHome meldt zijn merk niet, en dan toont Automatisch de thermometer. Kies daar zelf Shelly."),
    }[s.name];
  }
}

registerEditor("domotiapp-weerstation-card-editor", WeerstationEditor);
registerCard("domotiapp-weerstation-card", WeerstationCard, {
  name: nt("DomotiApp Weerstation"),
  description: nt("Wat het weerstation meet: temperatuur, wind met een kompas, regen, UV, licht en luchtdruk."),
});

export { WeerstationCard };
