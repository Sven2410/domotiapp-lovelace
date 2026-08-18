/**
 * De editor achter het potlood (SPEC 4, 6, 7, 11.2).
 *
 * Wat deze fase (4b-1) wél doet: drie tabbladen, een icoonkiezer per scene, per
 * lamp de besturing die bij zijn `supported_color_modes` hoort, een "nieuw"-label
 * bij een lamp die in dit tabblad nog niet is ingesteld, en Opslaan.
 *
 * De toestand "niet ingesteld" bestaat nog gewoon in de opslag (SPEC 7.2), maar
 * heeft sinds fase 4b-1-fix3 geen eigen knop en geen eigen kleur meer in de UI.
 * Wil de klant dat een lamp niet meedoet, dan zet hij hem uit.
 *
 * Sinds fase 4b-2 hoort Voorbeeld er ook bij (SPEC 9). De snapshot wordt niet
 * hier gemaakt maar door de integratie, achter twee WebSocket-commando's; de
 * levensloop ervan zit in `src/voorbeeld.js` zodat hij zonder browser te
 * toetsen is.
 *
 * De dialoog is **HA's eigen `ha-dialog`**, geen zelfgebouwde `div` aan
 * `document.body` (SPEC 4, correctie op INVENTARIS punt l). Daarmee werken
 * Escape, de focus-trap, de scroll-lock en de stapeling ten opzichte van andere
 * HA-dialogen vanzelf — in een bubble pop-up card is dat laatste geen detail.
 *
 * `ha-dialog` meldt het sluiten met een `closed`-event en zet zijn eigen
 * `open`-property daarbij **niet** terug. Wie hem gebruikt moet dus zelf
 * opruimen; dat doet `_dialoogGesloten` hieronder.
 *
 * Registreren gebeurt niet hier maar via `src/registreer.js` (SPEC 17.1.2).
 */
import { LitElement, css, html, nothing } from "lit";

import "../editor/icon-picker.js";
import { vormtaal } from "./vormtaal.js";

import { bouwServiceOproepen, voerUit } from "./apply-scene.js";
import { DEFAULT_ICONS, SCENE_COUNT } from "./const.js";
import {
  alsProcent,
  bepaalBesturing,
  metAanUit,
  metHelderheid,
  metKleur,
  metKleurstand,
  metKleurtemp,
  isIngesteld,
  kelvinVerloop,
  toonAan,
  toonHelderheid,
  toonHs,
  toonKelvin,
  vanProcent,
  zichtbareBesturingen,
  MAX_PROCENT,
  MIN_PROCENT,
  STAND_KLEUR,
  STAND_WIT,
} from "./lamp-besturing.js";
import { Snapshotbeheer, voerVoorbeeldUit } from "./voorbeeld.js";

const LADEN = "laden";
const KLAAR = "klaar";
const FOUT = "fout";

/** Een tint-verloop over de hele cirkel, voor de achtergrond van de tintregelaar. */
const TINTVERLOOP = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
  .map((tint) => `hsl(${tint}, 100%, 50%)`)
  .join(", ")})`;

export class DomotiappSceneEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    entityId: { attribute: false },
    nameOverrides: { attribute: false },
    _scenes: { state: true },
    _leden: { state: true },
    _tab: { state: true },
    _toestand: { state: true },
    _melding: { state: true },
    _bezig: { state: true },
  };

  constructor() {
    super();
    this._scenes = null;
    this._leden = [];
    this._tab = 0;
    this._toestand = LADEN;
    this._melding = "";
    this._bezig = false;
    // De waarschuwing over ontbrekende Kelvin-grenzen hoort één keer in de log
    // te staan, niet bij elke hertekening (SPEC 6.3 en 18.5).
    this._kelvinGemeld = new Set();
    /** Beheert de snapshot; pas ingesteld zodra `entityId` bekend is. */
    this._snapshot = null;
  }

  static styles = [
    vormtaal,
    css`
      /* De dialoog zelf is die van Home Assistant -- Escape, de focus-trap, de
         scroll-lock en de stapeling ten opzichte van andere dialogen zijn geen
         dingen die je namaakt. Wat we wel doen is hem onze kleuren en maten
         geven, zodat wat erin staat bij de kaarten hoort. */
      ha-dialog {
        --mdc-theme-surface: var(--dac-bg-raise, #12120f);
        --mdc-dialog-heading-ink-color: var(--dac-ink);
        --mdc-dialog-content-ink-color: var(--dac-ink);
        --dialog-content-padding: 16px;
      }

      .inhoud {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 280px;
      }

      .lampen {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Eén lamp is één blok in dezelfde vorm als een kaart: hetzelfde
         oppervlak, dezelfde rand, dezelfde kleine ronding. */
      .lamp {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        background: var(--dac-surface);
        border: 1px solid var(--dac-border);
        border-radius: var(--dac-radius-sm);
      }

      .kop {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* De keuzeknoppen staan naast de schakelaar, in dezelfde rij (SPEC 6.5). */
      .bediening {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      /* Dezelfde pil als de kolomkiezer in de entiteiteneditor. */
      .kleurkeuze {
        display: inline-flex;
        gap: 2px;
        padding: 3px;
        background: rgba(127, 127, 127, 0.12);
        border-radius: var(--dac-radius-pill);
      }
      .keuze {
        appearance: none;
        border: 0;
        cursor: pointer;
        min-width: 44px;
        height: 24px;
        padding: 0 10px;
        border-radius: var(--dac-radius-pill);
        background: transparent;
        color: var(--dac-ink-3);
        font: inherit;
        font-size: 12px;
        line-height: 1;
      }
      .keuze.actief {
        background: var(--dac-accent-hi);
        color: #0c0c0a;
        font-weight: 600;
      }

      .naam {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        color: var(--dac-ink);
        font-size: 13.5px;
        font-weight: 500;
      }
      .naam .tekst {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .hint {
        display: block;
        color: var(--dac-ink-3);
        font-size: 11.5px;
        font-weight: 400;
      }

      /* Klein en rustig, op dezelfde regel als de naam, zodat de rij er niet
         hoger van wordt. */
      .nieuw {
        flex: none;
        margin-left: 8px;
        padding: 1px 7px;
        border-radius: var(--dac-radius-pill);
        background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
        border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 34%, transparent);
        color: var(--dac-accent-hi);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .besturing {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .label {
        display: flex;
        justify-content: space-between;
        color: var(--dac-ink-2);
        font-size: 11.5px;
        font-variant-numeric: tabular-nums;
      }

      ha-control-slider {
        --control-slider-thickness: 32px;
        --control-slider-border-radius: var(--dac-radius-sm);
        --control-slider-color: var(--dac-accent-hi);
      }

      .kleurregelaars {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .kleurregelaars .schuiven {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      /* Een kleurstaal moet de gekozen kleur tonen; dat is de gegevenswaarde
         zelf en geen themakleur. De rand eromheen is dat wel. */
      .staal {
        width: 36px;
        height: 36px;
        flex: none;
        border-radius: var(--dac-radius-sm);
        border: 1px solid var(--dac-border-hi);
      }

      .acties {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      ha-tab-group {
        --ha-tab-group-indicator-color: var(--dac-accent-hi);
      }
    `,
  ];

  firstUpdated() {
    this._haalOp();
  }

  /**
   * Wat de editor bij openen doet (SPEC 4.2): de scenes ophalen, en de
   * lampenlijst uit `member_entity_ids` overnemen. Nog géén snapshot — die
   * komt pas bij het eerste Voorbeeld (SPEC 4.2 en 9.3).
   */
  async _haalOp() {
    this._toestand = LADEN;
    try {
      const antwoord = await this.hass.callWS({
        type: "domotiapp_lovelace/scenes/get",
        entity_id: this.entityId,
      });
      this._neemOver(antwoord);
      this._toestand = KLAAR;
      return antwoord;
    } catch (fout) {
      this._melding = fout?.message ?? String(fout);
      this._toestand = FOUT;
      return null;
    }
  }

  _neemOver(antwoord) {
    // Een eigen kopie: vanaf hier bewerkt de gebruiker een concept dat pas bij
    // Opslaan naar de server gaat (SPEC 4.1).
    this._scenes = Array.from({ length: SCENE_COUNT }, (_, index) => {
      const scene = antwoord.scenes?.[index] ?? {};
      return {
        icon: scene.icon || DEFAULT_ICONS[index],
        lights: { ...(scene.lights ?? {}) },
      };
    });
    this._leden = antwoord.member_entity_ids ?? [];
    this._melding = "";
  }

  // ------------------------------------------------------------------------
  // Bewerken — alles blijft in het geheugen tot Opslaan
  // ------------------------------------------------------------------------

  _stateVan(entityId) {
    return this.hass?.states?.[entityId];
  }

  _besturingVan(entityId) {
    const kan = bepaalBesturing(this._stateVan(entityId));
    if (kan.kelvinUitDefaults && !this._kelvinGemeld.has(entityId)) {
      this._kelvinGemeld.add(entityId);
      console.warn(
        `domotiapp-scene-editor: ${entityId} meldt geen Kelvin-grenzen; ` +
          `${kan.minKelvin}–${kan.maxKelvin} K aangehouden (SPEC 6.3).`,
      );
    }
    return kan;
  }

  _waardeVan(entityId) {
    return this._scenes?.[this._tab]?.lights?.[entityId];
  }

  /** Zet of wis de waarde van één lamp in het huidige tabblad. */
  _zetLamp(entityId, waarde) {
    this._scenes = this._scenes.map((scene, index) => {
      if (index !== this._tab) {
        return scene;
      }
      const lights = { ...scene.lights };
      if (waarde === undefined) {
        // Afwezig ís de toestand "niet ingesteld" (SPEC 7.2).
        delete lights[entityId];
      } else {
        lights[entityId] = waarde;
      }
      return { ...scene, lights };
    });
  }

  _zetIcoon(icon) {
    this._scenes = this._scenes.map((scene, index) =>
      // `icon` is verplicht en mag niet leeg zijn (SPEC 10.4); een leeggemaakte
      // kiezer valt daarom terug op het standaardicoon.
      index === this._tab
        ? { ...scene, icon: icon || DEFAULT_ICONS[index] }
        : scene,
    );
  }

  _kiesTab(index) {
    // Wisselen bewaart wat er in het vorige tabblad staat: _scenes is één
    // object voor alle drie de tabbladen (SPEC 4.1).
    this._tab = index;
  }

  // ------------------------------------------------------------------------
  // Opslaan en sluiten
  // ------------------------------------------------------------------------

  get _kanOpslaan() {
    // Een lege light group mag niet opslaan: anders wist opslaan vanuit een
    // lege editor de bestaande scenes van die kamer (SPEC 13.3).
    return (
      this._toestand === KLAAR && !this._bezig && this._leden.length > 0
    );
  }

  async _slaOp() {
    if (!this._kanOpslaan) {
      return;
    }
    this._bezig = true;
    this._melding = "";
    try {
      // Alle drie de scenes in één keer; de editor heeft één Opslaan-knop voor
      // drie tabbladen, dus dat is ook de eenheid van de transactie (SPEC 11.2).
      await this.hass.callWS({
        type: "domotiapp_lovelace/scenes/save",
        entity_id: this.entityId,
        scenes: this._scenes,
      });
    } catch (fout) {
      this._melding = fout?.message ?? String(fout);
      this._bezig = false;
      return;
    }

    // Opnieuw ophalen, zodat wat de kaart daarna toont van de server komt en
    // niet uit ons eigen concept.
    const antwoord = await this._haalOp();
    this._bezig = false;
    if (antwoord) {
      this.dispatchEvent(
        new CustomEvent("scenes-opgeslagen", {
          detail: antwoord,
          bubbles: true,
          composed: true,
        }),
      );
    }
    // Bij Opslaan blijft de laatst getoonde stand staan; alleen de tijdelijke
    // scene gaat weg (SPEC 9.3).
    this._sluit({ opslaan: true });
  }

  /** Het snapshotbeheer, lui aangemaakt zodra de editor een entity-ID heeft. */
  get _beheer() {
    if (this._snapshot === null) {
      this._snapshot = new Snapshotbeheer({
        entityId: this.entityId,
        roepCommandoAan: (type, data) => this.hass.callWS({ type, ...data }),
      });
    }
    return this._snapshot;
  }

  get _kanVoorbeeld() {
    return this._toestand === KLAAR && !this._bezig && this._leden.length > 0;
  }

  /**
   * Voorbeeld (SPEC 9.1): zet de lampen om naar het **concept**, niet naar wat
   * er is opgeslagen.
   *
   * De aanroepen komen uit `bouwServiceOproepen()` — dezelfde functie die het
   * toepassen van een scene gebruikt. Daardoor slaat een voorbeeld precies
   * dezelfde lampen over: niet-ingesteld blijft onaangeraakt (SPEC 7.1),
   * `unavailable`/`unknown` wordt overgeslagen (SPEC 8.1), en `transition: 1`
   * gaat mee (SPEC 8.2).
   */
  async _voorbeeld() {
    if (!this._kanVoorbeeld) {
      return;
    }

    const { oproepen } = bouwServiceOproepen({
      scene: this._scenes[this._tab],
      memberEntityIds: this._leden,
      states: this.hass.states,
    });

    this._bezig = true;
    this._melding = "";
    try {
      const mislukt = await voerVoorbeeldUit({
        beheer: this._beheer,
        oproepen,
        voerUit: (lijst) =>
          voerUit(
            (service, data) => this.hass.callService("light", service, data),
            lijst,
          ),
      });
      if (mislukt.length) {
        this._melding = `Deze lampen reageerden niet: ${mislukt
          .map((item) => this._naam(item.entityId))
          .join(", ")}.`;
      }
    } catch (fout) {
      // De snapshot is niet gemaakt, dus er is bewust niets omgezet: een
      // voorbeeld zonder weg terug is het faalgedrag dat SPEC 18 bestrijdt.
      this._melding = `Het voorbeeld is niet gestart: ${
        fout?.message ?? String(fout)
      }`;
    } finally {
      this._bezig = false;
    }
  }

  /**
   * Sluiten. `opslaan` bepaalt of de snapshot wordt hersteld (SPEC 9.3).
   *
   * Het `editor-gesloten`-event gaat meteen weg zodat de dialoog niet blijft
   * hangen; het herstel loopt daarna door. `Snapshotbeheer` garandeert dat dat
   * hoogstens één keer gebeurt, ook als er twee sluit-events achter elkaar
   * komen.
   */
  _sluit({ opslaan = false } = {}) {
    this.dispatchEvent(
      new CustomEvent("editor-gesloten", { bubbles: true, composed: true }),
    );
    this._sluitSnapshot({ opslaan });
  }

  async _sluitSnapshot({ opslaan }) {
    try {
      await this._beheer.sluit({ opslaan });
    } catch (fout) {
      // De dialoog is al weg; er is niemand meer om het aan te tonen. De
      // opruimlus van SPEC 9.3.1 haalt een achtergebleven scene bij de
      // volgende reload alsnog weg.
      console.warn(
        `domotiapp-scene-editor: de snapshot kon niet worden ${
          opslaan ? "verwijderd" : "hersteld"
        }: ${fout?.message ?? fout}`,
      );
    }
  }

  /**
   * Wordt de editor losgekoppeld terwijl er een snapshot openstaat, dan telt
   * dat als Annuleren (SPEC 9.3).
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._snapshot && this._snapshot.heeftSnapshot) {
      this._sluitSnapshot({ opslaan: false });
    }
  }

  /**
   * Escape, de X en het wegklikken naast de dialoog komen allemaal hier
   * terecht. `closed` bubbelt en is composed, dus hij zou anders doorlopen naar
   * HA's eigen dialoogafhandeling.
   */
  _dialoogGesloten(event) {
    event.stopPropagation();
    this._sluit();
  }

  // ------------------------------------------------------------------------
  // Weergave
  // ------------------------------------------------------------------------

  _naam(entityId) {
    return (
      this.nameOverrides?.[entityId] ||
      this._stateVan(entityId)?.attributes?.friendly_name ||
      entityId
    );
  }

  render() {
    return html`
      <ha-dialog
        open
        .headerTitle=${"Scenes bewerken"}
        @closed=${this._dialoogGesloten}
      >
        ${this._renderInhoud()}
        <div slot="footer" class="acties">
          <ha-button
            appearance="plain"
            .disabled=${!this._kanVoorbeeld}
            @click=${this._voorbeeld}
          >
            Voorbeeld
          </ha-button>
          <ha-button @click=${() => this._sluit()}>Annuleren</ha-button>
          <ha-button .disabled=${!this._kanOpslaan} @click=${this._slaOp}>
            Opslaan
          </ha-button>
        </div>
      </ha-dialog>
    `;
  }

  _renderInhoud() {
    if (this._toestand === LADEN) {
      return html`<div class="inhoud">Bezig met laden…</div>`;
    }
    if (this._toestand === FOUT) {
      return html`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `;
    }

    return html`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map(
            (_scene, index) => html`
              <ha-tab-group-tab
                panel=${`scene-${index + 1}`}
                .active=${index === this._tab}
                @click=${() => this._kiesTab(index)}
              >
                Scene ${index + 1}
              </ha-tab-group-tab>
            `,
          )}
        </ha-tab-group>

        <dac-icon-picker
          .hass=${this.hass}
          label="Icoon van deze scene"
          fallback="een"
          .auto=${false}
          .value=${this._scenes[this._tab].icon}
          @value-changed=${(event) => this._zetIcoon(event.detail.value)}
        ></dac-icon-picker>

        ${this._melding
          ? html`<ha-alert alert-type="error">${this._melding}</ha-alert>`
          : nothing}
        ${this._leden.length === 0
          ? html`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`
          : html`<div class="lampen">
              ${this._leden.map((entityId) => this._renderLamp(entityId))}
            </div>`}
      </div>
    `;
  }

  _renderLamp(entityId) {
    const stateObj = this._stateVan(entityId);
    const kan = this._besturingVan(entityId);
    const waarde = this._waardeVan(entityId);
    // De schakelaarstand en de zichtbare besturingen komen uit dezelfde bron
    // als de opgeslagen waarde, zodat ze er nooit van kunnen afwijken.
    const aan = toonAan(waarde, stateObj, kan);
    const zichtbaar = zichtbareBesturingen(waarde, stateObj, kan);

    return html`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(entityId)}
              ${!kan.bekend
                ? html`<span class="hint">lamp niet gevonden</span>`
                : !kan.beschikbaar
                  ? html`<span class="hint">niet bereikbaar</span>`
                  : nothing}
            </span>
            ${isIngesteld(waarde)
              ? nothing
              : html`<span class="nieuw">nieuw</span>`}
          </div>
          ${kan.bekend
            ? html`
                <div class="bediening">
                  ${zichtbaar.kleurkeuze
                    ? this._renderKleurkeuze(
                        entityId,
                        stateObj,
                        kan,
                        waarde,
                        zichtbaar.stand,
                      )
                    : nothing}
                  <ha-switch
                    .checked=${aan}
                    @change=${(event) =>
                      this._zetLamp(
                        entityId,
                        metAanUit(waarde, event.target.checked, stateObj, kan),
                      )}
                  ></ha-switch>
                </div>
              `
            : nothing}
        </div>
        ${this._renderBesturing(entityId, stateObj, kan, waarde, zichtbaar)}
      </div>
    `;
  }

  /**
   * De regelaars, maar alleen die bij de huidige waarde horen.
   *
   * Een lamp op "uit" krijgt er geen: `state: "off"` heeft volgens SPEC 10.4
   * geen `brightness` en geen kleurattribuut, dus zou een zichtbare regelaar
   * een waarde tonen die nergens wordt opgeslagen.
   */
  _renderBesturing(entityId, stateObj, kan, waarde, zichtbaar) {
    return html`
      ${zichtbaar.helderheid
        ? this._renderHelderheid(entityId, stateObj, kan, waarde)
        : nothing}
      ${zichtbaar.kleurtemp
        ? this._renderKleurtemp(entityId, stateObj, kan, waarde)
        : nothing}
      ${zichtbaar.kleur
        ? this._renderKleur(entityId, stateObj, kan, waarde)
        : nothing}
    `;
  }

  /**
   * De helderheidsregelaar, volledig in procenten (SPEC 4.4).
   *
   * De regelaar zelf staat op 1..100 en niet op 1..255. Dat is niet cosmetisch:
   * `ha-control-slider` toont bij het slepen zijn eigen waarde in een tooltip,
   * en die kunnen we niet apart opmaken. Stond de regelaar op HA's schaal, dan
   * las de gebruiker "50 %" in het label en "127" in de tooltip — twee getallen
   * voor hetzelfde. De opslag blijft 0..255 (SPEC 10.4); `vanProcent` zit
   * ertussen.
   */
  _renderHelderheid(entityId, stateObj, kan, waarde) {
    const procent = alsProcent(toonHelderheid(waarde, stateObj, kan));
    const zet = (event) => {
      event.stopPropagation();
      this._zetLamp(
        entityId,
        metHelderheid(
          this._waardeVan(entityId),
          vanProcent(event.detail.value),
          stateObj,
          kan,
        ),
      );
    };

    return html`
      <div class="besturing">
        <div class="label">
          <span>Helderheid</span><span>${procent} %</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          unit="%"
          .min=${MIN_PROCENT}
          .max=${MAX_PROCENT}
          .step=${1}
          .value=${procent}
          @slider-moved=${zet}
          @value-changed=${zet}
        ></ha-control-slider>
      </div>
    `;
  }

  /**
   * De twee keuzeknoppen "Kleur" en "Wit" (SPEC 6.5).
   *
   * Ze staan er alleen bij een lamp die allebei kan. Bij een lamp die er één
   * kan valt er niets te kiezen, en zou een knop suggereren dat de lamp iets
   * kan wat hij niet kan.
   *
   * De knoppen zetten geen eigen state: de actieve stand volgt uit de
   * opgeslagen waarde, en wisselen schrijft die waarde om. Daardoor kan er geen
   * verschil ontstaan tussen wat de knop toont en wat er wordt opgeslagen.
   */
  _renderKleurkeuze(entityId, stateObj, kan, waarde, stand) {
    const wissel = (nieuw) => (event) => {
      event.stopPropagation();
      if (nieuw === stand) {
        return;
      }
      this._zetLamp(
        entityId,
        metKleurstand(this._waardeVan(entityId), nieuw, stateObj, kan),
      );
    };

    return html`
      <div class="kleurkeuze">
        <button
          class="keuze ${stand === STAND_KLEUR ? "actief" : ""}"
          aria-pressed=${stand === STAND_KLEUR ? "true" : "false"}
          @click=${wissel(STAND_KLEUR)}
        >
          Kleur
        </button>
        <button
          class="keuze ${stand === STAND_WIT ? "actief" : ""}"
          aria-pressed=${stand === STAND_WIT ? "true" : "false"}
          @click=${wissel(STAND_WIT)}
        >
          Wit
        </button>
      </div>
    `;
  }

  _renderKleurtemp(entityId, stateObj, kan, waarde) {
    const kelvin = toonKelvin(waarde, stateObj, kan);
    const zet = (event) => {
      event.stopPropagation();
      this._zetLamp(
        entityId,
        metKleurtemp(this._waardeVan(entityId), event.detail.value, stateObj, kan),
      );
    };

    return html`
      <div class="besturing">
        <div class="label">
          <span>Kleurtemperatuur</span><span>${kelvin} K</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          mode="cursor"
          .min=${kan.minKelvin}
          .max=${kan.maxKelvin}
          .step=${1}
          .value=${kelvin}
          style=${`--control-slider-background: ${kelvinVerloop(kan.minKelvin, kan.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${zet}
          @value-changed=${zet}
        ></ha-control-slider>
      </div>
    `;
  }

  _renderKleur(entityId, stateObj, kan, waarde) {
    const [tint, verzadiging] = toonHs(waarde, stateObj, kan);
    const zet = (nieuw) => (event) => {
      event.stopPropagation();
      const huidig = toonHs(this._waardeVan(entityId), stateObj, kan);
      const hs = nieuw === "tint"
        ? [event.detail.value, huidig[1]]
        : [huidig[0], event.detail.value];
      this._zetLamp(
        entityId,
        metKleur(this._waardeVan(entityId), hs, stateObj, kan),
      );
    };

    return html`
      <div class="besturing">
        <div class="label">
          <span>Kleur</span><span>${tint}° / ${verzadiging} %</span>
        </div>
        <div class="kleurregelaars">
          <div class="schuiven">
            <ha-control-slider
              touch-action="pan-y"
              mode="cursor"
              .min=${0}
              .max=${360}
              .step=${1}
              .value=${tint}
              style=${`--control-slider-background: ${TINTVERLOOP}; --control-slider-background-opacity: 1`}
              @slider-moved=${zet("tint")}
              @value-changed=${zet("tint")}
            ></ha-control-slider>
            <ha-control-slider
              touch-action="pan-y"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${verzadiging}
              style=${`--control-slider-color: hsl(${tint}, 100%, 50%)`}
              @slider-moved=${zet("verzadiging")}
              @value-changed=${zet("verzadiging")}
            ></ha-control-slider>
          </div>
          <div
            class="staal"
            style=${`background: hsl(${tint}, ${verzadiging}%, 50%)`}
          ></div>
        </div>
      </div>
    `;
  }
}
