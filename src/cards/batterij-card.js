/**
 * De thuisbatterij, zoals DomotiApp Coach hem stuurt.
 *
 * Gevraagd op 11 oktober 2026, samen met de laadpaalkaart: een kaart die met de
 * coach werkt, voor in een bubble-pop-up, zodat klanten niet telkens naar de
 * coach hoeven.
 *
 * VAN BOVEN NAAR BENEDEN
 *
 * 1. De kop: de foto van de batterij (liggend; een Solarbank is breder dan
 *    hoog), de naam, wat hij doet (de woorden van de coach, met het icoon van
 *    de stand) en waarom. Rechts de lading, groot, en de temperatuur.
 * 2. Een balk met de lading en een streepje op de ondergrens (en op de
 *    vakantiegrens als die aan staat), met de grenzen eronder.
 * 3. Vol laden, en Terug naar het plan zodra er een opdracht loopt.
 * 4. Leegladen: EERST het getal, dan de knop. De coach leest `leeg_tot` op het
 *    moment dat je drukt (11 oktober 2026), dus zo staat het ook op de kaart.
 * 5. De vakantiestand. De grens die de installateur zette staat erbij, maar is
 *    hier niet te wijzigen.
 * 6. Het plan als staafjes rond een nullijn: laden omhoog, ontladen omlaag.
 * 7. Wat hij opleverde.
 *
 * Alles van de coach, via het apparaat dat in de editor gekozen is (of het
 * enige). De toestand van de coach-sensor wordt getoond maar nergens gelezen om
 * iets te beslissen (valkuil 67).
 *
 * Een batterij die de coach ALLEEN UITLEEST (sinds coach 0.123.0; een Growatt
 * altijd) houdt alleen 1, 2 en 7: de accustand en het vermogen komen dan uit
 * zijn eigen sensoren, en de knoppen, de vakantiestand en het plan zijn er
 * niet. Gevraagd op 15 oktober 2026, voor een Growatt ARK bij een klant. Zie
 * `uitgelezenStand` in batterij-logica.js.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  BATTERIJ_FOTOS,
  BATTERIJ_MODELLEN,
  batterijAfbeelding,
  batterijStand,
  grenzenTekst,
  leegTotMetGrens,
  opdrachtKnoppen,
  opgeleverdTekst,
  planStaven,
  standVorm,
  temperatuurTekst,
  uitgelezenStand,
  vermogenTekst,
} from "./batterij-logica.js";
import { COACH_FABRIKANT, coachMelding, coachRollen, contractVan, kiesApparaat, klantEntiteiten } from "./coach-logica.js";
import { drukOproep } from "./vaatwasser-logica.js";
import { getalTekst, stapWaarde } from "./laadpaal-logica.js";

const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

class BatterijCard extends DacCard {
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

    .kop { display: flex; align-items: center; gap: 14px; cursor: pointer; min-width: 0; }
    /* Liggend: een Solarbank is breder dan hoog, met uitbreiding bijna vierkant.
       De breedte volgt de foto, tot 84: een Growatt ARK staat rechtop (een
       half zo breed als hoog), en in een vak van 84 stond hij dan met een gat
       van 26 aan elke kant (gemeten op 15 oktober 2026). */
    .foto { flex: 0 0 auto; width: auto; max-width: 84px; height: 64px; object-fit: contain; object-position: center; }
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
    /* Alleen het icoon draagt de stand (Vormregels). */
    .st { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12.5px; color: var(--dac-ink); }
    .st .stip { flex: 0 0 auto; width: 15px; height: 15px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 15px; height: 15px; --mdc-icon-size: 15px; }
    .st .woord { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    /* Heel, niet na twee regels afgekapt. De eigenaar op 12 oktober 2026, met
       een schermafdruk van "... wat het huis vraagt komt…": "ook op pc snijd de
       tekst af van de batterij kaart". */
    .reden { font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-2); }

    /* De lading: groot, zoals de accustand op de laadpaalkaart. Het getal
       draagt geen kleur (theme.js). */
    .lading { flex: 0 0 auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .soc { font-size: 28px; font-weight: 600; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; color: var(--dac-ink); }
    .temp { margin-top: 4px; font-size: 11.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums; white-space: nowrap; }

    .lijn { position: relative; height: 8px; border-radius: 999px; background: var(--dac-surface-hi); }
    .lijn .vul {
      position: absolute; inset: 0 auto 0 0; width: 0%; border-radius: 999px;
      background: linear-gradient(90deg, color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
      transition: width 600ms ease;
    }
    .lijn .mik { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; border-radius: 1px; background: var(--dac-ink-2); }
    .lijn .mik.vakantie { background: var(--dac-ink-3); }
    .grenzen { font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; }

    .rij { display: flex; gap: 6px; min-width: 0; align-items: stretch; }
    .knop {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 8px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .knop .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    .knop .lb, .knop .kort { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .knop .kort { display: none; }
    @media (hover: hover) { .knop:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .knop:active { transform: scale(.97); }
    .knop[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    /* Vol laden en Leegladen naast elkaar, en Terug naar het plan erbij als er
       een opdracht loopt. De eigenaar op 12 oktober 2026: "vol laden en leeg
       laden moet naast elkaar staan". Terug naar het plan staat op een eigen
       regel eronder: met drie op een rij werd hij op 380 afgekapt, en zo blijft
       de hele naam staan, ook op 280 (gemeten op 12 oktober 2026). */
    .opdrachten { flex-wrap: wrap; }
    .opdrachten .knop[data-rol="plan"] { flex-basis: 100%; }

    /* Leegladen tot: een instelling op een eigen regel, onder de knoppen. */
    .leeg { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
    .leeg .kopje { flex: 0 0 auto; font-size: 12px; color: var(--dac-ink-2); padding-left: 4px; white-space: nowrap; }
    .set {
      flex: 0 1 170px; min-width: 120px; height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 2px;
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
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

    /* "vakantierij" en niet "vakantie": die naam heeft het streepje in de
       accubalk al, en this.$(".vakantie") pakte dat streepje in plaats van
       deze regel (gemeten op de werkbank, 11 oktober 2026). */
    .vakantierij { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .vakantierij .uitleg { font-size: 12px; color: var(--dac-ink-2); }
    .vakantierij .knop { flex: 0 0 auto; padding: 7px 14px; }

    /* Het plan: staafjes rond een nullijn. */
    .plan { display: flex; flex-direction: column; gap: 5px; }
    .plan .kopje { font-size: 11px; color: var(--dac-ink-3); padding-left: 2px; }
    .grafiek { position: relative; height: 44px; border-radius: 8px; background: var(--dac-surface); overflow: hidden; }
    .grafiek .nul { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--dac-border-hi); }
    .staaf { position: absolute; border-radius: 2px; }
    .staaf[data-richting="laden"] { bottom: 50%; background: var(--dac-accent-hi); }
    /* Ontladen in het groenblauw van de identiteitsset en niet in het blauw van
       het huis: dat stond naast het accent van laden, en twee blauwen naast
       elkaar zijn er een (gemeten op de werkbank, 11 oktober 2026). */
    .staaf[data-richting="ontladen"] { top: 50%; background: var(--dac-device-2); }
    .tikken { position: relative; height: 14px; font-size: 10.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
    .tikken span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
    .tikken span:first-child { transform: none; }
    .legenda { display: flex; gap: 12px; font-size: 10.5px; color: var(--dac-ink-3); }
    .legenda i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 5px; vertical-align: 0; }
    .legenda .l { background: var(--dac-accent-hi); }
    .legenda .o { background: var(--dac-device-2); }

    .opgeleverd {
      display: flex; flex-direction: column; gap: 3px;
      padding-top: 10px; border-top: 1px solid var(--dac-border);
      font-size: 12px;
    }
    .opgeleverd .kopje { color: var(--dac-ink-3); }
    .opgeleverd .wat { color: var(--dac-ink); font-variant-numeric: tabular-nums; }

    .melding { margin: 0; font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); }

    /* Smal: een kleinere foto en lading. */
    @container (max-width: 360px) {
      .foto { max-width: 64px; height: 50px; }
      .soc { font-size: 24px; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig: zonder keuze zoekt de kaart zelf de enige
    // thuisbatterij van de coach, en anders zegt hij waarom niet.
    return { name: "", afbeelding: "auto", ...config };
  }

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
    // De sensoren van de batterij zelf: bij een batterij die de coach alleen
    // uitleest komen de accustand en het vermogen daarvandaan.
    const eigen = r.coach ? klantEntiteiten(stateOf(this.hass, r.coach)) : {};
    return [
      r.coach,
      r.vol_laden,
      r.leegladen,
      r.terug_naar_plan,
      r.leeg_tot,
      r.vakantiestand,
      eigen.soc,
      eigen.charge_power,
      eigen.discharge_power,
    ].filter(Boolean);
  }

  /** Wat de batterij doet: van de coach, of uit zijn eigen sensoren als de coach hem alleen uitleest. */
  stand_(coachSt) {
    return uitgelezenStand(batterijStand(coachSt), (id) => stateOf(this.hass, id));
  }

  coach_() {
    const hass = this.hass_;
    if (!hass || !this.config) return null;
    const gekozen = this.config.coach_device || "";
    const m = this.coachMemo_;
    if (m && m.entities === hass.entities && m.devices === hass.devices && m.gekozen === gekozen) return m.uit;
    const keuze = kiesApparaat(hass, gekozen, BATTERIJ_MODELLEN, "Thuisbatterij");
    const uit = { keuze, rollen: coachRollen(hass, keuze.id) };
    this.coachMemo_ = { entities: hass.entities, devices: hass.devices, gekozen, uit };
    return uit;
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="kop" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="geenfoto" hidden>${resolve("battery")}</span>
          <div class="midden">
            <span class="nm"></span>
            <span class="st"><span class="stip"></span><span class="woord"></span></span>
            <span class="reden"></span>
          </div>
          <div class="lading" hidden><span class="soc"></span><span class="temp"></span></div>
        </div>

        <p class="melding" hidden></p>

        <div class="lijn" hidden><span class="vul"></span><span class="mik grens" hidden></span><span class="mik vakantie" hidden></span></div>
        <div class="grenzen" hidden></div>

        <div class="rij opdrachten" hidden></div>

        <div class="leeg" hidden>
          <span class="kopje">Leegladen tot</span>
          <div class="set" aria-label="Leegladen tot">
            <button type="button" data-d="-1" aria-label="Minder">${resolve("minus")}</button>
            <span class="waarde"></span>
            <button type="button" data-d="1" aria-label="Meer">${resolve("plus")}</button>
          </div>
        </div>

        <div class="vakantierij" hidden>
          <span class="uitleg"></span>
          <button type="button" class="knop vakantieknop" aria-pressed="false">${resolve("beach")}<span class="lb">Vakantie</span></button>
        </div>

        <div class="plan" hidden>
          <span class="kopje">Plan</span>
          <div class="grafiek"><span class="nul"></span><span class="staven"></span></div>
          <div class="tikken"></div>
          <div class="legenda"><span><i class="l"></i>laden</span><span><i class="o"></i>ontladen</span></div>
        </div>

        <div class="opgeleverd" hidden><span class="kopje">Opgeleverd</span><span class="wat"></span></div>
      </div>`;
  }

  wire() {
    this.on(this.$(".kop"), "click", () => {
      // Een batterij die de coach alleen uitleest: de accustand, want de
      // sensor van de coach heeft dan niets te zeggen.
      const coach = this.coach_()?.rollen.coach;
      const s = coach ? this.stand_(stateOf(this.hass, coach)) : null;
      const id = (s?.alleenLezen && s.entiteiten.soc) || coach;
      if (id) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true }));
    });
    // De opdrachtknoppen worden in `paint()` gebouwd; het gedrag hangt aan de rij.
    // Leegladen gaat via `leegladen_()`: eerst het getal, dan de knop.
    this.on(this.$(".opdrachten"), "click", (e) => {
      const knop = e.target?.closest?.(".knop");
      if (!knop) return;
      if (knop.dataset.rol === "leeg") this.leegladen_();
      else this.druk_(knop.dataset.entity);
    });
    this.on(this.$(".vakantieknop"), "click", () => {
      const id = this.coach_()?.rollen.vakantiestand;
      if (!id) return;
      const aan = stateOf(this.hass, id)?.state === "on";
      this.hass.callService("switch", aan ? "turn_off" : "turn_on", { entity_id: id });
    });
    this.on(this.$(".set"), "click", (e) => {
      const knop = e.target?.closest?.("button[data-d]");
      if (knop) this.stap_(Number(knop.dataset.d));
    });
    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(() => {
      clearTimeout(this.stapTimer_);
      clearTimeout(this.tik_);
    });
  }

  druk_(entityId) {
    const oproep = drukOproep(entityId);
    if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
  }

  /**
   * Leegladen tot: tikken loopt voor op de entiteit, en pas als je stopt gaat het
   * eruit. De knop Leegladen leest het getal pas bij het drukken, dus wie snel
   * tikt en drukt moet niet de oude waarde krijgen: drukken stuurt eerst het
   * getal dat er staat.
   */
  stap_(richting) {
    const r = this.coach_()?.rollen ?? {};
    const st = leegTotMetGrens(stateOf(this.hass, r.leeg_tot), batterijStand(stateOf(this.hass, r.coach)));
    if (!st) return;
    const basis = this.pending_ != null ? { ...st, state: String(this.pending_) } : st;
    const volgende = stapWaarde(basis, richting);
    if (volgende == null) return;
    this.pending_ = volgende;
    this.paint();
    clearTimeout(this.stapTimer_);
    this.stapTimer_ = setTimeout(() => this.stuurGetal_(), 450);
  }

  /** Het getal dat er staat naar de coach; de belofte is klaar als hij het heeft. */
  async stuurGetal_() {
    clearTimeout(this.stapTimer_);
    const id = this.coach_()?.rollen.leeg_tot;
    if (this.pending_ == null || !id) return;
    await this.hass.callService("number", "set_value", { entity_id: id, value: this.pending_ });
    this.stapTimer_ = setTimeout(() => {
      this.pending_ = null;
      this.paint();
    }, 1500);
  }

  /**
   * Leegladen tot het getal dat er STAAT, ook als je net getikt hebt: de coach
   * leest `leeg_tot` op het moment van drukken, dus eerst het getal versturen
   * en daarna pas de knop.
   */
  async leegladen_() {
    if (this.pending_ != null) await this.stuurGetal_();
    this.druk_(this.coach_()?.rollen.leegladen);
  }

  paint() {
    const c = this.config;
    const info = this.coach_();
    const r = info?.rollen ?? {};
    const coachSt = stateOf(this.hass, r.coach);
    const s = this.stand_(coachSt);
    const melding = info ? coachMelding(info.keuze, contractVan(coachSt), "0.112.1") : "";

    const apparaat = this.hass?.devices?.[info?.keuze.id ?? ""];
    this.text(".nm", c.name || apparaat?.name_by_user || apparaat?.name || "Thuisbatterij");

    const vorm = standVorm(s?.stand);
    this.$(".card").style.setProperty("--tone", TONES[vorm.tone] ?? TONES.neutral);
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

    this.$(".lading").hidden = s?.soc == null;
    this.text(".soc", s?.soc != null ? `${Math.round(s.soc)}%` : "");
    // Onder de lading: het vermogen van een batterij die de coach alleen
    // uitleest, en de temperatuur.
    this.text(".temp", [vermogenTekst(s), temperatuurTekst(s)].filter(Boolean).join(" · "));

    const meld = this.$(".melding");
    meld.hidden = !melding;
    this.text(meld, melding);

    // ----- de lading en de grenzen
    const lijn = this.$(".lijn");
    lijn.hidden = s?.soc == null;
    if (!lijn.hidden) {
      const breedte = `${Math.max(0, Math.min(100, s.soc))}%`;
      const vul = this.$(".vul");
      if (vul.style.width !== breedte) vul.style.width = breedte;
      const grens = this.$(".mik.grens");
      grens.hidden = s.ondergrens == null;
      if (s.ondergrens != null) grens.style.left = `${s.ondergrens}%`;
      const vak = this.$(".mik.vakantie");
      vak.hidden = !(s.vakantie && s.vakantieMax != null);
      if (!vak.hidden) vak.style.left = `${s.vakantieMax}%`;
      lijn.setAttribute("role", "progressbar");
      lijn.setAttribute("aria-valuenow", String(Math.round(s.soc)));
    }
    const grenzen = grenzenTekst(s);
    this.$(".grenzen").hidden = !grenzen;
    this.text(".grenzen", grenzen);

    this.paintOpdrachten_(s, r);
    this.paintPlan_(s);

    const opgeleverd = opgeleverdTekst(s);
    this.$(".opgeleverd").hidden = !opgeleverd;
    this.text(".opgeleverd .wat", opgeleverd);

    clearTimeout(this.tik_);
    this.tik_ = setTimeout(() => this.hass_ && this.isConnected && this.paint(), 60_000);
    meetRaster(this.$(".card"));
  }

  /** De foto: een gekozen model, de foto bij merk en model van de batterij, een eigen, of niets. */
  paintFoto_(s) {
    const c = this.config;
    const bron = batterijAfbeelding(c.afbeelding, s, c.image ?? "");
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

  paintOpdrachten_(s, r) {
    // Vol laden, Leegladen en Terug naar het plan, naast elkaar.
    const knoppen = opdrachtKnoppen(s, r);
    const rij = this.$(".opdrachten");
    const sig = JSON.stringify(knoppen.map((k) => [k.rol, k.entity]));
    if (rij.dataset.sig !== sig) {
      rij.dataset.sig = sig;
      rij.innerHTML = knoppen
        .map(
          (k) =>
            `<button type="button" class="knop" data-rol="${k.rol}" data-entity="${escapeHtml(k.entity)}" aria-pressed="false" aria-label="${escapeHtml(k.label)}">${resolve(k.icoon)}<span class="lb">${escapeHtml(k.label)}</span><span class="kort">${escapeHtml(k.kort)}</span></button>`
        )
        .join("");
    }
    for (const el of rij.querySelectorAll(".knop")) {
      el.setAttribute("aria-pressed", String(knoppen.find((k) => k.rol === el.dataset.rol)?.aan ?? false));
    }
    rij.hidden = !knoppen.length;

    // Leegladen tot [− getal +], de instelling bij de knop Leegladen.
    // Bij een batterij die de coach alleen uitleest bestaan leeg_tot en de
    // vakantiestand wel, maar ze doen niets.
    const totSt = leegTotMetGrens(stateOf(this.hass, r.leeg_tot), s);
    const metLeeg = !s?.alleenLezen && Boolean(r.leegladen) && Boolean(totSt) && totSt.state !== "unavailable";
    this.$(".leeg").hidden = !metLeeg;
    if (metLeeg) {
      const v = this.pending_ ?? Number(totSt.state);
      const el = this.$(".set .waarde");
      el.classList.toggle("pending", this.pending_ != null);
      this.text(el, Number.isFinite(v) ? `${Math.round(v)}%` : "—");
      const basis = { ...totSt, state: String(v) };
      this.$('.set [data-d="-1"]').disabled = stapWaarde(basis, -1) == null;
      this.$('.set [data-d="1"]').disabled = stapWaarde(basis, 1) == null;
      this.$(".set").setAttribute("aria-label", `Leegladen tot ${Math.round(v)}%`);
    }

    // De vakantiestand: aan of uit, met de grens van de installateur erbij.
    const vakSt = stateOf(this.hass, r.vakantiestand);
    const metVak = !s?.alleenLezen && Boolean(vakSt) && vakSt.state !== "unavailable";
    this.$(".vakantierij").hidden = !metVak;
    if (metVak) {
      const aan = vakSt.state === "on";
      this.$(".vakantieknop").setAttribute("aria-pressed", String(aan));
      const max = s?.vakantieMax != null ? Math.round(s.vakantieMax) : null;
      this.text(
        ".vakantierij .uitleg",
        aan
          ? `Vakantiestand staat aan${max != null ? `: de batterij blijft onder ${max}%` : ""}.`
          : `Vakantiestand staat uit${max != null ? `. Aan blijft de batterij onder ${max}%` : ""}.`
      );
    }
  }

  paintPlan_(s) {
    const p = s ? planStaven(s.plan) : null;
    const plan = this.$(".plan");
    plan.hidden = !p || !p.staven.length;
    if (plan.hidden) return;
    const sig = JSON.stringify([p.staven.map((b) => [b.links.toFixed(2), b.breedte.toFixed(2), b.hoogte.toFixed(1), b.richting]), p.tikken]);
    if (plan.dataset.sig === sig) return;
    plan.dataset.sig = sig;
    this.$(".staven").innerHTML = p.staven
      .map((b) => {
        const titel = `${klok(b.start)}–${klok(b.eind)}, ${b.kw > 0 ? "laden" : "ontladen"} ${getalTekst(Math.abs(b.kw))} kW`;
        return `<span class="staaf" data-richting="${b.richting}" style="left:${b.links}%;width:${b.breedte}%;height:${b.hoogte / 2}%" title="${escapeHtml(titel)}"></span>`;
      })
      .join("");
    this.$(".tikken").innerHTML = p.tikken.map((t) => `<span style="left:${t.pct}%">${escapeHtml(t.tekst)}</span>`).join("");
    const richtingen = new Set(p.staven.map((b) => b.richting));
    this.$(".legenda .l").parentElement.hidden = !richtingen.has("laden");
    this.$(".legenda .o").parentElement.hidden = !richtingen.has("ontladen");
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 4) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-batterij-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

const AFBEELDING_KEUZES = [
  { value: "auto", label: "Automatisch (merk en model van de batterij)" },
  ...Object.entries(BATTERIJ_FOTOS).map(([value, f]) => ({ value, label: f.label })),
  { value: "eigen", label: "Eigen afbeelding" },
  { value: "geen", label: "Geen afbeelding" },
];

class BatterijEditor extends DacEditor {
  defaults() {
    return { afbeelding: "auto" };
  }

  pickers() {
    return this.config_?.afbeelding === "eigen"
      ? [{ key: "image", kind: "foto", label: "Eigen afbeelding", fallback: "battery" }]
      : [];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      {
        name: "coach_device",
        selector: { device: { filter: BATTERIJ_MODELLEN.map((model) => ({ manufacturer: COACH_FABRIKANT, model })) } },
      },
      { name: "afbeelding", selector: sel.select(AFBEELDING_KEUZES) },
    ];
  }

  label(s) {
    return { name: "Naam", coach_device: "Thuisbatterij bij de coach", afbeelding: "Afbeelding" }[s.name] ?? super.label(s);
  }

  helper(s) {
    return {
      name: "Leeg laten: de naam die de batterij bij de coach heeft.",
      coach_device:
        "Leeg laten: de thuisbatterij van DomotiApp Coach, als er precies één is. Daarvoor is coach 0.112.1 of nieuwer nodig.",
      afbeelding:
        "Automatisch kiest de foto bij merk en model van de batterij, zoals de coach ze meldt (Anker Solarbank Max AC). Een Growatt ARK herkent hij aan de capaciteit bij de coach; staat daar iets anders, kies het type dan hier.",
    }[s.name];
  }
}

registerEditor("domotiapp-batterij-card-editor", BatterijEditor);
registerCard("domotiapp-batterij-card", BatterijCard, {
  name: "DomotiApp Thuisbatterij",
  description:
    "De thuisbatterij zoals DomotiApp Coach hem stuurt: lading, vol laden, leegladen, vakantiestand en het plan. Een batterij die de coach alleen uitleest (Growatt) toont zijn lading en vermogen.",
});

export { BatterijCard };
