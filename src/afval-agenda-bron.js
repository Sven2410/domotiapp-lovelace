/**
 * De afspraken van de afvalagenda's van één kaart, live (0.136.0). Zie de kop van `cards/afval-agenda.js`.
 *
 * Per agenda een `AgendaAbonnement` van vandaag tot `AGENDA_VOORUIT_DAGEN` verder. Home Assistant stuurt een nieuwe
 * lijst zodra de agenda iets wegschrijft, dus een ophaling die beheer of de receptie in de agenda zet, staat er meteen.
 * Na middernacht opnieuw, met de nieuwe dag; na een herverbinding ook (de kaart geeft dan `opnieuw` mee).
 */

import { AgendaAbonnement } from "./infoscherm-client.js";
import { naarWand, vanWand } from "./wandklok.js";
import { AGENDA_VOORUIT_DAGEN, bakkenUit, isAgenda, soortenOp, staatVan } from "./cards/afval-agenda.js";

export class AfvalAgendaBron {
  /** @param {Function} bijWijziging  na elke nieuwe lijst afspraken */
  constructor(bijWijziging) {
    this.cb_ = bijWijziging;
    this.abos_ = new Map();
    this.events_ = new Map();
    this.sleutel_ = "";
    this.tz_ = undefined;
  }

  /**
   * Volg de agenda's tussen `ids` (de rest wordt overgeslagen). Mag bij elke `hass`: er gebeurt alleen iets als de
   * agenda's of de dag veranderen, of met `opnieuw`.
   */
  volg(hass, ids, opnieuw = false) {
    const tz = hass?.config?.time_zone;
    const agendas = [...new Set((ids ?? []).filter(isAgenda))];
    const nu = naarWand(new Date(), tz);
    const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    const sleutel = `${agendas.join(",")}|${+vandaag}`;
    if (sleutel === this.sleutel_ && !opnieuw) return;
    this.sleutel_ = sleutel;
    this.tz_ = tz;
    this.zegOp_();
    for (const a of [...this.events_.keys()]) if (!agendas.includes(a)) this.events_.delete(a);
    if (!agendas.length) return;
    const van = vanWand(vandaag, tz);
    const tot = vanWand(new Date(vandaag.getFullYear(), vandaag.getMonth(), vandaag.getDate() + AGENDA_VOORUIT_DAGEN), tz);
    for (const agenda of agendas) {
      const abo = new AgendaAbonnement(agenda, van, tot, (events) => {
        if (this.abos_.get(agenda) !== abo) return;
        this.events_.set(agenda, events ?? []);
        this.cb_();
      });
      this.abos_.set(agenda, abo);
      abo.start(hass);
    }
  }

  /** Per agenda de bakken (`bakkenUit`), voor de agenda's waarvan de afspraken binnen zijn. */
  bakken(nu = new Date()) {
    const uit = new Map();
    for (const [agenda, events] of this.events_) uit.set(agenda, bakkenUit(agenda, events, this.tz_, nu));
    return uit;
  }

  /** De nagebootste toestand van elke bak, op id. */
  staten(nu = new Date()) {
    const uit = new Map();
    for (const bakken of this.bakken(nu).values()) for (const b of bakken) uit.set(b.id, staatVan(b));
    return uit;
  }

  /** Wat deze agenda op `dag` ophaalt, als toestand van een sensor ("Papier, Restafval"); null als nog niet binnen. */
  soortenOp(agenda, dag) {
    const events = this.events_.get(agenda);
    return events ? soortenOp(events, this.tz_, dag) : null;
  }

  stop() {
    this.zegOp_();
    this.sleutel_ = "";
  }

  zegOp_() {
    for (const abo of this.abos_.values()) abo.stop();
    this.abos_.clear();
  }
}
