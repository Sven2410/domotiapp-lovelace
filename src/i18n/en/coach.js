/**
 * Het Engels van de kaarten bij DomotiApp Coach: laadpaal, thuisbatterij en
 * de programmakaart (sinds 0.81.0). Waar het paneel van de coach dezelfde zin
 * heeft, staat hier hetzelfde Engels (frontend/src/i18n/en/ in domotiapp-coach).
 */
export const COACH = {
  // coach-logica.js
  "Geen apparaat van DomotiApp Coach gevonden. Daarvoor is coach {versie} of nieuwer nodig.":
    "No DomotiApp Coach device found. This needs coach {versie} or newer.",
  "Kies in de editor welk apparaat van de coach deze kaart volgt.": "Choose in the editor which coach device this card follows.",
  "Het gekozen apparaat van de coach bestaat niet meer.": "The chosen coach device no longer exists.",
  "Werk DomotiApp Coach bij naar {versie} of nieuwer.": "Update DomotiApp Coach to {versie} or newer.",

  // laadpaal-logica.js
  "Laadt op zon": "Charging on solar",
  "Laadt": "Charging",
  "Wacht": "Waiting",
  "Vol": "Full",
  "Geen auto": "No car",
  "Gepauzeerd": "Paused",
  "Storing": "Fault",
  "Snel": "Fast",
  "Continu": "Continuous",
  "Zon": "Solar",
  "Planning": "Planning",
  "Goedkoopst": "Cheapest",
  "{kwh} kWh zon": "{kwh} kWh solar",
  "{kwh} kWh accu": "{kwh} kWh battery",
  "{bedrag} net": "{bedrag} grid",
  "{bedrag} incl. zon": "{bedrag} incl. solar",
  "sinds {wanneer}": "since {wanneer}",
  "Deze laadbeurt": "This session",
  "Vorige laadbeurt": "Previous session",
  "Dit loopt mee met wat de paal erin doet. Zegt de auto iets anders, vul dat in en druk op Doorgeven.":
    "This follows what the charger puts in. If the car says otherwise, enter that and press Submit.",
  "De auto geeft zijn accustand nu niet door.": "The car is not reporting its charge level right now.",
  "Hier wacht de coach op. Zonder dit gaat hij uit van een lege accu.":
    "The coach is waiting for this. Without it, it assumes an empty battery.",
  "Geef dit door, dan kan de coach het gunstigste moment kiezen.": "Enter this so the coach can choose the best moment.",

  // laadpaal-card.js
  "Hoe vol is de auto nu?": "How full is the car now?",
  "Doorgeven": "Submit",
  "Pauze": "Pause",
  "pauze": "pause",
  "Schema": "Schedule",
  "Klaar om": "Ready by",
  "klaar om {tijd}": "ready by {tijd}",
  "Laden tot": "Charge to",
  "laden tot {pct}%": "charge to {pct}%",
  "Laden tot {pct}%, {min} tot {max}": "Charge to {pct}%, {min} to {max}",
  "Laadplan": "Charging plan",
  "zon": "solar",
  "net": "grid",
  "{pct}% zon": "{pct}% solar",
  "Laadpaal": "Charger",
  "verwacht klaar <b>{klok}</b>": "expected done <b>{klok}</b>",
  "nog <b>{kwh} kWh</b>": "<b>{kwh} kWh</b> to go",
  "{wat}: geldt tot de kabel eruit gaat.": "{wat}: applies until the cable is unplugged.",
  "Weekschema, te wijzigen in DomotiApp Coach": "Weekly schedule, change it in DomotiApp Coach",
  "Automatisch (merk en model van de paal)": "Automatic (make and model of the charger)",
  "Laadpaal bij de coach": "Charger in the coach",
  "Leeg laten: de naam die de laadpaal bij de coach heeft.": "Leave empty: the name the charger has in the coach.",
  "Leeg laten: de laadpaal van DomotiApp Coach, als er precies één is. Daarvoor is coach 0.112.1 of nieuwer nodig.":
    "Leave empty: the DomotiApp Coach charger, if there is exactly one. This needs coach 0.112.1 or newer.",
  "Automatisch kiest de foto bij merk en model van de paal, zoals de coach ze meldt (Easee of Alfen).":
    "Automatic picks the photo for the make and model of the charger, as the coach reports them (Easee or Alfen).",
  "Leeg laten: de vermogenssensor die bij de coach is ingevuld.": "Leave empty: the power sensor set in the coach.",
  "DomotiApp Laadpaal": "DomotiApp Charger",
  "De laadpaal zoals DomotiApp Coach hem stuurt: accustand van de auto, modus, pauze, schema en het laadplan.":
    "The charger as DomotiApp Coach controls it: the car's charge level, mode, pause, schedule and the charging plan.",
};
