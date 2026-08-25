/**
 * DomotiApp Scene — de Lovelace-kaart in rusttoestand (SPEC 3, 8, 13).
 *
 * De kaart toont drie scene-knoppen, een scheidingslijn en een potlood. In
 * rusttoestand leest ze **geen enkele lampstate** (SPEC 3.1): ze haalt de drie
 * scenes op met `domotiapp_lovelace/scenes/get` en rendert de iconen daaruit.
 * Pas bij een klik worden lampstates geraadpleegd, om te bepalen welke lampen
 * overgeslagen moeten worden.
 *
 * __CARD_VERSION__ wordt bij het bundelen vervangen door de version uit
 * manifest.json. Er staat dus geen versienummer in deze bron (SPEC 1.1).
 */
import { LitElement, css, html, nothing } from "lit";

import { resolve } from "../icons.js";
import { vormtaal } from "./vormtaal.js";
import { gemetenRijen, meetRaster, volgRaster } from "../rasterhoogte.js";

import { bouwServiceOproepen, voerUit } from "./apply-scene.js";
import { meldingNieuweLampen, nieuweLampen } from "./lamp-besturing.js";
import {
  CARD_TYPE,
  DEFAULT_ICONS,
  EDITOR_TYPE,
  LOVELACE_LAYOUT_KEYS,
  PENCIL_ICON,
  SCENE_COUNT,
  SCENE_EDITOR_TYPE,
} from "./const.js";
import { DomotiappSceneCardEditor } from "./editor.js";
import { DomotiappSceneEditor } from "./scene-editor.js";
import { meldAan, meldInKiezer } from "../registratie.js";

const VERSION = __CARD_VERSION__;

/** Sleutels die de kaart zelf kent. */
const EIGEN_SLEUTELS = ["type", "entity", "name_overrides", "bare"];

/** De toestanden waarin de kaart kan staan. */
const LADEN = "laden";
const KLAAR = "klaar";
const LEEG = "leeg";
const GEEN_GROEP = "geen-groep";
const OPSLAGFOUT = "opslagfout";
const FOUT = "fout";

class DomotiappSceneCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _scenes: { state: true },
    _leden: { state: true },
    _toestand: { state: true },
    _melding: { state: true },
    _bezig: { state: true },
    _editorOpen: { state: true },
  };

  constructor() {
    super();
    this._scenes = null;
    this._leden = [];
    this._toestand = LADEN;
    this._melding = "";
    this._bezig = false;
    this._editorOpen = false;
    // Voor welk entity-ID we al hebben opgehaald, en of dat toen bestond.
    this._opgehaaldVoor = null;
    this._bestondVorigeKeer = false;
  }

  static styles = [
    vormtaal,
    css`
      :host { display: block; }

      /* Dezelfde maat als elke andere regelkaart in de familie: 56px is één
         rij in HA's sections-raster, zodat een scenekaart naast een knopkaart
         geen halve regel verschilt. */
      .card {
        min-height: var(--dac-raster, 56px);
        padding: 7px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }


      /* Geen achtergrond: hetzelfde bare als bij de andere kaarten in de
         familie, zodat een dashboard zonder vlakken ook zonder vlakken is als
         deze kaart ertussen staat. De binnenmarge gaat mee weg -- die hoort bij
         het vlak, en zonder vlak duwt hij de inhoud alleen uit het raster. */
      :host([bare]) .card {
        background: none;
        border: 0;
        box-shadow: none;
        padding-left: 0;
        padding-right: 0;
      }

      .rij {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* De drie scenes verdelen de ruimte links van de scheiding. Zonder
         justify-content plakken ze tegen de linkerrand en valt er een gat vóór
         de scheidingslijn. */
      .scenes {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 8px;
      }

      /* Een scene is een knop met dezelfde chip als overal: identiteitskleur op
         lage dekking, icoon op volle. */
      .chip {
        width: 40px;
        height: 40px;
        padding: 0;
        cursor: pointer;
        font: inherit;
        --tone: var(--dac-accent-hi);
        transition: background 200ms ease, border-color 200ms ease,
          box-shadow 200ms ease, transform 200ms ease;
      }
      .chip .icon,
      .chip ha-icon {
        width: 20px;
        height: 20px;
        --mdc-icon-size: 20px;
      }
      .chip:hover {
        box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
      }
      .chip:active {
        transform: scale(0.94);
      }
      .chip[disabled] {
        opacity: 0.42;
        pointer-events: none;
      }

      /* Het potlood is geen scene en hoort er ook niet als één uit te zien:
         neutrale inkt, geen vulling, geen rand. */
      .potlood {
        --tone: var(--dac-ink-3);
        background: none;
        border-color: transparent;
      }
      .potlood:hover {
        background: var(--dac-surface-hi);
        box-shadow: none;
      }

      .scheiding {
        width: 1px;
        align-self: stretch;
        margin: 4px 0;
        flex: 0 0 auto;
        background: var(--dac-border);
      }

      .mededeling {
        font-size: 11.5px;
        line-height: 1.3;
        color: var(--dac-ink-2);
        padding: 0 2px;
      }

      .detail {
        margin-top: 2px;
        color: var(--dac-ink-3);
        word-break: break-word;
      }
    `,
  ];

  /** De editor voor het Lovelace-configuratiescherm (SPEC 12.2). */
  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  /**
   * Een bruikbare startconfig voor de kaartkiezer.
   *
   * Zonder dit zou de kiezer een config zonder `entity` aanbieden, en die
   * weigert `setConfig` terecht (SPEC 12.1) — waardoor de kaart in de UI niet
   * toe te voegen zou zijn.
   */
  static getStubConfig(hass) {
    const groep = Object.keys(hass?.states ?? {}).find(
      (entityId) =>
        entityId.startsWith("light.") &&
        Array.isArray(hass.states[entityId].attributes?.entity_id),
    );
    return { entity: groep ?? "" };
  }

  /**
   * Houd de kaart op een rasterrij van Home Assistant.
   *
   * Lit vervangt zijn DOM bij elke render, dus de waarnemer verhuist mee zodra
   * er een ander vak staat -- de foutvorm tekent geen .card maar een .needs.
   * Zie rasterhoogte.js voor waarom dit met een meting gaat en niet met een
   * vast aantal rijen: dat laatste is hier al eens geprobeerd en toen stak de
   * kaart 33px door zijn eigen vak heen.
   */
  updated() {
    const vak = this.renderRoot?.querySelector(".card, .needs");
    if (vak !== this._rasterVak) {
      this._rasterUit?.();
      this._rasterVak = vak;
      this._rasterUit = vak ? volgRaster(vak) : null;
    }
    // Ook als het vak hetzelfde blijft: er kan een melding bij zijn gekomen.
    meetRaster(vak);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._rasterUit?.();
    this._rasterUit = null;
    this._rasterVak = null;
  }

  setConfig(config) {
    if (!config?.entity) {
      throw new Error("Kies een lichtgroep bij 'entity'.");
    }

    const onbekend = Object.keys(config).filter(
      (sleutel) =>
        !EIGEN_SLEUTELS.includes(sleutel) &&
        !LOVELACE_LAYOUT_KEYS.includes(sleutel),
    );
    if (onbekend.length) {
      // Niet weigeren maar melden: Lovelace hangt zelf lay-outsleutels aan een
      // kaartconfig, dus hard weigeren zou de kaart daar breken (SPEC 12.1).
      console.warn(
        `${CARD_TYPE}: onbekende sleutels in de configuratie: ${onbekend.join(", ")}`,
      );
    }

    this._config = config;
    // Een kenmerk en geen klasse op de div: lit tekent die div opnieuw bij elke
    // render, en de host blijft.
    this.toggleAttribute("bare", Boolean(config.bare));
  }

  getCardSize() {
    return 1;
  }

  /**
   * De afmetingen in een sections-dashboard (SPEC 3.3).
   *
   * `rows: "auto"` en niet `rows: 1`. Dat is geen smaakkwestie maar de fix voor
   * een gemeten fout: HA's sections-grid geeft een kaart met een **getal** bij
   * `rows` de klasse `fit-rows`, en die zet een vaste hoogte —
   * `height: calc(rows * (56px + 8px) - 8px)`. Verschijnt de melding uit
   * SPEC 3.4, dan wordt de kaart 89 px terwijl zijn vak 56 px blijft: 33 px
   * steekt eruit, dwars door de rand en over wat eronder staat.
   *
   * Bij een string slaat `computeCardGridSize` de klemming over en blijft
   * `fit-rows` weg, waarna de hoogte de inhoud volgt. `"auto"` is bovendien
   * wat HA zelf als standaard hanteert voor een kaart die niets opgeeft
   * (`DEFAULT_GRID_SIZE`).
   *
   * `min_rows` staat er niet meer: `computeCardGridSize` klemt alleen bij een
   * getal, dus naast `"auto"` zou hij niets doen.
   */
  getGridOptions() {
    // De ondergrens is gemeten -- zie gemetenRijen in rasterhoogte.js. Zonder
    // dat mag het vak kleiner gesleept worden dan de inhoud en schildert de
    // kaart over zijn buurman heen.
    const rijen = gemetenRijen(this.renderRoot?.querySelector?.(".card")) ?? 1;
    return { rows: "auto", columns: "full", min_columns: 6, min_rows: rijen };
  }

  willUpdate() {
    const entityId = this._config?.entity;
    if (!this.hass || !entityId) {
      return;
    }

    const bestaatNu = Boolean(this.hass.states[entityId]);

    if (this._opgehaaldVoor !== entityId) {
      this._opgehaaldVoor = entityId;
      this._bestondVorigeKeer = bestaatNu;
      this._haalScenesOp();
      return;
    }

    // Opstartrace: de kaart kan renderen vóórdat de light group bestaat. Komt
    // hij daarna alsnog op, dan proberen we één keer opnieuw. Dit is de enige
    // state die de kaart in rusttoestand leest, en het is de groep zelf — geen
    // lampstate (SPEC 3.1).
    if (bestaatNu && !this._bestondVorigeKeer && this._toestand === GEEN_GROEP) {
      this._bestondVorigeKeer = true;
      this._haalScenesOp();
      return;
    }
    this._bestondVorigeKeer = bestaatNu;
  }

  async _haalScenesOp() {
    const entityId = this._config.entity;
    this._toestand = LADEN;
    this._melding = "";

    try {
      const antwoord = await this.hass.callWS({
        type: "domotiapp_lovelace/scenes/get",
        entity_id: entityId,
      });
      this._scenes = antwoord.scenes;
      this._leden = antwoord.member_entity_ids ?? [];
      this._toestand = this._leden.length === 0 ? LEEG : KLAAR;
    } catch (fout) {
      this._verwerkFout(fout, entityId);
    }
  }

  _verwerkFout(fout, entityId) {
    const code = fout?.code;
    this._melding = fout?.message ?? String(fout);

    if (code === "home_assistant_error") {
      // Onleesbare opslag: geen editor aanbieden (SPEC 18.2).
      this._toestand = OPSLAGFOUT;
      return;
    }
    if (!this.hass.states[entityId]) {
      // De lichtgroep bestaat niet (meer) — SPEC 13.1 en 13.2.
      this._toestand = GEEN_GROEP;
      return;
    }
    this._toestand = FOUT;
  }

  _naam(entityId) {
    return (
      this._config?.name_overrides?.[entityId] ||
      this.hass?.states?.[entityId]?.attributes?.friendly_name ||
      entityId
    );
  }

  async _pasSceneToe(index) {
    if (this._bezig || this._toestand !== KLAAR) {
      return;
    }

    const { oproepen } = bouwServiceOproepen({
      scene: this._scenes?.[index],
      memberEntityIds: this._leden,
      states: this.hass.states,
    });

    if (!oproepen.length) {
      return;
    }

    this._bezig = true;
    try {
      const mislukt = await voerUit(
        (service, data) => this.hass.callService("light", service, data),
        oproepen,
      );
      if (mislukt.length) {
        this._meldMislukking(mislukt.map((item) => item.entityId));
      }
    } finally {
      this._bezig = false;
    }
  }

  /** Eén melding met de namen van de lampen die niet reageerden (SPEC 8.4). */
  _meldMislukking(entityIds) {
    const namen = entityIds.map((entityId) => this._naam(entityId)).join(", ");
    const bericht =
      entityIds.length === 1
        ? `${namen} reageerde niet.`
        : `Deze lampen reageerden niet: ${namen}.`;

    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        detail: { message: bericht },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Het potlood opent de editor (SPEC 3.2 en 4).
   *
   * De editor is een eigen element dat pas bestaat zodra hij open is: hij haalt
   * bij openen zelf `scenes/get` op (SPEC 4.2), en hij hoort niet mee te
   * renderen zolang niemand hem gevraagd heeft.
   */
  _bewerk() {
    if (this._toestand !== KLAAR) {
      return;
    }
    this._editorOpen = true;
  }

  _sluitEditor() {
    this._editorOpen = false;
  }

  /**
   * De editor heeft opgeslagen en de scenes daarna opnieuw opgehaald. We nemen
   * dat antwoord over, zodat de kaart meteen de nieuwe iconen toont zonder een
   * tweede rondgang naar de server.
   */
  _scenesOpgeslagen(event) {
    event.stopPropagation();
    this._scenes = event.detail.scenes;
    this._leden = event.detail.member_entity_ids ?? [];
    this._toestand = this._leden.length === 0 ? LEEG : KLAAR;
  }

  render() {
    if (!this._config) {
      return nothing;
    }

    switch (this._toestand) {
      case GEEN_GROEP:
        return this._renderFout(
          `Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`,
        );
      case OPSLAGFOUT:
        return this._renderFout(
          "De opgeslagen scenes van deze kamer zijn onleesbaar.",
          this._melding,
        );
      case FOUT:
        return this._renderFout("De scenes konden niet geladen worden.", this._melding);
      default:
        return this._renderKaart();
    }
  }

  /**
   * Een kaart die nergens naar wijst, in de vorm van de familie.
   *
   * Dezelfde `.needs`-blokvorm als elke andere kaart hier gebruikt zodra er
   * iets ontbreekt: gestippelde rand, één vraagteken, en er staat wát er
   * ontbreekt. Een kaart die in plaats daarvan gooit levert "Ongeldige
   * configuratie" op, en dat vertelt de installateur niets.
   */
  _renderFout(tekst, detail) {
    return html`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${tekst}</b>
          ${detail ? html`<span class="detail">${detail}</span>` : nothing}
        </span>
      </div>
    `;
  }

  /**
   * Een icoon als lit-fragment.
   *
   * `resolve` geeft een string terug: onze eigen getekende set als de naam er
   * een van is, en anders een `<ha-icon>` voor alles met een dubbele punt. Dat
   * is precies wat hier nodig is, want de opgeslagen scene-iconen zijn
   * `mdi:`-namen en de vaste iconen van de kaart de onze.
   */
  _icoon(naam) {
    const sjabloon = document.createElement("template");
    sjabloon.innerHTML = resolve(naam);
    return sjabloon.content.cloneNode(true);
  }

  _renderKaart() {
    const leeg = this._toestand === LEEG;
    const laden = this._toestand === LADEN;
    const iconen = this._iconen();

    return html`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${iconen.map(
              (icoon, index) => html`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${leeg || laden || this._bezig}
                  aria-label=${`Scene ${index + 1}`}
                  title=${`Scene ${index + 1}`}
                  @click=${() => this._pasSceneToe(index)}
                >
                  ${this._icoon(icoon)}
                </button>
              `,
            )}
          </div>
          <span class="scheiding"></span>
          <button
            type="button"
            class="chip potlood"
            ?disabled=${leeg || laden}
            aria-label="Scenes bewerken"
            title="Scenes bewerken"
            @click=${this._bewerk}
          >
            ${this._icoon(PENCIL_ICON)}
          </button>
        </div>
        ${leeg
          ? html`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`
          : this._renderNieuweLampen()}
      </div>
      ${this._editorOpen ? this._renderEditor() : nothing}
    `;
  }

  /**
   * De melding over lampen die nog niet in alle drie de scenes staan (SPEC 3.4).
   *
   * Zichtbaar voor iedereen, ook voor een niet-adminkioskgebruiker: die mag de
   * editor openen en kan het dus zelf oplossen (SPEC 14).
   *
   * Hier wordt géén lampstate gelezen. `_scenes` en `_leden` komen allebei uit
   * `scenes/get`, dus de kaart blijft in rusttoestand stil (SPEC 3.1).
   */
  _renderNieuweLampen() {
    if (this._toestand !== KLAAR) {
      return nothing;
    }
    const aantal = nieuweLampen(this._scenes, this._leden, SCENE_COUNT).length;
    const tekst = meldingNieuweLampen(aantal);
    if (!tekst) {
      return nothing;
    }
    return html`<div class="mededeling">${tekst}</div>`;
  }

  _renderEditor() {
    // De tagnaam staat hier letterlijk omdat een lit-template geen variabele
    // tag toestaat; hij hoort gelijk te zijn aan SCENE_EDITOR_TYPE.
    return html`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `;
  }

  _iconen() {
    return Array.from(
      { length: SCENE_COUNT },
      (_, index) => this._scenes?.[index]?.icon || DEFAULT_ICONS[index],
    );
  }
}

// Alles hieronder draait op modulescope en mag daarom nooit gooien (SPEC 17.1).
//
// Definieren gebeurt hier niet. Deze kaart zit in een bundel met de hele
// DomotiApp-familie, en daar staat een wachtlus voor allemaal in
// `src/registratie.js` -- om precies dezelfde reden waarom hij hier stond: onze
// import() en die van HA's app zijn siblings in index.html, en wie als eerste
// klaar is bepaalt in welke custom-element-registry we landen.
meldAan(CARD_TYPE, DomotiappSceneCard);
meldAan(EDITOR_TYPE, DomotiappSceneCardEditor);
meldAan(SCENE_EDITOR_TYPE, DomotiappSceneEditor);

meldInKiezer({
  type: CARD_TYPE,
  name: "DomotiApp Scene",
  description: `Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${VERSION}).`,
  preview: false,
});
