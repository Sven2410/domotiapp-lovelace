"""De wekkerkant van DomotiApp Lovelace.

Eén op één overgenomen uit de losse `domotiapp_alarm`-integratie: opslag,
validatie, planner, afvuren, oploop, noodrem, radiomodus en de
WebSocket-commando's. Aan de logica is niets veranderd -- dat draaide en er was
geen reden om eraan te zitten.

Wat wél anders is, en waarom dit een subpakket is: alles woont nu in
`hass.data["domotiapp_lovelace"]`, samen met de scenekant. Beide gebruikten
sleutels als `store` en `ws_registered`, en die zouden elkaar overschrijven.
De sleutels hier dragen daarom een `alarm_`-voorvoegsel; zie `const.py`.

De frontend wordt niet hier geregistreerd maar één keer centraal in
`custom_components/domotiapp_lovelace/__init__.py`: er is nog maar één bundel.
"""
