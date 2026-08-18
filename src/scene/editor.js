/**
 * De kaart-config-editor (SPEC 12.2).
 *
 * Gebouwd met `ha-form` op een schema, niet met handgeschreven `innerHTML`.
 * Daarmee is INVENTARIS punt (f) structureel afgesloten: er is geen enkele
 * plek meer waar een door de gebruiker getypte naam in een HTML-string
 * belandt.
 */
import { LitElement, css, html, nothing } from "lit";

import { vormtaal } from "./vormtaal.js";

const ATTR_LEDEN = "entity_id";

export class DomotiappSceneCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _getypt: { state: true },
  };

  constructor() {
    super();
    // Wat de gebruiker letterlijk in de naamvelden heeft staan, ongetrimd.
    //
    // Dit veld bestaat om een concrete fout te voorkomen die in fase 4b-1 aan
    // het licht kwam: het formulier is een *controlled input*. Zou `data` de
    // getrimde waarde uit de config krijgen, dan schrijft `ha-form` bij elke
    // toetsaanslag die getrimde waarde terug in het veld — en dan verdwijnt een
    // spatie op het moment dat je hem typt. "Bed links" werd zo "Bedlinks".
    //
    // De config krijgt nog steeds de getrimde waarde; alleen wat er tijdens het
    // typen in het veld staat komt hiervandaan.
    this._getypt = {};
  }

  static styles = [
    vormtaal,
    css`
      .namen {
        margin-top: 16px;
      }
      .kop {
        font-size: 13.5px;
        font-weight: 500;
        color: var(--dac-ink);
        margin-bottom: 4px;
      }
      .uitleg {
        font-size: 12px;
        line-height: 1.45;
        color: var(--dac-ink-2);
        margin-bottom: 8px;
      }
    `,
  ];

  setConfig(config) {
    this._config = { ...config };
  }

  /** Alle light-entiteiten die zich als groep gedragen (SPEC 12.2 punt 1). */
  _lichtgroepen() {
    const states = this.hass?.states ?? {};
    return Object.keys(states).filter(
      (entityId) =>
        entityId.startsWith("light.") &&
        Array.isArray(states[entityId].attributes?.[ATTR_LEDEN]),
    );
  }

  _leden() {
    const entityId = this._config?.entity;
    const leden = this.hass?.states?.[entityId]?.attributes?.[ATTR_LEDEN];
    if (!Array.isArray(leden)) {
      return [];
    }
    // De groep zelf hoort niet in zijn eigen lijst (SPEC 5.2).
    return leden.filter((lid) => lid !== entityId);
  }

  _entiteitSchema() {
    const groepen = this._lichtgroepen();
    return [
      {
        name: "entity",
        required: true,
        // Alleen light groups, zodat een admin niet per ongeluk een losse lamp
        // kiest. Zonder groepen valt de kiezer terug op het hele light-domein,
        // anders zou hij leeg zijn en lijkt de kaart stuk.
        selector: groepen.length
          ? { entity: { include_entities: groepen } }
          : { entity: { domain: "light" } },
      },
    ];
  }

  _namenSchema(leden) {
    return leden.map((entityId) => ({
      name: entityId,
      selector: { text: {} },
    }));
  }

  /**
   * Wat er in de naamvelden hoort te staan.
   *
   * Voor een veld waar deze sessie in getypt is telt wat er getypt is; voor de
   * rest wat er in de config staat. Zo schrijft het formulier nooit iets terug
   * over wat de gebruiker op dit moment aan het typen is.
   */
  _naamData(leden) {
    const overrides = this._config?.name_overrides ?? {};
    const data = {};
    for (const entityId of leden) {
      if (entityId in this._getypt) {
        data[entityId] = this._getypt[entityId];
      } else if (overrides[entityId]) {
        data[entityId] = overrides[entityId];
      }
    }
    return data;
  }

  _friendlyName(entityId) {
    return (
      this.hass?.states?.[entityId]?.attributes?.friendly_name || entityId
    );
  }

  _label = (schema) => {
    if (schema.name === "entity") {
      return "Lichtgroep";
    }
    return this._friendlyName(schema.name);
  };

  _helper = (schema) => {
    if (schema.name === "entity") {
      return "De lichtgroep waarvan deze kaart de scenes beheert.";
    }
    return schema.name;
  };

  _entiteitGewijzigd(event) {
    event.stopPropagation();
    const nieuw = { ...this._config, entity: event.detail.value.entity };

    // Van groep gewisseld: overschrijvingen die bij de oude groep hoorden
    // zouden anders stil blijven staan.
    if (nieuw.entity !== this._config?.entity) {
      delete nieuw.name_overrides;
      this._getypt = {};
    }
    this._stuurDoor(nieuw);
  }

  _namenGewijzigd(event) {
    event.stopPropagation();

    // Eerst letterlijk onthouden wat er staat; dat is wat het veld terugkrijgt.
    this._getypt = { ...this._getypt, ...event.detail.value };

    const overrides = {};
    for (const [entityId, waarde] of Object.entries(this._getypt)) {
      // Leeg laten betekent geen override; er komt dan ook geen sleutel in
      // name_overrides (SPEC 12.2 punt 2). De config krijgt de getrimde
      // waarde, het veld niet — zie de opmerking bij `_getypt`.
      if (typeof waarde === "string" && waarde.trim()) {
        overrides[entityId] = waarde.trim();
      }
    }

    const nieuw = { ...this._config };
    if (Object.keys(overrides).length) {
      nieuw.name_overrides = overrides;
    } else {
      delete nieuw.name_overrides;
    }
    this._stuurDoor(nieuw);
  }

  _stuurDoor(config) {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const leden = this._leden();

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ entity: this._config.entity ?? "" }}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${leden.length
        ? html`
            <div class="namen">
              <div class="kop">Namen van de lampen</div>
              <div class="uitleg">
                Laat een veld leeg om de naam uit Home Assistant te gebruiken.
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._naamData(leden)}
                .schema=${this._namenSchema(leden)}
                .computeLabel=${this._label}
                .computeHelper=${this._helper}
                @value-changed=${this._namenGewijzigd}
              ></ha-form>
            </div>
          `
        : nothing}
    `;
  }
}
