import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinRollField } from './pin-roll-field';

describe('PinRollField', () => {
  let component: PinRollField;
  let fixture: ComponentFixture<PinRollField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinRollField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinRollField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
