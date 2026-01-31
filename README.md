# Angular Bowling

## Überblick

Eine Angular-Anwendung, die ein vollständiges Bowling-Punktesystem implementiert — inklusive Strike-, Spare- und regulärer Wurfberechnung mit korrekter Bonuslogik für alle 10 Frames.

## Technologie

- **Angular 21**
- **Tailwind CSS 4**
- **Vitest** -- Unit-Tests
- **Playwright** -- E2E-Tests
- **Angular SSR + Express** -- Server-Side Rendering
- **ESLint** (angular-eslint) + **Prettier** -- Linting und Formatierung

## Projektstruktur

Der gesamte Bowling-Code befindet sich unter `src/app/features/bowling/`:

- **domain/** -- Reine Geschäftslogik
  - `bowling-scoring.ts` -- Punkteberechnung
  - `bowling-state.ts` -- Spielzustandsübergänge

- **models/** -- Typdefinitionen und Konstanten
  - `frame.ts`, `game.ts`, `game-phase.ts`, `roll-index.ts`, `next-state.ts`, `constants.ts`

- **services/** -- Angular-Services
  - `bowling-game.ts` -- `BowlingGameService` (`@Injectable`) + Spec

- **components/** -- UI-Komponenten
  - `scoreboard/` -- Vollständiges 10-Frame-Scoreboard
  - `scoreboard-frame/` -- Einzelne Frame-Anzeige
  - `pin-roll-input/` -- Formular mit Validierung
  - `game-actions/` -- Neues-Spiel-Button

- **pipes/** -- Angular-Pipes
  - `bowling-roll-pipe.ts` -- Formatierung der Rollwerte

- **pages/** -- Seitenkomponente

## Erste Schritte

### Voraussetzungen

- Node.js 20+
- npm 10+

### Skripte

```bash
npm install
npm start                 # http://localhost:4200
npm run build
npm test                  # Unit-Tests
npm run test-ui           # Unit-Tests im Browser
npm run e2e:test          # E2E-Tests headless
npm run e2e:test-ui       # E2E-Tests mit Browser-Anzeige
npm run e2e:report        # E2E-Tests Bericht
npm run lint              # ESLint mit angular-eslint
npm run format            # Prettier (einfache Anführungszeichen, 80 Spalten, Angular-HTML-Parser)
```

## Testabdeckung

Die Testabdeckung umfasst:
- Gutter Game (alle Nullen, Punktzahl 0)
- Perfect Game (alle Strikes, Punktzahl 300)
- Alle Spares (Punktzahl 150)
- Abwechselnd Spares und Strikes (Punktzahl 190)
- Letzter Frame mit Strike, dann Spare (Punktzahl 83)
- Gemischtes Spiel mit normalen Würfen, Strikes, Spares und Guttern (Punktzahl 125)
- Fehlerbehandlung -- absichtlich ungültige Würfe, Fehlermeldungsprüfungen, Spielfortsetzung (Punktzahl 102)

## Umsetzung der Aufgabe

**Schritt 1 -- Die Domäne verstehen.** Bevor ich mit dem Schreiben des Codes begann, habe ich die Bowlingregeln in einzelne Aspekte unterteilt: wie die Punktevergabe funktioniert (Strike, Spare, Boni, die von zukünftigen Würfen abhängen), wie die Frames ablaufen (10 reguläre Frames plus der spezielle 10. Frame mit Bonuswürfen) und was einen Wurf gültig macht (die verbleibenden Pins ändern sich je nach Wurf und Frame-Kontext). Diese Analyse war ausschlaggebend für die gesamte Architektur.

**Schritt 2 -- Die Modelle definieren.** Ich begann mit der Definition der Datenformen: `Frame` (drei nullable Würfe, Strike-/Spare-Flags), `Game` (Frames-Array, aktuelle Indizes, kumulative Punktzahlen, Abschlussstatus), `NextState` (wohin das Spiel nach jedem Wurf geht), `RollIndex` und `GamePhase`. Indem ich zuerst die Typen richtig definierte, hatten alle nachgelagerten Prozesse einen klaren Vertrag, nach dem sie codiert werden konnten.

**Schritt 3 -- Geschäftslogik als reine Funktionen erstellen.** Nachdem die Modelle fertig waren, schrieb ich den Bewertungsalgorithmus (`bowling-scoring.ts`) und die Zustandsübergangslogik (`bowling-state.ts`) als reine Funktionen in `domain/` ohne Angular-Importe. Der 10. Frame erhielt eine eigene Logik (`getLastFrameNextState`, `getLastFrameAvailablePins`) und wurde nicht in denselben Ablauf wie die Frames 1--9 gezwungen.

**Schritt 4 -- Unit-Tests für die Domäne schreiben.** Ich habe die reinen Funktionen direkt getestet.

**Schritt 5 -- Den Service und seine Tests erstellen.** `BowlingGameService` wurde als Service geschrieben.

**Schritt 6 -- Jede Komponente erstellen.** Nachdem die Service-API stabil war, habe ich das UI erstellt: `scoreboard` (vollständige 10-Frame-Anzeige), `scoreboard-frame` (einzelne Frame-Anzeige mit Rollwert-Darstellungslogik), `pin-roll-input` (reaktives Formular mit Validierung, das Service-Fehler inline abfängt) und `game-actions` (Neues-Spiel-Button). Jede Komponente erhielt eine eigene Spec-Datei zum Testen von Rendering und Interaktion.

**Schritt 7 -- E2E-Tests schreiben.** Schließlich habe ich die E2E-Tests geschrieben, um unterschiedliche Anwendungsfälle abzudecken.

**Schritt 8 -- Mit Zuversicht refaktorieren.** Mit vollständiger Testabdeckung habe ich die Domänenlogik aus dem Service extrahiert, Dateien in einen `domain/`-Ordner verschoben, ungenutzte berechnete Signale entfernt und die Codebasis bereinigt -- alles ohne etwas zu beschädigen. Die Tests haben jeden Regressionsversuch erkannt.

**Schritt 9 -- Eine Pipe für die Anzeigeformatierung extrahieren.** Ich habe die `formatRoll`-Methode in eine eigenständige `BowlingRollPipe` extrahiert, die einen Rollwert und ein Bonus-Flag übernimmt.

**Schritt 10 -- Tests vom Styling entkoppeln.** Unit- und E2E-Tests fragten DOM-Elemente anhand von CSS-Klassen ab, wodurch Tests an Styling-Entscheidungen gekoppelt wurden. Ich habe allen Vorlagen `data-test`-Attribute hinzugefügt und alle Spec-Dateien und Playwright-Tests aktualisiert, damit stattdessen diese Attribute abgefragt werden. CSS-Klassen können nun frei geändert werden, ohne dass Tests dadurch beeinträchtigt werden.

## Roadmap

- **Spielpersistenz** -- `Game`-Zustand über einen `StorageService` in `localStorage` serialisieren. Beim App-Start wiederherstellen, bei neuem Spiel löschen.
- **Mehrspieler** -- Unterstützung für 2+ Spieler mit rundenbasiertem Frame-Wechsel. `Game`-Modell um ein `players`-Array und einen aktiven Spielerindex erweitern.
- **Spielverlauf** -- Abgeschlossene Spiele mit Zeitstempeln speichern. Eine Verlaufsansicht mit vergangenen Punktzahlen anzeigen.
- **Animationen** -- Visuelles Feedback bei Pin-Umfall, Strike und Spare mit Angular-Animationen oder CSS-Übergängen.
