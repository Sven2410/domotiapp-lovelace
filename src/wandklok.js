/**
 * De klok van Home Assistant, niet die van het toestel (sinds 0.105.0).
 *
 * De eigenaar, 4 november 2026: het infoscherm van een klant stond op 8:30 terwijl het 9:30 was. Home Assistant stond goed
 * (Europe/Amsterdam), de tablet op een andere tijdzone. Een scherm aan de muur hoort de tijd van de praktijk te tonen: "tijd
 * van HA inderdaad".
 *
 * JavaScript kan de tijdzone van een pagina niet zetten. Daarom rekent de kaart met een WANDTIJD: een `Date` waarvan de lokale
 * velden (`getHours`, `getDate`, ...) de klok in de tijdzone van Home Assistant zijn. Alles wat op die velden leunt (`klok`,
 * `isoDatum`, middernacht, de openingstijden, een boeking als "2026-10-16T14:00") werkt daarmee zonder aanpassing. Twee
 * grenzen:
 *
 * - **Binnen** komt een tijdstip met tijdzone (een afspraak, een voorspelling): `naarWand`.
 * - **Buiten** gaat een tijdstip met `toISOString` (een agenda opvragen, de recorder): eerst `vanWand`.
 *
 * Een duur (`Date.now()` min iets) heeft geen tijdzone en blijft wat hij is.
 */

const vormen = new Map();

function vorm(tz) {
  if (!vormen.has(tz)) {
    let f = null;
    try {
      f = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    } catch {
      // Een tijdzone die de browser niet kent: dan die van het toestel.
    }
    vormen.set(tz, f);
  }
  return vormen.get(tz);
}

/** Het tijdstip `d` als wandtijd in `tz`. Zonder (bruikbare) tijdzone: `d` zelf. */
export function naarWand(d, tz) {
  const tijd = d instanceof Date ? d : new Date(d);
  const f = tz ? vorm(tz) : null;
  if (!f || Number.isNaN(tijd.getTime())) return new Date(tijd);
  const v = {};
  for (const { type, value } of f.formatToParts(tijd)) v[type] = Number(value);
  return new Date(v.year, v.month - 1, v.day, v.hour, v.minute, v.second, tijd.getMilliseconds());
}

/** Het echte tijdstip bij wandtijd `w` in `tz`; het omgekeerde van `naarWand`. */
export function vanWand(w, tz) {
  if (!tz || !vorm(tz) || Number.isNaN(w.getTime())) return new Date(w);
  // Twee keer bijstellen: de tweede vangt een tijdstip vlak bij het verzetten van de klok.
  let t = w.getTime();
  for (let i = 0; i < 2; i += 1) t += w.getTime() - naarWand(new Date(t), tz).getTime();
  return new Date(t);
}
