/**
 * Het codepaneel: grote toetsen, over het hele scherm.
 *
 * Een code invoeren gebeurt met een jas aan, in de gang, op een tablet aan de
 * muur. Dat is niet het moment voor een invoerveldje van veertien pixels. Dus:
 * hele scherm, toetsen van 72 pixels, en bolletjes die laten zien hoeveel
 * cijfers er staan zonder te verraden wélke.
 *
 * ## Wat dit scherm NIET doet
 *
 * Het controleert geen codes. Het verzamelt cijfers en geeft ze door aan wie hem
 * opende; die roept de service aan en hoort van Home Assistant of het klopte.
 * Dat is geen luiheid maar de enige juiste plek: een code die de kaart zou
 * kennen, staat in de dashboardconfig van de klant, en die is met een rechterklik
 * te lezen. Beveiliging hoort aan de serverkant -- in Alarmo, in de
 * manual-integratie, in het alarmsysteem zelf.
 *
 * ## Waarom het aan `document.body` hangt
 *
 * Zelfde reden als bij het zoekscherm van Music Assistant: een `position: fixed`
 * binnen een dashboardkolom met `transform` lijnt uit tegen die kolom in plaats
 * van tegen het scherm.
 */

import { meldAan } from "./registratie.js";
import { sheet, tokens, baseCss } from "./theme.js";
import { resolve } from "./icons.js";

const TOETSEN = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "wis", "0", "ok"];

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 94%, transparent);
    backdrop-filter: blur(16px);
    display: flex; flex-direction: column; align-items: center;
    padding: max(18px, env(safe-area-inset-top)) 18px max(18px, env(safe-area-inset-bottom));
    animation: op 160ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  header {
    width: 100%; max-width: 420px; flex: 0 0 auto;
    display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
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
  .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
  .rond .icon { width: 18px; height: 18px; }

  .midden {
    flex: 1 1 auto; width: 100%; max-width: 420px;
    display: flex; flex-direction: column; justify-content: center; gap: 18px;
  }

  /* ---- de bolletjes ---- */
  .bolletjes { display: flex; justify-content: center; gap: 12px; min-height: 22px; }
  .bol {
    width: 14px; height: 14px; border-radius: 50%;
    border: 1.6px solid var(--dac-border-hi); background: transparent;
    transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
  }
  .bol[data-vol="true"] {
    background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); transform: scale(1.08);
  }
  /* Zonder vaste lengte weten we niet hoeveel bolletjes er horen: dan telt hij
     mee wat er staat, en blijft er één open staan als plek voor het volgende. */
  .melding {
    min-height: 34px; text-align: center; font-size: 13px; line-height: 1.4;
    color: var(--dac-ink-2);
  }
  .melding.fout { color: var(--dac-bad); font-weight: 600; }
  .melding.bezig { color: var(--dac-ink-3); }

  /* ---- de toetsen ---- */
  .pad {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  .toets {
    height: 72px; cursor: pointer; font: inherit; font-size: 26px; font-weight: 300;
    border-radius: var(--dac-radius); color: var(--dac-ink);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    display: grid; place-items: center;
    transition: background 140ms ease, transform 120ms ease, border-color 140ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .toets:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
  .toets:active { transform: scale(.96); }
  .toets .icon { width: 24px; height: 24px; }
  .toets[data-t="ok"] {
    color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent);
  }
  .toets[data-t="ok"][disabled] { opacity: .35; pointer-events: none; }
  .toets[data-t="wis"] { color: var(--dac-ink-2); }

  /* ---- een paneel met een tekstcode in plaats van cijfers ---- */
  .tekstveld {
    width: 100%; height: 52px; padding: 0 16px; font: inherit; font-size: 17px;
    color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
    outline: none;
  }
  .tekstveld:focus { border-color: var(--dac-accent-hi); }
  .pad[hidden], .tekstveld[hidden], .bolletjes[hidden] { display: none; }

  .bevestig {
    height: 52px; cursor: pointer; font: inherit; font-size: 15px; font-weight: 600;
    border-radius: var(--dac-radius-sm); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 40%, transparent);
  }
  .bevestig[hidden] { display: none; }
`;

class CodePad extends HTMLElement {
  static get sheet_() {
    if (!Object.hasOwn(this, "s_")) this.s_ = sheet(baseCss + css);
    return this.s_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [new.target.sheet_];
    this.code_ = "";
  }

  /**
   * @param {{titel: string, actie: string, soort: "number"|"text",
   *          onOk: (code: string) => Promise<{ok: boolean, fout?: string}>}} opties
   */
  open(opties) {
    this.opties_ = opties;
    if (!this.gebouwd_) this.bouw_();
    this.code_ = "";
    this.bezig_ = false;
    this.setAttribute("open", "");

    this.$(".wie b").textContent = opties.titel;
    this.$(".wie span").textContent = opties.actie;
    const tekst = opties.soort === "text";
    this.$(".pad").hidden = tekst;
    this.$(".bolletjes").hidden = tekst;
    this.$(".tekstveld").hidden = !tekst;
    this.$(".bevestig").hidden = !tekst;
    this.$(".tekstveld").value = "";
    this.melding_("");
    this.teken_();

    this.escape_ ??= (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    };
    document.addEventListener("keydown", this.escape_, true);
    setTimeout(() => (tekst ? this.$(".tekstveld") : this.$('[data-t="1"]'))?.focus(), 60);
  }

  sluit() {
    this.removeAttribute("open");
    this.code_ = "";
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  bouw_() {
    this.gebouwd_ = true;
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Annuleren">${resolve("close")}</button>
        </header>
        <div class="midden">
          <div class="bolletjes" aria-hidden="true"></div>
          <input class="tekstveld" type="password" autocomplete="off" placeholder="Code" hidden />
          <div class="melding" role="status" aria-live="polite"></div>
          <div class="pad">
            ${TOETSEN.map((t) =>
              t === "wis"
                ? `<button class="toets" type="button" data-t="wis" aria-label="Wissen">${resolve("close")}</button>`
                : t === "ok"
                  ? `<button class="toets" type="button" data-t="ok" aria-label="Bevestigen" disabled>${resolve("check")}</button>`
                  : `<button class="toets" type="button" data-t="${t}">${t}</button>`
            ).join("")}
          </div>
          <button class="bevestig" type="button" hidden>Bevestigen</button>
        </div>
      </div>`;

    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".laag").addEventListener("pointerdown", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });

    this.$(".pad").addEventListener("click", (e) => {
      const knop = e.target.closest("[data-t]");
      if (!knop || this.bezig_) return;
      const t = knop.dataset.t;
      if (t === "wis") this.code_ = this.code_.slice(0, -1);
      else if (t === "ok") return this.bevestig_();
      // Een code van meer dan twaalf cijfers bestaat niet; dit voorkomt dat een
      // kind de rij bolletjes van het scherm af tikt.
      else if (this.code_.length < 12) this.code_ += t;
      this.melding_("");
      this.teken_();
    });

    this.$(".bevestig").addEventListener("click", () => {
      this.code_ = this.$(".tekstveld").value;
      this.bevestig_();
    });
    this.$(".tekstveld").addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      this.code_ = this.$(".tekstveld").value;
      this.bevestig_();
    });

    // Op een tablet tik je; op een laptop typ je. Allebei moeten werken.
    this.toets_ = (e) => {
      if (!this.hasAttribute("open") || this.bezig_) return;
      if (this.opties_?.soort === "text") return;
      if (/^[0-9]$/.test(e.key)) {
        if (this.code_.length < 12) this.code_ += e.key;
        this.melding_("");
        this.teken_();
      } else if (e.key === "Backspace") {
        this.code_ = this.code_.slice(0, -1);
        this.teken_();
      } else if (e.key === "Enter") {
        this.bevestig_();
      }
    };
    this.addEventListener("keydown", this.toets_);
    document.addEventListener("keydown", this.toets_);
  }

  teken_() {
    // Eén bolletje per ingevoerd cijfer, plus één open bolletje als plek voor
    // het volgende. Vier vaste bolletjes zou een codelengte beloven die we niet
    // kennen -- Alarmo laat elke lengte toe.
    const n = Math.max(4, this.code_.length + 1);
    this.$(".bolletjes").innerHTML = Array.from(
      { length: n },
      (_, i) => `<span class="bol" data-vol="${i < this.code_.length}"></span>`
    ).join("");
    const ok = this.$('[data-t="ok"]');
    if (ok) ok.disabled = this.code_.length === 0;
  }

  melding_(tekst, soort = "") {
    const el = this.$(".melding");
    el.textContent = tekst;
    el.className = `melding ${soort}`;
  }

  async bevestig_() {
    if (!this.code_ || this.bezig_) return;
    this.bezig_ = true;
    this.melding_("Even kijken…", "bezig");
    let uitkomst = { ok: true };
    try {
      uitkomst = (await this.opties_.onOk(this.code_)) ?? { ok: true };
    } catch (fout) {
      uitkomst = { ok: false, fout: fout?.message ?? "Er ging iets mis." };
    }
    this.bezig_ = false;

    if (uitkomst.ok) {
      this.sluit();
      return;
    }
    // Fout: de code blijft NIET staan. Wie zich vertikt heeft, wil opnieuw
    // beginnen en niet zoeken welk cijfer verkeerd was.
    this.code_ = "";
    this.$(".tekstveld").value = "";
    this.melding_(uitkomst.fout ?? "Dat werkte niet.", "fout");
    this.teken_();
    navigator.vibrate?.([40, 60, 40]);
  }

  disconnectedCallback() {
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
    if (this.toets_) document.removeEventListener("keydown", this.toets_);
    this.gebouwd_ = false;
  }
}

meldAan("domotiapp-codepad", CodePad);

/**
 * Vraag om een code. Eén codepaneel per pagina, net als het zoekscherm.
 *
 * @returns {HTMLElement} het scherm, zodat de aanroeper het kan sluiten
 */
export function vraagCode(opties) {
  let pad = document.querySelector("domotiapp-codepad");
  if (!pad) {
    pad = document.createElement("domotiapp-codepad");
    document.body.appendChild(pad);
  }
  pad.tabIndex = -1;
  pad.open(opties);
  pad.focus?.();
  return pad;
}
