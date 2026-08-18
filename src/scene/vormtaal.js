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

import { baseCss, tokens } from "../theme.js";

export const vormtaal = css`
  :host {
    ${unsafeCSS(tokens)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${unsafeCSS(baseCss)}
`;
