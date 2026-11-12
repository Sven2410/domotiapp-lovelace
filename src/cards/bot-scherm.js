/**
 * Het scherm achter de botkaart: de tickets van het huis, één gesprek, en een nieuwe vraag.
 *
 * Drie standen in één vak:
 *
 * - `lijst`: bovenaan Nieuw, daaronder de tickets, nieuwste eerst, met nummer, soort, stand en tijd, en een stip
 *   bij een antwoord dat deze gebruiker nog niet las;
 * - `gesprek`: de berichten van één ticket, onderaan een veld om te reageren. Openen stuurt `read`;
 * - `nieuw`: Vraag, Aanvraag of Storing, een veld, Versturen. Daarna staat het gesprek er, met "Ontvangen, we kijken
 *   ernaar", en het ticket in de lijst.
 *
 * Het hangt aan `document.body` (valkuil 34): de eigenaar zet zo'n knop in een pop-up van bubble-card, en daarin is
 * `position: fixed` niet vast aan het scherm. De KAART kent de tickets (`bron.tickets_`, `bron.userId_()`) en
 * verstuurt (`bron.stuur_()`); het scherm tekent en vraagt. Zo is er één plek die het abonnement heeft, en tekent het
 * scherm opnieuw zodra er een antwoord binnenkomt, ook terwijl het gesprek open staat.
 *
 * Alle tekst van de klant en van DomotiTech gaat er met `textContent` in, nooit als html.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";
import { resolve } from "../icons.js";
import { t } from "../taal.js";
import { MAX_TEKST, SOORTEN, foutTekst, loopt, moetLezen, ongelezen, soortVan, standNaam, waaromNiet, wanneer } from "./bot-logica.js";

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
    width: min(440px, 100%);
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
  .vak[data-stand="gesprek"] { height: min(640px, 100%); }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  header { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
  .ico {
    width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%;
    display: grid; place-items: center; color: var(--dac-accent-hi);
    background: var(--dac-surface); border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
  }
  .ico .icon { width: 22px; height: 22px; }
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

  .zin { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); padding: 2px; }
  .storing {
    font-size: 12.5px; line-height: 1.4; color: var(--dac-warn);
    padding: 9px 12px; border-radius: 12px;
    background: color-mix(in srgb, var(--dac-warn) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-warn) 30%, transparent);
  }

  /* De hoofdknop: Nieuw en Versturen. */
  .hoofd {
    min-height: 44px; padding: 0 16px; cursor: pointer; flex: 0 0 auto;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border-radius: 12px; border: 1px solid transparent; font: inherit; font-size: 14px; font-weight: 600;
    background: var(--dac-accent); color: var(--dac-on-accent);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .hoofd:hover:not(:disabled) { background: var(--dac-accent-hi); color: var(--dac-on-accent-hi); } }
  .hoofd:disabled { cursor: default; opacity: .55; }
  .hoofd .icon { width: 17px; height: 17px; }

  .lijst { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; min-height: 0; }
  .ticket {
    display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
    padding: 10px 12px; min-height: 58px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .ticket:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .ticket .si {
    position: relative; width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 50%; color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .ticket .si .icon { width: 18px; height: 18px; }
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

  /* Het gesprek. */
  .berichten { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 2px; }
  .bericht { max-width: 85%; display: flex; flex-direction: column; gap: 3px; align-self: flex-start; }
  .bericht[data-van="klant"] { align-self: flex-end; align-items: flex-end; }
  .bericht .wie2 { font-size: 11.5px; color: var(--dac-ink-3); padding: 0 4px; }
  .bericht .tk {
    padding: 9px 12px; border-radius: 14px; font-size: 14px; line-height: 1.45;
    white-space: pre-wrap; overflow-wrap: anywhere;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .bericht[data-van="klant"] .tk {
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 35%, transparent);
  }
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
  .gesprek textarea { min-height: 52px; }
  textarea:focus { outline: none; box-shadow: inset 0 0 0 2px var(--dac-accent-hi); }
  .melding { font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); min-height: 0; }
  .melding[data-soort="fout"] { color: var(--dac-warn); }
  .melding:empty { display: none; }

  /* De drie soorten: rondjes met een eigen vinkje, net als de keuzes van de meldingen. */
  .soorten { display: flex; flex-direction: column; gap: 8px; }
  .soort {
    display: flex; align-items: center; gap: 12px; padding: 9px 12px; min-height: 52px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent; transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .soort:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .soort .si { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%;
    color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border); }
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

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  .vak:focus, .vak:focus-visible { outline: none; }
  @media (prefers-reduced-motion: reduce) { .laag, .vak { animation: none; } }
`;

let sheets = null;

class BotScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
    this.stand_ = "lijst";
    this.ticketId_ = null;
    this.soort_ = "vraag";
    this.ontvangen_ = null;
    this.bezig_ = false;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.bouw_();
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="kop" tabindex="-1" data-stand="lijst">
          <header>
            <button class="rond terug" type="button" hidden>${resolve("arrowLeft")}</button>
            <span class="ico">${resolve("chat")}</span>
            <span class="wie"><b id="kop"></b><span class="onder"></span></span>
            <button class="rond sluit" type="button">${resolve("close")}</button>
          </header>
          <div class="stand lijst-stand">
            <div class="storing" hidden></div>
            <button class="hoofd nieuw" type="button">${resolve("plus")}<span></span></button>
            <div class="lijst"></div>
          </div>
          <div class="stand gesprek" hidden>
            <div class="berichten" aria-live="polite"></div>
            <div class="schrijf">
              <textarea rows="2" maxlength="${MAX_TEKST}"></textarea>
              <div class="melding" role="status"></div>
              <button class="hoofd verstuur" type="button">${resolve("arrowRight")}<span></span></button>
            </div>
          </div>
          <div class="stand nieuw-stand" hidden>
            <div class="soorten" role="radiogroup">${SOORTEN.map(
              (s) => `<div class="soort" role="radio" tabindex="0" aria-checked="false" data-soort="${s.id}">
                  <span class="si">${resolve(s.icoon)}</span>
                  <span class="txt"><span class="nm"></span><span class="rg"></span></span>
                  <span class="v">${resolve("check")}</span>
                </div>`
            ).join("")}</div>
            <div class="schrijf">
              <textarea rows="4" maxlength="${MAX_TEKST}"></textarea>
              <div class="melding" role="status"></div>
              <button class="hoofd verstuur" type="button">${resolve("arrowRight")}<span></span></button>
            </div>
          </div>
        </div>
      </div>`;
    this.gebouwd_ = true;

    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".terug").addEventListener("click", () => this.naar_("lijst"));
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !this.hasAttribute("open")) return;
      if (this.stand_ === "lijst") this.sluit();
      else this.naar_("lijst");
    });
    this.$(".nieuw").addEventListener("click", () => this.naar_("nieuw"));

    const lijst = this.$(".lijst");
    const open = (doel) => {
      const ticket = doel.closest(".ticket");
      if (ticket) this.naar_("gesprek", Number(ticket.dataset.id));
    };
    lijst.addEventListener("click", (e) => open(e.target));
    lijst.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open(e.target);
    });

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

    for (const stand of [this.$(".gesprek"), this.$(".nieuw-stand")]) {
      const veld = stand.querySelector("textarea");
      stand.querySelector(".verstuur").addEventListener("click", () => this.verstuur_(stand));
      // Ctrl of Cmd met Enter verstuurt; Enter alleen is een nieuwe regel.
      veld.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.verstuur_(stand);
        }
      });
      veld.addEventListener("input", () => this.melding_(stand, ""));
    }
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  /** Open het scherm voor deze kaart, op de lijst. */
  open(bron) {
    volgThema(this);
    if (!this.gebouwd_) this.bouw_();
    this.bron = bron;
    this.ontvangen_ = null;
    for (const veld of this.shadowRoot.querySelectorAll("textarea")) veld.value = "";
    // De vaste woorden bij elke opening: de taal kan wisselen nadat het scherm gebouwd is.
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".terug").setAttribute("aria-label", t("Terug"));
    this.$(".nieuw span").textContent = t("Nieuw");
    for (const knop of this.shadowRoot.querySelectorAll(".verstuur span")) knop.textContent = t("Versturen");
    this.$(".gesprek textarea").placeholder = t("Typ je reactie");
    this.$(".nieuw-stand textarea").placeholder = t("Wat wil je vragen of melden?");
    for (const s of SOORTEN) {
      const el = this.$(`.soort[data-soort="${s.id}"]`);
      el.querySelector(".nm").textContent = t(s.naam);
      el.querySelector(".rg").textContent = t(s.uitleg);
    }
    this.setAttribute("open", "");
    this.naar_("lijst");
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.removeAttribute("open");
    this.bron = null;
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  naar_(stand, ticketId = null) {
    this.stand_ = stand;
    if (stand === "gesprek") this.ticketId_ = ticketId;
    if (stand !== "gesprek") this.ontvangen_ = null;
    if (stand === "nieuw") {
      this.soort_ = "vraag";
      const veld = this.$(".nieuw-stand textarea");
      veld.value = "";
      this.melding_(this.$(".nieuw-stand"), "");
    }
    if (stand === "gesprek") {
      this.$(".gesprek textarea").value = "";
      this.melding_(this.$(".gesprek"), "");
      delete this.$(".berichten").dataset.sig;
    }
    this.teken();
  }

  /** Opnieuw tekenen met wat de kaart nu weet. De kaart roept dit aan bij elk bericht van de coach. */
  teken() {
    if (!this.bron) return;
    const vak = this.$(".vak");
    vak.dataset.stand = this.stand_;
    this.$(".lijst-stand").hidden = this.stand_ !== "lijst";
    this.$(".gesprek").hidden = this.stand_ !== "gesprek";
    this.$(".nieuw-stand").hidden = this.stand_ !== "nieuw";
    this.$(".terug").hidden = this.stand_ === "lijst";
    this.$(".ico").hidden = this.stand_ !== "lijst";

    if (this.stand_ === "lijst") this.tekenLijst_();
    else if (this.stand_ === "gesprek") this.tekenGesprek_();
    else this.tekenNieuw_();
  }

  tekenLijst_() {
    const bron = this.bron;
    this.$("#kop").textContent = bron.titel_();
    const tickets = bron.tickets_;
    const zin = bron.zin_();
    const storing = this.$(".storing");
    storing.hidden = !zin;
    storing.textContent = zin ?? "";
    this.$(".nieuw").hidden = Boolean(zin) || !tickets;
    const open = (tickets ?? []).filter(loopt).length;
    this.$(".wie .onder").textContent = zin
      ? ""
      : open
      ? t("{n} lopend · {m} in totaal", { n: open, m: tickets.length })
      : t("Een vraag, een aanvraag of een storing");

    const lijst = this.$(".lijst");
    if (zin || !tickets) {
      lijst.innerHTML = zin ? "" : `<div class="zin"></div>`;
      if (!zin) lijst.firstChild.textContent = t("Tickets ophalen…");
      return;
    }
    if (!tickets.length) {
      lijst.innerHTML = `<div class="zin"></div>`;
      lijst.firstChild.textContent = t("Nog niets gevraagd. Met Nieuw stel je een vraag, doe je een aanvraag of meld je een storing.");
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

  tekenGesprek_() {
    const bron = this.bron;
    const ticket = bron.tickets_?.find((x) => x.id === this.ticketId_);
    if (!ticket) {
      // Weg uit de lijst (meer dan 200, of de coach is weg): terug naar de lijst.
      if (bron.tickets_) this.naar_("lijst");
      return;
    }
    const soort = soortVan(ticket.soort);
    this.$("#kop").textContent = `#${ticket.id} · ${t(soort.naam)}`;
    this.$(".wie .onder").textContent = standNaam(ticket.stand);

    const vak = this.$(".berichten");
    const berichten = ticket.berichten ?? [];
    // "Ontvangen" alleen tot er een antwoord is: daarna zegt het gesprek het zelf.
    const ontvangen = this.ontvangen_ === ticket.id && !berichten.some((b) => b.van !== "klant");
    const sig = `${ticket.id}:${berichten.map((b) => b.id).join(",")}:${ontvangen}`;
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.replaceChildren(
        ...berichten.map((b) => {
          const el = document.createElement("div");
          el.className = "bericht";
          el.dataset.van = b.van === "klant" ? "klant" : "domotitech";
          el.innerHTML = `<span class="wie2"></span><div class="tk"></div>`;
          el.querySelector(".wie2").textContent = [b.naam || (b.van === "klant" ? "" : "DomotiTech"), wanneer(b.at)]
            .filter(Boolean)
            .join(" · ");
          el.querySelector(".tk").textContent = b.tekst ?? "";
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
    if (moetLezen(ticket, bron.userId_())) bron.lees_(ticket.id);
  }

  tekenNieuw_() {
    this.$("#kop").textContent = t("Nieuw");
    this.$(".wie .onder").textContent = t("Wat is het?");
    this.tekenSoorten_();
  }

  tekenSoorten_() {
    for (const el of this.shadowRoot.querySelectorAll(".soort")) {
      el.setAttribute("aria-checked", String(el.dataset.soort === this.soort_));
    }
  }

  melding_(stand, tekst, fout = false) {
    const el = stand.querySelector(".melding");
    el.dataset.soort = fout ? "fout" : "";
    el.textContent = tekst;
  }

  async verstuur_(stand) {
    if (!this.bron || this.bezig_) return;
    const veld = stand.querySelector("textarea");
    const knop = stand.querySelector(".verstuur");
    const nee = waaromNiet(veld.value);
    if (nee) return this.melding_(stand, nee, true);
    const nieuw = stand.classList.contains("nieuw-stand");
    const bron = this.bron;
    const bericht = nieuw
      ? { type: "new", soort: this.soort_, tekst: veld.value.trim() }
      : { type: "reply", ticket_id: this.ticketId_, tekst: veld.value.trim() };
    this.bezig_ = true;
    knop.disabled = true;
    this.melding_(stand, t("Versturen…"));
    try {
      const ticket = await bron.stuur_(bericht);
      if (this.bron !== bron) return;
      veld.value = "";
      this.melding_(stand, "");
      if (nieuw && ticket?.id != null) {
        this.ontvangen_ = ticket.id;
        this.naar_("gesprek", ticket.id);
        this.ontvangen_ = ticket.id;
        this.teken();
      }
    } catch (fout) {
      if (this.bron === bron) this.melding_(stand, foutTekst(fout), true);
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
