# De camerastream die omvalt

Ronde van 27 augustus 2026 — uitgave **0.27.0**. Drie meldingen over hetzelfde:
een livestream die het niet houdt.

> *"Dit krijg ik ook vaak bij de camerakaart."*

Met een schermafdruk van een rode balk dwars over zijn oprit:

```
Failed to connect WebRTC stream: Failed to execute 'setRemoteDescription' on
'RTCPeerConnection': Failed to set remote answer sdp: Called in wrong state: stable
```

## Wat die melding betekent

Hij komt uit Home Assistants eigen WebRTC-speler, niet uit onze kaart. "Called in
wrong state: stable" betekent: er kwam een antwoord binnen op een onderhandeling
die al rond was. Twee starts over elkaar heen.

Dat de melding van HA komt maakt hem niet ons probleem-niet. Er waren **twee
oorzaken aan onze kant**, en allebei zorgden ze voor precies zulke dubbele starts.

## Oorzaak 1: de stream werd bij elke update opnieuw gezet

`camerabeeld()` kende bij elke `paint()` alle eigenschappen opnieuw toe:

```js
el.cameraImage = entityId;
el.cameraView = live ? "live" : "auto";
```

`cameraImage` en `cameraView` zijn nu juist de twee waar `hui-image` zijn stream
op herstart. Op een kale testinstance valt dat niet op; op zijn installatie met
479 componenten komt er meerdere keren per seconde een update binnen.

Nu wordt alleen gezet wat werkelijk verandert. `hass` gaat wél elke keer mee —
daar zitten de tokens in waarmee het beeld opgehaald wordt, en die verlopen.

## Oorzaak 2: het beeld werd weggegooid zodra de camera wegviel

Stond de camera even op `unavailable`, dan verwijderde de kaart het beeldelement
en maakte bij terugkeer een nieuw aan — met een nieuwe WebRTC-onderhandeling.
Een Reolink valt regelmatig een seconde weg, dus dat gebeurde vaak.

Het beeld blijft nu staan; alleen de melding komt eroverheen.

## En als hij tóch omvalt

Een stream kan ook omvallen door het netwerk, de camera zelf, of een TURN-server
die niet antwoordt. Daar kunnen wij niets aan doen — wél aan wat je dan ziet, en
dat hoort geen rode balk over je oprit te zijn.

De kaart schakelt nu terug naar het **stilstaande beeld** dat zichzelf ververst.
Je ziet je oprit, alleen niet bewegend. Na een halve minuut probeert hij het
opnieuw; lukt het dan, dan merk je er niets van.

### Hoe de fout herkend wordt

`ha-camera-stream` zet er een `ha-alert` neer en vuurt geen event dat wij kunnen
opvangen — dat is nagekeken. Dus wordt er elke twee seconden gekeken of dat
element verschijnt.

Broos? Ja, en dat staat zo in de code. Maar het alternatief is de gebruiker met
een rode balk laten zitten, en het faalt netjes: verandert HA zijn opmaak, dan
doet deze bewaker gewoon niets meer en is het precies zoals het nu is.

## Gemeten in een echte browser

De fout nagebootst door zelf een `ha-alert` in het beeld te zetten — precies wat
HA's speler doet:

```
VOOR de fout:   cameraView "live",  LIVE-merkje aan
NA de fout:     cameraView "auto",  LIVE-merkje uit
                beeld staat er nog, en het is HETZELFDE element
                (dus geen herstart, en geen zwart vlak)

Melding weggehaald en 32 seconden gewacht:
                cameraView "live",  LIVE-merkje terug
```

Die laatste regel is de herkansing: hij blijft niet voorgoed op stilstaand beeld
hangen.

---

## En twee dingen die er tijdens deze ronde bij kwamen

> *"Het duurt ook best lang voordat de stream laadt, is daar wat aan te doen? En
> op een wall tablet gaat hij soms stilstaan en moet ik heel het dashboard
> vernieuwen."*

### Het lange laden

Ja, daar is wat aan te doen. Een WebRTC-verbinding opzetten kost een paar
seconden, en zolang die bezig is staat er niets. Het stilstaande beeld is er wél
meteen — dat is één plaatje via de camera-proxy.

De kaart begint nu met dat plaatje en gaat na anderhalve seconde pas live. Je
ziet je oprit direct, en een tel later beweegt hij.

Anderhalve seconde en niet meteen: een plaatje dat verschijnt en meteen weer
plaatsmaakt voor een zwart vlak is erger dan even wachten.

**Gemeten:**

```
na 250ms:   er is beeld, cameraView "auto"
na 2500ms:  cameraView "live", en het is HETZELFDE element
```

### Het stilstaande beeld op de wandtablet

Dit is een ander geval dan hierboven, en het is er precies eentje die de
foutdetectie NIET vangt: een bevroren stream geeft geen foutmelding. Het beeld
blijft gewoon op het laatste plaatje staan.

Twee dingen erbij:

1. **Een videostream die loopt telt zijn `currentTime` op.** Staat die tien
   seconden stil terwijl het element wel speelt, dan is de verbinding dood zonder
   dat iemand dat gemeld heeft. De kaart zet de stream dan opnieuw op.
2. **Terug uit de achtergrond.** Een tablet dat zijn scherm uitzet bevriest de
   pagina, en komt die terug dan is de stream vrijwel altijd dood. Bij
   `visibilitychange` wordt de stream opnieuw opgezet.

Dat tweede is het antwoord op *"moet ik heel het dashboard vernieuwen"*: dat doet
de kaart nu zelf, en alleen voor zichzelf.

Dezelfde les als valkuil 30, trouwens: een toestel dat dagen open blijft staan
gedraagt zich anders dan een tabblad dat je net opende.

**Gemeten** — het scenario van de wandtablet nagebootst met een
`visibilitychange`:

```
HERSTART_BIJ_WAKKER_WORDEN: true
direct na:        cameraView "auto"
een tel later:    cameraView "live"
```

Dat is een schone herstart van de verbinding, zonder de pagina te herladen.

## Wat niet lukte

- **De WebRTC-fout zelf is niet uitgelokt.** De demo-camera in de testinstance
  doet geen WebRTC. Wat er getest is, is de HERKENNING en de TERUGVAL — met een
  nagemaakte melding van precies de vorm die HA neerzet.
- **Of de twee oorzaken aan onze kant de fout bij hem ook echt veroorzaakten, is
  niet te bewijzen zonder zijn camera.** Wat vaststaat: allebei leidden ze tot
  een herstart van de stream die er niet had moeten zijn, en dat is precies het
  soort dubbele start waar die melding over gaat.
- **De bevriezings-detectie is niet in zijn eigen lus gemeten.** Die lus draait op
  een `setInterval` van twee seconden, en Chrome vertraagt timers in een VERBORGEN
  tabblad tot bijna stilstand — in veertien seconden draaide hij geen enkele keer.
  Het meettabblad was verborgen (`document.visibilityState === "hidden"`).

  Wat wél is aangetoond: dat de video gevonden wordt binnen de shadow roots
  (`video_gevonden: true`, `paused: false`), en dat `herstart_()` -- de functie die
  die lus aanroept -- een schone herstart doet. Die is via de
  `visibilitychange`-route wel volledig gemeten.

  En het is geen probleem in de praktijk: op een wandtablet met het scherm aan is
  de pagina zichtbaar en draait de lus gewoon. Staat het scherm uit, dan is er
  niets te bewaken -- en dan grijpt juist de `visibilitychange` in zodra het
  weer aangaat.

## Aannames

- Zijn camera hangt aan een integratie die WebRTC gebruikt (Reolink of go2rtc).
  De melding zegt dat ook.

## Tellingen

- **833 JS-tests** groen; `check:css` en `check:registratie` OK.
- Versie 0.27.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
