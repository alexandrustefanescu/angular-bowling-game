import { Component } from '@angular/core';
import { Controls } from '../components/controls/controls';
import { PinRollField } from '../components/pin-roll-field/pin-roll-field';
import { Scoreboard } from '../components/scoreboard/scoreboard';

@Component({
  selector: 'app-bowling-page',
  templateUrl: './bowling-page.html',
  standalone: true,
  imports: [Controls, Scoreboard, PinRollField],
})
export class BowlingPage { 
}
