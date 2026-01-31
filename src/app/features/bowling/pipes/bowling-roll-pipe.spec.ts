import { BowlingRollPipe } from './bowling-roll-pipe';

describe('BowlingRollPipe', () => {
  let pipe: BowlingRollPipe;

  beforeEach(() => {
    pipe = new BowlingRollPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('null values', () => {
    it('should return empty string for null without bonus', () => {
      expect(pipe.transform(null, false)).toBe('');
    });

    it('should return empty string for null with bonus', () => {
      expect(pipe.transform(null, true)).toBe('');
    });
  });

  describe('gutter balls', () => {
    it('should return "-" for 0 without bonus', () => {
      expect(pipe.transform(0, false)).toBe('-');
    });

    it('should return "-" for 0 with bonus', () => {
      expect(pipe.transform(0, true)).toBe('-');
    });
  });

  describe('strikes', () => {
    it('should return "X" for 10 with bonus', () => {
      expect(pipe.transform(10, true)).toBe('X');
    });
  });

  describe('spares', () => {
    it('should return "/" for non-zero, non-10 value with bonus', () => {
      expect(pipe.transform(5, true)).toBe('/');
    });

    it('should return "/" for 1 with bonus', () => {
      expect(pipe.transform(1, true)).toBe('/');
    });

    it('should return "/" for 9 with bonus', () => {
      expect(pipe.transform(9, true)).toBe('/');
    });
  });

  describe('normal rolls', () => {
    it('should return string number for values 1-9 without bonus', () => {
      for (let i = 1; i <= 9; i++) {
        expect(pipe.transform(i, false)).toBe(i.toString());
      }
    });
  });
});
