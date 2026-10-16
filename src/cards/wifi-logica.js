/**
 * De wifikaart en het wifiblok van het infoscherm: van een QR-code van UniFi
 * Network naar wat er op het scherm staat.
 *
 * Gevraagd op 16 oktober 2026: *"en ik wil een wifi gastennetwerk kaart hebben
 * dat ook op het dashboard kan ik heb een qr code van unifi als entiteit
 * namelijk"*.
 *
 * WAT UNIFI GEEFT, EN WAT NIET
 *
 * Gemeten bij een klant op 16 oktober 2026 (Home Assistant 2026.10.1), de dump
 * staat geanonimiseerd in `tests/js/vaste-invoer/unifi-wlan-qr.json`:
 *
 * - per wifi-netwerk een `image` met `translation_key: wlan_qr_code`, een PNG
 *   van zo'n 300 bytes. UniFi maakt hem alleen met een beheerdersaccount, en
 *   uitgeschakeld; hij moet met de hand aan;
 * - het apparaat heet zoals het netwerk (model "UniFi WLAN"). Dat is de enige
 *   plek waar de netwerknaam staat; `friendly_name` heeft er de vertaalde
 *   "QR-code" achter;
 * - het WACHTWOORD staat nergens als entiteit of attribuut, alleen in de
 *   QR-code. Wie het als tekst wil tonen, typt het in;
 * - `entity_picture` draagt een token dat ongeveer elke vijf minuten wisselt.
 *   Lees het dus steeds uit `hass.states`, en onthoud het nooit.
 *
 * Zonder DOM, zodat het in een gewone unittest kan.
 */

/** Wat er achter de netwerknaam staat in `friendly_name`, in elke taal die we tegenkwamen. */
const QR_ACHTER = /[\s-]*QR[\s-]?code\s*$/i;

const register = (hass, id) => hass?.entities?.[id] ?? null;

/** Het apparaat van een entiteit, of null. */
export function apparaatVan(hass, id) {
  const reg = register(hass, id);
  return reg?.device_id ? hass?.devices?.[reg.device_id] ?? null : null;
}

/**
 * Is dit de QR-code van een wifi-netwerk? Op `translation_key`; staat die er
 * niet (een oudere frontend zonder register), dan op het model van het apparaat.
 */
export function isWifiQr(hass, id) {
  if (!String(id ?? "").startsWith("image.")) return false;
  if (register(hass, id)?.translation_key === "wlan_qr_code") return true;
  return apparaatVan(hass, id)?.model === "UniFi WLAN";
}

/**
 * De netwerknaam op het scherm: een eigen naam als die er is, anders de naam
 * van het apparaat (bij UniFi de SSID, of wat de klant er zelf van maakte),
 * anders `friendly_name` zonder "QR-code" erachter.
 */
export function netwerkNaam(hass, id, eigen = "") {
  const zelf = String(eigen ?? "").trim();
  if (zelf) return zelf;
  const app = apparaatVan(hass, id);
  const naam = app?.name_by_user || app?.name;
  if (naam) return naam;
  const fn = hass?.states?.[id]?.attributes?.friendly_name;
  if (fn) return String(fn).replace(QR_ACHTER, "").trim() || String(fn);
  return id ?? "";
}

/**
 * Het adres van de afbeelding, met het token van NU, of null als er geen is.
 * Het is een `image_proxy`-adres met het token erin: ook een gewone gebruiker
 * (de iPad) mag het ophalen, zonder inloggen.
 *
 * Met de TOESTAND erachter (`v=`). Home Assistant verandert `entity_picture`
 * alleen als het token wisselt, niet als het beeld verandert
 * (`ENTITY_IMAGE_URL` in `components/image`). Na een nieuw wachtwoord in UniFi
 * bleef het adres dus tot vijf minuten hetzelfde, en een `<img>` met hetzelfde
 * adres haalt niets opnieuw op: het scherm toonde een code waarmee je niet meer
 * binnenkwam. De toestand van een image is het tijdstip van het laatste beeld;
 * `image_proxy` kijkt alleen naar `token` en laat de rest liggen.
 */
export function qrAdres(hass, id) {
  const st = hass?.states?.[id];
  if (!st || st.state === "unavailable") return null;
  const pad = st.attributes?.entity_picture;
  if (typeof pad !== "string" || !pad) return null;
  const versie = st.state && st.state !== "unknown" ? `${pad.includes("?") ? "&" : "?"}v=${encodeURIComponent(st.state)}` : "";
  return typeof hass.hassUrl === "function" ? hass.hassUrl(pad + versie) : pad + versie;
}

/** Waarom er geen QR-code staat, of null als hij er wel is. */
export function geenQrReden(hass, id) {
  if (!id) return "Kies de QR-code van het wifi-netwerk.";
  const st = hass?.states?.[id];
  if (!st) return "Deze QR-code bestaat niet. In UniFi Network staat hij standaard uit: zet hem aan bij de entiteiten van het netwerk.";
  if (st.state === "unavailable") return "De QR-code is niet bereikbaar.";
  return qrAdres(hass, id) ? null : "Deze entiteit heeft geen afbeelding.";
}

/** Voor een nieuwe kaart: de QR-code van een gastnetwerk als die er is, anders de eerste. */
export function eersteWifiQr(hass) {
  const alle = Object.keys(hass?.states ?? {})
    .filter((id) => isWifiQr(hass, id))
    .sort();
  return alle.find((id) => /gast|guest/i.test(`${id} ${netwerkNaam(hass, id)}`)) ?? alle[0] ?? null;
}
