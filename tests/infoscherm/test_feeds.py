"""De feedlezer: RSS, Atom, en wat er gebeurt als een bron faalt. **NIEUW GEDRAG**."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.infoscherm.feeds import parse_feed

RSS = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel><title>NOS</title>
<item>
  <title>Eerste &amp; belangrijkste</title>
  <link>https://nos.nl/1</link>
  <description><![CDATA[<p>Een <b>tekst</b> met  HTML&nbsp;erin.</p>]]></description>
  <pubDate>Wed, 09 Sep 2026 08:00:00 +0200</pubDate>
  <enclosure url="https://cdn.nos.nl/1.jpg" type="image/jpeg" length="1"/>
</item>
<item>
  <title>Nieuwer</title>
  <link>https://nos.nl/2</link>
  <pubDate>Wed, 09 Sep 2026 09:30:00 +0200</pubDate>
  <media:thumbnail url="https://cdn.nos.nl/2.jpg"/>
</item>
<item><title></title><link>https://nos.nl/leeg</link></item>
</channel></rss>"""

ATOM = """<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog</title>
  <entry>
    <title>Atom-bericht</title>
    <link rel="alternate" href="https://blog.example/a"/>
    <summary>Kort.</summary>
    <updated>2026-09-08T10:00:00Z</updated>
  </entry>
</feed>"""


def test_rss_wordt_gelezen_en_nieuwste_eerst_gezet() -> None:
    items = parse_feed(RSS, "NOS")
    assert [i["titel"] for i in items] == ["Nieuwer", "Eerste & belangrijkste"]
    eerste = items[1]
    assert eerste["tekst"] == "Een tekst met HTML erin."
    assert eerste["link"] == "https://nos.nl/1"
    assert eerste["datum"] == "2026-09-09T06:00:00+00:00"
    assert eerste["afbeelding"] == "https://cdn.nos.nl/1.jpg"
    assert items[0]["afbeelding"] == "https://cdn.nos.nl/2.jpg"
    assert all(i["bron"] == "NOS" for i in items)
    assert all(i["id"].startswith("feed-") for i in items)


def test_atom_wordt_gelezen() -> None:
    items = parse_feed(ATOM, "Blog")
    assert len(items) == 1
    assert items[0]["titel"] == "Atom-bericht"
    assert items[0]["link"] == "https://blog.example/a"
    assert items[0]["datum"] == "2026-09-08T10:00:00+00:00"


def test_geen_xml_is_een_fout() -> None:
    try:
        parse_feed("<html>geen feed", "x")
    except ValueError as fout:
        assert "feed" in str(fout)
    else:
        raise AssertionError("hoort te falen")


async def test_de_lezer_haalt_de_ingestelde_bronnen_en_meldt_een_kapotte(
    hass: HomeAssistant, infoscherm_op, store, lezer, aioclient_mock
) -> None:
    aioclient_mock.get("https://feeds.nos.nl/nosnieuwsalgemeen", text=RSS)
    aioclient_mock.get("https://kapot.example/feed", status=500)
    await store().async_zet_instellingen(
        {
            "feeds": [
                {"naam": "NOS", "url": "https://feeds.nos.nl/nosnieuwsalgemeen"},
                {"naam": "Kapot", "url": "https://kapot.example/feed"},
            ]
        },
        mag_kiosk_wijzigen=True,
    )
    await lezer().async_ververs()

    items = lezer().items()
    assert [i["titel"] for i in items] == ["Nieuwer", "Eerste & belangrijkste"]
    assert lezer().fouten() == {"https://kapot.example/feed": "HTTP 500"}


async def test_feeds_ververs_commando_geeft_de_lijst_terug(
    hass: HomeAssistant, infoscherm_op, store, hass_ws_client, aioclient_mock
) -> None:
    aioclient_mock.get("https://blog.example/atom", text=ATOM)
    await store().async_zet_instellingen(
        {"feeds": [{"naam": "Blog", "url": "https://blog.example/atom"}]}, mag_kiosk_wijzigen=True
    )
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "domotiapp_lovelace/infoscherm/feeds/ververs"})
    antwoord = await client.receive_json()
    assert antwoord["success"] is True
    assert antwoord["result"]["feeds"][0]["titel"] == "Atom-bericht"
    assert antwoord["result"]["feed_fouten"] == {}
