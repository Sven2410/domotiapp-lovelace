/**
 * Music Assistant over het hele scherm.
 *
 * Dit is geen resultatenlijstje in een kaart van 56 pixels. Muziek zoeken is
 * bladeren: je typt drie letters, je kijkt naar hoesjes, je bedenkt je. Dat
 * vraagt ruimte, en die is er -- de kaart blijft klein, dit scherm gaat er
 * overheen en vult alles.
 *
 * ## Waarom dit in `document.body` hangt en niet in de kaart
 *
 * Een kaart staat in een kolom met `overflow` en `transform` eromheen. Een
 * `position: fixed` daarbinnen wordt door de browser tegen die kolom
 * uitgelijnd in plaats van tegen het scherm, en dan hangt je "volledige scherm"
 * ineens in een strook van 300 pixels. Home Assistant lost dat voor zijn eigen
 * dialogen op dezelfde manier op: het element wordt aan `document.body`
 * gehangen en daar geopend.
 *
 * ## Wat er wél en niet over de websocket gaat
 *
 * Zoeken gaat via de integratie (`media/search`), want daarvoor is de
 * MA-config-entry nodig en die hoort een kaart niet op te zoeken. De lijst met
 * gelabelde speakers ook (`media/speakers`), want een label uitrollen over
 * entiteit, apparaat en gebied is serverwerk.
 *
 * Afspelen, groeperen, shuffle en herhalen zijn gewone service-aanroepen op een
 * entiteit. Die doet dit scherm zelf: er staat geen enkele reden tegenover om
 * daar een eigen commando voor te schrijven, en elke doorgeefluik is een plek
 * waar iets stiller kan afwijken.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, baseCss } from "../theme.js";
import { resolve } from "../icons.js";
import { bindActions } from "../ha.js";

/** Hoe lang we wachten met zoeken nadat er een toets is losgelaten. */
const TIK_PAUZE_MS = 350;

/** De filterknoppen boven de resultaten, met het `media_type` dat MA verwacht. */
const SOORTEN = [
  ["", "Alles"],
  ["track", "Nummers"],
  ["album", "Albums"],
  ["artist", "Artiesten"],
  ["playlist", "Afspeellijsten"],
  ["radio", "Radio"],
];

/** Het Nederlandse woord bij een `media_type`, voor het label op een treffer. */
const SOORT_WOORD = {
  track: "Nummer",
  album: "Album",
  artist: "Artiest",
  playlist: "Afspeellijst",
  radio: "Radio",
  podcast: "Podcast",
  audiobook: "Luisterboek",
};

/** Wat er onder de naam van een treffer staat. */
function ondertitel(t) {
  const artiesten = Array.isArray(t.artists)
    ? t.artists.map((a) => (typeof a === "string" ? a : a?.name)).filter(Boolean).join(", ")
    : "";
  const album = typeof t.album === "string" ? t.album : t.album?.name;
  const woord = SOORT_WOORD[t.media_type] ?? "";
  return [artiesten, album].filter(Boolean).join(" · ") || woord;
}

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

  /* ---------------------------------------------------------------- kop */
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
  .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
  .rond .icon { width: 18px; height: 18px; }

  /* ------------------------------------------------------------ zoeken */
  .zoek { flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center; }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 10px;
    padding: 0 14px; height: 46px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 15px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  .soorten {
    flex: 0 0 auto; display: flex; gap: 8px; padding: 6px 16px 10px;
    overflow-x: auto; scrollbar-width: none;
  }
  .soorten::-webkit-scrollbar { display: none; }
  .soorten button {
    flex: 0 0 auto; padding: 7px 14px; cursor: pointer; font: inherit; font-size: 12.5px;
    border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .soorten button[aria-pressed="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    color: var(--dac-ink); font-weight: 600;
  }

  /* -------------------------------------------------------- resultaten */
  .lijst {
    flex: 1 1 auto; overflow-y: auto; padding: 4px 16px 20px;
    display: grid; gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    align-content: start;
  }

  .tr {
    display: flex; align-items: center; gap: 12px; padding: 8px;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm);
    cursor: pointer; text-align: left; font: inherit; color: inherit;
    transition: background 160ms ease, border-color 160ms ease;
  }
  .tr:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
  .tr:active { transform: scale(.99); }
  .tr .hoes {
    flex: 0 0 auto; width: 52px; height: 52px; border-radius: 9px; overflow: hidden;
    display: grid; place-items: center;
    background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
    color: var(--dac-ink-3);
  }
  .tr .hoes img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tr .hoes .icon { width: 20px; height: 20px; }
  .tr .tekst { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .tr .nm {
    font-size: 13.5px; font-weight: 500; line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .ond {
    font-size: 11.5px; color: var(--dac-ink-2); line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .soort {
    align-self: flex-start; margin-top: 2px; padding: 1px 7px; border-radius: var(--dac-radius-pill);
    font-size: 10px; letter-spacing: .04em; text-transform: none;
    background: rgba(255,255,255,.06); color: var(--dac-ink-3);
  }

  /* ------------------------------------------------------------ meldingen */
  .melding {
    grid-column: 1 / -1; margin: 30px auto; max-width: 460px; text-align: center;
    color: var(--dac-ink-2); font-size: 13.5px; line-height: 1.5;
  }
  .melding b { display: block; color: var(--dac-ink); font-size: 15px; margin-bottom: 6px; }
  .melding.fout b { color: var(--dac-bad); }

  /* -------------------------------------------------------------- speakers */
  footer {
    flex: 0 0 auto; border-top: 1px solid var(--dac-border);
    padding: 10px 16px max(12px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 8px;
  }
  footer[hidden] { display: none; }
  footer .kop {
    font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
    color: var(--dac-ink-3);
  }
  .sprekers { display: flex; gap: 8px; flex-wrap: wrap; }
  .sprekers button {
    display: flex; align-items: center; gap: 8px; padding: 7px 13px 7px 9px;
    cursor: pointer; font: inherit; font-size: 12.5px;
    border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .sprekers button .icon { width: 15px; height: 15px; }
  /* Meespelen is aan, en dat draagt de accentkleur -- net als een aanstaande
     schakelaar elders in de familie. */
  .sprekers button[aria-pressed="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 20%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 48%, transparent);
    color: var(--dac-ink);
  }
  .sprekers button[data-zelf="true"] { opacity: .75; cursor: default; }
  .sprekers button[disabled] { opacity: .4; cursor: not-allowed; }

  /* ---------------------------------------------------------------- menu */
  .menu {
    position: fixed; z-index: 2; min-width: 190px; padding: 6px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius-sm); box-shadow: 0 24px 48px -20px rgba(0,0,0,.9);
    display: flex; flex-direction: column;
  }
  .menu[hidden] { display: none; }
  .menu button {
    padding: 10px 12px; cursor: pointer; font: inherit; font-size: 13px; text-align: left;
    background: none; border: 0; border-radius: 8px; color: var(--dac-ink);
  }
  .menu button:hover { background: var(--dac-surface-hi); }
  .menu .titel {
    padding: 6px 12px 8px; font-size: 11.5px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
  }
`;

class MediaBrowser extends HTMLElement {
  static get sheet_() {
    if (!Object.hasOwn(this, "s_")) this.s_ = sheet(baseCss + css);
    return this.s_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [new.target.sheet_];
    this.soort_ = "";
    this.treffers_ = [];
    this.speakers_ = null;
    this.opruimen_ = [];
  }

  /* ------------------------------------------------------------ openen */

  /**
   * @param {object} hass
   * @param {string} entityId de speler waar dit scherm bij hoort
   * @param {string} naam
   */
  open(hass, entityId, naam) {
    this.hass = hass;
    this.entity_ = entityId;
    this.naam_ = naam;
    if (!this.gebouwd_) this.bouw_();
    this.setAttribute("open", "");
    // Escape hangt aan het document en niet aan dit element.
    //
    // Aan de host leek genoeg -- het scherm vult alles, dus de focus zit erin.
    // Maar de speakerlijst wordt bij elke toestandswijziging opnieuw getekend,
    // en dan verdwijnt de knop waar de focus op stond. De focus valt terug op
    // body, Escape komt nooit meer bij ons aan, en het scherm laat zich alleen
    // nog met het kruisje sluiten. Gemeten, niet bedacht.
    this.escape_ ??= (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    };
    document.addEventListener("keydown", this.escape_, true);
    this.$(".wie b").textContent = naam;
    this.$(".wie span").textContent = "Music Assistant";
    this.sprekerSig_ = null;
    this.haalSpeakers_();
    // Focus ná de animatie: een input die tijdens een transform focus krijgt,
    // laat sommige mobiele browsers de pagina meescrollen.
    setTimeout(() => this.$("input")?.focus(), 60);
  }

  sluit() {
    this.removeAttribute("open");
    this.menuDicht_();
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
  }

  set hass(hass) {
    this.hass_ = hass;
    if (this.gebouwd_ && this.hasAttribute("open")) this.tekenSpeakers_();
  }

  get hass() {
    return this.hass_;
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  /* ------------------------------------------------------------- opbouw */

  bouw_() {
    this.gebouwd_ = true;
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${resolve("search")}
            <input type="search" placeholder="Zoek een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search" />
          </label>
        </div>
        <nav class="soorten">
          ${SOORTEN.map(
            ([waarde, label]) =>
              `<button type="button" data-soort="${waarde}" aria-pressed="${waarde === "" }">${label}</button>`
          ).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <span class="kop">Speelt af op</span>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`;

    this.aan_(this.$(".sluit"), "click", () => this.sluit());
    this.aan_(this.$(".laag"), "pointerdown", (e) => {
      // Buiten alles klikken sluit. De kop, de lijst en de voet vangen hun
      // eigen kliks, dus dit gaat alleen over de lege ruimte ernaast.
      if (e.target === this.$(".laag")) this.sluit();
      else if (!e.target.closest(".menu")) this.menuDicht_();
    });

    const veld = this.$("input");
    this.aan_(veld, "input", () => this.tikPauze_());
    this.aan_(veld, "keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(this.timer_);
        this.zoek_();
      }
      if (e.key === "Escape") this.sluit();
    });
    this.aan_(this.$(".soorten"), "click", (e) => {
      const knop = e.target.closest("[data-soort]");
      if (!knop) return;
      this.soort_ = knop.dataset.soort;
      for (const b of this.shadowRoot.querySelectorAll("[data-soort]")) {
        b.setAttribute("aria-pressed", String(b === knop));
      }
      clearTimeout(this.timer_);
      this.zoek_();
    });

    this.aan_(this.$(".sprekers"), "click", (e) => {
      const knop = e.target.closest("[data-speaker]");
      if (knop) this.wisselSpeaker_(knop.dataset.speaker);
    });

    this.leegMelding_(
      "Zoek in Music Assistant",
      "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio."
    );
  }

  aan_(el, type, fn, opts) {
    el.addEventListener(type, fn, opts);
    this.opruimen_.push(() => el.removeEventListener(type, fn, opts));
  }

  /* ------------------------------------------------------------- zoeken */

  tikPauze_() {
    clearTimeout(this.timer_);
    // Bij elke toets zoeken overspoelt MA en zijn providers, en het resultaat
    // van de derde letter komt dan soms ná dat van de vijfde binnen.
    this.timer_ = setTimeout(() => this.zoek_(), TIK_PAUZE_MS);
  }

  async zoek_() {
    const vraag = this.$("input").value.trim();
    if (!vraag) {
      this.treffers_ = [];
      this.leegMelding_(
        "Zoek in Music Assistant",
        "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen."
      );
      return;
    }

    // Elke zoekopdracht krijgt een nummer. Alleen het antwoord op de laatste
    // wordt getekend: een trage provider mag geen oud resultaat over een nieuw
    // heen leggen.
    const beurt = (this.beurt_ = (this.beurt_ ?? 0) + 1);
    this.leegMelding_("Zoeken…", vraag);

    try {
      const antwoord = await this.hass.callWS({
        type: "domotiapp_lovelace/media/search",
        query: vraag,
        ...(this.soort_ ? { media_types: [this.soort_] } : {}),
        limit: 20,
      });
      if (beurt !== this.beurt_) return;
      this.treffers_ = antwoord?.results ?? [];
      this.teken_();
    } catch (fout) {
      if (beurt !== this.beurt_) return;
      this.leegMelding_(
        "Zoeken lukte niet",
        fout?.message ?? "Music Assistant gaf geen antwoord.",
        true
      );
    }
  }

  leegMelding_(kop, tekst, fout = false) {
    this.$(".lijst").innerHTML =
      `<div class="melding${fout ? " fout" : ""}"><b>${kop}</b>${tekst}</div>`;
  }

  teken_() {
    const lijst = this.$(".lijst");
    if (!this.treffers_.length) {
      this.leegMelding_("Niets gevonden", "Probeer een andere naam of een ander soort.");
      return;
    }
    lijst.innerHTML = this.treffers_
      .map((t, i) => {
        const hoes = t.image
          ? `<img src="${t.image}" alt="" loading="lazy" />`
          : resolve(t.media_type === "radio" ? "radio" : "music");
        return `
          <button class="tr" type="button" data-i="${i}">
            <span class="hoes">${hoes}</span>
            <span class="tekst">
              <span class="nm">${this.veilig_(t.name)}</span>
              <span class="ond">${this.veilig_(ondertitel(t))}</span>
            </span>
          </button>`;
      })
      .join("");

    // Eén binding per hertekening, en de vorige wordt opgeruimd: `bindActions`
    // hangt aan de lijst, niet aan elke knop.
    this.trefferBinding_?.();
    this.trefferBinding_ = bindActions(lijst, {
      onTap: () => {
        const t = this.laatsteTreffer_;
        if (t) this.speel_(t, "replace");
      },
      onHold: () => {
        const t = this.laatsteTreffer_;
        if (t) this.menuOpen_(t);
      },
    });
    // `bindActions` zegt of het een tik of een vasthoud was, maar niet waarop.
    // Dat lezen we bij het neergaan van de vinger.
    this.aan_(lijst, "pointerdown", (e) => {
      const knop = e.target.closest("[data-i]");
      this.laatsteTreffer_ = knop ? this.treffers_[+knop.dataset.i] : null;
      this.menuPlek_ = knop ? knop.getBoundingClientRect() : null;
    });
  }

  /** Tekst uit Music Assistant is data, geen markup. */
  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  /* ----------------------------------------------------------- afspelen */

  /** @param {"replace"|"next"|"add"} wachtrij */
  speel_(treffer, wachtrij) {
    if (!treffer?.uri) return;
    this.menuDicht_();
    this.hass.callService(
      "music_assistant",
      "play_media",
      {
        media_id: treffer.uri,
        ...(treffer.media_type ? { media_type: treffer.media_type } : {}),
        enqueue: wachtrij,
      },
      { entity_id: this.entity_ }
    );
    // Meteen weg bij "nu afspelen": je wilde muziek, niet een scherm. Bij
    // hierna en achteraan blijf je waar je bent -- daar ben je aan het stapelen.
    if (wachtrij === "replace") this.sluit();
  }

  menuOpen_(treffer) {
    const menu = this.$(".menu");
    menu.innerHTML =
      `<span class="titel">${this.veilig_(treffer.name)}</span>` +
      `<button type="button" data-w="replace">Nu afspelen</button>` +
      `<button type="button" data-w="next">Hierna afspelen</button>` +
      `<button type="button" data-w="add">Achteraan in de wachtrij</button>`;
    menu.hidden = false;

    const r = this.menuPlek_;
    const breed = 210;
    const links = Math.min(Math.max(8, (r?.left ?? 40) + 12), window.innerWidth - breed - 8);
    const boven = Math.min((r?.bottom ?? 80) + 6, window.innerHeight - 160);
    menu.style.left = `${links}px`;
    menu.style.top = `${boven}px`;

    menu.onclick = (e) => {
      const knop = e.target.closest("[data-w]");
      if (knop) this.speel_(treffer, knop.dataset.w);
    };
  }

  menuDicht_() {
    const menu = this.$(".menu");
    if (menu) menu.hidden = true;
  }

  /* ----------------------------------------------------------- speakers */

  async haalSpeakers_() {
    try {
      this.speakers_ = await this.hass.callWS({
        type: "domotiapp_lovelace/media/speakers",
      });
    } catch {
      // Geen speakerlijst is geen reden om het zoeken te blokkeren: dan staat
      // de voet er gewoon niet.
      this.speakers_ = null;
    }
    this.tekenSpeakers_();
  }

  /** Wie speelt er nu mee? De speler zelf staat altijd vooraan. */
  groepNu_() {
    const st = this.hass?.states?.[this.entity_];
    const leden = st?.attributes?.group_members;
    return new Set(Array.isArray(leden) ? leden : []);
  }

  tekenSpeakers_() {
    const voet = this.$("footer");
    if (!voet) return;
    const lijst = this.speakers_;
    if (!lijst || !lijst.label_exists || !lijst.entities?.length) {
      // Geen label geplakt: dan hoort hier uitleg te staan en geen lege balk.
      // Maar alleen als er iets te zeggen valt -- zonder Music Assistant is de
      // hele voet zinloos.
      voet.hidden = !lijst || lijst.label_exists === undefined;
      if (!voet.hidden) {
        this.$(".sprekers").innerHTML =
          `<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">` +
          `Plak het label <b>${this.veilig_(lijst?.label_name ?? "Music Assistant Media")}</b> ` +
          `op je speakers om ze hier samen te laten spelen.</span>`;
      }
      return;
    }

    voet.hidden = false;
    const groep = this.groepNu_();
    // Alleen opnieuw tekenen als er iets aan verandert. Elke hertekening gooit
    // de knop weg waar iemand net op stond -- en daarmee de focus.
    const sig = lijst.entities
      .map((s) => `${s.entity_id}:${s.entity_id === this.entity_ || groep.has(s.entity_id)}`)
      .join("|");
    if (this.sprekerSig_ === sig) return;
    this.sprekerSig_ = sig;
    this.$(".sprekers").innerHTML = lijst.entities
      .map((s) => {
        const zelf = s.entity_id === this.entity_;
        const mee = zelf || groep.has(s.entity_id);
        return `<button type="button" data-speaker="${s.entity_id}" data-zelf="${zelf}"
                  aria-pressed="${mee}" ${!zelf && !s.can_group ? "disabled" : ""}
                  title="${zelf ? "Deze kaart" : s.can_group ? "" : "Deze speaker laat zich niet koppelen"}">
                  ${resolve(mee ? "volume" : "speaker")}${this.veilig_(s.name)}</button>`;
      })
      .join("");
  }

  wisselSpeaker_(entityId) {
    if (entityId === this.entity_) return;
    const groep = this.groepNu_();
    if (groep.has(entityId)) {
      // Loskoppelen doe je bij de speaker zelf: hij verlaat de groep.
      this.hass.callService("media_player", "unjoin", {}, { entity_id: entityId });
    } else {
      // Koppelen doe je bij de speler van deze kaart: die wordt de baas van de
      // groep, en dat is ook de speler waar de muziek al op staat.
      this.hass.callService(
        "media_player",
        "join",
        { group_members: [entityId] },
        { entity_id: this.entity_ }
      );
    }
  }

  disconnectedCallback() {
    clearTimeout(this.timer_);
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
    this.trefferBinding_?.();
    for (const fn of this.opruimen_) fn();
    this.opruimen_ = [];
    this.gebouwd_ = false;
  }
}

meldAan("domotiapp-media-browser", MediaBrowser);

/**
 * Het ene scherm dat alle mediakaarten delen.
 *
 * Eén per pagina en niet één per kaart: een dashboard met zes speakers zou
 * anders zes volledige schermen in de DOM hebben staan, met zes abonnementen op
 * `hass`. Welke speler het scherm bedient wordt bij het openen meegegeven.
 */
export function toonZoekscherm(hass, entityId, naam) {
  let scherm = document.querySelector("domotiapp-media-browser");
  if (!scherm) {
    scherm = document.createElement("domotiapp-media-browser");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  scherm.open(hass, entityId, naam);
  scherm.focus?.();
  return scherm;
}
