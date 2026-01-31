import {
  LAST_FRAME_INDEX,
  TOTAL_FRAMES,
  TOTAL_PINS,
} from '../models/constants';
import { Frame } from '../models/frame';
import { Game } from '../models/game';
import { NextState } from '../models/next-state';
import { RollIndex } from '../models/roll-index';

/**
 * Determines the next frame index, roll index, and completion flag after a roll.
 *
 * @param frameIndex - Current frame index (0–9).
 * @param rollIndex - Current roll within the frame.
 * @param frame - The current frame (after the roll has been recorded).
 * @param isLastFrame - Whether the current frame is the 10th frame.
 * @returns The next game state to apply.
 */
export function getNextState(
  frameIndex: number,
  rollIndex: RollIndex,
  frame: Frame,
  isLastFrame: boolean,
): NextState {
  if (isLastFrame) {
    return getLastFrameNextState(rollIndex, frame);
  }

  const advance = frame.isStrike || rollIndex === RollIndex.SECOND;

  return {
    nextFrameIndex: advance ? frameIndex + 1 : frameIndex,
    nextRollIndex: advance ? RollIndex.FIRST : RollIndex.SECOND,
    isCompleted: false,
  };
}

/**
 * Returns how many pins can be knocked down on the current 10th-frame roll.
 * Pin count resets to 10 after a strike or spare.
 *
 * @param frame - The 10th frame.
 * @param rollIndex - The upcoming roll (SECOND or THIRD).
 * @returns The maximum number of pins the player can knock down.
 */
export function getLastFrameAvailablePins(
  frame: Frame,
  rollIndex: RollIndex,
): number {
  if (frame.firstRoll === TOTAL_PINS) {
    if (rollIndex === RollIndex.SECOND) return TOTAL_PINS;
    return frame.secondRoll === TOTAL_PINS
      ? TOTAL_PINS
      : TOTAL_PINS - (frame.secondRoll ?? 0);
  }

  if (frame.isSpare) return TOTAL_PINS;
  return TOTAL_PINS - (frame.firstRoll ?? 0);
}

/**
 * Creates a fresh game state with 10 empty frames.
 *
 * @returns A new {@link Game} with all rolls set to `null` and scores cleared.
 */
export function createInitialState(): Game {
  return {
    frames: Array.from({ length: TOTAL_FRAMES }, () => ({
      firstRoll: null,
      secondRoll: null,
      thirdRoll: null,
      isStrike: false,
      isSpare: false,
    })),
    currentFrameIndex: 0,
    currentRollIndex: RollIndex.FIRST,
    cumulativeScores: Array(TOTAL_FRAMES).fill(null),
    finalScore: null,
    isGameCompleted: false,
  };
}

/**
 * Handles 10th-frame progression where a third roll may be awarded.
 *
 * @param rollIndex - The roll that was just completed.
 * @param frame - The 10th frame (after the roll has been recorded).
 * @returns The next game state, including whether the game is now complete.
 */
function getLastFrameNextState(rollIndex: RollIndex, frame: Frame): NextState {
  if (rollIndex === RollIndex.FIRST) {
    return {
      nextFrameIndex: LAST_FRAME_INDEX,
      nextRollIndex: RollIndex.SECOND,
      isCompleted: false,
    };
  }

  if (rollIndex === RollIndex.SECOND) {
    const needsThird = frame.isStrike || frame.isSpare;
    return {
      nextFrameIndex: LAST_FRAME_INDEX,
      nextRollIndex: RollIndex.THIRD,
      isCompleted: !needsThird,
    };
  }

  return {
    nextFrameIndex: LAST_FRAME_INDEX,
    nextRollIndex: RollIndex.THIRD,
    isCompleted: true,
  };
}
