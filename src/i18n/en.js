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
import { ENTITEITEN } from "./en/entiteiten.js";
import { SCENE } from "./en/scene.js";
import { KLIMAAT } from "./en/klimaat.js";
import { MEDIA } from "./en/media.js";
import { INDELING } from "./en/indeling.js";
import { MELDINGEN } from "./en/meldingen.js";
import { GEDEELD } from "./en/gedeeld.js";
import { CAMERA } from "./en/camera.js";
import { APPARATEN } from "./en/apparaten.js";
import { APPARATUUR } from "./en/apparatuur.js";
import { WEKKER } from "./en/wekker.js";
import { INFOSCHERM } from "./en/infoscherm.js";
import { BEHEER } from "./en/beheer.js";
import { AUTOMATISERING } from "./en/automatisering.js";
import { WEERSTATION } from "./en/weerstation.js";

/** De delen apart, voor de toets die kijkt of een zin overal hetzelfde vertaald is. */
export const DELEN = { ALGEMEEN, COACH, BATTERIJ, PROGRAMMA, ENTITEITEN, SCENE, KLIMAAT, MEDIA, INDELING, MELDINGEN, GEDEELD, CAMERA, APPARATEN, APPARATUUR, WEKKER, INFOSCHERM, BEHEER, AUTOMATISERING, WEERSTATION };

export const EN = Object.assign({}, ...Object.values(DELEN));
