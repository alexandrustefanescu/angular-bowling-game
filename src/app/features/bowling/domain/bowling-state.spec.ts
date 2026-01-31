import { Frame } from '../models/frame';
import { RollIndex } from '../models/roll-index';
import {
  createInitialState,
  getLastFrameAvailablePins,
  getNextState,
} from './bowling-state';

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

describe('createInitialState', () => {
  it('should create 10 empty frames', () => {
    const state = createInitialState();
    expect(state.frames.length).toBe(10);
  });

  it('should initialize all rolls to null', () => {
    const state = createInitialState();

    for (const frame of state.frames) {
      expect(frame.firstRoll).toBeNull();
      expect(frame.secondRoll).toBeNull();
      expect(frame.thirdRoll).toBeNull();
    }
  });

  it('should initialize all flags to false', () => {
    const state = createInitialState();

    for (const frame of state.frames) {
      expect(frame.isStrike).toBe(false);
      expect(frame.isSpare).toBe(false);
    }
  });

  it('should start at frame 0, first roll', () => {
    const state = createInitialState();
    expect(state.currentFrameIndex).toBe(0);
    expect(state.currentRollIndex).toBe(RollIndex.FIRST);
  });

  it('should initialize scores to null', () => {
    const state = createInitialState();
    expect(state.cumulativeScores).toEqual(Array(10).fill(null));
    expect(state.finalScore).toBeNull();
  });

  it('should not be completed', () => {
    const state = createInitialState();
    expect(state.isGameCompleted).toBe(false);
  });
});

describe('getNextState', () => {
  describe('regular frames (1–9)', () => {
    it('should advance to next frame after a strike', () => {
      const frame = makeFrame({ firstRoll: 10, isStrike: true });

      const result = getNextState(0, RollIndex.FIRST, frame, false);

      expect(result).toEqual({
        nextFrameIndex: 1,
        nextRollIndex: RollIndex.FIRST,
        isCompleted: false,
      });
    });

    it('should stay on same frame after first non-strike roll', () => {
      const frame = makeFrame({ firstRoll: 5 });

      const result = getNextState(3, RollIndex.FIRST, frame, false);

      expect(result).toEqual({
        nextFrameIndex: 3,
        nextRollIndex: RollIndex.SECOND,
        isCompleted: false,
      });
    });

    it('should advance to next frame after second roll', () => {
      const frame = makeFrame({ firstRoll: 3, secondRoll: 4 });

      const result = getNextState(2, RollIndex.SECOND, frame, false);

      expect(result).toEqual({
        nextFrameIndex: 3,
        nextRollIndex: RollIndex.FIRST,
        isCompleted: false,
      });
    });

    it('should advance to next frame after a spare', () => {
      const frame = makeFrame({
        firstRoll: 7,
        secondRoll: 3,
        isSpare: true,
      });

      const result = getNextState(4, RollIndex.SECOND, frame, false);

      expect(result).toEqual({
        nextFrameIndex: 5,
        nextRollIndex: RollIndex.FIRST,
        isCompleted: false,
      });
    });

    it('should never mark regular frames as completed', () => {
      const frame = makeFrame({ firstRoll: 10, isStrike: true });

      const result = getNextState(8, RollIndex.FIRST, frame, false);

      expect(result.isCompleted).toBe(false);
    });
  });

  describe('last frame (10th)', () => {
    it('should move to second roll after first roll', () => {
      const frame = makeFrame({ firstRoll: 5 });

      const result = getNextState(9, RollIndex.FIRST, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.SECOND,
        isCompleted: false,
      });
    });

    it('should move to second roll after a strike on first roll', () => {
      const frame = makeFrame({ firstRoll: 10, isStrike: true });

      const result = getNextState(9, RollIndex.FIRST, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.SECOND,
        isCompleted: false,
      });
    });

    it('should complete game after second roll with no strike or spare', () => {
      const frame = makeFrame({ firstRoll: 3, secondRoll: 4 });

      const result = getNextState(9, RollIndex.SECOND, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.THIRD,
        isCompleted: true,
      });
    });

    it('should award third roll after a spare', () => {
      const frame = makeFrame({
        firstRoll: 7,
        secondRoll: 3,
        isSpare: true,
      });

      const result = getNextState(9, RollIndex.SECOND, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.THIRD,
        isCompleted: false,
      });
    });

    it('should award third roll after a strike', () => {
      const frame = makeFrame({
        firstRoll: 10,
        secondRoll: 5,
        isStrike: true,
      });

      const result = getNextState(9, RollIndex.SECOND, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.THIRD,
        isCompleted: false,
      });
    });

    it('should complete game after third roll', () => {
      const frame = makeFrame({
        firstRoll: 10,
        secondRoll: 10,
        thirdRoll: 10,
        isStrike: true,
      });

      const result = getNextState(9, RollIndex.THIRD, frame, true);

      expect(result).toEqual({
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.THIRD,
        isCompleted: true,
      });
    });
  });
});

describe('getLastFrameAvailablePins', () => {
  it('should return 10 on second roll after a strike', () => {
    const frame = makeFrame({ firstRoll: 10, isStrike: true });

    expect(getLastFrameAvailablePins(frame, RollIndex.SECOND)).toBe(10);
  });

  it('should return 10 on third roll after two consecutive strikes', () => {
    const frame = makeFrame({
      firstRoll: 10,
      secondRoll: 10,
      isStrike: true,
    });

    expect(getLastFrameAvailablePins(frame, RollIndex.THIRD)).toBe(10);
  });

  it('should return remaining pins on third roll after strike then non-strike', () => {
    const frame = makeFrame({
      firstRoll: 10,
      secondRoll: 7,
      isStrike: true,
    });

    expect(getLastFrameAvailablePins(frame, RollIndex.THIRD)).toBe(3);
  });

  it('should return 10 on third roll after a spare', () => {
    const frame = makeFrame({
      firstRoll: 6,
      secondRoll: 4,
      isSpare: true,
    });

    expect(getLastFrameAvailablePins(frame, RollIndex.THIRD)).toBe(10);
  });

  it('should return remaining pins on second roll (no strike)', () => {
    const frame = makeFrame({ firstRoll: 4 });

    expect(getLastFrameAvailablePins(frame, RollIndex.SECOND)).toBe(6);
  });

  it('should return all 10 when first roll is 0', () => {
    const frame = makeFrame({ firstRoll: 0 });

    expect(getLastFrameAvailablePins(frame, RollIndex.SECOND)).toBe(10);
  });
});
