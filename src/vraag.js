/**
 * "Weet je het zeker?" -- de bevestiging voor een actie waar je niet zomaar op
 * wilt drukken.
 *
 * WAAROM DIT ER ZELF STAAT EN NIET DE DIALOOG VAN HOME ASSISTANT IS
 *
 * Home Assistant heeft er een: `dialog-box`, geopend met een `show-dialog`-
 * signaal. Dat was ook de eerste opzet. Maar dat element wordt LUI GELADEN, en
 * op 26 augustus 2026 is in de testinstance gemeten dat het op een vers geladen
 * dashboard helemaal niet gedefinieerd is:
 *
 *     customElements.get("dialog-box")   ->  undefined
 *
 * De dialoogbeheerder van HA doet dan `document.createElement("dialog-box")` op
 * een element dat niet bestaat, en er gebeurt niets. Een herstartknop die soms
 * wel en soms geen vraag stelt is precies het soort ding dat je één keer op de
 * verkeerde manier ontdekt. Vandaar een eigen scherm: het is er altijd, het is
 * klein, en het draagt de vormtaal van de rest van de familie.
 *
 * Net als het zoekscherm en de bronkiezer hangt hij aan `document.body`: een
 * `position: fixed` binnen een kolom met `overflow` of `transform` wordt tegen
 * die kolom uitgelijnd in plaats van tegen het scherm.
 */

import { meldAan } from "./registratie.js";
import { meldVraagAan } from "./ha.js";
import { sheet, tokens } from "./theme.js";

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 10000;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  /* DIT was waarom het vak op een telefoon niet paste, en niet de maten.
     Zonder deze regel telt de padding NIET mee in de breedte, dus een vak van
     "min(420px, 100%)" werd op een scherm van 390 CSS-pixels 350 + 44 padding
     + 2 rand = 396 breed, in een laag die er maar 350 te geven had. Het liep
     dus over zijn eigen marge heen en raakte allebei de schermranden. Gemeten
     op 26 augustus 2026: 466 breed in een venster van 500. */
  *, *::before, *::after { box-sizing: border-box; }

  /* De marge om het vak heen is wat een dialoog op een telefoon een dialoog
     laat lijken in plaats van een tweede scherm. De inkeping van het toestel
     telt mee: op een telefoon met een ronde hoek of een balk onderin valt een
     vak dat tot de rand loopt daar deels achter. */
  .laag {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    padding:
      max(24px, env(safe-area-inset-top))
      max(24px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(24px, env(safe-area-inset-left));
    background: color-mix(in srgb, #000 58%, transparent);
    animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* 340px en niet 420: op een telefoon van 390 CSS-pixels breed werd dat vak
     zo goed als schermbreed, en dan leest een vraag als een pagina. Gemeld op
     26 augustus 2026 met een schermafdruk van de herstartvraag. De maten
     eronder zijn in dezelfde slag kleiner geworden: een vraag van twee regels
     hoort geen kaart van een halve telefoon te zijn. */
  .vak {
    width: min(340px, 100%);
    max-width: 100%;
    padding: 16px 18px 14px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,.7);
    animation: omhoog 160ms ease;
  }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  h2 { margin: 0 0 6px; font-size: 15.5px; font-weight: 600; letter-spacing: -.01em; }
  p { margin: 0; font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); }

  .knoppen { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  button {
    padding: 7px 14px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
    border-radius: var(--dac-radius-pill); border: 1px solid var(--dac-border);
    background: transparent; color: var(--dac-ink-2);
  }
  @media (hover: hover) { button:hover { background: var(--dac-surface); color: var(--dac-ink); } }
  button.ja {
    border-color: transparent; color: #0c0c0a;
    background: var(--dac-accent-hi);
  }
  @media (hover: hover) { button.ja:hover { background: var(--dac-accent-hi); filter: brightness(1.08); } }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

const veilig = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

class Vraag extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak">
          <h2></h2>
          <p></p>
          <div class="knoppen">
            <button type="button" class="nee"></button>
            <button type="button" class="ja"></button>
          </div>
        </div>
      </div>`;
    this.gebouwd_ = true;

    this.$(".nee").addEventListener("click", () => this.klaar_(false));
    this.$(".ja").addEventListener("click", () => this.klaar_(true));
    // Naast het vak klikken is hetzelfde als annuleren. Niet hetzelfde als OK:
    // een misklik mag nooit "ja" betekenen.
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.klaar_(false);
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.klaar_(false);
    });
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  open(vraag) {
    if (!this.gebouwd_) this.bouw_();
    this.$("h2").innerHTML = veilig(vraag.title ?? "Weet je het zeker?");
    this.$("p").innerHTML = veilig(vraag.text ?? "Weet je zeker dat je dit wilt doen?");
    this.$(".nee").textContent = vraag.dismissText ?? "Annuleren";
    this.$(".ja").textContent = vraag.confirmText ?? "OK";
    this.setAttribute("open", "");
    // De focus op ANNULEREN en niet op OK: wie op Enter ramt hoort niets
    // onomkeerbaars te doen.
    setTimeout(() => this.$(".nee")?.focus(), 40);
    return new Promise((klaar) => {
      this.antwoord_ = klaar;
    });
  }

  klaar_(ja) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    const fn = this.antwoord_;
    this.antwoord_ = null;
    fn?.(ja);
  }
}

meldAan("domotiapp-vraag", Vraag);

/**
 * Stel de vraag en wacht op het antwoord.
 *
 * Eén scherm voor de hele pagina, net als bij het zoekscherm en de bronkiezer.
 *
 * @returns {Promise<boolean>}
 */
export function vraagBevestiging(vraag = {}) {
  let scherm = document.querySelector("domotiapp-vraag");
  if (!scherm) {
    scherm = document.createElement("domotiapp-vraag");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  const belofte = scherm.open(vraag);
  scherm.focus?.();
  return belofte;
}

// Zo weet `runAction` in ha.js dat hij iets te vragen heeft. Zie de opmerking
// bij `meldVraagAan` daar voor waarom het deze kant op loopt.
meldVraagAan(vraagBevestiging);
