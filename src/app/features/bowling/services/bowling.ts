import { Injectable, signal, computed } from '@angular/core';
import { Frame } from '../models/frame';
import { Game } from '../models/game';
import { RollIndex } from '../models/roll-index';

@Injectable({
  providedIn: 'root',
})
export class BowlingService {
  private readonly gameState = signal<Game>(this.createInitialState());

  readonly game = this.gameState.asReadonly();
  readonly frames = computed(() => this.gameState().frames);
  readonly currentFrameIndex = computed(() => this.gameState().currentFrameIndex);
  readonly isGameCompleted = computed(() => this.gameState().isGameCompleted);
  readonly finalScore = computed(() => this.gameState().finalScore);
  readonly cumulativeScores = computed(() => this.gameState().cumulativeScores);

  readonly availablePins = computed(() => {
    const game = this.gameState();
    if (game.isGameCompleted || game.currentFrameIndex === null) return 10;

    const frame = game.frames[game.currentFrameIndex];
    const rollIndex = game.currentRollIndex;
    const isLastFrame = game.currentFrameIndex === 9;

    if (rollIndex === RollIndex.FIRST) return 10;

    if (isLastFrame) {
      if (frame.firstRoll === 10) {
        return rollIndex === RollIndex.SECOND
          ? 10
          : frame.secondRoll === 10
            ? 10
            : 10 - (frame.secondRoll ?? 0);
      }
      if (frame.isSpare) return 10;
      return 10 - (frame.firstRoll ?? 0);
    }

    return 10 - (frame.firstRoll ?? 0);
  });

  private createInitialState(): Game {
    return {
      frames: Array.from(
        { length: 10 },
        (): Frame => ({
          firstRoll: null,
          secondRoll: null,
          thirdRoll: null,
          isStrike: false,
          isSpare: false,
        }),
      ),
      currentFrameIndex: null,
      currentRollIndex: RollIndex.FIRST,
      finalScore: null,
      isGameCompleted: false,
      cumulativeScores: Array(10).fill(null),
    };
  }

  startNewGame(): void {
    this.gameState.set(this.createInitialState());
  }

  roll(pins: number): void {
    const game = this.gameState();

    if (game.isGameCompleted) {
      throw new Error('Game is already completed.');
    }

    if (pins < 0 || pins > this.availablePins()) {
      throw new Error(`Invalid pin count. Must be between 0 and ${this.availablePins()}.`);
    }

    const frameIndex = game.currentFrameIndex ?? 0;
    const rollIndex = game.currentFrameIndex === null ? RollIndex.FIRST : game.currentRollIndex;
    const isLastFrame = frameIndex === 9;

    const newFrames = game.frames.map((f, i) => (i === frameIndex ? { ...f } : f));
    const frame = newFrames[frameIndex];

    this.recordRoll(frame, rollIndex, pins);

    const { nextFrameIndex, nextRollIndex, isCompleted } = this.getNextState(
      frameIndex,
      rollIndex,
      frame,
      isLastFrame,
    );

    const cumulativeScores = this.calculateScores(newFrames);

    this.gameState.set({
      frames: newFrames,
      currentFrameIndex: nextFrameIndex,
      currentRollIndex: nextRollIndex,
      isGameCompleted: isCompleted,
      cumulativeScores,
      finalScore: isCompleted ? cumulativeScores[9] : null,
    });
  }

  private recordRoll(frame: Frame, rollIndex: RollIndex, pins: number): void {
    switch (rollIndex) {
      case RollIndex.FIRST:
        frame.firstRoll = pins;
        frame.isStrike = pins === 10;
        break;
      case RollIndex.SECOND:
        frame.secondRoll = pins;
        frame.isSpare = !frame.isStrike && (frame.firstRoll ?? 0) + pins === 10;
        break;
      case RollIndex.THIRD:
        frame.thirdRoll = pins;
        break;
    }
  }

  private getNextState(
    frameIndex: number,
    rollIndex: RollIndex,
    frame: Frame,
    isLastFrame: boolean,
  ): { nextFrameIndex: number; nextRollIndex: RollIndex; isCompleted: boolean } {
    if (isLastFrame) {
      return this.getLastFrameNextState(rollIndex, frame);
    }

    const shouldAdvanceFrame = frame.isStrike || rollIndex === RollIndex.SECOND;

    return {
      nextFrameIndex: shouldAdvanceFrame ? frameIndex + 1 : frameIndex,
      nextRollIndex: shouldAdvanceFrame ? RollIndex.FIRST : RollIndex.SECOND,
      isCompleted: false,
    };
  }

  private getLastFrameNextState(
    rollIndex: RollIndex,
    frame: Frame,
  ): { nextFrameIndex: number; nextRollIndex: RollIndex; isCompleted: boolean } {
    if (rollIndex === RollIndex.FIRST) {
      return { nextFrameIndex: 9, nextRollIndex: RollIndex.SECOND, isCompleted: false };
    }

    if (rollIndex === RollIndex.SECOND) {
      const needsThirdRoll = frame.isStrike || frame.isSpare;
      return {
        nextFrameIndex: 9,
        nextRollIndex: RollIndex.THIRD,
        isCompleted: !needsThirdRoll,
      };
    }

    return { nextFrameIndex: 9, nextRollIndex: RollIndex.THIRD, isCompleted: true };
  }

  private calculateScores(frames: Frame[]): (number | null)[] {
    const scores: (number | null)[] = Array(10).fill(null);
    let cumulative = 0;

    for (let i = 0; i < 10; i++) {
      const frameScore = this.getFrameScore(frames, i);
      if (frameScore === null) break;

      cumulative += frameScore;
      scores[i] = cumulative;
    }

    return scores;
  }

  private getFrameScore(frames: Frame[], index: number): number | null {
    const frame = frames[index];

    if (frame.firstRoll === null) return null;

    if (index === 9) {
      return this.getLastFrameScore(frame);
    }

    if (frame.isStrike) {
      const bonus = this.getStrikeBonus(frames, index);
      return bonus === null ? null : 10 + bonus;
    }

    if (frame.isSpare) {
      const bonus = frames[index + 1]?.firstRoll;
      return bonus === null ? null : 10 + bonus;
    }

    if (frame.secondRoll === null) return null;
    return (frame.firstRoll ?? 0) + (frame.secondRoll ?? 0);
  }

  private getLastFrameScore(frame: Frame): number | null {
    const hasBonus = frame.isStrike || frame.isSpare;

    if (hasBonus && frame.thirdRoll === null) return null;
    if (!hasBonus && frame.secondRoll === null) return null;

    return (frame.firstRoll ?? 0) + (frame.secondRoll ?? 0) + (frame.thirdRoll ?? 0);
  }

  private getStrikeBonus(frames: Frame[], index: number): number | null {
    const next = frames[index + 1];
    if (!next || next.firstRoll === null) return null;

    if (next.isStrike && index + 1 < 9) {
      const afterNext = frames[index + 2];
      if (!afterNext || afterNext.firstRoll === null) return null;
      return 10 + afterNext.firstRoll;
    }

    if (next.secondRoll === null) return null;
    return next.firstRoll + next.secondRoll;
  }
}
