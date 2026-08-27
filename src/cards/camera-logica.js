/**
 * Welke bewegingsmelder hoort bij welke camera?
 *
 * Gevraagd op 27 augustus 2026: *"er moet iets bedacht worden op de
 * bewegingsmelders als ik meerdere camera's heb."* Terecht -- tot dan hoorden
 * alle melders bij alle camera's, dus wisselde je naar de tuin en zag je nog
 * steeds het merkje van de oprit.
 *
 * ## Hoe de koppeling gelegd wordt
 *
 * Drie stappen, van zeker naar behulpzaam:
 *
 * 1. **Wat je zelf hebt ingesteld.** Per melder kun je in de editor een camera
 *    kiezen. Dat wint altijd.
 * 2. **Hetzelfde APPARAAT.** Een Reolink is één apparaat met een camera én zijn
 *    `_person`, `_vehicle` en `_pet` eraan. Home Assistant geeft die koppeling
 *    mee aan de frontend (`hass.entities[id].device_id`), dus die hoeven we niet
 *    te raden.
 * 3. **Geen koppeling te vinden?** Dan hoort de melder bij ALLE camera's. Dat is
 *    met opzet: een melder die je hebt ingesteld en die nergens meer verschijnt,
 *    is erger dan eentje die een keer te vaak verschijnt.
 *
 * Niet op de NAAM matchen. `camera.oprit` en `binary_sensor.oprit_person` lijken
 * op elkaar, maar `binary_sensor.oprit_persoon_beweging_achtertuin` ook -- en
 * dan hangt het aan hoe iemand zijn entiteiten heeft hernoemd. Het apparaat is
 * een feit, een naam is een gewoonte.
 */

/** Het apparaat waar deze entiteit aan hangt, of null. */
export function apparaatVan(hass, entityId) {
  return hass?.entities?.[entityId]?.device_id ?? null;
}

/**
 * Bij welke camera hoort deze melder?
 *
 * @param {object} hass
 * @param {string} melder de entiteit van de bewegingsmelder
 * @param {string[]} cameras alle camera's op deze kaart
 * @param {string} [ingesteld] wat er in de editor is gekozen
 * @returns {string|null} de camera, of null voor "bij allemaal"
 */
export function cameraVanMelder(hass, melder, cameras, ingesteld) {
  // 1. Wat je zelf koos. Alleen als die camera ook echt op de kaart staat --
  // haal je hem later weg, dan hoort de melder weer bij allemaal in plaats van
  // bij een camera die er niet is.
  if (ingesteld && cameras.includes(ingesteld)) return ingesteld;

  // 2. Hetzelfde apparaat.
  const apparaat = apparaatVan(hass, melder);
  if (apparaat) {
    const zelfde = cameras.filter((c) => apparaatVan(hass, c) === apparaat);
    // Precies één: dan is het die. Twee camera's op één apparaat (een dual-lens)
    // laat de vraag open, en dan is "bij allemaal" eerlijker dan de eerste
    // pakken.
    if (zelfde.length === 1) return zelfde[0];
  }

  // 3. Niets te vinden: bij allemaal.
  return null;
}

/**
 * Hoort deze melder op het beeld dat nu getoond wordt?
 *
 * Een melder zonder koppeling hoort overal; een gekoppelde alleen bij zijn
 * eigen camera.
 */
export function hoortBij(hass, melder, cameras, ingesteld, huidig) {
  const bij = cameraVanMelder(hass, melder, cameras, ingesteld);
  return bij === null || bij === huidig;
}
