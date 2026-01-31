import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { vi } from 'vitest';

import { Game } from '../../models/game';
import { RollIndex } from '../../models/roll-index';
import { BowlingService } from '../../services/bowling-game';
import { PinRollInput } from './pin-roll-input';

interface MockBowlingService {
  roll: ReturnType<typeof vi.fn>;
  startNewGame: ReturnType<typeof vi.fn>;
  game: () => Game;
}

describe('PinRollInput', () => {
  let component: PinRollInput;
  let fixture: ComponentFixture<PinRollInput>;
  let mockBowlingService: MockBowlingService;
  let currentMockGame: Game;

  function createMockGame(overrides?: Partial<Game>): Game {
    return {
      frames: Array.from({ length: 10 }, () => ({
        firstRoll: null,
        secondRoll: null,
        thirdRoll: null,
        isStrike: false,
        isSpare: false,
      })),
      currentFrameIndex: 0,
      currentRollIndex: RollIndex.FIRST,
      isGameCompleted: false,
      cumulativeScores: Array(10).fill(null),
      finalScore: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    currentMockGame = createMockGame();

    mockBowlingService = {
      roll: vi.fn(),
      startNewGame: vi.fn(),
      game: () => currentMockGame,
    };

    await TestBed.configureTestingModule({
      imports: [PinRollInput],
      providers: [{ provide: BowlingService, useValue: mockBowlingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PinRollInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function pinControl(): FormControl<number | null> {
    return component['pinFormGroup'].controls.pinCount;
  }

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject BowlingService', () => {
      expect(component['bowlingService']).toBe(mockBowlingService);
    });

    it('should initialize form group', () => {
      expect(pinControl()).toBeDefined();
    });
  });

  describe('Form Setup & Validation', () => {
    it('should be invalid when null', () => {
      pinControl().setValue(null);
      expect(component['pinFormGroup'].valid).toBe(false);
    });

    it('should be invalid when negative', () => {
      pinControl().setValue(-1);
      expect(component['pinFormGroup'].valid).toBe(false);
    });

    it('should be invalid when greater than 10', () => {
      pinControl().setValue(11);
      expect(component['pinFormGroup'].valid).toBe(false);
    });

    it('should be valid for values 0–10', () => {
      for (let i = 0; i <= 10; i++) {
        pinControl().setValue(i);
        expect(component['pinFormGroup'].valid).toBe(true);
      }
    });
  });

  describe('submit()', () => {
    it('should not call service if form is invalid', () => {
      pinControl().setValue(null);
      component['submit']();
      expect(mockBowlingService.roll).not.toHaveBeenCalled();
    });

    it('should call roll with valid pin count', () => {
      pinControl().setValue(5);
      component['submit']();
      expect(mockBowlingService.roll).toHaveBeenCalledWith(5);
    });

    it('should reset form after successful roll', () => {
      pinControl().setValue(7);
      component['submit']();
      expect(pinControl().value).toBeNull();
    });

    it('should set errorMessage on service error', () => {
      mockBowlingService.roll.mockImplementation(() => {
        throw new Error('Test error');
      });

      pinControl().setValue(5);
      component['submit']();

      expect(component['errorMessage']()).toBe('Test error');
    });

    it('should clear errorMessage after success', () => {
      mockBowlingService.roll.mockImplementation(() => {
        throw new Error('Fail');
      });

      pinControl().setValue(5);
      component['submit']();
      expect(component['errorMessage']()).toBe('Fail');

      mockBowlingService.roll.mockImplementation(() => {
        console.log('Roll mock implementation');
      });
      pinControl().setValue(5);
      component['submit']();
      expect(component['errorMessage']()).toBeNull();
    });

    it('should default to 0 when pinCount is null but valid', () => {
      const control = pinControl();
      control.clearValidators();
      control.setValue(null);
      control.updateValueAndValidity();

      component['submit']();
      expect(mockBowlingService.roll).toHaveBeenCalledWith(0);
    });
  });

  describe('DOM Rendering', () => {
    it('should show validation error when touched and invalid', () => {
      pinControl().setValue(-1);
      pinControl().markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.bg-red-50');
      expect(error).toBeTruthy();
    });

    it('should hide validation error when valid', () => {
      pinControl().setValue(-1);
      pinControl().markAsTouched();
      fixture.detectChanges();

      pinControl().setValue(5);
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.bg-red-50');
      expect(error).toBeFalsy();
    });

    it('should disable button when invalid', () => {
      pinControl().setValue(null);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        'app-button button',
      ) as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it('should enable button when valid', () => {
      pinControl().setValue(5);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        'app-button button',
      ) as HTMLButtonElement;

      expect(button.disabled).toBe(false);
    });
  });
});
