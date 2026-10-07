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
 * Geen imports, zodat het in een gewone Node-test past.
 */

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
  if (dagen === 0) return { n: "nu", u: "aan de weg", bij: "nu aan de weg" };
  return {
    n: String(dagen),
    u: dagen === 1 ? "dag" : "dagen",
    bij: dagen >= 3 ? `over ${dagen} dagen` : "",
  };
}
