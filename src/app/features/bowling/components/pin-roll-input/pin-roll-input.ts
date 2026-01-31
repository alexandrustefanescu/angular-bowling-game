import { Component, effect, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { BowlingService } from '../../services/bowling-game';

@Component({
  selector: 'app-pin-roll-input',
  templateUrl: './pin-roll-input.html',
  imports: [ReactiveFormsModule, Button],
  standalone: true,
})
export class PinRollInput {
  private readonly bowlingService = inject(BowlingService);

  protected game = this.bowlingService.game;
  protected errorMessage = signal<string | null>(null);
  protected pinFormGroup = new FormGroup({
    pinCount: new FormControl(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(10),
    ]),
  });

  constructor() {
    effect(() => {
      const game = this.bowlingService.game();
      if (game.currentFrameIndex === null) {
        this.pinFormGroup.reset();
      }
    });
  }

  protected submit() {
    if (this.pinFormGroup.invalid) {
      return;
    }

    try {
      this.bowlingService.roll(this.pinFormGroup.value.pinCount ?? 0);
      this.pinFormGroup.reset();
      this.errorMessage.set(null);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
