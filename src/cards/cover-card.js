/**
 * Rolluiken, zonneschermen en alles wat op een cover-entiteit zit.
 *
 * Gebouwd voor het gewone Nederlandse geval: een motor die open, stop en dicht
 * aanneemt en niets terugmeldt. Home Assistant houdt die eeuwig op `unknown`, en
 * een kaart die daar dan "Onbekend" of "Geen terugkoppeling" onder zet, zet een
 * regel neer die niets toevoegt. Dus staat er in dat geval helemaal geen
 * statusregel -- alleen het icoon, dat meebeweegt met de knop die je indrukte.
 *
 * Dat laatste is bewust een aanname en geen meting. Je hebt zojuist "open"
 * gedrukt, dus het rolluik gaat open; dat is het enige wat de kaart weet en het
 * is precies wat je wilt zien. De knoppen worden er niet door gemarkeerd -- een
 * aanname mag het icoon sturen, maar niet doen alsof er iets gemeten is. Meldt
 * een motor wél terug, dan wint dat altijd van de aanname.
 *
 * Een positieschuif verschijnt alleen wanneer de entiteit SET_POSITION
 * adverteert. Zelfde principe als de lichtkaart: vraag het apparaat, niet de
 * installateur.
 */

import { DacCard, registerCard, registerEditor, rowsFor, toneValue, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { attrsOf, bindActions, moreInfo, nameOf, stateOf } from "../ha.js";
import { bindSlider, sliderCss, sliderHtml } from "../slider.js";

const F = { OPEN: 1, CLOSE: 2, SET_POSITION: 4, STOP: 8 };
const can = (st, bit) => Boolean((st?.attributes?.supported_features ?? 0) & bit);

/** Wat een rolluik draagt als de config niets zegt. */
const defaultIcons = (attrs = {}) => {
  switch (attrs.device_class) {
    case "garage":
      return { open: "garageOpen", closed: "garageClosed" };
    case "awning":
    case "blind":
      return { open: "awning", closed: "awning" };
    default:
      return { open: "shutterOpen", closed: "shutter" };
  }
};

class CoverCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 6px 12px;
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .cv {
      display: grid; grid-template-columns: 40px 1fr auto; gap: 11px; align-items: center;
      flex: 1 1 auto; min-height: 40px;
    }
    .cv + .cv { border-top: 1px solid var(--dac-border); }

    .chip {
      width: 40px; height: 40px; cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Open licht op, dicht is een rusttoestand. De toestand zit in het icoon en
       niet in een gemarkeerde knop: een opgelichte pijl-omlaag leest als "deze
       knop staat aan", en een knop staat nergens aan. */
    .cv[data-shown="open"] .chip {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 38%, transparent);
      box-shadow: 0 0 14px -3px color-mix(in srgb, var(--tone) 60%, transparent);
    }
    .cv[data-shown="closed"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }

    .txt { min-width: 0; }
    .nm { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .st { margin-top: 2px; font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; }
    .st:empty { display: none; }

    /* ---- open / stop / dicht ---- */
    .keys {
      display: inline-flex; gap: 2px; padding: 3px; flex: 0 0 auto;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .keys button {
      width: 36px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .keys button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); } }
    .keys button:active { background: rgba(255,255,255,.14); }
    .keys button .icon { width: 18px; height: 18px; }
    .keys button:disabled { opacity: .3; cursor: default; }

    /* ---- positie, alleen bij motoren die terugmelden ---- */
    .pos { grid-column: 1 / -1; margin: 2px 0 4px; display: flex; }
    .pos[hidden] { display: none; }
    ${sliderCss}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `;

  validate(config) {
    const list = config.covers ?? config.entities ?? (config.entity ? [config.entity] : []);
    if (!list.length) return { ...config, [INCOMPLETE]: "Kies minstens één rolluik of zonnescherm." };
    return {
      ...config,
      covers: list.map((c) => (typeof c === "string" ? { entity: c } : c)),
    };
  }

  watched() {
    return this.config.covers.map((c) => c.entity);
  }

  keysHtml(withStop) {
    return `
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${icons.arrowUp}</button>
        ${withStop ? `<button type="button" data-act="stop" aria-label="Stop">${icons.stop}</button>` : ""}
        <button type="button" data-act="close" aria-label="Dicht">${icons.arrowDown}</button>
      </div>`;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");

    const rows = c.covers
      .map(
        (cv, i) => `
      <div class="cv" data-i="${i}" data-shown="closed" style="--tone:${toneValue(cv.tone ?? c.tone, "solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(c.show_stop !== false)}
        <div class="pos" hidden></div>
      </div>`
      )
      .join("");

    return `<div class="card surface">${rows}</div>`;
  }

  wire() {
    this.dragging_ = new Set();
    // Welke posities al een schuif hebben. Leeg bij elke aankoppeling, want de
    // teardown heeft de oude koppeling net weggehaald.
    this.bound_ = new Set();
    // Wat we dénken dat een motor zonder terugkoppeling doet, per rij. Leeft
    // alleen in dit tabblad -- er is niets om op de server te bewaren.
    this.assumed_ = new Map();

    this.$$(".cv").forEach((cvEl) => {
      const i = cvEl.dataset.i;

      cvEl.querySelectorAll(".keys button").forEach((btn) => {
        this.on(btn, "click", () => {
          const act = btn.dataset.act;
          const map = { open: "open_cover", stop: "stop_cover", close: "close_cover" };
          this.hass.callService("cover", map[act], { entity_id: this.config.covers[+i].entity });

          if (act === "stop") return;
          this.assumed_.set(i, act === "open" ? "open" : "closed");
          this.paint();
        });
      });

      const entity = this.config.covers[+i].entity;
      this.teardown_.push(
        bindActions(cvEl.querySelector(".chip"), { onTap: () => moreInfo(this, entity) })
      );

      // De positieschuif krijgt zijn gedrag pas als hij bestaat -- zie paint().
    });
  }

  paint() {
    this.$$(".cv").forEach((cvEl) => {
      const i = cvEl.dataset.i;
      const cfg = this.config.covers[+i];
      const st = stateOf(this.hass, cfg.entity);
      const attrs = attrsOf(this.hass, cfg.entity);
      const dead = !st || st.state === "unavailable";
      const state = st?.state ?? "unknown";

      cvEl.classList.toggle("unavailable", dead);
      cvEl.querySelector(".nm").textContent = nameOf(this.hass, cfg.entity, cfg.name);

      const hasPos = can(st, F.SET_POSITION) && attrs.current_position != null;

      // Welke van de twee iconen: wat de motor meldt, anders wat je zojuist
      // indrukte, anders dicht. Dat laatste is de rustige gok: een opgelicht
      // icoon trekt aandacht, en aandacht trekken voor iets wat niemand weet is
      // erger dan het even mis hebben in de andere richting.
      const shown = hasPos
        ? attrs.current_position > 0
          ? "open"
          : "closed"
        : state === "open" || state === "closed"
          ? state
          : (this.assumed_.get(i) ?? "closed");
      cvEl.dataset.shown = shown;

      const fallback = defaultIcons(attrs);
      const wanted =
        (shown === "open" ? cfg.icon_open : cfg.icon_closed) ??
        (shown === "open" ? this.config.icon_open : this.config.icon_closed) ??
        cfg.icon ??
        fallback[shown];
      const chip = cvEl.querySelector(".chip");
      if (chip.dataset.icon !== wanted) {
        chip.dataset.icon = wanted;
        chip.innerHTML = resolve(wanted, fallback[shown]);
      }

      // Geen terugkoppeling betekent geen statusregel. Een zin die zegt dat er
      // niets bekend is, is nog steeds een zin die de rij hoger maakt.
      const stEl = cvEl.querySelector(".st");
      if (!this.dragging_.has(i)) {
        stEl.textContent = dead
          ? "Niet bereikbaar"
          : state === "opening"
            ? "Gaat open"
            : state === "closing"
              ? "Gaat dicht"
              : hasPos
                ? `${attrs.current_position}% open`
                : state === "open"
                  ? "Open"
                  : state === "closed"
                    ? "Dicht"
                    : "";
      }

      cvEl.querySelectorAll(".keys button").forEach((b) => {
        if (b.dataset.act === "stop") {
          b.disabled = dead || !can(st, F.STOP);
          return;
        }
        const isOpenBtn = b.dataset.act === "open";
        b.disabled = dead || (isOpenBtn ? !can(st, F.OPEN) : !can(st, F.CLOSE));
      });

      const pos = cvEl.querySelector(".pos");
      const wantPos = hasPos && this.config.show_position !== false;
      pos.hidden = !wantPos;
      if (wantPos) {
        // De opbouw blijft staan tussen verplaatsingen door, het gedrag niet:
        // teardown haalde de schuif los. `bound_` wordt in wire() geleegd, dus
        // na terugplaatsen wordt er precies één keer opnieuw gekoppeld.
        if (!pos.dataset.built) {
          pos.dataset.built = "1";
          pos.innerHTML = sliderHtml("position");
          pos.querySelector(".slider").setAttribute("aria-label", "Positie");
        }
        if (!this.bound_.has(i)) {
          this.bound_.add(i);
          const el0 = pos.querySelector(".slider");
          const set = (v) => {
            el0.style.setProperty("--v", `${v}%`);
            el0.setAttribute("aria-valuenow", String(v));
            cvEl.querySelector(".st").textContent = `${v}% open`;
          };
          this.teardown_.push(
            bindSlider(el0, {
              value: () => attrsOf(this.hass, cfg.entity).current_position ?? 0,
              onInput: set,
              onCommit: (v) =>
                this.hass.callService("cover", "set_cover_position", {
                  entity_id: cfg.entity,
                  position: v,
                }),
            })
          );
        }
        const el = pos.querySelector(".slider");
        if (!el.classList.contains("dragging")) {
          const v = attrs.current_position ?? 0;
          el.style.setProperty("--v", `${v}%`);
          el.setAttribute("aria-valuenow", String(v));
        }
      }
    });
  }

  /** Elke rolluikregel is 40px, plus de rand van de kaart en een eventuele schuif. */
  rows_() {
    const list = this.config?.covers ?? [];
    const pos = list.some((c) => can(stateOf(this.hass, c.entity), F.SET_POSITION));
    return rowsFor(12 + Math.max(1, list.length) * 42 + (pos ? 30 : 0));
  }

  getCardSize() {
    return this.rows_();
  }

  getGridOptions() {
    const rows = this.rows_();
    return { columns: 12, rows, min_columns: 6, min_rows: rows, max_rows: rows };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-cover-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cover = entities?.find((e) => e.startsWith("cover."));
    return { covers: cover ? [cover] : [] };
  }
}

class CoverEditor extends DacEditor {
  defaults() {
    return { show_stop: true, show_position: true };
  }

  pickers() {
    return [
      { key: "icon_open", kind: "icon", label: "Icoon als het open staat", fallback: "shutterOpen" },
      { key: "icon_closed", kind: "icon", label: "Icoon als het dicht is", fallback: "shutter" },
      { key: "tone", kind: "tone", label: "Kleur" },
    ];
  }

  schema() {
    return [
      { name: "covers", selector: { entity: { domain: "cover", multiple: true } } },
      { name: "show_stop", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      {
        covers: "Rolluiken",
        show_stop: "Stopknop tonen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "covers")
      return "Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt.";
    return undefined;
  }
}

registerEditor("domotiapp-cover-card-editor", CoverEditor);
registerCard("domotiapp-cover-card", CoverCard, {
  name: "DomotiApp Rolluiken",
  description: "Open, stop en dicht, met een eigen icoon voor open en dicht.",
});
