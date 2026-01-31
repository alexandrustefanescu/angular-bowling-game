import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bowlingRoll',
  standalone: true,
})
export class BowlingRollPipe implements PipeTransform {
  transform(value: number | null, hasBonus: boolean): string {
    if (value === null) return '';
    if (value === 0) return '-';
    if (hasBonus && value === 10) return 'X';
    if (hasBonus) return '/';
    return value.toString();
  }
}
