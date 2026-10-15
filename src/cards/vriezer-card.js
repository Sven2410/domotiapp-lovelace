/**
 * De vriezer: hoe koud hij is, waar hij op staat, en of er iets mis is.
 *
 * Gevraagd op 15 oktober 2026, voor een Miele FNS 7710 E bij een klant. Zie
 * vriezer-logica.js voor wat erop staat en waarom supervriezen en de modus er
 * niet op staan.
 *
 *   [foto/chip] Vriezer                     -18 °C
 *               Deur dicht (altijd, sinds 0.71.0)
 *   Instellen op                        [ −  -18 °C  + ]
 *
 * Een tik op de kop opent de vriezer in Home Assistant. − en + lopen voor op de
 * vriezer zelf: pas als je stopt met tikken gaat de nieuwe waarde eruit.
 *
 * KLEUR: alleen de chip draagt de toestand (een open deur let op, een storing
 * rood). Met een foto doet een icoontje in de statusregel dat, alleen als er
 * iets mis is. Die regel noemt sinds 0.71.0 altijd de deur, ook als hij dicht
 * is (de wens van de eigenaar). Het getal is neutrale inkt.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { moreInfo, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { metType, merkKeuzes, productAfbeelding, typeKeuzes } from "./productfoto.js";
import {
  VRIEZERS,
  doelOproep,
  gradenTekst,
  isEchteZone,
  volgendDoel,
  vriezerDelen,
  vriezerMelding,
  vriezerStand,
} from "./vriezer-logica.js";

class VriezerCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 9px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
    .kop.dood { opacity: .42; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }
    /* Staand op een eigen vlak in de tint van het thema, net als de wasmachine:
       een witte vriezer verdwijnt anders op een lichte kaart. */
    .foto {
      flex: 0 0 auto; display: block; width: 40px; height: 52px; padding: 4px;
      object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
    }

    .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }
    .st .stip { flex: 0 0 auto; width: 13px; height: 13px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 13px; height: 13px; }
    /* Mag doorlopen, ook breed: met de deur erbij is het "Storing · deur
       dicht", en afgekapt viel juist de deur weg (gemeten op 15 oktober 2026). */
    .st { align-items: flex-start; }
    .st .sw { min-width: 0; white-space: pre-line; }

    /* De temperatuur: groot, zoals de lading op de batterijkaart. */
    .temp {
      flex: 0 0 auto; font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }

    .instellen { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
    .instellen .kopje { flex: 0 0 auto; font-size: 12px; color: var(--dac-ink-2); padding-left: 2px; white-space: nowrap; }
    .set {
      flex: 0 1 170px; min-width: 128px; height: 36px; display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 2px;
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
    }
    .set button {
      width: 30px; height: 30px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2); border-radius: var(--dac-radius-pill);
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .set button:active { background: rgba(var(--dac-tint), .14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .waarde { flex: 1 1 auto; text-align: center; font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap; }
    .set .waarde.pending { color: var(--dac-accent-hi); }

    /* Smal, een halve kaart op een telefoon (rond 175). Gemeten op
       15 oktober 2026: op 170 paste "Instellen op" met de stepper niet (198
       nodig, 146 over) en werd "Deur open" afgekapt tot "Deur op...". Dus een
       kleinere foto en temperatuur, een melding die mag doorlopen, en alleen
       de stepper: die zegt zelf wat hij doet. */
    @container (max-width: 230px) {
      .kop { gap: 8px; }
      .foto { width: 28px; height: 40px; padding: 2px; }
      .chip { width: 32px; height: 32px; }
      .nm { font-size: 13px; }
      .temp { font-size: 19px; }
      .st { align-items: flex-start; }
      .st .sw { white-space: normal; }
      .instellen .kopje { display: none; }
      .set { flex: 1 1 auto; min-width: 0; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig: zonder entiteit een uitlegkaart.
    const c = { name: "", merk: "auto", ...config };
    if (!c.entity) c[INCOMPLETE] = "Kies de climate van de vriezer.";
    return c;
  }

  set hass(hass) {
    const oud = this.hass_;
    super.hass = hass;
    if (!oud || !this.built_ || !this.wired_ || this.config?.[INCOMPLETE]) return;
    if (oud.entities !== hass?.entities || oud.devices !== hass?.devices) this.paint();
  }

  get hass() {
    return super.hass;
  }

  /** De delen van het apparaat, vastgehouden zolang het register hetzelfde is. */
  delen_() {
    const hass = this.hass_;
    const id = this.config?.entity;
    if (!hass || !id) return {};
    const m = this.delenMemo_;
    if (m && m.entities === hass.entities && m.id === id) return m.uit;
    const uit = vriezerDelen(hass, id);
    this.delenMemo_ = { entities: hass.entities, id, uit };
    return uit;
  }

  watched() {
    const d = this.delen_();
    return [this.config.entity, d.temperatuur, d.deur, d.storing, d.melding].filter(Boolean);
  }

  apparaat_() {
    const reg = this.hass_?.entities?.[this.config.entity];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  stand_() {
    const d = this.delen_();
    const st = (id) => stateOf(this.hass, id);
    return vriezerStand(st(this.config.entity), {
      temperatuur: st(d.temperatuur),
      deur: st(d.deur),
      storing: st(d.storing),
      melding: st(d.melding),
    });
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    return `
      <div class="card surface" style="--tone:${TONES.neutral}">
        <div class="kop" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="chip"></span>
          <div class="txt">
            <span class="nm"></span>
            <span class="st" hidden><span class="stip" hidden></span><span class="sw"></span></span>
          </div>
          <span class="temp"></span>
        </div>
        <div class="instellen" hidden>
          <span class="kopje">Instellen op</span>
          <div class="set" aria-label="Instellen op">
            <button type="button" data-d="-1" aria-label="Kouder">${resolve("minus")}</button>
            <span class="waarde"></span>
            <button type="button" data-d="1" aria-label="Minder koud">${resolve("plus")}</button>
          </div>
        </div>
      </div>`;
  }

  wire() {
    this.on(this.$(".kop"), "click", () => moreInfo(this, this.config.entity));
    this.on(this.$(".set"), "click", (e) => {
      const knop = e.target?.closest?.("button[data-d]");
      if (knop) this.stap_(Number(knop.dataset.d));
    });
    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(() => clearTimeout(this.stapTimer_));
  }

  /** − of +: de waarde loopt voor, en pas als je stopt gaat hij naar de vriezer. */
  stap_(richting) {
    const s = this.stand_();
    const van = this.pending_ ?? s?.doel;
    const volgende = volgendDoel(s, van, richting);
    if (volgende == null) return;
    this.pending_ = volgende;
    this.paint();
    clearTimeout(this.stapTimer_);
    this.stapTimer_ = setTimeout(async () => {
      const oproep = doelOproep(this.config.entity, this.pending_);
      await this.hass.callService(oproep[0], oproep[1], oproep[2]);
      this.stapTimer_ = setTimeout(() => {
        this.pending_ = null;
        this.paint();
      }, 1500);
    }, 600);
  }

  paint() {
    const c = this.config;
    const s = this.stand_();
    const melding = vriezerMelding(s);
    const tone = TONES[melding.tone] ?? TONES.neutral;
    this.$(".card").style.setProperty("--tone", tone);
    this.$(".kop").classList.toggle("dood", !s);

    const apparaat = this.apparaat_();
    const naam =
      c.name || apparaat?.name_by_user || apparaat?.name || stateOf(this.hass, c.entity)?.attributes?.friendly_name || "Vriezer";
    this.text(".nm", naam);

    // Foto of chip; met een foto draagt het icoontje in de statusregel de kleur.
    const icoon = c.icon || "koelkast";
    const metFoto = this.paintFoto_();
    const chip = this.$(".chip");
    chip.hidden = metFoto;
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "koelkast");
    }
    chip.style.setProperty("--tone", tone);
    const stip = this.$(".stip");
    stip.hidden = !metFoto || melding.tone === "neutral";
    if (!stip.hidden && stip.dataset.icon !== icoon) {
      stip.dataset.icon = icoon;
      stip.innerHTML = resolve(icoon, "koelkast");
    }
    this.$(".st").hidden = !melding.tekst;
    // Elk deel op een eigen regel (white-space: pre-line).
    this.text(".st .sw", melding.regels.join("\n"));

    this.text(".temp", gradenTekst(s?.temperatuur, s?.eenheid));
    this.$(".kop").setAttribute("aria-label", [naam, gradenTekst(s?.temperatuur, s?.eenheid), melding.tekst].filter(Boolean).join(", "));

    const inst = this.$(".instellen");
    inst.hidden = !s || s.doel == null;
    if (!inst.hidden) {
      const v = this.pending_ ?? s.doel;
      const el = this.$(".set .waarde");
      el.classList.toggle("pending", this.pending_ != null);
      this.text(el, gradenTekst(v, s.eenheid));
      this.$('.set [data-d="-1"]').disabled = volgendDoel(s, v, -1) == null;
      this.$('.set [data-d="1"]').disabled = volgendDoel(s, v, 1) == null;
      this.$(".set").setAttribute("aria-label", `Instellen op ${gradenTekst(v, s.eenheid)}`);
    }

    meetRaster(this.$(".card"));
  }

  /** De productfoto bij merk en type, of geen. Een foto die niet laadt geeft de chip terug. */
  paintFoto_() {
    const bron = productAfbeelding(this.config, this.apparaat_(), VRIEZERS);
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
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

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-vriezer-card-editor");
  }

  /** Een vriezer met een eigen temperatuur: niet een van Miele's spookzones. */
  static getStubConfig(hass, entities) {
    const climates = (entities ?? []).filter((e) => String(e).startsWith("climate."));
    const echt = climates.filter((e) => isEchteZone(hass?.states?.[e]));
    const vriezer = echt.find((e) => /vriez|freez/i.test(e)) ?? echt[0];
    return vriezer ? { entity: vriezer } : {};
  }
}

class VriezerEditor extends DacEditor {
  defaults() {
    return { merk: "auto" };
  }

  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon (zonder foto)", fallback: "koelkast", auto: false },
      ...(this.config_?.merk === "eigen" ? [{ key: "image", kind: "foto", label: "Eigen afbeelding", fallback: "koelkast" }] : []),
    ];
  }

  apparaat_() {
    const reg = this.hass_?.entities?.[this.config_?.entity];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  schema() {
    const types = typeKeuzes(this.config_?.merk, VRIEZERS);
    return [
      { name: "entity", required: true, selector: sel.entity(["climate"]) },
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes(VRIEZERS)) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),
    ];
  }

  serialize(config) {
    return metType(config, this.apparaat_(), VRIEZERS);
  }

  label(s) {
    return { entity: "Vriezer", name: "Naam", merk: "Merk", model: "Type" }[s.name] ?? super.label(s);
  }

  helper(s) {
    return {
      entity:
        "De climate van de vriezer. Kies het vak met een temperatuur: Miele maakt er ook twee zonder (zone 2 en 3), en die hebben geen vak. Deur, storing en melding van hetzelfde apparaat zoekt de kaart zelf.",
      name: "Leeg laten: de naam van het apparaat in Home Assistant.",
      merk: "Automatisch toont de productfoto als het type bekend is, en anders het icoon.",
      model: "Het type bepaalt de productfoto.",
    }[s.name];
  }
}

registerEditor("domotiapp-vriezer-card-editor", VriezerEditor);
registerCard("domotiapp-vriezer-card", VriezerCard, {
  name: "DomotiApp Vriezer",
  description: "De vriezer: de temperatuur, waar hij op staat, en of de deur open staat of er een melding is. Met een productfoto per merk en type.",
});

export { VriezerCard };
