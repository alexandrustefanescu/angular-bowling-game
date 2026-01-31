import {
  LAST_FRAME_INDEX,
  TOTAL_FRAMES,
  TOTAL_PINS,
} from '../models/constants';
import { Frame } from '../models/frame';

/**
 * Computes cumulative scores for all frames.
 *
 * @param frames - The array of 10 frames in the current game.
 * @returns An array of 10 cumulative scores, where each entry is `null`
 *   if the frame's score cannot yet be determined (e.g. pending bonus rolls).
 */
export function calculateScores(frames: Frame[]): (number | null)[] {
  const scores: (number | null)[] = Array(TOTAL_FRAMES).fill(null);
  let cumulative = 0;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const score = getFrameScore(frames, i);
    if (score === null) break;

    cumulative += score;
    scores[i] = cumulative;
  }

  return scores;
}

/**
 * Returns the total score for a single frame (base pins + bonus).
 *
 * @param frames - All 10 frames (needed to look ahead for bonus rolls).
 * @param index - Zero-based frame index (0–9).
 * @returns The frame score, or `null` if the required rolls haven't been made yet.
 */
function getFrameScore(frames: Frame[], index: number): number | null {
  const frame = frames[index];

  if (frame.firstRoll === null) return null;

  if (index === LAST_FRAME_INDEX) {
    return getLastFrameScore(frame);
  }

  if (frame.isStrike) {
    const bonus = getStrikeBonus(frames, index);
    return bonus === null ? null : TOTAL_PINS + bonus;
  }

  if (frame.isSpare) {
    const bonus = frames[index + 1]?.firstRoll;
    return bonus === null ? null : TOTAL_PINS + bonus;
  }

  if (frame.secondRoll === null) return null;
  return frame.firstRoll + frame.secondRoll;
}

/**
 * Scores the 10th frame, which allows up to three rolls
 * when the bowler gets a strike or spare.
 *
 * @param frame - The 10th frame.
 * @returns The sum of all rolls in the frame, or `null` if pending rolls remain.
 */
function getLastFrameScore(frame: Frame): number | null {
  const hasBonus = frame.isStrike || frame.isSpare;

  if (hasBonus && frame.thirdRoll === null) return null;
  if (!hasBonus && frame.secondRoll === null) return null;

  return (
    (frame.firstRoll ?? 0) + (frame.secondRoll ?? 0) + (frame.thirdRoll ?? 0)
  );
}

/**
 * Returns the two-roll bonus after a strike.
 * Handles consecutive strikes by looking two frames ahead.
 *
 * @param frames - All 10 frames.
 * @param index - Index of the strike frame (must not be the last frame).
 * @returns The bonus pin count, or `null` if the bonus rolls haven't occurred yet.
 */
function getStrikeBonus(frames: Frame[], index: number): number | null {
  const next = frames[index + 1];
  if (!next || next.firstRoll === null) return null;

  if (next.isStrike && index + 1 < LAST_FRAME_INDEX) {
    const afterNext = frames[index + 2];
    if (!afterNext || afterNext.firstRoll === null) return null;
    return TOTAL_PINS + afterNext.firstRoll;
  }

  if (next.secondRoll === null) return null;
  return next.firstRoll + next.secondRoll;
}
