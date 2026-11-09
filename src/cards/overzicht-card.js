/**
 * De overzichtskaart voor een tablet: het weer en wat er belangrijk is, en als dat aan staat links de favorieten.
 *
 * Afval, lampen en wie er thuis is staan er sinds 0.113.0 niet meer op: die heeft de eigenaar al op een eigen kaart of
 * badge (zie de kop van overzicht-logica.js).
 *
 * De eigenaar, 8 november 2026: "ik ben toch niet tevreden met die header kaart. Ik wil een nieuwe kaart maken. Voor ipad
 * links komen dan de favorieten en rechts moet een soort info scherm komen met weer en belangrijke dingen".
 *
 * **De favorieten staan er sinds 0.118.0 standaard NIET op** (`favorieten`, in de editor). De eigenaar, 9 november 2026:
 * "ik wil dat die kaart niet de favorieten laat zien. Die favorieten moeten gewoon links blijven staan op hun eigen kaart."
 * Dan vult het overzicht zijn sectie, en staat de favorietenkaart in de sectie ernaast. Een halve sectie (6 kolommen) is
 * te smal: gemeten 234 pixels.
 *
 * Staan ze aan, dan staat links de favorietenkaart zelf (`domotiapp-favorieten-card`, als kind in deze kaart), en niet een
 * tweede uitvoering ervan: wat de klant op de automatiseringskaart maakt, staat hier precies zo. Behalve de regel "Nog geen
 * favorieten. Maak ze in de woninginstellingen.": die staat hier niet, op zijn verzoek van 8 november 2026. Zonder
 * favorieten is er geen linkerhelft, en staat het overzicht over de hele breedte.
 *
 * Rechts, van boven naar onder:
 *   - de begroeting, de datum en de klok, op de tijd van Home Assistant (src/wandklok.js);
 *   - het weer: nu groot, met de hoogste en laagste van vandaag, en de dagen erna op een rij;
 *   - de regels die ertoe doen (`regels` in overzicht-logica.js). Een regel staat er alleen als er iets te melden is.
 *
 * Breder dan ONGEVEER een telefoon staan de twee naast elkaar; smaller staat het weer boven de favorieten. Dat gaat met
 * een containerquery (valkuil 46): de kaart kijkt naar haar eigen breedte, niet naar die van het venster.
 *
 * **Elk deel is te verbergen** (sinds 0.120.0, `toon_<deel>`, zie `zichtbaar` in overzicht-logica.js): begroeting, datum,
 * klok, weer, agenda en de knoppen eronder, "Let op", melders en batterijen. Een verborgen agenda haalt ook niets op.
 *
 * De hoogte komt op de rasterrijen uit via `meetRaster`. De twee helften staan naast elkaar, dus het vak heeft er één
 * kind (de rij) en niet twee (valkuil 74). Het vlak achter de rechterhelft is een eigen laag die de hele hoogte vult, ook
 * als de favorieten hoger zijn dan het overzicht: anders loopt dat vlak een halve rij voor het eind van de kaart dood.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor, toneValue } from "../base.js";
import { DacEditor, section, sel } from "../editor/base.js";
import { attrsOf, fmtNumber, isDead, localizeState, moreInfo, nameOf, stateOf } from "../ha.js";
import { BlijvendAbonnement, Verbindingswacht } from "../herkansing.js";
import { icons, resolve, weatherIcon } from "../icons.js";
import { AgendaAbonnement } from "../infoscherm-client.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { locale, nt, t } from "../taal.js";
import { naarWand, vanWand } from "../wandklok.js";
import { afsprakenVan, agendaInfo, agendasVan, kan, volgendeUitToestand } from "./agenda-logica.js";
import { ToegevoegdAbonnement, bijWijziging } from "./agenda-client.js";
import { agendaScherm, toonAgendaScherm } from "./agenda-scherm.js";
import {
  AGENDA_DAGEN,
  AGENDA_DAGEN_MAX,
  AGENDA_VOORUIT,
  ALARMEN,
  BATTERIJ_GRENS,
  ONDERDELEN,
  afsprakenOpKaart,
  agendaTot,
  alarmen,
  batterijenLeeg,
  groet,
  regels,
  staatOpen,
  zichtbaar,
} from "./overzicht-logica.js";

const DAGEN_STANDAARD = 5;
const DAGEN_MAX = 7;

/** De windstreken, Nederlands; vertaald waar ze getoond worden. */
const WINDSTREKEN = [nt("N"), nt("NO"), nt("O"), nt("ZO"), nt("Z"), nt("ZW"), nt("W"), nt("NW")];

const lijst = (waarde) => (Array.isArray(waarde) ? waarde : waarde ? [waarde] : []).filter(Boolean);

/** De voornaam: "Bram Visser" wordt "Bram". Op een scherm in de gang is dat genoeg. */
const voornaam = (naam) => String(naam ?? "").trim().split(/\s+/)[0] ?? "";

class OverzichtCard extends DacCard {
  static css = /* css */ `
    :host { display: block; container-type: inline-size; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card { position: relative; min-height: var(--dac-raster, 56px); }
    .rij {
      display: grid; gap: 8px; align-items: start;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .links { min-width: 0; }

    /* Het vlak achter de rechterhelft, over de hele hoogte van de kaart. Het staat IN de rij en niet naast de rij: meetRaster
       telt de kinderen van het vak op, en een vlak zo hoog als de kaart laat de kaart dan bij elke meting een rij groeien
       (gemeten op 8 november 2026: 1.387.768 pixels). Een grid zonder positie geeft het door aan .card. */
    .achter {
      position: absolute; top: 0; bottom: 0; right: 0; width: calc(50% - 4px);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius); pointer-events: none;
    }
    :host([bare]) .achter { background: none; }
    .info { position: relative; min-width: 0; padding: 14px 16px 12px; display: flex; flex-direction: column; gap: 12px; }

    /* Zonder favorieten geen lege linkerhelft: het overzicht over de hele breedte. */
    .rij.alleen, .rij:has(domotiapp-favorieten-card[leeg]) { grid-template-columns: minmax(0, 1fr); }
    .rij.alleen .links, .rij:has(domotiapp-favorieten-card[leeg]) .links { display: none; }
    .rij.alleen .achter, .rij:has(domotiapp-favorieten-card[leeg]) .achter { width: 100%; }

    /* Smal: het overzicht boven de favorieten, en het vlak om het overzicht zelf. */
    @container (max-width: 599px) {
      .rij { grid-template-columns: minmax(0, 1fr); }
      .info { order: -1; background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); }
      :host([bare]) .info { background: none; }
      .achter { display: none; }
    }

    /* ---- kop ---- */
    .kop { display: flex; align-items: flex-start; gap: 12px; }
    .wie { flex: 1 1 auto; min-width: 0; }
    .hallo {
      font-size: 17px; font-weight: 400; letter-spacing: -.01em; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hallo b { font-weight: 600; }
    .datum { margin-top: 2px; font-size: 12px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .klok { flex: 0 0 auto; font-size: 30px; font-weight: 300; letter-spacing: -.02em; line-height: 1; }

    /* ---- weer ---- */
    .weer { display: flex; flex-direction: column; gap: 10px; }
    .nu {
      display: flex; align-items: center; gap: 12px; min-width: 0;
      cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: var(--dac-radius-sm);
    }
    .nu .chip { width: 44px; height: 44px; }
    .nu .chip .icon, .nu .chip ha-icon { width: 24px; height: 24px; --mdc-icon-size: 24px; }
    .graden { flex: 0 0 auto; font-size: 34px; font-weight: 300; letter-spacing: -.03em; line-height: 1; }
    .graden small { font-size: 14px; color: var(--dac-ink-3); margin-left: 2px; vertical-align: .9em; letter-spacing: 0; }
    .txt { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .cond { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .details { display: flex; flex-wrap: wrap; gap: 2px 12px; font-size: 12px; color: var(--dac-ink-2); }
    .details span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .details .icon { width: 13px; height: 13px; color: var(--tone); }
    .details:empty { display: none; }

    .dagen { display: grid; gap: 4px; grid-template-columns: repeat(var(--n, 5), minmax(0, 1fr)); }
    .dagen:empty { display: none; }
    .dag {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 6px 2px; border-radius: var(--dac-radius-sm);
      background: rgba(var(--dac-tint), .04);
    }
    .dag .wanneer { font-size: 10.5px; font-weight: 600; letter-spacing: .04em; color: var(--dac-ink-3); }
    .dag .icon { width: 20px; height: 20px; color: var(--tone); }
    .dag .max { font-size: 12.5px; font-weight: 600; }
    .dag .min { font-size: 11px; color: var(--dac-ink-3); }

    /* ---- de regels ---- */
    .lijst { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--dac-border); padding-top: 8px; }
    .lijst:empty { display: none; }
    /* Staan kop en weer er niet, dan is de lijst het eerste: dan geen streep erboven. */
    .kop[hidden] + .weer[hidden] + .lijst { border-top: 0; padding-top: 0; }
    .wie[hidden] + .klok { margin-left: auto; }
    .regel {
      display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 0 6px 0 2px;
      border-radius: var(--dac-radius-sm); -webkit-tap-highlight-color: transparent;
    }
    .regel[data-entity], .regel[data-kalender] { cursor: pointer; }
    @media (hover: hover) { .regel[data-entity]:hover, .regel[data-kalender]:hover { background: var(--dac-hover); } }
    .regel .chip { width: 28px; height: 28px; }
    .regel .chip .icon, .regel .chip ha-icon { width: 16px; height: 16px; --mdc-icon-size: 16px; }
    .regel .tekst { flex: 1 1 auto; min-width: 0; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .regel .bij { flex: 0 0 auto; max-width: 45%; font-size: 12px; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .regel[data-toon="bad"] .bij { color: var(--dac-bad); font-weight: 600; }
    .regel[data-toon="warn"] .bij { color: var(--dac-warn); }

    /* ---- agenda: bekijken, toevoegen, een afspraak maken ---- */
    .acties { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
    .lijst:empty + .acties { border-top: 1px solid var(--dac-border); padding-top: 10px; }
    .kop[hidden] + .weer[hidden] + .lijst:empty + .acties { border-top: 0; padding-top: 0; }
    .knop {
      flex: 0 0 auto; height: 32px; min-width: 32px; padding: 0 11px 0 9px; border-radius: var(--dac-radius-pill); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font: inherit; font-size: 12.5px; font-weight: 600; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      -webkit-tap-highlight-color: transparent;
    }
    .knop .icon { width: 16px; height: 16px; }
    @media (hover: hover) { .knop:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); color: var(--dac-ink); } }
    .knop.plus { background: var(--dac-accent); border-color: var(--dac-accent); color: var(--dac-on-accent); }
    @media (hover: hover) { .knop.plus:hover { background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent); } }

    .unavailable { opacity: .42; }
    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.voorspelling_ = null;
    this.agendaAbos_ = new Map();
    this.afspraken_ = new Map();
    this.toegevoegd_ = [];
    this.rijen_ = [];
  }

  validate(config) {
    const getal = (waarde, min, max, standaard) => {
      const n = waarde === "" || waarde == null ? NaN : Number(waarde);
      return Number.isFinite(n) ? Math.min(Math.max(min, Math.round(n)), max) : standaard;
    };
    return {
      ...config,
      dagen: getal(config.dagen, 0, DAGEN_MAX, DAGEN_STANDAARD),
      agenda_dagen: getal(config.agenda_dagen, 1, AGENDA_DAGEN_MAX, AGENDA_DAGEN),
      agenda_toevoegen: config.agenda_toevoegen !== false,
      favorieten: config.favorieten === true,
    };
  }

  watched() {
    const c = this.config;
    const z = zichtbaar(c);
    return [
      z.weer && c.weer,
      ...this.agendaIds_(),
      ...(z.letop ? lijst(c.letop) : []),
      ...(z.melders ? lijst(c.melders) : []),
      ...(z.batterijen ? lijst(c.batterijen) : []),
    ].filter(Boolean);
  }

  template() {
    const c = this.config;
    const z = zichtbaar(c);
    const verborgen = (aan) => (aan ? "" : " hidden");
    this.toggleAttribute("bare", Boolean(c.bare));
    return `
      <div class="card">
        <div class="rij${c.favorieten ? "" : " alleen"}">
          <div class="achter"></div>
          <div class="links"></div>
          <div class="info">
            <div class="kop"${verborgen(z.begroeting || z.datum || z.klok)}>
              <div class="wie"${verborgen(z.begroeting || z.datum)}><div class="hallo"${verborgen(z.begroeting)}></div><div class="datum"${verborgen(z.datum)}></div></div>
              <div class="klok tnum"${verborgen(z.klok)}></div>
            </div>
            <div class="weer"${verborgen(z.weer && c.weer)}>
              <div class="nu" role="button" tabindex="0">
                <span class="chip" style="--tone:${TONES.accent}"></span>
                <span class="graden tnum"></span>
                <span class="txt"><span class="cond"></span><span class="details"></span></span>
              </div>
              <div class="dagen"></div>
            </div>
            <div class="lijst"></div>
            <div class="acties" hidden>
              <button class="knop" type="button" data-doe="kalender">${resolve("calendar")}<span>${escapeHtml(t("Kalender"))}</span></button>
              <button class="knop" type="button" data-doe="agendas">${resolve("cog")}<span>${escapeHtml(t("Agenda's"))}</span></button>
              <button class="knop plus" type="button" data-doe="nieuw">${resolve("plus")}<span>${escapeHtml(t("Afspraak"))}</span></button>
            </div>
          </div>
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;
    // Met createElement en niet in het sjabloon. Uit het sjabloon werd hij niet opgewaardeerd (gemeten op 8 november 2026:
    // "setConfig is not a function", en de hele kaart weg); de registry van Home Assistant is een andere (registratie.js).
    let fav = this.$("domotiapp-favorieten-card");
    if (!fav && c.favorieten) {
      fav = document.createElement("domotiapp-favorieten-card");
      fav.setConfig({ verberg_leeg: true });
      this.$(".links").append(fav);
    }
    if (fav && this.hass) fav.hass = this.hass;
    // In de editor kan de config er eerder zijn dan hass: dan beginnen de abonnementen bij de eerste hass.
    this.zonderHass_ = !this.hass;

    const kaart = this.$(".card");
    this.teardown_.push(volgRaster(kaart));

    const nu = this.$(".nu");
    this.on(nu, "click", () => c.weer && moreInfo(this, c.weer));
    this.on(nu, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (c.weer) moreInfo(this, c.weer);
      }
    });

    const lijstEl = this.$(".lijst");
    const open = (e) => {
      const regel = e.target.closest(".regel[data-entity], .regel[data-kalender]");
      if (!regel) return;
      // "en n meer" bij de agenda: de kalender. De eigenaar: "kan er niet op klikken etc."
      if (regel.dataset.kalender) return toonAgendaScherm(this.agendaBron_(), "kalender");
      // Een afspraak opent het scherm van de agendakaart, met Wijzigen en Verwijderen als de agenda dat kan.
      const afspraak = this.rijen_[Number(regel.dataset.i)]?.afspraak;
      if (afspraak) toonAgendaScherm(this.agendaBron_(), "afspraak", afspraak);
      else moreInfo(this, regel.dataset.entity);
    };
    this.on(lijstEl, "click", open);
    this.on(lijstEl, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open(e);
    });

    // Dezelfde knoppen als op de agendakaart. De eigenaar, 9 november 2026, op het overzicht zonder agendakaart ernaast:
    // "ik kan niet zelf een agenda maken hoe kan dat?"
    this.on(this.$(".acties"), "click", (e) => {
      const doe = e.target.closest("[data-doe]")?.dataset.doe;
      if (!doe) return;
      const bron = this.agendaBron_();
      if (doe === "agendas") return toonAgendaScherm(bron, "agendas");
      if (doe === "kalender") return toonAgendaScherm(bron, "kalender");
      // Nog geen agenda om in te schrijven: dan eerst er een toevoegen.
      if (!bron.agendas().some((x) => x.kan.maken)) return toonAgendaScherm(bron, c.agenda_toevoegen ? "toevoegen" : "agendas");
      toonAgendaScherm(bron, "formulier");
    });

    // De klok op de minuut, net als de headerkaart: niet elke zestig seconden vanaf het laden.
    const plan = () => {
      this.klokTimer_ = setTimeout(() => {
        this.paintKop_();
        if (this.dag_ !== this.vandaag_()) this.abonneerAgendas_();
        this.paintLijst_();
        plan();
      }, 60000 - (Date.now() % 60000) + 50);
    };
    plan();
    this.teardown_.push(() => clearTimeout(this.klokTimer_));

    if (zichtbaar(c).weer && c.weer && c.dagen > 0) {
      this.weerAbo_ = new BlijvendAbonnement({ type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: c.weer }, (bericht) => {
        this.voorspelling_ = Array.isArray(bericht?.forecast) ? bericht.forecast : [];
        this.paintWeer_();
        meetRaster(kaart);
      });
      this.weerAbo_.start(this.hass);
      this.teardown_.push(() => {
        this.weerAbo_?.stop();
        this.weerAbo_ = null;
      });
    }

    // Agenda's die de klant via de agendakaart toevoegde, staan hier ook: hij kan dit dashboard niet wijzigen. Staat de
    // agenda niet op de kaart, dan hoeft dat niet opgehaald te worden.
    if (zichtbaar(c).agenda) {
      this.toegevoegdAbo_ = new ToegevoegdAbonnement((agendas) => {
        const voor = this.agendaIds_().join();
        this.toegevoegd_ = agendas;
        if (this.agendaIds_().join() !== voor) this.abonneerAgendas_();
        agendaScherm()?.ververs();
      });
      this.toegevoegdAbo_.start(this.hass);
    }

    this.abonneerAgendas_();
    // Wat de klant in het scherm maakte, wijzigde of weghaalde, meteen opnieuw ophalen: iCloud meldt het zelf niet.
    this.teardown_.push(
      bijWijziging((agenda) => {
        for (const [id, abo] of this.agendaAbos_) if (!agenda || id === agenda) abo.start(this.hass);
      })
    );
    this.teardown_.push(() => {
      this.toegevoegdAbo_?.stop();
      this.toegevoegdAbo_ = null;
      for (const abo of this.agendaAbos_.values()) abo.stop();
      this.agendaAbos_.clear();
      this.afspraken_.clear();
      this.dag_ = null;
    });
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    const vorige = this.hass;
    super.hass = hass;
    const fav = this.$("domotiapp-favorieten-card");
    if (fav) fav.hass = hass;
    if (!this.wired_) return;
    if (terug || this.zonderHass_) {
      this.zonderHass_ = false;
      this.weerAbo_?.start(hass);
      this.toegevoegdAbo_?.start(hass);
      for (const abo of this.agendaAbos_.values()) abo.start(hass);
    }
    // De regels hangen ook af van entiteiten die niemand aanwees (alle melders, alle batterijen), dus niet alleen van watched().
    if (vorige?.states !== hass?.states) {
      this.paintLijst_();
      meetRaster(this.$(".card"));
    }
  }

  get hass() {
    return super.hass;
  }

  tz_() {
    return this.hass?.config?.time_zone;
  }

  /** Nu, op de klok van Home Assistant. */
  nu_() {
    return naarWand(new Date(), this.tz_());
  }

  vandaag_() {
    const d = this.nu_();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  /** De agenda's: die uit de editor, plus wat de klant via de agendakaart toevoegde. Geen, als de agenda verborgen is. */
  agendaIds_() {
    if (!zichtbaar(this.config).agenda) return [];
    return agendasVan({ agendas: lijst(this.config?.agenda) }, this.toegevoegd_);
  }

  /** Wat het agendascherm wil weten. Agenda's toevoegen mag hier sinds 0.117.0 ook, tenzij het in de editor uit staat. */
  agendaBron_() {
    return {
      hass: () => this.hass,
      agendas: () =>
        agendaInfo(
          this.hass?.states,
          this.agendaIds_(),
          this.toegevoegd_,
          (id) => nameOf(this.hass, id),
          (id) => this.hass?.entities?.[id]?.platform ?? null
        ).map((x) => ({ ...x, kleur: TONES[x.toon] })),
      toevoegen: this.config.agenda_toevoegen,
    };
  }

  /** Per agenda een abonnement van vandaag tot twee maanden vooruit, voor de eerstvolgende na het venster; na middernacht opnieuw. */
  abonneerAgendas_() {
    for (const abo of this.agendaAbos_.values()) abo.stop();
    this.agendaAbos_.clear();
    this.afspraken_.clear();
    this.dag_ = this.vandaag_();
    const nu = this.nu_();
    const van = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    const tot = agendaTot(nu, AGENDA_VOORUIT);
    for (const entity of this.agendaIds_()) {
      const abo = new AgendaAbonnement(entity, vanWand(van, this.tz_()), vanWand(tot, this.tz_()), (events) => {
        if (this.agendaAbos_.get(entity) !== abo) return;
        if (events) this.afspraken_.set(entity, afsprakenVan(events, this.tz_(), entity));
        this.paintLijst_();
        meetRaster(this.$(".card"));
      });
      this.agendaAbos_.set(entity, abo);
      if (this.hass) abo.start(this.hass);
    }
  }

  paint() {
    this.paintKop_();
    this.paintWeer_();
    this.paintLijst_();
    meetRaster(this.$(".card"));
  }

  paintKop_() {
    const nu = this.nu_();
    const naam = voornaam(this.config.naam || this.hass?.user?.name || "");
    const hallo = groet(nu);
    const html = naam ? `${hallo}, <b>${escapeHtml(naam)}</b>` : hallo;
    const el = this.$(".hallo");
    if (el.innerHTML !== html) el.innerHTML = html;
    this.text(".datum", nu.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }));
    this.text(".klok", nu.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" }));
  }

  paintWeer_() {
    const c = this.config;
    if (!c.weer || !zichtbaar(c).weer) return;
    const st = stateOf(this.hass, c.weer);
    const wa = attrsOf(this.hass, c.weer);
    const dood = isDead(st);
    this.$(".nu").classList.toggle("unavailable", dood);

    const chip = this.$(".nu .chip");
    const icoon = weatherIcon(st?.state);
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "cloud");
    }

    const eenheid = wa.temperature_unit ?? this.hass?.config?.unit_system?.temperature ?? "°C";
    const graden = wa.temperature == null ? "" : `${fmtNumber(this.hass, wa.temperature, 0)}<small>${eenheid}</small>`;
    const gradenEl = this.$(".graden");
    if (gradenEl.innerHTML !== graden) gradenEl.innerHTML = graden;
    this.text(".cond", dood ? t("Niet bereikbaar") : localizeState(this.hass, st));

    // Vandaag uit de voorspelling: de hoogste en de laagste. De rij eronder begint morgen.
    const nu = this.nu_();
    const punten = this.voorspelling_ ?? [];
    const isVandaag = (p) => {
      const d = naarWand(new Date(p.datetime), this.tz_());
      return d.getFullYear() === nu.getFullYear() && d.getMonth() === nu.getMonth() && d.getDate() === nu.getDate();
    };
    const vandaag = punten.find(isVandaag);
    const later = punten.filter((p) => !isVandaag(p) && naarWand(new Date(p.datetime), this.tz_()) > nu).slice(0, c.dagen);

    const details = [];
    if (vandaag?.temperature != null) details.push(`<span>${icons.arrowUp}${fmtNumber(this.hass, vandaag.temperature, 0)}°</span>`);
    if (vandaag?.templow != null) details.push(`<span>${icons.arrowDown}${fmtNumber(this.hass, vandaag.templow, 0)}°</span>`);
    if (wa.humidity != null) details.push(`<span style="--tone:${toneValue("water")}" title="${escapeHtml(t("Luchtvochtigheid"))}">${icons.drop}${Math.round(wa.humidity)}%</span>`);
    if (wa.wind_speed != null) {
      const richting = wa.wind_bearing == null || Number.isNaN(+wa.wind_bearing) ? "" : ` ${t(WINDSTREKEN[Math.round(+wa.wind_bearing / 45) % 8])}`;
      const windEenheid = wa.wind_speed_unit ?? this.hass?.config?.unit_system?.wind_speed ?? "km/h";
      details.push(`<span title="${escapeHtml(t("Wind"))}">${icons.wind}${fmtNumber(this.hass, wa.wind_speed, 0)} ${windEenheid}${richting}</span>`);
    }
    const detailsEl = this.$(".details");
    const detailsHtml = dood ? "" : details.join("");
    if (detailsEl.innerHTML !== detailsHtml) detailsEl.innerHTML = detailsHtml;

    const rij = this.$(".dagen");
    const sig = JSON.stringify(later.map((p) => [p.datetime, p.condition, p.temperature, p.templow]));
    if (rij.dataset.sig === sig) return;
    rij.dataset.sig = sig;
    rij.style.setProperty("--n", Math.max(1, later.length));
    rij.innerHTML = later
      .map((p) => {
        const d = naarWand(new Date(p.datetime), this.tz_());
        return `<div class="dag" style="--tone:${TONES.accent}">
            <span class="wanneer">${escapeHtml(d.toLocaleDateString(locale(), { weekday: "short" }))}</span>
            ${resolve(weatherIcon(p.condition), "cloud")}
            <span class="max tnum">${p.temperature == null ? "" : `${fmtNumber(this.hass, p.temperature, 0)}°`}</span>
            ${p.templow == null ? "" : `<span class="min tnum">${fmtNumber(this.hass, p.templow, 0)}°</span>`}
          </div>`;
      })
      .join("");
  }

  paintLijst_() {
    const el = this.$(".lijst");
    if (!el || !this.hass) return;
    const c = this.config;
    const z = zichtbaar(c);
    const states = this.hass.states ?? {};
    const naamVan = (id) => nameOf(this.hass, id);
    const nu = this.nu_();

    const rijen = regels({
      nu,
      naamVan,
      alarmen: z.melders ? alarmen(states, lijst(c.melders)) : [],
      open: z.letop ? lijst(c.letop).map((id) => states[id]).filter(staatOpen) : [],
      afspraken: afsprakenOpKaart(
        [...this.afspraken_.values()].flat(),
        nu,
        c.agenda_dagen,
        this.agendaIds_().map((id) => volgendeUitToestand(states[id], id))
      ),
      batterijen: z.batterijen ? batterijenLeeg(states, lijst(c.batterijen), c.batterij_grens ?? BATTERIJ_GRENS) : [],
    });

    this.rijen_ = rijen;
    const ids = this.agendaIds_();
    const knoppen = this.$(".acties");
    knoppen.hidden = !z.agenda_knoppen || (!ids.length && !c.agenda_toevoegen);
    this.$('[data-doe="kalender"]').hidden = !ids.length;
    // Afspraak maken kan alleen in een agenda die het kan, of na het toevoegen van een.
    this.$(".plus").hidden = !c.agenda_toevoegen && !ids.some((id) => kan(states[id]).maken);
    const sig = JSON.stringify(rijen.map((r) => [r.soort, r.toon, r.icoon, r.tekst, r.bij, r.entity, r.kalender]));
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = rijen
      .map(
        (r, i) => `<div class="regel" data-i="${i}" data-soort="${r.soort}" data-toon="${r.toon}"${r.entity ? ` data-entity="${escapeHtml(r.entity)}" role="button" tabindex="0"` : ""}${r.kalender ? ' data-kalender="1" role="button" tabindex="0"' : ""}>
          <span class="chip" style="--tone:${toneValue(r.toon)}">${resolve(r.icoon, "dots")}</span>
          <span class="tekst">${escapeHtml(r.tekst)}</span>
          ${r.bij ? `<span class="bij">${escapeHtml(r.bij)}</span>` : ""}
        </div>`
      )
      .join("");
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 4) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-overzicht-card-editor");
  }

  static getStubConfig(hass) {
    const weer = Object.keys(hass?.states ?? {}).find((e) => e.startsWith("weather."));
    return weer ? { weer } : {};
  }
}

class OverzichtEditor extends DacEditor {
  defaults() {
    return {
      favorieten: false,
      ...Object.fromEntries(ONDERDELEN.map((deel) => [`toon_${deel}`, true])),
      dagen: DAGEN_STANDAARD,
      agenda_dagen: AGENDA_DAGEN,
      agenda_toevoegen: true,
      batterij_grens: BATTERIJ_GRENS,
    };
  }

  /**
   * Per deel een schakelaar, en daaronder zijn instellingen in een uitklapblok, alleen als hij aan staat (Vormregels: een
   * functie die je in zijn geheel aan of uit zet). Verbergen gooit de instellingen niet weg: weer aan, en ze staan er nog.
   */
  schema() {
    const z = zichtbaar(this.config_);
    const blok = (aan, titel, icoon, velden) => (aan ? [section(titel, icoon, velden)] : []);
    return [
      { name: "favorieten", selector: sel.bool() },
      { name: "toon_begroeting", selector: sel.bool() },
      ...blok(z.begroeting, nt("Begroeting"), "mdi:hand-wave-outline", [{ name: "naam", selector: sel.text() }]),
      { name: "toon_datum", selector: sel.bool() },
      { name: "toon_klok", selector: sel.bool() },
      { name: "toon_weer", selector: sel.bool() },
      ...blok(z.weer, nt("Weer"), "mdi:weather-partly-cloudy", [
        { name: "weer", selector: sel.entity("weather") },
        { name: "dagen", selector: sel.number(0, DAGEN_MAX) },
      ]),
      { name: "toon_agenda", selector: sel.bool() },
      ...blok(z.agenda, nt("Agenda"), "mdi:calendar", [
        { name: "agenda", selector: { entity: { domain: "calendar", multiple: true } } },
        { name: "agenda_dagen", selector: sel.number(1, AGENDA_DAGEN_MAX) },
        { name: "toon_agenda_knoppen", selector: sel.bool() },
        { name: "agenda_toevoegen", selector: sel.bool() },
      ]),
      { name: "toon_letop", selector: sel.bool() },
      ...blok(z.letop, nt("Let op"), "mdi:door-open", [
        { name: "letop", selector: { entity: { domain: ["binary_sensor", "cover", "lock", "valve"], multiple: true } } },
      ]),
      { name: "toon_melders", selector: sel.bool() },
      ...blok(z.melders, nt("Melders"), "mdi:smoke-detector-variant", [
        {
          name: "melders",
          selector: {
            entity: {
              multiple: true,
              filter: [{ domain: "binary_sensor", device_class: Object.keys(ALARMEN) }, { domain: "alarm_control_panel" }],
            },
          },
        },
      ]),
      { name: "toon_batterijen", selector: sel.bool() },
      ...blok(z.batterijen, nt("Batterijen"), "mdi:battery-low", [
        { name: "batterijen", selector: { entity: { multiple: true, filter: [{ domain: ["sensor", "binary_sensor"], device_class: "battery" }] } } },
        { name: "batterij_grens", selector: sel.number(0, 50) },
      ]),
    ];
  }

  label(s) {
    return (
      {
        favorieten: t("Favorieten links op de kaart"),
        toon_begroeting: t("Begroeting tonen"),
        toon_datum: t("Datum tonen"),
        toon_klok: t("Klok tonen"),
        toon_weer: t("Weer tonen"),
        toon_agenda: t("Agenda tonen"),
        toon_agenda_knoppen: t("Knoppen onder de agenda"),
        toon_letop: t("Let op tonen"),
        toon_melders: t("Melders tonen"),
        toon_batterijen: t("Batterijen tonen"),
        weer: t("Weerentiteit"),
        dagen: t("Dagen vooruit"),
        naam: t("Naam in de begroeting"),
        agenda: t("Agenda's"),
        letop: t("Let op als dit open staat"),
        agenda_dagen: t("Agenda: dagen vooruit"),
        agenda_toevoegen: t("Agenda's toevoegen"),
        melders: t("Melders"),
        batterijen: t("Batterijen"),
        batterij_grens: t("Batterij bijna leeg onder (%)"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      favorieten: t("Uit: alleen het overzicht, en de favorieten op hun eigen kaart ernaast."),
      toon_agenda: t("Uit: geen afspraken en geen agendaknoppen op de kaart."),
      toon_agenda_knoppen: t("Kalender, Agenda's en + Afspraak."),
      dagen: t("0 laat de rij met dagen weg."),
      naam: t("Leeg laten voor de naam van de ingelogde gebruiker."),
      agenda: t("De afspraken in deze agenda's, vanaf nu."),
      agenda_dagen: t("1 is alleen vandaag, 7 een week. Staat er niets in, dan de eerstvolgende afspraak."),
      agenda_toevoegen: t("De klant voegt zelf een agenda toe: een nieuwe, Google of Apple."),
      letop: t("Deuren, ramen, sloten, de garage. Ze staan er alleen als ze open of niet op slot zijn."),
      melders: t("Rook-, gas-, koolmonoxide-, lek- en hittemelders en alarmsystemen. Ze staan er alleen als ze afgaan."),
      batterijen: t("Ze staan er alleen als ze onder de grens zijn."),
      batterij_grens: t("0 zet het uit."),
    }[s.name];
  }
}

registerEditor("domotiapp-overzicht-card-editor", OverzichtEditor);
registerCard("domotiapp-overzicht-card", OverzichtCard, {
  name: nt("DomotiApp Overzicht"),
  description: nt("Voor een tablet: de klok, het weer en wat er belangrijk is, met de agenda erbij."),
});

export { OverzichtCard };
