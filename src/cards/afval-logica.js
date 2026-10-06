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
