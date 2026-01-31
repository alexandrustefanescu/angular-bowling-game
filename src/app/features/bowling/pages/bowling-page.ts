import { Component } from '@angular/core';
import { GameActions } from '../components/game-actions/game-actions';
import { PinRollInput } from '../components/pin-roll-input/pin-roll-input';
import { Scoreboard } from '../components/scoreboard/scoreboard';

@Component({
  selector: 'app-bowling-page',
  templateUrl: './bowling-page.html',
  standalone: true,
  imports: [GameActions, Scoreboard, PinRollInput],
})
export class BowlingPage {}
