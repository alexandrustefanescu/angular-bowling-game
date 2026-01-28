import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  standalone: true,
})
export class Button {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();

  protected onClick(event: MouseEvent) {
    if (this.disabled()) {
      return;
    }

    this.clicked.emit(event);
  }
}
