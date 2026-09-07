/**
 * DomotiApp HVAC: airco, warmtepomp, ventilatie of boiler, op één kaart.
 *
 * Gevraagd op 7 september 2026: *"een kaart voor een airco, warmtepomp,
 * ventilatie etc. Dat is allemaal 1 kaart en je kan kiezen wat het is."* De
 * klimaatkaart is voor een thermostaat gebouwd -- één stelknop, één meting -- en
 * de installaties in een technische ruimte hebben méér te melden: aanvoer en
 * retour, COP, CO₂, een filter, een bypass, een boost. Dat is deze kaart.
 *
 * DE VORM, dezelfde als de vaatwasser en de gestapelde klimaatkaart:
 *
 *   [chip] Warmtepomp                                  21,4°
 *          Verwarmt · Tapwater
 *   [ 35,2 °C ] [ 29,8 °C ] [  4,1  ]      <- tegels met metingen
 *   [ Aanvoer ] [ Retour  ] [  COP  ]
 *   ( Uit ) ( Verwarmen ) ( Koelen ) ( Auto )   <- de standen van het apparaat
 *   [-]           20°            [+]        <- doeltemperatuur, volle breedte
 *   Boost                              (o )
 *
 * WAT DE SOORT BEPAALT staat in `hvac-logica.js`: welke velden de editor
 * aanbiedt, het icoon, en hoe de statusregel leest. Wat hier staat is alleen
 * hoe dat op het scherm komt.
 *
 * WAAROM DE STANDEN KNOPPEN ZIJN EN GEEN KEUZELIJST. Een airco heeft er vier of
 * vijf, een ventilatie-unit drie of vier, en dat zijn precies de dingen die je
 * met één tik wilt kiezen zonder eerst een lijst open te vouwen. Een
 * bedrijfsmodus uit een `select` (bij een warmtepomp) en de ventilatorsnelheid
 * van een airco zijn WEL keuzelijsten: dat zijn instellingen die je zelden
 * aanraakt, en een tweede rij knoppen zou de kaart tot een paneel maken.
 *
 * KLEUR: alleen het icoon en de status dragen de toestand. Verwarmen is oranje
 * (zon), koelen en ventileren zijn blauw (grid-in), een storing is rood en
 * standby is stil -- dezelfde afspraak als op de klimaatkaart. De tegels zijn
 * neutrale inkt; alleen CO₂ en het filter mogen oordelen.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { fmtNumber, isOn, moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { bindToggle, setToggle, toggleCss, toggleHtml } from "../toggle.js";
import { huidigeKeuze, keuzes, kiesOproep } from "./keuzeveld.js";
import {
  SOORTEN,
  SOORT_STANDAARD,
  boostIsSchakelaar,
  boostOproep,
  doelBereik,
  doelOproep,
  huidigeStand,
  huidigeTemperatuur,
  soortDef,
  standLabel,
  standOproep,
  standen,
  statusRegel,
  tegels,
  veldenMetRol,
  veldenVan,
  ventilatorOproep,
  ventilatorStanden,
  volgendDoel,
} from "./hvac-logica.js";

/** Van een kleurnaam uit de logica naar de token van het thema. */
const TOON = {
  solar: TONES.solar,
  water: TONES.water,
  bad: TONES.bad,
  warn: TONES.warn,
  neutral: "var(--dac-ink-3)",
};

class HvacCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------- de kop */

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip {
      width: 40px; height: 40px;
      transition: color 220ms ease, background 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon { width: 20px; height: 20px; }
    /* Alleen als er echt iets gebeurt gloeit het icoon; standby is stil. */
    :host([bezig]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st .let { color: var(--dac-warn); font-weight: 600; }
    :host([storing]) .st { color: var(--dac-bad); font-weight: 600; }

    /* De meting van nu, rechts in de kop. Het getal draagt geen kleur. */
    .graden {
      flex: 0 0 auto; font-size: 18px; font-weight: 500; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .graden small { font-size: 11px; color: var(--dac-ink-3); margin-left: 2px; font-weight: 400; }
    .graden:empty { display: none; }

    .top.dood { opacity: .42; }

    /* ----------------------------------------------------------- tegels */

    .tegels {
      display: grid; grid-template-columns: repeat(var(--kolommen, 3), minmax(0, 1fr)); gap: 7px;
    }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 6px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
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
    .tegel[data-let="warn"] .w { color: var(--dac-warn); }
    .tegel[data-let="bad"] .w { color: var(--dac-bad); }

    /* ---------------------------------------------------------- standen */

    .standen { display: flex; flex-wrap: wrap; gap: 6px; }
    .standen[hidden] { display: none; }
    .seg {
      flex: 1 1 auto; min-width: 0;
      padding: 8px 10px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .seg:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .seg:active { transform: scale(.97); }
    /* De gekozen stand draagt het accent, want kiezen is identiteit en geen
       oordeel. Wat het apparaat DOET staat in de kop, in zijn eigen kleur. */
    .seg[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    .seg:disabled { opacity: .4; cursor: default; }

    /* ---------------------------------------------------------- stelknop
       Over de volle breedte, met de knoppen aan de uiteinden: dezelfde vorm
       als de gestapelde klimaatkaart, en om dezelfde reden -- op een telefoon
       wil je met één duim bij allebei kunnen. */
    .set {
      display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 3px;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set[hidden] { display: none; }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); } }
    .set button:active { background: rgba(255,255,255,.14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .target {
      flex: 1 1 auto; text-align: center;
      font-size: 16px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .set .target small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 5px; font-weight: 400; }
    /* Terwijl je tikt loopt het getal voor op het apparaat. Dat mag je zien. */
    .set .target.pending { color: var(--dac-accent-hi); }

    /* -------------------------------------------------------- keuzelijsten */

    .rij { display: flex; align-items: center; gap: 10px; }
    .rij[hidden] { display: none; }
    .rij .lb { flex: 0 0 auto; font-size: 12.5px; color: var(--dac-ink-2); }

    /* Ondoorzichtige achtergrond, net als op de vaatwasser: de browser tekent
       het uitklappaneel met de kleur van de select zelf, en dat paneel valt
       buiten onze shadow root. */
    .keuze {
      flex: 1 1 auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-ink); }

    /* ------------------------------------------------------------- boost */

    ${toggleCss}
    .rij.boost .lb { flex: 1 1 auto; }
    .knop {
      flex: 0 0 auto;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 16px;
      border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
      cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-accent-hi);
      -webkit-tap-highlight-color: transparent;
    }
    .knop .icon { width: 15px; height: 15px; }
    .knop:active { transform: scale(.97); }
    @media (hover: hover) { .knop:hover { background: color-mix(in srgb, var(--dac-accent-hi) 24%, transparent); } }

    /* Smal: twee tegels naast elkaar in plaats van drie. */
    @container (max-width: 340px) {
      .tegels { --kolommen: 2 !important; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    const c = { soort: SOORT_STANDAARD, ...config };
    if (!SOORTEN[c.soort]) c.soort = SOORT_STANDAARD;
    const iets = veldenVan(c.soort).some((v) => c[v.key]);
    if (!iets) {
      c[INCOMPLETE] = `Kies de soort en minstens één entiteit: het apparaat zelf, of een sensor.`;
    }
    return c;
  }

  watched() {
    const c = this.config;
    return veldenVan(c.soort)
      .map((v) => c[v.key])
      .filter(Boolean);
  }

  /** De hoofdentiteit, of null. */
  hoofd_() {
    return stateOf(this.hass, this.config.entity) ?? null;
  }

  /** De state achter een veld met deze rol, of null. */
  metRol_(rol) {
    const veld = veldenMetRol(this.config.soort, rol)[0];
    return veld ? stateOf(this.hass, this.config[veld.key]) ?? null : null;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";

    const boostEl = c.boost
      ? boostIsSchakelaar(c.boost)
        ? toggleHtml({ label: "Boost" })
        : `<button type="button" class="knop">${resolve("bolt")}<span>Boost</span></button>`
      : "";

    return `
      <div class="card surface" style="--tone:var(--dac-ink-3)">
        <div class="top" role="button" tabindex="0">
          <span class="chip"></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <span class="graden"></span>
        </div>

        <div class="tegels" hidden></div>
        <div class="standen" hidden></div>

        <div class="set" hidden>
          <button type="button" data-d="-1" aria-label="Lager">${icons.minus}</button>
          <span class="target tnum"></span>
          <button type="button" data-d="1" aria-label="Hoger">${icons.plus}</button>
        </div>

        <div class="rij ventilator" hidden>
          <span class="lb">Ventilator</span>
          <span class="ventslot" style="display:contents"></span>
        </div>
        <div class="rij modus" hidden>
          <span class="lb">Modus</span>
          <span class="modusslot" style="display:contents"></span>
        </div>
        <div class="rij boost" ${c.boost ? "" : "hidden"}>
          <span class="lb">Boost</span>
          ${boostEl}
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;
    this.teardown_.push(() => clearTimeout(this.sendTimer_));
    this.teardown_.push(volgRaster(this.$(".card")));

    // Tikken op de kop opent de entiteit die het meest te zeggen heeft.
    this.on(this.$(".top"), "click", () => {
      const id = c.entity || this.watched()[0];
      if (id) moreInfo(this, id);
    });

    // De standen worden in paint() gebouwd; het gedrag hangt aan de rij.
    this.on(this.$(".standen"), "click", (e) => {
      const seg = e.target?.closest?.(".seg");
      if (!seg || seg.disabled) return;
      e.stopPropagation();
      const oproep = standOproep(this.hoofd_(), seg.dataset.waarde);
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    });

    this.$$(".set button").forEach((b) => this.on(b, "click", () => this.nudge_(Number(b.dataset.d))));

    this.on(this.$(".rij.ventilator"), "change", (e) => {
      const lijst = e.target?.closest?.(".keuze");
      if (!lijst) return;
      e.stopPropagation();
      const oproep = ventilatorOproep(this.hoofd_(), lijst.value);
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    });

    this.on(this.$(".rij.modus"), "change", (e) => {
      const lijst = e.target?.closest?.(".keuze");
      if (!lijst || !c.mode) return;
      e.stopPropagation();
      const oproep = kiesOproep(c.mode, lijst.value, keuzes(stateOf(this.hass, c.mode)));
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    });

    if (c.boost) {
      const schakelaar = this.$(".rij.boost .toggle");
      const knop = this.$(".rij.boost .knop");
      if (schakelaar) {
        this.teardown_.push(
          bindToggle(schakelaar, {
            value: () => isOn(stateOf(this.hass, c.boost)),
            set: (aan) => {
              const oproep = boostOproep(c.boost, aan);
              if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
            },
          })
        );
      }
      if (knop) {
        this.on(knop, "click", (e) => {
          e.stopPropagation();
          const oproep = boostOproep(c.boost, true);
          if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
        });
      }
    }
  }

  /**
   * Verzet het doel, en stuur het pas op als je klaar bent met tikken.
   * Dezelfde afspraak als op de klimaatkaart: zes tikken zijn één aanroep.
   */
  nudge_(richting) {
    const hoofd = this.hoofd_();
    const bereik = doelBereik(hoofd, this.config.step);
    if (!bereik) return;
    this.pending_ = volgendDoel(bereik, this.pending_ ?? bereik.doel, richting);
    this.paintDoel_();

    clearTimeout(this.sendTimer_);
    this.sendTimer_ = setTimeout(() => {
      this.sendTimer_ = null;
      const oproep = doelOproep(hoofd, this.pending_);
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
      // Nog even vasthouden: het apparaat mag eerst zelf melden.
      setTimeout(() => {
        this.pending_ = null;
        this.paint();
      }, 1500);
    }, 450);
  }

  paintDoel_() {
    const set = this.$(".set");
    const bereik = doelBereik(this.hoofd_(), this.config.step);
    set.hidden = !bereik;
    if (!bereik) return;
    const v = this.pending_ ?? bereik.doel;
    const el = set.querySelector(".target");
    el.classList.toggle("pending", this.pending_ != null);
    el.innerHTML = `${fmtNumber(this.hass, v, v % 1 ? 1 : 0)}°<small>doel</small>`;
    set.querySelector('[data-d="-1"]').disabled = v <= bereik.min;
    set.querySelector('[data-d="1"]').disabled = v >= bereik.max;
  }

  paint() {
    const c = this.config;
    const def = soortDef(c.soort);
    const hoofd = this.hoofd_();

    const nu = statusRegel({
      soort: c.soort,
      hoofd,
      status: this.metRol_("status"),
      fault: this.metRol_("storing"),
      filter: this.metRol_("filter"),
      heating: this.metRol_("verwarmt"),
    });

    const tone = TOON[nu.tone] ?? TOON.neutral;
    this.$(".card").style.setProperty("--tone", tone);
    this.toggleAttribute("bezig", nu.bezig);
    this.toggleAttribute("storing", nu.tone === "bad");
    this.$(".top").classList.toggle("dood", nu.tekst === "Niet bereikbaar");

    const chip = this.$(".chip");
    const wens = c.icon || def.icoon;
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, def.icoon);
    }

    this.text(".nm", c.name || (c.entity ? nameOf(this.hass, c.entity, null) : "") || def.naam);

    const stEl = this.$(".st");
    const html =
      escapeHtml(nu.tekst) +
      (nu.waarschuwing ? ` &middot; <span class="let">${escapeHtml(nu.waarschuwing)}</span>` : "");
    if (stEl.dataset.html !== html) {
      stEl.dataset.html = html;
      stEl.innerHTML = html;
    }
    this.$(".top").setAttribute("aria-label", `${this.$(".nm").textContent}, ${nu.tekst}`);

    // De meting van nu in de kop: de aangewezen sensor wint van het apparaat.
    const tempVeld = c.soort === "boiler" ? "water_temp" : "temperature";
    const sensor = stateOf(this.hass, c[tempVeld]) ?? null;
    const t = huidigeTemperatuur(hoofd, sensor);
    const eenheid = sensor?.attributes?.unit_of_measurement ?? this.hass?.config?.unit_system?.temperature ?? "°C";
    const gradenEl = this.$(".graden");
    const gradenHtml = t == null ? "" : `${fmtNumber(this.hass, t, 1)}<small>${escapeHtml(eenheid)}</small>`;
    if (gradenEl.dataset.html !== gradenHtml) {
      gradenEl.dataset.html = gradenHtml;
      gradenEl.innerHTML = gradenHtml;
    }

    this.paintTegels_(t == null ? null : tempVeld);
    this.paintStanden_(hoofd);
    this.paintDoel_();
    this.paintKeuzes_(hoofd);

    if (c.boost) {
      const schakelaar = this.$(".rij.boost .toggle");
      if (schakelaar) {
        schakelaar.style.setProperty("--tone", TONES.accent);
        setToggle(schakelaar, isOn(stateOf(this.hass, c.boost)));
      }
    }

    meetRaster(this.$(".card"));
  }

  /** De tegels; de meting die al in de kop staat komt er niet nog eens in. */
  paintTegels_(inKop) {
    const c = this.config;
    const vak = this.$(".tegels");
    const lijst = tegels(c.soort, c, (id) => stateOf(this.hass, id) ?? null, this.hass?.locale?.language ?? "nl").filter(
      (t) => t.key !== inKop
    );
    vak.hidden = lijst.length === 0;
    const sig = JSON.stringify(lijst);
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = lijst
      .map(
        (t) => `
        <div class="tegel" data-let="${t.let}" title="${escapeHtml(t.label)}">
          <span class="w">${escapeHtml(t.waarde)}${t.eenheid ? `<small>${escapeHtml(t.eenheid)}</small>` : ""}</span>
          <span class="l">${escapeHtml(t.label)}</span>
        </div>`
      )
      .join("");
  }

  /** De standen van het apparaat als knoppen; één stand is geen keuze. */
  paintStanden_(hoofd) {
    const vak = this.$(".standen");
    const opties = standen(hoofd);
    vak.hidden = opties.length < 2;
    if (vak.hidden) return;
    const nu = huidigeStand(hoofd, opties);
    const dood = !hoofd || hoofd.state === "unavailable";
    const sig = JSON.stringify([opties, nu, dood]);
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = opties
      .map(
        (o) =>
          `<button type="button" class="seg" data-waarde="${escapeHtml(o.waarde)}" aria-pressed="${o.waarde === nu}"${dood ? " disabled" : ""}>${escapeHtml(o.label)}</button>`
      )
      .join("");
  }

  /** De ventilatorsnelheid (airco) en de bedrijfsmodus (select) als lijsten. */
  paintKeuzes_(hoofd) {
    const c = this.config;

    const vent = ventilatorStanden(hoofd);
    const ventSlot = this.$(".ventslot");
    this.vulLijst_(ventSlot, vent, hoofd?.attributes?.fan_mode ?? "", "Ventilator");
    this.$(".rij.ventilator").hidden = vent.length === 0;

    const modusSt = stateOf(this.hass, c.mode);
    const modusOpties = c.mode ? keuzes(modusSt).map((o) => ({ waarde: o, label: standLabel(o) })) : [];
    const modusSlot = this.$(".modusslot");
    this.vulLijst_(modusSlot, modusOpties, huidigeKeuze(modusSt), "Modus");
    this.$(".rij.modus").hidden = modusOpties.length === 0;
  }

  vulLijst_(slot, opties, gekozen, label) {
    const vinger = JSON.stringify(opties);
    if (slot.dataset.opties !== vinger) {
      slot.dataset.opties = vinger;
      slot.innerHTML = opties.length
        ? `<select class="keuze" aria-label="${escapeHtml(label)}">${opties
            .map((o) => `<option value="${escapeHtml(o.waarde)}">${escapeHtml(o.label)}</option>`)
            .join("")}</select>`
        : "";
    }
    const lijst = slot.querySelector(".keuze");
    if (lijst && this.shadowRoot.activeElement !== lijst && lijst.value !== gekozen) lijst.value = gekozen;
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-hvac-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cl = entities?.find((e) => e.startsWith("climate."));
    const fan = entities?.find((e) => e.startsWith("fan."));
    const wh = entities?.find((e) => e.startsWith("water_heater."));
    if (wh) return { soort: "boiler", entity: wh };
    if (cl) return { soort: "airco", entity: cl };
    if (fan) return { soort: "ventilatie", entity: fan };
    return { soort: SOORT_STANDAARD };
  }
}

/**
 * De editor: de soort eerst, en dan alleen de velden die bij die soort horen.
 *
 * Het schema hangt van de config af; `DacEditor.sync_` zet het bij elke
 * wijziging opnieuw, dus na het kiezen van "Ventilatie" verschijnen CO₂ en het
 * filter en verdwijnen COP en de aanvoer. Velden van een vorige soort die nog
 * in de YAML staan doen geen kwaad: de kaart leest alleen de velden van de
 * gekozen soort.
 *
 * Plat, zonder uitklapblokken: dat is de vorm die de eigenaar voor editors
 * wil (zie CLAUDE.md, Vormregels).
 */
class HvacEditor extends DacEditor {
  defaults() {
    return { soort: SOORT_STANDAARD };
  }

  soort_() {
    return SOORTEN[this.config_?.soort] ? this.config_.soort : SOORT_STANDAARD;
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: soortDef(this.soort_()).icoon, auto: false }];
  }

  /** Het icoon volgt de soort zolang er geen eigen icoon gekozen is. */
  sync_() {
    super.sync_();
    for (const el of this.pickers_ ?? []) {
      if (el.dataset.key === "icon") el.fallback = soortDef(this.soort_()).icoon;
    }
  }

  schema() {
    const soort = this.soort_();
    const velden = veldenVan(soort).map((v) => ({
      name: v.key,
      selector: { entity: { domain: v.domeinen, ...(v.device_class ? { device_class: v.device_class } : {}) } },
    }));
    const hoofd = veldenMetRol(soort, "hoofd")[0];
    const metDoel = hoofd?.domeinen.some((d) => d === "climate" || d === "water_heater");
    return [
      {
        name: "soort",
        selector: sel.select(Object.entries(SOORTEN).map(([value, d]) => ({ value, label: d.label }))),
      },
      { name: "name", selector: sel.text() },
      ...velden,
      ...(metDoel ? [{ name: "step", selector: sel.number(0.1, 5, 0.1) }] : []),
    ];
  }

  label(s) {
    const veld = veldenVan(this.soort_()).find((v) => v.key === s.name);
    if (veld) return veld.label;
    return (
      {
        soort: "Soort apparaat",
        name: "Naam",
        step: "Stap van de temperatuurknoppen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const veld = veldenVan(this.soort_()).find((v) => v.key === s.name);
    if (veld?.hulp) return veld.hulp;
    if (s.name === "soort") return "Bepaalt welke velden hieronder staan, het icoon, en hoe de statusregel leest.";
    if (s.name === "name") return `Leeg laten geeft de naam van het apparaat, of anders "${soortDef(this.soort_()).naam}".`;
    if (s.name === "step") return "Leeg laten volgt het apparaat: een halve graad bij een climate, een hele bij een boiler.";
    return undefined;
  }
}

registerEditor("domotiapp-hvac-card-editor", HvacEditor);
registerCard("domotiapp-hvac-card", HvacCard, {
  name: "DomotiApp HVAC",
  description:
    "Airco, warmtepomp, ventilatie of boiler: status, metingen als tegels, de standen van het apparaat, doeltemperatuur en boost.",
});

export { HvacCard };
