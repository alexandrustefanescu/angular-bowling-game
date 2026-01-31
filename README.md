# Angular Bowling

## Overview

A ten-pin bowling score calculation engine with an Angular-based UI layer. The application accepts pin-count inputs per roll and produces real-time cumulative scores following the official scoring rules -- including strike and spare bonuses, 10th-frame bonus rolls, and input validation against remaining standing pins.

## Technology

- **Angular 21** -- standalone components, signals, reactive forms
- **Tailwind CSS 4** -- utility-first styling
- **Vitest** -- unit testing
- **Playwright** -- e2e testing
- **Angular SSR + Express** -- server-side rendering
- **ESLint** (angular-eslint) + **Prettier** -- linting and formatting


## Project Structure

All bowling-related code lives under `src/app/features/bowling/`:

- **domain/** -- Pure business logic (no Angular dependencies)
  - `bowling-scoring.ts` -- score calculation
  - `bowling-state.ts` -- game state transitions

- **models/** -- Type definitions and constants
  - `frame.ts`, `game.ts`, `game-phase.ts`, `roll-index.ts`, `next-state.ts`, `constants.ts`

- **services/** -- Angular services
  - `bowling-game.ts` -- `BowlingService` (`@Injectable`) + spec

- **components/** -- UI components
  - `scoreboard/` -- full 10-frame scoreboard
  - `scoreboard-frame/` -- single frame display
  - `pin-roll-input/` -- reactive form with validation
  - `game-actions/` -- new game button

- **pages/** -- route-level page component

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Scripts

```bash
npm install
npm start                 # http://localhost:4200
npm run build
npm test                  # Unit Tests
npm run test-ui           # Unit Tests in Browser
npm run e2e:test          # E2E Tests headless
npm run e2e:test-ui       # E2E Tests headed mode
npm run e2e:report        # E2E Tests report
npm run lint              # ESLint with angular-eslint
npm run format            # Prettier (single quotes, 80 col, angular HTML parser)
```

Coverage includes:
- Gutter game (all zeros, score 0)
- Perfect game (all strikes, score 300)
- All spares (score 150)
- Alternating spares and strikes (score 190)
- Last frame with strike then spare (score 83)
- Mixed game with normals, strikes, spares, and gutters (score 125)
- Error recovery -- intentional invalid rolls, error message assertions, game continuation (score 102)


## Design Process

**Step 1 -- Understand the domain.** Before writing any code, we broke down the bowling rules into discrete concerns: how scoring works (strikes, spares, bonuses that depend on future rolls), how frames progress (10 regular frames plus the special 10th frame with bonus rolls), and what makes a roll valid (remaining pins change per roll and per frame context). This analysis drove the entire architecture.

**Step 2 -- Define the models.** We started by defining the data shapes: `Frame` (three nullable rolls, strike/spare flags), `Game` (frames array, current indices, cumulative scores, completion status), `NextState` (where the game goes after each roll), `RollIndex`, and `GamePhase`. Getting the types right first meant everything downstream had a clear contract to code against.

**Step 3 -- Build the business logic as pure functions.** With the models in place, we wrote the scoring algorithm (`bowling-scoring.ts`) and state transition logic (`bowling-state.ts`) as pure functions in `domain/` with zero Angular imports. Bowling math doesn't need dependency injection or signals -- it needs inputs and outputs. The 10th frame got dedicated logic (`getLastFrameNextState`, `getLastFrameAvailablePins`) rather than being forced into the same flow as frames 1-9.

**Step 4 -- Write unit tests for the domain.** We tested the pure functions directly -- 19 scoring specs and 23 state specs covering normal frames, strikes, spares, the 10th frame edge cases, incomplete games, and pin availability calculations.

**Step 5 -- Build the service and its tests.** `BowlingService` was written as an orchestrator: validate the roll, record it in the frame, delegate to the pure functions for the next state and score recalculation, then update the Angular signal. The service specs test the full flow through its public API -- gutter games, perfect games, mixed scenarios, and error cases.

**Step 6 -- Build each component.** With the service API stable, we built the UI layer: `scoreboard` (full 10-frame display), `scoreboard-frame` (single frame with roll display logic), `pin-roll-input` (reactive form with validation that catches service errors inline), and `game-actions` (new game button). Each component got its own spec file testing rendering and interaction.

**Step 7 -- Write e2e tests.** Finally, Playwright tests play full games through the actual UI -- typing pin counts, clicking roll, and asserting on the DOM: frame rolls, cumulative scores, and game completion messages. Seven scenarios covering gutter game, perfect game, all spares, mixed play, and intentional error recovery.

**Step 8 -- Refactor with confidence.** With full test coverage in place, we extracted domain logic out of the service, moved files to a `domain/` folder, removed unused computed signals, and cleaned up the codebase -- all without breaking anything. Tests caught every regression attempt.


## Roadmap

- **Game persistence** -- serialize `Game` state to `localStorage` via a `StorageService`. Restore on app init, clear on new game.
- **Multiplayer** -- support 2+ players with turn-based frame alternation. Extend `Game` model with a `players` array and active player index.
- **Game history** -- persist completed games with timestamps. Display a history view with past scores.
- **Animations** -- pin knock-down and strike/spare visual feedback using Angular animations or CSS transitions.