import { Frame } from '../models/frame';
import { calculateScores } from './bowling-scoring';

function makeFrame(overrides: Partial<Frame> = {}): Frame {
  return {
    firstRoll: null,
    secondRoll: null,
    thirdRoll: null,
    isStrike: false,
    isSpare: false,
    ...overrides,
  };
}

function makeFrames(
  count: number,
  factory: (i: number) => Partial<Frame> = () => ({}),
): Frame[] {
  return Array.from({ length: count }, (_, i) => makeFrame(factory(i)));
}

function emptyFrames(): Frame[] {
  return makeFrames(10);
}

describe('calculateScores', () => {
  it('should return all nulls for empty frames', () => {
    const scores = calculateScores(emptyFrames());
    expect(scores).toEqual(Array(10).fill(null));
  });

  describe('open frames (no strikes or spares)', () => {
    it('should score a single completed frame', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 3, secondRoll: 4 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(7);
      expect(scores[1]).toBeNull();
    });

    it('should accumulate scores across multiple frames', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 3, secondRoll: 4 });
      frames[1] = makeFrame({ firstRoll: 5, secondRoll: 2 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(7);
      expect(scores[1]).toBe(14);
    });

    it('should return null for incomplete frame (only first roll)', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 5 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBeNull();
    });

    it('should score a full game of open frames', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 10; i++) {
        frames[i] = makeFrame({ firstRoll: 3, secondRoll: 4 });
      }

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(70);
    });
  });

  describe('strikes', () => {
    it('should return null for strike without bonus rolls', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 10, isStrike: true });

      const scores = calculateScores(frames);

      expect(scores[0]).toBeNull();
    });

    it('should return null for strike with only one bonus roll', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 10, isStrike: true });
      frames[1] = makeFrame({ firstRoll: 5 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBeNull();
    });

    it('should score a strike with both bonus rolls available', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 10, isStrike: true });
      frames[1] = makeFrame({ firstRoll: 3, secondRoll: 4 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(17);
      expect(scores[1]).toBe(24);
    });

    it('should score consecutive strikes', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 10, isStrike: true });
      frames[1] = makeFrame({ firstRoll: 10, isStrike: true });
      frames[2] = makeFrame({ firstRoll: 5, secondRoll: 3 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(25);
      expect(scores[1]).toBe(43);
      expect(scores[2]).toBe(51);
    });

    it('should score a perfect game (all strikes)', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 10, isStrike: true });
      }
      frames[9] = makeFrame({
        firstRoll: 10,
        secondRoll: 10,
        thirdRoll: 10,
        isStrike: true,
      });

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(300);
    });
  });

  describe('spares', () => {
    it('should return null for spare without bonus roll', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 7, secondRoll: 3, isSpare: true });

      const scores = calculateScores(frames);

      expect(scores[0]).toBeNull();
    });

    it('should score a spare with bonus roll available', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 7, secondRoll: 3, isSpare: true });
      frames[1] = makeFrame({ firstRoll: 5, secondRoll: 2 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(15);
      expect(scores[1]).toBe(22);
    });

    it('should score all spares with 5s', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 5, secondRoll: 5, isSpare: true });
      }
      frames[9] = makeFrame({
        firstRoll: 5,
        secondRoll: 5,
        thirdRoll: 5,
        isSpare: true,
      });

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(150);
    });
  });

  describe('10th frame', () => {
    it('should score 10th frame with no bonus (open frame)', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 0, secondRoll: 0 });
      }
      frames[9] = makeFrame({ firstRoll: 3, secondRoll: 4 });

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(7);
    });

    it('should return null for 10th frame spare without third roll', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 0, secondRoll: 0 });
      }
      frames[9] = makeFrame({ firstRoll: 7, secondRoll: 3, isSpare: true });

      const scores = calculateScores(frames);

      expect(scores[9]).toBeNull();
    });

    it('should score 10th frame spare with third roll', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 0, secondRoll: 0 });
      }
      frames[9] = makeFrame({
        firstRoll: 7,
        secondRoll: 3,
        thirdRoll: 8,
        isSpare: true,
      });

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(18);
    });

    it('should return null for 10th frame strike without all bonus rolls', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 0, secondRoll: 0 });
      }
      frames[9] = makeFrame({ firstRoll: 10, isStrike: true });

      const scores = calculateScores(frames);

      expect(scores[9]).toBeNull();
    });

    it('should score 10th frame strike with all three rolls', () => {
      const frames = emptyFrames();
      for (let i = 0; i < 9; i++) {
        frames[i] = makeFrame({ firstRoll: 0, secondRoll: 0 });
      }
      frames[9] = makeFrame({
        firstRoll: 10,
        secondRoll: 5,
        thirdRoll: 3,
        isStrike: true,
      });

      const scores = calculateScores(frames);

      expect(scores[9]).toBe(18);
    });
  });

  describe('score propagation', () => {
    it('should stop calculating at first incomplete frame', () => {
      const frames = emptyFrames();
      frames[0] = makeFrame({ firstRoll: 3, secondRoll: 4 });
      frames[1] = makeFrame({ firstRoll: 5 });
      frames[2] = makeFrame({ firstRoll: 2, secondRoll: 6 });

      const scores = calculateScores(frames);

      expect(scores[0]).toBe(7);
      expect(scores[1]).toBeNull();
      expect(scores[2]).toBeNull();
    });
  });
});
