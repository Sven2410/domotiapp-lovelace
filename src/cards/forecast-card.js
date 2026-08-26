/**
 * De weersvoorspelling: vandaag groot, de dagen erna op een rij.
 *
 * Eén instelling -- de weerentiteit -- en de rest leest de kaart zelf uit. Wat
 * er te zien is hangt af van wat je weerbron levert: een bron zonder minimum
 * toont alleen het maximum, een bron zonder neerslagkans laat dat weg. Niets
 * wordt bijverzonnen en niets staat er als streepje bij.
 *
 * ## Waarom de voorspelling niet in de attributen staat
 *
 * Tot Home Assistant 2023.9 hing de hele voorspelling als attribuut aan de
 * weerentiteit. Dat is eruit gehaald: een uurvoorspelling van 48 punten in een
 * attribuut betekent dat elke state-update van die entiteit 48 punten door de
 * websocket duwt, naar elke browser die openstaat. Nu vraag je hem apart op met
 * een abonnement (`weather/subscribe_forecast`), en dat is precies wat deze
 * kaart doet -- hetzelfde commando dat Home Assistants eigen weerkaart gebruikt.
 *
 * Het abonnement wordt bij elke aankoppeling opnieuw gelegd en bij elke
 * afkoppeling opgezegd. Dat is niet netheid maar noodzaak: HA verplaatst kaarten
 * in de DOM, en een abonnement dat blijft hangen stapelt zich op tot dezelfde
 * kaart vier keer dezelfde voorspelling binnenkrijgt.
 */

import { DacCard, registerCard, registerEditor, TONES, INCOMPLETE } from "../base.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve, weatherIcon } from "../icons.js";
import { bindActions, fmtNumber, isDead, localizeState, moreInfo, nameOf, stateOf } from "../ha.js";

const DAGEN = ["zo", "ma", "di", "wo", "do", "vr", "za"];

/** Hoeveel punten er standaard op de rij staan. */
const AANTAL_STANDAARD = 5;
const AANTAL_MAX = 8;

class ForecastCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    /* Op een rasterrij van Home Assistant; --dac-raster wordt gemeten en
       gezet door volgRaster in rasterhoogte.js. De hoogte van een dagtegel
       hangt af van wat je weerbron levert, dus uitrekenen kan hier niet --
       meten wel. */
    .card {
      min-height: var(--dac-raster, 56px); padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- vandaag ---- */
    .nu { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .nu[hidden] { display: none; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 22px; height: 22px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .graden {
      flex: 0 0 auto; font-size: 22px; font-weight: 300; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .graden small { font-size: 12px; color: var(--dac-ink-2); margin-left: 2px; }

    /* ---- de rij dagen ---- */
    .rij {
      display: grid; gap: 4px;
      grid-template-columns: repeat(var(--n, 5), minmax(0, 1fr));
    }
    .rij[hidden] { display: none; }
    .dag {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 2px; border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
    }
    .dag .wanneer {
      font-size: 10.5px; font-weight: 600; letter-spacing: .04em;
      color: var(--dac-ink-3); text-transform: none;
    }
    .dag .icon { width: 20px; height: 20px; color: var(--tone); }
    .dag .max {
      font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums;
    }
    .dag .min {
      font-size: 11px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }
    /* Regen hoort te zien te zijn zonder de tekst te lezen. Een druppel met een
       percentage, en alleen als de bron er een geeft. */
    .dag .nat {
      display: flex; align-items: center; gap: 2px;
      font-size: 10px; color: var(--dac-grid-in); font-variant-numeric: tabular-nums;
    }
    .dag .nat .icon { width: 10px; height: 10px; color: var(--dac-grid-in); }
    .dag .nat:empty { display: none; }

    .leeg {
      padding: 10px 2px; text-align: center;
      font-size: 12px; color: var(--dac-ink-3);
    }

    .unavailable { opacity: .42; }
  `;

  validate(config) {
    if (!config.entity) {
      return { ...config, [INCOMPLETE]: "Kies een weerentiteit." };
    }
    const aantal = Math.min(Math.max(1, Number(config.days) || AANTAL_STANDAARD), AANTAL_MAX);
    return { show_current: true, forecast_type: "daily", ...config, days: aantal };
  }

  watched() {
    return [this.config.entity];
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    const c = this.config;
    return `
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${c.show_current === false ? "hidden" : ""}>
          <span class="chip" style="--tone:${TONES.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${c.days}"></div>
      </div>`;
  }

  wire() {
    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(
      bindActions(this.$(".nu"), {
        onTap: () => moreInfo(this, this.config.entity),
        onHold: () => moreInfo(this, this.config.entity),
      })
    );
    this.abonneer_();
  }

  /**
   * Vraag de voorspelling op en blijf hem volgen.
   *
   * Alles wat hier misgaat is niet-fataal: zonder abonnement toont de kaart de
   * huidige toestand en een regel dat er geen voorspelling is. Een kaart die
   * omvalt omdat een weerbron geen daglijst levert, is erger dan een kaart die
   * de helft laat zien.
   */
  async abonneer_() {
    const c = this.config;
    this.opzeggen_?.();
    this.opzeggen_ = null;

    const verbinding = this.hass?.connection;
    if (!verbinding?.subscribeMessage) {
      this.forecastFout_ = "Geen verbinding voor de voorspelling.";
      this.paintRij_();
      return;
    }

    try {
      const opzeggen = await verbinding.subscribeMessage(
        (bericht) => {
          this.forecast_ = bericht?.forecast ?? [];
          this.forecastFout_ = null;
          this.paintRij_();
        },
        {
          type: "weather/subscribe_forecast",
          forecast_type: c.forecast_type === "hourly" ? "hourly" : "daily",
          entity_id: c.entity,
        }
      );
      // De kaart kan tussen het vragen en het krijgen alweer losgekoppeld zijn:
      // dan meteen opzeggen in plaats van een abonnement laten zweven.
      if (!this.isConnected) {
        opzeggen();
        return;
      }
      this.opzeggen_ = opzeggen;
      this.teardown_.push(() => {
        try {
          opzeggen();
        } catch {
          // Verbinding al weg; niets meer op te zeggen.
        }
        this.opzeggen_ = null;
      });
    } catch (fout) {
      this.forecastFout_ =
        c.forecast_type === "hourly"
          ? "Deze weerbron geeft geen uurvoorspelling."
          : "Deze weerbron geeft geen dagvoorspelling.";
      this.paintRij_();
    }
  }

  paint() {
    const c = this.config;
    const st = stateOf(this.hass, c.entity);
    const dood = isDead(st);

    const nu = this.$(".nu");
    nu.classList.toggle("unavailable", dood);

    const chip = this.$(".chip");
    const wens = c.icon || weatherIcon(st?.state);
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "cloud");
    }

    this.text(".nm", nameOf(this.hass, c.entity, c.name));
    this.text(".st", dood ? "Niet bereikbaar" : localizeState(this.hass, st));

    const graden = this.$(".graden");
    const t = st?.attributes?.temperature;
    const eenheid = st?.attributes?.temperature_unit ?? "°C";
    graden.innerHTML =
      t == null ? "" : `${fmtNumber(this.hass, t, Number.isInteger(t) ? 0 : 1)}<small>${eenheid}</small>`;

    this.paintRij_();

    // De kaart zegt zelf wanneer zijn inhoud van maat verandert. De waarnemer
    // in volgRaster vangt alleen wat er daarna nog binnenkomt; een kind dat op
    // display:none gaat meldt zich daar niet af.
    meetRaster(this.$(".card"));
  }

  paintRij_() {
    const rij = this.$(".rij");
    if (!rij) return;
    const c = this.config;

    if (this.forecastFout_ && !this.forecast_?.length) {
      rij.style.setProperty("--n", 1);
      rij.innerHTML = `<div class="leeg">${this.forecastFout_}</div>`;
      return;
    }

    const punten = (this.forecast_ ?? []).slice(0, c.days);
    if (!punten.length) {
      rij.style.setProperty("--n", 1);
      rij.innerHTML = `<div class="leeg">Nog geen voorspelling ontvangen…</div>`;
      return;
    }

    rij.style.setProperty("--n", punten.length);
    const eenheid = stateOf(this.hass, c.entity)?.attributes?.temperature_unit ?? "";
    rij.innerHTML = punten
      .map((p, i) => {
        const wanneer = this.wanneer_(p.datetime, i);
        const icoon = resolve(weatherIcon(p.condition), "cloud");
        const max =
          p.temperature == null
            ? ""
            : `${fmtNumber(this.hass, p.temperature, 0)}°`;
        const min =
          p.templow == null ? "" : `${fmtNumber(this.hass, p.templow, 0)}°`;
        const kans =
          p.precipitation_probability == null
            ? ""
            : `<span class="nat">${resolve("drop")}${Math.round(p.precipitation_probability)}%</span>`;
        return `
          <div class="dag" style="--tone:${TONES.accent}">
            <span class="wanneer">${wanneer}</span>
            ${icoon}
            <span class="max tnum">${max}</span>
            ${min ? `<span class="min tnum">${min}</span>` : ""}
            ${kans}
          </div>`;
      })
      .join("");
    void eenheid;
  }

  /** "vandaag" / "ma" bij dagen, "14:00" bij uren. */
  wanneer_(datum, index) {
    const d = new Date(datum);
    if (Number.isNaN(+d)) return "";
    if (this.config.forecast_type === "hourly") {
      return `${String(d.getHours()).padStart(2, "0")}:00`;
    }
    const vandaag = new Date();
    const zelfdeDag =
      d.getDate() === vandaag.getDate() &&
      d.getMonth() === vandaag.getMonth() &&
      d.getFullYear() === vandaag.getFullYear();
    return index === 0 && zelfdeDag ? "vandaag" : DAGEN[d.getDay()];
  }

  regels_() {
    return this.config?.show_current === false ? 1 : 2;
  }

  getCardSize() {
    return this.regels_() + 1;
  }

  getGridOptions() {
    // "auto", net als de lampkaart. De hoogte van de dagrij hangt af van wat je
    // weerbron levert: zonder minimumtemperatuur en zonder neerslagkans is een
    // tegel twee regels korter. Een vast aantal rasterrijen zou dan bij de ene
    // bron precies passen en bij de andere afknijpen. De inhoud komt wél op een
    // rasterrij uit -- zie rasterhoogte.js.
    // De ondergrens is gemeten, niet geraden -- zie gemetenRijen in
    // rasterhoogte.js.
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-forecast-card-editor");
  }

  static getStubConfig(hass, entities) {
    const weer = entities?.find((e) => e.startsWith("weather."));
    return weer ? { entity: weer } : {};
  }
}

class ForecastEditor extends DacEditor {
  defaults() {
    return { show_current: true, forecast_type: "daily", days: AANTAL_STANDAARD };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "cloudSun" }];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("weather") },
      { name: "name", selector: sel.text() },
      {
        name: "forecast_type",
        selector: sel.select([
          { value: "daily", label: "Per dag" },
          { value: "hourly", label: "Per uur" },
        ]),
      },
      { name: "days", selector: sel.number(1, AANTAL_MAX) },
      { name: "show_current", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      {
        entity: "Weerentiteit",
        name: "Naam (overschrijft die van de weerbron)",
        forecast_type: "Voorspelling",
        days: "Hoeveel punten",
        show_current: "Nu-regel tonen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";
    if (s.name === "forecast_type")
      return "Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven.";
    return undefined;
  }
}

registerEditor("domotiapp-forecast-card-editor", ForecastEditor);
registerCard("domotiapp-forecast-card", ForecastCard, {
  name: "DomotiApp Weersvoorspelling",
  description: "Vandaag groot, de dagen erna op een rij. Eén entiteit invullen.",
});
