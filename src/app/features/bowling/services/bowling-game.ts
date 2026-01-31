import { Injectable, signal, computed } from '@angular/core';
import { LAST_FRAME_INDEX, TOTAL_PINS } from '../models/constants';
import { Frame } from '../models/frame';
import { RollIndex } from '../models/roll-index';
import { calculateScores } from '../domain/bowling-scoring';
import {
  createInitialState,
  getLastFrameAvailablePins,
  getNextState,
} from '../domain/bowling-state';
import { GamePhase } from '../models/game-phase';

@Injectable({
  providedIn: 'root',
})
export class BowlingService {
  private readonly gameState = signal(createInitialState());
  private readonly phase = signal<GamePhase>('not-started');

  /** Read-only game state */
  readonly game = this.gameState.asReadonly();

  /**
   * Number of pins available for the current roll,
   * based on frame, roll index, and game phase.
   */
  readonly availablePins = computed(() => {
    if (this.phase() === 'completed') return 0;

    const game = this.gameState();
    const frameIndex = game.currentFrameIndex;
    const frame = game.frames[frameIndex];
    const rollIndex = game.currentRollIndex;
    const isLastFrame = frameIndex === LAST_FRAME_INDEX;

    if (rollIndex === RollIndex.FIRST) return TOTAL_PINS;

    if (isLastFrame) {
      return getLastFrameAvailablePins(frame, rollIndex);
    }

    return TOTAL_PINS - (frame.firstRoll ?? 0);
  });

  /**
   * Resets the game to its initial state.
   */
  startNewGame(): void {
    this.gameState.set(createInitialState());
    this.phase.set('in-progress');
  }

  /**
   * Records a single roll in the bowling game.
   *
   * @param pins Number of pins knocked down in this roll.
   *
   * @throws Error If the game is completed.
   * @throws Error If the pin count is invalid for the current roll.
   */
  roll(pins: number): void {
    this.ensureRollIsValid(pins);

    if (this.phase() === 'not-started') {
      this.phase.set('in-progress');
    }

    const game = this.gameState();
    const frameIndex = game.currentFrameIndex;
    const rollIndex = game.currentRollIndex;
    const isLastFrame = frameIndex === LAST_FRAME_INDEX;

    const frames = game.frames.map((f, i) => (i === frameIndex ? { ...f } : f));
    const frame = frames[frameIndex];

    this.recordRoll(frame, rollIndex, pins);

    const { nextFrameIndex, nextRollIndex, isCompleted } = getNextState(
      frameIndex,
      rollIndex,
      frame,
      isLastFrame,
    );

    const cumulativeScores = calculateScores(frames);

    this.gameState.set({
      frames,
      currentFrameIndex: nextFrameIndex,
      currentRollIndex: nextRollIndex,
      cumulativeScores,
      finalScore: isCompleted ? cumulativeScores[LAST_FRAME_INDEX] : null,
      isGameCompleted: isCompleted,
    });

    if (isCompleted) {
      this.phase.set('completed');
    }
  }

  /**
   * Validates that a roll can be made with the given pin count.
   *
   * @param pins - Number of pins the player claims to have knocked down.
   * @throws Error If the game is already completed.
   * @throws Error If pins is outside the valid range for the current roll.
   */
  private ensureRollIsValid(pins: number): void {
    if (this.phase() === 'completed') {
      throw new Error('Game is already completed.');
    }

    if (pins < 0 || pins > this.availablePins()) {
      throw new Error(
        `Invalid pin count. Must be between 0 and ${this.availablePins()}.`,
      );
    }
  }

  /**
   * Mutates the given frame by setting the roll value and strike/spare flags.
   *
   * @param frame - The frame to update (mutated in place).
   * @param rollIndex - Which roll within the frame (FIRST, SECOND, or THIRD).
   * @param pins - Number of pins knocked down.
   */
  private recordRoll(frame: Frame, rollIndex: RollIndex, pins: number): void {
    switch (rollIndex) {
      case RollIndex.FIRST:
        frame.firstRoll = pins;
        frame.isStrike = pins === TOTAL_PINS;
        break;

      case RollIndex.SECOND:
        frame.secondRoll = pins;
        frame.isSpare =
          !frame.isStrike && (frame.firstRoll ?? 0) + pins === TOTAL_PINS;
        break;

      case RollIndex.THIRD:
        frame.thirdRoll = pins;
        break;
    }
  }
}
