import { Frame } from './frame';
import { RollIndex } from './roll-index';

export interface Game {
  frames: Frame[];
  currentFrameIndex: number;
  currentRollIndex: RollIndex;
  isGameCompleted: boolean;
  cumulativeScores: (number | null)[];
  finalScore: number | null;
}
