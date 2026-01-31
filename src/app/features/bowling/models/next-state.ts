import { RollIndex } from './roll-index';

export interface NextState {
  nextFrameIndex: number;
  nextRollIndex: RollIndex;
  isCompleted: boolean;
}
