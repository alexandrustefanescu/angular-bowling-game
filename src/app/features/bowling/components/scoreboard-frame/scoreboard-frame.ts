import { Component, input } from '@angular/core';

@Component({
  selector: 'app-scoreboard-frame',
  templateUrl: './scoreboard-frame.html',
  standalone: true,
})
export class ScoreBoardFrame {
  index = input.required<number>();
  currentFrameIndex = input.required<number | null>();
  cumulativeScores = input.required<(number| null)[]>();
  firstRoll = input.required<number | null>();
  secondRoll = input.required<number | null>();
  thirdRoll = input.required<number | null>();
  isSpare = input.required<boolean>();
  isStrike = input.required<boolean>();

  protected formatRoll(value: number | null, hasBonus: boolean): string {
    if (value === null) {
      return '-';
    }
    if (hasBonus && value === 10) {
      return 'X';
    }

    if (hasBonus && value < 10) {
      return '/';
    }

    if (value === 0) {
      return '-';
    }
    return value.toString();
  }
}
