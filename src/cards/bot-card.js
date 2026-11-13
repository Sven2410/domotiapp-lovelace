/**
 * De botkaart: "Vraag het de DomotiTech Bot".
 *
 * De eigenaar, 12 november 2026: "het moet in een popup komen zoals Vraag het de DomotiTech Bot snap je? Alles in HA".
 * Eén tegel van één rasterrij; een tik opent het scherm met de vragen en de tickets van het huis (`bot-scherm.js`). Een
 * stip op het icoon zegt dat er een antwoord is dat deze gebruiker nog niet las, in het gesprek of in een ticket.
 *
 * Het gesprek en de tickets zijn van DomotiApp Coach (`domotiapp_coach/tickets/*`, contract 1; zie de kop van
 * `bot-logica.js`). Deze kaart houdt het abonnement, verstuurt, en brengt foto's naar de coach; het scherm tekent.
 * Zonder coach staat er een zin.
 *
 * Een foto gaat verkleind de deur uit (`fotoMaat`: een JPEG van hoogstens 2000 px), met `hass.fetchWithAuth`. Bekijken
 * gaat met een ondertekend pad (`auth/sign_path`), zodat er geen token in een `<img>` staat.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { BlijvendAbonnement, Verbindingswacht } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { nt, t } from "../taal.js";
import {
  BIJLAGE_PAD,
  COMMANDO,
  FOTO_KWALITEIT,
  allesOngelezen,
  bijlagePad,
  fotoMaat,
  heeftCoach,
  kentContract,
  tegelRegel,
  verwerk,
} from "./bot-logica.js";
import { botScherm, toonBotScherm } from "./bot-scherm.js";

/** Zo lang mag het abonnement mislukken terwijl de coach er wel is, voordat de kaart zegt dat de coach te oud is. */
const TE_OUD_NA_MS = 20000;

/** Zo lang geldt een ondertekend pad naar een foto; de kaart vraagt een nieuw ruim voordat het verloopt. */
const ADRES_S = 3600;

class BotCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .knop {
      height: 56px; padding: 0 12px 0 10px;
      display: flex; align-items: center; gap: 10px; min-width: 0;
      border-radius: var(--dac-radius); border: 1px solid var(--dac-border);
      cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none;
      transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
    }
    @media (hover: hover) { .knop:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
    .knop:active { transform: scale(.985); }
    :host([bare]) .knop { background: none; }

    .chip { position: relative; width: 36px; height: 36px; flex: 0 0 auto; }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .stip {
      position: absolute; top: -1px; right: -1px; width: 11px; height: 11px; border-radius: 50%;
      background: var(--dac-accent-hi); border: 2px solid var(--dac-bg-raise);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 1px; }
    .nm { font-size: 13px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rg { font-size: 12px; line-height: 1.25; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rg:empty { display: none; }
    .pijl { flex: 0 0 auto; color: var(--dac-ink-3); display: grid; place-items: center; }
    .pijl .icon { width: 16px; height: 16px; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.stand_ = null;
    this.adressen_ = new Map();
    this.teOud_ = false;
    this.leest_ = new Set();
  }

  validate(config) {
    return { ...config };
  }

  watched() {
    return [];
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    return `<div class="knop surface" role="button" tabindex="0" style="--tone:${TONES.accent}">
      <span class="chip">${resolve(this.config.icon || "chat", "chat")}<span class="stip" hidden></span></span>
      <span class="txt"><span class="nm">${escapeHtml(this.titel_())}</span><span class="rg"></span></span>
      <span class="pijl">${resolve("chevronRight")}</span>
    </div>`;
  }

  wire() {
    const knop = this.$(".knop");
    this.on(knop, "click", () => toonBotScherm(this));
    this.on(knop, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toonBotScherm(this);
    });
    this.abonnement_ = new BlijvendAbonnement({ type: `${COMMANDO}/subscribe` }, (bericht) => this.bericht_(bericht));
    this.abonnement_.start(this.hass);
    this.wachtOpCoach_();
    this.teardown_.push(() => {
      this.abonnement_.stop();
      clearTimeout(this.teOudTimer_);
      this.stand_ = null;
      this.adressen_.clear();
      this.leest_.clear();
      if (botScherm()?.isVan(this)) botScherm().sluit();
    });
    this.teardown_.push(volgRaster(knop));
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (terug && this.wired_) {
      this.abonnement_?.start(hass);
      this.wachtOpCoach_();
    }
  }

  get hass() {
    return super.hass;
  }

  /**
   * Een coach zonder tickets geeft `unknown_command`, en dat is ook wat Home Assistant zegt zolang hij opstart. De
   * herkansing vraagt dan gewoon door; pas als de coach er staat en het na twintig tellen nog niet lukt, zegt de kaart
   * dat de coach bijgewerkt moet worden.
   */
  wachtOpCoach_() {
    clearTimeout(this.teOudTimer_);
    this.teOudTimer_ = setTimeout(() => {
      if (this.abonnement_?.actief || !heeftCoach(this.hass)) return;
      this.teOud_ = true;
      this.bijwerken_();
    }, TE_OUD_NA_MS);
  }

  bericht_(bericht) {
    if (Array.isArray(bericht?.tickets)) this.teOud_ = !kentContract(bericht);
    else this.teOud_ = false;
    const nieuw = verwerk(this.stand_, bericht);
    if (!nieuw) return;
    this.stand_ = nieuw;
    this.bijwerken_();
  }

  bijwerken_() {
    if (this.hass && this.wired_) this.paint();
    const scherm = botScherm();
    if (scherm?.isVan(this)) scherm.teken();
  }

  // Voor het scherm.

  titel_() {
    return this.config?.name || t("Vraag het Coach Assist");
  }

  userId_() {
    return this.hass?.user?.id;
  }

  /** Een zin in plaats van het gesprek en de tickets, of `null` als er tickets te tonen zijn. */
  zin_() {
    if (!heeftCoach(this.hass)) return t("Coach Assist werkt via COACH, en die staat niet in deze Home Assistant.");
    if (this.teOud_) return t("Deze versie van COACH kent Coach Assist nog niet. Werk COACH bij.");
    return null;
  }

  /**
   * `new` of `reply`. Geeft het ticket (of het gesprek), en zet het meteen in de stand: het event van het abonnement
   * komt er vlak achter.
   */
  async stuur_({ type, ...velden }) {
    const ticket = await this.hass.connection.sendMessagePromise({ type: `${COMMANDO}/${type}`, ...velden });
    if (ticket?.id != null) this.bericht_({ ticket });
    return ticket;
  }

  /**
   * Een foto naar de coach, en zijn id terug. Eerst verkleind tot een JPEG; lukt dat niet (een HEIC buiten Safari),
   * dan gaat het origineel, en zegt de coach zelf of hij het aanneemt.
   */
  async upload_(bestand) {
    const blob = (await verklein(bestand)) ?? bestand;
    const form = new FormData();
    form.append("bestand", blob, "foto.jpg");
    let antwoord;
    try {
      antwoord = await this.hass.fetchWithAuth(BIJLAGE_PAD, { method: "POST", body: form });
    } catch (fout) {
      throw { code: "foto", message: String(fout?.message ?? fout) };
    }
    const uit = await antwoord.json().catch(() => ({}));
    if (!antwoord.ok || !uit.id) throw { code: "foto", message: uit.message ?? `HTTP ${antwoord.status}` };
    return uit.id;
  }

  /** Een adres voor een `<img>`: een ondertekend pad, een uur geldig, per foto onthouden. `null` als het niet lukt. */
  fotoAdres_(id) {
    const pad = bijlagePad(id);
    if (!pad || !this.hass) return Promise.resolve(null);
    const al = this.adressen_.get(id);
    if (al && al.tot > Date.now()) return al.adres;
    const adres = this.hass
      .callWS({ type: "auth/sign_path", path: pad, expires: ADRES_S })
      .then((r) => r?.path ?? null)
      .catch(() => {
        this.adressen_.delete(id);
        return null;
      });
    this.adressen_.set(id, { adres, tot: Date.now() + (ADRES_S - 600) * 1000 });
    return adres;
  }

  /** `read`, één keer tegelijk per ticket. Mislukt het, dan de volgende keer opnieuw. */
  lees_(id) {
    if (this.leest_.has(id) || !this.hass?.connection) return;
    this.leest_.add(id);
    this.hass.connection
      .sendMessagePromise({ type: `${COMMANDO}/read`, ticket_id: id })
      .catch((fout) => console.warn("DomotiApp Coach Assist:", fout))
      .finally(() => this.leest_.delete(id));
  }

  paint() {
    const knop = this.$(".knop");
    const uid = this.userId_();
    const coach = heeftCoach(this.hass);
    const regel = tegelRegel({ coach, stand: this.stand_, userId: uid, teOud: this.teOud_ });
    const rg = this.$(".rg");
    if (rg.textContent !== regel) rg.textContent = regel;
    const nieuw = coach && allesOngelezen(this.stand_, uid) > 0;
    this.$(".stip").hidden = !nieuw;
    knop.setAttribute("aria-label", regel ? `${this.titel_()}. ${regel}` : this.titel_());
    meetRaster(knop);
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".knop", 1) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-bot-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

class BotEditor extends DacEditor {
  pickers() {
    return [{ key: "icon", kind: "icon", label: t("Icoon"), fallback: "chat", auto: false }];
  }

  schema() {
    return [{ name: "name", selector: sel.text() }];
  }

  helper(s) {
    return s.name === "name" ? t("Leeg laten: Vraag het Coach Assist.") : undefined;
  }
}

/**
 * Een foto kleiner maken, als JPEG. `null` als de browser het beeld niet kan lezen; dan gaat het origineel.
 * Met `imageOrientation` staat een staande telefoonfoto ook staand.
 */
async function verklein(bestand) {
  try {
    const beeld = await createImageBitmap(bestand, { imageOrientation: "from-image" });
    const { breed, hoog } = fotoMaat(beeld.width, beeld.height);
    const doek = document.createElement("canvas");
    doek.width = breed;
    doek.height = hoog;
    doek.getContext("2d").drawImage(beeld, 0, 0, breed, hoog);
    beeld.close?.();
    return await new Promise((klaar) => doek.toBlob(klaar, "image/jpeg", FOTO_KWALITEIT));
  } catch {
    return null;
  }
}

registerEditor("domotiapp-bot-card-editor", BotEditor);
registerCard("domotiapp-bot-card", BotCard, {
  name: nt("DomotiApp Coach Assist"),
  description: nt("Vraag het Coach Assist: de klant stelt een vraag over de installatie, of maakt een ticket voor een storing of een aanvraag, met foto. Werkt via COACH."),
});

export { BotCard };
