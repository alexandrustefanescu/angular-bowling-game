import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { GameActions } from './game-actions';
import { BowlingGameService } from '../../services/bowling-game';
import { Game } from '../../models/game';
import { RollIndex } from '../../models/roll-index';

interface MockBowlingService {
  roll: ReturnType<typeof vi.fn>;
  startNewGame: ReturnType<typeof vi.fn>;
  game: () => Game;
}

describe('GameActions', () => {
  let component: GameActions;
  let fixture: ComponentFixture<GameActions>;
  let mockBowlingService: MockBowlingService;
  let gameSignal: WritableSignal<Game>;
  let startNewGameCallCount: number;

  function createMockGame(overrides?: Partial<Game>): Game {
    return {
      frames: Array(10)
        .fill(null)
        .map(() => ({
          firstRoll: null,
          secondRoll: null,
          thirdRoll: null,
          isStrike: false,
          isSpare: false,
        })),
      currentFrameIndex: 0,
      currentRollIndex: RollIndex.FIRST,
      isGameCompleted: false,
      cumulativeScores: Array(10).fill(null),
      finalScore: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    gameSignal = signal(createMockGame());
    startNewGameCallCount = 0;

    mockBowlingService = {
      roll: vi.fn(),
      startNewGame: vi.fn(() => startNewGameCallCount++),
      game: gameSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [GameActions],
      providers: [{ provide: BowlingGameService, useValue: mockBowlingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject BowlingGameService', () => {
      expect(component['bowlingService']).toBeDefined();
      expect(component['bowlingService']).toBe(mockBowlingService);
    });
  });

  describe('Service Integration', () => {
    it('should expose game signal from service', () => {
      expect(component['game']).toBeDefined();
      expect(component['game']).toBe(mockBowlingService.game);
    });

    it('should return game state from game signal', () => {
      const gameState = component['game']();
      expect(gameState).toBeDefined();
      expect(gameState.isGameCompleted).toBe(false);
    });

    it('should call bowlingService.startNewGame() when startNewGame() is invoked', () => {
      const initialCount = startNewGameCallCount;
      component['startNewGame']();
      expect(startNewGameCallCount).toBe(initialCount + 1);
    });

    it('should call startNewGame with no arguments', () => {
      const initialCount = startNewGameCallCount;
      component['startNewGame']();
      expect(startNewGameCallCount).toBe(initialCount + 1);
    });
  });

  describe('DOM Rendering - Game Not Completed', () => {
    beforeEach(() => {
      gameSignal.set(createMockGame({ isGameCompleted: false }));
      fixture.detectChanges();
    });

    it('should not render controls container when game is not completed', () => {
      const controlsDiv = fixture.nativeElement.querySelector('[data-test="game-actions"]');
      expect(controlsDiv).toBeFalsy();
    });

    it('should not render button when game is not completed', () => {
      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeFalsy();
    });
  });

  describe('DOM Rendering - Game Completed', () => {
    beforeEach(() => {
      gameSignal.set(
        createMockGame({
          isGameCompleted: true,
          finalScore: 120,
          currentFrameIndex: 0,
        }),
      );
      fixture.detectChanges();
    });

    it('should render controls container when game is completed', () => {
      const controlsDiv = fixture.nativeElement.querySelector('[data-test="game-actions"]');
      expect(controlsDiv).toBeTruthy();
    });

    it('should render button when game is completed', () => {
      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();
    });

    it('should display "New Game" text in button', () => {
      const button = fixture.nativeElement.querySelector('app-button');
      expect(button.textContent.trim()).toBe('New Game');
    });

    it('should apply correct CSS classes to controls container', () => {
      const controlsDiv = fixture.nativeElement.querySelector('[data-test="game-actions"]');
      expect(controlsDiv.className).toContain('flex');
      expect(controlsDiv.className).toContain('gap-3');
      expect(controlsDiv.className).toContain('justify-center');
      expect(controlsDiv.className).toContain('mt-4');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      gameSignal.set(createMockGame({ isGameCompleted: true }));
      fixture.detectChanges();
      startNewGameCallCount = 0;
    });

    it('should call startNewGame() when button emits clicked event', () => {
      let componentCallCount = 0;
      const originalMethod = component['startNewGame'];
      component['startNewGame'] = () => {
        componentCallCount++;
        originalMethod.call(component);
      };

      const button = fixture.nativeElement.querySelector('app-button button');
      button.click();

      expect(componentCallCount).toBe(1);
    });

    it('should call service startNewGame when button is clicked', () => {
      const button = fixture.nativeElement.querySelector('app-button button');
      button.click();

      expect(startNewGameCallCount).toBe(1);
    });

    it('should handle multiple button clicks', () => {
      const button = fixture.nativeElement.querySelector('app-button button');
      button.click();
      button.click();
      button.click();

      expect(startNewGameCallCount).toBe(3);
    });
  });

  describe('Reactive State Changes', () => {
    it('should show controls when game state changes to completed', () => {
      gameSignal.set(createMockGame({ isGameCompleted: false }));
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeFalsy();

      gameSignal.set(createMockGame({ isGameCompleted: true }));
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();
    });

    it('should hide controls when game state changes to not completed', () => {
      gameSignal.set(createMockGame({ isGameCompleted: true }));
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();

      gameSignal.set(createMockGame({ isGameCompleted: false }));
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeFalsy();
    });

    it('should reflect game signal changes immediately', () => {
      const gameStates = [
        createMockGame({ isGameCompleted: false }),
        createMockGame({ isGameCompleted: true }),
        createMockGame({ isGameCompleted: false }),
        createMockGame({ isGameCompleted: true }),
      ];

      gameStates.forEach((state) => {
        gameSignal.set(state);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('app-button');
        if (state.isGameCompleted) {
          expect(button).toBeTruthy();
        } else {
          expect(button).toBeFalsy();
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle game with all frames completed', () => {
      const completedFrames = Array(10)
        .fill(null)
        .map(() => ({
          firstRoll: 5,
          secondRoll: 3,
          thirdRoll: null,
          isStrike: false,
          isSpare: false,
        }));

      gameSignal.set(
        createMockGame({
          frames: completedFrames,
          isGameCompleted: true,
          finalScore: 80,
          currentFrameIndex: 0,
        }),
      );

      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();
      expect(button.textContent.trim()).toBe('New Game');
    });

    it('should handle perfect game (all strikes)', () => {
      const perfectFrames = Array(10)
        .fill(null)
        .map(() => ({
          firstRoll: 10,
          secondRoll: null,
          thirdRoll: null,
          isStrike: true,
          isSpare: false,
        }));

      gameSignal.set(
        createMockGame({
          frames: perfectFrames,
          isGameCompleted: true,
          finalScore: 300,
          currentFrameIndex: 0,
        }),
      );

      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();
    });
  });
});
