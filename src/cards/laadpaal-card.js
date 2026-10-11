/**
 * De laadpaal, zoals DomotiApp Coach hem stuurt.
 *
 * Gevraagd op 11 oktober 2026: *"mooi strak moderne kaart met een afbeelding
 * van de laadpaal en de noodzakelijke sensoren en aansturingsknoppen en
 * instellingen zoals schema etc."* -- voor in een bubble-pop-up, zodat klanten
 * niet telkens naar de coach hoeven. En erachteraan: *"in de laadpaal kaart
 * moet ook de batterij % komen van de auto"*, groot, met het doel erbij.
 *
 * VAN BOVEN NAAR BENEDEN
 *
 * 1. De kop: de foto van de paal, de naam, wat de coach doet (zijn eigen
 *    woorden, met het icoon van de stand) en waarom. Rechts de accustand van
 *    de auto, groot, met het doel ernaast.
 * 2. Een balk met de accustand en een streepje op het doel, en daaronder wat
 *    er verder te weten is: klaar om, nog zoveel kWh, het vermogen nu.
 * 3. De modus (Planning / Snel / Continu / Zon) en Pauze. Een modus anders dan
 *    planning, en pauze, gelden tot de kabel eruit gaat; dat staat erbij.
 * 4. Het schema: aan/uit, klaar om, en laden tot. Met een weekschema toont de
 *    kaart de week, en wordt er in de coach bewerkt (afgesproken op
 *    11 oktober 2026).
 * 5. Het laadplan als balk vanaf nu: zon in de kleur van zon, net in die van
 *    het net.
 * 6. De lopende of de vorige laadbeurt.
 *
 * WAAR HET VANDAAN KOMT
 *
 * Alles van de coach, via het apparaat dat in de editor gekozen is (of het
 * enige). Zie `coach-logica.js` voor het vinden en `laadpaal-logica.js` voor
 * het rekenwerk. De toestand van de coach-sensor wordt GETOOND maar nergens
 * gelezen om iets te beslissen (valkuil 67).
 *
 * De foto's zijn productfoto's van de fabrikant, gebruikt met toestemming van
 * de eigenaar als installateur (11 oktober 2026). Ze komen van de integratie
 * zelf (`/domotiapp_lovelace/afbeeldingen/laadpalen/`), niet uit de bundel.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  COACH_FABRIKANT,
  coachMelding,
  coachRollen,
  contractVan,
  kiesApparaat,
  klantEntiteiten,
} from "./coach-logica.js";
import {
  LAADPAAL_FOTOS,
  LAADPAAL_MODELLEN,
  getalTekst,
  laadpaalAfbeelding,
  laadpaalStand,
  modusKnoppen,
  modusRegel,
  planBalk,
  sessieTekst,
  socTekst,
  standVorm,
  stapWaarde,
  vermogenTekst,
  weekSchema,
} from "./laadpaal-logica.js";
import { veldWaarde, zetOproep } from "./tijdveld.js";

const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

class LaadpaalCard extends DacCard {
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

    .kop { display: flex; align-items: center; gap: 14px; cursor: pointer; min-width: 0; }

    /* De foto staat rechtop: een paal is hoger dan breed. Geen vaste
       verhouding, want een Easee en een Alfen verschillen. */
    .foto {
      flex: 0 0 auto; width: 64px; height: 88px;
      object-fit: contain; object-position: center;
    }
    .geenfoto {
      flex: 0 0 auto; width: 44px; height: 44px; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); background: var(--dac-surface-hi); color: var(--dac-ink-2);
    }
    .geenfoto .icon { width: 22px; height: 22px; }

    .midden { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* Alleen het icoon draagt de stand (Vormregels): de tekst blijft inkt. */
    .st { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12.5px; color: var(--dac-ink); }
    .st .stip { flex: 0 0 auto; width: 15px; height: 15px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 15px; height: 15px; }
    .st .woord { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .reden {
      font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-2);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* De accustand: groot, want daar vroeg hij om. Het getal draagt geen
       kleur (theme.js); de balk eronder wel. */
    .accu { flex: 0 0 auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .soc {
      font-size: 28px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .doel { margin-top: 4px; font-size: 12px; color: var(--dac-ink-2); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .km { font-size: 11.5px; color: var(--dac-ink-3); white-space: nowrap; font-variant-numeric: tabular-nums; }

    /* ------------------------------------------------------ de accubalk */

    .lijn {
      position: relative; height: 8px; border-radius: 999px;
      background: var(--dac-surface-hi); overflow: visible;
    }
    .lijn .vul {
      position: absolute; inset: 0 auto 0 0; width: 0%; border-radius: 999px;
      background: linear-gradient(90deg, color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
      transition: width 600ms ease;
    }
    /* Het doel: een streepje dat boven en onder de balk uitsteekt. */
    .lijn .mik {
      position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px;
      border-radius: 1px; background: var(--dac-ink-2);
    }
    .feiten {
      display: flex; flex-wrap: wrap; gap: 4px 12px;
      font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums;
    }
    .feiten b { font-weight: 500; color: var(--dac-ink); }

    /* ------------------------------------------------------- de bediening */

    .rij { display: flex; gap: 6px; min-width: 0; }

    /* De modus: wat er geldt zonder knop ("Planning · klaar om 06:00",
       "Goedkoopst") op een eigen regel boven de knoppen, en naast de knop als
       er maar één is (Snel, met een planning voor vandaag). */
    .modi { flex-wrap: wrap; align-items: center; }
    .modusregel {
      flex: 1 1 100%; min-width: 0;
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: var(--dac-ink-2); white-space: nowrap;
    }
    .modusregel .icon { width: 15px; height: 15px; flex: 0 0 auto; color: var(--dac-accent-hi); }
    .modusregel .wat { overflow: hidden; text-overflow: ellipsis; }
    .modusregel b { font-weight: 500; color: var(--dac-ink); }
    .knoppen { flex: 1 1 100%; display: flex; gap: 6px; min-width: 0; }
    .modi[data-aantal="1"] .modusregel:not([hidden]) { flex: 1 1 0; }
    .modi[data-aantal="1"] .modusregel:not([hidden]) + .knoppen { flex: 0 0 auto; }
    .modi[data-aantal="1"] .modusregel:not([hidden]) + .knoppen .seg { padding: 8px 14px; }
    .seg, .schakel {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 8px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .seg .icon, .schakel .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    .seg .lb, .schakel .lb { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (hover: hover) {
      .seg:hover, .schakel:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); }
    }
    .seg:active, .schakel:active { transform: scale(.97); }
    /* De gekozen modus en een schakelaar die aan staat dragen het accent:
       kiezen is identiteit, geen oordeel. */
    .seg[aria-pressed="true"], .schakel[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    /* Pauze is een waarschuwing en geen keuze: er wordt niet geladen. */
    .schakel.pauze[aria-pressed="true"] {
      color: var(--dac-warn);
      border-color: color-mix(in srgb, var(--dac-warn) 42%, transparent);
      background: color-mix(in srgb, var(--dac-warn) 12%, transparent);
    }
    .noot { margin: -4px 2px 0; font-size: 11px; color: var(--dac-ink-3); }

    /* Klaar om en laden tot: twee velden naast elkaar, met hun naam erboven. */
    .velden { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .veld .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 4px; }
    .tijd {
      width: 100%; min-width: 0; height: 38px;
      font: inherit; font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums;
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 0 12px; cursor: pointer; text-align: center;
    }
    @media (hover: hover) { .tijd:hover { border-color: var(--dac-border-hi); } }
    .tijd::-webkit-calendar-picker-indicator { display: none; }
    .tijd::-webkit-datetime-edit { padding: 0; }
    .tijd:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
    .set {
      height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 2px;
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2); border-radius: var(--dac-radius-pill);
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .set button:active { background: rgba(var(--dac-tint), .14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .waarde { flex: 1 1 auto; text-align: center; font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--dac-ink); }
    .set .waarde.pending { color: var(--dac-accent-hi); }

    /* Het weekschema: zeven vakjes, vandaag omlijnd. */
    .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .dag {
      display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0;
      border-radius: var(--dac-radius-sm); background: var(--dac-surface);
      font-size: 10.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }
    .dag b { font-size: 12px; font-weight: 500; color: var(--dac-ink); }
    .dag[data-aan="false"] b { color: var(--dac-ink-3); }
    .dag[data-vandaag="true"] { box-shadow: inset 0 0 0 1px var(--dac-border-hi); }

    /* ------------------------------------------------------ het laadplan */

    .plan { display: flex; flex-direction: column; gap: 5px; }
    .plan .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 2px; }
    .baan { position: relative; height: 12px; border-radius: 999px; background: var(--dac-surface-hi); overflow: hidden; }
    .blok { position: absolute; top: 0; bottom: 0; border-radius: 3px; }
    .blok[data-soort="zon"] { background: var(--dac-solar); }
    .blok[data-soort="net"] { background: var(--dac-grid-in); }
    .tikken { position: relative; height: 14px; font-size: 10.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
    .tikken span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
    .tikken span:first-child { transform: none; }
    .legenda { display: flex; gap: 12px; font-size: 10.5px; color: var(--dac-ink-3); }
    .legenda i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 5px; vertical-align: 0; }
    .legenda .z { background: var(--dac-solar); }
    .legenda .n { background: var(--dac-grid-in); }

    /* ----------------------------------------------------- de laadbeurt */

    /* Twee regels en niet naast elkaar: op een telefoon van 320 brak het
       rechterdeel in vier stukjes (gemeten op 11 oktober 2026). */
    .sessie {
      display: flex; flex-direction: column; gap: 3px;
      padding-top: 10px; border-top: 1px solid var(--dac-border);
      font-size: 12px; color: var(--dac-ink-2);
    }
    .sessie .kopje { color: var(--dac-ink-3); }
    .sessie .wat { color: var(--dac-ink); font-variant-numeric: tabular-nums; }

    .melding { margin: 0; font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); }

    /* Smal: kleinere foto. */
    @container (max-width: 360px) {
      .foto { width: 48px; height: 66px; }
      .soc { font-size: 24px; }
    }
    /* Drie modusknoppen op 280: "Continu" vroeg 43px en kreeg er 40 (gemeten
       op 11 oktober 2026). Zonder icoon heeft het woord ruimte genoeg. */
    @container (max-width: 310px) {
      .modi[data-aantal="3"] .seg .icon { display: none; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig (zie CLAUDE.md): zonder keuze zoekt de kaart
    // zelf de enige laadpaal van de coach, en anders zegt hij waarom niet.
    return { name: "", afbeelding: "auto", ...config };
  }

  /** Een ander register (de coach net geïnstalleerd) is geen nieuwe toestand. */
  set hass(hass) {
    const oud = this.hass_;
    super.hass = hass;
    if (!oud || !this.built_ || !this.wired_) return;
    if (oud.entities !== hass?.entities || oud.devices !== hass?.devices) this.paint();
  }

  get hass() {
    return super.hass;
  }

  watched() {
    const r = this.coach_()?.rollen ?? {};
    return [r.coach, r.modus, r.pauze, r.schema, r.klaar_om, r.laden_tot, this.vermogenId_()].filter(Boolean);
  }

  /** Het apparaat en zijn entiteiten per rol, vastgehouden zolang het register gelijk blijft. */
  coach_() {
    const hass = this.hass_;
    if (!hass || !this.config) return null;
    const gekozen = this.config.coach_device || "";
    const m = this.coachMemo_;
    if (m && m.entities === hass.entities && m.devices === hass.devices && m.gekozen === gekozen) return m.uit;
    const keuze = kiesApparaat(hass, gekozen, LAADPAAL_MODELLEN, "Laadpaal");
    const uit = { keuze, rollen: coachRollen(hass, keuze.id) };
    this.coachMemo_ = { entities: hass.entities, devices: hass.devices, gekozen, uit };
    return uit;
  }

  /** Het vermogen: het veld uit de editor, of wat de klant bij de coach koos. */
  vermogenId_() {
    if (this.config?.power) return this.config.power;
    const r = this.coach_()?.rollen;
    return r?.coach ? klantEntiteiten(stateOf(this.hass, r.coach)).power ?? "" : "";
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    const icons = { minus: resolve("minus"), plus: resolve("plus") };

    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="kop" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="geenfoto" hidden>${resolve("plug")}</span>
          <div class="midden">
            <span class="nm"></span>
            <span class="st"><span class="stip"></span><span class="woord"></span></span>
            <span class="reden"></span>
          </div>
          <div class="accu" hidden>
            <span class="soc"></span>
            <span class="doel"></span>
            <span class="km"></span>
          </div>
        </div>

        <p class="melding" hidden></p>

        <div class="lijn" hidden><span class="vul"></span><span class="mik" hidden></span></div>
        <div class="feiten" hidden></div>

        <div class="rij modi" hidden><span class="modusregel" hidden></span><span class="knoppen"></span></div>
        <div class="rij schakels" hidden>
          <button type="button" class="schakel pauze" hidden>${resolve("pause")}<span class="lb">Pauze</span></button>
          <button type="button" class="schakel schema" hidden>${resolve("calendar")}<span class="lb">Schema</span></button>
        </div>
        <p class="noot" hidden></p>

        <div class="velden" hidden>
          <label class="veld klaar" hidden>
            <span class="kopje">Klaar om</span>
            <input class="tijd" type="time" step="60" aria-label="Klaar om" />
          </label>
          <div class="veld tot" hidden>
            <span class="kopje">Laden tot</span>
            <div class="set">
              <button type="button" data-d="-1" aria-label="Minder">${icons.minus}</button>
              <span class="waarde"></span>
              <button type="button" data-d="1" aria-label="Meer">${icons.plus}</button>
            </div>
          </div>
        </div>
        <div class="week" hidden></div>

        <div class="plan" hidden>
          <span class="kopje">Laadplan</span>
          <div class="baan"></div>
          <div class="tikken"></div>
          <div class="legenda"><span><i class="z"></i>zon</span><span><i class="n"></i>net</span></div>
        </div>

        <div class="sessie" hidden><span class="kopje"></span><span class="wat"></span></div>
      </div>`;
  }

  wire() {
    this.on(this.$(".kop"), "click", () => {
      const id = this.coach_()?.rollen.coach;
      if (id) this.moreInfo_(id);
    });

    // De modusknoppen worden in `paint()` gebouwd; het gedrag hangt aan de rij.
    this.on(this.$(".modi"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      const id = this.coach_()?.rollen.modus;
      if (!knop || !id) return;
      this.hass.callService("select", "select_option", { entity_id: id, option: knop.dataset.modus });
    });

    for (const [klasse, rol] of [["pauze", "pauze"], ["schema", "schema"]]) {
      this.on(this.$(`.schakel.${klasse}`), "click", () => {
        const id = this.coach_()?.rollen[rol];
        if (!id) return;
        const aan = stateOf(this.hass, id)?.state === "on";
        this.hass.callService("switch", aan ? "turn_off" : "turn_on", { entity_id: id });
      });
    }

    // Klaar om: een invoerveld meldt zich per VAK. Wachten tot het stil is,
    // en meteen sturen bij het verlaten -- net als op de entiteitenkaart.
    const tijd = this.$(".tijd");
    let wachtend = null;
    let timer = null;
    const stuur = () => {
      clearTimeout(timer);
      timer = null;
      const oproep = wachtend;
      wachtend = null;
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    };
    this.on(tijd, "change", () => {
      const id = this.coach_()?.rollen.klaar_om;
      wachtend = id ? zetOproep(id, "time", tijd.value) : null;
      clearTimeout(timer);
      timer = setTimeout(stuur, 600);
    });
    this.on(tijd, "blur", stuur);
    this.on(tijd, "click", () => {
      try {
        tijd.showPicker?.();
      } catch {
        // Geen kiezer: typen werkt nog steeds.
      }
    });

    this.on(this.$(".set"), "click", (e) => {
      const knop = e.target?.closest?.("button[data-d]");
      if (knop) this.stap_(Number(knop.dataset.d));
    });

    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(() => {
      clearTimeout(timer);
      clearTimeout(this.stapTimer_);
      clearTimeout(this.tik_);
    });
  }

  /**
   * Laden tot: tikken loopt voor op de entiteit, en pas als je stopt gaat het
   * eruit. Zes tikken zijn één aanroep, net als op de klimaatkaart.
   */
  stap_(richting) {
    const id = this.coach_()?.rollen.laden_tot;
    const st = stateOf(this.hass, id);
    if (!st) return;
    const basis = this.pending_ != null ? { ...st, state: String(this.pending_) } : st;
    const volgende = stapWaarde(basis, richting);
    if (volgende == null) return;
    this.pending_ = volgende;
    this.paint();
    clearTimeout(this.stapTimer_);
    this.stapTimer_ = setTimeout(() => {
      this.hass.callService("number", "set_value", { entity_id: id, value: this.pending_ });
      this.stapTimer_ = setTimeout(() => {
        this.pending_ = null;
        this.paint();
      }, 1500);
    }, 450);
  }

  moreInfo_(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  paint() {
    const c = this.config;
    const info = this.coach_();
    const r = info?.rollen ?? {};
    const coachSt = stateOf(this.hass, r.coach);
    const s = laadpaalStand(coachSt);
    const melding = info ? coachMelding(info.keuze, contractVan(coachSt), "0.112.1") : "";

    // ----- kop
    const apparaat = this.hass?.devices?.[info?.keuze.id ?? ""];
    this.text(".nm", c.name || apparaat?.name_by_user || apparaat?.name || "Laadpaal");

    const vorm = standVorm(s?.stand);
    const tone = TONES[vorm.tone] ?? TONES.neutral;
    this.$(".card").style.setProperty("--tone", tone);
    const stip = this.$(".stip");
    if (stip.dataset.icoon !== vorm.icoon) {
      stip.dataset.icoon = vorm.icoon;
      stip.innerHTML = resolve(vorm.icoon);
    }
    this.text(".woord", s ? s.tekst || vorm.label : "Niet bereikbaar");
    this.text(".reden", s?.reden ?? "");
    this.$(".reden").hidden = !s?.reden;
    this.$(".kop").setAttribute("aria-label", `${this.$(".nm").textContent}, ${this.$(".woord").textContent}`);

    this.paintFoto_(s);

    const soc = socTekst(s);
    this.$(".accu").hidden = !soc;
    this.text(".soc", soc);
    this.text(".doel", s?.doel != null ? `→ ${Math.round(s.doel)}%` : "");
    this.text(".km", s?.actieradius != null ? `${getalTekst(Math.round(s.actieradius))} km` : "");

    const meld = this.$(".melding");
    meld.hidden = !melding;
    this.text(meld, melding);

    // ----- accubalk en feiten
    const lijn = this.$(".lijn");
    lijn.hidden = s?.soc == null;
    if (!lijn.hidden) {
      const vul = this.$(".vul");
      const breedte = `${Math.max(0, Math.min(100, s.soc))}%`;
      if (vul.style.width !== breedte) vul.style.width = breedte;
      const mik = this.$(".mik");
      mik.hidden = s.doel == null;
      if (s.doel != null) mik.style.left = `${Math.max(0, Math.min(100, s.doel))}%`;
      lijn.setAttribute("role", "progressbar");
      lijn.setAttribute("aria-valuenow", String(Math.round(s.soc)));
      lijn.setAttribute("aria-valuemin", "0");
      lijn.setAttribute("aria-valuemax", "100");
    }
    const feiten = [];
    // "Verwacht klaar" en niet "klaar om": dat laatste is de tijd die je
    // hieronder instelt, en twee keer "klaar om" met twee tijden is er één te veel.
    if (s?.klaarVerwacht) feiten.push(`verwacht klaar <b>${klok(s.klaarVerwacht)}</b>`);
    if (s?.kwhNodig != null && s.kwhNodig > 0) feiten.push(`nog <b>${getalTekst(s.kwhNodig)} kWh</b>`);
    const vermogen = vermogenTekst(stateOf(this.hass, this.vermogenId_()));
    if (vermogen) feiten.push(`<b>${vermogen}</b>${s?.amps ? ` · ${Math.round(s.amps)} A` : ""}`);
    this.$(".feiten").hidden = !feiten.length;
    const fHtml = feiten.join("<span aria-hidden=\"true\"></span>");
    if (this.$(".feiten").dataset.html !== fHtml) {
      this.$(".feiten").dataset.html = fHtml;
      this.$(".feiten").innerHTML = feiten.map((f) => `<span>${f}</span>`).join("");
    }

    this.paintBediening_(r, s);
    this.paintPlan_(s);
    this.paintSessie_(s);
    this.planTik_();
    meetRaster(this.$(".card"));
  }

  /** De foto: een gekozen model, de foto bij merk en model van de paal, een eigen, of niets. */
  paintFoto_(s) {
    const c = this.config;
    const bron = laadpaalAfbeelding(c.afbeelding, s, c.image ?? "");
    const img = this.$(".foto");
    const geen = this.$(".geenfoto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        img.onerror = () => {
          img.dataset.kapot = "1";
          img.hidden = true;
          geen.hidden = false;
          meetRaster(this.$(".card"));
        };
        img.src = bron;
      } else {
        img.removeAttribute("src");
      }
    }
    const toon = Boolean(bron) && img.dataset.kapot !== "1";
    img.hidden = !toon;
    geen.hidden = toon;
  }

  paintBediening_(r, s) {
    // ----- modus
    const modusSt = stateOf(this.hass, r.modus);
    const modi = modusKnoppen(modusSt, s);
    const rij = this.$(".modi");
    const knoppen = this.$(".modi .knoppen");
    const sig = JSON.stringify(modi.map((m) => m.sleutel));
    if (rij.dataset.sig !== sig) {
      rij.dataset.sig = sig;
      knoppen.innerHTML = modi
        .map(
          (m) =>
            `<button type="button" class="seg" data-modus="${escapeHtml(m.sleutel)}" aria-pressed="false">${resolve(m.icoon)}<span class="lb">${escapeHtml(m.label)}</span></button>`
        )
        .join("");
    }
    for (const knop of rij.querySelectorAll(".seg")) {
      const aan = modi.find((m) => m.sleutel === knop.dataset.modus)?.aan ?? false;
      knop.setAttribute("aria-pressed", String(aan));
    }
    // Wat er geldt zonder knop. Nog een keer de knop kiezen die aan staat zet
    // hem terug naar de voorkeur (coach 0.112.3); daar hoeft de kaart niets
    // voor te doen, want een tik stuurt altijd de optie van de knop.
    const regel = modusRegel(modusSt, s, stateOf(this.hass, r.klaar_om));
    const rEl = this.$(".modusregel");
    rEl.hidden = !regel;
    const rHtml = regel
      ? `${resolve(regel.icoon)}<span class="wat"><b>${escapeHtml(regel.woord)}</b>${regel.tijd ? ` · klaar om ${escapeHtml(regel.tijd)}` : ""}</span>`
      : "";
    if (rEl.dataset.html !== rHtml) {
      rEl.dataset.html = rHtml;
      rEl.innerHTML = rHtml;
    }
    rij.hidden = !modi.length && !regel;
    rij.dataset.aantal = String(modi.length);

    // ----- pauze en schema
    const schakel = (klasse, id) => {
      const el = this.$(`.schakel.${klasse}`);
      const st = stateOf(this.hass, id);
      el.hidden = !st || st.state === "unavailable";
      el.setAttribute("aria-pressed", String(st?.state === "on"));
      return !el.hidden;
    };
    const metPauze = schakel("pauze", r.pauze);
    const metSchema = schakel("schema", r.schema);
    this.$(".schakels").hidden = !metPauze && !metSchema;

    // Wat er per beurt geldt, in één zin onder de knoppen.
    const perBeurt = [];
    if (s?.pauze) perBeurt.push("pauze");
    else if (s?.modusBeurt && (s.modusActief ?? s.modus) && (s.modusActief ?? s.modus) !== "planning")
      perBeurt.push(`${s.modusActief ?? s.modus}`);
    if (s?.doelBeurt && s.doel != null) perBeurt.push(`laden tot ${Math.round(s.doel)}%`);
    const noot = perBeurt.length ? `${perBeurt.join(" en ").replace(/^./, (x) => x.toUpperCase())}: geldt tot de kabel eruit gaat.` : "";
    this.text(".noot", noot);
    this.$(".noot").hidden = !noot;

    // ----- klaar om, laden tot, of de week
    const klaarSt = stateOf(this.hass, r.klaar_om);
    const metKlaar = Boolean(klaarSt) && klaarSt.state !== "unavailable" && !s?.perDag;
    this.$(".veld.klaar").hidden = !metKlaar;
    const tijd = this.$(".tijd");
    if (metKlaar && this.shadowRoot.activeElement !== tijd) {
      const waarde = veldWaarde(klaarSt, "time");
      if (tijd.value !== waarde) tijd.value = waarde;
    }

    const totSt = stateOf(this.hass, r.laden_tot);
    const metTot = Boolean(totSt) && totSt.state !== "unavailable";
    this.$(".veld.tot").hidden = !metTot;
    if (metTot) {
      const v = this.pending_ ?? Number(totSt.state);
      const el = this.$(".set .waarde");
      el.classList.toggle("pending", this.pending_ != null);
      this.text(el, Number.isFinite(v) ? `${Math.round(v)}%` : "—");
      const a = totSt.attributes ?? {};
      const basis = { ...totSt, state: String(v) };
      this.$('.set [data-d="-1"]').disabled = stapWaarde(basis, -1) == null;
      this.$('.set [data-d="1"]').disabled = stapWaarde(basis, 1) == null;
      this.$(".set").setAttribute("aria-label", `Laden tot ${Math.round(v)}%, ${a.min ?? 0} tot ${a.max ?? 100}`);
    }
    const velden = this.$(".velden");
    velden.hidden = !metKlaar && !metTot;
    // Met een weekschema valt Klaar om weg, en dan hoort Laden tot niet op een
    // halve regel naast een leeg vak te staan.
    velden.style.gridTemplateColumns = metKlaar && metTot ? "" : "1fr";

    const week = s?.perDag ? weekSchema(s.schemaDagen) : [];
    const wEl = this.$(".week");
    wEl.hidden = !week.length;
    const wSig = JSON.stringify(week);
    if (wEl.dataset.sig !== wSig) {
      wEl.dataset.sig = wSig;
      wEl.innerHTML = week
        .map(
          (d) =>
            `<span class="dag" data-aan="${d.aan}" data-vandaag="${d.vandaag}">${d.dag}<b>${d.aan && d.klaarOm ? d.klaarOm : "—"}</b></span>`
        )
        .join("");
      wEl.setAttribute("aria-label", "Weekschema, te wijzigen in DomotiApp Coach");
    }
  }

  paintPlan_(s) {
    const balk = s ? planBalk(s.plan) : null;
    const plan = this.$(".plan");
    plan.hidden = !balk || !balk.blokken.length;
    if (plan.hidden) return;
    const sig = JSON.stringify([balk.blokken.map((b) => [b.links.toFixed(2), b.breedte.toFixed(2), b.soort]), balk.tikken]);
    if (plan.dataset.sig === sig) return;
    plan.dataset.sig = sig;
    this.$(".baan").innerHTML = balk.blokken
      .map((b) => {
        const titel = `${klok(b.start)}–${klok(b.eind)}${b.kw ? `, ${getalTekst(b.kw)} kW` : ""}${b.zonDeel ? `, ${Math.round(b.zonDeel * 100)}% zon` : ""}`;
        return `<span class="blok" data-soort="${b.soort}" style="left:${b.links}%;width:${b.breedte}%" title="${escapeHtml(titel)}"></span>`;
      })
      .join("");
    this.$(".tikken").innerHTML = balk.tikken
      .map((t) => `<span style="left:${t.pct}%">${escapeHtml(t.tekst)}</span>`)
      .join("");
    // Een legenda voor een kleur die niet in de balk staat is ruis.
    const soorten = new Set(balk.blokken.map((b) => b.soort));
    this.$(".legenda .z").parentElement.hidden = !soorten.has("zon");
    this.$(".legenda .n").parentElement.hidden = !soorten.has("net");
  }

  paintSessie_(s) {
    const t = sessieTekst(s?.sessie ?? null);
    const el = this.$(".sessie");
    el.hidden = !t || !t.tekst;
    if (el.hidden) return;
    this.text(".sessie .kopje", [t.kop, t.tijd, t.accu].filter(Boolean).join(" · "));
    this.text(".sessie .wat", t.tekst);
  }

  /** Het plan schuift met de klok mee, ook als de coach even niets meldt. */
  planTik_() {
    clearTimeout(this.tik_);
    this.tik_ = setTimeout(() => {
      this.tik_ = null;
      if (this.hass_ && this.isConnected) this.paint();
    }, 60_000);
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 4) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-laadpaal-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

/** De keuzes voor de foto, in de volgorde waarin hij ze noemde. */
const AFBEELDING_KEUZES = [
  { value: "auto", label: "Automatisch (merk en model van de paal)" },
  ...Object.entries(LAADPAAL_FOTOS).map(([value, f]) => ({ value, label: f.label })),
  { value: "eigen", label: "Eigen afbeelding" },
  { value: "geen", label: "Geen afbeelding" },
];

class LaadpaalEditor extends DacEditor {
  defaults() {
    return { afbeelding: "auto" };
  }

  /** De fotokiezer alleen bij "eigen afbeelding": anders is het een veld dat niets doet. */
  pickers() {
    return this.config_?.afbeelding === "eigen"
      ? [{ key: "image", kind: "foto", label: "Eigen afbeelding", fallback: "plug" }]
      : [];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      {
        name: "coach_device",
        selector: { device: { filter: LAADPAAL_MODELLEN.map((model) => ({ manufacturer: COACH_FABRIKANT, model })) } },
      },
      { name: "afbeelding", selector: sel.select(AFBEELDING_KEUZES) },
      { name: "power", selector: sel.entity(["sensor"]) },
    ];
  }

  label(s) {
    return (
      {
        name: "Naam",
        coach_device: "Laadpaal bij de coach",
        afbeelding: "Afbeelding",
        power: "Vermogen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      name: "Leeg laten: de naam die de laadpaal bij de coach heeft.",
      coach_device:
        "Leeg laten: de laadpaal van DomotiApp Coach, als er precies één is. Daarvoor is coach 0.112.1 of nieuwer nodig.",
      afbeelding: "Automatisch kiest de foto bij merk en model van de paal, zoals de coach ze meldt (Easee of Alfen).",
      power: "Leeg laten: de vermogenssensor die bij de coach is ingevuld.",
    }[s.name];
  }
}

registerEditor("domotiapp-laadpaal-card-editor", LaadpaalEditor);
registerCard("domotiapp-laadpaal-card", LaadpaalCard, {
  name: "DomotiApp Laadpaal",
  description:
    "De laadpaal zoals DomotiApp Coach hem stuurt: accustand van de auto, modus, pauze, schema en het laadplan.",
});

export { LaadpaalCard };
