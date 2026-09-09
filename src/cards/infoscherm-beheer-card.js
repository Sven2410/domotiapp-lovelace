/**
 * DomotiApp Infoscherm Beheer -- wat de receptie op haar pc ziet.
 *
 * Alles wat op het wachtkamerscherm staat en van de praktijk is, wordt hier
 * onderhouden: de medewerkers, de mededeling van de dag, het nieuws, de
 * praktijkgegevens met het logo en de openingstijden, en een paar
 * instellingen. Niets hiervan staat in een kaartconfig: de receptie is een
 * gewone gebruiker, en die kan geen dashboard opslaan. Het gaat allemaal naar
 * de serverkant (`infoscherm/`), en elk open scherm krijgt het meteen.
 *
 * GEEN ha-form
 *
 * De editors van deze familie zijn op `ha-form` gebouwd, en dat is goed voor
 * een INSTALLATEUR die een kaart instelt. Dit is geen editor maar een kaart
 * die een receptioniste de hele dag openheeft. Gewone invoervelden, in de
 * vormtaal van de familie, met per blok één knop Opslaan. Zo ziet ze nooit een
 * YAML, nooit een entiteit, en nooit een dialoog van Home Assistant.
 *
 * WAT ER NIET OPNIEUW GETEKEND WORDT
 *
 * Een lijst wordt opnieuw getekend als er een rij bij komt, weggaat of van
 * plaats wisselt, en als de server een nieuwe stand stuurt terwijl het blok
 * niet vuil is. Typen tekent NIETS opnieuw: het veld schrijft rechtstreeks in
 * de werkkopie. Anders verliest het veld zijn focus bij elke letter -- en dat
 * is precies de fout die de entiteiten-editor twee uitgaven heeft gekost
 * (valkuil 23).
 *
 * Een blok dat vuil is (er is getypt, nog niet opgeslagen) wordt door een
 * stand van de server NIET overschreven. Anders verdwijnt het werk van de
 * receptie zodra een medewerker op de iPad op zijn naam tikt.
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
import { DAGEN, DAGNAMEN, initialen } from "./infoscherm-logica.js";

const TAG = "domotiapp-infoscherm-beheer-card";

const BLOKKEN = ["personen", "mededelingen", "nieuws", "praktijk", "instellingen"];

const STANDAARD = {
  title: "Infoscherm",
  show_personen: true,
  show_mededelingen: true,
  show_nieuws: true,
  show_praktijk: true,
  show_instellingen: true,
  open: "personen",
};

const css = /* css */ `
  /* Een containerquery en geen mediaquery: de kaart staat in een kolom van
     een sections-view, en die is smal terwijl het venster breed is. */
  :host { container-type: inline-size; }
  .card { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .icon { width: 1em; height: 1em; display: block; }

  .kop { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .kop h2 { margin: 0; font-size: 17px; font-weight: 600; }
  .kop .eyebrow { margin-bottom: 2px; }
  .status { font-size: 12px; color: var(--dac-ink-3); display: flex; align-items: center; gap: 6px; }
  .status.fout { color: var(--dac-bad); }

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
  .blok > .bk .vuil { font-size: 11px; font-weight: 600; color: var(--dac-warn); }
  .blok > .inhoud { display: none; padding: 14px; flex-direction: column; gap: 12px; }
  .blok.open > .inhoud { display: flex; }

  /* velden */
  .rij { display: grid; gap: 10px; align-items: center; }
  .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .veld label { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="url"], input[type="date"], input[type="time"], input[type="color"], textarea, select {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: dark;
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  input[type="color"] { padding: 2px 4px; width: 56px; }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--dac-accent-hi); margin: 0; }
  .vink { display: flex; align-items: center; gap: 8px; font-size: 13px; min-height: 40px; cursor: pointer; }

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
  .knop.acc { color: var(--dac-ink); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 50%, transparent); }
  .knop.vuil { background: var(--dac-accent-hi); color: #fff; border-color: transparent; }
  .knop.klein { height: 32px; padding: 0 10px; font-size: 12px; }
  .knop.ico { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--dac-radius-sm); }
  .knop.gevaar { color: var(--dac-bad); }
  .knop:disabled { opacity: 0.5; cursor: default; }
  .voet { display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap; }
  .voet .melding { font-size: 12px; color: var(--dac-ink-3); margin-right: auto; }
  .voet .melding.fout { color: var(--dac-bad); }

  /* lijsten */
  .lijst { display: flex; flex-direction: column; gap: 8px; }
  .item { display: grid; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .item.persoon { grid-template-columns: 44px minmax(0, 1.4fr) minmax(0, 1fr) auto auto; }
  .item.mededeling { grid-template-columns: minmax(0, 2fr) 150px 150px auto; }
  .item.bericht { grid-template-columns: minmax(0, 1fr); }
  .item.feed { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto; }
  .item.uitz { grid-template-columns: 150px auto 110px 110px minmax(0, 1fr) auto; }
  .knoppen { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: var(--dac-ink-3); background: var(--dac-surface-hi); border: 1px solid var(--dac-border); cursor: pointer; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .leeg { font-size: 13px; color: var(--dac-ink-3); padding: 6px 2px; }

  .bericht .b-rij { display: grid; grid-template-columns: minmax(0, 1fr) 150px 150px auto; gap: 10px; align-items: end; }
  .bericht .b-onder { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .plaatje { width: 96px; height: 64px; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface-hi); display: grid; place-items: center; color: var(--dac-ink-3); font-size: 20px; }
  .plaatje img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .plaatje.logo { width: 64px; height: 64px; }
  .plaatje.logo img { object-fit: contain; }

  .ot-tabel { display: grid; grid-template-columns: 90px auto 100px 100px 100px 100px; gap: 6px 10px; align-items: center; font-size: 13px; }
  .ot-tabel .k { font-size: 11px; color: var(--dac-ink-3); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .ot-tabel input[type="time"] { min-height: 34px; padding: 4px 6px; font-size: 13px; }
  .ot-tabel .dag { color: var(--dac-ink-2); }
  .ot-tabel input:disabled { opacity: 0.35; }

  .twee { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hulp { font-size: 12px; color: var(--dac-ink-3); line-height: 1.4; }
  .gebruikers { display: flex; flex-direction: column; gap: 6px; }
  .feedfout { font-size: 12px; color: var(--dac-bad); }

  .geen { padding: 24px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
  .file { display: none; }

  @container (max-width: 720px) {
    .item.persoon { grid-template-columns: 44px minmax(0, 1fr) auto; }
    .item.persoon .veld:nth-child(3) { grid-column: 2 / -1; }
    .item.mededeling, .bericht .b-rij, .item.uitz { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .item.feed { grid-template-columns: minmax(0, 1fr); }
    .ot-tabel { grid-template-columns: 70px auto 1fr 1fr; }
    .ot-tabel .vak2 { display: none; }
    .twee, .drie { grid-template-columns: minmax(0, 1fr); }
  }
`;

const BLOK_INFO = {
  personen: { titel: "Medewerkers", icoon: "people" },
  mededelingen: { titel: "Mededeling van de dag", icoon: "bell" },
  nieuws: { titel: "Nieuws van het pand", icoon: "calendar" },
  praktijk: { titel: "Praktijk, logo en openingstijden", icoon: "house" },
  instellingen: { titel: "Instellingen", icoon: "cog" },
};

const kloon = (x) => JSON.parse(JSON.stringify(x ?? null));
const at = (s) => escapeHtml(s ?? "");

export class InfoschermBeheerCard extends DacCard {
  static css = css;

  constructor() {
    super();
    this.stand_ = null;
    this.rechten_ = {};
    this.feedFouten_ = {};
    this.werk_ = {};
    this.vuil_ = new Set();
    this.open_ = null;
    this.gebruikers_ = null;
    this.meldingen_ = {};
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.verbinding_ = new Verbindingswacht();
    this.fout_ = null;
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
    return BLOKKEN.filter((b) => this.config[`show_${b}`] !== false);
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
        ${this.blokken_()
          .map(
            (b) => `<section class="blok" data-blok="${b}">
              <button class="bk" type="button">${resolve(BLOK_INFO[b].icoon)}<b>${BLOK_INFO[b].titel}</b><span class="vuil" hidden>niet opgeslagen</span><span class="tel"></span>${resolve("chevronDown")}</button>
              <div class="inhoud"></div>
            </section>`
          )
          .join("")}
        <input class="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml">
      </div>`;
  }

  wire() {
    const card = this.$(".card");
    this.teardown_.push(volgRaster(card));
    this.teardown_.push(() => this.herkansing_.stop());

    this.on(card, "click", (e) => this.klik_(e));
    this.on(card, "input", (e) => this.invoer_(e));
    this.on(card, "change", (e) => this.invoer_(e));
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
      this.nieuweStand_(r.stand);
      if (r.is_admin && this.gebruikers_ === null) {
        haalGebruikers(this.hass)
          .then((g) => {
            this.gebruikers_ = g.gebruikers ?? [];
            this.teken_("instellingen");
          })
          .catch(() => {
            this.gebruikers_ = [];
          });
      }
    } catch (fout) {
      if (nogNietGereed(fout)) {
        this.herkansing_.plan();
        this.status_("Home Assistant start nog op…");
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

  /** Een verse stand van de server: alles wat niet vuil is wordt overgenomen. */
  nieuweStand_(stand) {
    this.stand_ = stand;
    for (const b of BLOKKEN) {
      if (!this.vuil_.has(b)) this.werk_[b] = kloon(stand[b]);
    }
    this.paint();
  }

  /* ------------------------------------------------------------ paint */

  paint() {
    if (!this.$(".card")) return;
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
    const magTonen = geen.hidden && this.stand_;
    for (const sec of this.$$(".blok")) {
      sec.hidden = !magTonen;
      sec.classList.toggle("open", sec.dataset.blok === this.open_);
    }
    if (!magTonen) return;
    for (const b of this.blokken_()) this.teken_(b);
    this.status_(this.hass?.connected === false ? "Geen verbinding" : "");
  }

  status_(tekst, fout = false) {
    const el = this.$(".status");
    if (!el) return;
    el.textContent = tekst;
    el.classList.toggle("fout", fout);
  }

  /** Teken één blok opnieuw uit de werkkopie. */
  teken_(blok) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec || !this.stand_) return;
    const w = this.werk_[blok];
    const html = {
      personen: () => this.htmlPersonen_(w),
      mededelingen: () => this.htmlMededelingen_(w),
      nieuws: () => this.htmlNieuws_(w),
      praktijk: () => this.htmlPraktijk_(w),
      instellingen: () => this.htmlInstellingen_(w),
    }[blok]();
    const inhoud = sec.querySelector(".inhoud");
    inhoud.innerHTML = html + this.htmlVoet_(blok);
    this.plaatjes_(inhoud);
    this.tel_(blok);
  }

  tel_(blok) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec) return;
    const w = this.werk_[blok];
    const tel = {
      personen: () => `${(w ?? []).filter((p) => p.aanwezig).length} van ${(w ?? []).length} aanwezig`,
      mededelingen: () => `${(w ?? []).length}`,
      nieuws: () => `${(w ?? []).length}`,
      praktijk: () => w?.naam ?? "",
      instellingen: () => `${(w?.feeds ?? []).length} bron(nen)`,
    }[blok]();
    sec.querySelector(".tel").textContent = tel;
    sec.querySelector(".vuil").hidden = !this.vuil_.has(blok);
  }

  htmlVoet_(blok) {
    const m = this.meldingen_[blok];
    return `<div class="voet">
      <span class="melding ${m?.fout ? "fout" : ""}">${at(m?.tekst)}</span>
      <button class="knop" type="button" data-actie="herstel" ${this.vuil_.has(blok) ? "" : "disabled"}>Ongedaan maken</button>
      <button class="knop acc ${this.vuil_.has(blok) ? "vuil" : ""}" type="button" data-actie="opslaan">${resolve("check")} Opslaan</button>
    </div>`;
  }

  veld_(label, naam, waarde, { type = "text", i, extra = "" } = {}) {
    return `<div class="veld"><label>${at(label)}</label><input type="${type}" data-veld="${naam}" ${i !== undefined ? `data-i="${i}"` : ""} value="${at(waarde)}" ${extra}></div>`;
  }

  schakel_(naam, aan, { i, label } = {}) {
    return `<label class="vink"><span class="schakel"><input type="checkbox" data-veld="${naam}" ${i !== undefined ? `data-i="${i}"` : ""} ${aan ? "checked" : ""}><span></span></span>${label ? `<span>${at(label)}</span>` : ""}</label>`;
  }

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
    return `<div class="hulp">Tik op de cirkel om een foto te kiezen. Zonder foto staan de initialen op het scherm. De volgorde hier is de volgorde op het scherm.</div>
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
    return `<div class="hulp">Eén regel op de welkompagina, bijvoorbeeld "Vrijdag 20 september zijn wij vanaf 12:00 gesloten". Zonder datums staat hij er altijd; met meerdere wisselen ze elkaar af.</div>
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
      <div class="rij twee">
        <div class="veld"><label>Logo</label>
          <div class="b-onder">
            <div class="plaatje logo" data-bestand="${at(p.logo)}">${p.logo ? "" : resolve("camera")}</div>
            <button class="knop klein" type="button" data-actie="logo">${resolve("camera")} ${p.logo ? "Ander logo" : "Logo kiezen"}</button>
            ${p.logo ? `<button class="knop klein" type="button" data-actie="logoweg">${resolve("close")} Logo weg</button>` : ""}
          </div>
        </div>
        <div class="veld"><label>Accentkleur op het scherm</label>
          <div class="b-onder">
            <input type="color" data-veld="accent_kleur" value="${at(p.accent || "#026fa1")}">
            <input type="text" data-veld="accent" value="${at(p.accent)}" placeholder="leeg = standaard" style="max-width: 140px">
          </div>
        </div>
      </div>
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

  htmlInstellingen_(s = {}) {
    const feeds = (s.feeds ?? [])
      .map(
        (f, i) => `<div class="item feed" data-i="${i}">
          ${this.veld_("Naam", "f_naam", f.naam, { i })}
          ${this.veld_("Adres van de RSS-feed", "f_url", f.url, { i, type: "url" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="f_verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
          ${this.feedFouten_[f.url] ? `<div class="feedfout" style="grid-column: 1 / -1">Niet opgehaald: ${at(this.feedFouten_[f.url])}</div>` : ""}
        </div>`
      )
      .join("");
    let kiosk = "";
    if (this.rechten_.is_admin) {
      const lijst = this.gebruikers_ ?? [];
      const gekozen = new Set(s.kiosk_gebruikers ?? []);
      kiosk = `<div class="veld"><label>Kioskaccounts (alleen voor beheerders)</label>
        <div class="hulp">Het account waarmee de iPad is ingelogd. Zo'n account mag alleen aanwezigheid omzetten en lampen schakelen, en niets beheren.</div>
        <div class="gebruikers">${
          lijst.length
            ? lijst.map((g) => `<label class="vink"><input type="checkbox" data-veld="kiosk" data-i="${at(g.id)}" ${gekozen.has(g.id) ? "checked" : ""}> ${at(g.naam)}${g.is_admin ? " (beheerder)" : ""}</label>`).join("")
            : `<div class="leeg">Gebruikers laden…</div>`
        }</div></div>`;
    }
    return `
      ${this.schakel_("reset_middernacht", s.reset_middernacht !== false, { label: "Om middernacht iedereen op afwezig zetten" })}
      ${this.schakel_("verlichting_tonen", s.verlichting_tonen !== false, { label: "Verlichting op het scherm tonen (voor schermen die 'Volgens het beheer' staan)" })}
      <div class="veld"><label>Nieuws van buiten (RSS)</label>
        <div class="hulp">Bijvoorbeeld het NOS-nieuws: https://feeds.nos.nl/nosnieuwsalgemeen. Wordt elk kwartier opgehaald en staat op het scherm ná het nieuws van het pand.</div>
        <div class="lijst">${feeds || `<div class="leeg">Geen bronnen.</div>`}</div>
        <div class="knoppen" style="justify-content: flex-start; margin-top: 8px">
          <button class="knop" type="button" data-actie="f_nieuw">${resolve("plus")} Bron toevoegen</button>
          <button class="knop" type="button" data-actie="f_ververs">Nu ophalen</button>
        </div>
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

  markeer_(blok) {
    this.vuil_.add(blok);
    this.meldingen_[blok] = null;
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    const knop = sec?.querySelector('[data-actie="opslaan"]');
    knop?.classList.add("vuil");
    const herstel = sec?.querySelector('[data-actie="herstel"]');
    if (herstel) herstel.disabled = false;
    const melding = sec?.querySelector(".voet .melding");
    if (melding) melding.textContent = "";
    this.tel_(blok);
  }

  invoer_(e) {
    const el = e.target;
    const veld = el?.dataset?.veld;
    if (!veld) return;
    const blok = el.closest(".blok")?.dataset.blok;
    if (!blok) return;
    const i = el.dataset.i;
    const w = this.werk_[blok];
    const waarde = el.type === "checkbox" ? el.checked : el.value;

    if (blok === "personen" || blok === "mededelingen" || blok === "nieuws") {
      const item = w[Number(i)];
      if (!item) return;
      item[veld] = waarde;
      if (veld === "naam") {
        const av = el.closest(".item")?.querySelector(".avatar");
        if (av && !av.querySelector("img")) av.textContent = initialen(waarde);
      }
      if (veld === "aanwezig") {
        const lbl = el.closest(".vink")?.querySelector("span:last-child");
        if (lbl) lbl.textContent = waarde ? "Aanwezig" : "Afwezig";
        el.closest(".item")?.querySelector(".avatar")?.classList.toggle("aan", waarde);
      }
    } else if (blok === "praktijk") {
      this.invoerPraktijk_(w, veld, i, waarde, el);
    } else if (blok === "instellingen") {
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
    this.markeer_(blok);
  }

  invoerPraktijk_(p, veld, i, waarde, el) {
    if (veld === "welkom") {
      p.welkom = String(waarde).split("\n").map((r) => r.trim()).filter(Boolean);
    } else if (veld === "accent_kleur") {
      p.accent = waarde;
      const t = el.closest(".b-onder")?.querySelector('[data-veld="accent"]');
      if (t) t.value = waarde;
    } else if (veld === "accent") {
      p.accent = waarde.trim() || null;
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

  /* ------------------------------------------------------------ klikken */

  async klik_(e) {
    const bk = e.target.closest(".bk");
    if (bk) {
      const blok = bk.closest(".blok").dataset.blok;
      this.open_ = this.open_ === blok ? null : blok;
      for (const sec of this.$$(".blok")) sec.classList.toggle("open", sec.dataset.blok === this.open_);
      return;
    }
    const knop = e.target.closest("[data-actie]");
    if (!knop || knop.disabled) return;
    const blok = knop.closest(".blok")?.dataset.blok;
    const actie = knop.dataset.actie;
    const i = Number(knop.dataset.i);
    const w = this.werk_[blok];

    if (actie === "opslaan") return this.opslaan_(blok);
    if (actie === "herstel") {
      this.vuil_.delete(blok);
      this.werk_[blok] = kloon(this.stand_[blok]);
      this.meldingen_[blok] = null;
      return this.teken_(blok);
    }

    if (actie === "nieuw") {
      const leeg = { personen: { naam: "", functie: "", aanwezig: false }, mededelingen: { tekst: "" }, nieuws: { titel: "", tekst: "" } }[blok];
      w.push(leeg);
      this.markeer_(blok);
      this.teken_(blok);
      this.$(`.blok[data-blok="${blok}"] .item:last-of-type input[type="text"]`)?.focus();
      return;
    }
    if (actie === "verwijder") {
      const item = w[i];
      const naam = item?.naam || item?.titel || item?.tekst || "dit item";
      if (item && (item.id || item.naam || item.titel || item.tekst)) {
        const ja = await vraagBevestiging({ title: "Verwijderen?", text: `"${naam}" verdwijnt van het scherm zodra u opslaat.`, confirmText: "Verwijderen" });
        if (!ja) return;
      }
      w.splice(i, 1);
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "omhoog" || actie === "omlaag") {
      const j = actie === "omhoog" ? i - 1 : i + 1;
      if (j < 0 || j >= w.length) return;
      [w[i], w[j]] = [w[j], w[i]];
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "foto" || actie === "logo") {
      this.doel_ = { blok, i: actie === "logo" ? null : i };
      const file = this.$(".file");
      file.value = "";
      file.click();
      return;
    }
    if (actie === "fotoweg" || actie === "logoweg") {
      if (actie === "logoweg") w.logo = null;
      else if (blok === "personen") w[i].foto = null;
      else w[i].afbeelding = null;
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "u_nieuw") {
      w.uitzonderingen ??= [];
      w.uitzonderingen.push({ datum: "", tijden: [], reden: "" });
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "u_verwijder") {
      w.uitzonderingen.splice(i, 1);
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "f_nieuw") {
      w.feeds ??= [];
      w.feeds.push({ naam: "", url: "" });
      this.markeer_(blok);
      return this.teken_(blok);
    }
    if (actie === "f_verwijder") {
      w.feeds.splice(i, 1);
      this.markeer_(blok);
      return this.teken_(blok);
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
      return this.teken_(blok);
    }
    return undefined;
  }

  async bestandGekozen_(e) {
    const bestand = e.target.files?.[0];
    const doel = this.doel_;
    this.doel_ = null;
    if (!bestand || !doel) return;
    const { blok, i } = doel;
    this.meldingen_[blok] = { tekst: "Bezig met uploaden…" };
    this.teken_(blok);
    try {
      const meta = await upload(this.hass, bestand);
      const w = this.werk_[blok];
      const oud = i === null ? w.logo : blok === "personen" ? w[i].foto : w[i].afbeelding;
      if (i === null) w.logo = meta.id;
      else if (blok === "personen") w[i].foto = meta.id;
      else w[i].afbeelding = meta.id;
      // Het oude bestand hangt nergens meer aan zodra dit is opgeslagen; nu al
      // vergeten in de cache is genoeg, de server ruimt het op bij opslaan.
      if (oud) this.oudeBestanden_ = [...(this.oudeBestanden_ ?? []), oud];
      this.meldingen_[blok] = { tekst: `${meta.naam || "Bestand"} geüpload. Vergeet niet op te slaan.` };
      this.markeer_(blok);
    } catch (fout) {
      this.meldingen_[blok] = { tekst: fout?.message ?? "Uploaden lukte niet.", fout: true };
    }
    this.teken_(blok);
  }

  async opslaan_(blok) {
    const w = this.werk_[blok];
    const knop = this.$(`.blok[data-blok="${blok}"] [data-actie="opslaan"]`);
    if (knop) knop.disabled = true;
    try {
      let waarde = w;
      if (blok === "praktijk") {
        waarde = {
          ...w,
          openingstijden: Object.fromEntries(
            DAGEN.map((d) => [d, (w.openingstijden?.[d] ?? []).filter((v) => v[0] && v[1])])
          ),
          uitzonderingen: (w.uitzonderingen ?? []).filter((u) => u.datum).map((u) => ({ ...u, tijden: (u.tijden ?? []).filter((v) => v[0] && v[1]) })),
        };
      }
      if (blok === "instellingen") waarde = { ...w, feeds: (w.feeds ?? []).filter((f) => f.url?.trim()) };
      if (blok === "personen") waarde = w.filter((p) => p.naam?.trim());
      if (blok === "mededelingen") waarde = w.filter((m) => m.tekst?.trim());
      if (blok === "nieuws") waarde = w.filter((n) => n.titel?.trim());

      const r = await bewaar(this.hass, blok, waarde);
      this.vuil_.delete(blok);
      this.werk_[blok] = kloon(r[blok]);
      if (this.stand_) this.stand_[blok] = kloon(r[blok]);
      this.meldingen_[blok] = { tekst: "Opgeslagen. Het scherm is bijgewerkt." };
      // Bestanden die door een nieuw bestand vervangen zijn mogen weg.
      for (const oud of this.oudeBestanden_ ?? []) {
        if (!this.inGebruik_(oud)) {
          verwijderBestand(this.hass, oud).catch(() => {});
          vergeetBestand(oud);
        }
      }
      this.oudeBestanden_ = [];
    } catch (fout) {
      this.meldingen_[blok] = { tekst: fout?.message ?? "Opslaan lukte niet.", fout: true };
    }
    this.teken_(blok);
  }

  inGebruik_(id) {
    const s = this.stand_ ?? {};
    return (
      s.praktijk?.logo === id ||
      (s.personen ?? []).some((p) => p.foto === id) ||
      (s.nieuws ?? []).some((n) => n.afbeelding === id) ||
      (this.werk_.personen ?? []).some((p) => p.foto === id) ||
      (this.werk_.nieuws ?? []).some((n) => n.afbeelding === id) ||
      this.werk_.praktijk?.logo === id
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
  show_instellingen: "Blok Instellingen",
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
          { value: "personen", label: "Medewerkers" },
          { value: "mededelingen", label: "Mededeling" },
          { value: "nieuws", label: "Nieuws" },
          { value: "praktijk", label: "Praktijk" },
          { value: "instellingen", label: "Instellingen" },
          { value: "", label: "Alles dicht" },
        ]),
      },
      { name: "show_personen", selector: sel.bool() },
      { name: "show_mededelingen", selector: sel.bool() },
      { name: "show_nieuws", selector: sel.bool() },
      { name: "show_praktijk", selector: sel.bool() },
      { name: "show_instellingen", selector: sel.bool() },
    ];
  }

  label(item) {
    return LABELS[item.name] ?? super.label(item);
  }

  helper(item) {
    if (item.name === "show_instellingen") {
      return "Kioskaccounts, nieuwsbronnen en de middernachtregel. Zet dit blok uit op een dashboard voor een receptie die daar niet aan hoeft te zitten.";
    }
    return undefined;
  }
}

registerCard(TAG, InfoschermBeheerCard, {
  name: "DomotiApp Infoscherm Beheer",
  description:
    "Voor de receptie: medewerkers, mededeling van de dag, nieuws, logo en openingstijden van het infoscherm. Werkt met een gewoon account.",
  preview: false,
});
registerEditor(`${TAG}-editor`, InfoschermBeheerEditor);
InfoschermBeheerCard.getConfigElement = () => document.createElement(`${TAG}-editor`);
InfoschermBeheerCard.getStubConfig = () => ({ title: "Infoscherm" });
