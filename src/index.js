/**
 * DomotiApp Lovelace -- de hele familie in één bundel.
 *
 * Dit is de bron-entry. Wat Home Assistant laadt is
 * `custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js`, één
 * gebundeld bestand dat hieruit gebouwd wordt en meegecommit staat, want HACS
 * levert wat er in de repo staat.
 *
 * ## Waarom dit een integratie is en geen losse kaartresource
 *
 * De kaartenfamilie kan prima als losse resource. De scenekaart niet: die legt
 * per lichtgroep drie scenes vast, en dat moet aan de serverkant bewaard worden
 * -- anders hangen de scenes aan het dashboard in plaats van aan de kamer, zijn
 * ze weg zodra je de kaart verplaatst, en kan alleen een beheerder ze nog
 * instellen. Daar is Python voor nodig, en dus een integratie. Nu die er toch
 * is, meldt hij de bundel ook zelf aan bij de frontend: geen resource-regel meer
 * die met de hand toegevoegd moet worden.
 *
 * ## Twee families in één bundel
 *
 * De kaarten zijn framework-vrij (`DacCard` in base.js); de scenekaart draait op
 * lit. Dat is met opzet zo gelaten: die kaart is een werkend product met eigen
 * tests, en er is geen enkele reden om zijn logica te herschrijven om aan een
 * andere basisklasse te voldoen. Alleen zijn uiterlijk is gelijkgetrokken met de
 * rest. Wat ze wél delen is de vormtaal uit theme.js en één registratielus.
 *
 * Een kaart erbij? Schrijf hem in `src/cards` en importeer hem hieronder.
 * Registreren doet elke kaart zelf, naast de klasse die hij registreert.
 */

export const VERSION = __CARD_VERSION__;

import "./cards/header-card.js";
import "./cards/separator-card.js";
import "./cards/button-card.js";
import "./cards/light-card.js";
import "./cards/climate-card.js";
import "./cards/entities-card.js";
import "./cards/media-card.js";
import "./cards/cover-card.js";
import "./cards/person-card.js";
import "./cards/waste-card.js";
import "./scene/scene-card.js";
import "./alarm/alarm-card.js";

import { startRegistratie } from "./registratie.js";

// Pas hier, als alle kaarten zich hebben aangemeld: één wachtlus voor de hele
// bundel in plaats van tien.
startRegistratie((bericht) => console.warn(`domotiapp-lovelace: ${bericht}`));

// Eén regel, één keer. Een bundel die niets zegt is een bundel die je niet kunt
// onderscheiden van een bundel die niet geladen is.
console.info(
  `%c DOMOTIAPP-LOVELACE %c ${VERSION} `,
  "background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px",
  "background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px"
);
