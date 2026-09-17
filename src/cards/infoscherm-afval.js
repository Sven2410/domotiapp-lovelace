/**
 * De afvalkalender van het infoscherm.
 *
 * Apart van `infoscherm-logica.js`, en dat is geen willekeur: dat bestand heeft
 * met opzet GEEN imports -- het is pure rekenkunde die in een gewone Node-test
 * draait zonder dat er iets uit de DOM of uit Home Assistant bij komt kijken.
 * Deze module leunt wel op `ha.js` (voor het lezen van een datum) en op
 * `afval-namen.js` (voor het inkorten), dus hij hoort hier en niet daar.
 *
 * Gevraagd op 17 september 2026: *"Ook wil ik een afvalkalender tablat hebben
 * zodat de beheerder die ook kan toevoegen op het kiosk scherm."*
 *
 * De sensoren komen uit de INSTALLATIE (de kaartconfig van het beheer), net als
 * de lampen en de agenda's: het zijn entiteiten, en die kiest de installateur.
 * Of het blok op het scherm staat en waar, bepaalt de receptie met de indeling.
 */

import { daysBetween, parseDate, relativeDay, startOfDay } from "../ha.js";
import { korteNamen } from "./afval-namen.js";

/**
 * De afvalkalender: welke bak wanneer aan straat moet.
 *
 * Gevraagd op 17 september 2026: *"Ook wil ik een afvalkalender tablat hebben
 * zodat de beheerder die ook kan toevoegen op het kiosk scherm."*
 *
 * De datum komt op dezelfde manier uit de sensor als op de afvalkaart, en dat
 * is met opzet: die leest de toestand én drie attributen, omdat integraties de
 * datum op verschillende plekken zetten -- `Year_month_day_date` is die van
 * Afvalbeheer, die zo'n dertig gemeenten bedient. Een tweede lezing bouwen zou
 * betekenen dat een bak op de kaart wél en op het scherm niet verschijnt.
 *
 * Wat er UIT komt is op datum gesorteerd, met wat er al geweest is achteraan.
 * Een sensor die niets bruikbaars zegt verdwijnt niet maar krijgt een reden:
 * een lege plek in een rij van vier bakken leest als kapot.
 *
 * @param {Array<string>} entiteiten
 * @param {(id: string) => {state: string, attributes: object}|undefined} lees
 * @param {(id: string) => string} naamVan
 * @param {Date} nu
 */
export function afvalLijst(entiteiten, lees, naamVan, nu = new Date()) {
  const vandaag = startOfDay(nu);
  const ruw = (entiteiten ?? []).map((id) => {
    const st = lees(id);
    const datum = st
      ? parseDate(st.state) ??
        parseDate(st.attributes?.date) ??
        parseDate(st.attributes?.next_date) ??
        parseDate(st.attributes?.Year_month_day_date)
      : null;
    return { id, st, datum };
  });

  const vol = ruw.map((r) => naamVan(r.id));
  const kort = korteNamen(vol);

  return ruw
    .map((r, i) => {
      const dagen = r.datum ? daysBetween(vandaag, r.datum) : null;
      return {
        id: r.id,
        naam: kort[i] || vol[i] || r.id,
        datum: r.datum,
        dagen,
        reden: !r.st ? "bestaat niet" : !r.datum ? "geen datum" : dagen < 0 ? "voorbij" : null,
      };
    })
    .sort((a, b) => {
      if (!a.reden && !b.reden) return a.datum - b.datum;
      if (!a.reden) return -1;
      if (!b.reden) return 1;
      return a.naam.localeCompare(b.naam);
    });
}

/** Alleen wat er nog komt. */
export const afvalKomend = (lijst) => (lijst ?? []).filter((r) => !r.reden);

/**
 * Wanneer een bak aan straat moet, in woorden.
 *
 * "Vandaag" en "morgen" zijn de enige twee die ertoe doen op een scherm in een
 * wachtruimte; daarna is het een dag en een datum. `relativeDay` in ha.js doet
 * hetzelfde voor de afvalkaart, en die blijft de bron.
 */
export function afvalWanneer(rij, nu = new Date()) {
  if (!rij || rij.reden) return "";
  return relativeDay(rij.datum, nu);
}

