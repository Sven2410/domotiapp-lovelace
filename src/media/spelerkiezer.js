/**
 * De speakerkiezer: op welke speler speelt dit af?
 *
 * Gevraagd op 26 augustus 2026: de mediakaart mag een ALGEMENE mediaspeler
 * worden, "een soort sonos card" -- één kaart waarop je kiest waar de muziek
 * heen gaat, in plaats van een kaart per speaker.
 *
 * ## Waarom een scherm en geen uitklapmenu
 *
 * Dezelfde afweging als bij de bronkiezer ernaast: een `<select>` toont namen
 * en verder niets, en juist bij speakers is de TOESTAND het halve antwoord.
 * Welke speelt er al iets? Welke staat uit? Dat wil je zien voordat je kiest,
 * niet erna. Vandaar een lijst met per regel de naam en wat er speelt.
 *
 * ## Kiezen en koppelen op ÉÉN scherm
 *
 * Sinds 0.21.0 zit het koppelen hier ook. Tot dan kon je op een algemene
 * mediakaart wel groeperen, maar alleen via de zoekknop -- een scherm verder dan
 * de speakerkiezer, en dus precies niet waar je het zoekt. Een echte Sonos-kaart
 * doet kiezen én koppelen naast elkaar, en dat was de openstaande wens.
 *
 * De twee handelingen zijn met opzet UIT ELKAAR getrokken en niet samengevoegd:
 *
 * - **op de regel tikken** kiest waar de kaart over gaat. De rest van de kaart
 *   bedient daarna die speler.
 * - **op het schakelaartje rechts tikken** laat die speaker meespelen met wat er
 *   nu speelt, of haalt hem eruit. Het scherm blijft dan open, want koppelen doe
 *   je zelden één voor één -- je zet de keuken erbij, en dan de tuin.
 *
 * Ze samenvoegen tot "tikken = ook koppelen" zou betekenen dat je niet meer naar
 * een andere speaker kunt overstappen zonder de eerste mee te slepen.
 *
 * ## Waarom dit in `document.body` hangt
 *
 * Zelfde reden als bij het zoekscherm en de bronkiezer: een `position: fixed`
 * binnen een kolom met `overflow` of `transform` wordt tegen die kolom
 * uitgelijnd in plaats van tegen het scherm. Zie de kop van `zoekscherm.js`.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens } from "../theme.js";
import { resolve } from "../icons.js";
import { localizeState, nameOf, stateOf } from "../ha.js";
import { isSpelend, isUit, mediaIcoon, watSpeeltEr } from "../cards/media-logica.js";
import { koppelOproep, koppelStand } from "./koppelen.js";

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 92%, transparent);
    backdrop-filter: blur(14px);
    display: flex; flex-direction: column;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  header {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 16px 12px;
    border-bottom: 1px solid var(--dac-border);
  }
  header .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  header .wie b { font-size: 15px; font-weight: 600; }
  header .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .rond {
    flex: 0 0 auto; width: 38px; height: 38px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 18px; height: 18px; }

  .zoek { flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center; }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; height: 52px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  /* Bij vier speakers is een zoekveld overbodig en in de weg. */
  .zoek[hidden] { display: none; }

  .tel { flex: 0 0 auto; padding: 4px 18px 8px; font-size: 12px; color: var(--dac-ink-3); }

  .lijst {
    flex: 1 1 auto; min-height: 0; overflow-y: auto;
    padding: 0 12px max(16px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 8px;
  }

  .sp {
    display: flex; align-items: center; gap: 14px; width: 100%;
    padding: 12px 14px; cursor: pointer; text-align: left; font: inherit;
    border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
    color: var(--dac-ink);
  }
  @media (hover: hover) { .sp:hover { background: var(--dac-surface-hi); } }
  .sp[aria-current="true"] { border-color: var(--dac-accent-hi); }

  .sp .ico {
    flex: 0 0 auto; width: 38px; height: 38px; display: grid; place-items: center;
    border-radius: var(--dac-radius-sm); background: var(--dac-bg-raise);
    color: var(--dac-ink-2);
  }
  .sp[data-speelt="true"] .ico { color: var(--dac-accent-hi); }
  .sp .ico .icon { width: 19px; height: 19px; }

  .sp .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .sp .tekst b { font-size: 14.5px; font-weight: 500;
                 white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp .tekst span { font-size: 12px; color: var(--dac-ink-2);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp[data-uit="true"] .tekst span { color: var(--dac-ink-3); }

  .sp .nu {
    flex: 0 0 auto; font-size: 10px; font-weight: 700; letter-spacing: .1em;
    padding: 3px 8px; border-radius: var(--dac-radius-pill);
    background: color-mix(in srgb, var(--dac-accent) 24%, transparent);
    color: var(--dac-accent-hi);
  }

  /* ---- meespelen ----
     Een eigen knop naast de regel en niet erin: een knop in een knop bestaat
     niet in HTML, en een tik hierop moet iets ánders doen dan een tik op de
     regel. Dezelfde afspraak als bij het hartje in het zoekscherm. */
  .rij { display: flex; align-items: stretch; gap: 8px; }
  .rij .sp { flex: 1 1 auto; min-width: 0; }
  .mee {
    flex: 0 0 auto; width: 52px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    cursor: pointer; padding: 0; font: inherit;
    border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
    color: var(--dac-ink-3);
    transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  .mee .icon { width: 17px; height: 17px; }
  .mee span { font-size: 9px; letter-spacing: .04em; }
  .mee[aria-pressed="true"] {
    color: var(--dac-accent-hi);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
  }
  .mee:disabled { opacity: .3; cursor: default; }
  .mee[hidden] { display: none; }
  @media (hover: hover) { .mee:not(:disabled):hover { border-color: var(--dac-border-hi); } }

  .leeg { padding: 28px 16px; text-align: center; color: var(--dac-ink-3); font-size: 13px; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

const veilig = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

class SpelerKiezer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.opruimen_ = [];
    this.filter_ = "";
    this.lijst_ = [];
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  disconnectedCallback() {
    for (const fn of this.opruimen_) fn();
    this.opruimen_ = [];
    this.gebouwd_ = false;
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <header>
          <span class="wie"><b class="naam">Speaker kiezen</b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${resolve("search")}
            <input type="search" placeholder="Zoek een speaker" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`;
    this.gebouwd_ = true;

    const aan = (el, type, fn) => {
      el.addEventListener(type, fn);
      this.opruimen_.push(() => el.removeEventListener(type, fn));
    };

    aan(this.$(".sluit"), "click", () => this.sluit());
    // Buiten de lijst klikken sluit; de kop en de lijst vangen hun eigen kliks.
    aan(this.$(".laag"), "click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    aan(this.$("input"), "input", (e) => {
      this.filter_ = e.target.value.trim().toLowerCase();
      this.teken_();
    });
    // Enter kiest de bovenste treffer: wie typt wil niet ook nog mikken.
    aan(this.$("input"), "keydown", (e) => {
      if (e.key !== "Enter") return;
      this.$(".sp")?.click();
    });
    aan(this, "keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });
    aan(this.$(".lijst"), "click", (e) => {
      // Eerst de koppelknop: die ligt naast de regel, dus zonder deze toets
      // wint straks alsnog de regel als er ooit iets aan de opmaak verandert.
      const mee = e.target.closest(".mee");
      if (mee) {
        e.stopPropagation();
        return this.koppel_(mee.dataset.id);
      }
      const knop = e.target.closest(".sp");
      if (!knop) return;
      this.kies_(knop.dataset.id);
    });
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  /**
   * Elke nieuwe `hass` tekent het scherm opnieuw, zolang het openstaat.
   *
   * Dat is nodig sinds hier gekoppeld kan worden: `group_members` verandert pas
   * als de speakers het bevestigd hebben, en zonder deze setter zou de knop op
   * "ERBIJ" blijven staan terwijl de speaker allang meespeelt. De mediakaart
   * geeft zijn `hass` door in `paint()`, net als bij het zoekscherm.
   */
  set hass(hass) {
    this.hass_ = hass;
    if (this.hasAttribute("open") && this.gebouwd_) this.teken_();
  }

  get hass() {
    return this.hass_;
  }

  open(hass, lijst, huidig, opKeuze) {
    this.hass_ = hass;
    this.lijst_ = Array.isArray(lijst) ? lijst : [];
    this.huidig_ = huidig;
    this.opKeuze_ = opKeuze;
    this.filter_ = "";
    if (!this.gebouwd_) this.bouw_();
    this.$("input").value = "";
    // Zoeken heeft pas zin als er meer namen zijn dan je in één blik ziet.
    this.$(".zoek").hidden = this.lijst_.length < 8;
    this.setAttribute("open", "");
    this.teken_();
    if (!this.$(".zoek").hidden) setTimeout(() => this.$("input")?.focus(), 60);
  }

  sluit() {
    this.removeAttribute("open");
  }

  teken_() {
    const alle = this.lijst_;
    const passen = this.filter_
      ? alle.filter((id) => String(nameOf(this.hass, id)).toLowerCase().includes(this.filter_))
      : [...alle];

    this.$(".sub").textContent = this.huidig_ ? `Nu: ${nameOf(this.hass, this.huidig_)}` : "";
    this.$(".tel").textContent = this.filter_
      ? `${passen.length} van ${alle.length}`
      : `${alle.length} speaker${alle.length === 1 ? "" : "s"}`;

    const lijstEl = this.$(".lijst");
    if (!passen.length) {
      lijstEl.innerHTML = `<div class="leeg">Niets gevonden.</div>`;
      return;
    }

    lijstEl.innerHTML = passen
      .map((id) => {
        const st = stateOf(this.hass, id);
        const huidig = id === this.huidig_;
        const wat = isUit(st) ? "Uit" : watSpeeltEr(st, (x) => localizeState(this.hass, x));
        const stand = koppelStand(this.hass, id, this.huidig_);
        const mee = stand === "mee";
        return `<div class="rij">
                  <button class="sp" type="button" role="option" data-id="${veilig(id)}"
                    data-speelt="${isSpelend(st)}" data-uit="${isUit(st)}"
                    aria-current="${huidig}" aria-selected="${huidig}">
                    <span class="ico">${resolve(mediaIcoon(st), "speaker")}</span>
                    <span class="tekst">
                      <b>${veilig(nameOf(this.hass, id))}</b>
                      <span>${veilig(mee ? `${wat} · speelt mee` : wat)}</span>
                    </span>
                    ${huidig ? `<span class="nu">NU</span>` : ""}
                  </button>
                  <button class="mee" type="button" data-id="${veilig(id)}"
                    aria-pressed="${mee}" ${stand === "zelf" || stand === "kan-niet" ? "disabled" : ""}
                    ${stand === "zelf" ? "hidden" : ""}
                    aria-label="${mee ? "Laat deze speaker niet meer meespelen" : "Laat deze speaker meespelen"}"
                    title="${
                      stand === "kan-niet"
                        ? "Deze speaker laat zich niet koppelen"
                        : mee
                          ? "Speelt mee — tik om los te koppelen"
                          : "Laat meespelen met wat er nu speelt"
                    }">
                    ${resolve(mee ? "volume" : "speakers")}<span>${mee ? "MEE" : "ERBIJ"}</span>
                  </button>
                </div>`;
      })
      .join("");
  }

  /**
   * Laat deze speaker meespelen, of haal hem eruit.
   *
   * Het scherm blijft OPEN, anders dan bij het kiezen. Koppelen doe je zelden
   * één voor één: je zet de keuken erbij, en dan de tuin. Elke keer opnieuw het
   * scherm moeten openen is precies waarom dit eerst achter de zoekknop zat en
   * niemand het vond.
   */
  koppel_(id) {
    const oproep = koppelOproep(this.hass, id, this.huidig_);
    if (!oproep) return;
    this.hass.callService(oproep.domein, oproep.service, oproep.data, oproep.doel);
    // Home Assistant meldt de nieuwe groep pas als de speakers het bevestigd
    // hebben. Tot die tijd blijft de knop staan zoals hij stond; de volgende
    // `hass` tekent het scherm opnieuw.
  }

  kies_(id) {
    if (!id) return;
    this.opKeuze_?.(id);
    // Meteen dicht: je hebt gekozen, en de kaart eronder bouwt zich al om.
    this.sluit();
  }
}

meldAan("domotiapp-speler-kiezer", SpelerKiezer);

/**
 * Het ene speakerscherm dat alle mediakaarten delen.
 *
 * Eén per pagina en niet één per kaart, om dezelfde reden als bij het
 * zoekscherm en de bronkiezer: zes mediakaarten op een dashboard zouden anders
 * zes volledige schermen in de DOM zetten.
 */
export function toonSpelerKiezer(hass, lijst, huidig, opKeuze) {
  let scherm = document.querySelector("domotiapp-speler-kiezer");
  if (!scherm) {
    scherm = document.createElement("domotiapp-speler-kiezer");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  scherm.open(hass, lijst, huidig, opKeuze);
  scherm.focus?.();
  return scherm;
}
