/**
 * Het scherm achter de botkaart: vragen over de installatie, en tickets.
 *
 * De eigenaar, 13 november 2026: "Gewoon een vraag stellen over de installatie en echt een ticket aan maken zijn aparte
 * dingen." Daarom twee tabbladen:
 *
 * - **Vragen**: één doorlopend gesprek van het huis, zoals een chat. Typen, Versturen, en het antwoord komt eronder.
 * - **Tickets**: de storingen en aanvragen, met nummer, stand en tijd, en een stip bij een ongelezen antwoord. Een ticket
 *   openen toont zijn gesprek; **Nieuw ticket** vraagt Storing of Aanvraag, een omschrijving, en zo nodig foto's.
 *
 * Een gesprek openen stuurt `read`, alleen als er iets na het gelezene kwam.
 *
 * Het hangt aan `document.body` (valkuil 34): de eigenaar zet zo'n knop in een pop-up van bubble-card, en daarin is
 * `position: fixed` niet vast aan het scherm. De KAART kent de stand (`bron.stand_`, `bron.userId_()`) en verstuurt
 * (`bron.stuur_()`, `bron.upload_()`, `bron.fotoAdres_()`); het scherm tekent en vraagt. Zo is er één plek die het
 * abonnement heeft, en tekent het scherm opnieuw zodra er een antwoord binnenkomt, ook terwijl het gesprek open staat.
 *
 * Zolang het open staat, staat de pagina eronder vast (`zetScrollSlot`, net als het zoekscherm van de media). De
 * eigenaar, 13 november 2026, op zijn iPhone: "ik kan de achtergrond scrollen als de bot geopend is, dat moet ook niet".
 * De lijsten en gesprekken houden hun eigen scrollen bij zich (`overscroll-behavior: contain`).
 *
 * Alle tekst van de klant en van DomotiTech gaat er met `textContent` in, nooit als html. Een foto heeft een id van de
 * coach, en `bijlagePad` maakt daar alleen een adres van als het er echt een is.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";
import { resolve } from "../icons.js";
import { zetScrollSlot } from "../scrollslot.js";
import { t } from "../taal.js";
import {
  GESPREK,
  MAX_FOTOS,
  MAX_TEKST,
  SOORTEN,
  afzender,
  foutTekst,
  loopt,
  moetLezen,
  ongelezen,
  soortVan,
  standNaam,
  waaromNiet,
  wanneer,
} from "./bot-logica.js";

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
    /* Een vaste kolom: een automatische groeit mee met een onderwerp dat niet afbreekt, en dan steekt het vak op een
       telefoon over de rand (gemeten: 386 breed op een scherm van 390). */
    display: grid; place-items: center; grid-template-columns: minmax(0, 1fr);
    padding:
      max(24px, env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
    background: var(--dac-scrim);
    animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  .vak {
    position: relative;
    width: min(460px, 100%);
    max-height: 100%; min-height: 0;
    padding: 14px 14px 16px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
    display: flex; flex-direction: column; gap: 12px;
    animation: omhoog 160ms ease;
  }
  /* Een gesprek heeft een vaste hoogte: de berichten schuiven, het veld blijft onderaan staan. */
  .vak[data-stand="vragen"], .vak[data-stand="ticket"] { height: min(680px, 100%); }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  header { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
  .ico {
    width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%;
    display: grid; place-items: center; color: var(--dac-accent-hi);
    background: var(--dac-surface); border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
  }
  .ico .icon { width: 22px; height: 22px; }
  .ico img.icon { width: 28px; height: 28px; }
  .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  .wie b { font-size: 15.5px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wie span { font-size: 12px; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .rond {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit; -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 17px; height: 17px; }

  /* De twee tabbladen. Het actieve draagt het accent; een stip zegt dat er daar iets nieuws is. */
  .tabs {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; flex: 0 0 auto;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .tab {
    position: relative; min-height: 38px; padding: 0 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    border-radius: 10px; border: 1px solid transparent; background: none; color: var(--dac-ink-2);
    font: inherit; font-size: 13.5px; font-weight: 500; -webkit-tap-highlight-color: transparent;
  }
  .tab .icon { width: 16px; height: 16px; }
  @media (hover: hover) { .tab:hover { color: var(--dac-ink); } }
  .tab[aria-selected="true"] {
    color: var(--dac-ink); background: var(--dac-bg-raise);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
  }
  .tab[aria-selected="true"] .icon { color: var(--dac-accent-hi); }
  .tab .stip { position: static; width: 8px; height: 8px; border: none; }

  .zin { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); padding: 2px; }
  .storing {
    font-size: 12.5px; line-height: 1.4; color: var(--dac-warn);
    padding: 9px 12px; border-radius: 12px;
    background: color-mix(in srgb, var(--dac-warn) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-warn) 30%, transparent);
  }

  /* De hoofdknop: Nieuw ticket en Versturen. */
  .hoofd {
    min-height: 44px; padding: 0 16px; cursor: pointer; flex: 1 1 auto;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border-radius: 12px; border: 1px solid transparent; font: inherit; font-size: 14px; font-weight: 600;
    background: var(--dac-accent); color: var(--dac-on-accent);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .hoofd:hover:not(:disabled) { background: var(--dac-accent-hi); color: var(--dac-on-accent-hi); } }
  .hoofd:disabled { cursor: default; opacity: .55; }
  .hoofd .icon { width: 17px; height: 17px; }

  /* Foto toevoegen: een gewone knop naast Versturen. */
  .foto-knop {
    min-height: 44px; padding: 0 14px; cursor: pointer; flex: 0 0 auto;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    border-radius: 12px; font: inherit; font-size: 13.5px; font-weight: 500;
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .foto-knop:hover:not(:disabled) { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .foto-knop:disabled { cursor: default; opacity: .55; }
  .foto-knop .icon { width: 17px; height: 17px; }
  .knoppen { display: flex; gap: 8px; }

  .lijst { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; overscroll-behavior: contain; min-height: 0; }
  .ticket {
    display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
    padding: 10px 12px; min-height: 58px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .ticket:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .si {
    position: relative; width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 50%; color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .si .icon { width: 18px; height: 18px; }
  /* Een lopend ticket draagt het accent in zijn icoon, een afgerond niet: alleen het icoon draagt de toestand. */
  .ticket[data-loopt] .si { color: var(--dac-accent-hi); border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent); }
  .stip {
    position: absolute; top: -2px; right: -2px; width: 11px; height: 11px; border-radius: 50%;
    background: var(--dac-accent-hi); border: 2px solid var(--dac-bg-raise);
  }
  .ticket .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 2px; }
  .ticket .ond { font-size: 14px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ticket[data-nieuw] .ond { font-weight: 650; }
  .ticket .rg { font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ticket .wn { flex: 0 0 auto; align-self: flex-start; font-size: 11.5px; color: var(--dac-ink-3); padding-top: 2px; }

  /* Een gesprek: dat van het huis, of dat van een ticket. */
  .berichten { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 10px; padding: 2px; }
  .bericht { max-width: 85%; display: flex; flex-direction: column; gap: 3px; align-self: flex-start; }
  .bericht[data-van="klant"] { align-self: flex-end; align-items: flex-end; }
  .bericht .wie2 { font-size: 11.5px; color: var(--dac-ink-3); padding: 0 4px; }
  .bericht .tk {
    padding: 9px 12px; border-radius: 14px; font-size: 14px; line-height: 1.45;
    white-space: pre-wrap; overflow-wrap: anywhere;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .bericht .tk:empty { display: none; }
  .bericht[data-van="klant"] .tk {
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 35%, transparent);
  }
  .bericht .fotos { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
  .bericht[data-van="domotitech"] .fotos { justify-content: flex-start; }
  .bericht .fotos button {
    width: 96px; height: 96px; padding: 0; cursor: zoom-in; overflow: hidden;
    border-radius: 12px; border: 1px solid var(--dac-border); background: var(--dac-surface);
  }
  .bericht .fotos img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ontvangen { align-self: center; font-size: 12px; color: var(--dac-ink-2); text-align: center; padding: 2px 8px; }

  /* Het veld: 16px tekst, anders zoomt Safari in. Geen eigen rand die meetelt (valkuil 79): een inset-schaduw. */
  .schrijf { display: flex; flex-direction: column; gap: 8px; flex: 0 0 auto; }
  textarea {
    width: 100%; min-height: 88px; max-height: 40vh; resize: none; display: block;
    padding: 10px 12px; border: none; border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--dac-border);
    background: var(--dac-veld, var(--dac-surface)); color: var(--dac-ink); color-scheme: var(--dac-scheme);
    font: inherit; font-size: 16px; line-height: 1.4;
  }
  .vak[data-stand="vragen"] textarea, .vak[data-stand="ticket"] textarea { min-height: 52px; }
  textarea:focus { outline: none; box-shadow: inset 0 0 0 2px var(--dac-accent-hi); }
  .melding { font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); }
  .melding[data-soort="fout"] { color: var(--dac-warn); }
  .melding:empty { display: none; }

  /* De gekozen foto's, vóór het versturen. */
  .gekozen { display: flex; flex-wrap: wrap; gap: 8px; }
  .gekozen:empty { display: none; }
  .gekozen .duim { position: relative; width: 64px; height: 64px; border-radius: 10px; overflow: hidden; border: 1px solid var(--dac-border); }
  .gekozen img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gekozen .weg {
    position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: 50%; border: none;
    background: rgba(0, 0, 0, .6); color: #fff;
  }
  .gekozen .weg .icon { width: 13px; height: 13px; }

  /* Storing of Aanvraag: rondjes met een eigen vinkje, net als de keuzes van de meldingen. */
  .soorten { display: flex; flex-direction: column; gap: 8px; }
  .soort {
    display: flex; align-items: center; gap: 12px; padding: 9px 12px; min-height: 52px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent; transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .soort:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .soort .si { width: 32px; height: 32px; }
  .soort .si .icon { width: 17px; height: 17px; }
  .soort .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 1px; }
  .soort .nm { font-size: 14px; font-weight: 500; }
  .soort .rg { font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }
  .soort .v { width: 22px; height: 22px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%;
    border: 1.5px solid var(--dac-ink-3); color: transparent; }
  .soort .v .icon { width: 14px; height: 14px; }
  .soort[aria-checked="true"] .si { color: var(--dac-accent-hi); border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent); }
  .soort[aria-checked="true"] .v { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent-hi); }

  .stand { display: flex; flex-direction: column; gap: 12px; min-height: 0; flex: 1 1 auto; }
  .nieuw-stand { overflow-y: auto; overscroll-behavior: contain; }

  /* Een foto groot: over het hele vak, tik om te sluiten. */
  .groot {
    position: absolute; inset: 0; z-index: 2; padding: 12px; cursor: zoom-out;
    display: grid; place-items: center; border-radius: var(--dac-radius);
    background: rgba(0, 0, 0, .88);
  }
  .groot img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; display: block; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  .vak:focus, .vak:focus-visible { outline: none; }
  @media (prefers-reduced-motion: reduce) { .laag, .vak { animation: none; } }
`;

let sheets = null;

/** Elke foto, ook van de camera. Niet in het sjabloon: daar leest check:css de schuine streep met ster als commentaar. */
const BEELDEN = "image/" + "*";

const SCHRIJF = (soort, rijen, foto) => `
  <div class="schrijf" data-voor="${soort}">
    <textarea rows="${rijen}" maxlength="${MAX_TEKST}"></textarea>
    ${foto ? `<div class="gekozen"></div><input type="file" multiple hidden />` : ""}
    <div class="melding" role="status"></div>
    <div class="knoppen">
      ${foto ? `<button class="foto-knop" type="button">${resolve("camera")}<span></span></button>` : ""}
      <button class="hoofd verstuur" type="button">${resolve("arrowRight")}<span></span></button>
    </div>
  </div>`;

class BotScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
    this.stand_ = "vragen";
    this.ticketId_ = null;
    this.soort_ = "storing";
    this.ontvangen_ = null;
    this.bezig_ = false;
    // Per schrijfvak de gekozen foto's. Ook Vragen staat erin, leeg: na versturen wordt elk vak leeggemaakt.
    this.fotos_ = { vragen: [], ticket: [], nieuw: [] };
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  disconnectedCallback() {
    this.scrollLos_?.();
    this.scrollLos_ = null;
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="kop" tabindex="-1" data-stand="vragen">
          <header>
            <button class="rond terug" type="button" hidden>${resolve("arrowLeft")}</button>
            <span class="ico">${resolve("coach")}</span>
            <span class="wie"><b id="kop"></b><span class="onder"></span></span>
            <button class="rond sluit" type="button">${resolve("close")}</button>
          </header>
          <div class="storing" hidden></div>
          <div class="tabs" role="tablist">
            <button class="tab" type="button" role="tab" data-tab="vragen">${resolve("chat")}<span class="nm"></span><span class="stip" hidden></span></button>
            <button class="tab" type="button" role="tab" data-tab="tickets">${resolve("warning")}<span class="nm"></span><span class="stip" hidden></span></button>
          </div>
          <div class="stand vragen-stand">
            <div class="berichten" aria-live="polite"></div>
            ${SCHRIJF("vragen", 2, false)}
          </div>
          <div class="stand tickets-stand" hidden>
            <div class="knoppen"><button class="hoofd nieuw" type="button">${resolve("plus")}<span></span></button></div>
            <div class="lijst"></div>
          </div>
          <div class="stand ticket-stand" hidden>
            <div class="berichten" aria-live="polite"></div>
            ${SCHRIJF("ticket", 2, true)}
          </div>
          <div class="stand nieuw-stand" hidden>
            <div class="soorten" role="radiogroup">${SOORTEN.map(
              (s) => `<div class="soort" role="radio" tabindex="0" aria-checked="false" data-soort="${s.id}">
                  <span class="si">${resolve(s.icoon)}</span>
                  <span class="txt"><span class="nm"></span><span class="rg"></span></span>
                  <span class="v">${resolve("check")}</span>
                </div>`
            ).join("")}</div>
            ${SCHRIJF("nieuw", 4, true)}
          </div>
          <div class="groot" hidden><img alt="" /></div>
        </div>
      </div>`;
    this.gebouwd_ = true;

    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".terug").addEventListener("click", () => this.naar_("tickets"));
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !this.hasAttribute("open")) return;
      if (!this.$(".groot").hidden) this.$(".groot").hidden = true;
      else if (this.stand_ === "ticket" || this.stand_ === "nieuw") this.naar_("tickets");
      else this.sluit();
    });
    for (const tab of this.shadowRoot.querySelectorAll(".tab")) {
      tab.addEventListener("click", () => this.naar_(tab.dataset.tab));
    }
    this.$(".nieuw").addEventListener("click", () => this.naar_("nieuw"));
    this.$(".groot").addEventListener("click", () => {
      this.$(".groot").hidden = true;
    });

    const lijst = this.$(".lijst");
    const open = (doel) => {
      const ticket = doel.closest(".ticket");
      if (ticket) this.naar_("ticket", Number(ticket.dataset.id));
    };
    lijst.addEventListener("click", (e) => open(e.target));
    lijst.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open(e.target);
    });

    for (const vak of this.shadowRoot.querySelectorAll(".berichten")) {
      vak.addEventListener("click", (e) => {
        const knop = e.target.closest(".fotos button");
        const img = knop?.querySelector("img");
        if (!img?.src) return;
        this.$(".groot img").src = img.src;
        this.$(".groot").hidden = false;
      });
    }

    const soorten = this.$(".soorten");
    const kies = (doel) => {
      const soort = doel.closest(".soort");
      if (!soort) return;
      this.soort_ = soort.dataset.soort;
      this.tekenSoorten_();
    };
    soorten.addEventListener("click", (e) => kies(e.target));
    soorten.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      kies(e.target);
    });

    for (const schrijf of this.shadowRoot.querySelectorAll(".schrijf")) {
      const veld = schrijf.querySelector("textarea");
      schrijf.querySelector(".verstuur").addEventListener("click", () => this.verstuur_(schrijf));
      // Ctrl of Cmd met Enter verstuurt; Enter alleen is een nieuwe regel.
      veld.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.verstuur_(schrijf);
        }
      });
      veld.addEventListener("input", () => this.melding_(schrijf, ""));
      const kiezer = schrijf.querySelector("input[type=file]");
      if (!kiezer) continue;
      kiezer.accept = BEELDEN;
      const voor = schrijf.dataset.voor;
      schrijf.querySelector(".foto-knop").addEventListener("click", () => kiezer.click());
      kiezer.addEventListener("change", () => {
        const erbij = [...kiezer.files].filter((f) => f.type.startsWith("image/"));
        kiezer.value = "";
        const ruimte = MAX_FOTOS - this.fotos_[voor].length;
        if (erbij.length > ruimte) this.melding_(schrijf, t("Hoogstens {n} foto's per bericht.", { n: MAX_FOTOS }), true);
        for (const bestand of erbij.slice(0, Math.max(0, ruimte))) {
          this.fotos_[voor].push({ bestand, url: URL.createObjectURL(bestand) });
        }
        this.tekenGekozen_(schrijf);
      });
      schrijf.querySelector(".gekozen").addEventListener("click", (e) => {
        const weg = e.target.closest(".weg");
        if (!weg) return;
        const [uit] = this.fotos_[voor].splice(Number(weg.dataset.i), 1);
        if (uit) URL.revokeObjectURL(uit.url);
        this.tekenGekozen_(schrijf);
      });
    }
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  /** Open het scherm voor deze kaart: op Vragen, of op Tickets als daar iets nieuws is en in het gesprek niet. */
  open(bron) {
    volgThema(this);
    if (!this.gebouwd_) this.bouw_();
    this.bron = bron;
    this.ontvangen_ = null;
    for (const veld of this.shadowRoot.querySelectorAll("textarea")) veld.value = "";
    for (const voor of Object.keys(this.fotos_)) this.leegFotos_(voor);
    // De vaste woorden bij elke opening: de taal kan wisselen nadat het scherm gebouwd is.
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".terug").setAttribute("aria-label", t("Terug"));
    this.$('.tab[data-tab="vragen"] .nm').textContent = t("Vragen");
    this.$('.tab[data-tab="tickets"] .nm').textContent = t("Tickets");
    this.$(".nieuw span").textContent = t("Nieuw ticket");
    for (const knop of this.shadowRoot.querySelectorAll(".verstuur span")) knop.textContent = t("Versturen");
    for (const knop of this.shadowRoot.querySelectorAll(".foto-knop span")) knop.textContent = t("Foto");
    this.$('.schrijf[data-voor="vragen"] textarea').placeholder = t("Stel je vraag over de installatie");
    this.$('.schrijf[data-voor="ticket"] textarea').placeholder = t("Typ je reactie");
    this.$('.schrijf[data-voor="nieuw"] textarea').placeholder = t("Wat is er aan de hand, of wat wil je?");
    for (const s of SOORTEN) {
      const el = this.$(`.soort[data-soort="${s.id}"]`);
      el.querySelector(".nm").textContent = t(s.naam);
      el.querySelector(".rg").textContent = t(s.uitleg);
    }
    this.$(".groot").hidden = true;
    // Eén slot: open() op een scherm dat al openstaat (een tweede kaart) mag het eerste niet kwijtmaken.
    this.scrollLos_ ??= zetScrollSlot();
    this.setAttribute("open", "");
    const stand = bron.stand_;
    const uid = bron.userId_();
    const ticketsNieuw = (stand?.tickets ?? []).some((x) => ongelezen(x, uid));
    this.naar_(ticketsNieuw && !ongelezen(stand?.gesprek, uid) ? "tickets" : "vragen");
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.scrollLos_?.();
    this.scrollLos_ = null;
    this.removeAttribute("open");
    this.bron = null;
    for (const voor of Object.keys(this.fotos_)) this.leegFotos_(voor);
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  leegFotos_(voor) {
    for (const f of this.fotos_[voor]) URL.revokeObjectURL(f.url);
    this.fotos_[voor] = [];
    const schrijf = this.$(`.schrijf[data-voor="${voor}"]`);
    if (schrijf) this.tekenGekozen_(schrijf);
  }

  naar_(stand, ticketId = null) {
    const was = this.stand_;
    this.stand_ = stand;
    if (stand === "ticket") {
      if (ticketId !== this.ticketId_) {
        this.$('.schrijf[data-voor="ticket"] textarea').value = "";
        this.leegFotos_("ticket");
      }
      this.ticketId_ = ticketId;
      this.melding_(this.$('.schrijf[data-voor="ticket"]'), "");
      delete this.$(".ticket-stand .berichten").dataset.sig;
    }
    if (stand !== "ticket") this.ontvangen_ = null;
    if (stand === "nieuw" && was !== "nieuw") {
      this.soort_ = "storing";
      this.$('.schrijf[data-voor="nieuw"] textarea').value = "";
      this.leegFotos_("nieuw");
      this.melding_(this.$('.schrijf[data-voor="nieuw"]'), "");
    }
    if (stand === "vragen") delete this.$(".vragen-stand .berichten").dataset.sig;
    this.$(".groot").hidden = true;
    this.teken();
  }

  /** Opnieuw tekenen met wat de kaart nu weet. De kaart roept dit aan bij elk bericht van de coach. */
  teken() {
    if (!this.bron) return;
    const bron = this.bron;
    const zin = bron.zin_();
    const vak = this.$(".vak");
    const stand = zin ? "zin" : this.stand_;
    vak.dataset.stand = stand;
    const bovenaan = stand === "vragen" || stand === "tickets" || stand === "zin";
    this.$(".tabs").hidden = !bovenaan || Boolean(zin);
    this.$(".vragen-stand").hidden = stand !== "vragen";
    this.$(".tickets-stand").hidden = stand !== "tickets";
    this.$(".ticket-stand").hidden = stand !== "ticket";
    this.$(".nieuw-stand").hidden = stand !== "nieuw";
    this.$(".terug").hidden = bovenaan;
    this.$(".ico").hidden = !bovenaan;
    const storing = this.$(".storing");
    storing.hidden = !zin;
    storing.textContent = zin ?? "";

    if (bovenaan) {
      this.$("#kop").textContent = bron.titel_();
      for (const tab of this.shadowRoot.querySelectorAll(".tab")) {
        tab.setAttribute("aria-selected", String(tab.dataset.tab === stand));
      }
      const uid = bron.userId_();
      const s = bron.stand_;
      this.$('.tab[data-tab="vragen"] .stip').hidden = !(stand !== "vragen" && ongelezen(s?.gesprek, uid));
      this.$('.tab[data-tab="tickets"] .stip').hidden = !(stand !== "tickets" && (s?.tickets ?? []).some((x) => ongelezen(x, uid)));
    }
    if (stand === "zin") this.$(".wie .onder").textContent = "";
    else if (stand === "vragen") this.tekenVragen_();
    else if (stand === "tickets") this.tekenLijst_();
    else if (stand === "ticket") this.tekenTicket_();
    else this.tekenNieuw_();
  }

  tekenVragen_() {
    const bron = this.bron;
    this.$(".wie .onder").textContent = t("Vraag het over je installatie");
    const gesprek = bron.stand_?.gesprek;
    const vak = this.$(".vragen-stand .berichten");
    if (!gesprek) {
      vak.dataset.sig = "laden";
      vak.replaceChildren(this.zinEl_(t("Ophalen…")));
      return;
    }
    if (!gesprek.berichten?.length) {
      if (vak.dataset.sig !== "leeg") {
        vak.dataset.sig = "leeg";
        vak.replaceChildren(
          this.zinEl_(t("Stel hier je vraag over de installatie, bijvoorbeeld: hoe vol is mijn accu? Werkt er iets niet, of wil je iets erbij? Maak dan een ticket."))
        );
      }
      return;
    }
    this.tekenBerichten_(vak, gesprek, false);
    if (moetLezen(gesprek, bron.userId_())) bron.lees_(GESPREK);
  }

  tekenLijst_() {
    const bron = this.bron;
    const tickets = bron.stand_?.tickets;
    const open = (tickets ?? []).filter(loopt).length;
    this.$(".wie .onder").textContent = open
      ? t("{n} lopend · {m} in totaal", { n: open, m: tickets.length })
      : t("Storingen en aanvragen");
    const lijst = this.$(".lijst");
    if (!tickets) {
      delete lijst.dataset.sig;
      lijst.replaceChildren(this.zinEl_(t("Tickets ophalen…")));
      return;
    }
    if (!tickets.length) {
      delete lijst.dataset.sig;
      lijst.replaceChildren(this.zinEl_(t("Nog geen tickets. Werkt er iets niet, of wil je iets erbij? Maak dan een nieuw ticket.")));
      return;
    }
    const uid = bron.userId_();
    const sig = tickets.map((x) => `${x.id}:${x.bijgewerkt}:${x.stand}:${ongelezen(x, uid)}`).join(",");
    if (lijst.dataset.sig === sig) return;
    lijst.dataset.sig = sig;
    lijst.replaceChildren(
      ...tickets.map((x) => {
        const soort = soortVan(x.soort);
        const nieuw = ongelezen(x, uid);
        const el = document.createElement("div");
        el.className = "ticket";
        el.setAttribute("role", "button");
        el.tabIndex = 0;
        el.dataset.id = String(x.id);
        if (loopt(x)) el.dataset.loopt = "";
        if (nieuw) el.dataset.nieuw = "";
        el.innerHTML = `<span class="si">${resolve(soort.icoon)}${nieuw ? `<span class="stip"></span>` : ""}</span>
          <span class="txt"><span class="ond"></span><span class="rg"></span></span><span class="wn"></span>`;
        el.querySelector(".ond").textContent = x.onderwerp || x.berichten?.[0]?.tekst || "";
        el.querySelector(".rg").textContent = `#${x.id} · ${t(soort.naam)} · ${standNaam(x.stand)}`;
        el.querySelector(".wn").textContent = wanneer(x.bijgewerkt ?? x.gemaakt);
        el.setAttribute(
          "aria-label",
          `#${x.id}, ${t(soort.naam)}, ${standNaam(x.stand)}${nieuw ? `, ${t("nieuw antwoord")}` : ""}: ${x.onderwerp ?? ""}`
        );
        return el;
      })
    );
  }

  tekenTicket_() {
    const bron = this.bron;
    const ticket = bron.stand_?.tickets?.find((x) => x.id === this.ticketId_);
    if (!ticket) {
      // Weg uit de lijst (meer dan 200, of de coach is weg): terug naar de lijst.
      if (bron.stand_) this.naar_("tickets");
      return;
    }
    const soort = soortVan(ticket.soort);
    this.$("#kop").textContent = `#${ticket.id} · ${t(soort.naam)}`;
    this.$(".wie .onder").textContent = standNaam(ticket.stand);
    // "Ontvangen" alleen tot er een antwoord is: daarna zegt het gesprek het zelf.
    const ontvangen = this.ontvangen_ === ticket.id && !(ticket.berichten ?? []).some((b) => b.van !== "klant");
    this.tekenBerichten_(this.$(".ticket-stand .berichten"), ticket, ontvangen);
    if (moetLezen(ticket, bron.userId_())) bron.lees_(ticket.id);
  }

  tekenNieuw_() {
    this.$("#kop").textContent = t("Nieuw ticket");
    this.$(".wie .onder").textContent = t("Een storing of een aanvraag");
    this.tekenSoorten_();
  }

  zinEl_(tekst) {
    const el = document.createElement("div");
    el.className = "zin";
    el.textContent = tekst;
    return el;
  }

  tekenBerichten_(vak, ticket, ontvangen) {
    const berichten = ticket.berichten ?? [];
    const sig = `${ticket.id}:${berichten.map((b) => b.id).join(",")}:${ontvangen}`;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.replaceChildren(
      ...berichten.map((b) => {
        const el = document.createElement("div");
        el.className = "bericht";
        el.dataset.van = b.van === "klant" ? "klant" : "domotitech";
        el.innerHTML = `<span class="wie2"></span><div class="tk"></div>`;
        el.querySelector(".wie2").textContent = [afzender(b), wanneer(b.at)]
          .filter(Boolean)
          .join(" · ");
        el.querySelector(".tk").textContent = b.tekst ?? "";
        const fotos = (b.bijlagen ?? []).filter((x) => x?.id);
        if (fotos.length) {
          const rij = document.createElement("div");
          rij.className = "fotos";
          for (const foto of fotos) {
            const knop = document.createElement("button");
            knop.type = "button";
            knop.setAttribute("aria-label", t("Foto groot bekijken"));
            const img = document.createElement("img");
            img.alt = "";
            img.loading = "lazy";
            knop.append(img);
            rij.append(knop);
            this.bron.fotoAdres_(foto.id).then((adres) => {
              if (adres) img.src = adres;
            });
          }
          el.append(rij);
        }
        return el;
      })
    );
    if (ontvangen) {
      const zin = document.createElement("div");
      zin.className = "ontvangen";
      zin.textContent = t("Ontvangen, we kijken ernaar.");
      vak.append(zin);
    }
    vak.scrollTop = vak.scrollHeight;
  }

  tekenSoorten_() {
    for (const el of this.shadowRoot.querySelectorAll(".soort")) {
      el.setAttribute("aria-checked", String(el.dataset.soort === this.soort_));
    }
  }

  tekenGekozen_(schrijf) {
    const vak = schrijf.querySelector(".gekozen");
    if (!vak) return;
    const fotos = this.fotos_[schrijf.dataset.voor];
    vak.replaceChildren(
      ...fotos.map((f, i) => {
        const duim = document.createElement("div");
        duim.className = "duim";
        duim.innerHTML = `<img alt="" /><button class="weg" type="button" data-i="${i}">${resolve("close")}</button>`;
        duim.querySelector("img").src = f.url;
        duim.querySelector(".weg").setAttribute("aria-label", t("Foto weghalen"));
        return duim;
      })
    );
    schrijf.querySelector(".foto-knop").disabled = fotos.length >= MAX_FOTOS;
  }

  melding_(schrijf, tekst, fout = false) {
    const el = schrijf.querySelector(".melding");
    el.dataset.soort = fout ? "fout" : "";
    el.textContent = tekst;
  }

  async verstuur_(schrijf) {
    if (!this.bron || this.bezig_) return;
    const voor = schrijf.dataset.voor;
    const veld = schrijf.querySelector("textarea");
    const knop = schrijf.querySelector(".verstuur");
    const fotos = this.fotos_[voor] ?? [];
    const nee = waaromNiet(veld.value, { fotos: fotos.length });
    if (nee) return this.melding_(schrijf, nee, true);
    const bron = this.bron;
    const tekst = veld.value.trim();
    this.bezig_ = true;
    knop.disabled = true;
    this.melding_(schrijf, fotos.length ? t("Foto's versturen…") : t("Versturen…"));
    try {
      const bijlagen = [];
      for (const f of fotos) bijlagen.push(await bron.upload_(f.bestand));
      const velden = { tekst, ...(bijlagen.length ? { bijlagen } : {}) };
      const bericht =
        voor === "nieuw"
          ? { type: "new", soort: this.soort_, ...velden }
          : { type: "reply", ticket_id: voor === "vragen" ? GESPREK : this.ticketId_, ...velden };
      const ticket = await bron.stuur_(bericht);
      if (this.bron !== bron) return;
      veld.value = "";
      this.leegFotos_(voor);
      this.melding_(schrijf, "");
      if (voor === "nieuw" && ticket?.id != null) {
        this.naar_("ticket", ticket.id);
        this.ontvangen_ = ticket.id;
        this.teken();
      }
    } catch (fout) {
      if (this.bron === bron) this.melding_(schrijf, foutTekst(fout), true);
    } finally {
      this.bezig_ = false;
      knop.disabled = false;
    }
  }
}

meldAan("domotiapp-bot-scherm", BotScherm);

/** Open het ene botscherm van deze pagina voor deze kaart. */
export function toonBotScherm(kaart) {
  let scherm = document.querySelector("domotiapp-bot-scherm");
  if (!scherm) {
    scherm = document.createElement("domotiapp-bot-scherm");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(kaart);
  return scherm;
}

export const botScherm = () => document.querySelector("domotiapp-bot-scherm");
