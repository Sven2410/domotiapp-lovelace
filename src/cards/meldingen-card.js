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
 *   instellingen eronder. Voorlopig is er één, Afval.
 *
 * ## Wat de kaart doet en wat niet
 *
 * De kaart VERSTUURT niets. Dat doet de integratie (`meldingen/` aan de
 * serverkant), die de instellingen van deze kaart zelf uit de opgeslagen
 * dashboards leest. De kaart laat zien wie er iets krijgt en zet dat om.
 *
 * ## Waarom een persoon en geen telefoon
 *
 * Zelfde afspraak als bij de camera: `notify.mobile_app_iphone_van_sven` is
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
import { resolve } from "../icons.js";
import { nameOf, pictureOf, stateOf } from "../ha.js";
import { Herkansing, Verbindingswacht, nogNietGereed } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  afvalRegel,
  krijgtIets,
  meldingId,
  personenUit,
  soortAan,
  soortenVan,
  staatAan,
} from "./meldingen-logica.js";
import { meldingenScherm, toonMeldingenScherm } from "./meldingen-scherm.js";

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
    .chip .icon { width: 20px; height: 20px; }

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
    if (!c.personen.length) c[INCOMPLETE] = "Kies minstens één persoon.";
    return c;
  }

  /** De soorten op deze kaart, als `{id, naam, icoon}`. */
  soorten_() {
    return soortenVan(this.config);
  }

  watched() {
    const c = this.config;
    return [...(soortAan(c, "afval") ? [c.afval_vandaag, c.afval_morgen] : []), ...c.personen].filter(Boolean);
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
        ? `Geen telefoon gevonden. Zonder de app van Home Assistant krijgt ${voornaam(naam)} niets, ook niet met een vinkje.`
        : null,
      soorten: this.soorten_().map((soort) => {
        const stand = this.standen_[soort.id];
        return {
          ...soort,
          aan: staatAan(stand, persoon),
          laden: !stand,
          regel: soort.id === "afval" ? this.afvalRegel_(stand) : "",
        };
      }),
    };
  }

  afvalRegel_(stand) {
    const c = this.config;
    const door = stand?.buiten?.door;
    return afvalRegel({
      config: c,
      stand,
      vandaag: stateOf(this.hass, c.afval_vandaag)?.state,
      morgen: stateOf(this.hass, c.afval_morgen)?.state,
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
      this.text(ps, zonder ? "Geen telefoon gevonden" : "");

      rij.querySelector(".potlood").setAttribute("aria-label", `Meldingen van ${naam} instellen`);
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

/** "Sven Kool" -> "Sven": in een regel van één zin is de voornaam genoeg. */
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
    super.setConfig(c);
  }

  schema() {
    const afval = Boolean(this.config_?.afval);
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
              "Sensoren en tijden",
              "mdi:trash-can-outline",
              [
                { name: "afval_morgen", selector: sel.entity(["sensor"]) },
                { name: "tijd_morgen", selector: { time: {} } },
                { name: "afval_vandaag", selector: sel.entity(["sensor"]) },
                { name: "tijd_vandaag", selector: { time: {} } },
              ],
              true
            ),
          ]
        : []),
    ];
  }

  label(s) {
    return (
      {
        personen: "Personen",
        afval: "Afvalmeldingen",
        afval_morgen: "Afval morgen",
        tijd_morgen: "Melding de avond ervoor",
        afval_vandaag: "Afval vandaag",
        tijd_vandaag: "Melding op de dag zelf",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      personen:
        "Wie er op de kaart staat. Met het potlood kiest ieder zelf welke meldingen hij krijgt. De telefoon wordt bij de persoon gezocht (de app van Home Assistant); vindt de kaart er geen, dan staat dat op de rij.",
      afval:
        "Een herinnering om de container buiten te zetten: de avond ervoor en de ochtend zelf, met een knop 'Staat buiten' in de melding.",
      afval_morgen:
        "De sensor die zegt wat er MORGEN opgehaald wordt, zoals sensor.mijnafvalwijzer_morgen. Leeg laten: geen melding de avond ervoor.",
      tijd_morgen: "Standaard 19:30.",
      afval_vandaag:
        "De sensor die zegt wat er VANDAAG opgehaald wordt. Leeg laten: geen melding op de dag zelf.",
      tijd_vandaag:
        "Standaard 07:30. Vervalt als iemand de avond ervoor in de melding op 'Staat buiten' tikte.",
    }[s.name];
  }
}

registerEditor("domotiapp-meldingen-card-editor", MeldingenEditor);
registerCard("domotiapp-meldingen-card", MeldingenCard, {
  name: "DomotiApp Meldingen",
  description:
    "De personen van het huis, met per persoon een potlood: kies welke herinneringen hij op zijn telefoon krijgt. Voorlopig: afval.",
});

export { MeldingenCard };
