import { Component, inject } from '@angular/core';
import { BowlingService } from '../../services/bowling-game';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-game-actions',
  templateUrl: './game-actions.html',
  standalone: true,
  imports: [Button],
})
export class GameActions {
  private readonly bowlingService = inject(BowlingService);

  protected game = this.bowlingService.game;
  protected startNewGame() {
    this.bowlingService.startNewGame();
  }
}
