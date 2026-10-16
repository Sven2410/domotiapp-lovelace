/**
 * De QR-code van de wifi groot in beeld, om aan een gast te laten zien.
 *
 * Tik op de wifikaart en de code staat over het hele scherm, met de
 * netwerknaam en (als die is ingevuld) het wachtwoord. Tik ergens of druk op
 * Escape en hij is weg.
 *
 * Hangt aan `document.body`, net als de bevestigingsvraag (`vraag.js`): een
 * `position: fixed` in een pop-up van bubble-card valt anders tegen die pop-up
 * uit en niet tegen het scherm (valkuil 34).
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";

const css = /* css */ `
  ${themaCss}
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 10000;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }
  .laag {
    position: absolute; inset: 0; display: grid; place-items: center; cursor: pointer;
    padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
    background: var(--dac-bg); animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }
  .vak { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; max-width: 100%; }
  /* De QR is een PNG van een paar honderd pixels met zijn eigen witte rand.
     Groot maken zonder vervagen: pixelated. */
  img {
    width: min(72vmin, 520px); height: auto; aspect-ratio: 1; display: block;
    image-rendering: pixelated; border-radius: var(--dac-radius);
  }
  .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--dac-ink-3); }
  .naam { font-size: clamp(22px, 5vmin, 34px); font-weight: 600; letter-spacing: -.01em; }
  .ww { font-size: clamp(16px, 3.4vmin, 22px); color: var(--dac-ink-2); }
  .ww b { color: var(--dac-ink); font-weight: 600; font-variant-numeric: tabular-nums; user-select: all; }
  .hint { font-size: 13px; color: var(--dac-ink-3); }
  [hidden] { display: none !important; }
`;

let sheets = null;

class WifiGroot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.shadowRoot.innerHTML = `
      <div class="laag" role="dialog" aria-modal="true" aria-label="QR-code van de wifi">
        <div class="vak">
          <img alt="QR-code van de wifi" />
          <div class="eyebrow"></div>
          <div class="naam"></div>
          <div class="ww" hidden>Wachtwoord <b></b></div>
          <div class="hint">Richt de camera van je telefoon op de code. Tik om te sluiten.</div>
        </div>
      </div>`;
    this.shadowRoot.querySelector(".laag").addEventListener("click", () => this.sluit());
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.sluit();
    });
  }

  open({ adres, titel, naam, wachtwoord }) {
    volgThema(this);
    const $ = (s) => this.shadowRoot.querySelector(s);
    $("img").src = adres ?? "";
    $(".eyebrow").textContent = titel ?? "";
    $(".naam").textContent = naam ?? "";
    $(".ww").hidden = !wachtwoord;
    $(".ww b").textContent = wachtwoord ?? "";
    this.setAttribute("open", "");
  }

  sluit() {
    this.removeAttribute("open");
  }
}

meldAan("domotiapp-wifi-groot", WifiGroot);

/** Toon de QR-code groot. Eén scherm voor de hele pagina. */
export function toonWifiGroot(gegevens) {
  let scherm = document.querySelector("domotiapp-wifi-groot");
  if (!scherm) {
    scherm = document.createElement("domotiapp-wifi-groot");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(gegevens);
  scherm.focus?.();
}
