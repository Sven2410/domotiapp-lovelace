/**
 * Een agenda als afvalbron (0.136.0): uit de afspraken per soort een "bak".
 *
 * Een bedrijf krijgt van zijn verwerker vaak geen huishoudkalender, wel een pdf
 * met de ophaaldagen. Beheer zet die in een Lokale agenda, met elke ophaling als
 * afspraak voor de hele dag en de soort als titel ("Restafval", "Papier"). Een
 * `calendar.*` mag daarom overal staan waar een afvalsensor staat: op de
 * afvalkaart, op het infoscherm en op de meldingenkaart.
 *
 * Die drie lezen een sensor per bak, met een datum als toestand. Een agenda wordt
 * hier dus uitgevouwen tot zulke bakken: per soort de eerstvolgende ophaling,
 * als een nagebootste toestand onder een eigen id (`calendar.afval#papier`). Zo
 * blijft de rest van elke kaart (sorteren, inkorten, kleur op de naam, "geen
 * datum") precies zoals bij een sensor. De soort komt uit de titel met dezelfde
 * regels als een toestand (`afvalSoorten`), en die staan ook op de server
 * (`meldingen/afval.py`, `uit_titels`).
 *
 * Alleen pure functies, zonder DOM, voor een gewone Node-test. Het abonneren doet
 * `afval-agenda-bron.js`.
 */

import { naarWand } from "../wandklok.js";
import { afvalSoorten } from "./meldingen-logica.js";

/** Hoe ver vooruit de kaarten kijken. Een gemeente haalt elke soort minstens eens in de acht weken op. */
export const AGENDA_VOORUIT_DAGEN = 62;

export const isAgenda = (id) => typeof id === "string" && id.startsWith("calendar.") && !id.includes("#");

/** Het id van de bak van deze soort in deze agenda. */
export const bakId = (agenda, soort) => `${agenda}#${String(soort).toLowerCase()}`;

const dagBegin = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** De dag waarop een afspraak begint, als lokale middernacht in de tijd van Home Assistant. */
function dagVan(waarde, tz) {
  const s = String(waarde ?? "");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : dagBegin(naarWand(d, tz));
}

/**
 * De ophalingen in een bericht van `calendar/event/subscribe`: `[{dag, soorten}]`, op dag.
 * Een afspraak zonder soort in de titel telt niet.
 */
export function ophalingen(events, tz) {
  return (events ?? [])
    .map((ev) => ({ dag: dagVan(ev?.start, tz), soorten: afvalSoorten(ev?.summary) }))
    .filter((o) => o.dag && o.soorten.length)
    .sort((a, b) => a.dag - b.dag);
}

/**
 * Per soort de eerstvolgende ophaling vanaf vandaag: `[{id, soort, datum}]`, op datum.
 * `nu` is de klok waarmee de kaart rekent.
 */
export function bakkenUit(agenda, events, tz, nu = new Date()) {
  const vandaag = dagBegin(nu);
  const per = new Map();
  for (const o of ophalingen(events, tz)) {
    if (o.dag < vandaag) continue;
    for (const soort of o.soorten) {
      const sleutel = soort.toLowerCase();
      if (!per.has(sleutel)) per.set(sleutel, { id: bakId(agenda, soort), soort, datum: o.dag });
    }
  }
  return [...per.values()];
}

/** De soorten die op `dag` opgehaald worden, als toestand van een sensor: "Papier, Restafval", of "". */
export function soortenOp(events, tz, dag) {
  const doel = +dagBegin(dag);
  const uit = [];
  for (const o of ophalingen(events, tz)) {
    if (+o.dag !== doel) continue;
    for (const soort of o.soorten) if (!uit.includes(soort)) uit.push(soort);
  }
  return uit.join(", ");
}

const twee = (n) => String(n).padStart(2, "0");

/** De nagebootste toestand van een bak, zoals een afvalsensor met een datum hem zou hebben. */
export const staatVan = (bak) => ({
  entity_id: bak.id,
  state: `${bak.datum.getFullYear()}-${twee(bak.datum.getMonth() + 1)}-${twee(bak.datum.getDate())}`,
  attributes: { friendly_name: bak.soort },
});

/**
 * De lijst entiteiten met elke agenda vervangen door zijn bakken (op soort). Een agenda
 * zonder bakken blijft zelf staan, zodat de kaart zegt dat er geen datum is in plaats van
 * hem stil weg te laten. `bakken` is een `Map` van agenda naar `bakkenUit`, of null.
 */
export function vouwUit(ids, bakken) {
  const uit = [];
  for (const id of ids ?? []) {
    const eigen = isAgenda(id) ? bakken?.get(id) : null;
    if (eigen?.length) {
      for (const b of [...eigen].sort((a, c) => a.soort.localeCompare(c.soort))) uit.push(b.id);
    } else {
      uit.push(id);
    }
  }
  return [...new Set(uit)];
}
