/**
 * De vormtaal van de familie, in een vorm die lit kan gebruiken.
 *
 * De kaarten in `src/cards` zijn framework-vrij en zetten `theme.js` met een
 * constructable stylesheet in hun shadow root. De scenekaart draait op lit en
 * doet dat met `static styles`. Twee routes, één bron: dit bestand giet dezelfde
 * tokens en dezelfde basisregels in een lit-`css`.
 *
 * `unsafeCSS` is hier niet onveilig. Het argument is geen gebruikersinvoer maar
 * een constante uit ons eigen themabestand; lit vraagt er alleen om omdat het
 * niet kan zien waar een string vandaan komt.
 */

import { css, unsafeCSS } from "lit";

import { baseCss, themaCss, tokens } from "../theme.js";
import { meetOpnieuw, volgThema } from "../thema.js";
import { volgTaal, zieHass } from "../taal.js";

export const vormtaal = css`
  ${unsafeCSS(themaCss)}
  :host {
    ${unsafeCSS(tokens)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${unsafeCSS(baseCss)}
`;

/**
 * Laat een lit-element het lichte of donkere thema volgen.
 *
 * Hetzelfde als wat `DacCard` in base.js voor de andere kaarten doet: het
 * attribuut `dac-thema` zetten zodra het element in de pagina hangt, en
 * opnieuw meten als Home Assistant van thema wisselt.
 *
 * `alleenMeten` is voor een editor in een dialoog van Home Assistant zelf.
 * Die dialoog volgt het thema van Home Assistant en niet onze instelling.
 */
export const MetThema = (Basis, opties) =>
  class extends Basis {
    connectedCallback() {
      super.connectedCallback();
      this._themaLos = volgThema(this, opties);
      // De taal (sinds 0.81.0): een Lit-element tekent zijn tekst bij elke
      // render, dus opnieuw renderen is genoeg.
      this._taalLos = volgTaal(() => this.requestUpdate());
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._themaLos?.();
      this._themaLos = null;
      this._taalLos?.();
      this._taalLos = null;
    }

    // `update` en niet `updated`: de kaarten overschrijven `updated` zonder
    // de basisklasse aan te roepen, en dan zou dit stil niet draaien.
    update(gewijzigd) {
      // Vóór het renderen, zodat de eerste render al in de goede taal staat.
      zieHass(this.hass);
      super.update(gewijzigd);
      const oud = gewijzigd?.get?.("hass");
      if (oud && oud.themes !== this.hass?.themes) meetOpnieuw(this);
    }

    themaGewisseld_() {
      this.requestUpdate();
    }
  };
