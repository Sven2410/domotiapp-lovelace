/**
 * De pop-up achter het potlood op de meldingenkaart: welke meldingen krijgt
 * deze persoon?
 *
 * Gevraagd op 26 september 2026: *"als je op het potlootje klikt (...) Dat hij
 * dan een pop up opent van die persoon en dat je dan vinkjes kan aan en uit
 * zetten."* Per soort melding één regel met een vinkje. Voorlopig staat er
 * alleen Afvalmeldingen; een volgende soort is een regel erbij.
 *
 * ## Wat er WEL en NIET in staat
 *
 * Alleen wat deze persoon zelf beslist: aan of uit. De instellingen van een
 * soort -- welke sensor, hoe laat -- staan in de editor van de kaart, want die
 * gelden voor iedereen. Onder elke soort staat wel wat er komt ("Morgen GFT ·
 * melding om 19:30"): dat stond eerst in de kop van de kaart, en die kop is
 * weg.
 *
 * Een vinkje werkt meteen, zonder Opslaan. Dat deed de schakelaar op de kaart
 * ook, en een pop-up waarin je iets aanvinkt en die je daarna wegtikt zonder dat
 * het bewaard is, is een valkuil voor iedereen die niet weet dat er een knop
 * onderaan staat.
 *
 * ## Waarom dit in `document.body` hangt
 *
 * Valkuil 34: in een pop-up van bubble-card is `position: fixed` niet vast aan
 * het scherm, want die pop-up schuift open met een `transform`. De eigenaar zet
 * deze kaart juist in zo'n pop-up. Eén scherm per pagina, net als de
 * bevestigingsvraag en de bronkiezer.
 *
 * ## Wie het scherm vult
 *
 * De KAART. Het scherm vraagt bij elke tekening `inhoud(persoon)` aan de kaart
 * die het opende, en een vinkje gaat terug via `zet(soort, persoon, aan)`. Zo
 * is er één plek die de stand van de server kent, en tekent het scherm opnieuw
 * zodra die verandert -- ook als iemand anders op een andere telefoon hetzelfde
 * vinkje omzet.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens } from "../theme.js";
import { resolve } from "../icons.js";

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  /* Zonder deze regel telt de padding niet mee in de breedte, en loopt het vak
     op een telefoon over de schermranden (valkuil 29). */
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
    background: color-mix(in srgb, #000 58%, transparent);
    animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  .vak {
    width: min(380px, 100%);
    max-height: 100%; overflow-y: auto;
    padding: 14px 14px 16px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,.7);
    display: flex; flex-direction: column; gap: 12px;
    animation: omhoog 160ms ease;
  }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  header { display: flex; align-items: center; gap: 12px; }
  .foto {
    width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%; overflow: hidden;
    display: grid; place-items: center;
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .foto .icon { width: 22px; height: 22px; }
  .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  .wie b {
    font-size: 15.5px; font-weight: 600; letter-spacing: -.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .sluit:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .sluit .icon { width: 17px; height: 17px; }

  /* Een storing en geen status: zonder telefoon krijgt deze persoon niets, hoe
     de vinkjes ook staan. Dat staat er dus altijd, en in de kleur van "let op". */
  .storing {
    font-size: 12.5px; line-height: 1.4; color: var(--dac-warn);
    padding: 9px 12px; border-radius: 12px;
    background: color-mix(in srgb, var(--dac-warn) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-warn) 30%, transparent);
  }

  .lijst { display: flex; flex-direction: column; gap: 8px; }

  /* Een regel per soort. Een div met role=checkbox en geen <button>: in een
     button is een tekst van twee regels geen echte flexcontainer (valkuil 43). */
  .soort {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; min-height: 58px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .soort:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .soort[aria-disabled="true"] { cursor: default; opacity: .55; }

  .soort .ico {
    width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 50%; color: var(--dac-ink-3);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    transition: color 160ms ease, border-color 160ms ease;
  }
  .soort .ico .icon { width: 18px; height: 18px; }
  /* Alleen het icoon draagt de toestand -- zelfde regel als op de kaarten. */
  .soort[aria-checked="true"] .ico {
    color: var(--dac-accent-hi);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
  }

  .soort .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 2px; }
  .soort .nm { font-size: 14px; font-weight: 500; line-height: 1.25; }
  .soort .rg { font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }

  /* Het vinkje. */
  .vink {
    width: 24px; height: 24px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 7px; border: 1.5px solid var(--dac-ink-3); color: transparent;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
  }
  .vink .icon { width: 16px; height: 16px; }
  .soort[aria-checked="true"] .vink {
    background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: #0c0c0a;
  }

  .leeg { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); padding: 4px 2px; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  .vak:focus, .vak:focus-visible { outline: none; }
  @media (prefers-reduced-motion: reduce) {
    .laag, .vak { animation: none; }
  }
`;

let sheets = null;

const veilig = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

class MeldingenScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
    this.persoon = null;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="wie" tabindex="-1">
          <header>
            <span class="foto"></span>
            <span class="wie"><b id="wie"></b><span>Meldingen op de telefoon</span></span>
            <button class="sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
          </header>
          <div class="storing" hidden></div>
          <div class="lijst"></div>
        </div>
      </div>`;
    this.gebouwd_ = true;

    this.$(".sluit").addEventListener("click", () => this.sluit());
    // Naast het vak tikken sluit, net als bij de bevestigingsvraag.
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });

    const lijst = this.$(".lijst");
    lijst.addEventListener("click", (e) => this.vink_(e.target.closest(".soort")));
    lijst.addEventListener("keydown", (e) => {
      if (e.key !== " " && e.key !== "Enter") return;
      const regel = e.target.closest(".soort");
      if (!regel) return;
      e.preventDefault();
      this.vink_(regel);
    });
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  /** Open het scherm voor deze persoon, gevuld door deze kaart. */
  open(bron, persoon) {
    if (!this.gebouwd_) this.bouw_();
    this.bron = bron;
    this.persoon = persoon;
    // De lijst leeg EN vergeten dat hij gebouwd was. Alleen leegmaken liet de
    // lijst de tweede keer leeg: `teken()` zag dezelfde soorten als de vorige
    // persoon en bouwde niets opnieuw. Gevonden bij het meten.
    const lijst = this.$(".lijst");
    lijst.innerHTML = "";
    delete lijst.dataset.sig;
    this.setAttribute("open", "");
    this.teken();
    // De focus op het VAK en niet op het eerste vinkje: een vinkje dat na een
    // tik programmatisch focus krijgt, kan :focus-visible matchen en draagt dan
    // een ring die niemand vroeg (valkuil 18). Vanaf het vak is het vinkje één
    // Tab verder.
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.removeAttribute("open");
    this.bron = null;
    this.persoon = null;
  }

  /** Is dit scherm open voor deze kaart? Dan hoort die het bij te werken. */
  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  teken() {
    if (!this.bron || !this.persoon) return;
    const inhoud = this.bron.inhoud(this.persoon);

    this.$("#wie").textContent = inhoud.naam;
    const foto = this.$(".foto");
    const wens = inhoud.foto ? `pic:${inhoud.foto}` : "person";
    if (foto.dataset.icon !== wens) {
      foto.dataset.icon = wens;
      foto.innerHTML = inhoud.foto ? `<img src="${veilig(inhoud.foto)}" alt="" />` : resolve("person");
    }

    const storing = this.$(".storing");
    storing.hidden = !inhoud.storing;
    storing.textContent = inhoud.storing ?? "";

    const lijst = this.$(".lijst");
    if (!inhoud.soorten.length) {
      delete lijst.dataset.sig;
      lijst.innerHTML = `<div class="leeg">Op deze kaart staan nog geen meldingen aan. Zet ze aan in de editor van de kaart.</div>`;
      return;
    }

    // De regels één keer bouwen en daarna alleen bijwerken: een vinkje dat
    // opnieuw getekend wordt terwijl je erop tikt, verliest zijn focus.
    const sig = inhoud.soorten.map((s) => s.id).join(",");
    if (lijst.dataset.sig !== sig) {
      lijst.dataset.sig = sig;
      lijst.innerHTML = inhoud.soorten
        .map(
          (s) => `
          <div class="soort" role="checkbox" tabindex="0" data-soort="${veilig(s.id)}" aria-checked="false">
            <span class="ico">${resolve(s.icoon)}</span>
            <span class="txt"><span class="nm">${veilig(s.naam)}</span><span class="rg"></span></span>
            <span class="vink">${resolve("check")}</span>
          </div>`
        )
        .join("");
    }
    for (const s of inhoud.soorten) {
      const regel = lijst.querySelector(`.soort[data-soort="${CSS.escape(s.id)}"]`);
      if (!regel) continue;
      regel.setAttribute("aria-checked", String(s.aan));
      // Tot de server de stand heeft gestuurd, weet niemand hoe het staat. Dan
      // liever een stil vinkje dan een dat straks omspringt.
      regel.setAttribute("aria-disabled", String(Boolean(s.laden)));
      regel.tabIndex = s.laden ? -1 : 0;
      regel.querySelector(".rg").textContent = s.regel ?? "";
      regel.setAttribute(
        "aria-label",
        `${s.naam} voor ${inhoud.naam}: ${s.aan ? "aan" : "uit"}${s.regel ? `. ${s.regel}` : ""}`
      );
    }
  }

  vink_(regel) {
    if (!regel || !this.bron || regel.getAttribute("aria-disabled") === "true") return;
    const aan = regel.getAttribute("aria-checked") !== "true";
    this.bron.zet(regel.dataset.soort, this.persoon, aan);
  }
}

meldAan("domotiapp-meldingen-scherm", MeldingenScherm);

/**
 * Open het ene meldingenscherm van deze pagina voor deze persoon.
 *
 * @param {object} kaart de kaart die het vult: `inhoud(persoon)` en `zet(...)`
 * @param {string} persoon
 */
export function toonMeldingenScherm(kaart, persoon) {
  let scherm = document.querySelector("domotiapp-meldingen-scherm");
  if (!scherm) {
    scherm = document.createElement("domotiapp-meldingen-scherm");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  scherm.open(kaart, persoon);
  return scherm;
}

/** Het open scherm, als het er is. */
export const meldingenScherm = () => document.querySelector("domotiapp-meldingen-scherm");
