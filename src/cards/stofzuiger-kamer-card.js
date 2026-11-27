/**
 * DomotiApp Stofzuiger per kamer: één rij voor een kamer-pop-up.
 *
 * Gevraagd op 27 november 2026, via de beheersessie: in elke kamer-pop-up een
 * knop die alleen die kamer laat stofzuigen, en die laat zien of de robot daar
 * nu bezig is. De eigenaar erbij: "het moet niet fout gaan!" Hoe de kamer
 * gekozen wordt en wanneer er een beurt loopt, staat in de kop van
 * `stofzuiger-kamer-logica.js`: op NAAM binnen een gekozen KAART, nooit op een
 * kaal nummer, en een lopende beurt wordt nooit stil vervangen.
 *
 *   [robot]  Keuken                                   ( > Starten )
 *            In het station
 *
 *   [robot]  Keuken                                   ( || Pauzeren )
 *            Bezig hier · 64 %
 *
 *   [robot]  Keuken                                   ( > Starten )   <- uit
 *            Robot staat op een andere kaart (Kaart 2).
 *
 * Een kaart kan meer kamers hebben (een slaapkamer met zijn badkamer): dan doet
 * de robot ze samen in één beurt, en staan ze allebei in de naam. Wie ze apart
 * wil, zet twee kaarten neer.
 *
 * Starten vraagt altijd eerst (`vraag.js`), en vlak na het ja kijkt de kaart
 * opnieuw: is er in de tussentijd iets veranderd (een andere kaart, een beurt
 * begonnen, andere nummers), dan start hij niet en staat de nieuwe stand er.
 *
 * TWEE KNOPPEN (Vormregels): het icoon en de knop rechts doen het werk, een tik
 * op de rest opent de stofzuiger in Home Assistant. Alleen het icoon draagt de
 * toestand: het accent als hij hier bezig is, let op als hij hier gepauzeerd
 * staat.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { moreInfo, stateOf } from "../ha.js";
import { nt, t } from "../taal.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { vraagBevestiging } from "../vraag.js";
import { naamVan, stofzuigerDelen, stofzuigerStand } from "./stofzuiger-logica.js";
import {
  gewensteKamers,
  kaartenVan,
  kamerBeurt,
  kamerDoel,
  kamerKnop,
  kamerNamen,
  nogGeldig,
} from "./stofzuiger-kamer-logica.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

class StofzuigerKamerCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    /* Alles staat in EEN rij, het enige kind van het vak: meetRaster telt de
       kinderen van het vak onder elkaar op (valkuil 74). */
    .card {
      min-height: var(--dac-raster, 56px);
      /* 7 + 40 + 7 plus de rand van 1 boven en onder is precies 56. */
      padding: 7px 10px 7px 7px;
      display: flex; flex-direction: column; justify-content: center; min-width: 0;
      cursor: pointer;
    }
    .rij { display: flex; align-items: center; gap: 10px; min-width: 0; }
    :host([bare]) .card { background: none; box-shadow: none; }

    .aan {
      flex: 0 0 auto; width: 40px; height: 40px;
      display: grid; place-items: center;
      margin: 0; padding: 0; cursor: pointer;
      font: inherit;
      -webkit-tap-highlight-color: transparent;
      transition: color 220ms ease, background 220ms ease, border-color 220ms ease;
    }
    .aan .icon, .aan ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    .aan:disabled { cursor: default; }
    .aan:active:not(:disabled) { transform: scale(.96); }

    .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 12px; line-height: 1.3; color: var(--dac-ink-2);
      overflow: hidden; overflow-wrap: anywhere;
      display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    }
    /* Een kamer die weg is, is een fout in de instelling: let op. Een robot op
       een andere verdieping is gewoon een stand. */
    .st[data-ernstig="true"] { color: var(--dac-warn); }

    .knop {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px 8px 10px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .knop .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    @media (hover: hover) { .knop:hover:not(:disabled) { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .knop:active:not(:disabled) { transform: scale(.97); }
    .knop:disabled { opacity: .4; cursor: default; }
    .knop:not(:disabled) {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    @container (max-width: 300px) {
      .knop .lb { display: none; }
      .knop { padding: 8px 10px; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig (zie CLAUDE.md): wat ontbreekt geeft een uitlegkaart.
    const c = { ...config };
    if (!c.entity || domeinVan(c.entity) !== "vacuum") c[INCOMPLETE] = t("Kies een robotstofzuiger (vacuum-entiteit).");
    else if (!gewensteKamers(c).length) c[INCOMPLETE] = t("Kies in de editor een kamer.");
    return c;
  }

  watched() {
    const d = this.delen_();
    return [this.config.entity, d.toestand, d.voortgang].filter(Boolean);
  }

  /** De rest van het apparaat, vastgehouden zolang het register gelijk blijft. */
  delen_() {
    const hass = this.hass_;
    const id = this.config?.entity ?? "";
    const m = this.delenMemo_;
    if (m && m.entities === hass?.entities && m.id === id) return m.uit;
    const uit = stofzuigerDelen(hass, id);
    this.delenMemo_ = { entities: hass?.entities, id, uit };
    return uit;
  }

  vertaal_ = (st, waarde) => this.hass_?.formatEntityState?.(st, waarde);

  /** Alles wat de rij nodig heeft, op dit moment. Ook vlak na het ja op de vraag. */
  stand_() {
    const c = this.config;
    const hass = this.hass_;
    const st = stateOf(hass, c.entity);
    const segmentDienst = Boolean(hass?.services?.dreame_vacuum?.vacuum_clean_segment);
    const doel = kamerDoel(st, c, { segmentDienst });
    const beurt = kamerBeurt(st, doel);
    const naam = c.name || kamerNamen(gewensteKamers(c));
    const robot = naamVan(hass, c.entity);
    const knop = kamerKnop(st, doel, beurt, { robot, namen: naam });
    return { st, doel, beurt, naam, knop };
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    return `
      <div class="card surface" role="button" tabindex="0" style="--tone:${TONES.neutral}">
        <div class="rij">
          <button type="button" class="aan chip"></button>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <button type="button" class="knop"><span class="ic"></span><span class="lb"></span></button>
        </div>
      </div>`;
  }

  wire() {
    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));
    this.on(kaart, "click", () => moreInfo(this, this.config.entity));
    this.on(kaart, "keydown", (e) => {
      if (e.target !== kaart || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      moreInfo(this, this.config.entity);
    });
    for (const knop of [this.$(".aan"), this.$(".knop")]) {
      this.on(knop, "click", (e) => {
        e.stopPropagation();
        this.druk_();
      });
    }
  }

  /**
   * Pauzeren en hervatten meteen; starten na de vraag, en alleen als er
   * ondertussen niets veranderde (`nogGeldig`). Een tweede tik terwijl de vraag
   * openstaat doet niets.
   */
  async druk_() {
    const knop = this.knop_;
    if (!knop || knop.uit || !knop.oproep || this.vraagt_) return;
    if (!knop.vraag) {
      this.hass_?.callService(...knop.oproep);
      return;
    }
    this.vraagt_ = true;
    try {
      const ja = await vraagBevestiging({ ...knop.vraag, dismissText: t("Annuleren") });
      if (!ja) return;
      const nu = this.stand_().knop;
      if (nogGeldig(knop, nu)) this.hass_?.callService(...nu.oproep);
    } finally {
      this.vraagt_ = false;
      if (this.hass_ && this.wired_) this.paint();
    }
  }

  paint() {
    const c = this.config;
    const { st, doel, beurt, naam, knop } = this.stand_();
    const s = stofzuigerStand(this.hass_, c.entity, this.delen_(), this.vertaal_);
    this.knop_ = knop;

    // ----- de tekst onder de naam
    let tekst = s.tekst;
    let ernstig = false;
    if (beurt.soort === "hier") {
      const v = Number(this.hass_?.states?.[this.delen_().voortgang]?.state ?? st?.attributes?.cleaning_progress);
      const verder = st?.state === "cleaning" ? (v > 0 ? `${Math.round(v)} %` : "") : beurt.pauze ? "" : s.tekst;
      tekst = [beurt.pauze ? t("Gepauzeerd hier") : t("Bezig hier"), verder].filter(Boolean).join(" · ");
    } else if (beurt.soort !== "dood" && !doel.ok) {
      tekst = doel.reden;
      ernstig = doel.ernstig;
    } else if (beurt.soort === "elders") {
      tekst = beurt.waar
        ? beurt.pauze
          ? t("Gepauzeerd in {waar}", { waar: beurt.waar })
          : t("Bezig in {waar}", { waar: beurt.waar })
        : t("Bezig met een andere beurt");
    }
    if (s.fout) tekst = s.fout;

    this.text(".nm", naam);
    const regel = this.$(".st");
    this.text(regel, tekst);
    regel.dataset.ernstig = String(ernstig || Boolean(s.fout));

    // ----- het icoon draagt de toestand
    const toon = beurt.soort === "hier" ? (beurt.pauze ? TONES.warn : TONES.accent) : TONES.neutral;
    this.$(".card").style.setProperty("--tone", toon);
    const aan = this.$(".aan");
    const icoon = c.icon || "stofzuiger";
    if (aan.dataset.icon !== icoon) {
      aan.dataset.icon = icoon;
      aan.innerHTML = resolve(icoon, "stofzuiger");
    }

    // ----- de knop
    const el = this.$(".knop");
    if (el.dataset.rol !== knop.rol) {
      el.dataset.rol = knop.rol;
      el.querySelector(".ic").outerHTML = `<span class="ic">${resolve(knop.icoon)}</span>`;
      this.text(el.querySelector(".lb"), knop.label);
    }
    el.disabled = knop.uit;
    aan.disabled = knop.uit;
    const label = `${knop.label}: ${naam}`;
    el.setAttribute("aria-label", label);
    aan.setAttribute("aria-label", label);
    el.title = knop.uit ? tekst : "";
    this.$(".card").setAttribute("aria-label", [naam, tekst].filter(Boolean).join(", "));

    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".card", 1) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-stofzuiger-kamer-card-editor");
  }

  static getStubConfig(hass, entities) {
    const id = entities?.find((e) => String(e).startsWith("vacuum."));
    if (!id) return {};
    const st = hass?.states?.[id];
    const kaart = st?.attributes?.selected_map;
    const kamers = kaartenVan(st)[kaart ?? ""] ?? [];
    return kamers.length ? { entity: id, ...(kaart ? { kaart } : {}), kamers: [{ naam: kamers[0].naam, id: kamers[0].id }] } : { entity: id };
  }
}

/**
 * De editor: de robot, de kaart en de kamers op die kaart, met hun naam. Het
 * nummer schrijft hij er als hint bij; kiezen doet de kaart op naam.
 */
class StofzuigerKamerEditor extends DacEditor {
  /** In het formulier zijn de kamers namen; in de config `{naam, id}`. */
  setConfig(config) {
    this.hints_ = new Map(gewensteKamers(config).map((k) => [k.naam, k.id]));
    const { kamer, ...rest } = config ?? {};
    super.setConfig({ ...rest, kamers: gewensteKamers(config).map((k) => k.naam) });
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: t("Icoon"), fallback: "stofzuiger" }];
  }

  /** De kaarten van de gekozen robot, en de kamers op de gekozen kaart. */
  kaarten_() {
    return kaartenVan(this.hass_?.states?.[this.config_?.entity]);
  }

  schema() {
    const kaarten = this.kaarten_();
    const namen = Object.keys(kaarten).filter(Boolean);
    const kaart = namen.find((k) => k === this.config_?.kaart);
    const lijst = kaarten[namen.length ? kaart ?? "\u0000" : ""] ?? [];
    const gekozen = this.config_?.kamers ?? [];
    const opties = [
      ...lijst.map((k) => ({ value: k.naam, label: k.naam })),
      ...gekozen.filter((n) => !lijst.some((k) => k.naam === n)).map((n) => ({ value: n, label: t("{naam} (staat niet op deze kaart)", { naam: n }) })),
    ];
    const kaartOpties = [...namen, ...(this.config_?.kaart && !kaart ? [this.config_.kaart] : [])];
    return [
      { name: "entity", required: true, selector: sel.entity(["vacuum"]) },
      ...(kaartOpties.length ? [{ name: "kaart", selector: sel.select(kaartOpties.map((k) => ({ value: k, label: k }))) }] : []),
      ...(opties.length ? [{ name: "kamers", selector: { select: { multiple: true, mode: "list", options: opties } } }] : []),
      { name: "name", selector: sel.text() },
    ];
  }

  /** Terug naar `{naam, id}`: het nummer van nu op die kaart, en anders de oude hint. */
  serialize(config) {
    const kaarten = this.kaarten_();
    const lijst = kaarten[config.kaart ?? ""] ?? [];
    const kamers = (config.kamers ?? []).map((naam) => {
      const id = lijst.find((k) => k.naam === naam)?.id ?? this.hints_?.get(naam) ?? null;
      return id == null ? { naam } : { naam, id };
    });
    const uit = { ...config };
    if (kamers.length) uit.kamers = kamers;
    else delete uit.kamers;
    return uit;
  }

  label(s) {
    return (
      { entity: t("Robotstofzuiger"), kaart: t("Kaart"), kamers: t("Kamers"), name: t("Naam") }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      kaart: t("De kaart (verdieping) waar de kamer op staat. Staat de robot op een andere kaart, dan start hij niets."),
      kamers: t("Twee kamers gaan samen in één beurt. De kaart kiest ze op naam: een kamer die in de app een andere naam krijgt, start niets meer."),
      name: t("Leeg laten: de naam van de kamer."),
    }[s.name];
  }
}

registerEditor("domotiapp-stofzuiger-kamer-card-editor", StofzuigerKamerEditor);
registerCard("domotiapp-stofzuiger-kamer-card", StofzuigerKamerCard, {
  name: nt("DomotiApp Stofzuiger per kamer"),
  description: nt("Eén rij voor een kamer: laat de robotstofzuiger alleen deze kamer doen, en zie of hij er bezig is."),
});

export { StofzuigerKamerCard };
