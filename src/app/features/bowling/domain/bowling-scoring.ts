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
 * Compute the total score for a frame, including any strike or spare bonuses.
 *
 * @param frames - All frames, used to look ahead for bonus rolls when necessary.
 * @param index - Zero-based frame index (0–9).
 * @returns The frame's score (base pins plus any bonus) or `null` if the required rolls are not yet available.
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
 * Compute the two-roll bonus awarded after a strike, handling consecutive strikes.
 *
 * @param frames - Array of frames for the game; used to read subsequent rolls for bonus calculation.
 * @param index - Index of the strike frame; must be less than LAST_FRAME_INDEX.
 * @returns The bonus pin count (sum of the next two rolls) or `null` if the required bonus rolls are not yet available.
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