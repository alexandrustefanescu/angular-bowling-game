import { Component, inject } from '@angular/core';
import { BowlingGameService } from '../../services/bowling-game';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-game-actions',
  templateUrl: './game-actions.html',
  standalone: true,
  imports: [Button],
})
export class GameActions {
  private readonly bowlingService = inject(BowlingGameService);

  protected game = this.bowlingService.game;
  protected startNewGame() {
    this.bowlingService.startNewGame();
  }
}
