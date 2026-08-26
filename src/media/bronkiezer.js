/**
 * De bronkiezer: welk kanaal, welke ingang, welke app.
 *
 * Een tv-ontvanger heeft geen albums maar zenders. Home Assistant levert die als
 * `source_list` en zet ze om met `media_player.select_source`. Tot nu toe kon je
 * daar alleen bij door op de hoes te tikken, de meer-info-dialoog van HA te
 * openen en daar het uitklapmenu "Bron" te zoeken -- drie handelingen om van
 * NPO 1 naar RTL 4 te gaan.
 *
 * ## Waarom een scherm en geen uitklapmenu
 *
 * De Ziggo-ontvanger van de eigenaar levert **233 bronnen**: alle tv-zenders,
 * alle radiozenders, en alle apps. Een `<select>` daarmee is een lijst waar je
 * doorheen scrollt tot je iets herkent. Dus: een scherm met een zoekveld, en de
 * zender die nu aanstaat bovenaan gemarkeerd.
 *
 * De lijst is één kolom met grote regels. Geen raster met hoesjes zoals het
 * zoekscherm van Music Assistant -- een zender heeft geen hoes, alleen een naam,
 * en dan is een raster van lege vakjes erger dan een lijst.
 *
 * ## Waarom dit in `document.body` hangt
 *
 * Dezelfde reden als bij het zoekscherm: een `position: fixed` binnen een kolom
 * met `overflow` of `transform` wordt tegen die kolom uitgelijnd in plaats van
 * tegen het scherm. Zie de kop van `zoekscherm.js`.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, baseCss } from "../theme.js";
import { resolve } from "../icons.js";
import { stateOf } from "../ha.js";

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
    padding: 0 18px; height: 56px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  .tel {
    flex: 0 0 auto; padding: 0 16px 8px; font-size: 12px; color: var(--dac-ink-3);
  }

  /* ------------------------------------------------------------- de lijst */
  .lijst {
    flex: 1 1 auto; min-height: 0; overflow-y: auto;
    padding: 4px 16px max(20px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 6px;
  }

  .bron {
    display: flex; align-items: center; gap: 14px;
    padding: 0 18px; min-height: 58px; cursor: pointer; text-align: left;
    border-radius: var(--dac-radius); font: inherit; color: inherit;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .bron:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .bron b { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 500;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Waar je nu naar kijkt, staat als eerste en draagt het accent. Zonder die
     markering zoek je in een lijst van 233 namen naar de zender die al aanstaat. */
  .bron[aria-current="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 46%, transparent);
  }
  .bron[aria-current="true"] b { font-weight: 600; }
  .bron .nu {
    flex: 0 0 auto; font-size: 11px; font-weight: 600; letter-spacing: .06em;
    color: var(--dac-accent-hi);
  }
  .bron .icon { width: 18px; height: 18px; flex: 0 0 auto; color: var(--dac-ink-3); }

  .leeg { padding: 40px 8px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
`;

class BronKiezer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [sheet(css + baseCss)];
    this.filter_ = "";
    this.opruimen_ = [];
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
          <span class="wie"><b class="naam"></b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${resolve("search")}
            <input type="search" placeholder="Zoek een zender of app" aria-label="Zoeken" />
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
      this.$(".bron")?.click();
    });
    aan(this, "keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });
    aan(this.$(".lijst"), "click", (e) => {
      const knop = e.target.closest(".bron");
      if (!knop) return;
      this.kies_(knop.dataset.bron);
    });
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  open(hass, entityId, naam) {
    this.hass = hass;
    this.entity_ = entityId;
    this.naam_ = naam;
    this.filter_ = "";
    if (!this.gebouwd_) this.bouw_();
    this.$("input").value = "";
    this.setAttribute("open", "");
    this.teken_();
    // Focus NA deze beurt, en niet nu meteen: `toonBronkiezer` zet de focus
    // daarna op de host (nodig om Escape te vangen) en zou hem hier weer
    // afpakken. Gemeten: de toetsen kwamen wel aan -- isTrusted klopte -- maar
    // landden in de body en het zoekveld bleef leeg.
    //
    // Op een tablet komt hier het schermtoetsenbord door omhoog; dat is gewenst,
    // want typen is sneller dan scrollen door 233 namen.
    setTimeout(() => this.$("input")?.focus(), 60);
  }

  sluit() {
    this.removeAttribute("open");
  }

  /** De bronnen die bij het filter passen, met de huidige altijd bovenaan. */
  bronnen_() {
    const st = stateOf(this.hass, this.entity_);
    const alle = st?.attributes?.source_list ?? [];
    const nu = st?.attributes?.source;
    const passen = this.filter_
      ? alle.filter((b) => String(b).toLowerCase().includes(this.filter_))
      : [...alle];
    passen.sort((a, b) => (a === nu ? -1 : b === nu ? 1 : 0));
    return { lijst: passen, nu, totaal: alle.length };
  }

  teken_() {
    const { lijst, nu, totaal } = this.bronnen_();
    this.$(".naam").textContent = this.naam_ ?? "Bron kiezen";
    this.$(".sub").textContent = nu ? `Nu: ${nu}` : "";
    this.$(".tel").textContent = this.filter_
      ? `${lijst.length} van ${totaal}`
      : `${totaal} bronnen`;

    const lijstEl = this.$(".lijst");
    if (!lijst.length) {
      lijstEl.innerHTML = `<div class="leeg">Niets gevonden.</div>`;
      return;
    }
    lijstEl.innerHTML = lijst
      .map((b) => {
        const veilig = String(b)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        const huidig = b === nu;
        return `<button class="bron" type="button" role="option" data-bron="${veilig}"
                  aria-current="${huidig}" aria-selected="${huidig}">
                  <b>${veilig}</b>${huidig ? `<span class="nu">NU</span>` : ""}
                </button>`;
      })
      .join("");
  }

  kies_(bron) {
    if (!bron || !this.hass) return;
    this.hass.callService("media_player", "select_source", {
      entity_id: this.entity_,
      source: bron,
    });
    // Meteen dicht: je hebt gekozen, en wachten tot de ontvanger het bevestigt
    // duurt bij een tv-kastje seconden.
    this.sluit();
  }
}

meldAan("domotiapp-bron-kiezer", BronKiezer);

/**
 * Het ene bronscherm dat alle mediakaarten delen.
 *
 * Eén per pagina en niet één per kaart, om dezelfde reden als bij het
 * zoekscherm: zes tv-kastjes op een dashboard zouden anders zes volledige
 * schermen in de DOM zetten.
 */
export function toonBronkiezer(hass, entityId, naam) {
  let scherm = document.querySelector("domotiapp-bron-kiezer");
  if (!scherm) {
    scherm = document.createElement("domotiapp-bron-kiezer");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  scherm.open(hass, entityId, naam);
  scherm.focus?.();
  return scherm;
}
