import { TestBed } from '@angular/core/testing';
import { RollIndex } from '../models/roll-index';
import { BowlingService } from './bowling-game';

describe('BowlingService', () => {
  let service: BowlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BowlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('roll()', () => {
    describe('Basic Rolling', () => {
      it('should record first roll correctly', () => {
        service.roll(5);

        const game = service.game();
        expect(game.frames[0].firstRoll).toBe(5);
        expect(game.currentFrameIndex).toBe(0);
        expect(game.currentRollIndex).toBe(RollIndex.SECOND);
      });

      it('should record second roll correctly', () => {
        service.roll(5);
        service.roll(3);

        const game = service.game();
        expect(game.frames[0].firstRoll).toBe(5);
        expect(game.frames[0].secondRoll).toBe(3);
        expect(game.currentFrameIndex).toBe(1);
        expect(game.currentRollIndex).toBe(RollIndex.FIRST);
      });

      it('should advance to next frame after two rolls', () => {
        service.roll(3);
        service.roll(4);
        service.roll(5);

        const game = service.game();
        expect(game.currentFrameIndex).toBe(1);
        expect(game.frames[1].firstRoll).toBe(5);
      });
    });

    describe('Strikes', () => {
      it('should detect a strike on first roll', () => {
        service.roll(10);

        const game = service.game();
        expect(game.frames[0].firstRoll).toBe(10);
        expect(game.frames[0].isStrike).toBe(true);
        expect(game.currentFrameIndex).toBe(1);
        expect(game.currentRollIndex).toBe(RollIndex.FIRST);
      });

      it('should advance to next frame immediately after strike', () => {
        service.roll(10);
        service.roll(5);

        const game = service.game();
        expect(game.currentFrameIndex).toBe(1);
        expect(game.frames[1].firstRoll).toBe(5);
      });

      it('should calculate strike score correctly', () => {
        service.roll(10);
        service.roll(3);
        service.roll(4);

        const game = service.game();
        expect(game.cumulativeScores[0]).toBe(17);
        expect(game.cumulativeScores[1]).toBe(24);
      });

      it('should handle consecutive strikes', () => {
        service.roll(10);
        service.roll(10);
        service.roll(5);
        service.roll(3);

        const game = service.game();
        expect(game.cumulativeScores[0]).toBe(25);
        expect(game.cumulativeScores[1]).toBe(43);
        expect(game.cumulativeScores[2]).toBe(51);
      });
    });

    describe('Spares', () => {
      it('should calculate spare score correctly', () => {
        service.roll(7);
        service.roll(3);
        service.roll(5);
        service.roll(2);

        const game = service.game();
        expect(game.cumulativeScores[0]).toBe(15);
        expect(game.cumulativeScores[1]).toBe(22);
      });
    });

    describe('Score Calculation', () => {
      it('should calculate cumulative scores correctly', () => {
        service.roll(3);
        service.roll(4);
        service.roll(5);
        service.roll(2);

        const game = service.game();
        expect(game.cumulativeScores[0]).toBe(7);
        expect(game.cumulativeScores[1]).toBe(14);
      });

      it('should calculate all strikes game correctly', () => {
        for (let i = 0; i < 12; i++) {
          service.roll(10);
        }

        const game = service.game();
        expect(game.finalScore).toBe(300);
        expect(game.isGameCompleted).toBe(true);
      });

      it('should calculate all spares game correctly', () => {
        for (let i = 0; i < 21; i++) {
          service.roll(5);
        }

        const game = service.game();
        expect(game.finalScore).toBe(150);
        expect(game.isGameCompleted).toBe(true);
      });
    });

    describe('Game Completion', () => {
      it('should set finalScore when game is completed', () => {
        for (let i = 0; i < 20; i++) {
          service.roll(3);
        }

        const game = service.game();
        expect(game.finalScore).not.toBeNull();
        expect(game.finalScore).toBe(60);
      });
    });
  });
});
