import { Component, inject } from '@angular/core';
import { BowlingService } from '../../services/bowling';
import { ScoreBoardFrame } from '../scoreboard-frame/scoreboard-frame';

@Component({
  selector: 'app-scoreboard',
  imports: [ScoreBoardFrame],
  templateUrl: './scoreboard.html',
  standalone: true,
})
export class Scoreboard {
  private readonly bowlingService  = inject(BowlingService);
  protected game = this.bowlingService.game;
}