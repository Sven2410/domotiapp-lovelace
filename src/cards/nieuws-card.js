/**
 * De nieuwskaart: het nieuws van een paar Nederlandse bronnen, zoals het NOS-nieuws op het infoscherm bij de receptie.
 *
 * De eigenaar, 8 november 2026: "Ik wil ook wat je bij de receptie hebt iets van NOS nieuws. Dat kan een popup zijn en dan
 * in de navigatiebalk dat ik hem toevoeg. Dus een nieuwskaart". En daarna: "een navigatie menu bovenaan zoals NOS, AD etc
 * (...) en welke je aanklikt dan de sub catogorienen zoals algemeen, sport etc".
 *
 *   NOS   NU.nl   AD   RTL Nieuws ...        de bronnen; weg als er maar één is gekozen
 *   Algemeen  Binnenland  Sport ...          de rubrieken van die bron; weg als hij er maar één heeft
 *   [foto] Titel van het bericht
 *          NOS · 12 min geleden              een tik klapt de samenvatting open, met een link
 *
 * Beide rijen vegen opzij als ze niet passen. Hij past in een pop-up, met een knop in de navigatiebalk; daarvoor is er
 * ook een eigen icoon, `nieuws`.
 *
 * De kaart haalt niets zelf op. Hij vraagt de server om één rubriek (`nieuws.py`), en de server kent de adressen. Om het
 * kwartier opnieuw, en meteen als de pagina weer in beeld komt en het langer geleden is: een tablet die 's nachts uit
 * stond, hoort 's ochtends niet het nieuws van gisteren te tonen. Wat er gekozen is, onthoudt alleen dit scherm, tot het
 * opnieuw laadt; dan begint hij weer bij de eerste bron, Algemeen.
 */

import { DacCard, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { Herkansing, Verbindingswacht, nogNietGereed } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { nt, t } from "../taal.js";
import { naarWand } from "../wandklok.js";
import { relatieveTijd } from "./infoscherm-logica.js";
import { AANTAL_MAX, AANTAL_STANDAARD, BRONNEN, RUBRIEKEN, VERVERS_MS, aantalUit, bronnenUit, keuze, rubriekenVan, veiligeLink } from "./nieuws-logica.js";

const COMMANDO = "domotiapp_lovelace/nieuws";

class NieuwsCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card { min-height: var(--dac-raster, 56px); padding: 10px 6px 6px; display: flex; flex-direction: column; gap: 6px; }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- de twee rijen bovenaan: opzij vegen, zonder balk ---- */
    .rij { position: relative; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 0 6px; flex: 0 0 auto; }
    .rij::-webkit-scrollbar { display: none; }
    .bron {
      flex: 0 0 auto; height: 32px; padding: 0 14px; border-radius: 999px;
      display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; white-space: nowrap;
      border: 1px solid var(--dac-border); color: var(--dac-ink-2); cursor: pointer;
      -webkit-tap-highlight-color: transparent; user-select: none;
      transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
    }
    @media (hover: hover) { .bron:not([aria-selected="true"]):hover { background: var(--dac-hover); } }
    .bron[aria-selected="true"] { background: var(--dac-accent); border-color: var(--dac-accent); color: var(--dac-on-accent); }

    .rubrieken { gap: 2px; box-shadow: inset 0 -1px 0 rgba(var(--dac-tint), .08); }
    .rubriek {
      flex: 0 0 auto; padding: 7px 9px 8px; font-size: 12.5px; font-weight: 500; white-space: nowrap;
      color: var(--dac-ink-3); cursor: pointer; border-bottom: 2px solid transparent;
      -webkit-tap-highlight-color: transparent; user-select: none;
    }
    @media (hover: hover) { .rubriek:hover { color: var(--dac-ink); } }
    .rubriek[aria-selected="true"] { color: var(--dac-ink); border-bottom-color: var(--dac-accent-hi); }

    /* ---- de berichten ---- */
    .lijst { display: flex; flex-direction: column; }
    .bericht {
      display: flex; flex-direction: column; gap: 8px; padding: 9px 8px;
      border-radius: var(--dac-radius-sm); cursor: pointer;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }
    .bericht + .bericht { box-shadow: 0 -1px 0 rgba(var(--dac-tint), .07); }
    @media (hover: hover) { .bericht:hover { background: var(--dac-hover); } }
    .kop { display: flex; align-items: flex-start; gap: 11px; min-width: 0; }
    .foto {
      flex: 0 0 auto; width: 76px; height: 50px; border-radius: 8px; overflow: hidden;
      background: rgba(var(--dac-tint), .06);
    }
    .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .titel {
      font-size: 13.5px; font-weight: 600; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .bericht[data-open] .titel { -webkit-line-clamp: unset; }
    .meta { font-size: 11.5px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .uitleg { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); }
    .lees { align-self: flex-start; font-size: 12.5px; font-weight: 600; color: var(--dac-accent-hi); text-decoration: none; padding: 2px 0; }
    @media (hover: hover) { .lees:hover { text-decoration: underline; } }

    .status { padding: 12px 10px; font-size: 12.5px; color: var(--dac-ink-3); text-align: center; }
    .status:empty { display: none; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.keuze_ = null;
    this.items_ = null;
    this.fout_ = null;
    this.open_ = null;
    this.gehaald_ = 0;
    this.vraag_ = 0;
  }

  validate(config) {
    return { ...config, bronnen: bronnenUit(config.bronnen), aantal: aantalUit(config.aantal) };
  }

  watched() {
    return [];
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    // Na een andere config een keuze die nog bestaat houden, anders de eerste bron.
    this.keuze_ = keuze(this.config.bronnen, this.keuze_?.bron, this.keuze_?.rubriek ?? "algemeen");
    return `<div class="card surface">
        <div class="rij bronnen" role="tablist" aria-label="${escapeHtml(t("Nieuwsbron"))}"></div>
        <div class="rij rubrieken" role="tablist" aria-label="${escapeHtml(t("Rubriek"))}"></div>
        <div class="lijst"></div>
        <div class="status"></div>
      </div>`;
  }

  wire() {
    const kaart = this.$(".card");
    const tik = (e) => {
      const bron = e.target.closest(".bron");
      if (bron) return this.kies_(bron.dataset.bron, this.keuze_.rubriek);
      const rubriek = e.target.closest(".rubriek");
      if (rubriek) return this.kies_(this.keuze_.bron, rubriek.dataset.rubriek);
      // Een tik op de link is de link, geen dichtklappen.
      if (e.target.closest("a")) return;
      const bericht = e.target.closest(".bericht");
      if (!bericht) return;
      this.open_ = this.open_ === bericht.dataset.id ? null : bericht.dataset.id;
      this.paintLijst_();
      this.$(".bericht[data-open]")?.focus({ preventScroll: true });
    };
    this.on(kaart, "click", tik);
    this.on(kaart, "keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a") && e.target.closest(".bron, .rubriek, .bericht")) {
        e.preventDefault();
        tik(e);
      }
    });
    this.wielOpzij_(this.$(".bronnen"));
    this.wielOpzij_(this.$(".rubrieken"));
    this.teardown_.push(volgRaster(kaart));

    const zichtbaar = () => {
      if (document.visibilityState === "visible" && Date.now() - this.gehaald_ >= VERVERS_MS) this.haal_();
    };
    this.on(document, "visibilitychange", zichtbaar);
    // Om het kwartier opnieuw, en elke minuut de tijden ("12 min geleden").
    const klok = setInterval(() => {
      if (Date.now() - this.gehaald_ >= VERVERS_MS) this.haal_();
      else this.paintLijst_();
    }, 60000);
    this.teardown_.push(() => clearInterval(klok), () => this.herkansing_.stop());
    this.paintRijen_();
    this.haal_();
  }

  /** Een muiswiel op een laptop kan niet opzij; omhoog en omlaag schuift de rij dan (net als de ruimtes op de automatiseringskaart). */
  wielOpzij_(rij) {
    this.on(
      rij,
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || rij.scrollWidth <= rij.clientWidth) return;
        e.preventDefault();
        rij.scrollLeft += e.deltaY;
      },
      { passive: false }
    );
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    const eerste = !this.hass;
    super.hass = hass;
    if (this.wired_ && (terug || (eerste && !this.items_))) this.haal_();
  }

  get hass() {
    return super.hass;
  }

  kies_(bron, rubriek) {
    const nieuw = keuze(this.config.bronnen, bron, rubriek);
    if (nieuw.bron === this.keuze_.bron && nieuw.rubriek === this.keuze_.rubriek) return;
    this.keuze_ = nieuw;
    this.items_ = null;
    this.fout_ = null;
    this.open_ = null;
    this.paintRijen_();
    this.paintLijst_();
    this.haal_();
  }

  async haal_() {
    const hass = this.hass;
    if (!hass?.connection || !this.keuze_) return;
    const { bron, rubriek } = this.keuze_;
    const nr = ++this.vraag_;
    try {
      const uit = await hass.connection.sendMessagePromise({ type: COMMANDO, bron, rubriek });
      // Intussen een andere rubriek gekozen: dit antwoord hoort niet meer bij het scherm.
      if (nr !== this.vraag_) return;
      this.items_ = uit?.items ?? [];
      this.fout_ = this.items_.length || !uit?.fout ? null : t("Het nieuws kon niet opgehaald worden.");
      this.gehaald_ = Date.now();
      this.herkansing_.herstel();
    } catch (fout) {
      if (nr !== this.vraag_) return;
      // Net na een herstart kent Home Assistant het commando nog niet (valkuil 28): dan straks opnieuw.
      if (nogNietGereed(fout) && this.herkansing_.plan()) return;
      if (!this.items_?.length) this.fout_ = t("Het nieuws kon niet opgehaald worden.");
    }
    this.paintLijst_();
  }

  paint() {
    this.paintRijen_();
    this.paintLijst_();
  }

  paintRijen_() {
    const bronnen = this.$(".bronnen");
    if (!bronnen || !this.keuze_) return;
    const { bron, rubriek } = this.keuze_;
    const rubrieken = rubriekenVan(bron);
    const sig = JSON.stringify([this.config.bronnen, bron, rubriek]);
    if (bronnen.dataset.sig === sig) return;
    bronnen.dataset.sig = sig;

    bronnen.hidden = this.config.bronnen.length < 2;
    bronnen.innerHTML = this.config.bronnen
      .map((b) => `<span class="bron" role="tab" tabindex="0" data-bron="${b}" aria-selected="${b === bron}">${escapeHtml(BRONNEN[b].naam)}</span>`)
      .join("");
    const rij = this.$(".rubrieken");
    rij.hidden = rubrieken.length < 2;
    rij.innerHTML = rubrieken
      .map((r) => `<span class="rubriek" role="tab" tabindex="0" data-rubriek="${r}" aria-selected="${r === rubriek}">${escapeHtml(t(RUBRIEKEN[r]))}</span>`)
      .join("");
    // De gekozen bron en rubriek in beeld, ook als ze ver rechts staan. Met de hand en niet met scrollIntoView: dat schuift
    // ook de pop-up of de pagina omhoog of omlaag.
    for (const el of this.$$('[aria-selected="true"]')) {
      const r = el.parentElement;
      if (el.offsetLeft < r.scrollLeft) r.scrollLeft = el.offsetLeft - 6;
      else if (el.offsetLeft + el.offsetWidth > r.scrollLeft + r.clientWidth) r.scrollLeft = el.offsetLeft + el.offsetWidth - r.clientWidth + 6;
    }
  }

  paintLijst_() {
    const lijst = this.$(".lijst");
    if (!lijst) return;
    const items = (this.items_ ?? []).slice(0, this.config.aantal);
    const tz = this.hass?.config?.time_zone;
    const nu = naarWand(new Date(), tz);
    if (this.open_ && !items.some((i) => i.id === this.open_)) this.open_ = null;

    const sig = JSON.stringify([items.map((i) => [i.id, i.titel, i.datum]), this.open_, Math.floor(nu.getTime() / 60000)]);
    if (lijst.dataset.sig !== sig) {
      lijst.dataset.sig = sig;
      lijst.innerHTML = items
        .map((i) => {
          const open = i.id === this.open_;
          const link = veiligeLink(i.link);
          const foto = veiligeLink(i.afbeelding);
          const wanneer = i.datum ? relatieveTijd(naarWand(new Date(i.datum), tz), nu) : "";
          return `<div class="bericht" role="button" tabindex="0" aria-expanded="${open}" data-id="${escapeHtml(i.id)}"${open ? " data-open" : ""}>
              <div class="kop">
                ${foto ? `<span class="foto"><img alt="" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(foto)}"></span>` : ""}
                <span class="tekst">
                  <span class="titel">${escapeHtml(i.titel)}</span>
                  <span class="meta">${escapeHtml([i.bron, wanneer].filter(Boolean).join(" · "))}</span>
                </span>
              </div>
              ${open && i.tekst ? `<div class="uitleg">${escapeHtml(i.tekst)}</div>` : ""}
              ${open && link ? `<a class="lees" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("Lees het hele bericht"))}</a>` : ""}
            </div>`;
        })
        .join("");
    }
    this.text(".status", items.length ? "" : this.fout_ ?? (this.items_ ? t("Geen nieuws.") : t("Nieuws ophalen…")));
    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-nieuws-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

class NieuwsEditor extends DacEditor {
  defaults() {
    return { aantal: AANTAL_STANDAARD };
  }

  schema() {
    return [
      {
        name: "bronnen",
        selector: { select: { multiple: true, mode: "list", options: Object.entries(BRONNEN).map(([value, b]) => ({ value, label: b.naam })) } },
      },
      { name: "aantal", selector: sel.number(1, AANTAL_MAX) },
    ];
  }

  label(s) {
    return { bronnen: t("Nieuwsbronnen bovenaan"), aantal: t("Hoeveel berichten") }[s.name] ?? super.label(s);
  }

  helper(s) {
    return s.name === "bronnen" ? t("Niets aangevinkt: allemaal. De eerste is waar de kaart mee begint. De rubrieken komen vanzelf.") : undefined;
  }
}

registerEditor("domotiapp-nieuws-card-editor", NieuwsEditor);
registerCard("domotiapp-nieuws-card", NieuwsCard, {
  name: nt("DomotiApp Nieuws"),
  description: nt("Het nieuws van de NOS, NU.nl, het AD en meer: bovenaan de bron, daaronder de rubriek. Past in een pop-up."),
});

export { NieuwsCard };
