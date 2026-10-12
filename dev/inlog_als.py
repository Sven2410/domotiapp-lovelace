"""Log in op de testinstance als een account uit .ha-dev-config/INLOG.md en
geef de tokens EENMALIG aan een tabblad.

    python dev/inlog_als.py receptie http://receptie.localhost:8127 8792
    python dev/inlog_als.py ipad     http://ipad.localhost:8127     8793
    python dev/inlog_als.py dev      http://localhost:8127          8791

Daarna in dat tabblad (op de login-pagina van die origin):

    const t = await fetch("http://127.0.0.1:8792/tokens").then(r => r.json());
    localStorage.setItem("hassTokens", JSON.stringify(t));

en naar het dashboard navigeren. Het wachtwoord en de tokens komen zo nooit in
het gesprek of in een commando.

WAAROM ELKE GEBRUIKER EEN EIGEN ORIGIN

Home Assistant bewaart zijn tokens in `localStorage`, en dat is per origin. Een
tweede gebruiker in hetzelfde `localhost:8127` gooit de eerste eruit. Chrome
stuurt elke `*.localhost` naar 127.0.0.1, en elk daarvan is een eigen origin:
zo staan een beheerder, een receptie en een iPad naast elkaar in één browser.
Gebruikt op 12 oktober 2026; zie `docs/receptie-zonder-admin/RAPPORT.md`.

`dev` is het account uit de onboarding (sleutels `gebruiker` en `wachtwoord`);
de andere hebben `<naam>-gebruiker` en `<naam>-wachtwoord`.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sleutel, ORIGIN, POORT = sys.argv[1], sys.argv[2].rstrip("/"), int(sys.argv[3])
HA = "http://localhost:8127"
CLIENT = ORIGIN + "/"
INLOG = Path(__file__).resolve().parent.parent / ".ha-dev-config" / "INLOG.md"
tekst = INLOG.read_text(encoding="utf-8")
voor = "" if sleutel == "dev" else f"{sleutel}-"


def lees(veld):
    m = re.search(rf"^- {re.escape(voor + veld)}:\s*`?([^`\s]+)", tekst, re.M)
    if not m:
        raise SystemExit(f"'{voor}{veld}' staat niet in INLOG.md")
    return m.group(1)


def post(pad, data, json_body=True):
    if json_body:
        body = json.dumps(data).encode()
        kop = {"Content-Type": "application/json"}
    else:
        body = urllib.parse.urlencode(data).encode()
        kop = {"Content-Type": "application/x-www-form-urlencoded"}
    return json.loads(urllib.request.urlopen(urllib.request.Request(HA + pad, body, kop)).read())


flow = post("/auth/login_flow", {"client_id": CLIENT, "handler": ["homeassistant", None], "redirect_uri": CLIENT + "?auth_callback=1"})
stap = post(f"/auth/login_flow/{flow['flow_id']}", {"client_id": CLIENT, "username": lees("gebruiker"), "password": lees("wachtwoord")})
if stap.get("type") != "create_entry":
    raise SystemExit(f"inloggen mislukt: {stap.get('errors')}")
tok = post("/auth/token", {"grant_type": "authorization_code", "code": stap["result"], "client_id": CLIENT}, json_body=False)
tokens = {
    "access_token": tok["access_token"],
    "token_type": "Bearer",
    "expires_in": tok["expires_in"],
    "refresh_token": tok["refresh_token"],
    "hassUrl": ORIGIN,
    "clientId": CLIENT,
    "expires": int(time.time() * 1000) + tok["expires_in"] * 1000,
}
print(f"ingelogd als {sleutel}, tokens klaar voor {ORIGIN}", flush=True)


class Ontvanger(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(tokens).encode())
        print("tokens afgegeven", flush=True)
        raise SystemExit

    def log_message(self, *a):
        pass


try:
    HTTPServer(("127.0.0.1", POORT), Ontvanger).serve_forever()
except SystemExit:
    pass
