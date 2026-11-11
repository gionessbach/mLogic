# mLogic

Rätsel-Sammlung als Web-App (GitHub Pages), gebaut fürs iPad und Handy.

| Spiel | Ordner | Inhalt |
|---|---|---|
| mHash | `hash/` | Tagesrätsel: vier deutsche Wörter im #-Gitter, Buchstaben tauschen. Kalender zum Nachholen und Vorziehen. |
| mCrack | `crack/` | Tagesrätsel: Passwort mit 5–7 Buchstaben in 6 Versuchen erraten, Hinweis deckt einen Buchstaben auf. |
| mTile | `tile/` | Aufbauspiel: Pastell-Teile in ein Pixelbild setzen, Lücken meiden, Sterne sammeln, neue Karte pro Bild, Galerie, Offline-Einkommen bis 8 h. |
| mRise | `rise/` | Physik-Turmbau (Matter.js eingebettet): hoher Turm auf kleiner Stellfläche, Verbinder, Vorbereitungsmodus, Sturmtest, Zerstörmodus, Kindermodus, lokale Bestenliste. |
| mGrow | `grow/` | Ruhiges Ökosystem-Spiel auf Hex-Raster: Pflanzen, Tiere und Ereignisse, Vielfalt statt Monokultur, Rundenbericht, Legende, Feld per Wisch drehen, reduzierter Ton. |
| mCode | `code/` | Spielerisch Python lernen: 7 Missionen (Abfolge, Schleifen, Funktionen, Bedingungen, while/Variablen, Turtle-Bonus, Finale), Kinder-/Erwachsenen-Modus, eigener Mini-Interpreter, Level-Editor und Tagesrätsel. |
| mAtom | `atom/` | Vom Atom zur Zelle als Roguelike: Merge-Ebene E1 (Atome vom Fließband in Reaktoren ziehen, Zerfall, Stabilität, kritische Masse, Tempobonus), XP über alle Läufe. Speicher-Schlüssel `matom_*`. E2–E5 folgen. |
| mSudo | `sudo/` | 6×6-Sudoku: Tagesrätsel mit Kalender (Mo/Di leicht, Mi–Fr mittel, Sa/So schwer) plus freies Spiel in drei Stufen. Notizen, Konflikte sofort rot, Tipp, Löschen. Speicher-Schlüssel `msudo`. |
| mCalc | `calc/` | Mini-Excel für Kinder (5–7 J.): 6×10-Tabelle, eigene Tastatur (ABC alphabetisch A–Z + Ä Ö Ü ß mit Groß/klein-Schalter, 123 für Zahlen/Formeln; ersetzt auf Tablets die Bildschirmtastatur), Formeln mit Zellbezügen (antippen/ziehen), SUMME, MITTELWERT, MAX, MIN, Farben, Fett, Balkendiagramm, Strichliste (Strich dazu/weg, Fünferbündel, Striche ↔ Zahl), Vorlagen, Rückgängig, xlsx-Export ohne Bibliothek. Projekte mit Speichern-Knopf und Auto-Speichern alle 10 min (plus beim Verlassen). Speicher-Schlüssel `mcalc-projekte`. |
| mZip | `zip/` | Zahlen der Reihe nach verbinden, jedes Feld füllen. |
| mFlow | `flow/` | Farben im Kreislauf sortieren. |

Ein gemeinsamer Service Worker (`sw.js`) hält alle Spiele offline bereit.
Bei Änderungen die Versionsnummer `CACHE` in `sw.js` erhöhen.

Startseite: Ansicht als Liste oder Kacheln (gemerkt unter `mlogic.view`). Nach unten ziehen (oder „hier tippen“ im Fuß) lädt alle Dateien aus `FILES` frisch vom Server und lädt die Seite neu.

