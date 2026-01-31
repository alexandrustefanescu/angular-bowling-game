import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreboardFrame } from './scoreboard-frame';
import { Frame } from '../../models/frame';

describe('ScoreboardFrame', () => {
  let component: ScoreboardFrame;
  let fixture: ComponentFixture<ScoreboardFrame>;

  function createFrame(overrides?: Partial<Frame>): Frame {
    return {
      firstRoll: null,
      secondRoll: null,
      thirdRoll: null,
      isSpare: false,
      isStrike: false,
      ...overrides,
    };
  }

  function setInputs(inputs: {
    index?: number;
    currentFrameIndex?: number | null;
    cumulativeScores?: (number | null)[];
    frame?: Partial<Frame>;
  }) {
    const defaults = {
      index: 0,
      currentFrameIndex: 0,
      cumulativeScores: [0],
    };

    const merged = { ...defaults, ...inputs };
    fixture.componentRef.setInput('index', merged.index);
    fixture.componentRef.setInput(
      'currentFrameIndex',
      merged.currentFrameIndex,
    );
    fixture.componentRef.setInput('cumulativeScores', merged.cumulativeScores);
    fixture.componentRef.setInput('frame', createFrame(merged.frame));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreboardFrame);
    component = fixture.componentInstance;

    setInputs({});
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should require inputs', () => {
      expect(component.index()).toBe(0);
      expect(component.currentFrameIndex()).toBe(0);
      expect(component.cumulativeScores()).toEqual([0]);
      expect(component.frame()).toEqual(createFrame());
    });
  });

  describe('formatRoll logic via computed signals', () => {
    it('should return "-" for null value', () => {
      setInputs({ frame: { firstRoll: null } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('-');
    });

    it('should return "X" for strike (value=10, isStrike=true)', () => {
      setInputs({ frame: { firstRoll: 10, isStrike: true } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
    });

    it('should not return "X" for 10 when not a strike', () => {
      setInputs({ frame: { firstRoll: 10, isStrike: false } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('10');
    });

    it('should return "/" for spare', () => {
      setInputs({ frame: { firstRoll: 5, secondRoll: 5, isSpare: true } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[1].textContent.trim()).toBe('/');
    });

    it('should return "-" for zero pins', () => {
      setInputs({ frame: { firstRoll: 0 } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('-');
    });

    it('should return string number for normal roll', () => {
      setInputs({ frame: { firstRoll: 5 } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('5');
    });

    it('should handle all numbers 1-9 correctly', () => {
      for (let i = 1; i <= 9; i++) {
        setInputs({ frame: { firstRoll: i } });
        const rolls =
          fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
        expect(rolls[0].textContent.trim()).toBe(i.toString());
      }
    });
  });

  describe('DOM Rendering - Frame Number', () => {
    it('should display frame number (index + 1)', () => {
      setInputs({ index: 0 });
      const frameNumber = fixture.nativeElement.querySelector('.bg-gray-100');
      expect(frameNumber.textContent.trim()).toBe('1');
    });

    it('should show frame 5 for index 4', () => {
      setInputs({ index: 4 });
      const frameNumber = fixture.nativeElement.querySelector('.bg-gray-100');
      expect(frameNumber.textContent.trim()).toBe('5');
    });

    it('should show frame 10 for index 9', () => {
      setInputs({ index: 9 });
      const frameNumber = fixture.nativeElement.querySelector('.bg-gray-100');
      expect(frameNumber.textContent.trim()).toBe('10');
    });
  });

  describe('DOM Rendering - Roll Displays', () => {
    it('should display first roll correctly', () => {
      setInputs({ frame: { firstRoll: 5 } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('5');
    });

    it('should display second roll correctly', () => {
      setInputs({ frame: { firstRoll: 5, secondRoll: 3 } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[1].textContent.trim()).toBe('3');
    });

    it('should format strike as "X"', () => {
      setInputs({ frame: { firstRoll: 10, isStrike: true } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
    });

    it('should format spare as "/"', () => {
      setInputs({ frame: { firstRoll: 7, secondRoll: 3, isSpare: true } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[1].textContent.trim()).toBe('/');
    });

    it('should format zero as "-"', () => {
      setInputs({ frame: { firstRoll: 0 } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('-');
    });

    it('should format null as "-"', () => {
      setInputs({ frame: { firstRoll: null } });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('-');
    });

    it('should display third roll only for frame 10', () => {
      setInputs({
        index: 9,
        frame: { firstRoll: 10, secondRoll: 10, thirdRoll: 10, isStrike: true },
      });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls.length).toBe(3);
      expect(rolls[2].textContent.trim()).toBe('X');
    });

    it('should not display third roll for frames 1-9', () => {
      setInputs({ index: 5 });
      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls.length).toBe(2);
    });
  });

  describe('DOM Rendering - Score Display', () => {
    it('should display cumulative score', () => {
      setInputs({ index: 0, cumulativeScores: [15] });
      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('15');
    });

    it('should display null score as empty', () => {
      setInputs({ index: 0, cumulativeScores: [null] });
      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('');
    });

    it('should display score with correct styling', () => {
      setInputs({ cumulativeScores: [100] });
      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.className).toContain('bg-blue-50');
      expect(scoreDiv.className).toContain('text-center');
      expect(scoreDiv.className).toContain('text-xl');
      expect(scoreDiv.className).toContain('font-bold');
      expect(scoreDiv.className).toContain('text-blue-900');
    });

    it('should display zero score correctly', () => {
      setInputs({ cumulativeScores: [0] });
      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('0');
    });
  });

  describe('10th Frame Layout', () => {
    it('should use 2-column grid for frames 1-9', () => {
      setInputs({ index: 5 });
      const grid = fixture.nativeElement.querySelector('.grid.h-12');
      expect(grid.classList.contains('grid-cols-2')).toBe(true);
      expect(grid.classList.contains('grid-cols-3')).toBe(false);
    });

    it('should use 3-column grid for frame 10', () => {
      setInputs({ index: 9 });
      const grid = fixture.nativeElement.querySelector('.grid.h-12');
      expect(grid.classList.contains('grid-cols-3')).toBe(true);
      expect(grid.classList.contains('grid-cols-2')).toBe(false);
    });

    it('should render third roll cell only for frame 10', () => {
      setInputs({ index: 9, frame: { thirdRoll: 5 } });
      const rollCells =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rollCells.length).toBe(3);
    });

    it('should apply border-r to second cell in frame 10', () => {
      setInputs({ index: 9 });
      const rollCells =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rollCells[1].classList.contains('border-r')).toBe(true);
    });

    it('should not apply border-r to second cell in frames 1-9', () => {
      setInputs({ index: 5 });
      const rollCells =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rollCells[1].classList.contains('border-r')).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle strike correctly', () => {
      setInputs({
        index: 0,
        frame: {
          firstRoll: 10,
          secondRoll: null,
          thirdRoll: null,
          isStrike: true,
        },
        cumulativeScores: [null],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
      expect(rolls[1].textContent.trim()).toBe('-');
    });

    it('should handle spare correctly', () => {
      setInputs({
        index: 0,
        frame: { firstRoll: 7, secondRoll: 3, isSpare: true },
        cumulativeScores: [null],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('7');
      expect(rolls[1].textContent.trim()).toBe('/');
    });

    it('should handle gutter ball correctly', () => {
      setInputs({
        frame: { firstRoll: 0, secondRoll: 0 },
        cumulativeScores: [0],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('-');
      expect(rolls[1].textContent.trim()).toBe('-');
    });

    it('should handle normal roll correctly', () => {
      setInputs({
        frame: { firstRoll: 5, secondRoll: 3 },
        cumulativeScores: [8],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('5');
      expect(rolls[1].textContent.trim()).toBe('3');

      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('8');
    });

    it('should handle 10th frame with strike-strike-strike', () => {
      setInputs({
        index: 9,
        frame: { firstRoll: 10, secondRoll: 10, thirdRoll: 10, isStrike: true },
        cumulativeScores: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          300,
        ],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
      expect(rolls[1].textContent.trim()).toBe('X');
      expect(rolls[2].textContent.trim()).toBe('X');

      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('300');
    });

    it('should handle 10th frame with spare and bonus', () => {
      setInputs({
        index: 9,
        frame: { firstRoll: 7, secondRoll: 3, thirdRoll: 5, isSpare: true },
        cumulativeScores: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          150,
        ],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('7');
      expect(rolls[1].textContent.trim()).toBe('/');
      expect(rolls[2].textContent.trim()).toBe('5');
    });

    it('should handle incomplete frame', () => {
      setInputs({
        index: 3,
        currentFrameIndex: 3,
        frame: { firstRoll: 7, secondRoll: null },
        cumulativeScores: [10, 20, 30, null],
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('7');
      expect(rolls[1].textContent.trim()).toBe('-');

      const container = fixture.nativeElement.querySelector('.bg-white');
      expect(container.classList.contains('border-green-500')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle changing inputs dynamically', () => {
      setInputs({ frame: { firstRoll: 5 } });
      let rolls = fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('5');

      setInputs({ frame: { firstRoll: 10, isStrike: true } });
      rolls = fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
    });

    it('should handle frame becoming current', () => {
      setInputs({ index: 5, currentFrameIndex: 3 });
      let container = fixture.nativeElement.querySelector('.bg-white');
      expect(container.classList.contains('border-gray-300')).toBe(true);

      setInputs({ index: 5, currentFrameIndex: 5 });
      container = fixture.nativeElement.querySelector('.bg-white');
      expect(container.classList.contains('border-green-500')).toBe(true);
    });

    it('should handle large cumulative score', () => {
      setInputs({ cumulativeScores: [300] });
      const scoreDiv = fixture.nativeElement.querySelector('.bg-blue-50');
      expect(scoreDiv.textContent.trim()).toBe('300');
    });

    it('should handle 10th frame with strike and non-strike second roll', () => {
      setInputs({
        index: 9,
        frame: { firstRoll: 10, secondRoll: 5, thirdRoll: 3, isStrike: true },
      });

      const rolls =
        fixture.nativeElement.querySelectorAll('.text-lg.font-bold');
      expect(rolls[0].textContent.trim()).toBe('X');
      expect(rolls[1].textContent.trim()).toBe('5');
      expect(rolls[2].textContent.trim()).toBe('3');
    });
  });
});
