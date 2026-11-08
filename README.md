# mLogic

Rätsel-Sammlung als Web-App (GitHub Pages), gebaut fürs iPad und Handy.

| Spiel | Ordner | Inhalt |
|---|---|---|
| mHash | `hash/` | Tagesrätsel: vier deutsche Wörter im #-Gitter, Buchstaben tauschen. Kalender zum Nachholen und Vorziehen. |
| mCrack | `crack/` | Tagesrätsel: Passwort mit 5–7 Buchstaben in 6 Versuchen erraten, Hinweis deckt einen Buchstaben auf. |
| mTile | `tile/` | Aufbauspiel: Pastell-Teile in ein Pixelbild setzen, Lücken meiden, Sterne sammeln, neue Karte pro Bild, Galerie, Offline-Einkommen bis 8 h. |
| mZip | `zip/` | Zahlen der Reihe nach verbinden, jedes Feld füllen. |
| mFlow | `flow/` | Farben im Kreislauf sortieren. |

Ein gemeinsamer Service Worker (`sw.js`) hält alle Spiele offline bereit.
Bei Änderungen die Versionsnummer `CACHE` in `sw.js` erhöhen.

