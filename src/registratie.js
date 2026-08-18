/**
 * Eén wachtlus voor de hele bundel.
 *
 * ## Waarom dit er is, en waarom `customElements.define` nergens anders staat
 *
 * Deze bundel wordt door de integratie in `index.html` geïmporteerd, náást de
 * `import()` van Home Assistants eigen app. Welke van die twee als eerste klaar
 * is, is een race. HA draait `@webcomponents/scoped-custom-element-registry`:
 * die polyfill vervangt `window.customElements` en zijn `get` leest uitsluitend
 * de eigen Map, zonder terugval op de browserregistry. Winnen wij die race, dan
 * landen onze kaarten in de nátive registry en zijn ze daarna onzichtbaar voor
 * Home Assistant -- zonder fout en zonder log, met alleen "Configuratiefout" op
 * elk dashboard en een kaartkiezer die blijft laden.
 *
 * De kaartenfamilie kwam hier vandaan als losse Lovelace-resource. Die route
 * laadt later en heeft dit probleem niet, dus stond er gewoon een
 * `customElements.define` per kaart. In een integratie is dat niet meer veilig,
 * en daarom is dit het enige bestand in de bundel dat definieert: elke kaart
 * meldt zich hier aan, en er staat één wachtlus voor allemaal.
 *
 * `window.customCards` is een gewone array en heeft met de registry niets te
 * maken. Die vullen we wél meteen, zodat de kaarten in de kiezer staan ook als
 * het registreren nog even duurt.
 *
 * De wachtlus zelf staat in `scene/registreer.js` -- zonder imports en zonder
 * DOM, zodat hij in een gewone Node-test met nagebootste registry's te toetsen
 * is. Zie ook `scripts/check-registratie.mjs`, dat bewaakt dat er nergens
 * anders gedefinieerd wordt.
 */

import { registreerWanneerGereed } from "./scene/registreer.js";

/** Wat er gedefinieerd moet worden zodra de frontend van HA er is. */
const wachtrij = [];

/** Zet een element in de wachtrij. Definieert niets: dat doet `start()`. */
export function meldAan(tag, cls) {
  wachtrij.push([tag, cls]);
}

/** Zet een kaart in de kaartkiezer. Dat mag wél meteen. */
export function meldInKiezer({ type, name, description, preview = true, documentationURL }) {
  window.customCards = window.customCards ?? [];
  if (window.customCards.some((kaart) => kaart.type === type)) return;
  window.customCards.push({
    type,
    name: name ?? type,
    description: description ?? "",
    preview,
    documentationURL: documentationURL ?? "https://github.com/Sven2410/domotiapp-lovelace",
  });
}

/**
 * Start de wachtlus. Eén keer, aan het eind van de entry.
 *
 * Draait op modulescope en mag daarom nooit gooien: een fout hier zou de rest
 * van de bundel meeslepen en dan verschijnt er geen enkele kaart.
 */
export function startRegistratie(waarschuw = () => {}) {
  registreerWanneerGereed({
    leesRegistry: () => globalThis.customElements,
    definities: wachtrij,
    waarschuw,
  });
}
