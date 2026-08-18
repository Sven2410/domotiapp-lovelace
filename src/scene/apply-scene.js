/**
 * Het opbouwen van de service-aanroepen voor één scene (SPEC 8).
 *
 * Bewust een pure module: geen lit, geen DOM, geen `hass`. Alles wat hier
 * gebeurt is een functie van (scene, ledenlijst, states) naar een lijst
 * aanroepen. Daardoor is het in een gewone unittest te toetsen zonder jsdom —
 * en jsdom zou over dit gedrag ook niets kunnen zeggen.
 */

/** Vaste overgangstijd bij elke aanroep (SPEC 8.2). */
export const TRANSITION_SECONDEN = 1;

/**
 * States waarbij een lamp wordt overgeslagen (SPEC 8.1).
 *
 * Ook een lamp die helemaal niet in `states` voorkomt telt hiervoor: die is
 * feitelijk niet bereikbaar, en een aanroep zou hoe dan ook falen.
 */
export const NIET_BESTUURBAAR = ["unavailable", "unknown"];

/**
 * De vier kleurattributen, in de volgorde waarin ze worden gebruikt.
 * Er staat er hooguit één in de opslag (SPEC 10.4), maar de volgorde maakt het
 * gedrag bij onverwachte data voorspelbaar in plaats van willekeurig.
 */
export const KLEURSLEUTELS = [
  "color_temp_kelvin",
  "rgb_color",
  "hs_color",
  "xy_color",
];

/**
 * Bouw de service-aanroepen voor één scene.
 *
 * Er wordt geïtereerd over de **groepsleden**, niet over de sleutels in de
 * scene. Lampen die wel in de opslag staan maar geen lid (meer) zijn, doen dus
 * niet mee — precies zoals SPEC 11.2 beschrijft.
 *
 * @param {object} args
 * @param {{lights?: Record<string, object>}|undefined} args.scene
 * @param {string[]} args.memberEntityIds
 * @param {Record<string, {state: string}>} args.states
 * @returns {{oproepen: {service: string, data: object}[], overgeslagen: string[]}}
 */
export function bouwServiceOproepen({ scene, memberEntityIds, states }) {
  const oproepen = [];
  const overgeslagen = [];

  const lampen = scene?.lights ?? {};
  const leden = Array.isArray(memberEntityIds) ? memberEntityIds : [];
  const alleStates = states ?? {};

  for (const entityId of leden) {
    const instelling = lampen[entityId];

    // Niet ingesteld is een aparte toestand naast "uit": deze lamp wordt niet
    // aangeraakt en telt ook niet als overgeslagen (SPEC 7.1).
    if (!instelling || typeof instelling !== "object") {
      continue;
    }

    const huidig = alleStates[entityId];
    if (!huidig || NIET_BESTUURBAAR.includes(huidig.state)) {
      overgeslagen.push(entityId);
      continue;
    }

    if (instelling.state === "off") {
      oproepen.push({
        service: "turn_off",
        data: { entity_id: entityId, transition: TRANSITION_SECONDEN },
      });
      continue;
    }

    const data = { entity_id: entityId, transition: TRANSITION_SECONDEN };

    // Ontbreekt bij een aan/uit-lamp; dan hoort er ook niets mee te gaan
    // (SPEC 10.4).
    if (typeof instelling.brightness === "number") {
      data.brightness = instelling.brightness;
    }

    for (const sleutel of KLEURSLEUTELS) {
      if (instelling[sleutel] !== undefined) {
        data[sleutel] = instelling[sleutel];
        break;
      }
    }

    oproepen.push({ service: "turn_on", data });
  }

  return { oproepen, overgeslagen };
}

/**
 * Voer de aanroepen uit en geef terug welke lampen faalden.
 *
 * Parallel gestart en samen afgewacht met `Promise.allSettled` (SPEC 8.3), en
 * de uitkomst wordt wél gebruikt — anders dan bij de referentiekaart, die
 * fire-and-forget was zonder `.catch()` (INVENTARIS sectie 6).
 *
 * @param {(service: string, data: object) => Promise<unknown>} roepAan
 * @param {{service: string, data: object}[]} oproepen
 * @returns {Promise<{entityId: string, fout: unknown}[]>}
 */
export async function voerUit(roepAan, oproepen) {
  const uitkomsten = await Promise.allSettled(
    oproepen.map((oproep) => roepAan(oproep.service, oproep.data)),
  );

  const mislukt = [];
  uitkomsten.forEach((uitkomst, index) => {
    if (uitkomst.status === "rejected") {
      mislukt.push({
        entityId: oproepen[index].data.entity_id,
        fout: uitkomst.reason,
      });
    }
  });
  return mislukt;
}
