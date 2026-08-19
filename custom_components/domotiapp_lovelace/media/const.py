"""Constanten voor de mediakant van DomotiApp Lovelace."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "domotiapp_lovelace"

# Sleutel in hass.data[DOMAIN]. Voorvoegsel `media_`, om dezelfde reden als de
# `alarm_`-sleutels: drie kanten delen één dict, en twee keer `ws_registered`
# betekent dat de een de ander stil overschrijft.
DATA_WS_REGISTERED: Final = "media_ws_registered"

# Het label dat de klant op zijn Music Assistant-speakers plakt.
#
# Bewust een ANDER label dan dat van de wekker (`Music Assistant Wekker`). Dat
# is de keuze van de eigenaar en hij is niet willekeurig: op de wekker horen
# alleen de speakers waar je 's ochtends wakker van wilt worden, op de mediakaart
# horen ook de tv en de speaker in de gym. Twee lijsten, twee labels.
LABEL_MEDIA_NAAM: Final = "Music Assistant Media"

# Zoekopdracht. Ruimer dan bij de wekker: dit scherm vult de hele pagina en toont
# alles wat MA vindt, in plaats van een lijstje van tien in een editor.
SEARCH_LIMIT_DEFAULT: Final = 20
SEARCH_LIMIT_MAX: Final = 50
