/**
 * Rolluiken, poorten, zonneschermen en alles wat op een cover-entiteit zit.
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
 *
 * Drie dingen staan per regel in te stellen, want het zijn eigenschappen van
 * het apparaat en niet van de kaart: `poort` (woorden op de knoppen in plaats
 * van pijlen, want een poort schuift opzij), `invert` (de motor is omgekeerd
 * aangesloten) en een eigen naam. Het rekenwerk daarachter staat los in
 * `cover-logica.js`, met een gewone Node-test eromheen.
 */

import { DacCard, registerCard, registerEditor, rowsFor, toneValue, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { attrsOf, bindActions, moreInfo, nameOf, stateOf } from "../ha.js";
import { bindSlider, sliderCss, sliderHtml } from "../slider.js";
import {
  BIT_VOOR_DIENST,
  F,
  dienstVoor,
  getoondeStand,
  isOmgekeerd,
  isPoort,
  keerPositie,
  knopTekst,
  standaardIconen,
  statusTekst,
  toestandUit,
} from "./cover-logica.js";

const can = (st, bit) => Boolean((st?.attributes?.supported_features ?? 0) & bit);

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

    /* Een poort schuift opzij; omhoog en omlaag zeggen daar niets over. Dan
       maar woorden, en die hebben een andere breedte dan een pijl. */
    .keys.woorden button.tekst {
      width: auto; min-width: 58px; padding: 0 11px;
      font-family: inherit; font-size: 12.5px; font-weight: 500; line-height: 1;
      white-space: nowrap;
    }

    /* ---- positie, alleen bij motoren die terugmelden ---- */
    .pos { grid-column: 1 / -1; margin: 2px 0 4px; display: flex; }
    .pos[hidden] { display: none; }
    ${sliderCss}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) {
      .keys button { width: 34px; }
      .keys.woorden button.tekst { min-width: 0; padding: 0 8px; font-size: 12px; }
    }
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

  keysHtml(withStop, poort) {
    const tekst = knopTekst(poort);
    const knop = (act, naam, teken) =>
      `<button type="button" class="${poort ? "tekst" : ""}" data-act="${act}" ` +
      `aria-label="${naam}">${teken}</button>`;
    return `
      <div class="keys${poort ? " woorden" : ""}">
        ${knop("open", tekst.open, poort ? tekst.open : icons.arrowUp)}
        ${withStop ? `<button type="button" data-act="stop" aria-label="Stop">${icons.stop}</button>` : ""}
        ${knop("close", tekst.close, poort ? tekst.close : icons.arrowDown)}
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
        ${this.keysHtml(c.show_stop !== false, isPoort(cv, c))}
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
    // alleen in dit tabblad -- er is niets om op de server te bewaren. Staat in
    // de richting die de KAART toont, dus een omgekeerde motor hoeft hier niet
    // nog eens omgedraaid te worden.
    this.assumed_ = new Map();

    this.$$(".cv").forEach((cvEl) => {
      const i = cvEl.dataset.i;

      cvEl.querySelectorAll(".keys button").forEach((btn) => {
        this.on(btn, "click", () => {
          const act = btn.dataset.act;
          const cfg = this.config.covers[+i];
          this.hass.callService("cover", dienstVoor(act, isOmgekeerd(cfg, this.config)), {
            entity_id: cfg.entity,
          });

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
      const omgekeerd = isOmgekeerd(cfg, this.config);
      const poort = isPoort(cfg, this.config);
      const state = toestandUit(st?.state ?? "unknown", omgekeerd);

      cvEl.classList.toggle("unavailable", dead);
      cvEl.querySelector(".nm").textContent = nameOf(this.hass, cfg.entity, cfg.name);

      const hasPos = can(st, F.SET_POSITION) && attrs.current_position != null;
      const positie = hasPos ? keerPositie(attrs.current_position, omgekeerd) : null;

      const shown = getoondeStand({ state, positie, aanname: this.assumed_.get(i) });
      cvEl.dataset.shown = shown;

      const fallback = standaardIconen(attrs, poort);
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

      const stEl = cvEl.querySelector(".st");
      if (!this.dragging_.has(i)) {
        stEl.textContent = statusTekst({ dood: dead, state, positie, toon: this.toonStatus_() });
      }

      cvEl.querySelectorAll(".keys button").forEach((b) => {
        const dienst = dienstVoor(b.dataset.act, omgekeerd);
        b.disabled = dead || !can(st, BIT_VOOR_DIENST[dienst]);
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
            if (this.toonStatus_()) cvEl.querySelector(".st").textContent = `${v}% open`;
          };
          this.teardown_.push(
            bindSlider(el0, {
              value: () =>
                keerPositie(attrsOf(this.hass, cfg.entity).current_position ?? 0, omgekeerd),
              onInput: set,
              onCommit: (v) =>
                this.hass.callService("cover", "set_cover_position", {
                  entity_id: cfg.entity,
                  position: keerPositie(v, omgekeerd),
                }),
            })
          );
        }
        const el = pos.querySelector(".slider");
        if (!el.classList.contains("dragging")) {
          const v = positie ?? 0;
          el.style.setProperty("--v", `${v}%`);
          el.setAttribute("aria-valuenow", String(v));
        }
      }
    });
  }

  /** Mag de regel onder de naam er staan? "Niet bereikbaar" komt er altijd. */
  toonStatus_() {
    return this.config.show_state !== false;
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
    return { show_stop: true, show_position: true, show_state: true };
  }

  pickers() {
    return [
      { key: "icon_open", kind: "icon", label: "Icoon als het open staat", fallback: "shutterOpen" },
      { key: "icon_closed", kind: "icon", label: "Icoon als het dicht is", fallback: "shutter" },
    ];
  }

  /**
   * De editor werkt op een platte vorm, de config op een lijst met objecten.
   *
   * Dezelfde steiger als bij de personenkaart, en om dezelfde reden: `ha-form`
   * kent geen herhalende rij, dus wordt elk gekozen rolluik een eigen veld
   * `naam:<entity>`, `poort:<entity>` en `invert:<entity>` in het formulier, en
   * vouwt `serialize` dat terug in `covers: [{ entity, name, poort, invert }]`.
   * De steiger komt nooit in de YAML terecht.
   *
   * De KAART kende die naam al -- `nameOf(hass, cfg.entity, cfg.name)` staat er
   * sinds hij bestaat -- maar er was geen veld om hem in te typen. Gemeld op
   * 26 augustus 2026: "ik kan een rolluik entity niet de naam aanpassen".
   */
  setConfig(config) {
    const flat = { ...config };
    const lijst = (config.covers ?? config.entities ?? (config.entity ? [config.entity] : [])).map(
      (c) => (typeof c === "string" ? { entity: c } : c),
    );
    flat.covers = lijst.map((c) => c.entity);
    for (const c of lijst) {
      if (c.name) flat[`naam:${c.entity}`] = c.name;
      if (c.poort) flat[`poort:${c.entity}`] = true;
      if (c.invert) flat[`invert:${c.entity}`] = true;
    }
    super.setConfig(flat);
  }

  serialize(config) {
    const uit = { ...config };
    const ids = uit.covers ?? [];
    uit.covers = ids.map((id) => {
      const extra = {};
      if (uit[`naam:${id}`]) extra.name = uit[`naam:${id}`];
      if (uit[`poort:${id}`]) extra.poort = true;
      if (uit[`invert:${id}`]) extra.invert = true;
      return Object.keys(extra).length ? { entity: id, ...extra } : id;
    });
    for (const k of Object.keys(uit)) if (/^(naam|poort|invert):/.test(k)) delete uit[k];
    return uit;
  }

  /**
   * Alles onder elkaar, en met opzet geen `row()`.
   *
   * Twee schakelaars naast elkaar zetten leek korter, maar `ha-form` zet de
   * cellen van een raster boven-uitgelijnd: staat er onder de ene een
   * hulptekst van twee regels en onder de andere een van drie, dan staan de
   * schakelaars 17,8px uit elkaar. Gemeten in de echte editor op 30 augustus
   * 2026. Een instelling per regel heeft dat probleem niet, en het is ook de
   * vorm die de rest van deze editors aanhoudt.
   */
  schema() {
    const ids = (this.config_?.covers ?? []).filter((x) => typeof x === "string");
    return [
      { name: "covers", selector: { entity: { domain: "cover", multiple: true } } },
      ...ids.flatMap((id) => [
        { name: `naam:${id}`, selector: sel.text() },
        { name: `poort:${id}`, selector: sel.bool() },
        { name: `invert:${id}`, selector: sel.bool() },
      ]),
      { name: "show_stop", selector: sel.bool() },
      { name: "show_state", selector: sel.bool() },
    ];
  }

  /** Hoe deze entiteit in de labels heet. De eigen naam wint van die van HA. */
  naamVan_(id) {
    return (
      this.config_?.[`naam:${id}`] ||
      this.hass?.states?.[id]?.attributes?.friendly_name ||
      id
    );
  }

  label(s) {
    // De naam van de entiteit staat in ELK van de drie labels, want met drie
    // rolluiken onder elkaar is "Poort" op zichzelf niet te plaatsen.
    if (s.name.startsWith("naam:")) return `Naam voor ${this.naamVan_(s.name.slice(5))}`;
    if (s.name.startsWith("poort:")) return `${this.naamVan_(s.name.slice(6))} is een poort`;
    if (s.name.startsWith("invert:"))
      return `${this.naamVan_(s.name.slice(7))} omgekeerd aangesloten`;
    return (
      {
        covers: "Rolluiken",
        show_stop: "Stopknop tonen",
        show_state: "Status tonen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "covers")
      return "Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten.";
    if (s.name.startsWith("poort:"))
      return "Zet pijltjes om in Openen en Sluiten, en geeft een poorticoon. Een poort schuift opzij, dus omhoog en omlaag zeggen er niets over.";
    if (s.name.startsWith("invert:"))
      return "Voor een motor die andersom is aangesloten: open wordt dicht en dicht wordt open. De knoppen, de status en de schuif draaien samen om.";
    if (s.name === "show_state")
      return "Haalt de regel Open, Dicht of het percentage onder de naam weg. Niet bereikbaar blijft altijd staan.";
    return undefined;
  }
}

registerEditor("domotiapp-cover-card-editor", CoverEditor);
registerCard("domotiapp-cover-card", CoverCard, {
  name: "DomotiApp Rolluiken",
  description: "Open, stop en dicht, met een eigen icoon voor open en dicht.",
});
