import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { Scoreboard } from './scoreboard';
import { BowlingService } from '../../services/bowling-game';
import { Game } from '../../models/game';
import { RollIndex } from '../../models/roll-index';
import { Frame } from '../../models/frame';

interface MockBowlingService {
  roll: ReturnType<typeof vi.fn>;
  startNewGame: ReturnType<typeof vi.fn>;
  game: () => Game;
}

describe('Scoreboard', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;
  let mockBowlingService: MockBowlingService;
  let gameSignal: WritableSignal<Game>;

  function createMockFrame(): Frame {
    return {
      firstRoll: null,
      secondRoll: null,
      thirdRoll: null,
      isStrike: false,
      isSpare: false,
    };
  }

  function createMockGame(overrides?: Partial<Game>): Game {
    return {
      frames: Array(10)
        .fill(null)
        .map(() => createMockFrame()),
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

    mockBowlingService = {
      roll: vi.fn(),
      startNewGame: vi.fn(),
      game: gameSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [Scoreboard],
      providers: [{ provide: BowlingService, useValue: mockBowlingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Service Integration', () => {
    it('should inject BowlingService', () => {
      expect(component['bowlingService']).toBeDefined();
      expect(component['bowlingService']).toBe(mockBowlingService);
    });

    it('should expose game signal from service', () => {
      expect(component['game']).toBeDefined();
      expect(component['game']).toBe(mockBowlingService.game);
    });

    it('should return game state from game signal', () => {
      const gameState = component['game']();
      expect(gameState).toBeDefined();
      expect(gameState.frames.length).toBe(10);
    });

    it('should react to game signal changes', () => {
      const initialGame = component['game']();
      expect(initialGame.isGameCompleted).toBe(false);

      gameSignal.set(createMockGame({ isGameCompleted: true }));

      const updatedGame = component['game']();
      expect(updatedGame.isGameCompleted).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle perfect game (all strikes)', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => ({
          firstRoll: 10,
          secondRoll: null,
          thirdRoll: null,
          isStrike: true,
          isSpare: false,
        }));
      const scores = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
      gameSignal.set(
        createMockGame({
          frames,
          cumulativeScores: scores,
          isGameCompleted: true,
          finalScore: 300,
          currentFrameIndex: 0,
        }),
      );
      fixture.detectChanges();

      const rollDisplays = fixture.nativeElement.querySelectorAll(
        'app-scoreboard-frame .text-lg.font-bold',
      );
      for (let i = 0; i < 10; i++) {
        const frameRolls = Array.from(rollDisplays).slice(
          i * 2,
          i * 2 + 2,
        ) as HTMLElement[];
        expect(frameRolls[0].textContent?.trim()).toBe('X');
      }

      const finalScore = fixture.nativeElement.querySelector(
        '.text-3xl.font-bold',
      );
      expect(finalScore.textContent?.trim()).toContain('300');
    });

    it('should handle game with all spares', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => ({
          firstRoll: 5,
          secondRoll: 5,
          thirdRoll: null,
          isStrike: false,
          isSpare: true,
        }));
      gameSignal.set(
        createMockGame({
          frames,
          isGameCompleted: true,
          finalScore: 150,
        }),
      );
      fixture.detectChanges();

      const rollDisplays = fixture.nativeElement.querySelectorAll(
        'app-scoreboard-frame .text-lg.font-bold',
      );
      expect(rollDisplays[0].textContent?.trim()).toBe('5');
      expect(rollDisplays[1].textContent?.trim()).toBe('/');
    });

    it('should handle game in progress', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => createMockFrame());
      frames[0] = {
        firstRoll: 7,
        secondRoll: 2,
        thirdRoll: null,
        isStrike: false,
        isSpare: false,
      };
      frames[1] = {
        firstRoll: 10,
        secondRoll: null,
        thirdRoll: null,
        isStrike: true,
        isSpare: false,
      };
      frames[2] = {
        firstRoll: 5,
        secondRoll: null,
        thirdRoll: null,
        isStrike: false,
        isSpare: false,
      };

      gameSignal.set(
        createMockGame({
          frames,
          currentFrameIndex: 2,
          cumulativeScores: [
            9,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          isGameCompleted: false,
        }),
      );
      fixture.detectChanges();

      const frameElements = fixture.nativeElement.querySelectorAll(
        'app-scoreboard-frame .bg-white',
      );
      expect(frameElements[2].classList.contains('border-green-500')).toBe(
        true,
      );

      const completionDiv =
        fixture.nativeElement.querySelector('.bg-green-600');
      expect(completionDiv).toBeFalsy();
    });

    it('should handle empty game (no rolls yet)', () => {
      gameSignal.set(
        createMockGame({
          currentFrameIndex: 0,
          isGameCompleted: false,
        }),
      );
      fixture.detectChanges();

      const frames = fixture.nativeElement.querySelectorAll(
        'app-scoreboard-frame',
      );
      expect(frames.length).toBe(10);

      const rollDisplays = fixture.nativeElement.querySelectorAll(
        'app-scoreboard-frame .text-lg.font-bold',
      );
      rollDisplays.forEach((roll: HTMLElement) => {
        expect(roll.textContent?.trim()).toBe('-');
      });
    });
  });
});
