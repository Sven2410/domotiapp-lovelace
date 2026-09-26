/**
 * DomotiApp Meldingen: per persoon een schakelaar voor een herinnering.
 *
 * Gevraagd op 26 september 2026, met een schermafdruk van zijn eigen versie:
 * een kop "Afval notificaties" en vijf rijen met een naam en een schakelaar,
 * elk aan een eigen `input_boolean`, en daarachter een automatisering die om
 * 07:30 en 19:30 naar vijf vaste telefoons stuurde. *"Dat is eigenlijk voor
 * elke afval meldingen hetzelfde."*
 *
 * WAT DE KAART DOET EN WAT NIET
 *
 * De kaart VERSTUURT niets. Dat doet de integratie (`meldingen/` aan de
 * serverkant), die de instellingen van deze kaart zelf uit de opgeslagen
 * dashboards leest. De kaart laat zien wie er aan staat, zet dat om, en zegt
 * in de kop wat er komt. Daardoor zijn er geen helpers meer nodig: wie je
 * toevoegt, staat aan.
 *
 * WAAROM EEN PERSOON EN GEEN TELEFOON
 *
 * Zelfde afspraak als bij de camera: `notify.mobile_app_iphone_van_sven` is
 * geen naam die iemand onthoudt, en hij verandert zodra de telefoon anders
 * gaat heten. De serverkant zoekt de telefoon bij de persoon. Vindt hij er
 * geen, dan zegt de rij dat -- anders krijgt iemand stil geen melding en ziet
 * niemand waarom.
 *
 * DE SOORT
 *
 * Voorlopig alleen Afval. De keuzelijst staat er toch, omdat de eigenaar hem
 * zo vroeg: de kaart is bedoeld voor meer soorten herinneringen, en wie er
 * straks een tweede kiest hoeft geen andere kaart te zoeken.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { nameOf, pictureOf, stateOf } from "../ha.js";
import { Herkansing, Verbindingswacht, nogNietGereed } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { bindToggle, setToggle, toggleCss, toggleHtml } from "../toggle.js";
import { kopRegel, meldingId, personenUit, staatAan } from "./meldingen-logica.js";

/** Per soort de naam in de kop en het icoon, als de config zwijgt. */
const SOORT = {
  afval: { naam: "Afvalmeldingen", icoon: "bin" },
};

class MeldingenCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop, .rij { display: flex; align-items: center; gap: 11px; min-height: 40px; }
    .chip { width: 40px; height: 40px; flex: 0 0 auto; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm, .pn {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st, .ps {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ps { color: var(--dac-warn); }
    [hidden] { display: none !important; }

    .lijst { display: flex; flex-direction: column; gap: 8px; }
    .rij { cursor: pointer; -webkit-tap-highlight-color: transparent; }

    /* Alleen het icoon draagt de toestand. Een foto dimt als hij uit staat;
       een icoon kleurt mee met het accent. */
    .rij[data-aan="false"] .chip.pic img { opacity: .45; filter: grayscale(1); }
    .rij[data-aan="false"] .pn { color: var(--dac-ink-2); }

    /* Tot de server geantwoord heeft, weet de kaart niet hoe het staat. Dan
       liever een stille schakelaar dan een die straks omspringt. */
    .card.laden .toggle { opacity: .4; pointer-events: none; }

    ${toggleCss}

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.stand_ = null;
  }

  validate(config) {
    const c = { soort: "afval", ...config };
    c.personen = personenUit(c);
    const mist = [];
    if (!c.afval_vandaag && !c.afval_morgen) mist.push("de afvalsensor voor vandaag of morgen");
    if (!c.personen.length) mist.push("minstens één persoon");
    if (mist.length) c[INCOMPLETE] = `Kies ${mist.join(" en ")}.`;
    return c;
  }

  watched() {
    return [this.config.afval_vandaag, this.config.afval_morgen, ...this.config.personen].filter(Boolean);
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
          ${toggleHtml({ label: "Meldingen aan of uit" })}
        </div>`
      )
      .join("");
    return `
      <div class="card surface laden" style="--tone:${TONES.accent}">
        <div class="kop">
          <span class="chip kopchip"></span>
          <span class="txt"><span class="nm"></span><span class="st" hidden></span></span>
        </div>
        <div class="lijst">${rijen}</div>
      </div>`;
  }

  wire() {
    for (const rij of this.$$(".rij")) {
      const persoon = rij.dataset.p;
      const schakelaar = rij.querySelector(".toggle");
      this.teardown_.push(
        bindToggle(schakelaar, {
          value: () => staatAan(this.stand_, persoon),
          set: (aan) => this.zet_(persoon, aan),
          disabled: () => !this.stand_,
        })
      );
      // De hele rij is een knop: een schakelaar van 46 pixels is op een
      // telefoon een klein doel, en er is op deze rij niets anders te doen.
      this.on(rij, "click", () => {
        if (this.stand_) this.zet_(persoon, !staatAan(this.stand_, persoon));
      });
    }

    this.herkansing_ = new Herkansing(() => this.luister_());
    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(volgRaster(this.$(".card")));
    this.luistert_ = false;
    this.teardown_.push(() => {
      this.luistert_ = false;
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
   * Abonneer op de stand van deze melding.
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
      const opzeggen = await this.hass.connection.subscribeMessage(
        (stand) => {
          this.stand_ = stand;
          this.paint();
        },
        { type: "domotiapp_lovelace/meldingen/subscribe", melding: meldingId(this.config) }
      );
      if (dood) opzeggen();
      else
        this.teardown_.push(() => {
          try {
            opzeggen();
          } catch {
            // De verbinding is al weg.
          }
        });
      this.herkansing_.herstel();
    } catch (fout) {
      this.luistert_ = false;
      // Net na een herstart kent Home Assistant het commando nog niet (valkuil 28).
      if (nogNietGereed(fout)) this.herkansing_.plan();
      else console.warn("DomotiApp Meldingen: geen stand", fout);
    }
  }

  zet_(persoon, aan) {
    if (!this.stand_ || !this.hass?.connection) return;
    const vorig = this.stand_;
    // Meteen laten zien; de server bevestigt het via het abonnement.
    this.stand_ = { ...vorig, aan: { ...(vorig.aan ?? {}), [persoon]: aan } };
    this.paint();
    this.hass.connection
      .sendMessagePromise({
        type: "domotiapp_lovelace/meldingen/aan",
        melding: meldingId(this.config),
        persoon,
        aan,
      })
      .catch((fout) => {
        console.warn("DomotiApp Meldingen: omzetten mislukte", fout);
        this.stand_ = vorig;
        this.paint();
      });
  }

  paint() {
    const c = this.config;
    const soort = SOORT[c.soort] ?? SOORT.afval;
    const stand = this.stand_;
    this.$(".card").classList.toggle("laden", !stand);

    const kopchip = this.$(".kopchip");
    const icoon = c.icon || soort.icoon;
    if (kopchip.dataset.icon !== icoon) {
      kopchip.dataset.icon = icoon;
      kopchip.innerHTML = resolve(icoon, soort.icoon);
    }
    this.text(".nm", c.name || soort.naam);

    const door = stand?.buiten?.door;
    let regel = kopRegel({
      vandaag: stateOf(this.hass, c.afval_vandaag)?.state,
      morgen: stateOf(this.hass, c.afval_morgen)?.state,
      tijdMorgen: c.tijd_morgen || "19:30",
      buiten: stand?.buiten,
      door: door ? voornaam(nameOf(this.hass, door)) : "",
    });
    // De server kent de kaart pas als het dashboard is opgeslagen. In de
    // editor is dat het eerste wat je wilt weten.
    if (stand && !stand.bekend) regel = "Actief zodra het dashboard is opgeslagen";
    const st = this.$(".st");
    st.hidden = !regel;
    this.text(st, regel);

    for (const rij of this.$$(".rij")) {
      const p = rij.dataset.p;
      const aan = staatAan(stand, p);
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
      const ps = rij.querySelector(".ps");
      const zonder = Boolean(stand?.telefoons) && !stand.telefoons[p];
      ps.hidden = !zonder;
      this.text(ps, zonder ? "Geen telefoon gevonden" : "");

      const schakelaar = rij.querySelector(".toggle");
      setToggle(schakelaar, aan);
      schakelaar.style.setProperty("--tone", TONES.accent);
      schakelaar.setAttribute("aria-label", `Meldingen voor ${naam} ${aan ? "uitzetten" : "aanzetten"}`);
    }

    meetRaster(this.$(".card"));
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 1 + (this.config?.personen?.length ?? 1);
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 1 + (this.config?.personen?.length ?? 1)),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-meldingen-card-editor");
  }

  static getStubConfig(hass, entities) {
    const zoek = (patroon) => entities?.find((e) => e.startsWith("sensor.") && patroon.test(e)) ?? "";
    return {
      soort: "afval",
      afval_vandaag: zoek(/afval.*vandaag|vandaag.*afval|waste.*today/i),
      afval_morgen: zoek(/afval.*morgen|morgen.*afval|waste.*tomorrow/i),
      personen: (entities ?? []).filter((e) => e.startsWith("person.")).slice(0, 6),
    };
  }
}

/** "Sven Kool" -> "Sven": in een regel van één zin is de voornaam genoeg. */
const voornaam = (naam) => String(naam ?? "").trim().split(/\s+/)[0] ?? "";

class MeldingenEditor extends DacEditor {
  defaults() {
    return { soort: "afval", tijd_morgen: "19:30:00", tijd_vandaag: "07:30:00" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "bin", auto: false }];
  }

  schema() {
    return [
      { name: "soort", selector: sel.select([{ value: "afval", label: "Afval" }]) },
      { name: "name", selector: sel.text() },
      { name: "afval_morgen", selector: sel.entity(["sensor"]) },
      { name: "tijd_morgen", selector: { time: {} } },
      { name: "afval_vandaag", selector: sel.entity(["sensor"]) },
      { name: "tijd_vandaag", selector: { time: {} } },
      { name: "personen", selector: { entity: { domain: "person", multiple: true } } },
    ];
  }

  label(s) {
    return (
      {
        soort: "Soort melding",
        name: "Titel",
        afval_morgen: "Afval morgen",
        tijd_morgen: "Melding de avond ervoor",
        afval_vandaag: "Afval vandaag",
        tijd_vandaag: "Melding op de dag zelf",
        personen: "Personen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      soort: "Voorlopig alleen Afval.",
      name: "Leeg laten: Afvalmeldingen.",
      afval_morgen:
        "De sensor die zegt wat er MORGEN opgehaald wordt, zoals sensor.mijnafvalwijzer_morgen. Leeg laten: geen melding de avond ervoor.",
      tijd_morgen: "Standaard 19:30.",
      afval_vandaag:
        "De sensor die zegt wat er VANDAAG opgehaald wordt. Leeg laten: geen melding op de dag zelf.",
      tijd_vandaag:
        "Standaard 07:30. Vervalt als iemand de avond ervoor in de melding op 'Staat buiten' tikte.",
      personen:
        "Wie een melding krijgt. De telefoon wordt bij de persoon gezocht (de companion-app); vindt de kaart er geen, dan staat dat op de rij. Op de kaart zet ieder zijn eigen meldingen aan of uit.",
    }[s.name];
  }
}

registerEditor("domotiapp-meldingen-card-editor", MeldingenEditor);
registerCard("domotiapp-meldingen-card", MeldingenCard, {
  name: "DomotiApp Meldingen",
  description:
    "Herinneringen naar de telefoon, met per persoon een schakelaar. Voorlopig: afval, de avond ervoor en de ochtend zelf.",
});

export { MeldingenCard };
