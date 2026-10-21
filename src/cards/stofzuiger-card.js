/**
 * DomotiApp Robotstofzuiger: één robotstofzuiger als productkaart.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie: een kaart voor de
 * robotstofzuiger, net als de thuisbatterij en de laadpaal, met eerst een merk
 * en dan een type en bij dat type een productfoto. Overzichtelijk: wat nodig
 * is, plus de kaart van het huis. In de editor kies je één `vacuum`-entiteit;
 * de rest zoekt de kaart op het apparaat (zie `stofzuigerDelen` in
 * stofzuiger-logica.js).
 *
 * VAN BOVEN NAAR BENEDEN
 *
 *   [foto/chip] X50 Ultra Complete                      55 %
 *               Droogt de dweilpads · 33 % · nog 2 uur  laadt op
 *   ( > Starten ) ( Naar station )
 *   [ de kaart van het huis                     ]        <- live, van de camera
 *   Kamers                                   Wis keuze
 *   ( Kantoor ) ( Gang ) ( Keuken ) ( Woonkamer ) ...    <- kies, dan Start 2 kamers
 *   CleanGenius  ( Uit ) ( Routine ) ( Grondig )
 *   Stand        ( Zuigen ) ( Dweilen ) ( Allebei ) ( Na zuigen )
 *   Zuigkracht   ( Stil ) ( Standaard ) ( Sterk ) ( Turbo )
 *   Dweilen      ( Iets droog ) ( Vochtig ) ( Nat )      <- niet als hij alleen zuigt
 *   Station      [In orde     ] [In orde   ] [In orde ]
 *                [Schoon water] [Vuil water] [Stofzak ]
 *                ( Reinigen ) ( Drogen ) ( Leegzuigen )
 *   Onderhoud    [67 % Hoofdborstel] [51 % Zijborstel] [35 % Filter] [78 % Sensoren]
 *
 * Met CleanGenius aan kiest die zelf de zuigkracht en het dweilen; dan staan
 * er alleen zijn eigen twee standen, met een zin die dat zegt. Zie de kop van
 * stofzuiger-logica.js voor waarom CleanGenius erop staat.
 *
 * Elk blok onder de bediening valt weg als er niets voor gevonden is, en kan in
 * de editor uit (`verberg`).
 *
 * TWEE KNOPPEN IN DE KOP (Vormregels): een tik op de foto of de chip doet wat
 * de hoofdknop doet (starten, pauzeren of hervatten), een tik op de rest van de
 * kop opent de stofzuiger in Home Assistant.
 *
 * KLEUR: alleen de chip draagt de toestand (bezig is het accent, gepauzeerd let
 * op, een storing rood). Met een foto draagt een klein icoon in de statusregel
 * die kleur. Gekozen knoppen dragen het accent: dat is een keuze, geen
 * toestand. De getallen (accu, onderhoud) zijn neutrale inkt; bij het
 * onderhoud draagt het balkje de status.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { moreInfo, stateOf } from "../ha.js";
import { nt, t } from "../taal.js";
import { bewusteWijziging, meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  BLOKKEN,
  SOORT_TOON,
  STOFZUIGERS,
  actieveKamers,
  bedieningKnoppen,
  blokAan,
  cleanGeniusAan,
  kaartBeeld,
  kamersVan,
  keuzeRijen,
  merkKeuzes,
  naamVan,
  onderhoudLijst,
  stationStand,
  stofzuigerAfbeelding,
  stofzuigerDelen,
  stofzuigerStand,
  typeKeuzes,
} from "./stofzuiger-logica.js";
import { metType } from "./productfoto.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

class StofzuigerCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 12px 14px;
      display: flex; flex-direction: column; justify-content: center; gap: 12px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------- de kop */

    .kop { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
    .kop.dood { opacity: .42; }

    /* De hoofdknop in de kop: de foto of de chip, zonder eigen vorm eromheen. */
    .aan {
      flex: 0 0 auto; display: grid; place-items: center;
      margin: 0; padding: 0; border: 0; background: none; cursor: pointer;
      font: inherit; color: inherit; border-radius: var(--dac-radius-sm);
      -webkit-tap-highlight-color: transparent;
    }
    .aan:disabled { cursor: default; }
    .aan:active:not(:disabled) { transform: scale(.96); }

    .chip {
      width: 44px; height: 44px;
      transition: color 220ms ease, background 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
    :host([bezig]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    /* Een station met robot staat rechtop. De foto staat op een eigen vlak in
       de tint van het thema: een zwart station verdwijnt anders op een
       donkere kaart, net als de zwarte airco. */
    .foto {
      display: block; width: 64px; height: 72px;
      padding: 6px; object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
    }

    .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      display: flex; align-items: center; gap: 6px; min-width: 0;
      font-size: 12px; line-height: 1.3; color: var(--dac-ink-2);
    }
    .st .stip { flex: 0 0 auto; width: 14px; height: 14px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 14px; height: 14px; --mdc-icon-size: 14px; }
    .st .woord { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .st .detail { flex: 0 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dac-ink-3); }
    .st .detail::before { content: "·"; margin-right: 6px; }
    /* Een storing blijft altijd staan, en is rood: dat is status. */
    .fout { font-size: 12px; line-height: 1.3; font-weight: 600; color: var(--dac-bad); }

    /* De accu: groot, en in neutrale inkt. */
    .accu { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
    .pct {
      font-size: 22px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .pct small { font-size: 12px; font-weight: 500; margin-left: 2px; color: var(--dac-ink-3); }
    .accu .onder { margin-top: 4px; font-size: 11px; color: var(--dac-ink-3); white-space: nowrap; }

    /* ------------------------------------------------- knoppen in een rij
       De bediening en het station: gelijke breedtes, icoon en woord. */

    .schakels { display: flex; gap: 6px; min-width: 0; }
    .schakel {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 8px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .schakel .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    .schakel .lb { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (hover: hover) { .schakel:hover:not(:disabled) { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .schakel:active:not(:disabled) { transform: scale(.97); }
    .schakel:disabled { opacity: .4; cursor: default; }
    /* De hoofdknop en een station dat iets doet: het accent. */
    .schakel.hoofd, .schakel[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    /* ------------------------------------------------------- de plattegrond */

    .plattegrond {
      display: grid; place-items: center; min-height: 64px; cursor: pointer;
      padding: 6px; border-radius: var(--dac-radius-sm);
      background: rgba(var(--dac-tint), .04); border: 1px solid var(--dac-border);
      -webkit-tap-highlight-color: transparent;
    }
    .plattegrond img { display: block; max-width: 100%; max-height: 300px; object-fit: contain; }

    /* --------------------------------------------------------------- blokken */

    .blok { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .kopregel { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 4px; }
    .wis {
      border: 0; background: none; padding: 0 4px; cursor: pointer;
      font: inherit; font-size: 11px; color: var(--dac-accent-hi);
    }

    /* Kamers: een rij chips die doorloopt op de volgende regel. */
    .kamers .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .kamer {
      display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%;
      padding: 6px 11px 6px 9px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .kamer .icon, .kamer ha-icon { width: 15px; height: 15px; --mdc-icon-size: 15px; flex: 0 0 auto; }
    .kamer .lb { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @media (hover: hover) { .kamer:hover:not(:disabled) { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .kamer:active:not(:disabled) { transform: scale(.97); }
    .kamer:disabled { cursor: default; }
    .kamer[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    /* De keuzes: een kopje en een rij gelijke knoppen. */
    .keuzes { display: flex; flex-direction: column; gap: 10px; }
    .segs { display: flex; gap: 4px; min-width: 0; }
    .seg {
      flex: 1 1 0; min-width: 0;
      padding: 7px 4px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .seg:hover:not(:disabled) { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .seg:active:not(:disabled) { transform: scale(.97); }
    .seg[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    .seg:disabled { opacity: .4; cursor: default; }

    /* Met CleanGenius aan: waarom de zuigkracht en het dweilen weg zijn. */
    .uitleg { font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-3); padding-left: 4px; margin-top: -4px; }

    /* Het station: de tanks en de stofzak, ook als ze in orde zijn. Wat niet
       in orde is, staat in let op: dat is status. */
    .tanks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
    .tank {
      display: flex; flex-direction: column; gap: 1px;
      padding: 7px 8px; min-width: 0; cursor: pointer;
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .tank:hover { border-color: var(--dac-border-hi); } }
    .tank .w {
      display: flex; align-items: center; gap: 4px; min-width: 0;
      font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
    }
    .tank .w .icon { width: 13px; height: 13px; flex: 0 0 auto; color: var(--dac-ink-3); }
    .tank .w span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tank[data-ok="false"] .w, .tank[data-ok="false"] .w .icon { color: var(--dac-warn); }
    .tank .l {
      font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Onderhoud: vier tegels met een balkje, op een rij (op een smalle kaart
       twee bij twee). Het getal in neutrale inkt, de status in het balkje. */
    .tegels { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
    .tegel {
      display: flex; flex-direction: column; gap: 3px;
      padding: 7px 8px 8px; min-width: 0; cursor: pointer;
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .tegel:hover { border-color: var(--dac-border-hi); } }
    .tegel .w {
      font-size: 14px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .tegel .w small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 2px; font-weight: 400; }
    .tegel .l {
      font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .balk { height: 3px; border-radius: 2px; background: rgba(var(--dac-tint), .1); overflow: hidden; }
    .balk i { display: block; height: 100%; border-radius: 2px; background: var(--balk, var(--dac-accent-hi)); }

    /* ------------------------------------------------------------ smal */

    @container (max-width: 360px) {
      .foto { width: 54px; height: 62px; padding: 5px; }
      .pct { font-size: 19px; }
      .schakel .icon { display: none; }
    }
    @container (max-width: 380px) {
      .tegels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig (zie CLAUDE.md): zonder stofzuiger een uitlegkaart.
    const c = { merk: "auto", ...config };
    if (!c.entity || domeinVan(c.entity) !== "vacuum") c[INCOMPLETE] = t("Kies een robotstofzuiger (vacuum-entiteit).");
    return c;
  }

  /** Een ander register is een andere set delen: dan opnieuw tekenen. */
  set hass(hass) {
    const oud = this.hass_;
    super.hass = hass;
    if (!oud || !this.built_ || !this.wired_ || this.config?.[INCOMPLETE]) return;
    if (oud.entities !== hass?.entities || oud.devices !== hass?.devices) this.paint();
  }

  get hass() {
    return super.hass;
  }

  watched() {
    const d = this.delen_();
    return [
      this.config.entity,
      this.kaartId_(),
      ...Object.values(d).filter((v) => typeof v === "string"),
      ...d.onderhoud.map((o) => o.id),
      ...Object.values(d.restTijd),
    ].filter(Boolean);
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

  /** De camera met de kaart: de gekozen, anders de live kaart van het apparaat. */
  kaartId_() {
    return this.config?.camera || this.delen_().kaart || "";
  }

  /** De vertaling van Home Assistant, voor wat niet in onze eigen woorden staat. */
  vertaal_ = (st, waarde) => this.hass_?.formatEntityState?.(st, waarde);

  /** Kent deze Home Assistant de dienst om kamers te doen? */
  segmentDienst_() {
    return Boolean(this.hass_?.services?.dreame_vacuum?.vacuum_clean_segment);
  }

  roep_(oproep) {
    if (oproep) this.hass_?.callService(oproep[0], oproep[1], oproep[2]);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";
    this.kiezen_ = new Set();

    return `
      <div class="card surface" style="--tone:${TONES.neutral}">
        <div class="kop" role="button" tabindex="0">
          <button type="button" class="aan">
            <img class="foto" alt="" hidden />
            <span class="chip"></span>
          </button>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"><span class="stip" hidden></span><span class="woord"></span><span class="detail" hidden></span></span>
            <span class="fout" hidden></span>
          </span>
          <span class="accu" hidden><span class="pct"></span><span class="onder"></span></span>
        </div>

        <div class="schakels bediening" role="group" aria-label="${t("Bediening")}" hidden></div>

        <div class="plattegrond" role="button" tabindex="0" aria-label="${t("Kaart van het huis")}" hidden>
          <img alt="" />
        </div>

        <div class="blok kamers" hidden>
          <div class="kopregel"><span class="kopje">${t("Kamers")}</span><button type="button" class="wis" hidden>${t("Wis keuze")}</button></div>
          <div class="chips" role="group" aria-label="${t("Kamers")}"></div>
        </div>

        <div class="keuzes" hidden></div>

        <div class="blok station" hidden>
          <span class="kopje">${t("Station")}</span>
          <div class="tanks"></div>
          <div class="schakels knoppen" role="group" aria-label="${t("Station")}"></div>
        </div>

        <div class="blok onderhoud" hidden>
          <span class="kopje">${t("Onderhoud")}</span>
          <div class="tegels"></div>
        </div>

      </div>`;
  }

  wire() {
    const c = this.config;
    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));

    // De kop opent de stofzuiger in Home Assistant ...
    const kop = this.$(".kop");
    this.on(kop, "click", () => moreInfo(this, c.entity));
    this.on(kop, "keydown", (e) => {
      if (e.target !== kop || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      moreInfo(this, c.entity);
    });

    // ... en de foto of de chip doet wat de hoofdknop doet.
    this.on(this.$(".aan"), "click", (e) => {
      e.stopPropagation();
      this.druk_(this.knoppen_?.[0]);
    });

    this.on(this.$(".bediening"), "click", (e) => {
      const knop = e.target?.closest?.(".schakel");
      if (!knop || knop.disabled) return;
      this.druk_(this.knoppen_?.find((k) => k.rol === knop.dataset.rol));
    });

    // De kaart van het huis: groot in Home Assistant.
    const plat = this.$(".plattegrond");
    const openKaart = () => {
      const id = this.kaartId_();
      if (id) moreInfo(this, id);
    };
    this.on(plat, "click", openKaart);
    this.on(plat, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openKaart();
    });
    // Een plaatje dat niet laadt: dan geen leeg vak.
    this.on(plat.querySelector("img"), "error", () => {
      plat.dataset.kapot = "1";
      plat.hidden = true;
    });
    this.on(plat.querySelector("img"), "load", () => meetRaster(kaart));

    // Kamers kiezen: aan en uit, en pas met de hoofdknop starten.
    this.on(this.$(".kamers .chips"), "click", (e) => {
      const chip = e.target?.closest?.(".kamer");
      if (!chip || chip.disabled) return;
      const id = Number(chip.dataset.id);
      if (this.kiezen_.has(id)) this.kiezen_.delete(id);
      else this.kiezen_.add(id);
      this.paint();
    });
    this.on(this.$(".kamers .wis"), "click", () => {
      this.kiezen_.clear();
      this.paint();
    });

    this.on(this.$(".keuzes"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      if (!knop || knop.disabled) return;
      const rij = this.rijen_?.find((r) => r.soort === knop.closest(".blok")?.dataset.soort);
      if (!rij || knop.dataset.waarde === rij.gekozen) return;
      // Een andere stand kan de rij voor het dweilen laten komen of gaan.
      bewusteWijziging(kaart);
      this.roep_(rij.oproep(knop.dataset.waarde));
    });

    this.on(this.$(".station .knoppen"), "click", (e) => {
      const knop = e.target?.closest?.(".schakel");
      if (!knop?.dataset.id || knop.disabled) return;
      this.roep_(["button", "press", { entity_id: knop.dataset.id }]);
    });

    // Een tank of een onderdeel opent zijn sensor: daar staat de geschiedenis.
    const open = (e) => {
      const vak = e.target?.closest?.("[data-open]");
      if (vak) moreInfo(this, vak.dataset.open);
    };
    for (const vak of [this.$(".tanks"), this.$(".tegels")]) {
      this.on(vak, "click", open);
      this.on(vak, "keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        open(e);
      });
    }
  }

  /** Een knop van de bediening indrukken. Een start met kamers wist de keuze. */
  druk_(knop) {
    if (!knop || knop.uit || !knop.oproep) return;
    if (knop.rol === "kamers" || knop.rol === "start") this.kiezen_.clear();
    bewusteWijziging(this.$(".card"));
    this.roep_(knop.oproep);
    this.paint();
  }

  paint() {
    const c = this.config;
    const hass = this.hass_;
    const st = stateOf(hass, c.entity);
    const delen = this.delen_();
    const s = stofzuigerStand(hass, c.entity, delen, this.vertaal_);
    const kaart = this.$(".card");

    // ----- toestand en kleur
    kaart.style.setProperty("--tone", TONES[SOORT_TOON[s.soort]] ?? TONES.neutral);
    this.toggleAttribute("bezig", s.bezig || s.terug);
    this.$(".kop").classList.toggle("dood", !s.beschikbaar);

    // ----- naam, status en storing
    const naam = naamVan(hass, c.entity, c.name);
    this.text(".nm", naam);
    this.text(".woord", s.tekst);
    const detail = this.$(".detail");
    detail.hidden = !s.detail;
    this.text(detail, s.detail);
    const fout = this.$(".fout");
    fout.hidden = !s.fout;
    this.text(fout, s.fout);
    this.$(".kop").setAttribute(
      "aria-label",
      [naam, s.tekst, s.detail, s.fout && t("storing: {fout}", { fout: s.fout })].filter(Boolean).join(", "),
    );

    // ----- de accu
    const accu = this.$(".accu");
    accu.hidden = s.batterij == null;
    if (s.batterij != null) {
      const html = `${Math.round(s.batterij)}<small>%</small>`;
      const pct = this.$(".pct");
      if (pct.dataset.html !== html) {
        pct.dataset.html = html;
        pct.innerHTML = html;
      }
      this.text(".accu .onder", s.laadt ? t("laadt op") : t("accu"));
    }

    // ----- de kamers (vóór de bediening: die hangt van de keuze af)
    const kamers = blokAan(c, "kamers") && this.segmentDienst_() ? kamersVan(st) : [];
    for (const id of [...this.kiezen_]) if (!kamers.some((k) => k.id === id)) this.kiezen_.delete(id);
    if (s.bezig || s.pauze) this.kiezen_.clear();
    this.paintKamers_(kamers, st, s);

    // ----- de bediening, en de hoofdknop in de kop
    this.knoppen_ = bedieningKnoppen(st, { kamers: [...this.kiezen_], segmentDienst: this.segmentDienst_() });
    this.paintBediening_(this.knoppen_);
    const hoofd = this.knoppen_[0];
    const aan = this.$(".aan");
    aan.disabled = !hoofd || hoofd.uit;
    aan.setAttribute("aria-label", hoofd ? hoofd.label : naam);

    // ----- foto of chip
    const icoon = c.icon || "stofzuiger";
    const metFoto = this.paintFoto_();
    const chip = this.$(".chip");
    chip.hidden = metFoto;
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "stofzuiger");
    }
    // Met een foto draagt een icoontje in de statusregel de toestand, maar
    // alleen als er iets te dragen is.
    const stip = this.$(".stip");
    stip.hidden = !metFoto || s.soort === "stil" || s.soort === "dood";
    if (!stip.hidden && stip.dataset.icon !== icoon) {
      stip.dataset.icon = icoon;
      stip.innerHTML = resolve(icoon, "stofzuiger");
    }

    this.paintKaart_();
    this.paintKeuzes_(hass, c, delen);
    this.paintStation_(hass, c, delen, s);
    this.paintOnderhoud_(hass, c, delen);

    meetRaster(kaart);
  }

  /** De foto: het gekozen type, de foto bij de modelcode, een eigen, of niets. */
  paintFoto_() {
    const c = this.config;
    const bron = stofzuigerAfbeelding(c, this.apparaat_());
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        // Een foto die niet laadt: dan de chip, en die draagt de toestand.
        img.onerror = () => {
          img.dataset.kapot = "1";
          if (this.hass_ && this.wired_) this.paint();
        };
        img.src = bron;
      } else {
        img.removeAttribute("src");
      }
    }
    const toon = Boolean(bron) && img.dataset.kapot !== "1";
    img.hidden = !toon;
    return toon;
  }

  apparaat_() {
    const reg = this.hass_?.entities?.[this.config.entity];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  /** Bouw een rij knoppen alleen opnieuw als de knoppen zelf veranderen: zo houdt een knop zijn focus. */
  paintBediening_(knoppen) {
    const vak = this.$(".bediening");
    vak.hidden = knoppen.length === 0;
    const sig = JSON.stringify(knoppen.map((k) => [k.rol, k.label]));
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.innerHTML = knoppen
        .map(
          (k, i) =>
            `<button type="button" class="schakel${i === 0 ? " hoofd" : ""}" data-rol="${escapeHtml(k.rol)}">${resolve(k.icoon)}<span class="lb">${escapeHtml(k.label)}</span></button>`,
        )
        .join("");
    }
    for (const knop of vak.children) {
      knop.disabled = Boolean(knoppen.find((k) => k.rol === knop.dataset.rol)?.uit);
    }
  }

  /** De live kaart. Geen camera, niet beschikbaar of verborgen: geen vak. */
  paintKaart_() {
    const vak = this.$(".plattegrond");
    const bron = blokAan(this.config, "kaart") ? kaartBeeld(this.hass_, this.kaartId_()) : "";
    const img = vak.querySelector("img");
    if (vak.dataset.bron !== bron) {
      vak.dataset.bron = bron;
      vak.dataset.kapot = "";
      if (bron) img.src = bron;
      else img.removeAttribute("src");
    }
    vak.hidden = !bron || vak.dataset.kapot === "1";
  }

  /**
   * De kamers. Kiezen kan alleen als hij niets doet; tijdens een beurt staan
   * de kamers waar hij mee bezig is aangedrukt, en is er niets te kiezen.
   */
  paintKamers_(kamers, st, s) {
    const blok = this.$(".kamers");
    blok.hidden = kamers.length === 0;
    if (blok.hidden) return;
    const chips = blok.querySelector(".chips");
    const sig = JSON.stringify(kamers);
    if (chips.dataset.sig !== sig) {
      chips.dataset.sig = sig;
      chips.innerHTML = kamers
        .map(
          (k) =>
            `<button type="button" class="kamer" data-id="${k.id}" aria-pressed="false">${k.icoon ? resolve(k.icoon) : ""}<span class="lb">${escapeHtml(k.naam)}</span></button>`,
        )
        .join("");
    }
    const bezig = s.bezig || s.pauze;
    const actief = bezig ? actieveKamers(st) : this.kiezen_;
    for (const chip of chips.children) {
      chip.setAttribute("aria-pressed", String(actief.has(Number(chip.dataset.id))));
      chip.disabled = bezig || !s.beschikbaar;
    }
    blok.querySelector(".wis").hidden = bezig || this.kiezen_.size === 0;
  }

  /**
   * CleanGenius, de stand, de zuigkracht en het dweilen: elk een rij knoppen.
   * Met CleanGenius aan komt er onder zijn rij een zin die zegt waarom de
   * zuigkracht en het dweilen weg zijn.
   */
  paintKeuzes_(hass, c, delen) {
    const vak = this.$(".keuzes");
    const rijen = blokAan(c, "modus") ? keuzeRijen(hass, c.entity, delen, this.vertaal_) : [];
    this.rijen_ = rijen;
    vak.hidden = rijen.length === 0;
    const genius = cleanGeniusAan(rijen);
    const sig = JSON.stringify([genius, rijen.map((r) => [r.soort, r.id, r.opties])]);
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.innerHTML = rijen
        .map(
          (r) => `
          <div class="blok" data-soort="${escapeHtml(r.soort)}">
            <span class="kopje">${escapeHtml(r.naam)}</span>
            <div class="segs" role="group" aria-label="${escapeHtml(r.naam)}">${r.opties
              .map(
                (o) =>
                  `<button type="button" class="seg" data-waarde="${escapeHtml(o.waarde)}" aria-pressed="false" aria-label="${escapeHtml(`${r.naam}: ${o.voluit}`)}" title="${escapeHtml(o.voluit)}">${escapeHtml(o.label)}</button>`,
              )
              .join("")}</div>
          </div>${
            r.soort === "cleangenius" && genius
              ? `<div class="uitleg">${t("CleanGenius kiest zelf de zuigkracht en hoe nat hij dweilt.")}</div>`
              : ""
          }`,
        )
        .join("");
    }
    const dood = stateOf(hass, c.entity)?.state === "unavailable";
    for (const blok of vak.querySelectorAll(".blok")) {
      const r = rijen.find((x) => x.soort === blok.dataset.soort);
      for (const knop of blok.querySelectorAll(".seg")) {
        knop.setAttribute("aria-pressed", String(knop.dataset.waarde === r?.gekozen));
        knop.disabled = dood;
      }
    }
  }

  /** Het station: de tanks en de stofzak, en reinigen, drogen en leegzuigen. */
  paintStation_(hass, c, delen, s) {
    const blok = this.$(".station");
    const stand = blokAan(c, "station") ? stationStand(hass, c.entity, delen, this.vertaal_) : { tanks: [], knoppen: [] };
    blok.hidden = stand.tanks.length === 0 && stand.knoppen.length === 0;
    if (blok.hidden) return;

    const tanks = blok.querySelector(".tanks");
    const tsig = JSON.stringify(stand.tanks);
    if (tanks.dataset.sig !== tsig) {
      tanks.dataset.sig = tsig;
      tanks.innerHTML = stand.tanks
        .map(
          (tank) => `
          <div class="tank" role="button" tabindex="0" data-open="${escapeHtml(tank.id)}" data-ok="${tank.ok}" aria-label="${escapeHtml(`${tank.naam}: ${tank.tekst}`)}">
            <span class="w">${tank.ok ? icons.check : icons.warning}<span>${escapeHtml(tank.tekst)}</span></span>
            <span class="l">${escapeHtml(tank.naam)}</span>
          </div>`,
        )
        .join("");
    }
    tanks.hidden = stand.tanks.length === 0;

    const knoppen = blok.querySelector(".knoppen");
    const ksig = JSON.stringify(stand.knoppen.map((k) => [k.id, k.label]));
    if (knoppen.dataset.sig !== ksig) {
      knoppen.dataset.sig = ksig;
      knoppen.innerHTML = stand.knoppen
        .map(
          (k) =>
            `<button type="button" class="schakel" data-id="${escapeHtml(k.id)}" aria-pressed="false">${resolve(k.icoon)}<span class="lb">${escapeHtml(k.label)}</span></button>`,
        )
        .join("");
    }
    knoppen.hidden = stand.knoppen.length === 0;
    for (const knop of knoppen.children) {
      const k = stand.knoppen.find((x) => x.id === knop.dataset.id);
      knop.setAttribute("aria-pressed", String(Boolean(k?.actief)));
      knop.disabled = !s.beschikbaar;
    }
  }

  /** De onderdelen, als tegels met een balkje. */
  paintOnderhoud_(hass, c, delen) {
    const blok = this.$(".onderhoud");
    const lijst = blokAan(c, "onderhoud") ? onderhoudLijst(hass, delen) : [];
    blok.hidden = lijst.length === 0;
    const tegels = blok.querySelector(".tegels");
    const sig = JSON.stringify(lijst);
    if (tegels.dataset.sig === sig) return;
    tegels.dataset.sig = sig;
    tegels.innerHTML = lijst
      .map((o) => {
        const balk = o.toon ? ` style="--balk:${TONES[o.toon]}"` : "";
        const nog = o.rest ? t("nog {duur}", { duur: o.rest }) : "";
        const label = `${o.naam}: ${o.procent} %${nog ? `, ${nog}` : ""}`;
        return `
        <div class="tegel" role="button" tabindex="0" data-open="${escapeHtml(o.id)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(nog || o.naam)}">
          <span class="w">${o.procent}<small>%</small></span>
          <span class="l">${escapeHtml(o.naam)}</span>
          <span class="balk"${balk}><i style="width:${o.procent}%"></i></span>
        </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 4) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-stofzuiger-card-editor");
  }

  static getStubConfig(hass, entities) {
    const stofzuiger = entities?.find((e) => String(e).startsWith("vacuum."));
    return stofzuiger ? { entity: stofzuiger } : {};
  }
}

/**
 * De editor: de stofzuiger, dan merk en type, en wat er weg mag. Plat, zonder
 * uitklapblokken (Vormregels).
 */
class StofzuigerEditor extends DacEditor {
  defaults() {
    return { merk: "auto" };
  }

  /** De fotokiezer alleen bij een ander merk: anders is het een veld dat niets doet. */
  pickers() {
    return [
      { key: "icon", kind: "icon", label: t("Icoon (zonder foto)"), fallback: "stofzuiger" },
      ...(this.config_?.merk === "eigen"
        ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: "stofzuiger" }]
        : []),
    ];
  }

  schema() {
    const types = typeKeuzes(this.config_?.merk);
    return [
      { name: "entity", required: true, selector: sel.entity(["vacuum"]) },
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes()) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),
      { name: "camera", selector: { entity: { domain: ["camera", "image"] } } },
      { name: "verberg", selector: { select: { multiple: true, mode: "list", options: BLOKKEN.map((b) => ({ ...b, label: t(b.label) })) } } },
    ];
  }

  /**
   * Een merk uit de lijst heeft altijd een type: dat van het apparaat als het
   * dat merk is, en anders het eerste. Een ander merk heeft geen type.
   */
  serialize(config) {
    const reg = this.hass_?.entities?.[config.entity];
    return metType(config, reg?.device_id ? this.hass_?.devices?.[reg.device_id] : null, STOFZUIGERS);
  }

  label(s) {
    return (
      {
        entity: t("Robotstofzuiger"),
        name: t("Naam"),
        merk: t("Merk"),
        model: t("Type"),
        camera: t("Kaart van het huis"),
        verberg: t("Verbergen"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      entity: t(
        "De vacuum-entiteit. Accu, status, storing, kamers, keuzes, station, onderhoud en de kaart van hetzelfde apparaat zoekt de kaart zelf."
      ),
      name: t("Leeg laten: de naam van het apparaat in Home Assistant."),
      merk: t(
        "Automatisch toont de productfoto als het type bekend is, en anders het icoon. Een tik op de foto of het icoon doet wat de eerste knop doet: starten, pauzeren of hervatten."
      ),
      model: t("Het type bepaalt de productfoto."),
      camera: t("Leeg laten: de live kaart van dezelfde stofzuiger."),
      verberg: t("Vink aan wat niet op de kaart hoeft. Een blok waar niets voor gevonden is, staat er sowieso niet."),
    }[s.name];
  }
}

registerEditor("domotiapp-stofzuiger-card-editor", StofzuigerEditor);
registerCard("domotiapp-stofzuiger-card", StofzuigerCard, {
  name: nt("DomotiApp Robotstofzuiger"),
  description: nt(
    "Een robotstofzuiger met zijn station: starten per kamer, schoonmaken en zuigkracht, de kaart van het huis, het station en het onderhoud. Met een productfoto per merk en type."
  ),
});

export { StofzuigerCard };
