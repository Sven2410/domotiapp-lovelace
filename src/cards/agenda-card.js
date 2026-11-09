/**
 * De agendakaart: de afspraken van de komende dagen, en zelf afspraken en agenda's maken.
 *
 * De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
 * bestaande toevoegen zoals google of apple".
 *
 *   Agenda              [kalender] [agenda's] [+ Afspraak]
 *   Vandaag
 *   ▍ hele dag      Verjaardag Mien
 *   ▍ 14:00 – 15:00 Voetbal · Sportpark
 *   Morgen
 *   ▍ 09:00 – 09:30 Tandarts Anna
 *
 * De streep heeft de kleur van de agenda. Een tik op een afspraak opent hem (`agenda-scherm.js`), met Wijzigen en
 * Verwijderen als de agenda dat kan. De kalender (sinds 0.118.0) toont alles per dag, per maand en per jaar. De knop met
 * de agenda's laat zien welke er op de kaart staan, en daar voegt de klant
 * er een toe: een nieuwe in Home Assistant, Google (alleen lezen) of Apple iCloud. Zie de kop van `agenda.py` waarom die
 * drie, en waarom Google alleen lezen.
 *
 * Welke agenda's: die in de editor gekozen zijn, plus die de klant via de kaart toevoegde (dat weet de server). Lezen gaat
 * met `calendar/event/subscribe`, dus een afspraak die ergens anders gemaakt wordt, staat er meteen. Wat de klant in het
 * scherm maakt, wijzigt of weghaalt, haalt de kaart opnieuw op (`bijWijziging`): iCloud meldt het zelf niet.
 *
 * De tijd is die van Home Assistant, niet die van het toestel (src/wandklok.js).
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { nameOf } from "../ha.js";
import { Verbindingswacht } from "../herkansing.js";
import { resolve } from "../icons.js";
import { AgendaAbonnement } from "../infoscherm-client.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { nt, t } from "../taal.js";
import { naarWand, vanWand } from "../wandklok.js";
import { DAGEN_MAX, DAGEN_STANDAARD, afsprakenVan, agendaInfo, agendasVan, dagKop, dagenUit, perDag, tijdOp } from "./agenda-logica.js";
import { ToegevoegdAbonnement, bijWijziging } from "./agenda-client.js";
import { agendaScherm, toonAgendaScherm } from "./agenda-scherm.js";
import { dagBegin, plusDagen } from "./ruimtes-logica.js";

class AgendaCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card { min-height: var(--dac-raster, 56px); padding: 12px 12px 10px; display: flex; flex-direction: column; gap: 6px; }
    :host([bare]) .card { background: none; box-shadow: none; border-color: transparent; }

    .kop { display: flex; align-items: center; gap: 8px; min-height: 36px; }
    .titel { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .knop {
      flex: 0 0 auto; height: 34px; min-width: 34px; padding: 0 10px; border-radius: var(--dac-radius-pill); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      -webkit-tap-highlight-color: transparent;
    }
    .knop .icon { width: 17px; height: 17px; }
    @media (hover: hover) { .knop:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); color: var(--dac-ink); } }
    .knop.plus { background: var(--dac-accent); border-color: var(--dac-accent); color: var(--dac-on-accent); padding: 0 12px 0 9px; }
    @media (hover: hover) { .knop.plus:hover { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent); } }

    .lijst { display: flex; flex-direction: column; gap: 2px; }
    .dag { font-size: 12px; font-weight: 600; color: var(--dac-ink-3); padding: 8px 4px 3px; }
    .dag:first-child { padding-top: 2px; }
    .af {
      display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 5px 8px 5px 4px; cursor: pointer;
      border-radius: var(--dac-radius-sm); -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .af:hover { background: var(--dac-hover); } }
    .af .streep { flex: 0 0 auto; align-self: stretch; width: 4px; border-radius: 2px; background: var(--tone); }
    .af .tijd { flex: 0 0 auto; width: 92px; font-size: 12px; color: var(--dac-ink-2); }
    .af .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .af .tt { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .af .pl { font-size: 11.5px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .leeg { font-size: 13px; color: var(--dac-ink-2); padding: 6px 4px 4px; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.toegevoegd_ = [];
    this.abos_ = new Map();
    this.afspraken_ = new Map();
    this.zichtbaar_ = [];
  }

  validate(config) {
    return { ...config, dagen: dagenUit(config.dagen), toevoegen: config.toevoegen !== false };
  }

  watched() {
    return this.ids_();
  }

  ids_() {
    return agendasVan(this.config, this.toegevoegd_);
  }

  template() {
    const c = this.config;
    this.toggleAttribute("bare", Boolean(c.bare));
    return `<div class="card surface">
        <div class="kop">
          <span class="titel">${escapeHtml(c.titel || t("Agenda"))}</span>
          <button class="knop" type="button" data-doe="kalender" aria-label="${escapeHtml(t("Kalender"))}" title="${escapeHtml(t("Kalender"))}">${resolve("calendar")}</button>
          <button class="knop" type="button" data-doe="agendas" aria-label="${escapeHtml(t("Agenda's"))}" title="${escapeHtml(t("Agenda's"))}">${resolve("cog")}</button>
          <button class="knop plus" type="button" data-doe="nieuw">${resolve("plus")}<span>${escapeHtml(t("Afspraak"))}</span></button>
        </div>
        <div class="lijst"></div>
      </div>`;
  }

  wire() {
    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));
    const tik = (e) => {
      const doe = e.target.closest("[data-doe]");
      if (doe) return this.doe_(doe.dataset.doe);
      const af = e.target.closest(".af");
      if (af) toonAgendaScherm(this.bron_(), "afspraak", this.zichtbaar_[Number(af.dataset.i)]);
    };
    this.on(kaart, "click", tik);
    this.on(kaart, "keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest(".af")) {
        e.preventDefault();
        tik(e);
      }
    });

    this.toegevoegdAbo_ = new ToegevoegdAbonnement((lijst) => {
      this.toegevoegd_ = lijst;
      this.abonneer_();
      this.paint();
      agendaScherm()?.ververs();
    });
    this.toegevoegdAbo_.start(this.hass);
    this.zonderHass_ = !this.hass;

    // Na middernacht een nieuw venster; elke minuut opnieuw tekenen, zodat wat voorbij is verdwijnt.
    const plan = () => {
      this.klok_ = setTimeout(() => {
        if (this.dag_ !== this.vandaag_()) this.abonneer_(true);
        this.paint();
        plan();
      }, 60000 - (Date.now() % 60000) + 50);
    };
    plan();
    this.abonneer_(true);
    this.teardown_.push(
      bijWijziging((agenda) => {
        for (const [id, abo] of this.abos_) if (!agenda || id === agenda) abo.start(this.hass);
      })
    );
    this.teardown_.push(() => {
      clearTimeout(this.klok_);
      this.toegevoegdAbo_?.stop();
      for (const abo of this.abos_.values()) abo.stop();
      this.abos_.clear();
      this.afspraken_.clear();
      this.dag_ = null;
    });
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (!this.wired_) return;
    if (terug || this.zonderHass_) {
      this.zonderHass_ = false;
      this.toegevoegdAbo_?.start(hass);
      for (const abo of this.abos_.values()) abo.start(hass);
    }
  }

  get hass() {
    return super.hass;
  }

  tz_() {
    return this.hass?.config?.time_zone;
  }

  nu_() {
    return naarWand(new Date(), this.tz_());
  }

  vandaag_() {
    return dagBegin(this.nu_()).getTime();
  }

  /** Per agenda een abonnement op vandaag tot `dagen` vooruit. Alleen wat er bij of af kwam, of alles bij een nieuwe dag. */
  abonneer_(alles = false) {
    if (alles) {
      for (const abo of this.abos_.values()) abo.stop();
      this.abos_.clear();
      this.afspraken_.clear();
    }
    const ids = this.ids_();
    for (const [id, abo] of this.abos_) {
      if (!ids.includes(id)) {
        abo.stop();
        this.abos_.delete(id);
        this.afspraken_.delete(id);
      }
    }
    this.dag_ = this.vandaag_();
    const van = dagBegin(this.nu_());
    const tot = plusDagen(van, this.config.dagen);
    for (const id of ids) {
      if (this.abos_.has(id)) continue;
      const abo = new AgendaAbonnement(id, vanWand(van, this.tz_()), vanWand(tot, this.tz_()), (events) => {
        if (this.abos_.get(id) !== abo) return;
        if (events) this.afspraken_.set(id, afsprakenVan(events, this.tz_(), id));
        this.paint();
      });
      this.abos_.set(id, abo);
      if (this.hass) abo.start(this.hass);
    }
  }

  info_() {
    return agendaInfo(
      this.hass?.states,
      this.ids_(),
      this.toegevoegd_,
      (id) => nameOf(this.hass, id),
      (id) => this.hass?.entities?.[id]?.platform ?? null
    ).map((x) => ({ ...x, kleur: TONES[x.toon] }));
  }

  /** Wat het scherm van deze kaart wil weten. */
  bron_() {
    return { hass: () => this.hass, agendas: () => this.info_(), toevoegen: this.config.toevoegen };
  }

  doe_(wat) {
    const info = this.info_();
    if (wat === "agendas") return toonAgendaScherm(this.bron_(), "agendas");
    if (wat === "kalender") return toonAgendaScherm(this.bron_(), "kalender");
    // Nog geen agenda om in te schrijven: dan eerst er een toevoegen.
    if (!info.some((x) => x.kan.maken)) return toonAgendaScherm(this.bron_(), this.config.toevoegen ? "toevoegen" : "agendas");
    return toonAgendaScherm(this.bron_(), "formulier");
  }

  paint() {
    const lijst = this.$(".lijst");
    if (!lijst || !this.hass) return;
    const info = new Map(this.info_().map((x) => [x.id, x]));
    const nu = this.nu_();
    const dagen = perDag([...this.afspraken_.values()].flat(), nu, this.config.dagen);
    this.$(".plus").hidden = !this.config.toevoegen && ![...info.values()].some((x) => x.kan.maken);

    let html = "";
    const zichtbaar = [];
    if (!info.size) {
      html = `<div class="leeg">${escapeHtml(this.config.toevoegen ? t("Nog geen agenda. Voeg er een toe met de knop hierboven.") : t("Nog geen agenda op deze kaart."))}</div>`;
    } else if (!dagen.length) {
      html = `<div class="leeg">${escapeHtml(t("Geen afspraken de komende {n} dagen.", { n: this.config.dagen }))}</div>`;
    } else {
      for (const d of dagen) {
        html += `<div class="dag">${escapeHtml(dagKop(d.dag, nu))}</div>`;
        for (const a of d.afspraken) {
          const i = zichtbaar.push(a) - 1;
          const ag = info.get(a.agenda);
          const onder = [a.plaats, info.size > 1 ? ag?.naam : ""].filter(Boolean).join(" · ");
          html += `<div class="af" role="button" tabindex="0" data-i="${i}" style="--tone:${TONES[ag?.toon] ?? TONES.accent}">
              <span class="streep"></span>
              <span class="tijd tnum">${escapeHtml(tijdOp(a, d.dag))}</span>
              <span class="txt"><span class="tt">${escapeHtml(a.titel || t("Afspraak"))}</span>${onder ? `<span class="pl">${escapeHtml(onder)}</span>` : ""}</span>
            </div>`;
        }
      }
    }
    this.zichtbaar_ = zichtbaar;
    if (lijst.dataset.html !== html) {
      lijst.dataset.html = html;
      lijst.innerHTML = html;
    }
    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-agenda-card-editor");
  }

  static getStubConfig(hass) {
    const agenda = Object.keys(hass?.states ?? {}).find((e) => e.startsWith("calendar."));
    return agenda ? { agendas: [agenda] } : {};
  }
}

class AgendaEditor extends DacEditor {
  defaults() {
    return { dagen: DAGEN_STANDAARD, toevoegen: true };
  }

  schema() {
    return [
      { name: "titel", selector: sel.text() },
      { name: "agendas", selector: { entity: { domain: "calendar", multiple: true } } },
      { name: "dagen", selector: sel.number(1, DAGEN_MAX) },
      { name: "toevoegen", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      {
        titel: t("Titel"),
        agendas: t("Agenda's"),
        dagen: t("Dagen vooruit"),
        toevoegen: t("De klant mag agenda's toevoegen"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      titel: t("Leeg laten: Agenda."),
      agendas: t("Agenda's die de klant zelf toevoegt, staan er vanzelf bij."),
      toevoegen: t("Een nieuwe agenda in Home Assistant, Google Agenda of Apple iCloud. Afspraken maken kan altijd, in een agenda die dat kan."),
    }[s.name];
  }
}

registerEditor("domotiapp-agenda-card-editor", AgendaEditor);
registerCard("domotiapp-agenda-card", AgendaCard, {
  name: nt("DomotiApp Agenda"),
  description: nt("De afspraken van de komende dagen. De klant maakt zelf afspraken, en voegt een agenda toe: nieuw, Google of Apple."),
});

export { AgendaCard };
