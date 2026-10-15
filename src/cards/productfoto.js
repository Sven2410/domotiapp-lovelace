/**
 * Merk, type en productfoto: de afspraak die de robotstofzuiger en de
 * warmtepompboiler delen.
 *
 * De eigenaar vroeg het op 15 oktober 2026 voor allebei, "net als bij de
 * laadpaal en de thuisbatterij": in de editor eerst een merk, dan een type,
 * en bij dat type hoort een productfoto. Elke kaart heeft een eigen lijst; de
 * regels hier zijn voor alle lijsten gelijk.
 *
 * DE VORM VAN EEN LIJST
 *
 *   { <merk>: { label, fabrikant, modellen: { <type>: { label, pad, codes } } } }
 *
 * - `fabrikant` wordt als STUK gezocht in de fabrikant van het apparaat
 *   (Dreame meldt "Dreametech™", LG "LGE").
 * - `codes` zijn de modelcodes zoals de integratie ze in het apparaat zet. Op
 *   een code kiest Automatisch een foto, en alleen daarop: een verkeerde foto is
 *   erger dan geen. Een toevoeging tussen haakjes telt niet mee: LG meldt
 *   "WHT_056905_WW (DEVICE_WATER_HEATER)". De code staat in `model` OF in
 *   `model_id`: Miele zet in `model` de soort ("Washing machine") en in
 *   `model_id` het type ("WWI880").
 * - `pad` is relatief aan `AFBEELDINGEN_BASIS`. Die adressen komen in
 *   dashboards zodra iemand er een kiest: alleen aanvullen, nooit hernoemen. Elk
 *   pad staat ook in `VASTE_WEBP` van `tests/test_afbeeldingen.py`.
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test.
 */

/** Waar de integratie haar afbeeldingen serveert. */
export const AFBEELDINGEN_BASIS = "/domotiapp_lovelace/afbeeldingen/";

/** Een modelcode zonder wat er tussen haakjes achter staat, in kleine letters. */
const kaleCode = (tekst) =>
  String(tekst ?? "")
    .toLowerCase()
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();

/**
 * Merk en type bij een apparaat uit `hass.devices`, of null.
 *
 * @returns {{merk: string, model: string}|null}
 */
export function typeBijApparaat(apparaat, lijst) {
  const fabrikant = String(apparaat?.manufacturer ?? "").toLowerCase();
  const modellen = [kaleCode(apparaat?.model), kaleCode(apparaat?.model_id)].filter(Boolean);
  if (!fabrikant || !modellen.length) return null;
  for (const [merk, m] of Object.entries(lijst ?? {})) {
    if (!m?.fabrikant || !fabrikant.includes(String(m.fabrikant).toLowerCase())) continue;
    for (const [sleutel, t] of Object.entries(m.modellen ?? {})) {
      if ((t.codes ?? []).some((c) => modellen.includes(kaleCode(c)))) return { merk, model: sleutel };
    }
  }
  return null;
}

/**
 * Het adres van de afbeelding op de kaart, of "" (dan staat er een chip).
 *
 * - `merk: geen`: geen afbeelding;
 * - `merk: eigen`: de eigen afbeelding (`image`), leeg als er geen is;
 * - een merk uit de lijst: de foto van het gekozen type, en anders het type
 *   dat bij het apparaat hoort, en anders het eerste type van dat merk;
 * - `auto` (of niets): een eigen afbeelding als die er is, anders de foto bij
 *   de modelcode van het apparaat, anders niets.
 *
 * @param {{merk?: string, model?: string, image?: string}} config
 * @param {object|null} apparaat uit `hass.devices`
 */
export function productAfbeelding(config, apparaat, lijst) {
  const merk = config?.merk || "auto";
  if (merk === "geen") return "";
  if (merk === "eigen") return config?.image || "";
  if (merk === "auto") {
    if (config?.image) return config.image;
    const t = typeBijApparaat(apparaat, lijst);
    const pad = t ? lijst[t.merk]?.modellen?.[t.model]?.pad : "";
    return pad ? AFBEELDINGEN_BASIS + pad : "";
  }
  const modellen = lijst?.[merk]?.modellen ?? {};
  const herkend = typeBijApparaat(apparaat, lijst);
  const gekozen =
    modellen[config?.model] ??
    (herkend?.merk === merk ? modellen[herkend.model] : null) ??
    Object.values(modellen)[0];
  return gekozen?.pad ? AFBEELDINGEN_BASIS + gekozen.pad : "";
}

/** De keuzes voor Merk in de editor. Valkuil 55: geen enkele met de waarde "". */
export function merkKeuzes(lijst) {
  return [
    { value: "auto", label: "Automatisch" },
    ...Object.entries(lijst ?? {}).map(([value, m]) => ({ value, label: m.label })),
    { value: "eigen", label: "Ander merk (eigen afbeelding)" },
    { value: "geen", label: "Geen afbeelding (icoon)" },
  ];
}

/** De keuzes voor Type bij een merk, of [] als het geen merk uit de lijst is. */
export function typeKeuzes(merk, lijst) {
  return Object.entries(lijst?.[merk]?.modellen ?? {}).map(([value, t]) => ({ value, label: t.label }));
}

/**
 * Wat de editor wegschrijft: een merk uit de lijst heeft altijd een type (dat
 * van het apparaat als het dat merk is, en anders het eerste), een ander merk
 * heeft er geen.
 *
 * @param {object} config de config uit de editor
 * @param {object|null} apparaat uit `hass.devices`
 */
export function metType(config, apparaat, lijst) {
  const types = typeKeuzes(config?.merk, lijst);
  if (!types.length) {
    if (!config || !("model" in config)) return config;
    const { model: _weg, ...rest } = config;
    return rest;
  }
  if (types.some((t) => t.value === config.model)) return config;
  const herkend = typeBijApparaat(apparaat, lijst);
  return { ...config, model: herkend?.merk === config.merk ? herkend.model : types[0].value };
}
