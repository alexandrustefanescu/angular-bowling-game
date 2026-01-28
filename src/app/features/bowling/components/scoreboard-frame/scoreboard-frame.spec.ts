import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreBoardFrame } from './scoreboard-frame';


describe('ScoreboardFrame', () => {
  let component: ScoreBoardFrame;
  let fixture: ComponentFixture<ScoreBoardFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreBoardFrame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreBoardFrame);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('currentFrameIndex', 0);
    fixture.componentRef.setInput('cumulativeScores', [0]);
    fixture.componentRef.setInput('firstRoll', null);
    fixture.componentRef.setInput('secondRoll', null);
    fixture.componentRef.setInput('thirdRoll', null);
    fixture.componentRef.setInput('isSpare', false);
    fixture.componentRef.setInput('isStrike', false);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
