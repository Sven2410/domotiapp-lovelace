# Gegevens die de integratie meelevert

## `tankstations-nl.json`

De tankstations van Nederland, voor de kaart op de brandstofkaart (sinds 0.144.0).

- **Bron:** OpenStreetMap, `amenity=fuel` in Nederland, via Overpass, opgehaald met `scripts/tankstations.py`.
- **Licentie:** © OpenStreetMap-bijdragers, onder de Open Database License (ODbL 1.0):
  https://www.openstreetmap.org/copyright. Dit bestand is een afgeleide databank en valt onder dezelfde licentie. De kaart
  toont de naamsvermelding.
- **Verversen:** met de hand, bij een uitgave: `python3 scripts/tankstations.py`. De integratie bij een klant vraagt
  Overpass nooit zelf; zie de kop van dat script waarom.
