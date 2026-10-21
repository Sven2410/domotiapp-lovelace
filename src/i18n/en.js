/**
 * Het Engels van de kaarten (sinds 0.81.0): de Nederlandse zin als sleutel, de
 * Engelse als waarde. Per groep kaarten een eigen bestand in en/, zodat ze
 * naast elkaar te vullen zijn. Een zin die in twee delen voorkomt moet daar
 * hetzelfde vertaald zijn; `npm run check:taal` kijkt dat na. Schrijfwijze en
 * woordenlijst: docs/taal.md.
 */

import { ALGEMEEN } from "./en/algemeen.js";
import { BATTERIJ } from "./en/batterij.js";
import { COACH } from "./en/coach.js";
import { PROGRAMMA } from "./en/programma.js";

/** De delen apart, voor de toets die kijkt of een zin overal hetzelfde vertaald is. */
export const DELEN = { ALGEMEEN, COACH, BATTERIJ, PROGRAMMA };

export const EN = Object.assign({}, ...Object.values(DELEN));
