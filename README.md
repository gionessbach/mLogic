# mLogic

Rätsel-Sammlung als Web-App (GitHub Pages), gebaut fürs iPad und Handy.

| Spiel | Ordner | Inhalt |
|---|---|---|
| mHash | `hash/` | Tagesrätsel: vier deutsche Wörter im #-Gitter, Buchstaben tauschen. Kalender zum Nachholen und Vorziehen. |
| mCrack | `crack/` | Tagesrätsel: Passwort mit 5–7 Buchstaben in 6 Versuchen erraten, Hinweis deckt einen Buchstaben auf. |
| mTile | `tile/` | Aufbauspiel: Pastell-Teile in ein Pixelbild setzen, Lücken meiden, Sterne sammeln, neue Karte pro Bild, Galerie, Offline-Einkommen bis 8 h. |
| mRise | `rise/` | Physik-Turmbau (Matter.js eingebettet): hoher Turm auf kleiner Stellfläche, Verbinder, Vorbereitungsmodus, Sturmtest, Zerstörmodus, Kindermodus, lokale Bestenliste. |
| mGrow | `grow/` | Ruhiges Ökosystem-Spiel auf Hex-Raster: Pflanzen, Tiere und Ereignisse, Vielfalt statt Monokultur, Rundenbericht, Legende, Feld per Wisch drehen, reduzierter Ton. |
| mZip | `zip/` | Zahlen der Reihe nach verbinden, jedes Feld füllen. |
| mFlow | `flow/` | Farben im Kreislauf sortieren. |

Ein gemeinsamer Service Worker (`sw.js`) hält alle Spiele offline bereit.
Bei Änderungen die Versionsnummer `CACHE` in `sw.js` erhöhen.

