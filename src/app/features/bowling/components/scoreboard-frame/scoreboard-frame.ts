import { Component, computed, input } from '@angular/core';
import { Frame } from '../../models/frame';

@Component({
  selector: 'app-scoreboard-frame',
  templateUrl: './scoreboard-frame.html',
  standalone: true,
})
export class ScoreboardFrame {
  index = input.required<number>();
  currentFrameIndex = input.required<number | null>();
  cumulativeScores = input.required<(number | null)[]>();
  frame = input.required<Frame>();

  protected isCurrentFrame = computed(
    () => this.index() === this.currentFrameIndex(),
  );
  protected isLastFrame = computed(() => this.index() === 9);

  protected firstRollDisplay = computed(() =>
    this.formatRoll(this.frame().firstRoll, this.frame().isStrike),
  );

  protected secondRollDisplay = computed(() => {
    const frame = this.frame();
    const hasBonus =
      frame.isSpare || (this.isLastFrame() && frame.secondRoll === 10);
    return this.formatRoll(frame.secondRoll, hasBonus);
  });

  protected thirdRollDisplay = computed(() => {
    const frame = this.frame();
    const isAfterTwoStrikes = frame.firstRoll === 10 && frame.secondRoll === 10;
    const completesSpareAfterStrike =
      frame.firstRoll === 10 &&
      (frame.secondRoll ?? 0) + (frame.thirdRoll ?? 0) === 10;
    const isBonusStrikeAfterSpare = frame.isSpare && frame.thirdRoll === 10;
    return this.formatRoll(
      frame.thirdRoll,
      isAfterTwoStrikes || completesSpareAfterStrike || isBonusStrikeAfterSpare,
    );
  });

  protected score = computed(() => this.cumulativeScores().at(this.index()));

  private formatRoll(value: number | null, hasBonus: boolean): string {
    if (value === null || value === 0) return '-';
    if (hasBonus && value === 10) return 'X';
    if (hasBonus) return '/';
    return value.toString();
  }
}
