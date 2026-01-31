import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Input Bindings', () => {
    it('should have default type as "button"', () => {
      expect(component.type()).toBe('button');
    });

    it('should accept type input for submit', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      expect(component.type()).toBe('submit');
    });

    it('should accept type input for reset', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();

      expect(component.type()).toBe('reset');
    });

    it('should have default disabled as false', () => {
      expect(component.disabled()).toBe(false);
    });
  });

  describe('DOM Rendering', () => {
    it('should render button element', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should render button with default type attribute', () => {
      const button = fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;
      expect(button.type).toBe('button');
    });

    it('should render button with submit type when type input is submit', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;
      expect(button.type).toBe('submit');
    });

    it('should render button with reset type when type input is reset', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;
      expect(button.type).toBe('reset');
    });

    it('should have disabled attribute when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should apply disabled styles when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.className).toContain('disabled:bg-gray-400');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('Click Behavior', () => {
    it('should call onClick method when button is clicked', () => {
      let eventReceived = false;
      component.clicked.subscribe(() => (eventReceived = true));

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(eventReceived).toBe(true);
    });
  });
});
