import { Component, computed, input } from '@angular/core';
import { Frame } from '../../models/frame';
import { BowlingRollPipe } from '../../pipes/bowling-roll-pipe';

@Component({
  selector: 'app-scoreboard-frame',
  templateUrl: './scoreboard-frame.html',
  standalone: true,
  imports: [BowlingRollPipe],
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

  protected firstRollBonus = computed(() => this.frame().isStrike);

  protected secondRollBonus = computed(() => {
    const frame = this.frame();
    return frame.isSpare || (this.isLastFrame() && frame.secondRoll === 10);
  });

  protected thirdRollBonus = computed(() => {
    const frame = this.frame();
    const isAfterTwoStrikes = frame.firstRoll === 10 && frame.secondRoll === 10;
    const completesSpareAfterStrike =
      frame.firstRoll === 10 &&
      (frame.secondRoll ?? 0) + (frame.thirdRoll ?? 0) === 10;
    const isBonusStrikeAfterSpare = frame.isSpare && frame.thirdRoll === 10;
    return isAfterTwoStrikes || completesSpareAfterStrike || isBonusStrikeAfterSpare;
  });

  protected score = computed(() => this.cumulativeScores().at(this.index()));
}
