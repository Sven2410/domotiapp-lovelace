/**
 * Van de config van de camerakaart naar de regels die de integratie bewaart.
 *
 * ## Waarom de kaart dit stuurt en niet zelf bewaart
 *
 * De snapshots en de meldingen draaien aan de SERVERKANT: een kaart bestaat
 * alleen zolang er een dashboard openstaat, en een telefoon in een broekzak
 * heeft geen kaart. De integratie moet dus weten welke melder bij welke camera
 * hoort, hoe lang de rustperiode is en wie er een melding krijgt -- ook als er
 * nergens in huis een scherm aanstaat.
 *
 * De config van de kaart blijft wél de bron. Dat is waar de eigenaar het
 * invult, het staat in zijn YAML en het reist mee als hij het dashboard
 * kopieert. De kaart stuurt zijn regels daarom bij elke wijziging door, en ook
 * één keer bij het laden -- zodat een dashboard dat met de hand in de
 * code-editor is aangepast net zo goed aankomt als een dashboard dat via de
 * editor is bewerkt.
 *
 * ## Eén regel per camera
 *
 * Een kaart kan meerdere camera's dragen. De melders zijn al per camera bekend
 * (`camera-logica.js`: eerst wat je zelf koos, dan hetzelfde apparaat, anders
 * bij allemaal), en dus valt de kaart uiteen in één regel per camera. De
 * instellingen -- rustperiode, wachttijd, ontvangers -- gelden voor de hele
 * kaart; dat is één plek om in te vullen.
 *
 * ## `aan` staat er altijd bij, ook als het uit is
 *
 * Een camera die van de kaart af gaat of een vinkje dat uit gaat, moet de
 * serverkant ook bereiken. Zouden we alleen de actieve regels sturen, dan bleef
 * de oude regel achter en zou hij vrolijk door blijven fotograferen -- op een
 * camera die niet eens meer op het dashboard staat.
 */

import { hoortBij } from "./camera-logica.js";

/** Alle camera's van deze kaart, hoofdcamera vooraan, zonder dubbelen. */
export function camerasVan(config) {
  const lijst = [
    config?.camera,
    ...(Array.isArray(config?.cameras) ? config.cameras : []),
  ].filter((x) => typeof x === "string" && x);
  return [...new Set(lijst)];
}

/** Alle melders van deze kaart, inclusief het oude enkele veld. */
export function meldersVan(config) {
  const lijst = [
    ...(Array.isArray(config?.motion_sensors) ? config.motion_sensors : []),
    ...(config?.motion ? [config.motion] : []),
  ].filter((x) => typeof x === "string" && x);
  return [...new Set(lijst)];
}

/**
 * De regels die naar de integratie moeten, één per camera.
 *
 * @param {object} hass
 * @param {object} config de config van de kaart
 * @returns {Array<object>}
 */
export function regelsVoorKaart(hass, config) {
  const cameras = camerasVan(config);
  const melders = meldersVan(config);
  const aanVinkje = !!config?.snapshots;

  return cameras.map((camera) => {
    const eigen = melders.filter((melder) =>
      hoortBij(hass, melder, cameras, config?.[`melderbij:${melder}`], camera)
    );

    const namen = {};
    for (const melder of eigen) {
      const naam = config?.[`melder:${melder}`];
      if (typeof naam === "string" && naam.trim()) namen[melder] = naam.trim();
    }

    return {
      camera,
      // Zonder melders valt er niets te detecteren; dan staat de regel er wel,
      // maar uit. Zo verdwijnt hij ook netjes als de laatste melder weggaat.
      aan: aanVinkje && eigen.length > 0,
      melders: eigen,
      namen,
      rustperiode: getal(config?.snapshot_rustperiode, 60),
      wachttijd: getal(config?.snapshot_wachttijd, 0),
      ontvangers: lijstVan(config?.snapshot_ontvangers).filter((p) =>
        p.startsWith("person.")
      ),
      alleen_afwezig: !!config?.snapshot_alleen_afwezig,
    };
  });
}

/**
 * Verschilt deze regel van wat de server al heeft?
 *
 * Vergelijkt alleen de velden die de kaart stuurt. De server mag er velden bij
 * hebben die wij niet kennen (een `diensten`-overschrijving bijvoorbeeld), en
 * die horen niet elke keer een schrijfronde uit te lokken.
 */
export function verschilt(nieuw, bestaand) {
  if (!bestaand) return true;
  for (const sleutel of Object.keys(nieuw)) {
    if (!gelijk(nieuw[sleutel], bestaand[sleutel])) return true;
  }
  return false;
}

/** Welke regels er werkelijk opgestuurd moeten worden. */
export function teVersturen(hass, config, bestaandeRegels) {
  return regelsVoorKaart(hass, config).filter((regel) =>
    verschilt(regel, bestaandeRegels?.[regel.camera])
  );
}

function gelijk(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => gelijk(x, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const sleutels = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...sleutels].every((s) => gelijk(a[s], b[s]));
  }
  return a === b;
}

function lijstVan(waarde) {
  if (Array.isArray(waarde)) return waarde.filter((x) => typeof x === "string");
  return typeof waarde === "string" && waarde ? [waarde] : [];
}

function getal(waarde, standaard) {
  const n = Number(waarde);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : standaard;
}
