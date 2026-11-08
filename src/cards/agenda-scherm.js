/**
 * Het scherm van de agendakaart: één afspraak, een afspraak maken of wijzigen, een agenda toevoegen, en de lijst agenda's.
 *
 * De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
 * bestaande toevoegen zoals google of apple".
 *
 * ## Waarom dit in `document.body` hangt
 *
 * Valkuil 34: in een pop-up van Bubble Card is `position: fixed` niet vast aan het scherm. Eén scherm per pagina, net als
 * het meldingenscherm. De agendakaart opent het, en de overzichtskaart ook (een tik op een afspraak).
 *
 * ## Wie het vult
 *
 * Wie het opent geeft een `bron` mee: `hass()`, `agendas()` (uit `agendaInfo`) en `toevoegen` (mag de klant hier een
 * agenda toevoegen). Het scherm vraagt die bij elke tekening opnieuw, zodat een agenda die net bij kwam er meteen staat.
 * Wat er gebeurt, gaat rechtstreeks naar de server (`agenda-client.js`); de kaarten krijgen de wijziging vanzelf binnen
 * via hun abonnement.
 *
 * ## Wat een agenda kan
 *
 * Alleen wat Home Assistant zegt (`kan`): een Wijzigen-knop staat er alleen als de agenda het kan. Een agenda die alleen te
 * lezen is (het iCal-adres van Google) zegt dat, met waar je hem dan wel wijzigt.
 */

import { meldAan } from "../registratie.js";
import { resolve } from "../icons.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";
import { t } from "../taal.js";
import { vraagBevestiging } from "../vraag.js";
import { naarWand } from "../wandklok.js";
import { afspraakUit, formulierVan, googleAdres, nieuwFormulier, wanneerVoluit } from "./agenda-logica.js";
import { haalAfspraakWeg, haalAgendaWeg, maakAfspraak, voegAgendaToe, wijzigAfspraak } from "./agenda-client.js";

const APPLE_WACHTWOORD = "https://account.apple.com";

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
    position: absolute; inset: 0; display: grid; place-items: center;
    padding: max(24px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    background: var(--dac-scrim); animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }
  .vak {
    width: min(440px, 100%); max-height: 100%; overflow-y: auto;
    padding: 14px 14px 16px; border-radius: var(--dac-radius);
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
    display: flex; flex-direction: column; gap: 12px; animation: omhoog 160ms ease;
  }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }
  .vak:focus, .vak:focus-visible { outline: none; }

  header { display: flex; align-items: center; gap: 10px; min-height: 36px; }
  header .stip { flex: 0 0 auto; width: 12px; height: 12px; border-radius: 50%; background: var(--tone); }
  header .kop { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  header b { font-size: 16px; font-weight: 600; letter-spacing: -.01em; overflow-wrap: anywhere; }
  header .onder { font-size: 12px; color: var(--dac-ink-2); }
  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .sluit:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .sluit .icon { width: 17px; height: 17px; }

  /* ---- één afspraak ---- */
  .gegevens { display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; line-height: 1.45; }
  .gegevens .regel { display: flex; gap: 10px; align-items: flex-start; }
  .gegevens .regel .icon { flex: 0 0 auto; width: 16px; height: 16px; margin-top: 2px; color: var(--dac-ink-3); }
  .gegevens .omschrijving { white-space: pre-wrap; color: var(--dac-ink-2); overflow-wrap: anywhere; }
  .uitleg { font-size: 12.5px; line-height: 1.45; color: var(--dac-ink-2); }
  .uitleg a { color: var(--dac-accent-hi); }
  .uitleg ol { margin: 4px 0 0; padding-left: 18px; }

  /* ---- velden ---- */
  .veld { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .veld > span { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="email"], input[type="password"], input[type="url"], input[type="date"], input[type="time"], textarea {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-veld);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: var(--dac-scheme);
  }
  /* Valkuil 78: een tijdveld nooit display block; op iOS zakt de tijd dan naar boven. */
  input[type="time"], input[type="date"] { display: flex; align-items: center; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  input:focus-visible, textarea:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--dac-bad); }
  .twee { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }

  /* Een keuze uit een paar: pillen, geen keuzelijst (die tekent een eigen menu met eigen kleuren). */
  .pillen { display: flex; flex-wrap: wrap; gap: 6px; }
  .pil {
    display: inline-flex; align-items: center; gap: 7px; min-height: 34px; padding: 0 12px; cursor: pointer;
    border-radius: var(--dac-radius-pill); border: 1px solid var(--dac-border-hi); background: none;
    font: inherit; font-size: 13px; font-weight: 500; color: var(--dac-ink-2);
    -webkit-tap-highlight-color: transparent;
  }
  .pil .stip { width: 9px; height: 9px; border-radius: 50%; background: var(--tone); }
  @media (hover: hover) { .pil:not([aria-checked="true"]):hover { background: var(--dac-hover); } }
  .pil[aria-checked="true"] { color: var(--dac-ink); border-color: var(--dac-accent-hi); background: var(--dac-accent-soft); }
  .pil[aria-disabled="true"] { cursor: default; }

  .schakel {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; cursor: pointer;
    font-size: 13.5px; -webkit-tap-highlight-color: transparent;
  }
  .schakel .knop {
    position: relative; flex: 0 0 auto; width: 40px; height: 24px; border-radius: 12px;
    background: rgba(var(--dac-tint), .16); transition: background 160ms ease;
  }
  .schakel .knop::after {
    content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%;
    background: var(--dac-knob); transition: transform 160ms ease;
  }
  .schakel[aria-checked="true"] .knop { background: var(--dac-accent); }
  .schakel[aria-checked="true"] .knop::after { transform: translateX(16px); }

  /* ---- soorten agenda ---- */
  .soorten { display: flex; flex-direction: column; gap: 8px; }
  .soort {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; min-height: 58px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) { .soort:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .soort[aria-checked="true"] { border-color: var(--dac-accent-hi); background: var(--dac-accent-soft); }
  .soort .ico { flex: 0 0 auto; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: rgba(var(--dac-tint), .07); color: var(--dac-accent-hi); }
  .soort .ico .icon { width: 18px; height: 18px; }
  .soort .txt { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .soort .nm { font-size: 14px; font-weight: 600; }
  .soort .rg { font-size: 12px; color: var(--dac-ink-2); line-height: 1.35; }

  /* ---- de lijst agenda's ---- */
  .agendas { display: flex; flex-direction: column; gap: 6px; }
  .agenda { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 6px 6px 6px 12px; border-radius: 12px; background: var(--dac-surface); border: 1px solid var(--dac-border); }
  .agenda .stip { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; background: var(--tone); }
  .agenda .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .agenda .nm { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .agenda .rg { font-size: 11.5px; color: var(--dac-ink-3); }
  .leeg { font-size: 13px; color: var(--dac-ink-2); padding: 6px 2px; }

  /* ---- knoppen onderaan ---- */
  footer { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
  footer .links { margin-right: auto; }
  .btn {
    min-height: 40px; padding: 0 16px; border-radius: var(--dac-radius-pill); cursor: pointer;
    font: inherit; font-size: 13.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--dac-border-hi); background: none; color: var(--dac-ink);
    -webkit-tap-highlight-color: transparent;
  }
  .btn .icon { width: 16px; height: 16px; }
  @media (hover: hover) { .btn:not([disabled]):hover { background: var(--dac-hover); } }
  .btn.eerste { background: var(--dac-accent); border-color: var(--dac-accent); color: var(--dac-on-accent); }
  @media (hover: hover) { .btn.eerste:not([disabled]):hover { background: var(--dac-accent-hi); } }
  .btn.weg { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
  .btn.klein { min-height: 32px; padding: 0 12px; font-size: 12.5px; }
  .btn[disabled] { opacity: .5; cursor: default; }

  .fout { font-size: 12.5px; line-height: 1.4; color: var(--dac-bad); }
  .fout:empty { display: none; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .laag, .vak { animation: none; } }
`;

let sheets = null;

const veilig = (tekst) =>
  String(tekst ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Wat een agenda kan, in woorden. */
function kanWoord(kan) {
  if (kan.maken && kan.wijzigen) return t("lezen en schrijven");
  if (kan.maken) return t("lezen en afspraken maken");
  return t("alleen lezen");
}

class AgendaScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
  }

  connectedCallback() {
    if (this.gebouwd_) return;
    this.shadowRoot.innerHTML = `<div class="laag"><div class="vak" role="dialog" aria-modal="true" tabindex="-1"></div></div>`;
    this.gebouwd_ = true;
    const laag = this.$(".laag");
    laag.addEventListener("click", (e) => {
      if (e.target === laag) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });
    const vak = this.$(".vak");
    vak.addEventListener("click", (e) => this.tik_(e));
    vak.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "Enter") && e.target.closest('[role="radio"], [role="switch"]')) {
        e.preventDefault();
        this.tik_(e);
      }
    });
    vak.addEventListener("input", (e) => this.invoer_(e.target));
    vak.addEventListener("change", (e) => this.invoer_(e.target));
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  /** Open in een stand: `afspraak` (met `a`), `formulier` (met of zonder `a`), `toevoegen` of `agendas`. */
  open(bron, modus, a = null) {
    volgThema(this);
    this.bron = bron;
    this.setAttribute("open", "");
    this.ga_(modus, a);
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.removeAttribute("open");
    this.bron = null;
    this.bezig_ = false;
  }

  get hass_() {
    return this.bron?.hass();
  }

  agendas_() {
    return this.bron?.agendas() ?? [];
  }

  info_(id) {
    return this.agendas_().find((x) => x.id === id) ?? { id, naam: id, kleur: "var(--dac-accent-hi)", kan: { maken: false, wijzigen: false, weghalen: false } };
  }

  ga_(modus, a = null) {
    this.modus = modus;
    this.a = a;
    this.bezig_ = false;
    if (modus === "formulier") {
      const tz = this.hass_?.config?.time_zone;
      const schrijfbaar = this.agendas_().filter((x) => x.kan.maken);
      this.f_ = a ? formulierVan(a) : nieuwFormulier(naarWand(new Date(), tz), schrijfbaar[0]?.id);
    }
    if (modus === "toevoegen") this.t_ = { soort: "nieuw", naam: "", adres: "", gebruiker: "", wachtwoord: "" };
    this.teken_();
  }

  /** Bijwerken als de kaart iets nieuws weet (een agenda erbij), maar niet midden in een formulier. */
  ververs() {
    if (this.hasAttribute("open") && (this.modus === "agendas" || this.modus === "afspraak")) this.teken_();
  }

  teken_() {
    const vak = this.$(".vak");
    const sluit = `<button class="sluit" type="button" data-doe="sluit" aria-label="${veilig(t("Sluiten"))}">${resolve("close")}</button>`;
    if (this.modus === "afspraak") vak.innerHTML = this.afspraakHtml_(sluit);
    else if (this.modus === "formulier") vak.innerHTML = this.formulierHtml_(sluit);
    else if (this.modus === "toevoegen") vak.innerHTML = this.toevoegenHtml_(sluit);
    else vak.innerHTML = this.agendasHtml_(sluit);
  }

  afspraakHtml_(sluit) {
    const a = this.a;
    const info = this.info_(a.agenda);
    const knoppen = [];
    if (info.kan.weghalen && a.uid) knoppen.push(`<button class="btn weg links" type="button" data-doe="weghalen">${veilig(t("Verwijderen"))}</button>`);
    if (info.kan.wijzigen && a.uid) knoppen.push(`<button class="btn eerste" type="button" data-doe="wijzigen">${resolve("pencil")}${veilig(t("Wijzigen"))}</button>`);
    return `
      <header style="--tone:${info.kleur}">
        <span class="stip"></span>
        <span class="kop"><b>${veilig(a.titel || t("Afspraak"))}</b><span class="onder">${veilig(info.naam)}</span></span>
        ${sluit}
      </header>
      <div class="gegevens">
        <div class="regel">${resolve("clock")}<span>${veilig(wanneerVoluit(a))}</span></div>
        ${a.plaats ? `<div class="regel">${resolve("house")}<span>${veilig(a.plaats)}</span></div>` : ""}
        ${a.omschrijving ? `<div class="regel">${resolve("dots")}<span class="omschrijving">${veilig(a.omschrijving)}</span></div>` : ""}
        ${a.herhaalt ? `<div class="regel">${resolve("repeat")}<span>${veilig(t("Herhaalt. Wijzigen en verwijderen gaat alleen over deze keer."))}</span></div>` : ""}
      </div>
      ${
        knoppen.length
          ? ""
          : `<div class="uitleg">${veilig(t("Deze agenda is hier alleen te lezen. Wijzig de afspraak waar hij vandaan komt, zoals in Google Agenda."))}</div>`
      }
      <div class="fout" role="alert"></div>
      ${knoppen.length ? `<footer>${knoppen.join("")}</footer>` : ""}`;
  }

  formulierHtml_(sluit) {
    const f = this.f_;
    const wijzig = Boolean(this.a);
    const schrijfbaar = this.agendas_().filter((x) => x.kan.maken || (wijzig && x.id === f.agenda));
    const pillen = (wijzig ? schrijfbaar.filter((x) => x.id === f.agenda) : schrijfbaar)
      .map(
        (x) =>
          `<button class="pil" type="button" role="radio" data-agenda="${veilig(x.id)}" aria-checked="${x.id === f.agenda}" style="--tone:${x.kleur}"${wijzig ? ' aria-disabled="true"' : ""}><span class="stip"></span>${veilig(x.naam)}</button>`
      )
      .join("");
    return `
      <header><span class="kop"><b>${veilig(wijzig ? t("Afspraak wijzigen") : t("Nieuwe afspraak"))}</b></span>${sluit}</header>
      <label class="veld"><span>${veilig(t("Titel"))}</span><input type="text" data-v="titel" maxlength="200" value="${veilig(f.titel)}" autocomplete="off" /></label>
      <div class="veld"><span>${veilig(t("Agenda"))}</span><div class="pillen" role="radiogroup">${pillen || `<span class="leeg">${veilig(t("Er is geen agenda om in te schrijven."))}</span>`}</div></div>
      <div class="schakel" role="switch" tabindex="0" data-v="heleDag" aria-checked="${f.heleDag}"><span>${veilig(t("Hele dag"))}</span><span class="knop"></span></div>
      <div class="twee">
        <label class="veld"><span>${veilig(f.heleDag ? t("Van") : t("Datum"))}</span><input type="date" data-v="datum" value="${veilig(f.datum)}" /></label>
        ${f.heleDag ? `<label class="veld"><span>${veilig(t("Tot en met"))}</span><input type="date" data-v="totDatum" value="${veilig(f.totDatum)}" /></label>` : "<span></span>"}
      </div>
      ${
        f.heleDag
          ? ""
          : `<div class="twee">
        <label class="veld"><span>${veilig(t("Begin"))}</span><input type="time" data-v="van" value="${veilig(f.van)}" /></label>
        <label class="veld"><span>${veilig(t("Eind"))}</span><input type="time" data-v="tot" value="${veilig(f.tot)}" /></label>
      </div>`
      }
      <label class="veld"><span>${veilig(t("Plaats"))}</span><input type="text" data-v="plaats" maxlength="200" value="${veilig(f.plaats)}" autocomplete="off" /></label>
      <label class="veld"><span>${veilig(t("Omschrijving"))}</span><textarea data-v="omschrijving" maxlength="2000">${veilig(f.omschrijving)}</textarea></label>
      ${wijzig && this.a.herhaalt ? `<div class="uitleg">${veilig(t("Herhaalt. Dit wijzigt alleen deze keer."))}</div>` : ""}
      <div class="fout" role="alert"></div>
      <footer>
        <button class="btn" type="button" data-doe="${wijzig ? "terug" : "sluit"}">${veilig(t("Annuleren"))}</button>
        <button class="btn eerste" type="button" data-doe="bewaar">${veilig(t("Opslaan"))}</button>
      </footer>`;
  }

  toevoegenHtml_(sluit) {
    const s = this.t_;
    const soort = (id, icoon, naam, regel) =>
      `<div class="soort" role="radio" tabindex="0" data-soort="${id}" aria-checked="${s.soort === id}"><span class="ico">${resolve(icoon)}</span><span class="txt"><span class="nm">${veilig(naam)}</span><span class="rg">${veilig(regel)}</span></span></div>`;
    let velden = "";
    if (s.soort === "nieuw") {
      velden = `<label class="veld"><span>${veilig(t("Naam van de agenda"))}</span><input type="text" data-t="naam" maxlength="60" value="${veilig(s.naam)}" autocomplete="off" /></label>`;
    } else if (s.soort === "google") {
      velden = `
        <div class="uitleg">${veilig(t("Zo vind je het adres:"))}<ol>
          <li>${veilig(t("Open Google Agenda op een computer en ga naar Instellingen."))}</li>
          <li>${veilig(t("Kies links je agenda, en ga naar Agenda integreren."))}</li>
          <li>${veilig(t("Kopieer het Geheim adres in iCal-indeling en plak het hieronder."))}</li>
        </ol></div>
        <label class="veld"><span>${veilig(t("Naam van de agenda"))}</span><input type="text" data-t="naam" maxlength="60" value="${veilig(s.naam)}" autocomplete="off" /></label>
        <label class="veld"><span>${veilig(t("Geheim adres in iCal-indeling"))}</span><input type="url" data-t="adres" value="${veilig(s.adres)}" autocomplete="off" placeholder="https://calendar.google.com/calendar/ical/..." /></label>`;
    } else {
      velden = `
        <div class="uitleg">${veilig(t("Gebruik niet je gewone wachtwoord, maar een app-specifiek wachtwoord. Dat maak je bij Apple:"))}
          <a href="${APPLE_WACHTWOORD}" target="_blank" rel="noopener noreferrer">account.apple.com</a>,
          ${veilig(t("Inloggen en beveiliging, App-specifieke wachtwoorden."))}</div>
        <label class="veld"><span>${veilig(t("Apple ID (e-mailadres)"))}</span><input type="email" data-t="gebruiker" value="${veilig(s.gebruiker)}" autocomplete="off" /></label>
        <label class="veld"><span>${veilig(t("App-specifiek wachtwoord"))}</span><input type="password" data-t="wachtwoord" value="${veilig(s.wachtwoord)}" autocomplete="off" placeholder="xxxx-xxxx-xxxx-xxxx" /></label>`;
    }
    return `
      <header><span class="kop"><b>${veilig(t("Agenda toevoegen"))}</b></span>${sluit}</header>
      <div class="soorten" role="radiogroup">
        ${soort("nieuw", "calendar", t("Nieuwe agenda"), t("In Home Assistant. Hier maak en wijzig je de afspraken."))}
        ${soort("google", "calendar", t("Google Agenda"), t("Je afspraken uit Google, alleen om te lezen. Afspraken maak je in Google zelf."))}
        ${soort("apple", "calendar", t("Apple iCloud"), t("Je afspraken uit iCloud. Hier kun je er ook een bij maken."))}
      </div>
      ${velden}
      <div class="fout" role="alert"></div>
      <footer>
        <button class="btn" type="button" data-doe="naarAgendas">${veilig(t("Terug"))}</button>
        <button class="btn eerste" type="button" data-doe="voegToe">${veilig(t("Toevoegen"))}</button>
      </footer>`;
  }

  agendasHtml_(sluit) {
    const agendas = this.agendas_();
    const lijst = agendas
      .map(
        (x) => `<div class="agenda" style="--tone:${x.kleur}">
          <span class="stip"></span>
          <span class="txt"><span class="nm">${veilig(x.naam)}</span><span class="rg">${veilig(kanWoord(x.kan))}</span></span>
          ${x.toegevoegd && this.bron?.toevoegen ? `<button class="btn klein weg" type="button" data-doe="agendaWeg" data-entry="${veilig(x.toegevoegd.entry_id)}" data-naam="${veilig(x.toegevoegd.naam || x.naam)}" data-gemaakt="${x.toegevoegd.gemaakt ? "1" : ""}">${veilig(t("Weghalen"))}</button>` : ""}
        </div>`
      )
      .join("");
    return `
      <header><span class="kop"><b>${veilig(t("Agenda's"))}</b></span>${sluit}</header>
      <div class="agendas">${lijst || `<div class="leeg">${veilig(t("Nog geen agenda op deze kaart."))}</div>`}</div>
      <div class="fout" role="alert"></div>
      ${this.bron?.toevoegen ? `<footer><button class="btn eerste" type="button" data-doe="naarToevoegen">${resolve("plus")}${veilig(t("Agenda toevoegen"))}</button></footer>` : ""}`;
  }

  fout_(tekst, veld) {
    const el = this.$(".fout");
    if (el) el.textContent = tekst ?? "";
    for (const v of this.shadowRoot.querySelectorAll("[aria-invalid]")) v.removeAttribute("aria-invalid");
    if (veld) this.$(`[data-v="${veld}"], [data-t="${veld}"]`)?.setAttribute("aria-invalid", "true");
  }

  invoer_(el) {
    if (el.dataset.v && this.f_) {
      const oud = this.f_.van;
      this.f_[el.dataset.v] = el.value;
      // Een begin dat over het eind heen schuift, neemt het eind mee: een uur later.
      if (el.dataset.v === "van" && /^\d{2}:\d{2}$/.test(el.value) && this.f_.tot <= el.value && oud !== el.value) {
        const [u, m] = el.value.split(":").map(Number);
        const eind = Math.min(u * 60 + m + 60, 23 * 60 + 59);
        this.f_.tot = `${String(Math.floor(eind / 60)).padStart(2, "0")}:${String(eind % 60).padStart(2, "0")}`;
        const tot = this.$('[data-v="tot"]');
        if (tot) tot.value = this.f_.tot;
      }
      if (el.dataset.v === "datum" && this.f_.totDatum < el.value) {
        this.f_.totDatum = el.value;
        const tot = this.$('[data-v="totDatum"]');
        if (tot) tot.value = el.value;
      }
    } else if (el.dataset.t && this.t_) {
      this.t_[el.dataset.t] = el.value;
    }
  }

  tik_(e) {
    const doe = e.target.closest("[data-doe]");
    if (doe && !doe.disabled) return this.doe_(doe.dataset.doe, doe);
    const pil = e.target.closest(".pil");
    if (pil && pil.getAttribute("aria-disabled") !== "true" && this.f_) {
      this.f_.agenda = pil.dataset.agenda;
      for (const p of this.shadowRoot.querySelectorAll(".pil")) p.setAttribute("aria-checked", String(p === pil));
      return;
    }
    const schakel = e.target.closest(".schakel");
    if (schakel && this.f_) {
      this.f_.heleDag = !this.f_.heleDag;
      if (this.f_.totDatum < this.f_.datum) this.f_.totDatum = this.f_.datum;
      this.teken_();
      this.$(".schakel")?.focus();
      return;
    }
    const soort = e.target.closest(".soort");
    if (soort && this.t_ && this.t_.soort !== soort.dataset.soort) {
      this.t_.soort = soort.dataset.soort;
      this.teken_();
      this.$(`.soort[data-soort="${soort.dataset.soort}"]`)?.focus();
    }
  }

  async doe_(wat, knop) {
    if (wat === "sluit") return this.sluit();
    if (wat === "terug") return this.ga_("afspraak", this.a);
    if (wat === "wijzigen") return this.ga_("formulier", this.a);
    if (wat === "naarToevoegen") return this.ga_("toevoegen");
    if (wat === "naarAgendas") return this.ga_("agendas");
    if (this.bezig_) return;
    if (wat === "bewaar") return this.bewaar_(knop);
    if (wat === "weghalen") return this.weghalen_(knop);
    if (wat === "voegToe") return this.voegToe_(knop);
    if (wat === "agendaWeg") return this.agendaWeg_(knop);
  }

  async metKnop_(knop, bezigTekst, werk) {
    this.bezig_ = true;
    const tekst = knop.textContent;
    knop.disabled = true;
    knop.textContent = bezigTekst;
    try {
      await werk();
      return true;
    } catch (fout) {
      this.fout_(fout?.message || t("Dat lukte niet."));
      return false;
    } finally {
      this.bezig_ = false;
      if (knop.isConnected) {
        knop.disabled = false;
        knop.textContent = tekst;
      }
    }
  }

  async bewaar_(knop) {
    const hass = this.hass_;
    const uit = afspraakUit(this.f_, hass?.config?.time_zone);
    if (uit.fout) return this.fout_(uit.fout, uit.veld);
    this.fout_("");
    const a = this.a;
    const gelukt = await this.metKnop_(knop, t("Opslaan…"), () => (a ? wijzigAfspraak(hass, a, uit.event) : maakAfspraak(hass, this.f_.agenda, uit.event)));
    if (gelukt) this.sluit();
  }

  async weghalen_(knop) {
    const a = this.a;
    const ja = await vraagBevestiging({
      title: t("Afspraak verwijderen?"),
      text: a.herhaalt ? t("{titel} verdwijnt, alleen deze keer.", { titel: a.titel || t("Afspraak") }) : t("{titel} verdwijnt uit de agenda.", { titel: a.titel || t("Afspraak") }),
      confirmText: t("Verwijderen"),
    });
    if (!ja || !this.hasAttribute("open")) return;
    const gelukt = await this.metKnop_(knop, t("Verwijderen…"), () => haalAfspraakWeg(this.hass_, a));
    if (gelukt) this.sluit();
  }

  async voegToe_(knop) {
    const s = this.t_;
    const gegevens = {};
    if (s.soort === "nieuw") {
      if (!s.naam.trim()) return this.fout_(t("Geef de agenda een naam."), "naam");
      gegevens.naam = s.naam.trim();
    } else if (s.soort === "google") {
      if (!s.naam.trim()) return this.fout_(t("Geef de agenda een naam."), "naam");
      if (!googleAdres(s.adres)) return this.fout_(t("Dit is geen iCal-adres van Google Agenda. Het begint met https://calendar.google.com/calendar/ical/."), "adres");
      Object.assign(gegevens, { naam: s.naam.trim(), adres: s.adres.trim() });
    } else {
      if (!s.gebruiker.includes("@")) return this.fout_(t("Vul je Apple ID en een app-specifiek wachtwoord in."), "gebruiker");
      if (!s.wachtwoord.trim()) return this.fout_(t("Vul je Apple ID en een app-specifiek wachtwoord in."), "wachtwoord");
      Object.assign(gegevens, { gebruiker: s.gebruiker.trim(), wachtwoord: s.wachtwoord });
    }
    this.fout_("");
    const gelukt = await this.metKnop_(knop, t("Toevoegen…"), () => voegAgendaToe(this.hass_, s.soort, gegevens));
    // Het wachtwoord niet langer bewaren dan nodig.
    s.wachtwoord = "";
    if (gelukt) this.ga_("agendas");
  }

  async agendaWeg_(knop) {
    const naam = knop.dataset.naam;
    const ja = await vraagBevestiging({
      title: t("Agenda weghalen?"),
      text: knop.dataset.gemaakt
        ? t("{naam} gaat weg uit Home Assistant, met alle afspraken erin.", { naam })
        : t("{naam} staat dan niet meer op de kaart. De agenda zelf blijft bestaan.", { naam }),
      confirmText: t("Weghalen"),
    });
    if (!ja || !this.hasAttribute("open")) return;
    const gelukt = await this.metKnop_(knop, t("Weghalen…"), () => haalAgendaWeg(this.hass_, knop.dataset.entry));
    if (gelukt) this.teken_();
  }
}

meldAan("domotiapp-agenda-scherm", AgendaScherm);

/**
 * Open het ene agendascherm van deze pagina.
 * @param {{hass: () => object, agendas: () => Array, toevoegen: boolean}} bron
 * @param {"afspraak"|"formulier"|"toevoegen"|"agendas"} modus
 */
export function toonAgendaScherm(bron, modus, a = null) {
  let scherm = document.querySelector("domotiapp-agenda-scherm");
  if (!scherm) {
    scherm = document.createElement("domotiapp-agenda-scherm");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(bron, modus, a);
  return scherm;
}

/** Het open scherm, als het er is. */
export const agendaScherm = () => document.querySelector("domotiapp-agenda-scherm");
