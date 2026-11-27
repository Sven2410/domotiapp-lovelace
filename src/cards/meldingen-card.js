/**
 * DomotiApp Meldingen: de personen van het huis, en per persoon een potlood.
 *
 * ## Hoe hij zo geworden is
 *
 * In 0.48.0 (26 september 2026) was dit een afvalkaart: een kop "Afvalmeldingen"
 * met wat er opgehaald werd, en per persoon een schakelaar. Dezelfde avond
 * vroeg de eigenaar het algemener: *"Ik wil een algemeen meldingen scherm zoals
 * je nu hebt bij afvalmeldingen. Maar als je op het potlootje klikt daar staat
 * nu een schakelaar dus dat moet veranderen in potlootje, Dat hij dan een pop
 * up opent van die persoon en dat je dan vinkjes kan aan en uit zetten. (...)
 * Afvalmeldingen met het icon moet dan bovenaan ook weg. Dus puur een kaart met
 * de personen en het potlootje."*
 *
 * Dus sinds 0.50.0:
 *
 * - de kaart toont ALLEEN de personen, met per persoon een potlood;
 * - het potlood (of de hele rij) opent `meldingen-scherm.js`: die persoon, met
 *   per soort melding een vinkje;
 * - welke soorten er zijn, staat in de editor: per soort een schakelaar met de
 *   instellingen eronder. Afval, sinds 0.85.0 de robotstofzuiger, en sinds
 *   0.109.0 de camera: de meldingen van de camerakaart, met per persoon een
 *   keuze van welke camera en waarover (zie meldingen/camera.py). Sinds 0.139.0
 *   de garagedeur: een melding als hij openstaat, met Sluiten en negeren erin
 *   (zie meldingen/garage.py). In de pop-up staat dan ook of hij open is, en
 *   negeren kan daar zonder op een melding te wachten. Sinds 0.141.0 de auto: een
 *   melding bij elk nieuw bericht van de fabrikant (zie meldingen/auto.py).
 *
 * ## Wat de kaart doet en wat niet
 *
 * De kaart VERSTUURT niets. Dat doet de integratie (`meldingen/` aan de
 * serverkant), die de instellingen van deze kaart zelf uit de opgeslagen
 * dashboards leest. De kaart laat zien wie er iets krijgt en zet dat om.
 *
 * ## Waarom een persoon en geen telefoon
 *
 * Zelfde afspraak als bij de camera: `notify.mobile_app_iphone_van_bram` is
 * geen naam die iemand onthoudt, en hij verandert zodra de telefoon anders gaat
 * heten. De serverkant zoekt de telefoon bij de persoon. Vindt hij er geen, dan
 * staat dat op de rij -- anders krijgt iemand stil niets en ziet niemand waarom.
 *
 * ## Oude kaarten
 *
 * Een config van vóór 0.50.0 heeft `soort: afval` en geen `afval: true`. Die
 * blijft gewoon afval versturen: zie `soortAan` in meldingen-logica.js, en
 * `soort_aan` in kaarten.py aan de serverkant.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, section, sel } from "../editor/base.js";
import { naamVan } from "./stofzuiger-logica.js";
import { autoNaamVan, berichtSensoren } from "./auto-berichten.js";
import { resolve } from "../icons.js";
import { nameOf, pictureOf, stateOf } from "../ha.js";
import { Herkansing, Verbindingswacht, nogNietGereed } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { naarWand } from "../wandklok.js";
import { isAgenda } from "./afval-agenda.js";
import { AfvalAgendaBron } from "../afval-agenda-bron.js";
import {
  AFVAL_MOMENTEN,
  autoRegel,
  autosUit,
  afvalBakken,
  afvalKeuze,
  afvalMomenten,
  afvalRegel,
  cameraKeuze,
  cameraRegel,
  cameraSoortNaam,
  garageKnoppen,
  garageRegel,
  negeerNaam,
  nieuweCameraKeuze,
  nieuwNiet,
  krijgtIets,
  meldingId,
  personenUit,
  proefUitkomst,
  soortAan,
  soortenVan,
  staatAan,
  STOFZUIGER_GEBEURTENISSEN,
  nieuweKeuze,
  persoonKeuze,
  stofzuigerGebeurtenissen,
  stofzuigerRegel,
  stofzuigersUit,
} from "./meldingen-logica.js";
import { meldingenScherm, toonMeldingenScherm } from "./meldingen-scherm.js";
import { nt, t } from "../taal.js";

class MeldingenCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    /* 7px en niet 8: een rij is 40, de rand van .surface 2, en dan past één
       persoon precies op één rasterrij van 56. Met 8 werd dat 58, en
       rasterhoogte.js rondt dat af naar 120 -- een kaart met één persoon was dan
       twee rijen hoog. In 0.48.0 viel dat niet op, want toen stond er altijd een
       kop boven. Zelfde maat als de mediakaart. */
    .card {
      min-height: var(--dac-raster, 56px);
      padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .rij {
      display: flex; align-items: center; gap: 11px; min-height: 40px;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .chip { width: 40px; height: 40px; flex: 0 0 auto; }
    .chip .icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .pn {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ps {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-warn);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    [hidden] { display: none !important; }

    /* Alleen het icoon draagt de toestand: een foto dimt als deze persoon niets
       krijgt, een icoon kleurt mee met het accent. */
    .rij[data-aan="false"] .chip.pic img { opacity: .45; filter: grayscale(1); }
    .rij[data-aan="false"] .pn { color: var(--dac-ink-2); }

    /* Het potlood. Rond en stil: hij is een ingang, geen toestand. */
    .potlood {
      width: 34px; height: 34px; flex: 0 0 auto; padding: 0; cursor: pointer;
      display: grid; place-items: center; border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2); font: inherit;
      transition: background 160ms ease, color 160ms ease;
    }
    @media (hover: hover) {
      .potlood:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
    }
    .potlood .icon { width: 16px; height: 16px; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    /** Per soort de stand die de server stuurde. */
    this.standen_ = {};
  }

  validate(config) {
    const c = { ...config };
    c.personen = personenUit(c);
    if (!c.personen.length) c[INCOMPLETE] = t("Kies minstens één persoon.");
    return c;
  }

  /** De soorten op deze kaart, als `{id, naam, icoon}`. */
  soorten_() {
    return soortenVan(this.config);
  }

  watched() {
    const c = this.config;
    return [
      ...(soortAan(c, "afval") ? [c.afval_vandaag, c.afval_morgen] : []),
      ...(soortAan(c, "stofzuiger") ? stofzuigersUit(c) : []),
      ...(soortAan(c, "garage") ? [c.garage_contact] : []),
      ...(soortAan(c, "auto") ? autosUit(c) : []),
      ...c.personen,
    ].filter(Boolean);
  }

  template() {
    const c = this.config;
    this.toggleAttribute("bare", Boolean(c.bare));
    const rijen = c.personen
      .map(
        (p) => `
        <div class="rij" data-p="${escapeHtml(p)}" data-aan="true">
          <span class="chip"></span>
          <span class="txt"><span class="pn"></span><span class="ps" hidden></span></span>
          <button class="potlood" type="button">${resolve("pencil")}</button>
        </div>`
      )
      .join("");
    return `<div class="card surface" style="--tone:${TONES.accent}">${rijen}</div>`;
  }

  wire() {
    for (const rij of this.$$(".rij")) {
      // De hele rij opent de pop-up, niet alleen het potlood: een knop van 34
      // pixels is op een telefoon een klein doel, en er is op deze rij niets
      // anders te doen. Het potlood zegt dát er iets achter zit.
      this.on(rij, "click", () => toonMeldingenScherm(this, rij.dataset.p));
    }

    this.herkansing_ = new Herkansing(() => this.luister_());
    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(volgRaster(this.$(".card")));
    this.luistert_ = false;
    this.geabonneerd_ = new Set();
    this.teardown_.push(() => {
      this.luistert_ = false;
      this.geabonneerd_ = new Set();
      this.standen_ = {};
      // Staat de pop-up open voor deze kaart en wordt die net opnieuw
      // opgebouwd (een wijziging in de editor), dan klopt wat erin staat niet
      // meer.
      const scherm = meldingenScherm();
      if (scherm?.isVan(this)) scherm.sluit();
    });
    this.luister_();

    // Een agenda als afvalbron (0.136.0): wat er vandaag en morgen komt, uit de afspraken.
    this.agendaBron_ = new AfvalAgendaBron(() => {
      if (this.hass) this.paint();
    });
    this.agendaBron_.volg(this.hass, this.afvalBronnen_());
    this.teardown_.push(() => this.agendaBron_.stop());
  }

  afvalBronnen_() {
    const c = this.config;
    return soortAan(c, "afval") ? [c.afval_vandaag, c.afval_morgen] : [];
  }

  /** Wat er `plus` dagen na vandaag opgehaald wordt, als toestand van een sensor. Bij een agenda uit de afspraken. */
  afvalToestand_(id, plus) {
    if (!isAgenda(id)) return stateOf(this.hass, id)?.state;
    const nu = naarWand(new Date(), this.hass?.config?.time_zone);
    return this.agendaBron_?.soortenOp(id, new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + plus)) ?? "";
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    // Een kaart die gebouwd werd voordat er een `hass` was, begint hier alsnog
    // te luisteren; na een herverbinding opnieuw.
    if (this.built_ && this.config && !this.config[INCOMPLETE] && (terug || !this.luistert_)) {
      this.luistert_ = false;
      this.luister_();
    }
    if (this.built_) this.agendaBron_?.volg(hass, this.afvalBronnen_(), terug);
  }

  get hass() {
    return super.hass;
  }

  /**
   * Abonneer op de stand van elke soort op deze kaart.
   *
   * Zegt niet op als het element nog niet in het document hangt: Home
   * Assistant zet `hass` voordat de kaart in de view hangt (valkuil 42). Een
   * `dood`-vlag uit de teardown beslist.
   */
  async luister_() {
    if (this.luistert_ || !this.hass?.connection?.subscribeMessage) return;
    this.luistert_ = true;
    let dood = false;
    this.teardown_.push(() => {
      dood = true;
    });
    try {
      for (const soort of this.soorten_()) {
        // Een herkansing na een halve mislukking abonneert niet dubbel op wat
        // al liep: twee abonnementen geven elke wijziging twee keer (valkuil 7).
        if (this.geabonneerd_.has(soort.id)) continue;
        const opzeggen = await this.hass.connection.subscribeMessage(
          (stand) => {
            this.standen_ = { ...this.standen_, [soort.id]: stand };
            this.paint();
          },
          { type: "domotiapp_lovelace/meldingen/subscribe", melding: meldingId(this.config, soort.id) }
        );
        if (dood) {
          opzeggen();
          return;
        }
        this.geabonneerd_.add(soort.id);
        this.teardown_.push(() => {
          try {
            opzeggen();
          } catch {
            // De verbinding is al weg.
          }
        });
      }
      this.herkansing_.herstel();
    } catch (fout) {
      this.luistert_ = false;
      // Net na een herstart kent Home Assistant het commando nog niet (valkuil 28).
      if (nogNietGereed(fout)) this.herkansing_.plan();
      else console.warn("DomotiApp Meldingen: geen stand", fout);
    }
  }

  /**
   * Zet één soort voor één persoon aan of uit. De pop-up roept dit aan.
   *
   * Meteen laten zien; de server bevestigt het via het abonnement, en bij een
   * fout springt het terug.
   */
  zet(soort, persoon, aan) {
    const vorig = this.standen_[soort];
    if (!vorig || !this.hass?.connection) return;
    this.standen_ = { ...this.standen_, [soort]: { ...vorig, aan: { ...(vorig.aan ?? {}), [persoon]: aan } } };
    this.paint();
    this.hass.connection
      .sendMessagePromise({
        type: "domotiapp_lovelace/meldingen/aan",
        melding: meldingId(this.config, soort),
        persoon,
        aan,
      })
      .catch((fout) => {
        console.warn("DomotiApp Meldingen: omzetten mislukte", fout);
        this.standen_ = { ...this.standen_, [soort]: vorig };
        this.paint();
      });
  }

  /**
   * Eén keuze binnen een soort, voor één persoon: een soort melding of een
   * robot aan of uit (sinds 0.86.0). De pop-up roept dit aan; net als `zet`
   * meteen bewaard, zonder Opslaan.
   *
   * @param {string} soort  "stofzuiger", "afval" of "camera"
   * @param {string} persoon
   * @param {"gebeurtenissen"|"robots"|"momenten"|"bakken_niet"|"cameras"|"soorten"} groep
   * @param {string} waarde
   * @param {boolean} aan
   */
  kies(soort, persoon, groep, waarde, aan) {
    const vorig = this.standen_[soort];
    if (!vorig || !this.hass?.connection) return;
    const c = this.config;
    let waarden;
    if (soort === "camera") {
      waarden = nieuweCameraKeuze(vorig, persoon, groep, waarde, aan);
    } else if (groep === "bakken_niet") {
      waarden = nieuwNiet(afvalKeuze(c, vorig, persoon).bakkenNiet, waarde, aan);
    } else if (groep === "momenten") {
      waarden = nieuweKeuze(afvalMomenten(c), afvalKeuze(c, vorig, persoon).momenten, waarde, aan);
    } else {
      const alle = groep === "robots" ? stofzuigersUit(c) : stofzuigerGebeurtenissen(c);
      waarden = nieuweKeuze(alle, persoonKeuze(c, vorig, persoon)[groep], waarde, aan);
    }
    const eigen = { ...(vorig.keuzes?.[persoon] ?? {}) };
    if (waarden === null) delete eigen[groep];
    else eigen[groep] = waarden;
    this.standen_ = { ...this.standen_, [soort]: { ...vorig, keuzes: { ...(vorig.keuzes ?? {}), [persoon]: eigen } } };
    this.paint();
    this.hass.connection
      .sendMessagePromise({
        type: "domotiapp_lovelace/meldingen/keuze",
        melding: meldingId(c, soort),
        persoon,
        soort: groep,
        waarden,
      })
      .catch((fout) => {
        console.warn("DomotiApp Meldingen: kiezen mislukte", fout);
        this.standen_ = { ...this.standen_, [soort]: vorig };
        this.paint();
      });
  }

  /**
   * De keuzes onder de robotstofzuiger in de pop-up: waarover, en (bij meer dan
   * één robot) van welke. Een groep met één keuze staat er niet: die zegt
   * hetzelfde als het vinkje erboven.
   */
  keuzes_(soort, stand, persoon) {
    const c = this.config;
    if (soort === "garage" || soort === "auto") return [];
    if (soort === "afval") return this.afvalKeuzes_(stand, persoon);
    if (soort === "camera") return this.cameraKeuzes_(stand, persoon);
    const nu = persoonKeuze(c, stand, persoon);
    const groepen = [];
    const aangeboden = stofzuigerGebeurtenissen(c);
    if (aangeboden.length > 1) {
      groepen.push({
        groep: "gebeurtenissen",
        kop: t("Waarover"),
        opties: STOFZUIGER_GEBEURTENISSEN.filter((g) => aangeboden.includes(g.id)).map((g) => ({
          id: g.id,
          naam: t(g.naam),
          aan: nu.gebeurtenissen.includes(g.id),
        })),
      });
    }
    const robots = stofzuigersUit(c);
    if (robots.length > 1) {
      groepen.push({
        groep: "robots",
        kop: t("Van welke robot"),
        opties: robots.map((id) => ({ id, naam: naamVan(this.hass, id), aan: nu.robots.includes(id) })),
      });
    }
    return groepen;
  }

  /**
   * De keuzes onder afval (0.87.0): wanneer, en welke bakken. De bakken kent de
   * kaart uit de editor en uit wat de server de sensor zag noemen; zolang dat
   * er minder dan twee zijn, staat de groep er niet.
   */
  afvalKeuzes_(stand, persoon) {
    const c = this.config;
    const nu = afvalKeuze(c, stand, persoon);
    const groepen = [];
    const momenten = afvalMomenten(c);
    if (momenten.length > 1) {
      groepen.push({
        groep: "momenten",
        kop: t("Wanneer"),
        opties: AFVAL_MOMENTEN.filter((m) => momenten.includes(m.id)).map((m) => ({
          id: m.id,
          naam: t(m.naam),
          aan: nu.momenten.includes(m.id),
        })),
      });
    }
    const bakken = afvalBakken(c, stand);
    if (bakken.length > 1) {
      const niet = new Set(nu.bakkenNiet.map((b) => b.toLowerCase()));
      groepen.push({
        groep: "bakken_niet",
        kop: t("Welke bakken"),
        opties: bakken.map((b) => ({ id: b, naam: b, aan: !niet.has(b.toLowerCase()) })),
      });
    }
    return groepen;
  }

  /**
   * De keuzes onder de camera (0.109.0): van welke camera's, en waarover. Wat er
   * te kiezen is komt van de server, uit de camerakaarten met snapshots en
   * meldingen; een groep met één keuze staat er niet.
   */
  cameraKeuzes_(stand, persoon) {
    const nu = cameraKeuze(stand, persoon);
    const groepen = [];
    const cameras = stand?.cameras ?? [];
    if (cameras.length > 1) {
      groepen.push({
        groep: "cameras",
        kop: t("Van welke camera"),
        opties: cameras.map((id) => ({ id, naam: nameOf(this.hass, id), aan: nu.cameras.includes(id) })),
      });
    }
    const soorten = stand?.soorten ?? [];
    if (soorten.length > 1) {
      groepen.push({
        groep: "soorten",
        kop: t("Waarover"),
        opties: soorten.map((id) => ({ id, naam: cameraSoortNaam(id), aan: nu.soorten.includes(id) })),
      });
    }
    return groepen;
  }

  /** Heeft deze persoon GEEN telefoon, volgens de server? Null = onbekend. */
  zonderTelefoon_(persoon) {
    const stand = Object.values(this.standen_).find((s) => s?.telefoons);
    if (!stand) return null;
    return !stand.telefoons[persoon];
  }

  /** Wat de pop-up voor deze persoon laat zien. Zie meldingen-scherm.js. */
  inhoud(persoon) {
    const naam = nameOf(this.hass, persoon);
    return {
      naam,
      foto: pictureOf(this.hass, persoon),
      storing: this.zonderTelefoon_(persoon)
        ? t("Geen telefoon gevonden. Zonder de app van Home Assistant krijgt {naam} niets, ook niet met een vinkje.", {
            naam: voornaam(naam),
          })
        : null,
      // Alleen voor een beheerder (de server weigert het anders), en pas als de
      // server de kaart kent: een kaart die nog niet is opgeslagen heeft niets
      // om te versturen.
      proef: Boolean(this.hass?.user?.is_admin) && this.soorten_().some((s) => this.standen_[s.id]?.bekend),
      soorten: this.soorten_().map((soort) => {
        const stand = this.standen_[soort.id];
        return {
          ...soort,
          aan: staatAan(stand, persoon),
          laden: !stand,
          regel:
            soort.id === "afval"
              ? this.afvalRegel_(stand, persoon)
              : soort.id === "camera"
                ? cameraRegel({ stand, persoon, naam: (id) => nameOf(this.hass, id) })
                : soort.id === "garage"
                  ? garageRegel({ stand, tijd: (iso) => this.klok_(iso), naam: (id) => voornaam(nameOf(this.hass, id)) })
                  : soort.id === "auto"
                    ? autoRegel({ config: this.config, stand, namen: autosUit(this.config).map((id) => autoNaamVan(this.hass, id)) })
                    : this.stofzuigerRegel_(stand, persoon),
          keuzes: stand?.bekend ? this.keuzes_(soort.id, stand, persoon) : [],
          knoppen: soort.id === "garage" ? garageKnoppen(stand) : [],
        };
      }),
    };
  }

  /**
   * Een proefmelding naar deze ene persoon, per soort die de server kent. De
   * pop-up roept dit aan.
   *
   * Afval over het moment van de avond als die er is: dat is de melding die het
   * vaakst komt, en die met de knop "Staat buiten". De robotstofzuiger stuurt
   * "klaar" van de eerste robot, de camera het laatste beeld.
   */
  async proef(persoon) {
    const naam = voornaam(nameOf(this.hass, persoon));
    const uit = [];
    for (const soort of this.soorten_().filter((s) => this.standen_[s.id]?.bekend)) {
      try {
        const uitkomst = await this.hass.connection.sendMessagePromise({
          type: "domotiapp_lovelace/meldingen/proef",
          melding: meldingId(this.config, soort.id),
          ...(soort.id === "afval" ? { moment: this.config.afval_morgen ? "morgen" : "vandaag" } : {}),
          persoon,
        });
        uit.push(proefUitkomst(uitkomst, naam));
      } catch (fout) {
        uit.push({ tekst: t("Proef mislukt: {fout}", { fout: fout?.message ?? fout }), fout: true });
      }
    }
    if (!uit.length) return { tekst: t("Niet verstuurd."), fout: true };
    return { tekst: uit.map((u) => u.tekst).join(" "), fout: uit.every((u) => u.fout) };
  }

  /** "14:05" op de klok van Home Assistant, niet die van het toestel. */
  klok_(iso) {
    const w = naarWand(new Date(iso), this.hass?.config?.time_zone);
    if (Number.isNaN(w.getTime())) return "";
    return `${String(w.getHours()).padStart(2, "0")}:${String(w.getMinutes()).padStart(2, "0")}`;
  }

  /**
   * Een knop onder een soort in de pop-up (0.139.0): de garagemelding negeren of weer laten komen.
   * Voor het hele huis, net als de knoppen in de melding zelf; de server zegt via het abonnement
   * hoe het nu staat.
   */
  knop(soort, id) {
    if (soort !== "garage" || !this.hass?.connection) return;
    const [actie, minuten] = String(id).split(":");
    this.hass.connection
      .sendMessagePromise({
        type: "domotiapp_lovelace/meldingen/garage",
        melding: meldingId(this.config, soort),
        actie,
        ...(minuten ? { minuten: Number(minuten) } : {}),
      })
      .catch((fout) => console.warn("DomotiApp Meldingen: negeren mislukte", fout));
  }

  stofzuigerRegel_(stand, persoon) {
    const c = this.config;
    const robots = persoonKeuze(c, stand, persoon).robots;
    return stofzuigerRegel({ config: c, stand, persoon, namen: robots.map((id) => naamVan(this.hass, id)) });
  }

  afvalRegel_(stand, persoon) {
    const c = this.config;
    const door = stand?.buiten?.door;
    return afvalRegel({
      config: c,
      stand,
      persoon,
      vandaag: this.afvalToestand_(c.afval_vandaag, 0),
      morgen: this.afvalToestand_(c.afval_morgen, 1),
      door: door ? voornaam(nameOf(this.hass, door)) : "",
    });
  }

  paint() {
    const soorten = this.soorten_().map((s) => s.id);

    for (const rij of this.$$(".rij")) {
      const p = rij.dataset.p;
      const aan = krijgtIets(this.standen_, soorten, p);
      rij.dataset.aan = String(aan);

      const chip = rij.querySelector(".chip");
      const pic = pictureOf(this.hass, p);
      const wens = pic ? `pic:${pic}` : "person";
      if (chip.dataset.icon !== wens) {
        chip.dataset.icon = wens;
        chip.classList.toggle("pic", Boolean(pic));
        chip.innerHTML = pic ? `<img src="${escapeHtml(pic)}" alt="" loading="lazy" />` : resolve("person");
      }
      chip.style.setProperty("--tone", aan ? TONES.accent : "var(--dac-ink-3)");

      const naam = nameOf(this.hass, p);
      this.text(rij.querySelector(".pn"), naam);

      // Alleen iets zeggen als er iets mis is: een persoon zonder telefoon.
      // Dat is een storing en geen status, dus hij blijft altijd staan.
      const ps = rij.querySelector(".ps");
      const zonder = this.zonderTelefoon_(p) === true;
      ps.hidden = !zonder;
      this.text(ps, zonder ? t("Geen telefoon gevonden") : "");

      rij.querySelector(".potlood").setAttribute("aria-label", t("Meldingen van {naam} instellen", { naam }));
    }

    // Staat de pop-up open voor deze kaart, dan hoort die mee te bewegen: een
    // vinkje dat op een andere telefoon wordt omgezet, en "staat buiten".
    const scherm = meldingenScherm();
    if (scherm?.isVan(this)) scherm.teken();

    meetRaster(this.$(".card"));
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return this.config?.personen?.length || 1;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", this.config?.personen?.length || 1),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-meldingen-card-editor");
  }

  static getStubConfig(hass, entities) {
    const zoek = (patroon) => entities?.find((e) => e.startsWith("sensor.") && patroon.test(e)) ?? "";
    const morgen = zoek(/afval.*morgen|morgen.*afval|waste.*tomorrow/i);
    const vandaag = zoek(/afval.*vandaag|vandaag.*afval|waste.*today/i);
    return {
      personen: (entities ?? []).filter((e) => e.startsWith("person.")).slice(0, 6),
      // Altijd uitgeschreven: een kaart zonder `afval` is voor de server een
      // kaart van vóór 0.50.0, en die was afval.
      afval: Boolean(morgen || vandaag),
      ...(morgen ? { afval_morgen: morgen } : {}),
      ...(vandaag ? { afval_vandaag: vandaag } : {}),
    };
  }
}

/** "Bram Visser" -> "Bram": in een regel van één zin is de voornaam genoeg. */
const voornaam = (naam) => String(naam ?? "").trim().split(/\s+/)[0] ?? "";

class MeldingenEditor extends DacEditor {
  defaults() {
    return { tijd_morgen: "19:30:00", tijd_vandaag: "07:30:00" };
  }

  /**
   * Een kaart van vóór 0.50.0 heeft `soort: afval` en geen `afval`-schakelaar.
   *
   * Voor de WEERGAVE wordt dat een schakelaar die aan staat, anders zou een
   * werkende afvalkaart in de editor een schakelaar tonen die uit staat. De
   * config zelf verandert pas als er iets gewijzigd wordt; dan komt `afval`
   * erin en gaat `soort` eruit, want die zegt dan niets meer.
   */
  setConfig(config) {
    const c = { ...config };
    if (typeof c.afval !== "boolean") c.afval = soortAan(config, "afval");
    delete c.soort;
    // Zonder keuze meldt de robot alles (`stofzuigerGebeurtenissen`); dan
    // horen de vinkjes ook allemaal aan te staan.
    if (c.stofzuiger && !Array.isArray(c.stofzuiger_meldingen)) {
      c.stofzuiger_meldingen = STOFZUIGER_GEBEURTENISSEN.map((g) => g.id);
    }
    // De standaard van meldingen/garage.py, zodat de editor laat zien wat de server doet.
    if (c.garage) {
      c.garage_minuten ??= 5;
      c.garage_herhaal ??= 60;
      c.garage_negeer ??= ["15", "60", "240"];
      c.garage_avond_aan ??= true;
      c.garage_avond ??= "22:00:00";
      c.garage_morgen ??= "07:00:00";
    }
    super.setConfig(c);
  }

  schema() {
    const afval = Boolean(this.config_?.afval);
    const robot = Boolean(this.config_?.stofzuiger);
    return [
      { name: "personen", selector: { entity: { domain: "person", multiple: true } } },
      // Per soort een schakelaar, en daaronder het blok met zijn instellingen
      // -- de vorm die hij op 28 augustus 2026 voor de presets van de camera
      // vroeg (zie de vormregels in CLAUDE.md). Een volgende soort is een
      // volgend paar.
      { name: "afval", selector: sel.bool() },
      ...(afval
        ? [
            // Niet nog eens "Afvalmeldingen": dat staat al op de schakelaar er
            // vlak boven, en twee keer hetzelfde woord onder elkaar leest als
            // een dubbele regel. Gezien in de editor op 29 september 2026.
            section(
              t("Sensoren en tijden"),
              "mdi:trash-can-outline",
              [
                { name: "afval_morgen", selector: sel.entity(["sensor", "calendar"]) },
                { name: "tijd_morgen", selector: { time: {} } },
                { name: "afval_vandaag", selector: sel.entity(["sensor", "calendar"]) },
                { name: "tijd_vandaag", selector: { time: {} } },
                {
                  name: "afval_bakken",
                  selector: {
                    select: {
                      multiple: true,
                      custom_value: true,
                      mode: "dropdown",
                      options: ["GFT", "PMD", "Papier", "Restafval", "Glas", "Textiel", "KCA", "Plastic"],
                    },
                  },
                },
              ],
              true
            ),
          ]
        : []),
      { name: "stofzuiger", selector: sel.bool() },
      ...(robot
        ? [
            section(
              t("Robots en meldingen"),
              "mdi:robot-vacuum",
              [
                { name: "stofzuigers", selector: { entity: { domain: "vacuum", multiple: true } } },
                {
                  name: "stofzuiger_meldingen",
                  selector: {
                    select: {
                      multiple: true,
                      mode: "list",
                      options: STOFZUIGER_GEBEURTENISSEN.map((g) => ({ value: g.id, label: t(g.naam) })),
                    },
                  },
                },
              ],
              true
            ),
          ]
        : []),
      // Sinds 0.109.0. Geen blok eronder: welke camera's en melders er zijn,
      // staat op de camerakaart (Snapshots en meldingen).
      { name: "camera", selector: sel.bool() },
      // Sinds 0.139.0. Alles hier, ook voor de klant zelf (de eigenaar: "alles via lovelace in te
      // kunnen stellen ook de klant").
      { name: "garage", selector: sel.bool() },
      ...(this.config_?.garage
        ? [
            section(
              t("Deur, bediening en tijden"),
              "mdi:garage",
              [
                { name: "garage_contact", selector: sel.entity(["binary_sensor", "cover"]) },
                { name: "garage_bediening", selector: sel.entity(["switch", "button", "input_button", "script", "cover"]) },
                { name: "garage_naam", selector: sel.text() },
                { name: "garage_minuten", selector: sel.number(1, 240) },
                { name: "garage_herhaal", selector: sel.number(0, 720) },
                {
                  name: "garage_negeer",
                  selector: {
                    select: {
                      multiple: true,
                      custom_value: true,
                      mode: "dropdown",
                      options: ["15", "30", "60", "120", "240", "480"].map((n) => ({ value: n, label: negeerNaam(Number(n)) })),
                    },
                  },
                },
                { name: "garage_avond_aan", selector: sel.bool() },
                ...(this.config_?.garage_avond_aan !== false ? [{ name: "garage_avond", selector: { time: {} } }] : []),
                { name: "garage_morgen", selector: { time: {} } },
                { name: "garage_pad", selector: sel.text() },
              ],
              true
            ),
          ]
        : []),
      // Sinds 0.141.0: de berichten van de auto.
      { name: "auto", selector: sel.bool() },
      ...(this.config_?.auto
        ? [
            section(
              t("Auto's"),
              "mdi:car",
              [
                { name: "auto_berichten", selector: this.autoKiezer_() },
                { name: "auto_pad", selector: sel.text() },
              ],
              true
            ),
          ]
        : []),
    ];
  }

  /** De berichtensensoren van bekende merken; zijn die er niet, dan elke sensor. */
  autoKiezer_() {
    const bekend = berichtSensoren(this.hass);
    return { entity: { multiple: true, ...(bekend.length ? { include_entities: bekend } : { domain: "sensor" }) } };
  }

  label(s) {
    return (
      {
        personen: t("Personen"),
        afval: t("Afvalmeldingen"),
        afval_morgen: t("Afval morgen"),
        tijd_morgen: t("Melding de avond ervoor"),
        afval_vandaag: t("Afval vandaag"),
        tijd_vandaag: t("Melding op de dag zelf"),
        afval_bakken: t("Bakken om uit te kiezen"),
        stofzuiger: t("Robotstofzuiger"),
        stofzuigers: t("Robots"),
        stofzuiger_meldingen: t("Te kiezen"),
        camera: t("Camerameldingen"),
        garage: t("Garagedeur"),
        garage_contact: t("Contact van de deur"),
        garage_bediening: t("Bediening"),
        garage_naam: t("Naam in de melding"),
        garage_minuten: t("Eerste melding na (minuten open)"),
        garage_herhaal: t("Daarna elke (minuten)"),
        garage_negeer: t("Negeren"),
        garage_avond_aan: t("Avondmelding"),
        garage_avond: t("Avondmelding om"),
        garage_morgen: t("Tot morgen betekent tot"),
        garage_pad: t("Pad bij een tik op de melding"),
        auto: t("Autoberichten"),
        auto_berichten: t("Berichten van de auto"),
        auto_pad: t("Pad bij een tik op de melding"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      personen: t(
        "Wie er op de kaart staat. Met het potlood kiest ieder zelf welke meldingen hij krijgt. De telefoon wordt bij de persoon gezocht (de app van Home Assistant); vindt de kaart er geen, dan staat dat op de rij."
      ),
      afval: t(
        "Een herinnering om de container buiten te zetten: de avond ervoor en de ochtend zelf, met een knop 'Staat buiten' in de melding."
      ),
      afval_morgen: t(
        "De sensor die zegt wat er MORGEN opgehaald wordt, zoals sensor.mijnafvalwijzer_morgen, of een agenda met elke ophaling als afspraak en de soort als titel. Leeg laten: geen melding de avond ervoor."
      ),
      tijd_morgen: t("Standaard 19:30."),
      afval_vandaag: t(
        "De sensor die zegt wat er VANDAAG opgehaald wordt, of dezelfde agenda. Leeg laten: geen melding op de dag zelf."
      ),
      tijd_vandaag: t("Standaard 07:30. Vervalt als iemand de avond ervoor in de melding op 'Staat buiten' tikte."),
      afval_bakken: t(
        "Ieder kiest in zijn pop-up zelf wanneer en welke bakken. De bakken leert de kaart vanzelf zodra de sensor ze noemt; vul ze hier in om ze meteen te kunnen kiezen."
      ),
      stofzuiger: t(
        "Een melding als de robot klaar is, een storing heeft, water of een lege tank nodig heeft, of als een onderdeel aan de beurt is."
      ),
      stofzuigers: t("De robots waarover gemeld wordt. Werkt met Dreame (dreame_vacuum)."),
      stofzuiger_meldingen: t(
        "Wat iedereen in zijn pop-up kan kiezen. Ieder kiest daar zelf waarover en van welke robot; wie niets kiest krijgt alles wat hier aan staat. Water en stofzak: de schoonwatertank, de vuilwatertank en de stofzak. Onderhoud: een onderdeel met 10 % of minder over."
      ),
      garage: t(
        "Een melding als de garagedeur openstaat, met Sluiten en negeren erin. Ieder zet hem in zijn pop-up aan of uit; negeren geldt voor het hele huis."
      ),
      garage_contact: t("Het magneetcontact op de deur: aan is open. Dit is de waarheid, ook als de deur met een gewone afstandsbediening dichtgaat."),
      garage_bediening: t(
        "Wat de deur laat bewegen, zoals een schakelaar met een puls. Sluiten stuurt alleen iets als het contact open zegt. Leeg laten: geen knop Sluiten in de melding."
      ),
      garage_naam: t("Leeg laten: Garagedeur."),
      garage_minuten: t("Standaard 5."),
      garage_herhaal: t("Zolang hij open staat. Standaard 60; 0 is geen herinnering."),
      garage_negeer: t("De knoppen om de melding een tijd te negeren, in minuten. Op Android passen er twee naast Sluiten; de rest staat in de pop-up van de kaart."),
      garage_avond_aan: t("Staat de deur om deze tijd open, dan komt er hoe dan ook een melding, ook als er genegeerd wordt, met een knop Tot morgen."),
      garage_morgen: t("Standaard 07:00."),
      garage_pad: t("Waar een tik op de melding naartoe gaat, zoals /dashboard-home/0#garage. Leeg laten: de app opent gewoon."),
      auto: t(
        "Een melding bij elk nieuw bericht van de auto, zoals een waarschuwing over de bandenspanning. Ieder zet hem in zijn pop-up aan of uit. Wat er al stond als je hem aanzet, komt niet als melding."
      ),
      auto_berichten: t("De sensor met de berichten van de fabrikant, per auto één. Werkt met FordPass."),
      auto_pad: t("Waar een tik op de melding naartoe gaat, zoals /dashboard-home/0#auto. Leeg laten: de app opent gewoon."),
      camera: t(
        "De meldingen van de camerakaarten met Snapshots en meldingen. Ieder vinkt in zijn pop-up zelf aan of hij ze krijgt, van welke camera en waarover (mens, voertuig, aanbellen...). Wie nog niets koos, krijgt wat de camerakaart hem al gaf. Wie niet op deze kaart staat, houdt wat de camerakaart zegt."
      ),
    }[s.name];
  }
}

registerEditor("domotiapp-meldingen-card-editor", MeldingenEditor);
registerCard("domotiapp-meldingen-card", MeldingenCard, {
  name: nt("DomotiApp Meldingen"),
  description: nt(
    "De personen van het huis, met per persoon een potlood: kies welke herinneringen hij op zijn telefoon krijgt. Afval, de robotstofzuiger, de camera, de garagedeur en de auto."
  ),
});

export { MeldingenCard };
