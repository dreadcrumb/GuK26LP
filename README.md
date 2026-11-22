# Lernportal GuK

Lernportal für die Ausbildung Gesundheits- und Krankenpflege (10 Fächer, Lerntexte, Quiz, Karteikarten, Zuordnen, Lernplan, Prüfungsmodus) inklusive Lernspiel „An Apple a Day“.
Reine statische Seite: kein Build-Schritt, kein Server-Code.

## Struktur

```
index.html            Startseite (lädt nur CSS + loader.js)
.nojekyll             sagt GitHub Pages: Dateien unverändert ausliefern
css/
  portal.css          Styles des Portals
js/
  loader.js           lädt alle JSON-Daten, startet danach app.js
  app.js              gesamte Portal-Logik (Router, Quiz, Lernplan, Suche, …)
data/
  meta.json           Fächerliste, Icons, Semester-2-Infos
  quellen.json        Quellenangaben (Folien, Skripte, Altfragen)
  images.json         Bild-Schlüssel -> Dateipfad
  subjects/<fach>.json  Lerntexte, Gruppen und Fragen je Fach
                        (hyg, kl1, pgk, pharma, paed, recht, gesch, psych, paedsoz, fremd)
assets/img/           Bilder für Lerntexte und Quizfragen
game/
  index.html          Spiel (wird im Portal per iframe eingebunden)
  game.css, game.js   Spiel-Styles und -Logik
  lofi.js             Hintergrundmusik (WebAudio)
  data/sprites.json   Grafiken des Spiels
  data/questions.json Fragenpool des Spiels
```

## Auf GitHub Pages veröffentlichen

1. Neues Repository anlegen und den **Inhalt** dieses Ordners ins Repo-Root legen (`index.html` muss ganz oben liegen).
2. Im Repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
3. Nach ca. einer Minute ist die Seite unter `https://<benutzername>.github.io/<repo>/` erreichbar.

## Lokal testen

Die Seite lädt JSON per `fetch` und läuft deshalb nicht per Doppelklick (`file://`):

```
python3 -m http.server 8000
```

dann `http://localhost:8000` öffnen.

## Änderungen veröffentlichen

Browser cachen Dateien. Nach Änderungen an CSS, JS oder Daten die Versionsnummer hochzählen:
`V` in `js/loader.js` und `game/index.html` sowie `?v=` in `index.html`.

## Hinweise

- Der Lernstand (Fortschritt, Fehlerkartei, Markierungen, eigene Fragen) liegt im `localStorage` des jeweiligen Browsers.
- Funktionen, die auf claude.ai-Runtime-Diensten beruhten (Online-Abgleich des Fortschritts per Spitzname, Passwort ändern, Fragen automatisch erzeugen), sind außerhalb von claude.ai nicht verfügbar. Alles andere läuft unverändert.
- Der Passwort-Dialog ist nur clientseitig und kein echter Zugriffsschutz: Bei öffentlichem Repository sind alle Inhalte frei einsehbar.
