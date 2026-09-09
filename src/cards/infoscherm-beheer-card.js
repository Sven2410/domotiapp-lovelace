/**
 * DomotiApp Infoscherm Beheer -- wat de receptie op haar pc ziet.
 *
 * Alles wat op het wachtkamerscherm staat wordt hier onderhouden: de
 * medewerkers, de mededeling van de dag, het nieuws, de praktijkgegevens met
 * de openingstijden, de INDELING van het scherm (slepen, groter en kleiner
 * maken, blokken erbij en eraf), de namen van de lampen, en de instellingen
 * met het logo. Niets hiervan staat in een kaartconfig: de receptie is een
 * gewone gebruiker, en die kan geen dashboard opslaan. Het gaat allemaal naar
 * de serverkant (`infoscherm/`), en elk open scherm krijgt het meteen.
 *
 * Voor de INSTALLATEUR (een admin) is er één blok extra: Installatie, met de
 * weerentiteit, de lampen en de agenda's. Dat blok ziet de receptie niet, en
 * de server weigert de entiteiten ook als ze het toch zou sturen.
 *
 * GEEN ha-form
 *
 * De editors van deze familie zijn op `ha-form` gebouwd, en dat is goed voor
 * een INSTALLATEUR die een kaart instelt. Dit is geen editor maar een kaart
 * die een receptioniste de hele dag openheeft. Gewone invoervelden, in de
 * vormtaal van de familie. Zo ziet ze nooit een YAML, nooit een entiteit, en
 * nooit een dialoog van Home Assistant.
 *
 * ALLES WORDT VANZELF OPGESLAGEN
 *
 * Tot 0.36.0 had elk blok een eigen knop Opslaan, en dat ging mis: wie in
 * Medewerkers typte, naar Praktijk ging en dáár op Opslaan drukte, dacht dat
 * alles was opgeslagen -- maar Medewerkers stond nog open. Gemeld op
 * 10 september 2026: *"ook heb ik bugs met het opslaan, niet alles wordt
 * opgeslagen."* Sinds ronde 2 gaat elke wijziging na een korte adempauze
 * (700 ms na de laatste toetsaanslag, meteen bij een schakelaar of een sleep)
 * naar de server, per onderdeel. Bovenin staat wat er gebeurt: "Opslaan…",
 * "Opgeslagen 10:42", of de fout. En omdat de server elke wijziging aan elk
 * open scherm doorgeeft, staat het binnen een seconde op de iPad.
 *
 * WAT ER NIET OPNIEUW GETEKEND WORDT
 *
 * Typen tekent NIETS opnieuw: het veld schrijft rechtstreeks in de werkkopie.
 * Anders verliest het veld zijn focus bij elke letter -- precies de fout die
 * de entiteiten-editor twee uitgaven heeft gekost (valkuil 23). Een stand
 * van de server tekent alleen de blokken opnieuw waarvan de inhoud echt
 * anders is, en NOOIT een blok waar op dat moment de focus in staat: dat
 * wacht tot de focus het blok verlaat. Een onderdeel dat nog niet is
 * opgeslagen wordt nooit door de server overschreven. Alleen de aanwezigheid
 * wordt tussendoor bijgewerkt, in het schakelaartje zelf, want die komt van
 * de iPad en die wil je zien.
 */

import { DacCard, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { Herkansing, Verbindingswacht } from "../herkansing.js";
import { volgRaster } from "../rasterhoogte.js";
import { vraagBevestiging } from "../vraag.js";
import {
  abonneer,
  bestandUrl,
  bewaar,
  haalGebruikers,
  haalStand,
  nogNietGereed,
  upload,
  vergeetBestand,
  verwijderBestand,
  ververFeeds,
} from "../infoscherm-client.js";
import {
  BLOK_INFO,
  BLOK_SOORTEN,
  DAGEN,
  DAGNAMEN,
  KOLOMMEN,
  RIJEN,
  blokOntbreekt,
  initialen,
  isoDatum,
  pastVrij,
  standaardIndeling,
  vrijePlek,
} from "./infoscherm-logica.js";

const TAG = "domotiapp-infoscherm-beheer-card";

/* Wat er in de opslag staat, per onderdeel; elk onderdeel heeft zijn eigen save. */
const SECTIES = ["personen", "mededelingen", "nieuws", "praktijk", "scherm", "installatie", "indeling", "instellingen"];

const teken = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICOON = {
  news: teken(`<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>`),
  layout: teken(`<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2"/><path d="M3.4 9.6h17.2M9.6 9.6v11"/>`),
  wrench: teken(`<path d="M14.5 5.5a4 4 0 0 0 4.9 5.3l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8.6-8.6a4 4 0 0 0-2.3-2.7z"/>`),
};
const icoon = (naam) => ICOON[naam] ?? resolve(naam);

const BLOKKEN = [
  { key: "personen", titel: "Medewerkers", icoon: "people", secties: ["personen"] },
  { key: "mededelingen", titel: "Mededeling van de dag", icoon: "bell", secties: ["mededelingen"] },
  { key: "nieuws", titel: "Nieuws van het pand", icoon: "news", secties: ["nieuws"] },
  { key: "praktijk", titel: "Praktijk en openingstijden", icoon: "house", secties: ["praktijk"] },
  { key: "indeling", titel: "Indeling van het scherm", icoon: "layout", secties: ["indeling"] },
  { key: "verlichting", titel: "Verlichting", icoon: "bulb", secties: ["installatie", "instellingen"] },
  { key: "instellingen", titel: "Instellingen en logo", icoon: "cog", secties: ["scherm", "instellingen"] },
  { key: "installatie", titel: "Installatie (alleen beheerder)", icoon: "wrench", secties: ["installatie", "instellingen"], admin: true },
];

const STANDAARD = {
  title: "Infoscherm",
  show_personen: true,
  show_mededelingen: true,
  show_nieuws: true,
  show_praktijk: true,
  show_indeling: true,
  show_verlichting: true,
  show_instellingen: true,
  show_installatie: true,
  open: "personen",
};

const css = /* css */ `
  /* Een containerquery en geen mediaquery: de kaart staat in een kolom van
     een sections-view, en die is smal terwijl het venster breed is. */
  :host { container-type: inline-size; }
  .card { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .icon { width: 1em; height: 1em; display: block; }
  [hidden] { display: none !important; }

  .kop { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .kop h2 { margin: 0; font-size: 17px; font-weight: 600; }
  .kop .eyebrow { margin-bottom: 2px; }
  .status { font-size: 12px; color: var(--dac-ink-3); display: flex; align-items: center; gap: 6px; text-align: right; }
  .status.bezig { color: var(--dac-ink-2); }
  .status.fout { color: var(--dac-bad); }
  .status.ok { color: var(--dac-good); }

  /* Een blok: kop met pijl, inhoud eronder. Eén tegelijk open houdt het overzicht. */
  .blok { border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm); overflow: hidden; }
  .blok > .bk {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; cursor: pointer;
    background: var(--dac-surface); border: none; font: inherit; color: inherit; text-align: left;
  }
  .blok > .bk .icon { font-size: 18px; color: var(--dac-ink-3); transition: transform 160ms; }
  .blok.open > .bk .icon.pijl { transform: rotate(180deg); }
  .blok > .bk b { font-size: 14px; font-weight: 600; flex: 1 1 auto; }
  .blok > .bk .tel { font-size: 12px; color: var(--dac-ink-3); }
  .blok > .bk .bfout { font-size: 11px; font-weight: 600; color: var(--dac-bad); }
  .blok > .inhoud { display: none; padding: 14px; flex-direction: column; gap: 12px; }
  .blok.open > .inhoud { display: flex; }

  /* velden */
  .rij { display: grid; gap: 10px; align-items: center; }
  .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .veld label { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="url"], input[type="date"], input[type="time"], input[type="number"], input[type="color"], textarea, select {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: dark;
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  input[type="color"] { padding: 2px 4px; width: 56px; }
  input[type="number"] { max-width: 120px; }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--dac-accent-hi); margin: 0; }
  .vink { display: flex; align-items: center; gap: 8px; font-size: 13px; min-height: 40px; cursor: pointer; }
  .vink .id { font-size: 11px; color: var(--dac-ink-3); margin-left: 4px; }

  /* de schakelaar voor aan/uit-dingen */
  .schakel { position: relative; width: 44px; height: 24px; flex: 0 0 auto; }
  .schakel input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
  .schakel span { position: absolute; inset: 0; border-radius: 999px; background: var(--dac-border-hi); transition: background 120ms; }
  .schakel span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dac-ink); transition: transform 120ms; }
  .schakel input:checked + span { background: var(--dac-accent-hi); }
  .schakel input:checked + span::after { transform: translateX(20px); }

  .knop {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2);
    background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .knop .icon { font-size: 16px; }
  .knop.klein { height: 32px; padding: 0 10px; font-size: 12px; }
  .knop.ico { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--dac-radius-sm); }
  .knop.gevaar { color: var(--dac-bad); }
  .knop:disabled { opacity: 0.5; cursor: default; }
  .voet { display: flex; justify-content: flex-start; align-items: center; gap: 10px; flex-wrap: wrap; }
  .melding { font-size: 12px; color: var(--dac-ink-3); }
  .melding.fout { color: var(--dac-bad); }

  /* lijsten */
  .lijst { display: flex; flex-direction: column; gap: 8px; }
  .item { display: grid; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .item.persoon { grid-template-columns: 44px minmax(0, 1.4fr) minmax(0, 1fr) auto auto; }
  .item.mededeling { grid-template-columns: minmax(0, 2fr) 150px 150px auto; }
  .item.bericht { grid-template-columns: minmax(0, 1fr); }
  .item.feed { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto; }
  .item.uitz { grid-template-columns: 150px auto 110px 110px minmax(0, 1fr) auto; }
  .item.lamp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .item.lamp .ent { font-size: 13px; color: var(--dac-ink-2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .item.lamp .ent b { color: var(--dac-ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.lamp .ent span { font-size: 11px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .knoppen { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: var(--dac-ink-3); background: var(--dac-surface-hi); border: 1px solid var(--dac-border); cursor: pointer; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .leeg { font-size: 13px; color: var(--dac-ink-3); padding: 6px 2px; }

  .bericht .b-rij { display: grid; grid-template-columns: minmax(0, 1fr) 150px 150px auto; gap: 10px; align-items: end; }
  .b-onder { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .plaatje { width: 96px; height: 64px; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface-hi); display: grid; place-items: center; color: var(--dac-ink-3); font-size: 20px; }
  .plaatje img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* Het logo volgt zijn eigen verhouding, net als op het scherm. */
  .plaatje.logo { width: auto; min-width: 64px; max-width: 220px; height: 64px; padding: 4px; }
  .plaatje.logo img { width: auto; height: 100%; max-width: 100%; object-fit: contain; }

  .ot-tabel { display: grid; grid-template-columns: 90px auto 100px 100px 100px 100px; gap: 6px 10px; align-items: center; font-size: 13px; }
  .ot-tabel .k { font-size: 11px; color: var(--dac-ink-3); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .ot-tabel input[type="time"] { min-height: 34px; padding: 4px 6px; font-size: 13px; }
  .ot-tabel .dag { color: var(--dac-ink-2); }
  .ot-tabel input:disabled { opacity: 0.35; }

  .twee { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hulp { font-size: 12px; color: var(--dac-ink-3); line-height: 1.4; }
  .gebruikers, .keuzes { display: flex; flex-direction: column; gap: 2px; max-height: 260px; overflow-y: auto; padding: 4px 6px; border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm); }
  .keuzes .vink { min-height: 32px; }
  .feedfout { font-size: 12px; color: var(--dac-bad); }
  .sub { font-size: 13px; font-weight: 600; margin-top: 4px; }

  /* ------------------------------------------------------------ de indeling */
  .raster {
    position: relative; width: 100%; aspect-ratio: 1194 / 660; border-radius: var(--dac-radius-sm);
    background-color: var(--dac-surface);
    background-image:
      linear-gradient(to right, var(--dac-border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--dac-border) 1px, transparent 1px);
    background-size: calc(100% / ${KOLOMMEN}) calc(100% / ${RIJEN});
    border: 1px solid var(--dac-border-hi); overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
  }
  .ib { position: absolute; padding: 3px; box-sizing: border-box; cursor: grab; touch-action: none; }
  .ib.sleept { cursor: grabbing; z-index: 2; }
  .ib-in {
    position: relative; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden;
    border-radius: 8px; background: var(--dac-accent-soft); border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 50%, transparent);
    display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; font-size: 12px;
  }
  .ib.sleept .ib-in { box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  .ib.ongeldig .ib-in { background: color-mix(in srgb, var(--dac-bad) 18%, transparent); border-color: var(--dac-bad); }
  .ib.ontbreekt .ib-in { border-style: dashed; background: var(--dac-surface-hi); }
  .ib-kop { display: flex; align-items: center; gap: 6px; font-weight: 600; min-width: 0; }
  .ib-kop .icon { font-size: 14px; color: var(--dac-accent-hi); flex: 0 0 auto; }
  .ib.ontbreekt .ib-kop .icon { color: var(--dac-ink-3); }
  .ib-kop span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ib-nb { font-size: 11px; color: var(--dac-ink-3); line-height: 1.3; }
  .ib-weg { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 6px; border: none; background: var(--dac-surface-hi); color: var(--dac-ink-2); cursor: pointer; display: grid; place-items: center; font: inherit; }
  .ib-weg .icon { font-size: 14px; }
  .ib-aantal { margin-top: auto; display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--dac-ink-2); }
  .ib-aantal button { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--dac-border-hi); background: var(--dac-surface); color: var(--dac-ink); cursor: pointer; font: inherit; font-size: 14px; line-height: 1; display: grid; place-items: center; }
  .ib-aantal b { min-width: 28px; text-align: center; }
  .ib-greep { position: absolute; right: 2px; bottom: 2px; width: 16px; height: 16px; cursor: nwse-resize; border-right: 3px solid var(--dac-accent-hi); border-bottom: 3px solid var(--dac-accent-hi); border-radius: 0 0 4px 0; opacity: .8; }
  .ib.ontbreekt .ib-greep { border-color: var(--dac-ink-3); }

  .geen { padding: 24px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
  .file { display: none; }

  @container (max-width: 720px) {
    .item.persoon { grid-template-columns: 44px minmax(0, 1fr) auto; }
    .item.persoon .veld:nth-child(3) { grid-column: 2 / -1; }
    .item.mededeling, .bericht .b-rij, .item.uitz, .item.lamp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .item.feed { grid-template-columns: minmax(0, 1fr); }
    .ot-tabel { grid-template-columns: 70px auto 1fr 1fr; }
    .ot-tabel .vak2 { display: none; }
    .twee, .drie { grid-template-columns: minmax(0, 1fr); }
    .ib-aantal, .ib-nb { display: none; }
  }
`;

const kloon = (x) => JSON.parse(JSON.stringify(x ?? null));
const at = (s) => escapeHtml(s ?? "");
const klem = (n, a, b) => Math.min(b, Math.max(a, n));

/* Hoe lang er na de laatste toetsaanslag gewacht wordt voordat het weggaat. */
const ADEMPAUZE_TEKST = 700;
const ADEMPAUZE_KNOP = 150;

export class InfoschermBeheerCard extends DacCard {
  static css = css;

  constructor() {
    super();
    this.stand_ = null;
    this.rechten_ = {};
    this.feedFouten_ = {};
    this.werk_ = {};
    this.vuil_ = new Set();
    this.bezig_ = new Set();
    this.versie_ = {};
    this.timers_ = {};
    this.fouten_ = {};
    this.uitgesteld_ = new Set();
    this.open_ = null;
    this.gebruikers_ = null;
    this.meldingen_ = {};
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.verbinding_ = new Verbindingswacht();
    this.fout_ = null;
    this.laatstOpgeslagen_ = "";
  }

  validate(config) {
    return { ...STANDAARD, ...config };
  }

  watched() {
    return [];
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_rows: this.minRijen_(".card", 6) };
  }

  blokken_() {
    return BLOKKEN.filter((b) => this.config[`show_${b.key}`] !== false && (!b.admin || this.rechten_.is_admin));
  }

  blokInfo_(key) {
    return BLOKKEN.find((b) => b.key === key);
  }

  /* ------------------------------------------------------------ template */

  template() {
    const c = this.config;
    return `
      <div class="card surface ${c.bare ? "bare" : ""}">
        <div class="kop">
          <div>
            <div class="eyebrow">DomotiApp Infoscherm</div>
            <h2>${at(c.title)}</h2>
          </div>
          <div class="status"></div>
        </div>
        <div class="geen" hidden></div>
        ${BLOKKEN.map(
          (b) => `<section class="blok" data-blok="${b.key}" hidden>
              <button class="bk" type="button">${icoon(b.icoon)}<b>${b.titel}</b><span class="bfout" hidden></span><span class="tel"></span>${resolve("chevronDown")}</button>
              <div class="inhoud"></div>
            </section>`
        ).join("")}
        <input class="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml">
      </div>`;
  }

  wire() {
    const card = this.$(".card");
    this.teardown_.push(volgRaster(card));
    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(() => {
      for (const t of Object.values(this.timers_)) clearTimeout(t);
      this.timers_ = {};
    });

    this.on(card, "click", (e) => this.klik_(e));
    this.on(card, "input", (e) => this.invoer_(e));
    this.on(card, "change", (e) => this.invoer_(e));
    this.on(card, "pointerdown", (e) => this.sleepStart_(e));
    this.on(card, "focusout", (e) => this.focusWeg_(e));
    this.on(this.$(".file"), "change", (e) => this.bestandGekozen_(e));

    this.open_ = this.open_ ?? this.config.open;
    this.haal_();
    this.luister_();
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (terug && this.built_) {
      this.haal_();
      this.luister_();
    }
  }

  get hass() {
    return super.hass;
  }

  /* ------------------------------------------------------------ data */

  async haal_() {
    if (!this.hass?.connection) return;
    try {
      const r = await haalStand(this.hass);
      this.rechten_ = r;
      this.feedFouten_ = r.feed_fouten ?? {};
      this.fout_ = null;
      this.herkansing_.herstel();
      this.nieuweStand_(r.stand, true);
      if (r.is_admin && this.gebruikers_ === null) {
        haalGebruikers(this.hass)
          .then((g) => {
            this.gebruikers_ = g.gebruikers ?? [];
            this.teken_("installatie");
          })
          .catch(() => {
            this.gebruikers_ = [];
          });
      }
    } catch (fout) {
      if (nogNietGereed(fout)) {
        this.herkansing_.plan();
        this.status_("Home Assistant start nog op…", "bezig");
        return;
      }
      this.fout_ = fout?.message ?? "Het beheer kon niet laden.";
      this.paint();
    }
  }

  async luister_() {
    if (!this.hass?.connection?.subscribeMessage) return;
    // Zelfde opzet als in de infoschermkaart (zie `abonnement_` daar): niet
    // op `isConnected` toetsen, want die is false terwijl `wire()` draait.
    let dood = false;
    this.teardown_.push(() => { dood = true; });
    try {
      const opzeggen = await abonneer(this.hass, (bericht) => {
        if (bericht?.soort === "stand") this.nieuweStand_(bericht.stand);
        if (bericht?.soort === "feeds") {
          this.feedFouten_ = bericht.feed_fouten ?? {};
          this.teken_("instellingen");
        }
      });
      if (dood) opzeggen();
      else this.teardown_.push(() => { try { opzeggen(); } catch { /* verbinding al weg */ } });
    } catch {
      /* haal_ plant de herkansing */
    }
  }

  /**
   * Een verse stand van de server.
   *
   * Alleen onderdelen die niet vuil zijn en niet onderweg worden overgenomen,
   * en alleen als ze echt anders zijn. Van de personen wordt de AANWEZIGHEID
   * wél altijd overgenomen (behalve van een schakelaar die hier net is
   * omgezet), want die komt van de iPad.
   */
  nieuweStand_(stand, alles = false) {
    const eerste = !this.stand_;
    this.stand_ = stand;
    const opnieuw = new Set();
    for (const s of SECTIES) {
      if (this.vuil_.has(s) || this.bezig_.has(s)) {
        if (s === "personen") this.neemAanwezigOver_(stand.personen);
        continue;
      }
      if (alles || eerste || JSON.stringify(this.werk_[s]) !== JSON.stringify(stand[s])) {
        this.werk_[s] = kloon(stand[s]);
        for (const b of BLOKKEN) if (b.secties.includes(s)) opnieuw.add(b.key);
      }
    }
    if (eerste || alles) return this.paint();
    this.paintKader_();
    for (const key of opnieuw) this.teken_(key);
    return undefined;
  }

  /** De aanwezigheid van de iPad in de werkkopie en in de schakelaars, zonder hertekenen. */
  neemAanwezigOver_(personen) {
    const w = this.werk_.personen;
    if (!Array.isArray(w)) return;
    const server = new Map((personen ?? []).map((p) => [p.id, p.aanwezig]));
    w.forEach((p, i) => {
      if (!p.id || p._aanwezig || !server.has(p.id) || server.get(p.id) === p.aanwezig) return;
      p.aanwezig = server.get(p.id);
      const item = this.$(`.blok[data-blok="personen"] .item[data-i="${i}"]`);
      const inp = item?.querySelector('input[data-veld="aanwezig"]');
      if (inp) inp.checked = p.aanwezig;
      const lbl = item?.querySelector(".vink span:last-child");
      if (lbl) lbl.textContent = p.aanwezig ? "Aanwezig" : "Afwezig";
      item?.querySelector(".avatar")?.classList.toggle("aan", p.aanwezig);
    });
    this.tel_("personen");
  }

  /* ------------------------------------------------------------ paint */

  paint() {
    if (!this.$(".card")) return;
    this.paintKader_();
    if (!this.magTonen_()) return;
    for (const b of this.blokken_()) this.teken_(b.key);
  }

  magTonen_() {
    return !this.fout_ && this.stand_ && this.rechten_.mag_beheren !== false;
  }

  /** De kop, de uitleg als er niets te tonen valt, en welke blokken er zijn. */
  paintKader_() {
    const geen = this.$(".geen");
    if (this.fout_) {
      geen.hidden = false;
      geen.textContent = this.fout_;
    } else if (this.stand_ && this.rechten_.mag_beheren === false) {
      geen.hidden = false;
      geen.textContent = "Dit account mag het infoscherm niet beheren. Log in als receptie of beheerder.";
    } else {
      geen.hidden = true;
    }
    const magTonen = this.magTonen_();
    const zichtbaar = new Set(this.blokken_().map((b) => b.key));
    for (const sec of this.$$(".blok")) {
      sec.hidden = !magTonen || !zichtbaar.has(sec.dataset.blok);
      sec.classList.toggle("open", sec.dataset.blok === this.open_);
    }
    if (!magTonen) return;
    if (this.hass?.connected === false) this.status_("Geen verbinding", "fout");
    else if (!this.bezig_.size && !this.vuil_.size) this.status_(this.laatstOpgeslagen_ ? `Opgeslagen ${this.laatstOpgeslagen_}` : "", "ok");
  }

  status_(tekst, soort = "") {
    const el = this.$(".status");
    if (!el) return;
    el.textContent = tekst;
    el.className = `status ${soort}`;
  }

  /**
   * Teken één blok opnieuw uit de werkkopie -- tenzij de focus erin staat.
   * Dan wacht het tot de focus het blok verlaat (`focusWeg_`), want anders
   * verdwijnt het veld onder de vingers van de receptie.
   */
  teken_(blok, forceer = false) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec || !this.stand_) return;
    const actief = this.shadowRoot.activeElement;
    if (!forceer && actief && sec.contains(actief) && actief.matches("input, textarea, select")) {
      this.uitgesteld_.add(blok);
      this.tel_(blok);
      return;
    }
    this.uitgesteld_.delete(blok);
    const html = {
      personen: () => this.htmlPersonen_(this.werk_.personen),
      mededelingen: () => this.htmlMededelingen_(this.werk_.mededelingen),
      nieuws: () => this.htmlNieuws_(this.werk_.nieuws),
      praktijk: () => this.htmlPraktijk_(this.werk_.praktijk),
      indeling: () => this.htmlIndeling_(this.werk_.indeling),
      verlichting: () => this.htmlVerlichting_(this.werk_.installatie, this.werk_.instellingen),
      instellingen: () => this.htmlInstellingen_(this.werk_.scherm, this.werk_.instellingen),
      installatie: () => this.htmlInstallatie_(this.werk_.installatie, this.werk_.instellingen),
    }[blok]();
    const inhoud = sec.querySelector(".inhoud");
    inhoud.innerHTML = html + this.htmlVoet_(blok);
    this.plaatjes_(inhoud);
    this.tel_(blok);
  }

  focusWeg_(e) {
    if (!this.uitgesteld_.size) return;
    const van = e.target?.closest?.(".blok")?.dataset.blok;
    const naar = e.relatedTarget?.closest?.(".blok")?.dataset.blok;
    if (van && van !== naar && this.uitgesteld_.has(van)) {
      // Pas na de focuswissel zelf, anders is het nieuwe veld het oude.
      setTimeout(() => this.teken_(van), 0);
    }
  }

  tel_(blok) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec) return;
    const w = this.werk_;
    const tel = {
      personen: () => `${(w.personen ?? []).filter((p) => p.aanwezig).length} van ${(w.personen ?? []).length} aanwezig`,
      mededelingen: () => `${(w.mededelingen ?? []).length}`,
      nieuws: () => `${(w.nieuws ?? []).length}`,
      praktijk: () => w.praktijk?.naam ?? "",
      indeling: () => `${(w.indeling?.blokken ?? []).length} blokken`,
      verlichting: () => `${(w.installatie?.verlichting ?? []).length} lampen${w.instellingen?.verlichting_tonen === false ? " · uit" : ""}`,
      instellingen: () => `${(w.instellingen?.feeds ?? []).length} nieuwsbron(nen)`,
      installatie: () => (w.installatie?.weer ? "weer gekozen" : "geen weer"),
    }[blok]();
    sec.querySelector(".tel").textContent = tel;
    const info = this.blokInfo_(blok);
    const fout = info.secties.map((s) => this.fouten_[s]).find(Boolean);
    const bf = sec.querySelector(".bfout");
    bf.hidden = !fout;
    bf.textContent = fout ? "niet opgeslagen" : "";
  }

  htmlVoet_(blok) {
    const info = this.blokInfo_(blok);
    const fout = info.secties.map((s) => this.fouten_[s]).find(Boolean);
    const m = this.meldingen_[blok];
    if (!fout && !m) return "";
    return `<div class="voet"><span class="melding ${fout || m?.fout ? "fout" : ""}">${at(fout ? `Niet opgeslagen: ${fout}` : m?.tekst)}</span></div>`;
  }

  veld_(label, naam, waarde, { type = "text", i, extra = "", s } = {}) {
    return `<div class="veld"><label>${at(label)}</label><input type="${type}" data-veld="${naam}" ${s ? `data-s="${s}"` : ""} ${
      i !== undefined ? `data-i="${at(String(i))}"` : ""
    } value="${at(waarde)}" ${extra}></div>`;
  }

  schakel_(naam, aan, { i, label, s } = {}) {
    return `<label class="vink"><span class="schakel"><input type="checkbox" data-veld="${naam}" ${s ? `data-s="${s}"` : ""} ${
      i !== undefined ? `data-i="${at(String(i))}"` : ""
    } ${aan ? "checked" : ""}><span></span></span>${label ? `<span>${at(label)}</span>` : ""}</label>`;
  }

  keuze_(label, naam, waarde, opties, { s } = {}) {
    return `<div class="veld"><label>${at(label)}</label><select data-veld="${naam}" ${s ? `data-s="${s}"` : ""}>${opties
      .map(([v, l]) => `<option value="${at(v)}" ${String(v) === String(waarde ?? "") ? "selected" : ""}>${at(l)}</option>`)
      .join("")}</select></div>`;
  }

  /* ------------------------------------------------------------ de blokken */

  htmlPersonen_(lijst = []) {
    const rijen = lijst
      .map(
        (p, i) => `<div class="item persoon" data-i="${i}">
          <div class="avatar ${p.aanwezig ? "aan" : ""}" data-actie="foto" data-i="${i}" data-bestand="${at(p.foto)}" title="Foto kiezen">${at(initialen(p.naam))}</div>
          ${this.veld_("Naam", "naam", p.naam, { i })}
          ${this.veld_("Functie", "functie", p.functie, { i })}
          ${this.schakel_("aanwezig", p.aanwezig, { i, label: p.aanwezig ? "Aanwezig" : "Afwezig" })}
          <div class="knoppen">
            <button class="knop ico" type="button" data-actie="omhoog" data-i="${i}" title="Omhoog" ${i === 0 ? "disabled" : ""}>${resolve("arrowUp")}</button>
            <button class="knop ico" type="button" data-actie="omlaag" data-i="${i}" title="Omlaag" ${i === lijst.length - 1 ? "disabled" : ""}>${resolve("arrowDown")}</button>
            ${p.foto ? `<button class="knop ico" type="button" data-actie="fotoweg" data-i="${i}" title="Foto weghalen">${resolve("close")}</button>` : ""}
            <button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button>
          </div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Tik op de cirkel om een foto te kiezen. Zonder foto staan de initialen op het scherm (eerste letter van de voornaam en van het laatste woord van de achternaam). De volgorde hier is de volgorde op het scherm. Alles wordt vanzelf opgeslagen.</div>
      <div class="lijst">${rijen || `<div class="leeg">Nog geen medewerkers.</div>`}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Medewerker toevoegen</button></div>`;
  }

  htmlMededelingen_(lijst = []) {
    const rijen = lijst
      .map(
        (m, i) => `<div class="item mededeling" data-i="${i}">
          ${this.veld_("Tekst op het scherm", "tekst", m.tekst, { i })}
          ${this.veld_("Vanaf", "van", m.van, { i, type: "date" })}
          ${this.veld_("Tot en met", "tot", m.tot, { i, type: "date" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Eén regel op het welkomscherm, bijvoorbeeld "Vrijdag 20 september zijn wij vanaf 12:00 gesloten". Zonder datums staat hij er altijd; met meerdere wisselen ze elkaar af.</div>
      <div class="lijst">${rijen || `<div class="leeg">Geen mededeling.</div>`}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Mededeling toevoegen</button></div>`;
  }

  htmlNieuws_(lijst = []) {
    const rijen = lijst
      .map(
        (n, i) => `<div class="item bericht" data-i="${i}">
          <div class="b-rij">
            ${this.veld_("Titel", "titel", n.titel, { i })}
            ${this.veld_("Vanaf", "van", n.van, { i, type: "date" })}
            ${this.veld_("Tot en met", "tot", n.tot, { i, type: "date" })}
            <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
          </div>
          <div class="veld"><label>Tekst</label><textarea data-veld="tekst" data-i="${i}">${at(n.tekst)}</textarea></div>
          <div class="b-onder">
            <div class="plaatje" data-bestand="${at(n.afbeelding)}">${n.afbeelding ? "" : resolve("camera")}</div>
            <button class="knop klein" type="button" data-actie="foto" data-i="${i}">${resolve("camera")} ${n.afbeelding ? "Andere afbeelding" : "Afbeelding kiezen"}</button>
            ${n.afbeelding ? `<button class="knop klein" type="button" data-actie="fotoweg" data-i="${i}">${resolve("close")} Afbeelding weg</button>` : ""}
            ${this.schakel_("vast", n.vast, { i, label: "Bovenaan vastzetten" })}
          </div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Berichten van het pand: een nieuwe collega, een verbouwing, de vakantiesluiting. Ze staan vóór het nieuws van buiten. Zonder datums blijft een bericht staan tot u het weghaalt.</div>
      <div class="lijst">${rijen || `<div class="leeg">Nog geen berichten.</div>`}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Bericht toevoegen</button></div>`;
  }

  htmlPraktijk_(p = {}) {
    const ot = p.openingstijden ?? {};
    const rijenOt = DAGEN.map((dag) => {
      const vakken = ot[dag] ?? [];
      const dicht = vakken.length === 0;
      const v = (n, k) => vakken[n]?.[k] ?? "";
      return `<span class="dag">${DAGNAMEN[dag]}</span>
        ${this.schakel_("ot_open", !dicht, { i: dag, label: dicht ? "gesloten" : "open" })}
        <input type="time" data-veld="ot_0_0" data-i="${dag}" value="${v(0, 0)}" ${dicht ? "disabled" : ""}>
        <input type="time" data-veld="ot_0_1" data-i="${dag}" value="${v(0, 1)}" ${dicht ? "disabled" : ""}>
        <input type="time" class="vak2" data-veld="ot_1_0" data-i="${dag}" value="${v(1, 0)}" ${dicht ? "disabled" : ""}>
        <input type="time" class="vak2" data-veld="ot_1_1" data-i="${dag}" value="${v(1, 1)}" ${dicht ? "disabled" : ""}>`;
    }).join("");
    const uitz = (p.uitzonderingen ?? [])
      .map(
        (u, i) => `<div class="item uitz" data-i="${i}">
          ${this.veld_("Datum", "u_datum", u.datum, { i, type: "date" })}
          ${this.schakel_("u_open", (u.tijden ?? []).length > 0, { i, label: (u.tijden ?? []).length ? "open" : "gesloten" })}
          ${this.veld_("Van", "u_van", u.tijden?.[0]?.[0] ?? "", { i, type: "time", extra: u.tijden?.length ? "" : "disabled" })}
          ${this.veld_("Tot", "u_tot", u.tijden?.[0]?.[1] ?? "", { i, type: "time", extra: u.tijden?.length ? "" : "disabled" })}
          ${this.veld_("Reden (op het scherm)", "u_reden", u.reden, { i })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="u_verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
        </div>`
      )
      .join("");
    return `
      <div class="rij twee">
        ${this.veld_("Naam van de praktijk", "naam", p.naam)}
        ${this.veld_("Adresregel", "adres", p.adres)}
      </div>
      <div class="veld"><label>Welkomsteksten (één per regel; ze wisselen elkaar af)</label><textarea data-veld="welkom">${at((p.welkom ?? []).join("\n"))}</textarea></div>
      <div class="veld"><label>Openingstijden</label>
        <div class="ot-tabel">
          <span class="k"></span><span class="k"></span><span class="k">Open</span><span class="k">Dicht</span><span class="k vak2">Open</span><span class="k vak2">Dicht</span>
          ${rijenOt}
        </div>
        <div class="hulp">Twee vakken per dag voor een middagpauze. Buiten deze tijden dimt het scherm naar een klok met "Gesloten · morgen open om 08:00".</div>
      </div>
      <div class="veld"><label>Afwijkende dagen (feestdagen, studiedagen)</label>
        <div class="lijst">${uitz || `<div class="leeg">Geen afwijkende dagen.</div>`}</div>
        <div style="margin-top:8px"><button class="knop" type="button" data-actie="u_nieuw">${resolve("plus")} Afwijkende dag toevoegen</button></div>
      </div>`;
  }

  /** De indeling: een verkleind scherm waarin de blokken te slepen zijn. */
  htmlIndeling_(ind) {
    const blokken = ind?.blokken ?? [];
    const vandaag = isoDatum(new Date());
    const ibs = blokken
      .map((b) => {
        const info = BLOK_INFO[b.soort];
        if (!info) return "";
        const ontbreekt = blokOntbreekt(b.soort, this.stand_, [], vandaag);
        return `<div class="ib ${ontbreekt ? "ontbreekt" : ""}" data-id="${at(b.id)}" style="${this.ibStijl_(b)}" title="${at(ontbreekt ? `${info.naam}: ${ontbreekt}` : `${info.naam} -- sleep om te verplaatsen, hoek rechtsonder om de maat te wijzigen`)}">
          <div class="ib-in">
            <div class="ib-kop">${resolve(info.icoon, "question")}<span>${info.naam}</span></div>
            ${ontbreekt ? `<div class="ib-nb">${at(ontbreekt)}</div>` : ""}
            ${
              info.aantal
                ? `<div class="ib-aantal"><span>Toon</span><button type="button" data-actie="aantal_min" data-id="${at(b.id)}" title="Minder">−</button><b>${
                    b.aantal > 0 ? b.aantal : "alle"
                  }</b><button type="button" data-actie="aantal_plus" data-id="${at(b.id)}" title="Meer">+</button></div>`
                : ""
            }
            <button class="ib-weg" type="button" data-actie="blok_weg" data-id="${at(b.id)}" title="Van het scherm halen">${resolve("close")}</button>
            <div class="ib-greep" title="Maat wijzigen"></div>
          </div>
        </div>`;
      })
      .join("");
    const inGebruik = new Set(blokken.map((b) => b.soort));
    const opties = BLOK_SOORTEN.filter((s) => !inGebruik.has(s));
    return `<div class="hulp">Zo staat het welkomscherm op de iPad. Sleep een blok om het te verplaatsen, trek aan de hoek rechtsonder om het groter of kleiner te maken, en zet met − en + hoeveel er in een blok staat ("alle" = zoveel als er is). Een gestippeld blok staat NIET op het scherm zolang er niets in te tonen valt; de reden staat erin. Elke wijziging gaat meteen naar het scherm.</div>
      <div class="raster">${ibs}</div>
      <div class="knoppen" style="justify-content: flex-start">
        <select data-actie="blok_toevoegen" ${opties.length ? "" : "disabled"} style="width:auto">
          <option value="">${opties.length ? "Blok toevoegen…" : "Alle blokken staan op het scherm"}</option>
          ${opties.map((s) => `<option value="${s}">${BLOK_INFO[s].naam}</option>`).join("")}
        </select>
        <button class="knop" type="button" data-actie="indeling_standaard">Standaardindeling</button>
      </div>`;
  }

  ibStijl_(b) {
    return `left:${((b.x / KOLOMMEN) * 100).toFixed(3)}%;top:${((b.y / RIJEN) * 100).toFixed(3)}%;width:${((b.w / KOLOMMEN) * 100).toFixed(3)}%;height:${((b.h / RIJEN) * 100).toFixed(3)}%`;
  }

  htmlVerlichting_(inst = {}, instellingen = {}) {
    const lampen = inst.verlichting ?? [];
    const rijen = lampen
      .map((l, i) => {
        const a = this.hass?.states?.[l.entity]?.attributes ?? {};
        return `<div class="item lamp" data-i="${i}">
          <div class="ent"><b>${at(a.friendly_name ?? l.entity)}</b><span>${at(l.entity)}</span></div>
          ${this.veld_("Naam op het scherm", "l_naam", l.naam, { i, s: "installatie", extra: `placeholder="${at(a.friendly_name ?? "")}"` })}
        </div>`;
      })
      .join("");
    return `
      ${this.schakel_("verlichting_tonen", instellingen.verlichting_tonen !== false, { label: "Verlichting op het scherm tonen", s: "instellingen" })}
      <div class="hulp">De namen zoals ze op het scherm staan. Leeg = de naam uit Home Assistant. ${
        this.rechten_.is_admin ? "Welke lampen erbij horen kiest u in het blok Installatie." : "Welke lampen erbij horen bepaalt de installateur."
      }</div>
      <div class="lijst">${rijen || `<div class="leeg">Er zijn nog geen lampen gekozen.</div>`}</div>`;
  }

  htmlInstellingen_(s = {}, instellingen = {}) {
    const feeds = (instellingen.feeds ?? [])
      .map(
        (f, i) => `<div class="item feed" data-i="${i}">
          ${this.veld_("Naam", "f_naam", f.naam, { i, s: "instellingen" })}
          ${this.veld_("Adres van de RSS-feed", "f_url", f.url, { i, type: "url", s: "instellingen" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="f_verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
          ${this.feedFouten_[f.url] ? `<div class="feedfout" style="grid-column: 1 / -1">Niet opgehaald: ${at(this.feedFouten_[f.url])}</div>` : ""}
        </div>`
      )
      .join("");
    return `
      <div class="rij twee">
        <div class="veld"><label>Logo</label>
          <div class="b-onder">
            <div class="plaatje logo" data-bestand="${at(s.logo)}">${s.logo ? "" : resolve("camera")}</div>
            <button class="knop klein" type="button" data-actie="logo">${resolve("camera")} ${s.logo ? "Ander logo" : "Logo kiezen"}</button>
            ${s.logo ? `<button class="knop klein" type="button" data-actie="logoweg">${resolve("close")} Logo weg</button>` : ""}
          </div>
          <div class="hulp">Het logo houdt zijn eigen verhouding: lang, breed of vierkant.</div>
        </div>
        <div class="veld"><label>Accentkleur op het scherm</label>
          <div class="b-onder">
            <input type="color" data-veld="accent_kleur" data-s="scherm" value="${at(s.accent || "#026fa1")}">
            <input type="text" data-veld="accent" data-s="scherm" value="${at(s.accent)}" placeholder="leeg = standaard" style="max-width: 140px">
          </div>
        </div>
      </div>
      <div class="rij drie">
        ${this.keuze_("Uiterlijk", "uiterlijk", s.uiterlijk ?? "donker", [["donker", "Donker"], ["licht", "Licht"]], { s: "scherm" })}
        ${this.keuze_("Vorm van de foto's", "foto_vorm", s.foto_vorm ?? "rond", [["rond", "Rond"], ["vierkant", "Afgerond vierkant"]], { s: "scherm" })}
        ${this.keuze_("Pagina Aanwezig", "aanwezig_weergave", s.aanwezig_weergave ?? "gescheiden", [
          ["gescheiden", "Aanwezig en afwezig naast elkaar"],
          ["functie", "Per functie, naast elkaar"],
          ["lijst", "Eén lijst"],
        ], { s: "scherm" })}
      </div>
      <div class="rij drie">
        ${this.veld_("Terug naar Welkom na (seconden, 0 = nooit)", "terug_na", s.terug_na ?? 60, { type: "number", s: "scherm", extra: 'min="0" max="3600"' })}
        ${this.veld_("Schaal (1 = iPad 11 inch)", "schaal", s.schaal ?? 1, { type: "number", s: "scherm", extra: 'min="0.5" max="2" step="0.05"' })}
      </div>
      ${this.schakel_("nachtstand", s.nachtstand !== false, { label: "Nachtstand buiten de openingstijden (klok met 'Gesloten · morgen open om …')", s: "scherm" })}
      ${this.schakel_("aanwezig_teller", s.aanwezig_teller !== false, { label: "Teller bij Aanwezig (x van y)", s: "scherm" })}
      ${this.schakel_("nieuws_afbeeldingen", s.nieuws_afbeeldingen !== false, { label: "Afbeeldingen bij het nieuws", s: "scherm" })}
      ${this.schakel_("weer_animatie", s.weer_animatie !== false, { label: "Bewegende weericonen", s: "scherm" })}
      ${this.schakel_("reset_middernacht", instellingen.reset_middernacht !== false, { label: "Om middernacht iedereen op afwezig zetten", s: "instellingen" })}
      <div class="veld"><label>Nieuws van buiten (RSS)</label>
        <div class="hulp">Bijvoorbeeld het NOS-nieuws: https://feeds.nos.nl/nosnieuwsalgemeen. Wordt elk kwartier opgehaald en staat op het scherm ná het nieuws van het pand.</div>
        <div class="lijst">${feeds || `<div class="leeg">Geen bronnen.</div>`}</div>
        <div class="knoppen" style="justify-content: flex-start; margin-top: 8px">
          <button class="knop" type="button" data-actie="f_nieuw">${resolve("plus")} Bron toevoegen</button>
          <button class="knop" type="button" data-actie="f_ververs">Nu ophalen</button>
        </div>
      </div>`;
  }

  /** Alleen voor een admin: de entiteiten, en de kioskaccounts. */
  htmlInstallatie_(inst = {}, instellingen = {}) {
    const states = this.hass?.states ?? {};
    const vanDomein = (domeinen) =>
      Object.values(states)
        .filter((st) => domeinen.includes(st.entity_id.split(".")[0]))
        .map((st) => ({ id: st.entity_id, naam: st.attributes?.friendly_name ?? st.entity_id }))
        .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
    const weer = vanDomein(["weather"]);
    const agendas = vanDomein(["calendar"]);
    const lampen = vanDomein(["light", "switch"]);
    const gekozenAgenda = new Set(inst.agendas ?? []);
    const gekozenLamp = new Set((inst.verlichting ?? []).map((l) => l.entity));
    const vinkjes = (lijst, veld, gekozen) =>
      lijst.length
        ? lijst
            .map(
              (e) => `<label class="vink" data-zoek="${at(`${e.naam} ${e.id}`.toLowerCase())}"><input type="checkbox" data-veld="${veld}" data-s="installatie" data-i="${at(e.id)}" ${
                gekozen.has(e.id) ? "checked" : ""
              }> ${at(e.naam)}<span class="id">${at(e.id)}</span></label>`
            )
            .join("")
        : `<div class="leeg">Geen entiteiten van dit soort gevonden.</div>`;

    let kiosk = "";
    const lijst = this.gebruikers_ ?? [];
    const gekozen = new Set(instellingen.kiosk_gebruikers ?? []);
    kiosk = `<div class="veld"><label>Kioskaccounts</label>
      <div class="hulp">Het account waarmee de iPad is ingelogd. Zo'n account mag alleen aanwezigheid omzetten en lampen schakelen, en niets beheren.</div>
      <div class="gebruikers">${
        lijst.length
          ? lijst.map((g) => `<label class="vink"><input type="checkbox" data-veld="kiosk" data-s="instellingen" data-i="${at(g.id)}" ${gekozen.has(g.id) ? "checked" : ""}> ${at(g.naam)}${g.is_admin ? " (beheerder)" : ""}</label>`).join("")
          : `<div class="leeg">Gebruikers laden…</div>`
      }</div></div>`;

    return `
      <div class="hulp">Dit blok ziet alleen een beheerder. De receptie ziet de gevolgen: het weer, de agenda en de lampen verschijnen op het scherm zodra u ze hier kiest, en de namen van de lampen mag zij zelf aanpassen in het blok Verlichting.</div>
      ${this.keuze_("Weerentiteit", "weer", inst.weer ?? "", [["", "(geen weer op het scherm)"], ...weer.map((e) => [e.id, `${e.naam} (${e.id})`])], { s: "installatie" })}
      <div class="veld"><label>Agenda's (de afspraken van vandaag)</label><div class="keuzes">${vinkjes(agendas, "agenda", gekozenAgenda)}</div></div>
      <div class="veld"><label>Lampen en schakelaars op het scherm</label>
        <input type="text" data-filter="lampen" placeholder="Zoeken op naam of entiteit…">
        <div class="keuzes" data-lijst="lampen">${vinkjes(lampen, "lamp", gekozenLamp)}</div>
      </div>
      ${kiosk}`;
  }

  /** Foto's en logo's uit de blob-cache in de zojuist getekende blokken. */
  plaatjes_(wortel) {
    for (const el of wortel.querySelectorAll("[data-bestand]:not([data-bestand=''])")) {
      bestandUrl(this.hass, el.dataset.bestand).then((url) => {
        if (url && el.isConnected) el.innerHTML = `<img alt="" src="${url}">`;
      });
    }
  }

  /* ------------------------------------------------------------ invoer */

  /** Iets is gewijzigd: onthouden, en na een adempauze opslaan. */
  markeer_(sectie, blok, ms = ADEMPAUZE_KNOP) {
    this.vuil_.add(sectie);
    this.bron_ = { ...(this.bron_ ?? {}), [sectie]: blok };
    this.versie_[sectie] = (this.versie_[sectie] ?? 0) + 1;
    this.fouten_[sectie] = null;
    if (blok) {
      this.meldingen_[blok] = null;
      this.tel_(blok);
    }
    this.status_("Opslaan…", "bezig");
    clearTimeout(this.timers_[sectie]);
    this.timers_[sectie] = setTimeout(() => this.bewaar_(sectie), ms);
  }

  invoer_(e) {
    const el = e.target;
    if (el?.dataset?.filter) return this.filter_(el);
    if (el?.dataset?.actie === "blok_toevoegen") return this.blokToevoegen_(el.value, el);
    const veld = el?.dataset?.veld;
    if (!veld) return undefined;
    const blok = el.closest(".blok")?.dataset.blok;
    if (!blok) return undefined;
    const info = this.blokInfo_(blok);
    const sectie = el.dataset.s || info.secties[0];
    const i = el.dataset.i;
    const w = this.werk_[sectie];
    const waarde = el.type === "checkbox" ? el.checked : el.value;
    // Typen wacht op de laatste letter en wordt bij `input` verwerkt; een
    // schakelaar, keuze of datum gaat meteen, bij `change`. Zo telt niets dubbel.
    const tekst = el.type === "text" || el.type === "url" || el.type === "number" || el.tagName === "TEXTAREA";
    const kleur = el.type === "color";
    if ((tekst || kleur) && e.type !== "input") return undefined;
    if (!tekst && !kleur && e.type !== "change") return undefined;

    if (sectie === "personen" || sectie === "mededelingen" || sectie === "nieuws") {
      const item = w[Number(i)];
      if (!item) return undefined;
      item[veld] = waarde;
      if (veld === "naam") {
        const av = el.closest(".item")?.querySelector(".avatar");
        if (av && !av.querySelector("img")) av.textContent = initialen(waarde);
      }
      if (veld === "aanwezig") {
        // Een schakelaar die hier is omgezet gaat als bewuste keuze mee; de
        // andere blijven van de iPad (zie `bewaar_`).
        item._aanwezig = true;
        const lbl = el.closest(".vink")?.querySelector("span:last-child");
        if (lbl) lbl.textContent = waarde ? "Aanwezig" : "Afwezig";
        el.closest(".item")?.querySelector(".avatar")?.classList.toggle("aan", waarde);
      }
    } else if (sectie === "praktijk") {
      this.invoerPraktijk_(w, veld, i, waarde, el);
    } else if (sectie === "scherm") {
      if (veld === "accent_kleur") {
        w.accent = waarde;
        const t = el.closest(".b-onder")?.querySelector('[data-veld="accent"]');
        if (t) t.value = waarde;
      } else if (veld === "accent") {
        w.accent = String(waarde).trim() || null;
      } else if (el.type === "number") {
        const n = Number(waarde);
        if (!Number.isFinite(n)) return undefined;
        w[veld] = n;
      } else {
        w[veld] = waarde;
      }
    } else if (sectie === "installatie") {
      if (veld === "weer") w.weer = waarde || null;
      else if (veld === "agenda") {
        const set = new Set(w.agendas ?? []);
        if (waarde) set.add(i);
        else set.delete(i);
        w.agendas = [...set];
      } else if (veld === "lamp") {
        w.verlichting ??= [];
        const bestaat = w.verlichting.findIndex((l) => l.entity === i);
        if (waarde && bestaat < 0) w.verlichting.push({ entity: i, naam: "" });
        if (!waarde && bestaat >= 0) w.verlichting.splice(bestaat, 1);
        this.uitgesteld_.add("verlichting");
      } else if (veld === "l_naam") {
        const l = w.verlichting?.[Number(i)];
        if (l) l.naam = waarde;
      }
    } else if (sectie === "instellingen") {
      if (veld === "kiosk") {
        const set = new Set(w.kiosk_gebruikers ?? []);
        if (waarde) set.add(i);
        else set.delete(i);
        w.kiosk_gebruikers = [...set];
      } else if (veld.startsWith("f_")) {
        const f = w.feeds[Number(i)];
        if (f) f[veld.slice(2)] = waarde;
      } else {
        w[veld] = waarde;
      }
    }
    this.markeer_(sectie, blok, tekst ? ADEMPAUZE_TEKST : ADEMPAUZE_KNOP);
    return undefined;
  }

  invoerPraktijk_(p, veld, i, waarde, el) {
    if (veld === "welkom") {
      p.welkom = String(waarde).split("\n").map((r) => r.trim()).filter(Boolean);
    } else if (veld === "ot_open") {
      p.openingstijden ??= {};
      p.openingstijden[i] = waarde ? [["08:00", "17:00"]] : [];
      const rij = el.closest(".ot-tabel");
      for (const inp of rij.querySelectorAll(`input[type="time"][data-i="${i}"]`)) {
        inp.disabled = !waarde;
        const [, n, k] = inp.dataset.veld.split("_");
        inp.value = p.openingstijden[i][Number(n)]?.[Number(k)] ?? "";
      }
      const lbl = el.closest(".vink")?.querySelector("span:last-child");
      if (lbl) lbl.textContent = waarde ? "open" : "gesloten";
    } else if (veld.startsWith("ot_")) {
      const [, n, k] = veld.split("_").map(Number);
      p.openingstijden ??= {};
      const vakken = p.openingstijden[i] ?? [];
      while (vakken.length <= n) vakken.push(["", ""]);
      vakken[n][k] = waarde;
      // Een leeg tweede vak telt niet mee.
      p.openingstijden[i] = vakken.filter((v, idx) => idx === 0 || (v[0] && v[1]));
      if (!p.openingstijden[i].length) p.openingstijden[i] = [["", ""]];
    } else if (veld.startsWith("u_")) {
      const u = p.uitzonderingen[Number(i)];
      if (!u) return;
      const naam = veld.slice(2);
      if (naam === "open") {
        u.tijden = waarde ? [["08:00", "17:00"]] : [];
        const item = el.closest(".item");
        for (const inp of item.querySelectorAll('input[type="time"]')) {
          inp.disabled = !waarde;
          inp.value = waarde ? (inp.dataset.veld === "u_van" ? "08:00" : "17:00") : "";
        }
        const lbl = el.closest(".vink")?.querySelector("span:last-child");
        if (lbl) lbl.textContent = waarde ? "open" : "gesloten";
      } else if (naam === "van" || naam === "tot") {
        u.tijden = [[naam === "van" ? waarde : u.tijden?.[0]?.[0] ?? "", naam === "tot" ? waarde : u.tijden?.[0]?.[1] ?? ""]];
      } else {
        u[naam] = waarde;
      }
    } else {
      p[veld] = waarde;
    }
  }

  /** Het zoekveld boven een lange lijst vinkjes. Slaat niets op. */
  filter_(el) {
    const zoek = el.value.trim().toLowerCase();
    const lijst = el.parentElement?.querySelector(`[data-lijst="${el.dataset.filter}"]`);
    for (const rij of lijst?.querySelectorAll("[data-zoek]") ?? []) {
      rij.hidden = Boolean(zoek) && !rij.dataset.zoek.includes(zoek);
    }
  }

  /* ------------------------------------------------------------ de indeling */

  blokToevoegen_(soort, select) {
    if (select) select.value = "";
    const info = BLOK_INFO[soort];
    if (!info) return;
    const w = this.werk_.indeling ?? (this.werk_.indeling = { blokken: [] });
    if (w.blokken.some((b) => b.soort === soort)) return;
    let [bw, bh] = info.maat;
    let plek = vrijePlek(w.blokken, bw, bh);
    // Past de gewenste maat niet, dan kleiner; past 1x1 ook niet, dan is het vol.
    while (!plek && (bw > 1 || bh > 1)) {
      if (bh > 1) bh -= 1;
      else bw -= 1;
      plek = vrijePlek(w.blokken, bw, bh);
    }
    if (!plek) {
      this.meldingen_.indeling = { tekst: "Er is geen plek meer. Maak eerst een ander blok kleiner of haal er een weg.", fout: true };
      return this.teken_("indeling", true);
    }
    w.blokken.push({
      id: `b-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
      soort,
      x: plek.x,
      y: plek.y,
      w: bw,
      h: bh,
      aantal: info.aantal ? 3 : 0,
    });
    this.markeer_("indeling", "indeling");
    return this.teken_("indeling", true);
  }

  /** Slepen en de maat wijzigen, met echte pointer-events en pointer capture. */
  sleepStart_(e) {
    const ib = e.target.closest?.(".ib");
    if (!ib || e.target.closest("button, input, select")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const raster = ib.closest(".raster");
    const w = this.werk_.indeling;
    const blok = w?.blokken?.find((b) => b.id === ib.dataset.id);
    if (!blok || !raster) return;
    const modus = e.target.closest(".ib-greep") ? "maat" : "plaats";
    const r = raster.getBoundingClientRect();
    const celW = r.width / KOLOMMEN;
    const celH = r.height / RIJEN;
    const start = { x: e.clientX, y: e.clientY };
    let kandidaat = { ...blok };
    let bewogen = false;

    e.preventDefault();
    try { ib.setPointerCapture(e.pointerId); } catch { /* geen capture: dan gewoon doorgaan */ }
    ib.classList.add("sleept");

    const beweeg = (ev) => {
      const dx = Math.round((ev.clientX - start.x) / celW);
      const dy = Math.round((ev.clientY - start.y) / celH);
      if (dx || dy) bewogen = true;
      kandidaat =
        modus === "plaats"
          ? { ...blok, x: klem(blok.x + dx, 0, KOLOMMEN - blok.w), y: klem(blok.y + dy, 0, RIJEN - blok.h) }
          : { ...blok, w: klem(blok.w + dx, 1, KOLOMMEN - blok.x), h: klem(blok.h + dy, 1, RIJEN - blok.y) };
      ib.classList.toggle("ongeldig", !pastVrij(w.blokken, kandidaat));
      ib.style.cssText = this.ibStijl_(kandidaat);
    };
    const klaar = () => {
      ib.removeEventListener("pointermove", beweeg);
      ib.removeEventListener("pointerup", klaar);
      ib.removeEventListener("pointercancel", klaar);
      ib.classList.remove("sleept", "ongeldig");
      const anders = kandidaat.x !== blok.x || kandidaat.y !== blok.y || kandidaat.w !== blok.w || kandidaat.h !== blok.h;
      if (bewogen && anders && pastVrij(w.blokken, kandidaat)) {
        Object.assign(blok, kandidaat);
        this.markeer_("indeling", "indeling");
      }
      this.teken_("indeling", true);
    };
    ib.addEventListener("pointermove", beweeg);
    ib.addEventListener("pointerup", klaar);
    ib.addEventListener("pointercancel", klaar);
  }

  /* ------------------------------------------------------------ klikken */

  async klik_(e) {
    const bk = e.target.closest(".bk");
    if (bk) {
      const blok = bk.closest(".blok").dataset.blok;
      this.open_ = this.open_ === blok ? null : blok;
      for (const sec of this.$$(".blok")) sec.classList.toggle("open", sec.dataset.blok === this.open_);
      if (this.open_ && this.uitgesteld_.has(this.open_)) this.teken_(this.open_, true);
      return;
    }
    const knop = e.target.closest("[data-actie]");
    if (!knop || knop.disabled || knop.tagName === "SELECT") return;
    const blok = knop.closest(".blok")?.dataset.blok;
    const actie = knop.dataset.actie;
    const i = Number(knop.dataset.i);
    const info = this.blokInfo_(blok);
    const sectie = info?.secties[0];
    const w = this.werk_[sectie];

    if (actie === "nieuw") {
      const leeg = { personen: { naam: "", functie: "", aanwezig: false }, mededelingen: { tekst: "" }, nieuws: { titel: "", tekst: "" } }[sectie];
      w.push(leeg);
      this.teken_(blok, true);
      this.$(`.blok[data-blok="${blok}"] .item:last-of-type input[type="text"]`)?.focus();
      return;
    }
    if (actie === "verwijder") {
      const item = w[i];
      const naam = item?.naam || item?.titel || item?.tekst || "dit item";
      if (item && (item.id || item.naam || item.titel || item.tekst)) {
        const ja = await vraagBevestiging({ title: "Verwijderen?", text: `"${naam}" verdwijnt meteen van het scherm.`, confirmText: "Verwijderen" });
        if (!ja) return;
      }
      w.splice(i, 1);
      this.markeer_(sectie, blok);
      return this.teken_(blok, true);
    }
    if (actie === "omhoog" || actie === "omlaag") {
      const j = actie === "omhoog" ? i - 1 : i + 1;
      if (j < 0 || j >= w.length) return;
      [w[i], w[j]] = [w[j], w[i]];
      this.markeer_(sectie, blok);
      return this.teken_(blok, true);
    }
    if (actie === "foto" || actie === "logo") {
      this.doel_ = actie === "logo" ? { sectie: "scherm", blok, veld: "logo" } : { sectie, blok, i, veld: sectie === "personen" ? "foto" : "afbeelding" };
      const file = this.$(".file");
      file.value = "";
      file.click();
      return;
    }
    if (actie === "fotoweg" || actie === "logoweg") {
      if (actie === "logoweg") {
        this.werk_.scherm.logo = null;
        this.markeer_("scherm", blok);
      } else {
        w[i][sectie === "personen" ? "foto" : "afbeelding"] = null;
        this.markeer_(sectie, blok);
      }
      return this.teken_(blok, true);
    }
    if (actie === "u_nieuw") {
      w.uitzonderingen ??= [];
      w.uitzonderingen.push({ datum: "", tijden: [], reden: "" });
      return this.teken_(blok, true);
    }
    if (actie === "u_verwijder") {
      w.uitzonderingen.splice(i, 1);
      this.markeer_(sectie, blok);
      return this.teken_(blok, true);
    }
    if (actie === "f_nieuw") {
      const inst = this.werk_.instellingen;
      inst.feeds ??= [];
      inst.feeds.push({ naam: "", url: "" });
      return this.teken_(blok, true);
    }
    if (actie === "f_verwijder") {
      this.werk_.instellingen.feeds.splice(i, 1);
      this.markeer_("instellingen", blok);
      return this.teken_(blok, true);
    }
    if (actie === "f_ververs") {
      knop.disabled = true;
      try {
        const r = await ververFeeds(this.hass);
        this.feedFouten_ = r.feed_fouten ?? {};
        this.meldingen_[blok] = { tekst: `${(r.feeds ?? []).length} bericht(en) opgehaald.` };
      } catch (fout) {
        this.meldingen_[blok] = { tekst: fout?.message ?? "Ophalen lukte niet.", fout: true };
      }
      return this.teken_(blok, true);
    }
    if (actie === "blok_weg" || actie === "aantal_min" || actie === "aantal_plus") {
      const ind = this.werk_.indeling;
      const b = ind?.blokken?.find((x) => x.id === knop.dataset.id);
      if (!b) return;
      if (actie === "blok_weg") ind.blokken = ind.blokken.filter((x) => x !== b);
      else if (actie === "aantal_min") b.aantal = b.aantal <= 1 ? 0 : b.aantal - 1;
      else b.aantal = Math.min(50, (b.aantal || 0) + 1);
      this.markeer_("indeling", "indeling");
      return this.teken_("indeling", true);
    }
    if (actie === "indeling_standaard") {
      const ja = await vraagBevestiging({ title: "Standaardindeling?", text: "De blokken gaan terug naar hun oorspronkelijke plek en maat.", confirmText: "Terugzetten" });
      if (!ja) return;
      this.werk_.indeling = standaardIndeling();
      this.markeer_("indeling", "indeling");
      return this.teken_("indeling", true);
    }
    return undefined;
  }

  async bestandGekozen_(e) {
    const bestand = e.target.files?.[0];
    const doel = this.doel_;
    this.doel_ = null;
    if (!bestand || !doel) return;
    const { sectie, blok, i, veld } = doel;
    this.meldingen_[blok] = { tekst: "Bezig met uploaden…" };
    this.teken_(blok, true);
    try {
      const meta = await upload(this.hass, bestand);
      const w = this.werk_[sectie];
      const houder = i === undefined ? w : w[i];
      const oud = houder[veld];
      houder[veld] = meta.id;
      // Het oude bestand hangt nergens meer aan zodra dit is opgeslagen; nu al
      // vergeten in de cache is genoeg, de server ruimt het op bij opslaan.
      if (oud) this.oudeBestanden_ = [...(this.oudeBestanden_ ?? []), oud];
      this.meldingen_[blok] = { tekst: `${meta.naam || "Bestand"} geüpload.` };
      this.markeer_(sectie, blok);
    } catch (fout) {
      this.meldingen_[blok] = { tekst: fout?.message ?? "Uploaden lukte niet.", fout: true };
    }
    this.teken_(blok, true);
  }

  /* ------------------------------------------------------------ opslaan */

  /** Wat er naar de server gaat: zonder lege rijen en zonder werkvelden. */
  payload_(sectie) {
    const w = this.werk_[sectie];
    switch (sectie) {
      case "personen":
        return (w ?? [])
          .filter((p) => p.naam?.trim())
          .map(({ _aanwezig, aanwezig, ...p }) => (_aanwezig ? { ...p, aanwezig } : p));
      case "mededelingen":
        return (w ?? []).filter((m) => m.tekst?.trim());
      case "nieuws":
        return (w ?? []).filter((n) => n.titel?.trim());
      case "praktijk":
        return {
          ...w,
          openingstijden: Object.fromEntries(DAGEN.map((d) => [d, (w.openingstijden?.[d] ?? []).filter((v) => v[0] && v[1])])),
          uitzonderingen: (w.uitzonderingen ?? []).filter((u) => u.datum).map((u) => ({ ...u, tijden: (u.tijden ?? []).filter((v) => v[0] && v[1]) })),
        };
      case "instellingen":
        return { ...w, feeds: (w.feeds ?? []).filter((f) => f.url?.trim()) };
      default:
        return w;
    }
  }

  async bewaar_(sectie) {
    if (!this.hass || this.bezig_.has(sectie)) {
      // Onderweg: zodra dat klaar is komt deze wijziging mee (zie hieronder).
      return;
    }
    const versie = this.versie_[sectie] ?? 0;
    this.bezig_.add(sectie);
    this.status_("Opslaan…", "bezig");
    try {
      const r = await bewaar(this.hass, sectie, this.payload_(sectie));
      const resultaat = r[sectie];
      this.koppel_(sectie, resultaat);
      if (this.stand_) this.stand_[sectie] = kloon(resultaat);
      this.fouten_[sectie] = null;
      if ((this.versie_[sectie] ?? 0) === versie) this.vuil_.delete(sectie);
      const nu = new Date();
      this.laatstOpgeslagen_ = `${String(nu.getHours()).padStart(2, "0")}:${String(nu.getMinutes()).padStart(2, "0")}`;
      // Bestanden die door een nieuw bestand vervangen zijn mogen weg.
      for (const oud of this.oudeBestanden_ ?? []) {
        if (!this.inGebruik_(oud)) {
          verwijderBestand(this.hass, oud).catch(() => {});
          vergeetBestand(oud);
        }
      }
      this.oudeBestanden_ = [];
    } catch (fout) {
      this.fouten_[sectie] = fout?.message ?? "Opslaan lukte niet.";
    } finally {
      this.bezig_.delete(sectie);
    }
    // Is er intussen verder getypt, dan nog een keer.
    if (this.vuil_.has(sectie) && (this.versie_[sectie] ?? 0) !== versie && !this.fouten_[sectie]) {
      clearTimeout(this.timers_[sectie]);
      this.timers_[sectie] = setTimeout(() => this.bewaar_(sectie), ADEMPAUZE_KNOP);
    }
    for (const b of BLOKKEN) if (b.secties.includes(sectie)) this.tel_(b.key);
    // Andere blokken die dit onderdeel tonen (de lampnamen na een vinkje in
    // Installatie, bijvoorbeeld) mogen nu bijgetekend worden; het blok waar
    // de wijziging vandaan kwam blijft met rust.
    if (!this.fouten_[sectie]) {
      for (const b of BLOKKEN) if (b.secties.includes(sectie) && b.key !== this.bron_?.[sectie]) this.teken_(b.key);
    }
    if (this.fouten_[sectie]) {
      this.status_(`Niet opgeslagen: ${this.fouten_[sectie]}`, "fout");
      for (const b of BLOKKEN) if (b.secties.includes(sectie)) this.teken_(b.key);
    } else if (!this.bezig_.size && !this.vuil_.size) {
      this.status_(`Opgeslagen ${this.laatstOpgeslagen_}`, "ok");
    }
  }

  /**
   * De ID's (en initialen) die de server uitdeelde terug in de werkkopie,
   * zonder te hertekenen. De server geeft de lijst in dezelfde volgorde
   * terug als hij gestuurd is; alleen de rijen zonder naam zijn er niet in.
   */
  koppel_(sectie, resultaat) {
    const w = this.werk_[sectie];
    if (!Array.isArray(w) || !Array.isArray(resultaat)) return;
    const vol = { personen: (p) => p.naam?.trim(), mededelingen: (m) => m.tekst?.trim(), nieuws: (n) => n.titel?.trim() }[sectie];
    if (!vol) return;
    let k = 0;
    w.forEach((item, i) => {
      if (!vol(item)) return;
      const van = resultaat[k];
      k += 1;
      if (!van) return;
      item.id = van.id;
      if (sectie === "personen") {
        item.initialen = van.initialen;
        if (item._aanwezig) delete item._aanwezig;
      }
      if (sectie === "nieuws" && van.gemaakt) item.gemaakt = van.gemaakt;
      const rij = this.$(`.blok[data-blok="${sectie}"] .item[data-i="${i}"]`);
      if (rij) rij.dataset.id = van.id;
    });
  }

  inGebruik_(id) {
    const s = this.stand_ ?? {};
    return (
      s.scherm?.logo === id ||
      (s.personen ?? []).some((p) => p.foto === id) ||
      (s.nieuws ?? []).some((n) => n.afbeelding === id) ||
      (this.werk_.personen ?? []).some((p) => p.foto === id) ||
      (this.werk_.nieuws ?? []).some((n) => n.afbeelding === id) ||
      this.werk_.scherm?.logo === id
    );
  }
}

/* ------------------------------------------------------------ editor */

const LABELS = {
  title: "Titel",
  show_personen: "Blok Medewerkers",
  show_mededelingen: "Blok Mededeling",
  show_nieuws: "Blok Nieuws",
  show_praktijk: "Blok Praktijk",
  show_indeling: "Blok Indeling",
  show_verlichting: "Blok Verlichting",
  show_instellingen: "Blok Instellingen en logo",
  show_installatie: "Blok Installatie (beheerder)",
  open: "Staat open bij het laden",
};

export class InfoschermBeheerEditor extends DacEditor {
  defaults() {
    return { ...STANDAARD };
  }

  schema() {
    return [
      { name: "title", selector: sel.text() },
      {
        name: "open",
        selector: sel.select([
          ...BLOKKEN.map((b) => ({ value: b.key, label: b.titel })),
          { value: "", label: "Alles dicht" },
        ]),
      },
      ...BLOKKEN.map((b) => ({ name: `show_${b.key}`, selector: sel.bool() })),
    ];
  }

  label(item) {
    return LABELS[item.name] ?? super.label(item);
  }

  helper(item) {
    if (item.name === "show_instellingen") {
      return "Logo, accent, uiterlijk, nieuwsbronnen en de middernachtregel. Zet dit blok uit op een dashboard voor een receptie die daar niet aan hoeft te zitten.";
    }
    if (item.name === "show_installatie") {
      return "Weer, agenda's, lampen en kioskaccounts. Alleen een beheerder ziet dit blok, ook als het aanstaat.";
    }
    return undefined;
  }
}

registerCard(TAG, InfoschermBeheerCard, {
  name: "DomotiApp Infoscherm Beheer",
  description:
    "Voor de receptie: medewerkers, mededeling van de dag, nieuws, openingstijden, de indeling van het scherm en het logo. Alles wordt vanzelf opgeslagen en staat meteen op het scherm.",
  preview: false,
});
registerEditor(`${TAG}-editor`, InfoschermBeheerEditor);
InfoschermBeheerCard.getConfigElement = () => document.createElement(`${TAG}-editor`);
InfoschermBeheerCard.getStubConfig = () => ({ title: "Infoscherm" });
