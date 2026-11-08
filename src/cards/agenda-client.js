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

/** Deze afspraak weghalen. Bij een herhalende alleen deze keer. */
export const haalAfspraakWeg = (hass, a) =>
  stuur(hass, {
    type: "calendar/event/delete",
    entity_id: a.agenda,
    uid: a.uid,
    ...(a.recurrence_id ? { recurrence_id: a.recurrence_id } : {}),
  });

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
