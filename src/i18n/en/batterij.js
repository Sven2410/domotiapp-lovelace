/** Het Engels van de batterijkaart (sinds 0.81.0). */
export const BATTERIJ = {
  // batterij-logica.js: de standen, zoals het paneel van de coach ze noemt
  "Nul op de meter": "Zero at the meter",
  "Zonneladen": "Solar charging",
  "Laden": "Charging",
  "Ontladen": "Discharging",
  "Stil": "Idle",
  "Vermogen onbekend": "Power unknown",

  // batterij-logica.js: de opdrachten
  "Vol laden": "Charge to full",
  "Leegladen": "Discharge",
  "Terug naar het plan": "Back to the plan",
  "Naar plan": "Back to plan",

  // batterij-logica.js: opgeleverd en de grenzen
  "vandaag {bedrag}": "today {bedrag}",
  "deze maand {bedrag}": "this month {bedrag}",
  "{bedrag} sinds {datum}": "{bedrag} since {datum}",
  "ondergrens {pct}%": "minimum {pct}%",
  "reserve {pct}%": "reserve {pct}%",
  "vakantie tot {pct}%": "holiday up to {pct}%",
  "Anker SOLIX Solarbank Max AC met uitbreiding": "Anker SOLIX Solarbank Max AC with expansion",

  // batterij-card.js
  "Leegladen tot": "Discharge to",
  "Leegladen tot {pct}%": "Discharge to {pct}%",
  "Vakantie": "Holiday",
  "Vakantiestand staat aan: de batterij blijft onder {pct}%.": "Holiday mode is on: the battery stays below {pct}%.",
  "Vakantiestand staat aan.": "Holiday mode is on.",
  "Vakantiestand staat uit. Aan blijft de batterij onder {pct}%.": "Holiday mode is off. When on, the battery stays below {pct}%.",
  "Vakantiestand staat uit.": "Holiday mode is off.",
  "Plan": "Plan",
  "laden": "charging",
  "ontladen": "discharging",
  "laden {kw} kW": "charging {kw} kW",
  "ontladen {kw} kW": "discharging {kw} kW",
  "Opgeleverd": "Earned",
  "Thuisbatterij": "Home battery",

  // batterij-card.js: de editor
  "Automatisch (merk en model van de batterij)": "Automatic (make and model of the battery)",
  "Thuisbatterij bij de coach": "Home battery in the coach",
  "Leeg laten: de naam die de batterij bij de coach heeft.": "Leave empty: the name the battery has in the coach.",
  "Leeg laten: de thuisbatterij van DomotiApp Coach, als er precies één is. Daarvoor is coach 0.112.1 of nieuwer nodig.":
    "Leave empty: the DomotiApp Coach home battery, if there is exactly one. This needs coach 0.112.1 or newer.",
  "Automatisch kiest de foto bij merk en model van de batterij, zoals de coach ze meldt (Anker Solarbank Max AC). Een Growatt ARK herkent hij aan de capaciteit bij de coach; staat daar iets anders, kies het type dan hier.":
    "Automatic picks the photo for the make and model of the battery, as the coach reports them (Anker Solarbank Max AC). A Growatt ARK is recognised by the capacity set in the coach; if that says something else, choose the type here.",
  "DomotiApp Thuisbatterij": "DomotiApp Home Battery",
  "De thuisbatterij zoals DomotiApp Coach hem stuurt: lading, vol laden, leegladen, vakantiestand en het plan. Een batterij die de coach alleen uitleest (Growatt) toont zijn lading en vermogen.":
    "The home battery as DomotiApp Coach controls it: charge, charge to full, discharge, holiday mode and the plan. A battery the coach only reads (Growatt) shows its charge and power.",
};
