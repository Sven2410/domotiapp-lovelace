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
import { t } from "../taal.js";
import {
  SOORTEN,
  dagNamen,
  magDimmen,
  metSoort,
  naarServer,
  startHelderheden,
  stapVerschil,
  verschilTekst,
  waaromNiet,
  wissel,
} from "./automatisering-logica.js";

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
    width: min(420px, 100%);
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
  header b { flex: 1 1 auto; min-width: 0; font-size: 15.5px; font-weight: 600; letter-spacing: -.01em; }
  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .sluit:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .sluit .icon { width: 17px; height: 17px; }

  .form { display: flex; flex-direction: column; gap: 14px; }
  .groep { display: flex; flex-direction: column; gap: 7px; }
  .groep > .kop { font-size: 12px; color: var(--dac-ink-2); display: flex; justify-content: space-between; }
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

  .hrij { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr) 38px; align-items: center; gap: 8px; min-height: 32px; }
  .hrij .wie { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hrij .pct { font-size: 12.5px; text-align: right; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; }
  input[type="range"] { width: 100%; margin: 0; height: 28px; accent-color: var(--dac-accent-hi); cursor: pointer; }

  .fout { font-size: 12.5px; line-height: 1.4; color: var(--dac-warn); }
  .knoppen { display: flex; gap: 8px; }
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
    this.bron = bron;
    this.concept = structuredClone(regel);
    this.concept.helderheden = startHelderheden(regel);
    // Een lamp die erbij komt, begint op wat er het laatst is ingesteld.
    this.laatste_ = 100;
    this.foutTekst_ = "";
    this.bezig_ = false;
    let titel = regel.id ? t("Automatisering wijzigen") : t("Nieuwe automatisering");
    if (regel.vakantie) titel = regel.id ? t("Vakantieregel wijzigen") : t("Nieuwe vakantieregel");
    this.$("#kop").textContent = titel;
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".nee").textContent = t("Annuleren");
    this.$(".ja").textContent = t("Opslaan");
    this.setAttribute("open", "");
    this.teken_();
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.removeAttribute("open");
    this.bron = null;
    this.concept = null;
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
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
    const kop = wat === "aan" ? t("Aan") : t("Uit");
    return `<div class="groep"><span class="kop">${veilig(kop)}</span><div class="opties" role="radiogroup" aria-label="${veilig(kop)}">${keuzes}</div>${verder}</div>`;
  }

  teken_() {
    const c = this.concept;
    if (!c) return;
    const form = this.$(".form");
    const focus = this.shadowRoot.activeElement?.dataset?.k;

    const lampen = this.bron
      .lampen_()
      .map(({ entity }) => {
        const aan = c.lampen.includes(entity);
        return `<button type="button" class="keus" role="checkbox" aria-checked="${aan}" data-k="lamp:${veilig(entity)}">${resolve("bulb")}<span class="tk">${veilig(this.bron.naamVanLamp_(entity))}</span></button>`;
      })
      .join("");
    const namen = dagNamen();
    const dagen = namen
      .map(
        (naam, i) =>
          `<button type="button" class="dag" role="checkbox" aria-checked="${c.dagen.includes(i)}" data-k="dag:${i}">${veilig(naam)}</button>`
      )
      .join("");

    const schuiven = c.aan
      ? c.lampen
          .filter((id) => this.dimbaar_(id))
          .map((id) => {
            const pct = c.helderheden[id] ?? 100;
            const naam = veilig(this.bron.naamVanLamp_(id));
            return `<div class="hrij">
              <span class="wie">${naam}</span>
              <input type="range" min="1" max="100" step="1" value="${pct}" data-lamp="${veilig(id)}" aria-label="${veilig(t("Helderheid"))}: ${naam}" />
              <span class="pct">${pct}%</span>
            </div>`;
          })
          .join("")
      : "";

    form.innerHTML = `
      <div class="groep"><span class="kop">${veilig(t("Lampen"))}</span><div class="opties">${lampen}</div></div>
      ${schuiven ? `<div class="groep"><span class="kop">${veilig(t("Helderheid"))}</span>${schuiven}</div>` : ""}
      ${this.momentHtml_("aan", c.aan)}
      ${this.momentHtml_("uit", c.uit)}
      <div class="groep"><span class="kop">${veilig(t("Dagen"))}</span><div class="dagen">${dagen}</div></div>`;
    // De focus terug op dezelfde knop: alles is opnieuw getekend, en zonder
    // dit begint wie met Tab en Spatie werkt na elke keuze weer bovenaan.
    if (focus) form.querySelector(`[data-k="${focus}"]`)?.focus();
    this.kijkNa_();
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
    if (soort === "lamp") {
      if (!c.lampen.includes(waarde)) c.helderheden[waarde] ??= this.laatste_;
      c.lampen = wissel(c.lampen, waarde);
    }
    else if (soort === "dag") c.dagen = wissel(c.dagen, Number(waarde));
    else if (waarde === "min" || waarde === "plus") {
      c[soort] = { ...c[soort], verschil: stapVerschil(c[soort].verschil, waarde === "min" ? -1 : 1) };
    } else if ((c[soort]?.soort ?? "geen") !== waarde) {
      c[soort] = metSoort(waarde);
    }
    this.foutTekst_ = "";
    this.teken_();
  }

  /** Typen en schuiven tekenen niet opnieuw: dat haalt het veld onder je vingers weg. */
  invoer_(veld) {
    const c = this.concept;
    if (!c) return;
    if (veld.dataset.lamp) {
      const pct = Number(veld.value);
      c.helderheden[veld.dataset.lamp] = pct;
      this.laatste_ = pct;
      veld.closest(".hrij").querySelector(".pct").textContent = `${pct}%`;
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
      await this.bron.opslaan(naarServer(this.concept, (id) => this.dimbaar_(id)));
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
