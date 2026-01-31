import { Component, inject } from '@angular/core';
import { BowlingGameService } from '../../services/bowling-game';
import { ScoreboardFrame } from '../scoreboard-frame/scoreboard-frame';

@Component({
  selector: 'app-scoreboard',
  imports: [ScoreboardFrame],
  templateUrl: './scoreboard.html',
  standalone: true,
})
export class Scoreboard {
  private readonly bowlingService = inject(BowlingGameService);
  protected game = this.bowlingService.game;
}
