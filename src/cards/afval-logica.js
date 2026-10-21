/**
 * Welke bakken er op de eerstvolgende ophaaldag aan straat moeten.
 *
 * Gemeld op 6 oktober 2026 met een schermafdruk: *"nu 2 afvaltypes morgen aan
 * de straat moeten en er is maar 1 gehighlight"*. Restafval stond uitgelicht,
 * Papier stond eronder in de lijst met "morgen 7 okt" -- dezelfde dag, maar het
 * leek een bak voor later. De kaart nam de eerste van de gesorteerde lijst en
 * keek niet of de volgende op dezelfde dag viel.
 *
 * Bij Mijnafvalwijzer is dat geen uitzondering: papier en restafval komen daar
 * vaak samen, en de sensor `_morgen` zegt dan ook gewoon "Papier, Restafval".
 * De melding op de telefoon noemde ze al allebei (`meldingen/afval.py`); de
 * kaart hoort hetzelfde te zeggen.
 *
 * Gedeeld door de afvalkaart en het infoscherm, want die hadden dezelfde fout.
 * Alleen taal.js als import (zonder DOM), zodat het in een gewone Node-test past.
 */

import { t, tn } from "../taal.js";

/**
 * De bakken van de eerste ophaaldag, in de volgorde waarin ze binnenkwamen.
 *
 * @param {Array<object>} komend  alleen wat er nog komt, op datum gesorteerd
 * @param {(bak: object) => number} dag  hoeveel dagen tot de ophaling
 * @returns {Array<object>} leeg als er niets komt
 */
export function eersteOphaaldag(komend, dag) {
  if (!komend?.length) return [];
  const eerste = dag(komend[0]);
  if (eerste == null) return [komend[0]];
  return komend.filter((bak) => dag(bak) === eerste);
}

/**
 * De woorden in het uitgelichte vlak van de afvalkaart, naast de namen.
 *
 * `n` en `u` staan rechts in het vlak: "nu aan de weg", "1 dag", "6 dagen".
 * `bij` is wat er bovenaan achter de dag komt als dat rechts niet past.
 * Gemeld op 7 oktober 2026 met een schermafdruk van zijn telefoon: twee bakken
 * op één dag ("Restafval en Papier") liepen dwars door "nu aan de weg" heen.
 * Op een smalle kaart verhuist het daarom naar de regel erboven, en krijgen de
 * namen de hele breedte. Of het past, meet de kaart zelf.
 *
 * Morgen en overmorgen krijgen bovenaan niets extra: daar staat "morgen" of
 * "overmorgen" al, en "1 dag" zegt dan niets nieuws.
 *
 * @param {number} dagen  tot de ophaling, 0 is vandaag
 * @returns {{n: string, u: string, bij: string}}
 */
export function heroWoorden(dagen) {
  if (dagen === 0) return { n: t("nu"), u: t("aan de weg"), bij: t("nu aan de weg") };
  return {
    n: String(dagen),
    u: tn(dagen, "dag", "dagen"),
    bij: dagen >= 3 ? t("over {n} dagen", { n: dagen }) : "",
  };
}

/**
 * Staat de bak van deze ophaaldag al buiten, en wie zette hem daar?
 *
 * Iemand tikt in de afvalmelding op zijn telefoon op "Staat buiten"; de server
 * onthoudt voor welke ophaaldag en door wie (`buiten` in meldingen/store.py).
 * Dat stond tot 0.62.2 alleen op de meldingenkaart. Gevraagd op 12 oktober
 * 2026: *"op de afvalkaart wil je juist hebben staan door wie die aan de straat
 * is gezet"*.
 *
 * @param {{datum: string, door?: string}|null} buiten  van de server
 * @param {Date} ophaaldag  de dag van het uitgelichte vlak
 * @param {(persoon: string) => string} naamVan  `person.x` -> "Bram"
 * @returns {string|null} "Staat buiten · Bram", of null als hij er niet staat
 */
export function buitenTekst(buiten, ophaaldag, naamVan = () => "") {
  if (!buiten?.datum || !(ophaaldag instanceof Date)) return null;
  const twee = (n) => String(n).padStart(2, "0");
  const dag = `${ophaaldag.getFullYear()}-${twee(ophaaldag.getMonth() + 1)}-${twee(ophaaldag.getDate())}`;
  if (buiten.datum !== dag) return null;
  const naam = buiten.door ? String(naamVan(buiten.door) ?? "").trim().split(/\s+/)[0] : "";
  return naam ? t("Staat buiten · {naam}", { naam }) : t("Staat buiten");
}
