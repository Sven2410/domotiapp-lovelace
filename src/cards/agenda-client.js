/**
 * De agendakaart en de server: afspraken via Home Assistant zelf, agenda's toevoegen via onze integratie (agenda.py).
 *
 * Een afspraak maken, wijzigen of weghalen mag in Home Assistant elke ingelogde gebruiker, dus daarvoor gaan de commando's
 * van Home Assistant zelf. Een agenda toevoegen is een integratie, en dat doet onze server namens de klant.
 */

import { BlijvendAbonnement } from "../herkansing.js";

const PREFIX = "domotiapp_lovelace/agenda";

const stuur = (hass, bericht) => hass.connection.sendMessagePromise(bericht);

/** Een nieuwe afspraak in deze agenda. `event` komt uit `afspraakUit`. */
export const maakAfspraak = (hass, entity, event) => stuur(hass, { type: "calendar/event/create", entity_id: entity, event });

/** Deze afspraak wijzigen. Bij een herhalende alleen deze keer. */
export const wijzigAfspraak = (hass, a, event) =>
  stuur(hass, {
    type: "calendar/event/update",
    entity_id: a.agenda,
    uid: a.uid,
    ...(a.recurrence_id ? { recurrence_id: a.recurrence_id } : {}),
    event,
  });

/** Een afspraak in een CalDAV-agenda (iCloud) wijzigen: dat doet onze server, Home Assistant kan het daar niet. */
export const wijzigViaServer = (hass, a, event) => stuur(hass, { type: `${PREFIX}/caldav_wijzig`, entity_id: a.agenda, uid: a.uid, event });

/** Een afspraak uit een CalDAV-agenda (iCloud) weghalen, via onze server. */
export const haalWegViaServer = (hass, a) => stuur(hass, { type: `${PREFIX}/caldav_weg`, entity_id: a.agenda, uid: a.uid });

/** Deze afspraak weghalen. Bij een herhalende alleen deze keer. */
export const haalAfspraakWeg = (hass, a) =>
  stuur(hass, {
    type: "calendar/event/delete",
    entity_id: a.agenda,
    uid: a.uid,
    ...(a.recurrence_id ? { recurrence_id: a.recurrence_id } : {}),
  });

const GEWIJZIGD = "domotiapp-agenda-gewijzigd";

/** Een tweede keer ophalen, voor de zekerheid; zie `bijWijziging`. */
const NOG_EENS_MS = 4000;

/** Het scherm meldt het na maken, wijzigen of weghalen; `agenda` is de entiteit. */
export const meldGewijzigd = (agenda) => window.dispatchEvent(new CustomEvent(GEWIJZIGD, { detail: { agenda } }));

/**
 * Na maken, wijzigen of weghalen in het scherm: `fn(agenda)` meteen, en na vier tellen nog een keer. Geeft de functie om te
 * stoppen.
 *
 * De eigenaar, 9 november 2026: "als ik test er in heb gezet moet ik de webpagina vernieuwen om hem er in te laten zien".
 * `calendar/event/subscribe` stuurt pas iets als de agenda zijn toestand opnieuw schrijft. Een Lokale agenda doet dat na
 * een wijziging, CalDAV (iCloud) niet: die haalt elke vijftien minuten op (`caldav/coordinator.py`, Home Assistant 2026.8).
 * Opnieuw abonneren vraagt de afspraken wel meteen bij iCloud op. De tweede keer is voor een server die een nieuwe afspraak
 * niet meteen teruggeeft; dat is niet gemeten, het kost alleen een extra vraag.
 */
export function bijWijziging(fn) {
  const klokken = new Set();
  const luister = (e) => {
    const agenda = e.detail?.agenda ?? null;
    fn(agenda);
    const klok = setTimeout(() => {
      klokken.delete(klok);
      fn(agenda);
    }, NOG_EENS_MS);
    klokken.add(klok);
  };
  window.addEventListener(GEWIJZIGD, luister);
  return () => {
    window.removeEventListener(GEWIJZIGD, luister);
    for (const klok of klokken) clearTimeout(klok);
  };
}

/** Een agenda toevoegen: `nieuw` (naam), `google` (naam, adres) of `apple` (gebruiker, wachtwoord). */
export const voegAgendaToe = (hass, soort, gegevens) => stuur(hass, { type: `${PREFIX}/toevoegen`, soort, ...gegevens });

/** Een agenda die via de kaart kwam weer weghalen. */
export const haalAgendaWeg = (hass, entryId) => stuur(hass, { type: `${PREFIX}/weg`, entry_id: entryId });

/** Wat de klant via de kaart toevoegde, live. `cb` krijgt de lijst `[{entry_id, soort, naam, gemaakt, entiteiten}]`. */
export class ToegevoegdAbonnement extends BlijvendAbonnement {
  constructor(cb) {
    super({ type: `${PREFIX}/subscribe` }, (bericht) => cb(Array.isArray(bericht?.agendas) ? bericht.agendas : []));
  }
}
