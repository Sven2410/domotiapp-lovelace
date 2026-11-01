/**
 * Het scherm om een automatisering te maken of te wijzigen.
 *
 * Hangt aan `document.body` (valkuil 34): de eigenaar zet kaarten in een pop-up
 * van bubble-card, en daar is `position: fixed` niet vast aan het scherm.
 *
 * Anders dan de meldingen heeft dit wél een knop Opslaan: een regel is pas goed
 * als alles is ingevuld, en een lamp die aangaat terwijl je nog aan het kiezen
 * bent is precies wat je niet wilt.
 *
 * Er staat met opzet geen `<select>` in: een stapper voor de verschuiving is op
 * een telefoon één tik, en een keuzelijst is drie tikken en een native kiezer.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";
import { resolve } from "../icons.js";
import { alleSleutels, zoekIconen } from "../editor/icoon-zoek.js";
import { t, tn } from "../taal.js";
import {
  FAVORIET_ICONEN,
  SOORTEN,
  alleenRolluiken,
  dagNamen,
  favorietNaarServer,
  favorietVinkjes,
  groepenUit,
  helderhedenUit,
  isBuiten,
  lampStand,
  lampenGefilterd,
  magDimmen,
  metLamp,
  metSoort,
  metVinkje,
  naarServer,
  nieuweGroep,
  niveauTekst,
  randenVan,
  ruimtesVan,
  schuifNaar,
  startHelderheden,
  stapVerschil,
  terugOproepen,
  verschilTekst,
  voorbeeldDoelen,
  voorbeeldOproepen,
  waaromNiet,
  wielBeurt,
  wielOpzij,
  wissel,
  zonderLamp,
} from "./automatisering-logica.js";

/** Vanaf zoveel lampen staan de zoekbalk en de ruimtes erboven; bij minder zijn ze alleen in de weg. */
const FILTER_VANAF = 6;
/** Zoveel pixels met de muis is slepen en geen klik meer. */
const SLEEP_VANAF = 5;
/** Zo breed vervaagt de rand van de rij ruimtes. */
const RAND = 28;

const css = /* css */ `
  ${themaCss}
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }

  .laag {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    padding:
      max(24px, env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
    background: var(--dac-scrim);
  }

  .vak {
    width: min(640px, 100%);
    max-height: 100%; overflow-y: auto;
    padding: 14px 14px 16px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
    display: flex; flex-direction: column; gap: 14px;
  }
  .vak:focus, .vak:focus-visible { outline: none; }

  header { display: flex; align-items: center; gap: 12px; }
  header b { flex: 1 1 auto; min-width: 0; font-size: 15.5px; font-weight: 700; letter-spacing: -.01em; }
  .kopicoon { flex: 0 0 auto; display: flex; color: var(--dac-accent-hi); }
  .kopicoon .icon { width: 20px; height: 20px; }
  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .sluit:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .sluit .icon { width: 17px; height: 17px; }

  .form { display: flex; flex-direction: column; gap: 14px; }
  .groep { display: flex; flex-direction: column; gap: 8px; }
  .form > .groep + .groep { padding-top: 14px; border-top: 1px solid var(--dac-border); }
  .groep > .kop { font-size: 13px; font-weight: 700; color: var(--dac-ink); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .groep > .kop .kt { display: inline-flex; align-items: center; gap: 7px; min-width: 0; }
  .groep > .kop .icon { width: 16px; height: 16px; --mdc-icon-size: 16px; flex: 0 0 auto; color: var(--dac-accent-hi); }
  .groep > .kop .teller { font-weight: 400; color: var(--dac-ink-2); }
  .opties { display: flex; flex-wrap: wrap; gap: 6px; }

  .keus {
    display: inline-flex; align-items: center; gap: 7px; min-height: 36px; max-width: 100%;
    padding: 0 12px 0 9px; cursor: pointer; font: inherit; font-size: 13px; color: var(--dac-ink-2);
    border-radius: var(--dac-radius-pill); background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .keus:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .keus .icon { width: 15px; height: 15px; flex: 0 0 auto; }
  .keus .tk { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .keus[aria-checked="true"] {
    color: var(--dac-ink);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
  }
  .keus[aria-checked="true"] .icon { color: var(--dac-accent-hi); }

  .dagen { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
  .dag {
    height: 38px; padding: 0; cursor: pointer; font: inherit; font-size: 12.5px; color: var(--dac-ink-2);
    border-radius: 12px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .dag:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .dag[aria-checked="true"] {
    background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent-hi);
  }

  /* Geen display: block op een tijdveld (valkuil 78). */
  .tijd {
    -webkit-appearance: none; appearance: none;
    display: flex; align-items: center; justify-content: center;
    width: 100%; min-width: 0; max-width: 100%; height: 38px;
    font: inherit; font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums;
    color: var(--dac-ink); color-scheme: var(--dac-scheme);
    background-color: rgba(var(--dac-tint), .05);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
    padding: 0 12px; cursor: pointer; text-align: center;
  }
  @media (hover: hover) { .tijd:hover { border-color: var(--dac-border-hi); } }
  .tijd::-webkit-calendar-picker-indicator { display: none; }
  .tijd::-webkit-datetime-edit { padding: 0; }
  .tijd::-webkit-date-and-time-value { margin: 0; min-width: 0; text-align: center; }

  .stapper {
    display: flex; align-items: center; height: 38px;
    background-color: rgba(var(--dac-tint), .05);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .stapper button {
    width: 44px; height: 100%; flex: 0 0 auto; padding: 0; cursor: pointer;
    display: grid; place-items: center; background: none; border: 0; color: var(--dac-ink-2); font: inherit;
    border-radius: var(--dac-radius-pill);
  }
  .stapper button:disabled { opacity: .35; cursor: default; }
  .stapper .icon { width: 15px; height: 15px; }
  .stapper .wat { flex: 1 1 auto; min-width: 0; text-align: center; font-size: 13.5px; font-weight: 500; }

  .naam, .zoek {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 38px; padding: 0 14px;
    font: inherit; font-size: 14px; color: var(--dac-ink); color-scheme: var(--dac-scheme);
    background-color: rgba(var(--dac-tint), .05);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .naam::placeholder, .zoek::placeholder { color: var(--dac-ink-3); }
  @media (hover: hover) { .naam:hover, .zoek:hover { border-color: var(--dac-border-hi); } }
  /* Eén rij die opzij veegt: met een vinger, een touchpad, het muiswiel of slepen. De padding houdt
     de focusring binnen de rij, en de marge haalt die ruimte er weer af. */
  .ruimtes {
    display: flex; gap: 6px; padding: 4px; margin: -4px;
    overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
    -webkit-user-select: none; user-select: none;
    --links: 0px; --rechts: 0px;
    -webkit-mask-image: linear-gradient(to right, transparent, black var(--links), black calc(100% - var(--rechts)), transparent);
    mask-image: linear-gradient(to right, transparent, black var(--links), black calc(100% - var(--rechts)), transparent);
  }
  .ruimtes::-webkit-scrollbar { display: none; }
  .ruimtes[data-links="true"] { --links: ${RAND}px; }
  .ruimtes[data-rechts="true"] { --rechts: ${RAND}px; }
  .ruimtes[data-sleept="true"], .ruimtes[data-sleept="true"] .keus { cursor: grabbing; }
  .ruimtes .keus { flex: 0 0 auto; max-width: none; padding: 0 12px; }
  .lampenlijst {
    display: flex; flex-wrap: wrap; align-content: flex-start; gap: 6px; max-height: max(260px, 42vh); overflow-y: auto;
    padding: 8px; border: 1px solid var(--dac-border); border-radius: 12px; scrollbar-width: thin;
  }
  .niets { font-size: 12.5px; color: var(--dac-ink-3); }

  .hgroep {
    display: flex; flex-direction: column; gap: 6px; padding: 8px 10px;
    border-radius: 12px; border: 1px solid var(--dac-border);
  }
  .hgroep[data-actief="true"] { border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent); }
  .hrij { display: grid; grid-template-columns: 52px minmax(0, 1fr); align-items: center; gap: 8px; min-height: 32px; }
  .hrij.metuit { grid-template-columns: 52px minmax(0, 1fr) auto; }
  .hrij .keus { min-height: 32px; padding: 0 12px; }
  /* Staat de groep al op uit, dan zegt de knop links dat al. De plek blijft, anders verspringt de schuif onder je vinger. */
  .hrij .keus.al-uit { visibility: hidden; }
  .iconen { display: flex; flex-wrap: wrap; gap: 6px; }
  .iconen .keus { width: 42px; height: 38px; padding: 0; justify-content: center; }
  .iconen .icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
  .iconraster { max-height: 240px; overflow-y: auto; align-content: flex-start; scrollbar-width: thin; }

  .vinkjes { display: flex; flex-direction: column; }
  .vinkje {
    display: flex; align-items: center; gap: 11px; min-height: 48px; width: 100%; padding: 6px 2px; text-align: left;
    cursor: pointer; font: inherit; color: var(--dac-ink); background: none; border: 0; border-radius: 10px;
    -webkit-tap-highlight-color: transparent;
  }
  .vinkje[data-onder="true"] { padding-left: 34px; }
  @media (hover: hover) { .vinkje:hover { background: var(--dac-hover); } }
  .vak-v {
    width: 23px; height: 23px; flex: 0 0 auto; display: grid; place-items: center; color: transparent;
    border-radius: 7px; background-color: rgba(var(--dac-tint), .05); border: 1.5px solid var(--dac-border-hi);
  }
  .vak-v .icon { width: 15px; height: 15px; }
  .vinkje[aria-checked="true"] .vak-v { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent-hi); }
  .vt { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .vt b { font-size: 14px; font-weight: 500; }
  .vt small { font-size: 12px; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .allemaal { min-height: 32px; font-size: 12.5px; }
  .pct {
    height: 32px; padding: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
    font-variant-numeric: tabular-nums; color: var(--dac-ink);
    border-radius: var(--dac-radius-pill); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  @media (hover: hover) { .pct:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .hlampen { display: flex; flex-wrap: wrap; gap: 5px; max-height: 100px; overflow-y: auto; scrollbar-width: thin; }
  .lampje {
    display: inline-flex; align-items: center; gap: 5px; min-height: 28px; max-width: 100%; padding: 0 7px 0 10px;
    cursor: pointer; font: inherit; font-size: 12.5px; color: var(--dac-ink-2);
    border-radius: var(--dac-radius-pill); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  @media (hover: hover) { .lampje:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .lampje .tk { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lampje .icon { width: 12px; height: 12px; flex: 0 0 auto; }
  .nieuw {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; cursor: pointer;
    font: inherit; font-size: 13px; color: var(--dac-ink-2);
    border-radius: 12px; background: none; border: 1px dashed var(--dac-border-hi);
  }
  @media (hover: hover) { .nieuw:hover { background: var(--dac-hover); color: var(--dac-ink); } }
  .nieuw .icon { width: 14px; height: 14px; }
  .voorbeeld {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 38px; cursor: pointer;
    font: inherit; font-size: 13.5px; font-weight: 500; color: var(--dac-ink);
    border-radius: 12px; background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  @media (hover: hover) { .voorbeeld:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .voorbeeld .icon { width: 15px; height: 15px; }
  .voorbeeld[aria-pressed="true"] { border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent); }
  .voorbeeld[aria-pressed="true"] .icon { color: var(--dac-accent-hi); }
  input[type="range"] { width: 100%; margin: 0; height: 28px; accent-color: var(--dac-accent-hi); cursor: pointer; }

  .fout { font-size: 12.5px; line-height: 1.4; color: var(--dac-warn); }
  .knoppen { display: flex; gap: 8px; padding-top: 14px; border-top: 1px solid var(--dac-border); }
  .knoppen button {
    flex: 1 1 0; min-height: 42px; padding: 0 14px; cursor: pointer;
    border-radius: 12px; font: inherit; font-size: 14px; font-weight: 500;
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  @media (hover: hover) { .knoppen button:hover:not(:disabled) { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .knoppen .ja { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent-hi); }
  @media (hover: hover) { .knoppen .ja:hover:not(:disabled) { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); } }
  .knoppen button:disabled { opacity: .5; cursor: default; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

const veilig = (tekst) =>
  String(tekst ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

class AutomatiseringScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
    this.concept = null;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="kop" tabindex="-1">
          <header>
            <span class="kopicoon"></span>
            <b id="kop"></b>
            <button class="sluit" type="button">${resolve("close")}</button>
          </header>
          <div class="form"></div>
          <div class="fout" role="status" hidden></div>
          <div class="knoppen">
            <button class="nee" type="button"></button>
            <button class="ja" type="button"></button>
          </div>
        </div>
      </div>`;
    this.gebouwd_ = true;

    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".nee").addEventListener("click", () => this.sluit());
    this.$(".ja").addEventListener("click", () => this.bewaar_());
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });

    const form = this.$(".form");
    form.addEventListener("click", (e) => this.tik_(e.target.closest("[data-k]")));
    form.addEventListener("input", (e) => this.invoer_(e.target));
    form.addEventListener("pointerdown", (e) => this.sleepRij_(e));
    form.addEventListener("scroll", (e) => this.randen_(e.target), true);
    // Op het hele vak, want ook een wiel dat buiten de rij begon, telt mee.
    this.$(".vak").addEventListener("wheel", (e) => this.wiel_(e), { passive: false });
  }

  /** Een muiswiel kan niet opzij; boven de rij doet het dat toch. */
  wiel_(e) {
    const rij = e.target.closest?.(".ruimtes") ?? null;
    this.wielBeurt_ = wielBeurt(this.wielBeurt_, e.timeStamp, Boolean(rij));
    if (!rij || !this.wielBeurt_.inRij) return;
    const stap = wielOpzij(e, rij);
    if (!stap) return;
    e.preventDefault();
    rij.scrollLeft += stap;
  }

  /** Een muis kan niet vegen, dus slepen. Op `window`, zodat het ook buiten de rij doorloopt. */
  sleepRij_(e) {
    const rij = e.target.closest?.(".ruimtes");
    if (!rij || e.pointerType !== "mouse" || e.button !== 0) return;
    const form = this.$(".form");
    const beginX = e.clientX;
    const beginStand = rij.scrollLeft;
    let sleept = false;
    const beweeg = (m) => {
      const weg = m.clientX - beginX;
      if (!sleept && Math.abs(weg) < SLEEP_VANAF) return;
      sleept = true;
      rij.dataset.sleept = "true";
      rij.scrollLeft = beginStand - weg;
    };
    const los = () => {
      window.removeEventListener("pointermove", beweeg, true);
      window.removeEventListener("pointerup", los, true);
      window.removeEventListener("pointercancel", los, true);
      if (!sleept) return;
      delete rij.dataset.sleept;
      // De klik die nu komt is het einde van het slepen, geen keuze.
      const slik = (k) => k.stopPropagation();
      form.addEventListener("click", slik, { capture: true, once: true });
      setTimeout(() => form.removeEventListener("click", slik, true), 50);
    };
    window.addEventListener("pointermove", beweeg, true);
    window.addEventListener("pointerup", los, true);
    window.addEventListener("pointercancel", los, true);
  }

  randen_(rij) {
    if (!rij?.classList?.contains("ruimtes")) return;
    const { links, rechts } = randenVan(rij);
    rij.dataset.links = String(links);
    rij.dataset.rechts = String(rechts);
  }

  /** De gekozen ruimte helemaal in beeld. */
  toonGekozen_() {
    const rij = this.$(".ruimtes");
    const knop = rij?.querySelector('[aria-checked="true"]');
    if (!knop) return;
    rij.scrollLeft += schuifNaar(knop.getBoundingClientRect(), rij.getBoundingClientRect(), RAND);
    this.randen_(rij);
  }

  /**
   * Open het scherm.
   *
   * @param {object} bron de kaart: `lampen_()`, `naamVanLamp_(id)` en `opslaan(regel)`
   * @param {object} regel de regel om te wijzigen, of een nieuwe uit `nieuweRegel`
   */
  open(bron, regel) {
    volgThema(this);
    if (!this.gebouwd_) this.bouw_();
    this.stopVoorbeeld_();
    this.bron = bron;
    this.concept = structuredClone(regel);
    this.concept.helderheden = startHelderheden(regel);
    const groepen = groepenUit(this.concept.lampen, this.concept.helderheden, (id) => this.inGroep_(id));
    this.groepen_ = groepen;
    this.actief_ = Math.max(0, groepen.length - 1);
    this.filter_ = { zoek: "", ruimte: null };
    this.standen_ = {};
    this.foutTekst_ = "";
    this.bezig_ = false;
    this.icoonOpen_ = false;
    this.icoonZoek_ = "";
    // Staat er al een vinkje aan, dan zijn de vinkjes het overzicht en de lampen een stap verder.
    this.aanpassen_ = !regel.favoriet || !this.vinkjes_().some((v) => v.aan);
    let titel = regel.id ? t("Automatisering wijzigen") : t("Nieuwe automatisering");
    if (regel.vakantie) titel = regel.id ? t("Vakantieregel wijzigen") : t("Nieuwe vakantieregel");
    if (regel.favoriet) titel = regel.id ? t("Favoriet wijzigen") : t("Nieuwe favoriet");
    this.$("#kop").textContent = titel;
    this.$(".kopicoon").innerHTML = resolve(regel.favoriet ? "star" : regel.vakantie ? "beach" : "clock");
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".nee").textContent = t("Annuleren");
    this.$(".ja").textContent = t("Opslaan");
    this.setAttribute("open", "");
    this.teken_();
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.stopVoorbeeld_();
    this.removeAttribute("open");
    this.bron = null;
    this.concept = null;
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  /** Staat hij in een groep? Bij een favoriet alles: ook wat geen schuif kent, kan uit of dicht. */
  inGroep_(id) {
    return Boolean(this.concept?.favoriet) || this.dimbaar_(id);
  }

  /** Is er iets om in te stellen? Bij een regel alleen als hij iets aan of open zet. */
  metStand_() {
    return Boolean(this.concept?.favoriet || this.concept?.aan);
  }

  /** De kop van een blok, altijd vet en met een icoon. */
  kop_(icoon, tekst, teller = false) {
    return `<span class="kop"><span class="kt">${resolve(icoon)}<span>${veilig(tekst)}</span></span>${teller ? `<span class="teller"></span>` : ""}</span>`;
  }

  /** Is dit buitenverlichting? Dat zegt de ruimte. */
  buiten_(id) {
    return isBuiten(id, this.bron.hass);
  }

  vinkjes_() {
    return favorietVinkjes(this.concept, this.bron.lampen_(), (id) => this.buiten_(id), (id) => this.bron.naamVanLamp_(id));
  }

  /** De vinkjes van een favoriet. */
  vinkjesHtml_() {
    const vinkjes = this.vinkjes_();
    if (!vinkjes.length) return "";
    const rijen = vinkjes
      .map(
        (v) =>
          `<button type="button" class="vinkje" role="checkbox" aria-checked="${v.aan}" data-onder="${v.onder}" data-k="vinkje:${v.sleutel}"><span class="vak-v">${resolve("check")}</span><span class="vt"><b>${veilig(v.label)}</b><small>${veilig(v.tekst)}</small></span></button>`
      )
      .join("");
    return `<div class="groep">${this.kop_("check", t("Wat moet er gebeuren?"))}<div class="vinkjes">${rijen}</div></div>`;
  }

  /** Krijgt deze lamp een schuif? */
  dimbaar_(id) {
    return magDimmen(id, this.bron.lampen_(), this.bron.hass?.states?.[id]);
  }

  momentHtml_(wat, moment) {
    const keuzes = [...SOORTEN, { sleutel: "geen", label: "Geen", icoon: "close" }]
      .map((s) => {
        const aan = (moment?.soort ?? "geen") === s.sleutel;
        return `<button type="button" class="keus" role="radio" aria-checked="${aan}" data-k="${wat}:${s.sleutel}">${resolve(s.icoon)}<span class="tk">${veilig(t(s.label))}</span></button>`;
      })
      .join("");
    let verder = "";
    if (moment?.soort === "tijd") {
      verder = `<input class="tijd" type="time" data-veld="${wat}" value="${veilig(moment.tijd)}" aria-label="${veilig(t("Tijd"))}" />`;
    } else if (moment) {
      const v = moment.verschil ?? 0;
      verder = `
        <div class="stapper">
          <button type="button" data-k="${wat}:min" aria-label="${veilig(t("Eerder"))}" ${stapVerschil(v, -1) === v ? "disabled" : ""}>${resolve("minus")}</button>
          <span class="wat">${veilig(verschilTekst(v))}</span>
          <button type="button" data-k="${wat}:plus" aria-label="${veilig(t("Later"))}" ${stapVerschil(v, 1) === v ? "disabled" : ""}>${resolve("plus")}</button>
        </div>`;
    }
    const lampen = this.concept.lampen;
    const rolluik = lampen.some((id) => id.startsWith("cover."));
    let kop = wat === "aan" ? t("Aan") : t("Uit");
    if (alleenRolluiken(lampen)) kop = wat === "aan" ? t("Open") : t("Dicht");
    else if (rolluik) kop = wat === "aan" ? t("Aan of open") : t("Uit of dicht");
    return `<div class="groep">${this.kop_(wat === "aan" ? (rolluik ? "shutterOpen" : "bulb") : "power", kop)}<div class="opties" role="radiogroup" aria-label="${veilig(kop)}">${keuzes}</div>${verder}</div>`;
  }

  teken_() {
    const c = this.concept;
    if (!c) return;
    const form = this.$(".form");
    const focus = this.shadowRoot.activeElement?.dataset?.k;
    const lijstScroll = form.querySelector(".lampenlijst")?.scrollTop ?? 0;
    const ruimteScroll = form.querySelector(".ruimtes")?.scrollLeft ?? 0;

    const namen = dagNamen();
    const dagen = namen
      .map(
        (naam, i) =>
          `<button type="button" class="dag" role="checkbox" aria-checked="${(c.dagen ?? []).includes(i)}" data-k="dag:${i}">${veilig(naam)}</button>`
      )
      .join("");

    form.innerHTML = `
      <div class="groep">
        ${this.kop_("pencil", t("Naam"))}
        <input class="naam" type="text" data-naam="1" maxlength="60" value="${veilig(c.naam ?? "")}" placeholder="${veilig(c.favoriet ? t("Bijvoorbeeld Woning verlaten") : t("Bijvoorbeeld Avond beneden"))}" aria-label="${veilig(t("Naam"))}" autocomplete="off" />
      </div>
      ${c.favoriet ? this.iconenHtml_() : ""}
      ${c.favoriet ? this.vinkjesHtml_() : ""}
      ${
        this.aanpassen_
          ? `<div class="groep">
        ${this.kop_(this.lijstIcoon_(), this.lijstKop_(), true)}
        ${this.filterHtml_()}
        <div class="lampenlijst"></div>
      </div>
      ${this.helderheidHtml_()}`
          : `<div class="groep"><button type="button" class="nieuw" data-k="aanpassen:">${resolve("pencil")}${veilig(tn(c.lampen.length, "Lampen aanpassen ({n} gekozen)", "Lampen aanpassen ({n} gekozen)"))}</button></div>`
      }
      ${this.voorbeeldHtml_()}
      ${
        c.favoriet
          ? ""
          : `${this.momentHtml_("aan", c.aan)}
      ${this.momentHtml_("uit", c.uit)}
      <div class="groep">${this.kop_("calendar", t("Dagen"))}<div class="dagen">${dagen}</div></div>`
      }`;
    // De focus terug op dezelfde knop: alles is opnieuw getekend, en zonder
    // dit begint wie met Tab en Spatie werkt na elke keuze weer bovenaan.
    this.tekenLijst_();
    const lijstNu = form.querySelector(".lampenlijst");
    if (lijstNu) lijstNu.scrollTop = lijstScroll;
    if (this.icoonOpen_) this.tekenIconen_();
    const ruimtes = form.querySelector(".ruimtes");
    if (ruimtes) {
      ruimtes.scrollLeft = ruimteScroll;
      this.randen_(ruimtes);
    }
    if (focus) form.querySelector(`[data-k="${CSS.escape(focus)}"]`)?.focus();
    this.kijkNa_();
  }

  /** De zoekbalk en de ruimtes, alleen als de lijst er lang genoeg voor is. */
  filterHtml_() {
    const lampen = this.bron.lampen_();
    if (lampen.length < FILTER_VANAF) return "";
    const ruimtes = ruimtesVan(lampen, this.bron.hass);
    const keus = (waarde, naam) =>
      `<button type="button" class="keus" role="radio" aria-checked="${this.filter_.ruimte === (waarde === "*" ? null : waarde)}" data-k="ruimte:${veilig(waarde)}"><span class="tk">${veilig(naam)}</span></button>`;
    const rij =
      ruimtes.length > 1
        ? `<div class="ruimtes" role="radiogroup" aria-label="${veilig(t("Ruimte"))}">${keus("*", t("Alle"))}${ruimtes.map((r) => keus(r.id, r.naam)).join("")}</div>`
        : "";
    const zoek = lampen.some((l) => l.rolluik) ? t("Zoek een lamp of rolluik") : t("Zoek een lamp");
    return `<input class="zoek" type="search" data-zoek="1" value="${veilig(this.filter_.zoek)}" placeholder="${veilig(zoek)}" aria-label="${veilig(zoek)}" autocomplete="off" />${rij}<button type="button" class="nieuw allemaal" data-k="allemaal:"></button>`;
  }

  lijstIcoon_() {
    return this.bron.lampen_().every((l) => l.rolluik) ? "shutter" : "bulb";
  }

  /** De kop boven de lijst: wat er op deze kaart te kiezen is. */
  lijstKop_() {
    const lampen = this.bron.lampen_();
    if (lampen.every((l) => l.rolluik)) return t("Rolluiken");
    return lampen.some((l) => l.rolluik) ? t("Lampen en rolluiken") : t("Lampen");
  }

  /** De iconen van een favoriet: tikken in plaats van zoeken. */
  iconenHtml_() {
    const c = this.concept;
    // Een icoon uit de grote lijst staat er ook bij, anders is niet te zien wat er gekozen is.
    const rij = FAVORIET_ICONEN.includes(c.icoon) ? FAVORIET_ICONEN : [c.icoon, ...FAVORIET_ICONEN];
    const keuzes = rij.map((naam) => this.icoonKnop_(naam)).join("");
    const meer = `<button type="button" class="keus" aria-expanded="${this.icoonOpen_}" aria-label="${veilig(t("Alle iconen"))}" title="${veilig(t("Alle iconen"))}" data-k="iconenmeer:">${resolve("search")}</button>`;
    const paneel = this.icoonOpen_
      ? `<input class="zoek" type="search" data-icoonzoek="1" value="${veilig(this.icoonZoek_)}" placeholder="${veilig(t("Zoek in alle iconen"))}" aria-label="${veilig(t("Zoek in alle iconen"))}" autocomplete="off" />
         <div class="iconen iconraster" role="radiogroup" aria-label="${veilig(t("Alle iconen"))}"></div>`
      : "";
    return `<div class="groep">${this.kop_("star", t("Icoon"))}<div class="iconen" role="radiogroup" aria-label="${veilig(t("Icoon"))}">${keuzes}${meer}</div>${paneel}</div>`;
  }

  icoonKnop_(naam) {
    return `<button type="button" class="keus" role="radio" aria-checked="${this.concept.icoon === naam}" aria-label="${veilig(naam)}" title="${veilig(naam)}" data-k="icoon:${veilig(naam)}">${resolve(naam)}</button>`;
  }

  /** Al onze eigen iconen, of wat bij het zoekwoord past. Alleen het raster: de zoekbalk blijft staan. */
  tekenIconen_() {
    const raster = this.$(".iconraster");
    if (!raster) return;
    const vraag = this.icoonZoek_.trim();
    const alle = vraag ? zoekIconen(vraag)[0][1] : alleSleutels();
    raster.innerHTML = alle.length
      ? alle.map((naam) => this.icoonKnop_(naam)).join("")
      : `<span class="niets">${veilig(t("Geen icoon gevonden."))}</span>`;
  }

  /** Wat de zoekbalk en de ruimte nu tonen. */
  getoond_() {
    return lampenGefilterd(this.bron.lampen_(), this.filter_, (id) => this.bron.naamVanLamp_(id), this.bron.hass);
  }

  /** Alleen de lijst opnieuw: de zoekbalk blijft staan, met de cursor en het toetsenbord. */
  tekenLijst_() {
    const c = this.concept;
    if (!this.$(".lampenlijst")) return;
    const lijst = this.getoond_();
    const allemaal = this.$(".allemaal");
    if (allemaal) {
      allemaal.textContent = lijst.length && lijst.every((l) => c.lampen.includes(l.entity)) ? t("Niets kiezen") : t("Alles kiezen");
      allemaal.hidden = !lijst.length;
    }
    this.$(".lampenlijst").innerHTML = lijst.length
      ? lijst
          .map(({ entity, rolluik }) => {
            const aan = c.lampen.includes(entity);
            return `<button type="button" class="keus" role="checkbox" aria-checked="${aan}" data-k="lamp:${veilig(entity)}">${resolve(rolluik ? "shutter" : "bulb")}<span class="tk">${veilig(this.bron.naamVanLamp_(entity))}</span></button>`;
          })
          .join("")
      : `<span class="niets">${veilig(t("Geen lamp gevonden."))}</span>`;
    this.$(".teller").textContent = c.lampen.length ? tn(c.lampen.length, "{n} gekozen", "{n} gekozen") : "";
  }

  /** Per helderheid een schuif met zijn lampen, en daaronder de knop voor een nieuwe. */
  helderheidHtml_() {
    const c = this.concept;
    if (!this.metStand_()) return "";
    const alleenRolluik = alleenRolluiken(c.lampen);
    const lampje = (id) => {
      const naam = veilig(this.bron.naamVanLamp_(id));
      return `<button type="button" class="lampje" data-k="weg:${veilig(id)}" aria-label="${veilig(t("{naam} weghalen", { naam: this.bron.naamVanLamp_(id) }))}"><span class="tk">${naam}</span>${resolve("close")}</button>`;
    };
    const groepen = this.groepen_
      .map((g, i) => {
        const inhoud = g.lampen.length
          ? `<div class="hlampen">${g.lampen.map(lampje).join("")}</div>`
          : `<span class="niets">${veilig(t("Kies hierboven de lampen voor deze helderheid."))}</span>`;
        const uit = c.favoriet
          ? `<button type="button" class="keus${g.pct === 0 ? " al-uit" : ""}" data-k="groepuit:${i}"><span class="tk">${veilig(niveauTekst(0, alleenRolluik))}</span></button>`
          : "";
        return `<div class="hgroep" data-actief="${this.groepen_.length > 1 && i === this.actief_}">
          <div class="hrij${c.favoriet ? " metuit" : ""}">
            <button type="button" class="pct" data-k="groep:${i}" aria-label="${veilig(t("Hier lampen bij kiezen"))}">${veilig(niveauTekst(g.pct, alleenRolluik))}</button>
            <input type="range" min="${c.favoriet ? 0 : 1}" max="100" step="1" value="${g.pct}" data-groep="${i}" aria-label="${veilig(t("Helderheid"))}" />
            ${uit}
          </div>
          ${inhoud}
        </div>`;
      })
      .join("");
    const opAanUit = c.favoriet ? [] : c.lampen.filter((id) => !this.dimbaar_(id));
    const vastKop = alleenRolluiken(opAanUit)
      ? t("Alleen open en dicht")
      : opAanUit.some((id) => id.startsWith("cover."))
        ? t("Alleen aan en uit, of open en dicht")
        : t("Alleen aan en uit");
    const vast = opAanUit.length
      ? `<div class="groep">${this.kop_("power", vastKop)}<div class="hlampen">${opAanUit.map(lampje).join("")}</div></div>`
      : "";
    if (!groepen && !vast) return "";
    const heeftLeeg = this.groepen_.some((g) => !g.lampen.length);
    const nieuw =
      this.groepen_.length && !heeftLeeg
        ? `<button type="button" class="nieuw" data-k="nieuw:">${resolve("plus")}${veilig(alleenRolluik ? t("Nieuwe stand") : t("Nieuwe helderheid"))}</button>`
        : "";
    const kop = alleenRolluik ? t("Openingsstand") : c.lampen.some((id) => id.startsWith("cover.")) ? t("Helderheid en stand") : t("Helderheid");
    return `${groepen ? `<div class="groep">${this.kop_(alleenRolluik ? "shutter" : "sun", kop)}${groepen}${nieuw}</div>` : ""}${vast}`;
  }

  /** De knop Voorbeeld: los van de schuiven, want hij hoort er ook als die ingeklapt zijn. */
  voorbeeldHtml_() {
    const c = this.concept;
    if (!this.metStand_() || !c.lampen.length) return "";
    const aan = Boolean(this.voorbeeld_);
    return `<div class="groep"><button type="button" class="voorbeeld" data-k="voorbeeld:" aria-pressed="${aan}">${resolve("bulb")}${veilig(aan ? t("Voorbeeld stoppen") : t("Voorbeeld"))}</button>
      ${aan ? `<span class="niets">${veilig(t("De lampen gaan terug zoals ze stonden als je stopt of dit scherm sluit."))}</span>` : ""}</div>`;
  }

  stuur_(hass, oproepen) {
    for (const [domein, dienst, data] of oproepen) {
      Promise.resolve(hass?.callService(domein, dienst, data)).catch(() => {
        if (!this.concept) return;
        this.foutTekst_ = t("Het voorbeeld is niet gelukt.");
        this.kijkNa_();
      });
    }
  }

  /**
   * Zet de lampen zoals het scherm nu zegt. Hoe een lamp stond onthoudt het scherm
   * zolang het openstaat (`standen_`): vlak na een wijziging loopt `hass` nog achter,
   * en dan zou het voorbeeld zijn eigen stand als beginstand onthouden.
   */
  werkVoorbeeld_() {
    const v = this.voorbeeld_;
    if (!v) return;
    const c = this.concept;
    if (!this.metStand_()) {
      this.stopVoorbeeld_();
      return;
    }
    const hass = this.bron.hass;
    const doelen = voorbeeldDoelen(c.lampen, c.helderheden, (id) => this.dimbaar_(id), hass?.states);
    const eruit = Object.keys(v.gezet).filter((id) => !(id in doelen));
    this.stuur_(hass, terugOproepen(Object.fromEntries(eruit.map((id) => [id, this.standen_[id]]))));
    for (const id of Object.keys(doelen)) {
      if (!(id in this.standen_)) this.standen_[id] = lampStand(hass.states[id]);
    }
    const omgekeerd = this.bron.lampen_().filter((l) => l.omgekeerd).map((l) => l.entity);
    this.stuur_(hass, voorbeeldOproepen(doelen, v.gezet, omgekeerd));
    v.gezet = doelen;
  }

  /** Alles terug. Dit gaat ook bij sluiten en opslaan, want dan is de proef voorbij. */
  stopVoorbeeld_() {
    clearTimeout(this.voorbeeldTimer_);
    const v = this.voorbeeld_;
    if (!v) return;
    this.voorbeeld_ = null;
    const standen = Object.fromEntries(Object.keys(v.gezet).map((id) => [id, this.standen_[id]]));
    this.stuur_(this.bron?.hass, terugOproepen(standen));
  }

  /** De groepen zijn de waarheid in dit scherm; de regel volgt ze. */
  zetGroepen_({ groepen, actief }) {
    this.groepen_ = groepen;
    this.actief_ = actief;
    this.concept.helderheden = helderhedenUit(groepen);
  }

  /** Een lamp kiezen of weghalen: bij een schuif-lamp ook in zijn groep. */
  wisselLamp_(id) {
    const c = this.concept;
    const erbij = !c.lampen.includes(id);
    c.lampen = wissel(c.lampen, id);
    if (!this.inGroep_(id)) return;
    this.zetGroepen_(erbij ? metLamp(this.groepen_, this.actief_, id) : zonderLamp(this.groepen_, this.actief_, id));
  }

  /** Opslaan alleen als het kan, en dan zegt de regel eronder waarom niet. */
  kijkNa_() {
    const reden = waaromNiet(this.concept);
    const fout = this.$(".fout");
    const tekst = this.foutTekst_ || reden || "";
    fout.textContent = tekst;
    fout.hidden = !tekst;
    this.$(".ja").disabled = Boolean(reden) || this.bezig_;
  }

  tik_(knop) {
    if (!knop || !this.concept) return;
    const c = this.concept;
    const [soort, ...rest] = knop.dataset.k.split(":");
    const waarde = rest.join(":");
    if (soort === "vinkje") {
      const nu = this.vinkjes_().find((v) => v.sleutel === waarde);
      this.zetConcept_(metVinkje(c, this.bron.lampen_(), (id) => this.buiten_(id), waarde, !nu?.aan));
    }
    else if (soort === "aanpassen") this.aanpassen_ = true;
    else if (soort === "iconenmeer") this.icoonOpen_ = !this.icoonOpen_;
    else if (soort === "lamp" || soort === "weg") this.wisselLamp_(waarde);
    else if (soort === "ruimte") this.filter_.ruimte = waarde === "*" ? null : waarde;
    else if (soort === "groep") this.actief_ = Number(waarde);
    else if (soort === "nieuw") this.zetGroepen_(nieuweGroep(this.groepen_, this.actief_));
    else if (soort === "icoon") c.icoon = waarde;
    else if (soort === "groepuit") {
      const i = Number(waarde);
      this.groepen_[i] = { ...this.groepen_[i], pct: 0 };
      this.zetGroepen_({ groepen: this.groepen_, actief: i });
    } else if (soort === "allemaal") {
      const getoond = this.getoond_().map((l) => l.entity);
      const allesAl = getoond.every((id) => c.lampen.includes(id));
      for (const id of getoond) if (c.lampen.includes(id) === allesAl) this.wisselLamp_(id);
    }
    else if (soort === "voorbeeld") {
      if (this.voorbeeld_) this.stopVoorbeeld_();
      else this.voorbeeld_ = { gezet: {} };
    }
    else if (soort === "dag") c.dagen = wissel(c.dagen, Number(waarde));
    else if (waarde === "min" || waarde === "plus") {
      c[soort] = { ...c[soort], verschil: stapVerschil(c[soort].verschil, waarde === "min" ? -1 : 1) };
    } else if ((c[soort]?.soort ?? "geen") !== waarde) {
      c[soort] = metSoort(waarde);
    }
    this.foutTekst_ = "";
    this.werkVoorbeeld_();
    this.teken_();
    if (soort === "ruimte") this.toonGekozen_();
  }

  /** Lampen en standen van buitenaf gezet (een vinkje): de groepen volgen. */
  zetConcept_(nieuw) {
    this.concept = nieuw;
    this.groepen_ = groepenUit(nieuw.lampen, nieuw.helderheden, (id) => this.inGroep_(id));
    this.actief_ = Math.max(0, this.groepen_.length - 1);
  }

  /** Typen en schuiven tekenen niet opnieuw: dat haalt het veld onder je vingers weg. */
  invoer_(veld) {
    const c = this.concept;
    if (!c) return;
    if (veld.dataset.icoonzoek) {
      this.icoonZoek_ = veld.value;
      this.tekenIconen_();
      return;
    }
    if (veld.dataset.zoek) {
      this.filter_.zoek = veld.value;
      this.tekenLijst_();
      // De zoekbalk zoekt binnen de gekozen ruimte; die hoort dan niet uit beeld te staan.
      if (this.filter_.ruimte !== null) this.toonGekozen_();
      return;
    }
    if (veld.dataset.naam) {
      c.naam = veld.value;
      return;
    }
    if (veld.dataset.groep != null) {
      const i = Number(veld.dataset.groep);
      const pct = Number(veld.value);
      this.groepen_[i] = { ...this.groepen_[i], pct };
      this.actief_ = i;
      c.helderheden = helderhedenUit(this.groepen_);
      veld.closest(".hrij").querySelector(".pct").textContent = niveauTekst(pct, alleenRolluiken(c.lampen));
      veld.closest(".hrij").querySelector('[data-k^="groepuit:"]')?.classList.toggle("al-uit", pct === 0);
      // Wie schuift, kiest daarmee ook de groep. Geen tekenen: de schuif blijft onder je vinger.
      const meer = this.groepen_.length > 1;
      this.shadowRoot.querySelectorAll(".hgroep").forEach((g, n) => {
        g.dataset.actief = String(meer && n === i);
      });
      // Met een voorbeeld aan volgen de lampen de schuif, maar niet elke pixel.
      clearTimeout(this.voorbeeldTimer_);
      if (this.voorbeeld_) this.voorbeeldTimer_ = setTimeout(() => this.werkVoorbeeld_(), 250);
    } else if (veld.dataset.veld) {
      c[veld.dataset.veld] = { soort: "tijd", tijd: veld.value };
    } else {
      return;
    }
    this.foutTekst_ = "";
    this.kijkNa_();
  }

  async bewaar_() {
    if (!this.concept || waaromNiet(this.concept) || this.bezig_) return;
    this.bezig_ = true;
    this.kijkNa_();
    try {
      const dimt = (id) => this.dimbaar_(id);
      if (this.concept.favoriet) await this.bron.opslaanFavoriet(favorietNaarServer(this.concept, dimt));
      else await this.bron.opslaan(naarServer(this.concept, dimt));
      this.sluit();
    } catch (fout) {
      this.bezig_ = false;
      this.foutTekst_ = fout?.message || t("Opslaan is niet gelukt.");
      if (this.concept) this.kijkNa_();
    }
  }
}

meldAan("domotiapp-automatisering-scherm", AutomatiseringScherm);

/** Open het ene scherm van deze pagina. */
export function toonAutomatiseringScherm(kaart, regel) {
  let scherm = document.querySelector("domotiapp-automatisering-scherm");
  if (!scherm) {
    scherm = document.createElement("domotiapp-automatisering-scherm");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(kaart, regel);
  return scherm;
}

export const automatiseringScherm = () => document.querySelector("domotiapp-automatisering-scherm");
