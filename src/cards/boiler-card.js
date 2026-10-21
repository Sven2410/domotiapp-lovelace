/**
 * DomotiApp Warmtepompboiler: de boiler voor het tapwater, als productkaart.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie. Alleen voor een
 * warmtepompBOILER; een warmtepomp voor de verwarming wordt een eigen kaart.
 * In de editor kies je één `water_heater`; de temperatuursensor en aan/uit van
 * hetzelfde apparaat zoekt de kaart zelf (zie boiler-logica.js).
 *
 * VAN BOVEN NAAR BENEDEN
 *
 *   [foto] Boiler                                  58°
 *          Turbo                                   water
 *   [-]                 58° doel                  [+]
 *   ( Warmtepomp ) ( Auto ) ( Turbo ) ( Vakantie )
 *   Snel: de warmtepomp en het element samen.
 *   Afgelopen 24 uur                     46° tot 58°
 *   [ de watertemperatuur, als lijn             ]
 *        00:00        06:00        12:00        18:00
 *
 * De boiler heeft geen aan/uit-knop (LG meldt alleen of hij aan staat), dus de
 * foto is hier geen schakelaar: de hele kop opent de boiler in Home Assistant.
 *
 * KLEUR: alleen de chip draagt de stand (Turbo warm, de rest het accent,
 * vakantie en uit neutraal). De gekozen stand draagt het accent. Het getal van
 * het water is neutrale inkt, de lijn in de grafiek het accent.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons, resolve } from "../icons.js";
import { moreInfo, stateOf } from "../ha.js";
import { nt, t } from "../taal.js";
import { bewusteWijziging, meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  BOILERS,
  SOORT_TOON,
  boilerAfbeelding,
  boilerDelen,
  boilerStand,
  breedteVan,
  doelInstelling,
  doelOproep,
  grafiekPaden,
  graden,
  hoogteVan,
  klokTijd,
  merkKeuzes,
  naamVan,
  schaal,
  standKnoppen,
  standOproep,
  tijdLabels,
  typeKeuzes,
  uitersten,
  volgendDoel,
  waardeOp,
  waterReeks,
} from "./boiler-logica.js";
import { metType } from "./productfoto.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

/** Hoe vaak de grafiek de recorder opnieuw vraagt. Tussendoor komen de live metingen erbij. */
const VERNIEUW_MS = 15 * 60 * 1000;

class BoilerCard extends DacCard {
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
    .beeld { flex: 0 0 auto; display: grid; place-items: center; }

    .chip {
      width: 44px; height: 44px;
      transition: color 220ms ease, background 220ms ease, border-color 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }

    /* Een boiler staat rechtop. De foto staat op een eigen vlak in de tint van
       het thema, net als de airco en de stofzuiger: een witte boiler op een
       lichte kaart heeft anders geen rand. */
    .foto {
      display: block; width: 58px; height: 72px;
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

    /* Het water: groot, en in neutrale inkt. */
    .water { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
    .graden {
      font-size: 24px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .water .onder { margin-top: 4px; font-size: 11px; color: var(--dac-ink-3); }

    /* ---------------------------------------------------------- het doel */

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
    /* Terwijl je tikt loopt het getal voor op de boiler. Dat mag je zien. */
    .set .target.pending { color: var(--dac-accent-hi); }

    /* --------------------------------------------------------- de standen */

    .blok { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .kopregel { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 4px; }
    /* Breedte naar het woord: "Warmtepomp" is drie keer "Auto", en met vier
       gelijke knoppen viel het op 360 px af (gemeten op 15 oktober 2026). */
    .segs { display: flex; gap: 4px; min-width: 0; }
    .seg {
      flex: 1 1 auto; min-width: 0;
      padding: 7px 8px; cursor: pointer;
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
    .uitleg { font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-3); padding-left: 4px; }

    /* --------------------------------------------------------- de grafiek
       Eén lijn van 2px in het accent, met een vlak van 10% eronder. Het
       raster is een haarlijn in de randkleur. Getallen en tijden in inkt. */

    .bereik { font-size: 11px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
    /* De lijn tekent in .plot; rechts daarvan een strook voor de getallen,
       zodat een getal nooit over de lijn of de eindstip valt. Boven en onder
       een paar pixels lucht, voor de stip en het bovenste getal. */
    .vlak {
      position: relative; height: 112px; touch-action: pan-y; cursor: crosshair;
      -webkit-tap-highlight-color: transparent;
    }
    .plot { position: absolute; left: 0; right: 30px; top: 6px; bottom: 6px; }
    .plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .vlak .raster line { stroke: var(--dac-border); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .vlak .lijn {
      fill: none; stroke: var(--dac-accent-hi); stroke-width: 2;
      stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke;
    }
    .vlak .opp { fill: var(--dac-accent-hi); opacity: .1; }
    .ylabels span {
      position: absolute; right: 0; width: 26px; transform: translateY(-50%);
      font-size: 10px; line-height: 1; color: var(--dac-ink-3); text-align: right;
      font-variant-numeric: tabular-nums; pointer-events: none;
    }
    .eind, .kruis .punt {
      position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px;
      border-radius: 50%; background: var(--dac-accent-hi); pointer-events: none;
    }
    .kruis { position: absolute; inset: 0; pointer-events: none; }
    .kruis .draad { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--dac-border-hi); }
    .kruis .tip {
      position: absolute; top: -2px; transform: translate(-50%, -100%);
      padding: 3px 8px; white-space: nowrap;
      font-size: 11px; font-weight: 500; color: var(--dac-ink); font-variant-numeric: tabular-nums;
      background: var(--dac-bg-raise); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
    }
    .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12px; color: var(--dac-ink-3);
    }
    .xlabels { position: relative; height: 12px; margin-right: 30px; }
    .xlabels span {
      position: absolute; top: 0; transform: translateX(-50%);
      font-size: 10px; line-height: 12px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }

    /* ------------------------------------------------------------ smal */

    @container (max-width: 360px) {
      .foto { width: 50px; height: 62px; padding: 5px; }
      .graden { font-size: 21px; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig (zie CLAUDE.md): zonder boiler een uitlegkaart.
    const c = { merk: "auto", grafiek: true, ...config };
    if (!c.entity || domeinVan(c.entity) !== "water_heater") c[INCOMPLETE] = t("Kies een boiler (water_heater-entiteit).");
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
    return [this.config.entity, ...Object.values(this.delen_())].filter(Boolean);
  }

  /** De rest van het apparaat, met de gekozen temperatuursensor voorop. */
  delen_() {
    const hass = this.hass_;
    const id = this.config?.entity ?? "";
    const m = this.delenMemo_;
    if (!m || m.entities !== hass?.entities || m.id !== id) {
      this.delenMemo_ = { entities: hass?.entities, id, uit: boilerDelen(hass, id) };
    }
    const uit = this.delenMemo_.uit;
    return this.config?.temperatuur ? { ...uit, water: this.config.temperatuur } : uit;
  }

  vertaal_ = (st, waarde) => this.hass_?.formatEntityState?.(st, waarde);

  roep_(oproep) {
    if (oproep) this.hass_?.callService(oproep[0], oproep[1], oproep[2]);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";
    this.pending_ = null;
    this.reeks_ = { sensor: "", rijen: [], geladen: 0, bezig: false };

    return `
      <div class="card surface" style="--tone:${TONES.neutral}">
        <div class="kop" role="button" tabindex="0">
          <span class="beeld"><img class="foto" alt="" hidden /><span class="chip"></span></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"><span class="stip" hidden></span><span class="woord"></span></span>
          </span>
          <span class="water" hidden><span class="graden"></span><span class="onder">${t("water")}</span></span>
        </div>

        <div class="set" hidden>
          <button type="button" data-d="-1" aria-label="${t("Temperatuur lager")}">${icons.minus}</button>
          <span class="target"></span>
          <button type="button" data-d="1" aria-label="${t("Temperatuur hoger")}">${icons.plus}</button>
        </div>

        <div class="blok standen" hidden>
          <div class="segs" role="group" aria-label="${t("Stand")}"></div>
          <div class="uitleg" hidden></div>
        </div>

        <div class="blok grafiek" hidden>
          <div class="kopregel"><span class="kopje">${t("Afgelopen 24 uur")}</span><span class="bereik"></span></div>
          <div class="vlak" role="img">
            <div class="plot">
              <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
                <g class="raster"></g>
                <path class="opp" d="" />
                <path class="lijn" d="" />
              </svg>
              <i class="eind" hidden></i>
              <div class="kruis" hidden><i class="draad"></i><i class="punt"></i><span class="tip"></span></div>
              <span class="leeg" hidden>${t("Nog geen metingen")}</span>
            </div>
            <div class="ylabels" aria-hidden="true"></div>
          </div>
          <div class="xlabels" aria-hidden="true"></div>
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;
    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));
    this.teardown_.push(() => {
      clearTimeout(this.sendTimer_);
      clearTimeout(this.loslaatTimer_);
      clearInterval(this.vernieuwTimer_);
      this.pending_ = null;
      // Een antwoord van de recorder dat na het loskoppelen binnenkomt, hoort
      // niets meer te tekenen.
      this.reeksGen_ = (this.reeksGen_ ?? 0) + 1;
    });

    // De kop opent de boiler in Home Assistant.
    const kop = this.$(".kop");
    this.on(kop, "click", () => moreInfo(this, c.entity));
    this.on(kop, "keydown", (e) => {
      if (e.target !== kop || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      moreInfo(this, c.entity);
    });

    this.on(this.$(".set"), "click", (e) => {
      const knop = e.target?.closest?.("button[data-d]");
      if (!knop || knop.disabled) return;
      this.stel_(Number(knop.dataset.d));
    });

    this.on(this.$(".standen .segs"), "click", (e) => {
      const knop = e.target?.closest?.(".seg");
      if (!knop || knop.disabled || knop.getAttribute("aria-pressed") === "true") return;
      // Een andere uitleg kan een regel langer of korter zijn.
      bewusteWijziging(kaart);
      this.roep_(standOproep(stateOf(this.hass_, c.entity), knop.dataset.waarde));
    });

    // De kruisdraad: wijs of tik in de grafiek, en hij springt naar de meting
    // op dat moment. Met de vinger kun je erlangs schuiven; omhoog en omlaag
    // blijft gewoon scrollen (touch-action: pan-y).
    const vlak = this.$(".vlak");
    const wijs = (e) => this.kruis_(e.clientX);
    this.on(vlak, "pointermove", wijs);
    this.on(vlak, "pointerdown", wijs);
    this.on(vlak, "pointerleave", () => {
      this.$(".kruis").hidden = true;
    });

    this.vernieuwTimer_ = setInterval(() => this.laadReeks_(true), VERNIEUW_MS);
  }

  /**
   * Verzet het doel, en stuur het pas op als je klaar bent met tikken: zes
   * tikken zijn één aanroep, net als op de airco.
   */
  stel_(richting) {
    const st = stateOf(this.hass_, this.config.entity);
    const inst = doelInstelling(st);
    if (!inst) return;
    const nu = this.pending_ ?? inst.doel;
    const volgende = volgendDoel(inst, nu, richting);
    if (volgende === nu) return;
    this.pending_ = volgende;
    this.paintDoel_(st);

    clearTimeout(this.sendTimer_);
    clearTimeout(this.loslaatTimer_);
    this.sendTimer_ = setTimeout(() => {
      this.sendTimer_ = null;
      const st2 = stateOf(this.hass_, this.config.entity);
      if (st2 && this.pending_ != null) this.roep_(doelOproep(st2, this.pending_));
      // Nog even vasthouden: de boiler mag eerst zelf melden.
      this.loslaatTimer_ = setTimeout(() => {
        this.pending_ = null;
        if (this.hass_ && this.wired_) this.paint();
      }, 1500);
    }, 450);
  }

  paint() {
    const c = this.config;
    const hass = this.hass_;
    const st = stateOf(hass, c.entity);
    const delen = this.delen_();
    const s = boilerStand(hass, c.entity, delen);
    const kaart = this.$(".card");

    kaart.style.setProperty("--tone", TONES[SOORT_TOON[s.soort]] ?? TONES.neutral);
    this.$(".kop").classList.toggle("dood", !s.beschikbaar);

    const naam = naamVan(hass, c.entity, c.name);
    this.text(".nm", naam);
    this.text(".woord", s.tekst);
    this.$(".water").hidden = s.water == null;
    if (s.water != null) this.text(".graden", `${graden(s.water)}°`);
    this.$(".kop").setAttribute(
      "aria-label",
      `${naam}, ${s.tekst}${s.water != null ? `, ${t("water {graden} graden", { graden: graden(s.water) })}` : ""}`,
    );

    // Foto of chip. Met een foto draagt een icoontje in de statusregel de stand.
    const icoon = c.icon || "boiler";
    const metFoto = this.paintFoto_();
    const chip = this.$(".chip");
    chip.hidden = metFoto;
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "boiler");
    }
    const stip = this.$(".stip");
    stip.hidden = !metFoto || s.soort === "uit" || s.soort === "dood";
    if (!stip.hidden && stip.dataset.icon !== icoon) {
      stip.dataset.icon = icoon;
      stip.innerHTML = resolve(icoon, "boiler");
    }

    this.paintDoel_(st);
    this.paintStanden_(st, !s.beschikbaar);
    this.paintGrafiek_(delen, st);

    meetRaster(kaart);
  }

  /** De foto: het gekozen type, de foto bij de modelcode, een eigen, of niets. */
  paintFoto_() {
    const reg = this.hass_?.entities?.[this.config.entity];
    const apparaat = reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
    const bron = boilerAfbeelding(this.config, apparaat);
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        // Een foto die niet laadt: dan de chip.
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

  paintDoel_(st) {
    const vak = this.$(".set");
    const inst = doelInstelling(st);
    vak.hidden = !inst;
    if (!inst) return;
    const v = this.pending_ ?? inst.doel;
    const el = vak.querySelector(".target");
    el.classList.toggle("pending", this.pending_ != null);
    const html = `${escapeHtml(graden(v))}°<small>${escapeHtml(t("doel"))}</small>`;
    if (el.dataset.html !== html) {
      el.dataset.html = html;
      el.innerHTML = html;
    }
    vak.querySelector('[data-d="-1"]').disabled = volgendDoel(inst, v, -1) === v;
    vak.querySelector('[data-d="1"]').disabled = volgendDoel(inst, v, 1) === v;
    vak.setAttribute("aria-label", t("{naam} {graden} graden", { naam: t("Doeltemperatuur"), graden: graden(v) }));
  }

  /** De standen, en onder de knoppen wat de gekozen stand doet. */
  paintStanden_(st, dood) {
    const blok = this.$(".standen");
    const knoppen = standKnoppen(st, this.vertaal_);
    blok.hidden = knoppen.length === 0;
    if (blok.hidden) return;
    const segs = blok.querySelector(".segs");
    const sig = JSON.stringify(knoppen.map((k) => [k.waarde, k.label]));
    if (segs.dataset.sig !== sig) {
      segs.dataset.sig = sig;
      segs.innerHTML = knoppen
        .map(
          (k) =>
            `<button type="button" class="seg" data-waarde="${escapeHtml(k.waarde)}" aria-pressed="false">${escapeHtml(k.label)}</button>`,
        )
        .join("");
    }
    const gekozen = knoppen.find((k) => k.gekozen);
    for (const knop of segs.children) {
      knop.setAttribute("aria-pressed", String(knop.dataset.waarde === gekozen?.waarde));
      knop.disabled = dood;
    }
    const uitleg = blok.querySelector(".uitleg");
    uitleg.hidden = !gekozen?.uitleg;
    this.text(uitleg, gekozen?.uitleg ?? "");
  }

  /* --------------------------------------------------------- de grafiek */

  /**
   * De afgelopen 24 uur van de temperatuursensor uit de recorder. Opnieuw als
   * de sensor een andere wordt, en (met `vernieuw`) om het kwartier.
   * Tussendoor komen de live metingen erbij in `reeksMet_`.
   */
  async laadReeks_(vernieuw = false) {
    const sensor = this.delen_().water ?? "";
    const r = this.reeks_;
    if (!sensor || !this.config?.grafiek || !this.hass_?.connection?.sendMessagePromise) return;
    if (r.bezig || (sensor === r.sensor && r.geladen && !vernieuw)) return;
    r.bezig = true;
    const gen = (this.reeksGen_ ?? 0) + 1;
    this.reeksGen_ = gen;
    const eind = new Date();
    const start = new Date(eind.getTime() - 25 * 3600000);
    let rijen = [];
    try {
      const antwoord = await this.hass_.connection.sendMessagePromise({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: eind.toISOString(),
        entity_ids: [sensor],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      rijen = antwoord?.[sensor] ?? [];
    } catch {
      // Geen recorder, of nog niet klaar: dan alleen wat er nu is. Het
      // kwartier daarna probeert hij het opnieuw.
    }
    r.bezig = false;
    if (gen !== this.reeksGen_) return;
    this.reeks_ = { sensor, rijen, geladen: Date.now(), bezig: false };
    if (this.hass_ && this.wired_) this.paint();
  }

  /**
   * De rijen uit de recorder, met de live metingen erachter.
   *
   * Elke nieuwe meting blijft staan tot de recorder weer gevraagd wordt: de
   * kaart plakte eerst alleen de meting van NU erachter, en dan verdween een
   * piek van 60 graden uit de lijn zodra het water weer 58 was (gemeten op
   * 15 oktober 2026).
   */
  reeksMet_(sensor) {
    if (this.reeks_.sensor !== sensor) return [];
    const rijen = this.reeks_.rijen;
    const st = stateOf(this.hass_, sensor);
    const tijd = Date.parse(st?.last_updated ?? "");
    if (!st || !Number.isFinite(tijd)) return rijen;
    const laatste = rijen[rijen.length - 1];
    const tLaatste = laatste ? (typeof laatste.lu === "number" ? laatste.lu * 1000 : Date.parse(laatste.last_updated)) : 0;
    if (tijd > tLaatste) rijen.push({ s: st.state, lu: tijd / 1000 });
    return rijen;
  }

  paintGrafiek_(delen, st) {
    const blok = this.$(".grafiek");
    const sensor = delen.water ?? "";
    blok.hidden = !this.config.grafiek || !sensor;
    if (blok.hidden) return;
    if (this.reeks_.sensor !== sensor || !this.reeks_.geladen) this.laadReeks_();

    const nu = Date.now();
    const reeks = waterReeks(this.reeksMet_(sensor), nu);
    this.grafiekReeks_ = reeks;
    const doel = doelInstelling(st)?.doel ?? null;
    const bereik = schaal(reeks, doel);
    this.grafiekBereik_ = bereik;
    const { lijn, vlak } = grafiekPaden(reeks, bereik);
    const genoeg = Boolean(lijn);

    this.$(".lijn").setAttribute("d", lijn);
    this.$(".opp").setAttribute("d", vlak);
    this.$(".leeg").hidden = genoeg || !this.reeks_.geladen;
    this.$(".kruis").hidden ||= !genoeg;

    // Het raster en de getallen aan de rechterkant.
    const lijnen = genoeg ? bereik.lijnen : [];
    const rsig = JSON.stringify(lijnen);
    const raster = this.$(".raster");
    if (raster.dataset.sig !== rsig) {
      raster.dataset.sig = rsig;
      raster.innerHTML = lijnen
        .map((v) => {
          const y = ((1 - hoogteVan(v, bereik)) * 300).toFixed(1);
          return `<line x1="0" x2="1000" y1="${y}" y2="${y}" />`;
        })
        .join("");
      this.$(".ylabels").innerHTML = lijnen
        .map((v) => `<span style="top:calc(6px + (100% - 12px) * ${(1 - hoogteVan(v, bereik)).toFixed(4)})">${escapeHtml(graden(v))}°</span>`)
        .join("");
    }

    // De tijden eronder.
    const tijden = genoeg ? tijdLabels(reeks) : [];
    const xsig = JSON.stringify(tijden.map((x) => x.label));
    const xl = this.$(".xlabels");
    if (xl.dataset.sig !== xsig || genoeg) {
      xl.dataset.sig = xsig;
      xl.innerHTML = tijden.map((x) => `<span style="left:${(x.x * 100).toFixed(2)}%">${x.label}</span>`).join("");
    }

    // De stip op de laatste meting.
    const eind = this.$(".eind");
    const laatste = reeks.punten[reeks.punten.length - 1];
    eind.hidden = !genoeg || !laatste;
    if (!eind.hidden) {
      eind.style.left = `${(breedteVan(laatste.t, reeks) * 100).toFixed(2)}%`;
      eind.style.top = `${((1 - hoogteVan(laatste.v, bereik)) * 100).toFixed(2)}%`;
    }

    const u = uitersten(reeks);
    this.text(".bereik", u && genoeg ? (u.min === u.max ? `${graden(u.min)}°` : t("{min}° tot {max}°", { min: graden(u.min), max: graden(u.max) })) : "");
    this.$(".vlak").setAttribute(
      "aria-label",
      u && genoeg
        ? t("Watertemperatuur van de afgelopen 24 uur: laagste {min} graden, hoogste {max} graden, nu {nu} graden", {
            min: graden(u.min),
            max: graden(u.max),
            nu: graden(laatste.v),
          })
        : t("Watertemperatuur van de afgelopen 24 uur: nog geen metingen"),
    );
  }

  /** De kruisdraad op een plek in de grafiek, naar de meting van dat moment. */
  kruis_(clientX) {
    const reeks = this.grafiekReeks_;
    const bereik = this.grafiekBereik_;
    const kruis = this.$(".kruis");
    if (!reeks?.punten?.length || !(bereik?.max > bereik?.min)) return;
    const r = this.$(".plot").getBoundingClientRect();
    if (!r.width) return;
    const fractie = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const tijd = reeks.van + fractie * (reeks.tot - reeks.van);
    const p = waardeOp(reeks, tijd);
    if (!p) return;
    const x = `${(fractie * 100).toFixed(2)}%`;
    kruis.querySelector(".draad").style.left = x;
    const punt = kruis.querySelector(".punt");
    punt.style.left = x;
    punt.style.top = `${((1 - hoogteVan(p.v, bereik)) * 100).toFixed(2)}%`;
    const tip = kruis.querySelector(".tip");
    // De tijd van de plek waar je wijst, de waarde die toen gold.
    tip.textContent = `${klokTijd(tijd)} · ${graden(p.v)}°`;
    // Binnen de kaart houden: aan de randen schuift het label mee naar binnen.
    tip.style.left = `${Math.min(88, Math.max(12, fractie * 100)).toFixed(2)}%`;
    kruis.hidden = false;
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 4) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-boiler-card-editor");
  }

  static getStubConfig(hass, entities) {
    const boiler = entities?.find((e) => String(e).startsWith("water_heater."));
    return boiler ? { entity: boiler } : {};
  }
}

/**
 * De editor: de boiler, dan merk en type, en wat je zou willen overschrijven.
 * Plat, zonder uitklapblokken (Vormregels).
 */
class BoilerEditor extends DacEditor {
  defaults() {
    return { merk: "auto", grafiek: true };
  }

  /** De fotokiezer alleen bij een ander merk: anders is het een veld dat niets doet. */
  pickers() {
    return [
      { key: "icon", kind: "icon", label: t("Icoon (zonder foto)"), fallback: "boiler" },
      ...(this.config_?.merk === "eigen"
        ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: "boiler" }]
        : []),
    ];
  }

  schema() {
    const types = typeKeuzes(this.config_?.merk);
    return [
      { name: "entity", required: true, selector: sel.entity(["water_heater"]) },
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes()) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),
      { name: "temperatuur", selector: { entity: { domain: ["sensor"], device_class: "temperature" } } },
      { name: "grafiek", selector: sel.bool() },
    ];
  }

  serialize(config) {
    const reg = this.hass_?.entities?.[config.entity];
    return metType(config, reg?.device_id ? this.hass_?.devices?.[reg.device_id] : null, BOILERS);
  }

  label(s) {
    return (
      {
        entity: t("Boiler"),
        name: t("Naam"),
        merk: t("Merk"),
        model: t("Type"),
        temperatuur: t("Watertemperatuur"),
        grafiek: t("Grafiek van de afgelopen 24 uur"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      entity: t("De water_heater van de warmtepompboiler. De temperatuursensor van hetzelfde apparaat zoekt de kaart zelf."),
      name: t("Leeg laten: de naam van het apparaat. Heet dat alleen \"Water Heater\", dan staat er Boiler."),
      merk: t("Automatisch toont de productfoto als het type bekend is, en anders het icoon."),
      model: t("Het type bepaalt de productfoto."),
      temperatuur: t("Leeg laten: de temperatuursensor van de boiler zelf. Die staat ook in de grafiek."),
    }[s.name];
  }
}

registerEditor("domotiapp-boiler-card-editor", BoilerEditor);
registerCard("domotiapp-boiler-card", BoilerCard, {
  name: nt("DomotiApp Warmtepompboiler"),
  description: nt(
    "De warmtepompboiler voor het tapwater: de watertemperatuur, het doel, de stand (Warmtepomp, Auto, Turbo, Vakantie) en een grafiek van de afgelopen 24 uur."
  ),
});

export { BoilerCard };
