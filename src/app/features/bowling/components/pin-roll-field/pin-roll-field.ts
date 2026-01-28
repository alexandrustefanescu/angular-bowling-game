import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { BowlingService } from '../../services/bowling';

@Component({
  selector: 'app-pin-roll-field',
  templateUrl: './pin-roll-field.html',
  imports: [ReactiveFormsModule, Button],
  standalone: true,
})
export class PinRollField {
  private readonly bowlingService  = inject(BowlingService);

  protected game = this.bowlingService.game;
  protected pinFormGroup = new FormGroup({
    pinCount: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10)]),
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
    } catch (error) {
      alert(error);
    }
  }
}
