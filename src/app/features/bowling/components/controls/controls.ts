import { Component, inject } from '@angular/core';
import { BowlingService } from '../../services/bowling';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.html',
  standalone: true,
  imports: [Button],
})
export class Controls {
  private readonly bowlingService = inject(BowlingService);

  protected game = this.bowlingService.game;
  protected startNewGame() {
    this.bowlingService.startNewGame();
  }
}
