/**
 * DomotiApp Airco: één airco, van welk merk ook, als productkaart.
 *
 * Gevraagd op 13 oktober 2026: *"ik wil een airco kaart hebben net als de
 * laadpaal kaart en accu kaart"*, en *"Ik wil dat je hem universeel bouwt dat
 * elke airco werkt."* In de editor kies je één climate-entiteit; wat er verder
 * op de kaart staat leest hij uit die entiteit en uit de rest van hetzelfde
 * apparaat (zie `apparaatDelen` in airco-logica.js).
 *
 * VAN BOVEN NAAR BENEDEN
 *
 *   [foto/chip] Kantoor raam                         17,5°
 *               Koelt · Storing                      binnen
 *   ( Uit ) ( Verwarmen ) ( Koelen )                         <- de standen
 *   ( Auto ) ( Drogen ) ( Ventileren )
 *   [-]                 22° doel                [+]          <- alleen als hij aan staat
 *   Ventilator
 *   ( Auto ) ( 1 ) ( 2 ) ( 3 ) ( 4 ) ( 5 )                   <- of een keuzelijst
 *   Lamellen [ Auto  v ]    Opzij [ Midden v ]
 *   [ 0,0 kWh  ] [ 45 %        ]                             <- alleen wat er is
 *   [ Deze maand ] [ Vochtigheid ]
 *
 * TWEE KNOPPEN IN DE KOP (Vormregels): een tik op de foto of de chip zet de
 * airco aan of uit, een tik op de rest van de kop opent de airco in Home
 * Assistant.
 *
 * KLEUR: alleen de chip draagt de toestand (warm is zon, koud/drogen/lucht is
 * blauw, auto is het accent, uit is neutraal). Met een foto draagt een klein
 * icoon in de statusregel die kleur. De gekozen stand draagt het accent: dat is
 * een keuze, geen toestand. Het getal van de kamertemperatuur draagt nooit
 * kleur.
 *
 * Een airco die UIT staat toont alleen de kop, de standen en de tegels: een
 * doel, een ventilator en lamellen zeggen dan niets.
 *
 * MET DOMOTIAPP COACH (14 oktober 2026)
 *
 *   [foto/chip] Kantoor raam                         17,5°
 *               Uit                                  binnen
 *               Wacht op zon of een goedkoop uur.            <- de regel van de coach
 *   ( Uit ) ( Verwarmen ) ( Koelen ) ...
 *   [-]                 22° doel                [+]          <- ook als hij uit staat
 *   Aan op
 *   ( Zon ) ( Goedkoop ) ( Beide )                           <- alleen bij een dynamisch contract
 *   ( ⏸ Pauze )
 *
 * Stuurt de coach deze airco, dan vindt de kaart dat zelf (`aircoCoach`), en
 * is het doel de temperatuur die de BEWONER wil: de coach zet de airco aan
 * als er zon of een goedkoop uur is, en zet dan dit doel erop. Het gaat dus
 * naar de coach en niet naar de airco, en staat er ook als de airco uit staat.
 * De aan-knop en de standen gaan gewoon naar de airco; zelf aan- of uitzetten
 * is voor de coach "de bewoner wint", tot middernacht. Zie het coachdeel van
 * airco-logica.js.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { moreInfo, nameOf, stateOf } from "../ha.js";
import { locale, nt, t } from "../taal.js";
import { bewusteWijziging, meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  AIRCO_FOTOS,
  KEUZES,
  SOORT_ICOON,
  SOORT_TOON,
  aanUitOproep,
  aircoAfbeelding,
  aircoCoach,
  aircoCoachStand,
  aircoFeiten,
  aanOpKeuzes,
  aanOpOproep,
  aircoStand,
  alsKnoppen,
  apparaatDelen,
  coachAircos,
  coachKnoppen,
  coachRegel,
  doelInstelling,
  doelOproepVoor,
  graden,
  keuzeNu,
  keuzeOproep,
  keuzesVan,
  metCoachDoel,
  standKnopOproep,
  standKnoppen,
  statusTekst,
  volgendeWaarde,
} from "./airco-logica.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

/** Een kleurnaam uit `SOORT_TOON` als token van het thema. */
const toonVan = (soort) => TONES[SOORT_TOON[soort]] ?? TONES.neutral;

/** Het woordje onder het getal in een stelknop. */
const STEL_WOORD = { doel: nt("doel"), laag: nt("laag"), hoog: nt("hoog") };
const STEL_NAAM = { doel: nt("Doeltemperatuur"), laag: nt("Ondergrens"), hoog: nt("Bovengrens") };

class AircoCard extends DacCard {
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

    /* De aan-knop: de foto of de chip, zonder eigen vorm eromheen. */
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
    /* Alleen als de airco zegt dat hij iets doet, gloeit de chip. */
    :host([bezig]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    /* Een binnenunit is breed en laag; geen vaste verhouding, want merken
       verschillen. De foto staat op een eigen vlak in de tint van het thema:
       een zwarte unit (de Premium in Onyx Black) was op een donkere kaart
       zonder dat vlak een donker streepje van 88 bij 33 (gemeten op
       13 oktober 2026). In licht keert de tint om, en staat een witte unit
       op zachtgrijs. */
    .foto {
      display: block; width: 104px; height: 56px; box-sizing: border-box;
      padding: 7px 8px; object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
      transition: opacity 220ms ease;
    }
    :host([uit]) .foto { opacity: .55; }

    .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      display: flex; align-items: center; gap: 6px; min-width: 0;
      font-size: 12px; line-height: 1.3; color: var(--dac-ink-2);
    }
    /* Met een foto draagt dit icoontje de toestand, net als op de laadpaal. */
    .st .stip { flex: 0 0 auto; width: 14px; height: 14px; color: var(--tone); display: grid; }
    .st .stip .icon, .st .stip ha-icon { width: 14px; height: 14px; --mdc-icon-size: 14px; }
    .st .woord { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    /* Een storing blijft altijd staan, en is rood: dat is status. */
    .st .storing { flex: 0 0 auto; color: var(--dac-bad); font-weight: 600; }
    .st .storing::before { content: "·"; margin-right: 6px; color: var(--dac-ink-3); font-weight: 400; }
    /* De zin van de coach: heel, niet afgekapt, net als op de laadpaal. */
    .reden { font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-2); }

    /* De kamertemperatuur: groot, en in neutrale inkt. */
    .binnen { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
    .graden {
      font-size: 24px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .binnen .onder { margin-top: 4px; font-size: 11px; color: var(--dac-ink-3); }

    /* ---------------------------------------------------------- standen
       Gelijke kolommen, en een onvolle laatste regel trekt zich breed: zes
       standen zijn twee keer drie, vijf zijn drie en twee. */

    .standen { --kol: 3; display: flex; flex-wrap: wrap; gap: 6px; }
    .standen[data-n="2"] { --kol: 2; }
    .standen[data-n="4"] { --kol: 4; }
    .standen[data-n="7"], .standen[data-n="8"] { --kol: 4; }

    /* Eén pixel onder de kolombreedte: precies passend laat een afrondings-
       fout de laatste knop soms naar de volgende regel vallen, en groeien
       doen ze toch. */
    .seg {
      flex: 1 1 calc((100% - (var(--kol, 3) - 1) * 6px) / var(--kol, 3) - 1px);
      min-width: 0;
      padding: 8px 6px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .seg:hover:not(:disabled) { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .seg:active:not(:disabled) { transform: scale(.97); }
    /* Kiezen is identiteit en geen oordeel: de gekozen stand draagt het
       accent. Wat de airco DOET staat in de kop, in zijn eigen kleur. */
    .seg[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    .seg:disabled { opacity: .4; cursor: default; }

    /* ---------------------------------------------------------- stelknop
       Over de volle breedte, met de knoppen aan de uiteinden: met één duim
       bij allebei. Bij een bereik twee naast elkaar. */

    .doelen { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .doelen[data-soort="bereik"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .set {
      display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 3px;
      min-width: 0;
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set button {
      flex: 0 0 auto;
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover:not(:disabled) { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .set button:active:not(:disabled) { background: rgba(var(--dac-tint), .14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .target {
      flex: 1 1 auto; min-width: 0; text-align: center; white-space: nowrap;
      font-size: 16px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .set .target small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 5px; font-weight: 400; letter-spacing: 0; }
    /* Terwijl je tikt loopt het getal voor op de airco. Dat mag je zien. */
    .set .target.pending { color: var(--dac-accent-hi); }

    /* -------------------------------------------- de knoppen van de coach
       Dezelfde vorm als Pauze en Schema op de laadpaal. */

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
    @media (hover: hover) { .schakel:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .schakel:active { transform: scale(.97); }
    .schakel[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    /* Pauze is een waarschuwing en geen keuze: de coach doet niets. */
    .schakel[data-rol="pauze"][aria-pressed="true"] {
      color: var(--dac-warn);
      border-color: color-mix(in srgb, var(--dac-warn) 42%, transparent);
      background: color-mix(in srgb, var(--dac-warn) 12%, transparent);
    }

    /* ------------------------------------------- ventilator en keuzelijsten */

    .blok { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
    .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 4px; }

    .segs { display: flex; gap: 4px; min-width: 0; }
    .segs .seg { flex: 1 1 0; padding: 7px 4px; font-size: 12px; }

    .lijsten { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 8px; }
    .lijsten .blok.breed { grid-column: 1 / -1; }

    /* Ondoorzichtige achtergrond, net als op de HVAC-kaart: de browser tekent
       het uitklappaneel met de kleur van de select zelf, en dat paneel valt
       buiten onze shadow root. */
    .keuze {
      width: 100%; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
    .keuze:disabled { opacity: .4; cursor: default; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-on-accent); }

    /* ----------------------------------------------------------- tegels */

    .tegels { --kol: 3; display: grid; grid-template-columns: repeat(var(--kol), minmax(0, 1fr)); gap: 7px; }
    .tegels[data-n="1"] { --kol: 1; }
    .tegels[data-n="2"] { --kol: 2; }
    .tegels[data-n="4"] { --kol: 4; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 6px; min-width: 0; cursor: pointer;
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .tegel:hover { border-color: var(--dac-border-hi); } }
    .tegel .w {
      font-size: 15px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel .w small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 3px; font-weight: 400; }
    .tegel .l {
      font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3); text-align: center;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }

    /* ------------------------------------------------------------ smal */

    @container (max-width: 360px) {
      .foto { width: 84px; height: 46px; padding: 5px 6px; }
      .graden { font-size: 21px; }
    }
    @container (max-width: 340px) {
      .standen[data-n="4"] { --kol: 2; }
      .standen[data-n="7"], .standen[data-n="8"] { --kol: 3; }
      .lijsten { grid-template-columns: minmax(0, 1fr); }
      .tegels[data-n="4"] { --kol: 2; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig (zie CLAUDE.md): zonder airco een uitlegkaart.
    const c = { afbeelding: "auto", ...config };
    if (!c.entity || domeinVan(c.entity) !== "climate") c[INCOMPLETE] = t("Kies een airco (climate-entiteit).");
    return c;
  }

  /**
   * Een ander register is geen nieuwe toestand, maar wel een andere set
   * delen: een energiesensor die net is ingeschakeld hoort er meteen bij.
   */
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
    const c = this.config;
    const r = this.coach_()?.rollen ?? {};
    return [
      c.entity,
      c.temperature,
      c.energy,
      ...Object.values(this.delen_()),
      r.doeltemperatuur,
      r.aan_op,
      r.pauze,
      // De sensor van ELKE airco van de coach: welke bij deze airco hoort staat
      // in zijn toestand, en een coach die net opstart krijgt `klimaat` pas
      // als hij bereikbaar wordt.
      ...(this.coachMemo_?.aircos ?? []).map((a) => a.rollen.coach),
    ].filter(Boolean);
  }

  /**
   * De climate-state, of null. Stuurt de coach hem, dan met het doel van de
   * coach erin (`metCoachDoel`): alles wat het doel tekent of verzet, rekent
   * dan met wat de bewoner wil.
   */
  st_() {
    const st = stateOf(this.hass_, this.config?.entity);
    const doel = this.coach_()?.rollen.doeltemperatuur;
    return doel ? metCoachDoel(st, stateOf(this.hass_, doel)) : st;
  }

  /**
   * Het coach-apparaat dat deze airco stuurt, of null. De lijst van
   * airco's van de coach wordt vastgehouden zolang het register gelijk
   * blijft; welke ervan bij DEZE airco hoort staat in een toestand, en wordt
   * dus elke keer opnieuw bekeken.
   */
  coach_() {
    const hass = this.hass_;
    if (!hass || !this.config?.entity) return null;
    const m = this.coachMemo_;
    let aircos = m?.aircos;
    if (!m || m.entities !== hass.entities || m.devices !== hass.devices) {
      aircos = coachAircos(hass);
      this.coachMemo_ = { entities: hass.entities, devices: hass.devices, aircos };
    }
    return aircoCoach(hass, this.config.entity, aircos);
  }

  /** De rest van het apparaat, vastgehouden zolang het register gelijk blijft. */
  delen_() {
    const hass = this.hass_;
    const id = this.config?.entity ?? "";
    const m = this.delenMemo_;
    if (m && m.entities === hass?.entities && m.id === id) return m.uit;
    const uit = apparaatDelen(hass, id);
    this.delenMemo_ = { entities: hass?.entities, id, uit };
    return uit;
  }

  taal_() {
    return locale();
  }

  eenheid_() {
    return this.hass_?.config?.unit_system?.temperature ?? "°C";
  }

  roep_(oproep) {
    if (oproep) this.hass_?.callService(oproep[0], oproep[1], oproep[2]);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";
    this.pending_ = null;

    const stel = (welk) => `
      <div class="set" data-welk="${welk}" hidden>
        <button type="button" data-d="-1" aria-label="${escapeHtml(t("{naam} lager", { naam: t(STEL_NAAM[welk]) }))}">${icons.minus}</button>
        <span class="target"></span>
        <button type="button" data-d="1" aria-label="${escapeHtml(t("{naam} hoger", { naam: t(STEL_NAAM[welk]) }))}">${icons.plus}</button>
      </div>`;
    const lijst = (soort) => `
      <label class="blok lijst" data-soort="${soort}" hidden>
        <span class="kopje">${escapeHtml(t(KEUZES[soort].naam))}</span>
        <span class="slot" style="display:contents"></span>
      </label>`;

    return `
      <div class="card surface" style="--tone:${TONES.neutral}">
        <div class="kop" role="button" tabindex="0">
          <button type="button" class="aan" aria-label="${t("Aan of uit")}">
            <img class="foto" alt="" hidden />
            <span class="chip"></span>
          </button>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"><span class="stip" hidden></span><span class="woord"></span><span class="storing" hidden>${t("Storing")}</span></span>
            <span class="reden" hidden></span>
          </span>
          <span class="binnen" hidden><span class="graden"></span><span class="onder">${t("binnen")}</span></span>
        </div>

        <div class="standen" role="group" aria-label="${t("Stand")}" hidden></div>

        <div class="doelen" hidden>${stel("doel")}${stel("laag")}${stel("hoog")}</div>

        <div class="blok aanop" hidden>
          <span class="kopje">${t("Aan op")}</span>
          <div class="segs" role="group" aria-label="${t("Aan op")}"></div>
        </div>

        <div class="schakels" role="group" aria-label="Coach" hidden></div>

        <div class="blok vent" hidden>
          <span class="kopje">${escapeHtml(t(KEUZES.ventilator.naam))}</span>
          <div class="segs" hidden></div>
          <span class="slot" style="display:contents"></span>
        </div>

        <div class="lijsten" hidden>${lijst("lamellen")}${lijst("lamellen_opzij")}${lijst("preset")}</div>

        <div class="tegels" hidden></div>
      </div>`;
  }

  wire() {
    const c = this.config;
    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));
    // Een lopende verzending overleeft een verplaatsing niet, en dan hoort
    // het voorlopige getal ook weg: anders blijft het accentkleurig staan.
    this.teardown_.push(() => {
      clearTimeout(this.sendTimer_);
      clearTimeout(this.loslaatTimer_);
      this.pending_ = null;
    });

    // De kop opent de airco in Home Assistant ...
    const kop = this.$(".kop");
    this.on(kop, "click", () => moreInfo(this, c.entity));
    this.on(kop, "keydown", (e) => {
      if (e.target !== kop || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      moreInfo(this, c.entity);
    });

    // ... en de foto of de chip zet hem aan of uit.
    this.on(this.$(".aan"), "click", (e) => {
      e.stopPropagation();
      const st = this.st_();
      const oproep = aanUitOproep(st, !aircoStand(st).aan);
      if (!oproep) return;
      // Aan of uit verandert de hoogte (het doel en de ventilator komen of
      // gaan): dat is bedoeld, en geen pendel om te dempen.
      bewusteWijziging(kaart);
      this.roep_(oproep);
    });

    // De standen worden in paint() gebouwd; het gedrag hangt aan de rij.
    this.on(this.$(".standen"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      if (!knop || knop.disabled) return;
      const oproep = standKnopOproep(this.st_(), knop.dataset.waarde);
      if (!oproep) return;
      bewusteWijziging(kaart);
      this.roep_(oproep);
    });

    this.on(this.$(".doelen"), "click", (e) => {
      const knop = e.target?.closest?.("button[data-d]");
      if (!knop || knop.disabled) return;
      this.stel_(knop.closest(".set").dataset.welk, Number(knop.dataset.d));
    });

    // Aan op: de select van de coach, niet iets van de airco.
    this.on(this.$(".aanop .segs"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      if (!knop || knop.disabled) return;
      this.roep_(aanOpOproep(stateOf(this.hass_, this.coach_()?.rollen.aan_op), knop.dataset.waarde));
    });

    // Pauze: een schakelaar van de coach, niet van de airco.
    this.on(this.$(".schakels"), "click", (e) => {
      const knop = e.target?.closest?.(".schakel");
      if (!knop?.dataset.id) return;
      const aan = stateOf(this.hass_, knop.dataset.id)?.state === "on";
      this.roep_(["switch", aan ? "turn_off" : "turn_on", { entity_id: knop.dataset.id }]);
    });

    this.on(this.$(".vent .segs"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      if (!knop || knop.disabled) return;
      this.roep_(keuzeOproep(this.st_(), "ventilator", knop.dataset.waarde));
    });

    // Elke keuzelijst (ventilator, lamellen, opzij, programma) draagt zijn
    // soort; één luisteraar voor allemaal.
    this.on(kaart, "change", (e) => {
      const lijst = e.target?.closest?.(".keuze");
      if (!lijst) return;
      e.stopPropagation();
      this.roep_(keuzeOproep(this.st_(), lijst.dataset.soort, lijst.value));
    });

    // Een tegel opent zijn sensor: daar staat de geschiedenis.
    const tegels = this.$(".tegels");
    const open = (e) => {
      const tegel = e.target?.closest?.(".tegel");
      if (tegel?.dataset.id) moreInfo(this, tegel.dataset.id);
    };
    this.on(tegels, "click", open);
    this.on(tegels, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open(e);
    });
  }

  /**
   * Verzet het doel, en stuur het pas op als je klaar bent met tikken: zes
   * tikken zijn één aanroep, net als op de HVAC- en de klimaatkaart. Bij een
   * bereik gaan laag en hoog samen de deur uit.
   */
  stel_(welk, richting) {
    const st = this.st_();
    const inst = doelInstelling(st, this.eenheid_());
    if (!inst) return;
    const nu = { ...inst, ...(this.pending_ ?? {}) };
    const volgende = volgendeWaarde(nu, welk, nu[welk], richting);
    if (volgende == null || volgende === nu[welk]) return;
    this.pending_ = { ...(this.pending_ ?? {}), [welk]: volgende };
    this.paintDoel_(st);

    clearTimeout(this.sendTimer_);
    clearTimeout(this.loslaatTimer_);
    this.sendTimer_ = setTimeout(() => {
      this.sendTimer_ = null;
      const st2 = this.st_();
      const inst2 = doelInstelling(st2, this.eenheid_());
      if (inst2 && this.pending_) {
        const w = { ...inst2, ...this.pending_ };
        // Met een coach naar zijn number: hij zet het op de airco als die
        // aanstaat, en bewaart het anders voor straks.
        const doel = stateOf(this.hass_, this.coach_()?.rollen.doeltemperatuur);
        this.roep_(doelOproepVoor(st2, doel, inst2.soort === "bereik" ? { laag: w.laag, hoog: w.hoog } : { doel: w.doel }));
      }
      // Nog even vasthouden: de airco mag eerst zelf melden.
      this.loslaatTimer_ = setTimeout(() => {
        this.pending_ = null;
        if (this.hass_ && this.wired_) this.paint();
      }, 1500);
    }, 450);
  }

  paint() {
    const c = this.config;
    const hass = this.hass_;
    const st = this.st_();
    const delen = this.delen_();
    const s = aircoStand(st, { sensor: stateOf(hass, c.temperature), reserve: stateOf(hass, delen.kamer) });
    const taal = this.taal_();
    const kaart = this.$(".card");

    // ----- toestand en kleur
    kaart.style.setProperty("--tone", toonVan(s.soort));
    this.toggleAttribute("bezig", Boolean(s.actie) && s.actie !== "idle");
    this.toggleAttribute("uit", !s.aan);
    this.$(".kop").classList.toggle("dood", !s.beschikbaar);

    // ----- naam en status
    const naam = nameOf(hass, c.entity, c.name);
    this.text(".nm", naam);
    const status = statusTekst(s);
    this.text(".woord", status);
    const storing = stateOf(hass, delen.storing)?.state === "on";
    this.$(".storing").hidden = !storing;
    this.$(".kop").setAttribute("aria-label", `${naam}, ${status}${storing ? `, ${t("storing")}` : ""}`);

    // ----- de coach: zijn zin onder de status, en zijn knoppen onder het doel
    const coach = this.coach_();
    const cs = coach ? aircoCoachStand(stateOf(hass, coach.rollen.coach)) : null;
    const knoppen = coach ? coachKnoppen(hass, coach.rollen, cs) : [];
    const regel = coachRegel(cs);
    this.text(".reden", regel);
    this.$(".reden").hidden = !regel;
    this.paintAanOp_(coach ? aanOpKeuzes(stateOf(hass, coach.rollen.aan_op), cs) : null);
    this.paintSchakels_(knoppen);

    // ----- foto of chip, en de aan-knop
    const icoon = c.icon || SOORT_ICOON[s.soort] || "airco";
    const metFoto = this.paintFoto_();
    const chip = this.$(".chip");
    chip.hidden = metFoto;
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "airco");
    }
    // Met een foto draagt een icoontje in de statusregel de toestand; uit is
    // er geen toestand om te dragen.
    const stip = this.$(".stip");
    stip.hidden = !metFoto || !s.aan;
    if (!stip.hidden && stip.dataset.icon !== icoon) {
      stip.dataset.icon = icoon;
      stip.innerHTML = resolve(icoon, "airco");
    }
    const aan = this.$(".aan");
    aan.disabled = !aanUitOproep(st, !s.aan);
    aan.setAttribute("aria-pressed", String(s.aan));
    aan.setAttribute("aria-label", s.aan ? t("Uitzetten") : t("Aanzetten"));

    // ----- de kamertemperatuur
    this.$(".binnen").hidden = s.huidig == null;
    if (s.huidig != null) this.text(".graden", `${graden(s.huidig, taal)}°`);

    this.paintStanden_(st, !s.beschikbaar);
    this.paintDoel_(st, s, Boolean(coach));
    this.paintKeuzes_(st, s);
    this.paintTegels_(st, delen, taal);

    meetRaster(kaart);
  }

  /** De foto: een gekozen model, de foto bij merk en model, een eigen, of niets. */
  paintFoto_() {
    const c = this.config;
    const reg = this.hass_?.entities?.[c.entity];
    const apparaat = reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
    const bron = aircoAfbeelding(c.afbeelding, apparaat, c.image ?? "");
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

  /** Uit plus de standen van de entiteit. Eén knop is geen keuze. */
  paintStanden_(st, dood) {
    const vak = this.$(".standen");
    const knoppen = standKnoppen(st);
    vak.hidden = knoppen.length < 2;
    if (vak.hidden) return;
    vak.dataset.n = String(knoppen.length);
    // Alleen opnieuw bouwen als de knoppen zelf veranderen: een knop die net
    // met het toetsenbord is ingedrukt houdt zo zijn focus.
    const sig = JSON.stringify(knoppen.map((k) => [k.waarde, k.label]));
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.innerHTML = knoppen
        .map(
          (k) =>
            `<button type="button" class="seg" data-waarde="${escapeHtml(k.waarde)}" aria-pressed="false">${escapeHtml(k.label)}</button>`
        )
        .join("");
    }
    const gekozen = new Map(knoppen.map((k) => [k.waarde, k.gekozen]));
    for (const knop of vak.children) {
      knop.setAttribute("aria-pressed", String(gekozen.get(knop.dataset.waarde) === true));
      knop.disabled = dood;
    }
  }

  /**
   * Aan op: zon, goedkope uren of beide. Net als de ventilator drie knoppen
   * op een regel; de kaart bouwt ze alleen opnieuw als de opties veranderen.
   */
  paintAanOp_(keuze) {
    const blok = this.$(".aanop");
    blok.hidden = !keuze;
    if (!keuze) return;
    const segs = blok.querySelector(".segs");
    const sig = JSON.stringify(keuze.opties);
    if (segs.dataset.sig !== sig) {
      segs.dataset.sig = sig;
      segs.innerHTML = keuze.opties
        .map(
          (o) =>
            `<button type="button" class="seg" data-waarde="${escapeHtml(o.waarde)}" aria-pressed="false" aria-label="${escapeHtml(t("Aan op {wat}", { wat: o.naam.toLowerCase() }))}" title="${escapeHtml(o.naam)}">${escapeHtml(o.label)}</button>`
        )
        .join("");
    }
    for (const knop of segs.children) knop.setAttribute("aria-pressed", String(knop.dataset.waarde === keuze.gekozen));
  }

  /**
   * Pauze. Alleen opnieuw bouwen als de knoppen zelf veranderen, zodat een
   * knop met de focus die houdt.
   */
  paintSchakels_(knoppen) {
    const vak = this.$(".schakels");
    vak.hidden = knoppen.length === 0;
    const sig = JSON.stringify(knoppen.map((k) => [k.rol, k.id]));
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.innerHTML = knoppen
        .map(
          (k) =>
            `<button type="button" class="schakel" data-rol="${escapeHtml(k.rol)}" data-id="${escapeHtml(k.id)}" aria-pressed="false">${resolve(k.icoon)}<span class="lb">${escapeHtml(k.label)}</span></button>`
        )
        .join("");
    }
    const aan = new Map(knoppen.map((k) => [k.id, k.aan]));
    for (const knop of vak.children) knop.setAttribute("aria-pressed", String(aan.get(knop.dataset.id) === true));
  }

  /**
   * Het doel, of twee bij een bereik. Weg als de airco uit staat, behalve met
   * een coach: dan is het wat de bewoner wil, en dat stel je juist in als hij
   * uit staat.
   */
  paintDoel_(st, s = aircoStand(st), metCoach = Boolean(this.coach_())) {
    const vak = this.$(".doelen");
    const inst = s.aan || (metCoach && s.beschikbaar) ? doelInstelling(st, this.eenheid_()) : null;
    vak.hidden = !inst;
    if (!inst) return;
    vak.dataset.soort = inst.soort;
    const nu = { ...inst, ...(this.pending_ ?? {}) };
    const taal = this.taal_();
    for (const set of vak.querySelectorAll(".set")) {
      const welk = set.dataset.welk;
      const toon = inst.soort === "bereik" ? welk !== "doel" : welk === "doel";
      set.hidden = !toon;
      if (!toon) continue;
      const v = nu[welk];
      const el = set.querySelector(".target");
      el.classList.toggle("pending", this.pending_?.[welk] != null);
      const html = `${escapeHtml(graden(v, taal))}°<small>${escapeHtml(t(STEL_WOORD[welk]))}</small>`;
      if (el.dataset.html !== html) {
        el.dataset.html = html;
        el.innerHTML = html;
      }
      // Een knop die niets meer verandert (de grens, of de andere kant van het
      // bereik) staat grijs.
      set.querySelector('[data-d="-1"]').disabled = volgendeWaarde(nu, welk, v, -1) === v;
      set.querySelector('[data-d="1"]').disabled = volgendeWaarde(nu, welk, v, 1) === v;
      set.setAttribute("aria-label", t("{naam} {graden} graden", { naam: t(STEL_NAAM[welk]), graden: graden(v, taal) }));
    }
  }

  /** Ventilator, lamellen, opzij en programma. Alleen als de airco aan staat. */
  paintKeuzes_(st, s) {
    const dood = !s.beschikbaar;

    const vent = this.$(".vent");
    const opties = s.aan ? keuzesVan(st, "ventilator") : [];
    vent.hidden = opties.length < 2;
    const alsSegs = !vent.hidden && alsKnoppen(opties);
    const nu = keuzeNu(st, "ventilator");
    const segs = vent.querySelector(".segs");
    segs.hidden = !alsSegs;
    if (alsSegs) {
      const sig = JSON.stringify(opties);
      if (segs.dataset.sig !== sig) {
        segs.dataset.sig = sig;
        segs.innerHTML = opties
          .map(
            (o) =>
              `<button type="button" class="seg" data-waarde="${escapeHtml(o.waarde)}" aria-pressed="false" aria-label="${escapeHtml(`${t(KEUZES.ventilator.naam)} ${o.label}`)}">${escapeHtml(o.label)}</button>`
          )
          .join("");
      }
      for (const knop of segs.children) {
        knop.setAttribute("aria-pressed", String(knop.dataset.waarde === nu));
        knop.disabled = dood;
      }
    }
    this.vulLijst_(vent.querySelector(".slot"), alsSegs || vent.hidden ? [] : opties, nu, "ventilator", dood);

    const lijsten = this.$(".lijsten");
    const zichtbaar = [];
    for (const blok of lijsten.querySelectorAll(".lijst")) {
      const soort = blok.dataset.soort;
      const o = s.aan ? keuzesVan(st, soort) : [];
      blok.hidden = o.length < 2;
      blok.classList.remove("breed");
      this.vulLijst_(blok.querySelector(".slot"), blok.hidden ? [] : o, keuzeNu(st, soort), soort, dood);
      if (!blok.hidden) zichtbaar.push(blok);
    }
    lijsten.hidden = zichtbaar.length === 0;
    // Een oneven aantal: de laatste over de volle breedte, geen half leeg vak.
    if (zichtbaar.length % 2 === 1) zichtbaar[zichtbaar.length - 1].classList.add("breed");
  }

  /**
   * Eén keuzelijst in zijn slot. Een stand die de airco nu draagt maar niet in
   * zijn lijst heeft, staat er toch bovenaan bij: een lege keuzelijst zegt
   * niet wat er nu is.
   */
  vulLijst_(slot, opties, gekozen, soort, dood) {
    const lijst =
      gekozen && opties.length && !opties.some((o) => o.waarde === gekozen)
        ? [{ waarde: gekozen, label: KEUZES[soort].label(gekozen) }, ...opties]
        : opties;
    const vinger = JSON.stringify(lijst);
    if (slot.dataset.opties !== vinger) {
      slot.dataset.opties = vinger;
      slot.innerHTML = lijst.length
        ? `<select class="keuze" data-soort="${soort}" aria-label="${escapeHtml(t(KEUZES[soort].naam))}">${lijst
            .map((o) => `<option value="${escapeHtml(o.waarde)}">${escapeHtml(o.label)}</option>`)
            .join("")}</select>`
        : "";
    }
    const el = slot.querySelector(".keuze");
    if (!el) return;
    el.disabled = dood;
    if (this.shadowRoot.activeElement !== el && el.value !== gekozen) el.value = gekozen;
  }

  /** Energie, vermogen, vochtigheid en buiten: alleen wat er is. */
  paintTegels_(st, delen, taal) {
    const vak = this.$(".tegels");
    const lijst = aircoFeiten(this.hass_, st, { delen, energie: this.config.energy ?? "" }, taal);
    vak.hidden = lijst.length === 0;
    vak.dataset.n = String(lijst.length);
    const sig = JSON.stringify(lijst);
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = lijst
      .map(
        (f) => `
        <div class="tegel" role="button" tabindex="0" data-id="${escapeHtml(f.id)}" aria-label="${escapeHtml(`${f.label}: ${f.waarde} ${f.eenheid}`)}">
          <span class="w">${escapeHtml(f.waarde)}${f.eenheid ? `<small>${escapeHtml(f.eenheid)}</small>` : ""}</span>
          <span class="l">${escapeHtml(f.label)}</span>
        </div>`
      )
      .join("");
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 3) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-airco-card-editor");
  }

  static getStubConfig(hass, entities) {
    const airco = entities?.find((e) => String(e).startsWith("climate."));
    return airco ? { entity: airco } : {};
  }
}

/** De keuzes voor de foto. Valkuil 55: geen enkele met de waarde "". */
const AFBEELDING_KEUZES = [
  { value: "auto", label: nt("Automatisch") },
  ...Object.entries(AIRCO_FOTOS).map(([value, f]) => ({ value, label: f.label })),
  { value: "eigen", label: nt("Eigen afbeelding") },
  { value: "geen", label: nt("Geen afbeelding (icoon)") },
];

/**
 * De editor: de airco, en verder alleen wat je zou willen overschrijven.
 * Plat, zonder uitklapblokken (Vormregels).
 */
class AircoEditor extends DacEditor {
  defaults() {
    return { afbeelding: "auto" };
  }

  /** De fotokiezer alleen bij "Eigen afbeelding": anders is het een veld dat niets doet. */
  pickers() {
    return [
      { key: "icon", kind: "icon", label: t("Icoon (zonder foto)"), fallback: "airco" },
      ...(this.config_?.afbeelding === "eigen"
        ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: "airco" }]
        : []),
    ];
  }

  schema() {
    return [
      { name: "entity", required: true, selector: sel.entity(["climate"]) },
      { name: "name", selector: sel.text() },
      { name: "afbeelding", selector: sel.select(AFBEELDING_KEUZES.map((k) => ({ ...k, label: t(k.label) }))) },
      { name: "temperature", selector: { entity: { domain: ["sensor"], device_class: "temperature" } } },
      { name: "energy", selector: { entity: { domain: ["sensor"], device_class: "energy" } } },
    ];
  }

  label(s) {
    return (
      {
        entity: t("Airco"),
        name: t("Naam"),
        afbeelding: t("Afbeelding"),
        temperature: t("Kamertemperatuur"),
        energy: t("Energieverbruik"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      entity: t(
        "De climate-entiteit van de airco. Kamertemperatuur, vochtigheid, vermogen, energie en een storing van hetzelfde apparaat zoekt de kaart zelf. Stuurt DomotiApp Coach deze airco, dan vindt de kaart dat ook zelf: het doel gaat dan naar de coach, met Aan op en Pauze erbij."
      ),
      name: t("Leeg laten: de naam van de airco in Home Assistant."),
      afbeelding: t(
        "Automatisch toont een foto bij merk en model van de airco als die er is, en anders het icoon. Een tik op de foto of het icoon zet de airco aan of uit."
      ),
      temperature: t("Leeg laten: wat de airco zelf meet. Kies een sensor als die beter in de kamer hangt."),
      energy: t("Leeg laten: de energiesensor van hetzelfde apparaat, als die er is."),
    }[s.name];
  }
}

registerEditor("domotiapp-airco-card-editor", AircoEditor);
registerCard("domotiapp-airco-card", AircoCard, {
  name: nt("DomotiApp Airco"),
  description: nt(
    "Een airco van elk merk: aan en uit, de stand, de doeltemperatuur, ventilator en lamellen, met kamertemperatuur en verbruik van hetzelfde apparaat. Met DomotiApp Coach ook op zon en goedkope uren."
  ),
});

export { AircoCard };
